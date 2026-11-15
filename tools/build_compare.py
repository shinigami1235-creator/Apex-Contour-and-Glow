# Builds compare.html. The facts per treatment and the notes for common pairs live in tools/layout.py.
# Run: python3 tools/build_compare.py
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from tx_content import TX
from layout import E, ROOT, ORDER, ROWS, PAIRS, ASK, summary, head, header, footer, divider, scripts

data = {k: summary(k) for k in ORDER}
def pick(name, sel):
    return f'<select name="{name}" id="pick-{name}">' + ''.join(f'<option value="{k}"{" selected" if k == sel else ""}>{E(TX[k]["name"])}</option>' for k in ORDER) + '</select>'
rows = ''.join(f'<tr><th scope="row">{E(lab)}</th><td data-s="a" data-f="{key}"></td><td data-s="b" data-f="{key}"></td></tr>' for key, lab in ROWS)
chips = ''.join(f'<a href="compare.html?a={a}&amp;b={b}">{E(TX[a]["name"])} and {E(TX[b]["name"])}</a>' for a, b in (k.split('|') for k in PAIRS))
html = head('Compare two treatments | Apex Contour and Glow',
            'Compare two injectable treatments at Apex side by side: what each one is, what it suits, when it shows, how long it lasts and what it costs.') + f'''
<body class="cmp-page">
{header()}
<main>
<section class="sec plum"><div class="wrap">
  <div class="sec-head"><h2>Compare <em>two treatments</em></h2>{divider()}
    <p>Pick one on each side.</p></div>
  <form class="pair" action="compare.html" id="pair">
    <label>First{pick("a", "botox")}</label><span class="and">&amp;</span><label>Second{pick("b", "filler")}</label>
  </form>
</div></section>
<section class="sec lav-2"><div class="wrap">
  <div class="gilt cmp-card">
  <table class="cmp-table">
    <thead><tr><th></th><th data-s="a" data-f="name"></th><th data-s="b" data-f="name"></th></tr></thead>
    <tbody>{rows}<tr><th scope="row"></th><td><a class="btn" data-s="a" data-f="link"></a></td><td><a class="btn" data-s="b" data-f="link"></a></td></tr></tbody>
  </table>
  </div>
  <p class="cmp-note" id="pair-note" hidden></p>
  <p class="note center">Prices are starting prices and promotions change. Check the latest on LINE @apexbeauty.</p>
  <p class="kicker center" style="margin-top:40px">Often compared</p>
  <div class="pchips">{chips}</div>
  <p class="center cta"><a class="btn solid" href="index.html#book">Book a consultation</a></p>
</div></section>
</main>
{footer()}
<script>
(() => {{
  const D = {json.dumps(data)}, P = {json.dumps(PAIRS)}, ASK = {json.dumps(ASK)};
  const q = new URLSearchParams(location.search), A = document.getElementById('pick-a'), B = document.getElementById('pick-b');
  if (D[q.get('a')]) A.value = q.get('a'); if (D[q.get('b')]) B.value = q.get('b');
  const draw = () => {{
    const pick = {{ a: A.value, b: B.value }};
    for (const s of ['a', 'b']) {{
      const t = D[pick[s]];
      document.querySelectorAll('[data-s="' + s + '"]').forEach(el => {{
        const f = el.dataset.f;
        if (f === 'link') {{ el.href = pick[s] + '.html'; el.textContent = 'Read about ' + t.name; }}
        else el.textContent = t[f];
      }});
    }}
    const note = document.getElementById('pair-note'), key = [pick.a, pick.b].sort().join('|');
    note.hidden = !P[key]; note.textContent = P[key] || '';
    history.replaceState(null, '', '?a=' + pick.a + '&b=' + pick.b);
  }};
  [A, B].forEach(s => s.addEventListener('change', draw));
  draw();
}})();
</script>
{scripts()}
</body>
</html>
'''
open(os.path.join(ROOT, 'compare.html'), 'w').write(html)
print('built compare.html')
