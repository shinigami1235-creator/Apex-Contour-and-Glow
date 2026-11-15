# Builds one page per treatment from tools/tx_content.py. Edit the content file, then run: python3 tools/build_tx.py
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from tx_content import TX
from tx_art import icon
from layout import E, ROOT, head, header, footer, divider, scripts
ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']

def page(slug, t):
    facts = ''.join(f'<div><dt>{E(a)}</dt><dd>{E(b)}</dd></div>' for a, b in t['facts'])
    how = ''.join(f'<li class="gilt sm"><span class="n">{ROMAN[i]}</span><p>{E(p)}</p></li>' for i, (k, h, p) in enumerate(t['how']))
    alts = ''.join(f'<li><b>{E(a)}</b><span>{E(b)}</span>' + (f'<a href="{c}">{E(d)}</a>' if c else '') + '</li>' for a, b, c, d in t['not_for'])
    cards = lambda items: ''.join(f'<li><b>{E(a)}</b><em>{E(u)}</em></li>' for a, u in items)
    face = [(lab, u) for lab, u, *_ in t['face']]
    body_html = f'<h3 class="grp">Body</h3><ul class="where-grid">{cards(t["body"])}</ul>' if t.get('body') else ''
    face_h = '<h3 class="grp">Face</h3>' if t.get('body') else ''
    before = ''.join(f'<li>{icon(k)}<div><b>{E(h)}</b><span>{E(p)}</span></div></li>' for k, h, p in t['care']['before'])
    after = ''.join(f'<span class="when">{E(w)}</span><ul>' + ''.join(f'<li>{icon(k)}<div><span>{E(x)}</span></div></li>' for k, x in items) + '</ul>' for w, items in t['care']['after'])
    urgent = f'<p class="urgent">{E(t["care"]["urgent"])}</p>' if t['care'].get('urgent') else ''
    visit = ''.join(f'<li class="gilt sm"><span class="n">{ROMAN[k]}</span><h3>{E(a)}</h3><p>{E(b)}</p></li>' for k, (a, b) in enumerate(t['fitting']))
    tl = ''.join(f'<li><b>{E(a)}</b><span>{E(b)}</span></li>' for a, b in t['timeline'])
    pr = t['prices']
    rows = ''.join('<tr>' + ''.join(f'<td class="num">{E(c)}</td>' if 'baht' in c else f'<td>{E(c)}</td>' for c in r) + '</tr>' for r in pr['rows'])
    heads = ''.join(f'<th>{E(h)}</th>' for h in pr['head'])
    table = f'<table class="price-table"><thead><tr>{heads}</tr></thead><tbody>{rows}</tbody></table>' if pr['rows'] else ''
    pkgs = ''.join(f'<div class="pkg gilt sm"><p class="kicker">Package</p><h3>{E(a)}</h3><p class="amt">{E(b)}</p></div>' for a, b in pr['invitations'])
    faq = ''.join(f'<details><summary>{E(q)}</summary><p>{E(a)}</p></details>' for q, a in t['faq'])
    frm = (f'<p class="from">From {E(t["price_from"])}<small>{E(t["price_note"])}</small></p>' if t.get('price_from')
           else f'<p class="from"><small>{E(t["price_note"])}</small></p>')
    R = t.get('results'); results = ''
    if R and R['mode'] == 'slider':
        lb, la = R.get('labels', ('Before', 'After'))
        thumbs = ''.join(f'<button type="button" data-i="{i}" class="{"on" if i == 1 else ""}"><img src="assets/img/{R["set"]}-{i}-after.webp" alt="{E(t["name"])} case {i}" loading="lazy"></button>' for i in range(1, R['n'] + 1)) if R['n'] > 1 else ''
        results = f'''<section class="sec" id="results"><div class="wrap res">
  <div><div class="ba-wrap gilt"><div class="ba" id="ba" data-set="{R["set"]}" style="--ar:{R.get("ar", "540/860")}">
    <img src="assets/img/{R["set"]}-1-after.webp" alt="After {E(t["name"])}" class="after">
    <img src="assets/img/{R["set"]}-1-before.webp" alt="Before {E(t["name"])}" class="before">
    <span class="line" aria-hidden="true"></span>
    <input class="range" type="range" min="0" max="100" value="50" aria-label="Move the line between before and after">
  </div></div><p class="ba-cap"><span>{E(lb)}</span><span>{E(la)}</span></p></div>
  <div><h2>Before <em>and after</em></h2>
    <p>{E(R.get("caption", t["name"] + " at Apex. Drag the line across the photo to compare."))}</p>
    <div class="thumbs" id="thumbs">{thumbs}</div>
    <div class="tools"><button type="button" class="btn" data-ba="play">Play again</button></div>
    <p class="fine">Individual results vary.</p></div>
</div></section>'''
    elif R:
        imgs = ''.join(f'<button type="button" class="gal-item" data-full="assets/img/{R["set"]}-g{i}.webp"><img src="assets/img/{R["set"]}-g{i}.webp" alt="{E(t["name"])} result {i}" loading="lazy"></button>' for i in range(1, R['n'] + 1))
        results = f'''<section class="sec" id="results"><div class="wrap">
  <div class="sec-head"><h2>Before <em>and after</em></h2>{divider()}
  <p>{E(R.get("caption", t["name"] + " at Apex. Tap a photo to see it large."))}</p></div>
  <div class="gallery">{imgs}</div><p class="fine center">Individual results vary.</p>
</div></section>'''
    src = ''.join(f'<li>{E(x)}</li>' for x in t['sources'])
    hook = ''.join(f'<p>{E(x)}</p>' for x in t['hook'])
    return head(f'{t["name"]} at Apex | Apex Contour and Glow', t['hook'][0]) + f'''
<body class="tx-page">
{header()}
<main>
<section class="tx-hero"><div class="wrap">
  <div>
    <p class="crumb"><a href="index.html#treatments">Treatments</a> · {E(t["half"])}</p>
    <h1>{E(t["name"])}</h1>
    {hook}
  </div>
  <aside class="facts gilt">
    <dl>{facts}</dl>
    {frm}
    <a class="btn solid" href="index.html#book">Book a consultation</a>
    <a class="cmp" href="compare.html?a={slug}">Compare with another treatment</a>
  </aside>
</div></section>
<section class="sec lav-2"><div class="wrap">
  <div class="sec-head"><h2>How it <em>works</em></h2>{divider()}</div>
  <ol class="how">{how}</ol>
  <div class="alt gilt sm"><h3>Not suited for</h3><ul>{alts}</ul></div>
</div></section>
<section class="sec where"><div class="wrap">
  <div class="sec-head"><h2>Treatment <em>areas</em></h2>{divider()}</div>
  {face_h}<ul class="where-grid">{cards(face)}</ul>{body_html}
  <p class="note center">{E(t["areas_note"])}</p>
</div></section>
<section class="sec lav"><div class="wrap">
  <div class="sec-head"><h2>Your <em>visit</em></h2>{divider()}</div>
  <ol class="visit">{visit}</ol>
</div></section>
<section class="sec"><div class="wrap">
  <div class="sec-head"><h2>When you <em>see results</em></h2>{divider()}</div>
  <ol class="tl" style="--n:{len(t['timeline'])}">{tl}</ol>
</div></section>
{results}
<section class="sec lav-2" id="prices"><div class="wrap">
  <div class="sec-head"><h2>{E(t["name"])} <em>prices</em></h2>{divider()}</div>
  <div class="price-wrap{'' if pkgs and table else ' solo'}">{table}<div class="pkgs">{pkgs}</div></div>
  <p class="note center">{E(pr["note"])}</p>
</div></section>
<section class="sec lav"><div class="wrap">
  <div class="sec-head"><h2>Before and after <em>your visit</em></h2>{divider()}</div>
  <div class="care"><div class="gilt sm"><h3>Before you come</h3><ul>{before}</ul></div><div class="gilt sm"><h3>After you leave</h3>{after}{urgent}</div></div>
</div></section>
<section class="sec"><div class="wrap">
  <div class="sec-head"><h2>Questions</h2>{divider()}</div>
  <div class="faq-list">{faq}</div>
  <p class="center cta"><a class="btn solid" href="index.html#book">Book a consultation</a></p>
</div></section>
<section class="sources"><div class="wrap"><h3>Sources</h3><ol>{src}</ol></div></section>
</main>
{footer()}
{scripts()}
</body>
</html>
'''

if __name__ == '__main__':
    for slug, t in TX.items():
        open(os.path.join(ROOT, f'{slug}.html'), 'w', encoding='utf-8').write(page(slug, t))
    print('built', len(TX), 'treatment pages')
