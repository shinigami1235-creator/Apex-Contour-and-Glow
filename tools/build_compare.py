# Builds compare.html. The facts per treatment and the notes for common pairs live in tools/layout.py.
# Run: python3 tools/build_compare.py
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from tx_content import TX
from layout import E, ROOT, ORDER, ROWS, PAIRS, ASK, LINE_ID, summary, head, header, footer, divider, scripts

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
<section class="cmp-screen"><div class="wrap cmp-grid">
  <div class="cmp-side">
    <h1>Compare <em>two treatments</em></h1>{divider()}
    <form class="pair stack" action="compare.html" id="pair">
      <label>First{pick("a", "botox")}</label><span class="and">&amp;</span><label>Second{pick("b", "filler")}</label>
    </form>
    <p class="kicker">Often compared</p>
    <div class="pchips">{chips}</div>
    <a class="btn solid" href="index.html#book">Book a consultation</a>
  </div>
  <div class="gilt cmp-card">
  <table class="cmp-table">
    <thead><tr><th></th><th><span class="half" data-s="a" data-f="half"></span><span data-s="a" data-f="name"></span></th><th><span class="half" data-s="b" data-f="half"></span><span data-s="b" data-f="name"></span></th></tr></thead>
    <tbody>{rows}<tr class="go"><th scope="row"></th><td><a class="btn" data-s="a" data-f="link"></a></td><td><a class="btn" data-s="b" data-f="link"></a></td></tr></tbody>
  </table>
  <p class="cmp-note" id="pair-note" hidden></p>
  <p class="note center">Starting prices. Promotions change, so check the latest on LINE {E(LINE_ID)}.</p>
  </div>
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
        if (f === 'link') {{ el.href = (window.CG_URLS || {{}})[pick[s]] || pick[s] + '.html'; el.textContent = 'Read about ' + t.name; }}
        else el.textContent = t[f];
      }});
    }}
    const note = document.getElementById('pair-note'), key = [pick.a, pick.b].sort().join('|');
    note.hidden = !P[key]; note.textContent = P[key] || '';
    history.replaceState(null, '', '?a=' + pick.a + '&b=' + pick.b);
  }};
  [A, B].forEach(s => s.addEventListener('change', () => {{ draw(); (window.dataLayer = window.dataLayer || []).push({{ event: 'apex_compare', apex: {{ a: A.value, b: B.value }} }}); }}));
  draw();
}})();
</script>
{scripts()}
</body>
</html>
'''
open(os.path.join(ROOT, 'compare.html'), 'w').write(html)
print('built compare.html')
