// Apex Contour and Glow: reveal on scroll, the menu, the face planner, skin layers, before and after, and the booking form.
(() => {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const A = window.CG_ASSETS || 'assets/';

  // ---- parts fade up as they come into view (the Apex sites' .rv) ----
  const rv = [...document.querySelectorAll('.rv')];
  rv.forEach(el => { if (el.dataset.d) el.style.transitionDelay = el.dataset.d + 'ms'; });
  if (still || !('IntersectionObserver' in window)) rv.forEach(el => el.classList.add('in'));
  else { const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' }); rv.forEach(el => io.observe(el)); }

  // ---- header: hides on the way down, comes back on the way up; the menu sheet on phones ----
  const hdr = document.querySelector('.hdr');
  let lastY = scrollY;
  addEventListener('scroll', () => { const y = scrollY; if (hdr) hdr.classList.toggle('hide', y > 240 && y > lastY); lastY = y; }, { passive: true });
  const sheet = document.getElementById('sheet');
  if (sheet) {
    document.querySelectorAll('[data-sheet]').forEach(b => b.addEventListener('click', () => { sheet.showModal(); requestAnimationFrame(() => sheet.classList.add('open')); }));
    const close = () => { sheet.classList.remove('open'); setTimeout(() => sheet.close(), 450); };
    sheet.querySelectorAll('[data-close], nav a, .sheet-cta a').forEach(b => b.addEventListener('click', close));
    sheet.addEventListener('cancel', e => { e.preventDefault(); close(); });
  }

  // ---- skin layers: pick a layer, see what works there ----
  // the needle reaches into the picked layer and leaves a drop of product there
  const needleEl = document.querySelector('.ly-needle'), lyStack = document.querySelector('.ly-stack');
  const aim = (k, play) => {
    if (!needleEl || !lyStack) return;
    const band = lyStack.querySelector('.ly-' + k);
    const y = k === 'surface' || !band ? 0 : band.offsetTop - lyStack.offsetTop + band.offsetHeight * (k === 'bone' ? .22 : .5);
    needleEl.style.setProperty('--len', (y / Math.cos(25 * Math.PI / 180)).toFixed(1) + 'px');
    needleEl.dataset.ly = k;
    if (play) { needleEl.classList.remove('go'); void needleEl.offsetWidth; needleEl.classList.add('go'); }
  };
  const lyNow = () => (document.querySelector('.ly[aria-pressed=true]') || {}).dataset || {};
  document.querySelectorAll('.ly').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('.ly').forEach(x => x.setAttribute('aria-pressed', x === b));
    document.querySelectorAll('.ly-card').forEach(c => { c.hidden = c.dataset.ly !== b.dataset.ly; });
    aim(b.dataset.ly, true);
  }));
  if (needleEl) {
    aim(lyNow().ly || 'dermis', false);
    addEventListener('resize', () => aim(lyNow().ly || 'dermis', false));
    new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { aim(lyNow().ly || 'dermis', true); o.disconnect(); } }), { threshold: .4 }).observe(needleEl.parentElement);
  }

  // ---- before and after: drag the line, or let it sweep across once when it comes into view ----
  const ba = document.getElementById('ba');
  if (ba) {
    const before = ba.querySelector('.before'), after = ba.querySelector('.after'), range = ba.querySelector('.range');
    const tb = ba.querySelector('.tb'), ta = ba.querySelector('.ta');
    let run = 0, drag = false;
    const set = v => { v = Math.max(0, Math.min(100, v)); before.style.clipPath = `inset(0 ${100 - v}% 0 0)`; ba.style.setProperty('--x', v + '%'); range.value = v; };
    const ease = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    const play = () => {
      const id = ++run; if (still) { set(50); return; }
      const keys = [[0, 100], [600, 100], [2400, 0], [3000, 0], [4100, 50]], t0 = performance.now();
      const step = now => {
        if (id !== run) return;
        const t = now - t0; let k = 0; while (k < keys.length - 2 && t > keys[k + 1][0]) k++;
        const [ta_, va] = keys[k], [tb_, vb] = keys[k + 1], u = Math.min(1, Math.max(0, (t - ta_) / (tb_ - ta_)));
        set(va + (vb - va) * ease(u));
        if (t < keys[keys.length - 1][0]) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    set(50);
    const at = e => { const r = ba.getBoundingClientRect(); return (e.clientX - r.left) / r.width * 100; };
    [before, after].forEach(i => { i.draggable = false; });
    ba.addEventListener('dragstart', e => e.preventDefault());
    ba.addEventListener('pointerdown', e => { e.preventDefault(); run++; drag = true; try { ba.setPointerCapture(e.pointerId); } catch (er) {} set(at(e)); });
    ba.addEventListener('pointermove', e => { if (drag) set(at(e)); });
    ['pointerup', 'pointercancel'].forEach(n => ba.addEventListener(n, () => { drag = false; }));
    range.addEventListener('input', () => { run++; set(+range.value); });
    const again = document.querySelector('[data-ba="play"]'); if (again) again.addEventListener('click', play);
    let seen = false;
    new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting && !seen) { seen = true; setTimeout(play, 300); } }), { threshold: .5 }).observe(ba);
    // each thumbnail carries its own before and after photo and labels
    const load = b => {
      document.querySelectorAll('#thumbs button').forEach(x => x.classList.toggle('on', x === b));
      run++;
      const [lb, la] = (b.dataset.l || 'Before | After').split(' | ');
      if (tb) tb.textContent = lb; if (ta) ta.textContent = la;
      Promise.all([[before, b.dataset.b], [after, b.dataset.a]].map(([img, src]) => new Promise(r => { img.onload = r; img.onerror = r; img.src = src; }))).then(play);
    };
    document.querySelectorAll('#thumbs button').forEach(b => b.addEventListener('click', () => load(b)));
    // the treatment chips above switch the set of cases
    const read = document.getElementById('ba-read');
    document.querySelectorAll('#results .chips [data-set]').forEach(c => c.addEventListener('click', () => {
      document.querySelectorAll('#results .chips [data-set]').forEach(x => x.setAttribute('aria-pressed', x === c));
      const k = c.dataset.set, first = [...document.querySelectorAll('#thumbs button')].filter(b => { b.hidden = b.dataset.set !== k; return !b.hidden; })[0];
      if (read) { read.href = (window.CG_URLS || {})[k] || k + '.html'; read.firstChild.textContent = 'Read about ' + c.textContent + ' '; }
      if (first) load(first);
    }));
  }

  // ---- photo viewer for the result galleries ----
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
    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('on')) return;
      if (e.key === 'Escape') lb.classList.remove('on'); if (e.key === 'ArrowLeft') show(cur - 1); if (e.key === 'ArrowRight') show(cur + 1);
    });
  }

  // events for Tag Manager (Apex settings › Tracking and code lists them)
  const emit = (event, data) => { (window.dataLayer = window.dataLayer || []).push({ event, apex: data || {} }); };
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="https://line.me"], a[href^="tel:"]');
    if (a) emit('apex_contact_click', { how: a.href.startsWith('tel:') ? 'phone' : 'line' });
  });

  // ---- booking: on WordPress the details are saved for the clinic first (window.CG_BOOK), then LINE opens with the message ----
  const form = document.getElementById('book-form');
  if (form) form.addEventListener('submit', async e => {
    e.preventDefault();
    const f = new FormData(form), day = f.get('day');
    const text = [`Hello Apex, I'd like to book a consultation.`, `Name: ${f.get('name')}`, f.get('phone') && `Phone: ${f.get('phone')}`,
      `Treatment: ${f.get('treatment')}`, day && `Preferred day: ${day}`].filter(Boolean).join('\n');
    emit('apex_book_submit', { treatment: f.get('treatment') });
    if (window.CG_BOOK) {
      const btn = form.querySelector('button[type=submit]'); btn.disabled = true;
      try {
        const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 6000);
        await fetch(window.CG_BOOK, { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: ctl.signal,
          body: JSON.stringify({ ...Object.fromEntries(f), consent: !!f.get('consent'), lang: document.documentElement.lang }) });
        clearTimeout(t);
      } catch (err) { /* LINE still carries the message */ }
      btn.disabled = false;
    }
    location.href = `https://line.me/R/oaMessage/${encodeURIComponent(window.CG_LINE || '@apexbeauty')}/?${encodeURIComponent(text)}`;
  });

  // ---- face planner: the 3D head, the area buttons under it and the card beside it ----
  const hero = document.getElementById('planner');
  if (!hero || !window.CG_ZONES) return;
  const { zones, names, verts, pts, fill, info } = window.CG_ZONES;
  const stage = hero.querySelector('.cg-stage'), host = document.getElementById('planner-head');
  const list = hero.querySelector('.picks .list'), empty = hero.querySelector('.picks .empty');
  const leads = hero.querySelector('.leads'), ctx = leads.getContext('2d');
  const narrow = matchMedia('(max-width: 700px)');
  const GOLD = '#f6b6d2';
  let head = null, picked = null, hovered = null, showing = 0, onScreen = false;
  let lookYaw = -.15, lookPitch = .04, pitchNow = .04;

  // each area turns the head to the angle that shows it best
  const BEST = { forehead: [0, .1], brows: [0, .05], eyes: [.6, 0], temples: [.95, .02], undereyes: [.3, .05], cheeks: [.65, 0],
    smile: [.4, 0], lips: [.35, 0], chin: [.6, -.03], jaw: [.85, -.04], neck: [.5, -.14], skin: [.15, .04] };
  let side = -1;
  const lookAt = z => {
    const b = z && BEST[z]; if (!b) { lookPitch = .04; return; }
    lookYaw = b[0] * side; lookPitch = .04 + b[1];
  };
  // picking an area shows the treatment on the face: the muscle Botox relaxes moves and lets go, and the filler points fill out in gold
  const ACT = { forehead: 'brow', brows: 'frown', eyes: 'squint', lips: 'smile' };
  const tw = (ms, fn, live = () => true) => new Promise(res => { if (still) { fn(1); return res(); } const t0 = performance.now(); const f = now => { if (!live()) return res(); const u = Math.min(1, (now - t0) / ms); fn(u * u * (3 - 2 * u)); u < 1 ? requestAnimationFrame(f) : res(); }; requestAnimationFrame(f); });
  // a new pick cancels the one still playing and puts the face back to rest, so no expression is left half done
  const REST = { brow: 0, frown: 0, squint: 0, smile: 0 };
  const NARROW = { lips: .55, chin: .8, smile: .8 };
  let after = true;
  const show = async z => {
    if (!head) return; const id = ++showing; lookAt(z); head.setPlan([]); head.setFace(REST);
    const live = () => id === showing;
    const act = ACT[z];
    if (act) {
      await tw(650, u => live() && head.setFace({ ...REST, [act]: u }), live); await new Promise(r => setTimeout(r, 700));
      if (!live()) return;
      await tw(1100, u => live() && head.setFace({ ...REST, [act]: 1 - u }), live);
      if (!live()) return;
    }
    const f = (fill[z] || []).filter(([v, ml]) => ml > 0);
    if (f.length && z !== 'skin') { head.setPlan(f.map(([v, ml]) => ({ v, ml, color: GOLD, r: NARROW[z] || 1, glow: z === 'lips' ? .4 : 1, drop: z !== 'lips' }))); head.jumpAmount(0); head.setAmount(after ? 1 : 0); }
  };
  const pickList = z => {
    const inf = info[z] || {};
    list.querySelector('.area').textContent = names[z];
    list.querySelector('.basis').innerHTML = [inf.codes && `<li><i></i>Filler: ${esc(inf.codes)}</li>`, inf.toxin && `<li><i class="t"></i>Botox: ${esc(inf.toxin)}</li>`,
      inf.bap && `<li><i></i>Skin boosters: ${esc(inf.bap)}</li>`].filter(Boolean).join('');
    const n = (zones[z] || []).length, cols = n <= 4 ? n : n % 4 === 0 ? 4 : n % 3 === 0 ? 3 : n % 5 === 0 ? 5 : n === 7 ? 4 : 3;
    list.querySelector('.txc').style.setProperty('--cols', cols);
    list.querySelector('.txc').innerHTML = (zones[z] || []).map(e =>
      `<li><a href="${(window.CG_URLS || {})[e.slug] || e.slug + '.html'}"><span class="top"><b>${esc(e.name)}</b><span class="pr">${/\d/.test(e.price) ? 'from ' + esc(e.price) : esc(e.price)}</span></span>` +
      (e.note ? `<span class="amt">${esc(e.note)}</span>` : '') + `</a></li>`).join('');
    empty.hidden = true; list.hidden = false; stage.classList.add('has-pick');
  };
  hero.querySelectorAll('.fz').forEach(b => {
    b.addEventListener('pointerenter', () => { hovered = b.dataset.z; lookAt(hovered); });
    b.addEventListener('pointerleave', () => { hovered = null; lookAt(picked); });
    b.addEventListener('click', () => {
      picked = b.dataset.z;
      show(picked); pickList(picked); emit('apex_area_pick', { area: picked });
      hero.querySelectorAll('.fz').forEach(x => x.setAttribute('aria-pressed', x === b));
    });
  });

  // points mark where filler goes (round) and where Botox goes (diamond), on both sides of the face
  const draw = () => {
    if (!head) return;
    const sr = stage.getBoundingClientRect(), hr = host.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
    if (leads.width !== Math.round(sr.width * dpr) || leads.height !== Math.round(sr.height * dpr)) { leads.width = Math.round(sr.width * dpr); leads.height = Math.round(sr.height * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, sr.width, sr.height);
    const ox = hr.left - sr.left, oy = hr.top - sr.top, t = performance.now() / 1000;
    const at = v => { const a = head.anchor(v); return { x: a.x + ox, y: a.y + oy, f: a.front }; };
    const mark = (p, kind, k, many) => {
      if (p.f < .12) return;
      const r = (many ? 2.4 : 3.2) + (many ? .4 : .8) * Math.sin(t * 3 + k), a = Math.min(1, p.f * 1.3), hr = r * (many ? 2 : 3.4);
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, hr);
      g.addColorStop(0, `rgba(255,200,226,${(many ? .3 : .55) * a})`); g.addColorStop(1, 'rgba(204,51,102,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, hr, 0, 7); ctx.fill();
      ctx.fillStyle = kind === 't' ? `rgba(255,255,255,${a})` : `rgba(255,170,210,${a})`;
      ctx.beginPath();
      if (kind === 't') { ctx.moveTo(p.x, p.y - r); ctx.lineTo(p.x + r, p.y); ctx.lineTo(p.x, p.y + r); ctx.lineTo(p.x - r, p.y); ctx.closePath(); }
      else ctx.arc(p.x, p.y, r * .8, 0, 7);
      ctx.fill();
    };
    const zone = hovered || picked;
    const zp = zone && pts[zone] ? pts[zone].map(([v, kind]) => ({ ...at(v), kind })) : [];
    zp.forEach((p, k) => mark(p, p.kind, k, zp.length > 10));
  };
  const start = () => {
    if (head !== null) return; head = false;
    import('./../features/filler/head.js?v=22').then(m => m.createHead(host, {
      base: A, features: true, soft: true, wipe: 0, yaw: -.15, morph: 0, maleMorph: .8, zoom: .74,
      onTurn: y => { lookYaw = y; },
      visible: () => onScreen && !stage.hidden,
      onFrame: () => { if (head) { head.setYaw(lookYaw + (still ? 0 : Math.sin(performance.now() / 6000) * .05)); pitchNow += (lookPitch - pitchNow) * .06; head.setPitch(pitchNow); } draw(); }
    })).then(h => { head = h; stage.classList.add('live'); draw(); }).catch(() => { head = null; stage.classList.add('flat'); });
  };
  new IntersectionObserver(es => es.forEach(e => { onScreen = e.isIntersecting; if (onScreen) start(); }), { rootMargin: '200px' }).observe(stage);
  // the card sits between the toggles and the area buttons, so it never covers either
  const rail = hero.querySelector('.cg-rail'), railH = () => stage.style.setProperty('--rail', rail.offsetHeight + 'px');
  railH(); addEventListener('resize', () => { railH(); draw(); });
  list.querySelector('.pk-x').addEventListener('click', () => { picked = null; showing++; if (head) { head.setPlan([]); } lookAt(null); list.hidden = true; empty.hidden = false; stage.classList.remove('has-pick'); hero.querySelectorAll('.fz').forEach(x => x.setAttribute('aria-pressed', false)); });

  // one head for everything: women or men, and the filler before or after
  hero.querySelectorAll('[data-sex]').forEach(b => b.addEventListener('click', () => {
    hero.querySelectorAll('[data-sex]').forEach(x => x.setAttribute('aria-pressed', x === b));
    if (head) head.setGender(b.dataset.sex);
  }));
  hero.querySelectorAll('[data-ba]').forEach(b => b.addEventListener('click', () => {
    after = b.dataset.ba === 'after';
    hero.querySelectorAll('[data-ba]').forEach(x => x.setAttribute('aria-pressed', x === b));
    if (head) head.setAmount(after ? 1 : 0);
  }));
})();
