#!/usr/bin/env python3
"""Export only map geometry/place names from the iOS heatmap cache for the public hero."""
import argparse
import importlib.util
import json
import math
import os
from pathlib import Path
import subprocess
import sys
import tempfile

spec = importlib.util.spec_from_file_location('journey_sync', Path(__file__).with_name('sync-journey-from-device.py'))
sync = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = sync
spec.loader.exec_module(sync)


def simplify(points, tolerance=0.00015):
    """Douglas-Peucker: keep corners/endpoints, never join separate GPS segments."""
    if len(points) <= 2:
        return points
    keep = {0, len(points)-1}
    stack = [(0, len(points)-1)]
    while stack:
        a, b = stack.pop()
        x, y = points[a]; dx = points[b][0]-x; dy = points[b][1]-y
        length = dx*dx+dy*dy
        best, index = tolerance*tolerance, None
        for i in range(a+1,b):
            px, py = points[i]
            t = max(0,min(1,((px-x)*dx+(py-y)*dy)/length)) if length else 0
            distance = (px-x-t*dx)**2+(py-y-t*dy)**2
            if distance > best:
                best,index = distance,i
        if index is not None:
            keep.add(index); stack.extend([(a,index),(index,b)])
    return [points[i] for i in sorted(keep)]


def feature(kind, coordinates, properties=None):
    return {'type':'Feature','geometry':{'type':kind,'coordinates':coordinates},'properties':properties or {}}


def collection(features):
    return {'type':'FeatureCollection','features':features}


def export(cache, places):
    lines, cells = [], {}
    for route in cache['routes']:
        for segment in route.get('coordinateSegments') or [route.get('coordinates',[])]:
            points=[]
            for p in segment:
                lat,lon = sync.gcj02_to_wgs84(p['latitude'],p['longitude'])
                if not (math.isfinite(lat) and math.isfinite(lon) and abs(lat)<85.051129 and abs(lon)<=180):
                    raise ValueError('Invalid route coordinate')
                point=[round(lon,5),round(lat,5)]
                if not points or points[-1]!=point: points.append(point)
                # Small occupied Web Mercator cells retain the archive-wide footprint.
                key=(int((lon+180)/360*4096),int((1-math.asinh(math.tan(math.radians(lat)))/math.pi)/2*4096))
                cells.setdefault(key,point)
            if len(points)>1: lines.append(feature('LineString',simplify(points)))
    # Fill language-cache gaps from the same visited shard; never invent locations.
    english = {'中国':'China','日本':'Japan','意大利':'Italy','新加坡':'Singapore',
        '上海市':'Shanghai','北京市':'Beijing','厦门市':'Xiamen','大连市':'Dalian',
        '宁波市':'Ningbo','广州市':'Guangzhou','无锡市':'Wuxi','杭州市':'Hangzhou',
        '沈阳市':'Shenyang','苏州市':'Suzhou','西安市':'Xi’an','重庆市':'Chongqing',
        '青岛市':'Qingdao','香港特别行政区':'Hong Kong SAR','黄山市':'Huangshan',
        '佐拉普雷多萨':'Zola Predosa','博洛尼亚':'Bologna','米兰':'Milan','东京':'Tokyo',
        '国頭郡本部町':'Motobu','奈良市':'Nara','那覇市':'Naha'}
    places = dict(places)
    for key, place in list(places.items()):
        if key.startswith('zh'):
            translated = dict(place)
            for field in ['country','city']:
                translated[field] = english.get(place.get(field),place.get(field))
            places.setdefault('en|' + key.split('|',1)[1], translated)
    localized = {}
    for key,p in places.items():
        language='zh' if key.startswith('zh') else 'en'
        for kind,name,identity in [('countries',p.get('country'),p['countryCode']),('cities',p.get('city'),'|'.join([p['countryCode'],p.get('administrativeArea',''),p.get('city','') or '']))]:
            if not name: continue
            group=localized.setdefault(language,{}).setdefault(kind,{})
            if identity not in group:
                group[identity]=feature('Point',[round(p['longitude'],5),round(p['latitude'],5)],{'name':name,'priority':abs(p['longitude']-121.475)+abs(p['latitude']-31.23)})
    return {'schemaVersion':1,'routeCount':len(cache['routes']),'coordinateSystem':'WGS84',
        'routes':collection(lines),'lights':collection([feature('Point',p) for p in cells.values()]),
        'places':{lang:{kind:collection(list(items.values())) for kind,items in groups.items()} for lang,groups in localized.items()}}


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--device',default='Rain’s Air')
    parser.add_argument('--cache-dir',type=Path,help='Local directory with cache.json and places.json; skips device access')
    parser.add_argument('--output',type=Path,default=Path(__file__).resolve().parents[1]/'assets/data/hero-heatmap.json')
    args=parser.parse_args()
    with tempfile.TemporaryDirectory(prefix='pacermind-hero-') as tmp:
        directory=args.cache_dir or Path(tmp)
        if not args.cache_dir:
            env=dict(os.environ)
            if not env.get('DEVELOPER_DIR') and Path('/Applications/Xcode-beta.app').exists():
                env['DEVELOPER_DIR']='/Applications/Xcode-beta.app/Contents/Developer'
            def copy(source,target):
                subprocess.run(['xcrun','devicectl','device','copy','from','--device',args.device,'--domain-type','appDataContainer','--domain-identifier','rainlonely-studio.PacerMind','--source',source,'--destination',str(directory/target)],env=env,check=True)
            root='Library/Application Support/PacerMind/PersonalHeatmap/Routes/'
            copy(root+'current-generation-v3.txt','current.txt')
            generation=(directory/'current.txt').read_text().strip()
            copy(root+f'generations-v3/{generation}/cache.json','cache.json')
            copy('Library/Caches/PacerMind/home-map-places-v1.json','places.json')
        data=export(json.loads((directory/'cache.json').read_text()),json.loads((directory/'places.json').read_text()))
        args.output.parent.mkdir(parents=True,exist_ok=True)
        routes=data.pop('routes')
        route_path=args.output.with_name(args.output.stem+'-routes.json')
        route_path.write_text(json.dumps(routes,separators=(',',':'))+'\n')
        data['routesUrl']='assets/data/'+route_path.name
        args.output.write_text(json.dumps(data,ensure_ascii=False,separators=(',',':'))+'\n')
        print(f"Exported {data['routeCount']} routes, {len(data['lights']['features'])} light cells; {args.output.stat().st_size:,} bytes")

if __name__=='__main__': main()
