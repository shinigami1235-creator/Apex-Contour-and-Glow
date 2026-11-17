# Checks the parts of the WordPress site a visitor and the staff use. Run with the test server up:
#   python3 tests/wordpress/flows.py [http://localhost:8081]
# Needs WP-CLI on the same machine (wp --allow-root --path=$WP_PATH).
import asyncio, json, os, subprocess, sys
from playwright.async_api import async_playwright
BASE = (sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8081').rstrip('/')
WP = f"wp --allow-root --path={os.environ.get('WP_PATH', '/home/claude/wpcg/site')}"
USER, PASS = os.environ.get('WP_USER', 'apex-admin'), os.environ.get('WP_PASS', 'apex-test-123')
wp = lambda c: subprocess.run(f'{WP} {c}', shell=True, capture_output=True, text=True).stdout.strip()
fails = []
def check(ok, what):
    print(('ok  ' if ok else 'FAIL'), what)
    if not ok: fails.append(what)

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={'width': 1300, 'height': 900})
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        line = []
        async def stop(r): line.append(r.request.url); await r.abort()
        await pg.route('https://line.me/**', stop)
        before = len(wp('post list --post_type=apex_lead --post_status=any --format=ids').split())
        await pg.goto(BASE + '/'); await pg.wait_for_timeout(1200)
        check(await pg.is_visible('#apex-ck'), 'cookie banner shows on the first visit')
        await pg.click('#apex-ck [data-ck=none]')
        check(not await pg.is_visible('#apex-ck'), 'cookie banner closes')
        await pg.fill('#book-form [name=name]', 'Test Person'); await pg.fill('#book-form [name=phone]', '081 234 5678')
        await pg.select_option('#book-form [name=treatment]', 'Profhilo'); await pg.select_option('#book-form [name=branch]', 'Central Rama 9, 5th Floor'); await pg.check('#book-form [name=consent]')
        await pg.click('#book-form button[type=submit]'); await pg.wait_for_timeout(2500)
        ids = wp('post list --post_type=apex_lead --post_status=any --format=ids').split()
        check(len(ids) == before + 1, 'booking form saves an enquiry')
        if ids:
            f = json.loads(wp(f'post meta get {ids[0]} apex_fields --format=json') or '{}')
            check(f.get('name') == 'Test Person' and f.get('treatment') == 'Profhilo' and f.get('branch') == 'Central Rama 9, 5th Floor', 'enquiry holds the name, treatment and branch')
            wp(f'post delete {ids[0]} --force')
        check(any('oaMessage' in u for u in line), 'LINE opens with the message')
        await pg.unroute('https://line.me/**')
        r = await pg.request.post(BASE + '/wp-json/apex/v1/book', data={'name': 'X Y', 'consent': False})
        check(r.status == 422, 'booking without consent is refused')
        await pg.goto(BASE + '/botox.html')
        check(pg.url.endswith('/treatments/botox/'), 'old .html address redirects')
        await pg.goto(BASE + '/compare/?a=profhilo&b=filler'); await pg.wait_for_timeout(800)
        check('/treatments/profhilo/' in await pg.eval_on_selector('a[data-s="a"][data-f="link"]', 'a => a.href'), 'compare links to the treatment page')
        check(not errs, 'no script errors on the pages')
        # staff: every settings page saves without changing the content
        await pg.goto(BASE + '/wp-login.php'); await pg.fill('#user_login', USER); await pg.fill('#user_pass', PASS); await pg.click('#wp-submit'); await pg.wait_for_load_state()
        for k in ['settings', 'home', 'compare', 'planner', 'privacy']:
            await pg.goto(f'{BASE}/wp-admin/admin.php?page=apex-{k}'); await pg.click('#submit'); await pg.wait_for_load_state()
        for i in wp('post list --post_type=apex_tx --format=ids').split()[:3]:
            await pg.goto(f'{BASE}/wp-admin/post.php?post={i}&action=edit'); await pg.click('#publish'); await pg.wait_for_load_state()
        out = subprocess.run(f'{WP} apex check', shell=True, capture_output=True, text=True)
        check(out.returncode == 0, 'saving the admin forms unchanged keeps the content the same')
        await b.close()
    print(f'{len(fails)} failed' if fails else 'all passed')
    sys.exit(1 if fails else 0)
asyncio.run(main())
