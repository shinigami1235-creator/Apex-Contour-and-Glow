# Copy lint for Apex Contour and Glow. Every page, every user-facing string in the scripts and the
# treatment content must pass before a push. The build stops when anything is found.
#   python3 tools/lint_copy.py              checks the whole site
#   python3 tools/lint_copy.py page.html    checks the files named
# A line that has to stay as written goes in tools/lint_allow.txt with the reason after a | sign.
import glob, html, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

AI_WORDS = (r'crucial|vital|pivotal|robust|seamless(?:ly)?|leverag\w*|delve\w*|underscor\w*|landscape|tapestry|testament|'
            r'showcas\w*|holistic|nuanced|myriad|realm|elevat\w*|vibrant|boasts?|nestled|transformative|unlock\w*|journey|'
            r'effortless(?:ly)?|curated|meticulous(?:ly)?|intricate|interplay|garner\w*|bolster\w*|foster\w*|enhanc\w*|'
            r'game[- ]chang\w*|cutting[- ]edge|state[- ]of[- ]the[- ]art|world[- ]class|unparalleled|unrivall?ed|indulge|'
            r'pamper\w*|second to none|look no further|embark|navigate|empower\w*|synergy|in today\'s|ever[- ]evolving|'
            r'treat yourself|you deserve|luxurious experience|redefin\w*|revolutioni\w*|dive into|whisk')
RULES = [
    ('dash', r'[—–]|\s--\s'),
    ('curly quote', r'[‘’“”]'),
    ('emoji', r'[\U0001F300-\U0001FAFF☀-➿]'),
    ('exclamation', r'[A-Za-z)]!(\s|$)'),
    ('demonstrative gloss', r'(^|[.!?]\s+)(That|This|These|Those)\s+(is|are|was|were|\'s)\b'),
    ('negative parallelism', r'\bnot (just|only|merely)\b|\bit\'?s not\b|\bit is not\b|\bisn\'t (about|just)\b|,\s*not\s+(a|an|the|your|just|only)\b|\bnot\b[^.;:]{1,40}\bbut\b|\bno [a-z]+, no [a-z]+\b'),
    ('split contrast', r'^\W*(\S+\s+){0,3}((is|are|does|do|was|did|will|can) not|isn\'t|aren\'t|doesn\'t|don\'t|wasn\'t|won\'t|can\'t)\.$'),
    ('reassurance', r',\s*so (nothing|it still|there\'s no|no one|you never|you won\'t)\b|\bnothing (is|gets) (cut|lost|cropped)\b|\bloses nothing\b|\bno guessing\b|\bno surprises\b|\bpeace of mind\b'),
    ('promise as mechanism', r'\b(sent anywhere|leaves your|stays on your|never stored|stays private)\b'),
    ('AI vocabulary', r'\b(' + AI_WORDS + r')\b'),
    ('filler adverb', r'\b(simply|merely|truly|actually|essentially|fundamentally|arguably|honestly|frankly|literally|really)\b'),
    ('stock phrase', r'\bthink of it as\b|\bin other words\b|\bthe whole point\b|\bat its core\b|\bthe real question\b|\bwhich is (what|why)\b|\bwhether you\'re\b|\bhere\'s (the thing|why|how)\b|^imagine\b|\bthe (catch|result|kicker|secret)\?|\bmore than just\b|\bnot your (average|typical)\b|\bit\'s (all )?about\b'),
    ('Claude habit', r'\bdeliberate(ly)?\b|\bevery single\b|\bload[- ]bearing\b|\bearns its keep\b|\brather than merely\b|\bsingle most\b|\bless like\b.*\bmore like\b'),
    ('gerund tail', r',\s*(ensuring|allowing|highlighting|reflecting|showcasing|making it|creating|leaving you|giving you|helping you|resulting in)\b'),
    ('ball theme left over', r'\b(dances?|dance card|ball|gala|waltz|RSVP|evening\'s programme|tonight)\b'),
]
NEED_PAIR = {'restatement'}

def words(s):
    return [w for w in re.findall(r"[a-z']+", s.lower()) if len(w) > 3]

def sentences(t):
    return [x for x in re.split(r'(?<=[.?!])\s+', t) if x]

def check(t):
    hits = []
    for name, pat in RULES:
        for s in sentences(t) if name in ('demonstrative gloss', 'split contrast') else [t]:
            if re.search(pat, s, re.I if name not in ('demonstrative gloss',) else 0):
                hits.append(name); break
    ss = sentences(t)
    for a, b in zip(ss, ss[1:]):
        wa, wb = set(words(a)), set(words(b))
        if len(wb) >= 3 and len(wa & wb) / len(wb) >= .75:
            hits.append('restatement'); break
    return hits

# ---- where the copy comes from ----
def from_html(path):
    s = open(path, encoding='utf-8').read()
    for m in re.finditer(r'<script>window\.CG_\w+ = (.*?);</script>', s, re.S):
        for x in re.findall(r'"([^"\\]*(?:\\.[^"\\]*)*)"', m.group(1)):
            if ' ' in x: yield x
    s = re.sub(r'<(script|style)[\s\S]*?</\1>', ' ', s)
    s = re.sub(r'<!--[\s\S]*?-->', ' ', s)
    for m in re.finditer(r'\s(?:content|placeholder|alt|title|aria-label)="([^"]+)"', s):
        yield html.unescape(m.group(1))
    s = re.sub(r'<(br|/p|/li|/h\d|/dt|/dd|/td|/th|/summary|/button|/a|/label|/option|/span|/b|/em|/div)\b[^>]*>', '\n', s)
    s = re.sub(r'<[^>]+>', '', s)
    for line in s.split('\n'):
        t = re.sub(r'\s+', ' ', html.unescape(line)).strip()
        if len(t) > 2: yield t

CODEY = re.compile(r'[{}=;<>]|=>|\$\{|\bfunction\b|^\.|^#|^\w+\(|/\w+\.|\.(webp|png|js|css|html|svg|bin)\b|^[\w-]+$')
def from_js(path):
    s = open(path, encoding='utf-8').read()
    s = re.sub(r'^\s*//.*$', '', s, flags=re.M)
    for m in re.finditer(r"'((?:[^'\\\n]|\\.)*)'|\"((?:[^\"\\\n]|\\.)*)\"|`((?:[^`\\]|\\.)*)`", s):
        t = next(g for g in m.groups() if g is not None)
        t = re.sub(r'\$\{[^}]*\}', 'X', t)
        if len(t.split()) >= 3 and not CODEY.search(t):
            yield t

def from_py(path):
    s = open(path, encoding='utf-8').read()
    for m in re.finditer(r"'((?:[^'\\\n]|\\.)*)'|\"((?:[^\"\\\n]|\\.)*)\"", s):
        t = next(g for g in m.groups() if g is not None)
        if len(t.split()) >= 3 and not CODEY.search(t):
            yield t.replace("\\'", "'")

def allowed():
    p = os.path.join(ROOT, 'tools', 'lint_allow.txt'); out = set()
    if os.path.exists(p):
        for line in open(p, encoding='utf-8'):
            if '|' in line and not line.startswith('#'):
                out.add(line.split('|')[0].strip())
    return out

# ---- the lint checks itself first, so a rule cannot rot into one that matches nothing ----
BAD = {
    'Set to Lower face. That is the treated area.': 'demonstrative gloss',
    'Wrinkles compared. Displacement was not.': 'split contrast',
    'It is not a filler, it is a booster.': 'negative parallelism',
    'The shadow is the lamp, not the treatment.': 'negative parallelism',
    'Tall post 3:4, so nothing is cut.': 'reassurance',
    'The files are read in this tab and never sent anywhere.': 'promise as mechanism',
    'A seamless way to elevate your look.': 'AI vocabulary',
    'It actually works on the skin.': 'filler adverb',
    'Think of it as a reset for tired skin.': 'stock phrase',
    'Botox relaxes the muscle, ensuring a smooth finish.': 'gerund tail',
    'Results show in a week — sometimes sooner.': 'dash',
    'Book now and glow!': 'exclamation',
    'Each dance is one treatment on the card.': 'ball theme left over',
    'Profhilo hydrates dry skin. Profhilo hydrates dry skin well.': 'restatement',
    'Whether you\'re 30 or 40, there is a plan.': 'stock phrase',
}
GOOD = [
    'The unit is skin area in the plane of the photograph since it cannot measure millilitres.',
    'Wrinkles were compared while displacement was not.',
    'No file uploaded.',
    'Swelling for 1 to 2 days.',
    'Tap an area to see which treatments work there, what each costs and how long it lasts.',
    'Your doctor confirms the plan and the amount at the consultation.',
    'Botox softens lines from movement while filler fills hollows and folds.',
    'Starting prices at Apex.',
]
def selftest():
    bad = 0
    for t, want in BAD.items():
        if want not in check(t): print(f'SELF-TEST: rule "{want}" missed: {t}'); bad += 1
    for t in GOOD:
        if check(t): print(f'SELF-TEST: good line flagged {check(t)}: {t}'); bad += 1
    return bad

def main(args):
    if selftest(): print('lint self-test failed'); return 2
    if args: files = args
    else:
        files = sorted(glob.glob(os.path.join(ROOT, '*.html'))) + sorted(glob.glob(os.path.join(ROOT, 'assets/js/*.js'))) + sorted(glob.glob(os.path.join(ROOT, 'assets/features/*/*.js'))) \
              + [os.path.join(ROOT, 'tools', 'tx_content.py')]
    ok = allowed(); hits = 0; seen = set()
    for f in files:
        src = from_html(f) if f.endswith('.html') else from_js(f) if f.endswith('.js') else from_py(f)
        for t in src:
            if t in seen or t in ok: continue
            seen.add(t)
            found = check(t)
            if found:
                hits += 1; print(f'{os.path.relpath(f, ROOT)}: [{", ".join(found)}] {t}')
    print(f'{hits} line(s) to fix' if hits else 'copy lint: clean')
    return 1 if hits else 0

if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
