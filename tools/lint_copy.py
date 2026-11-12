# Flags written copy that reads as AI-made. Run: python3 tools/lint_copy.py index.html botox.html
import re, sys, html
RULES = [
 (r'[—–]', 'dash'),
 (r'\bnowhere else\b|\band nothing else\b|\bno guessing\b', 'tailing negation'),
 (r',\s*not\b|\bnot just\b|\bnot only\b|\bit\'s not\b|\bisn\'t about\b', 'negative parallelism'),
 (r'(^|[.!?]\s)(That|This|These) (is|are)\b', 'demonstrative gloss'),
 (r',\s*so (nothing|you never|it still|there\'s no)\b|\bso nothing\b', 'reassurance clause'),
 (r'\b(simply|actually|truly|essentially|seamless(ly)?|elevate|unlock|crucial|vital|robust|delve|showcase|vibrant|journey|effortless(ly)?)\b', 'AI vocabulary'),
 (r'\b(every single|deliberate|load-bearing|honestly|frankly)\b', 'Claude habit'),
 (r'\bThe (catch|result|kicker)\?', 'infomercial hook'),
 (r'\brather than\b', 'check rather than'),
]
def texts(path):
    s = open(path, encoding='utf-8').read()
    s = re.sub(r'<(script|style)[\s\S]*?</\1>', ' ', s)
    for m in re.finditer(r'(?:content|placeholder|alt)="([^"]+)"', s): yield m.group(1)
    s = re.sub(r'<[^>]+>', '\n', s)
    for line in s.split('\n'):
        t = html.unescape(line).strip()
        if len(t) > 2: yield t
bad = 0
for p in sys.argv[1:]:
    seen = set()
    for t in texts(p):
        if t in seen: continue
        seen.add(t)
        for pat, name in RULES:
            if re.search(pat, t, re.I):
                print(f'{p}: [{name}] {t}'); bad += 1
print('hits', bad)
