# Builds compare.html ("Choose your partner"). Facts come from the Apex pages via tools/tx_content.py and the fact sheets.
# Run: python3 tools/build_compare.py
import html, json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from tx_content import TX
from build_tx import CSS_V, JS_V
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
E = html.escape
ROWS = [('is', 'What it is'), ('for', 'Best for'), ('first', 'First change'), ('lasts', 'Lasts'), ('sessions', 'Sessions'), ('down', 'Downtime'), ('from', 'From')]
ASK = 'Ask your doctor'
C = {
 'botox': ('Botulinum toxin that relaxes a muscle', 'Frown lines, crow\'s feet and a square jaw', '1 to 2 days, clearer at 1 to 2 weeks', 'About 3 to 4 months', 'One, repeated after at least 90 days', 'None', '3,500 baht'),
 'filler': ('Hyaluronic acid gel that fills and shapes', 'Hollows, deep folds, lips, chin and jaw', 'Straight away, settled at about 2 weeks', ASK, 'Usually one', 'None', '9,900 baht'),
 'harmonyca': ('Hyaluronic acid and calcium hydroxylapatite in one syringe', 'Cheeks, mid-face and jawline that have hollowed or sagged', 'Volume straight away, collagen from about day 60', 'About 12 months', 'Usually one, then a follow-up', 'Skip hard exercise for 24 to 48 hours', '36,000 baht for two syringes'),
 'radiesse': ('Calcium hydroxylapatite in a soft gel', 'Hollow temples and cheeks, a soft jawline and loose skin', 'A little fuller straight away, firmer at 1 to 3 months', ASK, ASK, 'Swelling or a bruise for 1 to 2 days', '15,000 baht, typical in Thailand'),
 'sculptra': ('Poly-L-lactic acid that builds your own collagen', 'Cheeks that have started to hollow and skin losing firmness', 'About 1 month, clearest at 2 to 3 months', 'About 2 years after the plan', 'Usually 2 to 3, 3 to 4 weeks apart', 'Swelling for 3 to 7 days', '25,000 baht a vial'),
 'juvelook': ('PDLLA with hyaluronic acid', 'Fine lines, texture, pores and some acne scars', 'Plumper early, collagen at 4 to 8 weeks', 'Top-up every 6 to 12 months', 'Usually 2 to 3', 'Bumps for 1 to 3 days', '15,000 baht, typical in Thailand'),
 'profhilo': ('Hyaluronic acid that spreads through the skin', 'Dry, dull or sagging skin and early lines', 'Smoother soon after, clearest at 1 to 2 months', 'About 6 to 12 months', 'Two, a month apart', 'None, redness fades in 1 to 2 days', '25,000 baht'),
 'skinvive': ('Hyaluronic acid gel that hydrates the skin', 'Dry or dull skin, early crow\'s feet and rough texture', ASK, 'About 6 to 9 months', ASK, 'None, marks fade in 1 to 2 days', '12,900 baht for a first trial'),
 'vitaran': ('Polynucleotide booster made from trout DNA', 'Dry or rough skin, acne marks and thin skin under the eyes', 'Hydrated in 3 to 7 days, smoother in 2 to 4 weeks', 'About 6 to 12 months with repeats', '2 to 4, about 4 weeks apart', 'Bumps for 1 to 3 days', '5,900 baht'),
 'nucleofill': ('PDRN polynucleotide gel made in Italy', 'Skin texture and moisture, under-eyes, neck and hands', ASK, 'About 6 to 12 months', '2 to 4, every 2 or 4 weeks', 'Bruising or swelling for 1 to 2 days', 'Ask us'),
 'celeb-skin': ('Apex skin program built on facial meso', 'Skin you want hydrated, smooth and bright', 'Your doctor plans it', 'Your doctor plans it', 'Your doctor plans it', 'Small bumps that settle', 'Ask us'),
 'meso': ('Hyaluronic acid, vitamins and nutrients placed in the skin', 'Dry, dull, rough or tired skin', 'Some people feel hydrated after the first visit', 'About 3 months for hydration formulas', 'Often 3, 4 weeks apart', 'None, small bumps settle', '1,990 baht'),
}
PAIRS = {
 'botox|filler': 'Botox softens lines from movement while filler fills hollows and folds, so the two are often booked together.',
 'celeb-skin|vitaran': 'Apex has packages that pair Vitaran with Celeb Skin.',
 'celeb-skin|meso': 'Celeb Skin is built on facial meso and adds other brightening treatments.',
 'harmonyca|radiesse': 'Both contain calcium hydroxylapatite. HArmonyCa adds hyaluronic acid for volume on the day.',
 'harmonyca|sculptra': 'Sculptra builds collagen slowly, and HArmonyCa shows volume straight away.',
 'filler|profhilo': 'Filler adds volume and shape in one area, and Profhilo spreads through the skin to hydrate it.',
 'filler|skinvive': 'Skinvive hydrates the skin while filler fills one area and can change its shape.',
 'nucleofill|vitaran': 'Both are polynucleotide boosters. Vitaran comes from Korea and Nucleofill from Italy.',
 'filler|juvelook': 'Juvelook works on skin quality over weeks, and filler fills a fold or hollow on the day.',
 'juvelook|sculptra': 'Sculptra suits hollows from lost volume, and Juvelook suits fine lines and texture.',
}
data = {k: dict(name=TX[k]['name'], half=TX[k]['half'], **{r[0]: v for r, v in zip(ROWS, C[k])}) for k in TX}
def chips(side):
    out = []
    for half in ('Contour', 'Glow'):
        out.append(f'<p class="chip-half">{half}</p><div class="pchips">' + ''.join(
            f'<button type="button" class="chip {half.lower()}" data-side="{side}" data-k="{k}">{E(TX[k]["name"])}</button>' for k in TX if TX[k]['half'] == half) + '</div>')
    return ''.join(out)
rows = ''.join(f'<div class="cmp-row"><p class="cmp-lab">{E(lab)}</p><p class="cmp-a" data-f="{key}"></p><p class="cmp-b" data-f="{key}"></p></div>' for key, lab in ROWS)
body = f'''<section class="partner">
  <div class="tx-head"><p class="kicker">Choose your partner</p><h2>Two dances, <em>side by side</em></h2>
  <p class="sub">Pick one treatment on each side to see how they compare. Your doctor makes the final choice at your consultation.</p></div>
  <div class="pickers">
    <div class="picker"><p class="pick-lab">First partner</p>{chips("a")}</div>
    <div class="amp" aria-hidden="true">&amp;</div>
    <div class="picker"><p class="pick-lab">Second partner</p>{chips("b")}</div>
  </div>
  <div class="cmp" id="cmp">
    <div class="cmp-head"><span></span><h3 class="cmp-a" data-f="name"></h3><h3 class="cmp-b" data-f="name"></h3></div>
    {rows}
    <div class="cmp-row cmp-links"><span></span><p><a class="btn-line cmp-a" data-f="link"></a></p><p><a class="btn-line cmp-b" data-f="link"></a></p></div>
  </div>
  <p class="pair-note" id="pair-note" hidden></p>
  <p class="note center">Prices are starting prices and promotions change, so check the latest on LINE @apexbeauty.</p>
  <p class="cta"><a class="btn-gold" href="index.html#rsvp">Reserve a consultation</a></p>
</section>'''
script = '''<script>
(() => {
  const D = %s, P = %s, ASK = %s;
  const pick = { a: 'botox', b: 'filler' };
  const q = new URLSearchParams(location.search);
  if (D[q.get('a')]) pick.a = q.get('a'); if (D[q.get('b')]) pick.b = q.get('b');
  const draw = () => {
    for (const s of ['a', 'b']) {
      const t = D[pick[s]];
      document.querySelectorAll('.cmp-' + s).forEach(el => {
        const f = el.dataset.f;
        if (f === 'link') { el.href = pick[s] + '.html'; el.textContent = 'Read the ' + t.name + ' page'; }
        else { el.textContent = t[f]; el.classList.toggle('ask', t[f] === ASK || t[f] === 'Ask us'); }
      });
      document.querySelectorAll('.chip[data-side="' + s + '"]').forEach(b => b.setAttribute('aria-pressed', b.dataset.k === pick[s]));
    }
    const note = document.getElementById('pair-note');
    const key = [pick.a, pick.b].sort().join('|');
    note.hidden = !P[key]; note.textContent = P[key] || '';
    history.replaceState(null, '', '?a=' + pick.a + '&b=' + pick.b);
  };
  document.querySelectorAll('.chip').forEach(b => b.addEventListener('click', () => { pick[b.dataset.side] = b.dataset.k; draw(); }));
  draw();
})();
</script>''' % (json.dumps(data), json.dumps(PAIRS), json.dumps(ASK))
page = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Choose your partner | Apex Contour and Glow</title>
<meta name="description" content="Compare two injectable treatments at Apex side by side: what each one is, what it suits, when it shows, how long it lasts and what it costs.">
<meta name="robots" content="noindex">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..700;1,6..96,400&family=Jost:wght@300;400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/site.css?v={CSS_V}">
</head>
<body class="tx-page compare-page">
<button class="sound" id="sound" aria-pressed="false" aria-label="Music"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/></svg><span>Music</span></button>
<header class="topbar">
  <a class="mark" href="index.html">Apex <span>Contour and Glow</span></a>
  <nav><a href="index.html#card">Dance card</a><a href="index.html#fitting">Fitting room</a><a href="compare.html" aria-current="page">Compare</a><a href="index.html#rsvp" class="rsvp-link">RSVP</a></nav>
</header>
<main>
{body}
</main>
<footer class="foot"><p class="mark">Apex <span>Contour and Glow</span></p><p>Apex Hospital &amp; Clinics · LINE @apexbeauty · 080-500-0123</p><p class="fine">Individual results vary. Treatments are done by licensed doctors after a consultation.</p><p class="fine credit">Mirror frame model by <a href="https://sketchfab.com/3d-models/ornate-filigree-cherub-tabletop-mirror-202d553c0ca64935abe4ef9f1a875ebe">michaelablanchfield</a> on Sketchfab, <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>.</p></footer>
<script src="assets/js/site.js?v={JS_V}"></script>
{script}
</body>
</html>
'''
open(os.path.join(ROOT, 'compare.html'), 'w').write(page)
print('built compare')
