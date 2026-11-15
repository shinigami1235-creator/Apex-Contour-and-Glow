# Builds index.html. Treatment names, prices and areas come from tools/tx_content.py and tools/layout.py.
# Run: python3 tools/build_home.py
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from tx_content import TX
from layout import E, ROOT, ORDER, C, ZONES, LINE_ID, LINE_URL, PHONE, zones, head, header, footer, divider, scripts

def item(k):
    t = TX[k]; price = C[k][6]
    p = ' '.join(price.replace(',', '#', 1).split(',')[0].replace('#', ',').split()[:2]) if 'baht' in price else price
    if 'typical' in price: p = 'About ' + p
    lasts = C[k][3]
    w = E(C[k][1]) + (f' · lasts <i>{E(lasts[0].lower() + lasts[1:])}</i>' if lasts not in ('Ask your doctor', 'Your doctor plans it') else '')
    return f'<li><a href="{k}.html"><b>{E(t["name"])}</b><em class="p">{E(p)}</em><span class="w">{w}</span></a></li>'

menu = ''.join(f'<div><h3>{half} <span>{sub}</span></h3><ul>' + ''.join(item(k) for k in ORDER if TX[k]['half'] == half) + '</ul></div>'
               for half, sub in (('Contour', 'shape and lift'), ('Glow', 'skin quality')))
col = lambda side: ''.join(f'<button type="button" class="fz" data-z="{k}">{E(lab)}</button>' for k, lab, v, sd in ZONES if sd == side)
STEPS = [('Consultation', 'Your doctor looks at your face, asks what bothers you and picks the treatment and the amount.'),
         ('Numbing cream', 'The cream goes on first and sits for a while before your doctor starts.'),
         ('Treatment', 'A fine needle at each point, a few seconds each. Your doctor tells you how many points before starting.'),
         ('Ice and rest', 'A little swelling or a small bruise can show for a few days.'),
         ('Follow-up', 'Your doctor checks the result with you and tells you when to come back.')]
ROMAN = ['I', 'II', 'III', 'IV', 'V']
steps = ''.join(f'<li class="gilt sm"><span class="n">{ROMAN[i]}</span><h3>{E(a)}</h3><p>{E(b)}</p></li>' for i, (a, b) in enumerate(STEPS))
def pick(name, sel):
    return f'<select name="{name}">' + ''.join(f'<option value="{k}"{" selected" if k == sel else ""}>{E(TX[k]["name"])}</option>' for k in ORDER) + '</select>'
book_opts = '<option>Not sure yet</option>' + ''.join(f'<option>{E(TX[k]["name"])}</option>' for k in ORDER)
R = TX['profhilo']['results']
thumbs = ''.join(f'<button type="button" data-i="{i}" class="{"on" if i == 1 else ""}"><img src="assets/img/profhilo-{i}-after.webp" alt="Profhilo case {i}" loading="lazy"></button>' for i in range(1, R['n'] + 1))

html = head('Apex Contour and Glow | Injectables at Apex Hospital & Clinics',
            'Botox, filler, HArmonyCa, Radiesse, Sculptra, Juvelook, Profhilo, Skinvive, Vitaran, Nucleofill, Celeb Skin and meso at Apex Hospital & Clinics, Bangkok, with prices.') + f'''
<body class="home">
{header(True)}
<main id="top">
<section class="hero" id="planner">
  <div class="wrap">
    <div class="hero-head">
      <p class="kicker">Injectables at Apex Hospital &amp; Clinics, Bangkok</p>
      <h1>Twelve injectables, <em>planned around your face.</em></h1>
      <p class="sub">Tap an area of the face to see which treatments work there, what each costs and how long it lasts.</p>
    </div>
    <div class="tabs" role="tablist">
      <button type="button" role="tab" aria-selected="true" data-tab="map">Face planner</button>
      <button type="button" role="tab" aria-selected="false" data-tab="sim">Filler on a 3D head</button>
    </div>
    <div class="planner" data-panel="map">
      <canvas class="leads" aria-hidden="true"></canvas>
      <div class="zcol l">{col("l")}</div>
      <div class="oval"><div class="glass"><div class="head" id="planner-head"></div></div></div>
      <div class="zcol r">{col("r")}</div>
    </div>
    <div class="picks" data-panel="map" aria-live="polite">
      <p class="empty">Which area bothers you most? Tap it beside the face, or drag the face to turn it.</p>
      <div class="list" hidden><h3></h3><ul></ul></div>
      <button type="button" class="fz fz-skin" data-z="skin">The whole face</button>
    </div>
    <div class="sim" data-panel="sim" hidden><div id="filler-sim"></div>
      <p class="note center">Simulation only. Your doctor decides the amount at your consultation.</p></div>
  </div>
</section>

<section class="sec" id="treatments">
  <div class="wrap">
    <div class="sec-head"><p class="kicker">Treatments and prices</p><h2>Twelve treatments <em>at Apex</em></h2>{divider()}
      <p>Starting prices at Apex. Your doctor confirms the plan and the amount at your consultation.</p></div>
    <div class="menu-card gilt"><div class="menu">{menu}</div></div>
    <p class="menu-foot"><a class="btn" href="compare.html">Compare two treatments</a></p>
  </div>
</section>

<section class="sec lav" id="visit">
  <div class="wrap">
    <div class="sec-head"><p class="kicker">Your visit</p><h2>Five steps <em>at the clinic</em></h2>{divider()}</div>
    <ol class="steps">{steps}</ol>
  </div>
</section>

<section class="sec" id="results">
  <div class="wrap res">
    <div>
      <div class="ba-wrap gilt"><div class="ba" id="ba" data-set="profhilo" style="--ar:{R["ar"]}">
        <img src="assets/img/profhilo-1-after.webp" alt="After Profhilo, one month" class="after">
        <img src="assets/img/profhilo-1-before.webp" alt="Before Profhilo" class="before">
        <span class="line" aria-hidden="true"></span>
        <input class="range" type="range" min="0" max="100" value="50" aria-label="Move the line between before and after">
      </div></div>
      <p class="ba-cap"><span>Before</span><span>After 1 month</span></p>
    </div>
    <div>
      <p class="kicker">Apex results</p>
      <h2>Profhilo, one month <em>after the first session</em></h2>
      <p>Drag the line across the photo to compare. Pick another case below.</p>
      <div class="thumbs" id="thumbs">{thumbs}</div>
      <dl class="stats"><div><dt>Sessions</dt><dd>Two, a month apart</dd></div><div><dt>Lasts</dt><dd>6 to 12 months</dd></div><div><dt>From</dt><dd>25,000 baht</dd></div></dl>
      <div class="tools"><button type="button" class="btn" data-ba="play">Play again</button><a class="btn" href="profhilo.html">Read about Profhilo</a></div>
      <p class="fine">Individual results vary.</p>
    </div>
  </div>
</section>

<section class="sec plum" id="compare">
  <div class="wrap">
    <div class="sec-head"><p class="kicker">Compare</p><h2>Two treatments, <em>side by side</em></h2><img class="orn-div" src="assets/img/orn/divider.svg" alt="">
      <p>Pick one on each side to see what each does, how long it lasts and what it costs.</p></div>
    <form class="pair" action="compare.html">
      <label>First{pick("a", "botox")}</label><span class="and">&amp;</span><label>Second{pick("b", "filler")}</label>
      <button class="btn lt" type="submit">Compare</button>
    </form>
  </div>
</section>

<section class="sec lav" id="book">
  <div class="wrap book">
    <div>
      <p class="kicker">Book a consultation</p>
      <h2>Talk to an Apex doctor <em>first</em></h2>
      <p>Send your name and the treatment you have in mind, and Apex replies on LINE to set a day.</p>
      <ul class="ways"><li><b>LINE</b><a href="{LINE_URL}">{LINE_ID}</a></li><li><b>Phone</b><a href="tel:{PHONE.replace("-", "")}">{PHONE}</a></li></ul>
    </div>
    <form class="form gilt" id="book-form">
      <label>Your name<input name="name" autocomplete="name" placeholder="Ploy Srisuk" required></label>
      <label>Phone<input name="phone" type="tel" autocomplete="tel" placeholder="081 234 5678"></label>
      <label>Treatment<select name="treatment">{book_opts}</select></label>
      <label>Preferred day<input name="day" type="date"></label>
      <button class="btn solid" type="submit"><span class="line-dot"></span>Send on LINE</button>
      <p class="fine">LINE opens with your message filled in. Press send there.</p>
    </form>
  </div>
</section>
</main>
{footer()}
<script>window.CG_ZONES = {json.dumps(zones())}; window.CG_LINE = {json.dumps(LINE_ID)};</script>
{scripts()}
</body>
</html>
'''
open(os.path.join(ROOT, 'index.html'), 'w').write(html)
print('built index.html')
