#!/usr/bin/env python3
"""Expose only complete nine-card language sets, never partly generated sets."""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
names=['01-city-map','02-today','03-memory','04-plan-list','05-plan-detail','06-journey','07-workout-detail','08-profile','09-records']
locales=['en','zh-Hant','ja','ko','de','fr','pt','es']
titles={(x['language'],x['name']):x['title'] for x in json.loads((ROOT/'scripts/preview-titles.json').read_text())}
result={'version':1,'kind':'AI-localized promotional images based on original app screenshots','languages':{}}
for locale in locales:
    cards=[]
    for name in names:
        small=f'assets/images/iphone-localized/{locale}/{name}-450.webp'
        large=f'assets/images/iphone-localized/{locale}/{name}-900.webp'
        if not (ROOT/small).exists() or not (ROOT/large).exists():break
        cards.append({'small':small,'large':large,'title':titles[(locale,name)]})
    if len(cards)==9:result['languages'][locale]=cards
(ROOT/'assets/data/preview-localizations.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print('Complete sets:',', '.join(result['languages']))
