# Builds one page per treatment from tools/tx_content.py, in the Apex design (apex.css plus cg.css).
# Edit the content file, then run: python3 tools/build_tx.py
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from tx_content import TX
from tx_art import icon
from site_content import TAGS, LAYERS
from layout import E, ROOT, LINE_ID, LINE_URL, PHONE, head2, header2, footer2, scripts2, ic, CURVE

LAYER_NAME = {k: n for k, n, _ in LAYERS['layers']}


def consult_band():
    return f'''<section class="section night" id="book"><div class="wrap"><div class="consult-band rv">
  <div class="cb-copy"><p class="eyebrow on-night">Consult</p><h2 class="h-xl">Book a consultation</h2><p class="lead">Send your details on LINE or call, and Apex sets a day with you.</p></div>
  <div class="cb-acts"><a class="cb-big" href="index.html#book">{ic('message-circle')}<span><b>Book a consultation</b><small>Pick a treatment and a day</small></span>{ic('arrow-right')}</a>
    <a class="cb-row" href="{LINE_URL}">{ic('brand:line')}<span><b>Chat on LINE</b><small>{E(LINE_ID)}</small></span></a>
    <a class="cb-row" href="tel:{PHONE.replace('-', '')}">{ic('phone')}<span><b>Call the clinic</b><small>{E(PHONE)}</small></span></a></div>
</div></div></section>'''


def results(slug, t):
    R = t.get('results')
    if not R:
        return ''
    if R['mode'] == 'slider':
        lb, la = R.get('labels', ('Before', 'After'))
        src = lambda i, s: f'assets/img/{R["set"]}-{i}-{s}.webp'
        thumbs = ''.join(f'<button type="button" class="{"on" if i == 1 else ""}" data-b="{src(i, "before")}" data-a="{src(i, "after")}" data-l="{E(lb)} | {E(la)}" aria-label="Case {i}"><img src="{src(i, "after")}" alt="" loading="lazy"></button>'
                         for i in range(1, R['n'] + 1)) if R['n'] > 1 else ''
        return f'''<section class="section washed" id="results"><div class="wrap">
  <div class="shead"><div><p class="eyebrow rv">Results</p><h2 class="h-xl rv">Before and after</h2></div></div>
  <div class="cg-res rv">
    <div class="cg-ba-card"><div class="ba" id="ba" style="aspect-ratio:{R.get("ar", "540/680")}">
      <img class="after" src="{src(1, "after")}" alt="After {E(t["name"])}">
      <img class="before" src="{src(1, "before")}" alt="Before {E(t["name"])}">
      <span class="line" aria-hidden="true"></span><span class="knob" aria-hidden="true">{ic('move-horizontal')}</span>
      <span class="tag tb">{E(lb)}</span><span class="tag ta">{E(la)}</span>
      <input class="range" type="range" min="0" max="100" value="50" aria-label="Move the line between before and after">
    </div></div>
    <div class="cg-res-side">
      <p class="lead">{E(R.get("caption", t["name"] + " at Apex. Drag the line across the photo to compare."))}</p>
      <div class="thumbs" id="thumbs">{thumbs}</div>
      <div class="tools"><button type="button" class="btn btn-plum btn-sm" data-ba="play">{ic('play')}Play again</button></div>
      <p class="note">Individual results vary.</p>
    </div>
  </div>
</div></section>'''
    imgs = ''.join(f'<button type="button" class="gal-item rv" data-full="assets/img/{R["set"]}-g{i}.webp"><img src="assets/img/{R["set"]}-g{i}.webp" alt="{E(t["name"])} result {i}" loading="lazy"></button>'
                   for i in range(1, R['n'] + 1))
    return f'''<section class="section washed" id="results"><div class="wrap">
  <div class="shead"><div><p class="eyebrow rv">Results</p><h2 class="h-xl rv">Before and after</h2></div><p class="note rv">{E(R.get("caption", t["name"] + " at Apex. Tap a photo to see it large."))}</p></div>
  <div class="cg-gallery">{imgs}</div><p class="note">Individual results vary.</p>
</div></section>'''


def page(slug, t):
    sym, material, layers = TAGS[slug]
    facts = ''.join(f'<div><dt>{E(a)}</dt><dd>{E(b)}</dd></div>' for a, b in t['facts'])
    frm = (f'<p class="el-from"><span>From</span><b>{E(t["price_from"])}</b><small>{E(t["price_note"])}</small></p>' if t.get('price_from')
           else f'<p class="el-from"><small>{E(t["price_note"])}</small></p>')
    lay = ''.join(f'<a class="chip" href="index.html#layers">{E(LAYER_NAME[k])}</a>' for k in layers)
    hook = ''.join(f'<p class="{"lead " if i == 0 else ""}sh-p rv">{E(x)}</p>' for i, x in enumerate(t['hook']))
    how = ''.join(f'<li class="rv" data-d="{i * 70}"><span class="vs-n">{i + 1}</span><b>{E(h)}</b><p>{E(p)}</p></li>' for i, (k, h, p) in enumerate(t['how']))
    alts = ''.join(f'<li><b>{E(a)}</b><span>{E(b)}</span>' + (f'<a class="link-arrow" href="{c}">{E(d)} {ic("arrow-right")}</a>' if c else '') + '</li>' for a, b, c, d in t['not_for'])
    cards = lambda items: ''.join(f'<li class="rv"><b>{E(a)}</b><span>{E(u)}</span></li>' for a, u in items)
    face = [(lab, u) for lab, u, *_ in t['face']]
    areas = (f'<h3 class="cg-gh"><b>Face</b></h3>' if t.get('body') else '') + f'<ul class="cg-areas">{cards(face)}</ul>'
    if t.get('body'):
        areas += f'<h3 class="cg-gh"><b>Body</b></h3><ul class="cg-areas">{cards(t["body"])}</ul>'
    visit = ''.join(f'<li><span class="vs-n">{k + 1}</span><div><b>{E(a)}</b><p>{E(b)}</p></div></li>' for k, (a, b) in enumerate(t['fitting']))
    tl = ''.join(f'<li><b>{E(a)}</b><span>{E(b)}</span></li>' for a, b in t['timeline'])
    pr = t['prices']
    rows = ''.join('<tr>' + ''.join(f'<td class="num">{E(c)}</td>' if 'baht' in c else f'<td>{E(c)}</td>' for c in r) + '</tr>' for r in pr['rows'])
    heads = ''.join(f'<th>{E(h)}</th>' for h in pr['head'])
    table = f'<div class="cg-price rv"><table><thead><tr>{heads}</tr></thead><tbody>{rows}</tbody></table></div>' if pr['rows'] else ''
    pkgs = ''.join(f'<div class="cg-pkg rv"><p class="eyebrow">Package</p><b>{E(a)}</b><span>{E(b)}</span></div>' for a, b in pr['invitations'])
    before = ''.join(f'<li>{icon(k, "i")}<div><b>{E(h)}</b><span>{E(p)}</span></div></li>' for k, h, p in t['care']['before'])
    after = ''.join(f'<p class="cg-when">{E(w)}</p><ul>' + ''.join(f'<li>{icon(k, "i")}<div><span>{E(x)}</span></div></li>' for k, x in items) + '</ul>' for w, items in t['care']['after'])
    urgent = f'<p class="cg-urgent">{ic("heart-pulse")}<span>{E(t["care"]["urgent"])}</span></p>' if t['care'].get('urgent') else ''
    faq = ''.join(f'<details><summary>{E(q)}<span class="pm">{ic("chevron-down")}</span></summary><div class="ans"><p>{E(a)}</p></div></details>' for q, a in t['faq'])
    src = ''.join(f'<li>{E(x)}</li>' for x in t['sources'])
    return head2(f'{t["name"]} at Apex | Apex Contour and Glow', t['hook'][0]) + f'''
<body class="tx-page">
{header2()}
<main id="main">
<section class="svc-head has-curve cg-tx-head" data-tone="night">
  <div class="phead-lines" aria-hidden="true"></div>
  <div class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a>{ic('chevron-down', 'cr')}<a href="index.html#treatments">Treatments</a>{ic('chevron-down', 'cr')}<span aria-current="page">{E(t["name"])}</span></nav>
    <div class="sh-grid">
      <div class="sh-copy">
        <p class="eyebrow on-night rv">{E(t["half"])} · {E(material)}</p>
        <h1 class="display-s rv" data-d="60">{E(t["name"])}</h1>
        {hook}
        <div class="sh-acts rv" data-d="180"><a class="btn btn-light" href="#book">{ic('message-circle')}Consultation</a><a class="btn btn-ghost btn-sm" href="compare.html?a={slug}">{ic('sliders-horizontal')}Compare with another</a></div>
      </div>
      <aside class="cg-el rv" data-d="120">
        <div class="el-tile"><span class="el-no">{t["no"]:02d}</span><b class="el-sym">{E(sym)}</b><span class="el-name">{E(t["name"])}</span><span class="el-mat">{E(material)}</span></div>
        <div class="el-side"><dl class="el-facts">{facts}</dl>{frm}<div class="el-lay"><span>Works in</span>{lay}</div></div>
      </aside>
    </div>
  </div>
  <div class="sx sx-c" aria-hidden="true">{CURVE}</div>
</section>

<section class="section"><div class="wrap">
  <div class="shead"><div><p class="eyebrow rv">{E(t["name"])}</p><h2 class="h-xl rv">How it works</h2></div></div>
  <div class="cg-how-wrap">
    <ol class="cg-how">{how}</ol>
    <aside class="cg-not rv"><p class="eyebrow">Not suited for</p><ul>{alts}</ul></aside>
  </div>
</div></section>

<section class="section washed"><div class="wrap">
  <div class="shead"><div><p class="eyebrow rv">Where it goes</p><h2 class="h-xl rv">Treatment areas</h2></div><p class="note rv">{E(t["areas_note"])}</p></div>
  {areas}
</div></section>

<section class="section"><div class="wrap cg-visit">
  <div><p class="eyebrow rv">Your visit</p><h2 class="h-xl rv">On the day</h2>
    <aside class="recov cg-tl rv"><p class="eyebrow">When you see results</p><ol class="recov-line">{tl}</ol><p class="note">Individual results vary.</p></aside></div>
  <ol class="cg-steps rv">{visit}</ol>
</div></section>

{results(slug, t)}

<section class="section" id="prices"><div class="wrap">
  <div class="shead"><div><p class="eyebrow rv">Prices</p><h2 class="h-xl rv">{E(t["name"])} prices</h2></div><p class="note rv">{E(pr["note"])}</p></div>
  <div class="cg-prices{'' if pkgs and table else ' solo'}">{table}{f'<div class="cg-pkgs">{pkgs}</div>' if pkgs else ''}</div>
</div></section>

<section class="section washed"><div class="wrap">
  <div class="shead"><div><p class="eyebrow rv">Care</p><h2 class="h-xl rv">Before and after your visit</h2></div></div>
  <div class="cg-care">
    <div class="rv"><h3>Before you come</h3><ul>{before}</ul></div>
    <div class="rv" data-d="80"><h3>After you leave</h3>{after}{urgent}</div>
  </div>
</div></section>

<section class="section faq-s"><div class="wrap">
  <h2 class="h-l faq-h rv">Questions about {E(t["name"])}</h2>
  <div class="faq-grid2"><div class="faq">{faq}</div>
    <aside class="faq-cta washed rv"><span class="fc-ic">{ic('brand:line')}</span><b class="h-s">Ask on LINE</b><p>Send a photo of the area and Apex replies with what suits it.</p>
      <a class="btn btn-plum" href="{LINE_URL}">{ic('brand:line')}LINE {E(LINE_ID)}</a></aside></div>
  <div class="cg-src"><p class="eyebrow">Sources</p><ol>{src}</ol></div>
</div></section>

{consult_band()}
</main>
{footer2()}
{scripts2()}
</body>
</html>
'''


if __name__ == '__main__':
    for slug, t in TX.items():
        open(os.path.join(ROOT, f'{slug}.html'), 'w', encoding='utf-8').write(page(slug, t))
    print('built', len(TX), 'treatment pages')
