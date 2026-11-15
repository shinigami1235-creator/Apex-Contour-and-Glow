// Apex Contour and Glow: the before and after line, the photo viewer, the face planner and the booking form.
(() => {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ---- before and after: drag the line, or let it sweep across once when it comes into view ----
  const ba = document.getElementById('ba');
  if (ba) {
    const before = ba.querySelector('.before'), after = ba.querySelector('.after'), range = ba.querySelector('.range'), set_ = ba.dataset.set;
    let run = 0, drag = false;
    const plB = document.querySelector('.pl-b'), plA = document.querySelector('.pl-a');
    const set = v => {
      v = Math.max(0, Math.min(100, v)); before.style.clipPath = `inset(0 ${100 - v}% 0 0)`; ba.style.setProperty('--x', v + '%'); range.value = v;
      if (plB) { plB.classList.toggle('on', v > 60); plA.classList.toggle('on', v < 40); }
    };
    const ease = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    const play = () => {
      const id = ++run; if (still) { set(50); return; }
      ba.classList.remove('shine'); void ba.offsetWidth; ba.classList.add('shine');
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
  const { zones, names, verts, pts, fill, info } = window.CG_ZONES;
  const stage = hero.querySelector('.planner'), host = document.getElementById('planner-head');
  const list = hero.querySelector('.picks .list'), empty = hero.querySelector('.picks .empty');
  const leads = hero.querySelector('.leads'), ctx = leads.getContext('2d');
  const btn = {}; hero.querySelectorAll('.zcol .fz').forEach(b => { btn[b.dataset.z] = b; });
  const narrow = matchMedia('(max-width: 700px)');
  const GOLD = '#f0d397';
  let head = null, picked = null, hovered = null, showing = 0, onScreen = false;
  let lookYaw = -.15, lookPitch = .04, pitchNow = .04;

  // until the head loads, the labels sit evenly down each side
  const spread = () => {
    if (narrow.matches) { Object.values(btn).forEach(b => { b.style.top = ''; }); return; }
    for (const side of ['l', 'r']) {
      const bs = [...hero.querySelectorAll('.zcol.' + side + ' .fz')], h = stage.clientHeight;
      bs.forEach((b, i) => { b.style.top = (h * (.2 + .6 * i / Math.max(1, bs.length - 1))) + 'px'; });
    }
  };
  spread();
  narrow.addEventListener('change', spread);

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
      `<li><a href="${e.slug}.html"><span class="top"><b>${esc(e.name)}</b><span class="pr">${/\d/.test(e.price) ? 'from ' + esc(e.price) : esc(e.price)}</span></span>` +
      `<span class="amt">${e.note ? esc(e.note) : '&nbsp;'}</span><span class="go">Read more</span></a></li>`).join('');
    empty.hidden = true; list.hidden = false;
  };
  hero.querySelectorAll('.fz').forEach(b => {
    b.addEventListener('pointerenter', () => { hovered = b.dataset.z; if (b.parentElement.classList.contains('r')) side = 1; else if (b.parentElement.classList.contains('l')) side = -1; lookAt(hovered); });
    b.addEventListener('pointerleave', () => { hovered = null; lookAt(picked); });
    b.addEventListener('click', () => {
      picked = b.dataset.z;
      if (b.parentElement.classList.contains('r')) side = 1; else if (b.parentElement.classList.contains('l')) side = -1;
      show(picked); pickList(picked);
      hero.querySelectorAll('.fz').forEach(x => x.setAttribute('aria-pressed', x === b));
    });
  });

  // gold points mark where filler goes (round) and where Botox goes (diamond), on both sides of the face;
  // a gold thread runs from each label to the nearest point of its area
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
      g.addColorStop(0, `rgba(255,236,190,${(many ? .3 : .55) * a})`); g.addColorStop(1, 'rgba(240,211,151,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, hr, 0, 7); ctx.fill();
      ctx.fillStyle = kind === 't' ? `rgba(255,255,255,${a})` : `rgba(246,220,160,${a})`;
      ctx.beginPath();
      if (kind === 't') { ctx.moveTo(p.x, p.y - r); ctx.lineTo(p.x + r, p.y); ctx.lineTo(p.x, p.y + r); ctx.lineTo(p.x - r, p.y); ctx.closePath(); }
      else ctx.arc(p.x, p.y, r * .8, 0, 7);
      ctx.fill();
    };
    const zone = hovered || picked;
    const zp = zone && pts[zone] ? pts[zone].map(([v, kind]) => ({ ...at(v), kind })) : [];
    zp.forEach((p, k) => mark(p, p.kind, k, zp.length > 10));
    if (narrow.matches) return;
    for (const sd of ['l', 'r']) {
      const keys = Object.keys(btn).filter(k => btn[k].parentElement.classList.contains(sd));
      const its = keys.map(k => {
        // the point of this area that faces the viewer best, on this label's side when it can be seen
        const cand = (pts[k] || [[verts[k]]]).map(([v]) => at(v)).filter(p => p.f > .15);
        const p = cand.length ? cand.reduce((a, b) => ((sd === 'l' ? -b.x : b.x) + 60 * b.f > (sd === 'l' ? -a.x : a.x) + 60 * a.f ? b : a)) : at(verts[k]);
        return { k, p };
      }).sort((a, b) => a.p.y - b.p.y);
      let last = -1e9;
      for (const it of its) {
        const b = btn[it.k], h = b.offsetHeight + 8, y = Math.max(it.p.y, last + h); last = y;
        b.style.top = (y - b.offsetHeight / 2) + 'px';
        const br = b.getBoundingClientRect(), lx = sd === 'l' ? br.right - sr.left + 4 : br.left - sr.left - 4;
        const on = it.k === zone, al = Math.min(1, (.18 + .45 * it.p.f) * (on ? 2 : 1));
        ctx.strokeStyle = `rgba(227,197,142,${al})`; ctx.lineWidth = on ? 1.3 : .7;
        ctx.beginPath(); ctx.moveTo(lx, y); ctx.lineTo(lx + (sd === 'l' ? 14 : -14), y); ctx.lineTo(it.p.x, it.p.y); ctx.stroke();
        if (!on) { ctx.fillStyle = `rgba(240,211,151,${.25 + .5 * it.p.f})`; ctx.beginPath(); ctx.arc(it.p.x, it.p.y, 2, 0, 7); ctx.fill(); }
      }
    }
  };
  const start = () => {
    if (head !== null) return; head = false;
    import('./../features/filler/head.js?v=22').then(m => m.createHead(host, {
      base: 'assets/', features: true, soft: true, wipe: 0, yaw: -.15, morph: 0, maleMorph: .8, zoom: .74,
      onTurn: y => { lookYaw = y; },
      visible: () => onScreen && !stage.hidden,
      onFrame: () => { if (head) { head.setYaw(lookYaw + (still ? 0 : Math.sin(performance.now() / 6000) * .05)); pitchNow += (lookPitch - pitchNow) * .06; head.setPitch(pitchNow); } draw(); }
    })).then(h => { head = h; stage.classList.add('live'); draw(); }).catch(() => { head = null; stage.classList.add('flat'); });
  };
  new IntersectionObserver(es => es.forEach(e => { onScreen = e.isIntersecting; if (onScreen) start(); }), { rootMargin: '200px' }).observe(stage);
  addEventListener('resize', () => { spread(); draw(); });

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
