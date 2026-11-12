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
  // the waltz starts at half volume, then after a minute eases down to a quiet background level.
  // It goes silent while you are in another tab or app and comes back when you return
  let ctx, buffer, src, gain, playing = false, startedAt = 0;
  const LOUD = .4, SOFT = .14, SOFT_AFTER = 60, SOFT_OVER = 25;
  const level = () => { const t = (performance.now() - startedAt) / 1000; return t < SOFT_AFTER ? LOUD : LOUD + (SOFT - LOUD) * Math.min(1, (t - SOFT_AFTER) / SOFT_OVER); };
  const rampTo = (v, sec) => { if (!gain) return; const g = gain.gain, now = ctx.currentTime; g.cancelScheduledValues(now); g.setValueAtTime(g.value, now); g.linearRampToValueAtTime(v, now + sec); };
  let away = false;
  const awayNow = () => document.hidden || !document.hasFocus();
  const onAway = () => {
    const a = awayNow(); if (a === away || !playing) { away = a; return; } away = a;
    if (a) { rampTo(0, .25); setTimeout(() => { if (away && ctx) ctx.suspend(); }, 300); }
    else ctx.resume().then(() => { rampTo(level(), 1); fadeLater(); });
  };
  document.addEventListener('visibilitychange', onAway); addEventListener('blur', onAway); addEventListener('focus', onAway); addEventListener('pagehide', onAway);
  let softT = 0;
  const fadeLater = () => { clearTimeout(softT); const t = (performance.now() - startedAt) / 1000; if (t < SOFT_AFTER + SOFT_OVER) softT = setTimeout(() => { if (playing && !away) rampTo(SOFT, Math.max(1, SOFT_OVER - Math.max(0, t - SOFT_AFTER))); }, Math.max(0, SOFT_AFTER - t) * 1000); };
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
    gain = ctx.createGain(); gain.gain.setValueAtTime(0, ctx.currentTime);
    if (!startedAt) startedAt = performance.now();
    gain.gain.linearRampToValueAtTime(level(), ctx.currentTime + 1.2); fadeLater();
    src.connect(gain).connect(ctx.destination);
    src.start(0, fromStart ? 0 : LOOP_START);
    playing = true; soundBtn.setAttribute('aria-pressed', 'true'); store.set('cg-music', 'on');
  }
  function stop() {
    if (src) { try { src.stop(); } catch (e) {} src = null; } clearTimeout(softT);
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
    [before, after].forEach(i => i.draggable = false); glass.addEventListener('dragstart', e => e.preventDefault());
    glass.addEventListener('pointerdown', e => { e.preventDefault(); run++; drag = true; try { glass.setPointerCapture(e.pointerId); } catch (er) {} set(at(e)); });
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
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let head = null;
  const out = sec.querySelector('.mo-list'), empty = sec.querySelector('.mo-empty');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let picked = null;
  // the face follows your hand: it turns toward the area you point at, and that area lights up
  let lookYaw = -.15, hovered = null, showing = 0;
  const GOLD = '#f2d49a';
  const sideOf = z => { if (!head || !verts[z]) return 0; const a = head.anchor(verts[z]), w = document.getElementById('mirror-head').clientWidth; return (a.x / w - .5) * 2; };
  const light = z => { if (!head) return; head.jumpAmount(1); head.setPlan(z && verts[z] ? [{ v: verts[z], ml: .0001, color: GOLD }] : []); };
  // each area has the angle that shows it best: temples and the jawline from the side, the chin in profile,
  // the forehead and brows from the front. The head turns toward whichever side the area sits on
  const BEST = { forehead: [0, .1], brows: [0, .05], eyes: [.6, 0], temples: [.95, .02], undereyes: [.3, .05], cheeks: [.65, 0],
    smile: [.4, 0], lips: [.35, 0], chin: [1.25, -.02], jaw: [.85, -.04], neck: [.6, -.14], skin: [.15, .04] };
  let lookPitch = .04, pitchNow = .04;
  const lookAt = z => {
    const b = z && BEST[z]; if (!b) { lookPitch = .04; return; }
    const x = head && verts[z] != null ? head.sideX(verts[z]) : -1;
    lookYaw = b[0] ? b[0] * (x > .04 ? 1 : -1) : 0; lookPitch = .04 + b[1];
  };
  sec.querySelectorAll('.fz').forEach(b => {
    b.addEventListener('pointerenter', () => { hovered = b.dataset.z; lookAt(hovered); if (!showing) light(hovered); });
    b.addEventListener('pointerleave', () => { hovered = null; lookAt(picked); if (!showing) light(picked); });
  });
  // picking an area shows the treatment on the face: the muscle Botox relaxes moves and then lets go, and a filler area fills out in gold
  const ACT = { forehead: 'brow', brows: 'frown', eyes: 'squint', lips: 'smile' };
  const FILL = { temples: 1.5, undereyes: .6, cheeks: 1.6, smile: 1, lips: .8, chin: 1.2, jaw: 1.6, neck: .8 };
  const tw = (ms, fn) => new Promise(res => { if (still) { fn(1); return res(); } const t0 = performance.now(); const f = now => { const u = Math.min(1, (now - t0) / ms); fn(u * u * (3 - 2 * u)); u < 1 ? requestAnimationFrame(f) : res(); }; requestAnimationFrame(f); });
  const show = async z => {
    if (!head) return; const id = ++showing; lookAt(z);
    const act = ACT[z];
    if (act) {
      light(null);
      await tw(650, u => head.setFace({ [act]: u })); await new Promise(r => setTimeout(r, 700));
      if (id !== showing) return;
      await tw(1100, u => head.setFace({ [act]: 1 - u }));
    }
    if (id !== showing) return;
    if (FILL[z]) { head.setPlan([{ v: verts[z], ml: FILL[z], color: GOLD }]); head.jumpAmount(0); head.setAmount(1); }
    else if (z === 'skin') head.setPlan(Object.values(verts).map(v => ({ v, ml: .0001, color: GOLD })));
    else light(z);
    showing = 0;
  };
  sec.querySelectorAll('.fz').forEach(b => b.addEventListener('click', () => {
    show(b.dataset.z);
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
  const narrow = matchMedia('(max-width: 700px)');
  narrow.addEventListener('change', () => sec.querySelectorAll('.fz-col .fz').forEach(b => b.style.top = ''));
  let onScreen = false;
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
    import('./../features/filler/head.js?v=17').then(m => m.createHead(host, {
      base: 'assets/', sparkle: true, sparse: true, features: true, wipe: 0, yaw: -.15, morph: .5, zoom: .74,
      onTurn: y => { lookYaw = y; },
      visible: () => onScreen && !sec.querySelector('[data-panel="map"]').hidden,
      onFrame: () => { if (head) { head.setYaw(lookYaw + (still ? 0 : Math.sin(performance.now() / 6000) * .05)); pitchNow += (lookPitch - pitchNow) * .06; head.setPitch(pitchNow); } draw(); }
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
      import('./../features/filler/index.js?v=17').then(m => m.mount(document.getElementById('filler-sim'),
        { lang: 'en', base: 'assets/', noPlan: true, sparkle: true, soft: true, maleMorph: .8, fadeOnScroll: true, consult: 'index.html#rsvp' })).catch(() => { mounted = false; });
    }
  }));
})();

// ---- the guide: a small face of lights in a cameo that speaks one line per part of the evening ----
(() => {
  const cameo = document.getElementById('cameo');
  if (!cameo || !window.IntersectionObserver) return;
  const store = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };
  if (store.get('cg-guide') === 'off') return;
  let dust = document.getElementById('dust');
  if (!dust) { dust = document.createElement('canvas'); dust.className = 'dust'; dust.setAttribute('aria-hidden', 'true'); document.body.append(dust); }
  const say = document.getElementById('cameo-say'), dx = dust.getContext('2d');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const LINES = {
    card: "Each dance is one treatment. Contour shapes the face, and Glow works on the skin.",
    fitting: "Every treatment follows these five steps, from the first talk to your follow-up.",
    mirror: "Tap an area of my face to see which treatments work there.",
    entrance: "Drag the gold line across the mirror to compare before and after.",
    rsvp: "Leave your name and phone or LINE ID so we can message you to book a day."
  };
  const OPEN = "Good evening. I'll take you through tonight's programme.";
  const BYE = "Thank you. See you at the clinic.";
  let pitchAdd = 0;
  let head = null, speaker = null, jawT = 0, jaw = 0, blinkAt = performance.now() + 2500, blink = 0, mouse = [0, 0], inMirror = false, moving = false;
  const said = new Set();

  // a line appears all at once in the bubble, its words fading in one after another, and stays long enough to read
  let talking = 0;
  // glide: the cameo slides up the right edge to sit level with what it is talking about, then settles back in its corner
  const GLIDE = { card: '.dance-card h2', fitting: '#fitting .fitting-intro', entrance: '#entrance h2', rsvp: '.rsvp-card h2' };
  const wide = matchMedia('(min-width: 701px)');
  const setGlide = dy => { document.documentElement.style.setProperty('--gy', dy + 'px'); };
  const glideTo = el => {
    if (!el || !wide.matches || still) return;
    const c = cameo.getBoundingClientRect(), dockTop = c.top - (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--gy')) || 0);
    const t = el.getBoundingClientRect(), want = t.top + t.height / 2 - c.height / 2;
    const top = Math.max(110, Math.min(innerHeight - c.height - 70, want));
    setGlide(Math.round(top - dockTop));
  };
  const dock = () => setGlide(0);
  addEventListener('scroll', () => { if (!say.classList.contains('on')) dock(); }, { passive: true });
  const escH = t => t.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const speak = (text, onFace) => {
    const id = ++talking; speaker = onFace;
    const words = text.split(' ');
    say.classList.remove('on');
    say.innerHTML = words.map((w, i) => `<span style="--i:${i}">${escH(w)}</span>`).join(' ');
    void say.offsetWidth; say.classList.add('on');
    setTimeout(() => { if (id === talking) { say.classList.remove('on'); dock(); } }, 2600 + words.length * 260);
  };
  say.addEventListener('click', () => { talking++; say.classList.remove('on'); dock(); });
  const face = () => speaker === 'mirror' ? window.CG_mirrorHead : head;

  // life: the jaw eases toward its target, the eyes blink every few seconds, and the head turns a little toward the pointer
  const life = now => {
    if (now > blinkAt) { blink = Math.min(1, blink + .35); if (blink >= 1) blinkAt = now + 2800 + Math.random() * 3500; } else blink = Math.max(0, blink - .25);
    const f = face();
    if (f) f.setFace({ jaw: 0, blink });
    if (head && !inMirror) { head.setYaw(-.15 + mouse[0] * .16); head.setPitch(.04 - mouse[1] * .05 + pitchAdd); }
    requestAnimationFrame(life);
  };
  addEventListener('pointermove', e => { mouse = [e.clientX / innerWidth - .5, e.clientY / innerHeight - .5]; });

  // dust: when the guide moves into the mirror, its lights drift across the page as gold dust and settle there
  const fly = (from, to) => new Promise(res => {
    if (still) return res();
    const dpr = Math.min(2, devicePixelRatio || 1); dust.width = innerWidth * dpr; dust.height = innerHeight * dpr; dx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const P = Array.from({ length: 220 }, () => ({ d: Math.random() * .4, s: (Math.random() - .5) * 160, r: .4 + Math.random() * 1.5 }));
    const t0 = performance.now(), T = 1700;
    const f = now => {
      const u = (now - t0) / T; dx.clearRect(0, 0, innerWidth, innerHeight);
      // both ends are measured again every frame, so the dust still lands on the mirror if the page scrolls on the way
      const A = typeof from === 'function' ? from() : from, B = typeof to === 'function' ? to() : to;
      for (const p of P) {
        const v = Math.min(1, Math.max(0, (u - p.d) / .65)); if (v <= 0 || v >= 1) continue;
        const e = v * v * (3 - 2 * v), x = A[0] + (B[0] - A[0]) * e + Math.sin(e * Math.PI) * p.s, y = A[1] + (B[1] - A[1]) * e - Math.sin(e * Math.PI) * 90;
        const g = dx.createRadialGradient(x, y, 0, x, y, p.r * 4); g.addColorStop(0, `rgba(255,240,205,${(1 - Math.abs(v - .5) * 1.6) * .9})`); g.addColorStop(1, 'rgba(230,200,143,0)');
        dx.fillStyle = g; dx.beginPath(); dx.arc(x, y, p.r * 4, 0, 7); dx.fill();
      }
      u < 1.4 ? requestAnimationFrame(f) : (dx.clearRect(0, 0, innerWidth, innerHeight), res());
    };
    requestAnimationFrame(f);
  });
  const ease = u => u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
  const tween = (ms, fn) => new Promise(res => { if (still) { fn(1); return res(); } const t0 = performance.now(); const f = now => { const u = Math.min(1, (now - t0) / ms); fn(ease(u)); u < 1 ? requestAnimationFrame(f) : res(); }; requestAnimationFrame(f); });
  const centre = el => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };

  // the guide's face comes apart into light, drifts across the page as gold dust, and gathers again in the mirror.
  // Each step starts before the last one ends, so the move reads as one motion
  const wait = ms => new Promise(r => setTimeout(r, still ? 0 : ms));
  // if the reader scrolls past while a move is still running, the guide follows once that move ends
  let want = false;
  const settle = () => { if (want && !inMirror) intoMirror(); else if (!want && inMirror) outOfMirror(); };
  const intoMirror = async () => {
    want = true;
    const m = window.CG_mirrorHead, glass = document.querySelector('.mirror-stage .vanity-glass');
    if (!m || !glass || moving || inMirror) return; moving = true; inMirror = true;
    m.setFace({ scatter: .8, fade: 0 });
    tween(1000, u => head && head.setFace({ scatter: u * .8, fade: 1 - u }));
    cameo.classList.add('away');
    await wait(300);
    const trip = fly(centre(cameo), () => centre(glass));
    await wait(950);
    await tween(1500, u => m.setFace({ scatter: (1 - u) * .8, fade: u }));
    await trip; moving = false;
    if (!want) return settle();
    if (!said.has('mirror')) { said.add('mirror'); speak(LINES.mirror, 'mirror'); }
  };
  const outOfMirror = async () => {
    want = false;
    const m = window.CG_mirrorHead, glass = document.querySelector('.mirror-stage .vanity-glass');
    if (!m || moving || !inMirror) return; moving = true;
    if (speaker === 'mirror') { talking++; say.classList.remove('on'); }
    tween(1000, u => m.setFace({ scatter: u * .8, fade: 1 - u }));
    await wait(300);
    const trip = fly(() => centre(glass), () => centre(cameo));
    await wait(950);
    cameo.classList.remove('away');
    if (head) head.setFace({ scatter: .8, fade: 0 });
    await tween(1300, u => head && head.setFace({ scatter: (1 - u) * .8, fade: u }));
    await trip; m.setFace({ scatter: 0, fade: 1 });
    inMirror = false; moving = false; settle();
    if (!inMirror) { const id = [...onView].find(i => !said.has(i)); if (id) sayFor(id); }
  };

  const start = () => {
    cameo.hidden = false;
    import('./../features/filler/head.js?v=17').then(m => m.createHead(document.getElementById('cameo-head'), {
      base: 'assets/', sparkle: true, sparse: true, features: true, noDrag: true, wipe: 0, yaw: -.15, morph: .5, zoom: .7
    })).then(h => { head = h; requestAnimationFrame(life); if (!FACTS && !said.has('open')) { said.add('open'); setTimeout(() => speak(OPEN, 'cameo'), 600); } }).catch(() => { cameo.hidden = true; });
    ['card', 'fitting', 'entrance', 'rsvp'].map(id => document.getElementById(id)).filter(Boolean).forEach(p => io.observe(p));
    const vg = document.querySelector('.mirror-stage .vanity-glass'); if (vg) mio.observe(vg);
  };
  const onView = new Set();
  const sayFor = id => { if (said.has(id) || inMirror || moving || !LINES[id]) return; said.add(id); glideTo(GLIDE[id] && document.querySelector(GLIDE[id])); speak(LINES[id], 'cameo'); };
  // the guide goes into the mirror once most of the mirror's glass is on screen, and comes back out once it is nearly gone
  const mio = new IntersectionObserver(es => es.forEach(e => {
    if (e.intersectionRatio >= .6) window.CG_mirrorHead ? intoMirror() : document.addEventListener('cg:mirror-ready', () => { if (want) intoMirror(); }, { once: true });
    else if (e.intersectionRatio < .2) outOfMirror();
    if (e.intersectionRatio >= .6) want = true;
  }), { threshold: [0, .2, .6] });
  const io = new IntersectionObserver(es => es.forEach(e => {
    const id = e.target.id;
    e.isIntersecting ? onView.add(id) : onView.delete(id);
    if (e.isIntersecting) sayFor(id);
  }), { threshold: .45 });
  // treatment pages: the guide stays quiet and gives one fact each time you tap it
  const FACTS = window.CG_GUIDE || null;
  if (FACTS) {
    let k = 0;
    cameo.setAttribute('role', 'button'); cameo.tabIndex = 0; cameo.title = 'Tap for a quick fact';
    const ask = e => { if (e.target.closest('.cameo-x')) return; speak(FACTS[k++ % FACTS.length], 'cameo'); if (head) nod(); };
    cameo.addEventListener('click', ask); cameo.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ask(e); } });
  }
  // a small nod: the head dips and comes back up
  let nodding = false;
  const nod = () => { if (nodding || still) return; nodding = true; const t0 = performance.now(); const f = now => { const u = Math.min(1, (now - t0) / 700); pitchAdd = Math.sin(u * Math.PI) * .12; u < 1 ? requestAnimationFrame(f) : (pitchAdd = 0, nodding = false); }; requestAnimationFrame(f); };
  // RSVP: the guide thanks you, nods and drifts away as dust
  const form = document.querySelector('.rsvp-card');
  if (form) form.addEventListener('submit', async () => {
    if (!head || inMirror) return;
    speak(BYE, 'cameo'); nod();
    await new Promise(r => setTimeout(r, 3200));
    await tween(1400, u => head.setFace({ scatter: u * .7 }));
    cameo.classList.add('away'); setTimeout(() => say.classList.remove('on'), 1600);
  });
  cameo.querySelector('.cameo-x').addEventListener('click', () => { store.set('cg-guide', 'off'); cameo.hidden = true; say.classList.remove('on'); talking++; });
  // the guide arrives once the curtain has opened
  const go = () => { start(); };
  !document.getElementById('curtain') || document.body.classList.contains('opened') ? setTimeout(go, 400) : new MutationObserver((m, o) => { if (document.body.classList.contains('opened')) { o.disconnect(); setTimeout(go, 1200); } }).observe(document.body, { attributes: true });
})();
