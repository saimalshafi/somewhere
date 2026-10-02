// ============================================================================
//  BASTI — flora: species with growth rules and placement rules
//  Trees stand on the side opposite the tall vertical; shrubs anchor base
//  corners; climbers grow from soil up walls or hang from ledges; pots and
//  window boxes follow the style's planting list.
// ============================================================================
const LEAF = {
  green: [[26, 50, 62], [72, 108, 66], [146, 176, 72], [206, 212, 112]],
  pine: [[22, 46, 44], [44, 78, 60], [86, 120, 76], [134, 156, 88]],
  cypress: [[20, 42, 38], [40, 70, 52], [78, 110, 66], [122, 144, 78]],
  yellow: [[40, 66, 54], [96, 128, 62], [176, 196, 84], [222, 222, 130]],
  ivy: [[24, 46, 46], [52, 86, 60], [100, 136, 74], [150, 170, 96]],
  ginkgo: [[90, 104, 46], [150, 158, 58], [214, 196, 76], [240, 224, 128]],
  olive: [[56, 74, 70], [96, 118, 104], [150, 170, 150], [196, 206, 186]],
  citrus: [[20, 50, 40], [44, 84, 52], [92, 130, 66], [150, 170, 90]],
  ashoka: [[16, 40, 30], [30, 66, 42], [60, 104, 56], [110, 146, 70]],
  neem: [[30, 60, 40], [64, 104, 56], [120, 156, 70], [176, 196, 100]],
  silver: [[60, 86, 92], [104, 136, 132], [160, 186, 170], [206, 220, 200]],
};
const BLOOM = {
  hydrangea: [[[128, 150, 214], [150, 170, 226], [110, 130, 200]], [[226, 150, 196], [238, 176, 210], [210, 130, 180]]],
  bougainvillea: [[206, 54, 132], [224, 86, 156], [184, 40, 110]],
  geranium: [[214, 50, 52], [232, 80, 90], [196, 36, 44]], geraniumPink: [[236, 110, 150], [244, 150, 180]],
  sakura: [[244, 186, 204], [250, 214, 226], [236, 160, 186]],
  rose: [[210, 60, 70], [236, 120, 140], [250, 220, 220]],
  azalea: [[230, 80, 140], [244, 130, 170], [214, 60, 120]],
  jasmine: [[252, 252, 248], [246, 244, 236], [250, 246, 230]],
  pomegranate: [[190, 40, 40], [214, 70, 50]], persimmon: [[236, 128, 40], [246, 150, 60]], citrus: [[244, 160, 40], [250, 200, 60]],
  hollyhock: [[[226, 100, 140], [240, 150, 180]], [[204, 50, 70], [230, 90, 100]], [[250, 240, 230], [240, 220, 210]], [[150, 80, 150], [180, 110, 180]]],
};
const K = () => VIEW.k;

// ---------------------------------------------------------------- placement
function planting(S, vols, R, pal, st, treeSide, Htot) {
  const g = vols[0], fl = st.flora;
  // tree on the side opposite the pole/lamp
  if (logChance(S, R, 'Street tree', S.garden ? Math.max(0.75, fl.treeP) : fl.treeP, 'yes', 'no', S.garden ? 'a front garden almost always has one' : 'chance of a tree') === 'yes') {
    const kind = logPick(S, R, 'Tree species', fl.tree, 'species that grow in this locale'); S.treeKind = kind;
    const G = S.garden; // a garden tree stands inside the wall and shows over it
    const x = G ? (treeSide < 0 ? g.x0 + R.range(30, 90) : g.x1 - R.range(30, 90)) : treeSide < 0 ? g.x0 - R.range(20, 70) : g.x1 + R.range(20, 70), z = G ? lerp(G.z0 + 30, G.z1 - 25, R.f()) : R.range(110, 150);
    tree(S, kind, x, z, Htot, R.fork('tree'), g);
  }
  // shrubs anchor the base corners, one heavier than the other
  const heavy = R.chance(0.5) ? -1 : 1;
  for (const s of [-1, 1]) {
    if (s !== heavy && R.chance(0.35)) continue;
    const kind = R.wpick(fl.shrub);
    const x = s < 0 ? g.x0 + R.range(-30, 20) : g.x1 + R.range(-20, 30), z = S.garden ? lerp(S.garden.z0 + 25, S.garden.z1 - 20, R.f()) : R.range(40, 90);
    shrub(S, kind, x, z, s === heavy ? R.range(1, 1.45) : R.range(0.6, 0.9), R.fork('sh' + s), pal);
  }
  // climbers
  const ck = R.wpick(fl.climber);
  if (ck === 'vine') {
    const lines = (S.creepLines || []).concat(S.roofLine && R.chance(0.6) ? [S.roofLine] : []);
    for (const ln of lines) if (R.chance(0.75)) hangingVine(S, ln, R.fork('vine' + ln[0][0]));
  } else if (R.chance(0.7)) {
    const side = R.chance(0.5) ? -1 : 1;
    if (ck === 'ivy') wallClimber(S, g, side, 'ivy', R.fork('ivy'), Htot);
    else if (ck === 'rose' || ck === 'bougainvillea' || ck === 'jasmine' || ck === 'grape') doorClimber(S, ck, R.fork('dc'), g);
  }
  // grass and weeds where wall meets pavement
  S.add(Math.min(0, g.z) + 0.4, () => {
    if (!FLAGS.plants) return;
    for (let k = 0; k < RR.int(3, 7); k++) grassTuft(RR.range(g.x0, g.x1), 0, g.z + 2, RR.range(0.6, 1.2));
  });
}

// ---------------------------------------------------------------- trees
function tree(S, kind, x, z, Htot, R, g) {
  const L = SUN.L, h = clamp(R.range(0.5, 0.75) * Htot + 60, 380, 640), lean = R.gauss() * 0.08;
  const crownW = kind === 'palm' ? 140 : kind === 'cypress' || kind === 'ashoka' ? 45 : kind === 'pine' ? 90 : h * 0.3 * (kind === 'pomegranate' || kind === 'citrus' || kind === 'olive' ? 0.7 : 1);
  S.bounds.push([x - crownW, h * 0.8, z], [x + crownW, h * 0.8, z]);
  S.debug.plants.push({ kind, tree: true, x, z, h, r: crownW });
  const dapple = (cx, cy, n, r0) => { // dappled shade thrown on the facade
    for (let i = 0; i < n; i++) {
      const sx = cx + RR.gauss() * r0 - (z - g.z) * L[0] / L[2], sy = cy + RR.gauss() * r0 * 0.6 - (z - g.z) * L[1] / L[2], r = RR.range(20, 45), pts = [];
      for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; pts.push([sx + Math.cos(a) * r * RR.range(0.7, 1.2), sy + Math.sin(a) * r * 0.7 * RR.range(0.7, 1.2)]); }
      for (const rc of SC.recv) { const cl = clipRect(pts, rc.x0, rc.y0, rc.x1, rc.y1); if (cl.length > 2) wash(cl.map(q => P([q[0], q[1], rc.z])), COL.shadow, { a: 0.3, amp: 4, rim: 0.1 }); }
    }
  };
  const bark = [92, 78, 70];
  if (kind === 'palm') {
    const H = h * 1.05, bend = R.range(-0.25, 0.25) * H * 0.3;
    S.add(z + 1, () => {
      dapple(x + bend, H * 0.9, 4, 50);
      const sp = []; for (let t = 0; t <= 1.001; t += 0.08) sp.push([x + bend * t * t, H * t]);
      if (FLAGS.plants) {
        brush(sp.map(q => P([q[0], q[1], z])), { w: 12 * K() * 0.55, col: [140, 120, 96], a: 0.9 });
        for (let t = 0.05; t < 0.95; t += 0.04) { const c = [x + bend * t * t, H * t]; L3([c[0] - 6, c[1], z], [c[0] + 6, c[1] + 2, z], { w: 0.5, a: 0.6, os: 0 }); }
      }
      const top = [x + bend, H], nf = RR.int(13, 17);
      for (let i = 0; i < nf && FLAGS.plants; i++) {
        const a = -Math.PI / 2 + (i / nf - 0.5) * Math.PI * 1.9 + RR.gauss() * 0.1, len = RR.range(110, 170);
        const pts = []; for (let t = 0; t <= 1.001; t += 0.06) { const droop = t * t * len * 0.6; pts.push([top[0] + Math.cos(a) * len * t, top[1] - Math.sin(a) * len * t * 0.55 - droop * (Math.abs(Math.cos(a)) + 0.3)]); }
        const sp2 = pts.map(q => P([q[0], q[1], z]));
        const col = RR.pick(LEAF.green.slice(0, 3));
        for (let k = 1; k < sp2.length; k++) for (const s of [-1, 1]) {
          const p = sp2[k], q = sp2[k - 1], ang = Math.atan2(p[1] - q[1], p[0] - q[0]) + s * 1.1 + 0.5;
          drawLeaf(p[0], p[1], RR.range(13, 19) * K() * (1 - k / sp2.length * 0.45), ang, jit(k < 6 ? col : mix(col, LEAF.green[2], 0.5), 8), 0.9, 'lance');
        }
        inkLine(sp2, { w: 1.1, a: 0.75, os: 0 });
      }
    });
    return;
  }
  if (kind === 'cypress') {
    const H = R.range(420, 620), w = R.range(55, 80);
    S.bounds.push([x, H, z]);
    S.add(z + 1, () => {
      dapple(x, H * 0.6, 3, 30);
      if (FLAGS.plants) brush([P([x, 0, z]), P([x, 50, z])], { w: 8 * K() * 0.55, col: bark });
      const n = 9;
      for (let i = 0; i < n; i++) { const t = (i + 0.5) / n, r = w * Math.sin(Math.PI * Math.pow(t, 0.7)) * (1 - t * 0.35); const p = P([x + RR.gauss() * 3, 40 + (H - 40) * t, z]); foliage(p[0], p[1], r * K() * 0.85, (H / n) * 0.75 * K(), { leaf: 6, pal: LEAF.cypress, under: 0.6, angle: -Math.PI / 2, angleJit: 0.6 }); }
    });
    return;
  }
  if (kind === 'ashoka') { // false ashoka (Polyalthia pendula): a tall narrow column of drooping glossy leaves
    const H = R.range(520, 700), w = R.range(38, 52);
    S.bounds.push([x, H, z]);
    S.add(z + 1, () => {
      dapple(x, H * 0.55, 3, 26);
      if (FLAGS.plants) brush([P([x, 0, z]), P([x, 40, z])], { w: 7 * K() * 0.55, col: bark });
      const n = 12;
      for (let i = 0; i < n; i++) { const t = (i + 0.5) / n, r = w * Math.sin(Math.PI * Math.pow(t, 0.62)) * (1 - t * 0.25); const p = P([x + RR.gauss() * 2.5, 30 + (H - 30) * t, z]); foliage(p[0], p[1], r * K() * 0.85, (H / n) * 0.8 * K(), { leaf: 7.5, pal: LEAF.ashoka, shape: 'lance', under: 0.6, angle: Math.PI / 2, angleJit: 0.5, dens: 1.2 }); }
    });
    return;
  }
  if (kind === 'pine') { // Japanese garden pine: twisting trunk, horizontal cloud pads
    const H = Math.min(h, R.range(320, 460));
    S.bounds.push([x, H, z]);
    S.add(z + 1, () => {
      const pts = []; let px = x, ang = Math.PI / 2 + (x > 0 ? 0.3 : -0.3);
      for (let t = 0; t <= 1.001; t += 0.1) { pts.push([px, H * t]); ang += RR.gauss() * 0.25; px += Math.cos(ang) * H * 0.1; }
      dapple(px, H * 0.8, 4, 50);
      if (FLAGS.plants) brush(pts.map(q => P([q[0], q[1], z])), { w: 13 * K() * 0.55, col: [84, 70, 64] });
      const pads = RR.int(4, 7);
      for (let i = 0; i < pads; i++) {
        const t = 0.45 + i / pads * 0.55, base = pts[Math.min(pts.length - 1, Math.round(t * 10))], dir = i % 2 ? 1 : -1;
        const c = [base[0] + dir * RR.range(30, 90), base[1] + RR.range(-10, 20)];
        if (FLAGS.plants) brush([P([base[0], base[1], z]), P([c[0], c[1] - 8, z])], { w: 4 * K() * 0.55, col: [84, 70, 64] });
        const p = P([c[0], c[1], z]); foliage(p[0], p[1], RR.range(45, 75) * K(), RR.range(14, 22) * K(), { leaf: 6.5, pal: LEAF.pine, shape: 'needle', under: 0.65, dens: 1.6, ragged: 0.4 });
      }
    });
    return;
  }
  // broadleaf crowns: round, plane, lime, blossom
  const pal = kind === 'neem' ? LEAF.neem : kind === 'plane' || kind === 'lime' ? LEAF.yellow : kind === 'ginkgo' ? LEAF.ginkgo : kind === 'olive' ? LEAF.olive : kind === 'citrus' ? LEAF.citrus : LEAF.green;
  const tall = kind === 'plane' || kind === 'lime' || kind === 'ginkgo' ? 1.15 : kind === 'pomegranate' || kind === 'citrus' || kind === 'olive' ? 0.72 : 1;
  const fruit = { pomegranate: BLOOM.pomegranate, persimmon: BLOOM.persimmon, citrus: BLOOM.citrus }[kind];
  S.add(z + 1, () => {
    const H = h * tall, cry = H * RR.range(0.3, 0.38) * (kind === 'lime' ? 1.1 : 1), crx = cry * (kind === 'lime' || kind === 'ginkgo' ? RR.range(0.7, 0.85) : kind === 'olive' ? RR.range(1.2, 1.5) : RR.range(0.85, 1.2)), cc = [x + lean * H + RR.gauss() * 10, H - cry * 0.85];
    const top = [cc[0] - lean * 20, cc[1] - cry * 0.35];
    dapple(cc[0], cc[1], 7, 60);
    const n = Math.round(crx * cry / 1400) + RR.int(2, 5), masses = [];
    for (let i = 0; i < n + 3; i++) { const a = RR.f() * TAU, r = Math.sqrt(RR.f()) * 0.68; masses.push([cc[0] + Math.cos(a) * crx * r, Math.max(top[1] + 25, cc[1] + Math.sin(a) * cry * r), RR.range(0.8, 1.15)]); }
    if (FLAGS.plants) {
      const tw = 14, trunk = []; for (let t = 0; t <= 1.001; t += 0.1) trunk.push(P([lerp(x, top[0], t) + Math.sin(t * 5) * 4, lerp(0, top[1], t), z]));
      brush(trunk, { w: tw * K() * 0.55 * (kind === 'olive' ? 1.4 : 1), col: kind === 'plane' ? [170, 160, 130] : kind === 'olive' ? [120, 110, 100] : bark, a: 0.9 });
      if (kind === 'plane') for (let t = 0.1; t < 0.9; t += 0.15) { const p = trunk[Math.round(t * 10)]; C.fillStyle = rgba([120, 130, 100], 0.6); C.beginPath(); C.ellipse(p[0] + RR.gauss() * 2, p[1], 3, 5, 0, 0, TAU); C.fill(); }
      for (const m of masses) { const e = [lerp(top[0], m[0], 0.8), lerp(top[1], m[1], 0.8)], mid = [lerp(top[0], e[0], 0.5) + RR.gauss() * 8, lerp(top[1], e[1], 0.5) + 8]; brush([P([top[0], top[1], z]), P([mid[0], mid[1], z]), P([e[0], e[1], z])], { w: tw * 0.35 * K() * 0.55, col: bark, a: 0.85 }); }
    }
    masses.sort((a, b) => a[1] - b[1]);
    for (const m of masses) {
      const p = P([m[0], m[1], z]);
      foliage(p[0], p[1], 52 * m[2] * K(), 40 * m[2] * K(), { leaf: 8, berries: kind === 'blossom' ? 0 : 0.02, bright: (m[1] - cc[1]) / cry * 0.15, pal, dens: kind === 'blossom' ? 0.6 : kind === 'persimmon' ? 0.65 : 1, shape: kind === 'ginkgo' ? 'round' : kind === 'olive' || kind === 'neem' ? 'lance' : 'leaf', flowers: kind === 'blossom' ? { cols: BLOOM.sakura, dens: 0.9, size: 0.95 } : fruit ? { cols: fruit, dens: 0.07, size: 1.25 } : null });
    }
  });
}

// ---------------------------------------------------------------- shrubs
function shrub(S, kind, x, z, big, R, pal) {
  S.debug.plants.push({ kind, x, z, h: 90 * big, r: 55 * big });
  S.bounds.push([x - 55 * big, 0, z], [x + 55 * big, 90 * big, z]); // so the page is centred on what is actually drawn
  S.add(180 + z, () => {
    if (!FLAGS.plants) return;
    if (kind === 'bamboo') {
      const n = RR.int(5, 9), H = RR.range(220, 340) * big;
      for (let i = 0; i < n; i++) {
        const bx = x + RR.gauss() * 25, h = H * RR.range(0.7, 1), lean = RR.gauss() * 0.08, pts = [];
        for (let t = 0; t <= 1.001; t += 0.1) pts.push(P([bx + lean * h * t * t, h * t, z]));
        brush(pts, { w: 2.6 * K(), col: RR.pick([[110, 140, 80], [90, 120, 70], [140, 160, 90]]), a: 0.9 });
        for (let t = 0.15; t < 1; t += 0.12) { const p = pts[Math.round(t * 10)]; C.strokeStyle = rgba(COL.ink, 0.5); C.lineWidth = 0.6; C.beginPath(); C.moveTo(p[0] - 2.5, p[1]); C.lineTo(p[0] + 2.5, p[1]); C.stroke(); }
        const tp = pts[pts.length - 1]; foliage(tp[0], tp[1] + 30 * K(), 35 * K(), 50 * K(), { leaf: 6.5, shape: 'lance', under: 0.25, dens: 0.6, angle: Math.PI * 0.55, angleJit: 0.6 });
      }
      return;
    }
    if (kind === 'hollyhock') { // tall spires of flowers along the wall (stokrozen)
      const n = RR.int(3, 6), cols = RR.pick(BLOOM.hollyhock);
      for (let i = 0; i < n; i++) {
        const bx = x + RR.gauss() * 35, h = RR.range(150, 230) * big, pts = [];
        for (let t = 0; t <= 1.001; t += 0.1) pts.push(P([bx + Math.sin(t * 3) * 4, h * t, z]));
        brush(pts, { w: 1.8 * K(), col: LEAF.green[1], a: 0.9 });
        for (let t = 0.1; t < 0.5; t += 0.1) { const p = pts[Math.round(t * 10)]; drawLeaf(p[0], p[1], 9 * K(), RR.pick([-0.6, Math.PI + 0.6]), jit(LEAF.green[RR.int(0, 2)], 8), 0.9, 'heart'); }
        for (let t = 0.35; t < 0.98; t += 0.06) { const p = pts[Math.round(t * 10)]; const r = (1 - t) * 7 * K() + 2; C.fillStyle = rgba(jit(RR.pick(cols), 10), 0.9); C.beginPath(); C.arc(p[0] + RR.gauss() * 3, p[1], r, 0, TAU); C.fill(); C.fillStyle = rgba([240, 220, 120], 0.8); C.beginPath(); C.arc(p[0], p[1], r * 0.25, 0, TAU); C.fill(); }
      }
      return;
    }
    if (kind === 'agave') {
      const base = P([x, 0, z]);
      for (let k = 0; k < 16; k++) { const a = -Math.PI / 2 + (k / 15 - 0.5) * 2.6, l = RR.range(45, 80) * big * K(); const e = [base[0] + Math.cos(a) * l, base[1] + Math.sin(a) * l * 0.9]; brush([base, [lerp(base[0], e[0], 0.5) + RR.gauss(), lerp(base[1], e[1], 0.5)], e], { w: RR.range(4, 7) * K(), col: RR.pick(LEAF.silver.slice(0, 3)), a: 0.9 }); }
      return;
    }
    if (kind === 'boxwood') { // clipped: tight, round, little noise
      const p = P([x, 45 * big, z]); foliage(p[0], p[1], 55 * big * K(), 45 * big * K(), { leaf: 5, shape: 'round', ragged: 0.25, dens: 1.5, under: 0.7 });
      return;
    }
    const n = RR.int(2, 4);
    for (let i = 0; i < n; i++) {
      const p = P([x + RR.gauss() * 40 * big, RR.range(15, 60) * big, z]);
      const rx = RR.range(45, 75) * big * K(), ry = RR.range(35, 60) * big * K();
      if (kind === 'hydrangea') {
        foliage(p[0], p[1], rx, ry, { leaf: 9, shape: 'heart', berries: 0 });
        const cols = RR.pick(BLOOM.hydrangea);
        for (let k = 0; k < RR.int(3, 6); k++) { const q = [p[0] + RR.gauss() * rx * 0.5, p[1] - ry * RR.range(0, 0.6)]; foliage(q[0], q[1], 12 * K(), 10 * K(), { leaf: 3.5, shape: 'round', pal: [darken(cols[2], 0.2), cols[2], cols[0], cols[1]], under: 0, dens: 1.4 }); }
      } else if (kind === 'azalea' || kind === 'rose') foliage(p[0], p[1], rx, ry, { leaf: 6, flowers: { cols: kind === 'azalea' ? BLOOM.azalea : BLOOM.rose, dens: kind === 'azalea' ? 0.55 : 0.25, size: 0.95 }, berries: 0 });
      else if (kind === 'bougainvillea') foliage(p[0], p[1], rx, ry, { leaf: 7, flowers: { cols: BLOOM.bougainvillea, dens: 0.45, size: 0.9 }, berries: 0 });
      else foliage(p[0], p[1], rx, ry, { leaf: 7.5, berries: 0.015 });
    }
  });
}

// ---------------------------------------------------------------- climbers
function hangingVine(S, ln, R) {
  const t = R.range(0.05, 0.6), span = R.range(0.2, 0.45);
  S.add(Math.max(ln[0][2], ln[1][2]) + 2, () => {
    const a = ln[0], b = ln[1], n = Math.max(2, Math.round(span * 6));
    for (let i = 0; i < n; i++) {
      const u = t + span * i / n, p = P([lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)]);
      foliage(p[0], p[1] - 6, RR.range(25, 45) * K(), RR.range(14, 24) * K(), { leaf: 6.5, bright: 0.05 });
      if (RR.chance(0.5) && FLAGS.plants) { let q = [p[0], p[1]]; const len = RR.range(30, 110) * K(); for (let s = 0; s < len; s += 7) { q = [q[0] + Math.sin(s * 0.08) * 1.5, q[1] + 7]; drawLeaf(q[0] + RR.gauss() * 3, q[1], 5.5, RR.f() * TAU, jit(RR.pick([COL.fMid, COL.fLight, COL.fDark]), 8), 0.9); } }
    }
  });
}
// ivy grows up from the soil at a corner: dense low, thinning and narrowing upward
function wallClimber(S, g, side, kind, R, Htot) {
  const x0 = side < 0 ? g.x0 : g.x1, w = R.range(70, 140), h = R.range(180, Math.min(Htot * 0.75, 520)), z = Math.max(...S.vols.map(v => v.z)) + 3;
  S.add(z, () => {
    const n = Math.round(h / 32);
    for (let i = 0; i < n; i++) {
      const t = i / n, ww = w * (1 - t * 0.6), cx = x0 - side * (ww / 2) + RR.gauss() * 8, y = t * h + 20;
      const vz = (S.vols.find(v => y >= v.y0 && y <= v.y1) || g).z + 2;
      const p = P([cx, y, vz]); foliage(p[0], p[1], ww / 2 * K(), 22 * K(), { leaf: 6.5, shape: 'heart', pal: LEAF.ivy, under: 0.4, dens: 1 - t * 0.4 });
    }
    // stems wander up
    for (let k = 0; k < 3; k++) { const pts = []; let xx = x0 - side * RR.range(5, w * 0.6); for (let y = 0; y < h; y += 20) { xx += RR.gauss() * 6; const vz = (S.vols.find(v => y >= v.y0 && y <= v.y1) || g).z + 1; pts.push(P([xx, y, vz])); } inkLine(pts, { w: 0.5, a: 0.5, os: 0 }); }
  });
}
// a flowering climber trained around the door
function doorClimber(S, kind, R, g) {
  const db = S.gf && S.gf.bays[S.gf.doorAt]; if (!db) return;
  const z = S.gf.z + 3, top = S.gf.openTop, cols = kind === 'rose' ? BLOOM.rose : kind === 'jasmine' ? BLOOM.jasmine : kind === 'grape' ? [[110, 60, 120], [90, 50, 100]] : BLOOM.bougainvillea;
  S.add(z + 1, () => {
    const lid = S.st.groundSign === 'fascia' || S.st.groundSign === 'frieze' ? 0.45 : 1; // keep the shop sign readable
    const pts = [[db.x0 - 20, 20], [db.x0 - 26, top * 0.5], [db.x0 - 10, top + 20 * lid], [(db.x0 + db.x1) / 2, top + 40 * lid], [db.x1 + 10, top + 25 * lid], [db.x1 + 22, top * 0.6]];
    const n = R.chance(0.5) ? pts.length : 4;
    for (let i = 0; i < n; i++) { const p = P([pts[i][0], pts[i][1], z]); foliage(p[0], p[1], RR.range(22, 38) * K(), RR.range(18, 30) * K(), { leaf: kind === 'grape' ? 8 : 6, shape: kind === 'grape' ? 'heart' : 'leaf', flowers: { cols, dens: kind === 'jasmine' ? 0.5 : kind === 'grape' ? 0.12 : 0.4, size: kind === 'jasmine' ? 0.6 : kind === 'grape' ? 1.2 : 0.85 }, berries: 0, under: 0.35 }); }
  });
}
function grassTuft(x, y, z, s) {
  const p = P([x, y, z]);
  for (let k = 0; k < 7; k++) { const a = -Math.PI / 2 + RR.gauss() * 0.5, l = RR.range(6, 14) * s * K(); brush([p, [p[0] + Math.cos(a) * l * 0.5, p[1] + Math.sin(a) * l * 0.5], [p[0] + Math.cos(a) * l, p[1] + Math.sin(a) * l]], { w: 1.2, col: jit(RR.pick(LEAF.green.slice(1, 4)), 8), a: 0.9 }); }
}

// ---------------------------------------------------------------- pots & window boxes (drawn at render time)
// pot kinds: terracotta, glazed, styro (Japanese foam box), zinc, barrel
function potPlant(x, y0, z, plant, potKind, pal, scale = 1) {
  const pw = (potKind === 'styro' ? 46 : potKind === 'barrel' ? 52 : potKind === 'basin' ? 56 : 30) * scale, ph = (potKind === 'styro' ? 22 : potKind === 'barrel' ? 38 : potKind === 'basin' ? 22 : potKind === 'tin' ? 32 : 28) * scale;
  const col = { terracotta: [196, 120, 90], glazed: RR.pick([[70, 110, 140], [60, 110, 100], [150, 70, 60], [200, 190, 150]]), styro: [246, 246, 244], zinc: [170, 176, 180], barrel: [150, 104, 70], basin: RR.pick([[200, 50, 44], [60, 90, 160]]), tin: [196, 196, 186] }[potKind] || [196, 120, 90];
  const pts = potKind === 'glazed' ? [[x + 4, y0], [x + pw - 4, y0], [x + pw + 3, y0 + ph * 0.6], [x + pw - 2, y0 + ph], [x + 2, y0 + ph], [x - 3, y0 + ph * 0.6]]
    : potKind === 'styro' || potKind === 'zinc' || potKind === 'barrel' || potKind === 'tin' ? [[x, y0], [x + pw, y0], [x + pw, y0 + ph], [x, y0 + ph]]
      : potKind === 'basin' ? [[x + 8, y0], [x + pw - 8, y0], [x + pw + 2, y0 + ph], [x - 2, y0 + ph]]
      : [[x + 3, y0], [x + pw - 3, y0], [x + pw + 2, y0 + ph], [x - 2, y0 + ph]];
  castShadow(pts.map(q => [q[0], q[1], z]).concat(pts.map(q => [q[0], q[1] + (plant === 'tall' || plant === 'lemon' ? 70 : 25) * scale, z])), { a: 0.3 });
  const p = W2(pts, z); paper([p]); wash(p, col, { a: potKind === 'styro' ? 0.12 : 0.6 });
  const half = [P([x + pw * (SUN.left ? 0.6 : 0), y0, z]), P([x + pw * (SUN.left ? 1 : 0.4), y0, z]), P([x + pw * (SUN.left ? 1 : 0.4), y0 + ph, z]), P([x + pw * (SUN.left ? 0.6 : 0), y0 + ph, z])];
  wash(half, COL.shadow, { a: 0.3, rim: 0 });
  inkPoly(p, { w: D_INK });
  if (potKind === 'terracotta') { const rim = quad(x - 3, y0 + ph - 6, x + pw + 3, y0 + ph, z + 1); paper([rim]); wash(rim, col, { a: 0.65 }); inkPoly(rim, { w: 0.7 }); }
  if (potKind === 'barrel') for (const yy of [y0 + ph * 0.25, y0 + ph * 0.75]) L3([x, yy, z], [x + pw, yy, z], { w: 1.1 });
  if (potKind === 'tin') { const lq = quad(x + 4, y0 + ph * 0.3, x + pw - 4, y0 + ph * 0.75, z + 0.5); wash(lq, RR.pick([[60, 120, 70], [200, 160, 50], [180, 50, 40]]), { a: 0.6, rim: 0 }); }
  if (potKind === 'styro') { L3([x + 4, y0 + ph * 0.5, z], [x + pw * 0.5, y0 + ph * 0.5, z], { w: 0.4, a: 0.5 }); }
  const top = P([x + pw / 2, y0 + ph, z]);
  if (!FLAGS.plants) return;
  const s = scale * K();
  if (plant === 'spiky') { for (let k = 0; k < 14; k++) { const a = -Math.PI / 2 + RR.gauss() * 0.7, l = RR.range(18, 38) * s; const e = [top[0] + Math.cos(a) * l, top[1] + Math.sin(a) * l]; brush([top, [top[0] + Math.cos(a) * l * 0.5 + RR.gauss() * 2, top[1] + Math.sin(a) * l * 0.5], e], { w: RR.range(2, 3.5), col: RR.pick([COL.fDark, COL.fMid, COL.fLight]), a: 0.9 }); } }
  else if (plant === 'tall' || plant === 'lemon') { L3([x + pw / 2, y0 + ph, z], [x + pw / 2 + RR.gauss() * 3, y0 + ph + 55 * scale, z], { w: 1 }); foliage(top[0], top[1] - 60 * s, 20 * s, 24 * s, { leaf: 6, flowers: plant === 'lemon' ? { cols: [[240, 210, 70], [250, 226, 100]], dens: 0.12, size: 1.1 } : null, berries: 0 }); }
  else if (plant === 'boxball') { foliage(top[0], top[1] - 18 * s, 19 * s, 17 * s, { leaf: 4.5, shape: 'round', ragged: 0.2, dens: 1.5, under: 0.7 }); }
  else if (plant === 'geranium') foliage(top[0], top[1] - 9 * s, 20 * s, 12 * s, { leaf: 6, shape: 'heart', flowers: { cols: RR.chance(0.7) ? BLOOM.geranium : BLOOM.geraniumPink, dens: 0.35, size: 0.9 }, berries: 0, under: 0.3 });
  else if (plant === 'bonsai') { brush([top, [top[0] + 8 * s, top[1] - 12 * s], [top[0] - 4 * s, top[1] - 24 * s]], { w: 2.5, col: [84, 70, 64] }); foliage(top[0] + 6 * s, top[1] - 20 * s, 18 * s, 7 * s, { leaf: 4.5, shape: 'needle', pal: LEAF.pine, dens: 1.6, under: 0.5 }); foliage(top[0] - 6 * s, top[1] - 28 * s, 13 * s, 5 * s, { leaf: 4.5, shape: 'needle', pal: LEAF.pine, dens: 1.6, under: 0.5 }); }
  else foliage(top[0], top[1] - 10 * s, RR.range(18, 26) * s, RR.range(12, 18) * s, { leaf: 6 });
}
function windowBox(x, y, w, z, kind, pal) {
  const b = { x0: x, x1: x + w, y0: y - 22, y1: y - 2, z0: z, z1: z + 20 };
  const col = RR.pick([[190, 116, 86], [120, 90, 66], [70, 90, 80], [170, 176, 180]]);
  shadowBox(b, { a: 0.3 });
  drawBox(b, { col, a: 0.6, w: D_INK });
  if (!FLAGS.plants) return;
  const n = Math.max(2, Math.round(w / 30));
  for (let i = 0; i < n; i++) {
    const p = P([x + w * (i + 0.5) / n, y, z + 12]);
    if (kind === 'geranium') foliage(p[0], p[1] - 4, 17 * K(), 11 * K(), { leaf: 5.5, shape: 'heart', flowers: { cols: RR.chance(0.75) ? BLOOM.geranium : BLOOM.geraniumPink, dens: 0.4, size: 0.85 }, berries: 0, under: 0.3 });
    else if (kind === 'herbs') foliage(p[0], p[1] - 6, 12 * K(), 12 * K(), { leaf: 5, shape: 'lance', angle: -Math.PI / 2, angleJit: 0.6, under: 0.2 });
    else foliage(p[0], p[1] - 2, 16 * K(), 9 * K(), { leaf: 5.5, under: 0.3 });
  }
  if (kind === 'trailing' || kind === 'geranium') for (let k = 0; k < Math.round(w / 25); k++) { let q = P([x + RR.range(4, w - 4), y - 18, z + 20]); const len = RR.range(20, 60) * K(); for (let s = 0; s < len; s += 6) { q = [q[0] + Math.sin(s * 0.1) * 1.2, q[1] + 6]; drawLeaf(q[0] + RR.gauss() * 2, q[1], 4.5, RR.f() * TAU, jit(RR.pick(LEAF.green.slice(0, 3)), 8), 0.9); } }
}
