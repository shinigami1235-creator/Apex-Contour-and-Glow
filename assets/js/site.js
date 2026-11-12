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

  // ---- before and after: an ornate mirror shows the before, smoke fills it, and as the smoke clears the after is there ----
  const cmp = document.getElementById('compare');
  if (cmp && cmp.classList.contains('smokemirror')) {
    const before = cmp.querySelector('.before'), after = cmp.querySelector('.after'), cv = cmp.querySelector('.sm-smoke');
    const state = cmp.querySelector('.sm-state'), flipBtn = cmp.querySelector('[data-sm="flip"]');
    const LB = cmp.dataset.lb || 'Before', LA = cmp.dataset.la || 'After', kind = cmp.dataset.set || 'profhilo';
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let showing = 'before', run = 0;
    const show = w => { showing = w; after.style.opacity = w === 'after' ? 1 : 0; state.textContent = w === 'after' ? LA : LB; flipBtn.textContent = w === 'after' ? 'Show the before' : 'Show the after'; };
    const gl = still ? null : cv.getContext('webgl', { premultipliedAlpha: false, alpha: true });
    let prog = null, uP, uT, uR;
    if (gl) {
      const vs = 'attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}';
      const fs = `precision mediump float;varying vec2 v;uniform float uP,uT;uniform vec2 uR;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<6;i++){s+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return s;}
void main(){
  vec2 p=v*vec2(uR.x/uR.y,1.)*2.4;
  vec2 q=vec2(fbm(p+vec2(0.,uT*.12)),fbm(p+vec2(5.2,1.3)-vec2(uT*.07,0.)));
  vec2 r=vec2(fbm(p+3.*q+vec2(1.7,9.2)+uT*.09),fbm(p+3.*q+vec2(8.3,2.8)-uT*.06));
  float f=fbm(p+3.2*r+vec2(0.,-uT*.2));
  float e=length((v-.5)*vec2(1.,.8))*2.;
  float d=f+(uP*1.9-1.05)+(.5-v.y)*.5*(1.-uP)+e*.18;
  /* thin bright strands curling through a softer body, like smoke in still air */
  float w=pow(1.-abs(2.*fbm(p*1.1+2.*r-vec2(0.,uT*.14))-1.),2.5);
  float body=smoothstep(.32,.8,d);
  float lead=smoothstep(.05,.45,d)*(1.-body);
  float dens=clamp(.2+.5*f+.6*w,0.,1.);
  float a=body*mix(dens,1.,smoothstep(.85,1.,uP))+lead*w*.55;
  vec3 c=mix(vec3(.6,.55,.66),vec3(.99,.97,1.),clamp(w*.7+f*.4,0.,1.));
  gl_FragColor=vec4(c,min(a,.98));
}`;
      const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
      prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) prog = null;
      else {
        gl.useProgram(prog); const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
        const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        uP = gl.getUniformLocation(prog, 'uP'); uT = gl.getUniformLocation(prog, 'uT'); uR = gl.getUniformLocation(prog, 'uR');
        gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      }
    }
    const draw = (p, t) => {
      const w = cv.clientWidth, hh = cv.clientHeight, d = Math.min(1.5, devicePixelRatio || 1);
      if (cv.width !== Math.round(w * d)) { cv.width = Math.round(w * d); cv.height = Math.round(hh * d); }
      gl.viewport(0, 0, cv.width, cv.height); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uP, p); gl.uniform1f(uT, t); gl.uniform2f(uR, cv.width, cv.height); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    const ease = x => x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    // the before for a moment, smoke rolls in, the after is swapped in behind it, and the smoke drifts away
    const play = () => {
      const id = ++run; show('before');
      if (!prog) { setTimeout(() => { if (id === run) show('after'); }, 1200); return; }
      const t0 = performance.now(), IN = [900, 3100], HOLD = 3700, OUT = 6400;
      let swapped = false;
      const step = now => {
        if (id !== run) return;
        const t = now - t0, s = t / 1000;
        let p = 0;
        if (t < IN[0]) p = 0; else if (t < IN[1]) p = ease((t - IN[0]) / (IN[1] - IN[0])); else if (t < HOLD) p = 1; else p = 1 - ease(Math.min(1, (t - HOLD) / (OUT - HOLD)));
        if (!swapped && t >= IN[1]) { swapped = true; show('after'); }
        draw(p, s + 3);
        if (t < OUT + 50) requestAnimationFrame(step); else draw(0, s);
      };
      requestAnimationFrame(step);
    };
    show('before');
    let seen = false;
    new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting && !seen) { seen = true; setTimeout(play, 400); } }), { threshold: .55 }).observe(cmp.querySelector('.sm-frame'));
    cmp.querySelector('[data-sm="play"]').addEventListener('click', play);
    cmp.querySelector('.sm-glass').addEventListener('click', play);
    flipBtn.addEventListener('click', () => { run++; if (prog) draw(0, 0); show(showing === 'after' ? 'before' : 'after'); });
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
      base: 'assets/', sparkle: true, wipe: 0, yaw: -.55, gender: 'female', zoom: .74,
      visible: () => onScreen && !sec.querySelector('[data-panel="map"]').hidden,
      onFrame: () => { if (!still && head) head.setYaw(-.55 + Math.sin(performance.now() / 5000) * .12); draw(); }
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
