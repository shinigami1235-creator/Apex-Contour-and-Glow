# Every page WordPress draws must match the static build. Run with the test server up:
#   python3 tests/wordpress/ssr.py [http://localhost:8081]
# Links are turned back into the design's page names and asset paths before comparing, and the parts only
# WordPress adds (wp_head, wp_footer, the treatment address map) are left out.
import difflib, os, re, sys, urllib.request
BASE = (sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8081').rstrip('/')
SITE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(SITE, 'tools'))
from layout import ORDER

def body(html):
    m = re.search(r'<body[^>]*>(.*)</body>', html, re.S)
    return m.group(0) if m else ''

def norm_wp(html):
    b = body(html)
    b = re.sub(r'<script>window\.CG_URLS = .*?</script>\n', '', b)
    b = re.sub(r'\n<script[^>]*speculationrules.*?</script>', '', b, flags=re.S)
    b = re.sub(r'\n?<div class="ck" id="apex-ck".*?</script>\n', '', b, flags=re.S)   # the cookie banner
    b = re.sub(r'https?://[^"]*/wp-content/themes/apex-contour-glow/assets/', 'assets/', b)
    b = re.sub(rf'{re.escape(BASE)}/treatments/([a-z0-9-]+)/', r'\1.html', b)
    b = re.sub(rf'{re.escape(BASE)}/compare/', 'compare.html', b)
    b = re.sub(rf'{re.escape(BASE)}/privacy/', 'privacy.html', b)
    b = re.sub(rf'{re.escape(BASE)}/(?=[#?"])', 'index.html', b)
    b = b.replace('&#038;', '&amp;')
    b = re.sub(r'\s+</body>', '</body>', b)
    return re.sub(r'\?v=[\w.]+', '', b).rstrip()

def norm_static(html):
    return re.sub(r'\s+</body>', '</body>', re.sub(r'\?v=[\w.]+', '', body(html))).rstrip()

pages = [('index.html', '/')] + [(f'{k}.html', f'/treatments/{k}/') for k in ORDER] + [('compare.html', '/compare/'), ('privacy.html', '/privacy/')]
bad = 0
for f, path in pages:
    want = norm_static(open(os.path.join(SITE, f), encoding='utf-8').read())
    have = norm_wp(urllib.request.urlopen(BASE + path).read().decode('utf-8'))
    if want == have: print('ok  ', f); continue
    bad += 1
    print('DIFF', f)
    w, h = want.replace('>', '>\n').splitlines(), have.replace('>', '>\n').splitlines()
    for line in list(difflib.unified_diff(w, h, 'static', 'wordpress', n=1, lineterm=''))[:14]: print('     ', line[:220])
print(f'{len(pages) - bad} of {len(pages)} pages match')
sys.exit(1 if bad else 0)
