#!/usr/bin/env python3
"""Prepare website assets from published journey data; no device access needed.
Run with Pillow, fonttools[woff]. --refresh-maps refreshes attributed Mapbox base maps.
"""
import argparse, io, json, math, re, urllib.request
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets/images/web'
CENTER = [121.475, 31.23]
ZOOM = 11.3
SIZE = (1280, 900)

def projected(lon, lat):
    scale = 512 * 2 ** ZOOM
    return ((lon + 180) / 360 * scale, (1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * scale)

def prepare_journey():
    data = json.loads((ROOT / 'assets/data/journey.json').read_text())
    recent = [{k:v for k,v in r.items() if k not in ('coordinates','coordinatesGcj02')} for r in data['runs'][:10]]
    summary = {k:data[k] for k in ['updatedAt','stats','hero']}
    summary['runs'] = recent
    (ROOT/'assets/data/journey-summary.json').write_text(json.dumps(summary,ensure_ascii=False,separators=(',',':'))+'\n')
    page = ROOT / 'index.html'
    html = page.read_text()
    for attr, key in [('runs','runs'),('distance','distanceKm'),('years','years')]:
        value = format(round(float(data['stats'].get(key,0))), ',')
        html = re.sub(r'(<strong data-stat-' + attr + r'>).*?(</strong>)', lambda m: m[1] + value + m[2], html, flags=re.S)
    page.write_text(html)
    features = []
    for r in data['runs']:
        points = r.get('coordinates',[])
        # Only the city shown on the public landing page; keep route endpoints.
        if len(points)<2 or not any(121.30<p[1]<121.65 and 31.08<p[0]<31.38 for p in points): continue
        stride = max(1, math.ceil(len(points)/140))
        sampled = points[::stride]
        if sampled[-1] != points[-1]: sampled.append(points[-1])
        features.append({'type':'Feature','properties':{},'geometry':{'type':'LineString','coordinates':[[round(p[1],5),round(p[0],5)] for p in sampled]}})
    geo = {'type':'FeatureCollection','features':features}
    (ROOT/'assets/data/journey-routes.json').write_text(json.dumps(geo,separators=(',',':'))+'\n')
    return geo

def main():
    parser=argparse.ArgumentParser(); parser.add_argument('--refresh-maps',action='store_true'); args=parser.parse_args()
    OUT.mkdir(parents=True,exist_ok=True)
    geo=prepare_journey()
    for p in (ROOT/'assets/images/pacermind-2').glob('*.png'):
        im=Image.open(p).convert('RGB')
        for w in [450,750]:
            im.resize((w,round(im.height*w/im.width)),Image.Resampling.LANCZOS).save(OUT/f'{p.stem}-{w}.webp',quality=84,method=6)
    cfg=json.loads((ROOT/'assets/data/mapbox-config.json').read_text())
    cx,cy=projected(*CENTER)
    for scheme,style in [('light','light-v11'),('dark','dark-v11')]:
        base=OUT/f'map-base-{scheme}.webp'
        if args.refresh_maps or not base.exists():
            url=f'https://api.mapbox.com/styles/v1/mapbox/{style}/static/{CENTER[0]},{CENTER[1]},{ZOOM},0,0/{SIZE[0]}x{SIZE[1]}?access_token={cfg["accessToken"]}'
            with urllib.request.urlopen(urllib.request.Request(url,headers={"Referer":"https://pacermind.xyz/","User-Agent":"Mozilla/5.0"}),timeout=45) as response: im=Image.open(io.BytesIO(response.read())).convert('RGB')
            im.save(base,quality=88,method=6)
        im=Image.open(base).convert('RGBA')
        lines=Image.new('RGBA',SIZE); draw=ImageDraw.Draw(lines)
        for feature in geo['features']:
            points=[(x-cx+SIZE[0]/2,y-cy+SIZE[1]/2) for x,y in [projected(*p) for p in feature['geometry']['coordinates']]]
            draw.line(points,fill=(255,106,26,135),width=2,joint='curve')
        glow=lines.filter(ImageFilter.GaussianBlur(3))
        im=Image.alpha_composite(Image.alpha_composite(im,glow),lines)
        # Attribution is inherited from the original static map and remains visible.
        im.convert('RGB').save(OUT/f'city-{scheme}.webp',quality=87,method=6)
    print('Built responsive screens, city posters, journey summary and simplified routes.')
if __name__=='__main__': main()
