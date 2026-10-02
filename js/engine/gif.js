// ============================================================================
//  GIF EXPORT — the painting animation as an animated GIF. One palette for the
//  whole film (median cut over samples from every frame), LZW-compressed
//  frames, looping forever, with a long hold on the finished painting.
// ============================================================================
function gifPalette(frames, n = 256) {
  const S = []; // sample pixels from every frame
  for (const f of frames) { const d = f.data, step = Math.max(1, Math.floor(d.length / 4 / 12000)); for (let i = 0; i < d.length; i += 4 * step) S.push([d[i], d[i + 1], d[i + 2]]); }
  let boxes = [S];
  const range = b => { let lo = [255, 255, 255], hi = [0, 0, 0]; for (const p of b) for (let c = 0; c < 3; c++) { if (p[c] < lo[c]) lo[c] = p[c]; if (p[c] > hi[c]) hi[c] = p[c]; } const r = hi.map((h, c) => h - lo[c]); const ax = r.indexOf(Math.max(...r)); return { ax, r: r[ax] }; };
  while (boxes.length < n) {
    let bi = -1, best = 0;
    boxes.forEach((b, i) => { if (b.length < 2) return; const { r } = range(b), sc = r * Math.sqrt(b.length); if (sc > best) { best = sc; bi = i; } });
    if (bi < 0) break;
    const b = boxes[bi], { ax } = range(b); b.sort((p, q) => p[ax] - q[ax]);
    const m = b.length >> 1; boxes.splice(bi, 1, b.slice(0, m), b.slice(m));
  }
  const pal = boxes.map(b => { const s = [0, 0, 0]; for (const p of b) { s[0] += p[0]; s[1] += p[1]; s[2] += p[2]; } return s.map(v => Math.round(v / b.length)); });
  while (pal.length < n) pal.push([0, 0, 0]);
  return pal;
}
function gifIndexer(pal) {
  const cache = new Int16Array(1 << 18).fill(-1); // 6 bits a channel
  return (r, g, b) => {
    const k = ((r >> 2) << 12) | ((g >> 2) << 6) | (b >> 2);
    let v = cache[k]; if (v >= 0) return v;
    let bd = 1e9; v = 0;
    for (let i = 0; i < pal.length; i++) { const p = pal[i], dr = p[0] - r, dg = p[1] - g, db = p[2] - b, d = dr * dr * 2 + dg * dg * 4 + db * db * 3; if (d < bd) { bd = d; v = i; } }
    cache[k] = v; return v;
  };
}
// LZW, after the classic GIF encoder: variable code size from 9 to 12 bits
function gifLZW(px, minCode = 8) {
  const out = [], CLEAR = 1 << minCode, EOI = CLEAR + 1;
  let nBits = minCode + 1, maxCode = (1 << nBits) - 1, next = CLEAR + 2, clearFlag = false, cur = 0, bits = 0;
  const dict = new Map();
  const output = code => {
    cur |= code << bits; bits += nBits;
    while (bits >= 8) { out.push(cur & 255); cur >>>= 8; bits -= 8; }
    if (next > maxCode || clearFlag) {
      if (clearFlag) { nBits = minCode + 1; maxCode = (1 << nBits) - 1; clearFlag = false; }
      else { nBits++; maxCode = nBits === 12 ? 4096 : (1 << nBits) - 1; }
    }
  };
  output(CLEAR);
  let prefix = px[0];
  for (let i = 1; i < px.length; i++) {
    const k = px[i], key = prefix * 256 + k, v = dict.get(key);
    if (v !== undefined) { prefix = v; continue; }
    output(prefix);
    if (next < 4096) dict.set(key, next++);
    else { dict.clear(); next = CLEAR + 2; clearFlag = true; output(CLEAR); }
    prefix = k;
  }
  output(prefix); output(EOI);
  if (bits > 0) out.push(cur & 255);
  return out;
}
// frames: [{ data: RGBA Uint8ClampedArray, delay: centiseconds }]
function encodeGIF(frames, w, h) {
  const pal = gifPalette(frames), idx = gifIndexer(pal), bytes = [];
  const u16 = v => { bytes.push(v & 255, (v >> 8) & 255); };
  for (const c of 'GIF89a') bytes.push(c.charCodeAt(0));
  u16(w); u16(h); bytes.push(0xF7, 0, 0);
  for (const p of pal) bytes.push(p[0], p[1], p[2]);
  bytes.push(0x21, 0xFF, 11); for (const c of 'NETSCAPE2.0') bytes.push(c.charCodeAt(0)); bytes.push(3, 1, 0, 0, 0); // loop forever
  for (const f of frames) {
    bytes.push(0x21, 0xF9, 4, 0x04); u16(f.delay); bytes.push(0, 0);
    bytes.push(0x2C); u16(0); u16(0); u16(w); u16(h); bytes.push(0);
    const d = f.data, px = new Uint8Array(w * h);
    for (let i = 0, j = 0; j < px.length; i += 4, j++) px[j] = idx(d[i], d[i + 1], d[i + 2]);
    bytes.push(8);
    const lz = gifLZW(px, 8);
    for (let i = 0; i < lz.length; i += 255) { const n = Math.min(255, lz.length - i); bytes.push(n); for (let k = 0; k < n; k++) bytes.push(lz[i + k]); }
    bytes.push(0);
  }
  bytes.push(0x3B);
  return new Uint8Array(bytes);
}
// record the real painting animation, a fixed step at a time, and encode it
async function animationGIF(seed, opts = {}) {
  const W = 1100, H = 1375, gw = opts.width || 550, gh = Math.round(gw * H / W), fps = opts.fps || 25;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const small = document.createElement('canvas'); small.width = gw; small.height = gh; const sx = small.getContext('2d', { willReadFrequently: true });
  sx.imageSmoothingQuality = 'high';
  const a = animatePaint(cv, seed, { flags: opts.flags, manual: true });
  const frames = [], grab = delay => { sx.drawImage(cv, 0, 0, gw, gh); frames.push({ data: sx.getImageData(0, 0, gw, gh).data, delay }); };
  grab(Math.round(100 / fps));
  let n = 0;
  while (a.running && n++ < fps * 6) { a.tick(1 / fps); grab(Math.round(100 / fps)); if (n % 6 === 0) await new Promise(r => setTimeout(r, 0)); }
  frames[frames.length - 1].delay = 300; // hold the finished painting
  await new Promise(r => setTimeout(r, 0));
  return encodeGIF(frames, gw, gh);
}
