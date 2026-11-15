// Apex Contour and Glow: the before and after line, the photo viewer, the face planner and the booking form.
(() => {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ---- before and after: drag the line, or let it sweep across once when it comes into view ----
  const ba = document.getElementById('ba');
  if (ba) {
    const before = ba.querySelector('.before'), after = ba.querySelector('.after'), range = ba.querySelector('.range'), set_ = ba.dataset.set;
    let run = 0, drag = false;
    const set = v => { v = Math.max(0, Math.min(100, v)); before.style.clipPath = `inset(0 ${100 - v}% 0 0)`; ba.style.setProperty('--x', v + '%'); range.value = v; };
    const ease = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    const play = () => {
      const id = ++run; if (still) { set(50); return; }
      const keys = [[0, 100], [600, 100], [2400, 0], [3000, 0], [4100, 50]], t0 = performance.now();
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
    document.querySelectorAll('#thumbs button').forEach(b => b.addEventListener('click', () => {
      document.querySelectorAll('#thumbs button').forEach(x => x.classList.toggle('on', x === b));
      run++;
      Promise.all([before, after].map((img, k) => new Promise(r => { img.onload = r; img.onerror = r; img.src = `assets/img/${set_}-${b.dataset.i}-${k ? 'after' : 'before'}.webp`; }))).then(play);
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

  // ---- booking: the form opens LINE with the message written out ----
  const form = document.getElementById('book-form');
  if (form) form.addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(form), day = f.get('day');
    const text = [`Hello Apex, I'd like to book a consultation.`, `Name: ${f.get('name')}`, f.get('phone') && `Phone: ${f.get('phone')}`,
      `Treatment: ${f.get('treatment')}`, day && `Preferred day: ${day}`].filter(Boolean).join('\n');
    location.href = `https://line.me/R/oaMessage/${encodeURIComponent(window.CG_LINE || '@apexbeauty')}/?${encodeURIComponent(text)}`;
  });

  // ---- face planner: the 3D head in the gold oval, the areas beside it, and the filler head in the second tab ----
  const hero = document.getElementById('planner');
  if (!hero || !window.CG_ZONES) return;
  const { zones, names, verts } = window.CG_ZONES;
  const stage = hero.querySelector('.planner'), host = document.getElementById('planner-head');
  const list = hero.querySelector('.picks .list'), empty = hero.querySelector('.picks .empty');
  const leads = hero.querySelector('.leads'), ctx = leads.getContext('2d');
  const btn = {}; hero.querySelectorAll('.zcol .fz').forEach(b => { btn[b.dataset.z] = b; });
  const narrow = matchMedia('(max-width: 700px)');
  const GOLD = '#f0d397';
  let head = null, picked = null, showing = 0, onScreen = false;
  let lookYaw = -.15, lookPitch = .04, pitchNow = .04;

  // until the head loads, the labels sit evenly down each side
  const spread = () => {
    if (narrow.matches) { Object.values(btn).forEach(b => { b.style.top = ''; }); return; }
    for (const side of ['l', 'r']) {
      const bs = [...hero.querySelectorAll('.zcol.' + side + ' .fz')], h = stage.clientHeight;
      bs.forEach((b, i) => { b.style.top = (h * (.16 + .68 * i / Math.max(1, bs.length - 1))) + 'px'; });
    }
  };
  spread();
  narrow.addEventListener('change', spread);

  // each area turns the head to the angle that shows it best, toward the side of the face it sits on
  const BEST = { forehead: [0, .1], brows: [0, .05], eyes: [.6, 0], temples: [.95, .02], undereyes: [.3, .05], cheeks: [.65, 0],
    smile: [.4, 0], lips: [.35, 0], chin: [1.25, -.02], jaw: [.85, -.04], neck: [.6, -.14], skin: [.15, .04] };
  const lookAt = z => {
    const b = z && BEST[z]; if (!b) { lookPitch = .04; return; }
    const x = head && verts[z] != null ? head.sideX(verts[z]) : -1;
    lookYaw = b[0] ? b[0] * (x > .04 ? 1 : -1) : 0; lookPitch = .04 + b[1];
  };
  const light = z => { if (!head) return; head.jumpAmount(1); head.setPlan(z && verts[z] ? [{ v: verts[z], ml: .0001, color: GOLD }] : []); };
  // picking an area shows the treatment on the face: the muscle Botox relaxes moves and lets go, and a filler area fills out in gold
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
  hero.querySelectorAll('.fz').forEach(b => {
    b.addEventListener('pointerenter', () => { if (b.dataset.z !== 'skin') { lookAt(b.dataset.z); if (!showing) light(b.dataset.z); } });
    b.addEventListener('pointerleave', () => { lookAt(picked); if (!showing) light(picked); });
    b.addEventListener('click', () => {
      picked = b.dataset.z; show(picked);
      hero.querySelectorAll('.fz').forEach(x => x.setAttribute('aria-pressed', x === b));
      list.querySelector('h3').textContent = names[picked];
      list.querySelector('ul').innerHTML = (zones[picked] || []).map(e =>
        `<li><a href="${e.slug}.html"><b>${esc(e.name)}</b><span>${e.note ? esc(e.note) + ' · ' : ''}<i>from ${esc(e.price)}</i></span></a></li>`).join('');
      empty.hidden = true; list.hidden = false;
    });
  });

  // a gold thread runs from each label to its place on the face, and the labels follow their areas as the head turns
  const draw = () => {
    if (!head) return;
    const sr = stage.getBoundingClientRect(), hr = host.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
    if (leads.width !== Math.round(sr.width * dpr) || leads.height !== Math.round(sr.height * dpr)) { leads.width = Math.round(sr.width * dpr); leads.height = Math.round(sr.height * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, sr.width, sr.height);
    const dot = (x, y, r, a) => { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(255,240,205,${a})`); g.addColorStop(1, 'rgba(230,200,143,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); };
    if (narrow.matches) {
      if (picked && verts[picked]) { const a = head.anchor(verts[picked]); dot(a.x + hr.left - sr.left, a.y + hr.top - sr.top, 14 + 4 * Math.sin(performance.now() / 300), .95); }
      return;
    }
    for (const side of ['l', 'r']) {
      const its = Object.keys(btn).filter(k => btn[k].parentElement.classList.contains(side)).map(k => {
        const a = head.anchor(verts[k]); return { k, a, x: a.x + hr.left - sr.left, y: a.y + hr.top - sr.top };
      }).sort((p, q) => p.y - q.y);
      let last = -1e9;
      for (const it of its) {
        const b = btn[it.k], h = b.offsetHeight + 8, y = Math.max(it.y, last + h); last = y;
        b.style.top = (y - b.offsetHeight / 2) + 'px';
        const br = b.getBoundingClientRect(), lx = side === 'l' ? br.right - sr.left + 4 : br.left - sr.left - 4;
        const on = it.k === picked, al = Math.min(1, (.22 + .5 * it.a.front) * (on ? 1.8 : 1));
        ctx.strokeStyle = `rgba(227,197,142,${al})`; ctx.lineWidth = on ? 1.4 : .8;
        ctx.beginPath(); ctx.moveTo(lx, y); ctx.lineTo(lx + (side === 'l' ? 14 : -14), y); ctx.lineTo(it.x, it.y); ctx.stroke();
        dot(it.x, it.y, on ? 12 : 6, .85 * it.a.front + .1);
      }
    }
  };
  const start = () => {
    if (head !== null) return; head = false;
    import('./../features/filler/head.js?v=19').then(m => m.createHead(host, {
      base: 'assets/', features: true, soft: true, wipe: 0, yaw: -.15, morph: .4, zoom: .74,
      onTurn: y => { lookYaw = y; },
      visible: () => onScreen && !stage.hidden,
      onFrame: () => { if (head) { head.setYaw(lookYaw + (still ? 0 : Math.sin(performance.now() / 6000) * .05)); pitchNow += (lookPitch - pitchNow) * .06; head.setPitch(pitchNow); } draw(); }
    })).then(h => { head = h; stage.classList.add('live'); draw(); }).catch(() => { head = null; stage.classList.add('flat'); });
  };
  new IntersectionObserver(es => es.forEach(e => { onScreen = e.isIntersecting; if (onScreen) start(); }), { rootMargin: '200px' }).observe(stage);
  addEventListener('resize', () => { spread(); draw(); });

  // tabs: the face planner fades down and the filler head rises in, or the other way
  let mounted = false, busy = false;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  hero.querySelectorAll('[data-tab]').forEach(t => t.addEventListener('click', async () => {
    const to = [...hero.querySelectorAll(`[data-panel="${t.dataset.tab}"]`)], from = [...hero.querySelectorAll('[data-panel]:not([hidden])')];
    if (busy || to.every(x => !x.hidden)) return; busy = true;
    hero.querySelectorAll('[data-tab]').forEach(x => x.setAttribute('aria-selected', x === t));
    if (!still) { from.forEach(x => x.classList.add('leaving')); await wait(420); }
    from.forEach(x => { x.hidden = true; x.classList.remove('leaving'); });
    to.forEach(x => { x.hidden = false; x.classList.add('arriving'); });
    if (t.dataset.tab === 'map' && head) { head.resize(); spread(); }
    requestAnimationFrame(() => requestAnimationFrame(() => to.forEach(x => x.classList.remove('arriving'))));
    busy = false;
    if (t.dataset.tab === 'sim' && !mounted) {
      mounted = true;
      import('./../features/filler/index.js?v=19').then(m => m.mount(document.getElementById('filler-sim'),
        { lang: 'en', base: 'assets/', noPlan: true, soft: true, maleMorph: .8, fadeOnScroll: true, consult: 'index.html#book' })).catch(() => { mounted = false; });
    }
  }));
})();
