# Shared parts for every page: the head, the header, the footer, the treatment summary and the face planner areas.
import html, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from tx_content import TX
from site_content import SETTINGS
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
E = html.escape
CSS_V = 4; JS_V = 6; HEAD_V = 18
LINE_ID = SETTINGS['line_id']; PHONE = SETTINGS['phone']
LINE_URL = 'https://line.me/R/ti/p/' + LINE_ID
ORDER = ['botox', 'filler', 'harmonyca', 'radiesse', 'sculptra', 'juvelook', 'profhilo', 'skinvive', 'vitaran', 'nucleofill', 'celeb-skin', 'meso']
ASK = 'Ask your doctor'

# what each treatment is, best for, first change, how long it lasts, sessions, downtime, starting price
ROWS = [('is', 'What it is'), ('for', 'Best for'), ('first', 'First change'), ('lasts', 'Lasts'), ('sessions', 'Sessions'), ('down', 'Downtime'), ('from', 'From')]
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
 'harmonyca|sculptra': 'Sculptra builds collagen slowly while HArmonyCa shows volume straight away.',
 'filler|profhilo': 'Filler adds volume and shape in one area while Profhilo spreads through the skin to hydrate it.',
 'filler|skinvive': 'Skinvive hydrates the skin while filler fills one area and can change its shape.',
 'nucleofill|vitaran': 'Both are polynucleotide boosters. Vitaran comes from Korea and Nucleofill from Italy.',
 'filler|juvelook': 'Juvelook works on skin quality over weeks while filler fills a fold or hollow on the day.',
 'juvelook|sculptra': 'Sculptra suits hollows from lost volume while Juvelook suits fine lines and texture.',
}
def summary(k):
    return dict(name=TX[k]['name'], half=TX[k]['half'], **{r[0]: v for r, v in zip(ROWS, C[k])})

# the face planner: area key, label, vertex on the 3D head (heads.bin, female), which side its label sits
ZONES = [
 ('forehead', 'Forehead', 93, 'l'), ('temples', 'Temples', 456, 'l'), ('brows', 'Between the brows', 84, 'r'),
 ('eyes', 'Around the eyes', 1775, 'l'), ('undereyes', 'Under-eyes', 1739, 'r'), ('cheeks', 'Cheeks', 1920, 'l'),
 ('smile', 'Smile lines', 2081, 'r'), ('lips', 'Lips and mouth', 1429, 'r'), ('jaw', 'Jawline', 1550, 'l'),
 ('chin', 'Chin', 527, 'r'), ('neck', 'Neck', 2497, 'l'),
]
AREA = {
 'Forehead': 'forehead', 'Between the brows': 'brows', "Crow's feet": 'eyes', 'Around the eyes': 'eyes',
 'Under-eyes': 'undereyes', 'Temples': 'temples', 'Cheeks': 'cheeks', 'Side of the cheeks': 'cheeks', 'Mid-face': 'cheeks',
 'Cheeks and mid-face': 'cheeks', 'Hollow cheeks': 'cheeks', 'Side of the face': 'cheeks', 'Cheekbones': 'cheeks',
 'Cheeks and cheekbones': 'cheeks', 'Smile lines': 'smile', 'Lips': 'lips', 'Mouth corners': 'lips', 'Around the mouth': 'lips',
 'Chin': 'chin', 'Jaw': 'jaw', 'Jawline': 'jaw', 'Pre-jowl': 'jaw', 'Neck': 'neck', 'Neck and face lift': 'neck',
 'Whole face': 'skin', 'Whole face, for firmness': 'skin', 'Acne scars': 'skin',
}
def _codes():
    import json, re
    js = open(os.path.join(ROOT, 'assets/features/filler/codes.js')).read()
    at = json.loads(re.search(r'HEAD_AT = (\{.*?\});', js).group(1))
    vol = {k: float(v) for k, v in re.findall(r'\b(\w+): \{vol:([\d.]+)', js)}
    return at, vol

def zones():
    from areas import TOXIN, ZONE_POINTS
    at, vol = _codes()
    z = {k[0]: [] for k in ZONES}; z['skin'] = []
    for slug in ORDER:
        t = TX[slug]
        for lab, note, *_ in list(t['face']) + list(t['body']):
            a = AREA.get(lab)
            if a and not any(e['slug'] == slug for e in z[a]):
                p = C[slug][6]
                short = ' '.join(p.replace(',', '#', 1).split(',')[0].replace('#', ',').split()[:2]) if 'baht' in p else p
                z[a].append(dict(slug=slug, name=t['name'], note=(note + (' units' if slug == 'botox' and 'unit' not in note else '')) if note[:1].isdigit() else '', price=short))
    names = {k[0]: k[1] for k in ZONES}; names['skin'] = 'The whole face'
    pts, fill, info = {}, {}, {}
    for key, d in ZONE_POINTS.items():
        P, F = [], []
        for code in d['codes']:
            groups = at[code]; n = sum(len(g) for g in groups)
            for g in groups:
                for v in g:
                    P.append([v, 'f']); F.append([v, round(max(vol.get(code, .2), .1) * len(g) / n * 2, 2)])
        if d.get('toxin'):
            for g in TOXIN[d['toxin'][0]]:
                for v in g: P.append([v, 't'])
        if d.get('extra'):
            for g in TOXIN[d['extra']]:
                for v in g: P.append([v, 'f'])
        pts[key] = P; fill[key] = F
        cs = d['codes']; fam = {}
        for c in cs: fam.setdefault(c.rstrip('0123456789'), []).append(c)
        label = ', '.join(f'{g[0]} to {g[-1]}' if len(g) > 2 else ' and '.join(g) for g in fam.values())
        info[key] = dict(codes=('MD Codes ' + label) if cs and key != 'skin' else '',
                         toxin=d['toxin'][1] if d.get('toxin') else '',
                         bap='Five Bio Aesthetic Points a side' if key == 'skin' else '')
    return dict(zones=z, names=names, verts={k: v for k, _, v, _ in ZONES}, pts=pts, fill=fill, info=info)

def head(title, desc):
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{E(title)}</title>
<meta name="description" content="{E(desc)}">
<meta name="robots" content="noindex">
<meta name="theme-color" content="#4a2563">
<link rel="preload" href="assets/fonts/bodoni-moda-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/jost-latin-300-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/css/lux.css?v={CSS_V}">
</head>'''

def header(home=False):
    p = '' if home else 'index.html'
    return f'''<header class="topbar"><div class="wrap">
  <a class="mark" href="{p or '#top'}">Apex <span>Contour and Glow</span></a>
  <nav aria-label="Main"><a href="{p}#planner">Face planner</a><a href="{p}#treatments">Treatments</a><a href="{p}#results">Results</a><a href="compare.html">Compare</a><a href="{p}#book">Contact</a></nav>
  <a class="btn lt" href="{p}#book">Book</a>
</div></header>'''

def footer():
    return f'''<footer class="foot">
  <img class="orn-div" src="assets/img/orn/divider.svg" alt="">
  <p class="mark">Apex <span>Contour and Glow</span></p>
  <p>{E(SETTINGS['clinic'])}</p>
  <p>LINE <a href="{LINE_URL}">{LINE_ID}</a> · <a href="tel:{PHONE.replace('-', '')}">{PHONE}</a></p>{f'''
  <p class="fine">{E(SETTINGS['permit'])}</p>''' if SETTINGS['permit'] else ''}
  <p class="fine">{E(SETTINGS['footer_note'])}</p>
</footer>'''

def divider():
    return '<img class="orn-div" src="assets/img/orn/divider.svg" alt="">'

def scripts():
    return f'<script src="assets/js/lux.js?v={JS_V}"></script>'


def cols(n, opts=(4, 3, 5)):
    """How many per row so the rows come out full, or as close as they can (the short row is centred)."""
    for c in opts:
        if n % c == 0: return min(c, n)
    return max(opts, key=lambda c: (n % c) / c) if n > 2 else n
