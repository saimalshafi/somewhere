// ============================================================================
//  SVG EXPORT — a CanvasRenderingContext2D look-alike that records the engine's
//  drawing calls as SVG. The painting is already made of shapes (washes, pen
//  lines, leaves), so the vector file is the same picture; curves are flattened
//  to polylines in page coordinates, multiply-glazes become mix-blend-mode, and
//  the paper is the same texture as an feTurbulence filter.
// ============================================================================
class SVGContext {
  constructor(W, H) {
    this.W = W; this.H = H; this.out = []; this.defs = []; this.id = 0;
    this.m = [1, 0, 0, 1, 0, 0]; this.stack = []; this.path = []; this.cur = null; this.clipId = null;
    Object.assign(this, { fillStyle: '#000', strokeStyle: '#000', lineWidth: 1, lineCap: 'butt', lineJoin: 'miter', globalCompositeOperation: 'source-over', globalAlpha: 1, font: '10px sans-serif', textAlign: 'start', textBaseline: 'alphabetic', direction: 'ltr', dash: [] });
    this.meas = document.createElement('canvas').getContext('2d');
    this.canvas = { width: W, height: H };
  }
  // ---- state
  save() { this.stack.push({ m: this.m.slice(), clipId: this.clipId, fillStyle: this.fillStyle, strokeStyle: this.strokeStyle, lineWidth: this.lineWidth, lineCap: this.lineCap, lineJoin: this.lineJoin, gco: this.globalCompositeOperation, ga: this.globalAlpha, font: this.font, ta: this.textAlign, tb: this.textBaseline, dash: this.dash }); }
  restore() { const s = this.stack.pop(); if (!s) return; this.m = s.m; this.clipId = s.clipId; this.fillStyle = s.fillStyle; this.strokeStyle = s.strokeStyle; this.lineWidth = s.lineWidth; this.lineCap = s.lineCap; this.lineJoin = s.lineJoin; this.globalCompositeOperation = s.gco; this.globalAlpha = s.ga; this.font = s.font; this.textAlign = s.ta; this.textBaseline = s.tb; this.dash = s.dash; }
  setTransform(a, b, c, d, e, f) { this.m = [a, b, c, d, e, f]; }
  transform(a, b, c, d, e, f) { const m = this.m; this.m = [m[0] * a + m[2] * b, m[1] * a + m[3] * b, m[0] * c + m[2] * d, m[1] * c + m[3] * d, m[0] * e + m[2] * f + m[4], m[1] * e + m[3] * f + m[5]]; }
  translate(x, y) { this.transform(1, 0, 0, 1, x, y); }
  scale(x, y) { this.transform(x, 0, 0, y, 0, 0); }
  rotate(a) { const c = Math.cos(a), s = Math.sin(a); this.transform(c, s, -s, c, 0, 0); }
  setLineDash(d) { this.dash = d.slice(); }
  getLineDash() { return this.dash; }
  T(x, y) { const m = this.m; return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]]; }
  get sc() { const m = this.m; return Math.sqrt(Math.abs(m[0] * m[3] - m[1] * m[2])); }
  // ---- path
  beginPath() { this.path = []; this.cur = null; }
  moveTo(x, y) { this.cur = [this.T(x, y)]; this.path.push(this.cur); this.last = [x, y]; }
  lineTo(x, y) { if (!this.cur) return this.moveTo(x, y); this.cur.push(this.T(x, y)); this.last = [x, y]; }
  closePath() { if (this.cur) { this.cur.closed = true; const p = this.cur[0]; this.cur = [p.slice()]; this.path.push(this.cur); } }
  quadraticCurveTo(cx, cy, x, y) { const [x0, y0] = this.last || [cx, cy]; for (let i = 1; i <= 8; i++) { const t = i / 8, u = 1 - t; this.lineTo(u * u * x0 + 2 * u * t * cx + t * t * x, u * u * y0 + 2 * u * t * cy + t * t * y); } }
  bezierCurveTo(c1x, c1y, c2x, c2y, x, y) { const [x0, y0] = this.last || [c1x, c1y]; for (let i = 1; i <= 10; i++) { const t = i / 10, u = 1 - t; this.lineTo(u * u * u * x0 + 3 * u * u * t * c1x + 3 * u * t * t * c2x + t * t * t * x, u * u * u * y0 + 3 * u * u * t * c1y + 3 * u * t * t * c2y + t * t * t * y); } }
  ellipse(x, y, rx, ry, rot, a0, a1, ccw) {
    let sweep = a1 - a0; if (ccw) { if (sweep > 0) sweep -= Math.PI * 2 * Math.ceil(sweep / (Math.PI * 2)); } else if (sweep < 0) sweep += Math.PI * 2 * Math.ceil(-sweep / (Math.PI * 2));
    if (Math.abs(sweep) > Math.PI * 2) sweep = Math.sign(sweep) * Math.PI * 2;
    const n = Math.max(6, Math.ceil(Math.abs(sweep) * Math.max(rx, ry) * this.sc / 3)), cr = Math.cos(rot), sr = Math.sin(rot);
    for (let i = 0; i <= Math.min(n, 64); i++) { const a = a0 + sweep * i / Math.min(n, 64), px = Math.cos(a) * rx, py = Math.sin(a) * ry; const X = x + px * cr - py * sr, Y = y + px * sr + py * cr; if (i === 0 && !this.cur) this.moveTo(X, Y); else this.lineTo(X, Y); }
  }
  arc(x, y, r, a0, a1, ccw) { this.ellipse(x, y, r, r, 0, a0, a1, ccw); }
  rect(x, y, w, h) { this.moveTo(x, y); this.lineTo(x + w, y); this.lineTo(x + w, y + h); this.lineTo(x, y + h); this.closePath(); }
  d() { return this.path.filter(s => s.length > 1).map(s => 'M' + s.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L') + (s.closed ? 'Z' : '')).join(''); }
  // ---- paint
  paint(style, alphaKey) {
    if (typeof style === 'object' && style && style.svgId) return `url(#${style.svgId})`;
    return style;
  }
  attrs() {
    let a = '';
    if (this.clipId) a += ` clip-path="url(#${this.clipId})"`;
    if (this.globalCompositeOperation === 'multiply') a += ' style="mix-blend-mode:multiply"';
    if (this.globalAlpha !== 1) a += ` opacity="${this.globalAlpha}"`;
    return a;
  }
  col(style, attr) { // rgba() split into colour + opacity, which every SVG editor understands
    if (typeof style === 'object' && style && style.svgId) return `${attr}="url(#${style.svgId})"`;
    const m = /rgba?\(([^)]+)\)/.exec(style); if (!m) return `${attr}="${style}"`;
    const q = m[1].split(',').map(Number); return `${attr}="rgb(${q[0] | 0},${q[1] | 0},${q[2] | 0})"` + (q[3] != null && q[3] < 1 ? ` ${attr}-opacity="${+q[3].toFixed(3)}"` : '');
  }
  fill() { const d = this.d(); if (d) this.out.push(`<path d="${d}" ${this.col(this.fillStyle, 'fill')}${this.attrs()}/>`); }
  stroke() {
    const d = this.d(); if (!d) return;
    const dash = this.dash.length ? ` stroke-dasharray="${this.dash.map(v => (v * this.sc).toFixed(1)).join(' ')}"` : '';
    this.out.push(`<path d="${d}" fill="none" ${this.col(this.strokeStyle, 'stroke')} stroke-width="${(this.lineWidth * this.sc).toFixed(2)}" stroke-linecap="${this.lineCap}" stroke-linejoin="${this.lineJoin}"${dash}${this.attrs()}/>`);
  }
  fillRect(x, y, w, h) { const p = this.path, c = this.cur; this.beginPath(); this.rect(x, y, w, h); this.fill(); this.path = p; this.cur = c; }
  strokeRect(x, y, w, h) { const p = this.path, c = this.cur; this.beginPath(); this.rect(x, y, w, h); this.stroke(); this.path = p; this.cur = c; }
  clearRect() {}
  clip() {
    const id = 'c' + (this.id++), d = this.d();
    this.defs.push(`<clipPath id="${id}"${this.clipId ? ` clip-path="url(#${this.clipId})"` : ''}><path d="${d}"/></clipPath>`);
    this.clipId = id;
  }
  createLinearGradient(x0, y0, x1, y1) { const g = new SVGGrad(this, 'linear', [...this.T(x0, y0), ...this.T(x1, y1)]); return g; }
  createRadialGradient(x0, y0, r0, x1, y1, r1) { return new SVGGrad(this, 'radial', [...this.T(x1, y1), r1 * this.sc]); }
  measureText(t) { this.meas.font = this.font; return this.meas.measureText(t); }
  fillText(t, x, y) {
    const m = this.m, fm = /(\d+(?:\.\d+)?)px\s+(.*)$/.exec(this.font), size = fm ? +fm[1] : 10, fam = fm ? fm[2] : 'sans-serif', wt = (/^(\d{3}|bold)/.exec(this.font) || [0, 400])[1];
    const anchor = { center: 'middle', left: 'start', start: 'start', right: 'end', end: 'end' }[this.textAlign] || 'start';
    const base = { middle: 'central', top: 'hanging', bottom: 'text-after-edge', alphabetic: 'alphabetic' }[this.textBaseline] || 'alphabetic';
    const fam0 = fam.split(',')[0].trim().replace(/^['"]|['"]$/g, ''), fk = fam0 + '|' + wt; this.fontUse = this.fontUse || {}; this.fontUse[fk] = (this.fontUse[fk] || '') + t;
    const esc = String(t).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
    this.out.push(`<text transform="matrix(${m.map(v => +v.toFixed(4)).join(' ')})" x="${x.toFixed(2)}" y="${y.toFixed(2)}" font-family='${fam.replace(/'/g, '"')}' font-size="${size}" font-weight="${wt}" text-anchor="${anchor}" dominant-baseline="${base}" ${this.col(this.fillStyle, 'fill')}${this.attrs()}>${esc}</text>`);
  }
  // raster calls the engine makes only for the paper pass; ignored here
  getImageData() { return null; } putImageData() {} drawImage() {}
  toString(paperOn = true, fontCSS = '') {
    const W = this.W, H = this.H;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${fontCSS ? `<style>${fontCSS}</style>` : ''}${this.defs.join('')}${paperOn ? paperFilterSVG(W, H) : ''}</defs><g style="isolation:isolate">${this.out.join('')}${paperOn ? `<rect width="${W}" height="${H}" fill="#fff" filter="url(#paper)" style="mix-blend-mode:multiply"/>` : ''}</g></svg>`;
  }
}
class SVGGrad {
  constructor(ctx, kind, geo) { this.ctx = ctx; this.kind = kind; this.geo = geo; this.stops = []; this.svgId = 'g' + (ctx.id++); this.done = false; }
  addColorStop(o, c) {
    this.stops.push([o, c]);
    // (re)write the definition; the last call wins
    const m = /rgba?\(([^)]+)\)/.exec(c), v = m ? m[1].split(',').map(Number) : [0, 0, 0, 1];
    const stops = this.stops.map(([o, c]) => { const mm = /rgba?\(([^)]+)\)/.exec(c), q = mm ? mm[1].split(',').map(Number) : [0, 0, 0, 1]; return `<stop offset="${o}" stop-color="rgb(${q[0] | 0},${q[1] | 0},${q[2] | 0})" stop-opacity="${q[3] ?? 1}"/>`; }).join('');
    const g = this.geo, def = this.kind === 'linear' ? `<linearGradient id="${this.svgId}" gradientUnits="userSpaceOnUse" x1="${g[0].toFixed(1)}" y1="${g[1].toFixed(1)}" x2="${g[2].toFixed(1)}" y2="${g[3].toFixed(1)}">${stops}</linearGradient>` : `<radialGradient id="${this.svgId}" gradientUnits="userSpaceOnUse" cx="${g[0].toFixed(1)}" cy="${g[1].toFixed(1)}" r="${g[2].toFixed(1)}">${stops}</radialGradient>`;
    if (this.idx == null) { this.idx = this.ctx.defs.length; this.ctx.defs.push(def); } else this.ctx.defs[this.idx] = def;
  }
}
// render one scene into SVG through the real engine
function renderSVG(seed, opts = {}, W = 1100, H = 1375) {
  const ctx = new SVGContext(W, H);
  const canvas = { width: W, height: H, getContext: () => ctx };
  const job = new PaintJob(canvas, seed, { ...opts, post: false });
  job.run();
  return { ctx, S: job.S };
}

// embed the Google fonts the signs use, cut down to just the letters drawn, so the
// file shows the same lettering on any computer (browsers honour embedded fonts;
// design tools may substitute their own)
const SVG_GOOGLE_FONTS = ['Shippori Mincho', 'Zen Kaku Gothic New', 'IBM Plex Mono', 'Playfair Display SC', 'UnifrakturMaguntia', 'Cinzel', 'Abril Fatface', 'Zen Antique', 'Noto Serif TC', 'Noto Sans TC', 'Black Han Sans', 'Lalezar', 'Noto Nastaliq Urdu', 'Aref Ruqaa', 'Amiri', 'Reem Kufi', 'Noto Naskh Arabic', 'Anton'];
async function svgFontCSS(fontUse = {}) {
  const css = [];
  const b64 = buf => { let s = ''; const u = new Uint8Array(buf); for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };
  for (const [k, text] of Object.entries(fontUse)) {
    const [fam, wt] = k.split('|'); if (!SVG_GOOGLE_FONTS.includes(fam)) continue;
    const chars = [...new Set([...text])].join('');
    try {
      const q = encodeURIComponent(chars), base = 'https://fonts.googleapis.com/css2?family=' + fam.replace(/ /g, '+');
      let r = await fetch(base + ':wght@' + wt + '&text=' + q); if (!r.ok) r = await fetch(base + '&text=' + q); if (!r.ok) continue;
      const sheet = await r.text(), m = /url\((https:[^)]+)\)\s*format\('([^']+)'\)/.exec(sheet); if (!m) continue;
      const font = await (await fetch(m[1])).arrayBuffer();
      css.push(`@font-face{font-family:'${fam}';font-weight:${wt};src:url(data:font/${m[2] === 'woff2' ? 'woff2' : 'ttf'};base64,${b64(font)}) format('${m[2]}');}`);
    } catch (e) { /* offline: the file falls back to installed fonts */ }
  }
  return css.join('');
}
