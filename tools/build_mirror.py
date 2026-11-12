# Builds the vanity mirror on index.html (face map + 3D filler head) from tools/tx_content.py.
# Run: python3 tools/build_mirror.py
import html, json, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from tx_content import TX
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
E = html.escape
# zone key, button label, vertex on the 3D head (heads.bin, female), which side its label sits
ZONES = [
 ('forehead', 'Forehead', 463, 'l'), ('temples', 'Temples', 456, 'l'), ('undereyes', 'Under-eyes', 1739, 'l'),
 ('smile', 'Smile lines', 2081, 'l'), ('chin', 'Chin', 527, 'l'), ('neck', 'Neck', 2497, 'l'),
 ('brows', 'Between the brows', 84, 'r'), ('eyes', 'Around the eyes', 2397, 'r'), ('cheeks', 'Cheeks', 2545, 'r'),
 ('lips', 'Lips and mouth', 1429, 'r'), ('jaw', 'Jawline', 1721, 'r'),
]
MAP = {
 'Forehead': 'forehead', 'Between the brows': 'brows', "Crow's feet": 'eyes', 'Around the eyes': 'eyes',
 'Under-eyes': 'undereyes', 'Temples': 'temples', 'Cheeks': 'cheeks', 'Side of the cheeks': 'cheeks', 'Mid-face': 'cheeks',
 'Cheeks and mid-face': 'cheeks', 'Hollow cheeks': 'cheeks', 'Side of the face': 'cheeks', 'Cheekbones': 'cheeks',
 'Cheeks and cheekbones': 'cheeks', 'Smile lines': 'smile', 'Lips': 'lips', 'Mouth corners': 'lips', 'Around the mouth': 'lips',
 'Chin': 'chin', 'Jaw': 'jaw', 'Jawline': 'jaw', 'Pre-jowl': 'jaw', 'Neck': 'neck', 'Neck and face lift': 'neck',
 'Whole face': 'skin', 'Whole face, for firmness': 'skin', 'Acne scars': 'skin',
}
zones = {z[0]: [] for z in ZONES}; zones['skin'] = []
for slug, t in TX.items():
    for lab, note, *_ in list(t['face']) + list(t['body']):
        z = MAP.get(lab)
        if not z: continue
        if any(e['slug'] == slug for e in zones[z]): continue
        zones[z].append(dict(slug=slug, name=t['name'], half=t['half'], note=note))
names = {z[0]: z[1] for z in ZONES}; names['skin'] = 'The whole face'
verts = {k: v for k, _, v, _ in ZONES}
col = lambda side: ''.join(f'<button type="button" class="fz" data-z="{k}">{E(lab)}</button>' for k, lab, v, sd in ZONES if sd == side)
section = f'''<!-- mirror:start (built by tools/build_mirror.py) -->
<section id="mirror" class="mirror-section">
  <div class="tx-head"><p class="kicker">The vanity mirror</p><h2>Try the look <em>before the ball</em></h2>
  <p class="sub">Tap an area of the face to see which treatments work there, or open the 3D head to see where filler goes and how much.</p></div>
  <div class="mirror-tabs" role="tablist">
    <button type="button" role="tab" aria-selected="true" data-tab="map">Face map</button>
    <button type="button" role="tab" aria-selected="false" data-tab="sim">Filler on a 3D head</button>
  </div>
  <div class="mirror-map" data-panel="map">
    <div class="mirror-stage">
      <canvas class="mirror-leads" aria-hidden="true"></canvas>
      <div class="fz-col fz-l">{col("l")}</div>
      <div class="vanity"><div class="vanity-glass"><div class="mirror-head" id="mirror-head"></div></div></div>
      <div class="fz-col fz-r">{col("r")}</div>
      <button type="button" class="fz fz-skin" data-z="skin">The whole face</button>
    </div>
    <div class="mirror-out" aria-live="polite">
      <p class="mo-empty">Which area bothers you most? Tap it beside the mirror.</p>
      <div class="mo-list" hidden><h3 class="mo-title"></h3><ul></ul></div>
    </div>
  </div>
  <div class="mirror-sim" data-panel="sim" hidden><div id="filler-sim"></div>
    <p class="note center">This simulator also runs on the Apex Surgery website.</p></div>
</section>
<script>window.CG_ZONES = {json.dumps(dict(zones=zones, names=names, verts=verts))};</script>
<!-- mirror:end -->'''
p = os.path.join(ROOT, 'index.html'); h = open(p).read()
if '<!-- mirror:start' in h:
    h = re.sub(r'<!-- mirror:start.*?<!-- mirror:end -->', lambda m: section, h, flags=re.S)
else:
    h = re.sub(r'<section id="mirror" class="mirror-section">.*?</section>', lambda m: section, h, count=1, flags=re.S)
open(p, 'w').write(h)
print('built mirror', {k: len(v) for k, v in zones.items()})
