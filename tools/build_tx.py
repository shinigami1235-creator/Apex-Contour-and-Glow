# Builds one page per treatment from tools/tx_content.py. Edit the content file, then run: python3 tools/build_tx.py
import html, json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from tx_content import TX
from tx_art import icon
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSS_V = 22; JS_V = 16
E = html.escape
ROMAN = ['I','II','III','IV','V','VI','VII']
CASES = {'botox': 7}
AR = {'botox': '520/790', 'profhilo': '540/860'}

def page(slug, t):
    half_cls = 'contour' if t['half'] == 'Contour' else 'glow'
    facts = ''.join(f'<div><dt>{E(a)}</dt><dd>{E(b)}</dd></div>' for a, b in t['facts'])
    lead = E(t['lead']); 
    if ', ' in lead: x, y = lead.split(', ', 1); lead = f'{x}, <em>{y}</em>'
    ACT = ['Act I', 'Act II', 'Act III', 'Act IV']
    how = ''.join(f'<li><p class="act">{ACT[i]}</p><h3>{E(h)}</h3><span class="orn" aria-hidden="true"></span><p>{E(p)}</p></li>' for i, (k, h, p) in enumerate(t['how']))
    nots = ''.join(f'<li><b>{E(a)}</b><span>{E(b)}</span>' + (f'<a href="{c}">{E(d)}</a>' if c else '') + '</li>' for a, b, c, d in t['not_for'])
    def cards(items): return ''.join(f'<li><span class="pc-top"></span><b>{E(a)}</b><em>{E(u)}</em></li>' for a, u in items)
    face = [(lab, u) for lab, u, *_ in t['face']]
    body_html = f'<h3 class="pc-group">Body</h3><ul class="placecards">{cards(t["body"])}</ul>' if t.get('body') else ''
    face_h = '<h3 class="pc-group">Face</h3>' if t.get('body') else ''
    does = f'''<section class="does"><div class="tx-head"><p class="kicker">What it does</p><h2 class="lead">{lead}</h2></div>
  <ol class="acts">{how}</ol>
  <div class="notcard"><p class="kicker">Not its dance</p><ul>{nots}</ul></div></section>
<section class="where"><div class="tx-head"><p class="kicker">Where it goes</p><h2>The seating plan <em>for {E(t["name"])}</em></h2></div>
  {face_h}<ul class="placecards">{cards(face)}</ul>
  {body_html}
  <p class="note center">{E(t["areas_note"])}</p></section>'''
    tiles = ''.join(f'<div class="tile">{icon(k)}<b>{E(h)}</b><span>{E(p)}</span></div>' for k, h, p in t['care']['before'])
    clock = ''.join(f'<li><span class="when">{E(w)}</span><ul>' + ''.join(f'<li>{icon(k)}<span>{E(x)}</span></li>' for k, x in items) + '</ul></li>' for w, items in t['care']['after'])
    urgent = f'<p class="urgent">{E(t["care"]["urgent"])}</p>' if t['care'].get('urgent') else ''
    care = f'''<section class="care2"><div class="tx-head"><p class="kicker">Before and after</p><h2>Etiquette <em>for the evening</em></h2></div>
  <div class="care-grid"><div class="card-b"><h3>Before you come</h3><div class="tiles">{tiles}</div></div>
  <div class="card-a"><h3>After you leave</h3><ol class="clock">{clock}</ol>{urgent}</div></div></section>'''
    lens = [34, 70, 22, 58, 40, 64, 28]
    fit = ''.join(f'<li style="--i:{k};--len:{lens[k]}px"><span class="pin" aria-hidden="true"></span><div class="ftag"><em class="num">{ROMAN[k]}</em><h3>{E(a)}</h3><p>{E(b)}</p></div></li>' for k, (a, b) in enumerate(t['fitting']))
    tl = ''.join(f'<li><b>{E(a)}</b><span>{E(b)}</span></li>' for a, b in t['timeline'])
    pr = t['prices']
    rows = ''.join('<tr>' + ''.join(f'<td class="num">{E(c)}</td>' if 'baht' in c else f'<td>{E(c)}</td>' for c in r) + '</tr>' for r in pr['rows'])
    table_open = '' if pr['rows'] else '<!--'; table_close = '' if pr['rows'] else '-->'
    inv = ''.join(f'<div class="invite"><p class="kicker">Invitation</p><h3>{E(a)}</h3><p class="amt">{E(b)}</p></div>' for a, b in pr['invitations'])
    faq = ''.join(f'<details><summary>{E(q)}</summary><p>{E(a)}</p></details>' for q, a in t['faq'])
    from_html = f'<p class="from">From <b>{E(t["price_from"])}</b><span>{E(t["price_note"])}</span></p>' if t.get('price_from') else f'<p class="from"><span>{E(t["price_note"])}</span></p>'
    R = t.get('results')
    if not R:
        results = ''
    elif R['mode'] == 'slider':
        lb, la = R.get('labels', ('Before', 'After'))
        thumbs = ''.join(f'<button data-i="{i}" class="{"on" if i == 1 else ""}"><img src="assets/img/{R["set"]}-{i}-after.webp" alt="Case {i}" loading="lazy"></button>' for i in range(1, R['n'] + 1)) if R['n'] > 1 else ''
        results = f'''<section id="entrance" class="entrance">
  <div class="entrance-head"><p class="kicker">The grand entrance</p><h2>Before and after</h2><p>{E(R.get("caption", t["name"] + " at Apex. Drag the line across the mirror to compare."))}</p></div>
  <div class="smokemirror" id="compare" data-set="{R["set"]}" data-lb="{E(lb)}" data-la="{E(la)}" style="--ar:{R.get("ar", "540/860")}">
    <div class="sm-frame">
      <div class="sm-glass">
        <img src="assets/img/{R["set"]}-1-after.webp" alt="After {E(t["name"])}" class="after">
        <img src="assets/img/{R["set"]}-1-before.webp" alt="Before {E(t["name"])}" class="before">
        <span class="sm-line" aria-hidden="true"><i></i></span><span class="sm-sheen" aria-hidden="true"></span>
        <input class="sm-range" type="range" min="0" max="100" value="50" aria-label="Move the line between before and after">
      </div>
      <img src="assets/img/mirror-frame.webp" alt="" class="sm-ornate">
    </div>
    <p class="sm-state"><span>{E(lb)}</span><span>{E(la)}</span></p>
    <div class="fm-tools"><button type="button" data-sm="play">Play it again</button></div>
  </div>
  <div class="thumbs" id="thumbs">{thumbs}</div>
  <p class="fine">Individual results vary.</p>
</section>'''
    else:
        imgs = ''.join(f'<button class="gal-item" data-full="assets/img/{R["set"]}-g{i}.webp"><img src="assets/img/{R["set"]}-g{i}.webp" alt="{E(t["name"])} result {i}" loading="lazy"></button>' for i in range(1, R['n'] + 1))
        results = f'''<section id="entrance" class="entrance">
  <div class="entrance-head"><p class="kicker">The grand entrance</p><h2>Before and after</h2><p>{E(R.get("caption", t["name"] + " at Apex. Tap a photo to see it large."))}</p></div>
  <div class="gallery">{imgs}</div>
  <p class="fine">Individual results vary.</p>
</section>'''
    nav_results = '<a href="#entrance">Results</a>' if t.get('results') else ''
    lines = [f'{t["name"]} at Apex starts at {t["price_from"]} ({t["price_note"]}).'] if t.get('price_from') else [f'{t["price_note"]}.']
    lines += [f'{k}: {v}.' for k, v in t['facts']]
    guide_json = json.dumps(lines).replace('</', '<\\/')
    src = ''.join(f'<li>{E(s)}</li>' for s in t['sources'])
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{E(t["name"])} at Apex | Apex Contour and Glow</title>
<meta name="description" content="{E(t["hook"][0])}">
<meta name="robots" content="noindex">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..700;1,6..96,400&family=Jost:wght@300;400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/site.css?v={CSS_V}">
</head>
<body class="tx-page {half_cls}">
<button class="sound" id="sound" aria-pressed="false" aria-label="Music"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/></svg><span>Music</span></button>
<header class="topbar">
  <a class="mark" href="index.html">Apex <span>Contour and Glow</span></a>
  <nav><a href="index.html#card">Dance card</a><a href="#fitting">Fitting room</a>{nav_results}<a href="#prices">Prices</a><a href="index.html#rsvp" class="rsvp-link">RSVP</a></nav>
</header>
<main>
<section class="tx-hero">
  <div class="tx-title">
    <p class="kicker">No. {t["no"]} · {"First" if t["half"] == "Contour" else "Second"} half · {E(t["half"])}</p>
    <h1>{E(t["name"])}</h1>
    {''.join(f'<p>{E(p)}</p>' for p in t["hook"])}
  </div>
  <aside class="programme">
    <p class="kicker">On the programme</p>
    <dl>{facts}</dl>
    {from_html}
    <a class="btn-gold" href="index.html#rsvp">Reserve this dance</a>
    <a class="cmp-link" href="compare.html?a={slug}">Compare with another treatment</a>
  </aside>
</section>
{does}
<section id="fitting" class="fitting">
  <div class="fitting-intro"><p class="kicker">Your fitting</p><h2>Step by step <em>at the clinic</em></h2></div>
  <div class="rail"><div class="ribbon" aria-hidden="true"></div><ol class="tags">{fit}</ol></div>
</section>
<section class="evening">
  <div class="tx-head"><p class="kicker">How the evening goes</p><h2>From the first dance <em>to the last waltz</em></h2></div>
  <ol class="timeline" style="--n:{len(t['timeline'])}">{tl}</ol>
</section>
{results}
<section id="prices" class="prices">
  <div class="tx-head"><p class="kicker">Prices</p><h2>{E(t["name"])} at Apex</h2></div>
  <div class="price-wrap{'' if pr['invitations'] and pr['rows'] else ' solo'}">
    {table_open}<table class="price-table"><thead><tr>{''.join(f'<th>{E(h)}</th>' for h in pr["head"])}</tr></thead><tbody>{rows}</tbody></table>{table_close}
    <div class="invites">{inv}</div>
  </div>
  <p class="note center">{E(pr["note"])}</p>
</section>
{care}
<section class="faq"><div class="tx-head"><p class="kicker">Questions</p><h2>What people ask us</h2></div><div class="faq-list">{faq}</div></section>
<section class="sources"><h3>Sources</h3><ol>{src}</ol></section>
</main>
<footer class="foot"><p class="mark">Apex <span>Contour and Glow</span></p><p>Apex Hospital &amp; Clinics · LINE @apexbeauty · 080-500-0123</p><p class="fine">Individual results vary. Treatments are done by licensed doctors after a consultation.</p><p class="fine credit">Mirror frame model by <a href="https://sketchfab.com/3d-models/ornate-filigree-cherub-tabletop-mirror-202d553c0ca64935abe4ef9f1a875ebe">michaelablanchfield</a> on Sketchfab, <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>.</p></footer>
<div class="cameo" id="cameo" hidden><div class="cameo-head" id="cameo-head"></div><button type="button" class="cameo-x" aria-label="Hide the guide">&times;</button></div>
<p class="cameo-say" id="cameo-say" aria-live="polite"></p>
<script>window.CG_GUIDE = {guide_json};</script>
<script src="assets/js/site.js?v={JS_V}"></script>
</body>
</html>'''

for slug, t in TX.items():
    open(os.path.join(ROOT, f'{slug}.html'), 'w', encoding='utf-8').write(page(slug, t))
    print('built', slug)
