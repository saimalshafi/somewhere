// ============================================================================
//  SOMEWHERE — procedural architectural sketchbook
//  Core: randomness, noise, projection, geometry, watercolor + ink primitives
// ============================================================================
'use strict';
const TAU = Math.PI * 2;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hash(...args) {
  let h = 2166136261;
  for (const a of args) {
    const s = String(a);
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    h ^= 0x9e37; h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
class Rand {
  constructor(seed) { this.seed = seed >>> 0; this.r = mulberry32(this.seed); }
  f() { return this.r(); }
  range(a, b) { return a + (b - a) * this.r(); }
  int(a, b) { return Math.floor(this.range(a, b + 1)); }
  pick(a) { return a[Math.floor(this.r() * a.length)]; }
  chance(p) { return this.r() < p; }
  gauss() { let u = 0; while (!u) u = this.r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * this.r()); }
  wpick(list) { // [[value, weight], ...]
    let t = 0; for (const [, w] of list) t += w;
    let x = this.r() * t;
    for (const [v, w] of list) { if ((x -= w) <= 0) return v; }
    return list[list.length - 1][0];
  }
  fork(tag) { return new Rand(hash(this.seed, tag)); }
}

// ---- Perlin noise ----------------------------------------------------------
function noiseGrad(h, x, y) { h &= 7; const a = h < 4 ? x : y, b = h < 4 ? y : x; return ((h & 1) ? -a : a) + ((h & 2) ? -2 * b : 2 * b); }
class Noise {
  constructor(seed) {
    const r = new Rand(seed), p = [...Array(256).keys()];
    for (let i = 255; i > 0; i--) { const j = Math.floor(r.f() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
    this.p = new Uint8Array(512); for (let i = 0; i < 512; i++) this.p[i] = p[i & 255];
  }
  n2(x, y) { // ~[-1,1]
    const p = this.p;
    let X = Math.floor(x), Y = Math.floor(y); x -= X; y -= Y; X &= 255; Y &= 255;
    const u = x * x * x * (x * (x * 6 - 15) + 10), v = y * y * y * (y * (y * 6 - 15) + 10);
    const g = noiseGrad;
    const A = p[X] + Y, B = p[X + 1] + Y;
    return lerp(lerp(g(p[A], x, y), g(p[B], x - 1, y), u), lerp(g(p[A + 1], x, y - 1), g(p[B + 1], x - 1, y - 1), u), v) * 0.5;
  }
  f(x, y = 0) { return this.n2(x, y) * 0.5 + 0.5; }
  fbm(x, y, o = 3) { let s = 0, a = 1, n = 0; for (let i = 0; i < o; i++) { s += this.n2(x, y) * a; n += a; a *= 0.5; x *= 2.03; y *= 2.03; } return s / n; }
}

// ---- global render state (set per render) ---------------------------------
let C = null;        // CanvasRenderingContext2D
let PXS = 1;         // device pixels per page unit: 1 on screen, 3 for a print export
let RR = null;       // Rand for the current drawing item
let NZ = new Noise(1);
const VIEW = { cx: 0, eye: 180, D: 2000, k: 1, ox: 0, oy: 0 };
const SUN = { left: true, L: [-0.55, 0.72, 0.5] };
const FLAGS = { wash: true, ink: true, plants: true };
const STATS = { wash: 0, ink: 0, leaf: 0, shadow: 0 }; // marks actually made, for the title block

// one-point perspective: world (x right, y up, z toward viewer; cm) -> screen px
function P(p) {
  const s = VIEW.D / (VIEW.D - p[2]);
  const x = VIEW.ox + (VIEW.cx + (p[0] - VIEW.cx) * s) * VIEW.k, y = VIEW.oy - (VIEW.eye + (p[1] - VIEW.eye) * s) * VIEW.k;
  if (BBT && x === x && y === y) { if (x < BBT[0]) BBT[0] = x; if (y < BBT[1]) BBT[1] = y; if (x > BBT[2]) BBT[2] = x; if (y > BBT[3]) BBT[3] = y; }
  return [x, y];
}
// ---- tracing, for the blueprint view: off unless a blueprint is being recorded
let BBT = null;      // when set, every projected point grows this screen box
let TRACE = false;   // when set, each painted item remembers which function queued it
function callerName() {
  const st = (new Error().stack || '').split('\n');
  for (let i = 1; i < st.length; i++) {
    const m = st[i].match(/at (?:new )?([\w$.\/<>]+) [(\[]/) || st[i].match(/^\s*([\w$.\/<>]*)@/);
    if (!m) continue;
    const n = m[1].split(/[./]/).pop();
    if (!/^[A-Za-z_$][\w$]*$/.test(n) || /^(add|forEach|map|push|callerName|generate)$/.test(n)) continue;
    return n;
  }
  return 'draw';
}
const quad = (x0, y0, x1, y1, z) => [P([x0, y0, z]), P([x1, y0, z]), P([x1, y1, z]), P([x0, y1, z])];

// ---- Faces: a parametric planar patch (O + U*s + V*t) ----------------------
class Face {
  constructor(O, U, V, poly, key) { this.O = O; this.U = U; this.V = V; this.poly = poly; this.key = key || 'front'; }
  w3(s, t) { const { O, U, V } = this; return [O[0] + U[0] * s + V[0] * t, O[1] + U[1] * s + V[1] * t, O[2] + U[2] * s + V[2] * t]; }
  sp(s, t) { return P(this.w3(s, t)); }
  spoly(poly = this.poly) { return poly.map(q => this.sp(q[0], q[1])); }
  get n() { const { U, V } = this; return [U[1] * V[2] - U[2] * V[1], U[2] * V[0] - U[0] * V[2], U[0] * V[1] - U[1] * V[0]]; }
}
const rectP = (w, h) => [[0, 0], [w, 0], [w, h], [0, h]];
function boxFaces(b) {
  const { x0, x1, y0, y1, z0, z1 } = b, w = x1 - x0, h = y1 - y0, d = z1 - z0, f = {};
  if (VIEW.cx < x0) f.left = new Face([x0, y0, z0], [0, 0, 1], [0, 1, 0], rectP(d, h), 'left');
  if (VIEW.cx > x1) f.right = new Face([x1, y0, z1], [0, 0, -1], [0, 1, 0], rectP(d, h), 'right');
  if (VIEW.eye < y0) f.bottom = new Face([x0, y0, z0], [1, 0, 0], [0, 0, 1], rectP(w, d), 'bottom');
  if (VIEW.eye > y1) f.top = new Face([x0, y1, z1], [1, 0, 0], [0, 0, -1], rectP(w, d), 'top');
  f.front = new Face([x0, y0, z1], [1, 0, 0], [0, 1, 0], rectP(w, h), 'front');
  return f;
}
const boxCorners = b => { const o = []; for (const x of [b.x0, b.x1]) for (const y of [b.y0, b.y1]) for (const z of [b.z0, b.z1]) o.push([x, y, z]); return o; };

// how much a face is turned away from the sun, 0 (lit) .. 1 (full shade)
function shadeOf(n) {
  const L = SUN.L, d = n[0] * L[0] + n[1] * L[1] + n[2] * L[2], front = L[2];
  return clamp((front - d) / (front + 0.25), 0, 1);
}

// ---- colour ---------------------------------------------------------------
const rgba = (c, a) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const mix = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const jit = (c, amt = 8, R = RR) => c.map(v => clamp(v + R.gauss() * amt, 0, 255));
const darken = (c, t) => mix(c, [48, 40, 62], t);
const COL = {
  paper: [251, 249, 244], ink: [48, 36, 34], shadow: [112, 106, 164], shadowDeep: [80, 76, 128],
  fDark: [26, 50, 62], fMid: [72, 108, 66], fLight: [146, 176, 72], fHi: [206, 212, 112], berry: [184, 64, 52],
};

// ---- polygon helpers --------------------------------------------------------
function centroid(pts) { let x = 0, y = 0; for (const p of pts) { x += p[0]; y += p[1]; } return [x / pts.length, y / pts.length]; }
function bbox(pts) { let a = 1e9, b = 1e9, c = -1e9, d = -1e9; for (const p of pts) { a = Math.min(a, p[0]); b = Math.min(b, p[1]); c = Math.max(c, p[0]); d = Math.max(d, p[1]); } return [a, b, c, d]; }
function inset(pts, px) { if (!px) return pts; const c = centroid(pts); return pts.map(p => { const dx = c[0] - p[0], dy = c[1] - p[1], l = Math.hypot(dx, dy) || 1; const m = Math.min(px, l * 0.4); return [p[0] + dx / l * m, p[1] + dy / l * m]; }); }
function deform(pts, amp, depth) {
  let p = pts;
  for (let d = 0; d < depth; d++) {
    const q = [];
    for (let i = 0; i < p.length; i++) {
      const a = p[i], b = p[(i + 1) % p.length]; q.push(a);
      const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy);
      if (len < 3) continue;
      const m = RR.range(0.3, 0.7), g = RR.gauss() * amp * Math.min(1, len / 40);
      q.push([a[0] + dx * m - dy / len * g, a[1] + dy * m + dx / len * g]);
    }
    p = q; amp *= 0.55;
  }
  return p;
}
function pathOf(pts) { C.beginPath(); C.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) C.lineTo(pts[i][0], pts[i][1]); C.closePath(); }
function hull(pts) {
  const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (const q of p.reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}
function clipRect(poly, x0, y0, x1, y1) {
  const clip = (pts, inside, inter) => {
    const out = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length], ia = inside(a), ib = inside(b);
      if (ia) out.push(a);
      if (ia !== ib) out.push(inter(a, b));
    }
    return out;
  };
  const ix = (a, b, x) => [x, a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0])];
  const iy = (a, b, y) => [a[0] + (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]), y];
  let p = poly;
  p = clip(p, q => q[0] >= x0, (a, b) => ix(a, b, x0)); if (!p.length) return p;
  p = clip(p, q => q[0] <= x1, (a, b) => ix(a, b, x1)); if (!p.length) return p;
  p = clip(p, q => q[1] >= y0, (a, b) => iy(a, b, y0)); if (!p.length) return p;
  p = clip(p, q => q[1] <= y1, (a, b) => iy(a, b, y1));
  return p;
}

// ---- paper (occlusion) -------------------------------------------------------
// Opaque objects first knock out whatever is behind them with paper colour, so
// ink and washes of hidden things never show through (painter's algorithm).
function paper(polys) {
  C.globalCompositeOperation = 'source-over';
  C.fillStyle = rgba(COL.paper, 1);
  for (const p of polys) { pathOf(p); C.fill(); C.lineWidth = 1; C.strokeStyle = rgba(COL.paper, 1); C.stroke(); }
}

// ---- watercolour wash ------------------------------------------------------
// Layered, recursively-deformed translucent polygons (glazing), multiplied onto
// the page, with a vertical pigment gradient, wet-in-wet blooms and a darker rim.
function wash(pts, col, o = {}) {
  if (!FLAGS.wash || !pts || pts.length < 3) return;
  STATS.wash++;
  const a = o.a ?? 0.5, amp = o.amp ?? 1.4, n = o.layers ?? 3;
  let base = deform(inset(pts, o.inset ?? RR.range(0.3, 2.2)), amp, 3);
  const off = o.off ?? 1.2;
  if (off) { const dx = RR.gauss() * off, dy = RR.gauss() * off; base = base.map(p => [p[0] + dx, p[1] + dy]); }
  const bb = bbox(base), cx = (bb[0] + bb[2]) / 2, cy = (bb[1] + bb[3]) / 2;
  const hw = (bb[2] - bb[0]) / 2 + 1, hh = (bb[3] - bb[1]) / 2 + 1;
  const la = 1 - Math.pow(1 - a, 1 / n);
  C.globalCompositeOperation = 'multiply';
  const g0 = o.g0 ?? RR.range(0.55, 0.85), g1 = o.g1 ?? 1.1;
  const ang = o.gang ?? (Math.PI / 2 + RR.gauss() * 0.35);
  const gx = Math.cos(ang), gy = Math.sin(ang), gr = Math.abs(gx) * hw + Math.abs(gy) * hh;
  for (let i = 0; i < n; i++) {
    const p = deform(base, amp * 0.8, 2);
    const g = C.createLinearGradient(cx - gx * gr, cy - gy * gr, cx + gx * gr, cy + gy * gr);
    const c = jit(col, 4);
    g.addColorStop(0, rgba(c, clamp(la * g0, 0, 1)));
    g.addColorStop(1, rgba(c, clamp(la * g1, 0, 1)));
    C.fillStyle = g; pathOf(p); C.fill();
  }
  const blot = o.blot ?? (hw * hh > 1500 ? 2 : 0);
  if (blot) {
    C.save(); pathOf(base); C.clip();
    for (let i = 0; i < blot; i++) {
      const x = RR.range(bb[0], bb[2]), y = RR.range(bb[1], bb[3]), r = Math.max(hw, hh) * RR.range(0.25, 0.7);
      const g = C.createRadialGradient(x, y, 0, x, y, r);
      const c = jit(o.blotCol || mix(col, RR.chance(0.5) ? [150, 120, 90] : [90, 110, 150], 0.35), 10);
      const ba = (o.blotA ?? 0.14) * RR.range(0.5, 1.2);
      g.addColorStop(0, rgba(c, ba)); g.addColorStop(1, rgba(c, 0));
      C.fillStyle = g; C.fillRect(x - r, y - r, r * 2, r * 2);
    }
    C.restore();
  }
    const lift = o.lift ?? 0;
  if (lift) { // lifted / skipped spots: bare paper sparkling through a wash
    C.save(); pathOf(base); C.clip(); C.globalCompositeOperation = 'source-over';
    for (let i = 0; i < lift; i++) {
      const e = RR.pick(base), x = lerp(e[0], cx, RR.range(0, 0.5)), y = lerp(e[1], cy, RR.range(0, 0.5)), r = Math.min(hw, hh) * RR.range(0.08, 0.3);
      const blob = []; for (let k = 0; k < 9; k++) { const a = k / 9 * TAU; blob.push([x + Math.cos(a) * r * RR.range(0.5, 1.3), y + Math.sin(a) * r * RR.range(0.4, 1)]); }
      C.fillStyle = rgba(COL.paper, RR.range(0.35, 0.7)); pathOf(deform(blob, r * 0.2, 2)); C.fill();
    }
    C.restore(); C.globalCompositeOperation = 'multiply';
  }
  const rim = o.rim ?? 0.3;
  if (rim > 0) { C.strokeStyle = rgba(darken(col, 0.45), rim); C.lineWidth = o.rimW ?? 1.0; pathOf(base); C.stroke(); }
}

// ---- ink line -----------------------------------------------------------------
// A pen line that wobbles, overshoots its corners, varies in pressure and
// occasionally breaks — the hand-drafted quality comes from here, never from
// the geometry, which stays exact.
function inkLine(pts, o = {}) {
  if (!FLAGS.ink || pts.length < 2) return;
  let total = 0; for (let i = 1; i < pts.length; i++) total += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  if (total < 0.5) return;
  const brk = o.brk ?? 0.22;
  if (pts.length === 2 && total > 70 && RR.chance(brk)) { // break a long line in two
    const t = RR.range(0.3, 0.75), gap = RR.range(2, 6) / total;
    const a = pts[0], b = pts[1], m1 = [lerp(a[0], b[0], t - gap), lerp(a[1], b[1], t - gap)], m2 = [lerp(a[0], b[0], t + gap), lerp(a[1], b[1], t + gap)];
    inkLine([a, m1], { ...o, brk: 0, os1: 0.3 }); inkLine([m2, b], { ...o, brk: 0, os0: 0.3 }); return;
  }
  const w = (o.w ?? 1.0) * clamp(VIEW.k / 1.5, 0.75, 1.3), col = o.col || COL.ink, al = Math.min(1, (o.a ?? 0.85) * 1.05);
  const osMax = o.os ?? Math.min(5, total * 0.08);
  // resample
  const step = 2.5, rs = [];
  const os0 = RR.range(-0.2, 1) * osMax * (o.os0 ?? 1), os1 = RR.range(-0.2, 1) * osMax * (o.os1 ?? 1);
  const d0 = [pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]], l0 = Math.hypot(...d0) || 1;
  const n = pts.length, d1 = [pts[n - 1][0] - pts[n - 2][0], pts[n - 1][1] - pts[n - 2][1]], l1 = Math.hypot(...d1) || 1;
  const P0 = [pts[0][0] - d0[0] / l0 * os0, pts[0][1] - d0[1] / l0 * os0];
  const P1 = [pts[n - 1][0] + d1[0] / l1 * os1, pts[n - 1][1] + d1[1] / l1 * os1];
  const src = [P0, ...pts.slice(1, -1), P1];
  for (let i = 0; i < src.length - 1; i++) {
    const a = src[i], b = src[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]), k = Math.max(1, Math.ceil(L / step));
    for (let j = 0; j < k; j++) rs.push([lerp(a[0], b[0], j / k), lerp(a[1], b[1], j / k)]);
  }
  rs.push(src[src.length - 1]);
  const seed = RR.f() * 1000, wob = o.wob ?? 0.9, N = rs.length;
  const left = [], right = [];
  let acc = 0;
  for (let i = 0; i < N; i++) {
    const p = rs[i], q = rs[Math.min(N - 1, i + 1)], r = rs[Math.max(0, i - 1)];
    let tx = q[0] - r[0], ty = q[1] - r[1]; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
    if (i) acc += Math.hypot(p[0] - rs[i - 1][0], p[1] - rs[i - 1][1]);
    const t = N > 1 ? i / (N - 1) : 0;
    const off = NZ.n2(acc * 0.018 + seed, seed) * wob + NZ.n2(acc * 0.11, seed + 7) * wob * 0.25;
    const pr = Math.pow(Math.sin(Math.PI * clamp(t * 0.96 + 0.02, 0, 1)), 0.35);
    const ww = w * (0.45 + 0.55 * pr) * (0.8 + 0.45 * NZ.f(acc * 0.04, seed + 3)) * 0.5;
    const cx = p[0] - ty * off, cy = p[1] + tx * off;
    left.push([cx - ty * ww, cy + tx * ww]); right.push([cx + ty * ww, cy - tx * ww]);
  }
  STATS.ink++;
  C.globalCompositeOperation = 'source-over';
  C.fillStyle = rgba(jit(col, 6), al);
  C.beginPath(); C.moveTo(left[0][0], left[0][1]);
  for (let i = 1; i < N; i++) C.lineTo(left[i][0], left[i][1]);
  for (let i = N - 1; i >= 0; i--) C.lineTo(right[i][0], right[i][1]);
  C.closePath(); C.fill();
  if (o.dbl ?? RR.chance(0.1)) { // a faint re-traced stroke
    const d = RR.gauss() * 0.9;
    inkLine(pts.map(p => [p[0] + d, p[1] - d]), { ...o, a: al * 0.3, dbl: false, brk: 0.5, w: w * 0.7 });
  }
}
function inkPoly(pts, o = {}) { for (let i = 0; i < pts.length; i++) inkLine([pts[i], pts[(i + 1) % pts.length]], o); }
const L3 = (a, b, o) => inkLine([P(a), P(b)], o);

// brush stroke: heavier, strongly tapered, used for calligraphy and dark accents
function brush(pts, o = {}) { inkLine(pts, { w: o.w ?? 3, a: o.a ?? 0.9, col: o.col, wob: 0.5, os: 0, brk: 0, dbl: false }); }

// ---- pseudo-calligraphy -----------------------------------------------------
// Readable-looking but meaningless CJK-like glyphs built from a stroke vocabulary
// and radical-style splits (left/right, top/bottom).
function glyph(R) {
  const S = [];
  const part = (x0, y0, x1, y1, n) => {
    const w = x1 - x0, h = y1 - y0;
    for (let i = 0; i < n; i++) {
      const k = R.wpick([['h', 3], ['v', 2.5], ['pie', 1], ['na', 0.8], ['dot', 1], ['box', 0.6], ['hook', 0.6]]);
      const X = f => x0 + w * f, Y = f => y0 + h * f;
      const a = R.range(0.1, 0.9), b = R.range(0.1, 0.9);
      if (k === 'h') { const l = R.range(0.1, 0.4), r = R.range(0.6, 0.95), y = R.range(0.1, 0.9); S.push([[X(l), Y(y)], [X(r), Y(y - 0.04)]]); }
      else if (k === 'v') { const x = R.range(0.2, 0.8), t = R.range(0.05, 0.4), bo = R.range(0.6, 0.98); S.push([[X(x), Y(t)], [X(x), Y(bo)]]); }
      else if (k === 'pie') S.push([[X(a), Y(0.15)], [X(a - 0.05), Y(0.55)], [X(a - 0.3), Y(0.9)]]);
      else if (k === 'na') S.push([[X(a - 0.1), Y(0.3)], [X(a + 0.1), Y(0.65)], [X(a + 0.35), Y(0.9)]]);
      else if (k === 'dot') S.push([[X(a), Y(b)], [X(a + 0.08), Y(b + 0.1)]]);
      else if (k === 'hook') S.push([[X(0.2), Y(b)], [X(0.8), Y(b)], [X(0.75), Y(Math.min(0.95, b + 0.45))], [X(0.62), Y(Math.min(0.9, b + 0.38))]]);
      else if (k === 'box') { const bx0 = X(R.range(0.15, 0.35)), bx1 = X(R.range(0.65, 0.85)), by0 = Y(R.range(0.1, 0.45)), by1 = Math.min(Y(0.95), by0 + h * 0.4); S.push([[bx0, by0], [bx0, by1]]); S.push([[bx0, by0], [bx1, by0], [bx1, by1]]); S.push([[bx0, by1], [bx1, by1]]); }
    }
  };
  const lay = R.wpick([['single', 1], ['lr', 1.4], ['tb', 0.8]]);
  if (lay === 'single') part(0, 0, 1, 1, R.int(3, 6));
  else if (lay === 'lr') { const s = R.range(0.3, 0.42); part(0, 0, s, 1, R.int(2, 3)); part(s + 0.04, 0, 1, 1, R.int(3, 5)); }
  else { const s = R.range(0.35, 0.5); part(0, 0, 1, s, R.int(2, 3)); part(0, s + 0.05, 1, 1, R.int(2, 4)); }
  return S;
}
// draw a glyph into a screen-space box via a mapping fn (u,v in 0..1 -> screen)
function drawGlyph(g, map, size, col, weight = 1) {
  for (const s of g) brush(s.map(q => map(q[0], q[1])), { w: clamp(size * 0.09, 1, 5) * weight, col, a: 0.88 });
}
// lay out a row/column of glyphs on a face rectangle
function signText(face, s0, t0, s1, t1, n, R, col, vertical = false, weight = 1) {
  const gs = [...Array(n)].map(() => glyph(R));
  for (let i = 0; i < n; i++) {
    let a, b, c, d;
    if (!vertical) { const cw = (s1 - s0) / n, pad = cw * 0.16, ph = (t1 - t0) * 0.16; a = s0 + i * cw + pad; c = s0 + (i + 1) * cw - pad; b = t1 - ph; d = t0 + ph; }
    else { const ch = (t1 - t0) / n, pad = ch * 0.14, pw = (s1 - s0) * 0.14; a = s0 + pw; c = s1 - pw; b = t1 - i * ch - pad; d = t1 - (i + 1) * ch + pad; }
    const map = (u, v) => face.sp(lerp(a, c, u), lerp(b, d, v));
    const size = Math.hypot(...[0, 1].map(k => face.sp(c, d)[k] - face.sp(a, b)[k])) * 0.7;
    drawGlyph(gs[i], map, size, col, weight);
  }
}

// ---- foliage -------------------------------------------------------------------
// Clusters of leaf dabs over a soft dark under-wash; value follows the sun
// direction plus noise so masses read as volumes (dark core, lit crown).
// Leaf shapes: 'leaf' (broadleaf), 'round' (florets, clipped box), 'needle'
// (pine), 'lance' (bamboo, grasses), 'heart' (ivy).
function drawLeaf(x, y, s, a, c, al, shape = 'leaf') {
  STATS.leaf++;
  C.fillStyle = rgba(c, al);
  if (shape === 'round') { C.beginPath(); C.ellipse(x, y, s * 0.5, s * 0.42, a, 0, TAU); C.fill(); return; }
  if (shape === 'needle') {
    C.strokeStyle = rgba(c, al); C.lineWidth = Math.max(0.7, s * 0.14); C.beginPath();
    for (let k = -1; k <= 1; k++) { const b = a + k * 0.35; C.moveTo(x, y); C.lineTo(x + Math.cos(b) * s, y + Math.sin(b) * s); }
    C.stroke(); return;
  }
  const L = shape === 'lance' ? 1.9 : 1, w = s * (shape === 'lance' ? 0.16 : shape === 'heart' ? 0.62 : 0.42);
  const ca = Math.cos(a), sa = Math.sin(a);
  const tx = x + ca * s * L, ty = y + sa * s * L, bx = x - ca * s * 0.45, by = y - sa * s * 0.45;
  C.beginPath(); C.moveTo(bx, by);
  C.quadraticCurveTo(x - sa * w, y + ca * w, tx, ty);
  C.quadraticCurveTo(x + sa * w, y - ca * w, bx, by);
  C.fill();
}
function foliage(cx, cy, rx, ry, o = {}) {
  if (!FLAGS.plants) return;
  const leaf = (o.leaf ?? 7) * Math.sqrt(VIEW.k / 1.6), dens = o.dens ?? 1, seedN = RR.f() * 100;
  const shape = o.shape || 'leaf';
  const lx = SUN.left ? -0.65 : 0.65, ly = -0.75;
  const pal = o.pal || [COL.fDark, COL.fMid, COL.fLight, COL.fHi];
  if (o.under !== 0) {
    const blob = [];
    for (let i = 0; i < 28; i++) {
      const a = i / 28 * TAU, r = 0.85 + 0.25 * NZ.n2(Math.cos(a) * 1.3 + seedN, Math.sin(a) * 1.3);
      blob.push([cx + Math.cos(a) * rx * r * 0.8, cy + Math.sin(a) * ry * r * 0.8]);
    }
    const wasOn = FLAGS.wash; FLAGS.wash = true;
    wash(blob, mix(pal[0], pal[1], 0.2), { a: o.under ?? 0.55, amp: 5, blot: 2, rim: 0.1 });
    FLAGS.wash = wasOn;
  }
  const N = Math.floor(Math.PI * rx * ry / (leaf * leaf) * 1.25 * dens), L = [];
  for (let i = 0; i < N; i++) {
    const a = RR.f() * TAU, rr = Math.sqrt(RR.f());
    const e = 1 + 0.32 * NZ.n2(Math.cos(a) * 1.5 + seedN, Math.sin(a) * 1.5 + seedN) * (o.ragged ?? 1);
    const x = cx + Math.cos(a) * rx * rr * e, y = cy + Math.sin(a) * ry * rr * e;
    const nx = (x - cx) / rx, ny = (y - cy) / ry;
    let v = (nx * lx + ny * ly) * 0.42 + 0.46 + 0.42 * NZ.n2(x * 0.035 + seedN, y * 0.035) + RR.gauss() * 0.1 + (o.bright ?? 0);
    if (rr < 0.45) v -= 0.12;
    L.push({ x, y, v, rr });
  }
  L.sort((p, q) => p.v - q.v);
  C.globalCompositeOperation = 'source-over';
  for (const l of L) {
    const v = l.v;
    const c = v < 0.3 ? pal[0] : v < 0.55 ? mix(pal[0], pal[1], 0.6) : v < 0.78 ? pal[2] : pal[3];
    const s = leaf * (v < 0.3 ? 1.15 : 0.9) * RR.range(0.7, 1.3);
    const ang = o.angle != null ? o.angle + RR.gauss() * (o.angleJit ?? 0.5) : o.droop ? Math.PI / 2 + RR.gauss() * 0.9 : RR.f() * TAU;
    drawLeaf(l.x, l.y, s, ang, jit(c, 9), v < 0.3 ? 0.82 : 0.9, shape);
  }
  // blossoms / berries sit on the lit side of the mass
  const fl = o.flowers;
  if (fl) {
    const lit = L.filter(l => l.v > 0.4);
    const nf = Math.floor(N * (fl.dens ?? 0.15));
    for (let i = 0; i < nf && lit.length; i++) {
      const l = RR.pick(lit), c = jit(RR.pick(fl.cols), 12);
      drawLeaf(l.x + RR.gauss() * 2, l.y + RR.gauss() * 2, leaf * (fl.size ?? 0.8) * RR.range(0.7, 1.2), RR.f() * TAU, l.v > 0.75 ? mix(c, [255, 255, 255], 0.25) : c, 0.92, 'round');
    }
  }
  const nb = Math.floor(N * (o.berries ?? 0.012));
  for (let i = 0; i < nb; i++) { const l = RR.pick(L); C.fillStyle = rgba(jit(COL.berry, 12), 0.85); C.beginPath(); C.arc(l.x, l.y, leaf * 0.28, 0, TAU); C.fill(); }
}
function fleck(x, y, s) { // a single wind-blown leaf
  const c = RR.wpick([[COL.fLight, 3], [COL.fMid, 2], [COL.fHi, 1], [COL.berry, 0.5], [COL.fDark, 1]]);
  drawLeaf(x, y, s * RR.range(0.6, 1.3), RR.f() * TAU, jit(c, 10), 0.85);
}

// ---- Latin lettering ---------------------------------------------------------------
// Real shop words for European styles, laid onto a face through an affine map so
// the letters sit in the same perspective as the board. Drawn twice, slightly
// misregistered, like sign-painter's enamel over a pencil guide.
const FONTS = { serif: '"Playfair Display SC", "Playfair Display", Georgia, serif', fraktur: '"UnifrakturMaguntia", "Old English Text MT", Georgia, serif', roman: '"Cinzel", "Trajan Pro", Georgia, serif', fat: '"Abril Fatface", "Bodoni 72", Georgia, serif', script: '"Kaushan Script", "Brush Script MT", cursive', condensed: '"Anton", Impact, "Arial Narrow", sans-serif' };
