// ============================================================================
//  BASTI — architecture painters (part 3): upper floors, belts, roofs, utilities
// ============================================================================

// ---------------------------------------------------------------- upper floors
function upperFloor(S, v, R, pal, st, belt, isTop) {
  const W = v.x1 - v.x0, z = v.z, H = v.y1 - v.y0, sk = S.styleKey, ws = st.win;
  let band = 0;
  if (st.groundSign === 'upperBand' && v.floor === 1) band = belt === 'pent' ? 110 : 88;
  if (sk === 'straits' && v.floor === 1) band = 78;
  const span = { showa: [140, 190], straits: [150, 150], paris: [165, 200], fachwerk: [125, 160], med: [130, 170], dutch: [125, 160], taiwan: [150, 200], korea: [140, 180], persian: [120, 150], levant: [120, 150], lahore: [115, 150], beirut: [125, 160], lisbon: [150, 185], istanbul: [115, 145], hanoi: [150, 200], nola: [160, 200] }[sk];
  const nW = st.nWin || (sk === 'straits' ? (W > 400 ? 3 : 2) : Math.max(1, Math.round(W / R.range(...span))));
  if (sk === 'straits') S.bayN = nW;
  const bayW = W / nW;
  const pairs = !!ws.pairs;
  let winW = pairs ? bayW * R.range(...ws.w) : clamp(bayW * R.range(...ws.w), 50, ws.wMax);
  const winH = clamp(R.range(...ws.h), 60, H - band - 45);
  let sill;
  if (st.groundSign === 'upperBand') sill = v.y0 + band + R.range(8, 20);
  else if (sk === 'paris') sill = v.y0 + 24;
  else sill = v.y0 + band + Math.max(45, (H - band - winH) * 0.42);
  const top = typeof ws.top === 'string' ? ws.top : R.wpick(ws.top);
  const balFloors = S.contBalFloors || st.continuousBalcony;
  const contBal = !!balFloors && balFloors.includes(v.floor); // Haussmann: the 2nd and 5th floors
  const onGallery = !!S.galleryFloors && S.galleryFloors.includes(v.floor); // New Orleans: the gallery is the balcony
  // a floor that opens onto a balcony or gallery gets doors, not windows: from the floor to near the ceiling
  const doorsOut = (contBal || onGallery) && sk !== 'paris';
  const sacada = !!st.sacadaFloors && (st.sacadaFloors.includes(v.floor) || (isTop && st.sacadaFloors.includes('top'))); // Lisbon: a door and an iron balcony at every bay
  const base = {
    top, cols: R.int(...ws.cols), rows: R.int(...ws.rows), kind: ws.kind, frameCol: pal.frame, frameW: ws.kind === 'japanese' ? R.range(5, 8) : 7,
    curtainCol: mix(R.pick([pal.acc, pal.acc2, [240, 230, 210]]), [255, 255, 255], 0.45),
    grille: R.chance(ws.grille), shutters: R.chance(ws.shutters) ? ws.shutterKind : null, shutterCol: pal.shutter, recess: R.range(7, 12),
    surround: ws.surround, keystone: ws.keystone, relieving: ws.relieving, transom: ws.kind === 'japanese' && R.chance(0.4),
    balconette: !contBal && R.chance(ws.balconette) && sk !== 'med', cage: R.chance(ws.cage || 0), kashi: st.ornament.includes('kashi'),
    chhajja: R.chance(ws.chhajja || 0),
  };
  if (ws.kind === 'japanese') base.cols = R.pick([2, 2, 3, 4]);
  const doorH = Math.min(H - 70, Math.max(winH, H - 95)), doorY = v.y0 + 22;
  if (doorsOut) { sill = doorY; base.balconette = false; }
  // sign band on the first floor
  if (st.groundSign === 'upperBand' && v.floor === 1) {
    const sw = Math.min(W * R.range(0.55, 0.85), 420), sx = v.x0 + (W - sw) * R.range(0.2, 0.8);
    const sy0 = v.y0 + (belt === 'pent' ? 58 : 16), sy1 = sy0 + Math.min(62, band - (belt === 'pent' ? 62 : 22));
    if (sy1 - sy0 > 26) signBoard(S, { x0: sx, x1: sx + sw, y0: sy0, y1: sy1, z0: z, z1: z + 7 }, R.fork('sign'), pal, false, sk === 'taiwan' ? R.pick(['color', 'light']) : null, S.T.sign);
  }
  const balconyAt = sk === 'showa' && v.floor > 1 && R.chance(st.balcony) ? R.int(0, nW - 1) : -1;
  const medBalAt = (sk === 'med' && R.chance(ws.balconette)) || (st.medBal && R.chance(st.medBal)) ? R.int(0, nW - 1) : -1;
  const acAt = R.chance(S.retrofit === false ? 0 : st.utilities.ac) ? R.int(0, nW - 1) : -1;
  const orielP = (st.oriel || 0) * (sk === 'lahore' && st.use === 'shop' && v.mat.type !== 'nanakshahi' ? 0.3 : 1); // jharokhas belong to the older brick buildings
  let orielAt = orielP && !st.cumba && R.chance(orielP) ? Math.floor((nW - 1) / 2 + (nW % 2 ? 0 : R.int(0, 1))) : -1;
  // Istanbul: one cumba, decided on the first floor and repeated straight up the front
  let cumbaSpan = null;
  if (st.cumba && (v.floor === 1 ? R.chance(orielP) : !!S.cumba)) {
    if (v.floor === 1) { const cw = clamp(Math.min(W * 0.62, bayW * (nW >= 3 ? 2 : 1.3)), 150, 330); S.cumba = { cx: v.x0 + W / 2 + (nW >= 3 && nW % 2 === 0 ? 0 : 0), w: cw }; }
    const cb = S.cumba; cumbaSpan = [cb.cx - cb.w / 2, cb.cx + cb.w / 2];
    cumba(S, v, cb.cx, cb.w, R.fork('cumba'), pal, st);
  }
  const tripleAt = st.tripleArch && v.floor === 1 && orielAt < 0 && nW >= 3 && R.chance(st.tripleArch) ? Math.floor(nW / 2) : -1;
  const stairDoor = S.stairSide && v.floor === 1 ? (S.stairSide < 0 ? 0 : nW - 1) : -1;
  const wins = [];
  if (st.ornament.includes('timber')) {
    const nF = Math.max(2, Math.round(W / R.range(...(st.field || [95, 120])))), fw = W / nF, posts = [];
    for (let k = 0; k <= nF; k++) posts.push(clamp(v.x0 + fw * k, v.x0 + 7.5, v.x1 - 7.5));
    const pattern = nF >= 4 && R.chance(0.5) ? 'inner' : 'alt', fill = st.winFill || 0.68;
    const wantW = clamp(fw * fill, 50, (ws.wMax || 100)), wh = clamp(winH, 60, H - 70);
    for (let i = 0; i < nF; i++) {
      S.debug.bays.push({ x0: v.x0 + fw * i, x1: v.x0 + fw * (i + 1), y0: v.y0, y1: v.y1, z });
      const on = pattern === 'inner' ? i > 0 && i < nF - 1 : (i % 2 === (nF % 2 ? 1 : 0) || nF === 2);
      if (!on) continue;
      const cx = v.x0 + fw * (i + 0.5), s = { ...base, inside: R.wpick([[null, 2], ['curtain', 2], ['blind', 1.2]]) };
      if (R.chance(st.flora.windowBox || 0)) s.box = R.pick(['geranium', 'geranium', 'trailing', 'herbs']);
      windowEl(S, cx - wantW / 2, sill, wantW, wh, z, s, pal); wins.push({ x: cx - wantW / 2, y: sill, w: wantW, h: wh });
    }
    if (isTop) S.topWins = wins;
    timberFrame(S, v, wins, pal, posts);
    return;
  }
  for (let i = 0; i < nW; i++) {
    const cx = v.x0 + bayW * (i + 0.5);
    S.debug.bays.push({ x0: v.x0 + bayW * i, x1: v.x0 + bayW * (i + 1), y0: v.y0, y1: v.y1, z });
    const s = { ...base, inside: R.wpick([[null, 2], ['curtain', 2], ['blind', 1.2], ['plant', 0.6]]) };
    if (sk === 'med') s.shutterState = R.wpick([['open', 0.6], ['closed', 0.25], ['half', 0.15]]);
    if (R.chance(st.flora.windowBox || 0) && !s.balconette) s.box = R.pick(['geranium', 'geranium', 'trailing', 'herbs']);
    if (i === stairDoor) { // door onto the external stair landing
      const dw = 90, dx = S.stairSide < 0 ? v.x0 + 20 : v.x1 - 20 - dw;
      S.add(z + 0.3, () => drawDoor(dx, dx + dw, v.y0 + 4, v.y0 + 210, z, 'glazed', 'flat', { ...pal, fascia: [150, 156, 160] }, S));
      wins.push({ x: dx, y: v.y0 + 4, w: dw, h: 206 }); continue;
    }
    if (i === orielAt) { (st.jharokha ? jharokha : mashrabiya)(S, cx, v, sill, winW, winH, pal, R.fork('jh' + i), !!st.bangla); wins.push({ x: cx - winW / 2, y: sill, w: winW, h: winH }); continue; }
    if (i === tripleAt) { // Lebanese triple arch: three tall arched windows on slender columns
      const tw = Math.min(bayW * 1.25, W * 0.5), ww = tw / 3 - 8, x0 = cx - tw / 2;
      for (let k = 0; k < 3; k++) windowEl(S, x0 + k * (ww + 12), sill - 15, ww, winH + 30, z, { ...s, top: 'arch', shutters: null, cols: 2, rows: 3, noSill: k > 0, surround: false }, pal);
      for (let k = 1; k < 3; k++) { const cxk = x0 + k * (ww + 12) - 6; S.add(z + 6, () => { const c = { x0: cxk - 3, x1: cxk + 3, y0: sill - 15, y1: sill + winH + 15 - ww / 2, z0: z, z1: z + 5 }; drawBox(c, { col: [240, 238, 232], a: 0.4, w: 0.7 }); }); }
      wins.push({ x: x0, y: sill, w: tw, h: winH }); continue;
    }
    if (i === balconyAt) {
      const dw = Math.min(bayW - 20, winW + 20), dh = Math.min(H - 40, winH + (sill - v.y0) - 18);
      windowEl(S, cx - dw / 2, v.y0 + 14, dw, dh, z, { ...s, grille: false, shutters: null, cols: 2, transom: true, box: null }, pal);
      balcony(S, cx - dw / 2 - 30, cx + dw / 2 + 30, v.y0 + 8, z, R.fork('bal' + i), pal);
      wins.push({ x: cx - dw / 2, y: v.y0 + 14, w: dw, h: dh });
      continue;
    }
    if (cumbaSpan && cx > cumbaSpan[0] - 10 && cx < cumbaSpan[1] + 10) continue;
    const xs = pairs ? [cx - 14 - winW, cx + 14] : [cx - winW / 2];
    for (const x of xs) {
      if (sacada) { const dw = Math.max(winW, 70); windowEl(S, cx - dw / 2, doorY - 4, dw, doorH, z, { ...s, box: null, balconette: false, grille: false }, pal); ironBalcony(S, cx - dw / 2 - 22, cx + dw / 2 + 22, doorY - 4, z, 42, pal, R.chance(0.4)); wins.push({ x: cx - dw / 2, y: doorY, w: dw, h: doorH }); continue; }
      if (doorsOut) { windowEl(S, x, doorY, winW, doorH, z, { ...s, box: null }, pal); wins.push({ x, y: doorY, w: winW, h: doorH }); continue; }
      if (i === medBalAt) { windowEl(S, x, v.y0 + 18, winW, winH + (sill - v.y0 - 18), z, { ...s, box: null }, pal); ironBalcony(S, x - 25, x + winW + 25, v.y0 + 18, z, 45, pal, true); wins.push({ x, y: v.y0 + 18, w: winW, h: winH }); }
      else { windowEl(S, x, sill, winW, winH, z, s, pal); wins.push({ x, y: sill, w: winW, h: winH }); }
    }
    if (i === acAt) {
      const side = (cx - winW / 2 - 85 > v.x0 + 6) ? -1 : (cx + winW / 2 + 85 < v.x1 - 6 ? 1 : 0);
      if (side && !pairs) acUnit(S, side < 0 ? cx - winW / 2 - 82 : cx + winW / 2 + 10, sill + R.range(-10, 30), z, R.fork('ac' + i));
      else if (sill - v.y0 > 70) acUnit(S, cx - 36, sill - 62, z, R.fork('ac' + i));
    }
  }
  if (isTop) S.topWins = wins;
  if (st.ornament.includes('timber')) timberFrame(S, v, wins, pal);
  if (st.ornament.includes('brickPanels')) S.add(z + 0.15, () => { // recessed panels of herringbone brick between the openings
    const xs = [v.x0 + 14, ...wins.flatMap(w => [w.x - 22, w.x + w.w + 22]), v.x1 - 14].sort((a, b) => a - b);
    for (let i = 0; i < xs.length - 1; i += 2) {
      const a = xs[i], bb = xs[i + 1]; if (bb - a < 34) continue;
      const py0 = v.y0 + 30, py1 = v.y1 - 30, q = quad(a, py0, bb, py1, z);
      wash(q, darken(v.mat.col, 0.12), { a: 0.25, rim: 0 }); inkPoly(q, { w: 0.6, a: 0.7 });
      C.save(); pathOf(q); C.clip();
      for (let yy = py0; yy < py1 + 40; yy += 9) for (let xx = a; xx < bb; xx += 16) { L3([xx, yy, z], [xx + 8, yy + 8, z], { w: 0.35, a: 0.5, os: 0, brk: 0 }); L3([xx + 8, yy + 8, z], [xx + 16, yy, z], { w: 0.35, a: 0.5, os: 0, brk: 0 }); }
      C.restore();
    }
  });
  if (contBal && !onGallery) ironBalcony(S, v.x0 - 6, v.x1 + 6, v.y0 + 24, z, sk === 'paris' ? 50 : sk === 'nola' ? 85 : 70, pal, sk !== 'paris' && R.chance(0.6));
  if (st.ornament.includes('pilasters')) {
    for (let i = 0; i <= nW; i++) {
      const x = v.x0 + bayW * i, pw = st.fins ? 12 : 26, x0 = clamp(x - pw / 2, v.x0, v.x1 - pw);
      const b = { x0, x1: x0 + pw, y0: v.y0 + (v.floor === 1 ? band : 0), y1: v.y1 - 12, z0: z, z1: z + 6 };
      S.add(z + 6.2, () => { shadowBox(b, { a: 0.35 }); drawBox(b, { col: mix(v.mat.col, [255, 255, 255], 0.3), a: 0.45, w: D_INK, front: () => { if (st.fins) return; const q = quad(b.x0 - 4, b.y1 - 16, b.x1 + 4, b.y1, z + 7); paper([q]); wash(q, mix(v.mat.col, [255, 255, 255], 0.4), { a: 0.5 }); inkPoly(q, { w: 0.7 }); } }); });
    }
    if (st.ornament.includes('panels') && v.floor > 1) { // moulded plaster panels under the windows
      S.add(z + 0.25, () => {
        for (const w of wins) { const q = quad(w.x + 4, v.y0 + 14, w.x + w.w - 4, w.y - 14, z); if (w.y - v.y0 < 40) continue; inkPoly(q, { w: 0.6, a: 0.7 }); inkPoly(quad(w.x + 9, v.y0 + 19, w.x + w.w - 9, w.y - 19, z), { w: 0.4, a: 0.5 }); const c = P([w.x + w.w / 2, (v.y0 + w.y) / 2, z]); C.strokeStyle = rgba(COL.ink, 0.6); C.lineWidth = 0.6; C.beginPath(); for (let a = 0; a < 4 * Math.PI; a += 0.2) { const r = a * 0.6 * VIEW.k; C.lineTo(c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r * 0.6); } C.stroke(); }
      });
    }
  }
  if (sk === 'showa' && R.chance(0.35)) bracketSignCJK(S, v, band, z, R, pal);
}

function bracketSignCJK(S, v, band, z, R, pal) {
  const side = R.chance(0.5) ? -1 : 1, bx = side < 0 ? v.x0 - 10 : v.x1 - 40, by = v.y0 + band + 20;
  const b = { x0: bx, x1: bx + 50, y0: by, y1: by + 50, z0: z + 34, z1: z + 38 };
  S.add(z + 38, () => {
    shadowBox(b);
    L3([bx + 25, by + 50, z], [bx + 25, by + 60, z + 36], { w: 0.8 });
    drawBox(b, { col: RR.pick([[246, 242, 230], pal.acc2]), a: 0.4, w: D_INK, front: f => sceneText(S, f, 6, 6, 44, 44, S.T.mark, { col: RR.pick([[40, 34, 30], [180, 50, 40]]) }) });
  });
}

function balcony(S, x0, x1, y0, z, R, pal) {
  const d = R.range(45, 70), rh = R.range(85, 100);
  const slab = { x0, x1, y0: y0 - 10, y1: y0, z0: z, z1: z + d };
  const solid = R.chance(0.45), col = solid ? R.pick([pal.wall1, pal.acc2, [230, 230, 224]]) : pal.metal;
  S.add(z + d, () => {
    shadowBox({ ...slab, y1: y0 + rh });
    drawBox(slab, { col: [214, 212, 206], w: D_INK });
    if (RR.chance(0.5)) laundry(x0 + 6, x1 - 6, y0 + rh + 45, z + d * 0.4, pal);
    const rail = { x0, x1, y0, y1: y0 + rh, z0: z + d - 4, z1: z + d };
    if (solid) drawBox(rail, { col, a: 0.55, w: D_INK, blot: 2 });
    else {
      const n = Math.round((x1 - x0) / 11);
      for (let k = 0; k <= n; k++) { const xx = lerp(x0, x1, k / n); L3([xx, y0, z + d], [xx, y0 + rh, z + d], { w: 0.55, a: 0.8 }); }
      for (const side of [x0, x1]) L3([side, y0 + rh, z + d], [side, y0 + rh, z], { w: 0.6 });
      L3([x0, y0 + rh, z + d], [x1, y0 + rh, z + d], { w: D_INK }); L3([x0, y0 + rh - 6, z + d], [x1, y0 + rh - 6, z + d], { w: 0.5 });
    }
    const np = RR.int(0, 3);
    for (let k = 0; k < np; k++) { const pp = P([RR.range(x0 + 20, x1 - 20), y0 + rh, z + d - 10]); foliage(pp[0], pp[1] - 6, RR.range(12, 24) * VIEW.k, RR.range(10, 18) * VIEW.k, { leaf: 6 }); }
  });
}
function laundry(x0, x1, ly, zz, pal) {
  inkLine([P([x0, ly, zz]), P([(x0 + x1) / 2, ly - 6, zz]), P([x1, ly, zz])], { w: 0.45, os: 0 });
  let xx = x0 + RR.range(4, 20);
  while (xx < x1 - 26) {
    const cw = RR.range(14, 30), ch = RR.range(20, 45), c = RR.pick([pal.acc, pal.acc2, [240, 240, 236], [120, 140, 190], [236, 200, 120]]);
    const sag = Math.sin((xx - x0) / (x1 - x0) * Math.PI) * 6;
    const q = quad(xx, ly - sag - ch - 2, xx + cw, ly - sag - 2, zz); paper([q]); wash(q, c, { a: 0.55, amp: 1.2 }); inkPoly(q, { w: 0.5, a: 0.7 });
    xx += cw + RR.range(3, 12);
  }
}
// wrought-iron balcony on a thin stone slab with little corbels
function ironBalcony(S, x0, x1, y0, z, d, pal, pots) {
  const slab = { x0, x1, y0: y0 - 12, y1: y0, z0: z, z1: z + d }, rh = 95;
  S.add(z + d + 0.3, () => {
    castShadow(boxCorners({ ...slab, y1: y0 + rh }), { a: 0.35 });
    for (let x = x0 + 12; x < x1 - 8; x += 60) { const c = [[x, y0 - 12], [x + 10, y0 - 12], [x + 10, y0 - 30], [x + 4, y0 - 34]]; wash(W2(c, z + 2), pal.stone, { a: 0.5 }); inkPoly(W2(c, z + 2), { w: 0.6 }); }
    drawBox(slab, { col: pal.stone, a: 0.5, w: D_INK });
    const zz = z + d;
    L3([x0, y0 + rh, zz], [x1, y0 + rh, zz], { w: 1.5 }); L3([x0, y0 + 8, zz], [x1, y0 + 8, zz], { w: 0.8 });
    for (let x = x0; x <= x1 + 0.1; x += 10) L3([x, y0, zz], [x, y0 + rh, zz], { w: 0.5, os: 0, brk: 0 });
    for (let x = x0 + 10; x < x1 - 5; x += 20) { const c = P([x, y0 + rh * 0.55, zz]), r = 5 * VIEW.k; C.strokeStyle = rgba(COL.ink, 0.75); C.lineWidth = 0.7; C.beginPath(); C.arc(c[0], c[1], r, 0, TAU); C.stroke(); }
    for (const xx of [x0, x1]) { L3([xx, y0 + rh, zz], [xx, y0 + rh, z], { w: 0.8 }); L3([xx, y0, zz], [xx, y0 + rh, zz], { w: 1.1 }); }
    if (pots) { const n = RR.int(1, 3); for (let k = 0; k < n; k++) potPlant(RR.range(x0 + 15, x1 - 35), y0, z + d * 0.5, RR.pick(['geranium', 'bush', 'spiky']), RR.pick(['terracotta']), pal, 0.7); }
  });
}

function acUnit(S, x, y, z, R) {
  const b = { x0: x, x1: x + 72, y0: y, y1: y + 50, z0: z, z1: z + 26 };
  S.add(z + 26, () => {
    shadowBox(b);
    drawBox(b, { col: [236, 234, 228], a: 0.3, w: D_INK, front: () => {
      const c = [x + 50, y + 25, z + 26], r = 17;
      const circ = k => { const o = []; for (let i = 0; i < 20; i++) { const a = i / 20 * TAU; o.push(P([c[0] + Math.cos(a) * r * k, c[1] + Math.sin(a) * r * k, c[2]])); } return o; };
      wash(circ(1), [120, 120, 130], { a: 0.4 });
      inkPoly(circ(1), { w: 0.6, os: 0.5 }); inkPoly(circ(0.4), { w: 0.4, os: 0 });
      for (let k = 0; k < 4; k++) L3([x + 6, y + 10 + k * 8, z + 26], [x + 26, y + 10 + k * 8, z + 26], { w: 0.4, a: 0.6 });
    } });
    const px = x + (RR.chance(0.5) ? 4 : 68);
    inkLine([P([px, y, z + 4]), P([px, y - 30, z + 4]), P([px + RR.range(-40, 40), y - 45, z + 4])], { w: 0.8 });
  });
}

// ---------------------------------------------------------------- belt elements
function beltEl(S, vols, R, pal, belt, st) {
  const g = vols[0], H0 = g.y1, z = Math.max(0, g.z), ov = R.range(8, 20);
  const x0 = g.x0 - ov, x1 = g.x1 + ov;
  if (belt === 'pent') {
    const yTop = H0 + R.range(40, 55), yF = H0 - R.range(0, 12), dz = R.range(65, 90);
    const len = Math.hypot(yTop - yF, dz), V = [0, (yTop - yF) / len, -dz / len];
    const face = new Face([x0, yF, z + dz], [1, 0, 0], V, rectP(x1 - x0, len));
    const pts = [[x0, yF, z + dz], [x1, yF, z + dz], [x0, yTop, z], [x1, yTop, z], [x0, yF - 7, z + dz], [x1, yF - 7, z + dz]];
    S.add(z + dz, () => { castShadow(pts); tileRoof(face, x1 - x0, len, pal, true, null, 'kawara'); const fas = quad(x0, yF - 7, x1, yF, z + dz); paper([fas]); wash(fas, darken(pal.roof, 0.2), { a: 0.55 }); inkPoly(fas, { w: D_INK }); });
    S.creepLines = [[face.w3(0, len * 0.95), face.w3(x1 - x0, len * 0.95)]];
  } else if (belt === 'awning' || belt === 'awningScallop') {
    const yA = S.awningTop ?? H0 - R.range(10, 25), drop = R.range(45, 70), dz = R.range(95, 140), vh = R.range(18, 26);
    const ax0 = g.x0 + R.range(0, 20), ax1 = g.x1 - R.range(0, 20);
    const yB = yA - drop, len = Math.hypot(drop, dz), V = [0, drop / len, -dz / len];
    const face = new Face([ax0, yB, z + dz], [1, 0, 0], V, rectP(ax1 - ax0, len));
    const stripes = st.script === 'latin' ? R.chance(0.45) : R.chance(0.7), sw = R.range(18, 30);
    const c1 = st.script === 'latin' && !stripes ? R.pick([pal.fascia, [150, 50, 50], [60, 90, 70], [200, 150, 60]]) : pal.acc;
    const c2 = R.chance(0.6) ? [250, 248, 242] : mix(c1, [255, 255, 255], 0.6);
    const scal = belt === 'awningScallop';
    const pts = [[ax0, yA, z], [ax1, yA, z], [ax0, yB - vh, z + dz], [ax1, yB - vh, z + dz]];
    S.add(z + dz, () => {
      castShadow(pts, { a: 0.5 });
      const W = ax1 - ax0, n = stripes ? Math.round(W / sw) : 1;
      const all = face.spoly(); paper([all, quad(ax0, yB - vh, ax1, yB, z + dz)]);
      const sx = VIEW.cx < ax0 ? ax0 : VIEW.cx > ax1 ? ax1 : null;
      if (sx != null) { const tri = [P([sx, yA, z]), P([sx, yB, z + dz]), P([sx, yB - vh, z + dz])]; paper([tri]); wash(tri, c1, { a: 0.6 }); wash(tri, COL.shadow, { a: 0.4 }); inkPoly(tri, { w: D_INK }); }
      for (let k = 0; k < n; k++) {
        const s0 = W * k / n, s1 = W * (k + 1) / n, c = k % 2 ? c2 : c1, pale = c === c2 && c2[0] > 245;
        wash(face.spoly([[s0, 0], [s1, 0], [s1, len], [s0, len]]), c, { a: pale ? 0.08 : 0.62, amp: 0.8, g0: 1.2, g1: 0.75, gang: -Math.PI / 2 });
        const vq = [];
        if (scal) { vq.push(P([ax0 + s0, yB, z + dz]), P([ax0 + s1, yB, z + dz])); for (let t = 1; t >= 0; t -= 0.2) vq.push(P([ax0 + lerp(s0, s1, t), yB - vh + Math.sin(t * Math.PI) * -5 + 3, z + dz])); }
        else vq.push(...quad(ax0 + s0, yB - vh, ax0 + s1, yB, z + dz));
        wash(vq, c, { a: pale ? 0.08 : 0.7, amp: 0.5 });
        if (k) inkLine([face.sp(s0, 0), face.sp(s0, len)], { w: 0.4, a: 0.5 });
      }
      wash(all, COL.shadow, { a: 0.22, g0: 0, g1: 1, gang: -Math.PI / 2, rim: 0 });
      for (let k = 0; k < W / 30; k++) { const s = RR.range(0, W); wash(face.spoly([[s, 0], [s + RR.range(4, 10), 0], [s + RR.range(4, 10), len], [s, len]]), darken(c1, 0.3), { a: 0.12, rim: 0, off: 0, amp: 0.4 }); }
      wash(quad(ax0, yB - vh, ax1, yB, z + dz), COL.shadow, { a: 0.18, rim: 0, g0: 0.3, g1: 1 });
      inkPoly(all, { w: W_INK });
      if (scal) { const bot = []; for (let k = 0; k < n; k++) for (let t = 0; t <= 1; t += 0.2) bot.push(P([ax0 + W * (k + t) / n, yB - vh + 3 - Math.sin(t * Math.PI) * 5, z + dz])); inkLine(bot, { w: D_INK, os: 0 }); }
      else L3([ax0, yB - vh, z + dz], [ax1, yB - vh, z + dz], { w: D_INK });
      L3([ax0, yB - vh, z + dz], [ax0, yB, z + dz], { w: D_INK }); L3([ax1, yB - vh, z + dz], [ax1, yB, z + dz], { w: D_INK });
      const vf = new Face([ax0, yB - vh, z + dz], [1, 0, 0], [0, 1, 0], rectP(W, vh));
      if (RR.chance(0.75)) sceneText(S, vf, W * 0.15, 2, W * 0.85, vh - 2, S.T.script === 'latin' ? S.label : S.T.label, { col: stripes ? [60, 40, 40] : [250, 246, 236], size: 0.7 });
      for (const xx of [ax0 + 10, ax1 - 10]) L3([xx, yA - drop - 40, z], [xx, yB, z + dz * 0.95], { w: 0.6 });
    });
    S.creepLines = [];
  } else if (belt === 'chhajja') { // thin cantilevered concrete sunshade on brackets, the length of the shopfront
    const dz = R.range(55, 80), th = R.range(8, 12), yb = H0 + R.range(4, 14);
    const b = { x0, x1, y0: yb, y1: yb + th, z0: z, z1: z + dz };
    S.add(z + dz, () => {
      shadowBox({ ...b, y0: yb - 3 }, { a: 0.55 });
      const n = Math.max(2, Math.round((x1 - x0) / 140));
      for (let k = 0; k <= n; k++) { const bx = lerp(x0 + 14, x1 - 20, k / n), br = [[bx, yb], [bx + 6, yb], [bx + 6, yb - 28]]; wash(br.map(q => P([q[0], q[1], z + dz * 0.5])), [196, 192, 184], { a: 0.65, rim: 0, off: 0 }); inkLine([P([bx, yb, z + dz * 0.5]), P([bx + 6, yb - 28, z + dz * 0.5])], { w: 0.7, os: 0 }); }
      drawBox(b, { col: [212, 208, 200], a: 0.55, w: W_INK, blot: 2 });
      for (let k = 0; k < 3; k++) { const sx = RR.range(x0, x1 - 20); wash(quad(sx, yb - RR.range(10, 30), sx + RR.range(8, 20), yb, z), [120, 112, 104], { a: 0.2, rim: 0, g0: 1, g1: 0, gang: -Math.PI / 2 }); }
    });
    S.creepLines = [[[x0, yb + th, z + dz * 0.8], [x1, yb + th, z + dz * 0.8]]];
  } else if (belt === 'slab') {
    const dz = R.range(55, 95), th = R.range(14, 22);
    const b = { x0, x1, y0: H0 - 4, y1: H0 - 4 + th, z0: z, z1: z + dz };
    S.add(z + dz, () => { shadowBox(b, { a: 0.5 }); drawBox(b, { col: [206, 204, 198], a: 0.5, w: W_INK, blot: 2 }); });
    S.creepLines = [[[x0, H0 - 4 + th, z + dz * 0.7], [x1, H0 - 4 + th, z + dz * 0.7]]];
  }
}

// ---------------------------------------------------------------- roof tiles
// patterns: kawara (Japanese pan rows), pantile / coppi (channels down the
// slope), beaver (German Biberschwanz scallops), slate, zinc (standing seams)
function tileRoof(face, w, len, pal, eaveTiles, poly, pattern = 'kawara') {
  const outline = face.spoly(poly || face.poly);
  paper([outline]);
  wash(outline, pal.roof, { a: 0.6, blot: 3, blotA: 0.2, g0: 0.8, g1: 1.2, gang: Math.PI / 2 });
  const inside = (s, t) => { if (!poly) return s > 1 && s < w - 1; const q = poly, tt = t / len, l = lerp(q[0][0], q[3][0], tt), r = lerp(q[1][0], q[2][0], tt); return s > l + 2 && s < r - 2; };
  const m = texMask(RR, pattern === 'zinc' ? -1 : 0.3), fake = { x0: 0, x1: w, y0: 0, y1: len };
  const seg = (s0, t0, s1, t1, o) => inkLine([face.sp(s0, t0), face.sp(s1, t1)], o);
  if (pattern === 'pantile' || pattern === 'coppi') {
    const cw = pattern === 'coppi' ? 17 : 15;
    for (let s = cw / 2; s < w; s += cw) {
      let run = null;
      for (let t = 0; t <= len; t += 6) { const on = t < len && inside(s, t) && m(s, t, fake); if (on && run == null) run = t; if ((!on || t >= len) && run != null) { if (t - run > 10) seg(s, run, s, t, { w: 0.55, a: 0.65, brk: 0.2, os: 0.5 }); run = null; } }
      if (RR.chance(0.1)) wash(face.spoly([[s, 0], [s + cw, 0], [s + cw, len], [s, len]]), darken(pal.roof, 0.25), { a: 0.18, rim: 0, amp: 0.4 });
    }
    for (let t = 30; t < len; t += 30) for (let s = 0; s < w; s += cw) if (inside(s, t) && m(s, t, fake) && RR.chance(0.5)) seg(s, t, s + cw, t, { w: 0.4, a: 0.45, os: 0 });
    if (eaveTiles) for (let s = cw / 2; s < w; s += cw) { if (!inside(s, 2)) continue; const c = face.sp(s, 1); C.strokeStyle = rgba(COL.ink, 0.75); C.lineWidth = 0.7; C.beginPath(); C.arc(c[0], c[1] + 1, 3 * VIEW.k / 1.6, 0, Math.PI, true); C.stroke(); }
  } else if (pattern === 'zinc') {
    for (let s = 22; s < w - 4; s += 44) if (inside(s, len / 2)) seg(s, 0, s, len, { w: 0.6, a: 0.65, brk: 0.3 });
    seg(0, len * 0.02, w, len * 0.02, { w: 0.5, a: 0.5 });
  } else { // kawara, beaver, slate: courses across the slope
    const rowH = pattern === 'slate' ? 12 : pattern === 'beaver' ? 10 : 11, colW = pattern === 'beaver' ? 12 : 15;
    for (let t = rowH, row = 0; t < len - 2; t += rowH, row++) {
      let run = null;
      for (let s = 0; s <= w; s += 5) {
        const on = s < w && inside(s, t) && m(s, t, fake);
        if (on && run == null) run = s;
        if ((!on || s >= w) && run != null) { if (s - run > 10) seg(run, t, s, t, { w: 0.5, a: 0.6, brk: 0.2, os: 1 }); run = null; }
      }
      for (let s = (row % 2 ? colW / 2 : 0); s < w; s += colW) {
        if (!inside(s, t) || !m(s, t - 3, fake)) continue;
        if (pattern === 'beaver') inkLine([face.sp(s, t - 2), face.sp(s + colW / 2, t - rowH + 1), face.sp(s + colW, t - 2)], { w: 0.45, a: 0.55, os: 0 });
        else if (pattern === 'slate') seg(s, t - rowH, s, t, { w: 0.4, a: 0.5, os: 0 });
        else inkLine([face.sp(s, t - rowH + 1), face.sp(s + 3, t - rowH / 2), face.sp(s, t - 1)], { w: 0.45, a: 0.55, os: 0 });
        if (RR.chance(0.13)) wash(face.spoly([[s, t - rowH], [s + colW, t - rowH], [s + colW, t], [s, t]]), darken(pal.roof, 0.3), { a: 0.3, rim: 0, amp: 0.4 });
      }
    }
    if (eaveTiles) for (let s = 7.5; s < w; s += 15) { if (!inside(s, 2)) continue; const c = face.sp(s, 2); C.strokeStyle = rgba(COL.ink, 0.7); C.lineWidth = 0.7; C.beginPath(); C.arc(c[0], c[1] + 2, 2.4 * VIEW.k / 1.6, 0, TAU); C.stroke(); }
  }
  wash(outline, COL.shadow, { a: 0.18, g0: 0, g1: 1, gang: Math.PI / 2, rim: 0 });
  inkPoly(outline, { w: W_INK });
}

// ---------------------------------------------------------------- roofs
function roof(S, v, R, pal, st) {
  const W = v.x1 - v.x0, z = v.z, cx = (v.x0 + v.x1) / 2;
  const type = logPick(S, R, 'Roof', st.roof, 'roof forms this locale uses');
  S.roofType = type;
  const bound = (...p) => S.bounds.push(...p);
  const tile = st.tile;
  if (type === 'flat' || type === 'terrace') {
    const cop = { x0: v.x0 - 6, x1: v.x1 + 6, y0: v.y1, y1: v.y1 + R.range(12, 22), z0: z - 20, z1: z + 8 };
    if (type === 'terrace') { cop.y1 = v.y1 + R.range(70, 95); cop.z0 = z - 6; }
    bound([cop.x0, cop.y1, z]);
    S.add(z + 8, () => { shadowBox(cop, { a: 0.45 }); drawBox(cop, { col: type === 'terrace' ? v.mat.col : [214, 212, 206], w: W_INK, blot: 1 }); if (type === 'terrace') { const cap = quad(cop.x0 - 3, cop.y1 - 8, cop.x1 + 3, cop.y1, z + 9); paper([cap]); wash(cap, pal.stone, { a: 0.5 }); inkPoly(cap, { w: D_INK }); } });
    S.roofLine = [[cop.x0, cop.y1, z], [cop.x1, cop.y1, z]];
    if (type === 'terrace') { // roof garden: pergola and pots behind the parapet
      const py = cop.y1, ph = R.range(120, 160), pz = z - 60;
      bound([cx, py + ph, pz]);
      S.add(pz, () => {
        for (const x of [v.x0 + 30, cx, v.x1 - 30]) L3([x, py, pz], [x, py + ph, pz], { w: 1.1 });
        L3([v.x0 + 10, py + ph, pz], [v.x1 - 10, py + ph, pz], { w: 1.3 }); for (let x = v.x0 + 20; x < v.x1; x += 30) L3([x, py + ph - 4, pz], [x + 8, py + ph + 6, pz], { w: 0.7 });
        for (let k = 0; k < 3; k++) { const p = P([lerp(v.x0 + 40, v.x1 - 40, RR.f()), py + ph - 10, pz]); foliage(p[0], p[1], RR.range(40, 70) * VIEW.k, 20 * VIEW.k, { leaf: 6.5, flowers: RR.chance(0.5) ? { cols: [[200, 60, 130], [220, 90, 150]], dens: 0.25 } : null }); }
      });
      return;
    }
    const items = R.int(1, 3);
    for (let i = 0; i < items; i++) {
      const k = R.wpick([['tank', 1], ['hut', 1], ['antenna', 1.2], ['rail', 0.7]]);
      const x = R.range(v.x0 + 30, v.x1 - 90), yb = cop.y1, zb = z - 60;
      if (k === 'tank') { const b = { x0: x, x1: x + 70, y0: yb + 20, y1: yb + 80, z0: zb, z1: zb + 60 }; bound([x, b.y1, zb]); S.add(zb, () => { for (const xx of [x + 8, x + 62]) L3([xx, yb, zb + 30], [xx, yb + 20, zb + 30], { w: D_INK }); drawBox(b, { col: [206, 212, 216], w: D_INK, blot: 1 }); for (let yy = b.y0 + 12; yy < b.y1; yy += 14) L3([b.x0, yy, zb + 60], [b.x1, yy, zb + 60], { w: 0.4, a: 0.5 }); }); }
      else if (k === 'hut') { const b = { x0: x, x1: x + R.range(70, 110), y0: yb, y1: yb + R.range(55, 85), z0: zb - 40, z1: zb + 20 }; bound([x, b.y1, zb]); S.add(zb, () => { drawBox(b, { col: mix(pal.wall1, [200, 200, 200], 0.3), w: D_INK, blot: 2 }); const dq = quad(b.x0 + 12, b.y0, b.x0 + 36, b.y0 + 45, zb + 20); wash(dq, pal.frame, { a: 0.5 }); inkPoly(dq, { w: D_INK }); }); }
      else if (k === 'antenna') { const h = R.range(80, 150); bound([x, yb + h, zb]); S.add(zb, () => { L3([x, yb, zb], [x + 3, yb + h, zb], { w: 0.8 }); for (let k2 = 0; k2 < 4; k2++) { const yy = yb + h * (0.55 + k2 * 0.12), l = 40 - k2 * 7; L3([x - l / 2, yy, zb], [x + l / 2, yy + 2, zb], { w: 0.6 }); } }); }
      else { S.add(z, () => { const yy = cop.y1 + 45; L3([v.x0 + 10, yy, z - 10], [v.x1 - 10, yy, z - 10], { w: 0.6 }); for (let xx = v.x0 + 10; xx < v.x1; xx += 40) L3([xx, cop.y1, z - 10], [xx, yy, z - 10], { w: 0.5 }); }); bound([v.x0, cop.y1 + 45, z]); }
    }
  } else if (type === 'hip' || type === 'terracotta' || type === 'slateHip' || type === 'sideGable') {
    const terra = type === 'terracotta', slate = type === 'slateHip', side = type === 'sideGable';
    if (slate) pal = { ...pal, roof: R.pick([[104, 108, 118], [92, 98, 110]]) }; // Genoese ardesia
    // Ottoman houses carry deep eaves; a Creole cottage's side-gabled roof is steep and runs out over the banquette
    const ov = st.wideEaves || side ? R.range(55, 80) : terra ? R.range(35, 50) : R.range(25, 40), rise = side ? R.range(160, 220) : terra ? R.range(45, 70) : R.range(70, 110), run = side ? R.range(210, 260) : R.range(120, 170);
    const len = Math.hypot(rise, run + ov), V = [0, rise / len, -(run + ov) / len];
    const w = W + ov * 2, ins = side ? 0 : Math.min(w * 0.3, run * (terra ? 1.5 : 1.1));
    const face = new Face([v.x0 - ov, v.y1 - 4, z + ov], [1, 0, 0], V, [[0, 0], [w, 0], [w - ins, len], [ins, len]]);
    const pts = [face.w3(0, 0), face.w3(w, 0), face.w3(ins, len), face.w3(w - ins, len), [v.x0 - ov, v.y1 - 12, z + ov], [v.x1 + ov, v.y1 - 12, z + ov]];
    bound(...pts);
    S.add(z + ov, () => {
      castShadow(pts, { a: 0.5 });
      if (terra) for (let x = v.x0 + 10; x < v.x1 - 5; x += 45) { const c = [[x, v.y1 - 4], [x + 10, v.y1 - 4], [x + 10, v.y1 - 18], [x + 3, v.y1 - 22]]; wash(W2(c, z + 2), pal.stone, { a: 0.5 }); inkPoly(W2(c, z + 2), { w: 0.6 }); }
      tileRoof(face, w, len, pal, true, face.poly, slate || tile === 'slate' ? 'slate' : terra ? 'coppi' : tile === 'pantile' ? 'pantile' : 'kawara');
      const fas = quad(v.x0 - ov, v.y1 - 12, v.x1 + ov, v.y1 - 4, z + ov); paper([fas]); wash(fas, darken(pal.roof, 0.25), { a: 0.5 }); inkPoly(fas, { w: D_INK });
      inkLine([face.sp(ins, len), face.sp(w - ins, len)], { w: 2.2 });
      inkLine([face.sp(0, 0), face.sp(ins, len)], { w: 1.4 }); inkLine([face.sp(w, 0), face.sp(w - ins, len)], { w: 1.4 });
    });
    S.roofLine = [face.w3(ins, len * 0.9), face.w3(w - ins, len * 0.9)];
    if (st.dormers && R.chance(st.dormers)) dormers(S, v, face, len, ov, z + ov, R.fork('dormers'), pal);
  } else if (type === 'gable') {
    const rise = R.range(80, 130), ov = R.range(12, 22), apex = [cx, v.y1 + rise, z];
    const tri = [[v.x0, v.y1, z], [v.x1, v.y1, z], apex], plank = R.chance(0.5);
    bound(apex);
    S.add(z + ov, () => {
      const tp = tri.map(P); paper([tp]);
      wash(tp, plank ? mix(pal.wood, [210, 210, 200], 0.4) : v.mat.col, { a: 0.55, blot: 2 });
      if (plank) for (let x = v.x0 + 14; x < v.x1; x += 14) { const t = 1 - Math.abs(x - cx) / (W / 2); L3([x, v.y1, z], [x, v.y1 + rise * t, z], { w: T_INK, a: 0.55 }); }
      const vq = quad(cx - 14, v.y1 + rise * 0.45 - 10, cx + 14, v.y1 + rise * 0.45 + 10, z); wash(vq, [90, 90, 100], { a: 0.5 }); inkPoly(vq, { w: D_INK });
      inkPoly(tp, { w: W_INK });
      for (const s of [-1, 1]) {
        const e = [s < 0 ? v.x0 - ov * 2 : v.x1 + ov * 2, v.y1 - ov * rise / (W / 2), z + ov], a = [cx, apex[1] + 8, z + ov];
        const bq = [P(e), P(a), P([a[0], a[1] - 12, a[2]]), P([e[0], e[1] - 12, e[2]])];
        paper([bq]); wash(bq, darken(pal.roof, 0.1), { a: 0.6 }); inkPoly(bq, { w: D_INK });
        castShadow([e, a, [a[0], a[1] - 12, a[2]], [e[0], e[1] - 12, e[2]], [e[0], e[1], z], [a[0], a[1], z]], { a: 0.45, recv: [{ x0: v.x0, x1: v.x1, y0: v.y0, y1: v.y1 + rise, z }] });
      }
    });
    S.roofLine = [[v.x0 + W * 0.2, v.y1 + rise * 0.4, z + ov], [v.x1 - W * 0.2, v.y1 + rise * 0.4, z + ov]];
  } else if (type === 'shed') {
    const hL = R.range(20, 40), hR = hL + R.range(50, 100), flip = R.chance(0.5), a = flip ? hR : hL, b = flip ? hL : hR;
    const poly = [[v.x0, v.y1, z], [v.x1, v.y1, z], [v.x1, v.y1 + b, z], [v.x0, v.y1 + a, z]];
    bound(...poly);
    const lid = [[v.x0 - 15, v.y1 + a, z + 25], [v.x1 + 15, v.y1 + b, z + 25], [v.x1 + 15, v.y1 + b + 8, z + 25], [v.x0 - 15, v.y1 + a + 8, z + 25]];
    S.add(z + 25, () => {
      const p = poly.map(P); paper([p]); wash(p, v.mat.col, { a: 0.55, blot: 2 }); inkPoly(p, { w: W_INK });
      castShadow(lid.concat(lid.map(q => [q[0], q[1], z])), { a: 0.5, recv: [{ x0: v.x0, x1: v.x1, y0: v.y0, y1: v.y1 + Math.max(a, b), z }] });
      const lp = lid.map(P); paper([lp]); wash(lp, [206, 206, 200], { a: 0.5 }); inkPoly(lp, { w: D_INK });
      const wx = cx - 30, wy = v.y1 + Math.min(a, b) * 0.2, wq = quad(wx, wy, wx + 60, wy + Math.min(a, b) * 0.55, z); wash(wq, pal.glass, { a: 0.5, g0: 1.3, g1: 0.4 }); inkPoly(wq, { w: D_INK });
    });
    S.roofLine = [[v.x0, v.y1 + a, z], [v.x1, v.y1 + b, z]];
  } else if (type === 'mansard') mansard(S, v, R, pal, st);
  else if (type === 'frontGable') frontGable(S, v, R, pal, st);
  else if (type === 'stepGable' || type === 'neckGable' || type === 'bellGable') dutchGable(S, v, R, pal, st, type);
  else if (type === 'corniceGable') corniceGable(S, v, R, pal, st);
  else if (type === 'decoParapet') decoParapet(S, v, R, pal, st);
  else if (type === 'pediment') pedimentParapet(S, v, R, pal, st);
  else if (type === 'chineseEave') chineseEave(S, v, R, pal, st);
  else if (type === 'shack') rooftopShack(S, v, R, pal);
  else if (type === 'jars') rooftopJars(S, v, R, pal);
  else if (type === 'badgir' || type === 'parapet') persianRoof(S, v, R, pal, type === 'badgir');
  else if (type === 'tanks') lahoreRoof(S, v, R, pal, st);
}

// Parisian mansard: steep zinc/slate face, dormers on the window axes below, party-wall chimneys
function mansard(S, v, R, pal, st) {
  const z = v.z, W = v.x1 - v.x0, hm = R.range(200, 240), dz = R.range(70, 95), ov = 12, y1 = v.y1;
  const len = Math.hypot(hm, dz), V = [0, hm / len, -dz / len];
  const face = new Face([v.x0 - ov, y1, z + ov], [1, 0, 0], V, rectP(W + ov * 2, len));
  const pat = st.mansardTile || (R.chance(0.6) ? 'zinc' : 'slate'); // Lisbon's águas-furtadas are tiled
  const order = z + ov + 1;
  S.bounds.push([v.x0, y1 + hm + 90, z - dz]);
  S.add(order, () => {
    tileRoof(face, W + ov * 2, len, { ...pal, roof: pal.roof }, false, null, pat);
    const cap = [face.sp(-4, len), face.sp(W + ov * 2 + 4, len), P([v.x1 + 4, y1 + hm + 8, z + ov - dz - 4]), P([v.x0 - 4, y1 + hm + 8, z + ov - dz - 4])];
    paper([cap]); wash(cap, darken(pal.roof, 0.15), { a: 0.6 }); inkPoly(cap, { w: D_INK });
    for (const cx of [v.x0 + 30, v.x1 - 90]) { // chimney stacks with pots
      const b = { x0: cx, x1: cx + 60, y0: y1 + hm - 30, y1: y1 + hm + 70, z0: z - dz - 30, z1: z + ov - dz + 6 };
      drawBox(b, { col: mix(pal.stone, [220, 160, 130], 0.3), a: 0.55, w: D_INK, blot: 1 });
      for (let k = 0; k < 3; k++) { const px = cx + 8 + k * 17, q = quad(px, b.y1, px + 10, b.y1 + 22, b.z1); paper([q]); wash(q, [200, 120, 90], { a: 0.7 }); inkPoly(q, { w: 0.6 }); }
    }
  });
  // dormers on the axes of the windows below — a hard rule of the facade
  const wins = S.topWins || [{ x: v.x0 + W / 2 - 40, w: 80 }];
  for (const wn of wins) {
    const t0 = 26, yb = y1 + t0 * hm / len, zf = z + ov - t0 * dz / len + 4, dw = wn.w + 16, dx0 = wn.x + wn.w / 2 - dw / 2, dh = Math.min(150, hm * 0.62);
    const b = { x0: dx0, x1: dx0 + dw, y0: yb, y1: yb + dh, z0: zf - 70, z1: zf };
    S.add(order + 1, () => {
      drawBox(b, { col: pal.stone, a: 0.55, w: D_INK });
      const ped = R.chance(0.5) ? [[dx0 - 8, yb + dh], [dx0 + dw + 8, yb + dh], [dx0 + dw / 2, yb + dh + 38]] : (() => { const o = [[dx0 - 8, yb + dh]]; for (let i = 0; i <= 10; i++) o.push([dx0 - 8 + (dw + 16) * i / 10, yb + dh + Math.sin(i / 10 * Math.PI) * 26]); return o; })();
      paper([W2(ped, zf + 2)]); wash(W2(ped, zf + 2), pal.stone, { a: 0.6 }); inkPoly(W2(ped, zf + 2), { w: D_INK });
    });
    windowEl(S, dx0 + 12, yb + 12, dw - 24, dh - 22, zf, { top: 'flat', cols: 2, rows: 3, kind: 'french', frameCol: pal.frame, frameW: 6, inside: R.chance(0.5) ? 'curtain' : null, curtainCol: [240, 236, 226], recess: 10, order: order + 1.5 - zf, noSill: true }, pal);
  }
  S.roofLine = null;
}

// German front gable: steep, framed, jettied once more, tiled verges
function frontGable(S, v, R, pal, st) {
  const W = v.x1 - v.x0, cx = (v.x0 + v.x1) / 2, rise = W * R.range(0.62, 0.78), zg = v.z + (S.jetty || 20), y1 = v.y1;
  const apex = [cx, y1 + rise], ov = 30, slope = rise / (W / 2);
  const T = pal.timber, tw = 14;
  S.bounds.push([cx, y1 + rise + 20, zg]);
  const atX = x => y1 + rise * (1 - Math.abs(x - cx) / (W / 2));
  const members = [];
  const quadM = (x0, y0, x1, y1_) => members.push([[x0, y0], [x1, y0], [x1, y1_], [x0, y1_]]);
  const brace = (x0, y0, x1, y1_, w = 11) => { const dx = x1 - x0, dy = y1_ - y0, l = Math.hypot(dx, dy), nx = -dy / l * w / 2, ny = dx / l * w / 2; members.push([[x0 + nx, y0 + ny], [x1 + nx, y1_ + ny], [x1 - nx, y1_ - ny], [x0 - nx, y0 - ny]]); };
  quadM(v.x0, y1, v.x1, y1 + 20);
  const collarY = y1 + rise * 0.45, cxL = cx - (W / 2) * (1 - 0.45), cxR = cx + (W / 2) * (1 - 0.45);
  quadM(cxL, collarY, cxR, collarY + 12);
  quadM(cx - tw / 2, y1 + 20, cx + tw / 2, apex[1] - 10);
  for (const s of [-1, 1]) { const x = cx + s * W / 4; quadM(x - tw / 2, y1 + 20, x + tw / 2, atX(x) - 8); brace(cx + s * W / 4, y1 + 22, cx + s * (W / 2 - 25), atX(cx + s * (W / 2 - 25)) - 10); }
  const winW = Math.min(70, W / 4 - 30), wins = [[cx - W / 8 - winW / 2, y1 + 50], [cx + W / 8 - winW / 2, y1 + 50]];
  S.add(zg, () => {
    castShadow(boxCorners({ x0: v.x0, x1: v.x1, y0: y1, y1: y1 + 6, z0: v.z, z1: zg }), { a: 0.45 });
    const tp = W2([[v.x0, y1], [v.x1, y1], apex], zg); paper([tp]); wash(tp, v.mat.col, { a: 0.6, blot: 3 });
    for (const m of members) { const p = W2(m.map(q => [q[0], Math.min(q[1], atX(q[0]) - 4)]), zg); wash(p, jit(T, 8), { a: 0.75, amp: 0.5, rim: 0.3, off: 0.3 }); inkPoly(p, { w: 0.8, os: 1 }); }
    inkPoly(tp, { w: W_INK });
    // tiled verges and barge boards on both slopes
    for (const s of [-1, 1]) {
      const ex = s < 0 ? v.x0 - ov : v.x1 + ov, ey = y1 - ov * slope;
      const board = [[ex, ey], [apex[0], apex[1]], [apex[0], apex[1] + 14], [ex, ey + 14]];
      const verge = [[ex, ey + 14], [apex[0], apex[1] + 14], [apex[0], apex[1] + 34], [ex - s * 4, ey + 34]];
      paper([W2(verge, zg + 4), W2(board, zg + 6)]);
      wash(W2(verge, zg + 4), pal.roof, { a: 0.65, blot: 1 }); inkPoly(W2(verge, zg + 4), { w: D_INK });
      for (let t = 0.06; t < 1; t += 0.06) { const x = lerp(ex, apex[0], t), y = lerp(ey + 14, apex[1] + 14, t); L3([x, y, zg + 4], [x, y + 18, zg + 4], { w: 0.4, a: 0.55, os: 0 }); }
      wash(W2(board, zg + 6), darken(T, 0.1), { a: 0.75 }); inkPoly(W2(board, zg + 6), { w: D_INK });
      castShadow([[ex, ey, zg + 6], [apex[0], apex[1], zg + 6], [ex, ey + 30, zg + 6], [apex[0], apex[1] + 30, zg + 6], [ex, ey, zg], [apex[0], apex[1], zg]], { a: 0.4, recv: [{ x0: v.x0, x1: v.x1, y0: y1, y1: y1 + rise, z: zg }] });
    }
  });
  for (const [x, y] of wins) windowEl(S, x, y, winW, Math.min(80, rise * 0.3), zg, { top: 'flat', cols: 2, rows: 2, kind: 'casement', frameCol: pal.frame, frameW: 6, inside: R.chance(0.5) ? 'curtain' : null, curtainCol: [240, 236, 226], recess: 8, box: R.chance(0.5) ? 'geranium' : null, noSill: false }, pal);
  windowEl(S, cx - 18, y1 + rise * 0.6, 36, 30, zg, { top: 'flat', cols: 1, rows: 1, kind: 'casement', frameCol: pal.frame, frameW: 5, recess: 6, noSill: true }, pal);
  S.roofLine = null;
  S.gableTop = [cx, y1 + rise, zg];
}

// Dutch gable profiles: stepped (trapgevel), neck (halsgevel), bell (klokgevel)
function gableProfile(type, x0, x1, y1, rise, R) {
  const W = x1 - x0, cx = (x0 + x1) / 2, L = [];
  if (type === 'stepGable') {
    const n = R.int(3, 5), topW = W * R.range(0.16, 0.24), sw = (W / 2 - topW / 2) / n, sh = rise / (n + 1);
    L.push([x0, y1]);
    for (let i = 0; i < n; i++) { L.push([x0 + i * sw, y1 + (i + 1) * sh]); L.push([x0 + (i + 1) * sw, y1 + (i + 1) * sh]); }
    L.push([cx - topW / 2, y1 + rise]);
  } else {
    const nw = W * R.range(0.34, 0.42), xn = cx - nw / 2, shoulder = y1 + 24, neckY = y1 + rise * (type === 'bellGable' ? 0.55 : 0.36);
    L.push([x0, y1], [x0, shoulder]);
    for (let i = 1; i <= 10; i++) {
      const t = i / 10;
      if (type === 'neckGable') L.push([lerp(x0, xn, 1 - Math.cos(t * Math.PI / 2)), lerp(shoulder, neckY, Math.sin(t * Math.PI / 2))]);
      else L.push([lerp(x0, xn, t * t * (3 - 2 * t)) - Math.sin(t * Math.PI) * W * 0.04, lerp(shoulder, neckY, t)]);
    }
    const topY = y1 + rise - (type === 'bellGable' ? rise * 0.14 : 40);
    L.push([xn, topY]);
    if (type === 'neckGable') L.push([xn - 8, topY], [cx, y1 + rise]);
    else for (let i = 1; i <= 6; i++) { const a = Math.PI - i / 6 * Math.PI / 2; L.push([cx + Math.cos(a) * nw / 2, topY + Math.sin(a) * (y1 + rise - topY)]); }
  }
  const right = L.slice().reverse().map(p => [2 * cx - p[0], p[1]]);
  return L.concat(right.filter((p, i) => !(i === 0 && Math.abs(p[0] - L[L.length - 1][0]) < 0.1)));
}
function dutchGable(S, v, R, pal, st, type) {
  const W = v.x1 - v.x0, cx = (v.x0 + v.x1) / 2, rise = W * R.range(0.68, 0.88), z = v.z, y1 = v.y1;
  const prof = gableProfile(type, v.x0, v.x1, y1, rise, R);
  S.bounds.push([cx, y1 + rise + 30, z]);
  S.add(z + 0.05, () => {
    const p = W2(prof, z); paper([p]); wash(p, v.mat.col, { a: 0.6, blot: 3 });
    C.save(); pathOf(p); C.clip(); brickPatch(v.x0, y1, v.x1, y1 + rise, z, texMask(RR, 0.38), { x0: v.x0, x1: v.x1, y0: y1, y1: y1 + rise }); C.restore();
    // stone coping follows the outline
    C.save(); C.globalCompositeOperation = 'source-over'; C.strokeStyle = rgba(mix(pal.stone, [255, 255, 255], 0.3), 0.9); C.lineWidth = 7 * VIEW.k / 1.4; C.lineJoin = 'round';
    C.beginPath(); for (let i = 0; i < p.length; i++) (i ? C.lineTo : C.moveTo).call(C, p[i][0], p[i][1]); C.stroke(); C.restore();
    inkLine(p, { w: W_INK, os: 0 }); inkLine(p.map(q => [q[0], q[1] + 4]), { w: 0.6, a: 0.6, os: 0 });
    if (type === 'neckGable') for (const s of [-1, 1]) { const c = P([cx + s * (W / 2 - 22), y1 + 40, z]); C.strokeStyle = rgba(COL.ink, 0.8); C.lineWidth = 0.9; C.beginPath(); for (let a = 0; a < 4.2 * Math.PI; a += 0.2) { const r = (13 - a * 0.9) * VIEW.k; C.lineTo(c[0] + s * Math.cos(a) * r, c[1] - Math.sin(a) * r); } C.stroke(); }
    // hoist beam with hook at the top
    const hb = { x0: cx - 7, x1: cx + 7, y0: y1 + rise - 70, y1: y1 + rise - 56, z0: z, z1: z + 70 };
    shadowBox(hb, { a: 0.4 }); drawBox(hb, { col: [90, 70, 60], a: 0.7, w: D_INK });
    L3([cx, hb.y0, z + 64], [cx, hb.y0 - 30, z + 64], { w: 0.7 }); const hp = P([cx, hb.y0 - 33, z + 64]); C.strokeStyle = rgba(COL.ink, 0.8); C.beginPath(); C.arc(hp[0], hp[1], 3, 0, Math.PI); C.stroke();
    // wall anchors: iron S-ties at floor lines
    for (const vv of S.vols.slice(1)) for (const x of [vv.x0 + 22, vv.x1 - 22]) { const c = P([x, vv.y0 + 6, z]); C.strokeStyle = rgba(COL.ink, 0.85); C.lineWidth = 1.6; C.beginPath(); C.moveTo(c[0] - 4, c[1] - 6); C.bezierCurveTo(c[0] + 6, c[1] - 6, c[0] - 6, c[1] + 6, c[0] + 4, c[1] + 6); C.stroke(); }
  });
  const gw = Math.min(90, W * 0.28);
  windowEl(S, cx - gw / 2, y1 + 30, gw, Math.min(130, rise * 0.4), z, { top: 'flat', cols: 2, rows: 4, kind: 'sash', frameCol: pal.frame, frameW: 7, relieving: true, recess: 9, inside: R.chance(0.5) ? 'curtain' : null, curtainCol: [240, 236, 226] }, pal);
  if (rise > 240) windowEl(S, cx - 20, y1 + rise * 0.62, 40, 44, z, { top: 'arch', cols: 1, rows: 1, kind: 'sash', frameCol: pal.frame, frameW: 5, recess: 6, noSill: true }, pal);
  S.roofType = type; S.roofLine = null;
}

// Straits parapet with a central pediment, balustrade and plaster scrolls
function pedimentParapet(S, v, R, pal, st) {
  const W = v.x1 - v.x0, cx = (v.x0 + v.x1) / 2, z = v.z, y1 = v.y1, ph = R.range(55, 80), pw = W * R.range(0.34, 0.5), pr = R.range(45, 75);
  const kind = R.pick(['arch', 'tri', 'step']);
  const ped = [];
  if (kind === 'arch') { for (let i = 0; i <= 16; i++) { const a = Math.PI - i / 16 * Math.PI; ped.push([cx + Math.cos(a) * pw / 2, y1 + ph + Math.sin(a) * pr]); } }
  else if (kind === 'tri') ped.push([cx - pw / 2, y1 + ph], [cx, y1 + ph + pr], [cx + pw / 2, y1 + ph]);
  else ped.push([cx - pw / 2, y1 + ph], [cx - pw / 2, y1 + ph + pr * 0.5], [cx - pw / 4, y1 + ph + pr * 0.5], [cx - pw / 4, y1 + ph + pr], [cx + pw / 4, y1 + ph + pr], [cx + pw / 4, y1 + ph + pr * 0.5], [cx + pw / 2, y1 + ph + pr * 0.5], [cx + pw / 2, y1 + ph]);
  const wall = [[v.x0, y1], [v.x1, y1], [v.x1, y1 + ph], ...ped.slice().reverse(), [v.x0, y1 + ph]];
  S.bounds.push([cx, y1 + ph + pr, z]);
  S.add(z + 9, () => {
    const p = W2(wall, z + 4); paper([p]); wash(p, mix(v.mat.col, [255, 255, 255], 0.15), { a: 0.6, blot: 2 });
    for (const dy of [ph - 6, ph - 13]) L3([v.x0, y1 + dy, z + 4], [v.x1, y1 + dy, z + 4], { w: 0.6, a: 0.7 });
    // balustrade panels either side of the pediment
    for (const [a, b] of [[v.x0 + 20, cx - pw / 2 - 10], [cx + pw / 2 + 10, v.x1 - 20]]) {
      if (b - a < 40) continue;
      L3([a, y1 + 12, z + 4], [b, y1 + 12, z + 4], { w: 0.6 }); L3([a, y1 + ph - 22, z + 4], [b, y1 + ph - 22, z + 4], { w: 0.6 });
      for (let x = a + 8; x < b - 4; x += 12) { const bal = []; for (let k = 0; k <= 8; k++) { const t = k / 8; bal.push([x + Math.sin(t * Math.PI) * 3.5 + 3, lerp(y1 + 12, y1 + ph - 22, t)]); } for (let k = 8; k >= 0; k--) { const t = k / 8; bal.push([x - Math.sin(t * Math.PI) * 3.5 - 3, lerp(y1 + 12, y1 + ph - 22, t)]); } wash(W2(bal, z + 4), COL.shadow, { a: 0.2, rim: 0, off: 0 }); inkPoly(W2(bal, z + 4), { w: 0.4, a: 0.7, os: 0 }); }
    }
    // plaque with characters, scrolls either side
    const pq = { x0: cx - pw * 0.28, x1: cx + pw * 0.28, y0: y1 + ph - 8, y1: y1 + ph + pr * 0.45 };
    const q = quad(pq.x0, pq.y0, pq.x1, pq.y1, z + 5); paper([q]); wash(q, RR.pick([[246, 240, 220], pal.acc, [70, 64, 60]]), { a: 0.5 }); inkPoly(q, { w: D_INK });
    sceneText(S, new Face([pq.x0, pq.y0, z + 5], [1, 0, 0], [0, 1, 0], rectP(pq.x1 - pq.x0, pq.y1 - pq.y0)), 4, 3, pq.x1 - pq.x0 - 4, pq.y1 - pq.y0 - 3, S.T.plaque, { col: RR.pick([[40, 34, 30], [190, 60, 40], pal.gold]) });
    for (const s of [-1, 1]) { const c = P([cx + s * pw * 0.38, y1 + ph + 12, z + 4]); C.strokeStyle = rgba(COL.ink, 0.7); C.lineWidth = 0.8; C.beginPath(); for (let a = 0; a < 4 * Math.PI; a += 0.2) { const r = (2 + a * 1.1) * VIEW.k; C.lineTo(c[0] + s * Math.cos(a) * r, c[1] - Math.sin(a) * r * 0.7); } C.stroke(); }
    inkPoly(p, { w: W_INK });
    for (const x of [v.x0 + 8, v.x1 - 8]) { const c = P([x, y1 + ph + 9, z + 4]); paper([[[c[0] - 5, c[1]], [c[0] + 5, c[1]], [c[0], c[1] - 10]]]); C.strokeStyle = rgba(COL.ink, 0.8); C.lineWidth = 0.9; C.beginPath(); C.arc(c[0], c[1] - 5, 5 * VIEW.k / 1.3, 0, TAU); C.stroke(); }
  });
  S.roofLine = [[v.x0 + 10, y1 + ph, z + 4], [cx - pw / 2, y1 + ph, z + 4]];
}

// Chinese pantile eave between fire walls with upswept ridge ends
function chineseEave(S, v, R, pal, st) {
  const W = v.x1 - v.x0, z = v.z, y1 = v.y1, rise = R.range(85, 120), ov = 55, run = 180;
  const len = Math.hypot(rise, run + ov), V = [0, rise / len, -(run + ov) / len];
  const face = new Face([v.x0, y1 - 4, z + ov], [1, 0, 0], V, rectP(W, len));
  const pts = [face.w3(0, 0), face.w3(W, 0), face.w3(0, len), face.w3(W, len)];
  S.bounds.push(face.w3(W / 2, len));
  S.add(z + ov, () => {
    castShadow(pts.concat([[v.x0, y1 - 12, z + ov], [v.x1, y1 - 12, z + ov]]), { a: 0.5 });
    tileRoof(face, W, len, pal, true, null, 'pantile');
    const fas = quad(v.x0, y1 - 12, v.x1, y1 - 4, z + ov); paper([fas]); wash(fas, darken(pal.roof, 0.3), { a: 0.6 }); inkPoly(fas, { w: D_INK });
    // ridge with upswept ends
    const r0 = face.sp(0, len), r1 = face.sp(W, len), up = 16 * VIEW.k;
    brush([[r0[0] - 6, r0[1] - up], [r0[0] + 10, r0[1] - 2], [r1[0] - 10, r1[1] - 2], [r1[0] + 6, r1[1] - up]], { w: 4, col: darken(pal.roof, 0.5) });
    // fire walls at the party lines
    for (const x of [v.x0, v.x1]) {
      const fw = [[x - 12, y1 - 12], [x + 12, y1 - 12], [x + 12, y1 + rise * 0.7], [x + 6, y1 + rise * 0.82], [x - 6, y1 + rise * 0.82], [x - 12, y1 + rise * 0.7]];
      paper([W2(fw, z + ov + 2)]); wash(W2(fw, z + ov + 2), mix(v.mat.col, [255, 255, 255], 0.3), { a: 0.6 }); inkPoly(W2(fw, z + ov + 2), { w: D_INK });
    }
  });
  S.roofLine = [face.w3(W * 0.1, len * 0.85), face.w3(W * 0.6, len * 0.85)];
}

// ---------------------------------------------------------------- utilities on the building
function utilities(S, vols, R, pal, st) {
  const top = vols[vols.length - 1], g = vols[0], u = st.utilities, latin = st.script === 'latin';
  if (R.chance(u.pipe)) {
    const side = R.chance(0.5) ? -1 : 1, x = side < 0 ? top.x0 + 10 : top.x1 - 18;
    const zz = Math.max(...vols.map(v => v.z)) + 4;
    const b = { x0: x, x1: x + 8, y0: 0, y1: top.y1 - 5, z0: zz, z1: zz + 8 };
    S.add(zz + 8, () => {
      castShadow(boxCorners(b), { a: 0.35 });
      const q = quad(b.x0, b.y0, b.x1, b.y1, b.z1); paper([q]); wash(q, latin ? [170, 172, 176] : [196, 196, 200], { a: 0.5 });
      wash(SUN.left ? quad(b.x0 + 5, b.y0, b.x1, b.y1, b.z1) : quad(b.x0, b.y0, b.x0 + 3, b.y1, b.z1), COL.shadow, { a: 0.45, rim: 0, off: 0 });
      L3([b.x0, b.y0, b.z1], [b.x0, b.y1, b.z1], { w: D_INK, brk: 0.5 }); L3([b.x1, b.y0, b.z1], [b.x1, b.y1, b.z1], { w: D_INK, brk: 0.5 });
      for (let yy = 40; yy < b.y1; yy += RR.range(90, 130)) L3([b.x0 - 2, yy, b.z1], [b.x1 + 2, yy, b.z1], { w: 0.9 });
      if (latin) { const hq = [[x - 7, b.y1 - 6], [x + 15, b.y1 - 6], [x + 10, b.y1 - 26], [x - 2, b.y1 - 26]]; paper([W2(hq, b.z1 + 1)]); wash(W2(hq, b.z1 + 1), [150, 152, 156], { a: 0.6 }); inkPoly(W2(hq, b.z1 + 1), { w: D_INK }); }
      L3([b.x0 - 6, 3, b.z1 + 4], [b.x1 + 2, 3, b.z1 + 4], { w: 0.8 });
    });
  }
  if (R.chance(u.cables)) {
    const v = vols[Math.min(1, vols.length - 1)], y = v.y0 + R.range(10, 40), nWire = st.wireTangle ? R.int(3, 6) : 1;
    S.add(v.z + 2, () => {
      for (let wi = 0; wi < nWire; wi++) { const sag = 6 + wi * RR.range(3, 9), dy = wi * RR.range(2, 6), pts = []; for (let t = 0; t <= 1.001; t += 0.1) pts.push(P([lerp(v.x0 - 30 - wi * 8, v.x1 + 10 + wi * 6, t), y + dy - Math.sin(t * Math.PI) * sag + RR.gauss() * 0.5, v.z + 3 + wi])); inkLine(pts, { w: wi ? 0.5 : 0.7, os: 0 }); }
      castShadow([[v.x0, y, v.z + 3], [v.x1, y, v.z + 3], [v.x0, y - 1, v.z + 3], [v.x1, y - 1, v.z + 3]], { a: 0.3 });
    });
  }
  if (R.chance(S.retrofit === false ? 0 : u.dish || 0)) {
    const v = top, x = R.chance(0.5) ? v.x0 + 30 : v.x1 - 80, y = v.y1 - 70;
    S.add(v.z + 40, () => {
      L3([x + 20, y + 20, v.z], [x + 20, y + 20, v.z + 30], { w: 1 });
      const c = P([x + 25, y + 25, v.z + 35]), r = 22 * VIEW.k;
      C.globalCompositeOperation = 'source-over'; C.fillStyle = rgba(COL.paper, 1); C.beginPath(); C.ellipse(c[0], c[1], r, r * 0.85, -0.4, 0, TAU); C.fill();
      wash([...Array(16)].map((_, i) => { const a = i / 16 * TAU; return [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r * 0.85]; }), [220, 220, 216], { a: 0.4 });
      C.strokeStyle = rgba(COL.ink, 0.8); C.lineWidth = 1; C.beginPath(); C.ellipse(c[0], c[1], r, r * 0.85, -0.4, 0, TAU); C.stroke();
      L3([x + 25, y + 25, v.z + 35], [x + 40, y + 10, v.z + 55], { w: 0.7 });
    });
  }
  if (R.chance(u.laundry || 0) && vols.length > 1) {
    const v = vols[1 + R.int(0, vols.length - 2)];
    S.add(v.z + 30, () => laundry(v.x0 + 20, v.x1 - 20, v.y1 - 40, v.z + 25, pal));
  }
}

// ---------------------------------------------------------------- tall street elements
function streetVertical(S, vols, R, pal, kind, side, Htot) {
  const g = vols[0], x = side < 0 ? g.x0 - R.range(10, 50) : g.x1 + R.range(10, 50), z = R.range(140, 170);
  const lean = R.gauss() * 0.035;
  if (kind === 'pole') {
    const h = Htot + R.range(60, 140), r0 = 14, r1 = 10;
    S.bounds.push([x, h, z]);
    S.add(z, () => {
      const at = t => [x + lean * h * t, h * t, z];
      const edgeL = [], edgeR = [];
      for (let t = 0; t <= 1.001; t += 0.1) { const c = at(t), r = lerp(r0, r1, t); edgeL.push(P([c[0] - r, c[1], z])); edgeR.push(P([c[0] + r, c[1], z])); }
      const body = edgeL.concat(edgeR.slice().reverse());
      castShadow([[x - r0, 0, z], [x + r0, 0, z], [at(1)[0] - r1, h, z], [at(1)[0] + r1, h, z]], { a: 0.4 });
      paper([body]); wash(body, [222, 222, 218], { a: 0.3 });
      const shadeSide = SUN.left ? edgeR : edgeL, mid = edgeL.map((p, i) => [lerp(p[0], edgeR[i][0], 0.5), p[1]]);
      wash(mid.concat(shadeSide.slice().reverse()), COL.shadow, { a: 0.4, rim: 0, off: 0.5 });
      inkLine(edgeL, { w: W_INK, os: 0 }); inkLine(edgeR, { w: W_INK, os: 0 });
      const tq = quad(at(0.45)[0] - 9, h * 0.45, at(0.45)[0] + 9, h * 0.45 + 30, z + 1); wash(tq, RR.pick([[240, 220, 120], [236, 236, 230], pal.acc2]), { a: 0.6 }); inkPoly(tq, { w: 0.6 });
      for (let t = 0.55; t < 0.95; t += 0.06) { const c = at(t), s = (Math.round(t * 50) % 2) ? 1 : -1; L3([c[0] + s * r1, c[1], z], [c[0] + s * (r1 + 8), c[1], z], { w: 0.8 }); }
      const arms = RR.int(1, 2), ends = [];
      for (let a = 0; a < arms; a++) {
        const ay = h - 20 - a * 45, c = at(ay / h), aw = RR.range(60, 90);
        drawBox({ x0: c[0] - aw, x1: c[0] + aw, y0: ay - 6, y1: ay, z0: z - 4, z1: z + 4 }, { col: [150, 150, 150], a: 0.5, w: D_INK });
        for (const dx of [-aw + 8, -aw * 0.4, aw * 0.4, aw - 8]) { const ip = P([c[0] + dx, ay + 5, z]); C.fillStyle = rgba([80, 80, 90], 0.8); C.beginPath(); C.ellipse(ip[0], ip[1], 2.2, 3.5, 0, 0, TAU); C.fill(); ends.push([c[0] + dx, ay + 8, z]); }
        L3([c[0] - aw * 0.6, ay - 6, z], [c[0], ay - 30, z], { w: 0.6 }); L3([c[0] + aw * 0.6, ay - 6, z], [c[0], ay - 30, z], { w: 0.6 });
      }
      if (RR.chance(0.5)) { const c = at(0.72); drawBox({ x0: c[0] + r1, x1: c[0] + r1 + 32, y0: h * 0.72, y1: h * 0.72 + 50, z0: z - 10, z1: z + 10 }, { col: [190, 196, 200], a: 0.5, w: D_INK }); }
      for (const e of ends) {
        if (RR.chance(0.45)) continue;
        for (const dir of [-1, 1]) {
          const ex = e[0] + dir * RR.range(900, 1400), ey = e[1] + RR.range(-40, 60), sag = RR.range(25, 70), pts = [];
          for (let t = 0; t <= 1.001; t += 0.05) pts.push(P([lerp(e[0], ex, t), lerp(e[1], ey, t) - Math.sin(t * Math.PI) * sag, z]));
          inkLine(pts, { w: 0.55, a: 0.75, os: 0, brk: 0 });
        }
      }
      const tv = vols[Math.min(1, vols.length - 1)], anchor = [side < 0 ? tv.x0 + 20 : tv.x1 - 20, tv.y0 + 40, tv.z + 2], e = ends[0], pts = [];
      for (let t = 0; t <= 1.001; t += 0.05) pts.push(P([lerp(e[0], anchor[0], t), lerp(e[1], anchor[1], t) - Math.sin(t * Math.PI) * 30, lerp(e[2], anchor[2], t)]));
      inkLine(pts, { w: 0.6, os: 0, brk: 0 });
    });
  } else if (kind === 'lamp') {
    const h = Math.min(Htot + 20, R.range(480, 620));
    S.bounds.push([x, h, z]);
    S.add(z, () => {
      const dir = side < 0 ? 1 : -1;
      castShadow([[x - 5, 0, z], [x + 5, 0, z], [x - 5, h, z], [x + 5, h, z]], { a: 0.35 });
      const body = [P([x - 7, 0, z]), P([x + 7, 0, z]), P([x + 4, h, z]), P([x - 4, h, z])];
      paper([body]); wash(body, [214, 216, 216], { a: 0.35 }); inkLine([body[0], body[3]], { w: W_INK, os: 0 }); inkLine([body[1], body[2]], { w: W_INK, os: 0 });
      const arm = []; for (let t = 0; t <= 1.001; t += 0.1) arm.push(P([x + dir * 70 * t, h + Math.sin(t * Math.PI * 0.5) * 30, z]));
      inkLine(arm, { w: 1.3, os: 0 });
      const hx = x + dir * 70, hq = [P([hx - 22, h + 26, z]), P([hx + 22, h + 26, z]), P([hx + 15, h + 36, z]), P([hx - 15, h + 36, z])];
      paper([hq]); wash(hq, [120, 124, 130], { a: 0.7 }); inkPoly(hq, { w: D_INK });
    });
  } else if (kind === 'parisLamp') { // cast-iron lamppost with a four-sided lantern
    const h = R.range(360, 420);
    S.bounds.push([x, h + 60, z]);
    S.add(z, () => {
      castShadow([[x - 6, 0, z], [x + 6, 0, z], [x - 6, h, z], [x + 6, h, z]], { a: 0.35 });
      const base = [[x - 16, 0], [x + 16, 0], [x + 12, 30], [x + 7, 60], [x - 7, 60], [x - 12, 30]];
      const shaft = [[x - 5, 60], [x + 5, 60], [x + 3.5, h], [x - 3.5, h]];
      const col = [44, 56, 52];
      for (const sh of [base, shaft]) { paper([W2(sh, z)]); wash(W2(sh, z), col, { a: 0.75 }); inkPoly(W2(sh, z), { w: D_INK }); }
      L3([x - 22, h - 40, z], [x + 22, h - 40, z], { w: 1.2 });
      const lan = [[x - 13, h + 8], [x + 13, h + 8], [x + 17, h + 46], [x - 17, h + 46]];
      paper([W2(lan, z)]); wash(W2(lan, z), [240, 226, 170], { a: 0.5 }); inkPoly(W2(lan, z), { w: D_INK }); L3([x, h + 8, z], [x, h + 46, z], { w: 0.5 });
      const cap = [[x - 21, h + 46], [x + 21, h + 46], [x + 4, h + 62], [x - 4, h + 62]]; paper([W2(cap, z)]); wash(W2(cap, z), col, { a: 0.8 }); inkPoly(W2(cap, z), { w: D_INK });
      L3([x - 3, h, z], [x - 3, h + 8, z], { w: 1 }); L3([x + 3, h, z], [x + 3, h + 8, z], { w: 1 });
    });
  } else if (kind === 'wallLantern') { // bracket lantern on the corner of the building
    const v = vols[Math.min(1, vols.length - 1)], wx = side < 0 ? v.x0 + 14 : v.x1 - 14, y = v.y0 + 30, d = side < 0 ? -1 : 1, zz = v.z;
    S.add(zz + 60, () => {
      const arm = []; for (let t = 0; t <= 1.001; t += 0.1) arm.push(P([wx + d * 0, y + 30 * t, zz + 55 * t]));
      inkLine([P([wx, y, zz]), P([wx, y + 30, zz + 55])], { w: 1.4 }); inkLine([P([wx, y + 30, zz]), P([wx, y + 30, zz + 55])], { w: 1.2 });
      const c = P([wx, y + 30, zz + 55]), s = 9 * VIEW.k;
      castShadow([[wx - 10, y - 30, zz + 55], [wx + 10, y - 30, zz + 55], [wx - 10, y + 30, zz + 55], [wx + 10, y + 30, zz + 55]], { a: 0.3 });
      const lan = [[c[0] - s, c[1] + 4], [c[0] + s, c[1] + 4], [c[0] + s * 1.2, c[1] + s * 3.2], [c[0] - s * 1.2, c[1] + s * 3.2]];
      paper([lan]); wash(lan, [240, 220, 150], { a: 0.55 }); inkPoly(lan, { w: D_INK });
      const cap = [[c[0] - s * 1.5, c[1] + s * 3.2], [c[0] + s * 1.5, c[1] + s * 3.2], [c[0], c[1] + s * 4.4]]; paper([cap]); wash(cap, [50, 50, 50], { a: 0.8 }); inkPoly(cap, { w: 0.8 });
    });
  } else { // traffic sign
    S.add(z, () => {
      const h = 230; castShadow([[x - 2, 0, z], [x + 2, 0, z], [x - 2, h, z], [x + 2, h, z]], { a: 0.3 });
      L3([x, 0, z], [x, h, z], { w: 1.2 }); L3([x + 3, 0, z], [x + 3, h - 10, z], { w: 0.6 });
      const c = P([x + 1, h + 22, z]), r = 22 * VIEW.k;
      const circ = []; for (let i = 0; i < 20; i++) { const a = i / 20 * TAU; circ.push([c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r]); }
      paper([circ]); wash(circ, [210, 70, 60], { a: 0.75 }); inkPoly(circ, { w: D_INK, os: 0 });
      const bar = [[c[0] - r * 0.65, c[1] - r * 0.15], [c[0] + r * 0.65, c[1] - r * 0.15], [c[0] + r * 0.65, c[1] + r * 0.15], [c[0] - r * 0.65, c[1] + r * 0.15]];
      paper([bar]); inkPoly(bar, { w: 0.5 });
    });
  }
}

// ---------------------------------------------------------------- ground + flecks
function groundAndFlecks(S, vols, R, W, st) {
  const g = vols[0], latin = st.script === 'latin';
  S.add(-500, () => {
    const pts = []; const x0 = g.x0 - 160, x1 = g.x1 + 160;
    for (let t = 0; t <= 1.001; t += 0.05) pts.push(P([lerp(x0, x1, t), 0, 190 + Math.sin(t * 7) * 8]));
    for (let t = 1; t >= -0.001; t -= 0.05) pts.push(P([lerp(x0, x1, t), 0, Math.min(0, g.z)]));
    wash(pts, latin ? [190, 184, 182] : [196, 188, 190], { a: 0.35, gang: 0, g0: 0.2, g1: 0.2, amp: 3, rim: 0 });
    if (latin) { // cobbles, drawn only in patches
      const m = texMask(RR, 0.55), fake = { x0: x0, x1: x1, y0: -1000, y1: 1000 };
      for (let zz = 20; zz < 185; zz += 14) for (let x = x0 + 40; x < x1 - 40; x += 16) { if (!m(x, zz * 6, fake)) continue; const a = P([x, 0, zz]), b = P([x + 13, 0, zz]); inkLine([a, [(a[0] + b[0]) / 2, a[1] + 2.5], b], { w: 0.45, a: 0.5, os: 0 }); }
    }
    C.save(); pathOf(pts); C.clip();
    const bb = bbox(pts), gr = C.createLinearGradient(bb[0], 0, bb[2], 0);
    gr.addColorStop(0, rgba(COL.paper, 1)); gr.addColorStop(0.2, rgba(COL.paper, 0)); gr.addColorStop(0.8, rgba(COL.paper, 0)); gr.addColorStop(1, rgba(COL.paper, 1));
    C.globalCompositeOperation = 'source-over'; C.fillStyle = gr; C.fillRect(bb[0], bb[1] - 5, bb[2] - bb[0], bb[3] - bb[1] + 10); C.restore();
    inkLine([P([g.x0 - 90, 0, 190]), P([g.x1 + 110, 0, 190])], { w: 0.6, a: 0.5, brk: 0.9 });
  });
  S.add(Math.min(0, g.z) + 0.05, () => wash(quad(g.x0, 0, g.x1, 8, g.z), COL.shadowDeep, { a: 0.35, g0: 0.2, g1: 1.2, gang: Math.PI / 2, rim: 0 }));
  S.add(1000, () => {
    if (!FLAGS.plants) return;
    const bb = bbox(S.bounds.map(P)), cx = (bb[0] + bb[2]) / 2, cy = (bb[1] + bb[3]) / 2, rx = (bb[2] - bb[0]) / 2, ry = (bb[3] - bb[1]) / 2;
    const n = RR.int(40, 80);
    for (let i = 0; i < n; i++) { const a = RR.f() * TAU, r = 0.75 + Math.abs(RR.gauss()) * 0.3; fleck(cx + Math.cos(a) * rx * r * 1.08, cy + Math.sin(a) * ry * r * 1.02, 4.5); }
    for (let i = 0; i < n * 0.6; i++) fleck(RR.range(bb[0], bb[2]), RR.range(bb[1], bb[3]), 3.8);
  });
}

// ---------------------------------------------------------------- new style parts
// Levantine mashrabiya: a timber oriel on corbels, its front a fine lattice screen
function mashrabiya(S, cx, v, sill, w, h, pal) {
  const ow = Math.max(w + 40, 110), d = 55, z = v.z, x0 = cx - ow / 2, y0 = sill - 22, y1 = Math.min(v.y1 - 15, sill + h + 25);
  const b = { x0, x1: x0 + ow, y0, y1, z0: z, z1: z + d };
  const wood = [128, 86, 58];
  S.debug.opens.push({ kind: 'mashrabiya', x0, x1: x0 + ow, y0, y1, z, d });
  S.add(z + d + 0.6, () => {
    castShadow(boxCorners({ ...b, y1: y1 + 14, x0: x0 - 8, x1: x0 + ow + 8 }), { a: 0.5 });
    for (let k = 0; k < 3; k++) { const cxk = lerp(x0 + 12, x0 + ow - 12, k / 2), c = [[cxk - 7, y0], [cxk + 7, y0], [cxk + 4, y0 - 34], [cxk - 1, y0 - 40]]; wash(W2(c, z + d * 0.5), wood, { a: 0.7 }); inkPoly(W2(c, z + d * 0.5), { w: 0.7 }); }
    const f = drawBox(b, { col: wood, a: 0.7, w: D_INK, blot: 1, front: fr => {
      const ix0 = x0 + 10, ix1 = x0 + ow - 10, iy0 = y0 + 26, iy1 = y1 - 18, zz = z + d;
      wash(quad(ix0, iy0, ix1, iy1, zz), [60, 46, 40], { a: 0.55 });
      for (let x = ix0; x < ix1; x += 7) L3([x, iy0, zz], [x, iy1, zz], { w: 0.35, a: 0.75, os: 0, brk: 0 });
      for (let y = iy0; y < iy1; y += 7) L3([ix0, y, zz], [ix1, y, zz], { w: 0.35, a: 0.75, os: 0, brk: 0 });
      for (let x = ix0 + 7; x < ix1; x += 14) for (let y = iy0 + 7; y < iy1; y += 14) { const p = P([x, y, zz]); C.fillStyle = rgba([210, 170, 110], 0.7); C.beginPath(); C.arc(p[0], p[1], 1.6, 0, TAU); C.fill(); }
      inkPoly(quad(ix0, iy0, ix1, iy1, zz), { w: 0.8 });
      inkPoly(quad(x0 + 6, y0 + 6, x0 + ow - 6, iy0 - 6, zz), { w: 0.5, a: 0.7 });
    } });
    const roofq = [P([x0 - 8, y1, z + d + 10]), P([x0 + ow + 8, y1, z + d + 10]), P([x0 + ow + 8, y1 + 14, z]), P([x0 - 8, y1 + 14, z])];
    paper([roofq]); wash(roofq, darken(wood, 0.2), { a: 0.75 }); inkPoly(roofq, { w: D_INK });
  });
}
// Korean external steel stair to the upper-floor door
function extStair(S, vols, R, pal) {
  const g = vols[0], H0 = g.y1, side = R.chance(0.5) ? -1 : 1;
  S.stairSide = side;
  const lw = 110, ld = 95, run = H0 * 0.95;
  const lx0 = side < 0 ? g.x0 - 6 : g.x1 - lw + 6, lx1 = lx0 + lw;
  const sx0 = side < 0 ? lx0 - run : lx1, sx1 = side < 0 ? lx0 : lx1 + run;
  S.bounds.push([side < 0 ? sx0 : sx1, 0, ld], [lx0, H0 + 100, ld]);
  const steel = R.pick([[90, 120, 110], [70, 80, 100], [140, 60, 50]]);
  S.add(ld + 5, () => {
    castShadow([[lx0, H0, ld], [lx1, H0, ld], [lx0, H0 + 95, ld], [lx1, H0 + 95, ld], [lx0, H0, 0], [lx1, H0, 0]], { a: 0.35 });
    const land = { x0: lx0, x1: lx1, y0: H0 - 8, y1: H0, z0: 0, z1: ld };
    for (const x of [lx0 + 4, lx1 - 4]) drawBox({ x0: x - 4, x1: x + 4, y0: 0, y1: H0 - 8, z0: ld - 8, z1: ld }, { col: steel, a: 0.7, w: 0.8 });
    drawBox(land, { col: steel, a: 0.7, w: D_INK });
    // the flight, foot at street level away from the house
    const n = Math.round(H0 / 19), zz = ld - 10;
    const foot = side < 0 ? sx0 : sx1, top = side < 0 ? sx1 : sx0;
    for (let k = 0; k <= n; k++) { const t = k / n, x = lerp(foot, top, t), y = lerp(0, H0, t); inkLine([P([x, y, zz - 75]), P([x, y, zz])], { w: 0.9, os: 0 }); inkLine([P([x, y, zz]), P([x + (side < 0 ? 1 : -1) * run / n, y, zz])], { w: 0.6, os: 0 }); }
    for (const zo of [zz, zz - 75]) brush([P([foot, 0, zo]), P([top, H0, zo])], { w: 2.4 * VIEW.k / 1.4, col: darken(steel, 0.2) });
    brush([P([foot, 95, zz]), P([top, H0 + 95, zz]), P([side < 0 ? lx1 : lx0, H0 + 95, zz])], { w: 1.8 * VIEW.k / 1.4, col: darken(steel, 0.2) });
    for (let k = 1; k < n; k += 2) { const t = k / n, x = lerp(foot, top, t), y = lerp(0, H0, t); L3([x, y, zz], [x, y + 95, zz], { w: 0.45, a: 0.7, os: 0 }); }
    for (let x = lx0 + 10; x < lx1; x += 11) L3([x, H0, ld], [x, H0 + 95, ld], { w: 0.45, a: 0.7, os: 0 });
    L3([lx0, H0 + 95, ld], [lx1, H0 + 95, ld], { w: 1.4 });
  });
}
// Taiwanese rooftop: tin shack (頂樓加蓋) and a stainless water tower
function rooftopShack(S, v, R, pal) {
  const z = v.z, cop = { x0: v.x0 - 4, x1: v.x1 + 4, y0: v.y1, y1: v.y1 + 18, z0: z - 20, z1: z + 6 };
  const sw = (v.x1 - v.x0) * R.range(0.55, 0.8), left = R.chance(0.5), sx0 = left ? v.x0 + 10 : v.x1 - 10 - sw, sh = R.range(200, 235), zb = z - 70;
  const col = R.pick([[150, 172, 186], [176, 182, 186], [196, 150, 120], [120, 150, 170]]);
  const tx = left ? v.x1 - 85 : v.x0 + 20;
  S.bounds.push([sx0, v.y1 + sh + 30, zb], [tx, v.y1 + 210, zb]);
  S.add(zb, () => {
    const b = { x0: sx0, x1: sx0 + sw, y0: v.y1, y1: v.y1 + sh, z0: zb - 200, z1: zb };
    drawBox(b, { col, a: 0.55, w: D_INK, blot: 2, front: () => { for (let x = b.x0 + 8; x < b.x1; x += 8) L3([x, b.y0, zb], [x, b.y1, zb], { w: 0.35, a: 0.55, os: 0, brk: 0.2 }); const wq = quad(b.x0 + sw * 0.35, b.y0 + 90, b.x0 + sw * 0.75, b.y0 + 165, zb); paper([wq]); wash(wq, pal.glass, { a: 0.5, g0: 1.3, g1: 0.4 }); inkPoly(wq, { w: D_INK }); L3([(b.x0 + sw * 0.55), b.y0 + 90, zb], [(b.x0 + sw * 0.55), b.y0 + 165, zb], { w: 0.6 }); for (let x = b.x0 + sw * 0.35; x < b.x0 + sw * 0.75; x += 9) L3([x, b.y0 + 88, zb + 6], [x, b.y0 + 167, zb + 6], { w: 0.5 }); } });
    const r = [P([b.x0 - 15, b.y1 + 22, zb - 210]), P([b.x1 + 15, b.y1 + 22, zb - 210]), P([b.x1 + 15, b.y1 - 4, zb + 30]), P([b.x0 - 15, b.y1 - 4, zb + 30])];
    paper([r]); wash(r, darken(col, 0.1), { a: 0.6 }); for (let x = b.x0 - 15; x < b.x1 + 15; x += 9) inkLine([P([x, b.y1 + 22, zb - 210]), P([x, b.y1 - 4, zb + 30])], { w: 0.35, a: 0.55, os: 0 }); inkPoly(r, { w: D_INK });
    // stainless water tower on a steel frame
    const ty = v.y1 + 60;
    for (const xx of [tx + 6, tx + 58]) L3([xx, v.y1, zb], [xx, ty, zb], { w: 1 }); L3([tx + 6, v.y1 + 20, zb], [tx + 58, ty - 10, zb], { w: 0.6 });
    const tq = quad(tx, ty, tx + 64, ty + 110, zb + 2); paper([tq]); wash(tq, [206, 210, 214], { a: 0.45 }); wash(quad(tx + 40, ty, tx + 64, ty + 110, zb + 2), COL.shadow, { a: 0.3, rim: 0 });
    for (let yy = ty + 22; yy < ty + 110; yy += 22) L3([tx, yy, zb + 2], [tx + 64, yy, zb + 2], { w: 0.45, a: 0.6 });
    inkPoly(tq, { w: D_INK }); const dome = []; for (let i = 0; i <= 10; i++) { const a = Math.PI - i / 10 * Math.PI; dome.push(P([tx + 32 + Math.cos(a) * 32, ty + 110 + Math.sin(a) * 14, zb + 2])); } paper([dome]); inkLine(dome, { w: D_INK, os: 0 });
  });
  S.add(z + 6, () => { shadowBox(cop, { a: 0.4 }); drawBox(cop, { col: v.mat.col, w: W_INK }); });
  S.roofLine = [[cop.x0, cop.y1, z], [cop.x1, cop.y1, z]];
}
// Korean flat roof: parapet painted green on top, onggi jars, a laundry line
function rooftopJars(S, v, R, pal) {
  const home = S.use === 'house'; if (!home) S.roofType = 'railing';
  const z = v.z, cop = { x0: v.x0 - 6, x1: v.x1 + 6, y0: v.y1, y1: v.y1 + 40, z0: z - 10, z1: z + 8 }, zb = z - 40;
  S.bounds.push([v.x0, v.y1 + 160, zb]);
  S.add(zb, () => {
    const n = home ? R.int(4, 7) : 0;
    for (let k = 0; k < n; k++) { const jx = v.x0 + 30 + k * 34 + RR.gauss() * 3, jh = RR.range(45, 70), jw = RR.range(26, 36), pts = []; for (let i = 0; i <= 12; i++) { const t = i / 12; pts.push([jx + Math.sin(t * Math.PI) * jw * 0.62 * (t < 0.5 ? 1.15 : 1), v.y1 + 20 + jh * t]); } for (let i = 12; i >= 0; i--) { const t = i / 12; pts.push([jx - Math.sin(t * Math.PI) * jw * 0.62 * (t < 0.5 ? 1.15 : 1), v.y1 + 20 + jh * t]); } const p = W2(pts, zb); paper([p]); wash(p, [104, 66, 46], { a: 0.75, blot: 1 }); wash(W2(pts.slice(0, 13), zb), [255, 255, 255], { a: 0.08, rim: 0 }); inkPoly(p, { w: 0.8, os: 0 }); const lid = quad(jx - jw * 0.36, v.y1 + 20 + jh, jx + jw * 0.36, v.y1 + 26 + jh, zb); paper([lid]); wash(lid, [90, 56, 40], { a: 0.8 }); inkPoly(lid, { w: 0.6 }); }
    if (RR.chance(0.7)) { const x0 = v.x1 - 160, ly = v.y1 + 140; L3([x0, v.y1 + 40, zb - 20], [x0, ly + 5, zb - 20], { w: 0.9 }); L3([v.x1 - 20, v.y1 + 40, zb - 20], [v.x1 - 20, ly + 5, zb - 20], { w: 0.9 }); laundry(x0, v.x1 - 20, ly, zb - 20, pal); }
  });
  S.add(z + 8, () => {
    shadowBox(cop, { a: 0.45 }); drawBox(cop, { col: v.mat.col, w: W_INK, blot: 1 });
    const t = quad(cop.x0, cop.y1 - 7, cop.x1, cop.y1, z + 9); paper([t]); wash(t, [110, 160, 120], { a: 0.75 }); inkPoly(t, { w: 0.7 });
    for (let x = cop.x0 + 10; x < cop.x1 - 5; x += 13) L3([x, cop.y1, z - 2], [x, cop.y1 + 50, z - 2], { w: 0.5, a: 0.7 }); L3([cop.x0, cop.y1 + 50, z - 2], [cop.x1, cop.y1 + 50, z - 2], { w: 1 });
  });
  S.roofLine = [[cop.x0, cop.y1, z], [cop.x1, cop.y1, z]];
}
// Persian roof: parapet of small blind arches, and (badgir) a windcatcher tower
function persianRoof(S, v, R, pal, windcatcher) {
  const z = v.z, ph = R.range(45, 65), col = v.mat.col;
  const cop = { x0: v.x0 - 4, x1: v.x1 + 4, y0: v.y1, y1: v.y1 + ph, z0: z - 10, z1: z + 6 };
  S.bounds.push([v.x0, v.y1 + ph, z]);
  if (windcatcher) {
    const bw = R.range(80, 110), bx = R.chance(0.5) ? v.x0 + 30 : v.x1 - 30 - bw, bh = R.range(230, 300), zb = z - 80;
    S.bounds.push([bx, v.y1 + bh + 20, zb]);
    S.add(zb, () => {
      const b = { x0: bx, x1: bx + bw, y0: v.y1, y1: v.y1 + bh, z0: zb - bw, z1: zb };
      drawBox(b, { col, a: 0.6, w: D_INK, blot: 2, front: () => {
        brickPatch(b.x0, b.y0, b.x1, b.y1, zb, texMask(RR, 0.35), b, 6.5, 21);
        const n = 4, sw = bw / n;
        for (let k = 0; k < n; k++) { const sx = b.x0 + k * sw + 4, op = openingPoly(sx, b.y1 - 120, sx + sw - 8, b.y1 - 16, 'pointed'); paper([W2(op, zb)]); wash(W2(op, zb), [70, 56, 50], { a: 0.75 }); inkPoly(W2(op, zb), { w: 0.6, os: 0 }); }
      } });
      const cap = { x0: bx - 8, x1: bx + bw + 8, y0: v.y1 + bh, y1: v.y1 + bh + 12, z0: zb - bw - 8, z1: zb + 8 }; drawBox(cap, { col: mix(col, [255, 255, 255], 0.2), w: D_INK });
    });
  }
  S.add(z + 6, () => {
    shadowBox(cop, { a: 0.45 });
    drawBox(cop, { col, w: W_INK, blot: 1, front: () => {
      const n = Math.max(4, Math.round((v.x1 - v.x0) / 46)), aw = (v.x1 - v.x0) / n;
      for (let k = 0; k < n; k++) { const ax = v.x0 + k * aw + 7, op = openingPoly(ax, cop.y0 + 10, ax + aw - 14, cop.y1 - 8, 'persian'); wash(W2(op, z + 6), darken(col, 0.25), { a: 0.45, rim: 0.2 }); inkPoly(W2(op, z + 6), { w: 0.55, a: 0.7, os: 0 }); }
    } });
  });
  S.roofLine = [[cop.x0, cop.y1, z], [cop.x1, cop.y1, z]];
}
// Lahori jharokha: a carved timber window bay on stepped brackets, its front a
// row of cusped openings over lattice panels, under a curved bangla eave
function jharokha(S, cx, v, sill, w, h, pal, R, bangla = true) {
  const ow = Math.max(w + 50, 120), d = 48, z = v.z, x0 = cx - ow / 2, y0 = sill - 26, y1 = Math.min(v.y1 - 24, sill + h + 18);
  const b = { x0, x1: x0 + ow, y0, y1, z0: z, z1: z + d };
  const wood = R.chance(0.7) ? R.pick([[112, 74, 50], [96, 64, 44]]) : R.pick([[70, 110, 96], [60, 96, 130]]);
  const n = ow > 150 ? 3 : 2;
  S.debug.opens.push({ kind: 'jharokha', x0, x1: x0 + ow, y0, y1, z, d });
  S.add(z + d + 0.6, () => {
    castShadow(boxCorners({ ...b, y1: y1 + 26, x0: x0 - 10, x1: x0 + ow + 10 }), { a: 0.5 });
    // stepped brackets: two or three corbels, each a stack of shrinking blocks ending in a bud
    for (let k = 0; k < n; k++) {
      const bx = lerp(x0 + 14, x0 + ow - 14, k / (n - 1)), zz = z + d * 0.5;
      for (let s = 0; s < 3; s++) { const q = quad(bx - 9 + s * 2, y0 - 12 - s * 12, bx + 9 - s * 2, y0 - s * 12, zz); paper([q]); wash(q, wood, { a: 0.7 }); inkPoly(q, { w: 0.6, os: 0 }); }
      const bud = P([bx, y0 - 44, zz]); C.fillStyle = rgba(darken(wood, 0.2), 0.8); C.beginPath(); C.ellipse(bud[0], bud[1], 4 * VIEW.k, 6 * VIEW.k, 0, 0, TAU); C.fill();
    }
    drawBox(b, { col: wood, a: 0.72, w: D_INK, blot: 1, front: () => {
      const zz = z + d, ix0 = x0 + 8, ix1 = x0 + ow - 8, py = y0 + 26, oy0 = py + 8, oy1 = y1 - 10, cw = (ix1 - ix0) / n;
      // lattice dado
      const dq = quad(ix0, y0 + 6, ix1, py, zz); wash(dq, darken(wood, 0.15), { a: 0.5 });
      for (let x = ix0; x < ix1; x += 6) { L3([x, y0 + 6, zz], [x + 6, py, zz], { w: 0.3, a: 0.6, os: 0, brk: 0 }); L3([x + 6, y0 + 6, zz], [x, py, zz], { w: 0.3, a: 0.6, os: 0, brk: 0 }); }
      inkPoly(dq, { w: 0.6 });
      // the openings: cusped arches on slim colonnettes, dark inside, a half screen
      for (let k = 0; k < n; k++) {
        const a = ix0 + k * cw + 5, bb = ix0 + (k + 1) * cw - 5, op = openingPoly(a, oy0, bb, oy1, 'cusped');
        paper([W2(op, zz)]); wash(W2(op, zz), [50, 40, 38], { a: 0.7, g0: 1.2, g1: 0.6, gang: Math.PI / 2 });
        const sy = springY(a, bb, oy1, 'cusped', oy0), my = lerp(oy0, sy, 0.45);
        for (let x = a + 4; x < bb - 2; x += 6) L3([x, oy0, zz + 0.5], [x, my, zz + 0.5], { w: 0.35, a: 0.7, os: 0, brk: 0 });
        L3([a, my, zz + 0.5], [bb, my, zz + 0.5], { w: 0.6 });
        inkPoly(W2(op, zz), { w: 0.8, os: 0 });
        if (k) { const c = quad(a - 8, oy0, a - 2, sy, zz + 1); wash(c, mix(wood, [255, 255, 255], 0.2), { a: 0.6, rim: 0, off: 0 }); inkPoly(c, { w: 0.5, os: 0 }); }
      }
    } });
    if (!bangla) { // a later jharokha: a flat timber hood instead of the curved bangla eave
      const hb = { x0: x0 - 10, x1: x0 + ow + 10, y0: y1, y1: y1 + 8, z0: z, z1: z + d + 10 }; drawBox(hb, { col: darken(wood, 0.1), a: 0.75, w: D_INK }); return;
    }
    // bangla eave: a curved hood that droops at both ends
    const ex0 = x0 - 12, ex1 = x0 + ow + 12, ey = y1, rise = 18, top = [], bot = [];
    for (let i = 0; i <= 16; i++) { const t = i / 16, x = lerp(ex0, ex1, t), cv = Math.sin(t * Math.PI); top.push(P([x, ey + 8 + rise * cv, z + d + 10 - (1 - cv) * 6])); bot.push(P([x, ey + rise * cv * 0.7 - 4, z + d + 12])); }
    const hood = top.concat(bot.slice().reverse());
    paper([hood]); wash(hood, darken(wood, 0.1), { a: 0.78 });
    for (let i = 1; i < 16; i += 2) inkLine([top[i], bot[i]], { w: 0.35, a: 0.55, os: 0 });
    inkPoly(hood, { w: D_INK, os: 0 });
  });
}
// Lahore flat roof: a plastered parapet (often pierced), the stair-head room
// (mumty), plastic water tanks on stands, sometimes solar panels and a dish
function lahoreRoof(S, v, R, pal, st) {
  const z = v.z, ph = R.range(55, 90), col = v.mat.type === 'nanakshahi' ? v.mat.col : mix(v.mat.col, [230, 228, 220], 0.3);
  const cop = { x0: v.x0 - 5, x1: v.x1 + 5, y0: v.y1, y1: v.y1 + ph, z0: z - 12, z1: z + 6 };
  const pierced = R.chance(0.45), W = v.x1 - v.x0, zb = z - 80;
  S.bounds.push([v.x0, v.y1 + ph, z]);
  const mumty = R.chance(0.65), mw = R.range(130, 180), mx = R.chance(0.5) ? v.x0 + 20 : v.x1 - 20 - mw, mh = R.range(210, 240);
  const nT = S.retrofit === false ? 0 : R.int(1, 2), tanks = [];
  if (!nT) S.roofType = 'lahoreParapet';
  for (let k = 0; k < nT; k++) {
    const tw = R.range(70, 95), onM = mumty && k === 0 && R.chance(0.6);
    const tx = onM ? mx + (mw - tw) / 2 : clamp(R.range(v.x0 + 20, v.x1 - 20 - tw), v.x0 + 10, v.x1 - tw - 10);
    tanks.push({ x: tx, w: tw, h: tw * R.range(0.95, 1.15), base: onM ? v.y1 + mh + 6 : v.y1 + ph + R.range(14, 40), col: R.pick([[44, 44, 48], [44, 44, 48], [60, 110, 170], [236, 236, 230]]), z: onM ? zb - 40 : zb - 20 - k * 30 });
  }
  const solar = S.retrofit !== false && R.chance(0.35), dish = S.retrofit !== false && R.chance(st.utilities.dish || 0);
  for (const t of tanks) S.bounds.push([t.x, t.base + t.h + 20, t.z]);
  if (mumty) S.bounds.push([mx, v.y1 + mh, zb]);
  S.add(zb, () => {
    if (mumty) { // the stair-head room with its own door and a little chhajja
      const m = { x0: mx, x1: mx + mw, y0: v.y1, y1: v.y1 + mh, z0: zb - 160, z1: zb };
      drawBox(m, { col, a: 0.55, w: D_INK, blot: 2, front: () => { const dq = quad(mx + mw * 0.3, v.y1 + ph, mx + mw * 0.3 + 70, v.y1 + ph + 150, zb); paper([dq]); wash(dq, pal.door, { a: 0.6 }); inkPoly(dq, { w: D_INK }); } });
      const cb = { x0: mx - 8, x1: mx + mw + 8, y0: v.y1 + mh - 2, y1: v.y1 + mh + 6, z0: zb - 168, z1: zb + 16 }; drawBox(cb, { col: [214, 210, 202], a: 0.55, w: 0.8 });
    }
    if (solar) { // a tilted array on a steel frame
      const left = !(mumty && mx < (v.x0 + v.x1) / 2), sx0 = left ? v.x0 + 20 : mx + mw + 20, room = left ? (mumty ? mx - 20 : v.x1 - 20) - sx0 : v.x1 - 20 - sx0, sw = Math.min(200, W * 0.45, room), sz = zb - 60;
      if (sw > 70) {
      const f = new Face([sx0, v.y1 + 60, sz + 20], [1, 0, 0], [0, 0.6, -0.8], rectP(sw, 110));
      for (const xx of [sx0 + 8, sx0 + sw - 8]) L3([xx, v.y1, sz + 20], [xx, v.y1 + 60, sz + 20], { w: 0.9 });
      const p = f.spoly(); paper([p]); wash(p, [52, 66, 96], { a: 0.75, g0: 1.2, g1: 0.6 });
      for (let k = 1; k < 4; k++) inkLine([f.sp(sw * k / 4, 0), f.sp(sw * k / 4, 110)], { w: 0.4, a: 0.7, os: 0 });
      inkLine([f.sp(0, 55), f.sp(sw, 55)], { w: 0.4, a: 0.7, os: 0 }); inkPoly(p, { w: D_INK });
    } }
    for (const t of tanks) { // ribbed plastic tank on an angle-iron stand
      const { x, w, h, base, col: tc } = t;
      for (const xx of [x + 6, x + w - 6]) L3([xx, v.y1, t.z], [xx, base, t.z], { w: 1 });
      L3([x + 6, v.y1 + 10, t.z], [x + w - 6, base - 6, t.z], { w: 0.5 }); L3([x, base, t.z], [x + w, base, t.z], { w: 1.2 });
      const body = quad(x, base, x + w, base + h, t.z + 2); paper([body]); wash(body, tc, { a: tc[0] > 200 ? 0.3 : 0.75, g0: 0.8, g1: 1.2, gang: 0 });
      wash(SUN.left ? quad(x + w * 0.62, base, x + w, base + h, t.z + 2) : quad(x, base, x + w * 0.38, base + h, t.z + 2), COL.shadowDeep, { a: 0.3, rim: 0 });
      for (let yy = base + h * 0.2; yy < base + h - 2; yy += h * 0.2) L3([x, yy, t.z + 2], [x + w, yy, t.z + 2], { w: 0.45, a: 0.6 });
      inkPoly(body, { w: D_INK });
      const lid = []; for (let i = 0; i <= 12; i++) { const a = Math.PI - i / 12 * Math.PI; lid.push(P([x + w / 2 + Math.cos(a) * w / 2, base + h + Math.sin(a) * 10, t.z + 2])); }
      paper([lid]); wash(lid, tc, { a: tc[0] > 200 ? 0.3 : 0.8 }); inkLine(lid, { w: D_INK, os: 0 });
      const cap = quad(x + w / 2 - 10, base + h + 8, x + w / 2 + 10, base + h + 14, t.z + 3); wash(cap, darken(tc, 0.1), { a: 0.8 }); inkPoly(cap, { w: 0.5 });
      L3([x + w - 4, base + 10, t.z + 2], [x + w + 14, base - 30, t.z + 2], { w: 0.7 }); // the outlet pipe
    }
    if (dish) { const dx = v.x1 - 70, c = P([dx, v.y1 + ph + 40, zb + 30]), r = 18 * VIEW.k; L3([dx, v.y1 + ph, zb + 30], [dx, v.y1 + ph + 38, zb + 30], { w: 0.8 }); C.fillStyle = rgba(COL.paper, 1); C.beginPath(); C.ellipse(c[0], c[1], r, r * 0.85, -0.4, 0, TAU); C.fill(); wash([...Array(14)].map((_, i) => { const a = i / 14 * TAU; return [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r * 0.85]; }), [224, 224, 220], { a: 0.4 }); C.strokeStyle = rgba(COL.ink, 0.8); C.lineWidth = 1; C.beginPath(); C.ellipse(c[0], c[1], r, r * 0.85, -0.4, 0, TAU); C.stroke(); }
  });
  S.add(z + 6, () => {
    shadowBox(cop, { a: 0.45 });
    drawBox(cop, { col, w: W_INK, blot: 1, front: () => {
      if (pierced) { // jali parapet: a band of pierced openings between solid posts
        const n = Math.max(4, Math.round(W / 50)), pw = W / n;
        for (let k = 0; k < n; k++) { const q = quad(v.x0 + k * pw + 8, cop.y0 + 14, v.x0 + (k + 1) * pw - 8, cop.y1 - 12, z + 6); wash(q, darken(col, 0.35), { a: 0.4, rim: 0 }); for (let yy = cop.y0 + 20; yy < cop.y1 - 14; yy += 8) for (let xx = v.x0 + k * pw + 12; xx < v.x0 + (k + 1) * pw - 10; xx += 8) { const c = P([xx, yy, z + 6]); C.fillStyle = rgba(darken(col, 0.45), 0.6); C.beginPath(); C.arc(c[0], c[1], 1.4 * VIEW.k, 0, TAU); C.fill(); } inkPoly(q, { w: 0.5, a: 0.7 }); }
      } else L3([cop.x0, cop.y1 - 10, z + 6], [cop.x1, cop.y1 - 10, z + 6], { w: 0.5, a: 0.6 });
    } });
  });
  S.roofLine = [[cop.x0, cop.y1, z], [cop.x1, cop.y1, z]];
}
// Amsterdam cornice gable (lijstgevel, 18th c.): the facade ends in a straight
// moulded timber cornice over an attic storey, the hoist beam just below it
function corniceGable(S, v, R, pal, st) {
  const W = v.x1 - v.x0, cx = (v.x0 + v.x1) / 2, z = v.z, y1 = v.y1, ah = R.range(70, 95), ch = R.range(26, 34);
  const attic = { x0: v.x0, x1: v.x1, y0: y1, y1: y1 + ah, z0: z - 30, z1: z };
  const cor = { x0: v.x0 - 14, x1: v.x1 + 14, y0: y1 + ah, y1: y1 + ah + ch, z0: z - 10, z1: z + 24 };
  const ornate = R.chance(0.5);
  S.bounds.push([cx, cor.y1 + (ornate ? 40 : 0), z]);
  S.add(z + 0.05, () => {
    const p = quad(attic.x0, attic.y0, attic.x1, attic.y1, z); paper([p]); wash(p, v.mat.col, { a: 0.6, blot: 2 });
    brickPatch(attic.x0, attic.y0, attic.x1, attic.y1, z, texMask(RR, 0.38), attic); inkPoly(p, { w: W_INK });
    for (const vv of S.vols.slice(1)) for (const x of [vv.x0 + 22, vv.x1 - 22]) { const c = P([x, vv.y0 + 6, z]); C.strokeStyle = rgba(COL.ink, 0.85); C.lineWidth = 1.6; C.beginPath(); C.moveTo(c[0] - 4, c[1] - 6); C.bezierCurveTo(c[0] + 6, c[1] - 6, c[0] - 6, c[1] + 6, c[0] + 4, c[1] + 6); C.stroke(); }
  });
  windowEl(S, cx - 32, y1 + 14, 64, ah - 26, z, { top: 'flat', cols: 2, rows: 2, kind: 'sash', frameCol: pal.frame, frameW: 6, recess: 8, noSill: true, inside: null }, pal);
  S.add(z + 26, () => {
    shadowBox(cor, { a: 0.5 });
    drawBox(cor, { col: [242, 240, 232], a: 0.55, w: W_INK, front: () => { for (const dy of [ch * 0.3, ch * 0.62]) L3([cor.x0, cor.y0 + dy, cor.z1], [cor.x1, cor.y0 + dy, cor.z1], { w: 0.5, a: 0.6 }); for (let x = cor.x0 + 10; x < cor.x1 - 6; x += 16) { const q = quad(x, cor.y0 - 6, x + 8, cor.y0, z + 6); wash(q, [236, 232, 222], { a: 0.4, rim: 0, off: 0 }); inkPoly(q, { w: 0.4, a: 0.6, os: 0 }); } } });
    if (ornate) { const crest = []; for (let i = 0; i <= 12; i++) { const a = Math.PI - i / 12 * Math.PI; crest.push([cx + Math.cos(a) * W * 0.18, cor.y1 + Math.sin(a) * 36]); } const cp = W2(crest, z + 24); paper([cp]); wash(cp, [242, 240, 232], { a: 0.55 }); inkPoly(cp, { w: D_INK, os: 0 }); }
    const hb = { x0: cx - 7, x1: cx + 7, y0: cor.y0 - 16, y1: cor.y0 - 2, z0: z, z1: z + 70 };
    shadowBox(hb, { a: 0.4 }); drawBox(hb, { col: [90, 70, 60], a: 0.7, w: D_INK });
    L3([cx, hb.y0, z + 64], [cx, hb.y0 - 30, z + 64], { w: 0.7 });
  });
  S.roofType = 'corniceGable'; S.roofLine = [[cor.x0, cor.y1, z + 24], [cor.x1, cor.y1, z + 24]];
}
// Straits Art Deco parapet (1930s–50s): a stepped central panel with the year of
// building, horizontal speed lines and fluted end piers
function decoParapet(S, v, R, pal, st) {
  const W = v.x1 - v.x0, cx = (v.x0 + v.x1) / 2, z = v.z, y1 = v.y1, ph = R.range(55, 75), pw = W * R.range(0.32, 0.42), pr = R.range(55, 80);
  const year = String(R.int(1931, 1958)), steps = R.int(2, 3);
  const prof = [[v.x0, y1], [v.x1, y1], [v.x1, y1 + ph]];
  for (let k = 0; k < steps; k++) { const t0 = pw / 2 + (steps - k) * 14, yy = y1 + ph + (pr * k) / steps; prof.push([cx + t0, yy], [cx + t0, y1 + ph + (pr * (k + 1)) / steps]); }
  const right = prof.slice(3), left = right.slice().reverse().map(p => [2 * cx - p[0], p[1]]);
  const wall = prof.concat(left, [[v.x0, y1 + ph]]);
  S.bounds.push([cx, y1 + ph + pr, z]);
  S.add(z + 9, () => {
    const p = W2(wall, z + 4); paper([p]); wash(p, mix(v.mat.col, [255, 255, 255], 0.2), { a: 0.6, blot: 2 });
    for (let k = 0; k < 3; k++) { const yy = y1 + 14 + k * 9; for (const [a, b] of [[v.x0 + 14, cx - pw / 2 - 30], [cx + pw / 2 + 30, v.x1 - 14]]) if (b > a) L3([a, yy, z + 4], [b, yy, z + 4], { w: 0.6, a: 0.75 }); }
    for (const x of [v.x0 + 4, v.x1 - 22]) { const q = quad(x, y1, x + 18, y1 + ph + 10, z + 6); paper([q]); wash(q, mix(v.mat.col, [255, 255, 255], 0.3), { a: 0.6 }); for (let k = 1; k < 3; k++) L3([x + k * 6, y1 + 4, z + 6], [x + k * 6, y1 + ph + 6, z + 6], { w: 0.45, a: 0.7 }); inkPoly(q, { w: D_INK }); }
    const pq = quad(cx - pw * 0.32, y1 + ph * 0.55, cx + pw * 0.32, y1 + ph + pr * 0.55, z + 5); wash(pq, mix(v.mat.col, [255, 255, 255], 0.35), { a: 0.5 }); inkPoly(pq, { w: 0.7 });
    latinText(new Face([cx - pw * 0.3, y1 + ph * 0.6, z + 5], [1, 0, 0], [0, 1, 0], rectP(pw * 0.6, pr * 0.42)), 0, 0, pw * 0.6, pr * 0.42, year, { font: 'roman', col: [60, 56, 52], size: 0.8 });
    inkPoly(p, { w: W_INK });
  });
  S.roofType = 'decoParapet'; S.roofLine = [[v.x0 + 10, y1 + ph, z + 4], [cx - pw / 2, y1 + ph, z + 4]];
}


// ---------------------------------------------------------------- dormers on a pitched roof
// on the axes of the windows below where there are any, else two on the thirds
function dormers(S, v, face, len, ov, order, R, pal) {
  const W = v.x1 - v.x0, axes = (S.topWins && v.floor ? S.topWins.map(w => w.x + w.w / 2) : W > 520 ? [v.x0 + W * 0.3, v.x0 + W * 0.7] : [v.x0 + W / 2]);
  const t0 = len * 0.22;
  for (const ax of axes) {
    const s = ax - (v.x0 - ov), base = face.w3(s, t0), dw = R.range(78, 96), dh = R.range(105, 130), zf = base[2], yb = base[1];
    const b = { x0: ax - dw / 2, x1: ax + dw / 2, y0: yb, y1: yb + dh, z0: zf - 90, z1: zf };
    S.bounds.push([ax, yb + dh + 50, zf]);
    S.add(order + 1, () => {
      castShadow(boxCorners(b), { a: 0.4 });
      drawBox(b, { col: mix(v.mat.col, [240, 236, 228], 0.4), a: 0.55, w: D_INK });
      const ped = W2([[b.x0 - 10, b.y1], [b.x1 + 10, b.y1], [ax, b.y1 + 44]], zf + 4); paper([ped]); wash(ped, darken(pal.roof, 0.1), { a: 0.65 }); inkPoly(ped, { w: D_INK });
    });
    windowEl(S, ax - dw / 2 + 12, yb + 12, dw - 24, dh - 22, zf, { top: R.chance(0.5) ? 'arch' : 'flat', cols: 2, rows: 3, kind: 'french', frameCol: pal.frame, frameW: 6, inside: R.chance(0.5) ? 'curtain' : null, curtainCol: [240, 236, 226], recess: 10, order: order + 1.5 - zf - 0.2, noSill: true }, pal);
  }
}

// ---------------------------------------------------------------- Istanbul cumba
// a closed timber bay standing out from the floor on angled struts (eli böğründe),
// clapboarded like the house, with a row of sash windows across its front
function cumba(S, v, cx, cw, R, pal, st) {
  const z = v.z, d = R.range(55, 75), y0 = v.y0 + 10, y1 = v.y1 - 6, x0 = cx - cw / 2, x1 = cx + cw / 2;
  const b = { x0, x1, y0, y1, z0: z, z1: z + d }, col = v.mat.col, timberish = v.mat.type === 'siding';
  S.debug.opens.push({ kind: 'cumba', x0, x1, y0, y1, z, d });
  const n = cw > 240 ? 3 : 2, gap = 14, ww = Math.min(82, (cw - 24 - gap * (n - 1)) / n), wh = clamp(y1 - y0 - 70, 90, 175), wy = y0 + Math.max(28, (y1 - y0 - wh) * 0.42);
  const struts = n === 3 ? [x0 + 12, cx - 3, x1 - 18] : [x0 + 12, x1 - 18];
  S.add(z + d + 0.5, () => {
    castShadow(boxCorners({ ...b, y0: y0 - 50 }), { a: 0.5 });
    for (const sx of struts) { // the struts: wall to the bay's front underside
      const q = [P([sx, y0 - 55, z]), P([sx + 6, y0 - 55, z]), P([sx + 6, y0, z + d - 4]), P([sx, y0, z + d - 4])];
      paper([q]); wash(q, timberish ? darken(col, 0.25) : [210, 206, 198], { a: 0.6, rim: 0 }); inkPoly(q, { w: 0.6 });
    }
    drawBox(b, { col, a: 0.55, w: W_INK, front: () => {
      if (timberish) for (let y = y0 + 15; y < y1 - 4; y += 15) L3([x0, y, z + d], [x1, y, z + d], { w: T_INK, a: 0.5, brk: 0.5 });
      else { L3([x0, wy - 10, z + d], [x1, wy - 10, z + d], { w: 0.6, a: 0.7 }); }
    } });
    const cap = { x0: x0 - 8, x1: x1 + 8, y0: y1 - 4, y1: y1 + 6, z0: z, z1: z + d + 8 };
    drawBox(cap, { col: mix(col, [250, 248, 240], 0.3), a: 0.5, w: D_INK });
  });
  const wsty = { top: 'flat', cols: 2, rows: 3, kind: 'sash', frameCol: pal.frame, frameW: 6, recess: 6, curtainCol: mix(R.pick([pal.acc, [240, 230, 210]]), [255, 255, 255], 0.5), order: 0.6 };
  for (let k = 0; k < n; k++) windowEl(S, x0 + 12 + k * (ww + gap) + (cw - 24 - n * ww - (n - 1) * gap) / 2, wy, ww, wh, z + d, { ...wsty, inside: R.wpick([[null, 2], ['curtain', 2.5]]) }, pal);
}

// ---------------------------------------------------------------- New Orleans cast-iron gallery
// a deck at each gallery floor carried on slender iron posts at the curb, iron
// railings, a lace frieze between the posts, a tin roof over the top level
function ironGallery(S, vols, R, pal, floors) {
  const g = vols[0], D = Math.round(R.range(230, 280)), x0 = g.x0 - 4, x1 = g.x1 + 4, W = x1 - x0;
  const lv = floors.map(f => vols[f]).filter(Boolean); if (!lv.length) return;
  const top = lv[lv.length - 1].y1 - 14, rh = 95, zz = D - 4;
  const nP = Math.max(2, Math.round(W / R.range(230, 290))), xs = [...Array(nP + 1)].map((_, k) => lerp(x0 + 6, x1 - 6, k / nP));
  const iron = [44, 46, 52], panel = R.pick(['rings', 'diamonds', 'arches']);
  S.bounds.push([x0, 0, D], [x1, top + 20, D]);
  S.debug.opens.push({ kind: 'gallery', x0, x1, y0: lv[0].y0, y1: top, z: 0, d: D });
  S.add(D + 1, () => {
    lv.forEach((v, i) => {
      const y = v.y0, deck = { x0, x1, y0: y - 14, y1: y, z0: 0, z1: D };
      castShadow(boxCorners(deck), { a: 0.28 });
      drawBox(deck, { col: [160, 150, 140], a: 0.5, w: D_INK });
      L3([x0, y + rh, zz], [x1, y + rh, zz], { w: 1.5 }); L3([x0, y + 12, zz], [x1, y + 12, zz], { w: 0.8 });
      for (let x = x0; x <= x1 + 0.1; x += 8) L3([x, y, zz], [x, y + rh, zz], { w: 0.4, os: 0, brk: 0 });
      for (let x = x0 + 14; x < x1 - 8; x += 28) {
        const c = P([x, y + rh * 0.55, zz]), r = 9 * VIEW.k; C.strokeStyle = rgba(COL.ink, 0.8); C.lineWidth = 0.75;
        C.beginPath();
        if (panel === 'rings') C.arc(c[0], c[1], r, 0, TAU);
        else if (panel === 'diamonds') { C.moveTo(c[0], c[1] - r * 1.3); C.lineTo(c[0] + r, c[1]); C.lineTo(c[0], c[1] + r * 1.3); C.lineTo(c[0] - r, c[1]); C.closePath(); }
        else { C.arc(c[0], c[1] + r, r, Math.PI, TAU); }
        C.stroke();
      }
      for (const xx of [x0, x1]) L3([xx, y + rh, zz], [xx, y + rh, v.z], { w: 0.8 });
      // lace frieze along the top of this level, scalloped between the posts
      const yT = (i < lv.length - 1 ? lv[i + 1].y0 - 14 : top), yb = yT - 30;
      L3([x0, yT, zz + 2], [x1, yT, zz + 2], { w: 0.9 }); L3([x0, yb, zz + 2], [x1, yb, zz + 2], { w: 0.5, a: 0.7 });
      for (let k = 0; k < xs.length - 1; k++) {
        const a = xs[k], b = xs[k + 1], pts = [];
        for (let t = 0; t <= 1.001; t += 0.1) pts.push(P([lerp(a, b, t), yb - Math.sin(t * Math.PI) * 26, zz + 2]));
        inkLine(pts, { w: 0.7, os: 0 });
        for (let x = a + 10; x < b - 6; x += 12) { const c = P([x, (yT + yb) / 2, zz + 2]); C.strokeStyle = rgba(COL.ink, 0.6); C.lineWidth = 0.5; C.beginPath(); C.arc(c[0], c[1], 3.5 * VIEW.k, 0, TAU); C.stroke(); }
        for (const s of [a, b]) { const br = [P([s, yb - 34, zz + 2]), P([s + (s === a ? 26 : -26), yb, zz + 2])]; inkLine(br, { w: 0.6, os: 0 }); }
      }
    });
    const roofB = { x0: x0 - 6, x1: x1 + 6, y0: top, y1: top + 10, z0: 0, z1: D + 14 };
    castShadow(boxCorners(roofB), { a: 0.26 });
    drawBox(roofB, { col: [176, 178, 182], a: 0.55, w: D_INK });
    for (const x of xs) { const p = { x0: x - 4, x1: x + 4, y0: 0, y1: top, z0: D - 8, z1: D }; shadowBox(p, { a: 0.3 }); drawBox(p, { col: iron, a: 0.75, w: 0.7 }); }
  });
  S.creepLines = (S.creepLines || []).concat([[[x0 + 20, top - 24, D + 2], [x1 - 20, top - 24, D + 2]]]);
}
