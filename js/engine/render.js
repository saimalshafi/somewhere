// ============================================================================
//  BASTI — renderer: fit, painter's order, paper + granulation pass
// ============================================================================
// A paint job owns one scene and one canvas and can be run in slices: the same
// items, in the same order, with the same per-item dice, so a page painted in
// fifty slices is pixel-identical to one painted in a single call. Several
// jobs can interleave because each one re-installs its globals before a slice.
function sceneSetup(seed, opts, W, H) {
  const S = generate(seed, opts.lock || {});
  S.seed = seed;
  S.flags = Object.assign({ wash: true, ink: true, plants: true }, opts.flags || {});
  S.nz = new Noise(hash('nz', seed));
  VIEW.cx = S.view.cx; VIEW.eye = S.view.eye; VIEW.D = S.view.D; VIEW.k = 1; VIEW.ox = 0; VIEW.oy = 0;
  const bb = bbox(S.bounds.map(P));
  const k = Math.min(W * 0.64 / (bb[2] - bb[0]), H * 0.64 / (bb[3] - bb[1]));
  S.fit = { k, ox: W / 2 - k * (bb[0] + bb[2]) / 2, oy: H / 2 - k * (bb[1] + bb[3]) / 2 }; // the drawing's extent sits dead centre on the page
  S.order = S.items.slice().sort((a, b) => a.order - b.order || a.id - b.id);
  return S;
}
function useScene(S, ctx) {
  C = ctx; SC = S; S_CUR = S; NZ = S.nz;
  Object.assign(FLAGS, S.flags);
  VIEW.cx = S.view.cx; VIEW.eye = S.view.eye; VIEW.D = S.view.D;
  VIEW.k = S.fit.k; VIEW.ox = S.fit.ox; VIEW.oy = S.fit.oy;
  SUN.left = S.view.sun.left; SUN.L = S.view.sun.L.slice();
  PXS = S.scale || 1; C.setTransform(PXS, 0, 0, PXS, 0, 0); // everything is drawn in page units; a print export just scales the canvas
}
class PaintJob {
  constructor(canvas, seed, opts = {}) {
    this.canvas = canvas; this.ctx = canvas.getContext('2d');
    this.scale = opts.scale || 1;
    this.S = sceneSetup(seed, opts, canvas.width / this.scale, canvas.height / this.scale); this.S.scale = this.scale;
    this.post = opts.post !== false;
    this.i = 0; this.row = 0; this.img = null; this.ms = 0;
    this.stats = { wash: 0, ink: 0, leaf: 0, shadow: 0 };
    useScene(this.S, this.ctx);
    C.setTransform(1, 0, 0, 1, 0, 0); C.globalCompositeOperation = 'source-over';
    C.fillStyle = rgba(COL.paper, 1); C.fillRect(0, 0, canvas.width, canvas.height);
    C.setTransform(this.scale, 0, 0, this.scale, 0, 0);
  }
  get n() { return this.S.order.length; }
  get itemsDone() { return this.i >= this.n; }
  get done() { return this.itemsDone && (!this.post || this.row >= this.canvas.height); }
  // run items (up to `until`, or all) and then the paper pass, within `budget` ms
  step(budget = Infinity, until = Infinity) {
    if (this.done) return true;
    const t0 = performance.now(), S = this.S;
    useScene(S, this.ctx);
    Object.assign(STATS, this.stats);
    const lim = Math.min(until, this.n);
    while (this.i < lim) {
      const it = S.order[this.i++];
      const i0 = STATS.ink;
      RR = new Rand(hash(S.seed, 'item', it.id)); it.fn();
      if (this.track) this.track.push(STATS.ink - i0);
      if (performance.now() - t0 > budget) break;
    }
    C.globalCompositeOperation = 'source-over';
    Object.assign(this.stats, STATS);
    if (this.itemsDone) {
      S.stats = { ...this.stats };
      if (this.post) { // the paper texture, multiplied over the finished page
        const W = this.canvas.width, H = this.canvas.height;
        const ready = budget === Infinity || paperWarm(W, H, Math.max(1, budget - (performance.now() - t0)), this.scale);
        if (ready) { paperApply(C, W, H, this.scale); this.row = H; }
      }
    }
    this.ms += performance.now() - t0;
    return this.done;
  }
  run() { while (!this.done) this.step(Infinity); return this.S; }
}
function renderScene(canvas, seed, opts = {}) {
  const t0 = performance.now();
  const job = new PaintJob(canvas, seed, opts);
  const S = job.run();
  useScene(S, job.ctx);
  S.ms = Math.round(performance.now() - t0);
  return S;
}

// watercolour paper texture. The same texture is drawn on screen, in the PNG and
// in the SVG: in the SVG it is an feTurbulence filter, and on canvas it is a
// port of the reference feTurbulence algorithm from the Filter Effects spec, so
// both are the same function of page position. It only darkens, and only by a
// few percent, warm-toned: the tooth of cold-pressed paper, never a grey veil.
const PAPER = {
  fine: { f: 0.26, oct: 3, seed: 7 }, coarse: { f: 0.014, oct: 2, seed: 23 }, mix: [0.75, 0.25],
  // transfer tables, applied to the mixed noise (0..1): flat paper in the hollows, a few percent of warm tooth on the peaks
  R: [1, 0.998, 0.988, 0.958, 0.9], G: [1, 0.996, 0.983, 0.95, 0.885], B: [1, 0.993, 0.975, 0.935, 0.86],
};
const Turb = (() => { // feTurbulence (type fractalNoise), after the reference code in the spec
  const BS = 256, BM = 255, PN = 4096, cache = {};
  const rnd = s => { let r = 16807 * (s % 127773) - 2836 * Math.floor(s / 127773); if (r <= 0) r += 2147483647; return r; };
  function init(seed) {
    if (cache[seed]) return cache[seed];
    let s = seed <= 0 ? -(seed % 2147483646) + 1 : seed; if (s > 2147483646) s = 2147483646;
    const lat = new Int32Array(BS + BS + 2), gx = new Float64Array(BS + BS + 2), gy = new Float64Array(BS + BS + 2);
    // the spec fills four gradient sets (one per channel) in order; channel 0 is the first, the rest still consume the generator
    const G = [];
    for (let k = 0; k < 4; k++) {
      const ax = new Float64Array(BS + BS + 2), ay = new Float64Array(BS + BS + 2);
      for (let i = 0; i < BS; i++) {
        if (k === 0) lat[i] = i;
        s = rnd(s); ax[i] = ((s % (BS + BS)) - BS) / BS; s = rnd(s); ay[i] = ((s % (BS + BS)) - BS) / BS;
        const l = Math.sqrt(ax[i] * ax[i] + ay[i] * ay[i]) || 1; ax[i] /= l; ay[i] /= l;
      }
      G.push([ax, ay]);
    }
    for (let i = BS - 1; i > 0; i--) { const k = lat[i]; s = rnd(s); const j = s % BS; lat[i] = lat[j]; lat[j] = k; }
    for (let i = 0; i < BS + 2; i++) { lat[BS + i] = lat[i]; gx[i] = G[0][0][i]; gy[i] = G[0][1][i]; gx[BS + i] = G[0][0][i]; gy[BS + i] = G[0][1][i]; }
    return (cache[seed] = { lat, gx, gy });
  }
  function noise2(T, x, y) {
    let t = x + PN; const bx0 = (t | 0) & BM, bx1 = (bx0 + 1) & BM, rx0 = t - (t | 0), rx1 = rx0 - 1;
    t = y + PN; const by0 = (t | 0) & BM, by1 = (by0 + 1) & BM, ry0 = t - (t | 0), ry1 = ry0 - 1;
    const L = T.lat, i = L[bx0], j = L[bx1], b00 = L[i + by0], b10 = L[j + by0], b01 = L[i + by1], b11 = L[j + by1];
    const sx = rx0 * rx0 * (3 - 2 * rx0), sy = ry0 * ry0 * (3 - 2 * ry0), gx = T.gx, gy = T.gy;
    let u = rx0 * gx[b00] + ry0 * gy[b00], v = rx1 * gx[b10] + ry0 * gy[b10]; const a = u + sx * (v - u);
    u = rx0 * gx[b01] + ry1 * gy[b01]; v = rx1 * gx[b11] + ry1 * gy[b11]; const b = u + sx * (v - u);
    return a + sy * (b - a);
  }
  return (o, x, y) => { // fractalNoise, colour channel R, as a 0..1 value
    const T = init(o.seed); let sum = 0, r = 1, vx = x * o.f, vy = y * o.f;
    for (let k = 0; k < o.oct; k++) { sum += noise2(T, vx, vy) / r; vx *= 2; vy *= 2; r *= 2; }
    return clamp((sum * 255 + 255) / 2, 0, 255) / 255;
  };
})();
const tableOf = (tv, n) => { const k = clamp(n, 0, 1) * (tv.length - 1), i = Math.min(tv.length - 2, Math.floor(k)); return tv[i] + (tv[i + 1] - tv[i]) * (k - i); };
// the texture as a canvas the size of the page in pixels, filled a band at a time
const PAPER_CACHE = {};
function paperTex(Wp, Hp, scale = 1) {
  const key = Wp + 'x' + Hp + '@' + scale;
  if (!PAPER_CACHE[key]) { const cv = document.createElement('canvas'); cv.width = Wp; cv.height = Hp; PAPER_CACHE[key] = { cv, Wp, Hp, scale, img: new ImageData(Wp, Hp), row: 0, ready: false }; }
  return PAPER_CACHE[key];
}
function paperWarm(Wp, Hp, budget = 8, scale = 1) {
  const T = paperTex(Wp, Hp, scale); if (T.ready) return true;
  const t0 = performance.now(), d = T.img.data, s = T.scale, m0 = PAPER.mix[0], m1 = PAPER.mix[1];
  while (T.row < Hp) {
    const y = T.row, py = (y + 0.5) / s;
    for (let x = 0; x < Wp; x++) {
      const px = (x + 0.5) / s, n = clamp(m0 * Turb(PAPER.fine, px, py) + m1 * Turb(PAPER.coarse, px, py), 0, 1), i = (y * Wp + x) * 4;
      d[i] = 255 * tableOf(PAPER.R, n); d[i + 1] = 255 * tableOf(PAPER.G, n); d[i + 2] = 255 * tableOf(PAPER.B, n); d[i + 3] = 255;
    }
    T.row++;
    if (performance.now() - t0 > budget) break;
  }
  if (T.row >= Hp) { T.cv.getContext('2d').putImageData(T.img, 0, 0); T.img = null; T.ready = true; }
  return T.ready;
}
// a print-size texture is large: forget it once the export is done
function paperForget(scale) { for (const k in PAPER_CACHE) if (PAPER_CACHE[k].scale === scale) delete PAPER_CACHE[k]; }
// multiply the paper over a finished page (finishing the texture first if it is not ready)
function paperApply(ctx, Wp, Hp, scale = 1) {
  while (!paperWarm(Wp, Hp, Infinity, scale));
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(paperTex(Wp, Hp, scale).cv, 0, 0); ctx.restore();
}
// the same texture as an SVG filter, for the vector export
function paperFilterSVG(W, H) {
  const tf = a => a.join(' '), P2 = PAPER;
  return `<filter id="paper" filterUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}" color-interpolation-filters="sRGB">` +
    `<feTurbulence type="fractalNoise" baseFrequency="${P2.fine.f}" numOctaves="${P2.fine.oct}" seed="${P2.fine.seed}" result="t1"/>` +
    `<feColorMatrix in="t1" type="matrix" values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1" result="f"/>` +
    `<feTurbulence type="fractalNoise" baseFrequency="${P2.coarse.f}" numOctaves="${P2.coarse.oct}" seed="${P2.coarse.seed}" result="t2"/>` +
    `<feColorMatrix in="t2" type="matrix" values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1" result="c"/>` +
    `<feComposite in="f" in2="c" operator="arithmetic" k1="0" k2="${P2.mix[0]}" k3="${P2.mix[1]}" k4="0" result="m"/>` +
    `<feComponentTransfer in="m"><feFuncR type="table" tableValues="${tf(P2.R)}"/><feFuncG type="table" tableValues="${tf(P2.G)}"/><feFuncB type="table" tableValues="${tf(P2.B)}"/><feFuncA type="discrete" tableValues="1"/></feComponentTransfer></filter>`;
}

// ============================================================================
//  PROCESS ANIMATION — the page is painted the way a watercolourist works:
//  pencil set-out, pen line in painter's order, colour washed down the sheet,
//  then planting and paper grain. Every layer is the real renderer, run in
//  time slices; the last frame is the finished page, pixel for pixel.
// ============================================================================
const ANIM_PHASES = [['pencil', 0.15], ['ink', 0.3], ['wash', 0.75]]; // planting and grain run alongside the wash
const ANIM_FINISH_AT = 0, POP_FROM = 0.04, POP_TO = 0.8, POP_DUR = 0.2; // fractions of the wash step: planting starts with it
const ANIM_LABEL = { pencil: 'setting out in pencil', ink: 'inking, back to front', wash: 'laying in washes', finish: 'planting and paper grain' };
function animatePaint(canvas, seed, opts = {}) {
  const W = canvas.width, H = canvas.height, out = canvas.getContext('2d');
  const F = Object.assign({ wash: true, ink: true, plants: true }, opts.flags || {});
  const off = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
  const base = { ...F };
  const inkFlags = { ...base, wash: false, plants: false };
  const ink = new PaintJob(off(), seed, { lock: opts.lock, flags: inkFlags, post: false });
  // the wash layer, painted ahead in the background, counts the pen strokes in
  // each item, so the ink is paced by how much there is to draw
  const inkTarget = k => {
    if (k >= 1) return ink.n;
    const tr = wet.track, w = []; let tot = 0;
    for (let i = 0; i < ink.n; i++) { const n = i < tr.length ? tr[i] : 12; w.push(tot += n ? Math.sqrt(n) + 2 : 0); }
    const t = k * (tot || 1); let c = 0; while (c < ink.n && (c ? w[c - 1] : 0) < t) c++; return c;
  };
  const wet = new PaintJob(off(), seed, { lock: opts.lock, flags: { ...base, plants: false }, post: false });
  wet.track = [];
  const fin = new PaintJob(off(), seed, { lock: opts.lock, flags: base });
  const S = fin.S, t0 = performance.now();
  const onPhase = opts.onPhase || (() => {});

  // pencil set-out, read from the scene: horizon, ground, volumes, bays, orthogonals
  useScene(ink.S, ink.ctx);
  const lw = Math.max(0.9, W / 760), vp = [VIEW.ox + VIEW.cx * VIEW.k, VIEW.oy - VIEW.eye * VIEW.k];
  const segs = [], pr = new Rand(hash(seed, 'pencil'));
  const add = (a, b, w = 1, al = 0.55) => { if (!a || !b || !isFinite(a[0] + a[1] + b[0] + b[1])) return; segs.push({ a, b, w, al, o0: pr.range(3, 9) * lw, o1: pr.range(3, 12) * lw, j: [pr.gauss() * 0.6, pr.gauss() * 0.6] }); };
  const vols = ink.S.debug.vols || [], g = vols[0];
  add([W * 0.04, vp[1]], [W * 0.96, vp[1]], 0.8, 0.4);
  if (g) add(P([g.x0 - 400, 0, 0]), P([g.x1 + 400, 0, 0]), 1, 0.5);
  for (const v of vols) {
    const a = P([v.x0, v.y0, v.z]), b = P([v.x1, v.y0, v.z]), c = P([v.x1, v.y1, v.z]), d = P([v.x0, v.y1, v.z]);
    add(a, d); add(b, c); add(d, c); add(a, b, 0.8);
    for (const p of [d, c]) add(p, [p[0] + (vp[0] - p[0]) * 0.22, p[1] + (vp[1] - p[1]) * 0.22], 0.6, 0.35);
  }
  for (const b of (ink.S.debug.bays || []).slice(0, 40)) {
    const q = quad(b.x0, b.y0 || 0, b.x1, b.y1 || 100, b.z);
    add(q[0], q[3], 0.7, 0.4); add(q[1], q[2], 0.7, 0.4); add(q[3], q[2], 0.7, 0.4);
  }
  const pencil = (k, fade) => {
    if (fade <= 0) return;
    out.save(); out.lineCap = 'round';
    const n = segs.length;
    segs.forEach((s, i) => {
      const st = (i / Math.max(1, n)) * 0.65, u = clamp((k - st) / 0.35, 0, 1);
      if (u <= 0) return;
      const dx = s.b[0] - s.a[0], dy = s.b[1] - s.a[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
      const a = [s.a[0] - ux * s.o0 + s.j[0], s.a[1] - uy * s.o0 + s.j[1]], e = 1 - Math.pow(1 - u, 2);
      const tot = L + s.o0 + s.o1;
      out.strokeStyle = `rgba(78,80,92,${s.al * fade})`; out.lineWidth = s.w * lw;
      out.beginPath(); out.moveTo(a[0], a[1]); out.lineTo(a[0] + ux * tot * e - s.j[0] * 0.5, a[1] + uy * tot * e + s.j[1] * 0.5); out.stroke();
    });
    out.restore();
  };

  // ragged wet front: a low-res threshold field, scaled up so the edge stays soft
  const mw = 110, mh = Math.round(110 * H / W), mask = document.createElement('canvas'); mask.width = mw; mask.height = mh;
  const mctx = mask.getContext('2d'), mimg = mctx.createImageData(mw, mh), tmp = off(), tctx = tmp.getContext('2d');
  const nz = new Noise(hash(seed, 'front')), TD = new Float32Array(mw * mh), TU = new Float32Array(mw * mh);
  useScene(ink.S, ink.ctx);
  const bb = bbox(ink.S.bounds.map(P)), yTop = Math.max(0, bb[1]), yBot = Math.min(H, bb[3]);
  let tmin = Infinity, tmax = -Infinity;
  for (let y = 0; y < mh; y++) for (let x = 0; x < mw; x++) {
    const yy = clamp(((y + 0.5) * H / mh - yTop) / Math.max(1, yBot - yTop), -0.25, 1.25);
    const n = nz.n2(x * 0.09, y * 0.09) + 0.5 * nz.n2(x * 0.27 + 17, y * 0.27), m = nz.n2(x * 0.11 + 50, y * 0.11);
    const i = y * mw + x;
    TD[i] = 0.62 * yy + 0.38 * clamp(0.5 + n * 0.7, 0, 1);
    TU[i] = 0.62 * yy + 0.38 * clamp(0.5 + m * 0.8, 0, 1);
    const px = (x + 0.5) * W / mw;
    if (yy >= 0 && yy <= 1 && px >= bb[0] && px <= bb[2]) { tmin = Math.min(tmin, TD[i]); tmax = Math.max(tmax, TD[i], TU[i]); }
  }
  const AW = new Float32Array(mw * mh), AF = new Float32Array(mw * mh), sm = a => { a = clamp(a, 0, 1); return a * a * (3 - 2 * a); };
  const reveal = (layer, A) => {
    const d = mimg.data;
    for (let i = 0; i < A.length; i++) d[i * 4 + 3] = A[i] * 255;
    mctx.putImageData(mimg, 0, 0);
    tctx.globalCompositeOperation = 'copy'; tctx.imageSmoothingEnabled = true; tctx.drawImage(mask, 0, 0, W, H);
    tctx.globalCompositeOperation = 'source-in'; tctx.drawImage(layer, 0, 0);
    out.drawImage(tmp, 0, 0);
  };
  // brush strokes: the colour goes on as loaded-brush passes, row by row down the
  // building, each pass drawn into a mask as the brush travels. A pass is a bundle
  // of bristles: some start late or lift early, which leaves dry-brush streaks.
  const pmS = 2, pm = document.createElement('canvas'); pm.width = Math.ceil(W / pmS); pm.height = Math.ceil(H / pmS);
  const pctx = pm.getContext('2d'), pms = document.createElement('canvas'); pms.width = mw; pms.height = mh; const pmsCtx = pms.getContext('2d', { willReadFrequently: true });
  const br = new Rand(hash(seed, 'brush')), strokes = [], STROKE_END = 0.72;
  const rx0 = Math.max(0, bb[0] - W * 0.06), rx1 = Math.min(W, bb[2] + W * 0.06), ry0 = Math.max(0, bb[1] - H * 0.03), ry1 = Math.min(H, bb[3] + H * 0.05);
  const rows = clamp(Math.round((ry1 - ry0) / (H * 0.08)), 5, 11), rh = (ry1 - ry0) / rows;
  for (let r = 0; r < rows; r++) {
    const n = rx1 - rx0 > W * 0.45 && br.chance(0.5) ? 2 : 1;
    for (let k = 0; k < n; k++) {
      const dir = (r + k) % 2 ? -1 : 1, cy = ry0 + rh * (r + 0.5) + br.gauss() * rh * 0.12;
      const xs = n === 2 ? (k ? [lerp(rx0, rx1, 0.4), rx1] : [rx0, lerp(rx0, rx1, 0.62)]) : [rx0, rx1];
      const a = dir > 0 ? xs[0] - rh * 0.3 : xs[1] + rh * 0.3, b = dir > 0 ? xs[1] + rh * 0.3 : xs[0] - rh * 0.3;
      const bristles = []; for (let j = 0; j < 18; j++) bristles.push({ o: j / 17 * 2 - 1 + br.gauss() * 0.03, a: br.range(0.3, 0.85), s: br.chance(0.3) ? br.range(0, 0.15) : 0, e: br.chance(0.35) ? br.range(0.75, 0.97) : 1, w: br.range(0.7, 1.5) });
      strokes.push({ a, b, cy, row: r, tilt: br.gauss() * rh * 0.3, bend: br.gauss() * rh * 0.25, hw: rh * br.range(0.8, 1.0), bristles, done: 0 });
    }
  }
  const NS = strokes.length; strokes.forEach((st, i) => { st.t0 = STROKE_END * i / (NS + 1.4); st.t1 = Math.min(STROKE_END, st.t0 + STROKE_END * 2.4 / (NS + 1.4)); });
  const rowT = r => { const f = strokes.find(st => st.row === r); return f ? f.t0 + (f.t1 - f.t0) * 0.6 : STROKE_END; };
  const strokePt = (st, t) => [lerp(st.a, st.b, t), st.cy + st.tilt * (t - 0.5) + Math.sin(t * Math.PI) * st.bend];
  const paintTo = k => {
    pctx.save(); pctx.scale(1 / pmS, 1 / pmS); pctx.lineCap = 'round'; pctx.lineJoin = 'round';
    for (const st of strokes) {
      const p = clamp((k - st.t0) / (st.t1 - st.t0), 0, 1), e = 1 - Math.pow(1 - p, 2); // the brush slows as it runs out
      if (e <= st.done) continue;
      const t0 = st.done, t1 = e; st.done = e;
      for (const bz of st.bristles) {
        const u0 = Math.max(t0, bz.s), u1 = Math.min(t1, bz.e); if (u1 <= u0) continue;
        const steps = Math.max(2, Math.ceil((u1 - u0) / 0.012));
        pctx.strokeStyle = 'rgba(255,255,255,' + bz.a + ')'; pctx.lineWidth = st.hw * 2 / 18 * 1.9 * bz.w; pctx.beginPath();
        for (let i = 0; i <= steps; i++) {
          const u = lerp(u0, u1, i / steps), press = Math.sin(Math.min(1, u * 5) * Math.PI / 2) * (u > 0.8 ? 1 - (u - 0.8) * 2.5 : 1), q = strokePt(st, u);
          (i ? pctx.lineTo : pctx.moveTo).call(pctx, q[0], q[1] + bz.o * st.hw * press);
        }
        pctx.stroke();
      }
    }
    pctx.restore();
  };
  const revealWet = flood => {
    tctx.globalCompositeOperation = 'copy'; tctx.imageSmoothingEnabled = true; tctx.drawImage(pm, 0, 0, W, H);
    if (flood > 0) { tctx.globalCompositeOperation = 'source-over'; tctx.fillStyle = 'rgba(255,255,255,' + flood + ')'; tctx.fillRect(0, 0, W, H); }
    tctx.globalCompositeOperation = 'source-in'; tctx.drawImage(wet.canvas, 0, 0);
    out.drawImage(tmp, 0, 0);
  };
  // paper grain as its own layer: the wash layer through the same paper pass
  const grain = off(), gctx = grain.getContext('2d');
  let gDone = false;
  const grainStep = budget => {
    if (!paperWarm(W, H, budget)) return;
    gctx.drawImage(wet.canvas, 0, 0); paperApply(gctx, W, H); gDone = true;
  };
  // planting as separate pieces: whatever the finished page has that the
  // grained wash layer lacks, split into connected clumps, each on its own
  // little canvas so it can pop in on its own beat
  let pops = null;
  let kG0 = 0;
  const bare = new Uint8Array(mw * mh); // cells where the colour layer adds nothing to the pen layer
  const prepPops = kNow => {
    { const g = (src) => { const c = document.createElement('canvas'); c.width = mw; c.height = mh; const x = c.getContext('2d'); x.drawImage(src, 0, 0, mw, mh); return x.getImageData(0, 0, mw, mh).data; };
      const a = g(fullInk ? fullInk.canvas : ink.canvas), b = g(wet.canvas); for (let i = 0; i < mw * mh; i++) { const j = i * 4; bare[i] = Math.abs(a[j] - b[j]) + Math.abs(a[j + 1] - b[j + 1]) + Math.abs(a[j + 2] - b[j + 2]) < 4 ? 1 : 0; } }
    const FROM = Math.max(POP_FROM, kNow + 0.1); // after the grain has settled on the bare paper around them kG0 = Math.max(0, kNow); // a heavy page may finish its layers after the wash has begun: planting then starts from here
    const q = 4, sw = Math.ceil(W / q), sh = Math.ceil(H / q);
    const grab = src => { const c = document.createElement('canvas'); c.width = sw; c.height = sh; const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(src, 0, 0, sw, sh); return x.getImageData(0, 0, sw, sh).data; };
    const a = grab(grain), b = grab(fin.canvas), on = new Uint8Array(sw * sh);
    for (let i = 0; i < sw * sh; i++) { const j = i * 4; if (Math.abs(a[j] - b[j]) + Math.abs(a[j + 1] - b[j + 1]) + Math.abs(a[j + 2] - b[j + 2]) > 10) on[i] = 1; }
    const dil = new Uint8Array(sw * sh);
    for (let y = 0; y < sh; y++) for (let x = 0; x < sw; x++) if (on[y * sw + x]) for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const X = x + dx, Y = y + dy; if (X >= 0 && Y >= 0 && X < sw && Y < sh) dil[Y * sw + X] = 1; }
    const lab = new Int32Array(sw * sh), comps = [], stack = [];
    for (let s0 = 0; s0 < sw * sh; s0++) {
      if (!dil[s0] || lab[s0]) continue;
      const id = comps.length + 1, c = { id, x0: 1e9, y0: 1e9, x1: -1, y1: -1, n: 0 }; lab[s0] = id; stack.push(s0);
      while (stack.length) {
        const i = stack.pop(), x = i % sw, y = (i / sw) | 0; c.n++;
        if (x < c.x0) c.x0 = x; if (x > c.x1) c.x1 = x; if (y < c.y0) c.y0 = y; if (y > c.y1) c.y1 = y;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + dx, Y = y + dy; if (X < 0 || Y < 0 || X >= sw || Y >= sh) continue; const j = Y * sw + X; if (dil[j] && !lab[j]) { lab[j] = id; stack.push(j); } }
      }
      comps.push(c);
    }
    const jr = new Rand(hash(seed, 'pops'));
    pops = comps.map(c => {
      const cw = c.x1 - c.x0 + 1, ch = c.y1 - c.y0 + 1, mc = document.createElement('canvas'); mc.width = cw; mc.height = ch;
      const mx = mc.getContext('2d'), mi = mx.createImageData(cw, ch);
      for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) if (lab[(y + c.y0) * sw + x + c.x0] === c.id) mi.data[(y * cw + x) * 4 + 3] = 255;
      mx.putImageData(mi, 0, 0);
      const X0 = c.x0 * q, Y0 = c.y0 * q, PW = Math.min(W - X0, cw * q), PH = Math.min(H - Y0, ch * q);
      const pc = document.createElement('canvas'); pc.width = PW; pc.height = PH; const px = pc.getContext('2d');
      px.drawImage(fin.canvas, X0, Y0, PW, PH, 0, 0, PW, PH);
      px.globalCompositeOperation = 'destination-in'; px.imageSmoothingEnabled = true; px.drawImage(mc, 0, 0, cw, ch, 0, 0, cw * q, ch * q);
      // when does the wash reach this clump's middle?
      const ti = clamp(Math.round(((c.y0 + c.y1) / 2) * q / H * mh), 0, mh - 1) * mw + clamp(Math.round(((c.x0 + c.x1) / 2) * q / W * mw), 0, mw - 1);
      return { cv: pc, x: X0, y: Y0, w: PW, h: PH, kw: rowT(clamp(Math.floor(((c.y0 + c.y1) / 2 * q - ry0) / rh), 0, rows - 1)), j: jr.f() * 0.12, n: c.n };
    });
    // stagger: ordered by when the wash arrives, spread evenly over the window
    // wind-blown leaves drift in at random; real clumps (plants, pots, climbers) take turns
    const big = pops.filter(p => p.n >= 100).sort((a, b) => (a.kw + a.j) - (b.kw + b.j)), N = big.length;
    for (const p of pops) p.s = clamp(Math.max(p.kw + 0.03, FROM + jr.f() * (POP_TO - FROM)), FROM, POP_TO);
    big.forEach((p, i) => { p.s = clamp(Math.max(FROM + (POP_TO - FROM) * (N > 1 ? i / (N - 1) : 0), p.kw + 0.03), FROM, POP_TO); });
  };
  // each clump fades in on its own beat, in place, at its final size
  const drawPops = k => {
    for (const p of pops) {
      const u = clamp((k - p.s) / POP_DUR, 0, 1);
      if (u <= 0) continue;
      out.globalAlpha = u * u * (3 - 2 * u);
      out.drawImage(p.cv, p.x, p.y);
      out.globalAlpha = 1;
    }
  };
  let finLabel = false, phase = 0, pt = 0, last = performance.now(), raf = 0, finished = false, resolve;
  const promise = new Promise(r => { resolve = r; });
  const finish = () => {
    if (finished) return; finished = true; cancelAnimationFrame(raf);
    ink.run(); wet.run(); fin.run();
    out.setTransform(1, 0, 0, 1, 0, 0); out.globalCompositeOperation = 'copy'; out.drawImage(fin.canvas, 0, 0); out.globalCompositeOperation = 'source-over';
    useScene(S, out);
    S.ms = Math.round(fin.ms); S.animMs = Math.round(performance.now() - t0);
    onPhase(null); resolve(S);
  };
  const frame = now => {
    if (finished) return;
    const f0 = performance.now(), dt = opts.manual ? manualDt : clamp((f0 - last) / 1000, 0, 0.25); last = f0;
    const [name, dur] = ANIM_PHASES[phase];
    // a phase may only start once its layer exists; otherwise the clock waits
    const ready = name === 'wash' ? wet.done : true;
    if (ready) pt += dt; else S.held = (S.held || 0) + dt;
    if (name === 'wash' && !pops && pt > 0.7 * dur) { S.held = (S.held || 0) + pt - 0.7 * dur; pt = 0.7 * dur; } // only wait if the planting would otherwise run out of time
    const k = clamp(pt / dur, 0, 1);
    out.setTransform(1, 0, 0, 1, 0, 0); out.globalCompositeOperation = 'source-over';
    if (name === 'pencil') { out.fillStyle = rgba(COL.paper, 1); out.fillRect(0, 0, W, H); pencil(k / 0.95, 1); }
    else if (name === 'ink') { ink.step(Infinity, inkTarget(k)); out.drawImage(ink.canvas, 0, 0); pencil(1, 1 - 0.55 * k); }
    else {
      ink.run(); out.drawImage(ink.canvas, 0, 0); pencil(1, 0.45 * (1 - Math.min(1, k / 0.6)));
      if (ready) {
        // the wash front runs down the sheet; planting and grain follow behind it
        // the colour goes on in brush passes; the last of it floods in so nothing is left bare
        paintTo(k); const flood = sm((k - STROKE_END) / 0.1);
                pmsCtx.clearRect(0, 0, mw, mh); pmsCtx.drawImage(pm, 0, 0, mw, mh); const pd = pmsCtx.getImageData(0, 0, mw, mh).data;
        // paper grain: on bare paper it settles evenly and early (so no stroke shapes show there);
        // on painted paper it follows just behind the brush, as before
        const kf = clamp((k - kG0) / Math.max(0.1, 0.8 - kG0), 0, 1), ff = (tmin - 0.25) + (tmax + 0.3 - tmin) * kf, gBare = sm((k - kG0) / 0.12);
        for (let i = 0; i < AW.length; i++) { const a = pd[i * 4 + 3] / 255; AW[i] = a + flood * (1 - a); AF[i] = !pops ? 0 : bare[i] ? gBare : AW[i] * sm((ff - TU[i]) / 0.25); }
        revealWet(flood);
        if (pops) { reveal(grain, AF); drawPops(k); if (!finLabel) { finLabel = true; onPhase('finish'); } }
      }
    }
    // spend what is left of the frame painting the later layers off-screen
    // the line phases are cheap to show, so they can lend more of each frame
    const left = () => (name === 'wash' ? (pops ? 14 : 40) : 26) - (performance.now() - f0);
    if (!wet.done && left() > 1) wet.step(left());
    if (wet.done && !gDone && left() > 1) grainStep(left());
    if (!fin.done && left() > 1) fin.step(left());
    if (fin.done && gDone && !pops) prepPops(name === 'wash' ? clamp(pt / dur, 0, 1) : 0);
    if (k >= 1) { if (++phase >= ANIM_PHASES.length) return finish(); pt = Math.max(0, pt - dur); onPhase(ANIM_PHASES[phase][0]); }
    if (!opts.manual) raf = requestAnimationFrame(frame);
  };
  // manual mode (the GIF recorder): every layer is painted up front, then time advances only when asked
  let fullInk = null, manualDt = 0;
  if (opts.manual) { wet.run(); fin.run(); grainStep(Infinity); fullInk = new PaintJob(off(), seed, { lock: opts.lock, flags: inkFlags, post: false }); fullInk.run(); prepPops(0); }
  onPhase('pencil');
  out.setTransform(1, 0, 0, 1, 0, 0); out.fillStyle = rgba(COL.paper, 1); out.fillRect(0, 0, W, H);
  if (!opts.manual) raf = requestAnimationFrame(frame);
  return {
    S, promise,
    tick(dt) { if (finished) return true; manualDt = dt; frame(performance.now()); return finished; },
    skip: finish,
    cancel() { if (finished) return; finished = true; cancelAnimationFrame(raf); resolve(null); },
    get running() { return !finished; }
  };
}
