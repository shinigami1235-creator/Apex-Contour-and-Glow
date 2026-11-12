/* The 3D head for the filler simulator: the body map's face-zoom head (heads.bin), drawn in the same net
   look, with the chosen areas lifted along the skin's normal and lit in the colour of their step.
   Each injection point carries a drop whose volume is the real amount (1 mL = 1 cm³, the head is in
   decimetres), and the skin lifts by that same volume, true to size.
   The view is a wipe: before on the left of the line, after on the right.

   createHead(host, {threeUrl, base, gender, sparkle, wipe, yaw, onFrame}) -> {setPlan(points), setAmount(f), jumpAmount(f), setWipe(x),
     setGender(g), setView(name), setPoints(on), snapshot(amount, w, h, yaw) -> canvas, destroy()}
   f scales every point's mL (1 = the paper's minimum). x is the wipe line, 0 to 1 across the view.
   points: [{v:vertex index, ml:mL at this point, color:'#hex'}] */

const THREE_URL = new URL('../../vendor/three/three.module.js', import.meta.url).href;   // three 0.160.0, served by the site (vendor/README.md)
export const LIFT = 1;          // the lift is drawn true to size
const RADIUS = .16;             // spread of one injection on the skin, decimetres (1.6 cm)

const VS = `
attribute vec3 aPosB; attribute vec3 aNrmA; attribute vec3 aNrmB; attribute float aRnd; attribute float aEdge;
attribute float aKind; attribute float aAo; attribute float aDispA; attribute float aDispB; attribute vec3 aCol; attribute float aHeat;
uniform float uMorph, uAfter, uPix, uSize, uCut, uTime, uLine, uIsLine, uFocus, uDepthR, uSpark, uCalm, uJaw, uBlink, uMouth, uEye, uScatter;
varying float vA; varying vec3 vC; varying float vH; varying float vR; varying float vF;
float is(float v, float t){ return 1. - step(.1, abs(v - t)); }
void main(){
  float m = smoothstep(0., 1., uMorph);
  vec3 p = mix(position, aPosB, m);
  vec3 n = normalize(mix(aNrmA, aNrmB, m));
  float a = max(uAfter, 0.);
  p += n * mix(aDispA, aDispB, m) * a;
  /* speech: the lower face turns on a hinge near the ear, the upper lip lifts a little */
  float below = 1. - smoothstep(uMouth - .025, uMouth + .012, p.y);
  float jw = below * smoothstep(.2, .75, p.z) * smoothstep(5.2, 5.5, p.y);
  float ang = -uJaw * .3 * jw;
  vec2 hz = vec2(uMouth + .42, .3), yz = p.yz - hz;
  p.yz = hz + vec2(yz.x * cos(ang) - yz.y * sin(ang), yz.x * sin(ang) + yz.y * cos(ang));
  p.y += uJaw * .014 * is(aKind, 1.) * (1. - below);
  /* blink: the upper lid comes down over the eye */
  p.y -= uBlink * .085 * is(aKind, 5.) * smoothstep(-.1, .05, p.y - uEye);
  /* dust: the points drift apart along a slow swirl */
  vec3 sw = vec3(sin(aRnd * 91. + uTime * .7), cos(aRnd * 53. + uTime * .5), sin(aRnd * 27. - uTime * .6));
  p += sw * uScatter * (.6 + aRnd * 1.4);
  vec4 mv = modelViewMatrix * vec4(p, 1.);
  gl_Position = projectionMatrix * mv;
  float f = dot(normalize(normalMatrix * n), normalize(-mv.xyz));
  float back = f < 0. ? .05 : 1.;
  float tone = 1. - is(aKind, 1.) * .55 - is(aKind, 7.) * .5 - is(aKind, 2.) * .5 - is(aKind, 3.) * .3 - is(aKind, 4.) * .15 + is(aKind, 5.) * .4;
  tone *= mix(.55, 1., smoothstep(.55, .95, aAo));
  float keep = smoothstep(uCut - .1, uCut + .14, p.y);
  float h = aHeat * min(a, 1.);
  /* nearer is brighter, so the shape of the head reads in depth */
  float depth = 1. - smoothstep(0., 1., (-mv.z - uFocus) / uDepthR) * .72;
  vH = h; vC = aCol;
  vA = back * tone * keep * depth * (uIsLine > .5 ? mix(uLine, .5, h) : 1.);
  float ew = aEdge < .5 ? 1. : (aEdge < 1.5 ? .75 : .55);
  vA *= uIsLine > .5 ? 1. : ew;
  /* sparkle: every point twinkles at its own pace, and a few flare bright at a time */
  float tw = .45 + .55 * (.5 + .5 * sin(uTime * (1.1 + aRnd * 2.6) + aRnd * 37.));
  float fl = pow(max(0., sin(uTime * (.35 + aRnd * .5) + aRnd * 91.)), 28.);
  /* calm: the face is lit from one side so its shape reads, the outline glows, and only a few lights flare at a time */
  vec3 nv = normalize(normalMatrix * n);
  float lam = max(0., dot(nv, normalize(vec3(-.55, .45, .7))));
  float rim = pow(1. - clamp(f, 0., 1.), 2.2);
  float shape = .45 + 1.5 * lam + 1.6 * rim;
  float rare = step(.93, fract(aRnd * 7.31)) * pow(max(0., sin(uTime * (.25 + aRnd * .3) + aRnd * 53.)), 40.);
  float twc = .85 + .15 * sin(uTime * (.8 + aRnd) + aRnd * 29.);
  tw = mix(tw, twc * shape, uCalm); fl = mix(fl, rare, uCalm);
  vR = aRnd; vF = fl * uSpark;
  vA *= 1. - uBlink * is(aKind, 2.);
  vA *= 1. - uScatter * .35;
  vA *= mix(1., tw + fl * 2.2, uSpark);
  vA *= mix(1., aEdge < .5 ? 1. : .8, uCalm * uSpark);
  float big = mix(1., (.7 + fl * 2.6) * mix(1.15, 1.1, uCalm), uSpark);
  gl_PointSize = clamp(uSize * big * (1. + h * .9) * (.75 + aRnd * .5) * 3.4 / -mv.z, 1., mix(8., 22., uSpark)) * uPix;
}`;
const FS = `
varying float vA; varying vec3 vC; varying float vH; varying float vR; varying float vF;
uniform float uIsLine, uSpark, uCalm, uFeat;
void main(){
  if (uFeat > .5) { gl_FragColor = vec4(.98, .85, .6, min(1., vA * 1.1)); return; }
  if (uSpark > .5 && uIsLine < .5) {
    vec2 c = gl_PointCoord - .5; float d = length(c);
    if (d > .5) discard;
    /* a bright core, a soft halo, and a thin cross on the points that flare */
    float a = exp(-d * d * 60.) + .35 * exp(-d * d * 9.) + vF * .6 * (exp(-abs(c.x) * 40.) + exp(-abs(c.y) * 40.)) * (1. - d * 2.);
    vec3 base = mix(vec3(1., .95, .99), vec3(.98, .80, .50), smoothstep(.35, .9, vR));
    vec3 col = mix(base, vC, min(1., vH * 1.4));
    gl_FragColor = vec4(col, a * vA * (mix(.5, 1.1, uCalm) + vH * .6));
    return;
  }
  float d = 0.;
  if (uIsLine < .5) { vec2 c = gl_PointCoord - .5; d = length(c); if (d > .5) discard; }
  float a = uIsLine > .5 ? 1. : 1. - smoothstep(0., .5, d);
  vec3 base = uIsLine > .5 ? vec3(.55, .42, .72) : vec3(.70, .58, .86);
  vec3 col = mix(base, vC, min(1., vH * 1.4));
  gl_FragColor = vec4(col, a * vA * (.85 + vH * .6));
}`;
const DROP_VS = `varying vec3 vN; varying vec3 vV;
void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`;
const DROP_FS = `varying vec3 vN; varying vec3 vV; uniform vec3 uCol; uniform float uOp;
void main(){ float f = 1. - clamp(dot(vN, vV), 0., 1.); float a = (.22 + pow(f, 1.6) * .85) * uOp; gl_FragColor = vec4(mix(uCol, vec3(1.), .25 * (1. - f)), a); }`;

function unpackI16(buf, off, n, h){
  const q = new Int16Array(buf, off, n * 3), p = new Float32Array(n * 3), s = h[3] / 32767;
  for (let i = 0; i < n * 3; i++) p[i] = q[i] * s + h[i % 3];
  return p;
}
function unpackOcta(buf, off, n){
  const q = new Uint8Array(buf, off, n * 2), o = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    let x = q[i * 2] / 255 * 2 - 1, y = q[i * 2 + 1] / 255 * 2 - 1, z = 1 - Math.abs(x) - Math.abs(y);
    if (z < 0) { const ox = x; x = (1 - Math.abs(y)) * Math.sign(ox || 1); y = (1 - Math.abs(ox)) * Math.sign(y || 1); }
    const l = Math.hypot(x, y, z) || 1;
    o[i * 3] = x / l; o[i * 3 + 1] = y / l; o[i * 3 + 2] = z / l;
  }
  return o;
}
function decodeHeads(buf){
  const dv = new DataView(buf);
  const n = dv.getUint32(0, true), ne = dv.getUint32(4, true);
  const h = new Float32Array(buf.slice(8, 32));
  const o = 32 + n * 12 + ne * 4;
  const out = {n, cutF:h[4], cutM:h[5], e:new Uint16Array(buf, 32 + n * 12, ne * 2),
    pf:unpackI16(buf, 32, n, h), pm:unpackI16(buf, 32 + n * 6, n, h), nf:unpackOcta(buf, o, n), nm:unpackOcta(buf, o + n * 2, n)};
  const ak = new Uint8Array(buf, o + n * 4, n);
  out.kind = new Float32Array(n);
  for (let i = 0; i < n; i++) out.kind[i] = ak[i] >> 4;
  out.ao = Float32Array.from(new Uint8Array(buf, o + n * 5, n), v => v / 255);
  return out;
}
const hex = c => [parseInt(c.slice(1, 3), 16) / 255, parseInt(c.slice(3, 5), 16) / 255, parseInt(c.slice(5, 7), 16) / 255];

export async function createHead(host, opts = {}){
  const THREE = await import(opts.threeUrl || THREE_URL);
  const res = await fetch((opts.base || '') + 'features/bodymap/heads.bin');
  if (!res.ok) throw new Error('heads.bin ' + res.status);
  const H = decodeHeads(await res.arrayBuffer());
  const n = H.n, ne = H.e.length / 2, E = H.e;

  /* points: every vertex plus three along each edge; lines: one segment per edge */
  const np = n + ne * 3, ea = new Uint16Array(ne * 3), eb = new Uint16Array(ne * 3), et = new Float32Array(ne * 3);
  for (let q = 0, j = 0; q < ne; q++) for (let s = 1; s < 4; s++, j++) { ea[j] = E[q * 2]; eb[j] = E[q * 2 + 1]; et[j] = s / 4 + (Math.random() - .5) * .08; }
  const mk = k => new Float32Array(np * k);
  const P = mk(3), PB = mk(3), NA = mk(3), NB = mk(3), rnd = mk(1), edge = mk(1), kind = mk(1), ao = mk(1);
  P.set(H.pf); PB.set(H.pm); NA.set(H.nf); NB.set(H.nm); kind.set(H.kind); ao.set(H.ao);
  for (let i = 0; i < n; i++) rnd[i] = Math.random();
  for (let j = 0; j < ne * 3; j++) {
    const a = ea[j], b = eb[j], t = et[j], k = n + j;
    for (let c = 0; c < 3; c++) {
      P[k * 3 + c] = H.pf[a * 3 + c] + (H.pf[b * 3 + c] - H.pf[a * 3 + c]) * t; PB[k * 3 + c] = H.pm[a * 3 + c] + (H.pm[b * 3 + c] - H.pm[a * 3 + c]) * t;
      NA[k * 3 + c] = H.nf[a * 3 + c] + (H.nf[b * 3 + c] - H.nf[a * 3 + c]) * t; NB[k * 3 + c] = H.nm[a * 3 + c] + (H.nm[b * 3 + c] - H.nm[a * 3 + c]) * t;
    }
    const near = t < .5 ? a : b; kind[k] = H.kind[near]; ao[k] = H.ao[near]; rnd[k] = Math.random(); edge[k] = j % 3 === 1 ? 1 : 2;
  }
  const dispA = mk(1), dispB = mk(1), col = mk(3), heat = mk(1);
  const pg = new THREE.BufferGeometry(), at = (g, k, a, s) => { const b = new THREE.BufferAttribute(a, s); g.setAttribute(k, b); return b; };
  at(pg, 'position', P, 3); at(pg, 'aPosB', PB, 3); at(pg, 'aNrmA', NA, 3); at(pg, 'aNrmB', NB, 3); at(pg, 'aRnd', rnd, 1); at(pg, 'aEdge', edge, 1);
  at(pg, 'aKind', kind, 1); at(pg, 'aAo', ao, 1);
  const bDA = at(pg, 'aDispA', dispA, 1), bDB = at(pg, 'aDispB', dispB, 1), bC = at(pg, 'aCol', col, 3), bH = at(pg, 'aHeat', heat, 1);
  // lines share the vertex attributes through an index on the first n points
  const lg = new THREE.BufferGeometry();
  ['position', 'aPosB', 'aNrmA', 'aNrmB', 'aRnd', 'aEdge', 'aKind', 'aAo', 'aDispA', 'aDispB', 'aCol', 'aHeat'].forEach(k => lg.setAttribute(k, pg.getAttribute(k)));
  lg.setIndex(new THREE.BufferAttribute(new Uint16Array(E), 1));

  const dpr = window.devicePixelRatio || 1;
  const coarse = (() => { try { return matchMedia('(pointer:coarse)').matches; } catch (e) { return false; } })();
  const pix = Math.min(dpr, coarse ? 1.25 : 1.5);
  const renderer = new THREE.WebGLRenderer({antialias:dpr < 1.5 && !coarse, alpha:true, preserveDrawingBuffer:false});
  renderer.setClearColor(0x000000, 0); renderer.setPixelRatio(pix);
  host.prepend(renderer.domElement);
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(26, 1, .05, 100);
  const U = {uMorph:{value:opts.gender === 'male' ? 1 : 0}, uAfter:{value:1}, uPix:{value:pix}, uSize:{value:2.6}, uCut:{value:H.cutF},
    uTime:{value:0}, uLine:{value:.2}, uIsLine:{value:0}, uFocus:{value:5}, uDepthR:{value:1.5}, uSpark:{value:opts.sparkle ? 1 : 0}, uCalm:{value:opts.sparkle ? 1 : 0}, uJaw:{value:0}, uBlink:{value:0}, uMouth:{value:5.866}, uEye:{value:6.47}, uScatter:{value:0}};
  const mat = (isLine, feat) => new THREE.ShaderMaterial({uniforms:{...U, uIsLine:{value:isLine ? 1 : 0}, uFeat:{value:feat ? 1 : 0}}, vertexShader:VS, fragmentShader:FS, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending});
  const pmat = mat(false), lmat = mat(true);
  const points = new THREE.Points(pg, pmat), lines = new THREE.LineSegments(lg, lmat);
  points.frustumCulled = lines.frustumCulled = false;
  scene.add(lines, points);
  /* constellation look: only the mesh's own points, not the extra ones along each edge */
  if (opts.sparse) { pg.setDrawRange(0, n); U.uSize.value = 4.2; }
  /* faint gold lines on the features: lips, the mouth line, the eyelids, and the bridge of the nose */
  let feat = null;
  if (opts.features) {
    // only outlines: the lip edge (lip points that touch skin), the mouth line, and each eyelid's own row
    const nb = Array.from({length:n}, () => []);
    for (let q = 0; q < ne; q++) { const a = E[q * 2], b = E[q * 2 + 1]; nb[a].push(b); nb[b].push(a); }
    const edgeOf = (i, k) => H.kind[i] === k && nb[i].some(j => H.kind[j] !== k);
    const idx = [];
    for (let q = 0; q < ne; q++) {
      const a = E[q * 2], b = E[q * 2 + 1], ka = H.kind[a], kb = H.kind[b];
      if (ka !== kb) continue;
      const rim = i => nb[i].some(j => H.kind[j] === 2);   // a lid point on the eye opening
      if (ka === 7 || ((ka === 5 || ka === 6) && rim(a) && rim(b)) || (ka === 1 && edgeOf(a, 1) && edgeOf(b, 1))) idx.push(a, b);
    }
    const fg = new THREE.BufferGeometry();
    ['position', 'aPosB', 'aNrmA', 'aNrmB', 'aRnd', 'aEdge', 'aKind', 'aAo', 'aDispA', 'aDispB', 'aCol', 'aHeat'].forEach(k => fg.setAttribute(k, pg.getAttribute(k)));
    fg.setIndex(new THREE.BufferAttribute(new Uint16Array(idx), 1));
    feat = new THREE.LineSegments(fg, mat(true, true)); feat.frustumCulled = false; scene.add(feat);
  }
  /* where the mouth and eyes sit on each head, so speech and blinks land on the right rows */
  const meanY = (k, p) => { let s = 0, c = 0; for (let i = 0; i < n; i++) if (H.kind[i] === k) { s += p[i * 3 + 1]; c++; } return c ? s / c : 0; };
  const MOUTH = [meanY(7, H.pf), meanY(7, H.pm)], EYE = [meanY(2, H.pf), meanY(2, H.pm)];
  if (opts.sparkle) lines.visible = false;   // sparkle look: lights only, no net
  const drops = new THREE.Group(); scene.add(drops);
  const dropGeo = new THREE.SphereGeometry(1, 20, 14);

  /* framing: the face of the current gender */
  const centre = g => {
    const p = g ? H.pm : H.pf, cut = g ? H.cutM : H.cutF;
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for (let i = 0; i < n; i++) { const y = p[i * 3 + 1]; if (y < cut) continue; x0 = Math.min(x0, p[i * 3]); x1 = Math.max(x1, p[i * 3]); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    return {x:(x0 + x1) / 2, y:y0 + (y1 - y0) * .5, z:.45, h:y1 - y0};
  };
  const yaw0 = opts.yaw ?? -.5;
  const state = {g:opts.gender === 'male' ? 1 : 0, gT:opts.gender === 'male' ? 1 : 0, after:1, afterT:1, wipe:opts.wipe ?? .5, yaw:yaw0, yawT:yaw0, pitch:.04, plan:[], points:true, dirty:true};
  const VIEWS = {front:0, q:-.62, side:-1.45};

  function computeDisp(){
    dispA.fill(0); dispB.fill(0); heat.fill(0); col.fill(0);
    const W = new Float32Array(n * 3), D = [new Float32Array(n), new Float32Array(n)], HT = new Float32Array(n);
    for (const pt of state.plan) {
      const c = hex(pt.color), V = pt.ml * .001;            // mL to dm³
      const A = 2 * V / (Math.PI * RADIUS * RADIUS) * LIFT;  // a Gaussian bump of this volume, drawn LIFT times taller
      [[H.pf, 0], [H.pm, 1]].forEach(([p, g]) => {
        const cx = p[pt.v * 3], cy = p[pt.v * 3 + 1], cz = p[pt.v * 3 + 2], R2 = RADIUS * RADIUS * (g ? 1.15 : 1);
        for (let i = 0; i < n; i++) {
          const dx = p[i * 3] - cx, dy = p[i * 3 + 1] - cy, dz = p[i * 3 + 2] - cz, r2 = dx * dx + dy * dy + dz * dz;
          if (r2 > R2 * 4) continue;
          const w = Math.exp(-2 * r2 / R2);
          D[g][i] += A * w;
          if (!g) { HT[i] = Math.max(HT[i], w); W[i * 3] += c[0] * w; W[i * 3 + 1] += c[1] * w; W[i * 3 + 2] += c[2] * w; }
        }
      });
    }
    let mx = 1e-6; for (let i = 0; i < n; i++) mx = Math.max(mx, D[0][i]);
    for (let i = 0; i < n; i++) {
      const s = W[i * 3] + W[i * 3 + 1] + W[i * 3 + 2];
      const k = s > 1e-6 ? 3 / s * Math.max(W[i * 3], W[i * 3 + 1], W[i * 3 + 2]) / 3 : 0;
      dispA[i] = D[0][i]; dispB[i] = D[1][i]; heat[i] = Math.min(1, HT[i] * 1.1);
      if (s > 1e-6) { const t = W[i * 3] + W[i * 3 + 1] + W[i * 3 + 2]; col[i * 3] = W[i * 3] / t * 1.6; col[i * 3 + 1] = W[i * 3 + 1] / t * 1.6; col[i * 3 + 2] = W[i * 3 + 2] / t * 1.6; }
    }
    for (let j = 0; j < ne * 3; j++) {
      const a = ea[j], b = eb[j], t = et[j], k = n + j;
      dispA[k] = dispA[a] + (dispA[b] - dispA[a]) * t; dispB[k] = dispB[a] + (dispB[b] - dispB[a]) * t; heat[k] = heat[a] + (heat[b] - heat[a]) * t;
      for (let c = 0; c < 3; c++) col[k * 3 + c] = col[a * 3 + c] + (col[b * 3 + c] - col[a * 3 + c]) * t;
    }
    bDA.needsUpdate = bDB.needsUpdate = bC.needsUpdate = bH.needsUpdate = true;
    // drops: a sphere of the real volume at each point, sitting on the lifted skin
    while (drops.children.length) { const d = drops.children.pop(); d.material.dispose(); }
    for (const pt of state.plan) {
      const r = Math.cbrt(3 * pt.ml * .001 / (4 * Math.PI));
      const m = new THREE.Mesh(dropGeo, new THREE.ShaderMaterial({uniforms:{uCol:{value:new THREE.Color(pt.color)}, uOp:{value:1}}, vertexShader:DROP_VS, fragmentShader:DROP_FS, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending}));
      m.scale.setScalar(r); m.userData = {v:pt.v, r};
      drops.add(m);
    }
    state.dirty = true;
  }
  function placeDrops(cam = camera){
    const g = state.g, a = Math.max(0, state.after);
    for (const m of drops.children) {
      const v = m.userData.v, pA = H.pf, pB = H.pm, nA = H.nf, nB = H.nm, r = m.userData.r;
      const P3 = c => pA[v * 3 + c] + (pB[v * 3 + c] - pA[v * 3 + c]) * g, N3 = c => nA[v * 3 + c] + (nB[v * 3 + c] - nA[v * 3 + c]) * g;
      const rr = r * Math.cbrt(Math.max(a, .001));
      m.scale.setScalar(rr);
      const lift = (dispA[v] + (dispB[v] - dispA[v]) * g) * a + rr * .4;
      m.position.set(P3(0) + N3(0) * lift, P3(1) + N3(1) * lift, P3(2) + N3(2) * lift);
      // drops on the far side of the head fade out
      const cx = cam.position.x - m.position.x, cy = cam.position.y - m.position.y, cz = cam.position.z - m.position.z, cl = Math.hypot(cx, cy, cz) || 1;
      const face = (N3(0) * cx + N3(1) * cy + N3(2) * cz) / cl, vis = Math.min(1, Math.max(0, (face + .15) / .45));
      m.visible = state.points && vis > .02;
      m.material.uniforms.uOp.value = Math.min(1, .35 + .65 * a) * vis;
    }
  }

  function size(){
    const w = host.clientWidth || 600, h = host.clientHeight || 600;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); state.dirty = true;
  }
  function place(cam = camera, yaw = state.yaw){
    const C = centre(state.g > .5 ? 1 : 0), d = C.h * 2.55 / Math.min(1, cam.aspect) * (opts.zoom || 1);
    cam.position.set(C.x + Math.sin(yaw) * d * Math.cos(state.pitch), C.y + Math.sin(state.pitch) * d, C.z + Math.cos(yaw) * d * Math.cos(state.pitch));
    cam.lookAt(C.x, C.y, C.z);
    if (opts.centre) {
      // keep the head's outline in the middle of the view, since a turned head carries more of its shape on the face side
      cam.updateMatrixWorld(); const v = new THREE.Vector3(), P = state.g > .5 ? H.pm : H.pf, cut = state.g > .5 ? H.cutM : H.cutF;
      let x0 = 9, x1 = -9;
      for (let i = 0; i < n; i += 5) { if (P[i * 3 + 1] < cut) continue; v.set(P[i * 3], P[i * 3 + 1], P[i * 3 + 2]).project(cam); x0 = Math.min(x0, v.x); x1 = Math.max(x1, v.x); }
      const off = (x0 + x1) / 2, right = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 0);
      const span = 2 * d * Math.tan(cam.fov * Math.PI / 360) * cam.aspect / 2;
      cam.position.addScaledVector(right, off * span);
    }
    U.uFocus.value = d - 1.05;   // the front of the face
  }
  const setAmt = a => { U.uAfter.value = a; };
  let raf = 0, t0 = performance.now(), alive = true, drag = null;
  const still = (() => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } })();
  if (opts.sparkle && still) U.uTime.value = 12;
  function frame(now){
    if (!alive) return;
    raf = requestAnimationFrame(frame);
    if (opts.visible && !opts.visible()) { t0 = now; return; }
    const dt = Math.min(.05, (now - t0) / 1000); t0 = now;
    let moving = false;
    const ap = (k, kT, s) => { const d = state[kT] - state[k]; if (Math.abs(d) > 1e-4) { state[k] += d * Math.min(1, dt * s); moving = true; } else state[k] = state[kT]; };
    ap('g', 'gT', 5); ap('after', 'afterT', 3.2); if (!drag) ap('yaw', 'yawT', 4);
    if (opts.sparkle && !still) { U.uTime.value = now / 1000; state.dirty = true; }
    if (!moving && !state.dirty) return;
    U.uMorph.value = state.g; U.uCut.value = H.cutF + (H.cutM - H.cutF) * state.g;
    U.uMouth.value = MOUTH[0] + (MOUTH[1] - MOUTH[0]) * state.g; U.uEye.value = EYE[0] + (EYE[1] - EYE[0]) * state.g;
    place();
    // the wipe: before (no filler) left of the line, after right of it
    const w = host.clientWidth || 600, h = host.clientHeight || 600, wx = Math.round(w * state.wipe);
    renderer.setScissorTest(true);
    renderer.setScissor(0, 0, wx, h); setAmt(0); drops.visible = false; renderer.render(scene, camera);
    renderer.setScissor(wx, 0, w - wx, h); setAmt(state.after); drops.visible = true; placeDrops(); renderer.render(scene, camera);
    renderer.setScissorTest(false);
    state.dirty = false;
    if (opts.onFrame) opts.onFrame();
  }
  const ro = new ResizeObserver(size); ro.observe(host); size();
  // drag to turn the head
  const cv = renderer.domElement;
  cv.style.touchAction = 'pan-y';
  cv.addEventListener('pointerdown', e => { drag = {x:e.clientX, y:e.clientY, yaw:state.yaw, on:e.pointerType === 'mouse'}; });
  cv.addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.on) { if (Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) { drag.on = true; try { cv.setPointerCapture(e.pointerId); } catch (er) {} } else if (Math.abs(dy) > 10) { drag = null; return; } else return; }
    state.yaw = state.yawT = Math.max(-1.6, Math.min(1.6, drag.yaw - dx / (cv.clientWidth || 400) * 3)); state.dirty = true;
  });
  const end = () => { drag = null; };
  cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
  raf = requestAnimationFrame(frame);

  return {
    setPlan(pts){ state.plan = pts; computeDisp(); },
    setAmount(f){ state.afterT = f; state.dirty = true; },
    jumpAmount(f){ state.after = state.afterT = f; state.dirty = true; },
    setWipe(x){ state.wipe = Math.max(0, Math.min(1, x)); state.dirty = true; },
    setGender(g){ state.gT = g === 'male' ? 1 : 0; state.dirty = true; },
    setView(v){ state.yawT = VIEWS[v] ?? state.yawT; state.dirty = true; },
    setPoints(on){ state.points = on; state.dirty = true; },
    /* where vertex v sits on screen (CSS px inside host), and how much it faces the camera (0 to 1) */
    anchor(v){
      const g = state.g, P3 = c => H.pf[v * 3 + c] + (H.pm[v * 3 + c] - H.pf[v * 3 + c]) * g, N3 = c => H.nf[v * 3 + c] + (H.nm[v * 3 + c] - H.nf[v * 3 + c]) * g;
      const w = new THREE.Vector3(P3(0), P3(1), P3(2)), s = w.clone().project(camera);
      const cx = camera.position.x - w.x, cy = camera.position.y - w.y, cz = camera.position.z - w.z, cl = Math.hypot(cx, cy, cz) || 1;
      const f = (N3(0) * cx + N3(1) * cy + N3(2) * cz) / cl;
      return {x:(s.x + 1) / 2 * host.clientWidth, y:(1 - s.y) / 2 * host.clientHeight, front:Math.max(0, Math.min(1, (f + .1) / .5))};
    },
    setYaw(y){ state.yawT = y; state.dirty = true; },
    setPitch(p){ state.pitch = p; state.dirty = true; },
    /* speech and life: jaw 0 to 1, blink 0 to 1, scatter 0 (whole) to about .6 (dust) */
    setFace({jaw, blink, scatter} = {}){ if (jaw != null) U.uJaw.value = jaw; if (blink != null) U.uBlink.value = blink; if (scatter != null) U.uScatter.value = scatter; state.dirty = true; },
    resize(){ size(); },
    /* a still of the head with no filler (0) or the chosen amount, for the saved image */
    snapshot(after, w = 700, h = 840, yaw = 0){
      const keep = {after:state.after, yaw:state.yaw};
      state.after = after;
      const cam = camera.clone(); cam.aspect = w / h; cam.updateProjectionMatrix();
      renderer.setSize(w, h, false); renderer.setPixelRatio(1);
      for (const m of [pmat, lmat]) m.uniforms.uPix.value = 1;
      setAmt(after); drops.visible = after > 0;
      place(cam, yaw); placeDrops(cam);
      renderer.render(scene, cam);
      const out = document.createElement('canvas'); out.width = w; out.height = h;
      out.getContext('2d').drawImage(renderer.domElement, 0, 0, w, h);
      state.after = keep.after; renderer.setPixelRatio(pix);
      for (const m of [pmat, lmat]) m.uniforms.uPix.value = pix;
      size(); state.dirty = true;
      return out;
    },
    destroy(){ alive = false; cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose(); pg.dispose(); lg.dispose(); dropGeo.dispose(); cv.remove(); },
    _state:state,
  };
}
