# Builds the WordPress theme zip IT installs.
#   python3 wordpress/tools/build_theme.py
# 1. Packs the content for `wp apex import` and the face planner data (export_content.py).
# 2. Copies the theme and the site's assets (styles, scripts, fonts, images, the 3D head) into one folder.
# 3. Zips it as wordpress/dist/apex-contour-glow-theme-<version>.zip. Version in style.css and APEX_VERSION in
#    functions.php must agree, or the build stops.
import os, re, shutil, subprocess, sys, zipfile
HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(os.path.dirname(HERE))
THEME = os.path.join(SITE, 'wordpress', 'theme', 'apex-contour-glow')
DIST = os.path.join(SITE, 'wordpress', 'dist')

subprocess.run([sys.executable, os.path.join(HERE, 'export_content.py')], check=True)
ver = re.search(r'^Version:\s*(\S+)', open(os.path.join(THEME, 'style.css')).read(), re.M).group(1)
php = re.search(r"define\( 'APEX_VERSION', '([^']+)' \)", open(os.path.join(THEME, 'functions.php')).read()).group(1)
if ver != php: sys.exit(f'version mismatch: style.css {ver}, functions.php {php}')

out = os.path.join(DIST, 'build', 'apex-contour-glow')
shutil.rmtree(os.path.join(DIST, 'build'), ignore_errors=True)
shutil.copytree(THEME, out, symlinks=False, ignore=shutil.ignore_patterns('assets', '__pycache__', '.DS_Store'))
# images Apex sent that no page shows stay out of the package
shutil.copytree(os.path.join(SITE, 'assets'), os.path.join(out, 'assets'), ignore=shutil.ignore_patterns('skinvive-g*.webp', '*.py', '__pycache__'))
for f in os.listdir(DIST):
    if f.startswith('apex-contour-glow-theme') and f.endswith('.zip'): os.remove(os.path.join(DIST, f))
zpath = os.path.join(DIST, f'apex-contour-glow-theme-{ver}.zip')
with zipfile.ZipFile(zpath, 'w', zipfile.ZIP_DEFLATED) as z:
    for root, _, files in os.walk(out):
        for f in sorted(files):
            p = os.path.join(root, f)
            z.write(p, os.path.relpath(p, os.path.dirname(out)))
shutil.rmtree(os.path.join(DIST, 'build'))
print(f'wrote {os.path.relpath(zpath, SITE)} ({os.path.getsize(zpath) // 1024} KB)')
