#!/usr/bin/env python3
"""Release checks for local links, images, data freshness and loading budgets."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
import json
ROOT=Path(__file__).resolve().parents[2]
class Page(HTMLParser):
    def __init__(self): super().__init__(); self.refs=[]; self.ids=[]; self.images=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if 'id' in a:self.ids.append(a['id'])
        for k in ['src','href']:
            if k in a:self.refs.append(a[k])
        if 'srcset' in a:self.refs.extend(x.strip().split()[0] for x in a['srcset'].split(','))
        if tag=='img':self.images.append(a)
for name in ['index.html','privacy.html','support.html']:
    p=Page(); p.feed((ROOT/name).read_text())
    assert len(p.ids)==len(set(p.ids)),f'Duplicate ID in {name}'
    for ref in p.refs:
        u=urlsplit(ref)
        if u.scheme or u.netloc:continue
        if u.path:
            target=ROOT/u.path.lstrip('/')
            assert target.exists(),f'Missing {ref} in {name}'
        elif u.fragment:assert u.fragment in p.ids,f'Missing anchor {ref} in {name}'
    assert 'fonts.googleapis.com' not in (ROOT/name).read_text()
    if name=='index.html':
        for im in p.images:
            if '/web/' in im.get('src',''):
                assert 'width' in im and 'height' in im,'Reserve image space'
            if '/web/' in im.get('src','') and 'city-' not in im['src'] and 'data-hero-screen' not in im:
                assert im.get('loading')=='lazy','Defer below-fold screenshots'
summary=json.loads((ROOT/'assets/data/journey-summary.json').read_text())
source=json.loads((ROOT/'assets/data/journey.json').read_text())
assert summary['stats']==source['stats'] and summary['updatedAt']==source['updatedAt']
assert len(summary['runs'])==min(10,len(source['runs']))
assert all('coordinates' not in r and 'coordinatesGcj02' not in r for r in summary['runs'])
assert (ROOT/'assets/data/journey-summary.json').stat().st_size<20000
routes=json.loads((ROOT/'assets/data/journey-routes.json').read_text())
assert routes['type']=='FeatureCollection' and len(routes['features'])>0
assert (ROOT/'assets/data/journey-routes.json').stat().st_size<500000
assert all(len(f['geometry']['coordinates'])>=2 for f in routes['features'])
for p in (ROOT/'assets/images/web').glob('*.webp'):assert p.stat().st_size<500000,p.name
assert (ROOT/'assets/images/web/social-preview.jpg').exists()
print('PASS: local links, anchors, image dimensions/lazy loading, current summary, route geometry and resource budgets')
