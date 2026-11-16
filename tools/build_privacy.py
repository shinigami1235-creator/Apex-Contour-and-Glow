# Builds privacy.html from PRIVACY in tools/site_content.py. Run: python3 tools/build_privacy.py
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from site_content import PRIVACY as P
from layout import E, ROOT, head2, header2, footer2, scripts2, inl, ic, CURVE

def block(t, x):
    if t == 'list': return '<ul>' + ''.join(f'<li>{inl(i)}</li>' for i in x.split('\n') if i.strip()) + '</ul>'
    if t in ('h2', 'h3'): return f'<{t}>{inl(x)}</{t}>'
    return f'<p>{inl(x)}</p>'

body = '\n'.join(block(t, x) for t, x in P['blocks'])
html = head2(P['seo_title'], P['seo_desc']) + f'''
<body class="legal-page">
{header2()}
<main id="main">
<section class="phead has-curve" data-tone="night"><div class="phead-lines" aria-hidden="true"></div><div class="wrap">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a>{ic('chevron-down', 'cr')}<span aria-current="page">Privacy policy</span></nav>
  <h1 class="display-s">{E(P["h1"])}</h1></div>
  <div class="sx sx-c" aria-hidden="true">{CURVE}</div></section>
<section class="section"><div class="wrap"><div class="prose cg-legal">
{body}
</div></div></section>
</main>
{footer2()}
{scripts2()}
</body>
</html>
'''
open(os.path.join(ROOT, 'privacy.html'), 'w', encoding='utf-8').write(html)
print('built privacy.html')
