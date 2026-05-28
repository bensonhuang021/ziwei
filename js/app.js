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
  const year    = parseInt(document.getElementById('ziwei-year').value);
  const month   = parseInt(document.getElementById('ziwei-month').value);
  const day     = parseInt(document.getElementById('ziwei-day').value);
  const hourRaw = parseInt(document.getElementById('ziwei-hour').value);
  const hour    = hourRaw < 0 ? 6 : hourRaw;
  const hourUnknown = hourRaw < 0;
  const gender  = document.getElementById('ziwei-gender').value;

  // 基本驗證
  if (!year || !month || !day) {
    alert('請填寫完整的農曆生辰資料');
    return;
  }

  try {
    const result = ZW.calculate(year, month, day, hour, gender);
    STATE.ziwei.result = result;
    STATE.ziwei.hourUnknown = hourUnknown;
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
  const hourUnknownNote = STATE.ziwei.hourUnknown
    ? '<p class="hour-unknown-note">⚠️ 時辰不詳，以<strong>午時</strong>估算，命宮等時辰相關宮位可能略有誤差。</p>'
    : '';
  document.getElementById('ming-reading').innerHTML = `
    ${hourUnknownNote}
    <h4>命宮解讀</h4>
    <p>${r.mingReading}</p>
    <h4>四化</h4>
    <div class="sihua-grid">
      ${Object.entries(r.siHua).map(([hua, star]) =>
        `<div class="sihua-item"><span class="hua-name ${hua.replace('化','')}">${hua}</span><span class="hua-star">${star}</span></div>`
      ).join('')}
    </div>
  `;

  // 未來半年運勢
  document.getElementById('future-fortune').innerHTML = generateFutureFortune(r);
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
  // 以春節日期為農曆正月初一，往後每 29.53 天為一個月
  // 精確度：月份誤差 ≤ 1 天（邊界日可能相差一月），農曆日誤差 ≤ 2 天
  // 如需精確，請在「紫微排盤」頁面直接輸入農曆生日
  const idx = gy - 1920;
  const prevIdx = gy - 1 - 1920;

  const birthDate = new Date(gy, gm - 1, gd);

  // 取本年春節 & 前一年春節
  function cnyDate(year) {
    const i = year - 1920;
    if (i < 0 || i >= CNY_DATES.length) return null;
    const [m, d] = CNY_DATES[i];
    return new Date(year, m - 1, d);
  }

  const cnyThis = cnyDate(gy);
  const cnyPrev = cnyDate(gy - 1);

  // 決定農曆年及對應的春節
  let lunarYear, cnyStart;
  if (cnyThis && birthDate >= cnyThis) {
    lunarYear = gy;
    cnyStart  = cnyThis;
  } else if (cnyPrev) {
    lunarYear = gy - 1;
    cnyStart  = cnyPrev;
  } else {
    // 超出範圍：退回粗略值
    return { lunarYear: gy, lunarMonth: gm, lunarDay: Math.min(gd, 30) };
  }

  // 距正月初一的天數（0-indexed）
  const daysSinceCNY = Math.round((birthDate - cnyStart) / 86400000);

  // 每月平均 29.53059 天，推算農曆月份與日期
  const AVG_MONTH = 29.53059;
  const rawMonth  = daysSinceCNY / AVG_MONTH;          // 0-based 月偏移
  const lunarMonth = Math.floor(rawMonth) + 1;          // 1-based
  const lunarDay   = Math.floor(daysSinceCNY - Math.floor(rawMonth) * AVG_MONTH) + 1;

  return {
    lunarYear,
    lunarMonth: Math.max(1, Math.min(lunarMonth, 12)),
    lunarDay:   Math.max(1, Math.min(lunarDay, 30)),
  };
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
  const hourRaw = +document.getElementById('bf-hour').value;
  FLOW.birth = {
    year, month: +document.getElementById('bf-month').value,
    day: +document.getElementById('bf-day').value,
    hour: hourRaw < 0 ? 6 : hourRaw,
    hourUnknown: hourRaw < 0,
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

  const hourLabel = FLOW.birth.hourUnknown ? '時辰不詳（以午時計）' : BRANCHES[hour] + '時';
  document.getElementById('result-birth-summary').innerHTML = `
    <div class="result-birth-tag">
      ${year} 年 ${month} 月 ${day} 日 · ${hourLabel}
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
    const hourUnknownHtml = FLOW.birth.hourUnknown
      ? '<p class="hour-unknown-note" style="margin-top:.6rem">⚠️ 時辰不詳，以午時估算，命宮等宮位可能略有誤差。</p>'
      : '';
    document.getElementById('new-ming-summary').innerHTML = `
      <div class="ziwei-summary" style="margin-top:.8rem">
        <div class="summary-item"><div class="summary-label">農曆年</div><div class="summary-value">${r.yearGanzhi}（${r.zodiac}）</div></div>
        <div class="summary-item"><div class="summary-label">命宮</div><div class="summary-value">${r.mingStem}${r.mingBranch}</div></div>
        <div class="summary-item"><div class="summary-label">五行局</div><div class="summary-value">${r.juName}</div></div>
        <div class="summary-item"><div class="summary-label">命主星</div><div class="summary-value">${r.mingMainStar||'空宮'}</div></div>
      </div>${hourUnknownHtml}`;
    const futureEl = document.getElementById('new-future-fortune');
    if (futureEl) futureEl.innerHTML = generateFutureFortune(r);
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

// 針對問題，將三張牌織成一段連貫的解讀（白話、貼近生活、聚焦問題）
function buildNarrative(cards, origCards, zr) {
  const qText  = FLOW.qText;
  const qCat   = FLOW.qCat;

  const CAT_SUBJECT = {
    love: '感情', career: '事業', money: '財運',
    health: '健康', study: '學業', other: '你問的這件事',
  };
  const subject = CAT_SUBJECT[qCat] || '你問的這件事';
  const qRef = qText ? `「${qText}」` : `你的${subject}問題`;

  const rev  = cards.map(c => c.isRev);
  const orig = origCards;
  const m    = orig.map((c, i) => rev[i] ? c.reversed : c.upright);
  const kw   = orig.map(c => c.keywords);
  const nm   = orig.map(c => c.name);

  const paras = [];

  // ── 段落一：過去牌 × 問題背景 ──
  {
    let p = `先來看${qRef}的背景。「${nm[0]}」出現在過去的位置，`;
    if (rev[0]) {
      p += `而且是逆位。這張牌想告訴你的是：${m[0]}`;
      if (!p.endsWith('。')) p += '。';
      p += `簡單來說，在${subject}這件事上，過去可能有些地方沒有做到位，或者有些決定做了之後留下了遺憾。`;
      p += `「${kw[0][0]}」這個能量雖然你有，但當時沒有辦法完全發揮出來。`;
      p += `先誠實面對這一點，才能讓接下來的方向更清楚。`;
    } else {
      p += `是正位，代表${m[0]}`;
      if (!p.endsWith('。')) p += '。';
      p += `說白話就是：在${subject}這件事上，你過去其實有打好一定的基礎。`;
      p += `「${kw[0][0]}」這個特質已經在你身上了，不要小看自己走過的路，那些都是你今天面對這個問題的底氣。`;
    }
    paras.push(p);
  }

  // ── 段落二：現在牌 × 當前狀況與建議 ──
  {
    let p = `再看現在的狀況。「${nm[1]}」告訴我們：${m[1]}`;
    if (!p.endsWith('。')) p += '。';
    if (rev[1]) {
      p += `逆位的「${nm[1]}」說明你現在在${subject}上感覺有點卡，可能是方向不夠清晰，或者心裡有些糾結沒有解開。`;
      p += `這個時候最好的做法，不是繼續硬撐，而是先停下來想清楚問題出在哪。`;
      p += `把心裡那些亂的東西整理一遍，再決定下一步，這樣走起來才紮實。`;
    } else {
      p += `「${nm[1]}」正位給你的是一個正面的訊號——「${kw[1][0]}」的能量現在正在你身上，`;
      p += `你在${subject}這件事上其實具備了行動的條件。`;
      p += `不要再猶豫了，相信你目前的判斷，有時候想太多反而會錯過時機。`;
    }
    paras.push(p);
  }

  // ── 段落三：未來牌 × 走向與實用建議 ──
  {
    let p = `最重要的，來看${subject}接下來的走向。「${nm[2]}」這張牌說：${m[2]}`;
    if (!p.endsWith('。')) p += '。';
    if (rev[2]) {
      p += `\n接下來這段時間需要多注意——逆位的「${nm[2]}」是在提醒你，如果照目前這樣走下去，${subject}的結果可能不太理想。`;
      if (qCat === 'money') {
        p += `理財或投資方面，這段時間先不要做高風險的操作，設好停損點，保住本金比追求獲利更重要。沒有完全把握的機會，先觀望就好。`;
      } else if (qCat === 'love') {
        p += `感情上，不要急著要一個結果，強求往往適得其反。給對方和自己多一點空間，事情反而容易往好的方向走。`;
      } else if (qCat === 'career') {
        p += `事業上，先避免做出換工作或大幅改變方向的決定，目前低調穩住比冒進更安全。`;
      } else if (qCat === 'health') {
        p += `身體方面要格外注意，不舒服不要拖，及早處理比較好。`;
      } else {
        p += `建議先放慢腳步，多觀察一陣子，等時機更明朗了再做決定。`;
      }
    } else {
      p += `\n這是一個可以樂觀看待的訊號！「${kw[2][0]}」的正向能量往你這個方向來了。`;
      if (qCat === 'money') {
        p += `財運方面，接下來有機會把握到一些不錯的理財機會。方向對了就去做，但記得穩健為主，不要因為看好就忽略了風險控管。`;
      } else if (qCat === 'love') {
        p += `感情上，可以主動一點，對方的回應很可能比你預期的還要正面。`;
      } else if (qCat === 'career') {
        p += `工作上有不錯的發展機會在前面，現在的努力接下來會有回報，繼續保持。`;
      } else if (qCat === 'health') {
        p += `健康狀況在往好的方向走，只要維持現有的好習慣，身體會給你正面的回饋。`;
      } else {
        p += `接下來的發展比你想的要好，放膽去做，時機對了。`;
      }
    }
    paras.push(p);
  }

  // ── 段落四：紫微命盤 × 問題宮位分析 ──
  if (zr) {
    const CAT_PALACE = { love:'夫妻', career:'官祿', money:'財帛', health:'疾厄', study:'官祿', other:'命宮' };
    const palaceName = CAT_PALACE[qCat] || '命宮';
    const palace     = zr.palaces.find(p => p.name === palaceName);
    const mingPalace = zr.palaces.find(p => p.isMing) || zr.palaces[0];
    const mingStars  = mingPalace.stars.length ? mingPalace.stars.join('、') : '空宮';
    const revCount   = cards.filter(c => c.isRev).length;

    let p = `再從你的紫微命盤來看，命宮主星是「${mingStars}」（${zr.juName}）。${zr.mingReading}`;
    if (!p.endsWith('。')) p += '。';

    if (palace && palace.name !== '命宮') {
      const palStars = palace.stars.length ? palace.stars.join('、') : '空宮（借對宮力量）';
      p += `\n跟${subject}最直接相關的宮位是你的${palaceName}（${palace.stem}${palace.branch}），坐有「${palStars}」`;
      if (palace.hua && palace.hua.length) {
        p += `，其中有${palace.hua.map(h => `${h.star}${h.hua}`).join('、')}`;
      }
      p += `。`;

      // 針對理財問題加入星曜具體說明
      if (qCat === 'money' && palace.stars[0]) {
        const MONEY_STAR_TIPS = {
          '武曲': '武曲坐財帛是強財星，本命就有賺錢的能力，方向找對了就容易有成果，可以樂觀看待財運。',
          '天府': '天府坐財帛，理財穩健保守，不容易大起大落，是相對安全的格局，適合做長期穩健的投資。',
          '太陰': '太陰入財帛，財運與感情、家庭有連結，有時財運來自意想不到的人際關係，需要多注意資金流向。',
          '廉貞': '廉貞坐財帛，財富起伏可能較明顯，適合有衝勁的投資，但也要注意不能太衝，要設好風控。',
          '破軍': '破軍坐財帛，財來財去的格局，錢容易進來也容易花掉，需要多注意理財紀律，避免有錢就亂花。',
          '七殺': '七殺入財帛，財富靠自己打拼，需要付出比別人多的努力，但成就感很高，適合主動出擊的理財方式。',
          '貪狼': '貪狼坐財帛，多方面都有財路，有時投資機會來自朋友或社交圈，可以多留意身邊的資訊。',
          '紫微': '紫微坐財帛，財運格局不低，有機會積累財富，但要注意不要因過於自信而忽略潛在風險。',
          '巨門': '巨門入財帛，財運上需要靠口才或溝通能力帶財，可能有一些關於錢的糾紛要多注意。',
          '天同': '天同坐財帛，財運溫和穩定，不大起大落，適合穩健理財，不要為了更高報酬去冒不必要的風險。',
          '天機': '天機坐財帛，財運多變動，適合靈活操作的投資方式，但也容易因想太多而錯失機會，需要多注意執行力。',
          '天梁': '天梁入財帛，常有貴人助財，也可能靠公益或助人的工作帶來財路，保守理財比較適合這個格局。',
          '天相': '天相坐財帛，財運穩定，有貴人相助，合作型的財路對你較為有利。',
          '太陽': '太陽入財帛，財運與事業、名聲連結，事業有成財運自然跟上，可以樂觀看待未來的財運發展。',
        };
        const tip = MONEY_STAR_TIPS[palace.stars[0]];
        if (tip) p += tip;
      }
    }

    if (revCount >= 2) {
      p += `\n命盤加上牌陣，都提醒你這段時間在${subject}上需要多注意，先保守一點、減少冒險，穩住現有的基礎比積極擴張更重要。`;
    } else if (revCount === 0) {
      p += `\n命盤和塔羅牌都指向正向，這是一個難得的好時機，可以樂觀看待${subject}接下來的發展，把握住就好。`;
    } else {
      p += `\n命盤和牌陣的訊息提醒你，${subject}這件事要同時顧到行動和心態調整，兩個都做好，結果才會理想。`;
    }
    paras.push(p);
  }

  // ── 結語（針對問題類型）──
  {
    const CAT_CLOSING = {
      love:    `感情的事，沒有人能百分之百算準。占卜給你的是一個參考方向，而真正決定結果的，是你願意為這段感情付出多少真心和行動。相信自己的感覺，也給對方一點時間。`,
      career:  `職涯的路是走出來的，不是算出來的。牌陣幫你看了現在的狀態，接下來就踏實地每天往目標靠近一步。急不來，但也不能不動。`,
      money:   `投資理財最終靠的是紀律和判斷力，而不是運氣好壞。牌陣給你看了方向，但執行還是靠你自己。設好計畫、控管風險、不要因貪心破壞紀律，才是讓財富穩定成長的根本。`,
      health:  `身體是一切的根本，所有的計畫和夢想都需要健康的身體來支撐。牌陣提醒你要重新關注自己，多照顧一點自己，這是最值得的投資。`,
      study:   `學習的成果不只看有多努力，也要看對的方法和節奏。牌陣幫你看到了目前的狀態，接下來按自己的步調走就好，不用跟別人比，每天進步一點點就夠了。`,
      other:   `每次占卜都是一次誠實面對自己的機會。牌陣說的，也許只是把你心裡已經知道的事說出來而已。相信自己的判斷，那是最不容易出錯的答案。`,
    };
    paras.push(CAT_CLOSING[qCat] || CAT_CLOSING.other);
  }

  return paras.map(p => `<p class="narrative-para">${p}</p>`).join('');
}

// ══════════════════════════════════════════════
//  未來半年運勢分析
// ══════════════════════════════════════════════

const YEARLY_SIHUA_TABLE = {
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

function generateFutureFortune(result) {
  const now = new Date();
  const yr  = now.getFullYear();
  const mo  = now.getMonth() + 1;

  const { stem } = ZW.getStemBranch(yr);
  const yearHua  = YEARLY_SIHUA_TABLE[stem] || {};

  // 計算結束月份標籤
  const endMoRaw = mo + 5;
  const endYr    = endMoRaw > 12 ? yr + 1 : yr;
  const endMo    = ((endMoRaw - 1) % 12) + 1;
  const periodLabel = `${yr} 年 ${mo} 月 ─ ${endYr} 年 ${endMo} 月`;

  // 找出各四化落入哪個宮位
  const huaInPalace = {};
  for (const [hua, star] of Object.entries(yearHua)) {
    for (const palace of result.palaces) {
      if (palace.stars.includes(star) || palace.auxList.includes(star)) {
        huaInPalace[hua] = { palace, star };
        break;
      }
    }
  }

  const luName  = huaInPalace['化祿']?.palace?.name  || '';
  const jiName  = huaInPalace['化忌']?.palace?.name  || '';
  const quanName= huaInPalace['化權']?.palace?.name  || '';
  const keName  = huaInPalace['化科']?.palace?.name  || '';

  // 取各宮位物件
  const caiP  = result.palaces.find(p => p.name === '財帛');
  const guanP = result.palaces.find(p => p.name === '官祿');
  const qiP   = result.palaces.find(p => p.name === '夫妻');
  const jieP  = result.palaces.find(p => p.name === '疾厄');

  // ── 整體運勢 ──
  const PALACE_ZH = {
    '命宮':'整體格局', '財帛':'金錢財運', '官祿':'工作事業', '夫妻':'感情婚姻',
    '福德':'心靈生活', '遷移':'外出人際', '疾厄':'健康身體', '父母':'長輩文書',
    '兄弟':'手足合夥', '子女':'後代創作', '奴僕':'朋友部屬', '田宅':'居家不動產',
  };
  let overallTxt = `今年（${yr} 年 ${stem} 年），流年化祿落入你的${luName}（${PALACE_ZH[luName] || luName}），`;
  overallTxt += `代表這半年在這個領域裡會有比較好的機遇，運氣往往在不經意間為你打開一扇門。`;
  if (quanName) overallTxt += `化權落在${quanName}（${PALACE_ZH[quanName] || quanName}），這個領域今年會有較強的主導力和決斷力，適合積極發揮。`;
  if (keName)   overallTxt += `化科在${keName}（${PALACE_ZH[keName] || keName}），有助於在這方面的聲譽或學習進展。`;
  overallTxt += `另一方面，化忌在${jiName}（${PALACE_ZH[jiName] || jiName}），這個方向需要多留心，`;
  overallTxt += `遇到相關的事情不要衝動，多想一步再行動，通常就能把問題縮小。`;

  // ── 財運 × 工作 ──
  let moneyTxt = '';
  if (luName === '財帛') {
    moneyTxt += `財帛宮今年有化祿加持，是個相對利於理財的時期，收入或投資報酬都可以樂觀看待。但順風時更要保持理性，不要因為一時看好就過度集中押注。`;
  } else if (jiName === '財帛') {
    moneyTxt += `財帛宮今年有化忌，在金錢方面需要多注意，避免衝動消費、高風險操作或借貸。`;
    moneyTxt += `理財以「守住現有」為優先，這半年不是大幅擴張的好時機，穩健保守才是正確姿態。`;
  } else {
    const mainStar = caiP?.stars[0] || '';
    if (['武曲','天府','太陰','祿存'].includes(mainStar)) {
      moneyTxt += `財帛宮有${mainStar}坐守，本身就有一定的理財底子，這半年只要穩紮穩打，財務不會出大問題，可以樂觀看待。`;
    } else if (['七殺','破軍','廉貞'].includes(mainStar)) {
      moneyTxt += `財帛宮有${mainStar}，財運起伏可能比較大，這半年需要多注意支出控管，避免大額借貸或高風險操作。`;
    } else {
      moneyTxt += `財運方面這半年整體平穩，維持正常理財節奏、量入為出就好，不需要特別改變策略。`;
    }
  }
  if (luName === '官祿') {
    moneyTxt += `官祿宮有化祿，工作上的機會比較多，可能有升職、加薪或接到新案子的機會，積極表現會有收穫。`;
  } else if (jiName === '官祿') {
    moneyTxt += `官祿宮有化忌，職場上需要多注意，低調行事、專注本職最安全，避免和同事或主管有不必要的摩擦。`;
  }

  // ── 感情 × 人際 ──
  let loveTxt = '';
  if (luName === '夫妻') {
    loveTxt += `夫妻宮今年有化祿，感情運很不錯，單身的人有機會遇到心動的對象，有伴侶的人則適合趁這段時間增進感情或解決之前的問題，可以樂觀看待。`;
  } else if (jiName === '夫妻') {
    loveTxt += `夫妻宮今年有化忌，感情上容易有一些摩擦或誤解，需要多注意溝通方式，不要讓小事演變成大爭執。話說清楚，少一點猜忌，問題通常就能解決。`;
  } else {
    const mainStar = qiP?.stars[0] || '';
    if (['天同','太陰','天梁','天相'].includes(mainStar)) {
      loveTxt += `夫妻宮坐有${mainStar}，感情偏向溫和穩定，這半年感情生活大致平順，多花時間陪伴，關係自然加溫。`;
    } else if (['廉貞','貪狼','破軍'].includes(mainStar)) {
      loveTxt += `夫妻宮有${mainStar}，感情可能比較熱烈也比較多變，這半年需要多一點耐心，避免因一時衝動說出讓雙方後悔的話。`;
    } else {
      loveTxt += `感情方面這半年沒有特別強烈的波動，適合維持現有關係的節奏，有需要推進的事可以穩步進行。`;
    }
  }
  if (luName === '遷移' || luName === '奴僕') {
    loveTxt += `人際方面今年有化祿助力，容易認識對你有幫助的貴人，社交場合值得多把握。`;
  }

  // ── 健康 × 生活 ──
  let healthTxt = '';
  if (jiName === '疾厄') {
    healthTxt += `疾厄宮今年有化忌，健康方面需要多注意，不舒服的地方要及早就醫，不要拖。`;
    healthTxt += `作息規律、飲食均衡是這半年最重要的功課，不要因為忙碌就犧牲睡眠和飲食。`;
  } else if (luName === '疾厄') {
    healthTxt += `疾厄宮今年有化祿，整體健康狀況不錯，舊傷或慢性問題也有機會改善，可以趁這段時間好好調理身體。`;
  } else {
    if (jieP?.stars.some(s => ['七殺','破軍','廉貞','火星','鈴星'].includes(s))) {
      healthTxt += `疾厄宮的星曜組合提示這半年要注意不要讓自己過度勞累，工作壓力大的時候尤其要留意身體發出的警訊。`;
    } else {
      healthTxt += `健康方面這半年大致穩定，但現代人壓力普遍偏大，仍建議保持好的作息習慣，有不舒服就及早處理。`;
    }
  }

  // ── 需要多注意 ──
  const cautions = [];
  const CAUTION_BY_PALACE = {
    '財帛': '投資或大額消費前要三思，設好停損點，避免因短期波動做出衝動決策',
    '官祿': '職場上說話要謹慎，避免捲入派系鬥爭，低調做事比高調表現更安全',
    '夫妻': '感情上少一點猜忌，有話直說，別讓誤解越積越多',
    '疾厄': '身體有任何不適要早點就醫，不要一拖再拖，定期健康檢查也很重要',
    '遷移': '外出旅行或重大移動計畫要事先評估清楚，注意人身安全',
    '命宮': '心情容易起伏，重大決定不要在情緒高點做，冷靜下來再說',
    '父母': '與長輩或上司溝通要格外細心，避免產生不必要的誤解',
    '兄弟': '與合夥人或兄弟姊妹之間的財務往來要清楚，避免因錢產生嫌隙',
    '福德': '心理壓力可能偏大，適時放鬆很重要，不要讓焦慮影響日常判斷',
    '田宅': '居家環境注意安全和維修，避免意外損失',
    '子女': '對晚輩或自己的創作成果多付出一點關注',
    '奴僕': '交友要謹慎，避免因幫助朋友而捲入不必要的麻煩',
  };
  if (jiName && CAUTION_BY_PALACE[jiName]) cautions.push(CAUTION_BY_PALACE[jiName]);

  const mingP = result.palaces.find(p => p.isMing);
  if (mingP?.stars.includes('七殺') || mingP?.stars.includes('破軍')) {
    cautions.push('個性容易衝動，遇到衝突先深呼吸，給自己緩衝再回應，避免說出後悔的話');
  }
  if (jiName === '財帛' || caiP?.stars.includes('破軍')) {
    cautions.push('財務上不宜進行高風險操作，理財以穩健為主，有紀律才能走得長遠');
  }
  if (cautions.length < 3) cautions.push('睡眠充足是維持好狀態的基礎，再忙也不要犧牲休息');
  if (cautions.length < 3) cautions.push('重要決定多聽幾個信任的人的意見，集思廣益比一個人鑽牛角尖更有效');

  // 組裝 HTML
  const secs = [
    { title: '⭐ 整體運勢概覽', txt: overallTxt },
    { title: '💰 財運 × 工作',  txt: moneyTxt  },
    { title: '💕 感情 × 人際',  txt: loveTxt   },
    { title: '🌿 健康 × 生活',  txt: healthTxt },
  ];

  let html = `<div class="future-fortune-wrap">`;
  html += `<p class="fortune-year-label">${yr} 年（${stem}年）流年四化推算</p>`;
  html += `<p class="fortune-period-label">分析期間：${periodLabel}</p>`;
  secs.forEach(s => {
    html += `<div class="fortune-sec"><div class="fortune-sec-title">${s.title}</div><p>${s.txt}</p></div>`;
  });
  html += `<div class="fortune-sec fortune-caution-sec">`;
  html += `<div class="fortune-sec-title">⚠️ 這半年需要多注意</div>`;
  html += `<ul class="caution-list">${cautions.slice(0,4).map(c => `<li>${c}</li>`).join('')}</ul>`;
  html += `</div></div>`;
  return html;
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
