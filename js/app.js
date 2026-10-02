// Somewhere — page controller: seed, locks, layers, animation, blueprint
(() => {
  // ---- settings to fill in before publishing
  const CONFIG = {
    github: 'https://github.com/saimalshafi/somewhere', // the repository URL; the GitHub button in the About dialog links here
    // Feedback goes to the owner's inbox through FormSubmit (formsubmit.co). The address is kept
    // base64-encoded so it never appears as text on the page. The first message triggers a one-time
    // activation email from FormSubmit; after activating, the random alias it provides can replace it.
    feedback: ['c2FpbWFsc2hh', 'ZmlAZ21haWwu', 'Y29t'],
  };
  const $ = id => document.getElementById(id);
  const cv = $('cv'), page = $('page');
  const shopName = CLASS_NAME;
  const roofName = { lahoreParapet: 'flat roof with parapet', railing: 'flat roof with railing', slateHip: 'slate hipped roof', corniceGable: 'cornice gable', decoParapet: 'Art Deco parapet', tanks: 'roof with water tanks', shack: 'rooftop tin shack', jars: 'roof of onggi jars', badgir: 'windcatcher', parapet: 'blind-arch parapet', flat: 'flat roof', hip: 'hipped tile roof', gable: 'gable', shed: 'shed roof', mansard: 'mansard with dormers', frontGable: 'steep front gable', stepGable: 'stepped gable', neckGable: 'neck gable', bellGable: 'bell gable', terracotta: 'terracotta roof', terrace: 'roof terrace', pediment: 'parapet pediment', chineseEave: 'pantile eave', sideGable: 'side-gabled roof' };
  const treeName = { ashoka: 'false ashoka', neem: 'neem', ginkgo: 'ginkgo', persimmon: 'persimmon', pomegranate: 'pomegranate', olive: 'olive', citrus: 'orange tree', round: 'street tree', plane: 'plane tree', lime: 'lime tree', pine: 'garden pine', blossom: 'cherry in bloom', cypress: 'cypress', palm: 'palm' };


  const cap = s => s[0].toUpperCase() + s.slice(1);
  // every building gets a fresh seed from the browser's secure random source: about four billion possibilities
  const newSeed = () => { const a = new Uint32Array(1); (window.crypto || window.msCrypto).getRandomValues(a); return a[0] || 1; };
  const idOf = s => s.toString(36).padStart(7, '0');
  const hist = []; let hi = -1, seed = 0;
  const layers = { wash: true, ink: true, plants: true };
  const flags = () => ({ ...layers });
  function renderLayers() {
    $('gLayers').replaceChildren(...[['wash', 'Paint'], ['ink', 'Ink'], ['plants', 'Plants']].map(([k, l]) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'toggle'; b.textContent = l; b.setAttribute('aria-pressed', layers[k] ? 'true' : 'false');
      b.onclick = () => { layers[k] = !layers[k]; renderLayers(); draw(false); }; return b;
    }));
  }
  const navState = () => { $('back').disabled = hi <= 0; $('fwd').disabled = hi >= hist.length - 1; };
  // ---- painting
  let pending = 0, anim = null;
  (function warm() { if (!paperWarm(cv.width, cv.height, 10)) setTimeout(warm, 0); })(); // paper texture, computed while fonts load
  const reduce = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  const busy = page.querySelector('.busy');
  const PH = { pencil: '1/4 · setting out in pencil', ink: '2/4 · pen line, back to front', wash: '3/4 · washes', finish: '4/4 · planting and paper grain' };
  function describe(S) {
    const d = S.desc;
    const P = STYLES[d.style], area = document.createElement('span'); area.className = 'area'; area.textContent = '— ' + P.area; // city — area
    $('place').replaceChildren(P.city + ' ', area);
    $('what').textContent = [d.type ? cap(d.type) + (d.period ? ', ' + d.period : '') : '', d.use === 'shop' ? shopName[d.shop] + ' · “' + S.T.sign + '”' : '', d.floors + (d.floors > 1 ? ' floors' : ' floor'), d.roof === 'hip' && STYLES[d.style].tile === 'slate' ? 'hipped slate roof' : roofName[d.roof], treeName[d.tree] || ''].filter(Boolean).join(' · ');
  }
  function done(S) { page.classList.remove('painting'); busy.textContent = 'painting…'; }
  // a new building animates; layers and history repaint the one on the page at once
  function draw(animate) {
    if (anim) { anim.cancel(); anim = null; }
    page.classList.add('painting'); busy.textContent = 'painting…';
    const my = ++pending;
    ensureFonts(generate(seed, {}).styleKey).then(() => {
      if (my !== pending) return;
      if (animate && !reduce.matches) {
        const a = anim = animatePaint(cv, seed, { flags: flags(), onPhase: p => { if (p) busy.innerHTML = '<b>' + PH[p] + '</b>'; } });
        describe(a.S);
        a.promise.then(S => { if (!S || anim !== a) return; anim = null; done(S); });
      } else { const S = renderScene(cv, seed, { flags: flags() }); describe(S); done(S); }
    });
  }
  function generateNew() { stopBlueprint(false); seed = newSeed(); hist.splice(hi + 1); hist.push(seed); /* the whole visit is kept; a reload starts afresh */ hi = hist.length - 1; navState(); draw(true); }
  function go(d) { const j = hi + d; if (j < 0 || j >= hist.length) return; stopBlueprint(false); hi = j; seed = hist[hi]; navState(); draw(false); }
  cv.addEventListener('click', () => { if (anim && anim.running) anim.skip(); });
  // fonts per style: load only the glyphs that style can draw
  const fontCache = {};
  function ensureFonts(k) {
    if (!fontCache[k]) {
      const txt = styleStrings(k);
      fontCache[k] = Promise.race([Promise.all(styleFonts(k).flatMap(f => ['400', '700', '900'].map(w => document.fonts ? document.fonts.load(w + ' 40px ' + f, txt).catch(() => null) : null))), new Promise(r => setTimeout(r, 4000))]);
    }
    return fontCache[k];
  }
  // ---- export: SVG (the vector painting), PNG at three times the size, GIF of the painting process
  const save = (blob, ext) => { const a = document.createElement('a'); a.download = 'somewhere-' + idOf(seed) + '.' + ext; a.href = URL.createObjectURL(blob); a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 8000); };
  async function exporting(id, fn) {
    const btn = $(id); if (btn.disabled) return;
    if (anim && anim.running) anim.skip();
    if (bp) bp.end();
    const label = btn.textContent; document.querySelectorAll('.ex').forEach(b => b.disabled = true); btn.textContent = '…';
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    try { await ensureFonts(generate(seed, {}).styleKey); await fn(); }
    catch (e) { console.error(e); }
    finally { document.querySelectorAll('.ex').forEach(b => b.disabled = false); btn.textContent = label; }
  }
  const exportSVG = () => exporting('exSVG', async () => {
    const { ctx } = renderSVG(seed, { flags: flags() });
    const css = await svgFontCSS(ctx.fontUse);
    save(new Blob([ctx.toString(true, css)], { type: 'image/svg+xml' }), 'svg');
  });
  const exportPNG = () => exporting('exPNG', async () => {
    const c = document.createElement('canvas'); c.width = cv.width * 3; c.height = cv.height * 3;
    renderScene(c, seed, { flags: flags(), scale: 3 }); paperForget(3);
    const blob = await new Promise(r => c.toBlob(r, 'image/png')); if (blob) save(blob, 'png');
    renderScene(cv, seed, { flags: flags() });
  });
  const exportGIF = () => exporting('exGIF', async () => {
    const bytes = await animationGIF(seed, { flags: flags() });
    save(new Blob([bytes], { type: 'image/gif' }), 'gif');
  });
  // ---- blueprint: the same painting, rebuilt in front of you with its working shown
  const app = document.querySelector('.app');
  let bp = null;
  $('bpActs').replaceChildren(...BP_ACTS.map((name, i) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = i + 1; b.title = (i + 1) + ' · ' + name; b.setAttribute('aria-label', 'Jump to ' + name); b.onclick = () => bp && bp.jump(i); return b; }));
  function bpState(st) {
    [...$('bpActs').children].forEach((b, i) => { b.classList.toggle('past', i < st.act); if (i === st.act && !st.done) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
    $('bpNow').textContent = st.done ? 'Finished' : (st.act + 1) + ' · ' + BP_ACTS[st.act];
    $('bpProg').style.width = (100 * st.t / st.total).toFixed(1) + '%';
    $('bpPlay').textContent = st.done ? 'Replay' : st.playing ? 'Pause' : 'Play';
    $('bpS1').setAttribute('aria-pressed', st.speed === 1 ? 'true' : 'false'); $('bpS4').setAttribute('aria-pressed', st.speed === 4 ? 'true' : 'false');
    $('bpEnd').disabled = st.done;
  }
  function startBlueprint() {
    if (bp) return;
    if (anim) { anim.cancel(); anim = null; }
    const my = ++pending;
    app.classList.add('bpmode'); $('bpanel').hidden = false; $('bpCon').textContent = ''; $('bpSeed').textContent = idOf(seed);
    page.classList.remove('painting');
    Promise.all([ensureFonts(generate(seed, {}).styleKey), ...(document.fonts ? ['400', '600'].map(w => document.fonts.load(w + ' 12px "IBM Plex Mono"').catch(() => null)) : [])]).then(() => {
      if (my !== pending || !app.classList.contains('bpmode')) return;
      bp = blueprint(cv, $('bp'), seed, { flags: flags(), console: $('bpCon'), onState: bpState });
    });
    $('bpPlay').focus({ preventScroll: true });
  }
  function stopBlueprint(redraw = true) {
    if (!app.classList.contains('bpmode')) return;
    pending++;
    if (bp) { bp.cancel(); bp = null; }
    app.classList.remove('bpmode'); $('bpanel').hidden = true;
    if (redraw) { draw(false); $('blueprint').focus({ preventScroll: true }); }
  }
  $('blueprint').onclick = startBlueprint;
  $('bpClose').onclick = () => stopBlueprint();
  $('bpPlay').onclick = () => bp && bp.toggle();
  $('bpEnd').onclick = () => bp && bp.end();
  $('bpS1').onclick = () => bp && bp.setSpeed(1);
  $('bpS4').onclick = () => bp && bp.setSpeed(4);
  // ---- about: places from the rulebooks themselves, feedback by email
  const about = $('about');
  $('placeCount').textContent = STYLE_KEYS.length;
  $('placeList').replaceChildren(...STYLE_KEYS.map(k => {
    const P = STYLES[k], li = document.createElement('li'), b = document.createElement('b'), a = document.createElement('span'), t = document.createElement('span');
    b.textContent = P.city; a.className = 'area'; a.textContent = ' — ' + P.area; t.className = 'types';
    t.textContent = [...Object.values(SHOPS[k].types), ...Object.values(HOUSES[k].types)].map(x => x.name).filter((v, i, arr) => arr.indexOf(v) === i).join(' · ');
    li.append(b, a, t); return li;
  }));
  const gh = $('ghLink');
  if (CONFIG.github) gh.href = CONFIG.github; else { gh.removeAttribute('href'); gh.setAttribute('aria-disabled', 'true'); gh.title = 'Coming soon'; }
  $('infoBtn').onclick = () => { if (anim && anim.running) anim.skip(); about.showModal(); };
  $('aboutClose').onclick = () => about.close();
  about.addEventListener('click', e => { if (e.target === about) about.close(); }); // a click on the backdrop closes it
  let lastSent = 0;
  $('fbForm').addEventListener('submit', async e => {
    e.preventDefault();
    const st = $('fbStatus'), form = e.target, msg = $('fbMsg').value.trim(), mail = $('fbEmail').value.trim();
    const say = (t, c) => { st.textContent = t; st.className = 'status' + (c ? ' ' + c : ''); };
    if (form._honey.value) return say('Thank you.', 'ok'); // a bot filled the hidden field
    if (msg.length < 3) { $('fbMsg').focus(); return say('Write a message first.', 'err'); }
    if (mail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) { $('fbEmail').focus(); return say('That email address does not look right.', 'err'); }
    if (Date.now() - lastSent < 30000) return say('Thanks, one moment before sending another.', 'err');
    $('fbSend').disabled = true; say('Sending…');
    const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 15000);
    try {
      const to = atob(CONFIG.feedback.join(''));
      const r = await fetch('https://formsubmit.co/ajax/' + encodeURIComponent(to), {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, signal: ctl.signal,
        body: JSON.stringify({ _subject: 'Somewhere · feedback / request', _template: 'table', _captcha: 'false', message: msg, ...(mail ? { email: mail } : {}), page: location.origin + location.pathname, painting: idOf(seed) }),
      });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      lastSent = Date.now(); form.reset(); say('Sent. Thank you!', 'ok');
    } catch (err) { say('Could not send right now. Please try again later.', 'err'); }
    finally { clearTimeout(timer); $('fbSend').disabled = false; }
  });
  $('gen').onclick = generateNew;
  $('back').onclick = () => go(-1);
  $('fwd').onclick = () => go(1);
  $('exSVG').onclick = exportSVG; $('exPNG').onclick = exportPNG; $('exGIF').onclick = exportGIF;
  document.addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || $('about').open) return;
    if (bp || app.classList.contains('bpmode')) {
      if (e.key === 'Escape' || e.key === 'b' || e.key === 'B') { e.preventDefault(); stopBlueprint(); return; }
      if (e.key === ' ' && e.target.tagName !== 'BUTTON') { e.preventDefault(); if (bp) bp.toggle(); return; }
      if (e.key >= '1' && e.key <= '7') { if (bp) bp.jump(+e.key - 1); return; }
    }
    if (e.key === 'b' || e.key === 'B') { startBlueprint(); return; }
    if (e.key === ' ' || e.key === 'g' || e.key === 'G' || e.key === 'r' || e.key === 'R') { if (e.target.tagName === 'BUTTON' && e.key === ' ') return; e.preventDefault(); generateNew(); }
    else if (e.key === 'ArrowLeft') go(-1);
    else if (e.key === 'ArrowRight') go(1);
    else if (e.key === 'e' || e.key === 'E') exportSVG();
    else if (e.key === 'Escape' && anim && anim.running) anim.skip();
  });
  renderLayers();
  generateNew();
})();
