#!/usr/bin/env python3
"""Export PacerMind workouts from an iPhone app container into website journey.json."""

from __future__ import annotations

import argparse
import json
import math
import shutil
import sqlite3
import subprocess
import sys
import tempfile
import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from zoneinfo import ZoneInfo


APPLE_EPOCH_OFFSET = 978_307_200
DEFAULT_DEVICE = "Rain’s Air"
DEFAULT_BUNDLE_ID = "rainlonely-studio.PacerMind"
DEFAULT_TIMEZONE = "Asia/Shanghai"
GCJ_A = 6_378_245.0
GCJ_EE = 0.00669342162296594323
STORE_FILES = ("PacerMind.store", "PacerMind.store-wal", "PacerMind.store-shm")
HISTORICAL_RUNS_BEFORE_2026 = 2029
HISTORICAL_DISTANCE_KM_BEFORE_2026 = 18_576.0
HISTORICAL_YEARS_BEFORE_2026 = 15
HISTORICAL_DURATION_SECONDS_BEFORE_2026 = 1636 * 3600 + 22 * 60 + 57


@dataclass
class WorkoutRow:
    pk: int
    workout_id: str
    date: datetime
    name: str | None
    distance_km: float
    duration_sec: int
    avg_pace_min_km: float
    source: str
    note: str
    override_type: str | None
    elevation_gain: float
    streams_json: str | None


def run(command: list[str], *, quiet: bool = False) -> None:
    if not quiet:
        print("+ " + " ".join(command), file=sys.stderr)
    subprocess.run(command, check=True)


def copy_store_from_device(device: str, bundle_id: str, destination: Path) -> Path:
    destination.mkdir(parents=True, exist_ok=True)
    for filename in STORE_FILES:
        source = f"Documents/{filename}"
        target = destination / filename
        command = [
            "xcrun",
            "devicectl",
            "device",
            "copy",
            "from",
            "--device",
            device,
            "--domain-type",
            "appDataContainer",
            "--domain-identifier",
            bundle_id,
            "--source",
            source,
            "--destination",
            str(target),
        ]
        try:
            run(command)
        except subprocess.CalledProcessError:
            if filename == "PacerMind.store":
                raise
            print(f"warning: skipped optional store sidecar {filename}", file=sys.stderr)
    return destination / "PacerMind.store"


def apple_date_to_datetime(value: float, tz: ZoneInfo) -> datetime:
    return datetime.fromtimestamp(value + APPLE_EPOCH_OFFSET, tz=timezone.utc).astimezone(tz)


def uuid_from_blob(value: bytes | None, fallback: str) -> str:
    if value and len(value) == 16:
        return str(uuid.UUID(bytes=value))
    return fallback


def fetch_rows(store_path: Path, year: int, tz: ZoneInfo) -> list[WorkoutRow]:
    conn = sqlite3.connect(f"file:{store_path}?mode=ro", uri=True)
    conn.row_factory = sqlite3.Row
    try:
        rows = conn.execute(
            """
            SELECT
                Z_PK,
                ZID,
                ZDATE,
                ZNAME,
                ZDISTANCE,
                ZDURATION,
                ZAVGPACE,
                ZSOURCERAW,
                ZWORKOUTNOTE,
                ZUSEROVERRIDEWORKOUTTYPERAW,
                ZELEVATIONGAIN,
                CAST(ZSTREAMSDATA AS TEXT) AS ZSTREAMSJSON
            FROM ZWORKOUTENTITY
            ORDER BY ZDATE DESC
            """
        ).fetchall()
    finally:
        conn.close()

    start = datetime(year, 1, 1, tzinfo=tz)
    end = datetime(year + 1, 1, 1, tzinfo=tz)
    workouts: list[WorkoutRow] = []
    for row in rows:
        date = apple_date_to_datetime(float(row["ZDATE"]), tz)
        if not (start <= date < end):
            continue
        pk = int(row["Z_PK"])
        workouts.append(
            WorkoutRow(
                pk=pk,
                workout_id=uuid_from_blob(row["ZID"], f"workout-{pk}"),
                date=date,
                name=row["ZNAME"],
                distance_km=float(row["ZDISTANCE"] or 0),
                duration_sec=int(row["ZDURATION"] or 0),
                avg_pace_min_km=float(row["ZAVGPACE"] or 0),
                source=row["ZSOURCERAW"] or "unknown",
                note=(row["ZWORKOUTNOTE"] or "").strip(),
                override_type=row["ZUSEROVERRIDEWORKOUTTYPERAW"],
                elevation_gain=float(row["ZELEVATIONGAIN"] or 0),
                streams_json=row["ZSTREAMSJSON"],
            )
        )
    return workouts


def valid_coordinate(point: object) -> tuple[float, float] | None:
    if not isinstance(point, dict):
        return None
    lat = point.get("latitude")
    lon = point.get("longitude")
    if not isinstance(lat, (int, float)) or not isinstance(lon, (int, float)):
        return None
    if not math.isfinite(lat) or not math.isfinite(lon):
        return None
    if abs(lat) > 90 or abs(lon) > 180:
        return None
    return (round(float(lat), 6), round(float(lon), 6))


def out_of_china(lat: float, lon: float) -> bool:
    return lon < 72.004 or lon > 137.8347 or lat < 0.8293 or lat > 55.8271


def transform_lat(x: float, y: float) -> float:
    ret = -100.0 + 2.0 * x + 3.0 * y
    ret += 0.2 * y * y + 0.1 * x * y + 0.2 * math.sqrt(abs(x))
    ret += (20.0 * math.sin(6.0 * x * math.pi) + 20.0 * math.sin(2.0 * x * math.pi)) * 2.0 / 3.0
    ret += (20.0 * math.sin(y * math.pi) + 40.0 * math.sin(y / 3.0 * math.pi)) * 2.0 / 3.0
    ret += (160.0 * math.sin(y / 12.0 * math.pi) + 320.0 * math.sin(y * math.pi / 30.0)) * 2.0 / 3.0
    return ret


def transform_lon(x: float, y: float) -> float:
    ret = 300.0 + x + 2.0 * y
    ret += 0.1 * x * x + 0.1 * x * y + 0.1 * math.sqrt(abs(x))
    ret += (20.0 * math.sin(6.0 * x * math.pi) + 20.0 * math.sin(2.0 * x * math.pi)) * 2.0 / 3.0
    ret += (20.0 * math.sin(x * math.pi) + 40.0 * math.sin(x / 3.0 * math.pi)) * 2.0 / 3.0
    ret += (150.0 * math.sin(x / 12.0 * math.pi) + 300.0 * math.sin(x / 30.0 * math.pi)) * 2.0 / 3.0
    return ret


def wgs84_to_gcj02(lat: float, lon: float) -> tuple[float, float]:
    if out_of_china(lat, lon):
        return (round(lat, 6), round(lon, 6))
    d_lat = transform_lat(lon - 105.0, lat - 35.0)
    d_lon = transform_lon(lon - 105.0, lat - 35.0)
    rad_lat = lat / 180.0 * math.pi
    magic = math.sin(rad_lat)
    magic = 1 - GCJ_EE * magic * magic
    sqrt_magic = math.sqrt(magic)
    d_lat = (d_lat * 180.0) / ((GCJ_A * (1 - GCJ_EE)) / (magic * sqrt_magic) * math.pi)
    d_lon = (d_lon * 180.0) / (GCJ_A / sqrt_magic * math.cos(rad_lat) * math.pi)
    return (round(lat + d_lat, 6), round(lon + d_lon, 6))


def gcj02_to_wgs84(lat: float, lon: float) -> tuple[float, float]:
    if out_of_china(lat, lon):
        return (round(lat, 6), round(lon, 6))
    gcj_lat, gcj_lon = wgs84_to_gcj02(lat, lon)
    return (round(lat * 2 - gcj_lat, 6), round(lon * 2 - gcj_lon, 6))


def evenly_sample(points: list[tuple[float, float]], max_points: int) -> list[tuple[float, float]]:
    if len(points) <= max_points:
        return points
    if max_points < 2:
        return points[:1]
    sampled: list[tuple[float, float]] = []
    last_index = len(points) - 1
    for index in range(max_points):
        source_index = round(index * last_index / (max_points - 1))
        sampled.append(points[source_index])
    return sampled


def coordinates_from_streams(streams_json: str | None, max_points: int) -> tuple[list[list[float]], list[list[float]]]:
    if not streams_json:
        return [], []
    try:
        streams = json.loads(streams_json)
    except json.JSONDecodeError:
        return [], []
    coordinates = streams.get("coordinates")
    if not isinstance(coordinates, list):
        return [], []
    points = [coord for item in coordinates if (coord := valid_coordinate(item))]
    sampled = evenly_sample(points, max_points)
    gcj02 = [[lat, lon] for lat, lon in sampled]
    wgs84 = [[lat, lon] for lat, lon in (gcj02_to_wgs84(lat, lon) for lat, lon in sampled)]
    return wgs84, gcj02


def format_duration(seconds: int) -> str:
    seconds = max(seconds, 0)
    hours, remainder = divmod(seconds, 3600)
    minutes, secs = divmod(remainder, 60)
    return f"{hours}:{minutes:02d}:{secs:02d}" if hours else f"{minutes}:{secs:02d}"


def format_pace(minutes_per_km: float) -> str:
    if not math.isfinite(minutes_per_km) or minutes_per_km <= 0:
        return "--"
    minutes = int(minutes_per_km)
    seconds = int(round((minutes_per_km - minutes) * 60))
    if seconds == 60:
        minutes += 1
        seconds = 0
    return f"{minutes}'{seconds:02d}\""


def duration_seconds(value: str) -> int:
    parts = [int(part) for part in value.split(":") if part.isdigit()]
    if len(parts) == 2:
        return parts[0] * 60 + parts[1]
    if len(parts) == 3:
        return parts[0] * 3600 + parts[1] * 60 + parts[2]
    return 0


def format_total_time(seconds: int) -> str:
    hours, remainder = divmod(max(seconds, 0), 3600)
    minutes, secs = divmod(remainder, 60)
    return f"{hours}:{minutes:02d}:{secs:02d}"


def classify_type(row: WorkoutRow) -> str:
    if row.override_type:
        return row.override_type
    name = (row.name or "").lower()
    if "interval" in name or "间歇" in name:
        return "interval"
    if "tempo" in name or "threshold" in name or "节奏" in name:
        return "tempo"
    if row.elevation_gain >= 260 and row.distance_km >= 8:
        return "trail"
    if row.distance_km >= 18 or row.duration_sec >= 70 * 60:
        return "long"
    if 0 < row.avg_pace_min_km <= 5.15 and row.distance_km >= 6:
        return "tempo"
    if row.avg_pace_min_km >= 6.4:
        return "easy"
    return "easy"


def title_for_type(workout_type: str) -> str:
    titles = {
        "trail": "Trail Run",
        "interval": "Interval Session",
        "race_like": "Race-like Run",
        "long": "Long Run",
        "tempo": "Tempo Run",
        "easy": "Easy Run",
        "marathon_pace": "Marathon Pace",
        "unknown": "Run",
    }
    return titles.get(workout_type, "Run")


def build_journey(rows: list[WorkoutRow], *, year: int, city: str, max_points: int, tz: ZoneInfo) -> dict:
    runs = []
    for row in rows:
        coordinates, coordinates_gcj02 = coordinates_from_streams(row.streams_json, max_points)
        if len(coordinates) < 2:
            continue
        workout_type = classify_type(row)
        runs.append(
            {
                "id": row.workout_id,
                "date": row.date.date().isoformat(),
                "title": row.name or title_for_type(workout_type),
                "type": workout_type,
                "distanceKm": round(row.distance_km, 2),
                "duration": format_duration(row.duration_sec),
                "avgPace": format_pace(row.avg_pace_min_km),
                "note": row.note,
                "coordinates": coordinates,
                "coordinatesGcj02": coordinates_gcj02,
                "source": row.source,
            }
        )

    updated_at = datetime.now(tz).isoformat(timespec="seconds")
    current_distance = round(sum(run["distanceKm"] for run in runs), 1)
    current_duration = sum(duration_seconds(run["duration"]) for run in runs)
    total_distance = HISTORICAL_DISTANCE_KM_BEFORE_2026 + current_distance
    total_duration = HISTORICAL_DURATION_SECONDS_BEFORE_2026 + current_duration
    average_pace = format_pace(total_duration / 60 / total_distance) if total_distance else "--"
    return {
        "updatedAt": updated_at,
        "stats": {
            "runs": HISTORICAL_RUNS_BEFORE_2026 + len(runs),
            "distanceKm": round(total_distance, 1),
            "years": HISTORICAL_YEARS_BEFORE_2026 + 1,
            "avgPace": average_pace,
            "totalTime": format_total_time(total_duration),
            "currentYear": {
                "year": year,
                "runs": len(runs),
                "distanceKm": current_distance,
                "totalTime": format_total_time(current_duration),
            },
            "historicalBefore2026": {
                "runs": HISTORICAL_RUNS_BEFORE_2026,
                "distanceKm": HISTORICAL_DISTANCE_KM_BEFORE_2026,
                "years": HISTORICAL_YEARS_BEFORE_2026,
                "avgPace": "5'18\"",
                "totalTime": format_total_time(HISTORICAL_DURATION_SECONDS_BEFORE_2026),
            },
        },
        "hero": {
            "city": city,
            "latestRunId": runs[0]["id"] if runs else None,
            "year": year,
            "routeCount": len(runs),
            "coordinateSystem": "wgs84",
            "availableCoordinateSystems": ["wgs84", "gcj02"],
            "sourceCoordinateSystem": "gcj02",
        },
        "runs": runs,
    }


def write_json(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Sync PacerMind iPhone workouts into the website journey.json.")
    parser.add_argument("--device", default=DEFAULT_DEVICE, help="CoreDevice id, device name, or DNS name.")
    parser.add_argument("--bundle-id", default=DEFAULT_BUNDLE_ID)
    parser.add_argument("--year", type=int, default=datetime.now(ZoneInfo(DEFAULT_TIMEZONE)).year)
    parser.add_argument("--timezone", default=DEFAULT_TIMEZONE)
    parser.add_argument("--city", default="Shanghai")
    parser.add_argument("--max-points-per-run", type=int, default=240)
    parser.add_argument("--site-root", type=Path, default=Path.cwd())
    parser.add_argument("--output", type=Path, default=Path("assets/data/journey.json"))
    parser.add_argument("--reuse-store", type=Path, help="Use an already copied PacerMind.store instead of pulling from device.")
    parser.add_argument("--keep-copy", type=Path, help="Copy the pulled store files into this directory for later --reuse-store runs.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    tz = ZoneInfo(args.timezone)
    site_root = args.site_root.resolve()
    output = args.output if args.output.is_absolute() else site_root / args.output

    with tempfile.TemporaryDirectory(prefix="pacermind-journey-") as tmp:
        if args.reuse_store:
            store_path = args.reuse_store.resolve()
            if not store_path.exists():
                print(f"error: --reuse-store does not exist: {store_path}", file=sys.stderr)
                return 2
        else:
            copy_dir = Path(tmp) / "container"
            store_path = copy_store_from_device(args.device, args.bundle_id, copy_dir)
            if args.keep_copy:
                keep_dir = args.keep_copy.resolve()
                keep_dir.mkdir(parents=True, exist_ok=True)
                for filename in STORE_FILES:
                    source = copy_dir / filename
                    if source.exists():
                        shutil.copy2(source, keep_dir / filename)

        rows = fetch_rows(store_path, args.year, tz)
        journey = build_journey(rows, year=args.year, city=args.city, max_points=args.max_points_per_run, tz=tz)
        write_json(output, journey)

    route_count = journey["hero"]["routeCount"]
    print(
        f"updated {output} with {journey['stats']['runs']} total runs, "
        f"{route_count} current-year routes, {journey['stats']['distanceKm']} total km for {args.year}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
