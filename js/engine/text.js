// ============================================================================
//  BASTI — real lettering
//  A style's origin fixes its script, language and typefaces. Shop signs use
//  the local word for the trade and a local naming pattern (surname + trade in
//  Japan, "X記" names in the Straits, Persian/Arabic "trade + name" order).
//  Fonts come from Google Fonts with system fallbacks per script.
// ============================================================================
const SCRIPTS = {
  ja: { cjk: true, fonts: { sign: '"Zen Antique", "Shippori Mincho", "Hiragino Mincho ProN", "Yu Mincho", serif', bold: '"Zen Antique", "Hiragino Mincho ProN", serif' } },
  zh: { cjk: true, fonts: { sign: '"Noto Serif TC", "Songti TC", "PMingLiU", serif', bold: '"Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif' } },
  ko: { cjk: true, fonts: { sign: '"Black Han Sans", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif', bold: '"Black Han Sans", "Malgun Gothic", sans-serif' } },
  fa: { rtl: true, fonts: { sign: '"Lalezar", "Vazirmatn", Tahoma, sans-serif', bold: '"Lalezar", Tahoma, sans-serif', plaque: '"Noto Nastaliq Urdu", "Lalezar", serif' } },
  ar: { rtl: true, fonts: { sign: '"Aref Ruqaa", "Amiri", "Geeza Pro", serif', bold: '"Reem Kufi", "Geeza Pro", sans-serif', plaque: '"Amiri", "Geeza Pro", serif' } },
  ur: { rtl: true, fonts: { sign: '"Noto Nastaliq Urdu", "Jameel Noori Nastaleeq", serif', bold: '"Noto Naskh Arabic", "Noto Nastaliq Urdu", serif', plaque: '"Noto Nastaliq Urdu", serif', latin: '"Anton", "Impact", "Arial Narrow", sans-serif' } },
  latin: { fonts: {} },
};
const ZW = '‌'; // zero-width non-joiner for Persian compounds

const LOCALE = {
  showa: {
    script: 'ja',
    labels: { grocer: '青果', cafe: '喫茶', tea: '茶舗', bakery: 'ベーカリー', hardware: '金物店', bar: '居酒屋', flowers: '生花店', books: '書店', pharmacy: '薬局', bike: '自転車店' },
    surnames: ['山田', '田中', '鈴木', '佐藤', '高橋', '松本', '中村', '小林', '吉田', '加藤'],
    kana: ['ポプラ', 'ひまわり', 'ルナ', 'ミモザ', 'ロマン', 'さくら', 'たぬき', 'ふくろう'],
    sign: (c, R, L) => ({ cafe: '喫茶' + R.pick(L.kana.slice(0, 5)), bakery: R.pick(L.kana.slice(0, 5)) + 'ベーカリー', bar: '居酒屋' + R.pick(L.kana.slice(5)) }[c] || R.pick(L.surnames) + L.labels[c]),
    nobori: { cafe: ['コーヒー', '営業中'], tea: ['新茶', '抹茶'], bar: ['やきとり', '生ビール'], bakery: ['焼きたて', 'パン'], grocer: ['特売', '野菜'], books: ['古本'], flowers: ['花'], '*': ['営業中', '氷'] },
    lantern: { bar: ['酒', 'おでん'], tea: ['茶'], cafe: ['珈琲'], '*': ['祭'] },
    small: ['たばこ', '営業中'],
  },
  straits: {
    script: 'zh',
    labels: { grocer: '雜貨', cafe: '咖啡店', tea: '茶莊', bakery: '餅家', hardware: '五金', bar: '酒家', flowers: '花店', books: '書局', pharmacy: '藥行', bike: '單車行' },
    names: ['興記', '福記', '和興', '源發', '南興', '協和', '瑞香', '永安', '南洋'],
    sign: (c, R, L) => R.pick(L.names) + L.labels[c],
    couplets: [['生意興隆通四海', '財源茂盛達三江'], ['生意興隆', '財源廣進']],
    lantern: { '*': ['林', '陳', '黃', '李', '福'] },
    small: ['招牌'],
  },
  taiwan: {
    script: 'zh',
    labels: { grocer: '雜貨店', cafe: '早餐店', tea: '茶行', bakery: '麵包店', hardware: '五金行', bar: '熱炒', flowers: '花店', books: '書局', pharmacy: '藥局', bike: '機車行' },
    names: ['金順', '新興', '大同', '永福', '東昇', '福隆', '三和', '正大'],
    sign: (c, R, L) => R.pick(L.names) + L.labels[c],
    lantern: { '*': ['福'] },
    small: ['冷氣', '檳榔', '彩券', '修理', '停車'],
  },
  korea: {
    script: 'ko',
    labels: { grocer: '슈퍼', cafe: '다방', tea: '찻집', bakery: '제과', hardware: '철물', bar: '호프', flowers: '꽃집', books: '서점', pharmacy: '약국', bike: '자전거' },
    names: ['행복', '우리', '한빛', '대성', '미소', '해뜰', '동네', '새봄'],
    sign: (c, R, L) => R.pick(L.names) + L.labels[c],
    small: ['영업중', '배달'],
  },
  persian: {
    script: 'fa', digits: '۰۱۲۳۴۵۶۷۸۹',
    labels: { grocer: 'بقالی', cafe: 'کافه', tea: 'چایخانه', bakery: 'نانوایی', hardware: 'ابزارفروشی', bar: 'کبابی', flowers: 'گل' + ZW + 'فروشی', books: 'کتاب' + ZW + 'فروشی', pharmacy: 'داروخانه', bike: 'دوچرخه' + ZW + 'سازی' },
    names: ['امید', 'بهار', 'نور', 'یاس', 'آفتاب', 'سپید'],
    sign: (c, R, L) => c === 'bakery' ? 'نانوایی سنگک' : c === 'tea' ? 'چایخانه سنتی' : L.labels[c] + ' ' + R.pick(L.names),
    small: ['باز است'],
  },
  lahore: {
    // Urdu in nastaliq over the English name in painted block capitals: the
    // trade word is usually English in Urdu letters (میڈیکل اسٹور, بک ڈپو)
    script: 'ur', digits: '۰۱۲۳۴۵۶۷۸۹',
    labels: { grocer: 'جنرل اسٹور', cafe: 'کیفے', tea: 'چائے خانہ', bakery: 'بیکرز', hardware: 'ہارڈویئر اسٹور', bar: 'تکہ ہاؤس', flowers: 'فلاور شاپ', books: 'بک ڈپو', pharmacy: 'میڈیکل اسٹور', bike: 'سائیکل ورکس' },
    en: { grocer: 'GENERAL STORE', cafe: 'CAFE', tea: 'TEA HOUSE', bakery: 'BAKERS', hardware: 'HARDWARE STORE', bar: 'TIKKA HOUSE', flowers: 'FLOWER SHOP', books: 'BOOK DEPOT', pharmacy: 'MEDICAL STORE', bike: 'CYCLE WORKS' },
    names: ['مدینہ', 'الفلاح', 'اقبال', 'رحمان', 'شاہین', 'نیو لاہور', 'بسم اللہ', 'پاک'],
    namesEn: ['MADINA', 'AL-FALAH', 'IQBAL', 'REHMAN', 'SHAHEEN', 'NEW LAHORE', 'BISMILLAH', 'PAK'],
    sign: (c, R, L) => { const i = R.int(0, L.names.length - 1); L._i = i; return L.names[i] + ' ' + L.labels[c]; },
    signEn: (c, L) => L.namesEn[L._i] + ' ' + L.en[c],
    phone: R => '03' + R.pick(['00', '01', '21', '33', '45']) + '-' + R.int(1000000, 9999999),
    small: ['خوش آمدید'],
  },
  beirut: {
    script: 'ar', digits: '٠١٢٣٤٥٦٧٨٩',
    labels: { grocer: 'دكان', cafe: 'مقهى', tea: 'شاي', bakery: 'فرن', hardware: 'خردوات', bar: 'بار', flowers: 'زهور', books: 'مكتبة', pharmacy: 'صيدلية', bike: 'دراجات' },
    names: ['الأرز', 'الجميزة', 'الحمرا', 'فيروز', 'النجمة', 'السلام'],
    sign: (c, R, L) => L.labels[c] + ' ' + (c === 'pharmacy' ? 'الشفاء' : R.pick(L.names)),
    small: ['أهلاً وسهلاً'],
  },
  levant: {
    script: 'ar', digits: '٠١٢٣٤٥٦٧٨٩',
    labels: { grocer: 'بقالية', cafe: 'مقهى', tea: 'دار الشاي', bakery: 'فرن', hardware: 'خردوات', bar: 'مطعم', flowers: 'زهور', books: 'مكتبة', pharmacy: 'صيدلية', bike: 'دراجات' },
    names: ['الأمل', 'النور', 'الياسمين', 'الشام', 'السلام'],
    sign: (c, R, L) => L.labels[c] + ' ' + (c === 'pharmacy' ? 'الشفاء' : R.pick(L.names)),
    small: ['أهلاً وسهلاً'],
  },
};

// every piece of text a scene will need is chosen at generate time
const HALLS = { '陳': '穎川', '林': '西河', '黃': '江夏', '李': '隴西', '王': '太原' }; // ancestral hall names over Straits doors
function makeTexts(styleKey, cls, R, use = 'shop') {
  const st = STYLES[styleKey], L = LOCALE[styleKey];
  if (use === 'house') return houseTexts(styleKey, R);
  if (!L) { // Latin styles: the trade word in the local language
    const w = st.labels[cls];
    // Hanoi colonial fronts carry the year of building in the parapet
    return { script: 'latin', sign: w, label: w, short: w, mark: w[0], fonts: { sign: FONTS[st.font] }, plaque: styleKey === 'hanoi' ? String(R.int(1905, 1942)) : w,
      phone: styleKey === 'hanoi' ? 'ĐT: 09' + R.int(10, 98) + ' ' + R.int(100, 999) + ' ' + R.int(100, 999) : null };
  }
  const sc = SCRIPTS[L.script], sign = L.sign(cls, R, L), label = L.labels[cls];
  const pickC = tbl => tbl ? R.pick(tbl[cls] || tbl['*'] || [label]) : label;
  const chars = [...label.replace(/\s/g, '')];
  return {
    script: L.script, rtl: !!sc.rtl, cjk: !!sc.cjk, fonts: sc.fonts, digits: L.digits,
    sign, label, short: label,
    mark: sc.cjk ? chars[0] : label,
    noren: sc.cjk ? chars.slice(0, 4).join('') : label,
    plaque: L.names ? R.pick(L.names) : sign,
    lantern: pickC(L.lantern),
    nobori: L.nobori ? [pickC(L.nobori), pickC(L.nobori)] : [label],
    couplet: L.couplets ? R.pick(L.couplets) : null,
    small: L.small ? R.pick(L.small) : label,
    en: L.signEn ? L.signEn(cls, L) : null, phone: L.phone ? L.phone(R) : null,
  };
}
function localDigits(S, n) { const s = String(n); return S.T.digits ? [...s].map(d => S.T.digits[+d]).join('') : s; }

// draw text on a face rectangle in perspective (affine map of the board)
// o: { font: css family, weight, col, size (0..1 of box height), vertical, even (one cell per character), rtl, shadow, fill, stretch }
function scriptText(face, s0, t0, s1, t1, text, o = {}) {
  if (!FLAGS.ink || !text) return;
  const TL = face.sp(s0, t1), TR = face.sp(s1, t1), BL = face.sp(s0, t0);
  const bw = s1 - s0, bh = t1 - t0;
  const ax = (TR[0] - TL[0]) / bw, ay = (TR[1] - TL[1]) / bw, cx = (BL[0] - TL[0]) / bh, cy = (BL[1] - TL[1]) / bh;
  C.save(); C.setTransform(ax * PXS, ay * PXS, cx * PXS, cy * PXS, TL[0] * PXS, TL[1] * PXS);
  C.globalCompositeOperation = 'source-over';
  C.textBaseline = 'middle'; C.textAlign = 'center';
  const fam = o.font || FONTS.serif, wt = o.weight || 400, col = o.col || COL.ink;
  const put = (t, x, y, size, sx = 1) => {
    C.font = `${wt} ${size}px ${fam}`;
    C.save(); C.translate(x, y); C.scale(sx, 1);
    if (o.shadow) { C.fillStyle = rgba(o.shadow, 0.5); C.fillText(t, size * 0.04, size * 0.05); }
    C.fillStyle = rgba(col, 0.92); C.fillText(t, 0, 0);
    C.fillStyle = rgba(col, 0.22); C.fillText(t, size * 0.015 * RR.gauss(), size * 0.015 * RR.gauss());
    C.restore();
  };
  const chars = [...text].filter(ch => ch !== ' ');
  if (o.vertical) {
    const n = chars.length, cell = bh / n, size = Math.min(bw * 0.82, cell * 0.86) * (o.size ? o.size / 0.66 : 1);
    chars.forEach((ch, i) => put(ch, bw / 2, (i + 0.5) * cell, size));
  } else if (o.even) {
    const n = chars.length, cell = bw / n, size = Math.min(bh * (o.size ?? 0.72), cell * 0.88);
    chars.forEach((ch, i) => put(ch, (i + 0.5) * cell, bh / 2, size));
  } else {
    C.direction = 'ltr'; // bidi still lays Arabic/Persian runs right-to-left; ltr keeps 'center' stable
    const size = bh * (o.size ?? 0.66);
    C.font = `${wt} ${size}px ${fam}`;
    const tw = C.measureText(text).width, room = bw * (o.fill ?? 0.9);
    let sx = 1; if (tw > room) sx = room / tw; else if (o.stretch && tw < room * 0.7) sx = Math.min(1.25, room * 0.75 / tw);
    put(text, bw / 2, bh / 2 + bh * (o.dy ?? 0.04), size, sx);
  }
  C.restore();
}
function latinText(face, s0, t0, s1, t1, text, o = {}) { scriptText(face, s0, t0, s1, t1, text, { ...o, font: FONTS[o.font || 'serif'] || o.font }); }
// the scene's own text, in its own script, sized for the box
function sceneText(S, face, s0, t0, s1, t1, text, o = {}) {
  const T = S.T;
  if (T.script === 'latin') return latinText(face, s0, t0, s1, t1, text, { font: S.st.font, ...o });
  const fam = T.fonts[o.role || 'sign'] || T.fonts.sign;
  const asp = (s1 - s0) / (t1 - t0);
  if (T.cjk) return scriptText(face, s0, t0, s1, t1, text, { font: fam, weight: T.script === 'zh' ? 900 : 400, even: !o.vertical, ...o });
  return scriptText(face, s0, t0, s1, t1, text, { font: fam, rtl: true, size: o.size ?? (asp > 3 ? 0.62 : 0.5), ...o });
}
// all strings a style might draw, for font preloading
function styleStrings(styleKey) {
  const L = LOCALE[styleKey]; if (!L) return Object.values(STYLES[styleKey].labels || {}).join('') + ' 0123456789 ĐT: Số PHỐ HÀNG BẠC GAI MÃ MÂY ĐÀO Nº No: ÇEŞME FIRIN MEKTEP BOSTAN SK. RUA PRATA RUE ROYALE';
  const parts = [];
  const walk = v => { if (typeof v === 'string') parts.push(v); else if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === 'object') Object.values(v).forEach(walk); };
  walk(L.labels); walk(L.names); walk(L.en); walk(L.namesEn); walk(L.surnames); walk(L.kana); walk(L.nobori); walk(L.lantern); walk(L.couplets); walk(L.small);
  if (L.digits) parts.push(L.digits);
  parts.push('نانوایی سنگک چایخانه سنتی الشفاء');
  if (styleKey === 'lahore') parts.push('مکان نمبر ماشاءاللہ 0123456789-');
  return parts.join('');
}
function styleFonts(styleKey) {
  const L = LOCALE[styleKey];
  if (!L) return [FONTS[STYLES[styleKey].font]];
  return Object.values(SCRIPTS[L.script].fonts);
}

// a home has no sign: a nameplate, a house number, an inscription
function houseTexts(styleKey, R) {
  const L = LOCALE[styleKey], num = R.int(2, 98);
  if (!L) {
    const st = STYLES[styleKey];
    return { script: 'latin', sign: String(num), label: '', plate: { paris: String(num), fachwerk: 'Nr. ' + num, med: 'N. ' + num, dutch: String(num), lisbon: 'Nº ' + num, istanbul: 'No: ' + num, hanoi: 'Số ' + num, nola: String(num * 10 + 1000) }[styleKey] || String(num), lintel: 'ANNO ' + R.int(1560, 1760), fonts: { sign: FONTS[st.font] }, plaque: String(num) };
  }
  const sc = SCRIPTS[L.script], dig = n => L.digits ? [...String(n)].map(d => L.digits[+d]).join('') : String(n);
  const T = { script: L.script, rtl: !!sc.rtl, cjk: !!sc.cjk, fonts: sc.fonts, digits: L.digits, label: '', couplet: null, small: '', nobori: [''], noren: '', mark: '' };
  if (styleKey === 'showa') { T.plate = R.pick(L.surnames); T.lantern = '祭'; }
  else if (styleKey === 'straits') { const sn = R.pick(Object.keys(HALLS)); T.plate = HALLS[sn] + '堂'; T.lantern = sn; T.couplet = ['天增歲月人增壽', '春滿乾坤福滿門']; T.plaque = HALLS[sn]; } // a household spring couplet, not a shop's
  else if (styleKey === 'taiwan') { T.plate = num + '號'; T.lantern = '福'; }
  else if (styleKey === 'korea') { T.plate = R.pick(L.names) + '로 ' + num; }
  else if (styleKey === 'lahore') { T.plate = 'مکان نمبر ' + dig(num); T.blessing = 'ماشاءاللہ'; }
  else T.plate = dig(num);
  T.sign = T.plate; T.mark = [...T.plate][0];
  return T;
}
