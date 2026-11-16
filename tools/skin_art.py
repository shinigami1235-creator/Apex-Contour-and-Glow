"""Draws the skin cross-section for the Skin layers section: one SVG band per layer, in the style of a
histology diagram (cells with nuclei, collagen, fat cells, muscle fibres, bone). Seeded, so every build
draws the same picture."""
import math, random

W = 600
H = {'surface': 96, 'dermis': 150, 'fat': 150, 'muscle': 110, 'bone': 90}


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


def surface(rnd):
    h = H['surface']; o = []
    o.append(f'<rect width="{W}" height="{h}" fill="#f7d9dc"/>')
    # stratum corneum: flat peach flakes
    for row, y in enumerate((7, 14)):
        x = -rnd.uniform(0, 20)
        while x < W:
            w = rnd.uniform(34, 50)
            o.append(f'<path d="{_blob(x + w / 2, y, w / 2, 4.2, rnd, .08)}" fill="{"#f9c9a4" if row else "#fbd9b8"}" stroke="#eab48a" stroke-width=".8"/>')
            x += w * .82
    o.append(f'<rect y="18" width="{W}" height="4" fill="#f2b98c" opacity=".8"/>')
    # granular and spinous cells: pink, nucleus in each
    for y, ry, fill, nuc in ((30, 7, '#e9759f', 'flat'), (46, 9, '#f6c9cf', 'round'), (63, 9, '#f6c9cf', 'round')):
        x = -rnd.uniform(0, 18)
        while x < W:
            rx = rnd.uniform(14, 19)
            cx = x + rx
            o.append(f'<path d="{_blob(cx, y + rnd.uniform(-1, 1), rx, ry, rnd)}" fill="{fill}" stroke="#c9578a" stroke-width=".9"/>')
            if nuc == 'flat':
                o.append(f'<ellipse cx="{_f(cx)}" cy="{_f(y)}" rx="{_f(rx * .5)}" ry="1.8" fill="#c21f3d"/>')
            else:
                o.append(f'<circle cx="{_f(cx + rnd.uniform(-3, 3))}" cy="{_f(y + rnd.uniform(-2, 2))}" r="3" fill="#c21f3d"/>')
            x += rx * 2 - 1
    # basal layer: tall magenta cells on the basement membrane
    x = 0
    while x < W:
        w = rnd.uniform(15, 19)
        o.append(f'<rect x="{_f(x + .8)}" y="73" width="{_f(w - 1.6)}" height="21" rx="4" fill="#d6347a" stroke="#a51d5b" stroke-width=".9"/>')
        o.append(f'<ellipse cx="{_f(x + w / 2)}" cy="{_f(83 + rnd.uniform(-2, 2))}" rx="3" ry="4" fill="#8f0f36" opacity=".8"/>')
        x += w
    # a melanocyte between the basal cells
    for mx in (140, 430):
        o.append(f'<path d="M{mx},90 q-4,-12 2,-24 q2,-6 4,0 q-4,10 0,24z" fill="#5a2c1c"/><circle cx="{mx + 1}" cy="88" r="3" fill="#2a1009"/>')
    return o


def dermis(rnd):
    h = H['dermis']; o = [f'<rect width="{W}" height="{h}" fill="#f6e3d8"/>']
    o.append(f'<path d="M0,0H{W}V5H0z" fill="#e7b4b0"/>')
    # collagen bundles: wavy fibres
    for i in range(34):
        y = rnd.uniform(14, h - 10); x0 = rnd.uniform(-60, W); L = rnd.uniform(90, 200)
        amp = rnd.uniform(2, 5); seg = rnd.uniform(18, 28)
        col = rnd.choice(('#e9b6ad', '#e2a59f', '#efc6bb'))
        d = f'M{_f(x0)},{_f(y)}'
        x = x0
        while x < x0 + L:
            d += f'q{_f(seg / 2)},{_f(-amp)} {_f(seg)},0'
            x += seg
        o.append(f'<path d="{d}" fill="none" stroke="{col}" stroke-width="{_f(rnd.uniform(3, 6))}" stroke-linecap="round" opacity=".75"/>')
    # elastin: thin dark threads
    for i in range(10):
        y = rnd.uniform(14, h - 10); x0 = rnd.uniform(0, W)
        o.append(f'<path d="M{_f(x0)},{_f(y)}c20,-8 40,8 60,0s40,8 60,0" fill="none" stroke="#b8738f" stroke-width=".9" opacity=".7"/>')
    # fibroblasts: spindle cells
    for i in range(9):
        cx, cy = rnd.uniform(20, W - 20), rnd.uniform(20, h - 16); a = rnd.uniform(-20, 20)
        o.append(f'<g transform="translate({_f(cx)},{_f(cy)}) rotate({_f(a)})"><path d="M-16,0Q0,-6 16,0Q0,6 -16,0z" fill="#9b5d9e" opacity=".85"/><ellipse rx="4" ry="2" fill="#5e2a63"/></g>')
    # a capillary loop and a vein
    o.append('<path d="M188,150C188,90 186,40 204,34S222,90 220,150" fill="none" stroke="#d2273f" stroke-width="5" stroke-linecap="round"/>')
    o.append('<path d="M188,150C188,90 186,40 204,34S222,90 220,150" fill="none" stroke="#f26a7c" stroke-width="1.6"/>')
    o.append('<path d="M0,128C120,118 240,138 360,124S520,116 600,128" fill="none" stroke="#5a5fb8" stroke-width="7" stroke-linecap="round" opacity=".85"/>')
    o.append('<path d="M0,128C120,118 240,138 360,124S520,116 600,128" fill="none" stroke="#8d92e0" stroke-width="2" opacity=".8"/>')
    # a hair follicle and sebaceous gland
    o.append('<path d="M470,0V112q0,14 10,14t10,-14V0" fill="#f2c6b6" stroke="#c28a7c" stroke-width="1.2"/><path d="M478,0V108" stroke="#3a2418" stroke-width="3"/>')
    o.append(f'<path d="{_blob(505, 44, 13, 10, rnd, .1)}" fill="#f5d27e" stroke="#c99a3c" stroke-width="1"/>')
    return o


def fat(rnd):
    h = H['fat']; o = [f'<rect width="{W}" height="{h}" fill="#e7c7a3"/>']
    cells = []
    for _ in range(900):
        if len(cells) > 80: break
        r = rnd.uniform(15, 25); x, y = rnd.uniform(-10, W + 10), rnd.uniform(-6, h + 6)
        if all((x - a) ** 2 + (y - b) ** 2 > (r + c - 3) ** 2 for a, b, c in cells):
            cells.append((x, y, r))
    for x, y, r in cells:
        o.append(f'<path d="{_blob(x, y, r, r * rnd.uniform(.85, 1), rnd, .07)}" fill="#fbe39a" stroke="#d9a94f" stroke-width="1.4"/>')
        o.append(f'<ellipse cx="{_f(x - r * .45)}" cy="{_f(y - r * .55)}" rx="{_f(r * .3)}" ry="{_f(r * .18)}" fill="#fff6d6" opacity=".7"/>')
        a = rnd.uniform(0, 6.28)
        o.append(f'<ellipse cx="{_f(x + math.cos(a) * r * .82)}" cy="{_f(y + math.sin(a) * r * .82)}" rx="3.2" ry="1.8" transform="rotate({_f(math.degrees(a) + 90)} {_f(x + math.cos(a) * r * .82)} {_f(y + math.sin(a) * r * .82)})" fill="#a0306b"/>')
    o.append('<path d="M0,70C140,60 300,84 600,64" fill="none" stroke="#d2273f" stroke-width="3.5" opacity=".8"/>')
    return o


def muscle(rnd):
    h = H['muscle']; o = [f'<rect width="{W}" height="{h}" fill="#8e2346"/>']
    o.append(f'<rect width="{W}" height="6" fill="#e9c8c2"/>')
    y = 8
    while y < h:
        fh = rnd.uniform(14, 19)
        o.append(f'<rect x="-4" y="{_f(y)}" width="{W + 8}" height="{_f(fh - 1.6)}" rx="7" fill="#c23b5f"/>')
        o.append(f'<rect x="-4" y="{_f(y + 1.5)}" width="{W + 8}" height="2.5" rx="1.2" fill="#e0748f" opacity=".6"/>')
        st = ''.join(f'M{_f(x)},{_f(y + 2)}v{_f(fh - 5)}' for x in range(int(rnd.uniform(0, 6)), W, 6))
        o.append(f'<path d="{st}" stroke="#8e2346" stroke-width="1.6" opacity=".55"/>')
        for _ in range(4):
            o.append(f'<ellipse cx="{_f(rnd.uniform(0, W))}" cy="{_f(y + fh - 3.6)}" rx="5" ry="1.8" fill="#3d0d22"/>')
        y += fh
    return o


def bone(rnd):
    h = H['bone']; o = [f'<rect width="{W}" height="{h}" fill="#efe6d6"/>']
    o.append(f'<rect width="{W}" height="7" fill="#c9a98c"/><rect y="7" width="{W}" height="2" fill="#a88466"/>')
    for i in range(10):
        cx, cy = 30 + i * 60 + rnd.uniform(-10, 10), rnd.uniform(36, 66)
        for k, r in enumerate((22, 16, 10)):
            o.append(f'<circle cx="{_f(cx)}" cy="{_f(cy)}" r="{r}" fill="none" stroke="#d7c7ad" stroke-width="2.4"/>')
        o.append(f'<circle cx="{_f(cx)}" cy="{_f(cy)}" r="4" fill="#e09a8a"/>')
        for a in range(0, 360, 45):
            rr = 13 + (a // 45) % 2 * 6
            o.append(f'<ellipse cx="{_f(cx + math.cos(math.radians(a)) * rr)}" cy="{_f(cy + math.sin(math.radians(a)) * rr)}" rx="1.8" ry="1" fill="#8c7458"/>')
    return o


DRAW = {'surface': surface, 'dermis': dermis, 'fat': fat, 'muscle': muscle, 'bone': bone}


def band(k):
    rnd = random.Random(k)
    return (f'<svg class="ly-art" viewBox="0 0 {W} {H[k]}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">'
            + ''.join(DRAW[k](rnd)) + '</svg>')
