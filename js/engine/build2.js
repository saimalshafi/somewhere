// ============================================================================
//  SOMEWHERE — architecture painters (part 2): openings, ground floors, upper floors
// ============================================================================

// ---------------------------------------------------------------- windows
// One function, many dialects. The style rulebook fixes proportion, head shape,
// glazing bars, shutters and the iron/flower furniture that goes with them.
function windowEl(S, x, y, w, h, z, st, pal) {
  const top = st.top || 'flat';
  S.debug.opens.push({ kind: 'window', x0: x, x1: x + w, y0: y, y1: y + h, z, top });
  S.stains.push({ x0: x, x1: x + w, y: y - 8, z });
  const sill = { x0: x - 7, x1: x + w + 7, y0: y - 8, y1: y - 1, z0: z, z1: z + (st.sillD || 9) };
  const grille = st.grille ? { x0: x - 5, x1: x + w + 5, y0: y - 2, y1: y + h + 4, z0: z, z1: z + 16 } : null;
  const shutterState = st.shutters ? (st.shutterState || 'open') : null;
  S.add(z + 0.2 + (st.order || 0), () => {
    if (!st.noSill) shadowBox(sill);
    if (st.kashi) kashiFrame(x - 16, y - 6, x + w + 16, y + h + 18, z, gsY(x, x + w, y + h, top, y));
    // stone surround / architrave and keystone
    if (st.surround) {
      const so = openingPoly(x - 11, y - 3, x + w + 11, y + h + 11, top);
      wash(W2(so, z), mix(pal.stone, [255, 255, 250], 0.3), { a: 0.4, amp: 0.6 }); inkPoly(W2(so, z), { w: 0.75, a: 0.7 });
      if (st.keystone) { const kx = x + w / 2, ky = y + h + 11; const k = [[kx - 9, ky - 14], [kx + 9, ky - 14], [kx + 12, ky + 6], [kx - 12, ky + 6]]; paper([W2(k, z + 1)]); wash(W2(k, z + 1), pal.stone, { a: 0.5 }); inkPoly(W2(k, z + 1), { w: 0.7 }); }
    }
    if (st.relieving) { // brick relieving arch over the lintel
      const ax0 = x - 8, ax1 = x + w + 8, yb = y + h + 2, rise = 12, th = 15, outer = [], inner = [];
      for (let i = 0; i <= 12; i++) { const t = i / 12, xx = lerp(ax0, ax1, t), s = Math.sin(t * Math.PI) * rise; inner.push([xx, yb + s]); outer.push([xx, yb + s + th]); }
      const band = inner.concat(outer.reverse());
      wash(W2(band, z), [214, 150, 120], { a: 0.5, amp: 0.4 }); inkPoly(W2(band, z), { w: 0.6, a: 0.7, os: 0 });
      for (let i = 1; i < 12; i += 1) { const t = i / 12, xx = lerp(ax0, ax1, t), s = Math.sin(t * Math.PI) * rise; L3([xx, yb + s, z], [xx + (t - 0.5) * 6, yb + s + th, z], { w: 0.4, a: 0.55, os: 0 }); }
    }
    const op = openingPoly(x, y, x + w, y + h, top), opS = W2(op, z);
    paper([opS]);
    wash(opS, st.frameCol, { a: 0.42, amp: 0.8 });
    const fr = st.frameW || 6, gp = openingPoly(x + fr, y + fr, x + w - fr, y + h - fr, top), gq = W2(gp, z);
    const gx0 = x + fr, gx1 = x + w - fr, gy0 = y + fr, gy1 = y + h - fr, gs = springY(gx0, gx1, gy1, top, gy0);
    const closed = shutterState === 'closed';
    if (!closed) {
      if (st.inside === 'curtain') {
        const cw = (gx1 - gx0) * RR.range(0.3, 0.5), left = RR.chance(0.5), cx0 = left ? gx0 : gx1 - cw, cx1 = left ? gx0 + cw : gx1;
        C.save(); pathOf(gq); C.clip();
        wash(quad(cx0, gy0, cx1, gy1, z), st.curtainCol, { a: 0.42, amp: 0.8 });
        for (let k = 1; k < 4; k++) { const xx = lerp(cx0, cx1, k / 4); L3([xx, gy1, z], [xx + RR.gauss() * 2, gy0 + RR.range(0, 20), z], { w: 0.4, a: 0.5 }); }
        C.restore();
      } else if (st.inside === 'blind') {
        const bh = (gs - gy0) * RR.range(0.25, 0.6);
        wash(quad(gx0, gs - bh, gx1, gs, z), [236, 226, 204], { a: 0.5, amp: 0.6 });
        for (let yy = gs - 5; yy > gs - bh; yy -= 5) L3([gx0, yy, z], [gx1, yy, z], { w: 0.35, a: 0.45, brk: 0 });
      } else if (st.inside === 'plant') {
        const c = P([lerp(gx0, gx1, RR.range(0.3, 0.7)), gy0 + 12, z]); foliage(c[0], c[1], 14 * VIEW.k, 10 * VIEW.k, { leaf: 5, under: 0.2 });
      }
      wash(gq, pal.glass, { a: 0.5, g0: 1.25, g1: 0.35, gang: Math.PI / 2, amp: 0.8, blot: 1, blotCol: [110, 130, 160] });
      C.save(); pathOf(gq); C.clip(); C.globalCompositeOperation = 'source-over';
      const rx = lerp(gx0, gx1, RR.range(0.15, 0.6)), rw = (gx1 - gx0) * RR.range(0.1, 0.22);
      C.fillStyle = rgba(COL.paper, 0.45); pathOf([P([rx, gy1 + 5, z]), P([rx + rw, gy1 + 5, z]), P([rx + rw - 40, gy0 - 5, z]), P([rx - 40, gy0 - 5, z])]); C.fill();
      // recess shadow from the reveal, clipped to the glass
      const rd = st.recess || 9, L = SUN.L, dx = rd * Math.abs(L[0] / L[2]), dy = rd * L[1] / L[2];
      const sp = SUN.left
        ? [[gx0 - 2, gy1 + 2], [gx1 + 2, gy1 + 2], [gx1 + 2, gs - dy], [gx0 + dx, gs - dy], [gx0 + dx, gy0], [gx0 - 2, gy0]]
        : [[gx1 + 2, gy1 + 2], [gx0 - 2, gy1 + 2], [gx0 - 2, gs - dy], [gx1 - dx, gs - dy], [gx1 - dx, gy0], [gx1 + 2, gy0]];
      wash(W2(sp, z), COL.shadowDeep, { a: 0.55, amp: 0.6, rim: 0.1, inset: 0 });
      // glazing bars
      const n = st.cols || 2, rows = st.rows || 1;
      for (let k = 1; k < n; k++) {
        const xx = lerp(gx0, gx1, k / n);
        wash(quad(xx - 2, gy0, xx + 2, gy1, z), st.frameCol, { a: 0.5, amp: 0.3, rim: 0, off: 0 });
        L3([xx - 2, gy0, z], [xx - 2, gy1, z], { w: D_INK }); L3([xx + 2, gy0, z], [xx + 2, gy1, z], { w: 0.5, a: 0.6 });
      }
      for (let r = 1; r < rows; r++) { const yy = lerp(gy0, gs, r / rows); L3([gx0, yy, z], [gx1, yy, z], { w: st.kind === 'sash' && r === rows / 2 ? 1.6 : 0.55, a: 0.75, brk: 0 }); }
      if (st.kind === 'orosi') { // coloured glass in a timber lattice
        const n2 = st.cols, r2 = st.rows, glassCols = [[200, 56, 56], [56, 90, 176], [232, 188, 56], [70, 146, 96]];
        for (let i = 0; i < n2; i++) for (let r = 0; r < r2; r++) if (RR.chance(0.55)) { const cx0 = lerp(gx0, gx1, i / n2), cx1 = lerp(gx0, gx1, (i + 1) / n2), cy0 = lerp(gy0, gs, r / r2), cy1 = lerp(gy0, gs, (r + 1) / r2); wash(quad(cx0 + 1, cy0 + 1, cx1 - 1, cy1 - 1, z), RR.pick(glassCols), { a: 0.42, rim: 0, off: 0, amp: 0.3, inset: 0 }); }
        for (let i = 0; i < n2; i++) { const cx0 = lerp(gx0, gx1, i / n2), cx1 = lerp(gx0, gx1, (i + 1) / n2); for (let r = 0; r < r2; r++) { const cy0 = lerp(gy0, gs, r / r2), cy1 = lerp(gy0, gs, (r + 1) / r2), mx = (cx0 + cx1) / 2, my = (cy0 + cy1) / 2; inkPoly(W2([[mx, cy0], [cx1, my], [mx, cy1], [cx0, my]], z), { w: 0.35, a: 0.55, os: 0 }); } }
      }
      if (top === 'cusped') { L3([gx0, gs, z], [gx1, gs, z], { w: D_INK }); L3([(gx0 + gx1) / 2, gs, z], [(gx0 + gx1) / 2, gy1 - 6, z], { w: 0.5, a: 0.7, os: 0 }); }
      if (top === 'pointed' || top === 'persian') { L3([gx0, gs, z], [gx1, gs, z], { w: D_INK }); const cx = (gx0 + gx1) / 2; for (let k = 1; k < 4; k++) L3([cx, gs, z], [lerp(gx0, gx1, k / 4), gy1 - (gy1 - gs) * Math.abs(k / 4 - 0.5) * 1.6, z], { w: 0.45, a: 0.7, os: 0 }); if (st.kind === 'orosi') for (let k = 0; k < 4; k++) wash(W2([[cx, gs], [lerp(gx0, gx1, k / 4), gs + (gy1 - gs) * 0.3], [lerp(gx0, gx1, (k + 1) / 4), gs + (gy1 - gs) * 0.3]], z), RR.pick([[200, 56, 56], [56, 90, 176], [232, 188, 56]]), { a: 0.4, rim: 0, off: 0, inset: 0 }); }
      if (top === 'arch' || top === 'fanlight') { // fanlight: spring bar and radiating bars
        L3([gx0, gs, z], [gx1, gs, z], { w: D_INK });
        const cx = (gx0 + gx1) / 2;
        for (let k = 1; k < 5; k++) { const a = k / 5 * Math.PI; L3([cx, gs, z], [cx + Math.cos(a) * (gx1 - gx0) / 2, gs + Math.sin(a) * (gy1 - gs), z], { w: 0.45, a: 0.7, os: 0 }); }
      }
      if (st.transom) { const yy = lerp(gy0, gs, 0.72); L3([gx0, yy, z], [gx1, yy, z], { w: D_INK }); }
      C.restore();
    }
    inkPoly(opS, { w: W_INK });
    inkPoly(gq, { w: D_INK });
    if (!st.noSill) drawBox(sill, { col: st.surround ? pal.stone : [226, 222, 214], w: D_INK });
    // shutters: open beside the window, or closed over it
    if (st.shutters) {
      const kind = st.shutters, col = st.shutterCol;
      const leaf = (sx0, sx1, zz) => {
        const q = quad(sx0, y, sx1, y + h - (top === 'flat' ? 0 : 0), zz);
        paper([q]); wash(q, col, { a: 0.6, amp: 0.8, blot: 1 });
        if (kind === 'louvre' || kind === 'fullLouvre') { for (let yy = y + 6; yy < y + h - 3; yy += 5.5) L3([sx0 + 3, yy, zz], [sx1 - 3, yy, zz], { w: 0.4, a: 0.6, brk: 0 }); L3([sx0, y + h * 0.5, zz], [sx1, y + h * 0.5, zz], { w: 0.7 }); }
        else if (kind === 'panel') { inkPoly(quad(sx0 + 5, y + 6, sx1 - 5, y + h * 0.47, zz), { w: 0.5, a: 0.7 }); inkPoly(quad(sx0 + 5, y + h * 0.53, sx1 - 5, y + h - 6, zz), { w: 0.5, a: 0.7 }); }
        else if (kind === 'fold') { for (let xx = sx0 + (sx1 - sx0) / 3; xx < sx1 - 2; xx += (sx1 - sx0) / 3) L3([xx, y, zz], [xx, y + h, zz], { w: 0.5, a: 0.7 }); for (let yy = y + 8; yy < y + h; yy += 8) L3([sx0, yy, zz], [sx1, yy, zz], { w: 0.3, a: 0.45, brk: 0 }); }
        inkPoly(q, { w: D_INK });
      };
      const sw = kind === 'fold' ? w * 0.22 : w * 0.5;
      if (closed) { leaf(x, x + w / 2, z + 3); leaf(x + w / 2, x + w, z + 3); }
      else if (shutterState === 'half') { leaf(x + w / 2, x + w, z + 3); leaf(x - sw - 2, x - 2, z + 2); }
      else { leaf(x - sw - 2, x - 2, z + 2); leaf(x + w + 2, x + w + sw + 2, z + 2); }
    }
    if (st.box) windowBox(x - 6, y - 8, w + 12, z, st.box, pal);
  });
  if (st.balconette) S.add(z + 12, () => { // wrought iron guard rail in front of a tall window
    const bx0 = x - 8, bx1 = x + w + 8, by0 = y - 4, by1 = y + Math.min(95, h * 0.45), zz = z + 10;
    castShadow([[bx0, by0, zz], [bx1, by0, zz], [bx0, by1, zz], [bx1, by1, zz], [bx0, by0, z], [bx1, by1, z]], { a: 0.28 });
    L3([bx0, by1, zz], [bx1, by1, zz], { w: 1.4 }); L3([bx0, by0 + 6, zz], [bx1, by0 + 6, zz], { w: 0.9 });
    for (let xx = bx0; xx <= bx1 + 0.1; xx += 9) L3([xx, by0 + 6, zz], [xx, by1, zz], { w: 0.55, os: 0 });
    // scrolls along the middle
    for (let xx = bx0 + 9; xx < bx1 - 4; xx += 18) { const c = P([xx + 4.5, (by0 + by1) / 2, zz]), r = 4 * VIEW.k; C.strokeStyle = rgba(COL.ink, 0.8); C.lineWidth = 0.7; C.beginPath(); C.arc(c[0], c[1], r, 0, TAU); C.stroke(); }
    for (const xx of [bx0, bx1]) L3([xx, by1, zz], [xx, by1, z], { w: 0.7 });
  });
  if (st.cage) ironCage(S, x, y, w, h, z, pal);
  if (st.chhajja) { // South Asian chhajja: a thin concrete sunshade over the opening on two small brackets
    const cy = y + h + (st.surround ? 17 : 10), d = 30, cb = { x0: x - 16, x1: x + w + 16, y0: cy, y1: cy + 7, z0: z, z1: z + d };
    S.add(z + d + 0.5, () => {
      castShadow(boxCorners({ ...cb, y0: cy - 2 }), { a: 0.5 });
      for (const bx of [cb.x0 + 6, cb.x1 - 10]) { const br = [[bx, cy], [bx + 4, cy], [bx + 4, cy - 16]]; wash(br.map(q => P([q[0], q[1], z + d * 0.6])), [196, 192, 184], { a: 0.6, rim: 0, off: 0 }); inkLine([P([bx, cy, z + d * 0.6]), P([bx + 4, cy - 16, z + d * 0.6])], { w: 0.6, os: 0 }); }
      drawBox(cb, { col: [214, 210, 202], a: 0.55, w: D_INK });
    });
  }
  if (grille) S.add(z + 0.35, () => {
    const ff = grille.z1, bars = Math.max(3, Math.round(w / 12)), L = SUN.L, d = ff - z;
    for (let k = 0; k <= bars; k++) {
      const xx = lerp(grille.x0, grille.x1, k / bars), sx = xx - d * L[0] / L[2], sy = -d * L[1] / L[2];
      wash([P([sx - 1, grille.y0 + sy, z]), P([sx + 1, grille.y0 + sy, z]), P([sx + 1, grille.y1 + sy, z]), P([sx - 1, grille.y1 + sy, z])], COL.shadowDeep, { a: 0.35, amp: 0.3, rim: 0, off: 0, inset: 0 });
      L3([xx, grille.y0, ff], [xx, grille.y1, ff], { w: 0.7 });
    }
    for (const yy of [grille.y0, grille.y1, lerp(grille.y0, grille.y1, 0.5)]) L3([grille.x0, yy, ff], [grille.x1, yy, ff], { w: D_INK });
    for (const xx of [grille.x0, grille.x1]) { L3([xx, grille.y1, ff], [xx, grille.y1, z], { w: 0.6 }); L3([xx, grille.y0, ff], [xx, grille.y0, z], { w: 0.6 }); }
    if (RR.chance(0.7)) { const pp = P([lerp(grille.x0, grille.x1, RR.range(0.2, 0.8)), grille.y0 + 6, ff]); foliage(pp[0], pp[1] - 4, RR.range(14, 26) * VIEW.k, RR.range(8, 14) * VIEW.k, { leaf: 5.5 }); }
  });
}

// ---------------------------------------------------------------- doors
function drawDoor(x0, x1, y0, y1, z, kind, top, pal, S) {
  const w = x1 - x0, h = y1 - y0, orig = kind;
  if (kind === 'genkan') kind = 'sliding';           // Japanese entrance: sliding glass with a lattice
  if (kind === 'cochere' || kind === 'pagar') kind = 'panel'; // carriage door / Straits door behind half-doors
  const op = openingPoly(x0, y0, x1, y1, top), sy = springY(x0, x1, y1, top, y0);
  const col = kind === 'studded' ? [126, 84, 56] : kind === 'glazed' ? pal.fascia : kind === 'sliding' ? (S.cls === 'tea' || S.cls === 'bar' ? pal.wood : pal.frame) : pal.door;
  C.save(); pathOf(W2(op, z)); C.clip();
  if (kind === 'sliding') {
    wash(W2(op, z), pal.interior, { a: 0.4, g0: 1.2, g1: 0.5 }); wash(W2(op, z), pal.glass, { a: 0.35 });
    const mid = (x0 + x1) / 2;
    for (const [a, b] of [[x0, mid], [mid, x1]]) {
      const kick = y0 + h * 0.28;
      wash(quad(a, y0, b, kick, z + 1), col, { a: 0.55 });
      inkPoly(quad(a + 3, y0, b - 3, y1, z + 1), { w: D_INK });
      L3([a + 3, kick, z + 1], [b - 3, kick, z + 1], { w: D_INK });
      if (S.cls === 'tea' || S.cls === 'bar') for (let yy = kick + 18; yy < y1 - 4; yy += 18) L3([a + 3, yy, z + 1], [b - 3, yy, z + 1], { w: 0.45, a: 0.6 });
      L3([(a + b) / 2, kick, z + 1], [(a + b) / 2, y1, z + 1], { w: 0.45, a: 0.6 });
    }
  } else if (kind === 'folding') { // timber leaves, half folded back to show the shop
    const n = Math.max(4, Math.round(w / 32)), open = RR.int(1, n - 2), lw = w / n;
    wash(W2(op, z), pal.interior, { a: 0.75, g0: 1.3, g1: 0.6 });
    for (let k = 0; k < n; k++) {
      if (k >= open && k < open + 2) continue;
      const a = x0 + k * lw, b = a + lw, q = quad(a + 1, y0, b - 1, y1, z + 1);
      wash(q, pal.wood, { a: 0.6, amp: 0.6 }); inkPoly(q, { w: 0.8 });
      inkPoly(quad(a + 6, y0 + 15, b - 6, y0 + h * 0.45, z + 1), { w: 0.45, a: 0.6 }); inkPoly(quad(a + 6, y0 + h * 0.55, b - 6, y1 - 12, z + 1), { w: 0.45, a: 0.6 });
    }
  } else { // panel / glazed door leaves with fanlight above the spring
    const leaves = w > 105 ? 2 : 1, lw = w / leaves, dTop = top === 'flat' && kind !== 'glazed' ? y1 : sy;
    const glassDoor = kind === 'glazed';
    for (let k = 0; k < leaves; k++) {
      const a = x0 + k * lw, b = a + lw, q = quad(a + 1, y0, b - 1, dTop, z + 1);
      wash(q, col, { a: 0.7, amp: 0.6, blot: 1 });
      if (glassDoor) { const gq = quad(a + 9, y0 + h * 0.33, b - 9, dTop - 9, z + 1); wash(gq, pal.interior, { a: 0.5, g0: 1.3, g1: 0.5 }); wash(gq, pal.glass, { a: 0.35 }); inkPoly(gq, { w: 0.6 }); }
      else { inkPoly(quad(a + 9, y0 + 14, b - 9, y0 + (dTop - y0) * 0.42, z + 1), { w: 0.55, a: 0.7 }); inkPoly(quad(a + 9, y0 + (dTop - y0) * 0.5, b - 9, dTop - 12, z + 1), { w: 0.55, a: 0.7 }); }
      inkPoly(q, { w: D_INK });
      const hp = P([k === 0 && leaves === 2 ? b - 8 : (leaves === 1 ? b - 12 : a + 8), y0 + h * 0.45, z + 2]); C.fillStyle = rgba([180, 150, 80], 0.9); C.beginPath(); C.arc(hp[0], hp[1], 1.8, 0, TAU); C.fill();
    }
    if (kind === 'studded') { // nail-studded timber leaves with the two knockers of a Persian door
      for (let k = 0; k < leaves; k++) { const a = x0 + k * lw, b = a + lw; for (let yy = y0 + 14; yy < dTop - 8; yy += 16) for (let xx = a + 9; xx < b - 6; xx += 12) { const p = P([xx, yy, z + 1.5]); C.fillStyle = rgba([60, 50, 40], 0.85); C.beginPath(); C.arc(p[0], p[1], 1.3, 0, TAU); C.fill(); } }
      const kx = leaves === 2 ? (x0 + x1) / 2 : x1 - 18, ky = y0 + h * 0.55;
      const r1 = P([kx - 10, ky + 8, z + 2]); C.strokeStyle = rgba([160, 130, 70], 0.95); C.lineWidth = 1.3; C.beginPath(); C.arc(r1[0], r1[1], 4.5 * VIEW.k / 1.4, 0, TAU); C.stroke();
      inkLine([P([kx + 10, ky + 14, z + 2]), P([kx + 10, ky - 2, z + 2])], { w: 2.4, col: [150, 120, 64], os: 0 });
    }
    if (dTop < y1 - 4) { // fanlight / transom
      const fp = op.filter(p => p[1] >= dTop - 0.1);
      const fpoly = [[x0, dTop], [x1, dTop], ...fp.filter(p => p[1] > dTop + 0.1)];
      wash(W2(op.filter(p => p[1] >= dTop - 0.5), z), pal.glass, { a: 0.5, g0: 1.3, g1: 0.6 });
      L3([x0, dTop, z + 1], [x1, dTop, z + 1], { w: D_INK });
      const cx = (x0 + x1) / 2;
      if (top !== 'flat') for (let k = 1; k < 6; k++) { const ang = k / 6 * Math.PI; L3([cx, dTop, z + 1], [cx + Math.cos(ang) * w / 2, dTop + Math.sin(ang) * (y1 - dTop), z + 1], { w: 0.45, a: 0.7, os: 0 }); }
      else for (let k = 1; k < 4; k++) L3([lerp(x0, x1, k / 4), dTop, z + 1], [lerp(x0, x1, k / 4), y1, z + 1], { w: 0.45, a: 0.7 });
    }
  }
  if (orig === 'genkan') { const mid = (x0 + x1) / 2; for (const [a, b2] of [[x0, mid], [mid, x1]]) { for (let yy = y0 + h * 0.36; yy < y1 - 4; yy += 9) L3([a + 4, yy, z + 1], [b2 - 4, yy, z + 1], { w: 0.35, a: 0.6, brk: 0 }); for (let xx = a + 10; xx < b2 - 4; xx += 10) L3([xx, y0 + h * 0.3, z + 1], [xx, y1 - 3, z + 1], { w: 0.35, a: 0.6, brk: 0 }); } }
  C.restore();
  if (orig === 'pagar') { // pintu pagar: carved half-height swing doors in front of the main door
    const py0 = y0 + h * 0.18, py1 = y0 + h * 0.62, mid = (x0 + x1) / 2;
    for (const [a, b2] of [[x0 + 2, mid - 1], [mid + 1, x1 - 2]]) { const q = quad(a, py0, b2, py1, z + 3); paper([q]); wash(q, mix(pal.wood, [240, 220, 180], 0.3), { a: 0.7 }); inkPoly(q, { w: D_INK }); inkPoly(quad(a + 5, py0 + 5, b2 - 5, (py0 + py1) / 2 - 3, z + 3), { w: 0.5 }); for (let xx = a + 8; xx < b2 - 5; xx += 6) L3([xx, (py0 + py1) / 2 + 2, z + 3], [xx, py1 - 6, z + 3], { w: 0.4, a: 0.7, brk: 0 }); }
  }
  inkPoly(W2(op, z), { w: W_INK });
}

// ---------------------------------------------------------------- shop interiors
function shelves(sx0, sx1, sy0, sy1, zz, rows, kind, pal) {
  const cols = [pal.acc, pal.acc2, [230, 200, 120], [200, 90, 80], [120, 160, 190], [240, 240, 230], [150, 190, 120]];
  for (let r = 0; r < rows; r++) {
    const yy = lerp(sy0, sy1, (r + 1) / (rows + 0.3));
    L3([sx0, yy, zz], [sx1, yy, zz], { w: 0.6, a: 0.7 });
    let xx = sx0 + RR.range(2, 8);
    while (xx < sx1 - 6) {
      if (RR.chance(0.12)) { xx += RR.range(6, 16); continue; }
      let iw, ih, c, round = false;
      if (kind === 'bread') { iw = RR.range(9, 14); ih = RR.range(5, 8); c = jit([204, 150, 90], 14); round = true; }
      else if (kind === 'books') { iw = RR.range(2.5, 5); ih = RR.range(14, 22); c = RR.pick([[150, 60, 50], [60, 80, 120], [200, 180, 120], [80, 110, 80], [230, 220, 200], [120, 70, 90]]); }
      else if (kind === 'jars') { iw = RR.range(8, 11); ih = RR.range(10, 14); c = RR.pick([[200, 170, 120], [170, 110, 80], [120, 140, 100], [220, 210, 190]]); }
      else if (kind === 'flowers') { iw = RR.range(8, 12); ih = RR.range(8, 12); c = RR.pick([[220, 80, 100], [240, 200, 80], [240, 240, 240], [200, 120, 200], [250, 150, 120]]); round = true; }
      else if (kind === 'bottles') { iw = RR.range(3, 5); ih = RR.range(14, 20); c = RR.pick([[80, 110, 70], [140, 80, 60], [200, 180, 140], [60, 80, 60]]); }
      else { iw = RR.range(4, 9); ih = RR.range(8, 18); c = RR.pick(cols); }
      const q = round ? (() => { const cx = xx + iw / 2, cy = yy + ih / 2, o = []; for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; o.push(P([cx + Math.cos(a) * iw / 2, cy + Math.sin(a) * ih / 2, zz])); } return o; })() : quad(xx, yy, xx + iw, yy + ih, zz);
      wash(q, c, { a: 0.62, amp: 0.4, rim: 0.3, off: 0.3 });
      if (RR.chance(0.4)) inkPoly(q.length === 4 ? q : q.filter((_, i) => i % 2 === 0), { w: 0.4, a: 0.6, os: 0.4 });
      xx += iw + RR.range(kind === 'books' ? 0.3 : 1, kind === 'books' ? 1.2 : 4);
    }
  }
}
const goodsOf = cls => ({ bakery: 'bread', books: 'books', tea: 'jars', pharmacy: 'jars', flowers: 'flowers', bar: 'bottles', grocer: 'goods', cafe: 'bottles' }[cls] || 'goods');

// one ground-floor bay: a door, a display window, an open front, a shutter...
function bayEl(S, b, y0, y1, z, R, pal, st, cls, top) {
  const { x0, x1, type } = b, w = x1 - x0, h = y1 - y0, zi = z - 25;
  const latin = st.script === 'latin';
  S.add(z + 0.3, () => {
    const op = openingPoly(x0, y0, x1, y1, top), opS = W2(op, z), sy = springY(x0, x1, y1, top, y0);
    if (st.ornament.includes('kashi')) kashiFrame(x0 - 18, y0, x1 + 18, y1 + 20, z, sy);
    if (st.bayTop !== 'flat' || latin) { // stone surround for arched / European openings
      const so = openingPoly(x0 - 12, Math.max(0, y0 - 4), x1 + 12, y1 + 12, top);
      wash(W2(so, z), mix(pal.stone, [255, 255, 250], 0.2), { a: 0.38 }); inkPoly(W2(so, z), { w: 0.75, a: 0.75 });
      if (st.ornament.includes('ablaq') && top !== 'flat') { // striped voussoirs: basalt and limestone
        const inner = openingPoly(x0, y0, x1, y1, top);
        for (let i = 2; i < inner.length - 1; i++) if (i % 2) wash(W2([inner[i], inner[i + 1], so[i + 1], so[i]], z), [86, 82, 92], { a: 0.55, rim: 0.2, off: 0, amp: 0.3, inset: 0 });
      }
      if (top === 'arch' || top === 'segment') { const cx = (x0 + x1) / 2; for (let k = 1; k < 9; k++) { const a = k / 9 * Math.PI, rx = (x1 - x0) / 2, ry = y1 - sy; L3([cx + Math.cos(a) * rx, sy + Math.sin(a) * ry, z], [cx + Math.cos(a) * (rx + 12), sy + Math.sin(a) * (ry + 12), z], { w: 0.5, a: 0.65, os: 0 }); } }
    }
    paper([opS]);
    const L = SUN.L, rd = 22, dy = rd * L[1] / L[2], dx = rd * Math.abs(L[0] / L[2]);
    C.save(); pathOf(opS); C.clip();
    if (type === 'door') { C.restore(); drawDoor(x0, x1, y0, y1, z, st.door, top, pal, S); C.save(); pathOf(opS); C.clip(); }
    else if (type === 'open' || type === 'shutter') {
      wash(opS, pal.interior, { a: 0.72, g0: 1.3, g1: 0.6, gang: Math.PI / 2, blot: 2, blotCol: [80, 70, 90] });
      let sTop = sy;
      if (type === 'shutter') {
        const shh = (sy - y0) * R.range(0.25, 0.75); sTop = sy - shh;
        wash(quad(x0, sTop, x1, y1, z), pal.metal, { a: 0.5, amp: 0.6 });
        for (let yy = sTop + 4; yy < y1; yy += 4.5) L3([x0, yy, z], [x1, yy, z], { w: 0.35, a: 0.5, brk: 0.1 });
        L3([x0, sTop, z], [x1, sTop, z], { w: D_INK });
      }
      shelves(x0 + 6, x1 - 6, y0 + 10, sTop - 8, zi, Math.max(1, Math.floor((sTop - y0) / 45)), goodsOf(cls), pal);
      if (RR.chance(0.6)) { const lx = lerp(x0, x1, RR.range(0.3, 0.7)); L3([lx, sy, zi], [lx, sy - 25, zi], { w: 0.5 }); const lp = [P([lx - 7, sy - 32, zi]), P([lx + 7, sy - 32, zi]), P([lx + 3, sy - 25, zi]), P([lx - 3, sy - 25, zi])]; wash(lp, [240, 200, 110], { a: 0.7, rim: 0.3 }); inkPoly(lp, { w: 0.5 }); }
    } else if (type === 'display') {
      const bulk = latin ? Math.min(65, h * 0.22) : 0;
      wash(opS, pal.interior, { a: 0.5, g0: 1.3, g1: 0.45, gang: Math.PI / 2, blot: 2 });
      shelves(x0 + 8, x1 - 8, y0 + bulk + 12, sy - 20, zi, 2, goodsOf(cls), pal);
      wash(opS, pal.glass, { a: 0.42, g0: 1.2, g1: 0.4, gang: Math.PI / 2 + 0.3, blot: 1 });
      if (bulk) { const q = quad(x0, y0, x1, y0 + bulk, z + 1); paper([q]); wash(q, latin ? pal.fascia : pal.frame, { a: 0.65 }); inkPoly(quad(x0 + 8, y0 + 8, x1 - 8, y0 + bulk - 8, z + 1), { w: 0.5, a: 0.7 }); inkPoly(q, { w: D_INK }); }
      const tr = latin ? sy - Math.min(45, h * 0.18) : y0 + h * 0.78;
      L3([x0, tr, z], [x1, tr, z], { w: D_INK });
      const nm = latin ? Math.max(2, Math.round(w / 40)) : 0; for (let k = 1; k < nm; k++) L3([lerp(x0, x1, k / nm), tr, z], [lerp(x0, x1, k / nm), sy, z], { w: 0.5 }); // small transom panes
      const mm = R.int(0, latin ? 1 : 2); for (let k = 1; k <= mm; k++) { const xx = lerp(x0, x1, k / (mm + 1)); L3([xx, y0 + bulk, z], [xx, tr, z], { w: D_INK }); }
      if (RR.chance(0.4)) { const px = lerp(x0, x1, RR.range(0.1, 0.6)), py = y0 + bulk + (tr - y0 - bulk) * RR.range(0.3, 0.5); const q = quad(px, py, px + 18, py + 24, z + 0.5); paper([q]); wash(q, RR.pick([[250, 240, 200], [240, 200, 190], [255, 255, 250]]), { a: 0.4 }); inkPoly(q, { w: 0.5 }); for (let k = 0; k < 3; k++) L3([px + 3, py + 18 - k * 5, z + 0.5], [px + 15, py + 18 - k * 5, z + 0.5], { w: 0.4, a: 0.6 }); }
      C.globalCompositeOperation = 'source-over';
      const rx = lerp(x0, x1, RR.range(0.1, 0.5)), rw = w * 0.12;
      C.fillStyle = rgba(COL.paper, 0.33); pathOf([P([rx, y1, z]), P([rx + rw, y1, z]), P([rx + rw - 50, y0, z]), P([rx - 50, y0, z])]); C.fill();
    } else if (type === 'garage') { // roller shutter down
      wash(opS, pal.metal, { a: 0.55, amp: 0.6, blot: 1 });
      for (let yy = y0 + 4; yy < sy; yy += 4.5) L3([x0, yy, z], [x1, yy, z], { w: 0.35, a: 0.5, brk: 0.1 });
      L3([x0, sy - 22, z + 1], [x1, sy - 22, z + 1], { w: D_INK });
    } else if (type === 'barWin') { // timber-barred window with louvred shutters (Straits house)
      const wy0 = y0 + h * 0.3, wy1 = sy - h * 0.12, q = quad(x0 + 8, wy0, x1 - 8, wy1, z);
      wash(quad(x0, y0, x1, sy, z), pal.wall0, { a: 0.65 }); paper([q]); wash(q, pal.interior, { a: 0.65, g0: 1.3, g1: 0.6 });
      for (let xx = x0 + 14; xx < x1 - 10; xx += 9) L3([xx, wy0, z + 1], [xx, wy1, z + 1], { w: 0.9, os: 0 });
      inkPoly(q, { w: D_INK });
    } else if (type === 'lattice') {
      wash(opS, pal.interior, { a: 0.35, g0: 1.2, g1: 0.6, gang: Math.PI / 2 });
      wash(opS, pal.wood, { a: 0.35 });
      for (let xx = x0 + 5; xx < x1 - 2; xx += 7) L3([xx, y0, z + 2], [xx, y1, z + 2], { w: 0.55, a: 0.75, brk: 0.05 });
      L3([x0, y0 + h * 0.3, z + 2], [x1, y0 + h * 0.3, z + 2], { w: D_INK });
    } else { // blank wall bay with a small window or a menu board
      wash(opS, mix(pal.wall0, [255, 255, 255], 0.2), { a: 0.3 });
      const ww = Math.min(w * 0.6, 80), wx = x0 + (w - ww) / 2, wy = y0 + h * 0.45, q = quad(wx, wy, wx + ww, wy + h * 0.32, z);
      wash(q, pal.glass, { a: 0.5, g0: 1.3, g1: 0.4, gang: Math.PI / 2 }); inkPoly(q, { w: D_INK });
      L3([wx + ww / 2, wy, z], [wx + ww / 2, wy + h * 0.32, z], { w: 0.6 });
    }
    if (type !== 'door') {
      const sp = SUN.left ? [[x0, sy + 60], [x1, sy + 60], [x1, sy - dy], [x0 + dx, sy - dy], [x0 + dx, y0], [x0, y0]] : [[x1, sy + 60], [x0, sy + 60], [x0, sy - dy], [x1 - dx, sy - dy], [x1 - dx, y0], [x1, y0]];
      wash(W2(sp, z), COL.shadowDeep, { a: 0.4, amp: 0.8, rim: 0.1, inset: 0 });
    }
    C.restore();
    inkPoly(opS, { w: W_INK });
    // noren over a Japanese door
    if (type === 'door' && st.door === 'sliding' && S.T.cjk && (cls === 'tea' || cls === 'bar' || RR.chance(0.25))) {
      const nch = [...S.T.noren], np = Math.max(2, nch.length), nh = h * RR.range(0.35, 0.5), nz = z + 4, col = RR.chance(0.5) ? pal.acc : [70, 76, 100];
      for (let k = 0; k < np; k++) {
        const a = lerp(x0 - 4, x1 + 4, k / np) + 1, bb = lerp(x0 - 4, x1 + 4, (k + 1) / np) - 1;
        const q = quad(a, y1 - nh, bb, y1 + 4, nz); paper([q]); wash(q, col, { a: 0.72, g0: 1, g1: 0.8 }); inkPoly(q, { w: D_INK });
        if (nch[k]) sceneText(S, new Face([a, y1 - nh, nz], [1, 0, 0], [0, 1, 0], rectP(bb - a, nh)), 3, nh * 0.35, bb - a - 3, nh - 6, nch[k], { col: [250, 248, 240], vertical: true });
      }
    }
  });
}

// lay out bays along a frontage; door gets a width fixed by its kind
function layoutBays(R, x0, x1, st, cls, pil) {
  const W = x1 - x0;
  const doorW = st.door === 'sliding' ? R.range(130, 170) : st.door === 'folding' ? R.range(140, 180) : R.range(100, 125);
  const n = Math.max(2, Math.min(4, Math.round(W / R.range(120, 170))));
  const doorAt = n === 2 ? R.int(0, 1) : R.chance(0.6) ? Math.floor(n / 2) : R.int(0, n - 1);
  const rest = W - pil * (n + 1) - doorW, others = n - 1;
  const ws = [...Array(n)].map((_, i) => i === doorAt ? doorW : rest / others);
  const types = st.bays[cls] || st.bays['*'];
  let x = x0 + pil; const bays = [];
  for (let i = 0; i < n; i++) { bays.push({ x0: x, x1: x + ws[i], type: i === doorAt ? 'door' : R.wpick(types) }); x += ws[i] + pil; }
  return { bays, doorAt };
}

// ---------------------------------------------------------------- ground floor: plain bays
function groundFloor(S, v, R, pal, st, cls, nUp) {
  const W = v.x1 - v.x0, z = v.z, latin = st.script === 'latin';
  const signBand = S.styleKey === 'lahore' ? R.range(88, 104) : st.groundSign === 'fascia' || st.groundSign === 'frieze' ? R.range(64, 84) : nUp === 0 ? 95 : 42;
  const openTop = v.y1 - signBand, plinth = 14;
  const { bays, doorAt } = layoutBays(R, v.x0, v.x1, st, cls, R.range(12, 22));
  const top = typeof st.bayTop === 'string' ? st.bayTop : R.wpick(st.bayTop);
  S.debug.bays.push(...bays.map(b => ({ ...b, y0: 0, y1: openTop, z })));
  S.gf = { bays, openTop, plinth, doorAt, z };
  S.awningTop = openTop + 8;
  S.add(z + 0.1, () => {
    wash(quad(v.x0, 0, v.x1, plinth, z), [150, 146, 150], { a: 0.35, amp: 0.8, blot: 0 });
    L3([v.x0, plinth, z], [v.x1, plinth, z], { w: D_INK });
  });
  for (const b of bays) {
    const isDoor = b.type === 'door', bt = isDoor ? (st.doorTop || top) : top;
    bayEl(S, b, b.type === 'door' && st.stoop ? 30 : plinth, isDoor && st.doorTop === 'fanlight' ? openTop + 4 : openTop, z, R.fork('bay' + b.x0), pal, st, cls, bt === 'fanlight' ? 'flat' : bt);
    if (isDoor && st.stoop) stoop(S, b.x0 - 10, b.x1 + 10, z, pal);
  }
  // signs
  if (st.groundSign === 'fascia') latinFasciaSign(S, v, openTop, R.fork('lsign'), pal, st, cls, bays[doorAt]);
  else if (st.groundSign === 'frieze') friezeSign(S, v, openTop, pal);
  else if (nUp === 0) signBoard(S, { x0: v.x0 + W * 0.1, x1: v.x1 - W * 0.1, y0: openTop + 16, y1: v.y1 - 12, z0: z, z1: z + 6 }, R.fork('gsign'), pal, false, null, S.T.sign);
}
function stoop(S, x0, x1, z, pal) {
  S.add(z + 40, () => {
    for (let k = 0; k < 2; k++) { const b = { x0: x0 + k * 4, x1: x1 - k * 4, y0: k * 15, y1: (k + 1) * 15, z0: z, z1: z + 40 - k * 18 }; shadowBox(b, { a: 0.3 }); drawBox(b, { col: pal.stone, a: 0.45, w: D_INK }); }
  });
}

// Latin-script signage: board, painted wall lettering or gilded fascia
function latinFasciaSign(S, v, openTop, R, pal, st, cls, doorBay) {
  if (S.styleKey === 'lahore') return lahoreBoard(S, v, openTop, R, pal);
  const text = S.label, z = v.z, y0 = openTop + 14, y1 = Math.min(v.y1 - 8, y0 + 50);
  const kind = { fachwerk: R.pick(['board', 'painted']), med: R.pick(['painted', 'painted', 'board']), dutch: 'board', korea: 'band', levant: R.pick(['board', 'painted']), beirut: R.pick(['board', 'painted']), lisbon: R.pick(['board', 'painted', 'painted']), nola: R.pick(['board', 'painted']), istanbul: 'board', hanoi: 'vnBoard' }[S.styleKey] || 'board';
  const W = v.x1 - v.x0, w = kind === 'band' || kind === 'vnBoard' ? W - 16 : S.T.script === 'latin' ? Math.min(W - 40, text.length * 26 + 70) : Math.min(W - 40, W * 0.72), cx = (v.x0 + v.x1) / 2 + (kind === 'band' || kind === 'vnBoard' ? 0 : R.gauss() * 10);
  const b = { x0: cx - w / 2, x1: cx + w / 2, y0, y1, z0: z, z1: z + 6 };
  S.add(z + 6.5, () => {
    if (kind === 'board') {
      shadowBox(b);
      const bg = S.styleKey === 'dutch' ? RR.pick([[40, 60, 50], [30, 30, 34], [110, 40, 40]]) : S.styleKey === 'levant' || S.styleKey === 'beirut' ? RR.pick([[40, 90, 70], [236, 228, 206], [40, 60, 110]]) : RR.pick([[70, 50, 40], [236, 228, 206], [50, 70, 60]]);
      const dark = bg[0] < 150;
      drawBox(b, { col: bg, a: 0.75, w: D_INK, front: f => sceneText(S, f, 6, 4, w - 6, y1 - y0 - 4, text, { col: dark ? (S.T.script === 'latin' ? pal.gold : [250, 246, 236]) : [60, 40, 30], shadow: dark ? [20, 20, 20] : null, size: S.T.script === 'latin' ? 0.62 : undefined }) });
    } else if (kind === 'vnBoard') { // Vietnamese shop board: full width, loud colours, the trade in condensed capitals over a phone number
      shadowBox(b);
      const bg = RR.pick([[196, 40, 40], [30, 80, 160], [236, 196, 40], [40, 120, 80]]), light = bg[1] > 150, h = y1 - y0;
      drawBox(b, { col: bg, a: 0.85, w: D_INK, front: f => {
        latinText(f, 14, h * 0.34, w - 14, h - 3, text, { font: 'condensed', col: light ? [190, 30, 30] : [252, 236, 120], size: 0.9 });
        if (S.T.phone) latinText(f, 20, 2, w - 20, h * 0.32, S.T.phone, { font: 'condensed', col: light ? [40, 40, 40] : [250, 250, 250], size: 0.85 });
      } });
    } else if (kind === 'band') { // Korean shop band: full width, saturated, bold Hangul
      shadowBox(b);
      const bg = RR.pick([[40, 90, 170], [200, 50, 50], [40, 130, 90], [236, 190, 40], [240, 240, 236]]), light = bg[1] > 180;
      drawBox(b, { col: bg, a: 0.8, w: D_INK, front: f => { sceneText(S, f, 20, 5, w - 20, y1 - y0 - 5, text, { col: light ? [30, 30, 40] : [252, 250, 245] }); } });
    } else {
      const f = new Face([b.x0, y0, z], [1, 0, 0], [0, 1, 0], rectP(w, y1 - y0));
      sceneText(S, f, 0, 0, w, y1 - y0, text, { col: RR.pick([[110, 50, 40], [60, 50, 44], [40, 70, 60]]), size: 0.7 });
      L3([b.x0 + 20, y0 - 2, z], [b.x1 - 20, y0 - 2, z], { w: 0.5, a: 0.5 });
    }
  });
}

// Lahore shop board: painted tin or flex, nearly the full frontage. Urdu name in
// nastaliq on top, the English name in block capitals under it, a phone number,
// and a painted border in a second colour.
function lahoreBoard(S, v, openTop, R, pal) {
  const z = v.z, W = v.x1 - v.x0, y0 = openTop + 10, y1 = Math.min(v.y1 - 6, y0 + 78), h = y1 - y0;
  const b = { x0: v.x0 + 8, x1: v.x1 - 8, y0, y1, z0: z, z1: z + 6 };
  const scheme = R.pick([[[30, 120, 70], [250, 246, 236], [240, 200, 60]], [[190, 40, 40], [252, 248, 240], [250, 210, 70]], [[30, 70, 150], [252, 250, 245], [240, 200, 60]], [[248, 244, 232], [30, 90, 60], [200, 50, 50]], [[244, 196, 40], [150, 30, 30], [30, 90, 60]]]);
  const [bg, fg, edge] = scheme, w = b.x1 - b.x0;
  S.add(z + 6.5, () => {
    shadowBox(b);
    drawBox(b, { col: bg, a: 0.8, w: D_INK, front: f => {
      const zz = z + 6, inset = 4;
      inkPoly(quad(b.x0 + inset, y0 + inset, b.x1 - inset, y1 - inset, zz), { w: 1.6, a: 0.9, col: edge });
      wash(quad(b.x0 + inset, y0 + inset, b.x1 - inset, y0 + inset + 3, zz), edge, { a: 0.7, rim: 0, off: 0 });
      wash(quad(b.x0 + inset, y1 - inset - 3, b.x1 - inset, y1 - inset, zz), edge, { a: 0.7, rim: 0, off: 0 });
      for (const cx of [b.x0 + 16, b.x1 - 16]) { const c = P([cx, (y0 + y1) / 2, zz]); C.fillStyle = rgba(edge, 0.85); for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; C.beginPath(); C.ellipse(c[0] + Math.cos(a) * 3.2 * VIEW.k, c[1] + Math.sin(a) * 3.2 * VIEW.k, 2.6 * VIEW.k, 1.6 * VIEW.k, a, 0, TAU); C.fill(); } }
      sceneText(S, f, 30, h * 0.36, w - 30, h - 8, S.T.sign, { col: fg, size: 0.78, fill: 0.86, shadow: bg[0] + bg[1] + bg[2] < 420 ? [20, 20, 20] : null });
      if (S.T.en) scriptText(f, 30, 8, w * 0.66, h * 0.36, S.T.en, { font: S.T.fonts.latin, col: fg, size: 0.82, fill: 0.92 });
      if (S.T.phone) scriptText(f, w * 0.68, 7, w - 26, h * 0.3, S.T.phone, { font: 'ui-monospace, Menlo, monospace', weight: 700, col: edge, size: 0.5, fill: 0.95 });
    } });
  });
}

// ---------------------------------------------------------------- ground floor: Straits arcade
function arcadeGround(S, v, R, pal, st, cls) {
  const z = v.z, H0 = v.y1, W = v.x1 - v.x0;
  const cw = 34, n = W > 400 ? 3 : 2;
  const xs = [...Array(n + 1)].map((_, i) => lerp(v.x0 + cw / 2, v.x1 - cw / 2, i / n));
  // shopfront behind the columns
  const { bays, doorAt } = layoutBays(R, v.x0, v.x1, st, cls, 12);
  const openTop = H0 - 50;
  S.gf = { bays, openTop, plinth: 10, doorAt, z, cols: xs };
  S.debug.bays.push(...bays.map(b => ({ ...b, y0: 0, y1: openTop, z })));
  S.add(z + 0.05, () => { // the arcade is a cave of shade: light only rakes in low
    wash(quad(v.x0, 0, v.x1, H0, z), COL.shadowDeep, { a: 0.28, g0: 1.2, g1: 0.5, gang: Math.PI / 2, rim: 0 });
    castShadow(boxCorners({ x0: v.x0, x1: v.x1, y0: H0, y1: H0 + 6, z0: z, z1: 0 }), { a: 0.45, recv: [{ x0: v.x0, x1: v.x1, y0: 0, y1: H0, z }] });
    // tiled floor of the five-foot way
    const pts = [P([v.x0, 0, z]), P([v.x1, 0, z]), P([v.x1, 0, 0]), P([v.x0, 0, 0])];
    wash(pts, RR.pick([[200, 120, 100], [226, 214, 196], [190, 170, 150]]), { a: 0.45 });
    for (let x = v.x0; x <= v.x1; x += 30) L3([x, 0, z], [x, 0, 0], { w: 0.4, a: 0.45, brk: 0 });
    for (let zz = z; zz <= 0; zz += 30) L3([v.x0, 0, zz], [v.x1, 0, zz], { w: 0.4, a: 0.45, brk: 0 });
    L3([v.x0, 0, 0], [v.x1, 0, 0], { w: D_INK });
  });
  for (const b of bays) bayEl(S, b, 10, openTop, z, R.fork('bay' + b.x0), pal, st, cls, 'flat');
  // columns carrying the upper floors
  for (const x of xs) {
    const col = { x0: x - cw / 2, x1: x + cw / 2, y0: 0, y1: H0, z0: -cw, z1: 0 };
    S.add(0.5, () => {
      shadowBox(col, { a: 0.4 });
      drawBox(col, { col: pal.wall0, a: 0.55, w: W_INK, blot: 1, front: () => {
        if (S.styleKey !== 'straits') { for (let yy = 12; yy < H0; yy += 12) L3([col.x0, yy, 0], [col.x1, yy, 0], { w: 0.35, a: 0.45, brk: 0 }); return; }
        for (const [yy0, yy1, e] of [[0, 22, 4], [H0 - 26, H0, 6]]) { const q = quad(col.x0 - e, yy0, col.x1 + e, yy1, 2); paper([q]); wash(q, mix(pal.wall0, [255, 255, 255], 0.3), { a: 0.5 }); inkPoly(q, { w: D_INK }); }
        L3([col.x0 + 6, 24, 0], [col.x0 + 6, H0 - 28, 0], { w: 0.4, a: 0.5 }); L3([col.x1 - 6, 24, 0], [col.x1 - 6, H0 - 28, 0], { w: 0.4, a: 0.5 });
      } });
    });
  }
  // couplet boards on the two columns flanking the door
  const db = bays[doorAt], near = xs.slice().sort((a, b) => Math.abs(a - (db.x0 + db.x1) / 2) - Math.abs(b - (db.x0 + db.x1) / 2)).slice(0, 2);
  if (S.T.couplet) near.forEach((x, i) => signBoard(S, { x0: x - 13, x1: x + 13, y0: 50, y1: 250, z0: 0.5, z1: 3 }, R.fork('cp' + x), pal, true, 'color', S.T.couplet[i]));
  else signBoard(S, { x0: near[0] - 15, x1: near[0] + 15, y0: 110, y1: 230, z0: 0.5, z1: 4 }, R.fork('cp'), pal, true, R.pick(['light', 'color']), S.T.small);
  // long signboard on the beam
  if (S.styleKey === 'straits' && S.use !== 'house') signBoard(S, { x0: v.x0 + 30, x1: v.x1 - 30, y0: H0 + 14, y1: H0 + 66, z0: 0, z1: 7 }, R.fork('beam'), pal, false, R.pick(['dark', 'light', 'color']), S.T.sign);
  if (S.use === 'house') { const dbx = bays[doorAt]; signBoard(S, { x0: dbx.x0 + 5, x1: dbx.x1 - 5, y0: openTop + 6, y1: openTop + 40, z0: z, z1: z + 4 }, R.fork('hall'), pal, false, 'dark', S.T.plate); }
  S.awningTop = null;
}

// ---------------------------------------------------------------- ground floor: Parisian devanture
function devanture(S, v, R, pal, st, cls) {
  const z = v.z, H0 = v.y1, x0 = v.x0 + 8, x1 = v.x1 - 8;
  const fy0 = H0 - 92, fy1 = H0 - 34, dz = 14, pw = 26;
  const { bays, doorAt } = layoutBays(R, x0 + pw, x1 - pw, st, cls, pw);
  S.gf = { bays, openTop: fy0 - 4, plinth: 0, doorAt, z };
  S.debug.bays.push(...bays.map(b => ({ ...b, y0: 0, y1: fy0, z })));
  S.awningTop = fy0 - 2;
  for (const b of bays) bayEl(S, b, b.type === 'door' ? 0 : 0, fy0 - 2, z + 2, R.fork('bay' + b.x0), pal, { ...st, door: 'glazed' }, cls, 'flat');
  const pilXs = [x0, x1 - pw, ...bays.slice(0, -1).map(b => b.x1)];
  S.add(z + dz + 1, () => {
    const fas = { x0, x1, y0: fy0, y1: fy1, z0: z, z1: z + dz };
    shadowBox(fas, { a: 0.5 });
    drawBox(fas, { col: pal.fascia, a: 0.82, w: W_INK, blot: 1, front: f => latinText(f, 30, 6, x1 - x0 - 30, fy1 - fy0 - 6, S.label, { font: st.font, col: pal.gold, shadow: [20, 20, 20], size: 0.6, stretch: true }) });
    const cor = { x0: x0 - 8, x1: x1 + 8, y0: fy1, y1: fy1 + 12, z0: z, z1: z + dz + 8 };
    shadowBox(cor, { a: 0.5 }); drawBox(cor, { col: pal.fascia, a: 0.7, w: D_INK });
    for (const px of pilXs) {
      const b = { x0: px, x1: px + pw, y0: 0, y1: fy0, z0: z, z1: z + dz - 2 };
      shadowBox(b, { a: 0.42 });
      drawBox(b, { col: pal.fascia, a: 0.8, w: D_INK, front: () => { inkPoly(quad(px + 6, 20, px + pw - 6, fy0 - 20, z + dz - 2), { w: 0.5, a: 0.7 }); } });
      // carved console under the fascia
      const cq = [[px - 2, fy0 - 30], [px + pw + 2, fy0 - 30], [px + pw + 6, fy0 + 4], [px - 6, fy0 + 4]];
      paper([W2(cq, z + dz)]); wash(W2(cq, z + dz), darken(pal.fascia, 0.15), { a: 0.75 }); inkPoly(W2(cq, z + dz), { w: 0.8 });
    }
  });
}

// ---------------------------------------------------------------- CJK sign boards
function signBoard(S, b, R, pal, vertical, style, text) {
  const st = style || R.pick(['light', 'color', 'dark']);
  S.add(b.z1 + 0.5, () => {
    shadowBox(b);
    const bg = st === 'light' ? [246, 242, 230] : st === 'color' ? pal.acc : [70, 64, 60];
    const tc = st === 'light' ? (RR.chance(0.5) ? [40, 34, 30] : [180, 50, 40]) : st === 'dark' && RR.chance(0.5) ? pal.gold : [250, 246, 236];
    drawBox(b, { col: bg, a: st === 'light' ? 0.25 : 0.7, w: D_INK, front: f => {
      const w = b.x1 - b.x0, h = b.y1 - b.y0;
      const pad = Math.min(w, h) * 0.1;
      sceneText(S, new Face(f.O, f.U, f.V, f.poly), pad, pad, w - pad, h - pad, text || S.T.sign, { col: tc, vertical });
      inkPoly(f.spoly([[3, 3], [w - 3, 3], [w - 3, h - 3], [3, h - 3]]), { w: 0.45, a: 0.5 });
    } });
  });
}

// glazed tile frame (alfiz) around a Persian arch: turquoise field, white flowers, double border
function gsY(x0, x1, y1, top, y0) { return springY(x0, x1, y1, top, y0); }
function kashiFrame(x0, y0, x1, y1, z, sy) {
  const fr = quad(x0, Math.min(sy, y1 - 30) - 6, x1, y1, z);
  paper([fr]); wash(fr, RR.pick([[48, 132, 160], [40, 96, 160], [60, 150, 150]]), { a: 0.68, blot: 1, amp: 0.6 });
  for (let x = x0 + 8; x < x1 - 4; x += 11) for (let y = Math.min(sy, y1 - 30); y < y1 - 4; y += 11) { const p = P([x, y, z]); C.fillStyle = rgba(RR.chance(0.7) ? [250, 248, 236] : [240, 200, 70], 0.85); C.beginPath(); C.arc(p[0], p[1], 1.4 * VIEW.k / 1.3, 0, TAU); C.fill(); }
  inkPoly(fr, { w: D_INK }); inkPoly(quad(x0 + 4, Math.min(sy, y1 - 30) - 2, x1 - 4, y1 - 4, z), { w: 0.5, a: 0.6 });
}
// Persian inscription frieze: a tiled band carrying the shop's name in nastaliq
function friezeSign(S, v, openTop, pal) {
  const z = v.z, y0 = openTop + 22, y1 = Math.min(v.y1 - 8, y0 + 46);
  S.add(z + 0.4, () => {
    const q = quad(v.x0 + 8, y0, v.x1 - 8, y1, z); paper([q]);
    wash(q, [34, 84, 150], { a: 0.75, blot: 1 });
    const f = new Face([v.x0 + 8, y0, z], [1, 0, 0], [0, 1, 0], rectP(v.x1 - v.x0 - 16, y1 - y0));
    sceneText(S, f, 20, 0, v.x1 - v.x0 - 36, y1 - y0, S.T.sign, { role: 'plaque', col: [252, 250, 240], size: 0.78, dy: 0.14 });
    inkPoly(q, { w: D_INK }); inkPoly(quad(v.x0 + 12, y0 + 4, v.x1 - 12, y1 - 4, z), { w: 0.6, a: 0.7, col: [240, 220, 140] });
    for (const yy of [y0 - 5, y1 + 5]) { const b2 = quad(v.x0 + 8, yy - 3, v.x1 - 8, yy + 3, z); wash(b2, [60, 150, 160], { a: 0.6, rim: 0, off: 0 }); }
  });
}
// Taiwanese iron window cage: a deep box of bars with a little tin roof, plants inside
function ironCage(S, x, y, w, h, z, pal) {
  const d = 36, b = { x0: x - 8, x1: x + w + 8, y0: y - 8, y1: y + h + 8, z0: z, z1: z + d };
  S.add(z + d + 0.5, () => {
    castShadow(boxCorners({ ...b, y0: b.y1 - 4 }), { a: 0.35 });
    const f = boxFaces(b), zz = b.z1;
    const fl = { ...b, y1: b.y0 + 4 }; drawBox(fl, { col: [120, 120, 124], a: 0.5, w: 0.6 });
    if (FLAGS.plants) for (let k = 0; k < RR.int(1, 3); k++) { const p = P([RR.range(b.x0 + 15, b.x1 - 15), b.y0 + 5, z + d * 0.5]); foliage(p[0], p[1] - 10, RR.range(14, 24) * VIEW.k, RR.range(10, 18) * VIEW.k, { leaf: 5.5, under: 0.35 }); }
    for (let xx = b.x0; xx <= b.x1 + 0.1; xx += 10) L3([xx, b.y0, zz], [xx, b.y1, zz], { w: 0.6, os: 0, brk: 0 });
    for (const yy of [b.y0 + 4, (b.y0 + b.y1) / 2, b.y1]) L3([b.x0, yy, zz], [b.x1, yy, zz], { w: 0.9 });
    for (const side of ['left', 'right']) if (f[side]) { const sp = f[side].spoly(); for (let t = 0; t <= 1.001; t += 0.25) inkLine([[lerp(sp[0][0], sp[1][0], t), lerp(sp[0][1], sp[1][1], t)], [lerp(sp[3][0], sp[2][0], t), lerp(sp[3][1], sp[2][1], t)]], { w: 0.5, os: 0 }); }
    for (const xx of [b.x0, b.x1]) { L3([xx, b.y1, zz], [xx, b.y1, z], { w: 0.7 }); L3([xx, b.y0, zz], [xx, b.y0, z], { w: 0.7 }); }
    // corrugated tin canopy
    const cy0 = b.y1 + 2, cy1 = b.y1 + 22, can = [P([b.x0 - 6, cy0, zz + 8]), P([b.x1 + 6, cy0, zz + 8]), P([b.x1 + 6, cy1, z]), P([b.x0 - 6, cy1, z])];
    paper([can]); wash(can, RR.pick([[150, 170, 180], [190, 120, 90], [160, 160, 160]]), { a: 0.55 }); for (let xx = b.x0; xx < b.x1; xx += 7) inkLine([P([xx, cy0, zz + 8]), P([xx, cy1, z])], { w: 0.35, a: 0.6, os: 0 }); inkPoly(can, { w: D_INK });
  });
}
