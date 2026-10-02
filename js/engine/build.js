// ============================================================================
//  BASTI — building grammar + architecture painters (part 1)
//  generate(seed, lock) -> scene { items: [{order, fn}], recv, bounds, view, desc }
//  Every decision is made here in world units (cm), constrained by the style's
//  rulebook (engine_styles.js). Painters run later, back to front.
// ============================================================================
let SC = null; // scene being rendered (for shadows)
const W_INK = 1.55, D_INK = 1.05, T_INK = 0.7;

// ---------------------------------------------------------------- shadows
// Project a caster's hull along the sun onto every facade plane behind it.
function castShadow(pts3, o = {}) {
  const recv = o.recv || SC.recv, L = SUN.L;
  const zmin = Math.min(...pts3.map(p => p[2]));
  for (const r of recv) {
    if (r.z > zmin + 0.5) continue;
    const pr = pts3.map(p => { const d = p[2] - r.z; return [p[0] - d * L[0] / L[2], p[1] - d * L[1] / L[2]]; });
    const h = clipRect(hull(pr), r.x0, r.y0, r.x1, r.y1);
    if (h.length < 3) continue;
    STATS.shadow++;
    if (SC.debug.rays.length < 14) { // keep one real light ray per caster for the construction sheet
      let bi = 0; pts3.forEach((p, i) => { if (p[2] - r.z > pts3[bi][2] - r.z || (p[2] === pts3[bi][2] && p[1] > pts3[bi][1])) bi = i; });
      const q = pr[bi];
      if (pts3[bi][2] - r.z > 5 && q[0] >= r.x0 && q[0] <= r.x1 && q[1] >= r.y0 && q[1] <= r.y1) SC.debug.rays.push({ from: pts3[bi].slice(), to: [q[0], q[1], r.z] });
    }
    wash(h.map(q => P([q[0], q[1], r.z])), o.col || COL.shadow, { a: (o.a ?? 0.42) * 1.2, amp: 1.1, blot: 0, rim: 0.12, g0: 1.05, g1: 0.75, inset: 0.3, off: 0.6 });
  }
}
const shadowBox = (b, o) => castShadow(boxCorners(b), o);

function drawBox(b, o = {}) {
  const f = boxFaces(b), faces = Object.values(f);
  if (o.paper !== false) paper(faces.map(fc => fc.spoly()));
  for (const fc of faces) {
    const poly = fc.spoly();
    wash(poly, o.col || [220, 216, 206], { a: o.a ?? 0.5, amp: o.amp ?? 1, blot: o.blot ?? 0, rim: o.rim });
    const sh = shadeOf(fc.n);
    if (sh > 0.05 && fc.key !== 'front') wash(poly, fc.key === 'bottom' ? COL.shadowDeep : COL.shadow, { a: (o.shadeA ?? 0.5) * sh, amp: 0.8, rim: 0 });
  }
  if (o.front) o.front(f.front, f);
  if (o.ink !== false) for (const fc of faces) inkPoly(fc.spoly(), { w: o.w ?? D_INK, a: o.inkA ?? 0.85 });
  return f;
}
// a flat polygon in a facade plane (world xy at depth z)
const W2 = (pts, z) => pts.map(q => P([q[0], q[1], z]));
// opening outline: flat, segmental or round-arched head
function openingPoly(x0, y0, x1, y1, top) {
  const w = x1 - x0, pts = [[x0, y0], [x1, y0]];
  if (top === 'arch' || top === 'fanlight') {
    const r = w / 2, sy = Math.max(y0 + 10, y1 - r);
    pts.push([x1, sy]);
    for (let i = 1; i < 16; i++) { const a = i / 16 * Math.PI; pts.push([x0 + r + Math.cos(a) * r, sy + Math.sin(a) * (y1 - sy)]); }
    pts.push([x0, sy]);
  } else if (top === 'pointed' || top === 'persian') { // two-centred pointed arch; Persian: wider, lower crown
    const { r, th, ys, rise } = archGeo(w, top, y1 - y0), sy = y1 - rise;
    pts.push([x1, sy]);
    for (let i = 1; i <= 9; i++) { const ang = i / 9 * th; pts.push([x1 - r + r * Math.cos(ang), sy + r * Math.sin(ang) * ys]); }
    for (let i = 8; i >= 1; i--) { const ang = i / 9 * th; pts.push([x0 + r - r * Math.cos(ang), sy + r * Math.sin(ang) * ys]); }
    pts.push([x0, sy]);
  } else if (top === 'cusped') { // Mughal multifoil: a pointed arch scalloped into lobes, cusps pointing in
    const { r, th, ys, rise } = archGeo(w, top, y1 - y0), sy = y1 - rise, cx = (x0 + x1) / 2, arc = [];
    for (let i = 0; i <= 24; i++) { const ang = i / 24 * th; arc.push([x1 - r + r * Math.cos(ang), sy + r * Math.sin(ang) * ys]); }
    const curve = arc.concat(arc.slice(0, 24).reverse().map(q => [2 * cx - q[0], q[1]])), n = curve.length - 1, lobes = 7, d = Math.min(w * 0.055, 9);
    pts.push([x1, sy]);
    for (let i = 1; i < n; i++) {
      const t = i / n, a = curve[i - 1], b = curve[i + 1], tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty) || 1;
      const off = d * (1 - Math.abs(Math.cos(Math.PI * lobes * t))); // lobe middles on the arch line, cusps pushed inwards
      pts.push([curve[i][0] - ty / l * off, curve[i][1] + tx / l * off]);
    }
    pts.push([x0, sy]);
  } else if (top === 'segment') {
    const rise = Math.min(w * 0.13, (y1 - y0) * 0.2), sy = y1 - rise;
    pts.push([x1, sy]);
    for (let i = 1; i < 12; i++) { const t = i / 12; pts.push([lerp(x1, x0, t), sy + Math.sin(t * Math.PI) * rise]); }
    pts.push([x0, sy]);
  } else pts.push([x1, y1], [x0, y1]);
  return pts;
}
function archGeo(w, top, h) { const r = w * (top === 'pointed' ? 0.8 : top === 'cusped' ? 0.7 : 0.62), th = Math.acos((r - w / 2) / r), rise0 = r * Math.sin(th), rise = Math.min(rise0 * (top === 'persian' ? 0.8 : 1), h * 0.6); return { r, th, ys: rise / rise0, rise }; }
function springY(x0, x1, y1, top, y0 = -1e9) { const w = x1 - x0; return top === 'arch' || top === 'fanlight' ? y1 - w / 2 : top === 'segment' ? y1 - Math.min(w * 0.13, 40) : top === 'pointed' || top === 'persian' || top === 'cusped' ? y1 - archGeo(w, top, y1 - y0).rise : y1; }

// ---------------------------------------------------------------- palette
const ACCS = { red: [206, 94, 82], teal: [72, 140, 142], mustard: [224, 176, 82], green: [110, 158, 102], pink: [226, 150, 148], blue: [94, 130, 172], orange: [228, 142, 72] };
function makePalette(R, st) {
  const ak = Object.keys(ACCS), a0 = R.pick(ak); let a1 = R.pick(ak); if (a1 === a0) a1 = R.pick(ak);
  const w0 = jit(R.pick(st.walls), 4, R);
  const w1 = st.massing === 'stepped' && R.chance(0.4) ? jit(R.pick(st.walls), 4, R) : w0;
  return {
    wall0: w0, wall1: w1, acc: ACCS[a0], acc2: ACCS[a1],
    wood: jit([176, 128, 88], 8, R), woodDark: [120, 84, 62], glass: [160, 186, 202], interior: [98, 84, 80],
    roof: R.pick(st.roofCols), frame: R.pick(st.win.frame), metal: [186, 190, 196], iron: [52, 52, 58],
    timber: st.timber ? R.pick(st.timber) : [96, 64, 48], shutter: st.shutterCols ? R.pick(st.shutterCols) : R.pick([[86, 124, 94], [70, 96, 120], [128, 92, 62]]),
    fascia: st.fascia ? R.pick(st.fascia) : ACCS[a0], door: R.pick([[60, 86, 70], [120, 44, 48], [44, 52, 80], [140, 100, 66], [50, 50, 54]]),
    trim: [244, 240, 230], stone: jit([222, 206, 182], 6, R), gold: [196, 158, 70], brick: [190, 110, 88],
  };
}

// ---------------------------------------------------------------- the decision log
// These mirror Rand.wpick / pick / chance / range draw-for-draw, so logging a
// decision never changes the drawing. Each entry keeps the options, their
// probabilities, the roll in [0,1) and the result.
function logPick(S, R, stage, list, why) {
  const r = R.f(); let t = 0; for (const [, w] of list) t += w;
  let x = r * t, ch = list[list.length - 1][0];
  for (const [v, w] of list) { if ((x -= w) <= 0) { ch = v; break; } }
  S.log.push({ stage, kind: 'pick', options: list.map(([v, w]) => [String(v), w / t]), roll: r, choice: String(ch), why }); return ch;
}
function logUniform(S, R, stage, arr, why) { const r = R.f(), ch = arr[Math.floor(r * arr.length)]; S.log.push({ stage, kind: 'pick', options: arr.map(v => [String(v), 1 / arr.length]), roll: r, choice: String(ch), why }); return ch; }
function logChance(S, R, stage, p, yes, no, why) { const r = R.f(), ch = r < p ? yes : no; S.log.push({ stage, kind: 'pick', options: [[yes, p], [no, 1 - p]], roll: r, choice: ch, why }); return ch; }
function logRange(S, R, stage, a, b, unit, why) { const r = R.f(), v = a + (b - a) * r; S.log.push({ stage, kind: 'range', a, b, roll: r, value: v, unit, why }); return v; }
function logFixed(S, stage, choice, why) { S.log.push({ stage, kind: 'fixed', choice: String(choice), why }); return choice; }

// ---------------------------------------------------------------- the grammar
function generate(seed, lock = {}) {
  const R = new Rand(hash('basti', seed));
  const S = { seed, items: [], recv: [], bounds: [], stains: [], log: [], debug: { vols: [], bays: [], rays: [], slots: [], props: [], opens: [], plants: [] } };
  let seq = 0;
  S.add = (order, fn) => S.items.push(TRACE ? { order, fn, id: seq++, tag: callerName() } : { order, fn, id: seq++ });
  const bound = (...pts) => S.bounds.push(...pts);

  // 1 LOCALE — culture, climate, script, materials. Everything else answers to it.
  const lockUse = lock.use || (lock.shop ? 'shop' : null);
  const fits = k => (!lock.shop || hasTrade(k, lock.shop)) && (!lock.type || typeUse(k, lock.type)) && (lock.floors == null || floorsFor(k, lockUse, lock.type).includes(lock.floors));
  const cands = STYLE_KEYS.filter(fits);
  const styleKey = lock.style ? logFixed(S, 'Locale', lock.style, 'locked') : cands.length && cands.length < STYLE_KEYS.length ? logUniform(S, R, 'Locale', cands, 'locales whose rules allow the locks') : logUniform(S, R, 'Locale', STYLE_KEYS, 'every locale equally likely');
  // 2 USE — does the street floor serve customers, or is it someone's home?
  const H = HOUSES[styleKey];
  const okUse = u => lock.floors == null || floorsFor(styleKey, u).includes(lock.floors);
  const tUse = lock.type ? typeUse(styleKey, lock.type) : null;
  const use = lock.use ? logFixed(S, 'Use', lock.use, 'locked') : lock.shop ? logFixed(S, 'Use', 'shop', 'a trade was locked') : tUse ? logFixed(S, 'Use', tUse, 'a building type was locked')
    : okUse('house') && !okUse('shop') ? logFixed(S, 'Use', 'house', 'only homes come in this many floors here') : okUse('shop') && !okUse('house') ? logFixed(S, 'Use', 'shop', 'only shops come in this many floors here')
    : logChance(S, R, 'Use', H.p, 'house', 'shop', 'share of homes in this locale');
  // 3 TYPOLOGY — the building type within that locale and use
  const TT = use === 'house' ? H.types : SHOPS[styleKey].types, stage = use === 'house' ? 'House type' : 'Shop type';
  const typeList = Object.entries(TT).filter(([k]) => lock.floors == null || floorsFor(styleKey, use, k).includes(lock.floors));
  const typeKey = lock.type && TT[lock.type] ? logFixed(S, stage, lock.type, 'locked')
    : logPick(S, R, stage, (typeList.length ? typeList : Object.entries(TT)).map(([k, t]) => [k, t.w]), typeList.length < Object.keys(TT).length ? 'types that come in this many floors' : 'building types of this locale, by period');
  const st = resolveRulebook(styleKey, use, typeKey);
  // 4 TRADE — only shops have one; it chooses the shopfront and the street furniture
  const cls = use === 'shop' ? (lock.shop ? logFixed(S, 'Trade', lock.shop, 'locked') : logPick(S, R, 'Trade', st.shops, 'how common each trade is here')) : null;
  // 5 LANGUAGE — sign or nameplate in the locale's script
  S.T = makeTexts(styleKey, cls, R.fork('txt'), use);
  const pal = makePalette(R.fork('pal'), st);
  Object.assign(S, { st, styleKey, use, typeKey, cls, pal, label: S.T.sign });
  // AGE AND CONDITION — how weathered the walls are, and whether modern services were added later
  S.cond = logRange(S, R, 'Condition', 0, st.weathering ?? 0.45, '', 'stains, cracks and lost plaster: 0 is fresh paint');
  S.retrofit = st.retrofit == null ? true : logChance(S, R, 'Modern additions', st.retrofit, 'yes', 'no', 'tanks, dishes, AC units and solar added since it was built') === 'yes';

  // 6 MASSING — volumes from the type's rules
  const W = Math.round(logRange(S, R, 'Frontage width', ...st.width, 'cm', 'plot width range for the type')), H0 = Math.round(logRange(S, R, 'Street-floor height', ...st.h0, 'cm', 'storey height range'));
  const nUp = lock.floors != null ? logFixed(S, 'Upper floors', lock.floors, 'locked') : logPick(S, R, 'Upper floors', st.ups, 'storeys above the street floor');
  let groundKind = typeof st.ground === 'string' ? logFixed(S, 'Street floor', st.ground, 'fixed by the rulebook') : logPick(S, R, 'Street floor', st.ground, 'arcade or plain frontage');
  if (nUp === 0 && groundKind === 'arcade') groundKind = logFixed(S, 'Street floor', use === 'house' ? 'house' : 'bays', 'an arcade needs a floor above it to carry');
  const arcade = groundKind === 'arcade';
  S.groundKind = groundKind;
  const arcD = arcade ? Math.round(R.range(150, 190)) : 0;
  const gmat = R.wpick(st.matGround);
  const matCol = (t, base) => t === 'nanakshahi' ? jit([182, 104, 78], 6, R) : t === 'cladding' ? jit([214, 200, 180], 6, R) : t === 'azulejo' ? jit(R.pick(st.tileCols || [[224, 232, 242]]), 4, R) : base;
  const vols = [{ x0: -W / 2, x1: W / 2, y0: 0, y1: H0, z: -arcD, role: 'ground', floor: 0, mat: { type: gmat, col: gmat === 'stone' ? pal.stone : matCol(gmat, pal.wall0) } }];
  let y = H0, prev = { ...vols[0], z: 0 }, upMat = null;
  const jetty = st.massing === 'jetty' ? Math.round(logRange(S, R, 'Jetty', ...(st.jettyRange || [18, 28]), 'cm', 'how far each timber floor oversails the one below')) : 0;
  const setback = st.massing === 'courtyard' ? -Math.round(R.range(240, 320)) : 0; // house behind its compound wall
  for (let i = 0; i < nUp; i++) {
    const pw = prev.x1 - prev.x0;
    let x0 = prev.x0, w = pw, z = prev.z;
    if (st.massing === 'stepped') {
      const shrink = R.wpick([[1, 0.5], [0.82, 0.28], [0.66, 0.22]]);
      w = Math.min(pw, Math.max(210, pw * shrink));
      const al = R.pick(['l', 'c', 'r']);
      x0 = al === 'l' ? prev.x0 : al === 'r' ? prev.x1 - w : (prev.x0 + prev.x1) / 2 - w / 2;
      if (i === 0 && shrink === 1 && R.chance(0.3)) z = Math.round(R.range(22, 40));
      else if (i > 0 && R.chance(0.2)) z = prev.z - 15;
    } else if (st.massing === 'jetty') z = (i + 1) * jetty;
    else if (st.massing === 'courtyard') { w = pw * R.range(0.75, 0.95); x0 = prev.x0 + (pw - w) * R.f(); z = setback; }
    const h = Math.round(st.hfList ? R.range(...st.hfList[Math.min(i, st.hfList.length - 1)]) : R.range(...st.hf) - (st.hfDecay || 0) * i); // Paris: the étage noble is tallest, then each floor lower
    // one facade finish for the whole front where the style builds that way (no floor-by-floor patchwork)
    const mt = st.uniformMat ? (upMat = upMat || (st.matUpper.some(([m]) => m === gmat) ? gmat : R.wpick(st.matUpper))) : R.wpick(st.matUpper);
    const base = st.massing === 'stepped' && R.chance(0.35) ? pal.wall1 : pal.wall0;
    const col = mt === 'wood' ? pal.wood : mt === 'brick' && base[0] > 200 ? jit([196, 128, 104], 6, R) : matCol(mt, base);
    const v = { x0: Math.round(x0), x1: Math.round(x0 + w), y0: y + (i > 0 && st.massing === 'stepped' ? 14 : 0), y1: 0, z, role: 'upper' + i, mat: { type: mt, col }, floor: i + 1 };
    v.y1 = v.y0 + h; vols.push(v); y = v.y1; prev = v;
  }
  const top = vols[vols.length - 1], Htot = top.y1;
  S.vols = vols; S.jetty = jetty; S.arcD = arcD;

  // 7 CAMERA AND SUN — arcades are drawn from the street so the ceiling shows
  VIEW.eye = arcade ? logRange(S, R, 'Eye height', 150, H0 - 40, 'cm', 'below the arcade ceiling') : logRange(S, R, 'Eye height', 0.34, 0.55, '× height', 'fraction of building height, then + 60 cm') * Htot + 60;
  if (!arcade) S.log[S.log.length - 1].shown = VIEW.eye;
  VIEW.cx = (logChance(S, R, 'Viewer side', 0.5, 'left', 'right', 'stand left or right of centre') === 'left' ? -1 : 1) * logRange(S, R, 'Viewer offset', 0.25, 0.7, '× width', 'fraction of the frontage width') * W;
  S.log[S.log.length - 1].shown = Math.abs(VIEW.cx);
  VIEW.D = logRange(S, R, 'Viewing distance', 1700, 2400, 'cm', 'across the street');
  SUN.left = lock.sunLeft != null ? logFixed(S, 'Sun side', lock.sunLeft ? 'left' : 'right', 'locked') === 'left' : logChance(S, R, 'Sun side', 0.6, 'left', 'right', 'light from the upper left reads best') === 'left';
  SUN.L = [(SUN.left ? -1 : 1) * R.range(0.45, 0.7), R.range(0.62, 0.85), R.range(0.42, 0.62)];
  const Ln = Math.hypot(...SUN.L); SUN.L = SUN.L.map(v => v / Ln);
  S.view = { cx: VIEW.cx, eye: VIEW.eye, D: VIEW.D, sun: { left: SUN.left, L: SUN.L.slice() } };
  for (const v of vols) { S.recv.push({ x0: v.x0, x1: v.x1, y0: v.y0, y1: v.y1, z: v.z }); S.debug.vols.push(v); bound([v.x0, v.y0, v.z], [v.x1, v.y1, v.z]); }

  let belt = logPick(S, R, 'Between floors', st.belt[cls] || st.belt['*'], 'eave, awning or canopy for this trade');
  if (nUp === 0 && belt === 'pent') belt = 'awning';
  S.belt = belt;
  const poleSide = logChance(S, R, 'Vertical side', 0.5, 'left', 'right', 'tall element on one side, tree on the other') === 'left' ? -1 : 1;
  const vertical = logPick(S, R, 'Tall element', st.vertical, 'pole, lamp or sign');
  S.poleSide = poleSide;

  // New Orleans: a cast-iron gallery over the sidewalk, a wrought-iron balcony, or a plain front
  if (st.gallery && nUp > 0) {
    const gk = logPick(S, R, 'Gallery', st.gallery, 'cast-iron gallery on posts, wrought-iron balcony, or neither');
    if (gk === 'gallery') S.galleryFloors = vols.slice(1, 3).map(v => v.floor);
    else if (gk === 'balcony') S.contBalFloors = [1];
  }
  // 8 WALLS AND ORNAMENT
  for (let i = 0; i < vols.length; i++) wallVolume(S, vols[i], i ? (i === 1 ? { ...vols[0], z: 0 } : vols[i - 1]) : null, R.fork('wall' + i), pal, i === 1 && arcade ? arcD : 320);
  ornament(S, vols, R.fork('orn'), pal, st);
  // 9 STREET FLOOR — shopfront kinds for shops, frontage kits for homes
  if (groundKind === 'arcade') arcadeGround(S, vols[0], R.fork('gf'), pal, st, cls);
  else if (groundKind === 'devanture') devanture(S, vols[0], R.fork('gf'), pal, st, cls);
  else if (groundKind === 'compound') compoundGround(S, vols[0], R.fork('gf'), pal, st);
  else if (groundKind === 'house') houseGround(S, vols[0], R.fork('gf'), pal, st);
  else groundFloor(S, vols[0], R.fork('gf'), pal, st, cls, nUp);
  // 10 UPPER FLOORS, PROTRUSIONS, ROOF
  if (st.extStair && vols.length > 1 && R.chance(st.extStair)) extStair(S, vols, R.fork('stair'), pal);
  for (let i = 1; i < vols.length; i++) upperFloor(S, vols[i], R.fork('uf' + i), pal, st, belt, i === vols.length - 1);
  if (belt !== 'none') beltEl(S, vols, R.fork('belt'), pal, belt, st);
  if (S.galleryFloors) ironGallery(S, vols, R.fork('gallery'), pal, S.galleryFloors);
  roof(S, top, R.fork('roof'), pal, st);
  utilities(S, vols, R.fork('util'), pal, st);
  // 11 BOUNDARY, STREET AND GARDEN
  if (st.boundary) frontBoundary(S, vols[0], R.fork('bnd'), pal, logPick(S, R, 'Front boundary', st.boundary, 'wall, hedge, fence or railing'));
  if (vertical !== 'none') streetVertical(S, vols, R.fork('vert'), pal, vertical, poleSide, Htot);
  streetProps(S, vols[0], R.fork('props'), pal, st, cls);
  // 12 PLANTING AND PAPER
  planting(S, vols, R.fork('flora'), pal, st, -poleSide, Htot);
  groundAndFlecks(S, vols, R.fork('ground'), W, st);
  S.desc = { style: styleKey, use, type: st.typeName || null, period: st.period || null, shop: cls, floors: nUp + 1, belt, roof: S.roofType, vertical, sun: SUN.left ? 'left' : 'right', tree: S.treeKind || null, boundary: S.boundary ? S.boundary.kind : null };
  return S;
}

// ---------------------------------------------------------------- walls
function wallVolume(S, v, below, R, pal, depth) {
  const b = { x0: v.x0, x1: v.x1, y0: v.y0, y1: v.y1, z0: v.z - depth, z1: v.z };
  S.add(v.z, () => {
    // a floor that oversails the one below (jetty, cantilever) shades it
    if (below && v.z > below.z + 1) shadowBox({ x0: v.x0, x1: v.x1, y0: v.y0, y1: v.y0 + 6, z0: below.z, z1: v.z }, { a: 0.48 });
    const f = boxFaces(b);
    const faces = Object.values(f).filter(fc => !(fc.key === 'bottom' && v.y0 <= 0) && fc.key !== 'top');
    paper(faces.map(fc => fc.spoly()));
    const col = v.mat.col;
    for (const fc of faces) {
      const poly = fc.spoly();
      wash(poly, col, { a: 0.6, blot: 5, amp: 1.8, blotA: 0.22, lift: 3 });
      if (fc.key !== 'front') { const sh = shadeOf(fc.n); if (sh > 0.05) wash(poly, fc.key === 'bottom' ? COL.shadowDeep : COL.shadow, { a: 0.5 * sh + 0.08, amp: 1, rim: 0 }); else wash(poly, [200, 190, 170], { a: 0.12, rim: 0 }); }
    }
    if (f.bottom && S.arcD && v.floor === 1) for (let x = v.x0 + 30; x < v.x1; x += 45) inkLine([P([x, v.y0, v.z]), P([x, v.y0, v.z - depth])], { w: 0.5, a: 0.5 });
    wallTexture(v, R, pal, S);
    const gh = Math.min(70, (v.y1 - v.y0) * 0.3);
    wash(quad(v.x0, v.y0, v.x1, v.y0 + gh, v.z), [150, 132, 118], { a: v.mat.type === 'timber' ? 0.12 : 0.28, g0: 0, g1: 1, gang: Math.PI / 2, rim: 0 });
    for (const s of S.stains) {
      if (s.z !== v.z || s.y <= v.y0 || s.y > v.y1) continue;
      const len = RR.range(40, 120), x = RR.range(s.x0, s.x1 - 6);
      wash(quad(x, Math.max(v.y0, s.y - len), x + RR.range(8, 22), s.y, v.z), [130, 120, 110], { a: RR.range(0.18, 0.34) * (0.35 + (S.cond ?? 0.3) * 1.5), g0: 1, g1: 0, gang: -Math.PI / 2, rim: 0, amp: 2.5 });
    }
    for (const fc of faces) inkPoly(fc.spoly(), { w: W_INK });
  });
}

function texMask(R, thr) {
  const ox = R.f() * 100, oy = R.f() * 100;
  return (x, y, v) => {
    const n = NZ.fbm(x * 0.011 + ox, y * 0.011 + oy, 3) * 0.5 + 0.5;
    const edge = Math.max(0, 1 - Math.min(x - v.x0, v.x1 - x) / 60) * 0.25 + Math.max(0, 1 - (y - v.y0) / 80) * 0.15;
    return n + edge > thr;
  };
}
function brickPatch(x0, y0, x1, y1, z, m, v, bh = 8.5, bw = 23) {
  for (let y = y0 + bh, row = 0; y < y1 - 2; y += bh, row++) {
    let run = null;
    for (let x = x0; x <= x1; x += 6) {
      const on = x < x1 && m(x, y, v);
      if (on && run == null) run = x;
      if ((!on || x >= x1) && run != null) { if (x - run > 12) L3([run, y, z], [Math.min(x, x1), y, z], { w: T_INK, a: 0.55, os: 1.5, brk: 0 }); run = null; }
    }
    for (let x = x0 + (row % 2 ? bw / 2 : 0); x < x1; x += bw) {
      if (!m(x, y - bh / 2, v)) continue;
      L3([x, y - bh, z], [x, y, z], { w: T_INK, a: 0.5, os: 0.5, brk: 0 });
      if (RR.chance(0.12)) wash(quad(x, y - bh, Math.min(x1, x + bw), y, z), RR.pick([[180, 110, 90], [150, 90, 80], [220, 180, 150]]), { a: 0.35, amp: 0.6, rim: 0.1, blot: 0 });
    }
  }
}
function wallTexture(v, R, pal, S) {
  const t = v.mat.type, z = v.z;
  if (t === 'brick') brickPatch(v.x0, v.y0, v.x1, v.y1, z, texMask(RR, S.st.massing === 'terrace' ? 0.38 : 0.5), v);
  else if (t === 'stone') { // ashlar: coursed blocks, deeper joints near the ground
    const rust = S.st.ornament.includes('rustication') && v.floor <= 1;
    const m = texMask(RR, rust ? -1 : 0.45), ch = 38;
    for (let y = v.y0 + ch, row = 0; y < v.y1 - 4; y += ch, row++) {
      L3([v.x0, y, z], [v.x1, y, z], { w: rust ? D_INK : T_INK, a: rust ? 0.75 : 0.45, brk: 0.4 });
      if (rust) wash(quad(v.x0, y - 4, v.x1, y, z), COL.shadow, { a: 0.22, rim: 0, amp: 0.4, off: 0 });
      if (!rust) for (let x = v.x0 + (row % 2 ? 45 : 0) + 90; x < v.x1 - 8; x += 90) if (m(x, y, v)) L3([x, y - ch, z], [x, y, z], { w: T_INK, a: 0.45, os: 0.5, brk: 0 });
    }
  } else if (t === 'longtile') { // Taiwanese 二丁掛 facing tiles: long thin bricks in patches
    brickPatch(v.x0, v.y0, v.x1, v.y1, z, texMask(RR, 0.42), v, 6.5, 24);
  } else if (t === 'persianBrick') { // fine buff brick, mortar lighter than the brick
    brickPatch(v.x0, v.y0, v.x1, v.y1, z, texMask(RR, 0.28), v, 6.5, 21);
  } else if (t === 'nanakshahi') { // Lahore's thin Mughal-era brick: tall, tight courses
    brickPatch(v.x0, v.y0, v.x1, v.y1, z, texMask(RR, 0.22), v, 4.6, 15);
  } else if (t === 'cladding') { // a kothi's stone-tile facing: big slabs, each a slightly different tone
    const th = 30, tw = 60;
    for (let y = v.y0, r = 0; y < v.y1 - 2; y += th, r++) {
      L3([v.x0, y, z], [v.x1, y, z], { w: T_INK, a: 0.5, brk: 0.2 });
      for (let x = v.x0 + (r % 2 ? tw / 2 : 0); x < v.x1; x += tw) {
        if (x > v.x0) L3([x, y, z], [x, Math.min(v.y1, y + th), z], { w: 0.45, a: 0.45, os: 0, brk: 0 });
        if (RR.chance(0.35)) wash(quad(Math.max(v.x0, x), y, Math.min(v.x1, x + tw), Math.min(v.y1, y + th), z), jit(v.mat.col, 18), { a: 0.25, amp: 0.4, rim: 0.1, blot: 0 });
      }
    }
  } else if (t === 'ablaq') { // alternating basalt and limestone courses
    const ch = 26;
    for (let y = v.y0, k = 0; y < v.y1; y += ch, k++) {
      if (k % 2) wash(quad(v.x0, y, v.x1, Math.min(v.y1, y + ch), z), [92, 88, 96], { a: 0.42, amp: 0.8, rim: 0.1, blot: 1 });
      L3([v.x0, y, z], [v.x1, y, z], { w: T_INK, a: 0.55, brk: 0.3 });
      for (let x = v.x0 + (k % 2 ? 30 : 0) + 60; x < v.x1 - 6; x += 60) if (RR.chance(0.6)) L3([x, y, z], [x, Math.min(v.y1, y + ch), z], { w: 0.45, a: 0.45, os: 0, brk: 0 });
    }
  } else if (t === 'azulejo') { // Lisbon tile fronts: a 14 cm grid, each tile with a painted motif
    const s = 14, m = texMask(RR, 0.25), ink = mix(v.mat.col, [30, 60, 150], 0.75), motif = RR.int(0, 2);
    for (let y = v.y0 + s; y < v.y1; y += s) L3([v.x0, y, z], [v.x1, y, z], { w: 0.3, a: 0.35, brk: 0.3, os: 0 });
    for (let x = v.x0 + s; x < v.x1; x += s) L3([x, v.y0, z], [x, v.y1, z], { w: 0.3, a: 0.3, brk: 0.3, os: 0 });
    C.fillStyle = rgba(ink, 0.42);
    for (let y = v.y0; y < v.y1 - 2; y += s) for (let x = v.x0; x < v.x1 - 2; x += s) {
      if (!m(x + s / 2, y + s / 2, v)) continue;
      const cx = x + s / 2, cy = y + s / 2;
      C.beginPath();
      if (motif === 0) { const p = [P([cx, cy + 5, z]), P([cx + 5, cy, z]), P([cx, cy - 5, z]), P([cx - 5, cy, z])]; C.moveTo(...p[0]); for (const q of p.slice(1)) C.lineTo(...q); }
      else if (motif === 1) { for (const [dx, dy] of [[-4, 0], [4, 0], [0, -4], [0, 4]]) { const c = P([cx + dx, cy + dy, z]); C.moveTo(c[0] + 2.4 * VIEW.k, c[1]); C.arc(c[0], c[1], 2.4 * VIEW.k, 0, TAU); } }
      else { for (const [dx, dy] of [[-s / 2, -s / 2], [s / 2, -s / 2], [s / 2, s / 2], [-s / 2, s / 2]]) { const c = P([cx + dx, cy + dy, z]); C.moveTo(c[0], c[1]); C.arc(c[0], c[1], 3.6 * VIEW.k, 0, TAU); } const c = P([cx, cy, z]); C.moveTo(c[0] + 2 * VIEW.k, c[1]); C.arc(c[0], c[1], 2 * VIEW.k, 0, TAU); }
      C.fill();
    }
  } else if (t === 'wood') {
    const pw = RR.range(13, 18);
    for (let x = v.x0; x < v.x1 - 2; x += pw) {
      wash(quad(x, v.y0, Math.min(v.x1, x + pw), v.y1, z), jit(v.mat.col, 14), { a: RR.range(0.12, 0.3), amp: 0.8, rim: 0, blot: 0 });
      if (x > v.x0) L3([x, v.y0, z], [x, v.y1, z], { w: T_INK, a: 0.6, brk: 0.4 });
    }
  } else if (t === 'siding') {
    for (let y = v.y0 + 16; y < v.y1 - 4; y += 16) {
      L3([v.x0, y, z], [v.x1, y, z], { w: T_INK, a: 0.55, brk: 0.5 });
      wash(quad(v.x0, y - 3, v.x1, y, z), COL.shadow, { a: 0.15, amp: 0.5, rim: 0, blot: 0 });
    }
  } else if (t === 'tile') {
    const m = texMask(RR, 0.55), s = 11;
    for (let y = v.y0 + s; y < v.y1; y += s) for (let x = v.x0 + s; x < v.x1; x += s) {
      if (!m(x, y, v)) continue;
      if (RR.chance(0.7)) L3([x - s, y, z], [x, y, z], { w: 0.4, a: 0.45, os: 0.5, brk: 0 });
      if (RR.chance(0.7)) L3([x, y - s, z], [x, y, z], { w: 0.4, a: 0.45, os: 0.5, brk: 0 });
    }
  } else { // plaster / timber infill: cracks; plaster loses patches (more in the south)
    const cond = S.cond ?? 0.3, peel = cond > 0.4; // weathering comes from the building's condition, not its region
    const nc = Math.round(cond * 4 + RR.f());
    for (let i = 0; i < nc; i++) {
      let x = RR.range(v.x0 + 20, v.x1 - 20), y = RR.range(v.y0 + 20, v.y1 - 20), a = RR.range(-2.2, -0.9);
      const pts = [P([x, y, z])];
      for (let k = 0; k < RR.int(3, 6); k++) { a += RR.gauss() * 0.5; x += Math.cos(a) * 8; y += Math.sin(a) * 8; pts.push(P([x, y, z])); }
      inkLine(pts, { w: 0.45, a: 0.6, os: 0 });
    }
    if (t === 'plaster') for (let k = 0; k < Math.round(cond * 5 * RR.range(0.5, 1.1)); k++) {
      const cx = RR.range(v.x0 + 40, v.x1 - 40), cy = RR.range(v.y0 + 30, v.y1 - 30), rw = RR.range(18, peel ? 50 : 34), rh = RR.range(10, peel ? 30 : 22);
      const blob = []; for (let i = 0; i < 10; i++) { const a = i / 10 * TAU, r = RR.range(0.7, 1.2); blob.push(P([cx + Math.cos(a) * rw * r, cy + Math.sin(a) * rh * r, z])); }
      wash(blob, peel ? [206, 176, 140] : [196, 150, 126], { a: 0.35, amp: 1, rim: 0.3 });
      for (let yy = cy - rh + 6; yy < cy + rh - 3; yy += 7) L3([cx - rw * 0.6, yy, z], [cx + rw * 0.6, yy, z], { w: 0.45, a: 0.55, brk: 0.4 });
      inkLine(blob.concat([blob[0]]).filter((_, i) => i % 2 === 0 || RR.chance(0.5)), { w: 0.5, a: 0.6, os: 0 });
    }
  }
}

// ---------------------------------------------------------------- ornament
// Ornament is structural vocabulary: string courses at floor lines, quoins at
// corners, pilasters on the bay grid, timber frames derived from openings.
function ornament(S, vols, R, pal, st) {
  const orn = st.ornament;
  for (const v of vols) {
    if (v.floor === 0 && (S.arcD || st.ground === 'devanture')) continue;
    const isTop = v === vols[vols.length - 1];
    if (orn.includes('cornice') || (orn.includes('corniceTop') && isTop)) {
      const big = isTop, ch = big ? 22 : 12, dz = big ? 16 : 8;
      const b = { x0: v.x0 - (big ? 10 : 4), x1: v.x1 + (big ? 10 : 4), y0: v.y1 - ch, y1: v.y1, z0: v.z, z1: v.z + dz };
      S.add(v.z + dz + 0.1, () => {
        shadowBox(b, { a: 0.5 });
        drawBox(b, { col: mix(v.mat.col, [250, 248, 240], 0.35), w: D_INK, front: () => {
          L3([b.x0, b.y0 + ch * 0.4, b.z1], [b.x1, b.y0 + ch * 0.4, b.z1], { w: 0.5, a: 0.6 });
          if (big) for (let x = b.x0 + 8; x < b.x1 - 6; x += 14) { const q = quad(x, b.y0 - 8, x + 7, b.y0, v.z + 4); wash(q, mix(v.mat.col, [250, 248, 240], 0.3), { a: 0.4, rim: 0, off: 0 }); inkPoly(q, { w: 0.45, a: 0.6, os: 0 }); }
        } });
      });
      if (big) S.topCornice = b;
    }
    if (orn.includes('quoins') && v.mat.type !== 'timber') {
      S.add(v.z + 0.12, () => {
        for (const side of [-1, 1]) {
          for (let y = v.y0 + 4, k = 0; y < v.y1 - 20; y += 32, k++) {
            const w = k % 2 === 0 ? 42 : 26, x0 = side < 0 ? v.x0 : v.x1 - w, q = quad(x0, y, x0 + w, y + 28, v.z + 1);
            wash(q, mix(pal.stone, v.mat.col, 0.3), { a: 0.45, amp: 0.6 }); inkPoly(q, { w: 0.7, a: 0.75 });
          }
        }
      });
    }
  }
}

// timber framing (Fachwerk): posts, rails and braces derived from the openings
// The frame comes first: posts stand on a regular field grid (fixedPosts) and the
// windows have already been fitted into fields between them.
function timberFrame(S, v, wins, pal, fixedPosts) {
  const T = pal.timber, tw = 15, z = v.z;
  const members = [];
  const post = x => members.push([[x - tw / 2, v.y0], [x + tw / 2, v.y0], [x + tw / 2, v.y1], [x - tw / 2, v.y1]]);
  const rail = (x0, x1, y, h = tw) => members.push([[x0, y], [x1, y], [x1, y + h], [x0, y + h]]);
  const brace = (x0, y0, x1, y1, w = 12) => { const dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy), nx = -dy / l * w / 2, ny = dx / l * w / 2; members.push([[x0 + nx, y0 + ny], [x1 + nx, y1 + ny], [x1 - nx, y1 - ny], [x0 - nx, y0 - ny]]); };
  rail(v.x0, v.x1, v.y0, 22); rail(v.x0, v.x1, v.y1 - 20, 20);
  let all;
  if (fixedPosts) all = fixedPosts.slice();
  else {
    const xs = [v.x0 + tw / 2, v.x1 - tw / 2];
    for (const w of wins) xs.push(w.x - 9, w.x + w.w + 9);
    xs.sort((a, b) => a - b);
    const posts = [];
    for (const x of xs) if (!posts.length || x - posts[posts.length - 1] > 30) posts.push(x);
    all = [];
    for (let i = 0; i < posts.length; i++) { all.push(posts[i]); if (i < posts.length - 1 && posts[i + 1] - posts[i] > 150 && !wins.some(w => w.x > posts[i] && w.x < posts[i + 1])) all.push((posts[i] + posts[i + 1]) / 2); }
    all.sort((a, b) => a - b);
  }
  for (const x of all) post(x);
  for (let i = 0; i < all.length - 1; i++) {
    const a = all[i] + tw / 2, b = all[i + 1] - tw / 2;
    const win = wins.find(w => w.x >= a - 12 && w.x + w.w <= b + 12);
    if (win) {
      rail(a, b, win.y - 10, 12); rail(a, b, win.y + win.h, 12);
      const py0 = v.y0 + 22, py1 = win.y - 10;
      if (py1 - py0 > 30) { if ((i + v.floor) % 2) { brace(a, py0, b, py1, 10); brace(a, py1, b, py0, 10); } else { const mx = (a + b) / 2, my = (py0 + py1) / 2; brace(a, my, mx, py1, 9); brace(mx, py1, b, my, 9); brace(b, my, mx, py0, 9); brace(mx, py0, a, my, 9); } }
    } else {
      rail(a, b, lerp(v.y0, v.y1, 0.48), 13);
      const atL = i === 0, atR = i === all.length - 2;
      if (atL || atR || (b - a) > 70) {
        const yb = v.y0 + 22, yt = v.y1 - 20;
        if (atL || (!atR && i % 2)) brace(a, yb, b, lerp(yb, yt, 0.75), 13); else brace(b, yb, a, lerp(yb, yt, 0.75), 13);
      }
    }
  }
  S.add(z + 0.15, () => {
    for (const m of members) wash(W2(m, z), jit(T, 8), { a: 0.75, amp: 0.5, rim: 0.3, off: 0.4, inset: 0.2 });
    for (const m of members) inkPoly(W2(m, z), { w: 0.8, a: 0.8, os: 1.5 });
    if (S.jetty) for (let x = v.x0 + 14; x < v.x1 - 8; x += 38) { const q = quad(x, v.y0 - 2, x + 12, v.y0 + 12, z + 1); wash(q, darken(T, 0.2), { a: 0.7, rim: 0, off: 0 }); inkPoly(q, { w: 0.5, os: 0 }); }
  });
}
