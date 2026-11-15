# Builds every page, then runs the copy lint. The build fails if the lint finds anything.
# Run: python3 tools/build_all.py
import os, subprocess, sys
T = os.path.dirname(os.path.abspath(__file__))
for s in ('build_home.py', 'build_tx.py', 'build_compare.py', 'build_privacy.py'):
    subprocess.run([sys.executable, os.path.join(T, s)], check=True)
sys.exit(subprocess.run([sys.executable, os.path.join(T, 'lint_copy.py')]).returncode)
