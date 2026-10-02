// ============================================================================
//  SOMEWHERE — dwellings
//  Every locale has houses as well as shops. A house type overrides parts of
//  the style's rulebook (massing, ground floor, door, boundary, roof) while
//  inheriting the rest (materials, windows, ornament, planting, script).
// ============================================================================
const ORSI = { kind: 'orosi', w: [0.42, 0.55], wMax: 110, h: [150, 180], cols: [3, 4], rows: [4, 5], top: 'persian', grille: 0, shutters: 0, box: 0, balconette: 0.3, surround: false, frame: [[150, 104, 70], [120, 84, 60]] };
const HOUSES = {
  showa: { p: 0.4, types: {
    wooden: { w: 1, name: 'wooden house (木造住宅)', period: '1950–1970', width: [460, 580], ups: [[1, 0.7], [0, 0.3]], h0: [255, 270], hf: [240, 255], massing: 'stepped', matGround: [['siding', 2], ['plaster', 1]], matUpper: [['siding', 2], ['plaster', 1]], roof: [['hip', 2], ['gable', 2]], door: 'genkan', canopy: true, boundary: [['blockWall', 2], ['hedge', 1.2]] },
    mortar: { w: 0.8, name: 'mortar house (モルタル住宅)', period: '1960–1990', width: [420, 520], ups: [[1, 1]], h0: [255, 270], hf: [240, 255], matGround: [['plaster', 1]], matUpper: [['plaster', 1]], roof: [['flat', 1], ['shed', 1]], door: 'genkan', canopy: true, balcony: 0.9, boundary: [['blockWall', 2], ['fence', 1]] },
  } },
  straits: { p: 0.3, types: {
    terrace: { w: 1, name: 'terrace house', period: '1900–1940', ornament: ['pilasters', 'cornice', 'panels'], ground: 'arcade', door: 'pagar', bays: { '*': [['barWin', 1]] } },
  } },
  taiwan: { p: 0.45, types: {
    townhouse: { w: 1, name: 'townhouse (透天厝)', period: '1970–2000', ground: [['house', 1]], door: 'panel', bays: { '*': [['garage', 1]] }, fu: true },
  } },
  korea: { p: 0.5, types: {
    dandok: { w: 1, name: 'detached house (단독주택)', period: '1970–2000', ups: [[1, 0.6], [0, 0.4]], width: [440, 520], door: 'panel', extStair: 0.9, boundary: [['gateWall', 1]] },
  } },
  persian: { p: 0.45, types: {
    courtyard: { w: 1.3, name: 'courtyard house (خانه حیاط‌دار)', period: '1790–1925', massing: 'courtyard', ground: 'compound', matGround: [['plaster', 1.4], ['persianBrick', 1]], matUpper: [['plaster', 1.2], ['persianBrick', 1]], /* Yazd: kahgel mud-straw plaster */ ups: [[1, 0.6], [2, 0.4]], h0: [300, 330], roof: [['badgir', 2], ['parapet', 1]], win: ORSI },
    townhouse: { w: 1, name: 'brick townhouse (خانه آجری)', period: '1790–1925', door: 'studded', ups: [[1, 0.65], [2, 0.35]], ornament: ['kashi', 'brickPanels'], roof: [['badgir', 1], ['parapet', 1.2]] }, // orosi face the courtyard, not the street
  } },
  levant: { p: 0.45, types: {
    damascene: { w: 1, name: 'courtyard house (بيت دمشقي)', period: '1700–1900', blankGround: true, oriel: 1, door: 'studded' },
  } },
  beirut: { p: 0.55, types: {
    villa: { w: 1, name: 'central-hall house (maison à hall central)', period: '1860–1930', ups: [[1, 0.7], [0, 0.3]], width: [480, 560], tripleArch: 1, oriel: 0, roof: [['terracotta', 1]], door: 'panel', doorTop: 'arch', boundary: [['railing', 1]] },
  } },
  paris: { p: 0.45, types: {
    immeuble: { w: 1, name: 'Haussmann apartment building (immeuble haussmannien)', period: '1853–1914', ground: 'house', door: 'cochere' },
  } },
  fachwerk: { p: 0.5, types: {
    house: { w: 1, name: 'half-timbered house (Fachwerkhaus)', period: '1450–1780', door: 'panel', doorTop: 'flat', lintel: true, steps: 2, boundary: [['none', 2], ['picket', 1]] },
  } },
  med: { p: 0.45, types: {
    townhouse: { w: 1, name: 'painted townhouse (casa a facciata dipinta)', period: '1700–1900', door: 'panel', doorTop: 'arch' },
  } },
  lahore: { p: 0.5, types: {
    haveli: { w: 1, name: 'haveli (حویلی)', period: '1600–1850', retrofit: 0.45, bangla: true, ups: [[1, 0.4], [2, 0.6]], h0: [300, 330], matGround: [['nanakshahi', 1]], matUpper: [['nanakshahi', 1]], door: 'studded', doorTop: 'cusped', blankGround: true, oriel: 1,
      win: { kind: 'casement', w: [0.36, 0.46], wMax: 92, h: [150, 180], cols: [2, 2], rows: [3, 3], top: [['cusped', 2], ['arch', 1]], grille: 0.2, shutters: 0.6, shutterKind: 'panel', box: 0, balconette: 0, surround: true, chhajja: 0.9, frame: [[110, 74, 50], [96, 66, 46]] } },
    mohalla: { w: 1, name: 'mohalla house (محلے کا مکان)', period: '1900–1970', retrofit: 0.85, ups: [[2, 0.45], [1, 0.35], [3, 0.2]], matGround: [['plaster', 1.2], ['nanakshahi', 1]], matUpper: [['nanakshahi', 1], ['plaster', 1.5]], door: 'panel', oriel: 0.45, groundGrille: 0.6 },
    kothi: { w: 1.1, name: 'kothi (کوٹھی)', period: '1970–now', retrofit: 1, ups: [[1, 0.75], [0, 0.25]], width: [520, 640], h0: [300, 320], hf: [290, 305], matGround: [['plaster', 2], ['cladding', 1.3]], matUpper: [['plaster', 2], ['cladding', 1]], door: 'panel', oriel: 0, groundGrille: 0.9, boundary: [['kothiWall', 1]],
      win: { kind: 'casement', w: [0.5, 0.66], wMax: 165, h: [130, 160], cols: [2, 3], rows: [1, 2], top: 'flat', grille: 0.8, shutters: 0, box: 0, balconette: 0, surround: false, chhajja: 1, frame: [[240, 240, 236], [96, 70, 56], [60, 64, 70]] } },
  } },
  dutch: { p: 0.5, types: {
    canal: { w: 1, name: 'canal house (grachtenpand)', period: '1600–1800', door: 'panel', doorTop: 'fanlight', stoopHigh: true },
  } },
  lisbon: { p: 0.45, types: {
    pombalino: { w: 1, name: 'Pombaline building (prédio pombalino)', period: '1758–1820', ups: [[3, 0.6], [2, 0.4]], matUpper: [['plaster', 3], ['azulejo', 0.6]], door: 'panel', doorTop: 'arch', sacadaFloors: [1] },
    tiled: { w: 1, name: 'tiled townhouse (casa de azulejos)', period: '1850–1910', ups: [[2, 0.45], [3, 0.55]], matUpper: [['azulejo', 1]], door: 'panel', doorTop: 'fanlight', sacadaFloors: [1, 2] },
    alfama: { w: 0.8, name: 'old-town house (casa de Alfama)', period: '1600–1900', width: [380, 480], ups: [[1, 0.35], [2, 0.45], [3, 0.2]], h0: [270, 300], hf: [255, 275], hfDecay: 0, matGround: [['plaster', 1]], matUpper: [['plaster', 1]], door: 'panel', doorTop: 'flat', sacadaFloors: [], medBal: 0.5, ornament: ['corniceTop'], roof: [['terracotta', 1]],
      win: { kind: 'casement', w: [0.36, 0.46], wMax: 84, h: [120, 145], cols: [2, 2], rows: [3, 3], top: 'flat', grille: 0.15, shutters: 0.2, shutterKind: 'panel', box: 0.2, balconette: 0.35, surround: true, frame: [[240, 238, 232], [110, 60, 50], [60, 86, 70]] } },
  } },
  istanbul: { p: 0.55, types: {
    ahsap: { w: 1.2, name: 'timber house (ahşap ev)', period: '1850–1920', door: 'panel', doorTop: 'flat', steps: 2 },
    kagir: { w: 0.8, name: 'masonry row house (kâgir sıra ev)', period: '1880–1930', massing: 'terrace', matGround: [['stone', 1]], matUpper: [['plaster', 2], ['brick', 0.8]], ornament: ['corniceTop', 'quoins'], door: 'panel', doorTop: 'arch', steps: 2,
      win: { kind: 'sash', w: [0.42, 0.52], wMax: 92, h: [160, 185], cols: [2, 2], rows: [3, 3], top: [['flat', 2], ['segment', 1]], grille: 0.1, shutters: 0.15, shutterKind: 'panel', box: 0, balconette: 0.15, surround: true, frame: [[240, 238, 230], [90, 70, 56]] } },
  } },
  hanoi: { p: 0.45, types: {
    tube: { w: 1, name: 'tube house (nhà ống)', period: '1990–now', ups: [[3, 0.4], [4, 0.4], [5, 0.2]], width: [300, 400], ground: [['house', 1]], door: 'panel', bays: { '*': [['garage', 1]] }, continuousBalcony: [1, 2, 3, 4, 5], ornament: [], roof: [['shack', 2], ['terrace', 1.2], ['flat', 1]], matUpper: [['plaster', 2], ['tile', 1]],
      win: { kind: 'japanese', w: [0.6, 0.78], wMax: 260, h: [190, 215], cols: [2, 4], rows: [1, 1], top: 'flat', grille: 0, cage: 0.35, shutters: 0, box: 0, balconette: 0, surround: false, frame: [[196, 198, 200], [170, 150, 120], [236, 232, 220]] } },
  } },
  nola: { p: 0.5, types: {
    creoleTownhouse: { w: 1, name: 'Creole townhouse', period: '1790–1860', door: 'cochere' },
    creoleCottage: { w: 1, name: 'Creole cottage', period: '1790–1860', ups: [[0, 1]], width: [600, 760], h0: [330, 360], roof: [['sideGable', 1]], dormers: 0.85, door: 'panel', doorTop: 'flat', gallery: [['none', 1]],
      win: { kind: 'tall', w: [0.4, 0.5], wMax: 96, h: [210, 240], cols: [2, 2], rows: [4, 4], top: 'flat', grille: 0, shutters: 1, shutterKind: 'panel', box: 0, balconette: 0, surround: false, frame: [[240, 238, 232]] } },
  } },
};
// Shop types. Where a locale's shop buildings changed form over time, each
// period is its own type with its own rules; otherwise one type.
const SHOPS = {
  showa: { types: {
    woodShop: { w: 1, name: 'wooden shophouse (木造店舗)', period: '1950–1970', ups: [[1, 0.75], [0, 0.25]], matGround: [['wood', 1.5], ['plaster', 1]], matUpper: [['wood', 1], ['siding', 1.5], ['plaster', 0.6]], belt: { cafe: [['awningScallop', 1], ['pent', 1]], '*': [['pent', 3], ['awning', 1]] }, roof: [['hip', 2], ['gable', 1.5]], door: 'sliding' },
    mortarShop: { w: 1, name: 'mortar shophouse (モルタル店舗)', period: '1960–1990', ups: [[1, 0.55], [2, 0.35], [0, 0.1]], matGround: [['tile', 1], ['plaster', 2]], matUpper: [['plaster', 2], ['tile', 0.8], ['brick', 0.5]], belt: { cafe: [['awningScallop', 2], ['slab', 1]], '*': [['awning', 2], ['slab', 2], ['awningScallop', 0.6]] }, roof: [['flat', 2], ['shed', 1.5]] },
  } },
  straits: { types: {
    earlyShop: { w: 0.7, name: 'early shophouse (店屋)', period: '1840–1900', ups: [[1, 1]], h0: [280, 310], hf: [262, 282], nWin: 2, ornament: [], roof: [['chineseEave', 1]],
      win: { kind: 'tall', w: [0.3, 0.36], wMax: 80, h: [150, 172], cols: [2, 2], rows: [3, 3], top: 'flat', grille: 0, shutters: 1, shutterKind: 'fullLouvre', box: 0, balconette: 0, surround: false, frame: [[240, 240, 232]] } },
    lateShop: { w: 1.3, name: 'late shophouse (店屋)', period: '1900–1940', ups: [[1, 0.6], [2, 0.4]], ornament: ['pilasters', 'cornice', 'panels'], roof: [['pediment', 2], ['chineseEave', 1]] },
    decoShop: { w: 0.8, name: 'Art Deco shophouse (店屋)', period: '1930–1960', ups: [[2, 1]], h0: [320, 345], hf: [290, 305], nWin: 2, ornament: ['pilasters', 'cornice'], fins: true, roof: [['decoParapet', 1]],
      win: { kind: 'casement', w: [0.62, 0.74], wMax: 170, h: [150, 170], cols: [3, 4], rows: [2, 2], top: 'flat', grille: 0, shutters: 0, box: 0, balconette: 0, surround: false, chhajja: 0.8, frame: [[232, 232, 226], [120, 140, 130]] } },
  } },
  paris: { types: { immeubleShop: { w: 1, name: 'Haussmann apartment building (immeuble haussmannien)', period: '1853–1914' } } },
  fachwerk: { types: {
    medievalShop: { w: 1, name: 'late-medieval half-timbered house (spätgotisches Fachwerkhaus)', period: '1450–1600', jettyRange: [26, 38], field: [80, 100], winFill: 0.62 },
    baroqueShop: { w: 1, name: 'baroque half-timbered house (barockes Fachwerkhaus)', period: '1650–1780', jettyRange: [0, 12], field: [100, 125], winFill: 0.74 },
  } },
  med: { types: { paintedShop: { w: 1, name: 'painted townhouse (casa a facciata dipinta)', period: '1700–1900' } } },
  dutch: { types: { canalShop: { w: 1, name: 'canal house (grachtenpand)', period: '1600–1800' } } },
  taiwan: { types: { towShop: { w: 1, name: 'townhouse with shop (透天厝)', period: '1970–2000' } } },
  korea: { types: { nbhdShop: { w: 1, name: 'neighbourhood shop building (근린생활시설)', period: '1980–2000' } } },
  persian: { types: { bazaarShop: { w: 1, name: 'bazaar shop (حجره)', period: '1790–1925' } } },
  levant: { types: { souqShop: { w: 1, name: 'souq shophouse (دكان)', period: '1700–1900' } } },
  beirut: { types: { arcadedShop: { w: 1, name: 'arcaded shophouse', period: '1860–1930' } } },
  lahore: { types: { bazaarHouse: { w: 1, name: 'bazaar house (بازار کا مکان)', period: '1900–now', retrofit: 0.9 } } },
  lisbon: { types: {
    pombalShop: { w: 1.2, name: 'Pombaline building (prédio pombalino)', period: '1758–1820', ups: [[3, 0.6], [2, 0.4]], matUpper: [['plaster', 3], ['azulejo', 0.6]], sacadaFloors: [1, 'top'] },
    tiledShop: { w: 1, name: 'tiled building (prédio de azulejos)', period: '1850–1910', ups: [[2, 0.4], [3, 0.6]], matUpper: [['azulejo', 1]], sacadaFloors: [1, 2] },
  } },
  istanbul: { types: {
    ahsapShop: { w: 1, name: 'timber shophouse (ahşap dükkân)', period: '1850–1920' },
    kagirShop: { w: 0.7, name: 'masonry shophouse (kâgir dükkân)', period: '1880–1930', massing: 'terrace', matGround: [['stone', 1]], matUpper: [['plaster', 2], ['brick', 0.8]], ornament: ['corniceTop', 'quoins'],
      win: { kind: 'sash', w: [0.42, 0.52], wMax: 92, h: [160, 185], cols: [2, 2], rows: [3, 3], top: [['flat', 2], ['segment', 1]], grille: 0.1, shutters: 0.15, shutterKind: 'panel', box: 0, balconette: 0.15, surround: true, frame: [[240, 238, 230], [90, 70, 56]] } },
  } },
  hanoi: { types: {
    oldShop: { w: 0.6, name: 'old shophouse (nhà ống cổ)', period: '1800–1900', ups: [[1, 1]], h0: [280, 310], hf: [190, 225], continuousBalcony: [], ornament: [], roof: [['chineseEave', 1]],
      win: { kind: 'casement', w: [0.34, 0.44], wMax: 80, h: [80, 105], cols: [2, 2], rows: [2, 2], top: 'flat', grille: 0.5, shutters: 1, shutterKind: 'panel', box: 0, balconette: 0, surround: false, frame: [[120, 84, 60], [90, 70, 56]] } },
    colonialShop: { w: 1, name: 'colonial shophouse (nhà phố kiểu Pháp)', period: '1900–1945', ups: [[1, 0.45], [2, 0.55]], continuousBalcony: [1], roof: [['pediment', 2], ['terrace', 1]] },
    tubeShop: { w: 1.4, name: 'tube house (nhà ống)', period: '1990–now', width: [300, 400], ups: [[3, 0.4], [4, 0.4], [5, 0.2]], continuousBalcony: [1, 2, 3, 4, 5], ornament: [], roof: [['shack', 2], ['terrace', 1.2], ['flat', 1]], matUpper: [['plaster', 2], ['tile', 1]],
      win: { kind: 'japanese', w: [0.6, 0.78], wMax: 260, h: [190, 215], cols: [2, 4], rows: [1, 1], top: 'flat', grille: 0, cage: 0.35, shutters: 0, box: 0, balconette: 0, surround: false, frame: [[196, 198, 200], [170, 150, 120], [236, 232, 220]] } },
  } },
  nola: { types: {
    creoleShop: { w: 1, name: 'Creole townhouse', period: '1790–1860', gallery: [['balcony', 2], ['gallery', 0.6], ['none', 0.4]] },
    cornerStore: { w: 1, name: 'corner-store townhouse', period: '1830–1900', gallery: [['gallery', 2], ['balcony', 0.5]], bayTop: 'flat' },
  } },
};
// residential street life: no trade furniture, only what households keep outside
const HOME_PROPS = ['charpai', 'generator', 'bicycle', 'scooter', 'scooterRow', 'potsRow', 'potsDoor', 'bench', 'small', 'basins', 'onggi', 'barrelPlanter', 'bollards', 'bin', 'carpets', 'lantern', 'mailbox', 'wallLamp', 'streetPlate'];

// Resolve the rulebook for one building: style rules, then house overrides
function resolveRulebook(styleKey, use, typeKey) {
  const st = STYLES[styleKey];
  if (use !== 'house') { const ty = SHOPS[styleKey].types[typeKey] || {}; return { ...st, ...ty, use: 'shop', typeName: ty.name, period: ty.period }; }
  const H = HOUSES[styleKey], ty = H.types[typeKey];
  const rb = { ...st, ...ty, use: 'house', typeName: ty.name, period: ty.period, groundSign: 'none' };
  if (!ty.ground) rb.ground = st.ground === 'arcade' ? 'arcade' : 'house';
  if (Array.isArray(rb.ground)) rb.ground = rb.ground[0][0];
  rb.props = st.props.filter(k => HOME_PROPS.includes(k));
  if (!rb.props.includes('potsRow')) rb.props.push('potsRow');
  rb.props.push('mailbox', 'houseNo', 'bicycle');
  rb.belt = { '*': [['none', 1]] };
  return rb;
}

// ---------------------------------------------------------------- house ground floor
// a front door (style-specific), windows on the upper-floor rules, and the
// threshold furniture: canopy, steps, stoop, lintel inscription
function houseGround(S, v, R, pal, st) {
  const z = v.z, W = v.x1 - v.x0;
  const openTop = v.y1 - 40, plinth = 14;
  const dw = { genkan: R.range(140, 170), cochere: R.range(200, 240), studded: R.range(120, 140), pagar: 110, panel: R.range(100, 120) }[st.door] || 110;
  const nB = Math.max(2, Math.min(4, Math.round(W / R.range(130, 170))));
  const doorAt = st.door === 'cochere' ? (nB > 2 && R.chance(0.6) ? Math.floor(nB / 2) : R.int(0, nB - 1)) : R.int(0, nB - 1);
  const pil = R.range(18, 30), rest = W - pil * (nB + 1) - dw;
  const bays = []; let x = v.x0 + pil;
  for (let i = 0; i < nB; i++) { const w = i === doorAt ? dw : rest / (nB - 1); bays.push({ x0: x, x1: x + w, type: i === doorAt ? 'door' : 'window' }); x += w + pil; }
  S.gf = { bays, openTop, plinth, doorAt, z };
  S.debug.bays.push(...bays.map(b => ({ ...b, y0: 0, y1: openTop, z })));
  S.add(z + 0.1, () => { wash(quad(v.x0, 0, v.x1, plinth, z), [150, 146, 150], { a: 0.35, amp: 0.8 }); L3([v.x0, plinth, z], [v.x1, plinth, z], { w: D_INK }); });
  const door = bays[doorAt], doorY0 = st.stoopHigh ? 105 : st.steps ? 30 : plinth;
  const doorTop = st.door === 'cochere' ? Math.min(openTop + 10, v.y1 - 25) : Math.min(openTop - 10, doorY0 + 230);
  const dTop = st.door === 'cochere' ? 'arch' : st.doorTop || 'flat';
  bayEl(S, { ...door }, doorY0, doorTop, z, R.fork('door'), pal, st, null, dTop);
  // windows on the ground floor follow the style's window rules, raised off the street
  const ws = st.win, wTop = typeof ws.top === 'string' ? ws.top : R.wpick(ws.top);
  if (st.bays && JSON.stringify(st.bays).includes('garage')) { // Taiwanese townhouse: the street floor is a garage for the family scooters
    const gb = bays.filter(b => b.type === 'window').sort((a, b) => (b.x1 - b.x0) - (a.x1 - a.x0))[0];
    if (gb) { gb.type = 'garage'; bayEl(S, gb, plinth, openTop - 10, z, R.fork('garage'), pal, st, null, 'flat'); }
  }
  for (const b of bays) {
    if (b.type !== 'window') continue;
    const bw = b.x1 - b.x0, ww = clamp(bw * R.range(0.5, 0.7), 60, ws.wMax || 120);
    const wh = st.blankGround ? 50 : clamp(R.range(...ws.h) * 0.85, 90, openTop - 110);
    const wy = st.blankGround ? openTop - 80 : st.stoopHigh ? 120 : Math.max(85, openTop - wh - 20);
    const s = { top: wTop, cols: st.blankGround ? 3 : R.int(...ws.cols), rows: R.int(...ws.rows), kind: ws.kind, frameCol: pal.frame, frameW: 7, inside: R.wpick([[null, 1], ['curtain', 2], ['blind', 1]]), curtainCol: mix(R.pick([pal.acc, [240, 230, 210]]), [255, 255, 255], 0.5), recess: 10, surround: ws.surround, keystone: ws.keystone, relieving: ws.relieving, kashi: st.ornament.includes('kashi'),
      grille: st.blankGround || st.styleKey === 'paris' || R.chance(st.groundGrille || (ws.kind === 'japanese' ? 0.6 : 0.15)), chhajja: R.chance(ws.chhajja || 0), shutters: R.chance(ws.shutters || 0) ? ws.shutterKind : null, shutterCol: pal.shutter, shutterState: st.styleKey === 'med' ? R.pick(['closed', 'half', 'open']) : 'open',
      box: R.chance(st.flora.windowBox || 0) ? R.pick(['geranium', 'trailing']) : null };
    windowEl(S, (b.x0 + b.x1) / 2 - ww / 2, wy, ww, wh, z, s, pal);
    if (st.stoopHigh) { const q = quad((b.x0 + b.x1) / 2 - ww / 2, 20, (b.x0 + b.x1) / 2 + ww / 2, 70, z); S.add(z + 0.25, () => { paper([q]); wash(q, pal.interior, { a: 0.6 }); inkPoly(q, { w: D_INK }); for (let k = 1; k < 4; k++) L3([lerp((b.x0 + b.x1) / 2 - ww / 2, (b.x0 + b.x1) / 2 + ww / 2, k / 4), 20, z], [lerp((b.x0 + b.x1) / 2 - ww / 2, (b.x0 + b.x1) / 2 + ww / 2, k / 4), 70, z], { w: 0.6 }); }); }
  }
  // thresholds
  if (st.canopy) { // Japanese entrance hood over the genkan
    const b = { x0: door.x0 - 20, x1: door.x1 + 20, y0: doorTop + 18, y1: doorTop + 26, z0: z, z1: z + 70 };
    S.add(z + 70, () => { shadowBox(b, { a: 0.5 }); const f = new Face([b.x0, doorTop + 10, z + 70], [1, 0, 0], [0, 0.5, -0.86], rectP(b.x1 - b.x0, 80)); tileRoof(f, b.x1 - b.x0, 80, pal, true, null, 'kawara'); });
  }
  if (st.stoopHigh) dutchStoop(S, door, z, pal, doorY0);
  else if (st.steps) stoop(S, door.x0 - 10, door.x1 + 10, z, pal);
  if (st.lintel) S.add(z + 0.4, () => { // carved inscription on the door lintel
    const f = new Face([door.x0 - 10, doorTop + 4, z], [1, 0, 0], [0, 1, 0], rectP(door.x1 - door.x0 + 20, 22));
    wash(f.spoly(), darken(pal.timber, 0.05), { a: 0.75 }); inkPoly(f.spoly(), { w: 0.7 });
    latinText(f, 4, 2, door.x1 - door.x0 + 16, 20, S.T.lintel, { font: 'serif', col: [236, 220, 170], size: 0.7 });
  });
  if (st.fu) S.add(z + 0.5, () => { // red spring-festival paper on the door: 福 on a diamond
    const c = [(door.x0 + door.x1) / 2, doorY0 + (doorTop - doorY0) * 0.62], d = 18, q = [[c[0], c[1] + d], [c[0] + d, c[1]], [c[0], c[1] - d], [c[0] - d, c[1]]];
    paper([W2(q, z + 1.5)]); wash(W2(q, z + 1.5), [210, 40, 36], { a: 0.85 }); inkPoly(W2(q, z + 1.5), { w: 0.5, os: 0 });
    scriptText(new Face([c[0] - 10, c[1] - 10, z + 1.6], [1, 0, 0], [0, 1, 0], rectP(20, 20)), 0, 0, 20, 20, '福', { font: SCRIPTS.zh.fonts.sign, weight: 900, col: [30, 24, 20], even: true });
  });
}
function dutchStoop(S, door, z, pal, top) {
  const n = 5, run = 34, w = door.x1 - door.x0 + 30, x0 = door.x0 - 15;
  S.add(z + 60, () => {
    for (let k = 0; k < n; k++) { const b = { x0, x1: x0 + w, y0: k * top / n, y1: (k + 1) * top / n, z0: z, z1: z + (n - k) * run }; shadowBox(b, { a: 0.3 }); drawBox(b, { col: pal.stone, a: 0.45, w: D_INK }); }
    for (const x of [x0 + 2, x0 + w - 2]) { const pts = [P([x, 6, z + n * run]), P([x, top + 90, z + 8])]; inkLine(pts, { w: 1.4, os: 0 }); for (let k = 0; k <= n; k++) L3([x, k * top / n, z + (n - k) * run], [x, k * top / n + 90, z + (n - k) * run], { w: 0.7, os: 0 }); }
  });
}

// ---------------------------------------------------------------- Persian compound wall
// a blank wall with one portal: a framed, deeply recessed arch, a studded door,
// and a stone bench either side of the threshold
function compoundGround(S, v, R, pal, st) {
  const z = v.z, W = v.x1 - v.x0, H = v.y1;
  const pw = R.range(170, 210), px0 = v.x0 + (W - pw) * R.range(0.25, 0.75), dw = pw - 70;
  const door = { x0: px0 + 35, x1: px0 + 35 + dw, type: 'door' };
  S.gf = { bays: [door], openTop: H - 50, plinth: 0, doorAt: 0, z };
  S.add(z + 0.3, () => {
    const fr = quad(px0, 0, px0 + pw, Math.min(H - 10, 300), z + 4);
    shadowBox({ x0: px0, x1: px0 + pw, y0: 0, y1: Math.min(H - 10, 300), z0: z, z1: z + 4 }, { a: 0.4 });
    paper([fr]); wash(fr, mix(v.mat.col, [255, 255, 255], 0.15), { a: 0.6 });
    kashiFrame(px0 + 8, 30, px0 + pw - 8, Math.min(H - 18, 292), z + 4, 230);
    const rec = openingPoly(px0 + 24, 0, px0 + pw - 24, Math.min(H - 30, 272), 'persian');
    paper([W2(rec, z + 4)]); wash(W2(rec, z + 4), darken(v.mat.col, 0.25), { a: 0.6 });
    const sy = springY(px0 + 24, px0 + pw - 24, Math.min(H - 30, 272), 'persian', 0);
    for (let y = sy + 6; y < Math.min(H - 34, 268); y += 10) L3([px0 + 30 + (y - sy) * 0.5, y, z + 4], [px0 + pw - 30 - (y - sy) * 0.5, y, z + 4], { w: 0.4, a: 0.5, brk: 0 }); // muqarnas hint
    inkPoly(W2(rec, z + 4), { w: W_INK });
    drawDoor(door.x0, door.x1, 26, 26 + 200, z + 2, 'studded', 'flat', pal, S);
    for (const [a, b] of [[px0 + 24, door.x0 - 2], [door.x1 + 2, px0 + pw - 24]]) { const bench = { x0: a, x1: b, y0: 0, y1: 26, z0: z, z1: z + 30 }; shadowBox(bench, { a: 0.3 }); drawBox(bench, { col: pal.stone, a: 0.5, w: D_INK }); }
  });
  // a narrow high window or two, barred
  for (const x of [v.x0 + 40, v.x1 - 90]) if (Math.abs(x - px0) > 120 && R.chance(0.6)) windowEl(S, x, H - 110, 50, 60, z, { top: 'persian', cols: 2, rows: 2, kind: 'orosi', frameCol: pal.frame, frameW: 5, grille: true, recess: 12 }, pal);
}

// ---------------------------------------------------------------- front boundaries and gardens
function frontBoundary(S, g, R, pal, kind) {
  if (!kind || kind === 'none') return;
  const door = S.gf.bays[S.gf.doorAt], zb = Math.round(R.range(120, 160));
  const gx0 = door.x0 - 14, gx1 = door.x1 + 14, x0 = g.x0 - R.range(10, 40), x1 = g.x1 + R.range(10, 40);
  S.garden = { z0: g.z, z1: zb };
  S.boundary = { kind, z: zb, x0, x1, gx0, gx1 };
  const H = { blockWall: R.range(120, 145), hedge: R.range(110, 135), fence: R.range(100, 120), gateWall: R.range(160, 180), picket: R.range(85, 100), railing: R.range(110, 130), kothiWall: R.range(175, 205) }[kind];
  const kothi = kind === 'kothiWall', wallCol = kothi ? mix(pal.wall0, [240, 236, 228], 0.35) : null, gateCol = kothi ? R.pick([[40, 40, 44], [110, 40, 40], [40, 80, 60], [60, 60, 70]]) : null;
  S.bounds.push([x0, 0, zb], [x1, H + (kothi ? 50 : 0), zb]);
  S.recv.push({ x0, x1, y0: 0, y1: H, z: zb });
  const segs = [[x0, gx0], [gx1, x1]];
  S.add(zb, () => {
    for (const [a, b] of segs) {
      if (b - a < 10) continue;
      if (kind === 'hedge') { const n = Math.ceil((b - a) / 60); for (let i = 0; i < n; i++) { const p = P([lerp(a, b, (i + 0.5) / n), H * 0.55, zb]); foliage(p[0], p[1], 38 * VIEW.k, H * 0.55 * VIEW.k, { leaf: 6, shape: 'round', ragged: 0.35, dens: 1.3, under: 0.7 }); } continue; }
      if (kind === 'picket') { L3([a, 30, zb], [b, 30, zb], { w: 0.9 }); L3([a, H - 25, zb], [b, H - 25, zb], { w: 0.9 }); for (let x = a; x < b; x += 12) { const pk = [[x, 0], [x + 7, 0], [x + 7, H - 6], [x + 3.5, H], [x, H - 6]]; paper([W2(pk, zb)]); wash(W2(pk, zb), [240, 236, 226], { a: 0.25 }); inkPoly(W2(pk, zb), { w: 0.6, os: 0 }); } continue; }
      if (kind === 'fence') { L3([a, H, zb], [b, H, zb], { w: 1.2 }); L3([a, 20, zb], [b, 20, zb], { w: 0.8 }); for (let x = a; x <= b; x += 9) L3([x, 0, zb], [x, H, zb], { w: 0.45, os: 0, brk: 0 }); continue; }
      if (kind === 'railing') {
        const base = { x0: a, x1: b, y0: 0, y1: 50, z0: zb - 25, z1: zb }; shadowBox(base, { a: 0.35 }); drawBox(base, { col: pal.stone, a: 0.5, w: D_INK });
        L3([a, H, zb - 12], [b, H, zb - 12], { w: 1.3 }); for (let x = a + 6; x < b; x += 10) L3([x, 50, zb - 12], [x, H, zb - 12], { w: 0.5, os: 0, brk: 0 });
        for (let x = a + 15; x < b - 10; x += 20) { const c = P([x, H - 18, zb - 12]); C.strokeStyle = rgba(COL.ink, 0.7); C.lineWidth = 0.6; C.beginPath(); C.arc(c[0], c[1], 4 * VIEW.k, 0, TAU); C.stroke(); }
        continue;
      }
      // masonry walls: concrete block (Japan) or brick with a tiled cap (Korea)
      const w = { x0: a, x1: b, y0: 0, y1: H, z0: zb - 15, z1: zb };
      castShadow(boxCorners(w), { a: 0.4 });
      drawBox(w, { col: kothi ? wallCol : kind === 'gateWall' ? [176, 92, 72] : [206, 204, 198], a: 0.55, w: D_INK, blot: 2, front: () => {
        if (kothi) { for (let y = 40; y < H - 20; y += 40) L3([a, y, zb], [b, y, zb], { w: 0.45, a: 0.5, brk: 0.2 }); return; } // plaster with scored bands
        if (kind === 'blockWall') { for (let y = 20; y < H; y += 20) L3([a, y, zb], [b, y, zb], { w: 0.45, a: 0.55, brk: 0.2 }); for (let y = 0, r = 0; y < H; y += 20, r++) for (let x = a + (r % 2) * 20; x < b; x += 40) L3([x, y, zb], [x, y + 20, zb], { w: 0.4, a: 0.45, os: 0, brk: 0 });
          for (let x = a + 6; x < b - 30; x += 40) { const c = P([x + 20, H - 10, zb]), rr = 6 * VIEW.k; C.fillStyle = rgba(COL.paper, 0.95); C.beginPath(); C.arc(c[0] - rr * 0.9, c[1], rr * 0.7, 0, TAU); C.arc(c[0] + rr * 0.9, c[1], rr * 0.7, 0, TAU); C.fill(); C.strokeStyle = rgba(COL.ink, 0.6); C.lineWidth = 0.5; C.stroke(); } }
        else brickPatch(a, 0, b, H, zb, texMask(RR, 0.35), { x0: a, x1: b, y0: 0, y1: H });
      } });
      if (kothi) { const cap = { x0: a - 5, x1: b + 5, y0: H, y1: H + 8, z0: zb - 20, z1: zb + 5 }; drawBox(cap, { col: [214, 210, 202], a: 0.55, w: 0.8 }); }
      if (kind === 'gateWall') { const cap = { x0: a - 4, x1: b + 4, y0: H, y1: H + 10, z0: zb - 19, z1: zb + 4 }; drawBox(cap, { col: [110, 120, 130], a: 0.6, w: 0.8 }); for (let k = 0; k < Math.floor((b - a) / 70); k++) potPlant(a + 20 + k * 70, H + 10, zb - 8, RR.pick(['bush', 'spiky', 'geranium']), RR.pick(['basin', 'styro']), pal, 0.7); }
    }
    // gate posts and gate
    for (const x of [gx0 - 14, gx1]) { const p = { x0: x, x1: x + 14, y0: 0, y1: H + 16, z0: zb - 16, z1: zb + 2 }; shadowBox(p, { a: 0.4 }); drawBox(p, { col: kothi ? wallCol : kind === 'gateWall' ? [176, 92, 72] : kind === 'railing' ? pal.stone : [196, 194, 188], a: 0.6, w: D_INK }); }
    if (kothi) { // sheet-steel gate: solid below, bars and a sunburst above
      const gq = quad(gx0, 4, gx1, H + 10, zb - 4); paper([gq]); wash(gq, gateCol, { a: 0.8, blot: 1 }); inkPoly(gq, { w: D_INK });
      const my = H * 0.62, gm = (gx0 + gx1) / 2; L3([gx0, my, zb - 4], [gx1, my, zb - 4], { w: D_INK }); L3([gm, 4, zb - 4], [gm, H + 10, zb - 4], { w: D_INK });
      for (let x = gx0 + 8; x < gx1 - 4; x += 9) L3([x, my, zb - 3], [x, H + 6, zb - 3], { w: 0.45, a: 0.7, os: 0 });
      for (const cx of [(gx0 + gm) / 2, (gm + gx1) / 2]) for (let k = 0; k < 7; k++) { const an = k / 6 * Math.PI; L3([cx, my + 4, zb - 2], [cx + Math.cos(an) * 22, my + 4 + Math.sin(an) * 22, zb - 2], { w: 0.4, a: 0.7, os: 0 }); }
      if (S.T.blessing) { // ماشاءاللہ on a marble plaque over the gate
        const pq = { x0: gm - 42, x1: gm + 42, y0: H + 18, y1: H + 44, z0: zb, z1: zb + 2 };
        drawBox(pq, { col: [244, 242, 236], a: 0.6, w: 0.6, front: f => sceneText(S, f, 3, 2, 81, 24, S.T.blessing, { col: [30, 100, 60], size: 0.8, fill: 0.92 }) });
      }
    } else if (kind === 'gateWall') { // solid steel gate, slightly ajar
      const gq = quad(gx0, 4, gx1, H + 4, zb - 4); paper([gq]); const gc = RR.pick([[60, 110, 90], [60, 90, 140], [150, 60, 50]]); wash(gq, gc, { a: 0.75, blot: 1 }); inkPoly(gq, { w: D_INK });
      for (let x = gx0 + 10; x < gx1 - 5; x += 14) L3([x, 20, zb - 4], [x, H - 10, zb - 4], { w: 0.45, a: 0.6 }); inkPoly(quad(gx0 + 10, H * 0.55, gx1 - 10, H - 12, zb - 4), { w: 0.5 });
    } else if (kind === 'blockWall' || kind === 'fence') { L3([gx0, H * 0.8, zb - 2], [gx1, H * 0.8, zb - 2], { w: 0.8 }); L3([gx0, 8, zb - 2], [gx1, 8, zb - 2], { w: 0.8 }); for (let x = gx0 + 8; x < gx1; x += 8) L3([x, 8, zb - 2], [x, H * 0.8, zb - 2], { w: 0.4, os: 0, brk: 0 }); }
    // the nameplate on the gate post (or door frame)
    const np = { x0: gx0 - 12, x1: gx0 - 2, y0: H - 60, y1: H - 8, z0: zb + 2, z1: zb + 4 };
    if (S.T.cjk && S.T.script !== 'ko') { drawBox(np, { col: [236, 226, 200], a: 0.5, w: 0.6, front: f => sceneText(S, f, 1, 2, 9, 50, S.T.plate, { col: [40, 30, 26], vertical: true }) }); }
    else { const p2 = { x0: gx0 - 34, x1: gx0 - 4, y0: H - 30, y1: H - 12, z0: zb + 2, z1: zb + 3 }; drawBox(p2, { col: S.T.script === 'ko' ? [40, 90, 160] : [236, 236, 230], a: 0.7, w: 0.6, front: f => S.T.script === 'latin' ? latinText(f, 1, 1, 29, 17, S.T.plate, { col: [40, 40, 50], size: 0.7 }) : sceneText(S, f, 1, 1, 29, 17, S.T.plate, { col: S.T.script === 'ko' ? [250, 250, 250] : [40, 40, 50], role: 'bold', even: false, size: 0.7 }) }); }
  });
}

// ---------------------------------------------------------------- what the rules allow
// Upper-floor counts a locale's rulebook permits for a use and (optionally) a
// house type. The grammar and the controls both read this, so a lock can never
// ask for a building the rules do not contain.
function floorsFor(styleKey, use, typeKey) {
  const st = STYLES[styleKey], H = HOUSES[styleKey], out = new Set();
  const add = ups => ups.forEach(([n]) => out.add(n));
  const tk = typeKey && (SHOPS[styleKey].types[typeKey] ? 'shop' : 'house');
  if (use !== 'house' && tk !== 'house') for (const [k, t] of Object.entries(SHOPS[styleKey].types)) if (!typeKey || k === typeKey) add(t.ups || st.ups);
  if (use !== 'shop' && tk !== 'shop') for (const [k, t] of Object.entries(H.types)) if (!typeKey || k === typeKey) add(t.ups || st.ups);
  return [...out].sort((a, b) => a - b);
}
const typeUse = (styleKey, typeKey) => SHOPS[styleKey].types[typeKey] ? 'shop' : HOUSES[styleKey].types[typeKey] ? 'house' : null;
const hasTrade = (styleKey, cls) => STYLES[styleKey].shops.some(([c]) => c === cls);
