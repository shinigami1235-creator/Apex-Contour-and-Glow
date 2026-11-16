# Shared parts for every page: the head, the header, the footer, the treatment summary and the face planner areas.
import html, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from tx_content import TX
from site_content import SETTINGS, HOME
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
E = html.escape
HEAD_V = 18
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

def cols(n, opts=(4, 3, 5)):
    """How many per row so the rows come out full, or as close as they can (the short row is centred)."""
    for c in opts:
        if n % c == 0: return min(c, n)
    return max(opts, key=lambda c: (n % c) / c) if n > 2 else n

def inl(s):
    """Escapes text, then turns **bold** and [text](link) into markup (the privacy policy's inline formatting)."""
    import re
    h = E(s)
    h = re.sub(r'\[([^\]\n]+)\]\(((?:https?://|mailto:|tel:|/|#)[^\s()]*)\)', r'<a href="\2">\1</a>', h)
    return re.sub(r'\*\*([^*\n]+?)\*\*', r'<strong>\1</strong>', h)


# ---------------------------------------------------------------------------------------------------------------
# The Apex design (16 Nov 2026): the same base styles, header, curves and footer as apexsurgeryhospital.com
# (assets/css/apex.css) with Contour and Glow's own parts in assets/css/cg.css and assets/js/cg.js.
import json as _json
_ICONS = _json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'icons.json')))
CG_CSS_V = 3; CG_JS_V = 4
CURVE = ('<svg viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true" focusable="false">'
         '<path class="sx-fill" d="M0 90V54C190 20 400 6 640 30S1090 88 1440 32V90Z"/><path class="sx-stitch" d="M0 46C190 12 400 -2 640 22S1090 80 1440 24"/></svg>')

def ic(name, cls=''):
    """An icon from the Apex set: line icons by name ('arrow-right'), brand marks as 'brand:line'."""
    if name.startswith('brand:'):
        d = _ICONS.get('b_' + name[6:], '')
        return f'<svg class="i br {cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="{d}"/></svg>'
    return f'<svg class="i l {cls}" viewBox="0 0 24 24" aria-hidden="true">{_ICONS.get("l_" + name, "")}</svg>'

def head2(title, desc):
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{E(title)}</title>
<meta name="description" content="{E(desc)}">
<meta name="robots" content="noindex">
<meta name="theme-color" content="#1F0A30">
<link rel="preload" href="assets/fonts/LINESeed-Rg-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/LINESeed-Bd-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/css/apex.css?v={CG_CSS_V}">
<link rel="stylesheet" href="assets/css/cg.css?v={CG_CSS_V}">
</head>'''

def header2(home=False):
    p = '' if home else 'index.html'
    nav = [(f'{p}#planner', 'Face planner'), (f'{p}#treatments', 'Treatments'), (f'{p}#layers', 'Skin layers'), (f'{p}#results', 'Results'), ('compare.html', 'Compare'), (f'{p}#book', 'Contact')]
    links = ''.join(f'<a href="{h}">{E(t)}</a>' for h, t in nav)
    return f'''<header class="hdr"><a class="skip" href="#main">Skip to content</a><div class="hdr-in">
  <a class="hdr-logo" href="{p or '#main'}" aria-label="Apex Contour and Glow"><span class="logo-txt cg-logo">APEX<small>Contour and Glow</small></span></a>
  <nav class="hdr-nav" aria-label="Main">{links}</nav>
  <div class="hdr-right"><a class="btn btn-plum btn-sm" href="{p}#book">{ic('message-circle')}Consultation</a><button type="button" class="burger" aria-label="Menu" data-sheet>{ic('menu')}</button></div>
</div></header>
<dialog class="sheet" id="sheet" aria-label="Menu"><div class="sheet-top"><span class="logo-txt light">APEX<small>Contour and Glow</small></span><button type="button" class="close" aria-label="Close" data-close>{ic('x')}</button></div>
  <nav>{''.join(f'<a href="{h}">{E(t)}{ic("arrow-right")}</a>' for h, t in nav)}</nav>
  <div class="sheet-cta"><a class="btn btn-light" href="{p}#book">{ic('message-circle')}Consultation</a><a class="btn btn-ghost" href="{LINE_URL}">{ic('brand:line')}LINE {E(LINE_ID)}</a></div>
</dialog>'''

def footer2():
    tx = ''.join(f'<a href="{k}.html">{E(TX[k]["name"])}</a>' for k in ORDER)
    permit = f'<p class="ftr-lic">{E(SETTINGS["permit"])}</p>' if SETTINGS['permit'] else ''
    return f'''<footer class="ftr sx-join" data-tone="night"><div class="wrap"><div class="ftr-top cg-ftr">
  <div class="brand"><span class="logo-txt light">APEX<small>Contour and Glow</small></span><p>{E(SETTINGS['clinic'])}</p>{permit}</div>
  <div><h2 class="ftr-h">Treatments</h2>{tx}</div>
  <div><h2 class="ftr-h">Tools</h2><a href="index.html#planner">Face planner</a><a href="index.html#layers">Skin layers</a><a href="compare.html">Compare two treatments</a><a href="index.html#results">Before and after</a></div>
  <div><h2 class="ftr-h">Contact</h2><a href="{LINE_URL}">{ic('brand:line')}LINE {E(LINE_ID)}</a><a href="tel:{PHONE.replace('-', '')}">{ic('phone')}{E(PHONE)}</a><a href="index.html#book">{ic('calendar')}Book a consultation</a></div>
</div>
<div class="ftr-bot cg-bot"><span>{E(SETTINGS['footer_note'])}</span><span><a href="privacy.html">{E(HOME['book']['privacy'])}</a></span></div></div>
<p class="cg-mark" aria-hidden="true">APEX</p></footer>'''

def scripts2():
    return f'<script src="assets/js/cg.js?v={CG_JS_V}"></script>'
