// ============================================================================
//  BASTI — style rulebooks
//  A style is not a colour theme. It is a set of constraints every builder must
//  obey: massing, how floors relate, opening proportions and tops, ornament,
//  roof form, signage script, what grows where, and what sits on the street.
// ============================================================================
const CLASSES = ['grocer', 'cafe', 'tea', 'bakery', 'hardware', 'bar', 'flowers', 'books', 'pharmacy', 'bike'];
const CLASS_NAME = { grocer: 'Grocer', cafe: 'Café', tea: 'Tea shop', bakery: 'Bakery', hardware: 'Hardware', bar: 'Bar', flowers: 'Florist', books: 'Bookshop', pharmacy: 'Pharmacy', bike: 'Bike shop' };

const STYLES = {
  // --------------------------------------------------------------- Japan, 1950–80
  showa: {
    name: 'Tokyo — Shōwa-era shitamachi', city: 'Tokyo', area: 'Shōwa-era shitamachi', script: 'ja', groundSign: 'upperBand',
    shops: [['grocer', 2], ['cafe', 1.4], ['tea', 1.5], ['bakery', 1], ['hardware', 1], ['bar', 1.5], ['flowers', 0.8], ['books', 0.6], ['bike', 0.5], ['pharmacy', 0.3]],
    width: [380, 520], ups: [[1, 0.5], [2, 0.35], [0, 0.15]], h0: [255, 290], hf: [240, 275],
    massing: 'stepped',       // upper floors may shrink, shift, set back or cantilever
    walls: [[241, 229, 203], [231, 212, 176], [207, 219, 193], [203, 227, 217], [207, 217, 227], [239, 212, 204], [217, 215, 209], [243, 234, 190]],
    matGround: [['plaster', 3], ['wood', 1.2], ['tile', 1], ['brick', 0.6]], matUpper: [['plaster', 3], ['brick', 0.7], ['siding', 1.2], ['wood', 0.5]],
    ground: 'bays', bayTop: 'flat', door: 'sliding',
    bays: { grocer: [['open', 3], ['display', 1], ['shutter', 1]], cafe: [['display', 3], ['wall', 1]], tea: [['lattice', 2], ['wall', 1], ['display', 1]], bakery: [['display', 3], ['wall', 1]], hardware: [['shutter', 3], ['open', 1]], bar: [['lattice', 2], ['wall', 2], ['display', 1]], flowers: [['open', 2], ['display', 2]], books: [['display', 3], ['open', 1]], bike: [['shutter', 2], ['open', 2]], pharmacy: [['display', 3]] },
    belt: { grocer: [['awning', 3], ['slab', 1], ['pent', 1]], cafe: [['awningScallop', 3], ['awning', 1], ['slab', 1]], tea: [['pent', 4], ['slab', 1]], bakery: [['awningScallop', 2], ['awning', 2], ['pent', 1]], hardware: [['slab', 3], ['awning', 1]], bar: [['pent', 2], ['slab', 2], ['awningScallop', 1]], '*': [['awning', 2], ['slab', 1], ['pent', 1]] },
    win: { kind: 'japanese', w: [0.42, 0.66], wMax: 150, h: [100, 135], cols: [2, 4], rows: [1, 1], top: 'flat', grille: 0.3, shutters: 0.08, shutterKind: 'louvre', box: 0, balconette: 0, surround: false, frame: [[236, 234, 228], [176, 128, 88], [140, 160, 150], [120, 120, 130], [200, 120, 100]] },
    balcony: 0.45, ornament: [], roof: [['flat', 3], ['hip', 3], ['gable', 1.5], ['shed', 1.2]], tile: 'kawara',
    roofCols: [[146, 148, 164], [124, 134, 156], [172, 118, 98], [118, 138, 128], [160, 150, 150]],
    vertical: [['pole', 0.55], ['lamp', 0.2], ['sign', 0.08], ['none', 0.17]],
    utilities: { ac: 0.7, cables: 0.6, pipe: 0.75, dish: 0, meters: 0.7 },
    flora: { tree: [['round', 2], ['pine', 1.2], ['blossom', 1]], treeP: 0.5, shrub: [['round', 3], ['hydrangea', 1.5], ['bamboo', 1]], climber: [['vine', 2], ['ivy', 0.4]], pots: [['styro', 2], ['terracotta', 1], ['glazed', 1.5]], potPlant: [['bush', 2], ['spiky', 1.5], ['tall', 0.8], ['bonsai', 0.6]], windowBox: 0 },
    props: ['nobori', 'vending', 'scooter', 'bicycle', 'crates', 'gas', 'stools', 'potsRow', 'aboard', 'lantern', 'vsign', 'bench', 'small', 'tobacco'],
    ground_: 'asphalt',
  },
  // ------------------------------------------------- Southern China / Straits, 1900–40
  straits: {
    name: 'Singapore — Straits Settlements', city: 'Singapore', area: 'Straits Settlements', script: 'zh', groundSign: 'beam',
    shops: [['tea', 2], ['cafe', 2], ['grocer', 1.5], ['hardware', 1], ['bakery', 1], ['pharmacy', 1], ['books', 0.5], ['bike', 0.5]],
    width: [360, 460], ups: [[1, 0.6], [2, 0.4]], h0: [300, 340], hf: [290, 320],
    massing: 'terrace',       // continuous party-wall facade: every floor the same width and plane
    walls: [[192, 226, 210], [240, 198, 196], [244, 226, 162], [192, 214, 236], [244, 208, 172], [236, 232, 220]],
    matGround: [['plaster', 1]], matUpper: [['plaster', 1]],
    ground: 'arcade',         // five-foot way: shopfront recessed behind columns carrying the upper floors
    bayTop: 'flat', door: 'folding',
    bays: { '*': [['open', 2], ['display', 1], ['lattice', 1]] },
    belt: { '*': [['none', 1]] },
    win: { kind: 'tall', w: [0.3, 0.36], wMax: 88, h: [170, 200], cols: [2, 2], rows: [3, 4], top: [['arch', 1], ['flat', 1]], grille: 0, shutters: 1, shutterKind: 'fullLouvre', box: 0, balconette: 0.2, surround: true, frame: [[240, 240, 232]] },
    balcony: 0, ornament: ['pilasters', 'cornice', 'panels'], roof: [['pediment', 2], ['chineseEave', 1]], tile: 'pantile',
    roofCols: [[176, 108, 90], [150, 150, 150]],
    vertical: [['pole', 0.5], ['lamp', 0.3], ['none', 0.2]],
    utilities: { ac: 0.6, cables: 0.8, pipe: 0.8, dish: 0, meters: 0.6 },
    flora: { tree: [['round', 1], ['palm', 1.5]], treeP: 0.45, shrub: [['round', 2], ['bougainvillea', 1.5]], climber: [['vine', 2], ['bougainvillea', 1]], pots: [['glazed', 2], ['terracotta', 1]], potPlant: [['bush', 2], ['spiky', 1], ['tall', 1]], windowBox: 0 },
    props: ['stools', 'scooter', 'bicycle', 'sacks', 'lantern', 'birdcage', 'potsRow', 'crates', 'couplets', 'small'],
  },
  // ------------------------------------------------------------- Paris, 1860–1910
  paris: {
    name: 'Paris — Haussmann’s boulevards', city: 'Paris', area: 'Haussmann’s boulevards', script: 'latin', groundSign: 'fascia', font: 'serif',
    labels: { grocer: 'ÉPICERIE', cafe: 'CAFÉ', tea: 'SALON DE THÉ', bakery: 'BOULANGERIE', hardware: 'QUINCAILLERIE', bar: 'BAR TABAC', flowers: 'FLEURISTE', books: 'LIBRAIRIE', pharmacy: 'PHARMACIE', bike: 'CYCLES' },
    shops: [['cafe', 2.5], ['bakery', 2], ['books', 1.2], ['flowers', 1.2], ['grocer', 1], ['bar', 1.2], ['pharmacy', 0.8], ['tea', 0.6]],
    width: [900, 1250] /* about 15 m: five to seven window bays */, ups: [[5, 0.7], [4, 0.3]], h0: [380, 420], hf: [270, 290], hfList: [[252, 268], [300, 320], [275, 290], [262, 276], [250, 262]],
    massing: 'terrace',
    walls: [[236, 226, 204], [230, 220, 198], [238, 230, 214]],
    matGround: [['stone', 1]], matUpper: [['stone', 1]],
    ground: [['bays', 1.4], ['devanture', 1]], // stone shop openings in the rez-de-chaussée, or an older painted timber devanture
    bayTop: [['arch', 1], ['segment', 1], ['flat', 0.6]], door: 'glazed',
    fascia: [[44, 84, 70], [118, 40, 50], [40, 52, 90], [44, 42, 46], [150, 110, 60]],
    bays: { '*': [['display', 1]] },
    belt: { cafe: [['awning', 3], ['none', 1]], bar: [['awning', 3], ['none', 1]], '*': [['awning', 1], ['none', 1.5]] },
    win: { kind: 'french', w: [0.5, 0.6], wMax: 100, h: [205, 230], cols: [2, 2], rows: [4, 4], top: 'flat', grille: 0, shutters: 0.15, shutterKind: 'fold', box: 0.15, balconette: 1, surround: true, keystone: true, frame: [[240, 238, 232]] },
    balcony: 0, continuousBalcony: [2, 5], ornament: ['cornice', 'rustication'], roof: [['mansard', 1]], tile: 'zinc',
    roofCols: [[140, 152, 170], [120, 128, 144]],
    vertical: [['parisLamp', 0.6], ['none', 0.4]],
    utilities: { ac: 0, cables: 0, pipe: 0.6, dish: 0, meters: 0 },
    flora: { tree: [['round', 2.5], ['plane', 1.5]], treeP: 0.55, shrub: [['boxwood', 2], ['round', 1]], climber: [['ivy', 0.5]], pots: [['zinc', 1.5], ['terracotta', 1]], potPlant: [['boxball', 2], ['bush', 1], ['tall', 1]], windowBox: 0.6 },
    props: ['bistro', 'aboard', 'bollards', 'bicycle', 'flowerStand', 'bookCart', 'produce', 'bench', 'potsDoor', 'wallLamp', 'streetPlate', 'tabac', 'pharmaCross', 'small'],
  },
  // ------------------------------------------------- Rothenburg ob der Tauber and the half-timbered towns, 1450–1780
  fachwerk: {
    name: 'Rothenburg — Fachwerk old town', city: 'Rothenburg', area: 'Fachwerk old town', script: 'latin', groundSign: 'fascia', font: 'fraktur',
    labels: { grocer: 'Feinkost', cafe: 'Café', tea: 'Teestube', bakery: 'Bäckerei', hardware: 'Eisenwaren', bar: 'Weinstube', flowers: 'Blumen', books: 'Bücher', pharmacy: 'Apotheke', bike: 'Fahrräder' },
    shops: [['bakery', 2], ['bar', 2], ['cafe', 1.5], ['flowers', 1], ['books', 1], ['pharmacy', 1], ['grocer', 1], ['hardware', 0.5]],
    width: [380, 480], ups: [[1, 0.55], [2, 0.45]], h0: [260, 290], hf: [235, 255],
    massing: 'jetty',         // each timber floor oversails the one below
    walls: [[242, 236, 222], [238, 230, 206], [236, 226, 214]],
    timber: [[92, 60, 44], [118, 56, 44], [70, 78, 92], [60, 52, 48]],
    matGround: [['stone', 1], ['plaster', 1.5]], matUpper: [['timber', 1]],
    ground: 'bays', bayTop: [['segment', 2], ['flat', 1]], door: 'panel', doorTop: 'arch',
    bays: { '*': [['display', 3], ['wall', 1]] },
    belt: { '*': [['none', 4], ['awning', 1]] },
    win: { kind: 'casement', w: [0.4, 0.52], wMax: 92, h: [100, 125], cols: [2, 2], rows: [3, 3], top: 'flat', grille: 0, shutters: 0.3, shutterKind: 'panel', box: 0.75, balconette: 0, surround: false, frame: [[240, 238, 232], [236, 232, 220]] },
    balcony: 0, ornament: ['timber', 'quoins'], roof: [['frontGable', 1]], tile: 'beaver',
    roofCols: [[168, 84, 64], [104, 106, 118], [150, 74, 60]],
    vertical: [['wallLantern', 0.5], ['parisLamp', 0.2], ['none', 0.3]],
    utilities: { ac: 0, cables: 0, pipe: 0.8, dish: 0, meters: 0 },
    flora: { tree: [['round', 2], ['lime', 1]], treeP: 0.5, shrub: [['round', 2], ['hydrangea', 1], ['boxwood', 1]], climber: [['ivy', 1], ['rose', 1.5]], pots: [['terracotta', 2], ['barrel', 1.2]], potPlant: [['geranium', 2], ['bush', 1], ['boxball', 1]], windowBox: 0.8 },
    props: ['bench', 'bracketSign', 'bicycle', 'potsDoor', 'barrelPlanter', 'aboard', 'bistro', 'mailbox', 'wallLamp', 'pharmaCross', 'small'],
  },
  // ------------------------------------------------ Italian / Ligurian town house
  med: {
    name: 'Genoa — Ligurian centro storico', city: 'Genoa', area: 'Ligurian centro storico', script: 'latin', groundSign: 'fascia', font: 'roman',
    labels: { grocer: 'ALIMENTARI', cafe: 'CAFFÈ', tea: 'SALA DA TÈ', bakery: 'PANETTERIA', hardware: 'FERRAMENTA', bar: 'OSTERIA', flowers: 'FIORI', books: 'LIBRERIA', pharmacy: 'FARMACIA', bike: 'BICICLETTE' },
    shops: [['grocer', 2], ['bar', 2], ['cafe', 2], ['bakery', 1.5], ['flowers', 1], ['pharmacy', 0.8], ['hardware', 0.6], ['books', 0.5]],
    width: [380, 500], ups: [[2, 0.35], [3, 0.4], [4, 0.25]] /* Ligurian town houses are tall: four to six storeys */, h0: [290, 320], hf: [270, 295], hfDecay: 6,
    massing: 'terrace',
    walls: [[228, 184, 116], [214, 138, 100], [234, 174, 152], [238, 208, 134], [236, 222, 196], [224, 160, 120]],
    shutterCols: [[86, 124, 94], [128, 92, 62], [110, 130, 140], [70, 100, 80]],
    matGround: [['plaster', 2], ['stone', 1]], matUpper: [['plaster', 1]],
    ground: 'bays', bayTop: 'arch', door: 'panel', doorTop: 'arch',
    bays: { grocer: [['open', 2], ['shutter', 1]], '*': [['display', 2], ['shutter', 1], ['open', 1]] },
    belt: { '*': [['awning', 2], ['none', 2], ['awningScallop', 0.5]] },
    win: { kind: 'casement', w: [0.38, 0.48], wMax: 92, h: [130, 160], cols: [2, 2], rows: [3, 3], top: 'flat', grille: 0, shutters: 1, shutterKind: 'louvre', box: 0.3, balconette: 0.35, surround: true, frame: [[236, 232, 220]] },
    balcony: 0, ornament: ['quoins', 'corniceTop'], roof: [['terracotta', 1.5], ['slateHip', 1], ['terrace', 1]], tile: 'coppi', weathering: 0.6,
    roofCols: [[192, 106, 78], [180, 96, 70]],
    vertical: [['wallLantern', 0.4], ['none', 0.6]],
    utilities: { ac: 0.3, cables: 0.4, pipe: 0.7, dish: 0.35, meters: 0.3, laundry: 0.45 },
    flora: { tree: [['cypress', 1.5], ['palm', 1], ['round', 1]], treeP: 0.5, shrub: [['bougainvillea', 2], ['round', 1], ['agave', 1]], climber: [['bougainvillea', 2], ['vine', 1]], pots: [['terracotta', 3]], potPlant: [['lemon', 1.5], ['geranium', 2], ['spiky', 1], ['bush', 1]], windowBox: 0.3 },
    props: ['bistro', 'parasol', 'scooter', 'crates', 'produce', 'potsRow', 'bench', 'aboard', 'wallLamp', 'pharmaCross', 'small'],
  },
  // ---------------------------------------------- Amsterdam / Leiden canal house
  dutch: {
    name: 'Amsterdam — Canal Ring', city: 'Amsterdam', area: 'Canal Ring', script: 'latin', groundSign: 'fascia', font: 'fat',
    labels: { grocer: 'KAAS', cafe: 'KOFFIE', tea: 'THEE', bakery: 'BAKKERIJ', hardware: 'IJZERWAREN', bar: 'CAFÉ', flowers: 'BLOEMEN', books: 'BOEKEN', pharmacy: 'APOTHEEK', bike: 'FIETSEN' },
    shops: [['bar', 2], ['books', 1.5], ['bike', 1.5], ['flowers', 1.5], ['grocer', 1.5], ['bakery', 1], ['cafe', 1.5], ['tea', 0.6]],
    width: [300, 380], ups: [[2, 0.5], [3, 0.5]], h0: [280, 310], hf: [255, 275],
    massing: 'terrace',
    walls: [[150, 74, 58], [124, 62, 52], [168, 98, 74], [110, 70, 62]],
    matGround: [['brick', 1]], matUpper: [['brick', 1]],
    ground: 'bays', bayTop: 'flat', door: 'panel', doorTop: 'fanlight', stoop: true,
    bays: { '*': [['display', 1]] },
    belt: { '*': [['none', 3], ['awning', 1]] },
    win: { kind: 'sash', w: [0.48, 0.58], wMax: 100, h: [150, 180], cols: [2, 2], rows: [3, 3], top: 'flat', grille: 0, shutters: 0, box: 0.15, balconette: 0, surround: false, relieving: true, frame: [[244, 242, 236]] },
    balcony: 0, ornament: ['corniceTop'], roof: [['stepGable', 0.7], ['neckGable', 1.2], ['bellGable', 1], ['corniceGable', 1.2]], tile: 'none',
    roofCols: [[90, 92, 100]],
    vertical: [['parisLamp', 0.5], ['none', 0.5]],
    utilities: { ac: 0, cables: 0, pipe: 0.4, dish: 0, meters: 0 },
    flora: { tree: [['lime', 2], ['round', 1]], treeP: 0.6, shrub: [['hollyhock', 2.5], ['round', 1]], climber: [['ivy', 1], ['rose', 1]], pots: [['terracotta', 1], ['zinc', 1]], potPlant: [['bush', 1], ['geranium', 1], ['boxball', 1]], windowBox: 0.2 },
    props: ['bicycle', 'bicycle', 'bikeRack', 'bench', 'potsDoor', 'flowerStand', 'bookCart', 'bollards', 'aboard', 'wallLamp', 'small'],
  },
};


// Every style speaks one of two scripts. CJK styles use the pseudo-glyph
// generator; Latin styles use the real local word for the trade.
function shopLabel(style, cls) { return style.labels ? style.labels[cls] : null; }

// ------------------------------------------------- Taiwan, 1970–90 (透天厝)
STYLES.taiwan = {
  name: 'Tainan — townhouse streets', city: 'Tainan', area: 'townhouse streets', script: 'zh', groundSign: 'upperBand',
  shops: [['cafe', 2], ['grocer', 2], ['hardware', 1.5], ['bike', 1.5], ['bar', 1.2], ['tea', 1], ['pharmacy', 1], ['bakery', 1], ['books', 0.5]],
  width: [330, 420], ups: [[2, 0.55], [3, 0.45]], h0: [300, 330], hf: [285, 305],
  massing: 'terrace',
  walls: [[214, 176, 156], [204, 202, 198], [232, 222, 202], [196, 210, 214], [222, 196, 170]],
  matGround: [['tile', 1], ['plaster', 1]], matUpper: [['longtile', 3], ['tile', 1]],
  ground: [['arcade', 1], ['bays', 1]], bayTop: 'flat', door: 'sliding',
  bays: { '*': [['shutter', 3], ['open', 2], ['display', 1]] },
  belt: { '*': [['none', 2], ['slab', 1], ['awning', 1]] },
  win: { kind: 'japanese', w: [0.5, 0.7], wMax: 170, h: [110, 140], cols: [2, 3], rows: [1, 1], top: 'flat', grille: 0, cage: 0.85, shutters: 0, box: 0, balconette: 0, surround: false, frame: [[196, 198, 200], [170, 160, 140]] },
  balcony: 0, ornament: [], roof: [['shack', 3], ['flat', 1]], tile: 'kawara',
  roofCols: [[150, 156, 164], [120, 140, 150]],
  vertical: [['pole', 0.6], ['lamp', 0.25], ['none', 0.15]],
  utilities: { ac: 0.9, cables: 0.9, pipe: 0.7, dish: 0, meters: 0.7 },
  flora: { tree: [['round', 2], ['palm', 1]], treeP: 0.35, shrub: [['round', 2], ['bougainvillea', 1]], climber: [['vine', 2]], pots: [['styro', 2], ['glazed', 1], ['basin', 1]], potPlant: [['bush', 2], ['spiky', 1], ['tall', 1]], windowBox: 0 },
  props: ['scooterRow', 'scooter', 'stools', 'potsRow', 'gas', 'crates', 'smallSigns', 'small'],
};
// ------------------------------------------------- Korea, 1980s brick shop-house
STYLES.korea = {
  name: 'Seoul — 1980s brick neighbourhood', city: 'Seoul', area: '1980s brick neighbourhood', script: 'ko', groundSign: 'fascia',
  shops: [['grocer', 2], ['bar', 2], ['pharmacy', 1.2], ['bakery', 1.2], ['hardware', 1], ['flowers', 1], ['books', 1], ['cafe', 1], ['bike', 0.6]],
  width: [420, 520], ups: [[1, 0.55], [2, 0.45]], h0: [280, 300], hf: [260, 280],
  massing: 'terrace',
  walls: [[176, 84, 64], [158, 74, 58], [190, 112, 88], [168, 96, 80]],
  matGround: [['tile', 1], ['plaster', 1]], matUpper: [['brick', 1]],
  ground: 'bays', bayTop: 'flat', door: 'glazed', extStair: 0.75,
  bays: { '*': [['display', 2], ['shutter', 1.5], ['open', 1]] },
  belt: { '*': [['none', 3], ['awning', 1]] },
  win: { kind: 'japanese', w: [0.48, 0.65], wMax: 160, h: [110, 135], cols: [2, 2], rows: [1, 1], top: 'flat', grille: 0.55, shutters: 0, box: 0, balconette: 0, surround: false, frame: [[200, 202, 204], [176, 168, 150]] },
  balcony: 0, ornament: ['corniceTop'], roof: [['jars', 1]], tile: 'kawara',
  roofCols: [[110, 150, 120]],
  vertical: [['pole', 0.5], ['lamp', 0.3], ['none', 0.2]],
  utilities: { ac: 0.7, cables: 0.7, pipe: 0.8, dish: 0, meters: 0.6 },
  flora: { tree: [['ginkgo', 2], ['persimmon', 1.2], ['round', 1]], treeP: 0.5, shrub: [['azalea', 2], ['round', 1]], climber: [['vine', 1], ['ivy', 0.5]], pots: [['basin', 2], ['styro', 1.5], ['glazed', 0.5]], potPlant: [['bush', 2], ['tall', 1], ['spiky', 0.5]], windowBox: 0 },
  props: ['basins', 'onggi', 'stools', 'crates', 'scooter', 'bicycle', 'potsRow', 'small'],
};
// ------------------------------------------------- Persian bazaar front (Kashan / Yazd)
STYLES.persian = {
  name: 'Yazd — Historic City', city: 'Yazd', area: 'Historic City', script: 'fa', groundSign: 'frieze',
  shops: [['tea', 2], ['bakery', 1.5], ['grocer', 1.5], ['books', 1.2], ['flowers', 1.2], ['hardware', 1], ['pharmacy', 0.8], ['cafe', 0.8]], // no bars: alcohol is not sold in Iran
  width: [400, 520], ups: [[0, 0.35], [1, 0.65]], h0: [310, 340], hf: [280, 300],
  massing: 'terrace',
  walls: [[214, 182, 134], [204, 170, 124], [226, 198, 152]],
  matGround: [['persianBrick', 1]], matUpper: [['persianBrick', 1]],
  ground: 'bays', bayTop: 'persian', door: 'studded', doorTop: 'persian',
  bays: { '*': [['display', 2], ['open', 1.5], ['shutter', 0.5]] },
  belt: { '*': [['none', 1]] },
  win: { kind: 'casement', w: [0.36, 0.46], wMax: 90, h: [120, 150], cols: [2, 2], rows: [2, 3], top: 'persian', grille: 0.3, shutters: 0.7, shutterKind: 'panel', box: 0, balconette: 0, surround: false, frame: [[150, 104, 70], [120, 84, 60]] },
  balcony: 0, ornament: ['kashi', 'brickPanels'], roof: [['parapet', 1]], tile: 'kawara',
  roofCols: [[200, 170, 130]],
  vertical: [['wallLantern', 0.4], ['lamp', 0.2], ['none', 0.4]],
  utilities: { ac: 0.2, cables: 0.3, pipe: 0.3, dish: 0.2, meters: 0 },
  flora: { tree: [['pomegranate', 2], ['cypress', 1.5], ['round', 0.5]], treeP: 0.55, shrub: [['rose', 2], ['round', 1]], climber: [['grape', 1.5], ['jasmine', 1]], pots: [['terracotta', 2], ['glazed', 1.5]], potPlant: [['geranium', 2], ['bush', 1], ['spiky', 0.5]], windowBox: 0 },
  props: ['takht', 'carpets', 'copper', 'sacks', 'potsRow', 'bicycle', 'lantern', 'small'],
};
// ------------------------------------------------- Levantine house (Damascus / Beirut)
STYLES.levant = {
  name: 'Damascus — Old City', city: 'Damascus', area: 'Old City', script: 'ar', groundSign: 'fascia',
  shops: [['cafe', 2], ['bakery', 1.5], ['grocer', 1.5], ['bar', 1.2], ['flowers', 1], ['books', 1], ['pharmacy', 1], ['hardware', 1], ['tea', 0.6]],
  width: [380, 480], ups: [[1, 0.55], [2, 0.45]], h0: [300, 330], hf: [285, 305],
  massing: 'terrace',
  walls: [[234, 224, 202], [228, 214, 188], [238, 230, 214]],
  shutterCols: [[70, 120, 140], [86, 124, 94], [110, 90, 70]],
  // a masonry street floor (striped ablaq on the grander ones) under upper storeys of timber and
  // sun-dried brick, plastered and whitewashed (Met Museum, 'The Damascus Room')
  matGround: [['stone', 1], ['ablaq', 0.6]], matUpper: [['plaster', 1]],
  ground: 'bays', bayTop: 'pointed', door: 'studded', doorTop: 'pointed',
  bays: { '*': [['display', 2], ['open', 1.5], ['shutter', 1]] },
  belt: { '*': [['none', 3], ['awning', 1.5]] },
  win: { kind: 'casement', w: [0.36, 0.46], wMax: 92, h: [150, 180], cols: [2, 2], rows: [3, 3], top: 'pointed', grille: 0, shutters: 0.6, shutterKind: 'panel', box: 0, balconette: 0.2, surround: true, frame: [[236, 232, 220], [120, 90, 66]] },
  oriel: 0.75, tripleArch: 0,
  balcony: 0, ornament: ['ablaq', 'corniceTop'], roof: [['terrace', 1.2], ['flat', 1]], tile: 'coppi',
  roofCols: [[190, 98, 72], [176, 90, 66]],
  vertical: [['wallLantern', 0.5], ['none', 0.5]],
  utilities: { ac: 0.4, cables: 0.6, pipe: 0.5, dish: 0.4, meters: 0.3, laundry: 0.3 },
  flora: { tree: [['citrus', 2], ['olive', 1.5], ['cypress', 1], ['palm', 0.8]], treeP: 0.55, shrub: [['bougainvillea', 2], ['round', 1], ['agave', 0.5]], climber: [['jasmine', 2], ['bougainvillea', 1.5], ['grape', 1]], pots: [['tin', 2], ['terracotta', 1.5]], potPlant: [['geranium', 2], ['bush', 1], ['spiky', 1], ['lemon', 1]], windowBox: 0 },
  props: ['stools', 'bistro', 'sacks', 'copper', 'crates', 'potsRow', 'scooter', 'lantern', 'small'],
};
const STYLE_KEYS = Object.keys(STYLES);
// ------------------------------------------------- Lahore: Walled City / Anarkali bazaar
// Thin Mughal-era (Nanakshahi) brick or lime-washed plaster, a concrete chhajja
// sunshade over the shopfront and every window, carved timber jharokhas on
// brackets, roller shutters, painted bilingual boards, water tanks on the roof.
STYLES.lahore = {
  name: 'Lahore — Walled City', city: 'Lahore', area: 'Walled City', script: 'ur', groundSign: 'fascia',
  shops: [['grocer', 2], ['tea', 1.6], ['bakery', 1.5], ['pharmacy', 1.4], ['hardware', 1.2], ['bike', 1], ['books', 0.8], ['flowers', 0.5], ['cafe', 0.6]],
  width: [330, 440], ups: [[1, 0.35], [2, 0.45], [3, 0.2]], h0: [290, 320], hf: [265, 290],
  massing: 'terrace',
  walls: [[226, 214, 190], [206, 222, 206], [198, 214, 226], [236, 226, 196], [230, 206, 186], [214, 200, 186]],
  shutterCols: [[70, 110, 96], [60, 96, 130], [120, 84, 60]],
  matGround: [['plaster', 2], ['tile', 1]], matUpper: [['nanakshahi', 2], ['plaster', 2]],
  ground: 'bays', bayTop: 'flat', door: 'panel',
  bays: { grocer: [['open', 3], ['shutter', 1.5]], pharmacy: [['display', 2], ['shutter', 1]], bakery: [['display', 3], ['open', 1]], '*': [['shutter', 2.5], ['open', 2], ['display', 1]] },
  belt: { '*': [['chhajja', 3], ['awning', 1.2]] },
  win: { kind: 'casement', w: [0.4, 0.55], wMax: 100, h: [140, 175], cols: [2, 2], rows: [2, 3], top: [['flat', 2], ['segment', 1], ['cusped', 1.2]], grille: 0.45, shutters: 0.45, shutterKind: 'panel', box: 0, balconette: 0, surround: false, chhajja: 0.85, frame: [[110, 74, 50], [70, 110, 96], [60, 96, 130], [236, 232, 220]] },
  oriel: 0.55, jharokha: true,
  balcony: 0, ornament: ['corniceTop'], roof: [['tanks', 1]], tile: 'kawara',
  roofCols: [[200, 196, 188]],
  vertical: [['pole', 0.65], ['lamp', 0.15], ['none', 0.2]],
  utilities: { ac: 0.8, cables: 0.95, pipe: 0.6, dish: 0.45, meters: 0.7, laundry: 0.3 }, wireTangle: true,
  flora: { tree: [['ashoka', 2], ['neem', 1.6], ['palm', 0.6]], treeP: 0.45, shrub: [['bougainvillea', 2.5], ['round', 1]], climber: [['bougainvillea', 2], ['jasmine', 1], ['vine', 1.2]], pots: [['terracotta', 2], ['tin', 2], ['basin', 0.6]], potPlant: [['bush', 2], ['tall', 1], ['spiky', 1], ['geranium', 0.6]], windowBox: 0 },
  props: ['produce', 'flowerStand', 'bookCart', 'stools', 'sacks', 'charpai', 'generator', 'crates', 'gas', 'scooter', 'bicycle', 'potsRow', 'small'],
};
STYLE_KEYS.push('lahore');
// ------------------------------------------------- Beirut: the central-hall house, 1860–1930
// Sandstone (ramleh) ashlar, a triple arch (qanatir) lighting the central hall on
// the first floor, tall shuttered openings, a hipped roof of red Marseille tiles.
STYLES.beirut = {
  name: 'Beirut — Gemmayzeh', city: 'Beirut', area: 'Gemmayzeh', script: 'ar', groundSign: 'fascia',
  shops: [['cafe', 2], ['grocer', 1.5], ['bakery', 1.3], ['bar', 1.2], ['flowers', 1], ['books', 1], ['pharmacy', 1], ['hardware', 0.8]],
  width: [440, 540], ups: [[1, 0.55], [2, 0.45]], h0: [320, 350], hf: [330, 360],
  massing: 'terrace',
  walls: [[226, 200, 160], [218, 190, 150], [232, 212, 176]],
  shutterCols: [[70, 110, 80], [60, 100, 110], [86, 124, 94]],
  matGround: [['stone', 1]], matUpper: [['stone', 1]],
  ground: 'bays', bayTop: [['arch', 1.2], ['pointed', 0.6]], door: 'panel', doorTop: 'arch',
  bays: { '*': [['display', 2], ['shutter', 1.2], ['open', 1]] },
  belt: { '*': [['none', 3], ['awning', 1.2]] },
  win: { kind: 'casement', w: [0.34, 0.42], wMax: 92, h: [190, 225], cols: [2, 2], rows: [4, 4], top: [['arch', 1.2], ['pointed', 0.5]], grille: 0, shutters: 0.9, shutterKind: 'louvre', box: 0, balconette: 0.3, surround: true, frame: [[236, 232, 220], [90, 120, 100]] },
  oriel: 0, tripleArch: 0.85,
  balcony: 0, ornament: ['corniceTop'], roof: [['terracotta', 3], ['terrace', 0.5]], tile: 'coppi',
  roofCols: [[196, 92, 64], [184, 84, 60]],
  vertical: [['wallLantern', 0.4], ['lamp', 0.2], ['none', 0.4]],
  utilities: { ac: 0.6, cables: 0.7, pipe: 0.5, dish: 0.3, meters: 0.3, laundry: 0.3 },
  flora: { tree: [['citrus', 1.5], ['palm', 1.5], ['round', 1]], treeP: 0.55, shrub: [['bougainvillea', 2.5], ['round', 1]], climber: [['bougainvillea', 2], ['jasmine', 1.5], ['grape', 0.6]], pots: [['tin', 2], ['terracotta', 1.5]], potPlant: [['geranium', 1.5], ['bush', 1], ['spiky', 1], ['lemon', 1]], windowBox: 0 },
  props: ['bistro', 'stools', 'crates', 'potsRow', 'scooter', 'lantern', 'small'],
};
STYLE_KEYS.push('beirut');
// ------------------------------------------------- Lisbon: Baixa Pombalina and the tiled 19th century
// After the 1755 earthquake the Baixa was rebuilt to one standard: up to four
// storeys over a ground floor of shops, stone (lioz) frames to every opening,
// cantilevered iron balconies on the first and top floors, corner pilasters, and
// a tiled roof with águas-furtadas (dormers). Azulejo-tiled fronts spread from
// the 1840s. Street names are themselves painted tiles.
STYLES.lisbon = {
  uniformMat: true,
  name: 'Lisbon — Baixa & Alfama', city: 'Lisbon', area: 'Baixa & Alfama', script: 'latin', groundSign: 'fascia', font: 'serif',
  labels: { grocer: 'MERCEARIA', cafe: 'PASTELARIA', tea: 'CASA DE CHÁ', bakery: 'PADARIA', hardware: 'DROGARIA', bar: 'TASCA', flowers: 'FLORISTA', books: 'LIVRARIA', pharmacy: 'FARMÁCIA', bike: 'BICICLETAS' },
  shops: [['cafe', 2], ['bakery', 1.5], ['grocer', 1.5], ['bar', 1.5], ['books', 1], ['pharmacy', 1], ['hardware', 1], ['flowers', 0.8], ['tea', 0.4]],
  width: [520, 740], ups: [[3, 0.55], [2, 0.3], [4, 0.15]], h0: [340, 380], hf: [290, 315], hfDecay: 8,
  massing: 'terrace',
  walls: [[228, 190, 120], [226, 172, 160], [238, 234, 224], [238, 216, 150], [196, 210, 222], [206, 132, 100]],
  tileCols: [[224, 232, 242], [204, 226, 208], [238, 226, 184], [184, 202, 230]],
  shutterCols: [[70, 100, 80], [110, 60, 50], [60, 80, 110]],
  matGround: [['stone', 1]], matUpper: [['plaster', 2], ['azulejo', 1]],
  ground: 'bays', bayTop: [['flat', 1.2], ['arch', 1]], door: 'panel', doorTop: 'flat',
  bays: { '*': [['display', 2], ['open', 1]] },
  belt: { '*': [['none', 3], ['awning', 1]] },
  win: { kind: 'sash', w: [0.42, 0.52], wMax: 110, h: [170, 200], cols: [2, 2], rows: [3, 3], top: 'flat', grille: 0, shutters: 0, box: 0, balconette: 0, surround: true, frame: [[240, 238, 232], [120, 70, 56], [60, 86, 70]] },
  sacadaFloors: [1, 'top'], // janelas de sacada: a door and an iron balcony at every bay of these floors
  balcony: 0, ornament: ['corniceTop', 'quoins'], roof: [['mansard', 2], ['terracotta', 1]], tile: 'coppi', mansardTile: 'pantile',
  roofCols: [[190, 104, 76], [176, 96, 70]],
  vertical: [['wallLantern', 0.6], ['none', 0.4]],
  utilities: { ac: 0.35, cables: 0.6, pipe: 0.7, dish: 0.2, meters: 0.3, laundry: 0.6 },
  flora: { tree: [['round', 2], ['palm', 1], ['citrus', 1]], treeP: 0.4, shrub: [['bougainvillea', 2], ['round', 1], ['agave', 0.6]], climber: [['bougainvillea', 2], ['vine', 1]], pots: [['terracotta', 2], ['tin', 1.5]], potPlant: [['geranium', 2], ['spiky', 1], ['bush', 1], ['lemon', 0.6]], windowBox: 0.15 },
  props: ['bistro', 'aboard', 'scooter', 'crates', 'produce', 'potsRow', 'bench', 'wallLamp', 'pharmaCross', 'streetPlate', 'small'],
};
STYLE_KEYS.push('lisbon');
// ------------------------------------------------- Istanbul: the Ottoman timber house, 19th c.
// A masonry street floor, then storeys of painted clapboard on a timber frame
// that oversail the street (çıkma), a cumba (closed bay window) carried on
// angled brackets, tall sash windows, and a hipped tile roof with deep eaves.
// After the great fires, building laws pushed new houses to masonry (kâgir),
// but the cumba stayed.
STYLES.istanbul = {
  uniformMat: true,
  name: 'Istanbul — Kuzguncuk & Balat', city: 'Istanbul', area: 'Kuzguncuk & Balat', script: 'latin', groundSign: 'fascia', font: 'serif',
  labels: { grocer: 'BAKKAL', cafe: 'KAHVEHANE', tea: 'ÇAY OCAĞI', bakery: 'FIRIN', hardware: 'HIRDAVAT', bar: 'MEYHANE', flowers: 'ÇİÇEKÇİ', books: 'SAHAF', pharmacy: 'ECZANE', bike: 'BİSİKLETÇİ' },
  shops: [['grocer', 2], ['tea', 2], ['bakery', 1.5], ['cafe', 1.2], ['hardware', 1], ['pharmacy', 1], ['bar', 0.8], ['books', 0.8], ['flowers', 0.6]],
  width: [480, 620], ups: [[2, 0.55], [1, 0.3], [3, 0.15]], h0: [270, 300], hf: [270, 295],
  massing: 'jetty', jettyRange: [22, 40],
  walls: [[216, 196, 168], [176, 92, 76], [214, 210, 196], [190, 200, 196], [222, 196, 150], [170, 182, 198], [150, 122, 98]],
  shutterCols: [[80, 70, 60], [70, 90, 80], [236, 232, 220]],
  matGround: [['stone', 1.2], ['plaster', 1]], matUpper: [['siding', 1]],
  ground: 'bays', bayTop: [['flat', 2], ['segment', 1]], door: 'panel', doorTop: 'flat',
  bays: { '*': [['display', 2], ['open', 1.5], ['shutter', 1]] },
  belt: { '*': [['none', 2], ['awning', 1.5]] },
  win: { kind: 'sash', w: [0.42, 0.56], wMax: 92, h: [145, 170], cols: [2, 2], rows: [2, 3], top: 'flat', grille: 0.1, shutters: 0.25, shutterKind: 'panel', box: 0, balconette: 0, surround: false, frame: [[240, 238, 230], [230, 222, 200], [90, 70, 56]] },
  oriel: 0.85, cumba: true,
  balcony: 0, ornament: [], roof: [['hip', 1]], tile: 'pantile', wideEaves: true,
  roofCols: [[184, 98, 74], [168, 90, 70]],
  vertical: [['lamp', 0.35], ['pole', 0.25], ['none', 0.4]],
  utilities: { ac: 0.35, cables: 0.6, pipe: 0.6, dish: 0.35, meters: 0.3, laundry: 0.35 },
  flora: { tree: [['plane', 2], ['round', 1.2], ['cypress', 0.8], ['blossom', 0.6]], treeP: 0.5, shrub: [['round', 2], ['rose', 1], ['hydrangea', 0.8]], climber: [['grape', 2], ['vine', 1], ['ivy', 0.8], ['rose', 0.8]], pots: [['tin', 2.5], ['terracotta', 1.5]], potPlant: [['geranium', 2.5], ['bush', 1], ['spiky', 0.6]], windowBox: 0 },
  props: ['stools', 'bistro', 'crates', 'produce', 'sacks', 'potsRow', 'scooter', 'bench', 'aboard', 'streetPlate', 'small'],
};
STYLE_KEYS.push('istanbul');
// ------------------------------------------------- Hanoi: the Old Quarter tube house (nhà ống)
// Plots were taxed on frontage, so houses are three to five metres wide and very
// deep. The street floor is a shop behind folding grilles or roll-up shutters;
// colonial-era fronts have louvred French doors, an iron balcony and a parapet
// with the year; newer ones climb to six storeys with a balcony on every floor.
STYLES.hanoi = {
  uniformMat: true,
  name: 'Hanoi — Old Quarter', city: 'Hanoi', area: 'Old Quarter', script: 'latin', groundSign: 'fascia', font: 'condensed',
  labels: { grocer: 'TẠP HÓA', cafe: 'CÀ PHÊ', tea: 'TRÀ ĐÁ', bakery: 'BÁNH MÌ', hardware: 'KIM KHÍ', bar: 'BIA HƠI', flowers: 'HOA TƯƠI', books: 'NHÀ SÁCH', pharmacy: 'NHÀ THUỐC', bike: 'SỬA XE' },
  shops: [['cafe', 2.5], ['grocer', 2], ['bar', 1.5], ['bike', 1.5], ['hardware', 1.2], ['tea', 1], ['bakery', 1], ['pharmacy', 1], ['flowers', 0.8], ['books', 0.5]],
  width: [300, 420], ups: [[2, 0.5], [3, 0.5]], h0: [320, 350], hf: [290, 310],
  massing: 'terrace',
  walls: [[238, 206, 120], [232, 214, 160], [226, 222, 210], [200, 214, 200], [236, 200, 180], [204, 214, 226]],
  shutterCols: [[70, 120, 90], [60, 100, 120], [150, 110, 60]],
  matGround: [['plaster', 1], ['tile', 0.6]], matUpper: [['plaster', 1]],
  ground: 'bays', bayTop: 'flat', door: 'folding',
  bays: { '*': [['shutter', 2.5], ['open', 2], ['display', 1]] },
  belt: { '*': [['awning', 2], ['none', 1.2], ['slab', 0.6]] },
  win: { kind: 'tall', w: [0.42, 0.56], wMax: 110, h: [180, 215], cols: [2, 2], rows: [3, 3], top: [['flat', 2], ['arch', 1]], grille: 0, shutters: 0.85, shutterKind: 'fullLouvre', box: 0, balconette: 0.3, surround: false, frame: [[236, 232, 220], [120, 150, 130]] },
  continuousBalcony: [1],
  balcony: 0, ornament: ['corniceTop'], roof: [['pediment', 1.5], ['terrace', 1], ['shack', 0.8]], tile: 'pantile',
  roofCols: [[176, 108, 90], [150, 120, 100]],
  vertical: [['pole', 0.75], ['none', 0.25]],
  utilities: { ac: 0.85, cables: 0.95, pipe: 0.6, dish: 0.25, meters: 0.7, laundry: 0.35 }, wireTangle: true,
  flora: { tree: [['round', 2.5], ['palm', 0.6]], treeP: 0.45, shrub: [['bougainvillea', 2], ['round', 1]], climber: [['bougainvillea', 2.5], ['vine', 1.2]], pots: [['styro', 2.5], ['basin', 1], ['terracotta', 1], ['glazed', 0.6]], potPlant: [['bush', 2], ['spiky', 1], ['tall', 1]], windowBox: 0 },
  props: ['stools', 'scooterRow', 'scooter', 'crates', 'produce', 'gas', 'potsRow', 'bicycle', 'streetPlate', 'small'],
};
STYLE_KEYS.push('hanoi');
// ------------------------------------------------- New Orleans: the French Quarter townhouse
// Two to four storeys of stuccoed brick built to the property line, arched
// openings on the street floor, tall French doors with louvred shutters above,
// and either a wrought-iron balcony or, after the 1850s, a cast-iron gallery on
// posts over the sidewalk. Creole cottages sit low at the banquette under a
// steep side-gabled roof with dormers. Street names are tiles set in the wall.
STYLES.nola = {
  uniformMat: true,
  name: 'New Orleans — French Quarter', city: 'New Orleans', area: 'French Quarter', script: 'latin', groundSign: 'fascia', font: 'serif',
  labels: { grocer: 'GROCERY', cafe: 'CAFÉ', tea: 'TEA ROOM', bakery: 'BAKERY', hardware: 'HARDWARE', bar: 'BAR', flowers: 'FLORIST', books: 'BOOKS', pharmacy: 'PHARMACY', bike: 'BICYCLES' },
  shops: [['bar', 2.5], ['cafe', 2], ['grocer', 1.5], ['bakery', 1], ['books', 1], ['pharmacy', 0.8], ['flowers', 0.6], ['hardware', 0.5]],
  width: [520, 700], ups: [[1, 0.45], [2, 0.4], [3, 0.15]], h0: [340, 390], hf: [320, 355], hfDecay: 10,
  massing: 'terrace',
  walls: [[232, 206, 168], [214, 168, 150], [226, 222, 206], [196, 210, 190], [236, 214, 150], [176, 104, 84]],
  shutterCols: [[46, 78, 58], [40, 40, 44], [70, 96, 110], [120, 50, 44]],
  matGround: [['plaster', 2], ['brick', 1]], matUpper: [['plaster', 2], ['brick', 1]],
  ground: 'bays', bayTop: [['arch', 1.3], ['flat', 1]], door: 'panel', doorTop: 'fanlight',
  bays: { '*': [['display', 2], ['open', 0.6]] },
  belt: { '*': [['none', 1]] },
  win: { kind: 'tall', w: [0.4, 0.5], wMax: 100, h: [220, 260], cols: [2, 2], rows: [4, 4], top: 'flat', grille: 0, shutters: 1, shutterKind: 'fullLouvre', box: 0, balconette: 0, surround: false, frame: [[240, 238, 232]] },
  gallery: [['gallery', 1], ['balcony', 1.2], ['none', 0.4]], // cast-iron gallery on posts, wrought-iron balcony, or neither
  balcony: 0, ornament: ['corniceTop'], roof: [['hip', 1.2], ['sideGable', 1], ['flat', 0.6]], tile: 'slate', dormers: 0.6,
  roofCols: [[96, 100, 112], [110, 104, 106], [150, 80, 64]],
  vertical: [['wallLantern', 0.6], ['lamp', 0.15], ['none', 0.25]],
  utilities: { ac: 0.5, cables: 0.5, pipe: 0.6, dish: 0.1, meters: 0.3 },
  flora: { tree: [['round', 2], ['palm', 1.5]], treeP: 0.45, shrub: [['round', 2], ['agave', 0.6], ['hydrangea', 0.8]], climber: [['vine', 2], ['bougainvillea', 1], ['ivy', 0.8], ['jasmine', 0.8]], pots: [['terracotta', 2], ['glazed', 1]], potPlant: [['bush', 2], ['tall', 1.2], ['spiky', 0.8]], windowBox: 0 },
  props: ['bistro', 'aboard', 'bench', 'bicycle', 'potsRow', 'potsDoor', 'crates', 'wallLamp', 'streetPlate', 'small'],
};
STYLE_KEYS.push('nola');
