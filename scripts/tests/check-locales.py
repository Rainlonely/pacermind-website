"""Catalog completeness, safe HTML and public-packaging checks."""
from html.parser import HTMLParser
from pathlib import Path
import json
import re
import sys
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT/'deploy'))
from receive import public_path
languages = ['en','zh-Hans','zh-Hant','ja','ko','de','fr','pt']
english=json.loads((ROOT/'assets/locales/en.json').read_text())
class Markup(HTMLParser):
    def __init__(self):super().__init__(); self.links=[]
    def handle_starttag(self,tag,attrs):
        assert tag in {'a','br','em','span','strong'},tag
        for k,v in attrs:
            assert k in {'href','rel','aria-hidden'},k
            if k=='href':
                assert v.startswith(('https://','mailto:')),v
                self.links.append(v)
for code in languages:
    path=ROOT/f'assets/locales/{code}.json'
    data=json.loads(path.read_text())
    assert data.keys()==english.keys(),f'{code}: missing or extra keys'
    assert public_path(str(path.relative_to(ROOT)))
    for key,value in data.items():
        assert isinstance(value,str) and value.strip(),(code,key)
        source=Markup();source.feed(key)
        target=Markup();target.feed(value)
        assert sorted(source.links)==sorted(target.links),(code,key,'links changed')
for page in ['index','privacy','support','planner','notes']:
    text=(ROOT/f'{page}.html').read_text()
    assert 'scripts/i18n.js' in text and 'assets/styles/i18n.css' in text,page
    assert text.index('scripts/i18n.js')<text.index('scripts/site.js'),page
print(f'PASS: {len(languages)} catalogs × {len(english)} entries; safe markup, links and deployment allowlist')
