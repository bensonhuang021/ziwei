// ══════════════════════════════════════════════
//  主應用程式邏輯
// ══════════════════════════════════════════════

// ── 全局狀態 ──
const STATE = {
  currentSection: 'home',
  tarot: {
    deck: [],
    drawnCards: [],
    reversed: [],
    spread: 'three',
    question: '',
    reading: null,
  },
  ziwei: {
    result: null,
  },
};

// ── 初始化 ──
document.addEventListener('DOMContentLoaded', () => {
  initStarField();
  showSection('home');
  initTarot();
  initZiwei();
  initNewFlow();
});

// ── 星空背景 ──
function initStarField() {
  const canvas = document.getElementById('starCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const stars = Array.from({ length: 200 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.5 + 0.3,
    alpha: Math.random(),
    speed: Math.random() * 0.005 + 0.002,
  }));

  function draw() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      s.alpha += s.speed;
      if (s.alpha > 1 || s.alpha < 0) s.speed = -s.speed;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,200,255,${Math.abs(s.alpha)})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
}

// ── 頁面切換 ──
function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const sec = document.getElementById('sec-' + id);
  if (sec) sec.classList.add('active');
  const btn = document.querySelector(`.nav-btn[data-sec="${id}"]`);
  if (btn) btn.classList.add('active');
  STATE.currentSection = id;
  window.scrollTo(0, 0);
}

// ══════════════════════════════════════════════
//  塔羅占卜
// ══════════════════════════════════════════════
function initTarot() {
  renderSpreadSelector();
  document.getElementById('btn-shuffle').addEventListener('click', startShuffle);
  document.getElementById('btn-reset-tarot').addEventListener('click', resetTarot);
  document.getElementById('tarot-question').addEventListener('input', e => {
    STATE.tarot.question = e.target.value;
  });
  showDeckIdle();
}

function renderSpreadSelector() {
  const container = document.getElementById('spread-selector');
  container.innerHTML = Object.entries(SPREADS).map(([key, s]) => `
    <button class="spread-btn ${key === STATE.tarot.spread ? 'active' : ''}"
            onclick="selectSpread('${key}')">
      <span class="spread-name">${s.name}</span>
      <span class="spread-desc">${s.description}</span>
    </button>
  `).join('');
}

function selectSpread(key) {
  STATE.tarot.spread = key;
  renderSpreadSelector();
  resetTarot();
}

// ── 工具 ──
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// ── 牌堆初始畫面 ──
function showDeckIdle() {
  document.getElementById('cards-display').innerHTML = `
    <div class="deck-idle">
      <div class="deck-stack" id="deck-stack">
        ${Array.from({length: 8}, (_, i) =>
          `<div class="deck-layer" style="--offset:${i * 1.5}"></div>`
        ).join('')}
      </div>
      <p class="deck-hint">靜心感受你的問題，再點擊洗牌</p>
    </div>
  `;
}

// ── 洗牌動畫 + 展開選牌 ──
let _shuffledDeck = [];
let _selectedIndices = [];
let _selectedCards = [];

async function startShuffle() {
  const spread = SPREADS[STATE.tarot.spread];
  STATE.tarot.drawnCards = [];
  STATE.tarot.reversed = [];
  _selectedIndices = [];
  _selectedCards = [];

  // Fisher-Yates shuffle
  const deck = [...TAROT_CARDS];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  _shuffledDeck = deck.map(c => ({ ...c, reversed: Math.random() < 0.3 }));

  // 確保牌堆畫面存在
  if (!document.getElementById('deck-stack')) showDeckIdle();

  // 洗牌動畫 × 3 回合
  const stack = document.getElementById('deck-stack');
  if (stack) {
    for (let pass = 0; pass < 3; pass++) {
      stack.classList.add(pass % 2 === 0 ? 'shuffling' : 'shuffling2');
      await delay(440);
      stack.classList.remove('shuffling', 'shuffling2');
      await delay(80);
    }
    await delay(150);
  }

  showSelectingPhase(spread.positions.length);
}

// ── 顯示選牌介面 ──
function showSelectingPhase(required) {
  const displayCount = 12;
  const fragment = _shuffledDeck.slice(0, displayCount).map((card, i) => `
    <div class="sel-wrap" id="sel-${i}" style="animation-delay:${i * 0.06}s"
         onclick="handleCardSelect(${i}, ${required})">
      <div class="card-flipper" id="flipper-${i}">
        <div class="card-face card-face-back"><div class="back-inner"></div></div>
        <div class="card-face card-face-front" style="--card-color:${getSuitColor(card)}">
          <span class="cf-num">${card.number || ''}</span>
          <span class="cf-sym">${card.symbol}</span>
          <span class="cf-nam">${card.name}</span>
          ${card.reversed ? '<span class="cf-rev">逆</span>' : ''}
        </div>
      </div>
    </div>
  `).join('');

  document.getElementById('cards-display').innerHTML = `
    <div class="select-phase">
      <p class="select-counter">
        已選 <span id="sel-count">0</span>&thinsp;/&thinsp;${required} 張
        <span class="sel-hint">— 點選你感應到的牌</span>
      </p>
      <div class="selectable-grid" id="sel-grid">${fragment}</div>
    </div>
  `;
}

// ── 選牌邏輯 ──
function handleCardSelect(index, required) {
  if (_selectedIndices.includes(index)) return;
  if (_selectedIndices.length >= required) return;

  const flipper = document.getElementById(`flipper-${index}`);
  const wrap    = document.getElementById(`sel-${index}`);
  if (!flipper || !wrap) return;

  flipper.classList.add('flipped');
  wrap.classList.add('selected');
  wrap.dataset.order = _selectedIndices.length + 1;

  _selectedIndices.push(index);
  _selectedCards.push(_shuffledDeck[index]);

  const cnt = document.getElementById('sel-count');
  if (cnt) cnt.textContent = _selectedIndices.length;

  if (_selectedIndices.length === required) {
    setTimeout(finalizeReading, 800);
  }
}

// ── 選牌完成 → 展示結果 ──
function finalizeReading() {
  STATE.tarot.drawnCards = _selectedCards;
  STATE.tarot.reversed   = _selectedCards.map(c => c.reversed);
  STATE.tarot.reading    = {
    cards:    _selectedCards,
    reversed: _selectedCards.map(c => c.reversed),
    spread:   STATE.tarot.spread,
    question: STATE.tarot.question,
  };

  const spread = SPREADS[STATE.tarot.spread];
  document.getElementById('cards-display').innerHTML = `
    <div class="drawn-spread">
      ${_selectedCards.map((card, i) => {
        const pos   = spread.positions[i];
        const isRev = card.reversed;
        return `
          <div class="drawn-card-wrap" onclick="showCardDetail(${card.id}, ${isRev})">
            <div class="pos-label">${pos.name}</div>
            <div class="drawn-card ${isRev ? 'reversed' : ''}" style="--card-color:${getSuitColor(card)}">
              <div class="card-inner"><div class="card-front-face">
                <div class="card-number">${card.number || ''}</div>
                <div class="card-symbol">${card.symbol}</div>
                <div class="card-title">${card.name}</div>
                ${isRev ? '<div class="rev-badge">逆位</div>' : ''}
              </div></div>
            </div>
            <div class="pos-desc">${pos.desc}</div>
          </div>`;
      }).join('')}
    </div>
  `;

  document.getElementById('cards-result').style.display = 'block';
  document.getElementById('cards-result').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  generateTarotReading();
}

function renderDrawnCards() {
  const spread = SPREADS[STATE.tarot.spread];
  const container = document.getElementById('cards-display');
  const cards = STATE.tarot.drawnCards;

  container.innerHTML = cards.map((card, i) => {
    const isRev = STATE.tarot.reversed[i];
    const pos = spread.positions[i];
    const suitColor = getSuitColor(card);
    return `
      <div class="drawn-card-wrap" onclick="showCardDetail(${card.id}, ${isRev})">
        <div class="pos-label">${pos.name}</div>
        <div class="drawn-card ${isRev ? 'reversed' : ''}" style="--card-color: ${suitColor}">
          <div class="card-inner">
            <div class="card-front-face">
              <div class="card-number">${card.number || card.suit?.toUpperCase()[0] || ''}</div>
              <div class="card-symbol">${card.symbol}</div>
              <div class="card-title">${card.name}</div>
              ${isRev ? '<div class="rev-badge">逆位</div>' : ''}
            </div>
          </div>
        </div>
        <div class="pos-desc">${pos.desc}</div>
      </div>
    `;
  }).join('');

  document.getElementById('cards-result').style.display = 'block';
}

function getSuitColor(card) {
  if (card.arcana === 'major') return '#c9a02a';
  const colors = { cups: '#4fc3f7', wands: '#ff8c42', swords: '#90caf9', pentacles: '#a5d6a7' };
  return colors[card.suit] || '#c9a02a';
}

function generateTarotReading() {
  const spread = SPREADS[STATE.tarot.spread];
  const cards = STATE.tarot.drawnCards;
  const reversed = STATE.tarot.reversed;
  const question = STATE.tarot.question;

  let reading = '';

  if (question) {
    reading += `<p class="reading-question">「${question}」</p>`;
  }

  reading += `<div class="reading-cards">`;
  cards.forEach((card, i) => {
    const pos = spread.positions[i];
    const isRev = reversed[i];
    const meaning = isRev ? card.reversed : card.upright;
    const orientation = isRev ? '（逆位）' : '（正位）';
    reading += `
      <div class="reading-item">
        <h4>${pos.name}：${card.name} ${orientation}</h4>
        <p class="reading-keywords">${card.keywords.join(' · ')}</p>
        <p>${meaning}</p>
      </div>
    `;
  });
  reading += `</div>`;

  // 綜合解讀
  reading += `<div class="reading-summary">`;
  reading += `<h4>綜合解讀</h4>`;
  reading += `<p>${generateSummary(cards, reversed, spread)}</p>`;
  reading += `</div>`;

  document.getElementById('tarot-reading').innerHTML = reading;

  // 儲存到狀態
  STATE.tarot.reading = { cards, reversed, spread: STATE.tarot.spread, question };
}

function generateSummary(cards, reversed, spread) {
  const upCards = cards.filter((_, i) => !reversed[i]);
  const revCards = cards.filter((_, i) => reversed[i]);
  const majorCards = cards.filter(c => c.arcana === 'major');
  const allKeywords = cards.flatMap(c => c.keywords);

  let summary = '';

  if (majorCards.length > 0) {
    summary += `此次抽到 ${majorCards.length} 張大阿爾克那（${majorCards.map(c => c.name).join('、')}），代表正在經歷重要的人生課題或業力轉捩點。`;
  }

  if (spread.positions.length === 3) {
    const [past, present, future] = cards;
    summary += `過去的${past.keywords[0]}奠定了現在的基礎，`;
    summary += `當前${present.name}的能量主導著局面，`;
    summary += `未來的走向指向${future.keywords[0]}的可能性。`;
  }

  if (revCards.length > cards.length / 2) {
    summary += `多張逆位牌顯示此刻能量受阻，需要反思內在的阻礙，重新調整方向。`;
  } else if (revCards.length === 0) {
    summary += `全部正位，能量流動順暢，有利於積極行動。`;
  }

  summary += `整體而言，牌陣傳達的核心訊息圍繞著：${allKeywords.slice(0, 3).join('、')}。建議保持開放的心，相信直覺的引導。`;

  return summary;
}

function resetTarot() {
  STATE.tarot.drawnCards = [];
  STATE.tarot.reversed = [];
  _selectedIndices = [];
  _selectedCards = [];
  document.getElementById('cards-result').style.display = 'none';
  document.getElementById('tarot-reading').innerHTML = '';
  showDeckIdle();
}

// ── 卡牌詳情 Modal ──
function showCardDetail(cardId, isReversed) {
  const card = TAROT_CARDS.find(c => c.id === cardId);
  if (!card) return;

  const suitColor = getSuitColor(card);
  const orientation = isReversed ? '逆位' : '正位';
  const meaning = isReversed ? card.reversed : card.upright;

  document.getElementById('modal-body').innerHTML = `
    <div class="modal-card" style="--card-color: ${suitColor}">
      <div class="modal-card-visual ${isReversed ? 'reversed' : ''}">
        <div class="card-number">${card.number || ''}</div>
        <div class="card-symbol-lg">${card.symbol}</div>
        <div class="card-title-lg">${card.name}</div>
      </div>
      <div class="modal-info">
        <div class="modal-card-header">
          <h2>${card.name} <span class="en-name">${card.name_en}</span></h2>
          <span class="orientation-tag ${isReversed ? 'reversed' : 'upright'}">${orientation}</span>
        </div>
        <p class="modal-keywords">${card.keywords.join(' · ')}</p>
        <div class="modal-meaning">
          <h4>牌義解讀</h4>
          <p>${meaning}</p>
        </div>
        <div class="modal-both">
          <div>
            <h5>正位</h5><p>${card.upright}</p>
          </div>
          <div>
            <h5>逆位</h5><p>${card.reversed}</p>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('modal').classList.add('active');
}

function closeModal() {
  document.getElementById('modal').classList.remove('active');
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

// ══════════════════════════════════════════════
//  紫微斗數排盤
// ══════════════════════════════════════════════
function initZiwei() {
  document.getElementById('btn-calc-ziwei').addEventListener('click', calcZiwei);

  // 填入年份下拉選單
  const yearSel = document.getElementById('ziwei-year');
  for (let y = 2010; y >= 1920; y--) {
    const { stem, branch } = ZW.getStemBranch(y);
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = `${y}年 (${stem}${branch})`;
    if (y === 1990) opt.selected = true;
    yearSel.appendChild(opt);
  }
}

function calcZiwei() {
  const year   = parseInt(document.getElementById('ziwei-year').value);
  const month  = parseInt(document.getElementById('ziwei-month').value);
  const day    = parseInt(document.getElementById('ziwei-day').value);
  const hour   = parseInt(document.getElementById('ziwei-hour').value);
  const gender = document.getElementById('ziwei-gender').value;

  // 基本驗證
  if (!year || !month || !day) {
    alert('請填寫完整的農曆生辰資料');
    return;
  }

  try {
    const result = ZW.calculate(year, month, day, hour, gender);
    STATE.ziwei.result = result;
    renderZiweiChart(result);
    document.getElementById('ziwei-result').style.display = 'block';
  } catch (err) {
    console.error(err);
    alert('排盤計算發生錯誤，請確認輸入資料。');
  }
}

function renderZiweiChart(r) {
  // 更新命盤資訊
  document.getElementById('zi-year').textContent = r.yearGanzhi + '年 (' + r.zodiac + ')';
  document.getElementById('zi-mingpos').textContent = r.mingStem + r.mingBranch + '宮';
  document.getElementById('zi-shenpos').textContent = ZW.BRANCHES[r.shenPos] + '宮';
  document.getElementById('zi-ju').textContent = r.juName;
  document.getElementById('zi-mingstar').textContent = r.mingMainStar || '空';

  // 渲染12宮格
  const grid = document.getElementById('ziwei-grid');
  grid.innerHTML = '';

  // 宮位在格子中的排列位置
  // pos=0(子)在格子(3,2), pos=1(丑)在(3,1), pos=2(寅)在(3,0)
  // pos=3(卯)在(2,0), pos=4(辰)在(1,0), pos=5(巳)在(0,0)
  // pos=6(午)在(0,1), pos=7(未)在(0,2), pos=8(申)在(0,3)
  // pos=9(酉)在(1,3), pos=10(戌)在(2,3), pos=11(亥)在(3,3)
  const GRID_POSITIONS = [
    [3, 2], // 子(0)
    [3, 1], // 丑(1)
    [3, 0], // 寅(2)
    [2, 0], // 卯(3)
    [1, 0], // 辰(4)
    [0, 0], // 巳(5)
    [0, 1], // 午(6)
    [0, 2], // 未(7)
    [0, 3], // 申(8)
    [1, 3], // 酉(9)
    [2, 3], // 戌(10)
    [3, 3], // 亥(11)
  ];

  // 建立4x4格子(不含中間2x2)
  const cells = {};
  GRID_POSITIONS.forEach(([row, col], pos) => {
    cells[`${row},${col}`] = pos;
  });

  // 找出每個宮位
  const palaceByPos = {};
  r.palaces.forEach(p => {
    palaceByPos[p.pos] = p;
  });

  // 渲染每個宮格
  GRID_POSITIONS.forEach(([row, col], branchPos) => {
    const palace = palaceByPos[branchPos];
    if (!palace) return;

    const cell = document.createElement('div');
    cell.className = 'palace-cell';
    cell.style.gridRow = row + 1;
    cell.style.gridColumn = col + 1;
    if (palace.isMing) cell.classList.add('is-ming');
    if (palace.isShen) cell.classList.add('is-shen');

    // 四化標記
    const huaMap = {};
    palace.hua.forEach(h => {
      huaMap[h.star] = h.hua;
    });

    const starsHtml = palace.stars.map(s => {
      const info = ZW.STAR_DESC[s];
      const hua = huaMap[s] ? `<sup class="hua-tag">${huaMap[s]}</sup>` : '';
      return `<span class="star major-star" style="color:${info?.color||'#c9a02a'}" title="${info?.desc||''}">${s}${hua}</span>`;
    }).join('');

    const auxHtml = palace.auxList
      .filter(s => ['文昌','文曲','左輔','右弼','天魁','天鉞','祿存','天馬'].includes(s))
      .map(s => {
        const info = ZW.STAR_DESC[s];
        const hua = huaMap[s] ? `<sup class="hua-tag">${huaMap[s]}</sup>` : '';
        return `<span class="star aux-star" style="color:${info?.color||'#888'}" title="${info?.desc||''}">${s}${hua}</span>`;
      }).join('');

    const evilHtml = palace.auxList
      .filter(s => ['火星','鈴星'].includes(s))
      .map(s => `<span class="star evil-star">${s}</span>`).join('');

    cell.innerHTML = `
      <div class="palace-header">
        <span class="palace-branch">${palace.stem}${palace.branch}</span>
        <span class="palace-name">${palace.name}</span>
        ${palace.isMing ? '<span class="ming-badge">命</span>' : ''}
        ${palace.isShen ? '<span class="shen-badge">身</span>' : ''}
      </div>
      <div class="palace-stars">${starsHtml}</div>
      <div class="palace-aux">${auxHtml}${evilHtml}</div>
    `;

    cell.addEventListener('click', () => showPalaceDetail(palace, r));
    grid.appendChild(cell);
  });

  // 中央資訊格
  const center = document.createElement('div');
  center.className = 'palace-center';
  center.style.gridRow = '2 / 4';
  center.style.gridColumn = '2 / 4';
  center.innerHTML = `
    <div class="center-info">
      <div class="center-title">命主資訊</div>
      <div class="center-item"><label>農曆年</label><value>${r.yearGanzhi}（${r.zodiac}年）</value></div>
      <div class="center-item"><label>五行局</label><value>${r.juName}</value></div>
      <div class="center-item"><label>命宮</label><value>${r.mingStem}${r.mingBranch}</value></div>
      <div class="center-item"><label>身宮</label><value>${ZW.BRANCHES[r.shenPos]}</value></div>
      <div class="center-item"><label>命主星</label><value>${r.mingMainStar || '空宮'}</value></div>
      <div class="center-item"><label>性別</label><value>${r.gender === 'M' ? '男' : '女'}</value></div>
    </div>
  `;
  grid.appendChild(center);

  // 命宮解讀
  document.getElementById('ming-reading').innerHTML = `
    <h4>命宮解讀</h4>
    <p>${r.mingReading}</p>
    <h4>四化</h4>
    <div class="sihua-grid">
      ${Object.entries(r.siHua).map(([hua, star]) =>
        `<div class="sihua-item"><span class="hua-name ${hua.replace('化','')}">${hua}</span><span class="hua-star">${star}</span></div>`
      ).join('')}
    </div>
  `;
}

function showPalaceDetail(palace, result) {
  const reading = ZW.readPalace(palace, result);
  document.getElementById('modal-body').innerHTML = `
    <div class="palace-modal">
      <h2>${palace.name} <span class="branch-label">${palace.stem}${palace.branch}</span></h2>
      ${palace.isMing ? '<div class="ming-highlight">命宮所在</div>' : ''}
      ${palace.isShen ? '<div class="shen-highlight">身宮所在</div>' : ''}
      <pre class="palace-reading">${reading}</pre>
      ${palace.stars.length > 0 ? `
        <div class="star-details">
          ${palace.stars.map(s => {
            const info = ZW.STAR_DESC[s] || {};
            const hua = palace.hua.filter(h => h.star === s).map(h => h.hua).join('、');
            return `
              <div class="star-detail-item" style="border-color:${info.color||'#888'}">
                <h4 style="color:${info.color||'#888'}">${s}${hua ? ` (${hua})` : ''}</h4>
                <p>元素：${info.element || '-'} ｜ 星性：${info.nature || '-'}</p>
                <p>${info.desc || ''}</p>
              </div>
            `;
          }).join('')}
        </div>
      ` : ''}
    </div>
  `;
  document.getElementById('modal').classList.add('active');
}

// ══════════════════════════════════════════════
//  占卜解讀 — 六步驟完整流程
// ══════════════════════════════════════════════

// 西元春節日期（1920–2010），用於換算農曆年
const CNY_DATES = [
  [2,20],[2,8],[1,28],[2,16],[2,5],[1,24],[2,13],[2,2],[1,23],[2,10],
  [1,30],[2,17],[2,6],[1,26],[2,14],[2,4],[1,24],[2,11],[1,31],[2,19],
  [2,8],[1,27],[2,15],[2,5],[1,25],[2,13],[2,2],[1,22],[2,10],[1,29],
  [2,17],[2,6],[1,27],[2,14],[2,3],[1,24],[2,12],[1,31],[2,18],[2,8],
  [1,28],[2,15],[2,5],[1,25],[2,13],[2,2],[1,21],[2,9],[1,30],[2,17],
  [2,6],[1,27],[2,15],[2,3],[1,23],[2,11],[1,31],[2,18],[2,7],[1,28],
  [2,16],[2,5],[1,25],[2,13],[2,2],[2,20],[2,9],[1,29],[2,17],[2,6],
  [1,27],[2,15],[2,4],[1,23],[2,10],[1,31],[2,19],[2,7],[1,28],[2,16],
  [2,5],[1,24],[2,12],[2,1],[1,22],[2,9],[1,29],[2,18],[2,7],[1,26],[2,14]
];

function gregorianToLunar(gy, gm, gd) {
  const idx = gy - 1920;
  let ly = gy;
  if (idx >= 0 && idx < CNY_DATES.length) {
    const [cm, cd] = CNY_DATES[idx];
    if (gm < cm || (gm === cm && gd < cd)) ly = gy - 1;
  }
  return { lunarYear: ly, lunarMonth: gm, lunarDay: Math.min(gd, 30) };
}

// 流程狀態
let FLOW = {
  step: 1, birth: {}, qCat: null, qText: '',
  deck: [], picked: [], pickedIdx: [], ziweiResult: null,
};

function initNewFlow() {
  showNewFlowDeckIdle();
}

function flowGoStep(n) {
  document.querySelectorAll('.flow-step').forEach(s => s.classList.remove('active'));
  const el = document.getElementById('fstep-' + n);
  if (el) { el.classList.add('active'); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  for (let i = 1; i <= 5; i++) {
    const fp = document.getElementById('fp-' + i);
    if (!fp) continue;
    fp.className = 'fp-item' + (i < n ? ' done' : i === n ? ' current' : '');
  }
  FLOW.step = n;
}

function flowStep1Next() {
  const year = parseInt(document.getElementById('bf-year').value);
  if (!year || year < 1920 || year > 2010) {
    alert('請輸入 1920–2010 之間的出生年份');
    return;
  }
  FLOW.birth = {
    year, month: +document.getElementById('bf-month').value,
    day: +document.getElementById('bf-day').value,
    hour: +document.getElementById('bf-hour').value,
    gender: document.getElementById('bf-gender').value,
  };
  flowGoStep(2);
}

function selectQCat(btn) {
  document.querySelectorAll('.q-cat-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  FLOW.qCat = btn.dataset.cat;
}

function flowStep2Next() {
  if (!FLOW.qCat) { alert('請先選擇問題類型'); return; }
  FLOW.qText = (document.getElementById('nq-text').value || '').trim();
  flowGoStep(3);
  showNewFlowDeckIdle();
}

function showNewFlowDeckIdle() {
  const el = document.getElementById('new-deck-display');
  if (!el) return;
  el.innerHTML = `
    <div class="deck-idle">
      <div class="deck-stack" id="ndeck-stack">
        ${Array.from({length:8},(_,i)=>`<div class="deck-layer" style="--offset:${i*1.5}"></div>`).join('')}
      </div>
      <p class="deck-hint">靜心感受你的問題，準備好後按下洗牌</p>
    </div>`;
}

async function newFlowShuffle() {
  const btn = document.getElementById('btn-flow-shuffle');
  if (btn) btn.disabled = true;
  const deck = [...TAROT_CARDS];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  FLOW.deck = deck.map(c => ({ ...c, isRev: Math.random() < 0.3 }));
  FLOW.picked = []; FLOW.pickedIdx = [];
  const stack = document.getElementById('ndeck-stack');
  if (stack) {
    for (let pass = 0; pass < 3; pass++) {
      stack.classList.add(pass % 2 === 0 ? 'shuffling' : 'shuffling2');
      await delay(440);
      stack.classList.remove('shuffling', 'shuffling2');
      await delay(80);
    }
    await delay(200);
  }
  if (btn) btn.disabled = false;
  flowGoStep(4);
  renderCardStrip();
}

function renderCardStrip() {
  const strip = document.getElementById('cards-strip');
  if (!strip) return;
  FLOW.picked = []; FLOW.pickedIdx = [];
  document.getElementById('strip-sel-count').textContent = '0';
  strip.innerHTML = FLOW.deck.map((_, i) =>
    `<div class="strip-card" id="sc-${i}" onclick="handleStripSelect(${i})"></div>`
  ).join('');
}

function scrollStrip(dir) {
  const w = document.getElementById('cards-strip-wrap');
  if (w) w.scrollBy({ left: dir * 320, behavior: 'smooth' });
}

function handleStripSelect(idx) {
  if (FLOW.pickedIdx.includes(idx) || FLOW.picked.length >= 3) return;
  const el = document.getElementById('sc-' + idx);
  if (el) { el.classList.add('selected'); el.dataset.order = FLOW.picked.length + 1; }
  FLOW.pickedIdx.push(idx);
  FLOW.picked.push(FLOW.deck[idx]);
  document.getElementById('strip-sel-count').textContent = FLOW.picked.length;
  if (FLOW.picked.length === 3) {
    document.querySelectorAll('.strip-card:not(.selected)').forEach(c => c.classList.add('done'));
    setTimeout(startFlowResults, 700);
  }
}

async function startFlowResults() {
  flowGoStep(5);
  const cards = FLOW.picked;
  const { year, month, day, hour } = FLOW.birth;
  const BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  const CAT_LABELS = { love:'💕 感情', career:'💼 事業', money:'💰 財運', health:'🌿 健康', study:'📚 學業', other:'🔮 其他' };

  document.getElementById('result-birth-summary').innerHTML = `
    <div class="result-birth-tag">
      ${year} 年 ${month} 月 ${day} 日 · ${BRANCHES[hour]}時
      · <span class="q-cat-badge">${CAT_LABELS[FLOW.qCat]||''}</span>
    </div>
    ${FLOW.qText ? `<div class="result-q-text">「${FLOW.qText}」</div>` : ''}`;

  const positions = SPREADS.three.positions;
  document.getElementById('result-cards-row').innerHTML = cards.map((card, i) => {
    const origCard = TAROT_CARDS.find(c => c.id === card.id);
    return `
    <div class="result-card-wrap">
      <div class="pos-label">${positions[i].name}</div>
      <div class="result-card-flipper" id="rflip-${i}"
           onclick="showCardDetail(${card.id}, ${card.isRev})">
        <div class="card-face card-face-back"><div class="back-inner"></div></div>
        <div class="card-face card-face-front" style="--card-color:${getSuitColor(card)}">
          <span class="cf-num">${origCard.number||''}</span>
          <span class="cf-sym">${origCard.symbol}</span>
          <span class="cf-nam">${origCard.name}</span>
          ${card.isRev ? '<span class="cf-rev">逆</span>' : ''}
        </div>
      </div>
      <div class="pos-desc">${positions[i].desc}</div>
    </div>`; }).join('');

  // 逐張翻牌
  for (let i = 0; i < 3; i++) {
    await delay(i === 0 ? 900 : 1100);
    const f = document.getElementById('rflip-' + i);
    if (f) f.classList.add('flipped');
  }

  // 翻牌完成後，命盤淡入
  await delay(800);
  renderFlowZiwei();

  // 命盤後，解讀淡入
  await delay(1400);
  renderFlowReading();
}

function renderFlowZiwei() {
  const { lunarYear, lunarMonth, lunarDay } =
    gregorianToLunar(FLOW.birth.year, FLOW.birth.month, FLOW.birth.day);
  try {
    FLOW.ziweiResult = ZW.calculate(lunarYear, lunarMonth, lunarDay, FLOW.birth.hour, FLOW.birth.gender);
    const r = FLOW.ziweiResult;
    renderZiweiGridTo(document.getElementById('new-ziwei-grid'), r);
    document.getElementById('new-ming-summary').innerHTML = `
      <div class="ziwei-summary" style="margin-top:.8rem">
        <div class="summary-item"><div class="summary-label">農曆年</div><div class="summary-value">${r.yearGanzhi}（${r.zodiac}）</div></div>
        <div class="summary-item"><div class="summary-label">命宮</div><div class="summary-value">${r.mingStem}${r.mingBranch}</div></div>
        <div class="summary-item"><div class="summary-label">五行局</div><div class="summary-value">${r.juName}</div></div>
        <div class="summary-item"><div class="summary-label">命主星</div><div class="summary-value">${r.mingMainStar||'空宮'}</div></div>
      </div>`;
    const sec = document.getElementById('new-ziwei-section');
    sec.style.cssText = 'display:block; opacity:0; transition:opacity 1.2s';
    requestAnimationFrame(() => requestAnimationFrame(() => { sec.style.opacity = '1'; }));
  } catch(e) {
    console.error('Ziwei calc error:', e);
    const sec = document.getElementById('new-ziwei-section');
    sec.innerHTML = '<div class="panel"><p style="color:var(--text-dim);text-align:center;padding:1rem">命盤計算發生錯誤，請確認生辰資料</p></div>';
    sec.style.display = 'block';
  }
}

// 可複用的命盤格渲染（接受任意容器元素）
function renderZiweiGridTo(grid, r) {
  grid.innerHTML = '';
  const GRID_POS = [[3,2],[3,1],[3,0],[2,0],[1,0],[0,0],[0,1],[0,2],[0,3],[1,3],[2,3],[3,3]];
  const byPos = {};
  r.palaces.forEach(p => { byPos[p.pos] = p; });

  GRID_POS.forEach(([row, col], bp) => {
    const palace = byPos[bp]; if (!palace) return;
    const cell = document.createElement('div');
    cell.className = 'palace-cell';
    cell.style.gridRow = row + 1; cell.style.gridColumn = col + 1;
    if (palace.isMing) cell.classList.add('is-ming');
    if (palace.isShen) cell.classList.add('is-shen');
    const huaMap = {};
    palace.hua.forEach(h => { huaMap[h.star] = h.hua; });
    const starsHtml = palace.stars.map(s => {
      const info = ZW.STAR_DESC[s];
      const hua = huaMap[s] ? `<sup class="hua-tag">${huaMap[s]}</sup>` : '';
      return `<span class="star major-star" style="color:${info?.color||'#c9a02a'}" title="${info?.desc||''}">${s}${hua}</span>`;
    }).join('');
    const auxHtml = palace.auxList
      .filter(s => ['文昌','文曲','左輔','右弼','天魁','天鉞','祿存','天馬'].includes(s))
      .map(s => {
        const info = ZW.STAR_DESC[s];
        const hua = huaMap[s] ? `<sup class="hua-tag">${huaMap[s]}</sup>` : '';
        return `<span class="star aux-star" style="color:${info?.color||'#888'}">${s}${hua}</span>`;
      }).join('');
    cell.innerHTML = `
      <div class="palace-header">
        <span class="palace-branch">${palace.stem}${palace.branch}</span>
        <span class="palace-name">${palace.name}</span>
        ${palace.isMing ? '<span class="ming-badge">命</span>' : ''}
        ${palace.isShen ? '<span class="shen-badge">身</span>' : ''}
      </div>
      <div class="palace-stars">${starsHtml}</div>
      <div class="palace-aux">${auxHtml}</div>`;
    cell.addEventListener('click', () => showPalaceDetail(palace, r));
    grid.appendChild(cell);
  });

  const center = document.createElement('div');
  center.className = 'palace-center';
  center.style.gridRow = '2 / 4'; center.style.gridColumn = '2 / 4';
  center.innerHTML = `
    <div class="center-info">
      <div class="center-title">命主資訊</div>
      <div class="center-item"><label>農曆年</label><value>${r.yearGanzhi}（${r.zodiac}）</value></div>
      <div class="center-item"><label>五行局</label><value>${r.juName}</value></div>
      <div class="center-item"><label>命宮</label><value>${r.mingStem}${r.mingBranch}</value></div>
      <div class="center-item"><label>命主星</label><value>${r.mingMainStar||'空宮'}</value></div>
      <div class="center-item"><label>性別</label><value>${r.gender === 'M' ? '男' : '女'}</value></div>
    </div>`;
  grid.appendChild(center);
}

function renderFlowReading() {
  const cards = FLOW.picked;
  const zr = FLOW.ziweiResult;
  const spread = SPREADS.three;
  const origCards = cards.map(c => TAROT_CARDS.find(o => o.id === c.id));

  let html = '<div class="panel"><div class="panel-title">⑤ 完整占卜解讀</div><div class="flow-reading">';
  if (FLOW.qText) html += `<div class="reading-question">「${FLOW.qText}」</div>`;

  // 三張牌簡覽（點擊可查看詳細牌義）
  html += '<div class="reading-cards">';
  cards.forEach((card, i) => {
    const orig = origCards[i];
    const pos  = spread.positions[i];
    html += `
      <div class="reading-item" onclick="showCardDetail(${card.id},${card.isRev})" style="cursor:pointer">
        <h4>${pos.name}：${orig.name}（${card.isRev ? '逆位' : '正位'}）</h4>
        <p class="reading-keywords">${orig.keywords.join(' · ')}</p>
        <p>${card.isRev ? orig.reversed : orig.upright}</p>
      </div>`;
  });
  html += '</div>';

  // 針對問題的連貫敘述解讀
  html += '<div class="reading-narrative-section">';
  html += '<h4>✦ 綜合解讀</h4>';
  html += buildNarrative(cards, origCards, zr);
  html += '</div>';

  html += '</div></div>';

  const el = document.getElementById('new-combined-reading');
  el.innerHTML = html;
  el.style.cssText = 'opacity:0; transition:opacity 1s';
  requestAnimationFrame(() => requestAnimationFrame(() => { el.style.opacity = '1'; }));
}

// 針對問題，將三張牌織成一段連貫的解讀
function buildNarrative(cards, origCards, zr) {
  const qText  = FLOW.qText;
  const qCat   = FLOW.qCat;
  const spread = SPREADS.three;

  const CAT_SUBJECT = {
    love: '感情', career: '事業', money: '財運',
    health: '健康', study: '學業', other: '所詢之事',
  };
  const subject = CAT_SUBJECT[qCat] || '所詢之事';
  const qRef = qText ? `「${qText}」` : `你關於${subject}的疑問`;

  const rev  = cards.map(c => c.isRev);
  const orig = origCards;
  const m    = orig.map((c, i) => rev[i] ? c.reversed : c.upright);
  const kw   = orig.map(c => c.keywords);
  const nm   = orig.map(c => c.name);

  const paras = [];

  // ── 段落一：過去牌 × 問題的背景根源 ──
  {
    let p = `針對${qRef}，牌陣首先從「過去」的角度切入。`;
    p += `出現在此位置的「${nm[0]}」`;
    if (rev[0]) {
      p += `以逆位示現——${m[0]}`;
      if (!p.endsWith('。')) p += '。';
      p += `這說明在${subject}上，你可能長期背負著某些尚未化解的能量，`
         + `「${kw[0][0]}」的課題以受阻的形式出現，構成了你今日對此事感到糾結或困惑的深層背景。`
         + `值得先誠實檢視：這份阻礙究竟來自外在環境，還是自己內心未曾正視的部分？`;
    } else {
      p += `以正位呈現——${m[0]}`;
      if (!p.endsWith('。')) p += '。';
      p += `這顯示你在${subject}上並非毫無準備——「${kw[0][0]}」的底蘊早已存在，`
         + `你所走過的歷程，正是今日面對這個問題時最重要的資本。`;
    }
    paras.push(p);
  }

  // ── 段落二：現在牌 × 當前核心與建議 ──
  {
    let p = `來到「現在」這個位置，「${nm[1]}」揭示了你此刻在${subject}上的核心狀態：${m[1]}`;
    if (!p.endsWith('。')) p += '。';
    if (rev[1]) {
      p += `逆位的「${nm[1]}」暗示著，儘管你內心已感受到「${kw[1][0]}」的能量，但它目前仍以壓抑或未完全展開的形式存在。`
         + `這張牌的建議是：先停下向外索求答案的腳步，向內整合那些還沒有理清的情緒或想法，`
         + `等到內在的聲音變得清晰，行動才會真正有效。`;
    } else {
      p += `這是一張鼓勵你的牌——「${kw[1][0]}」的能量正在你身上流動，你在${subject}上所需要的判斷力與行動力此刻都已到位。`
         + `這張牌提醒你：與其再等待，不如相信自己當下所感受到的直覺，那就是你最好的指引。`;
    }
    paras.push(p);
  }

  // ── 段落三：未來牌 × 走向與結果 ──
  {
    let p = `關於${subject}接下來的走向，「${nm[2]}」（未來位）給出了這樣的預示：${m[2]}`;
    if (!p.endsWith('。')) p += '。';
    if (rev[2]) {
      p += `這張逆位的結果牌是一個善意的警示——如果你繼續沿著目前的軌跡前行，${subject}的結果可能不如預期。`
         + `但請記得，塔羅牌展示的是「當下能量延伸下去的可能性」，而非不可改變的命運。`
         + `「${kw[2][0]}」的逆位在提醒你：現在做出調整，仍然來得及為未來寫下不同的劇本。`;
    } else {
      p += `這是一個令人期待的訊號。只要你能把握住前兩張牌所指引的方向，${subject}的發展將朝著「${kw[2][0]}」的正向能量前行。`
         + `未來不是等來的，它正以你此刻的每一個選擇為磚瓦，一點一點成形。`;
    }
    paras.push(p);
  }

  // ── 段落四：紫微命盤融入 ──
  if (zr) {
    const CAT_PALACE = { love:'夫妻', career:'官祿', money:'財帛', health:'疾厄', study:'官祿', other:'命宮' };
    const palaceName  = CAT_PALACE[qCat] || '命宮';
    const palace      = zr.palaces.find(p => p.name === palaceName);
    const mingPalace  = zr.palaces.find(p => p.isMing) || zr.palaces[0];
    const mingStars   = mingPalace.stars.length ? mingPalace.stars.join('、') : '空宮';
    const revCount    = cards.filter(c => c.isRev).length;
    const majorCount  = cards.filter(c => c.arcana === 'major').length;
    const majorNames  = cards.filter(c => c.arcana === 'major')
                            .map(c => TAROT_CARDS.find(o => o.id === c.id).name).join('、');

    let p = `將塔羅牌的訊息與你的紫微命盤相互印證，可以看到更完整的圖景。`;
    p += `你的命宮主星為「${mingStars}」，${zr.juName}格局——${zr.mingReading}`;
    if (!p.endsWith('。')) p += '。';

    if (palace && palace.name !== '命宮') {
      const palStars = palace.stars.length ? palace.stars.join('、') : '空宮（借對宮力量解讀）';
      p += `而與${subject}最直接相關的${palaceName}宮（${palace.stem}${palace.branch}）坐有「${palStars}」`;
      if (palace.hua && palace.hua.length) {
        p += `，逢${palace.hua.map(h => `${h.star}${h.hua}`).join('、')}`;
      }
      p += `。`;
    }

    if (majorCount > 0) {
      p += `此次出現 ${majorCount} 張大阿爾克那（${majorNames}），顯示這個問題對你而言不只是日常小事，而是牽動更深層人生走向的重要課題。`;
    }

    if (revCount >= 2) {
      p += `命盤與多張逆位牌同時發出「需要調整」的訊號——這不是壞消息，而是命運在告訴你：此刻最有力量的行動，是向內沉澱，而非向外強攻。當你整理好自己，外在的${subject}局面自然會跟著鬆動。`;
    } else if (revCount === 0) {
      p += `命盤的能量格局與全正位的塔羅牌彼此呼應，顯示你在${subject}上正處於難得的順風期——天時、地利都已就位，你所需要的，只是願意踏出那一步的勇氣。`;
    } else {
      p += `命盤與牌陣的訊息都指向同一個核心：${subject}這件事，需要你同時照顧「外在的行動」與「內在的調整」，兩者缺一不可，才能走出真正穩健的路。`;
    }
    paras.push(p);
  }

  // ── 結語 ──
  {
    const CAT_CLOSING = {
      love:    `感情從來沒有標準答案。牌陣為你勾勒出了能量的輪廓，但讓關係真正成長的，是你願意拿出多少真誠與勇氣去面對它——對對方，更對自己。`,
      career:  `事業的藍圖已在牌陣中若隱若現。你所缺少的，也許不是能力，而是對自己多一份篤定的信任，以及願意踏出下一步的決心。`,
      money:   `財富是能量的流動，而能量永遠跟著心態走。牌陣幫你看清了方向，而每一個踏實的選擇，才是豐盛真正落地的方式。`,
      health:  `身體不會說謊，它以各種方式傳遞著你內心深處的訊息。牌陣提示你重新審視生活的節奏，給身心多一點溫柔的空間，這才是最根本的照顧。`,
      study:   `學習的成果不只取決於努力，更取決於你對自己學習節奏的認識。牌陣所指的方向，是最符合你天性的學習之道，順著走，才能事半功倍。`,
      other:   `每一次占卜，都是靈魂與自己的誠實對話。這次牌陣所揭示的，也許正是你心中早已知曉、卻需要一個確認的答案。相信你自己。`,
    };
    paras.push(CAT_CLOSING[qCat] || CAT_CLOSING.other);
  }

  return paras.map(p => `<p class="narrative-para">${p}</p>`).join('');
}

function resetNewFlow() {
  FLOW = { step:1, birth:{}, qCat:null, qText:'', deck:[], picked:[], pickedIdx:[], ziweiResult:null };
  const yEl = document.getElementById('bf-year'); if (yEl) yEl.value = '';
  const qEl = document.getElementById('nq-text'); if (qEl) qEl.value = '';
  document.querySelectorAll('.q-cat-btn').forEach(b => b.classList.remove('active'));
  ['result-birth-summary','result-cards-row','new-combined-reading','new-ming-summary']
    .forEach(id => { const e = document.getElementById(id); if (e) e.innerHTML = ''; });
  const sec = document.getElementById('new-ziwei-section');
  if (sec) { sec.style.display = 'none'; sec.style.opacity = '0'; }
  showNewFlowDeckIdle();
  flowGoStep(1);
}

function doQuestionDivination() {
  const question = document.getElementById('q-input').value.trim();
  if (!question) {
    alert('請先輸入你的問題');
    return;
  }

  // 抽3張牌
  const deck = [...TAROT_CARDS];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  const cards = deck.slice(0, 3);
  const reversed = cards.map(() => Math.random() < 0.25);

  // 分析問題類型
  const qType = detectQuestionType(question);

  // 生成解讀
  let html = `<div class="q-result">`;
  html += `<h3>問題：「${question}」</h3>`;
  html += `<p class="q-type-tag">問題類型：${qType.label}</p>`;

  // 顯示牌
  html += `<div class="q-cards">`;
  cards.forEach((card, i) => {
    const isRev = reversed[i];
    const pos = ['情況', '建議', '結果'][i];
    const suitColor = getSuitColor(card);
    html += `
      <div class="q-card" onclick="showCardDetail(${card.id}, ${isRev})">
        <div class="pos-label">${pos}</div>
        <div class="q-card-visual ${isRev ? 'reversed' : ''}" style="--card-color: ${suitColor}">
          <div class="card-symbol">${card.symbol}</div>
          <div class="card-title">${card.name}</div>
          ${isRev ? '<div class="rev-badge">逆</div>' : ''}
        </div>
      </div>
    `;
  });
  html += `</div>`;

  // 解讀文字
  html += `<div class="q-reading">`;
  html += `<h4>占卜解讀</h4>`;

  cards.forEach((card, i) => {
    const isRev = reversed[i];
    const pos = ['目前情況', '建議方向', '可能結果'][i];
    const meaning = isRev ? card.reversed : card.upright;
    html += `
      <div class="q-reading-item">
        <strong>${pos}：${card.name}（${isRev ? '逆位' : '正位'}）</strong>
        <p>${meaning}</p>
      </div>
    `;
  });

  // 針對問題類型的建議
  html += `<div class="q-advice">`;
  html += `<h4>綜合建議</h4>`;
  html += `<p>${generateQuestionAdvice(question, cards, reversed, qType)}</p>`;
  html += `</div>`;

  // 若有紫微命盤，加入相關宮位提示
  if (STATE.ziwei.result) {
    html += generateZiweiCrossRef(qType, STATE.ziwei.result);
  }

  html += `</div></div>`;

  document.getElementById('q-result').innerHTML = html;
}

function detectQuestionType(question) {
  const types = [
    { key: 'love', label: '感情運', keywords: ['愛情', '感情', '戀愛', '男友', '女友', '婚姻', '另一半', '喜歡', '表白', '分手', '復合', '結婚', '伴侶'] },
    { key: 'career', label: '事業運', keywords: ['工作', '事業', '職場', '升職', '加薪', '創業', '換工作', '面試', '老闆', '同事', '職業'] },
    { key: 'money', label: '財運', keywords: ['錢', '財運', '財務', '投資', '理財', '賺錢', '薪水', '股票', '存款', '債務'] },
    { key: 'health', label: '健康運', keywords: ['健康', '身體', '生病', '疾病', '手術', '恢復', '體重', '睡眠'] },
    { key: 'study', label: '學業運', keywords: ['考試', '學業', '讀書', '升學', '成績', '學習', '考研', '論文'] },
  ];

  for (const type of types) {
    if (type.keywords.some(kw => question.includes(kw))) {
      return type;
    }
  }
  return { key: 'general', label: '綜合運勢' };
}

function generateQuestionAdvice(question, cards, reversed, qType) {
  const totalEnergy = cards.map((c, i) => ({
    name: c.name,
    positive: !reversed[i],
    keywords: c.keywords,
  }));

  const positiveCards = totalEnergy.filter(c => c.positive);
  const negativeCards = totalEnergy.filter(c => !c.positive);

  let advice = '';

  if (positiveCards.length >= 2) {
    advice += `整體能量偏向正面，有利於採取行動。${cards[0].name}提示當前的局面，`;
    advice += `${cards[1].name}建議你${positiveCards[1]?.keywords[0] || '靈活應對'}，`;
    advice += `而${cards[2].name}暗示最終走向${positiveCards.length === 3 ? '令人期待' : '需要努力'}。`;
  } else if (negativeCards.length >= 2) {
    advice += `牌陣顯示當前遇到阻礙，建議暫緩重大決定。以開放的心態重新審視問題，`;
    advice += `${cards[1].name}逆位提醒你需要調整${negativeCards[0]?.keywords[0] || '策略'}，才能突破現況。`;
  } else {
    advice += `局面複雜，需要謹慎判斷。正位的${positiveCards.map(c => c.name).join('與')}帶來正面能量，`;
    advice += `逆位的${negativeCards.map(c => c.name).join('與')}則提醒你留意可能的挑戰。`;
  }

  // 按問題類型補充
  const typeAdvice = {
    love: '感情上，建議先誠實面對自己的心，再去期待對方。',
    career: '事業上，踏實努力比投機取巧更能帶來長久的成果。',
    money: '財務上，謹慎理財、避免衝動消費是當前的關鍵。',
    health: '健康方面，身心靈的平衡需要同時照顧，別忽略休息。',
    study: '學業上，專注與持續是通往成功的最短路徑。',
    general: '保持靈活應變的心態，相信自己有能力應對任何挑戰。',
  };
  advice += typeAdvice[qType.key] || typeAdvice.general;

  return advice;
}

function generateZiweiCrossRef(qType, ziweiResult) {
  const relatedPalace = {
    love: '夫妻',
    career: '官祿',
    money: '財帛',
    health: '疾厄',
    study: '官祿',
    general: '命宮',
  }[qType.key] || '命宮';

  const palace = ziweiResult.palaces.find(p => p.name === relatedPalace);
  if (!palace) return '';

  const mainStars = palace.stars.join('、') || '空宮';
  const huaInfo = palace.hua.map(h => `${h.star}${h.hua}`).join('、');

  return `
    <div class="ziwei-crossref">
      <h4>紫微斗數參考</h4>
      <p>根據你的命盤，<strong>${relatedPalace}</strong>（${palace.stem}${palace.branch}）坐有 <strong>${mainStars}</strong>${huaInfo ? `，其中 ${huaInfo}` : ''}。</p>
      <p>命盤與塔羅牌的訊息相互呼應，建議從多角度理解這份解讀。</p>
    </div>
  `;
}

function resetQuestion() {
  document.getElementById('q-input').value = '';
  document.getElementById('q-result').innerHTML = '';
}

// ══════════════════════════════════════════════
//  綜合解讀
// ══════════════════════════════════════════════
function generateCombinedReading() {
  const tarot = STATE.tarot.reading;
  const ziwei = STATE.ziwei.result;

  if (!tarot || !ziwei) {
    document.getElementById('combined-content').innerHTML = `
      <div class="combined-empty">
        <p>請先完成 <strong>塔羅占卜</strong> 和 <strong>紫微排盤</strong>，才能進行綜合解讀。</p>
      </div>
    `;
    return;
  }

  const cards = tarot.cards;
  const reversed = tarot.reversed;

  // 主要分析
  let html = `<div class="combined-reading">`;
  html += `<h3>塔羅 × 紫微 命運交會</h3>`;

  // 塔羅能量分析
  const majorCount = cards.filter(c => c.arcana === 'major').length;
  const positiveCount = cards.filter((_, i) => !reversed[i]).length;

  html += `<div class="combined-section">`;
  html += `<h4>整體能量讀取</h4>`;
  html += `<p>命盤顯示你的五行局為 <strong>${ziwei.juName}</strong>，命宮主星為 <strong>${ziwei.mingMainStar || '空宮'}</strong>。`;
  html += `塔羅牌中${majorCount > 0 ? `出現了 ${majorCount} 張大阿爾克那，暗示重要的業力課題` : '以小阿爾克那為主，呼應日常生活的能量'}。`;
  html += `${positiveCount >= cards.length * 0.7 ? '整體牌氣正面，有利於前進' : '多張逆位牌提示需要內省調整'}。</p>`;
  html += `</div>`;

  // 對應分析
  html += `<div class="combined-section">`;
  html += `<h4>命盤宮位與塔羅對應</h4>`;

  const cardPalacePairs = [
    { card: cards[0], rev: reversed[0], palace: ziwei.palaces.find(p => p.name === '命宮') },
    { card: cards[1], rev: reversed[1], palace: ziwei.palaces.find(p => p.name === '財帛') },
    { card: cards[2], rev: reversed[2], palace: ziwei.palaces.find(p => p.name === '官祿') },
  ].filter((_, i) => i < cards.length);

  const palaceNames = ['命宮（自我）', '財帛宮（財運）', '官祿宮（事業）', '夫妻宮（感情）', '福德宮（精神）'];

  cards.forEach((card, i) => {
    if (i >= palaceNames.length) return;
    const p = ziwei.palaces.find(p2 => p2.name === palaceNames[i].split('（')[0]);
    if (!p) return;
    const stars = p.stars.join('、') || '空宮';
    const isRev = reversed[i];
    html += `
      <div class="pair-item">
        <span class="pair-tarot">${card.name}（${isRev ? '逆' : '正'}）</span>
        <span class="pair-arrow">⟷</span>
        <span class="pair-palace">${p.name}：${stars}</span>
        <p class="pair-analysis">${generatePairAnalysis(card, isRev, p)}</p>
      </div>
    `;
  });

  html += `</div>`;

  // 總結建議
  html += `<div class="combined-section combined-conclusion">`;
  html += `<h4>綜合命運建議</h4>`;
  html += `<p>${generateFinalAdvice(ziwei, cards, reversed)}</p>`;
  html += `</div>`;

  html += `</div>`;

  document.getElementById('combined-content').innerHTML = html;
}

function generatePairAnalysis(card, isReversed, palace) {
  const cardEnergy = isReversed ? '受阻' : '流動順暢';
  const stars = palace.stars.join('與') || '空宮待補';
  const huaList = palace.hua.map(h => h.hua).join('');

  return `${palace.name}坐有${stars}${huaList ? `（${huaList}）` : ''}，與塔羅${card.name}的${card.keywords[0]}能量${cardEnergy}，兩者共同呈現出此領域的運勢走向。`;
}

function generateFinalAdvice(ziwei, cards, reversed) {
  const mingMainStar = ziwei.mingMainStar;
  const juName = ziwei.juName;
  const positiveCards = cards.filter((_, i) => !reversed[i]);

  let advice = `以${juName}格局出生，${mingMainStar ? `命主星${mingMainStar}賦予你獨特的人生特質` : '命宮空宮，需借助對宮星力'}。`;

  advice += `塔羅牌的能量與命盤交織，${positiveCards.length >= 2 ? '整體指向積極正向的發展方向' : '提示你需要在此生課題中深化自我認識'}。`;

  advice += `建議你：在行動前傾聽直覺，在困惑時回到命盤所揭示的本質天賦，相信${mingMainStar || '內在'}的力量引導你前行。`;

  return advice;
}

// 當切換到綜合解讀時自動生成
document.addEventListener('click', e => {
  if (e.target.matches('.nav-btn[data-sec="combined"]')) {
    setTimeout(generateCombinedReading, 100);
  }
});
