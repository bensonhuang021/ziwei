// ══════════════════════════════════════════════
//  紫微斗數核心算法
// ══════════════════════════════════════════════

const ZW = (() => {

  const STEMS   = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  const BRANCHES= ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  const ZODIAC  = ['鼠','牛','虎','兔','龍','蛇','馬','羊','猴','雞','狗','豬'];

  // 十二宮名（從命宮起逆時針排）
  const PALACE_NAMES = ['命宮','兄弟','夫妻','子女','財帛','疾厄','遷移','奴僕','官祿','田宅','福德','父母'];

  // 五行局
  const JU_NAMES = [null, null, '水二局', '木三局', '金四局', '土五局', '火六局'];

  // ── 命宮納音 → 五行局 ──
  // 以命宮天干地支之納音五行決定五行局
  // key: 天干index*12 + 地支index (偶組合)
  const NAYIN_JU = (() => {
    // 六十甲子納音五行 (0=金,1=木,2=水,3=火,4=土) → 對應局數(4,3,2,6,5)
    const nayin60 = [
      0,0,3,3,4,4,1,1,2,2, // 甲子~癸酉 (前10)
      3,3,2,2,0,0,4,4,1,1, // 甲戌~癸未 (11-20)
      2,2,3,3,1,1,4,4,0,0, // 甲申~癸巳 (21-30)
      0,0,3,3,2,2,1,1,4,4, // 甲午~癸丑 (31-40) 修正
      3,3,4,4,2,2,0,0,1,1, // 甲寅~癸亥 (41-50) 修正
      2,2,1,1,3,3,0,0,4,4, // 甲子再起... 但60甲子只有60個
    ];
    // 納音五行對應局數
    const ny2ju = [4, 3, 2, 6, 5]; // 金4, 木3, 水2, 火6, 土5

    // 完整六十甲子納音 (index 0-59 對應甲子~癸亥)
    const full60 = [
      0,0, 3,3, 4,4, 1,1, 2,2, // 甲子乙丑=海中金0, 丙寅丁卯=爐中火3, 戊辰己巳=大林木4...
      // 重新正確定義
    ];
    // 以下是正確的六十甲子納音 (0-59)
    // 金=0,木=1,水=2,火=3,土=4
    const correct60 = [
      0,0,3,3,1,1,4,4,2,2, // 甲子乙丑海中金, 丙寅丁卯爐中火, 戊辰己巳大林木, 庚午辛未路旁土, 壬申癸酉劍鋒金
      3,3,2,2,0,0,4,4,1,1, // 甲戌乙亥山頭火, 丙子丁丑澗下水, 戊寅己卯城頭土, 庚辰辛巳白蠟金, 壬午癸未楊柳木
      2,2,0,0,4,4,1,1,3,3, // 甲申乙酉泉中水, 丙戌丁亥屋上土... wait
    ];

    return { ny2ju };
  })();

  // 正確的納音五行對局數對應表 (60甲子 index → 局數)
  // 參考傳統斗數文獻
  const GANZHI_JU = (() => {
    // 六十甲子納音 → 局數
    // (每兩個天干地支組合共享一個納音)
    // 格式: [甲子~癸亥] 每項對應該組合所屬的局數
    const table = [
      // 甲子(0) 乙丑(1) = 海中金 → 金四局(4)
      4,4,
      // 丙寅(2) 丁卯(3) = 爐中火 → 火六局(6)
      6,6,
      // 戊辰(4) 己巳(5) = 大林木 → 木三局(3)
      3,3,
      // 庚午(6) 辛未(7) = 路旁土 → 土五局(5)
      5,5,
      // 壬申(8) 癸酉(9) = 劍鋒金 → 金四局(4)
      4,4,
      // 甲戌(10) 乙亥(11) = 山頭火 → 火六局(6)
      6,6,
      // 丙子(12) 丁丑(13) = 澗下水 → 水二局(2)
      2,2,
      // 戊寅(14) 己卯(15) = 城頭土 → 土五局(5)
      5,5,
      // 庚辰(16) 辛巳(17) = 白蠟金 → 金四局(4)
      4,4,
      // 壬午(18) 癸未(19) = 楊柳木 → 木三局(3)
      3,3,
      // 甲申(20) 乙酉(21) = 泉中水 → 水二局(2)
      2,2,
      // 丙戌(22) 丁亥(23) = 屋上土 → 土五局(5)
      5,5,
      // 戊子(24) 己丑(25) = 霹靂火 → 火六局(6)
      6,6,
      // 庚寅(26) 辛卯(27) = 松柏木 → 木三局(3)
      3,3,
      // 壬辰(28) 癸巳(29) = 長流水 → 水二局(2)
      2,2,
      // 甲午(30) 乙未(31) = 沙中金 → 金四局(4)
      4,4,
      // 丙申(32) 丁酉(33) = 山下火 → 火六局(6)
      6,6,
      // 戊戌(34) 己亥(35) = 平地木 → 木三局(3)
      3,3,
      // 庚子(36) 辛丑(37) = 壁上土 → 土五局(5)
      5,5,
      // 壬寅(38) 癸卯(39) = 金箔金 → 金四局(4)
      4,4,
      // 甲辰(40) 乙巳(41) = 覆燈火 → 火六局(6)
      6,6,
      // 丙午(42) 丁未(43) = 天河水 → 水二局(2)
      2,2,
      // 戊申(44) 己酉(45) = 大驛土 → 土五局(5)
      5,5,
      // 庚戌(46) 辛亥(47) = 釵釧金 → 金四局(4)
      4,4,
      // 壬子(48) 癸丑(49) = 桑柘木 → 木三局(3)
      3,3,
      // 甲寅(50) 乙卯(51) = 大溪水 → 水二局(2)
      2,2,
      // 丙辰(52) 丁巳(53) = 沙中土 → 土五局(5)
      5,5,
      // 戊午(54) 己未(55) = 天上火 → 火六局(6)
      6,6,
      // 庚申(56) 辛酉(57) = 石榴木 → 木三局(3)
      3,3,
      // 壬戌(58) 癸亥(59) = 大海水 → 水二局(2)
      2,2,
    ];
    return table;
  })();

  // ── 天干地支 工具函數 ──
  function getStemBranch(year) {
    // 以甲子年(4年)為基準
    const idx = (year - 4) % 60;
    const stem   = STEMS[idx % 10];
    const branch = BRANCHES[idx % 12];
    return { stem, branch, stemIdx: idx % 10, branchIdx: idx % 12, idx };
  }

  // ── 命宮地支計算 ──
  // 從寅月起，順數月份，再逆數時辰
  // 命宮 = (寅(2) + 月份 - 1 - 時辰 + 24) % 12
  function getMingGong(month, hour) {
    return ((2 + month - 1 - hour) % 12 + 12) % 12;
  }

  // ── 身宮地支計算 ──
  function getShenGong(month, hour) {
    return ((2 + hour - 1 - month) % 12 + 12) % 12;
    // 等同於 (14 - month - hour + 24) % 12
    // 身宮 = 寅 + 時辰 - 月份 + 1
  }

  // ── 命宮天干 (五虎遁年起寅) ──
  // 年干決定寅宮天干，後續宮位依序遞增
  function getPalaceStem(yearStemIdx, branchIdx) {
    // 寅宮(2)的天干起始
    const yinStart = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0]; // 甲己→丙, 乙庚→戊, 丙辛→庚, 丁壬→壬, 戊癸→甲
    const start = yinStart[yearStemIdx];
    // 從寅(2)到目標地支的距離
    const dist = (branchIdx - 2 + 12) % 12;
    return (start + dist) % 10;
  }

  // ── 五行局 ──
  function getWuXingJu(mingStemIdx, mingBranchIdx) {
    // 命宮天干地支組合的六十甲子index
    const gz60 = mingStemIdx * 6 + Math.floor(mingBranchIdx / 2);
    // 根據天干地支推算60甲子index
    // 正確計算: 天干index + 地支index → 甲子序號
    // 甲子=0, 乙丑=1, 丙寅=2...
    // 但需要保證天干地支奇偶一致
    const gzIdx = (mingStemIdx % 2 === mingBranchIdx % 2)
      ? mingStemIdx * 6 + Math.floor(mingBranchIdx / 2)  // 近似
      : 0;

    // 更準確的方法: 直接用天干地支計算納音
    // 60甲子index = (stemIdx * 12 + branchIdx 的對應)
    // 因為甲(0)+子(0)=甲子=0, 乙(1)+丑(1)=乙丑=1...
    // 實際index: (stemIdx - branchIdx%2*stemIdx...) 複雜
    // 簡化: 直接查表
    const idx60 = get60Index(mingStemIdx, mingBranchIdx);
    return GANZHI_JU[idx60] || 3; // 預設木三局
  }

  function get60Index(stemIdx, branchIdx) {
    // 驗證奇偶性（天干偶數配地支偶數）
    if (stemIdx % 2 !== branchIdx % 2) {
      // 不合法組合，調整
      branchIdx = (branchIdx + 1) % 12;
    }
    // 60甲子中：甲子(0,0)=0, 乙丑(1,1)=1, 丙寅(2,2)=2...
    // 公式: idx = stemIdx + Math.floor(branchIdx/2) * 10... 不對
    // 正確: 找到對應index使得 idx%10==stemIdx && idx%12==branchIdx
    for (let i = 0; i < 60; i++) {
      if (i % 10 === stemIdx && i % 12 === branchIdx) return i;
    }
    return 0;
  }

  // ── 紫微星位置 ──
  // 五行局n, 農曆生日d → 紫微所在地支index(0-11)
  function getZiweiPos(ju, day) {
    const n = ju;
    const d = day;
    const q = Math.floor(d / n);
    const r = d % n;
    if (r === 0) {
      return ((q - 1) % 12 + 12) % 12;
    } else {
      return (q + n - r) % 12;
    }
  }

  // ── 天府位置 (對照紫微) ──
  function getTianfuPos(ziweiPos) {
    return (6 - ziweiPos + 12) % 12;
    // 若 紫微=子(0)→天府=午(6), 紫微=午(6)→天府=子(0) ✓
  }

  // ── 安14主星 ──
  function placeMajorStars(ziweiPos) {
    const p = ziweiPos;
    const f = getTianfuPos(p);
    return {
      '紫微': p,
      '天機': (p + 11) % 12,  // p-1
      '太陽': (p + 9)  % 12,  // p-3
      '武曲': (p + 8)  % 12,  // p-4
      '天同': (p + 7)  % 12,  // p-5
      '廉貞': (p + 4)  % 12,  // p+4(順)
      '天府': f,
      '太陰': (f + 1)  % 12,
      '貪狼': (f + 2)  % 12,
      '巨門': (f + 3)  % 12,
      '天相': (f + 4)  % 12,
      '天梁': (f + 5)  % 12,
      '七殺': (f + 6)  % 12,
      '破軍': (f + 10) % 12,
    };
  }

  // ── 四化 ──
  const SI_HUA = {
    '甲': { '化祿': '廉貞', '化權': '破軍', '化科': '武曲', '化忌': '太陽' },
    '乙': { '化祿': '天機', '化權': '天梁', '化科': '紫微', '化忌': '太陰' },
    '丙': { '化祿': '天同', '化權': '天機', '化科': '文昌', '化忌': '廉貞' },
    '丁': { '化祿': '太陰', '化權': '天同', '化科': '天機', '化忌': '巨門' },
    '戊': { '化祿': '貪狼', '化權': '太陰', '化科': '右弼', '化忌': '天機' },
    '己': { '化祿': '武曲', '化權': '貪狼', '化科': '天梁', '化忌': '文曲' },
    '庚': { '化祿': '太陽', '化權': '武曲', '化科': '太陰', '化忌': '天同' },
    '辛': { '化祿': '巨門', '化權': '太陽', '化科': '文曲', '化忌': '文昌' },
    '壬': { '化祿': '天梁', '化權': '紫微', '化科': '左輔', '化忌': '武曲' },
    '癸': { '化祿': '破軍', '化權': '巨門', '化科': '太陰', '化忌': '貪狼' },
  };

  // ── 輔助星 ──
  function placeAuxStars(yearStemIdx, yearBranchIdx, month, hour) {
    const aux = {};

    // 文昌 (by 年支)
    aux['文昌'] = (10 - yearBranchIdx + 12) % 12;

    // 文曲 (by 年支)
    aux['文曲'] = (4 + yearBranchIdx) % 12;

    // 左輔 (by 月)
    aux['左輔'] = (3 + month) % 12;

    // 右弼 (by 月)
    aux['右弼'] = (11 - month + 12) % 12;

    // 天魁、天鉞 (by 年干)
    const KUI_YUE = [
      { '天魁': 1, '天鉞': 7 },  // 甲
      { '天魁': 0, '天鉞': 8 },  // 乙
      { '天魁': 11,'天鉞': 9 },  // 丙
      { '天魁': 11,'天鉞': 9 },  // 丁
      { '天魁': 1, '天鉞': 7 },  // 戊
      { '天魁': 0, '天鉞': 8 },  // 己
      { '天魁': 6, '天鉞': 2 },  // 庚
      { '天魁': 6, '天鉞': 2 },  // 辛
      { '天魁': 3, '天鉞': 5 },  // 壬
      { '天魁': 3, '天鉞': 5 },  // 癸
    ];
    aux['天魁'] = KUI_YUE[yearStemIdx]['天魁'];
    aux['天鉞'] = KUI_YUE[yearStemIdx]['天鉞'];

    // 祿存 (by 年干)
    const LU_CUN = [2,3,5,6,5,6,8,9,11,0];
    aux['祿存'] = LU_CUN[yearStemIdx];

    // 天馬 (by 年支)
    const TIANMA = [2,11,8,5,2,11,8,5,2,11,8,5];
    aux['天馬'] = TIANMA[yearBranchIdx];

    // 火星 (by 年支 + 時辰)
    const HUOXING_BASE = [2,3,1,10,10,3,2,3,1,10,10,3];
    aux['火星'] = (HUOXING_BASE[yearBranchIdx] + hour) % 12;

    // 鈴星 (by 年支 + 時辰)
    const LIXING_BASE = [9,9,0,0,9,9,0,0,9,9,0,0];
    aux['鈴星'] = (LIXING_BASE[yearBranchIdx] + hour) % 12;

    return aux;
  }

  // ── 主星特質描述 ──
  const STAR_DESC = {
    '紫微': { type: 'major', element: '土', nature: '帝星', desc: '主貴、有領導才能，受人尊重，意志堅定', color: '#e8c040' },
    '天機': { type: 'major', element: '木', nature: '益壽星', desc: '善謀略、心思細膩、變動多，有宗教緣', color: '#67c23a' },
    '太陽': { type: 'major', element: '火', nature: '貴星', desc: '光明磊落、慷慨大方、主官貴', color: '#ff8c42' },
    '武曲': { type: 'major', element: '金', nature: '財星', desc: '剛毅果斷、有財運，主財帛、武職', color: '#c0c0c0' },
    '天同': { type: 'major', element: '水', nature: '福星', desc: '溫和享樂、重感情、晚年享福', color: '#4fc3f7' },
    '廉貞': { type: 'major', element: '火', nature: '次桃花囚星', desc: '個性剛烈、藝術才華、社交能力強', color: '#ff6b6b' },
    '天府': { type: 'major', element: '土', nature: '令星', desc: '穩重保守、善理財、有威儀', color: '#ffd700' },
    '太陰': { type: 'major', element: '水', nature: '富星田宅主', desc: '溫柔細膩、直覺敏銳、主田宅財富', color: '#b0c4de' },
    '貪狼': { type: 'major', element: '木水', nature: '桃花星', desc: '多才多藝、慾望強、社交廣、桃花旺', color: '#9b59b6' },
    '巨門': { type: 'major', element: '水', nature: '暗星', desc: '口才好、重思考、易生口舌是非', color: '#7f8c8d' },
    '天相': { type: 'major', element: '水', nature: '印星', desc: '正直守信、有貴人緣、服務精神', color: '#3498db' },
    '天梁': { type: 'major', element: '土', nature: '蔭星', desc: '正義感強、有長者風範、主蔭護', color: '#27ae60' },
    '七殺': { type: 'major', element: '金火', nature: '將星', desc: '果斷剛毅、獨立自主、開創力強', color: '#e74c3c' },
    '破軍': { type: 'major', element: '水', nature: '耗星', desc: '開創革新、反傳統、感情多波折', color: '#e67e22' },
    '文昌': { type: 'aux', element: '金', nature: '科甲星', desc: '聰明才智、考試運佳、有文藝氣質', color: '#85c1e9' },
    '文曲': { type: 'aux', element: '水', nature: '科甲星', desc: '藝術才華、口才佳、有異性緣', color: '#a29bfe' },
    '左輔': { type: 'aux', element: '土', nature: '吉星', desc: '增強主星力量、貴人相助', color: '#fdcb6e' },
    '右弼': { type: 'aux', element: '水', nature: '吉星', desc: '輔助主星、助力良多', color: '#fd79a8' },
    '天魁': { type: 'aux', element: '火', nature: '天乙貴人', desc: '貴人星、逢凶化吉', color: '#ffeaa7' },
    '天鉞': { type: 'aux', element: '火', nature: '玉堂貴人', desc: '貴人星、增添光彩', color: '#dfe6e9' },
    '祿存': { type: 'aux', element: '土', nature: '祿星', desc: '財祿豐厚、有貴人相助', color: '#55efc4' },
    '天馬': { type: 'aux', element: '火', nature: '驛馬星', desc: '奔波勞碌、變動多、宜外出', color: '#74b9ff' },
    '火星': { type: 'evil', element: '火', nature: '煞星', desc: '衝動急躁、意外、與主星交會增威', color: '#ff7675' },
    '鈴星': { type: 'evil', element: '火', nature: '煞星', desc: '孤剋、神秘、與主星交會增威', color: '#fd79a8' },
  };

  // ── 宮位解讀 ──
  const PALACE_DESC = {
    '命宮': '代表本人的個性、外貌、才能與整體命格',
    '兄弟': '代表兄弟姊妹關係、合夥事業、朋友深交',
    '夫妻': '代表感情、婚姻、配偶的特質',
    '子女': '代表子女、部屬、創作成果',
    '財帛': '代表財務運勢、理財方式、賺錢能力',
    '疾厄': '代表健康狀況、意外、身體弱點',
    '遷移': '代表外出運、貴人、社交環境',
    '奴僕': '代表下屬、朋友、服務業',
    '官祿': '代表事業、職場、成就',
    '田宅': '代表不動產、家庭環境、祖業',
    '福德': '代表精神生活、享受、福氣',
    '父母': '代表父母、長上、文書',
  };

  // ── 主星命宮解讀 ──
  const MINGONG_READINGS = {
    '紫微': '命宮坐紫微，天生帶有領袖氣質，自尊心強，追求完美。具有統御能力，適合從政或管理職，貴人助力多。',
    '天機': '命宮坐天機，思維靈活多變，善謀略，學習能力強。心思細膩，有宗教哲學傾向，但多變動。',
    '太陽': '命宮坐太陽，個性開朗積極，光明磊落，熱愛助人。有官貴之象，在白天出生者尤為有利。',
    '武曲': '命宮坐武曲，意志堅定，果斷剛毅，自主性強。財運佳，適合從事財經、軍警、工程等工作。',
    '天同': '命宮坐天同，溫和享樂，重視感情，福壽雙全。生活態度悠然自得，晚年尤為享福。',
    '廉貞': '命宮坐廉貞，個性剛烈，有藝術才華，社交能力出色。感情豐富，需注意情緒控管。',
    '天府': '命宮坐天府，穩重踏實，善於理財，有威儀。保守中求進，適合公職或金融業，晚年富貴。',
    '太陰': '命宮坐太陰，感情細膩，直覺敏銳，有藝術天賦。重視家庭，財運佳，女命尤為吉利。',
    '貪狼': '命宮坐貪狼，多才多藝，魅力十足，桃花旺盛。慾望強，需注意誘惑，善用才華可大成。',
    '巨門': '命宮坐巨門，口才出眾，思考深刻，善於分析。需注意口舌是非，適合律師、教師、評論家。',
    '天相': '命宮坐天相，正直誠信，有貴人緣，服務精神佳。個性中庸，善於協調，人緣廣。',
    '天梁': '命宮坐天梁，有正義感，具長者風範，主蔭護他人。適合醫療、宗教、公益等助人行業。',
    '七殺': '命宮坐七殺，果斷獨立，開創力強，不畏挑戰。個性強烈，適合自行創業，需注意人際關係。',
    '破軍': '命宮坐破軍，革新開創，不受傳統束縛，多變動。感情生活多波折，但韌性強，能從逆境中崛起。',
  };

  // ── 主計算函數 ──
  function calculate(lunarYear, lunarMonth, lunarDay, birthHour, gender) {
    const { stem, branch, stemIdx, branchIdx, idx } = getStemBranch(lunarYear);

    // 命宮地支
    const mingPos = getMingGong(lunarMonth, birthHour);
    // 命宮天干
    const mingStemIdx = getPalaceStem(stemIdx, mingPos);

    // 五行局
    const ju = getWuXingJu(mingStemIdx, mingPos);

    // 身宮
    const shenPos = getShenGong(lunarMonth, birthHour);

    // 紫微位置
    const ziweiPos = getZiweiPos(ju, lunarDay);

    // 安14主星
    const majorStars = placeMajorStars(ziweiPos);

    // 安輔助星
    const auxStars = placeAuxStars(stemIdx, branchIdx, lunarMonth, birthHour);

    // 四化
    const siHua = SI_HUA[stem] || {};

    // 建立12宮
    const palaces = [];
    for (let i = 0; i < 12; i++) {
      const pos = (mingPos + i) % 12;
      const palaceStemIdx = getPalaceStem(stemIdx, pos);
      palaces.push({
        index: i,
        pos: pos,
        name: PALACE_NAMES[i],
        stem: STEMS[palaceStemIdx],
        branch: BRANCHES[pos],
        isMing: i === 0,
        isShen: pos === shenPos,
        stars: [],     // 主星
        auxList: [],   // 輔星
        hua: [],       // 四化
      });
    }

    // 將主星放入宮位
    for (const [star, pos] of Object.entries(majorStars)) {
      const palace = palaces.find(p => p.pos === pos);
      if (palace) palace.stars.push(star);
    }

    // 將輔星放入宮位
    for (const [star, pos] of Object.entries(auxStars)) {
      const palace = palaces.find(p => p.pos === pos);
      if (palace) palace.auxList.push(star);
    }

    // 標記四化
    for (const [hua, star] of Object.entries(siHua)) {
      // 找到這顆星在哪個宮位
      for (const palace of palaces) {
        if (palace.stars.includes(star) || palace.auxList.includes(star)) {
          palace.hua.push({ hua, star });
        }
      }
    }

    // 命宮主星解讀
    const mingPalace = palaces[0];
    const mingMainStar = mingPalace.stars[0] || '';
    const mingReading = MINGONG_READINGS[mingMainStar] || '命宮群星匯聚，命格豐富多彩，需綜合各星詳細解讀。';

    return {
      // 基本資料
      lunarYear, lunarMonth, lunarDay, birthHour, gender,
      yearStem: stem,
      yearBranch: branch,
      yearGanzhi: stem + branch,
      zodiac: ZODIAC[branchIdx],
      // 命身
      mingPos,
      shenPos,
      mingStem: STEMS[mingStemIdx],
      mingBranch: BRANCHES[mingPos],
      shenBranch: BRANCHES[shenPos],
      // 五行局
      ju,
      juName: JU_NAMES[ju],
      // 宮位
      palaces,
      // 解讀
      mingMainStar,
      mingReading,
      siHua,
    };
  }

  // ── 宮位深度解讀 ──
  function readPalace(palace, result) {
    const { name, stars, auxList, hua } = palace;
    const parts = [];

    // 主星
    if (stars.length > 0) {
      const starDescs = stars.map(s => {
        const info = STAR_DESC[s];
        const huaTag = hua.filter(h => h.star === s).map(h => h.hua).join('');
        return `${s}${huaTag}（${info ? info.desc : ''}）`;
      });
      parts.push(`【主星】${starDescs.join('、')}`);
    } else {
      parts.push('【主星】空宮（以對宮星曜借用解讀）');
    }

    // 輔星
    const impAux = auxList.filter(s => ['文昌','文曲','左輔','右弼','天魁','天鉞','祿存'].includes(s));
    if (impAux.length > 0) {
      parts.push(`【輔星】${impAux.join('、')}`);
    }

    // 宮義
    parts.push(`【宮義】${PALACE_DESC[name] || ''}`);

    return parts.join('\n');
  }

  return {
    calculate,
    readPalace,
    STEMS,
    BRANCHES,
    ZODIAC,
    PALACE_NAMES,
    JU_NAMES,
    STAR_DESC,
    PALACE_DESC,
    getStemBranch,
  };
})();
