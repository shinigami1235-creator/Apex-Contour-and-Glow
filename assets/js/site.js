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

  // ---- before and after ----
  const cmp = document.getElementById('compare');
  if (cmp) {
    const range = cmp.querySelector('input'), wrap = cmp.querySelector('.before-wrap');
    const set = v => { wrap.style.clipPath = `inset(0 ${100 - v}% 0 0)`; cmp.style.setProperty('--x', v + '%'); };
    range.addEventListener('input', () => set(range.value)); set(50);
    const kind = cmp.dataset.set || 'profhilo';
    document.querySelectorAll('#thumbs button').forEach(b => b.addEventListener('click', () => {
      document.querySelectorAll('#thumbs button').forEach(x => x.classList.toggle('on', x === b));
      const i = b.dataset.i;
      cmp.querySelector('.after').src = `assets/img/${kind}-${i}-after.webp`;
      cmp.querySelector('.before').src = `assets/img/${kind}-${i}-before.webp`;
      range.value = 50; set(50);
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

// ---- vanity mirror: face map and the 3D filler head (home page) ----
(() => {
  const sec = document.getElementById('mirror');
  if (!sec || !window.CG_ZONES) return;
  const { zones, names } = window.CG_ZONES;
  const out = sec.querySelector('.mo-list'), empty = sec.querySelector('.mo-empty');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  sec.querySelectorAll('.fz').forEach(b => b.addEventListener('click', () => {
    sec.querySelectorAll('.fz').forEach(x => x.setAttribute('aria-pressed', x === b));
    const list = zones[b.dataset.z] || [];
    out.querySelector('.mo-title').textContent = names[b.dataset.z];
    out.querySelector('ul').innerHTML = list.map(e =>
      `<li class="${e.half.toLowerCase()}"><a href="${e.slug}.html"><b>${esc(e.name)}</b><span>${esc(e.half)}</span></a>${e.note ? `<em>${esc(e.note)}</em>` : ''}</li>`).join('');
    empty.hidden = true; out.hidden = false;
  }));
  let mounted = false;
  sec.querySelectorAll('[data-tab]').forEach(t => t.addEventListener('click', () => {
    sec.querySelectorAll('[data-tab]').forEach(x => x.setAttribute('aria-selected', x === t));
    sec.querySelectorAll('[data-panel]').forEach(p => p.hidden = p.dataset.panel !== t.dataset.tab);
    if (t.dataset.tab === 'sim' && !mounted) {
      mounted = true;
      import('./../features/filler/index.js').then(m => m.mount(document.getElementById('filler-sim'),
        { lang: 'en', base: 'assets/', noPlan: true, consult: 'index.html#rsvp' })).catch(() => { mounted = false; });
    }
  }));
})();
