# Builds privacy.html from PRIVACY in tools/site_content.py. Run: python3 tools/build_privacy.py
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from site_content import PRIVACY as P
from layout import E, ROOT, head, header, footer, divider, scripts, inl

def block(t, x):
    if t == 'list': return '<ul>' + ''.join(f'<li>{inl(i)}</li>' for i in x.split('\n') if i.strip()) + '</ul>'
    if t in ('h2', 'h3'): return f'<{t}>{inl(x)}</{t}>'
    return f'<p>{inl(x)}</p>'

body = '\n'.join(block(t, x) for t, x in P['blocks'])
html = head(P['seo_title'], P['seo_desc']) + f'''
<body class="legal-page">
{header()}
<main>
<section class="sec legal"><div class="wrap">
  <div class="sec-head"><h1>{E(P["h1"])}</h1>{divider()}</div>
  <div class="legal-body gilt">
{body}
  </div>
</div></section>
</main>
{footer()}
{scripts()}
</body>
</html>
'''
open(os.path.join(ROOT, 'privacy.html'), 'w', encoding='utf-8').write(html)
print('built privacy.html')
