# Builds index.html in the Apex design (the same base as apexsurgeryhospital.com).
# Treatment names, prices and areas come from tools/tx_content.py, tools/site_content.py and tools/layout.py.
# Run: python3 tools/build_home.py
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from tx_content import TX
from skin_art import band
from site_content import HOME, TAGS, LAYERS
H = HOME
from layout import E, ROOT, ORDER, C, ZONES, LINE_ID, LINE_URL, PHONE, zones, head2, header2, footer2, scripts2, ic, CURVE

def short_price(k):
    price = C[k][6]
    p = ' '.join(price.replace(',', '#', 1).split(',')[0].replace('#', ',').split()[:2]) if 'baht' in price else price
    return ('About ' + p) if 'typical' in price else p

def tile(k, i):
    t = TX[k]; sym, mat, _ = TAGS[k]
    return (f'<a class="svc-tile cg-tile rv" data-d="{i * 50}" href="{k}.html"><span class="st-glow" aria-hidden="true"></span>'
            f'<span class="st-ic cg-sym" aria-hidden="true">{sym}</span><span class="st-name">{E(t["name"])}</span>'
            f'<span class="st-en">{E(mat)}</span><span class="cg-from">{E("From " + short_price(k) if any(c.isdigit() for c in short_price(k)) else short_price(k))}</span>'
            f'<span class="st-go">{ic("arrow-up-right")}</span></a>')

groups = ''.join(
    f'<div class="cg-group"><h3 class="cg-gh"><b>{E(half)}</b> {E(sub)}</h3><div class="svc-grid cg-grid">'
    + ''.join(tile(k, i) for i, k in enumerate(k for k in ORDER if TX[k]['half'] == half)) + '</div></div>'
    for half, sub in H['treatments']['halves'])

hero_tx = ''.join(f'<li><a href="{k}.html">{E(TX[k]["name"])}</a></li>' for k in ORDER)
rail = ''.join(f'<li><button type="button" class="fz" data-z="{k}">{E(lab)}</button></li>' for k, lab, v, sd in ZONES)

# skin layers
L = LAYERS
lay_btns = ''.join(f'<button type="button" class="ly ly-{k}" data-ly="{k}" aria-pressed="{"true" if k == "dermis" else "false"}">{band(k)}<span class="ly-n">{E(n)}</span></button>'
                   for k, n, _ in L['layers'])
lay_cards = ''
for k, n, p in L['layers']:
    txs = [x for x in ORDER if k in TAGS[x][2]]
    chips = ''.join(f'<a class="ly-tx" href="{x}.html"><b>{TAGS[x][0]}</b>{E(TX[x]["name"])}</a>' for x in txs)
    lay_cards += (f'<div class="ly-card" data-ly="{k}"{"" if k == "dermis" else " hidden"}><p class="eyebrow on-night">{E(n)}</p><p class="ly-p">{E(p)}</p>'
                  + (f'<div class="ly-txs">{chips}</div>' if chips else '') + '</div>')

# before and after: the treatments that have slider cases
SETS = [k for k in ORDER if (TX[k].get('results') or {}).get('mode') == 'slider']
RS = H['results']['set']; R = TX[RS]['results']
ba_chips = ''.join(f'<button type="button" class="chip" data-set="{k}" aria-pressed="{"true" if k == RS else "false"}">{E(TX[k]["name"])}</button>' for k in SETS)
thumbs = ''.join(
    f'<button type="button" data-set="{k}" data-b="assets/img/{k}-{i}-before.webp" data-a="assets/img/{k}-{i}-after.webp" data-l="{E(" | ".join(TX[k]["results"].get("labels") or ("Before", "After")))}"'
    f' class="{"on" if (k == RS and i == 1) else ""}"{"" if k == RS else " hidden"}><img src="assets/img/{k}-{i}-after.webp" alt="{E(TX[k]["name"])} case {i}" loading="lazy"></button>'
    for k in SETS for i in range(1, TX[k]['results']['n'] + 1))
labels = R.get('labels') or ('Before', 'After')
stats = ''.join(f'<div><dt>{E(a)}</dt><dd>{E(b)}</dd></div>' for a, b in H['results']['stats'])

STEPS = H['visit']['steps']
SIC = {'talk': 'message-circle', 'tube': 'sparkles', 'needle': 'syringe', 'ice': 'heart-pulse', 'cal': 'calendar'}
steps = ''.join(f'<li><span class="vs-n">{i + 1}</span><div><b>{E(a)}</b><p>{E(b)}</p></div><span class="vs-t">{ic("clock")}{E(t)}</span></li>' for i, (k, a, b, t) in enumerate(STEPS))

def pick(name, sel):
    return f'<select name="{name}">' + ''.join(f'<option value="{k}"{" selected" if k == sel else ""}>{E(TX[k]["name"])}</option>' for k in ORDER) + '</select>'
book_opts = '<option>Not sure yet</option>' + ''.join(f'<option>{E(TX[k]["name"])}</option>' for k in ORDER)
h = lambda d: f'{E(d["h2"])} {E(d["h2_em"])}'

html = head2(H['seo_title'], H['seo_desc']) + f'''
<body class="cg-home">
{header2(True)}
<main id="main">
<section class="hero-body cg-hero has-curve" id="planner" data-tone="night">
  <div class="hb-glow" aria-hidden="true"></div><div class="hb-suture" aria-hidden="true"></div>
  <div class="wrap hb-grid">
    <div class="hb-copy">
      <p class="eyebrow on-night rv">{E(H['hero']['kicker'])}</p>
      <h1 class="hb-h1 rv" data-d="60">Apex Contour and Glow</h1>
      <p class="hb-lead rv" data-d="120">{E(H['hero']['sub'])}</p>
      <div class="hb-acts rv" data-d="180"><a class="btn btn-light" href="#book">{ic('message-circle')}Consultation</a><a class="btn btn-ghost" href="compare.html">{ic('sliders-horizontal')}Compare treatments</a></div>
      <ul class="hb-svcs rv" data-d="240">{hero_tx}</ul>
    </div>
    <div class="hb-stage cg-stage">
      <div class="cg-sex" role="group" aria-label="Face"><button type="button" data-sex="female" aria-pressed="true">Female</button><button type="button" data-sex="male" aria-pressed="false">Male</button></div>
      <div class="cg-head" id="planner-head" aria-label="Drag to turn the face. Tap an area below."></div>
      <canvas class="leads" aria-hidden="true"></canvas>
      <div class="cg-ba" role="group" aria-label="Filler"><button type="button" data-ba="before" aria-pressed="false">Before</button><button type="button" data-ba="after" aria-pressed="true">After</button></div>
      <ul class="cg-rail">{rail}<li><button type="button" class="fz fz-skin" data-z="skin">{E(H['hero']['whole'])}</button></li></ul>
      <div class="picks" aria-live="polite">
        <p class="empty">{ic('scan-face')}{E(H['hero']['empty'])}</p>
        <div class="list" hidden><button type="button" class="pk-x" aria-label="Close">{ic('x')}</button><p class="area"></p><ul class="basis"></ul><ul class="txc"></ul></div>
      </div>
    </div>
  </div>
  <p class="refs cg-refs wrap">Filler areas follow the MD Codes (<a href="https://doi.org/10.1007/s00266-020-01762-7">de Maio, Aesthetic Plastic Surgery 2021</a>). Botox points follow published injection guides (<a href="https://doi.org/10.1097/01.PRS.0000144795.76040.D3">Carruthers, Plastic and Reconstructive Surgery 2004</a>; <a href="https://doi.org/10.3390/toxins15020082">Toxins 2023</a>; <a href="https://doi.org/10.5115/acb.22.258">Anatomy and Cell Biology 2023</a>). Simulation only. Your doctor decides the points and amounts.</p>
  <div class="sx sx-c sx-to-wash" aria-hidden="true">{CURVE}</div>
</section>

<section class="section washed" id="treatments" data-tone="wash">
  <div class="wrap">
    <div class="shead"><div><p class="eyebrow rv">Treatments</p><h2 class="h-xl rv">{h(H['treatments'])}</h2><p class="muted rv">{E(H['treatments']['p'])}</p></div><a class="link-arrow rv" href="compare.html">Compare two treatments {ic('arrow-right')}</a></div>
    {groups}
  </div>
</section>

<section class="section night tools-s has-sx" id="layers" data-tone="night"><div class="sx sx-b sx-wash-night" aria-hidden="true"></div>
  <div class="wrap">
    <div class="shead"><div><p class="eyebrow on-night rv">{E(L['eyebrow'])}</p><h2 class="h-xl rv">{E(L['h2'])} {E(L['h2_em'])}</h2><p class="lead rv">{E(L['p'])}</p></div></div>
    <div class="ly-wrap rv">
      <div class="ly-stack" role="group" aria-label="Layers">{lay_btns}</div>
      <div class="ly-cards">{lay_cards}</div>
    </div>
  </div>
</section>

<section class="section has-sx" id="results" data-tone="light"><div class="sx sx-b sx-night-light" aria-hidden="true"></div>
  <div class="wrap">
    <div class="shead"><div><p class="eyebrow rv">Results</p><h2 class="h-xl rv">{h(H['results'])}</h2></div></div>
    <div class="chips" role="group" aria-label="Treatment">{ba_chips}</div>
    <div class="cg-res">
      <div class="cg-ba-card"><div class="ba" id="ba" data-set="{RS}">
        <img src="assets/img/{RS}-1-after.webp" alt="After {E(TX[RS]['name'])}" class="after">
        <img src="assets/img/{RS}-1-before.webp" alt="Before {E(TX[RS]['name'])}" class="before">
        <span class="line" aria-hidden="true"></span><span class="knob" aria-hidden="true">{ic('move-horizontal')}</span>
        <span class="tag tb">{E(labels[0])}</span><span class="tag ta">{E(labels[1])}</span>
        <input class="range" type="range" min="0" max="100" value="50" aria-label="Move the line between before and after">
      </div></div>
      <div class="cg-res-side">
        <p class="lead">{E(H['results']['p'])}</p>
        <div class="thumbs" id="thumbs">{thumbs}</div>
        <dl class="stats">{stats}</dl>
        <div class="tools"><button type="button" class="btn btn-plum btn-sm" data-ba="play">{ic('play')}Play again</button><a class="link-arrow" href="{RS}.html" id="ba-read">Read about {E(TX[RS]['name'])} {ic('arrow-right')}</a></div>
        <p class="note">{E(H['results']['fine'])}</p>
      </div>
    </div>
  </div>
</section>

<section class="section washed has-sx" id="visit" data-tone="wash"><div class="sx sx-b sx-light-wash" aria-hidden="true"></div>
  <div class="wrap cg-visit">
    <div><p class="eyebrow rv">Your visit</p><h2 class="h-xl rv">{h(H['visit'])}</h2><p class="lead rv">{E(H['visit']['foot'])}</p>
      <form class="cg-cmp rv" action="compare.html"><p class="eyebrow">{E(H['compare']['h2'])} {E(H['compare']['h2_em'])}</p>
        <div class="cmp-row"><label>First{pick("a", H['compare']['a'])}</label><label>Second{pick("b", H['compare']['b'])}</label></div>
        <button class="btn btn-plum btn-sm" type="submit">{ic('sliders-horizontal')}Compare</button></form></div>
    <ol class="cg-steps rv">{steps}</ol>
  </div>
</section>

<section class="section night has-sx" id="book" data-tone="night"><div class="sx sx-b sx-light-night" aria-hidden="true"></div>
  <div class="wrap"><div class="consult-band cg-book rv">
    <div class="cb-copy"><p class="eyebrow">Consult</p><h2 class="h-xl">{h(H['book'])}</h2><p class="lead">{E(H['book']['p'])}</p>
      <div class="cb-acts"><a class="cb-row" href="{LINE_URL}">{ic('brand:line')}<span><b>Chat on LINE</b><small>{E(LINE_ID)}</small></span></a>
        <a class="cb-row" href="tel:{PHONE.replace('-', '')}">{ic('phone')}<span><b>Call the clinic</b><small>{E(PHONE)}</small></span></a></div></div>
    <form class="cg-form" id="book-form">
      <label>Your name<input name="name" autocomplete="name" placeholder="Ploy Srisuk" required></label>
      <label>Phone<input name="phone" type="tel" autocomplete="tel" placeholder="081 234 5678"></label>
      <label>Treatment<select name="treatment">{book_opts}</select></label>
      <label>Preferred day<input name="day" type="date"></label>
      <label class="hp" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"></label>
      <label class="consent"><input type="checkbox" name="consent" required><span>{E(H['book']['consent'])} <a href="privacy.html">{E(H['book']['privacy'])}</a></span></label>
      <button class="btn btn-light" type="submit">{ic('brand:line')}Send on LINE</button>
      <p class="note">{E(H['book']['fine'])}</p>
    </form>
  </div></div>
</section>
</main>
{footer2()}
<script>window.CG_ZONES = {json.dumps(zones())}; window.CG_LINE = {json.dumps(LINE_ID)};</script>
{scripts2()}
</body>
</html>
'''
open(os.path.join(ROOT, 'index.html'), 'w', encoding='utf-8').write(html)
print('built index.html')
