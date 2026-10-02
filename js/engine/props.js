// ============================================================================
//  BASTI — street props, placed by anchor slots rather than at random
//
//  Slots come from the facade: each side of the door, in front of each window
//  bay, the two ends of the frontage, and wall anchors (beside the door, the
//  ground-floor corner). Each prop declares which slots it may use and which
//  styles / shop classes it belongs to. The shop's signature props are placed
//  first, then door-side furniture (in symmetric pairs where the style says
//  so), wall fixtures, then general clutter.
// ============================================================================
const PROPS = {
  // signature props for a trade
  produce: { w: 120, slots: ['front'], cls: ['grocer'], sig: true, draw: (x, z, pal, S) => produceStand(x, z, pal) },
  flowerStand: { w: 120, slots: ['front', 'endL', 'endR'], cls: ['flowers'], sig: true, draw: (x, z, pal) => flowerStand(x, z, pal) },
  bookCart: { w: 110, slots: ['front'], cls: ['books'], sig: true, draw: (x, z, pal) => bookCart(x, z, pal) },
  bistro: { w: 150, slots: ['front', 'endL', 'endR'], cls: ['cafe', 'bar', 'tea'], sig: true, draw: (x, z, pal, S) => bistroSet(x, z, pal, S) },
  stools: { w: 150, slots: ['front', 'endL', 'endR'], cls: ['cafe', 'bar', 'tea', 'grocer'], sig: true, draw: (x, z, pal) => stoolsTable(x, z, pal) },
  bikeRack: { w: 180, slots: ['front', 'endL', 'endR'], cls: ['bike', '*'], sig: true, draw: (x, z, pal) => { for (let k = 0; k < 3; k++) bicycleDraw(x + k * 22, z + k * 10, pal); L3([x - 10, 50, z + 40], [x + 190, 50, z + 40], { w: 1.3 }); } },
  sacks: { w: 110, slots: ['front', 'doorL', 'doorR'], cls: ['tea', 'grocer', 'pharmacy'], sig: true, draw: (x, z, pal) => sacks(x, z, pal) },
  takht: { w: 190, slots: ['front', 'endL', 'endR'], cls: ['tea', 'cafe', 'bar'], sig: true, draw: (x, z, pal) => takhtDraw(x, z, pal) },
  copper: { w: 70, slots: ['front', 'doorL', 'doorR', 'endL', 'endR'], cls: ['hardware', 'grocer', 'tea'], sig: true, draw: (x, z, pal) => copperDraw(x, z, pal) },
  scooterRow: { w: 300, slots: ['front', 'endL', 'endR'], cls: ['*'], sig: true, draw: (x, z, pal) => { const n = RR.int(2, 3); for (let k = n - 1; k >= 0; k--) scooterDraw(x + k * 70, z + k * 6, pal); } },
  basins: { w: 130, slots: ['front', 'endL', 'endR', 'doorL', 'doorR'], cls: ['*'], draw: (x, z, pal) => { for (let k = 0; k < 2; k++) potPlant(x + k * 64, 0, z + k * 4, RR.pick(['bush', 'tall', 'bush']), 'basin', pal, 1); } },
  onggi: { w: 110, slots: ['front', 'endL', 'endR'], cls: ['*'], draw: (x, z) => onggiDraw(x, z) },
  carpets: { w: 0, slots: [], cls: ['*'], draw: null },
  smallSigns: { w: 0, slots: [], cls: ['*'], draw: null },
  vending: { w: 90, slots: ['endL', 'endR'], cls: ['*'], draw: (x, z, pal) => vendingDraw(x, z, pal) },
  // door-side furniture
  potsDoor: { w: 40, slots: ['pair'], cls: ['*'], draw: null },
  lantern: { w: 30, slots: ['pair', 'doorL', 'doorR'], cls: ['bar', 'tea', 'cafe', 'grocer'], draw: null },
  aboard: { w: 50, slots: ['doorL', 'doorR', 'front'], cls: ['cafe', 'bakery', 'bar', 'tea', 'books', 'flowers'], draw: (x, z, pal) => aboardDraw(x, z, pal) },
  vsign: { w: 36, slots: ['doorL', 'doorR'], cls: ['tea', 'bar', 'pharmacy', 'grocer'], draw: null },
  nobori: { w: 50, slots: ['doorL', 'doorR', 'endL', 'endR'], cls: ['*'], draw: (x, z, pal) => noboriDraw(x, z, pal) },
  // general clutter
  bicycle: { w: 150, slots: ['front', 'endL', 'endR'], cls: ['*'], draw: (x, z, pal) => bicycleDraw(x, z, pal) },
  scooter: { w: 150, slots: ['front', 'endL', 'endR'], cls: ['*'], draw: (x, z, pal) => scooterDraw(x, z, pal) },
  crates: { w: 60, slots: ['front', 'endL', 'endR', 'doorL', 'doorR'], cls: ['grocer', 'hardware', 'bar', 'cafe'], draw: (x, z, pal) => cratesDraw(x, z, pal) },
  gas: { w: 42, slots: ['endL', 'endR', 'front'], cls: ['hardware', 'grocer', 'cafe', 'bar'], draw: (x, z) => { for (const dx of [0, 20]) { const b = { x0: x + dx, x1: x + dx + 18, y0: 0, y1: 75, z0: z, z1: z + 12 }; shadowBox(b); drawBox(b, { col: [200, 110, 90], a: 0.6 }); } } },
  charpai: { w: 200, slots: ['front', 'endL', 'endR'], cls: ['*'], draw: (x, z, pal) => charpaiDraw(x, z, pal) },
  generator: { w: 70, slots: ['endL', 'endR', 'doorL', 'doorR'], cls: ['*'], draw: (x, z, pal) => generatorDraw(x, z, pal) },
  bench: { w: 115, slots: ['front'], cls: ['*'], draw: (x, z, pal) => benchDraw(x, z, pal) },
  potsRow: { w: 120, slots: ['front', 'endL', 'endR'], cls: ['*'], draw: (x, z, pal, S) => { const n = RR.int(2, 4); const pk = RR.wpick(S.st.flora.pots); for (let k = 0; k < n; k++) potPlant(x + k * 38, 0, z + RR.range(-4, 6), RR.wpick(S.st.flora.potPlant), RR.chance(0.7) ? pk : RR.wpick(S.st.flora.pots), pal, RR.range(0.8, 1.15)); } },
  barrelPlanter: { w: 60, slots: ['front', 'endL', 'endR'], cls: ['*'], draw: (x, z, pal) => potPlant(x, 0, z, RR.pick(['geranium', 'bush']), 'barrel', pal, 1.1) },
  bollards: { w: 160, slots: ['curb'], cls: ['*'], draw: (x, z, pal, S) => bollardsDraw(x, z, pal, S) },
  bin: { w: 60, slots: ['endL', 'endR'], cls: ['*'], draw: (x, z, pal) => binDraw(x, z, pal) },
  parasol: { w: 0, slots: [], cls: ['*'], draw: null },
  small: { w: 30, slots: ['front', 'endL', 'endR', 'doorL', 'doorR'], cls: ['*'], draw: (x, z, pal) => smallThing(x, z, pal) },
  birdcage: { w: 0, slots: [], cls: ['*'], draw: null },
  couplets: { w: 0, slots: [], cls: ['*'], draw: null },
};
// wall fixtures: placed on wall anchors, not on the pavement
const WALL_FIX = ['wallLamp', 'mailbox', 'streetPlate', 'tabac', 'pharmaCross', 'bracketSign', 'menu', 'houseNo', 'tobacco', 'carpets', 'smallSigns'];

function streetProps(S, g, R, pal, st, cls) {
  const gf = S.gf, door = gf.bays[gf.doorAt], zw = gf.z;
  const zFront = S.arcD ? 30 : zw + 12; // pavement depth in front of the frontage
  const slots = [];
  const add = (kind, x0, x1, z) => { if (x1 - x0 > 25) slots.push({ kind, x0, x1, used: x0, z }); };
  const B = S.boundary;
  if (B) { // a walled front garden: household things stand outside along the wall, by the gate
    add('doorL', B.gx0 - 90, B.gx0 - 20, B.z + 12); add('doorR', B.gx1 + 20, B.gx1 + 90, B.z + 12);
    add('front', B.x0 + 10, B.gx0 - 100, B.z + 14); add('front', B.gx1 + 100, B.x1 - 10, B.z + 14);
  } else {
    add('doorL', door.x0 - 80, door.x0 - 6, zw + 10); add('doorR', door.x1 + 6, door.x1 + 80, zw + 10);
    gf.bays.forEach((b, i) => { if (i !== gf.doorAt) add('front', b.x0 + 4, b.x1 - 4, zFront); });
  }
  add('endL', g.x0 - 120, g.x0 + 10, zFront + 10); add('endR', g.x1 - 10, g.x1 + 120, zFront + 10);
  add('curb', g.x0 - 40, g.x1 + 40, 175);
  S.debug.slots = slots.map(s => ({ kind: s.kind, x0: s.x0, x1: s.x1, z: s.z }));
  // clip door slots so they don't spill into neighbouring bays' slots
  for (const s of slots) if (s.kind === 'doorL') s.x0 = Math.max(s.x0, g.x0 - 30); else if (s.kind === 'doorR') s.x1 = Math.min(s.x1, g.x1 + 30);
  const allowed = k => st.props.includes(k) && (PROPS[k].cls.includes('*') || PROPS[k].cls.includes(cls));
  const place = (k, pref) => {
    const p = PROPS[k];
    for (const kind of pref || p.slots) {
      const cand = slots.filter(s => s.kind === kind && s.x1 - s.used >= p.w);
      if (!cand.length) continue;
      const s = R.pick(cand), x = s.kind === 'doorL' ? s.x1 - p.w - (s.x1 - s.used - p.w) * 0 : s.used + R.range(0, Math.min(20, s.x1 - s.used - p.w));
      if (s.kind === 'doorL') s.x1 = x - 6; else s.used = x + p.w + 6;
      return { x, z: s.z + R.range(0, 10), kind: s.kind };
    }
    return null;
  };
  const queue = [];
  // 1. the trade's signature prop
  const sig = Object.keys(PROPS).filter(k => PROPS[k].sig && allowed(k) && PROPS[k].cls.includes(cls));
  if (cls === 'bike' && st.props.includes('bicycle')) sig.push('bikeRack');
  if (sig.length) queue.push(R.pick(sig));
  // 2. door-side furniture: European doors get a matching pair; Straits doors a pair of lanterns
  if (allowed('potsDoor') && !B && R.chance(0.7)) {
    const plant = R.wpick(st.flora.potPlant), pot = R.wpick(st.flora.pots), sc = R.range(0.95, 1.2);
    for (const side of [-1, 1]) { const x = side < 0 ? door.x0 - 40 * sc - 4 : door.x1 + 4; S.add(zw + 14, () => potPlant(x, S.st.stoop ? 0 : 0, zw + 12, plant, pot, pal, sc)); }
    for (const s of slots) { if (s.kind === 'doorL') s.x1 -= 48; if (s.kind === 'doorR') s.used += 48; }
  }
  if ((allowed('lantern') || (S.use === 'house' && S.styleKey === 'straits')) && !B && R.chance(0.75)) {
    const pair = S.styleKey === 'straits', y = Math.min(gf.openTop - 10, 230);
    const xs = pair ? [door.x0 - 22, door.x1 + 22] : [R.chance(0.5) ? door.x0 - 20 : door.x1 + 20];
    for (const x of xs) S.add(60, () => (S.T.cjk ? lanternDraw : brassLantern)(x, y, Math.max(zw + 25, S.arcD ? -20 : 25), pal, S.styleKey === 'straits'));
  }
  if (allowed('birdcage') && R.chance(0.6)) { const x = R.range(g.x0 + 40, g.x1 - 40); S.add(1, () => birdcageDraw(x, g.y1 - 20, -S.arcD * 0.5)); }
  // 3. wall fixtures
  if (!B) for (const k of WALL_FIX) if (st.props.includes(k) || (k === 'houseNo' && st.script === 'latin') || (k === 'menu' && st.script === 'latin' && (cls === 'cafe' || cls === 'bar'))) {
    if (S.use === 'house' && !['mailbox', 'wallLamp', 'houseNo', 'streetPlate', 'carpets'].includes(k)) continue;
    if (k === 'tabac' && cls !== 'bar') continue;
    if (k === 'tobacco' && cls !== 'grocer' && cls !== 'hardware' && cls !== 'pharmacy') continue;
    if (k === 'pharmaCross' && cls !== 'pharmacy') continue;
    if (R.chance(k === 'bracketSign' || k === 'tabac' || k === 'pharmaCross' ? 0.9 : 0.55)) wallFixture(S, k, R.fork(k), pal, g, door);
  }
  // 4. door-side and general clutter, in order of how much each style uses them
  const pool = st.props.filter(k => PROPS[k] && PROPS[k].draw && allowed(k) && !PROPS[k].sig && !queue.includes(k) && !(k === 'generator' && S.retrofit === false));
  const n = R.int(3, 6);
  for (let i = 0; i < n && pool.length; i++) queue.push(pool.splice(R.int(0, pool.length - 1), 1)[0]);
  if (st.props.includes('bicycle') && S.styleKey === 'dutch') queue.push('bicycle');
  for (const k of queue) {
    if (k === 'vsign') { const s = place('vsign'); if (s) signBoard(S, { x0: s.x, x1: s.x + 34, y0: 20, y1: 150, z0: s.z, z1: s.z + 5 }, R.fork('vs'), pal, true, R.pick(['light', 'dark'])); continue; }
    const s = place(k); if (!s) continue;
    const p = PROPS[k];
    const z = k === 'bollards' ? 175 : s.z;
    S.debug.props.push({ k, x: s.x, w: p.w, z, slot: s.kind });
    if (k !== 'bollards') S.bounds.push([s.x, 0, z], [s.x + p.w, 50, z]);
    S.add(z + 30, () => p.draw(s.x, z, pal, S));
    if (k === 'bistro' && st.props.includes('parasol') && R.chance(0.6)) S.add(z + 31, () => parasolDraw(s.x + 75, z + 10, pal));
  }
}

// ---------------------------------------------------------------- wall fixtures
function wallFixture(S, k, R, pal, g, door) {
  const zw = S.gf.z, side = R.chance(0.5) ? -1 : 1;
  if (k === 'wallLamp') {
    const x = side < 0 ? door.x0 - 26 : door.x1 + 14, y = Math.min(S.gf.openTop - 10, 220);
    S.add(zw + 20, () => { L3([x + 6, y, zw], [x + 6, y + 10, zw + 16], { w: 1.1 }); const c = P([x + 6, y + 10, zw + 16]), s = 6 * VIEW.k; const lan = [[c[0] - s, c[1] - s * 2.6], [c[0] + s, c[1] - s * 2.6], [c[0] + s * 0.8, c[1]], [c[0] - s * 0.8, c[1]]]; paper([lan]); wash(lan, [240, 220, 150], { a: 0.55 }); inkPoly(lan, { w: 0.8 }); const cap = [[c[0] - s * 1.3, c[1] - s * 2.6], [c[0] + s * 1.3, c[1] - s * 2.6], [c[0], c[1] - s * 3.6]]; paper([cap]); wash(cap, [50, 50, 50], { a: 0.8 }); inkPoly(cap, { w: 0.7 }); castShadow([[x, y - 20, zw + 16], [x + 12, y - 20, zw + 16], [x, y + 10, zw + 16], [x + 12, y + 10, zw + 16]], { a: 0.25 }); });
  } else if (k === 'mailbox') {
    const x = side < 0 ? door.x0 - 40 : door.x1 + 10, b = { x0: x, x1: x + 30, y0: 120, y1: 160, z0: zw, z1: zw + 12 };
    S.add(zw + 12, () => { shadowBox(b); drawBox(b, { col: R.pick([[220, 180, 60], [120, 40, 40], [50, 70, 60]]), a: 0.7, w: D_INK, front: () => L3([x + 6, 150, zw + 12], [x + 24, 150, zw + 12], { w: 1 }) }); });
  } else if (k === 'streetPlate') {
    const words = { paris: ['RUE DES LILAS', 'RUE DU MOULIN', 'RUE DES ÉCOLES', 'PLACE DU MARCHÉ'], fachwerk: ['Marktstraße', 'Kirchgasse', 'Mühlenweg', 'Brunnengasse'], med: ['VIA DEL FORNO', 'VICOLO DEI FIORI', 'VIA DEL MULINO'], dutch: ['Kerkstraat', 'Molensteeg', 'Bloemgracht'], lisbon: ['RUA DA PRATA', 'RUA DOS FANQUEIROS', 'RUA DOS DOURADORES', 'TRAVESSA DO CARMO'], istanbul: ['ÇEŞME SK.', 'FIRIN SK.', 'MEKTEP SK.', 'BOSTAN SK.'], hanoi: ['PHỐ HÀNG BẠC', 'PHỐ HÀNG GAI', 'PHỐ MÃ MÂY', 'PHỐ HÀNG ĐÀO'], nola: ['RUE ROYALE', 'RUE DUMAINE', 'RUE DE CHARTRES', 'RUE ST. PHILIPPE'] }[S.styleKey] || ['Main St'];
    const x = side < 0 ? g.x0 + 10 : g.x1 - 110, y = S.gf.openTop + (S.styleKey === 'paris' ? -40 : 10), b = { x0: x, x1: x + 100, y0: y, y1: y + 26, z0: zw, z1: zw + 2 };
    const txt = R.pick(words);
    const blue = ['paris', 'istanbul', 'hanoi'].includes(S.styleKey), tileBlue = S.styleKey === 'lisbon' || S.styleKey === 'nola';
    S.add(zw + 2.5, () => { shadowBox(b, { a: 0.3 }); drawBox(b, { col: blue ? [50, 70, 130] : [240, 240, 236], a: 0.75, w: 0.8, front: f => latinText(f, 6, 3, 94, 23, txt, { font: S.styleKey === 'hanoi' ? 'condensed' : 'serif', col: blue ? [250, 250, 250] : tileBlue ? [40, 70, 150] : [40, 40, 50], size: 0.6 }) }); });
  } else if (k === 'tobacco') { // the red たばこ sign of a Japanese corner shop
    const x = side < 0 ? g.x0 + 8 : g.x1 - 70, y = S.gf.openTop - 6, b = { x0: x, x1: x + 62, y0: y, y1: y + 26, z0: zw, z1: zw + 8 };
    S.add(zw + 8.5, () => { shadowBox(b); drawBox(b, { col: [200, 40, 36], a: 0.85, w: 0.8, front: f => scriptText(f, 4, 2, 58, 24, 'たばこ', { font: SCRIPTS.ja.fonts.sign, col: [252, 250, 245], even: true }) }); });
  } else if (k === 'carpets') { // rugs hung out on the wall beside the door
    const n = R.int(1, 3);
    for (let i = 0; i < n; i++) {
      const rw = R.range(60, 90), rh = R.range(110, 150), x = side < 0 ? door.x0 - 20 - (i + 1) * (rw + 8) : door.x1 + 20 + i * (rw + 8), y = R.range(40, 70);
      if (x < g.x0 - 10 || x + rw > g.x1 + 10) continue;
      const c = R.pick([[160, 40, 40], [40, 60, 120], [170, 110, 50], [110, 40, 60]]);
      S.add(zw + 2 + i * 0.01, () => {
        const q = quad(x, y, x + rw, y + rh, zw + 2); castShadow([[x, y, zw + 2], [x + rw, y, zw + 2], [x, y + rh, zw + 2], [x + rw, y + rh, zw + 2], [x, y, zw], [x + rw, y + rh, zw]], { a: 0.3 });
        paper([q]); wash(q, c, { a: 0.75, blot: 1 });
        const bq = quad(x + 7, y + 7, x + rw - 7, y + rh - 7, zw + 2); inkPoly(bq, { w: 0.6, col: [240, 220, 160] }); inkPoly(quad(x + 12, y + 12, x + rw - 12, y + rh - 12, zw + 2), { w: 0.4, a: 0.7 });
        const m = [[x + rw / 2, y + rh * 0.3], [x + rw * 0.75, y + rh / 2], [x + rw / 2, y + rh * 0.7], [x + rw * 0.25, y + rh / 2]]; wash(W2(m, zw + 2), [230, 200, 140], { a: 0.5, rim: 0.3 }); inkPoly(W2(m, zw + 2), { w: 0.5 });
        inkPoly(q, { w: 0.8 }); for (let xx = x + 3; xx < x + rw; xx += 4) L3([xx, y, zw + 2], [xx, y - 6, zw + 2], { w: 0.4, a: 0.6, os: 0 });
      });
    }
  } else if (k === 'smallSigns') { // Taiwanese small vertical boards on the frontage
    const x = side < 0 ? g.x0 + 4 : g.x1 - 34, b = { x0: x, x1: x + 30, y0: 60, y1: 210, z0: Math.max(zw, 0) + 1, z1: Math.max(zw, 0) + 5 };
    signBoard(S, b, R, pal, true, R.pick(['light', 'color', 'dark']), S.T.small);
  } else if (k === 'houseNo') {
    const x = (door.x0 + door.x1) / 2 - 12, y = S.gf.openTop + 3, num = localDigits(S, 2 + (S.seed % 97));
    if (y > g.y1 - 30) return;
    S.add(zw + 1.5, () => { const b = { x0: x, x1: x + 24, y0: y, y1: y + 22, z0: zw, z1: zw + 1 }; drawBox(b, { col: S.T.script === 'fa' ? [60, 120, 170] : [240, 240, 236], a: 0.5, w: 0.6, front: f => S.T.script === 'latin' ? latinText(f, 2, 2, 22, 20, num, { font: 'serif', col: [40, 50, 90], size: 0.8 }) : sceneText(S, f, 2, 2, 22, 20, num, { col: S.T.script === 'fa' ? [250, 250, 250] : [40, 50, 90], role: 'bold', size: 0.8, even: false }) }); });
  } else if (k === 'menu') {
    const gaps = S.gf.bays.slice(0, -1).map((b, i) => [b.x1, S.gf.bays[i + 1].x0]).filter(gp => gp[1] - gp[0] >= 48);
    if (!gaps.length) return;
    const gp = R.pick(gaps), x = (gp[0] + gp[1]) / 2 - 20, y = 110;
    S.add(zw + 3, () => { const q = quad(x, y, x + 40, y + 55, zw + 3); shadowBox({ x0: x, x1: x + 40, y0: y, y1: y + 55, z0: zw, z1: zw + 3 }, { a: 0.3 }); paper([q]); wash(q, [52, 62, 58], { a: 0.8 }); inkPoly(q, { w: D_INK }); for (let i = 0; i < 4; i++) L3([x + 6, y + 44 - i * 10, zw + 3], [x + 6 + RR.range(14, 28), y + 44 - i * 10, zw + 3], { w: 0.6, col: [250, 250, 240], a: 0.8 }); });
  } else { // projecting signs: tabac, pharmacy cross, wrought-iron bracket sign
    const v = S.vols[Math.min(1, S.vols.length - 1)], x = side < 0 ? g.x0 + 18 : g.x1 - 18, y = (S.vols.length > 1 ? v.y0 : g.y1) - (k === 'bracketSign' ? 10 : -10), zz = Math.max(v.z, zw) + 70;
    S.bounds.push([x, y + 40, zz]);
    S.add(zz, () => {
      const zb = Math.max(v.z, zw);
      L3([x, y + 18, zb], [x, y + 18, zz], { w: 1.5 }); L3([x, y - 10, zb], [x, y + 18, zz - 30], { w: 0.8 });
      if (k === 'bracketSign') for (let a = 0; a < 3 * Math.PI; a += 0.3) { const c = P([x, y + 18, zb + 25]), r = (8 - a) * VIEW.k; if (r > 0) { C.strokeStyle = rgba(COL.ink, 0.8); C.lineWidth = 0.8; C.beginPath(); C.arc(c[0], c[1] - 6, r, a, a + 0.35); C.stroke(); } }
      const c = P([x, y - 18, zz]), s = 24 * VIEW.k;
      castShadow([[x - 24, y - 45, zz], [x + 24, y - 45, zz], [x - 24, y + 10, zz], [x + 24, y + 10, zz]], { a: 0.3 });
      if (k === 'tabac') { const d = [[c[0], c[1] - s * 1.2], [c[0] + s * 0.55, c[1]], [c[0], c[1] + s * 1.2], [c[0] - s * 0.55, c[1]]]; paper([d]); wash(d, [200, 50, 40], { a: 0.85 }); inkPoly(d, { w: D_INK, os: 0 }); }
      else if (k === 'pharmaCross') { const a = s * 0.3, b = s * 0.9, cr = [[-a, -b], [a, -b], [a, -a], [b, -a], [b, a], [a, a], [a, b], [-a, b], [-a, a], [-b, a], [-b, -a], [-a, -a]].map(q => [c[0] + q[0], c[1] + q[1]]); paper([cr]); wash(cr, [40, 160, 90], { a: 0.85 }); inkPoly(cr, { w: D_INK, os: 0 }); }
      else { L3([x, y + 10, zz], [x, y - 4, zz], { w: 0.7 }); emblem(S.cls, c[0], c[1], s); }
    });
  }
}
// guild emblems hung from bracket signs
function emblem(cls, cx, cy, s) {
  const gold = [196, 158, 70];
  C.strokeStyle = rgba(darken(gold, 0.3), 0.95); C.fillStyle = rgba(gold, 0.85); C.lineWidth = Math.max(1.2, s * 0.09);
  C.beginPath();
  if (cls === 'bakery') { C.moveTo(cx - s * 0.6, cy + s * 0.2); C.bezierCurveTo(cx - s * 0.9, cy - s * 0.7, cx + s * 0.1, cy - s * 0.6, cx + s * 0.25, cy + s * 0.45); C.moveTo(cx + s * 0.6, cy + s * 0.2); C.bezierCurveTo(cx + s * 0.9, cy - s * 0.7, cx - s * 0.1, cy - s * 0.6, cx - s * 0.25, cy + s * 0.45); C.lineWidth = s * 0.16; C.stroke(); return; }
  if (cls === 'bar' || cls === 'cafe' || cls === 'tea') { C.moveTo(cx - s * 0.4, cy - s * 0.5); C.lineTo(cx + s * 0.4, cy - s * 0.5); C.quadraticCurveTo(cx + s * 0.4, cy + s * 0.15, cx, cy + s * 0.2); C.quadraticCurveTo(cx - s * 0.4, cy + s * 0.15, cx - s * 0.4, cy - s * 0.5); C.fill(); C.stroke(); C.beginPath(); C.moveTo(cx, cy + s * 0.2); C.lineTo(cx, cy + s * 0.6); C.moveTo(cx - s * 0.25, cy + s * 0.6); C.lineTo(cx + s * 0.25, cy + s * 0.6); C.stroke(); return; }
  if (cls === 'books') { C.moveTo(cx, cy - s * 0.3); C.lineTo(cx - s * 0.6, cy - s * 0.45); C.lineTo(cx - s * 0.6, cy + s * 0.35); C.lineTo(cx, cy + s * 0.5); C.lineTo(cx + s * 0.6, cy + s * 0.35); C.lineTo(cx + s * 0.6, cy - s * 0.45); C.closePath(); C.fill(); C.stroke(); C.beginPath(); C.moveTo(cx, cy - s * 0.3); C.lineTo(cx, cy + s * 0.5); C.stroke(); return; }
  if (cls === 'bike' || cls === 'hardware') { C.arc(cx, cy, s * 0.5, 0, TAU); C.stroke(); C.beginPath(); for (let a = 0; a < Math.PI; a += Math.PI / 4) { C.moveTo(cx + Math.cos(a) * s * 0.5, cy + Math.sin(a) * s * 0.5); C.lineTo(cx - Math.cos(a) * s * 0.5, cy - Math.sin(a) * s * 0.5); } C.stroke(); return; }
  for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; C.moveTo(cx, cy); C.ellipse(cx + Math.cos(a) * s * 0.3, cy + Math.sin(a) * s * 0.3, s * 0.28, s * 0.16, a, 0, TAU); }
  C.fill(); C.stroke();
}

// ---------------------------------------------------------------- pavement props
function produceStand(x, z, pal) {
  const fruit = [[220, 70, 50], [240, 170, 50], [130, 170, 60], [240, 210, 80], [150, 60, 90], [230, 120, 60]];
  for (let r = 0; r < 2; r++) {
    const y0 = 30 + r * 32, zz = z + 20 - r * 14;
    const b = { x0: x + r * 6, x1: x + 120 - r * 6, y0: y0 - 26, y1: y0, z0: zz - 20, z1: zz };
    shadowBox({ ...b, y0: 0 }, { a: 0.3 });
    drawBox(b, { col: [190, 150, 100], a: 0.55, w: 0.8 });
    for (let k = 0; k < 4; k++) { const fx0 = b.x0 + k * (b.x1 - b.x0) / 4, c = RR.pick(fruit); for (let i = 0; i < 9; i++) { const p = P([fx0 + RR.range(4, 26), y0 + RR.range(1, 7), zz]); C.fillStyle = rgba(jit(c, 14), 0.9); C.beginPath(); C.arc(p[0], p[1], RR.range(2.4, 3.6) * VIEW.k, 0, TAU); C.fill(); } }
  }
  for (const xx of [x + 4, x + 116]) L3([xx, 0, z + 20], [xx, 30, z + 20], { w: 0.9 });
}
function flowerStand(x, z, pal) {
  const cols = [[220, 70, 100], [240, 200, 70], [250, 250, 250], [180, 100, 200], [250, 140, 110], [230, 110, 150]];
  for (let r = 0; r < 3; r++) {
    const y = r * 28, zz = z + 26 - r * 12;
    for (let k = 0; k < 4 - (r === 2 ? 1 : 0); k++) {
      const bx = x + 8 + r * 8 + k * 26, b = { x0: bx, x1: bx + 20, y0: y, y1: y + 26, z0: zz - 12, z1: zz };
      shadowBox(b, { a: 0.25 }); drawBox(b, { col: [170, 176, 180], a: 0.5, w: 0.6 });
      if (FLAGS.plants) { const p = P([bx + 10, y + 34, zz]); foliage(p[0], p[1], 13 * VIEW.k, 10 * VIEW.k, { leaf: 4.5, under: 0.2, flowers: { cols: [RR.pick(cols)], dens: 0.6, size: 1.1 }, berries: 0 }); }
    }
  }
}
function bookCart(x, z, pal) {
  const b = { x0: x, x1: x + 105, y0: 55, y1: 62, z0: z, z1: z + 40 };
  shadowBox({ ...b, y0: 0 }, { a: 0.3 });
  for (const xx of [x + 6, x + 99]) L3([xx, 0, z + 20], [xx, 55, z + 20], { w: 1.1 });
  drawBox(b, { col: pal.wood, a: 0.6, w: D_INK });
  shelves(x + 3, x + 102, 50, 80, z + 30, 1, 'books', pal);
  const c = P([x + 52, 18, z + 41]); C.strokeStyle = rgba(COL.ink, 0.8); C.lineWidth = 1; C.beginPath(); C.arc(c[0], c[1], 8 * VIEW.k, 0, TAU); C.stroke();
}
function bistroSet(x, z, pal, S) {
  const chair = (cx, zz, face) => {
    const col = S.styleKey === 'paris' ? RR.pick([[170, 120, 70], [60, 90, 70], [150, 50, 50]]) : RR.pick([[150, 110, 80], [60, 60, 64], [230, 230, 226]]);
    const seat = { x0: cx - 18, x1: cx + 18, y0: 44, y1: 48, z0: zz - 18, z1: zz + 18 }; shadowBox({ ...seat, y0: 0 }, { a: 0.25 });
    for (const dx of [-15, 15]) L3([cx + dx, 0, zz + 12], [cx + dx, 44, zz + 12], { w: 0.9 });
    drawBox(seat, { col, a: 0.6, w: 0.8 });
    const bx = cx + face * 16; L3([bx, 46, zz - 10], [bx + face * 4, 92, zz - 10], { w: 1 }); L3([bx, 46, zz + 10], [bx + face * 4, 92, zz + 10], { w: 1 });
    for (let yy = 60; yy < 92; yy += 9) L3([bx + face * (yy - 46) / 12, yy, zz - 10], [bx + face * (yy - 46) / 12, yy, zz + 10], { w: 0.5, a: 0.7 });
  };
  chair(x + 22, z + 10, -1); chair(x + 128, z + 10, 1);
  const tz = z + 14, top = []; for (let i = 0; i < 18; i++) { const a = i / 18 * TAU; top.push(P([x + 75 + Math.cos(a) * 30, 72, tz + Math.sin(a) * 30])); }
  castShadow([[x + 45, 0, tz], [x + 105, 0, tz], [x + 45, 74, tz], [x + 105, 74, tz]], { a: 0.25 });
  L3([x + 75, 0, tz], [x + 75, 72, tz], { w: 1.4 }); L3([x + 60, 0, tz], [x + 90, 0, tz], { w: 1.1 });
  paper([top]); wash(top, S.styleKey === 'straits' ? [236, 232, 226] : [200, 200, 196], { a: 0.5 }); inkPoly(top, { w: D_INK, os: 0 });
  const cup = P([x + 70, 74, tz]); C.fillStyle = rgba([250, 250, 250], 1); C.fillRect(cup[0] - 3, cup[1] - 5, 6, 5); C.strokeStyle = rgba(COL.ink, 0.7); C.lineWidth = 0.6; C.strokeRect(cup[0] - 3, cup[1] - 5, 6, 5);
}
function parasolDraw(x, z, pal) {
  const h = 230, r = 120, col = RR.pick([[240, 236, 226], [200, 70, 60], [70, 110, 90]]);
  L3([x, 0, z], [x, h, z], { w: 1.4 });
  const can = [P([x - r, h - 30, z]), P([x, h + 20, z]), P([x + r, h - 30, z]), P([x + r - 10, h - 40, z]), P([x - r + 10, h - 40, z])];
  castShadow([[x - r, h - 40, z + 40], [x + r, h - 40, z + 40], [x, h + 20, z]], { a: 0.35 });
  paper([can]); wash(can, col, { a: 0.6, blot: 1 }); wash(can.slice(0, 3).concat([P([x, h - 30, z])]), COL.shadow, { a: 0.15, rim: 0 }); inkPoly(can, { w: D_INK });
  for (const dx of [-r * 0.5, 0, r * 0.5]) L3([x, h + 20, z], [x + dx * 2 * 0.9, h - 34, z], { w: 0.5, a: 0.6 });
}
function stoolsTable(x, z, pal) {
  const t = { x0: x + 40, x1: x + 110, y0: 62, y1: 66, z0: z, z1: z + 50 };
  shadowBox({ ...t, y0: 0 }, { a: 0.25 });
  for (const xx of [t.x0 + 4, t.x1 - 4]) L3([xx, 0, z + 25], [xx, 62, z + 25], { w: 0.9 });
  drawBox(t, { col: RR.pick([[236, 232, 226], [200, 120, 90], [120, 150, 170]]), a: 0.5, w: D_INK });
  for (const sx of [x, x + 118]) {
    const c = RR.pick([[220, 60, 50], [70, 110, 190], [240, 200, 70], [70, 150, 110]]);
    const sp = [[sx + 4, 0], [sx + 30, 0], [sx + 26, 38], [sx + 8, 38]];
    paper([W2(sp, z + 30)]); wash(W2(sp, z + 30), c, { a: 0.75 }); inkPoly(W2(sp, z + 30), { w: 0.8 });
    const tp = quad(sx + 5, 38, sx + 29, 42, z + 30); paper([tp]); wash(tp, c, { a: 0.8 }); inkPoly(tp, { w: 0.7 });
    const hole = P([sx + 17, 20, z + 30]); C.fillStyle = rgba(COL.paper, 0.9); C.beginPath(); C.ellipse(hole[0], hole[1], 3, 5, 0, 0, TAU); C.fill();
  }
}
function sacks(x, z, pal) {
  const fills = [[200, 150, 80], [120, 70, 50], [230, 220, 200], [150, 40, 40], [90, 110, 60]];
  for (let k = 0; k < 3; k++) {
    const sx = x + k * 36, w = 32, h = RR.range(40, 55), pts = [];
    for (let i = 0; i <= 10; i++) { const t = i / 10; pts.push([sx + Math.sin(t * Math.PI) * -3, h * t]); }
    for (let i = 10; i >= 0; i--) { const t = i / 10; pts.push([sx + w + Math.sin(t * Math.PI) * 3, h * t]); }
    shadowBox({ x0: sx, x1: sx + w, y0: 0, y1: h, z0: z, z1: z + 20 }, { a: 0.28 });
    paper([W2(pts, z + 20)]); wash(W2(pts, z + 20), [214, 190, 150], { a: 0.6, blot: 1 }); inkPoly(W2(pts, z + 20), { w: 0.8, os: 0 });
    const roll = quad(sx - 2, h - 6, sx + w + 2, h + 2, z + 20); paper([roll]); wash(roll, [200, 176, 136], { a: 0.6 }); inkPoly(roll, { w: 0.7 });
    const c = RR.pick(fills); for (let i = 0; i < 18; i++) { const p = P([sx + RR.range(4, w - 4), h + RR.range(0, 4), z + 20]); C.fillStyle = rgba(jit(c, 14), 0.9); C.beginPath(); C.arc(p[0], p[1], 1.6, 0, TAU); C.fill(); }
  }
}
function cratesDraw(x, z, pal) {
  const c = RR.pick([[226, 184, 70], [206, 86, 70], [80, 120, 170], [100, 150, 100]]), stack = RR.int(1, 4);
  for (let i = 0; i < stack; i++) {
    const b = { x0: x + RR.gauss() * 2, x1: x + 50 + RR.gauss() * 2, y0: i * 28, y1: i * 28 + 27, z0: z, z1: z + 32 };
    shadowBox(b, { a: 0.38 });
    drawBox(b, { col: c, a: 0.62, w: D_INK, front: () => { for (let k = 1; k < 5; k++) { const xx = lerp(b.x0, b.x1, k / 5); L3([xx, b.y0 + 5, b.z1], [xx, b.y1 - 9, b.z1], { w: 0.5 }); } } });
    if (i === stack - 1 && RR.chance(0.6)) for (let k = 0; k < 5; k++) { const bx = b.x0 + 5 + k * 9, q = quad(bx, b.y1, bx + 5, b.y1 + 16, z + 16); wash(q, [90, 110, 80], { a: 0.6, amp: 0.3 }); inkPoly(q, { w: 0.4 }); }
  }
}
function vendingDraw(x, z, pal) {
  const col = RR.pick([[236, 236, 232], [206, 80, 70], [80, 120, 180]]), b = { x0: x, x1: x + 88, y0: 0, y1: 180, z0: z - 60, z1: z + 10 }, zf = z + 10;
  shadowBox(b, { a: 0.45 });
  drawBox(b, { col, a: 0.55, w: W_INK, front: () => {
    const q = quad(x + 8, 95, x + 80, 170, zf); paper([q]); wash(q, [220, 230, 236], { a: 0.35 });
    for (let r = 0; r < 3; r++) for (let k = 0; k < 7; k++) { const cx = x + 12 + k * 9.6, cy = 100 + r * 24, cq = quad(cx, cy, cx + 6, cy + 14, zf); wash(cq, RR.pick([pal.acc, pal.acc2, [230, 180, 60], [60, 90, 150], [200, 60, 50], [120, 170, 110]]), { a: 0.7, amp: 0.2, off: 0.2 }); inkPoly(cq, { w: 0.35, a: 0.5 }); }
    inkPoly(q, { w: D_INK });
    const sq = quad(x + 14, 18, x + 74, 40, zf); wash(sq, [60, 60, 70], { a: 0.6 }); inkPoly(sq, { w: 0.6 });
  } });
}
function aboardDraw(x, z, pal) {
  const fr = [P([x, 0, z]), P([x + 48, 0, z]), P([x + 42, 95, z + 10]), P([x + 6, 95, z + 10])];
  castShadow([[x, 0, z], [x + 48, 0, z], [x + 42, 95, z + 10], [x + 6, 95, z + 10]], { a: 0.35 });
  paper([fr]); wash(fr, pal.wood, { a: 0.6 });
  const bd = [P([x + 5, 12, z + 1]), P([x + 43, 12, z + 1]), P([x + 38, 88, z + 10]), P([x + 10, 88, z + 10])];
  wash(bd, [52, 62, 58], { a: 0.8, amp: 0.8 }); inkPoly(fr, { w: D_INK }); inkPoly(bd, { w: 0.6 });
  for (let k = 0; k < 5; k++) { const yy = 78 - k * 12; inkLine([P([x + 12, yy, z + 8]), P([x + 12 + RR.range(10, 24), yy + RR.gauss(), z + 8])], { w: 0.8, col: [250, 250, 240], a: 0.8, os: 0 }); }
}
function noboriDraw(x, z, pal) {
  const n = RR.int(1, 2);
  for (let k = 0; k < n; k++) {
    const px = x + k * 26, h = RR.range(190, 220), col = RR.pick([[200, 60, 50], [230, 190, 60], [60, 90, 150], [240, 240, 236], [80, 140, 90]]);
    L3([px, 0, z], [px, h + 10, z], { w: 1.1 });
    const f = quad(px + 2, h - 150, px + 26, h, z); castShadow([[px + 2, h - 150, z], [px + 26, h - 150, z], [px + 2, h, z], [px + 26, h, z]], { a: 0.3 });
    paper([f]); wash(f, col, { a: 0.75, blot: 1 }); inkPoly(f, { w: 0.8 }); L3([px, h, z], [px + 28, h, z], { w: 0.8 });
    sceneText(S_CUR, new Face([px + 2, h - 150, z], [1, 0, 0], [0, 1, 0], rectP(24, 150)), 2, 10, 22, 145, S_CUR.T.nobori[k % 2], { col: col[0] > 230 && col[1] > 230 ? [40, 34, 30] : [250, 246, 236], vertical: true });
  }
}
function bicycleDraw(x, z, pal) {
  const col = RR.pick([pal.acc, [70, 90, 120], [60, 60, 60], [200, 200, 190], [40, 80, 60]]);
  const r = 30, w0 = [x + r, r], w1 = [x + 150 - r, r];
  castShadow([[x, 0, z], [x + 150, 0, z], [x, 90, z], [x + 150, 90, z]], { a: 0.22 });
  for (const c of [w0, w1]) {
    const pts = []; for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; pts.push(P([c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r, z])); }
    inkPoly(pts, { w: 1.3, os: 0 });
    for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI; L3([c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r, z], [c[0] - Math.cos(a) * r, c[1] - Math.sin(a) * r, z], { w: 0.3, a: 0.5, os: 0, brk: 0 }); }
  }
  const seat = [x + 58, 78], bar = [x + 108, 88], crank = [x + 70, r];
  for (const [a, bb] of [[w0, crank], [crank, seat], [seat, w0], [crank, [bar[0] - 4, 70]], [seat, [bar[0] - 4, 70]], [[bar[0] - 4, 70], w1], [[bar[0] - 4, 70], bar]]) brush([P([a[0], a[1], z]), P([bb[0], bb[1], z])], { w: 2.2 * VIEW.k / 1.5, col: darken(col, 0.2), a: 0.9 });
  L3([seat[0] - 8, seat[1] + 3, z], [seat[0] + 8, seat[1] + 3, z], { w: 2 }); L3([bar[0] - 10, bar[1] + 2, z], [bar[0] + 8, bar[1], z], { w: 1.4 });
  if (RR.chance(0.6)) { const q = quad(bar[0] + 2, 62, bar[0] + 32, 84, z + 2); paper([q]); wash(q, [200, 170, 110], { a: 0.45 }); inkPoly(q, { w: 0.6 }); for (let k = 1; k < 4; k++) L3([bar[0] + 2 + k * 7.5, 62, z + 2], [bar[0] + 2 + k * 7.5, 84, z + 2], { w: 0.35 }); if (FLAGS.plants && RR.chance(0.4)) { const p = P([bar[0] + 17, 88, z + 2]); foliage(p[0], p[1], 10 * VIEW.k, 7 * VIEW.k, { leaf: 4, flowers: { cols: [[240, 200, 80], [230, 90, 110]], dens: 0.5 }, under: 0 }); } }
}
function scooterDraw(x, z, pal) {
  const col = RR.pick([[200, 70, 60], [150, 190, 200], [240, 236, 220], [90, 130, 100], [60, 60, 70]]);
  castShadow([[x, 0, z], [x + 140, 0, z], [x, 100, z], [x + 140, 100, z]], { a: 0.25 });
  for (const cx of [x + 26, x + 116]) { const pts = []; for (let i = 0; i < 18; i++) { const a = i / 18 * TAU; pts.push(P([cx + Math.cos(a) * 17, 17 + Math.sin(a) * 17, z])); } paper([pts]); wash(pts, [60, 60, 64], { a: 0.75 }); inkPoly(pts, { w: 1, os: 0 }); }
  const body = [[x + 6, 28], [x + 30, 18], [x + 60, 18], [x + 92, 24], [x + 104, 50], [x + 112, 92], [x + 100, 94], [x + 88, 54], [x + 70, 44], [x + 60, 52], [x + 16, 52], [x + 4, 44]];
  paper([W2(body, z)]); wash(W2(body, z), col, { a: 0.75, blot: 1 }); inkPoly(W2(body, z), { w: D_INK, os: 0 });
  const seat = quad(x + 12, 52, x + 62, 60, z); paper([seat]); wash(seat, [50, 46, 46], { a: 0.8 }); inkPoly(seat, { w: 0.7 });
  L3([x + 98, 94, z], [x + 122, 100, z], { w: 1.6 }); const lamp = P([x + 110, 86, z]); C.fillStyle = rgba([250, 240, 200], 0.9); C.beginPath(); C.arc(lamp[0], lamp[1], 3, 0, TAU); C.fill();
  if (RR.chance(0.4)) { const h = quad(x + 30, 60, x + 50, 74, z); paper([h]); wash(h, RR.pick([[240, 240, 236], [200, 60, 50]]), { a: 0.6 }); inkPoly(h, { w: 0.6 }); }
}
// a charpai: turned wooden legs and a frame strung with rope or nylon webbing
function charpaiDraw(x, z, pal) {
  const L = 190, D = 85, hy = 46, wood = [156, 112, 72], rope = RR.pick([[226, 208, 168], [226, 208, 168], [196, 70, 64], [70, 120, 170]]);
  const top = [[x, hy, z], [x + L, hy, z], [x + L, hy, z + D], [x, hy, z + D]];
  castShadow(top.concat(top.map(p => [p[0], 0, p[2]])), { a: 0.3 });
  for (const [lx, lz] of [[x + 3, z], [x + L - 3, z]]) { const leg = { x0: lx - 3, x1: lx + 3, y0: 0, y1: hy, z0: lz, z1: lz + 6 }; drawBox(leg, { col: darken(wood, 0.1), a: 0.6, w: 0.6 }); }
  const tp = top.map(P); paper([tp]); wash(tp, rope, { a: 0.55, amp: 0.6 });
  for (let k = 1; k < 14; k++) { const t = k / 14; inkLine([P([x + L * t, hy, z]), P([x + L * Math.max(0, t - 0.25), hy, z + D])], { w: 0.35, a: 0.55, os: 0 }); inkLine([P([x + L * t, hy, z + D]), P([x + L * Math.max(0, t - 0.25), hy, z])], { w: 0.35, a: 0.45, os: 0 }); }
  for (const [a, b] of [[0, 1], [1, 2], [2, 3], [3, 0]]) inkLine([tp[a], tp[b]], { w: 1.3, col: darken(wood, 0.3), os: 0 });
  for (const [lx, lz] of [[x + 3, z + D], [x + L - 3, z + D]]) { const leg = { x0: lx - 3, x1: lx + 3, y0: 0, y1: hy, z0: lz - 6, z1: lz }; drawBox(leg, { col: wood, a: 0.65, w: 0.6 }); }
}
// a small petrol generator in a tubular frame, for the load-shedding hours
function generatorDraw(x, z, pal) {
  const col = RR.pick([[200, 60, 44], [226, 176, 40], [60, 110, 70]]), b = { x0: x, x1: x + 62, y0: 6, y1: 50, z0: z, z1: z + 42 };
  shadowBox({ ...b, y0: 0 }, { a: 0.35 });
  drawBox(b, { col, a: 0.65, w: D_INK, front: f => { const q = quad(x + 8, 14, x + 30, 40, z + 42); wash(q, [60, 60, 64], { a: 0.5 }); inkPoly(q, { w: 0.5 }); for (let yy = 18; yy < 38; yy += 4) L3([x + 10, yy, z + 42], [x + 28, yy, z + 42], { w: 0.3, a: 0.6 }); const c = P([x + 46, 28, z + 42]); C.strokeStyle = rgba(COL.ink, 0.7); C.lineWidth = 0.6; C.beginPath(); C.arc(c[0], c[1], 6 * VIEW.k, 0, TAU); C.stroke(); } });
  for (const xx of [x - 3, x + 65]) L3([xx, 0, z + 44], [xx, 56, z + 44], { w: 1.1 });
  L3([x - 3, 56, z + 44], [x + 65, 56, z + 44], { w: 1.1 });
  L3([x + 58, 30, z + 30], [x + 74, 26, z + 30], { w: 1 });
}
function benchDraw(x, z, pal) {
  const b = { x0: x, x1: x + 110, y0: 38, y1: 44, z0: z, z1: z + 30 };
  shadowBox({ ...b, y0: 0 }, { a: 0.3 });
  for (const xx of [x + 8, x + 98]) drawBox({ x0: xx, x1: xx + 5, y0: 0, y1: 38, z0: z + 10, z1: z + 15 }, { col: pal.woodDark, a: 0.5 });
  drawBox(b, { col: pal.wood, a: 0.6, w: D_INK });
}
function bollardsDraw(x, z, pal, S) {
  const n = RR.int(3, 5), dutch = S.styleKey === 'dutch', col = dutch ? [110, 50, 40] : [50, 70, 60];
  for (let k = 0; k < n; k++) {
    const bx = x + k * 42, h = dutch ? 80 : 70;
    const body = [[bx - 5, 0], [bx + 5, 0], [bx + 4, h], [bx - 4, h]];
    castShadow(body.map(q => [q[0], q[1], z]).concat([[bx, h + 6, z]]), { a: 0.3 });
    paper([W2(body, z)]); wash(W2(body, z), col, { a: 0.8 }); inkPoly(W2(body, z), { w: 0.8 });
    const c = P([bx, h + 4, z]); C.fillStyle = rgba(col, 0.9); C.beginPath(); C.arc(c[0], c[1], 4.5 * VIEW.k / 1.4, 0, TAU); C.fill();
    if (dutch) for (const yy of [h * 0.35, h * 0.55, h * 0.75]) { const p = P([bx, yy, z]); C.strokeStyle = rgba([240, 230, 220], 0.9); C.lineWidth = 1.2; C.beginPath(); C.moveTo(p[0] - 3, p[1] - 3); C.lineTo(p[0] + 3, p[1] + 3); C.moveTo(p[0] + 3, p[1] - 3); C.lineTo(p[0] - 3, p[1] + 3); C.stroke(); }
  }
}
function binDraw(x, z, pal) {
  const col = RR.pick([[70, 110, 80], [80, 80, 86], [60, 90, 140], [150, 110, 60]]);
  const b = { x0: x, x1: x + 54, y0: 6, y1: 100, z0: z, z1: z + 56 };
  shadowBox(b, { a: 0.35 });
  drawBox(b, { col, a: 0.7, w: D_INK, front: () => { L3([x, 92, z + 56], [x + 54, 92, z + 56], { w: 0.7 }); } });
  const lid = { x0: x - 2, x1: x + 56, y0: 100, y1: 106, z0: z - 2, z1: z + 58 }; drawBox(lid, { col, a: 0.75, w: 0.8 });
  for (const cx of [x + 8, x + 46]) { const c = P([cx, 7, z + 30]); C.fillStyle = rgba([40, 40, 40], 0.9); C.beginPath(); C.arc(c[0], c[1], 6 * VIEW.k / 1.4, 0, TAU); C.fill(); }
}
function lanternDraw(x, y, z, pal, red) {
  const cx = x, cy = y - 35, rx = 14, ry = 22;
  L3([cx, y + 10, z], [cx, cy + ry + 4, z], { w: 0.6 });
  const pts = []; for (let i = 0; i < 20; i++) { const a = i / 20 * TAU; pts.push(P([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry, z])); }
  castShadow([[cx - rx, cy - ry, z], [cx + rx, cy - ry, z], [cx + rx, cy + ry, z], [cx - rx, cy + ry, z]], { a: 0.3 });
  paper([pts]); wash(pts, red || RR.chance(0.7) ? [212, 70, 58] : [240, 230, 210], { a: 0.75, blot: 1 }); inkPoly(pts, { w: D_INK, os: 0 });
  for (let k = -2; k <= 2; k++) { const yy = cy + k * ry * 0.35, hw = rx * Math.sqrt(1 - (k * 0.35) ** 2); L3([cx - hw, yy, z], [cx + hw, yy, z], { w: 0.4, a: 0.5 }); }
  for (const yy of [cy + ry, cy - ry]) wash(quad(cx - 7, yy - 3, cx + 7, yy + 3, z), [40, 40, 40], { a: 0.8 });
  if (S_CUR.T.cjk) sceneText(S_CUR, new Face([cx - 8, cy - 14, z], [1, 0, 0], [0, 1, 0], rectP(16, 28)), 0, 0, 16, 28, S_CUR.T.lantern, { col: [40, 30, 30], vertical: true });
  if (red) for (let k = 0; k < 3; k++) L3([cx - 4 + k * 4, cy - ry - 3, z], [cx - 4 + k * 4, cy - ry - 14, z], { w: 0.6, col: [200, 50, 40] });
}
function birdcageDraw(x, y, z) {
  L3([x, y + 20, z], [x, y - 20, z], { w: 0.6 });
  const top = y - 20, h = 34, r = 16, pts = [];
  for (let i = 0; i <= 12; i++) { const a = Math.PI - i / 12 * Math.PI; pts.push(P([x + Math.cos(a) * r, top - h + h * 0.6 + Math.sin(a) * h * 0.4, z])); }
  inkLine(pts, { w: 0.8, os: 0 });
  for (let k = -3; k <= 3; k++) L3([x + k * r / 3.4, top - h, z], [x + k * r / 3.4 * 0.9, top - h * 0.4 + (1 - Math.abs(k) / 3) * h * 0.4 - h * 0.05, z], { w: 0.35, a: 0.7, os: 0 });
  L3([x - r, top - h, z], [x + r, top - h, z], { w: 1.2 });
  const b = P([x + 2, top - h * 0.55, z]); C.fillStyle = rgba(RR.pick([[230, 190, 60], [80, 160, 90], [220, 220, 220]]), 0.9); C.beginPath(); C.ellipse(b[0], b[1], 3.5, 2.5, 0, 0, TAU); C.fill();
}
function smallThing(x, z, pal) {
  const w = RR.range(14, 30), h = RR.range(12, 40), col = RR.pick([pal.acc, pal.acc2, [150, 160, 170], [200, 190, 170], [110, 140, 120], [230, 225, 215]]);
  const kind = RR.wpick([['box', 2], ['stool', 1], ['can', 1], ['broom', 0.5], ['bucket', 1]]);
  if (kind === 'broom') { L3([x, 0, z], [x + 12, 110, z], { w: 1 }); const q = [P([x - 8, 0, z]), P([x + 8, 0, z]), P([x + 5, 25, z]), P([x - 1, 25, z])]; wash(q, [200, 170, 110], { a: 0.6 }); inkPoly(q, { w: 0.6 }); return; }
  if (kind === 'stool') { const s = { x0: x, x1: x + w + 6, y0: h + 6, y1: h + 10, z0: z, z1: z + w }; shadowBox({ ...s, y0: 0 }, { a: 0.3 }); for (const xx of [x + 2, x + w + 2]) L3([xx, 0, z + w / 2], [xx, h + 6, z + w / 2], { w: 0.9 }); drawBox(s, { col, a: 0.6, w: 0.8 }); return; }
  if (kind === 'bucket') { const pts = [[x + 2, 0], [x + 24, 0], [x + 28, 28], [x - 2, 28]]; shadowBox({ x0: x, x1: x + 28, y0: 0, y1: 28, z0: z, z1: z + 20 }, { a: 0.3 }); paper([W2(pts, z + 20)]); wash(W2(pts, z + 20), RR.pick([[150, 170, 200], [200, 80, 70], [170, 176, 180]]), { a: 0.6 }); inkPoly(W2(pts, z + 20), { w: 0.8 }); inkLine([P([x, 28, z + 20]), P([x + 13, 40, z + 20]), P([x + 26, 28, z + 20])], { w: 0.6, os: 0 }); return; }
  const b = { x0: x, x1: x + w, y0: 0, y1: h, z0: z, z1: z + w * 0.8 };
  shadowBox(b, { a: 0.35 });
  drawBox(b, { col, a: 0.6, w: 0.8, front: kind === 'can' ? () => { L3([x, h * 0.3, b.z1], [x + w, h * 0.3, b.z1], { w: 0.4 }); L3([x + w * 0.3, h, b.z1], [x + w * 0.7, h + 6, b.z1], { w: 0.7 }); } : null });
}

let S_CUR = null; // the scene being drawn, for props that letter themselves
function takhtDraw(x, z, pal) { // Persian teahouse bench-bed with a carpet and bolster
  const b = { x0: x, x1: x + 180, y0: 38, y1: 46, z0: z, z1: z + 70 };
  shadowBox({ ...b, y0: 0 }, { a: 0.3 });
  for (const xx of [x + 4, x + 170]) drawBox({ x0: xx, x1: xx + 6, y0: 0, y1: 38, z0: z + 60, z1: z + 66 }, { col: [110, 70, 46], a: 0.6, w: 0.6 });
  drawBox(b, { col: [130, 86, 56], a: 0.65, w: D_INK });
  const rug = quad(x + 6, 46, x + 174, 50, z + 70), rf = quad(x + 10, 30, x + 170, 46, z + 71);
  paper([rf]); wash(rf, [170, 40, 44], { a: 0.75 }); inkPoly(rf, { w: 0.6 }); for (let xx = x + 16; xx < x + 166; xx += 12) L3([xx, 32, z + 71], [xx + 6, 44, z + 71], { w: 0.4, col: [240, 210, 150], a: 0.7 });
  const bol = []; for (let i = 0; i < 14; i++) { const a = i / 14 * TAU; bol.push(P([x + 150 + Math.cos(a) * 18, 62 + Math.sin(a) * 12, z + 30])); } paper([bol]); wash(bol, [60, 80, 140], { a: 0.75 }); inkPoly(bol, { w: 0.7, os: 0 });
  const tray = P([x + 70, 56, z + 40]); C.fillStyle = rgba([196, 140, 70], 0.9); C.beginPath(); C.ellipse(tray[0], tray[1], 14 * VIEW.k / 1.4, 4, 0, 0, TAU); C.fill();
  for (const dx of [-6, 6]) { const g = P([x + 70 + dx, 62, z + 40]); C.fillStyle = rgba([180, 60, 30], 0.85); C.fillRect(g[0] - 2, g[1] - 5, 4, 5); }
}
function copperDraw(x, z, pal) { // a stack of copper pots and trays
  const cu = [190, 110, 60];
  for (let k = 0; k < 3; k++) {
    const w = 60 - k * 14, h = 26 - k * 3, x0 = x + k * 7, y0 = k * 26, pts = [[x0 + 4, y0], [x0 + w - 4, y0], [x0 + w, y0 + h], [x0, y0 + h]];
    castShadow(pts.map(q => [q[0], q[1], z + 20]).concat([[x0, y0, z], [x0 + w, y0 + h, z]]), { a: 0.25 });
    paper([W2(pts, z + 20)]); wash(W2(pts, z + 20), cu, { a: 0.75, blot: 1 }); wash(W2([[x0 + w * 0.15, y0 + 2], [x0 + w * 0.3, y0 + 2], [x0 + w * 0.3, y0 + h - 2], [x0 + w * 0.15, y0 + h - 2]], z + 20), [255, 230, 190], { a: 0.25, rim: 0 }); inkPoly(W2(pts, z + 20), { w: 0.8 });
  }
  const tr = P([x + 30, 100, z + 4]); C.strokeStyle = rgba(darken(cu, 0.3), 0.9); C.lineWidth = 1.2; C.fillStyle = rgba(cu, 0.6); C.beginPath(); C.arc(tr[0], tr[1], 20 * VIEW.k / 1.4, 0, TAU); C.fill(); C.stroke();
}
function onggiDraw(x, z) { // Korean earthenware jars
  for (let k = 0; k < 3; k++) {
    const jx = x + 18 + k * 34, jh = 42 + (k % 2) * 14, jw = 30 - (k % 2) * 4, pts = [];
    for (let i = 0; i <= 12; i++) { const t = i / 12; pts.push([jx + Math.sin(t * Math.PI) * jw * 0.62, jh * t]); }
    for (let i = 12; i >= 0; i--) { const t = i / 12; pts.push([jx - Math.sin(t * Math.PI) * jw * 0.62, jh * t]); }
    castShadow(pts.map(q => [q[0], q[1], z + 10]), { a: 0.3 });
    paper([W2(pts, z + 10)]); wash(W2(pts, z + 10), [104, 66, 46], { a: 0.8, blot: 1 }); inkPoly(W2(pts, z + 10), { w: 0.8, os: 0 });
    const hl = P([jx - jw * 0.25, jh * 0.6, z + 10]); C.fillStyle = rgba([255, 255, 255], 0.35); C.beginPath(); C.ellipse(hl[0], hl[1], 2, 6, 0.3, 0, TAU); C.fill();
  }
}

function brassLantern(x, y, z) { // pierced brass lantern of the Persian / Levantine souq
  L3([x, y + 10, z], [x, y - 18, z], { w: 0.7 });
  const body = [[x - 10, y - 18], [x + 10, y - 18], [x + 13, y - 40], [x + 7, y - 62], [x - 7, y - 62], [x - 13, y - 40]];
  castShadow(body.map(q => [q[0], q[1], z]), { a: 0.3 });
  paper([W2(body, z)]); wash(W2(body, z), [200, 150, 70], { a: 0.75 }); wash(W2(body.slice(1, 5), z), [250, 220, 140], { a: 0.25, rim: 0 }); inkPoly(W2(body, z), { w: 0.8, os: 0 });
  for (let yy = y - 56; yy < y - 22; yy += 7) for (let xx = x - 7; xx <= x + 7; xx += 7) { const p = P([xx, yy, z]); C.fillStyle = rgba([90, 60, 30], 0.8); C.beginPath(); C.arc(p[0], p[1], 1.1, 0, TAU); C.fill(); }
  const top = [[x - 7, y - 62], [x + 7, y - 62], [x, y - 76]]; paper([W2(top, z)]); wash(W2(top, z), [170, 120, 60], { a: 0.8 }); inkPoly(W2(top, z), { w: 0.7, os: 0 });
}
