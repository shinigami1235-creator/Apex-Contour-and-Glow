# Builds compare.html. The facts per treatment and the notes for common pairs live in tools/layout.py.
# Run: python3 tools/build_compare.py
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from tx_content import TX
from site_content import TAGS
from layout import E, ROOT, ORDER, ROWS, PAIRS, ASK, LINE_ID, summary, head2, header2, footer2, scripts2, ic

data = {k: {**summary(k), 'sym': TAGS[k][0], 'mat': TAGS[k][1]} for k in ORDER}
def pick(name, sel):
    return f'<select name="{name}" id="pick-{name}">' + ''.join(f'<option value="{k}"{" selected" if k == sel else ""}>{E(TX[k]["name"])}</option>' for k in ORDER) + '</select>'
rows = ''.join(f'<tr><th scope="row">{E(lab)}</th><td data-s="a" data-f="{key}"></td><td data-s="b" data-f="{key}"></td></tr>' for key, lab in ROWS)
chips = ''.join(f'<a class="chip" href="compare.html?a={a}&amp;b={b}">{E(TX[a]["name"])} and {E(TX[b]["name"])}</a>' for a, b in (k.split('|') for k in PAIRS))
col = lambda s: f'<th><span class="cm-tile"><b data-s="{s}" data-f="sym"></b></span><span class="cm-name" data-s="{s}" data-f="name"></span><span class="cm-mat" data-s="{s}" data-f="mat"></span></th>'
html = head2('Compare two treatments | Apex Contour and Glow',
            'Compare two injectable treatments at Apex side by side: what each one is, what it suits, when it shows, how long it lasts and what it costs.') + f'''
<body class="cmp-page">
{header2()}
<main id="main">
<section class="phead cg-cmpage" data-tone="night"><div class="phead-lines" aria-hidden="true"></div><div class="wrap cg-cmp-grid">
  <div class="cg-cmp-side">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a>{ic('chevron-down', 'cr')}<span aria-current="page">Compare</span></nav>
    <h1 class="display-s">Compare two treatments</h1>
    <p class="lead">Pick any two and read them side by side.</p>
    <form class="cg-pair" action="compare.html" id="pair">
      <label>First{pick("a", "botox")}</label><label>Second{pick("b", "filler")}</label>
    </form>
    <p class="eyebrow on-night">Often compared</p>
    <div class="chips cg-pchips">{chips}</div>
  </div>
  <div class="cg-cmp-card">
  <table class="cg-cmp-table">
    <thead><tr><th></th>{col("a")}{col("b")}</tr></thead>
    <tbody>{rows}<tr class="go"><th scope="row"></th><td><a class="link-arrow" data-s="a" data-f="link"></a></td><td><a class="link-arrow" data-s="b" data-f="link"></a></td></tr></tbody>
  </table>
  <p class="cg-cmp-note" id="pair-note" hidden></p>
  <p class="note">Starting prices. Promotions change, so check the latest on LINE {E(LINE_ID)}.</p>
  </div>
</div></section>
</main>
{footer2()}
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
{scripts2()}
</body>
</html>
'''
open(os.path.join(ROOT, 'compare.html'), 'w').write(html)
print('built compare.html')
