"""Build the hero films from the Blender frames.
Open clip: frames 90..284. Loop clip: 285..340, then 341..364 cross-faded into 261..284,
so the loop's last frame is 284 and its next frame is 285, and the open clip hands over at the same seam."""
import subprocess, sys, os, numpy as np
from PIL import Image
SRC = sys.argv[1]; OUT = sys.argv[2]; K = 24
GRADE = "curves=all='0/0 0.22/0.15 0.5/0.47 0.8/0.84 1/1',eq=saturation=1.15,unsharp=5:5:0.5"
tmp = '/tmp/herobuild'; os.makedirs(tmp + '/open', exist_ok=True); os.makedirs(tmp + '/loop', exist_ok=True)
L = lambda f: np.asarray(Image.open(f'{SRC}/{f:04d}.png').convert('RGB'), np.float32)
for i, f in enumerate(range(90, 261 + K)):
    (os.path.lexists(f'{tmp}/open/{i:04d}.png') or os.symlink(f'{SRC}/{f:04d}.png', f'{tmp}/open/{i:04d}.png'))
n = 0
for f in range(261 + K, 341):
    Image.open(f'{SRC}/{f:04d}.png').convert('RGB').save(f'{tmp}/loop/{n:04d}.png'); n += 1
for m in range(K):
    w = (m + 1) / K; w = w * w * (3 - 2 * w)
    a, b = L(341 + m), L(261 + m)
    Image.fromarray(np.clip(a * (1 - w) + b * w + .5, 0, 255).astype(np.uint8)).save(f'{tmp}/loop/{n:04d}.png'); n += 1
print('loop frames', n)
def enc(name, d):
    base = ['ffmpeg', '-v', 'error', '-y', '-framerate', '24', '-i', f'{tmp}/{d}/%04d.png', '-vf', GRADE + ',format=yuv420p']
    subprocess.run(base + ['-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-g', '48', '-movflags', '+faststart', '-an', f'{OUT}/{name}.mp4'], check=True)
    subprocess.run(base + ['-c:v', 'libvpx-vp9', '-crf', '34', '-b:v', '0', '-row-mt', '1', '-g', '48', '-an', f'{OUT}/{name}.webm'], check=True)
enc('hero-open', 'open'); enc('hero-loop', 'loop')
# stills: poster = first open frame, ballroom = first loop frame, same grade
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{tmp}/open/0000.png', '-vf', GRADE, '-quality', '82', f'{OUT}/../img/hero-poster.webp'], check=True)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{tmp}/loop/0000.png', '-vf', GRADE, '-quality', '82', f'{OUT}/../img/ballroom.webp'], check=True)
