// Apex Contour and Glow: curtain opening, waltz playback, fitting tags and the before/after compare.
(() => {
  const body = document.body;
  const LOOP_START = 9.6, LOOP_END = 69.6;   // the intro plays once, then bars 9 to 58 loop
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    sget(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    sset(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  };

  // ---- music ----
  let ctx, buffer, src, playing = false;
  const soundBtn = document.getElementById('sound');
  async function loadMusic() {
    if (buffer) return buffer;
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    const res = await fetch('assets/audio/waltz.mp3');
    buffer = await ctx.decodeAudioData(await res.arrayBuffer());
    return buffer;
  }
  async function play(fromStart) {
    await loadMusic();
    if (ctx.state === 'suspended') await ctx.resume();
    stop();
    src = ctx.createBufferSource(); src.buffer = buffer;
    src.loop = true; src.loopStart = LOOP_START; src.loopEnd = LOOP_END;
    const gain = ctx.createGain(); gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.8, ctx.currentTime + 1.2);
    src.connect(gain).connect(ctx.destination);
    src.start(0, fromStart ? 0 : LOOP_START);
    playing = true; soundBtn.setAttribute('aria-pressed', 'true'); store.set('cg-music', 'on');
  }
  function stop() {
    if (src) { try { src.stop(); } catch (e) {} src = null; }
    playing = false; soundBtn.setAttribute('aria-pressed', 'false');
  }
  if (soundBtn) soundBtn.addEventListener('click', () => {
    if (playing) { stop(); store.set('cg-music', 'off'); } else { play(false); }
  });

  // ---- curtain (home page only) ----
  const curtain = document.getElementById('curtain');
  if (curtain) {
    const musicOn = document.getElementById('music-on');
    if (store.get('cg-music') === 'off') musicOn.checked = false;
    const skip = store.sget('cg-seen') || (location.hash && location.hash !== '#top');
    // Rendered film: the opening plays on the curtain, then the ballroom loop takes over.
    // If the films are missing or motion is reduced, the CSS curtain halves open instead.
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cv = document.getElementById('curtain-vid'), bv = document.getElementById('ball-vid');
    let film = false;
    const startLoop = () => { if (!bv || still) return; bv.preload = 'auto'; bv.play().then(() => document.querySelector('.ballroom').classList.add('live')).catch(() => {}); };
    if (cv && !still && !skip) {
      cv.addEventListener('loadeddata', () => { film = true; curtain.classList.add('film'); }, { once: true });
      cv.load();
    }
    const finish = () => { body.classList.remove('has-curtain', 'opening'); body.classList.add('opened'); };
    if (skip) { finish(); startLoop(); }
    document.getElementById('open-curtain').addEventListener('click', () => {
      store.sset('cg-seen', '1');
      if (musicOn.checked) play(true); else store.set('cg-music', 'off');
      if (film) {
        curtain.classList.add('rolling');
        bv && (bv.preload = 'auto', bv.load());
        cv.play().catch(() => { film = false; });
        cv.addEventListener('ended', () => { startLoop(); curtain.classList.add('done'); setTimeout(finish, 900); }, { once: true });
        if (film) return;
      }
      body.classList.add('opening');
      setTimeout(() => { finish(); startLoop(); }, 2700);
    });
  }

  // ---- fitting room tags drop in when the section comes into view ----
  const fit = document.getElementById('fitting');
  if (fit && 'IntersectionObserver' in window) {
    new IntersectionObserver((es, ob) => es.forEach(e => { if (e.isIntersecting) { fit.classList.add('in'); ob.disconnect(); } }), { threshold: 0.25 }).observe(fit);
  } else if (fit) fit.classList.add('in');

  // ---- before and after: a misted mirror. The before shows through the mist, and wiping it shows the after. ----
  const cmp = document.getElementById('compare');
  if (cmp && cmp.classList.contains('fogmirror')) {
    const glass = cmp.querySelector('.fm-glass'), after = cmp.querySelector('.after'), before = cmp.querySelector('.before');
    const cv = cmp.querySelector('.fm-fog'), ctx = cv.getContext('2d'), fog = document.createElement('canvas'), fx = fog.getContext('2d');
    const kind = cmp.dataset.set || 'profhilo', still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let W = 0, H = 0, dpr = 1, last = 0, held = false, prev = null, raf = 0, demoed = false, wiped = 0;
    const cover = (c, img, w, h) => {
      const r = Math.max(w / img.naturalWidth, h / img.naturalHeight), iw = img.naturalWidth * r, ih = img.naturalHeight * r;
      c.drawImage(img, (w - iw) / 2, (h - ih) / 2, iw, ih);
    };
    // the mist: the before photo under a pale haze, uneven like breath on glass, with a few drops
    const buildFog = () => {
      fog.width = W; fog.height = H;
      fx.save(); fx.filter = 'blur(' + (1.2 * dpr) + 'px)'; cover(fx, before, W, H); fx.restore();
      fx.fillStyle = 'rgba(236,230,243,.30)'; fx.fillRect(0, 0, W, H);
      let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
      for (let i = 0; i < 26; i++) {
        const x = rnd() * W, y = rnd() * H, r = (.12 + rnd() * .3) * W, g = fx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `rgba(245,240,250,${.05 + rnd() * .09})`); g.addColorStop(1, 'rgba(245,240,250,0)');
        fx.fillStyle = g; fx.fillRect(0, 0, W, H);
      }
      for (let i = 0; i < 70; i++) {
        const x = rnd() * W, y = rnd() * H, r = (.6 + rnd() * 2.2) * dpr;
        fx.fillStyle = 'rgba(255,255,255,.35)'; fx.beginPath(); fx.arc(x, y, r, 0, 7); fx.fill();
        fx.fillStyle = 'rgba(60,40,70,.18)'; fx.beginPath(); fx.arc(x + r * .4, y + r * .5, r * .7, 0, 7); fx.fill();
      }
    };
    const mist = () => { ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.clearRect(0, 0, W, H); ctx.drawImage(fog, 0, 0); wiped = 0; };
    const size = () => {
      const r = glass.getBoundingClientRect(); dpr = Math.min(2, devicePixelRatio || 1);
      W = cv.width = Math.round(r.width * dpr); H = cv.height = Math.round(r.height * dpr);
      if (before.complete && before.naturalWidth) { buildFog(); mist(); cmp.classList.add('ready'); }
    };
    const wipe = (x0, y0, x1, y1) => {
      const R = W * .11, d = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.ceil(d / (R * .25)));
      ctx.globalCompositeOperation = 'destination-out'; ctx.globalAlpha = 1;
      for (let i = 0; i <= n; i++) {
        const x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n, g = ctx.createRadialGradient(x, y, R * .35, x, y, R);
        g.addColorStop(0, 'rgba(0,0,0,.9)'); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, R, 0, 7); ctx.fill();
      }
      last = performance.now(); wiped += d; tick();
    };
    // the mist creeps back a few seconds after you stop, unless the mirror was cleared on purpose
    const tick = () => {
      if (raf) return;
      const step = now => {
        raf = 0;
        if (held || !wiped) return;
        if (now - last > 4000) {
          ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = .018; ctx.drawImage(fog, 0, 0); ctx.globalAlpha = 1;
          if (now - last > 9000) { mist(); return; }
        }
        raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    const at = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * dpr, (e.clientY - r.top) * dpr]; };
    cv.addEventListener('pointerdown', e => { held = false; prev = at(e); try { cv.setPointerCapture(e.pointerId); } catch (er) {} wipe(...prev, ...prev); cmp.classList.add('touched'); });
    cv.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse' && !e.buttons) return;
      const p = at(e); if (!prev) prev = p;
      held = false; wipe(...prev, ...p); prev = p; cmp.classList.add('touched');
    });
    cv.addEventListener('pointerleave', () => prev = null);
    cv.addEventListener('pointerup', () => prev = null);
    cmp.querySelector('[data-fm="clear"]').addEventListener('click', () => {
      held = true; let k = 0;
      const sweep = () => { ctx.globalCompositeOperation = 'destination-out'; ctx.globalAlpha = .14; ctx.fillRect(0, 0, W, H); if (++k < 30) requestAnimationFrame(sweep); else ctx.clearRect(0, 0, W, H); };
      still ? ctx.clearRect(0, 0, W, H) : sweep();
    });
    cmp.querySelector('[data-fm="fog"]').addEventListener('click', () => { held = false; mist(); });
    // on first sight, one slow wipe across the glass shows what to do
    const demo = () => {
      if (demoed || still || cmp.classList.contains('touched')) return; demoed = true;
      const t0 = performance.now(), pts = t => [W * (.18 + .64 * t), H * (.42 + .1 * Math.sin(t * 6.3))];
      let p = pts(0);
      const go = now => { const t = Math.min(1, (now - t0) / 1400), q = pts(t); wipe(...p, ...q); p = q; if (t < 1) requestAnimationFrame(go); };
      requestAnimationFrame(go);
    };
    new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting && cmp.classList.contains('ready')) setTimeout(demo, 500); }), { threshold: .6 }).observe(cv);
    before.addEventListener('load', size); new ResizeObserver(size).observe(glass); size();
    document.querySelectorAll('#thumbs button').forEach(b => b.addEventListener('click', () => {
      document.querySelectorAll('#thumbs button').forEach(x => x.classList.toggle('on', x === b));
      const i = b.dataset.i; held = false;
      after.src = `assets/img/${kind}-${i}-after.webp`; before.src = `assets/img/${kind}-${i}-before.webp`;
    }));
  }

  // ---- gallery lightbox ----
  const items = [...document.querySelectorAll('.gal-item')];
  if (items.length) {
    const lb = document.createElement('div'); lb.className = 'lightbox';
    lb.innerHTML = '<img alt=""><button class="lb-close" aria-label="Close">×</button><button class="lb-prev" aria-label="Previous">‹</button><button class="lb-next" aria-label="Next">›</button>';
    document.body.appendChild(lb);
    const img = lb.querySelector('img'); let cur = 0;
    const show = i => { cur = (i + items.length) % items.length; img.src = items[cur].dataset.full; img.alt = items[cur].querySelector('img').alt; lb.classList.add('on'); };
    items.forEach((b, i) => b.addEventListener('click', () => show(i)));
    lb.querySelector('.lb-close').onclick = () => lb.classList.remove('on');
    lb.querySelector('.lb-prev').onclick = () => show(cur - 1);
    lb.querySelector('.lb-next').onclick = () => show(cur + 1);
    lb.addEventListener('click', e => { if (e.target === lb) lb.classList.remove('on'); });
    document.addEventListener('keydown', e => { if (!lb.classList.contains('on')) return;
      if (e.key === 'Escape') lb.classList.remove('on'); if (e.key === 'ArrowLeft') show(cur - 1); if (e.key === 'ArrowRight') show(cur + 1); });
  }
})();

// ---- vanity mirror: a face of sparkling lights, the areas beside it, and the 3D filler head (home page) ----
(() => {
  const sec = document.getElementById('mirror');
  if (!sec || !window.CG_ZONES) return;
  const { zones, names, verts } = window.CG_ZONES;
  const out = sec.querySelector('.mo-list'), empty = sec.querySelector('.mo-empty');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let picked = null;
  sec.querySelectorAll('.fz').forEach(b => b.addEventListener('click', () => {
    picked = b.dataset.z;
    sec.querySelectorAll('.fz').forEach(x => x.setAttribute('aria-pressed', x === b));
    const list = zones[picked] || [];
    out.querySelector('.mo-title').textContent = names[picked];
    out.querySelector('ul').innerHTML = list.map(e =>
      `<li class="${e.half.toLowerCase()}"><a href="${e.slug}.html"><b>${esc(e.name)}</b><span>${esc(e.half)}</span></a>${e.note ? `<em>${esc(e.note)}</em>` : ''}</li>`).join('');
    empty.hidden = true; out.hidden = false;
  }));

  // the sparkling face, with a gold thread from each area name to its place on the face
  const stage = sec.querySelector('.mirror-stage'), host = document.getElementById('mirror-head');
  const leads = sec.querySelector('.mirror-leads'), ctx = leads.getContext('2d');
  const btn = {}; sec.querySelectorAll('.fz-col .fz').forEach(b => btn[b.dataset.z] = b);
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches, narrow = matchMedia('(max-width: 700px)');
  narrow.addEventListener('change', () => sec.querySelectorAll('.fz-col .fz').forEach(b => b.style.top = ''));
  let head = null, onScreen = false;
  const draw = () => {
    if (!head) return;
    const sr = stage.getBoundingClientRect(), hr = host.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
    if (leads.width !== Math.round(sr.width * dpr) || leads.height !== Math.round(sr.height * dpr)) { leads.width = Math.round(sr.width * dpr); leads.height = Math.round(sr.height * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, sr.width, sr.height);
    if (narrow.matches) {
      if (!picked || !verts[picked]) return;
      const a = head.anchor(verts[picked]), x = a.x + hr.left - sr.left, y = a.y + hr.top - sr.top, r = 14 + 4 * Math.sin(performance.now() / 300);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(255,240,205,.95)'); g.addColorStop(1, 'rgba(230,200,143,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
      return;
    }
    for (const side of ['l', 'r']) {
      const items = Object.keys(btn).filter(k => btn[k].parentElement.classList.contains('fz-' + side)).map(k => {
        const a = head.anchor(verts[k]); return { k, a, x: a.x + hr.left - sr.left, y: a.y + hr.top - sr.top };
      }).sort((p, q) => p.y - q.y);
      // labels follow their area up and down, never closer than one label height
      let last = -1e9;
      for (const it of items) {
        const b = btn[it.k], h = b.offsetHeight + 6;
        const y = Math.max(it.y, last + h); last = y;
        b.style.top = (y - b.offsetHeight / 2) + 'px';
        const br = b.getBoundingClientRect();
        const lx = side === 'l' ? br.right - sr.left + 4 : br.left - sr.left - 4, ly = y;
        const on = it.k === picked, al = (.25 + .55 * it.a.front) * (on ? 1.6 : 1);
        ctx.strokeStyle = `rgba(230,200,143,${Math.min(1, al)})`; ctx.lineWidth = on ? 1.4 : .8;
        ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + (side === 'l' ? 14 : -14), ly); ctx.lineTo(it.x, it.y); ctx.stroke();
        const g = ctx.createRadialGradient(it.x, it.y, 0, it.x, it.y, on ? 12 : 7);
        g.addColorStop(0, `rgba(255,240,205,${.9 * it.a.front + .1})`); g.addColorStop(1, 'rgba(230,200,143,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(it.x, it.y, on ? 12 : 7, 0, 7); ctx.fill();
      }
    }
  };
  const start = () => {
    if (head !== null) return; head = false;
    import('./../features/filler/head.js').then(m => m.createHead(host, {
      base: 'assets/', sparkle: true, wipe: 0, yaw: 0, gender: 'female', zoom: .74,
      visible: () => onScreen && !sec.querySelector('[data-panel="map"]').hidden,
      onFrame: () => { if (!still && head) head.setYaw(Math.sin(performance.now() / 4000) * .22); draw(); }
    })).then(h => { head = h; stage.classList.add('live'); draw(); }).catch(() => { head = null; stage.classList.add('flat'); });
  };
  new IntersectionObserver(es => es.forEach(e => { onScreen = e.isIntersecting; if (onScreen) start(); }), { rootMargin: '200px' }).observe(stage);
  addEventListener('resize', draw);

  let mounted = false;
  sec.querySelectorAll('[data-tab]').forEach(t => t.addEventListener('click', () => {
    sec.querySelectorAll('[data-tab]').forEach(x => x.setAttribute('aria-selected', x === t));
    sec.querySelectorAll('[data-panel]').forEach(p => p.hidden = p.dataset.panel !== t.dataset.tab);
    if (t.dataset.tab === 'sim' && !mounted) {
      mounted = true;
      import('./../features/filler/index.js').then(m => m.mount(document.getElementById('filler-sim'),
        { lang: 'en', base: 'assets/', noPlan: true, sparkle: true, consult: 'index.html#rsvp' })).catch(() => { mounted = false; });
    }
  }));
})();
