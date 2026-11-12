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

  // ---- before and after: the magic mirror. A gold line sweeps across on its own once, then follows your finger or mouse. ----
  const cmp = document.getElementById('compare');
  if (cmp && cmp.classList.contains('smokemirror')) {
    const glass = cmp.querySelector('.sm-glass'), before = cmp.querySelector('.before'), after = cmp.querySelector('.after');
    const range = cmp.querySelector('.sm-range'), kind = cmp.dataset.set || 'profhilo';
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let run = 0;
    const set = v => { v = Math.max(0, Math.min(100, v)); before.style.clipPath = `inset(0 ${100 - v}% 0 0)`; glass.style.setProperty('--x', v + '%'); range.value = v; };
    const ease = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    // one slow pass: all before, across to all after, then back to the middle
    const play = () => {
      const id = ++run; if (still) { set(50); return; }
      const keys = [[0, 100], [700, 100], [2600, 0], [3300, 0], [4500, 50]], t0 = performance.now();
      const step = now => {
        if (id !== run) return;
        const t = now - t0; let k = 0; while (k < keys.length - 2 && t > keys[k + 1][0]) k++;
        const [ta, va] = keys[k], [tb, vb] = keys[k + 1], u = Math.min(1, Math.max(0, (t - ta) / (tb - ta)));
        set(va + (vb - va) * ease(u));
        if (t < keys[keys.length - 1][0]) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    set(50);
    const at = e => { const r = glass.getBoundingClientRect(); return (e.clientX - r.left) / r.width * 100; };
    let drag = false;
    glass.addEventListener('pointerdown', e => { run++; drag = true; try { glass.setPointerCapture(e.pointerId); } catch (er) {} set(at(e)); });
    glass.addEventListener('pointermove', e => { if (drag || e.pointerType === 'mouse') { if (!drag && e.pointerType === 'mouse' && !e.buttons) return; run++; set(at(e)); } });
    glass.addEventListener('pointerup', () => drag = false); glass.addEventListener('pointercancel', () => drag = false);
    range.addEventListener('input', () => { run++; set(+range.value); });
    cmp.querySelector('[data-sm="play"]').addEventListener('click', play);
    let seen = false;
    new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting && !seen) { seen = true; setTimeout(play, 300); } }), { threshold: .55 }).observe(glass);
    document.querySelectorAll('#thumbs button').forEach(b => b.addEventListener('click', () => {
      document.querySelectorAll('#thumbs button').forEach(x => x.classList.toggle('on', x === b));
      const i = b.dataset.i; run++;
      Promise.all([before, after].map((img, k) => new Promise(r => { img.onload = r; img.onerror = r; img.src = `assets/img/${kind}-${i}-${k ? 'after' : 'before'}.webp`; }))).then(play);
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
      base: 'assets/', sparkle: true, sparse: true, features: true, centre: true, wipe: 0, yaw: -.4, gender: 'female', zoom: .74,
      visible: () => onScreen && !sec.querySelector('[data-panel="map"]').hidden,
      onFrame: () => { if (!still && head) head.setYaw(-.4 + Math.sin(performance.now() / 5000) * .12); draw(); }
    })).then(h => { head = h; window.CG_mirrorHead = h; stage.classList.add('live'); draw(); document.dispatchEvent(new Event('cg:mirror-ready')); }).catch(() => { head = null; stage.classList.add('flat'); });
  };
  new IntersectionObserver(es => es.forEach(e => { onScreen = e.isIntersecting; if (onScreen) start(); }), { rootMargin: '200px' }).observe(stage);
  addEventListener('resize', draw);

  let mounted = false;
  // switching tabs: the face of lights drifts apart into dust and fades, then the other panel rises in
  let busy = false;
  const tween = (ms, fn) => new Promise(res => { const t0 = performance.now(); const f = now => { const u = Math.min(1, (now - t0) / ms); fn(u); u < 1 ? requestAnimationFrame(f) : res(); }; requestAnimationFrame(f); });
  sec.querySelectorAll('[data-tab]').forEach(t => t.addEventListener('click', async () => {
    const to = sec.querySelector(`[data-panel="${t.dataset.tab}"]`), from = sec.querySelector('[data-panel]:not([hidden])');
    if (busy || to === from) return; busy = true;
    sec.querySelectorAll('[data-tab]').forEach(x => x.setAttribute('aria-selected', x === t));
    if (!still) {
      from.classList.add('leaving');
      await tween(520, u => { if (from.dataset.panel === 'map' && head) head.setFace({ scatter: u * u * .55 }); });
    }
    from.hidden = true; from.classList.remove('leaving');
    to.hidden = false; to.classList.add('arriving');
    if (to.dataset.panel === 'map' && head) { head.resize(); if (!still) tween(900, u => head.setFace({ scatter: (1 - u) * (1 - u) * .55 })); }
    requestAnimationFrame(() => requestAnimationFrame(() => to.classList.remove('arriving')));
    setTimeout(() => { busy = false; }, 300);
    if (t.dataset.tab === 'sim' && !mounted) {
      mounted = true;
      import('./../features/filler/index.js').then(m => m.mount(document.getElementById('filler-sim'),
        { lang: 'en', base: 'assets/', noPlan: true, sparkle: true, consult: 'index.html#rsvp' })).catch(() => { mounted = false; });
    }
  }));
})();

// ---- the guide: a small face of lights in a cameo that speaks one line per part of the evening ----
(() => {
  const cameo = document.getElementById('cameo');
  if (!cameo || !window.IntersectionObserver) return;
  const store = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };
  if (store.get('cg-guide') === 'off') return;
  const say = document.getElementById('cameo-say'), dust = document.getElementById('dust'), dx = dust.getContext('2d');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const LINES = {
    card: "Each dance is one treatment. Contour shapes the face, and Glow works on the skin.",
    fitting: "Every treatment follows these five steps, from the first talk to your follow-up.",
    mirror: "Tap an area of my face to see which treatments work there.",
    entrance: "Drag the gold line across the mirror to compare before and after.",
    rsvp: "Tell us what you'd like to try, and we reply on LINE or by phone."
  };
  const OPEN = "Good evening. I'll take you through tonight's programme.";
  let head = null, speaker = null, jawT = 0, jaw = 0, blinkAt = performance.now() + 2500, blink = 0, mouse = [0, 0], inMirror = false, moving = false;
  const said = new Set();

  // a line is spoken word by word; open vowels drop the jaw, closed consonants and pauses bring it back
  let talking = 0;
  const speak = (text, onFace) => {
    const id = ++talking; speaker = onFace; say.textContent = ''; say.classList.add('on');
    const words = text.split(' '); let w = 0;
    const next = () => {
      if (id !== talking) return;
      if (w >= words.length) { jawT = 0; setTimeout(() => { if (id === talking) say.classList.remove('on'); }, 3200); return; }
      const word = words[w++]; say.textContent = words.slice(0, w).join(' ');
      let c = 0;
      const syll = () => {
        if (id !== talking) return;
        if (c >= word.length) { jawT = 0; setTimeout(next, /[.,]$/.test(word) ? 260 : 70); return; }
        const ch = word[c++].toLowerCase();
        jawT = 'aeo'.includes(ch) ? .85 + Math.random() * .15 : 'iuy'.includes(ch) ? .45 : 'mbpfv'.includes(ch) ? 0 : .22;
        setTimeout(syll, 62);
      };
      syll();
    };
    next();
  };
  const face = () => speaker === 'mirror' ? window.CG_mirrorHead : head;

  // life: the jaw eases toward its target, the eyes blink every few seconds, and the head turns a little toward the pointer
  const life = now => {
    jaw += (jawT - jaw) * .35;
    if (now > blinkAt) { blink = Math.min(1, blink + .35); if (blink >= 1) blinkAt = now + 2800 + Math.random() * 3500; } else blink = Math.max(0, blink - .25);
    const f = face();
    if (f) f.setFace({ jaw, blink });
    if (head && !inMirror) { head.setYaw(-.35 + mouse[0] * .35); head.setPitch(.04 - mouse[1] * .12); }
    requestAnimationFrame(life);
  };
  addEventListener('pointermove', e => { mouse = [e.clientX / innerWidth - .5, e.clientY / innerHeight - .5]; });

  // dust: when the guide moves into the mirror, its lights drift across the page as gold dust and settle there
  const fly = (from, to) => new Promise(res => {
    if (still) return res();
    const dpr = Math.min(2, devicePixelRatio || 1); dust.width = innerWidth * dpr; dust.height = innerHeight * dpr; dx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const P = Array.from({ length: 140 }, () => ({ d: Math.random() * .35, s: (Math.random() - .5) * 140, r: .6 + Math.random() * 1.8 }));
    const t0 = performance.now(), T = 1300;
    const f = now => {
      const u = (now - t0) / T; dx.clearRect(0, 0, innerWidth, innerHeight);
      for (const p of P) {
        const v = Math.min(1, Math.max(0, (u - p.d) / .65)); if (v <= 0 || v >= 1) continue;
        const e = v * v * (3 - 2 * v), x = from[0] + (to[0] - from[0]) * e + Math.sin(e * Math.PI) * p.s, y = from[1] + (to[1] - from[1]) * e - Math.sin(e * Math.PI) * 90;
        const g = dx.createRadialGradient(x, y, 0, x, y, p.r * 4); g.addColorStop(0, `rgba(255,240,205,${(1 - Math.abs(v - .5) * 1.6) * .9})`); g.addColorStop(1, 'rgba(230,200,143,0)');
        dx.fillStyle = g; dx.beginPath(); dx.arc(x, y, p.r * 4, 0, 7); dx.fill();
      }
      u < 1.4 ? requestAnimationFrame(f) : (dx.clearRect(0, 0, innerWidth, innerHeight), res());
    };
    requestAnimationFrame(f);
  });
  const tween = (ms, fn) => new Promise(res => { if (still) { fn(1); return res(); } const t0 = performance.now(); const f = now => { const u = Math.min(1, (now - t0) / ms); fn(u); u < 1 ? requestAnimationFrame(f) : res(); }; requestAnimationFrame(f); });
  const centre = el => { let r = el.getBoundingClientRect(); if (!r.width) r = document.getElementById('mirror').getBoundingClientRect(); return [r.left + r.width / 2, Math.max(60, Math.min(innerHeight - 60, r.top + r.height / 2))]; };

  const intoMirror = async () => {
    const m = window.CG_mirrorHead, glass = document.querySelector('.mirror-stage .vanity');
    if (!m || !glass || moving || inMirror) return; moving = true; inMirror = true;
    m.setFace({ scatter: .55 });
    await tween(450, u => head && head.setFace({ scatter: u * .6 }));
    cameo.classList.add('away');
    await fly(centre(cameo), centre(glass));
    await tween(900, u => m.setFace({ scatter: (1 - u) * .55 }));
    moving = false;
    if (!said.has('mirror')) { said.add('mirror'); speak(LINES.mirror, 'mirror'); }
  };
  const outOfMirror = async () => {
    const m = window.CG_mirrorHead, glass = document.querySelector('.mirror-stage .vanity');
    if (!m || moving || !inMirror) return; moving = true;
    await tween(450, u => m.setFace({ scatter: u * .55 }));
    await fly(centre(glass), centre(cameo));
    m.setFace({ scatter: 0 });
    cameo.classList.remove('away');
    await tween(700, u => head && head.setFace({ scatter: (1 - u) * .6 }));
    inMirror = false; moving = false;
  };

  const start = () => {
    cameo.hidden = false;
    import('./../features/filler/head.js').then(m => m.createHead(document.getElementById('cameo-head'), {
      base: 'assets/', sparkle: true, sparse: true, features: true, centre: true, wipe: 0, yaw: -.35, gender: 'female', zoom: .7
    })).then(h => { head = h; requestAnimationFrame(life); if (!said.has('open')) { said.add('open'); setTimeout(() => speak(OPEN, 'cameo'), 600); } }).catch(() => { cameo.hidden = true; });
    ['card', 'fitting', 'mirror', 'entrance', 'rsvp'].map(id => document.getElementById(id)).filter(Boolean).forEach(p => io.observe(p));
  };
  const io = new IntersectionObserver(es => es.forEach(e => {
    const id = e.target.id;
    if (id === 'mirror') { e.isIntersecting ? (window.CG_mirrorHead ? intoMirror() : document.addEventListener('cg:mirror-ready', intoMirror, { once: true })) : outOfMirror(); return; }
    if (e.isIntersecting && !said.has(id) && !inMirror) { said.add(id); speak(LINES[id], 'cameo'); }
  }), { threshold: .45 });
  cameo.querySelector('.cameo-x').addEventListener('click', () => { store.set('cg-guide', 'off'); cameo.hidden = true; say.classList.remove('on'); talking++; });
  // the guide arrives once the curtain has opened
  const go = () => { start(); };
  document.body.classList.contains('opened') ? setTimeout(go, 400) : new MutationObserver((m, o) => { if (document.body.classList.contains('opened')) { o.disconnect(); setTimeout(go, 1200); } }).observe(document.body, { attributes: true });
})();
