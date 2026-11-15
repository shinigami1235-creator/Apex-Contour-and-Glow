# Packs the site's content into the JSON that `wp apex import` reads, so WordPress starts with exactly
# what the static site shows. Run from the site folder: python3 wordpress/tools/export_content.py
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(SITE, 'tools'))
from tx_content import TX
from site_content import SETTINGS, HOME, PRIVACY
from tx_art import ICON
from layout import ORDER, ROWS, C, PAIRS, ZONES, AREA, zones

def treatment(k, i):
    t = dict(TX[k])
    t.pop('banner', None)
    t['face'] = [list(r[:2]) for r in t['face']]   # the design ignores anything after the area and the amount
    t['key'] = k
    t['order'] = i
    t['summary'] = {r[0]: v for r, v in zip(ROWS, C[k])}
    return t

out = {
    'format': 1,
    'lang': 'en',
    'settings': SETTINGS,
    'home': HOME,
    'privacy': PRIVACY,
    'treatments': [treatment(k, i) for i, k in enumerate(ORDER)],
    'compare': {'rows': [list(r) for r in ROWS],
                'pairs': [dict(zip(('a', 'b'), k.split('|')), note=v) for k, v in PAIRS.items()]},
    'planner': {'zones': [dict(key=k, label=l, vertex=v, side=s) for k, l, v, s in ZONES], 'area_of': AREA},
}
dest = os.path.join(SITE, 'wordpress', 'theme', 'apex-contour-glow', 'import')
os.makedirs(dest, exist_ok=True)
path = os.path.join(dest, 'content-en.json')
with open(path, 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, indent=1)
# where each face planner area sits on the 3D head and what research places its points: fixed, not edited
z = zones()
planner = {'verts': z['verts'], 'pts': z['pts'], 'fill': z['fill'], 'info': z['info'], 'sides': {k: s for k, _, _, s in ZONES}, 'area_of': AREA}
ddir = os.path.join(SITE, 'wordpress', 'theme', 'apex-contour-glow', 'data')
os.makedirs(ddir, exist_ok=True)
with open(os.path.join(ddir, 'planner.json'), 'w', encoding='utf-8') as f:
    json.dump(planner, f, ensure_ascii=False, separators=(',', ':'))
with open(os.path.join(ddir, 'icons.json'), 'w', encoding='utf-8') as f:
    json.dump(ICON, f, ensure_ascii=False)
print(f'wrote {os.path.relpath(path, SITE)}: {len(out["treatments"])} treatments, {len(out["compare"]["pairs"])} pairs')
