"""Draws the skin cross-section for the Skin layers section: one SVG band per layer, in the style of a
histology diagram (cells with nuclei, collagen, fat cells, muscle fibres, bone). Seeded, so every build
draws the same picture."""
import math, random

W = 600
# heights in the same units as the width; the page keeps each band at this shape, so nothing is cropped
H = {'surface': 80, 'dermis': 130, 'fat': 130, 'muscle': 96, 'bone': 76}
# the needle enters at 70% across and leans 18 degrees left, so its path runs through x 270 to 440;
# vessels, the hair and cells that would read as a target stay out of that corridor


def _f(x):
    return f'{x:.1f}'.rstrip('0').rstrip('.')


def _blob(cx, cy, rx, ry, rnd, wob=.12, n=9):
    pts = []
    for i in range(n):
        a = i / n * 2 * math.pi
        k = 1 + rnd.uniform(-wob, wob)
        pts.append((cx + math.cos(a) * rx * k, cy + math.sin(a) * ry * k))
    d = f'M{_f((pts[0][0] + pts[-1][0]) / 2)},{_f((pts[0][1] + pts[-1][1]) / 2)}'
    for i, p in enumerate(pts):
        q = pts[(i + 1) % n]
        d += f'Q{_f(p[0])},{_f(p[1])} {_f((p[0] + q[0]) / 2)},{_f((p[1] + q[1]) / 2)}'
    return d + 'Z'


def _tube(d, kind, w=1.0):
    """A blood vessel drawn as a tube: dark wall, lighter lumen and a highlight. Arteries red, veins blue."""
    wall, lumen, hi = (('#9a1630', '#d9435a', '#ff9eac') if kind == 'a' else ('#3a3c8c', '#6a6ec8', '#b4b7f0'))
    return (f'<path d="{d}" fill="none" stroke="{wall}" stroke-width="{_f(6.5 * w)}" stroke-linecap="round"/>'
            f'<path d="{d}" fill="none" stroke="{lumen}" stroke-width="{_f(4 * w)}" stroke-linecap="round"/>'
            f'<path d="{d}" fill="none" stroke="{hi}" stroke-width="{_f(1.1 * w)}" stroke-linecap="round" opacity=".75" transform="translate(-0.8,-0.8)"/>')


def surface(rnd):
    h = H['surface']; o = [f'<rect width="{W}" height="{h}" fill="#f7d9dc"/>']
    for row, y in enumerate((6, 12)):
        x = -rnd.uniform(0, 20)
        while x < W:
            w = rnd.uniform(34, 50)
            o.append(f'<path d="{_blob(x + w / 2, y, w / 2, 3.6, rnd, .08)}" fill="{"#f9c9a4" if row else "#fbd9b8"}" stroke="#eab48a" stroke-width=".8"/>')
            x += w * .82
    o.append(f'<rect y="15" width="{W}" height="3.5" fill="#f2b98c" opacity=".8"/>')
    for y, ry, fill, nuc in ((25, 5.8, '#e9759f', 'flat'), (38, 7.5, '#f6c9cf', 'round'), (52, 7.5, '#f6c9cf', 'round')):
        x = -rnd.uniform(0, 18)
        while x < W:
            rx = rnd.uniform(14, 19); cx = x + rx
            o.append(f'<path d="{_blob(cx, y + rnd.uniform(-1, 1), rx, ry, rnd)}" fill="{fill}" stroke="#c9578a" stroke-width=".9"/>')
            if nuc == 'flat':
                o.append(f'<ellipse cx="{_f(cx)}" cy="{_f(y)}" rx="{_f(rx * .5)}" ry="1.6" fill="#c21f3d"/>')
            else:
                o.append(f'<circle cx="{_f(cx + rnd.uniform(-3, 3))}" cy="{_f(y + rnd.uniform(-2, 2))}" r="2.8" fill="#c21f3d"/>')
            x += rx * 2 - 1
    x = 0
    while x < W:
        w = rnd.uniform(15, 19)
        o.append(f'<rect x="{_f(x + .8)}" y="61" width="{_f(w - 1.6)}" height="19" rx="4" fill="#d6347a" stroke="#a51d5b" stroke-width=".9"/>')
        o.append(f'<ellipse cx="{_f(x + w / 2)}" cy="{_f(70 + rnd.uniform(-2, 2))}" rx="3" ry="3.8" fill="#8f0f36" opacity=".8"/>')
        x += w
    for mx in (140, 540):   # melanocytes between the basal cells
        o.append(f'<path d="M{mx},78 q-4,-11 2,-22 q2,-6 4,0 q-4,9 0,22z" fill="#5a2c1c"/><circle cx="{mx + 1}" cy="76" r="2.8" fill="#2a1009"/>')
    # the hair from the follicle below, coming out through the skin
    o.append('<path d="M455,80V-2" stroke="#3a2418" stroke-width="3.2" stroke-linecap="round"/><path d="M450,80q5,-6 10,0" fill="#f2c6b6" stroke="#c28a7c"/>')
    return o


def dermis(rnd):
    h = H['dermis']; o = [f'<rect width="{W}" height="{h}" fill="#f6e3d8"/>', f'<path d="M0,0H{W}V4H0z" fill="#e7b4b0"/>']
    o.append('<defs><linearGradient id="sk-cap-o" x1="0" x2="1"><stop offset="0" stop-color="#9a1630"/><stop offset="1" stop-color="#3a3c8c"/></linearGradient>'
             '<linearGradient id="sk-cap-i" x1="0" x2="1"><stop offset="0" stop-color="#e2556b"/><stop offset="1" stop-color="#7377cf"/></linearGradient></defs>')
    for i in range(30):   # collagen bundles
        y = rnd.uniform(10, h - 8); x0 = rnd.uniform(-60, W); L = rnd.uniform(90, 200)
        amp = rnd.uniform(2, 4.5); seg = rnd.uniform(18, 28)
        d = f'M{_f(x0)},{_f(y)}'; x = x0
        while x < x0 + L:
            d += f'q{_f(seg / 2)},{_f(-amp)} {_f(seg)},0'; x += seg
        o.append(f'<path d="{d}" fill="none" stroke="{rnd.choice(("#e9b6ad", "#e2a59f", "#efc6bb"))}" stroke-width="{_f(rnd.uniform(3, 5.5))}" stroke-linecap="round" opacity=".7"/>')
    for i in range(9):    # elastin
        y = rnd.uniform(10, h - 8); x0 = rnd.uniform(0, W)
        o.append(f'<path d="M{_f(x0)},{_f(y)}c20,-8 40,8 60,0s40,8 60,0" fill="none" stroke="#b8738f" stroke-width=".9" opacity=".6"/>')
    for cx, cy, a in ((60, 52, -8), (150, 30, 12), (250, 66, -4), (300, 22, 10), (430, 100, -12), (520, 70, 6), (575, 40, -10)):   # fibroblasts
        o.append(f'<g transform="translate({cx},{cy}) rotate({a})"><path d="M-15,0Q0,-5.5 15,0Q0,5.5 -15,0z" fill="#9b5d9e" opacity=".85"/><ellipse rx="4" ry="2" fill="#5e2a63"/></g>')
    # the hair follicle and its oil gland, right of the needle's path
    o.append('<path d="M446,0V96q0,13 9,13t9,-13V0" fill="#f2c6b6" stroke="#c28a7c" stroke-width="1.2"/><path d="M455,0V92" stroke="#3a2418" stroke-width="3.2"/>'
             f'<path d="{_blob(478, 40, 12, 9.5, rnd, .1)}" fill="#f5d27e" stroke="#c99a3c"/>')
    # capillary loops rising from the plexus towards the epidermis
    for x0, ya, yv in ((48, 95, 108), (108, 93, 106), (168, 92, 105), (512, 96, 110), (568, 95, 109)):
        d = f'M{x0},{ya}C{x0 - 2},50 {x0 - 3},12 {x0 + 5},10S{x0 + 13},50 {x0 + 11},{yv}'
        o.append(f'<path d="{d}" fill="none" stroke="url(#sk-cap-o)" stroke-width="3.2" stroke-linecap="round"/><path d="{d}" fill="none" stroke="url(#sk-cap-i)" stroke-width="1.5" stroke-linecap="round"/>')
    # the plexus: arterioles and venules along the base, turning down into the fat at the sides
    o.append(_tube('M-4,108C60,103 120,114 170,106S196,112 200,132', 'v', .62))
    o.append(_tube('M-4,95C60,89 120,100 172,93S208,99 214,132', 'a', .58))
    o.append(_tube('M604,108C565,115 535,103 512,112S490,120 488,132', 'v', .62))
    o.append(_tube('M604,94C560,101 530,89 500,98S476,110 474,132', 'a', .58))
    return o


def fat(rnd):
    h = H['fat']; o = [f'<rect width="{W}" height="{h}" fill="#e7c7a3"/>']
    cells = []
    for _ in range(900):
        if len(cells) > 75: break
        r = rnd.uniform(14, 23); x, y = rnd.uniform(-10, W + 10), rnd.uniform(-6, h + 6)
        if all((x - a) ** 2 + (y - b) ** 2 > (r + c - 3) ** 2 for a, b, c in cells):
            cells.append((x, y, r))
    for x, y, r in cells:
        o.append(f'<path d="{_blob(x, y, r, r * rnd.uniform(.85, 1), rnd, .07)}" fill="#fbe39a" stroke="#d9a94f" stroke-width="1.4"/>')
        o.append(f'<ellipse cx="{_f(x - r * .45)}" cy="{_f(y - r * .55)}" rx="{_f(r * .3)}" ry="{_f(r * .18)}" fill="#fff6d6" opacity=".7"/>')
        a = rnd.uniform(0, 6.28); nx, ny = x + math.cos(a) * r * .82, y + math.sin(a) * r * .82
        o.append(f'<ellipse cx="{_f(nx)}" cy="{_f(ny)}" rx="3" ry="1.7" transform="rotate({_f(math.degrees(a) + 90)} {_f(nx)} {_f(ny)})" fill="#a0306b"/>')
    # fibrous septa between the fat lobules; the vessels run inside them
    for d in ('M207,0C204,40 210,90 204,130', 'M481,0C478,45 486,85 480,130', 'M0,62C70,56 150,70 207,60', 'M481,74C530,80 560,68 600,72'):
        o.append(f'<path d="{d}" fill="none" stroke="#f4e7d6" stroke-width="7" stroke-linecap="round" opacity=".9"/>')
    o.append(_tube('M200,-2C197,40 203,90 196,132', 'v', .62))
    o.append(_tube('M214,-2C211,40 217,90 210,132', 'a', .58))
    o.append(_tube('M0,58C70,51 150,67 212,58', 'a', .45))
    o.append(_tube('M488,-2C486,45 494,85 490,132', 'v', .62))
    o.append(_tube('M474,-2C471,45 479,85 470,132', 'a', .58))
    o.append(_tube('M490,76C530,83 560,69 604,74', 'v', .45))
    return o


def muscle(rnd):
    h = H['muscle']; o = [f'<rect width="{W}" height="{h}" fill="#8e2346"/>', f'<rect width="{W}" height="5" fill="#e9c8c2"/>']
    y = 7
    while y < h:
        fh = rnd.uniform(13, 17)
        o.append(f'<rect x="-4" y="{_f(y)}" width="{W + 8}" height="{_f(fh - 1.6)}" rx="7" fill="#c23b5f"/>')
        o.append(f'<rect x="-4" y="{_f(y + 1.5)}" width="{W + 8}" height="2.3" rx="1.2" fill="#e0748f" opacity=".6"/>')
        st = ''.join(f'M{_f(x)},{_f(y + 2)}v{_f(fh - 5)}' for x in range(int(rnd.uniform(0, 6)), W, 6))
        o.append(f'<path d="{st}" stroke="#8e2346" stroke-width="1.6" opacity=".55"/>')
        for _ in range(4):
            o.append(f'<ellipse cx="{_f(rnd.uniform(0, W))}" cy="{_f(y + fh - 3.4)}" rx="5" ry="1.7" fill="#3d0d22"/>')
        y += fh
    # the perforating vessels pass between the muscle bundles, away from the needle's path
    o.append(_tube('M196,-2C198,30 192,64 195,98', 'v', .6))
    o.append(_tube('M210,-2C212,30 206,64 209,98', 'a', .56))
    o.append(_tube('M490,-2C488,30 494,64 491,98', 'v', .6))
    o.append(_tube('M470,-2C468,30 474,64 471,98', 'a', .56))
    return o


def bone(rnd):
    h = H['bone']; o = [f'<rect width="{W}" height="{h}" fill="#efe6d6"/>']
    # periosteum: the membrane on the bone, where filler for the cheekbones, jaw and chin is placed
    o.append(f'<rect width="{W}" height="7" fill="#d8b89a"/><rect y="7" width="{W}" height="1.6" fill="#a88466"/>')
    for i in range(10):
        cx, cy = 30 + i * 60 + rnd.uniform(-10, 10), rnd.uniform(36, 56)
        for r in (19, 13.5, 8.5):
            o.append(f'<circle cx="{_f(cx)}" cy="{_f(cy)}" r="{r}" fill="none" stroke="#d7c7ad" stroke-width="2.2"/>')
        o.append(f'<circle cx="{_f(cx)}" cy="{_f(cy)}" r="3.6" fill="#e09a8a"/>')
        for a in range(0, 360, 45):
            rr = 11 + (a // 45) % 2 * 5.5
            o.append(f'<ellipse cx="{_f(cx + math.cos(math.radians(a)) * rr)}" cy="{_f(cy + math.sin(math.radians(a)) * rr)}" rx="1.7" ry="1" fill="#8c7458"/>')
    return o


DRAW = {'surface': surface, 'dermis': dermis, 'fat': fat, 'muscle': muscle, 'bone': bone}


def band(k):
    rnd = random.Random(k)
    return (f'<svg class="ly-art" viewBox="0 0 {W} {H[k]}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">'
            + ''.join(DRAW[k](rnd)) + '</svg>')


def needle():
    """A syringe above the skin. The needle (.ln-shaft) is drawn by CSS so the script can set how deep it goes,
    and the drop (.ln-drop) sits where the product is placed."""
    svg = ('<svg class="ln-body" viewBox="0 0 40 160" aria-hidden="true" focusable="false">'
           '<defs><linearGradient id="ln-glass" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".45" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#e6dcef" stop-opacity=".7"/></linearGradient>'
           '<linearGradient id="ln-gel" x1="0" x2="1"><stop offset="0" stop-color="#f3a9cb"/><stop offset=".5" stop-color="#fbd3e5"/><stop offset="1" stop-color="#e888b4"/></linearGradient></defs>'
           '<rect x="6" y="0" width="28" height="5" rx="2" fill="#efe7f6" stroke="#b9a3cf"/>'
           '<rect x="18" y="5" width="4" height="70" fill="#d9cbe7"/>'
           '<rect x="2" y="36" width="36" height="5" rx="2" fill="#efe7f6" stroke="#b9a3cf"/>'
           '<rect x="10" y="41" width="20" height="94" rx="3" fill="url(#ln-glass)" stroke="#b9a3cf"/>'
           '<rect x="12" y="81" width="16" height="52" rx="2" fill="url(#ln-gel)"/>'
           '<rect x="11.5" y="75" width="17" height="6" rx="1.5" fill="#4a2a5e"/>'
           + ''.join(f'<path d="M10 {y}h{5 if i % 2 else 8}" stroke="#9c86b3" stroke-width=".9"/>' for i, y in enumerate(range(52, 132, 8)))
           + '<path d="M14 135h12l-3 11h-6z" fill="#efe7f6" stroke="#b9a3cf"/>'
           '<rect x="16" y="146" width="8" height="14" rx="1.5" fill="#b07ad6" opacity=".9"/></svg>')
    return f'<div class="ly-needle" data-ly="dermis" aria-hidden="true"><div class="ln-rig"><span class="ln-shaft"></span>{svg}</div><span class="ln-drop"></span></div>'
