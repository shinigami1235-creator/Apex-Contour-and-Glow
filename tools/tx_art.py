# Inline drawings for the treatment pages: line icons, the how-it-works panels and the face map.
ICON = {
 'talk':   '<path d="M4 5h16v10H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
 'glass':  '<path d="M7 3h10l-1 8a4 4 0 0 1-8 0z"/><path d="M12 15v5M8 20h8"/>',
 'noglass':'<path d="M7 3h10l-1 8a4 4 0 0 1-8 0z"/><path d="M12 15v5M8 20h8"/><path d="M4 4l16 16"/>',
 'pill':   '<rect x="3" y="9" width="18" height="7" rx="3.5" transform="rotate(-35 12 12.5)"/><path d="M10.2 8.7l3.6 7.6"/>',
 'calendar':'<rect x="4" y="5" width="16" height="15" rx="1"/><path d="M4 9h16M8 3v4M16 3v4M9 13l6 4M15 13l-6 4"/>',
 'wash':   '<path d="M12 3c3 4 5 6.5 5 9a5 5 0 0 1-10 0c0-2.5 2-5 5-9z"/><path d="M9.5 13a2.5 2.5 0 0 0 2.5 2.5"/>',
 'lips':   '<path d="M3 12c3-4 5-4 6.5-3 1 .7 2 .7 3 0C14 8 16 8 21 12c-3 4-6 5-9 5s-6-1-9-5z"/><path d="M3 12h18"/>',
 'bowl':   '<path d="M3 11h18a9 9 0 0 1-18 0z"/><path d="M8 7c0-2 2-2 2-4M13 7c0-2 2-2 2-4"/>',
 'dumbbell':'<path d="M6 7v10M3 9v6M18 7v10M21 9v6M6 12h12"/>',
 'bed':    '<path d="M3 18V7M3 14h18v4M21 14v-3a3 3 0 0 0-3-3h-7v6"/><circle cx="7" cy="11" r="2"/>',
 'hand':   '<path d="M8 13V5a1.5 1.5 0 0 1 3 0v6M11 10V4a1.5 1.5 0 0 1 3 0v7M14 10V5.5a1.5 1.5 0 0 1 3 0V14a6 6 0 0 1-6 6h-1a5 5 0 0 1-4.3-2.5L4 14a1.5 1.5 0 0 1 2.5-1.6L8 14"/>',
 'clock':  '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/>',
}
def icon(k, cls='ico'):
    return f'<svg class="{cls}" viewBox="0 0 24 24" aria-hidden="true">{ICON[k]}</svg>'

# Three panels of a cross-section: skin on top, the muscle below.
_DEFS = '''<defs>
<linearGradient id="skin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1dfe6"/><stop offset="1" stop-color="#d9b9c8"/></linearGradient>
<linearGradient id="musc" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7a2a4a"/><stop offset=".5" stop-color="#a8476b"/><stop offset="1" stop-color="#7a2a4a"/></linearGradient>
<radialGradient id="drop" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="#d9c4f2"/><stop offset="1" stop-color="#8d63c4"/></radialGradient>
<radialGradient id="calm" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="#c9a8f0" stop-opacity=".9"/><stop offset="1" stop-color="#c9a8f0" stop-opacity="0"/></radialGradient>
</defs>'''
def _skin(d):
    return f'<path d="{d} L230 150 L10 150 Z" fill="url(#skin)"/><path d="{d}" fill="none" stroke="#e6c88f" stroke-width="1.6"/>'
def _fibres(x0, x1, y, h, n, col='#f3c9d8'):
    out = ''
    for k in range(n):
        yy = y - h/2 + (k+1)*h/(n+1)
        out += f'<path d="M{x0+8} {yy:.1f} Q{(x0+x1)/2:.0f} {yy-2:.1f} {x1-8} {yy:.1f}" stroke="{col}" stroke-opacity=".55" stroke-width="1"/>'
    return out
PANEL = {
 'muscle': _DEFS + _skin('M10 60 Q30 60 45 70 Q55 84 65 70 Q80 54 95 70 Q105 86 115 70 Q130 54 145 70 Q155 86 165 70 Q180 56 200 62 L230 62')
          + '<ellipse cx="120" cy="112" rx="62" ry="24" fill="url(#musc)"/>' + _fibres(58,182,112,40,5)
          + '<path d="M40 112h14M200 112h-14" stroke="#e6c88f" stroke-width="1.4"/><path d="M54 107l6 5-6 5M186 107l-6 5 6 5" fill="none" stroke="#e6c88f" stroke-width="1.4"/>',
 'dose':   _DEFS + _skin('M10 62 Q40 60 60 66 Q80 74 100 66 Q120 58 140 66 Q160 74 180 66 Q200 60 230 62')
          + '<ellipse cx="120" cy="114" rx="76" ry="20" fill="url(#musc)"/>' + _fibres(44,196,114,32,4)
          + '<circle class="calm" cx="120" cy="112" r="40" fill="url(#calm)"/>'
          + '<g class="drip"><path d="M120 20 C128 32 132 38 132 44 a12 12 0 0 1-24 0 c0-6 4-12 12-24z" fill="url(#drop)"/></g>',
 'smooth': _DEFS + _skin('M10 64 Q60 62 120 63 Q180 64 230 63')
          + '<ellipse cx="120" cy="116" rx="96" ry="15" fill="url(#musc)" opacity=".9"/>' + _fibres(24,216,116,24,3)
          + '<path class="shine" d="M40 60 Q120 56 200 60" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/>',
}
def panel(k):
    return f'<svg class="xsec" viewBox="0 0 240 150" role="img" aria-hidden="true">{PANEL[k]}</svg>'

# Front face in gold line, 400 x 460.
FACE = '''<path d="M200 28 C120 28 78 92 80 180 C82 250 98 318 130 360 C152 390 176 408 200 410 C224 408 248 390 270 360 C302 318 318 250 320 180 C322 92 280 28 200 28 Z"/>
<path d="M128 150 Q155 136 182 146M218 146 Q245 136 272 150"/>
<path d="M136 182 Q156 168 178 182 Q156 192 136 182 Z M222 182 Q244 168 264 182 Q244 192 222 182 Z"/>
<circle cx="157" cy="181" r="5"/><circle cx="243" cy="181" r="5"/>
<path d="M200 182 C198 220 190 248 184 262 Q200 272 216 262 C210 248 202 220 200 182"/>
<path d="M168 314 Q184 304 200 310 Q216 304 232 314 Q216 330 200 330 Q184 330 168 314 Z M168 314 Q200 318 232 314"/>
<path d="M80 180 C70 176 66 196 70 212 C74 230 82 236 88 234M320 180 C330 176 334 196 330 212 C326 230 318 236 312 234"/>'''
