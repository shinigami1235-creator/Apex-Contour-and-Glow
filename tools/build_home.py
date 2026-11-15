# Builds index.html. Treatment names, prices and areas come from tools/tx_content.py and tools/layout.py.
# Run: python3 tools/build_home.py
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from tx_content import TX
from site_content import HOME
H = HOME
from layout import E, ROOT, ORDER, C, ZONES, LINE_ID, LINE_URL, PHONE, zones, head, header, footer, divider, scripts

def item(k):
    t = TX[k]; price = C[k][6]
    p = ' '.join(price.replace(',', '#', 1).split(',')[0].replace('#', ',').split()[:2]) if 'baht' in price else price
    if 'typical' in price: p = 'About ' + p
    lasts = C[k][3]
    w = E(C[k][1]) + (f' · lasts <i>{E(lasts[0].lower() + lasts[1:])}</i>' if lasts not in ('Ask your doctor', 'Your doctor plans it') else '')
    return f'<li><a href="{k}.html"><b>{E(t["name"])}</b><em class="p">{E(p)}</em><span class="w">{w}</span></a></li>'

menu = ''.join(f'<div><h3>{half} <span>{sub}</span></h3><ul>' + ''.join(item(k) for k in ORDER if TX[k]['half'] == half) + '</ul></div>'
               for half, sub in H['treatments']['halves'])
col = lambda side: ''.join(f'<button type="button" class="fz" data-z="{k}">{E(lab)}</button>' for k, lab, v, sd in ZONES if sd == side)
STEPS = H['visit']['steps']
ROMAN = ['I', 'II', 'III', 'IV', 'V']
SICON = {
 'talk': '<path d="M4 5h16v10H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
 'tube': '<path d="M9 3h6v3H9z"/><path d="M8 6h8l-1 14H9z"/><path d="M10 11h4"/>',
 'needle': '<path d="M14 4l6 6M17 7L8 16l-2 0 0-2 9-9M6 18l-2 2M11 9l2 2M9 11l2 2"/>',
 'ice': '<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9"/><path d="M10 4.5l2 1.5 2-1.5M10 19.5l2-1.5 2 1.5"/>',
 'cal': '<rect x="4" y="5" width="16" height="15" rx="1"/><path d="M4 9h16M8 3v4M16 3v4M9 14l2 2 4-4"/>',
}
steps = ''.join(f'<li class="gilt sm"><span class="med"><svg viewBox="0 0 24 24" aria-hidden="true">{SICON[ic]}</svg></span><span class="n">{ROMAN[i]}</span>'
                f'<h3>{E(a)}</h3><p>{E(b)}</p><span class="time">{E(t)}</span></li>' for i, (ic, a, b, t) in enumerate(STEPS))
def pick(name, sel):
    return f'<select name="{name}">' + ''.join(f'<option value="{k}"{" selected" if k == sel else ""}>{E(TX[k]["name"])}</option>' for k in ORDER) + '</select>'
book_opts = '<option>Not sure yet</option>' + ''.join(f'<option>{E(TX[k]["name"])}</option>' for k in ORDER)
RS = H['results']['set']; R = TX[RS]['results']
thumbs = ''.join(f'<button type="button" data-i="{i}" class="{"on" if i == 1 else ""}"><img src="assets/img/{RS}-{i}-after.webp" alt="{E(TX[RS]['name'])} case {i}" loading="lazy"></button>' for i in range(1, R['n'] + 1))

h2 = lambda d: f'{E(d["h2"])} <em>{E(d["h2_em"])}</em>'
stats = ''.join(f'<div><dt>{E(a)}</dt><dd>{E(b)}</dd></div>' for a, b in H['results']['stats'])
html = head(H['seo_title'], H['seo_desc']) + f'''
<body class="home">
{header(True)}
<main id="top">
<section class="hero" id="planner">
  <div class="wrap">
    <div class="hero-head">
      <p class="kicker">{E(H['hero']['kicker'])}</p>
      <h1>{E(H['hero']['h1'])} <em>{E(H['hero']['h1_em'])}</em></h1>
      <p class="sub">{E(H['hero']['sub'])}</p>
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
      <p class="empty">{E(H['hero']['empty'])}</p>
      <div class="list" hidden><p class="area"></p><ul class="basis"></ul><ul class="txc"></ul></div>
      <button type="button" class="fz fz-skin" data-z="skin">{E(H['hero']['whole'])}</button>
      <p class="refs">Filler areas follow the MD Codes (<a href="https://doi.org/10.1007/s00266-020-01762-7">de Maio, Aesthetic Plastic Surgery 2021</a>). Botox points follow published injection guides (<a href="https://doi.org/10.1097/01.PRS.0000144795.76040.D3">Carruthers, Plastic and Reconstructive Surgery 2004</a>; <a href="https://doi.org/10.3390/toxins15020082">Toxins 2023</a>; <a href="https://doi.org/10.5115/acb.22.258">Anatomy and Cell Biology 2023</a>). Simulation only. Your doctor decides the points and amounts.</p>
    </div>
  </div>
</section>

<section class="sec" id="treatments">
  <div class="wrap">
    <div class="sec-head"><h2>{h2(H['treatments'])}</h2>{divider()}
      <p>{E(H['treatments']['p'])}</p></div>
    <div class="menu-card gilt"><div class="menu">{menu}</div></div>
    <p class="menu-foot"><a class="btn" href="compare.html">Compare two treatments</a></p>
  </div>
</section>

<section class="sec lav" id="visit">
  <div class="wrap">
    <div class="sec-head"><h2>{h2(H['visit'])}</h2>{divider()}</div>
    <ol class="steps">{steps}</ol>
    <p class="steps-foot">{E(H['visit']['foot'])}</p>
  </div>
</section>

<section class="sec lav-2" id="results">
  <div class="wrap res gilt">
    <div>
      <div class="ba-stage"><div class="mirror"><div class="glass ba" id="ba" data-set="{RS}">
        <img src="assets/img/{RS}-1-after.webp" alt="After {E(TX[RS]['name'])}, {E(R['labels'][1][6:].lower())}" class="after">
        <img src="assets/img/{RS}-1-before.webp" alt="Before {E(TX[RS]['name'])}" class="before">
        <span class="sheen" aria-hidden="true"></span><span class="line" aria-hidden="true"></span>
        <input class="range" type="range" min="0" max="100" value="50" aria-label="Move the line between before and after">
      </div></div>
      <div class="plaques"><span class="pl-b">{E(R['labels'][0])}</span><span class="pl-a">{E(R['labels'][1])}</span></div></div>
    </div>
    <div>
      <h2>{h2(H['results'])}</h2>
      <p>{E(H['results']['p'])}</p>
      <div class="thumbs" id="thumbs" style="--tc:{R['n']}">{thumbs}</div>
      <dl class="stats">{stats}</dl>
      <div class="tools"><button type="button" class="btn" data-ba="play">Play again</button><a class="btn" href="{RS}.html">Read about {E(TX[RS]['name'])}</a></div>
      <p class="fine">{E(H['results']['fine'])}</p>
    </div>
  </div>
</section>

<section class="sec plum" id="compare">
  <div class="wrap">
    <div class="sec-head"><h2>{h2(H['compare'])}</h2><img class="orn-div" src="assets/img/orn/divider.svg" alt=""></div>
    <form class="pair" action="compare.html">
      <label>First{pick("a", H['compare']['a'])}</label><span class="and">&amp;</span><label>Second{pick("b", H['compare']['b'])}</label>
      <button class="btn lt" type="submit">Compare</button>
    </form>
  </div>
</section>

<section class="sec lav" id="book">
  <div class="wrap book">
    <div>
      <h2>{h2(H['book'])}</h2>
      <p>{E(H['book']['p'])}</p>
      <ul class="ways"><li><b>LINE</b><a href="{LINE_URL}">{LINE_ID}</a></li><li><b>Phone</b><a href="tel:{PHONE.replace("-", "")}">{PHONE}</a></li></ul>
    </div>
    <form class="form gilt" id="book-form">
      <label>Your name<input name="name" autocomplete="name" placeholder="Ploy Srisuk" required></label>
      <label>Phone<input name="phone" type="tel" autocomplete="tel" placeholder="081 234 5678"></label>
      <label>Treatment<select name="treatment">{book_opts}</select></label>
      <label>Preferred day<input name="day" type="date"></label>
      <button class="btn solid" type="submit"><span class="line-dot"></span>Send on LINE</button>
      <p class="fine">{E(H['book']['fine'])}</p>
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
