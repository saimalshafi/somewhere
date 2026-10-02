// ============================================================================
//  BLUEPRINT — the building taken apart and put back together, in front of
//  you. Every number shown here is the one the engine used: the dice rolls of
//  the decision log, the volumes and openings the grammar laid out, the
//  camera that projects them, and then the real paint job, run one item at a
//  time, with the box each item touched and the marks it made. Nothing is
//  staged; it is the actual run, slowed down to be read.
// ============================================================================
const BP_ACTS = ['Roll the dice', 'Massing', 'Camera and sun', 'Façade', 'Roof and services', 'Street and garden', 'Paint'];
const BP_STAGE_ACT = {
  Locale: 0, Use: 0, 'House type': 0, 'Shop type': 0, Trade: 0, Condition: 0, 'Modern additions': 0,
  'Frontage width': 1, 'Street-floor height': 1, 'Upper floors': 1, 'Street floor': 1, Jetty: 1,
  'Eye height': 2, 'Viewer side': 2, 'Viewer offset': 2, 'Viewing distance': 2, 'Sun side': 2,
  'Between floors': 3, Gallery: 3, Roof: 4, 'Tall element': 4, 'Vertical side': 4, 'Front boundary': 5, 'Street tree': 5, 'Tree species': 5,
};
const BP_VAR = {
  Locale: 'locale', Use: 'use', 'House type': 'type', 'Shop type': 'type', Trade: 'trade', Condition: 'cond', 'Modern additions': 'retrofit',
  'Frontage width': 'W', 'Street-floor height': 'H0', 'Upper floors': 'floors', 'Street floor': 'ground', Jetty: 'jetty',
  'Eye height': 'eye', 'Viewer side': 'side', 'Viewer offset': 'cx', 'Viewing distance': 'D', 'Sun side': 'sun',
  'Between floors': 'belt', Gallery: 'gallery', Roof: 'roof', 'Tall element': 'vertical', 'Vertical side': 'poleSide', 'Front boundary': 'boundary', 'Street tree': 'tree', 'Tree species': 'species',
};
const BPC = { blue: [28, 74, 186], red: [192, 56, 50], sun: [206, 130, 14], green: [26, 128, 100], ink: [30, 36, 52], mute: [118, 122, 130] };

let BP_STYLE = null; // the locale being explained, so a type key resolves to its own table
function bpPretty(stage, v, short = false) {
  if (stage === 'Locale' && STYLES[v]) return short ? STYLES[v].city : STYLES[v].name; // cells carry the city, the result the full name
  if (stage === 'Trade' && CLASS_NAME[v]) return CLASS_NAME[v];
  if (stage === 'House type' || stage === 'Shop type') { const k = BP_STYLE, tb = stage === 'House type' ? HOUSES[k] : SHOPS[k], t = tb && tb.types && tb.types[v]; if (t) return t.name; }
  return String(v);
}
const bpNum = (v, unit) => unit === 'cm' ? Math.round(v) + ' cm' : unit ? v.toFixed(2) + ' ' + unit : v.toFixed(2);
// one decision as a line of pseudo-code, with the real roll and result
function bpDecision(e) {
  const v = BP_VAR[e.stage] || e.stage.toLowerCase().replace(/\W+/g, '_');
  if (e.kind === 'fixed') return `${v} = ${JSON.stringify(e.choice)}  // ${e.why}`;
  const f = x => e.unit === 'cm' ? String(Math.round(x)) : x.toFixed(2);
  if (e.kind === 'range') return `${v} = range(${f(e.a)}, ${f(e.b)}, r=${e.roll.toFixed(3)}) → ${bpNum(e.value, e.unit)}${e.shown != null ? ' → ' + Math.round(e.shown) + ' cm' : ''}`;
  const o = e.options, uni = o.every(p => Math.abs(p[1] - o[0][1]) < 1e-9);
  const args = o.length <= 4 ? '{' + o.map(([k, p]) => `${k} ${p.toFixed(2).replace(/^0/, '')}`).join(', ') + '}' : `${o.length} options${uni ? ', equal odds' : ''}`;
  const pc = bpPretty(e.stage, e.choice);
  return `${v} = ${uni && o.length > 2 ? 'uniform' : 'pick'}(${args}, r=${e.roll.toFixed(3)}) → ${e.choice}${pc !== e.choice ? '  "' + pc + '"' : ''}`;
}

// ---------------------------------------------------------------- drawing kit
function bpKit(o, W, H) {
  const k = { o, W, H, lw: Math.max(0.9, W / 760), fs: Math.max(1, W / 540), A: 1 }; // fs: type is set larger than the lines, so it reads at screen size
  const col = (c, a) => rgba(c, clamp(a * k.A, 0, 1));
  k.font = (sz, wt = 400) => `${wt} ${Math.round(sz * k.fs)}px "IBM Plex Mono", ui-monospace, Menlo, monospace`;
  k.seg = (a, b, c, al = 0.85, w = 1, dash) => {
    if (!a || !b || !isFinite(a[0] + a[1] + b[0] + b[1])) return;
    o.strokeStyle = col(c, al); o.lineWidth = w * k.lw; o.setLineDash(dash ? dash.map(d => d * k.lw) : []);
    o.beginPath(); o.moveTo(a[0], a[1]); o.lineTo(b[0], b[1]); o.stroke(); o.setLineDash([]);
  };
  // draw the first u of a polyline's length: shapes trace themselves in
  k.trace = (pts, u, c, al = 0.9, w = 1, closed = true, dash) => {
    if (u <= 0) return;
    const ps = closed ? pts.concat([pts[0]]) : pts, L = [];
    let tot = 0; for (let i = 1; i < ps.length; i++) { const d = Math.hypot(ps[i][0] - ps[i - 1][0], ps[i][1] - ps[i - 1][1]); L.push(d); tot += d; }
    let left = tot * clamp(u, 0, 1);
    o.strokeStyle = col(c, al); o.lineWidth = w * k.lw; o.setLineDash(dash ? dash.map(d => d * k.lw) : []);
    o.beginPath(); o.moveTo(ps[0][0], ps[0][1]);
    for (let i = 1; i < ps.length && left > 0; i++) {
      const f = Math.min(1, left / (L[i - 1] || 1)); o.lineTo(lerp(ps[i - 1][0], ps[i][0], f), lerp(ps[i - 1][1], ps[i][1], f)); left -= L[i - 1];
    }
    o.stroke(); o.setLineDash([]);
  };
  k.fill = (pts, c, al) => { o.fillStyle = col(c, al); o.beginPath(); o.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) o.lineTo(p[0], p[1]); o.closePath(); o.fill(); };
  k.dot = (p, c, r = 2.4, al = 1) => { o.fillStyle = col(c, al); o.beginPath(); o.arc(p[0], p[1], r * k.lw, 0, TAU); o.fill(); };
  k.ring = (p, c, r = 6, al = 1, w = 1) => { o.strokeStyle = col(c, al); o.lineWidth = w * k.lw; o.beginPath(); o.arc(p[0], p[1], r * k.lw, 0, TAU); o.stroke(); };
  k.label = (t, x, y, c, sz = 8, align = 'left', wt = 400, back = true, al = 1) => {
    o.font = k.font(sz, wt); o.textAlign = align; o.textBaseline = 'middle';
    if (back) { const w = o.measureText(t).width, h = sz * k.fs * 1.4, x0 = align === 'left' ? x - 3 : align === 'right' ? x - w - 3 : x - w / 2 - 3; o.fillStyle = col(COL.paper, 0.88 * al); o.fillRect(x0, y - h / 2, w + 6, h); }
    o.fillStyle = col(c, al); o.fillText(t, x, y);
  };
  k.tick = (p, c, horiz) => { const d = 4 * k.lw; k.seg([p[0] - d * 0.7, p[1] + d * 0.7], [p[0] + d * 0.7, p[1] - d * 0.7], c, 1, 1); if (horiz) k.seg([p[0] - d, p[1]], [p[0] + d, p[1]], c, 1, 1); else k.seg([p[0], p[1] - d], [p[0], p[1] + d], c, 1, 1); };
  return k;
}
const bpEase = u => 1 - Math.pow(1 - clamp(u, 0, 1), 3);
function bpView(S) { VIEW.cx = S.view.cx; VIEW.eye = S.view.eye; VIEW.D = S.view.D; VIEW.k = S.fit.k; VIEW.ox = S.fit.ox; VIEW.oy = S.fit.oy; SUN.left = S.view.sun.left; SUN.L = S.view.sun.L.slice(); }

// ---------------------------------------------------------------- the script
// a list of timed steps; each prints its lines to the console as it starts and
// draws itself for a progress u in [0, 1], staying on the sheet afterwards
function bpTimeline(S, k) {
  const steps = [], actStart = [], { W, H } = k, B = BPC.blue;
  let t = 0;
  const add = (act, dur, lines, draw, extra = {}) => { const s = { act, t0: t, dur, lines: [].concat(lines || []), draw, ...extra }; steps.push(s); t += dur; return s; };
  const head = (a, more = []) => { actStart[a] = t; add(a, 420, [`// ── ${a + 1} · ${BP_ACTS[a].toUpperCase()} `.padEnd(46, '─'), ...more], null, { head: true }); };
  const logs = a => S.log.filter(e => (BP_STAGE_ACT[e.stage] ?? 3) === a);
  const vols = S.debug.vols, g = vols[0], top = vols[vols.length - 1], Htot = top.y1;
  const vp = () => [VIEW.ox + VIEW.cx * VIEW.k, VIEW.oy - VIEW.eye * VIEW.k];
  const r0 = n => Math.round(n), sg = n => (n >= 0 ? '+' : '−') + Math.abs(Math.round(n));

  // a faint drafting grid over the whole sheet, under everything
  add(0, 0, [], (k, u) => { for (let x = 50; x < W; x += 50) k.seg([x, 0], [x, H], B, 0.05, 0.6); for (let y = 50; y < H; y += 50) k.seg([0, y], [W, y], B, 0.05, 0.6); });

  // 1 — THE DICE: each decision drawn as a bar of its options, with the roll landing in one
  head(0, [`seed = ${S.seed}  // 0x${S.seed.toString(16).padStart(8, '0')}, from crypto.getRandomValues`, `R = mulberry32(hash('somewhere', seed))  // every choice below is one roll of R`]);
  // rows are as tall as their bars: a long list (every locale) stands its names upright so all of them fit
  const d1 = logs(0), bw = W * 0.68, bhs = d1.map(e => bpDiceBar(k, e, bw).bh), rows = bhs.map(bh => bh + 46 * k.lw), tot = rows.reduce((a, b) => a + b, 0);
  let yy = H * 0.5 - tot / 2 + 14 * k.lw;
  d1.forEach((e, i) => { const y = yy; yy += rows[i]; add(0, 640, bpDecision(e), (k, u) => bpDiceRow(k, e, W * 0.16, y, bw, u)); });
  const hide0 = t; for (const s of steps) if (s.act === 0 && s.draw && s.t0 > 0) s.hideAt = hide0;

  // 2 — MASSING: the frontage, the storeys, the volumes
  head(1);
  const lx = Math.min(...vols.map(v => P([v.x0, v.y0, v.z])[0])) - 28 * k.lw;
  for (const e of logs(1)) {
    let draw = null;
    if (e.stage === 'Frontage width') draw = (k, u) => {
      const a = P([g.x0, 0, g.z]), b = P([g.x1, 0, g.z]), y = a[1] + 34 * k.lw, m = (a[0] + b[0]) / 2, h = (b[0] - a[0]) / 2 * bpEase(u);
      k.seg([m - h, y], [m + h, y], B, 0.9, 0.9); if (u >= 1) { k.tick([a[0], y], B); k.tick([b[0], y], B); }
      k.label(`W = ${g.x1 - g.x0} cm`, m, y + 13 * k.lw, B, 8, 'center', 600, true, clamp(u * 2 - 0.6, 0, 1));
    };
    if (e.stage === 'Street-floor height') draw = (k, u) => {
      const a = [lx, P([g.x0, 0, g.z])[1]], b = [lx, P([g.x0, g.y1, g.z])[1]];
      k.seg(a, [lx, lerp(a[1], b[1], bpEase(u))], B, 0.9, 0.9); if (u >= 1) { k.tick(a, B, true); k.tick(b, B, true); }
      k.label(`H0 ${g.y1}`, lx - 5 * k.lw, (a[1] + b[1]) / 2, B, 7, 'right', 400, false, clamp(u * 2 - 0.6, 0, 1));
    };
    add(1, 300, bpDecision(e), draw);
  }
  add(1, 420, `ground = plane(y = 0)  // the street, z = 0 at the façade line`, (k, u) => {
    const a = P([g.x0 - 420, 0, 0]), b = P([g.x1 + 420, 0, 0]), m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    k.seg([lerp(m[0], a[0], bpEase(u)), lerp(m[1], a[1], bpEase(u))], [lerp(m[0], b[0], bpEase(u)), lerp(m[1], b[1], bpEase(u))], BPC.ink, 0.7, 1.1);
  });
  vols.forEach((v, i) => add(1, 460, `vol[${i}] = box(x ${r0(v.x0)}…${r0(v.x1)}, y ${r0(v.y0)}…${r0(v.y1)}, z ${sg(v.z)})  ${v.mat.type}`, (k, u) => {
    const q = quad(v.x0, v.y0, v.x1, v.y1, v.z);
    k.fill(q, B, 0.045 * bpEase(u)); k.trace(q, bpEase(u), B, 0.95, 1.6);
    if (i) { const a = [lx, P([v.x0, v.y0, v.z])[1]], b = [lx, P([v.x0, v.y1, v.z])[1]]; k.seg(a, [lx, lerp(a[1], b[1], bpEase(u))], B, 0.9, 0.9); if (u >= 1) { k.tick(b, B, true); k.label(String(r0(v.y1 - v.y0)), lx - 5 * k.lw, (a[1] + b[1]) / 2, B, 7, 'right', 400, false); } }
    const tl = P([v.x0, v.y1, v.z]);
    k.label(`${i ? 'F' + i : 'F0'}  ${r0(v.x1 - v.x0)}×${r0(v.y1 - v.y0)}${v.z ? '  z' + sg(v.z) : ''}  ${v.mat.type}`, tl[0] + 5 * k.lw, tl[1] + 9 * k.lw, B, 7, 'left', 600, true, clamp(u * 3 - 2, 0, 1));
  }));

  // 3 — CAMERA AND SUN: horizon, vanishing point, a worked projection, the light
  head(2);
  for (const e of logs(2)) {
    let draw = null, dur = 320;
    if (e.stage === 'Eye height') draw = (k, u) => { const p = vp(); k.seg([0, p[1]], [W * bpEase(u), p[1]], BPC.red, 0.75, 1); k.label(`horizon  eye = ${r0(VIEW.eye)} cm`, 12 * k.lw, p[1] - 10 * k.lw, BPC.red, 8, 'left', 600, true, clamp(u * 2 - 0.5, 0, 1)); };
    if (e.stage === 'Viewer offset') draw = (k, u) => { const p = vp(); k.dot(p, BPC.red, 3.2 * bpEase(u)); k.ring(p, BPC.red, 8 * bpEase(u)); k.label(`VP  cx = ${r0(VIEW.cx)} cm`, p[0] + 12 * k.lw, p[1] + 11 * k.lw, BPC.red, 7.5, 'left', 400, true, u); };
    if (e.stage === 'Viewing distance') { dur = 700; draw = (k, u) => { const p = vp(); for (const v of vols) for (const c of [[v.x0, v.y0], [v.x1, v.y0], [v.x0, v.y1], [v.x1, v.y1]]) { const a = P([c[0], c[1], v.z]); k.seg(a, [lerp(a[0], p[0], bpEase(u)), lerp(a[1], p[1], bpEase(u))], B, 0.2, 0.7, [3, 3]); } }; }
    add(2, dur, bpDecision(e), draw);
  }
  // a worked point: the top corner of the highest volume, run through P() with the real numbers
  {
    // prefer a point standing off the wall, so the depth term does some work
    const jut = vols.slice().sort((a, b) => Math.abs(b.z) - Math.abs(a.z))[0], op = S.debug.opens.find(p => p.d), curb = S.debug.slots.find(q => q.kind === 'curb' && q.z > 0);
    const [x, y, z, what] = jut.z ? [jut.x0, jut.y1, jut.z, `corner of vol[${vols.indexOf(jut)}]`] : op ? [op.x0, op.y1, op.z + op.d, `front of the ${op.kind}`] : curb ? [curb.x0, 0, curb.z, 'the kerb'] : [top.x0, top.y1, top.z, `corner of vol[${vols.length - 1}]`];
    const s = VIEW.D / (VIEW.D - z), X = VIEW.cx + (x - VIEW.cx) * s, Y = VIEW.eye + (y - VIEW.eye) * s, sp = P([x, y, z]);
    add(2, 1900, [
      `P(${r0(x)}, ${r0(y)}, ${r0(z)}):  // ${what}`,
      `  s = D/(D − z) = ${r0(VIEW.D)}/(${r0(VIEW.D)} ${z < 0 ? '+ ' + r0(-z) : '− ' + r0(z)}) = ${s.toFixed(4)}`,
      `  X = cx + (x − cx)·s = ${X.toFixed(1)}`,
      `  Y = eye + (y − eye)·s = ${Y.toFixed(1)}`,
      `  px = (ox + k·X, oy − k·Y) = (${sp[0].toFixed(0)}, ${sp[1].toFixed(0)})  // k = ${VIEW.k.toFixed(4)} px/cm`,
    ], (k, u) => {
      const p = P([x, y, z]), a = clamp(u * 1.5, 0, 1), r = lerp(30, 7, bpEase(u));
      k.ring(p, BPC.ink, r, a, 1.3); k.seg([p[0] - r - 6 * k.lw, p[1]], [p[0] + r + 6 * k.lw, p[1]], BPC.ink, a * 0.8, 0.8); k.seg([p[0], p[1] - r - 6 * k.lw], [p[0], p[1] + r + 6 * k.lw], BPC.ink, a * 0.8, 0.8);
      k.label(`(${r0(x)}, ${r0(y)}, ${r0(z)}) → (${p[0].toFixed(0)}, ${p[1].toFixed(0)}) px`, p[0] + 14 * k.lw, p[1] - 14 * k.lw, BPC.ink, 7.5, 'left', 600, true, clamp(u * 2 - 0.8, 0, 1));
    });
  }
  {
    const L = S.view.sun.L, alt = Math.asin(L[1]) * 180 / Math.PI;
    add(2, 1200, [
      `L = (${L.map(v => v.toFixed(3)).join(', ')})  // unit vector toward the sun`,
      `altitude = asin(Ly) = ${alt.toFixed(1)}°`,
      `shadow(p) = p − (p.z − wall.z)/Lz · L  // 1 m of depth → ${Math.abs(L[0] / L[2]).toFixed(2)} m across, ${(L[1] / L[2]).toFixed(2)} m down`,
    ], (k, u) => {
      const left = S.view.sun.left, sc = [left ? 44 * k.lw : W - 44 * k.lw, 70 * k.lw], a = clamp(u * 2, 0, 1);
      k.ring(sc, BPC.sun, 9, a, 1.4);
      for (let i = 0; i < 8; i++) { const an = i / 8 * TAU; k.seg([sc[0] + Math.cos(an) * 12 * k.lw, sc[1] + Math.sin(an) * 12 * k.lw], [sc[0] + Math.cos(an) * 16 * k.lw, sc[1] + Math.sin(an) * 16 * k.lw], BPC.sun, a, 1.2); }
      const d = [-L[0], L[1]], dl = Math.hypot(...d), len = 70 * k.lw * bpEase(u), tip = [sc[0] + d[0] / dl * len, sc[1] + d[1] / dl * len];
      k.seg(sc, tip, BPC.sun, 1, 1.6);
      k.label(`sun ${alt.toFixed(0)}° from the ${left ? 'left' : 'right'}`, sc[0] + (left ? 1 : -1) * 24 * k.lw, sc[1] - 2 * k.lw, BPC.sun, 7.5, left ? 'left' : 'right', 600, true, clamp(u * 2 - 0.8, 0, 1));
    });
  }

  // 4 — FAÇADE: drafting grid, bays along the frontage, every opening
  head(3);
  add(3, 520, `grid(50 cm) on ${vols.length} façade plane${vols.length > 1 ? 's' : ''}`, (k, u) => {
    for (const v of vols) {
      k.o.save(); const q = quad(v.x0, v.y0, v.x1, v.y1, v.z); k.o.beginPath(); k.o.moveTo(...q[0]); for (const p of q.slice(1)) k.o.lineTo(...p); k.o.closePath(); k.o.clip();
      for (let x = Math.ceil(v.x0 / 50) * 50; x < v.x1; x += 50) k.seg(P([x, v.y0, v.z]), P([x, v.y1, v.z]), B, (x % 100 ? 0.08 : 0.17) * u, 0.6);
      for (let y = Math.ceil(v.y0 / 50) * 50; y < v.y1; y += 50) k.seg(P([v.x0, y, v.z]), P([v.x1, y, v.z]), B, (y % 100 ? 0.08 : 0.17) * u, 0.6);
      k.o.restore();
    }
  });
  for (const e of logs(3)) add(3, 320, bpDecision(e));
  const bays = S.debug.bays, gb = S.gf ? S.gf.bays : [];
  if (bays.length) {
    const lines = [`bays = split(W = ${g.x1 - g.x0}, door at ${S.gf ? S.gf.doorAt : 0}) → ${gb.length} on the street`];
    gb.slice(0, 6).forEach((b, i) => lines.push(`  bay[${i}] x ${r0(b.x0)}…${r0(b.x1)}  w ${r0(b.x1 - b.x0)}  ${b.type || ''}`));
    if (gb.length > 6) lines.push(`  … ${gb.length - 6} more`);
    if (bays.length > gb.length) lines.push(`  + ${bays.length - gb.length} bays on the upper floors`);
    add(3, clamp(bays.length * 110, 600, 1700), lines, (k, u) => {
      const n = bays.length * u;
      bays.forEach((b, i) => {
        const f = clamp(n - i, 0, 1); if (f <= 0) return;
        const q = quad(b.x0, b.y0 || 0, b.x1, b.y1 || 100, b.z); k.trace(q, f, B, 0.6, 0.9, true, [4, 3]);
        if ((b.y0 || 0) === 0 && b.type && f >= 1) { const c = P([(b.x0 + b.x1) / 2, (b.y1 || 100) - 16, b.z]); k.label(b.type, c[0], c[1], B, 6.5, 'center', 400, true, 0.9); }
      });
    });
  }
  const ops = S.debug.opens;
  if (ops.length) {
    const lines = [`openings → ${ops.length}`];
    ops.slice(0, 7).forEach(p => lines.push(`  ${p.kind}(x ${r0(p.x0)}, y ${r0(p.y0)}, ${r0(p.x1 - p.x0)}×${r0(p.y1 - p.y0)}, z ${sg(p.z)})${p.top && p.top !== 'flat' ? ' ' + p.top : ''}`));
    if (ops.length > 7) lines.push(`  … ${ops.length - 7} more`);
    add(3, clamp(ops.length * 95, 600, 1900), lines, (k, u) => {
      const n = ops.length * u;
      ops.forEach((p, i) => {
        const f = clamp(n - i, 0, 1); if (f <= 0) return;
        const zf = p.z + (p.d || 0), q = quad(p.x0, p.y0, p.x1, p.y1, zf);
        k.trace(q, bpEase(f), B, 0.9, 1.1);
        if (f >= 1) { k.seg(P([(p.x0 + p.x1) / 2, p.y0, zf]), P([(p.x0 + p.x1) / 2, p.y1, zf]), B, 0.35, 0.6); k.seg(P([p.x0, (p.y0 + p.y1) / 2, zf]), P([p.x1, (p.y0 + p.y1) / 2, zf]), B, 0.35, 0.6); }
        if (p.kind !== 'window' && f >= 1) { const c = P([(p.x0 + p.x1) / 2, p.y1 + 14, zf]); k.label(p.kind, c[0], c[1], B, 7, 'center', 600); }
      });
    });
  }

  // 5 — ROOF AND SERVICES
  head(4);
  for (const e of logs(4)) add(4, 320, bpDecision(e));
  add(4, 700, [`roof(vol[${vols.length - 1}]) → ${JSON.stringify(S.roofType || 'flat')}`], (k, u) => {
    const line = S.roofLine && S.roofLine.length > 1 ? S.roofLine : [[top.x0, top.y1, top.z], [top.x1, top.y1, top.z]];
    k.trace(line.map(P), bpEase(u), BPC.red, 0.9, 2, false);
    const a = P(line[0]); k.label(`roof: ${S.roofType || 'flat'}`, a[0], a[1] - 14 * k.lw, BPC.red, 7.5, 'left', 600, true, clamp(u * 2 - 0.6, 0, 1));
  });
  add(4, 380, S.retrofit ? `retrofit = true  // tanks, dishes, AC units and wiring allowed` : `retrofit = false  // no modern additions on this one`);

  // 6 — STREET AND GARDEN: boundary, prop slots read off the façade, props, planting
  head(5);
  for (const e of logs(5)) add(5, 320, bpDecision(e));
  const slots = S.debug.slots.filter(s => s.kind !== 'curb');
  if (slots.length) add(5, 700, [`slots = anchors(façade) → ${slots.map(s => s.kind).join(', ')}`], (k, u) => {
    slots.forEach((s, i) => { const f = clamp(u * slots.length - i, 0, 1); if (f <= 0) return; const q = [P([s.x0, 0, s.z]), P([s.x1, 0, s.z]), P([s.x1, 0, s.z + 35]), P([s.x0, 0, s.z + 35])]; k.trace(q, f, BPC.green, 0.75, 0.9, true, [3, 2]); if (f >= 1) k.label(s.kind, (q[0][0] + q[1][0]) / 2, q[2][1] + 8 * k.lw, BPC.green, 6.5, 'center', 400, false); });
  });
  const props = S.debug.props;
  if (props.length) add(5, clamp(props.length * 160, 500, 1300), [`props → ${props.length}`, ...props.slice(0, 6).map(p => `  place(${p.k}, ${p.slot}) at x ${r0(p.x)}`)], (k, u) => {
    props.forEach((p, i) => { const f = clamp(u * props.length - i, 0, 1); if (f <= 0) return; const a = P([p.x + (p.w || 30) / 2, 0, p.z]); k.dot(a, BPC.green, 2.4 * bpEase(f)); k.label(p.k, a[0], a[1] + 15 * k.lw, BPC.green, 6.5, 'center', 600, true, f); });
  });
  const pl = S.debug.plants;
  if (pl.length) add(5, clamp(pl.length * 220, 500, 1400), [`planting → ${pl.length}`, ...pl.slice(0, 5).map(p => `  ${p.tree ? 'tree' : 'shrub'}(${JSON.stringify(p.kind)}, x ${r0(p.x)}, h ${r0(p.h)})`)], (k, u) => {
    pl.forEach((p, i) => {
      const f = bpEase(clamp(u * pl.length - i, 0, 1)); if (f <= 0) return;
      const b = P([p.x, 0, p.z]), c = P([p.x, p.tree ? p.h * 0.72 : p.h * 0.5, p.z]), r = Math.abs(P([p.x + p.r, 0, p.z])[0] - b[0]);
      if (p.tree) k.seg(b, [b[0], lerp(b[1], c[1], f)], BPC.green, 0.7, 1);
      k.o.setLineDash([3 * k.lw, 3 * k.lw]); k.ring(c, BPC.green, r / k.lw * f, 0.75, 0.9); k.o.setLineDash([]);
      if (f >= 1) k.label(p.kind, c[0], c[1], BPC.green, 6.5, 'center', 600, true);
    });
  });

  // 7 — PAINT: the real painter, one item at a time, back to front
  head(6, [`order = items.sort((a, b) => a.order − b.order)  // painter's algorithm, back to front`]);
  const paint = add(6, clamp(S.order.length * 17, 5200, 9000), `for (item of order) item.fn()  // n = ${S.order.length}`, null, { kind: 'paint' });
  const grain = add(6, 1300, [`paper = turbulence(f=${PAPER.fine.f}, ${PAPER.fine.oct} octaves) + turbulence(f=${PAPER.coarse.f}, ${PAPER.coarse.oct} octaves)  // the paper's tooth`, `page = page × table(paper)  // multiply: a few percent darker on the peaks`], null, { kind: 'grain' });
  const outro = add(6, 1000, [], null, { kind: 'outro' });
  return { steps, actStart, paint, grain, outro, total: t };
}

// one decision as a probability bar: options side by side as wide as their odds, the roll slides in
// how tall a decision's bar must be: names lie flat when they all fit, else stand upright
function bpDiceBar(k, e, w) {
  const base = 20 * k.lw;
  if (e.kind !== 'pick') return { bh: base, rot: false };
  k.o.font = k.font(6.5);
  const ws = e.options.map(([v, p]) => [k.o.measureText(bpPretty(e.stage, v, true)).width, p * w]);
  if (ws.every(([tw, sw]) => tw < sw - 6 * k.lw)) return { bh: base, rot: false };
  return { bh: Math.max(base, Math.max(...ws.map(q => q[0])) + 14 * k.lw), rot: true };
}
function bpDiceRow(k, e, x, y, w, u) {
  const B = BPC.blue, I = BPC.ink, M = BPC.mute, { bh, rot } = bpDiceBar(k, e, w), by = y + 10 * k.lw, o = k.o;
  const land = clamp(u / 0.7, 0, 1), done = u >= 0.7;
  k.label(e.stage.toUpperCase(), x, y - 4 * k.lw, I, 8, 'left', 600, false);
  if (e.why) { const sw = o.measureText(e.stage.toUpperCase()).width; k.label('· ' + e.why, x + sw + 8 * k.lw, y - 4 * k.lw, M, 6.5, 'left', 400, false); }
  if (e.kind === 'fixed') {
    o.setLineDash([3 * k.lw, 3 * k.lw]); o.strokeStyle = rgba(M, 0.8 * k.A); o.lineWidth = k.lw; o.strokeRect(x, by, w, bh); o.setLineDash([]);
    k.label('fixed', x + w / 2, by + bh / 2, M, 7, 'center', 400, false);
    k.label(bpPretty(e.stage, e.choice), x + w, y - 4 * k.lw, B, 8.5, 'right', 700, false, clamp(u * 2, 0, 1));
    return;
  }
  let pos;
  if (e.kind === 'range') {
    const gr = o.createLinearGradient(x, 0, x + w, 0); gr.addColorStop(0, rgba(B, 0.04 * k.A)); gr.addColorStop(1, rgba(B, 0.2 * k.A));
    o.fillStyle = gr; o.fillRect(x, by, w, bh); o.strokeStyle = rgba(B, 0.6 * k.A); o.lineWidth = k.lw; o.strokeRect(x, by, w, bh);
    const f = v => e.unit === 'cm' ? Math.round(v) + ' cm' : v.toFixed(2);
    k.label(f(e.a), x + 3 * k.lw, by + bh / 2, M, 6.5, 'left', 400, false); k.label(f(e.b), x + w - 3 * k.lw, by + bh / 2, M, 6.5, 'right', 400, false);
    pos = e.roll * bpEase(land);
    if (done) k.label(bpNum(e.value, e.unit) + (e.shown != null ? ' → ' + Math.round(e.shown) + ' cm' : ''), x + w, y - 4 * k.lw, B, 8.5, 'right', 700, false, clamp((u - 0.7) / 0.15, 0, 1));
  } else {
    pos = e.roll * bpEase(land);
    let c = 0;
    o.font = k.font(6.5);
    for (const [v, p] of e.options) {
      const sx = x + c * w, sw = p * w, on = pos >= c && pos < c + p + 1e-9, chosen = done && v === e.choice;
      o.fillStyle = rgba(chosen ? B : on ? B : M, (chosen ? 0.85 : on ? 0.22 : 0.07) * k.A); o.fillRect(sx + 0.5, by, Math.max(0, sw - 1), bh);
      const name = bpPretty(e.stage, v, true), tw = o.measureText(name).width;
      if (!rot && tw < sw - 6 * k.lw) k.label(name, sx + sw / 2, by + bh / 2, chosen ? COL.paper : I, 6.5, 'center', chosen ? 600 : 400, false, chosen ? 1 : 0.75);
      else if (rot && sw > 6.5 * k.fs * 1.1) { o.save(); o.translate(sx + sw / 2, by + bh - 7 * k.lw); o.rotate(-Math.PI / 2); k.label(name, 0, 0, chosen ? COL.paper : I, 6.5, 'left', chosen ? 600 : 400, false, chosen ? 1 : 0.75); o.restore(); o.font = k.font(6.5); }
      if (c > 0) k.seg([sx, by], [sx, by + bh], B, 0.35, 0.7); // every option gets its own visible cell
      c += p;
    }
    o.strokeStyle = rgba(B, 0.5 * k.A); o.lineWidth = k.lw; o.strokeRect(x, by, w, bh);
    if (done) k.label(bpPretty(e.stage, e.choice), x + w, y - 4 * k.lw, B, 8.5, 'right', 700, false, clamp((u - 0.7) / 0.15, 0, 1));
  }
  // the roll: a needle sliding to where the die landed
  const px = x + pos * w;
  k.seg([px, by - 5 * k.lw], [px, by + bh + 5 * k.lw], BPC.red, 1, 1.6);
  k.o.fillStyle = rgba(BPC.red, k.A); k.o.beginPath(); k.o.moveTo(px, by - 2 * k.lw); k.o.lineTo(px - 4 * k.lw, by - 8 * k.lw); k.o.lineTo(px + 4 * k.lw, by - 8 * k.lw); k.o.closePath(); k.o.fill();
  k.label('r=' + (e.roll * bpEase(land)).toFixed(3), px, by + bh + 12 * k.lw, BPC.red, 6.5, 'center', 600, false);
}

// ---------------------------------------------------------------- the player
function blueprint(cv, ov, seed, opts = {}) {
  const W = cv.width, H = cv.height, o = ov.getContext('2d'), con = opts.console;
  const mk = () => { TRACE = true; try { return new PaintJob(cv, seed, { flags: opts.flags, post: false }); } finally { TRACE = false; } };
  let job = mk();
  const S = job.S, kit = bpKit(o, W, H);
  BP_STYLE = S.styleKey;
  bpView(S);
  const T = bpTimeline(S, kit), steps = T.steps, P7 = T.paint, G7 = T.grain, O7 = T.outro;
  let idle = false, t = 0, speed = 1, playing = true, raf = 0, last = 0, si = -1, typing = null, painted = [], ended = false, dead = false;
  const lastState = {};

  // ---- console
  const esc = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
  const hl = s => {
    const ci = s.indexOf('//'); let code = ci >= 0 ? s.slice(0, ci) : s, com = ci >= 0 ? s.slice(ci) : '';
    let h = esc(code).replace(/("[^"]*")/g, '<span class="s">$1</span>').replace(/(^|[^\w#.])(−?-?\d+(?:\.\d+)?)/g, '$1<span class="n">$2</span>');
    h = h.replace(/(→.*)$/, '<em>$1</em>');
    return h + (com ? '<i>' + esc(com) + '</i>' : '');
  };
  const line = (s, cls) => { if (!con) return null; const d = document.createElement('div'); d.className = 'ln' + (cls ? ' ' + cls : ''); d.innerHTML = hl(s); con.appendChild(d); if (con.childElementCount > 600) for (let i = 0; i < 120; i++) con.firstElementChild.remove(); return d; };
  const stick = () => { if (con) con.scrollTop = con.scrollHeight; };
  const finishTyping = () => { if (!typing) return; typing.nodes.forEach((n, i) => { n.innerHTML = hl(typing.lines[i]); n.classList.remove('typing'); }); typing = null; };
  const startStep = s => {
    finishTyping();
    if (!s.lines.length || !con) return;
    const nodes = s.lines.map(l => { const n = line('', s.head ? 'hd' : ''); return n; });
    typing = { s, nodes, lines: s.lines, tot: s.lines.reduce((a, l) => a + l.length, 0) };
  };
  const typeTo = u => {
    if (!typing) return;
    let left = Math.ceil(typing.tot * clamp(u * 1.8, 0, 1));
    typing.lines.forEach((l, i) => { const n = typing.nodes[i], c = Math.max(0, Math.min(l.length, left)); left -= l.length; n.innerHTML = c >= l.length ? hl(l) : esc(l.slice(0, c)); n.classList.toggle('typing', c > 0 && c < l.length); });
    if (u * 1.8 >= 1) finishTyping();
  };

  // ---- painting, one item at a time
  const paintOne = () => {
    const S2 = job.S, it = S2.order[job.i], s0 = { ...job.stats }, r0 = S2.debug.rays.length;
    BBT = [1e9, 1e9, -1e9, -1e9];
    try { job.step(Infinity, job.i + 1); } finally { var bb = BBT; BBT = null; }
    const d = {}; for (const k in s0) d[k] = job.stats[k] - s0[k];
    const rec = { i: job.i - 1, tag: it.tag || 'draw', order: it.order, bb: [clamp(bb[0], 0, W), clamp(bb[1], 0, H), clamp(bb[2], 0, W), clamp(bb[3], 0, H)], d, t, rays: S2.debug.rays.slice(r0) };
    rec.empty = !(d.ink || d.wash || d.leaf) || rec.bb[2] <= rec.bb[0] || rec.bb[3] <= rec.bb[1];
    painted.push(rec);
    const marks = [d.ink && d.ink + ' ink', d.wash && d.wash + ' wash', d.leaf && d.leaf + ' leaf', d.shadow && d.shadow + ' shadow'].filter(Boolean).join(' · ');
    line(`#${String(rec.i).padStart(3, '0')} ${rec.tag}  z ${it.order.toFixed(1)} → ${marks || 'nothing (layer off)'}`, 'pt');
    bpView(S);
  };
  const paintTo = n => { finishTyping(); n = Math.min(n, job.n); while (job.i < n) paintOne(); };
  const paintTarget = () => Math.floor(job.n * clamp((t - P7.t0) / P7.dur, 0, 1));

  // ---- one frame: catch the console and the painting up to t, then draw the sheet
  const consA = () => t < P7.t0 ? 1 : t < O7.t0 ? lerp(1, 0.3, clamp((t - P7.t0) / 800, 0, 1)) : 0.3 * (1 - clamp((t - O7.t0) / O7.dur, 0, 1));
  function sync() {
    while (si < steps.length - 1 && steps[si + 1].t0 <= t) {
      const s = steps[++si];
      if (s.kind === 'grain') paintTo(job.n);
      if (s.kind === 'outro') { finishGrain(); summary(); }
      startStep(s);
    }
    if (t >= P7.t0) paintTo(paintTarget());
    if (t >= G7.t0 && !(job.post && job.done)) { paintTo(job.n); job.post = true; if (t >= G7.t0 + G7.dur) finishGrain(); else job.step(5); bpView(S); }
    if (typing) typeTo((t - typing.s.t0) / Math.max(1, typing.s.dur));
  }
  function finishGrain() { if (job.post && job.done) return; paintTo(job.n); job.post = true; job.step(Infinity); bpView(S); }
  function summary() {
    const st = job.stats;
    finishTyping();
    line(`done: ${job.n} items · ${st.ink.toLocaleString()} pen strokes · ${st.wash.toLocaleString()} washes · ${st.leaf.toLocaleString()} leaves · ${st.shadow} shadows`, 'hd');
    stick();
  }
  function draw() {
    o.setTransform(1, 0, 0, 1, 0, 0); o.clearRect(0, 0, W, H);
    bpView(S);
    const ca = consA();
    for (const s of steps) {
      if (s.t0 > t) break;
      if (!s.draw) continue;
      let a = ca; if (s.hideAt != null) a *= 1 - clamp((t - s.hideAt) / 350, 0, 1);
      if (a <= 0.01) continue;
      kit.A = a; o.save(); s.draw(kit, clamp((t - s.t0) / Math.max(1, s.dur), 0, 1)); o.restore();
    }
    if (t >= P7.t0 && t < T.total) {
      const fade = 1 - clamp((t - O7.t0) / O7.dur, 0, 1);
      // live shadow rays: each one is a real sun ray from a caster to where its shadow landed
      kit.A = fade;
      for (const r of painted) for (const ray of r.rays) { const a = P(ray.from), b = P(ray.to); kit.seg(a, b, BPC.sun, 0.85, 1, [5, 3]); kit.dot(a, BPC.sun, 1.8); }
      // the box each recent item touched, fading as the next ones land
      const recent = painted.filter(r => !r.empty && t - r.t < 900).slice(-8);
      recent.forEach((r, i) => {
        const age = clamp((t - r.t) / 900, 0, 1), a = (1 - age) * fade, [x0, y0, x1, y1] = r.bb;
        kit.A = a; o.strokeStyle = rgba(BPC.red, 0.9 * a); o.lineWidth = 1.2 * kit.lw; o.strokeRect(x0, y0, x1 - x0, y1 - y0);
        if (i === recent.length - 1) kit.label(`#${r.i} ${r.tag}  ${Math.round(x1 - x0)}×${Math.round(y1 - y0)}`, x0, Math.max(10 * kit.lw, y0 - 9 * kit.lw), BPC.red, 7.5, 'left', 600, true);
      });
      if (t >= G7.t0 && t < G7.t0 + G7.dur) { const y = H * (t - G7.t0) / G7.dur; kit.A = 1; kit.seg([0, y], [W, y], BPC.red, 0.55, 1); kit.label(`paper y = ${Math.round(y)}`, W - 12 * kit.lw, y - 9 * kit.lw, BPC.red, 7, 'right', 600, true); }
    }
    kit.A = 1;
  }
  function state() {
    const act = t >= P7.t0 - 420 ? 6 : Math.max(0, steps[Math.max(0, si)] ? steps[Math.max(0, si)].act : 0);
    const s = { act, t, total: T.total, playing: playing && !ended, done: ended, speed, starts: T.actStart };
    if (opts.onState && (s.act !== lastState.act || s.playing !== lastState.playing || s.done !== lastState.done || s.speed !== lastState.speed || Math.abs(s.t - (lastState.t || 0)) > 120)) { Object.assign(lastState, s); opts.onState(s); }
  }
  function tick(now) {
    if (dead) return;
    if (ended && idle) { raf = requestAnimationFrame(tick); return; }
    const dt = last ? Math.min(100, now - last) : 16; last = now;
    if (playing && !ended) t = Math.min(T.total, t + dt * speed);
    sync(); draw(); stick();
    if (t >= T.total && !ended) { ended = true; finishGrain(); o.clearRect(0, 0, W, H); }
    idle = ended;
    state();
    raf = requestAnimationFrame(tick);
  }
  // jump anywhere: backwards starts a fresh paint job on blank paper and replays the console
  function seek(nt) {
    nt = clamp(nt, 0, T.total);
    if (nt < t) {
      job = mk(); bpView(S); painted = []; si = -1; typing = null; if (con) con.textContent = '';
    }
    ended = false; idle = false; t = nt; sync(); finishTyping();
    if (t >= T.total) { ended = true; finishGrain(); }
    draw(); stick(); state();
  }
  raf = requestAnimationFrame(tick);
  return {
    S, acts: BP_ACTS, total: T.total, starts: T.actStart,
    get playing() { return playing && !ended; },
    get done() { return ended; },
    toggle() { if (ended) { seek(0); playing = true; } else playing = !playing; last = 0; state(); },
    setSpeed(k) { speed = k; state(); },
    jump(a) { seek(a === 6 ? T.actStart[6] : T.actStart[a]); playing = true; },
    end() { seek(T.total); },
    restart() { seek(0); playing = true; },
    cancel() { dead = true; cancelAnimationFrame(raf); o.setTransform(1, 0, 0, 1, 0, 0); o.clearRect(0, 0, W, H); BBT = null; TRACE = false; },
  };
}
