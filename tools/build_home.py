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
      <p class="kicker">Apex Hospital &amp; Clinics, Bangkok</p>
      <h1>Injectables <em>at Apex</em></h1>
      <p class="sub">Tap an area of the face to see its treatments and prices.</p>
    </div>
    <div class="planner" data-panel="map">
      <canvas class="leads" aria-hidden="true"></canvas>
      <div class="zcol l">{col("l")}</div>
      <div class="mirror"><div class="glass"><div class="head" id="planner-head"></div></div></div>
      <div class="zcol r">{col("r")}</div>
    </div>
    <div class="hctl">
      <div class="seg" role="group" aria-label="Face"><button type="button" data-sex="female" aria-pressed="true">Women</button><button type="button" data-sex="male" aria-pressed="false">Men</button></div>
      <div class="seg" role="group" aria-label="Filler"><button type="button" data-ba="before" aria-pressed="false">Before</button><button type="button" data-ba="after" aria-pressed="true">After</button></div>
    </div>
    <div class="picks" data-panel="map" aria-live="polite">
      <p class="empty">Tap an area. Drag the face to turn it.</p>
      <div class="list" hidden><p class="area"></p><ul class="basis"></ul><ul class="txc"></ul></div>
      <button type="button" class="fz fz-skin" data-z="skin">The whole face</button>
      <p class="refs">Filler areas follow the MD Codes (<a href="https://doi.org/10.1007/s00266-020-01762-7">de Maio, Aesthetic Plastic Surgery 2021</a>). Botox points follow published injection guides (<a href="https://doi.org/10.1097/01.PRS.0000144795.76040.D3">Carruthers, Plastic and Reconstructive Surgery 2004</a>; <a href="https://doi.org/10.3390/toxins15020082">Toxins 2023</a>; <a href="https://doi.org/10.5115/acb.22.258">Anatomy and Cell Biology 2023</a>). Simulation only. Your doctor decides the points and amounts.</p>
    </div>
  </div>
</section>

<section class="sec" id="treatments">
  <div class="wrap">
    <div class="sec-head"><h2>Treatments <em>and prices</em></h2>{divider()}
      <p>Starting prices. Your doctor confirms the amount at the consultation.</p></div>
    <div class="menu-card gilt"><div class="menu">{menu}</div></div>
    <p class="menu-foot"><a class="btn" href="compare.html">Compare two treatments</a></p>
  </div>
</section>

<section class="sec lav" id="visit">
  <div class="wrap">
    <div class="sec-head"><h2>Your <em>visit</em></h2>{divider()}</div>
    <ol class="steps">{steps}</ol>
  </div>
</section>

<section class="sec" id="results">
  <div class="wrap res">
    <div>
      <div class="ba-stage"><div class="mirror"><div class="glass ba" id="ba" data-set="profhilo">
        <img src="assets/img/profhilo-1-after.webp" alt="After Profhilo, one month" class="after">
        <img src="assets/img/profhilo-1-before.webp" alt="Before Profhilo" class="before">
        <span class="sheen" aria-hidden="true"></span><span class="line" aria-hidden="true"></span>
        <input class="range" type="range" min="0" max="100" value="50" aria-label="Move the line between before and after">
      </div></div>
      <div class="plaques"><span class="pl-b">Before</span><span class="pl-a">After 1 month</span></div></div>
    </div>
    <div>
      <h2>Before <em>and after</em></h2>
      <p>Profhilo at Apex, one month after the first session. Drag the line to compare.</p>
      <div class="thumbs" id="thumbs">{thumbs}</div>
      <dl class="stats"><div><dt>Sessions</dt><dd>Two, a month apart</dd></div><div><dt>Lasts</dt><dd>6 to 12 months</dd></div><div><dt>From</dt><dd>25,000 baht</dd></div></dl>
      <div class="tools"><button type="button" class="btn" data-ba="play">Play again</button><a class="btn" href="profhilo.html">Read about Profhilo</a></div>
      <p class="fine">Individual results vary.</p>
    </div>
  </div>
</section>

<section class="sec plum" id="compare">
  <div class="wrap">
    <div class="sec-head"><h2>Compare <em>two treatments</em></h2><img class="orn-div" src="assets/img/orn/divider.svg" alt=""></div>
    <form class="pair" action="compare.html">
      <label>First{pick("a", "botox")}</label><span class="and">&amp;</span><label>Second{pick("b", "filler")}</label>
      <button class="btn lt" type="submit">Compare</button>
    </form>
  </div>
</section>

<section class="sec lav" id="book">
  <div class="wrap book">
    <div>
      <h2>Book a <em>consultation</em></h2>
      <p>Send your details on LINE or call, and Apex sets a day with you.</p>
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
