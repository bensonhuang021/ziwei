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

// ──────────────────────────────────────────────
//  完整個人化解讀引擎
// ──────────────────────────────────────────────

// 依問題、牌組合、命盤星曜動態產生解讀
function buildNarrative(cards, origCards, zr) {
  const qText = (FLOW.qText || '').trim();
  const qCat  = FLOW.qCat || 'other';

  const CAT_SUBJECT = {
    love:'感情', career:'事業', money:'財運',
    health:'健康', study:'學業', other:'你問的這件事',
  };
  const subject = CAT_SUBJECT[qCat] || '你問的這件事';

  // 問題核心文字（去標點，截短）
  const qCore = qText.length > 3
    ? qText.replace(/[？?。！!，,、]/g, '').substring(0, 28)
    : '';
  // 問題引用方式
  const qRef = qCore ? `「${qCore}」` : `你的${subject}`;

  const rev  = cards.map(c => c.isRev);
  const orig = origCards;
  const m    = orig.map((c, i) => rev[i] ? c.reversed : c.upright);
  const kw   = orig.map(c => (c.keywords || []));
  const nm   = orig.map(c => c.name);
  const revCount = rev.filter(Boolean).length;

  // ── 故事弧度 ──
  // breakthrough : 過去逆 + 未來正 → 從困境走出
  // peak_warning : 過去正 + 未來逆 → 高點要留心
  // open_road    : 三張全正 → 順風期
  // deep_review  : 三張全逆 → 需要大幅調整
  // turning_pt   : 現在逆   → 當下關鍵轉折
  // in_between   : 其他
  const arc =
    (rev[0] && !rev[1] && !rev[2]) ? 'breakthrough' :
    (!rev[0] && !rev[1] &&  rev[2]) ? 'peak_warning' :
    (!rev[0] && !rev[1] && !rev[2]) ? 'open_road' :
    ( rev[0] &&  rev[1] &&  rev[2]) ? 'deep_review' :
    (!rev[0] &&  rev[1])            ? 'turning_pt'  : 'in_between';

  const paras = [];

  // ════════════════════════════════════════════
  //  §1  開場：弧度 × 問題類型
  // ════════════════════════════════════════════
  {
    // 不同弧度用不同框架開場
    const arcFrame = {
      open_road:    `三張牌都正位，這不常見，說明能量是通暢的。`,
      breakthrough: `過去那段時間確實走得不容易，但牌陣說你已經過了最難的部分。`,
      peak_warning: `目前的狀態是好的，但未來牌出現了一個提醒，要好好注意。`,
      deep_review:  `三張牌都是逆位，這不是說什麼都不好，而是在告訴你：現在需要先停下來，重新整理。`,
      turning_pt:   `現在牌逆位，說明你正在一個轉折點上，往哪個方向走，接下來的選擇很關鍵。`,
      in_between:   `牌陣的訊息是混合的，有些地方走得順，有些地方還需要調整。`,
    };

    // 依類別加入問題切入語
    const catOpen = {
      love:    `關於感情${qCore ? '和' + qRef + '這件事' : ''}，`,
      career:  `關於事業${qCore ? '和' + qRef + '這個問題' : ''}，`,
      money:   `關於財運${qCore ? '—— ' + qRef : ''}，`,
      health:  `關於健康${qCore ? '和' + qRef + '的問題' : ''}，`,
      study:   `關於學業${qCore ? '和' + qRef + '這件事' : ''}，`,
      other:   qCore ? `關於你問的${qRef}，` : `關於你今天的問題，`,
    };

    let p = arcFrame[arc] + catOpen[qCat];

    if (arc === 'open_road') {
      p += `現在不管是過去累積的基礎、當前的狀態，還是未來的走向，都在往對的方向走。`;
    } else if (arc === 'breakthrough') {
      const card2Name = nm[2]; // 未來正位牌
      p += `「${card2Name}」正位出現在未來，說明前面有明確的轉機，走過來就好。`;
    } else if (arc === 'peak_warning') {
      p += `「${nm[2]}」逆位出現在未來的位置，是一個值得重視的訊號，而不是讓你悲觀的理由——知道了就是優勢。`;
    } else if (arc === 'deep_review') {
      p += `三張逆位讓我想先直接告訴你：現在不是往外衝的時機，而是往內看、重新校準方向的時候。`;
    } else if (arc === 'turning_pt') {
      p += `現在就是一個關鍵的當下，你選擇怎麼應對這個轉折，直接影響接下來的走向。`;
    } else {
      p += `有些部分可以放心，有些部分需要多留意，我分開來跟你說。`;
    }
    paras.push(p);
  }

  // ════════════════════════════════════════════
  //  §2  過去牌：背景與根源
  // ════════════════════════════════════════════
  {
    // 依過去牌逆/正用不同切入語
    const pastPrefix_rev = [
      `先看根源。「${nm[0]}」逆位在過去的位置，`,
      `回頭看這件事的脈絡，「${nm[0]}」逆位說的是：`,
      `過去的狀態——「${nm[0]}」逆位給了一個誠實的回答：`,
    ];
    const pastPrefix_up = [
      `先看你走過來的路。「${nm[0]}」正位在過去，`,
      `過去這段時間，「${nm[0]}」正位說的是：`,
      `在${subject}這件事上，你的起點——「${nm[0]}」正位：`,
    ];

    // 用牌名第一個字的 charCode 來選不同起手式，讓每次牌組合不同就會有不同的語句
    const vi = nm[0].charCodeAt(0) % 3;
    let p = rev[0] ? pastPrefix_rev[vi] : pastPrefix_up[vi];

    // 帶入牌義原文
    p += m[0];
    if (!p.endsWith('。')) p += '。';

    // 依類別加入背景詮釋
    if (rev[0]) {
      const ctx = {
        love:    `在感情上，過去可能有過一段溝通不順暢、或者彼此都沒說清楚的時期，那種卡住的感覺讓這個問題拖到了現在。`,
        career:  `在工作上，過去某個階段努力了但沒看到對應的回報，這種失落感是真的，但它也是讓你重新思考方向的機會。`,
        money:   `財務上，過去可能有過判斷失準的時候，錯過了機會或者多花了不該花的錢，那些都已經過去了，現在的問題是怎麼從這裡出發。`,
        health:  `健康方面，過去可能有些地方一直沒有好好照顧，或者某個問題悶著沒有去處理，累積到現在成了一個隱憂。`,
        study:   `在學習上，過去的節奏或方法有些地方跑掉了，讓你沒辦法發揮出本來有的實力，這個缺口需要認清楚。`,
        other:   `這件事的背景，過去有些地方確實走得不順暢，那個停滯或挫折的感覺是真實的，先承認它，再看怎麼走。`,
      };
      p += ctx[qCat] || ctx.other;
      if (kw[0][0]) p += `「${kw[0][0]}」這個能量當時沒有完全發揮，但這段經歷給了你很多在書本上學不到的東西。`;
    } else {
      const ctx = {
        love:    `感情上，你過去是真的用心在這段關係上的，那份付出是你現在問這個問題的原因，也是你的底氣。`,
        career:  `工作上，你過去打下的基礎是紮實的，那些努力沒有白費，只是有時候成果需要時間才看得見。`,
        money:   `財務上，你過去有在建立自己的基礎——不管是儲蓄習慣、還是對市場的認識，這些都是接下來可以用到的資本。`,
        health:  `健康方面，你過去的狀態有維持住一定的水準，這是一個好的起點，不要輕易讓它垮掉。`,
        study:   `學習上，你過去累積的東西是真實的，那些花過的時間都有意義，不要因為一時的挫折就否定自己。`,
        other:   `在這件事上，你過去是有好好準備的，那些積累是你現在能夠站在這個位置問問題的原因。`,
      };
      p += ctx[qCat] || ctx.other;
    }
    paras.push(p);
  }

  // ════════════════════════════════════════════
  //  §3  現在牌：當下狀態 × 最需要做的事
  // ════════════════════════════════════════════
  {
    const nowPrefix_rev = [
      `來看現在的狀態。「${nm[1]}」逆位說：`,
      `當下這個時間點，「${nm[1]}」逆位很直白地在說——`,
      `現在最需要聽的，是「${nm[1]}」逆位給你的訊號：`,
    ];
    const nowPrefix_up = [
      `現在的牌是「${nm[1]}」正位，`,
      `看當下的狀態，「${nm[1]}」正位給了一個清楚的答案：`,
      `「${nm[1]}」正位站在當下，說的是：`,
    ];

    const vi = nm[1].charCodeAt(0) % 3;
    let p = rev[1] ? nowPrefix_rev[vi] : nowPrefix_up[vi];
    p += m[1];
    if (!p.endsWith('。')) p += '。';

    if (rev[1]) {
      // 逆位現在：依問題給出最直接的行動建議
      const nowAct = {
        love:    qCore
          ? `關於${qRef}，你現在可能感覺有點迷失，或者在等對方給你一個明確的答案。等待的焦慮感是真的，但現在最重要的事不是等——而是先搞清楚你自己真正想要的是什麼，再去面對這段感情。`
          : `感情上你現在有些卡，可能是溝通出了問題，或者心裡有個說不清楚的糾結。現在最重要的事是先把自己的心整理清楚，你真正想要的是什麼？這個問題想清楚了，其他的才看得清。`,
        career:  qCore
          ? `關於${qRef}，你現在可能有種努力了但沒看到明顯進展的感覺，或者對方向感到迷惘。這個時候不要急著做大的改變——先把現在手上的事做好，同時靜下心想清楚你真正想要的目標。`
          : `工作上你現在感覺卡關，可能是付出和回報不成正比，或者對未來的方向不確定。現在不適合倉促做大決定，先聚焦在你能控制的事情上，一件一件地往前走。`,
        money:   qCore
          ? `關於${qRef}，你現在的財務判斷需要多一點謹慎。可能有一個機會看起來不錯，但現在這個時間點不確定性比較高——先冷靜評估風險，不要被表面的好條件沖昏頭。`
          : `財務方面你現在不在最佳判斷狀態，可能有些資訊還不完整，或者心裡有些波動影響了你的決策。這段時間以「守住」為優先，不適合做大規模的操作。`,
        health:  qCore
          ? `關於${qRef}，身體現在發出的訊號不要忽視。及早就醫、及早處理，是現在最正確的選擇，拖延只會讓問題更複雜。`
          : `身體或精神狀態現在有些不在最佳位置，需要認真面對。不舒服的地方要及早處理，不要用「等等看」的心態一直拖，現在的小問題不處理，容易變成大問題。`,
        study:   qCore
          ? `關於${qRef}，學習效率現在可能不是很好，有些東西吸收起來費力，或者動力不足。先找出問題在哪裡——是方法不對？還是基礎有缺漏？找到根本原因再去解決，比硬撐更有效。`
          : `學習狀態現在有些分心或動力不足，這個時候不要逼自己硬撐，先調整一下狀態，找到讓自己可以進入心流的方式，比量更重要的是質。`,
        other:   qCore
          ? `關於${qRef}，你現在可能感覺有些卡或者不確定。先不要急著要一個答案，把眼前的狀況仔細想一遍，通常問題就在那個你一直不想面對的地方。`
          : `現在這件事的能量有些停滯，不是往前也不是往後。先停下來看清楚現在真正的狀況是什麼，然後決定接下來一步，比同時想很多事更有效。`,
      };
      p += nowAct[qCat] || nowAct.other;
    } else {
      // 正位現在：確認優勢，給出行動信心
      const nowAct = {
        love:    qCore
          ? `「${kw[1][0]}」的能量說明你現在在感情上是有能力行動的。關於${qRef}，你不需要再等，現在是一個可以主動表達或者推進的時機。`
          : `感情上你現在具備了可以行動的條件，「${kw[1][0]}」的能量就在你身上。不要再猶豫，相信自己現在的感受，這段感情值得你更投入一點。`,
        career:  qCore
          ? `「${kw[1][0]}」說明你現在在工作上是有優勢的。關於${qRef}，現在是一個值得認真推進的時機，不要讓機會因為猶豫而溜走。`
          : `工作上你現在站在一個有能量的位置，「${kw[1][0]}」和「${kw[1][1] || kw[1][0]}」說明你的條件和方向都對了。有什麼一直在等待的計畫，現在可以開始認真去做。`,
        money:   qCore
          ? `「${kw[1][0]}」說明你現在的判斷力是清晰的。關於${qRef}，現在是可以認真評估和執行的時機，方向對了就去做，但穩健還是第一原則。`
          : `財務方面你現在的判斷力和狀態都不錯，「${kw[1][0]}」說明你有能力做出好的決定。有在考慮的理財方向，現在可以認真去評估。`,
        health:  qCore
          ? `「${kw[1][0]}」說明你現在的狀態有在往好的方向走。關於${qRef}，好好維持現在的生活習慣，身體會給你正面的回饋。`
          : `健康方面現在是一個可以好好調理的時機，「${kw[1][0]}」說明你的狀態有動力往好的方向走，把握這個窗口，讓身體得到它需要的照顧。`,
        study:   qCore
          ? `「${kw[1][0]}」說明你現在的學習狀態是對的。關於${qRef}，現在是把握學習節奏的好時機，繼續這個方向就好。`
          : `學習狀態現在是對的，「${kw[1][0]}」說明你現在有專注和吸收的能力。把這個好狀態用在你最想突破的地方，現在的進展會比平時快。`,
        other:   qCore
          ? `關於${qRef}，「${kw[1][0]}」說明你現在具備了處理這件事所需要的條件。相信自己當下的判斷，是時候採取行動了。`
          : `你現在的狀態是有能量的，「${kw[1][0]}」確認了你目前的條件和方向。現在是行動的好時機，不要讓這個窗口就這樣過去。`,
      };
      p += nowAct[qCat] || nowAct.other;
    }
    paras.push(p);
  }

  // ════════════════════════════════════════════
  //  §4  未來牌：走向 + 具體且個人化的建議
  // ════════════════════════════════════════════
  {
    const futPrefix_rev = [
      `接下來的走向，「${nm[2]}」逆位在說：`,
      `未來的牌是「${nm[2]}」逆位，這很值得重視——`,
      `關於${subject}接下來怎麼走，「${nm[2]}」逆位給了一個清楚的提醒：`,
    ];
    const futPrefix_up = [
      `往前看，「${nm[2]}」正位給的是一個讓人安心的訊號：`,
      `未來的牌「${nm[2]}」正位說：`,
      `「${nm[2]}」正位出現在未來的位置，這很清楚——`,
    ];

    const vi = nm[2].charCodeAt(0) % 3;
    let p = rev[2] ? futPrefix_rev[vi] : futPrefix_up[vi];
    p += m[2];
    if (!p.endsWith('。')) p += '。';

    if (rev[2]) {
      p += `\n需要多注意的幾件事：`;
      const futWarn = {
        love: qCore
          ? `關於${qRef}，如果現在的溝通方式或相處模式不做一些調整，這段感情可能會往一個比較費力的方向走。不是叫你放棄，而是提醒你：感情需要主動維護，不能只等對方。找出那個你們之間一直沒有說清楚的問題，去面對它。另外，強求的結果通常不是你真正想要的——給彼此一點空間，事情反而容易往好的方向轉。`
          : `感情上接下來有一個需要留意的地方。給雙方多一點空間，不要急著要一個明確的答案；如果有話想說，說清楚比悶著好。感情不是等出來的，也不是逼出來的，在對的節奏裡走才走得遠。`,
        career: qCore
          ? `關於${qRef}，「${nm[2]}」逆位在說：這個時間點做這個決定，需要多謹慎。如果是換工作或者轉換方向，先確認你有沒有足夠的準備，倉促出發很容易把舊問題帶到新地方。現在低調行事、把目前手上的事做好，是最安全的策略。`
          : `職場上接下來可能有一些阻力，這段時間不適合做大幅改變，先穩住現有的成果。低調行事、聚焦本職，避免和同事或主管產生不必要的摩擦——這個格局下，先守住才能之後再談發展。`,
        money: qCore
          ? `關於${qRef}，「${nm[2]}」逆位說得很直接：這個時間點這件事的風險比你想的高。如果有正在考慮的投資或理財計畫，這段時間要更嚴格地審查，不要因為看到表面不錯的條件就衝進去。設好停損點，確認自己可以承受最壞的情況再說。`
          : `財務方面接下來需要特別謹慎。高風險的操作這段時間先暫停，手上的錢先以「守住」為主。如果有人帶來投資機會，務必獨立判斷，不要因為信任某個人就忽略了評估風險的步驟。`,
        health: qCore
          ? `關於${qRef}，身體的問題不要再拖了。「${nm[2]}」逆位說的是：現在就去處理，比等到更嚴重了再面對要好得多。作息規律、飲食均衡是這段時間最基本的功課，不要因為忙就犧牲這些。`
          : `健康方面接下來要格外注意。有任何不舒服，及早就醫，不要用「再觀察看看」拖延。這段時間工作或生活的壓力如果比較大，更要留意身體發出的警訊，過度勞累是這個格局最大的隱患。`,
        study: qCore
          ? `關於${qRef}，接下來可能有些壓力或不如預期的結果。這個時候最重要的不是更努力，而是先找出問題在哪裡——是基礎有漏洞？還是應試策略需要調整？找到根源才能解決，硬撐只會越來越累。`
          : `學習方面接下來可能遇到一些挫折，成績或進度不一定如預期。先不要自我否定，去找出真正的問題點，然後針對性地解決。方法對了，結果自然會改變。`,
        other: qCore
          ? `關於${qRef}，「${nm[2]}」逆位提醒你接下來需要多謹慎。在沒有完整信息的情況下不要輕易行動，多觀察一段時間，等局勢更清楚了再說。`
          : `這件事接下來有些不確定性，建議先放慢腳步，多蒐集一些信息和觀察，不要在資訊不夠完整的情況下做重要決定。`,
      };
      p += futWarn[qCat] || futWarn.other;
    } else {
      p += `\n可以樂觀看待：`;
      const futGood = {
        love: qCore
          ? `關於${qRef}，「${nm[2]}」正位說的是：感情接下來往好的方向走。「${kw[2][0]}」和「${kw[2][1] || kw[2][0]}」這兩個關鍵字告訴你，主動一點是值得的——對方的回應很可能比你預期的更正面。如果是單身，接下來有機會認識真正對的人，不要太快就因為一點點不完美而否定每一段緣分。`
          : `感情接下來有往好的方向走的訊號，「${kw[2][0]}」的能量往你這裡聚集。主動一點，多付出一點，有伴侶的人適合趁這段時間深化感情，解決之前一直懸著的問題；單身的人，讓自己多一點開放，對的人可能就在不遠處。`,
        career: qCore
          ? `關於${qRef}，「${nm[2]}」正位說明時機是對的。「${kw[2][0]}」說明接下來你在這個方向上的努力會有相應的回報，現在是往前走的好時機——不要讓猶豫讓機會溜走。`
          : `工作上接下來的走向是正向的，「${kw[2][0]}」確認了你的努力方向是對的。如果有一直在等待的機會、升職的可能，或者想推進的計畫，現在就是去做的時機，時機對了，行動就有意義。`,
        money: qCore
          ? `關於${qRef}，「${nm[2]}」正位說明接下來的方向是可行的。「${kw[2][0]}」說明財運往好的方向走，有在考慮的穩健理財，現在可以認真評估，時機到了就去執行，但穩健永遠是第一原則。`
          : `財運接下來有好的能量，「${kw[2][0]}」和「${kw[2][1] || kw[2][0]}」說明方向是對的。有想做的投資或理財計畫，可以認真評估了。記得：看好一個機會是一回事，控管好風險是另一回事，兩件事都要做到。`,
        health: qCore
          ? `關於${qRef}，「${nm[2]}」正位說明健康方面接下來有往好的方向走的跡象。好好維持現在的作息和生活習慣，身體會給你正面的回饋，也可以趁這段好時機認真調理一些一直放著的小問題。`
          : `健康方面接下來狀況不錯，「${kw[2][0]}」說明身體的狀態在往對的方向走。如果有舊傷或一直在忙所以擱置的健康問題，現在趁好時機去調理，效果會比平時好。`,
        study: qCore
          ? `關於${qRef}，「${nm[2]}」正位說明你的努力接下來會在成績或能力上體現出來。「${kw[2][0]}」確認了你現在的方向是對的，繼續保持，不要因為看到一點進步就鬆懈。`
          : `學習方面接下來有正向的發展，「${kw[2][0]}」說明你現在的努力方式是有效果的，接下來會看到成果。保持節奏和紀律，這段時間是一個難得的學習視窗，好好用它。`,
        other: qCore
          ? `關於${qRef}，「${nm[2]}」正位說：接下來的發展比你想的要好，方向是對的。按照你現在的判斷去做，「${kw[2][0]}」這個能量會支持著你。`
          : `這件事接下來的走向是好的，「${kw[2][0]}」和「${kw[2][1] || kw[2][0]}」說明能量往你這個方向走。把手上該做的事做好，結果不會讓你失望。`,
      };
      p += futGood[qCat] || futGood.other;
    }
    paras.push(p);
  }

  // ════════════════════════════════════════════
  //  §5  紫微命盤：個人先天格局 × 塔羅交叉確認
  // ════════════════════════════════════════════
  if (zr) {
    const CAT_PALACE = { love:'夫妻', career:'官祿', money:'財帛', health:'疾厄', study:'官祿', other:'命宮' };
    const palaceName = CAT_PALACE[qCat] || '命宮';
    const palace     = zr.palaces.find(p => p.name === palaceName);
    const mingPalace = zr.palaces.find(p => p.isMing) || zr.palaces[0];
    const mingStars  = mingPalace.stars.length ? mingPalace.stars.join('、') : '空宮';

    // 橋接語依牌陣正負調整語氣
    const bridge =
      revCount === 0 ? `塔羅牌已經給了一個清楚的正向確認，再搭配你的紫微命盤來看，這個方向更明確了。` :
      revCount >= 2  ? `牌陣的提醒搭配你的命盤一起看，能理解為什麼這段時間${subject}走得比較費力。` :
                       `結合你的紫微命盤，可以把牌陣說的事看得更清楚一些。`;

    let p = bridge;

    // 命宮主星簡述（截短，避免與 §4 重複太多內容）
    const mingReadShort = zr.mingReading.replace(/^命宮坐[^，。]+[，。]\s*/, '').substring(0, 60);
    p += `你的命宮主星是「${mingStars}」（${zr.juName}），先天個性上${mingReadShort}`;
    if (!p.endsWith('。')) p += '。';

    // 問題宮位解析
    if (palace && palace.name !== '命宮') {
      const palStars = palace.stars.length ? palace.stars.join('、') : '';
      const palHua   = palace.hua && palace.hua.length
        ? `，帶有${palace.hua.map(h => `${h.star}${h.hua}`).join('、')}` : '';

      const palIntro = {
        love:    `\n感情方面，你的夫妻宮（${palace.stem}${palace.branch}）`,
        career:  `\n事業方面，你的官祿宮（${palace.stem}${palace.branch}）`,
        money:   `\n財務方面，你的財帛宮（${palace.stem}${palace.branch}）`,
        health:  `\n健康方面，你的疾厄宮（${palace.stem}${palace.branch}）`,
        study:   `\n學業方面，你的官祿宮（${palace.stem}${palace.branch}）`,
        other:   `\n你的${palaceName}（${palace.stem}${palace.branch}）`,
      };
      p += palIntro[qCat] || palIntro.other;

      if (palStars) {
        p += `坐有「${palStars}」${palHua}。`;
        p += getPalaceStarTip(palStars.split('、')[0], qCat, revCount);
      } else {
        p += `是空宮，靠對宮能量輔助，這讓你在${subject}的格局上比較靈活，但也更容易受外在環境影響，需要自己多建立清楚的判斷標準。`;
      }
    }

    // 命盤 + 牌陣的統一結論
    const synthLine = {
      open_road:   `命盤和牌陣指向同一個正向訊號，這種雙重確認難得，在${subject}上現在是有條件往前走的。`,
      breakthrough:`命盤的先天格局加上牌陣說的轉機，你走出困境的條件已經具備，現在就是行動的時候。`,
      peak_warning:`命盤提醒你先天上在${subject}有一定的潛力，但這個潛力需要你在這段時間保持謹慎才能守住。`,
      deep_review: `命盤和牌陣都在說同一件事：現在是重新整理、重新校準的時候，不是往外衝的時機。`,
      turning_pt:  `從命盤來看，你在${subject}這件事上有先天的條件，但能不能發揮出來，這個轉折點的選擇很關鍵。`,
      in_between:  `命盤和牌陣都提醒你：${subject}的事需要同時顧到行動力和謹慎心，兩邊都兼顧，才能走出最好的結果。`,
    };
    p += `\n${synthLine[arc] || synthLine.in_between}`;
    paras.push(p);
  }

  // ════════════════════════════════════════════
  //  §6  結語：弧度 × 類別 × 問題文字
  // ════════════════════════════════════════════
  {
    // 依弧度選結語基調
    const arcClose = {
      open_road: {
        love:    `感情上時機對了，剩下的就是你願不願意放開手去好好珍惜。`,
        career:  `職場上順風的時候也要保持穩健，把這段好時期的成果紮紮實實地沉澱下來。`,
        money:   `財運好的時候更要有紀律，順風不代表可以忽略風險，穩健地把握才是真正的贏家。`,
        health:  `身體狀態好的時候，更要把好習慣維持住，這是最值得的長期投資。`,
        study:   `學習有動力有成效的時候，就是衝的時候，把這個節奏繼續保持下去。`,
        other:   `方向對了，現在就是行動的時候。相信自己的判斷，往前走就好。`,
      },
      breakthrough: {
        love:    `走過了不容易的時期，你對感情的理解比以前深了。前面有轉機，去把握它，那是你應得的。`,
        career:  `走過那段卡關的時間，你現在知道自己要什麼了。接下來就專心往那個方向走，不用再回頭看。`,
        money:   `財務上走過了一段辛苦的學習期，現在的你判斷力比以前強。接下來用正確的方法穩健地往前走。`,
        health:  `身體走過了一段不容易的時期，現在開始認真調養，把失去的補回來。`,
        study:   `走出了學習的低潮，你現在的基礎比你以為的更紮實。把這份底氣用在接下來的學習上。`,
        other:   `走過最難的部分，現在的你已經準備好了。前面有好的東西在等你，去迎接它。`,
      },
      peak_warning: {
        love:    `現在這段感情有一定的基礎，值得好好保護。那個「需要注意」的地方，趕快去面對和解決它。`,
        career:  `職場上現在的成果是真實的，不要讓輕敵或大意把它毀掉。穩住，才能繼續往上走。`,
        money:   `財務上已經有了一定的積累，現在最重要的是保護好它，不要因為貪心破壞了原本的好局面。`,
        health:  `健康打好基礎的時候，最忌諱的是輕忽。身體的訊號要繼續重視，不要因為狀況好了就放鬆。`,
        study:   `學習上已經有好的進展，現在要維持住這個節奏，不要讓驕傲或鬆懈中斷了這段好勢頭。`,
        other:   `現在的好，需要你用心維護。那個被提醒的地方，去面對它，你有能力處理好。`,
      },
      deep_review: {
        love:    `感情上的困難，往往是讓彼此更了解對方的機會。先把自己照顧好，再去談關係。`,
        career:  `職涯遇到瓶頸，不是終點，而是讓你重新思考方向的機會。把這段時間用在梳理和充電上，之後再出發。`,
        money:   `財務遇到挫折，最重要的是先止損、再復盤，找出問題在哪裡，才能真正避免重蹈覆轍。`,
        health:  `身體在提醒你，現在需要好好照顧自己了，這是最重要的事，其他的都可以等一等。`,
        study:   `學習上的瓶頸是很正常的過程，先停下來搞清楚問題在哪裡，然後針對性地解決，比蠻幹更有效。`,
        other:   `每次重新整理，都是為了走得更遠。現在先停下來，把方向校準對了，才能在對的路上加速。`,
      },
      turning_pt: {
        love:    `感情的轉折點往往是考驗也是機會，你現在選擇怎麼面對，會決定這段感情的走向。`,
        career:  `職涯的轉折點來了，怎麼應對這個時刻，影響的是你接下來一段時間的走向，認真對待它。`,
        money:   `財務的轉折點，就是考驗判斷力和紀律的時候。冷靜、謹慎、按計畫走，是現在最正確的策略。`,
        health:  `身體在轉折點發出的訊號，值得你放下手上的事，好好去處理。健康是所有事情的基礎。`,
        study:   `學習遇到轉折點是正常的，你現在的選擇——是繼續照舊還是做出調整——會直接影響接下來的成果。`,
        other:   `轉折點就是選擇的時候，認真想清楚你真正想要的方向，然後去做，不要讓恐懼讓你原地踏步。`,
      },
      in_between: {
        love:    `感情沒有標準答案，牌陣給你的是一個方向。最終還是要靠你對這個人、對這段關係的感覺，那是最不容易騙人的答案。`,
        career:  `職涯的路是一步一步走出來的，牌陣幫你看了現在的狀態，接下來就踏實地每天往目標靠近一步，急不來，但也不能不動。`,
        money:   `投資理財靠的是長期紀律，不是短期運氣。牌陣給了你方向，執行靠你自己，設好計畫，控管風險，別讓貪心破壞原來的節奏。`,
        health:  `身體是所有計畫的底，先照顧好自己，才能照顧好其他的事。`,
        study:   `學習的節奏不用跟任何人比，按自己的步調走，每天進步一點點，積累起來的差距會讓你驚訝。`,
        other:   `占卜說的，有時只是把你心裡已經知道的事說出來。相信自己的判斷，那是最不容易出錯的答案。`,
      },
    };

    const arcSet = arcClose[arc] || arcClose.in_between;
    let p = arcSet[qCat] || arcSet.other;

    // 如有具體問題，加一句直接呼應
    if (qCore) {
      p += `\n今天${qRef}的問題，以上就是牌陣和命盤給你的完整回答，希望對你有幫助。`;
    }
    paras.push(p);
  }

  return paras.map(p => `<p class="narrative-para">${p}</p>`).join('');
}

// 取得特定宮位主星對特定問題類型的詮釋
function getPalaceStarTip(star, qCat, revCount) {
  const isWarn = revCount >= 2;
  const tips = {
    love: {
      '紫微': isWarn ? '紫微坐夫妻，感情標準高，現在要注意別因太過堅持自己的標準而忽略了對方真實的需求。' : '紫微坐夫妻，你對感情的要求高，一旦認定了會很投入，這段感情有你想要的深度。',
      '天機': isWarn ? '天機坐夫妻，感情上你想太多，現在容易因為過度解讀而讓感情失去溫度，試著放下分析，多一點直覺和行動。' : '天機坐夫妻，感情上你很細心，容易感受到對方的變化，這是你的優勢，善加利用。',
      '太陽': isWarn ? '太陽入夫妻，感情有時候熱情但也容易讓對方有壓迫感，這段時間多給對方一點空間。' : '太陽入夫妻，感情明亮，對方通常開朗積極，現在有往好的方向走的能量。',
      '武曲': isWarn ? '武曲坐夫妻，重實際輕浪漫，現在要注意是否因太過著重實務而忽略了感情裡需要的溫度。' : '武曲坐夫妻，感情重行動輕言語，你用行動証明的愛是真的，對方感受得到。',
      '天同': isWarn ? '天同坐夫妻，容易為了維持和平而不說清楚，長期累積下來的問題現在需要鼓起勇氣去面對。' : '天同坐夫妻，感情溫和有默契，這份和諧是你們關係的基礎，好好珍惜。',
      '廉貞': isWarn ? '廉貞入夫妻，感情熱烈也容易爆發衝突，現在需要特別注意情緒控管，激動的時候先冷靜再說。' : '廉貞入夫妻，感情有熱度，雙方都有熱情投入，這是感情保鮮的關鍵。',
      '天府': isWarn ? '天府坐夫妻，感情穩定但也容易變成各自過日子，現在要注意是否少了主動經營的動力。' : '天府坐夫妻，感情有安全感，是很好的長期伴侶格局。',
      '太陰': isWarn ? '太陰入夫妻，非常敏感，現在容易過度解讀對方的一舉一動，建議直接說清楚，少猜測。' : '太陰入夫妻，感情細膩真誠，你對這段感情的用心對方是感受得到的。',
      '貪狼': isWarn ? '貪狼坐夫妻，桃花多，這段時間要注意感情的專注度，不要因為外在的誘惑讓現有的關係受損。' : '貪狼坐夫妻，桃花運旺，魅力加分，接下來感情上有不少好的能量。',
      '巨門': isWarn ? '巨門入夫妻，容易有口舌，現在要注意說話方式，有話說清楚，但注意語氣。' : '巨門入夫妻，感情靠溝通維繫，你的口才是感情上的優勢，好好表達你的感受。',
      '天相': isWarn ? '天相坐夫妻，重誠信，現在這段感情需要雙方都拿出更多的誠意和透明度。' : '天相坐夫妻，感情正直穩定，對方對你是真誠的，可以放心。',
      '天梁': isWarn ? '天梁入夫妻，有時候感情上比較像兄長或師長而非平等的伴侶，注意是否關係不夠對等。' : '天梁入夫妻，有照顧型的感情特質，互相依靠的感情很穩固。',
      '七殺': isWarn ? '七殺坐夫妻，獨立性強，現在可能感覺彼此距離有點遠，主動縮短距離比等對方先動更有效。' : '七殺坐夫妻，雙方都有自主性，這讓感情有健康的空間，不依賴不沉悶。',
      '破軍': isWarn ? '破軍入夫妻，感情多波折，現在這個低潮是這個格局的一部分，不代表結束，代表要做出改變。' : '破軍入夫妻，感情韌性強，走過波折反而讓關係更深，現在是往好的方向走的時候。',
    },
    career: {
      '紫微': isWarn ? '紫微坐官祿，有領導力，但現在要注意是否過度自信而忽略了身邊人的意見。' : '紫微坐官祿，工作上有格局，適合管理和領導，接下來有機會讓能力被看見。',
      '天機': isWarn ? '天機坐官祿，想法多點子多，但現在要注意執行力，想太多做太少是這個格局的風險。' : '天機坐官祿，靈活善謀，適合需要動腦的工作，思維優勢正在發揮。',
      '太陽': isWarn ? '太陽入官祿，喜歡曝光和表現，但現在低調行事比高調出頭更安全。' : '太陽入官祿，工作上光明磊落，社交能力是職場的最大優勢，接下來適合多拓展人脈。',
      '武曲': isWarn ? '武曲坐官祿，目標導向，但現在需要注意衝勁過猛而引起不必要的摩擦。' : '武曲坐官祿，執行力強，努力就有回報，接下來的工作成果會讓你滿意。',
      '天同': isWarn ? '天同坐官祿，不適合高壓環境，現在的職場壓力可能讓你感到疲憊，要注意不要讓工作壓力影響健康。' : '天同坐官祿，適合服務型工作，現在的職場環境對你是友善的，把握這份和諧。',
      '廉貞': isWarn ? '廉貞入官祿，有衝勁但也容易樹敵，這段時間低調為佳，避免和同事或主管發生衝突。' : '廉貞入官祿，工作上衝勁足，競爭力強，接下來適合積極爭取機會。',
      '天府': isWarn ? '天府坐官祿，穩重有威儀，現在要注意是否因過於保守而錯過了應該抓住的機會。' : '天府坐官祿，工作態度嚴謹可靠，適合公職或管理職，接下來有穩定發展的好格局。',
      '貪狼': isWarn ? '貪狼坐官祿，多才多藝，現在要注意方向太分散，集中火力在一個重點上會比到處嘗試更有效。' : '貪狼坐官祿，才華多元，社交廣，接下來工作上有機會從人際關係中帶來新機遇。',
      '七殺': isWarn ? '七殺坐官祿，獨立衝勁強，現在這段時間適合獨立作業，避免和別人的目標衝突。' : '七殺坐官祿，開創力強，最適合自主作業或創業，接下來有機會在事業上做出突破。',
      '破軍': isWarn ? '破軍入官祿，工作上多變動，現在這個不穩定感是這個格局的一部分，先穩住再想新的方向。' : '破軍入官祿，工作上多變化，適合開創性的工作，接下來是推進新計畫的好時機。',
    },
    money: {
      '武曲': isWarn ? '武曲坐財帛是強財星，本身有賺錢的能力，但現在這段時間要注意不要因為過於自信而做出超出風險承受能力的決策。' : '武曲坐財帛是強財星，本命就有賺錢的能力，方向找對了就容易有成果，可以相對樂觀看待財運。',
      '天府': isWarn ? '天府坐財帛，理財穩健，這個穩健的特質現在特別重要，守住現有的基礎，不要被高報酬的誘惑影響。' : '天府坐財帛，理財穩健保守，不容易大起大落，是相對安全的格局，適合長期穩健投資。',
      '太陰': isWarn ? '太陰入財帛，財運與人際有連結，這段時間要特別注意是否因情感因素而做出不理性的財務決定。' : '太陰入財帛，財運有時來自意想不到的人際關係，多維護好身邊的貴人關係，財路自然開。',
      '廉貞': isWarn ? '廉貞坐財帛，財富起伏大，現在這個低點要先穩住，設好停損，不要抱著「再撐一下就好」的心態繼續冒險。' : '廉貞坐財帛，財富有衝勁，方向對的時候成果明顯，現在是評估好機會去執行的時候。',
      '破軍': isWarn ? '破軍坐財帛，財來財去，這段時間要特別注意支出，每一筆大額花費都要問自己是否真的必要。' : '破軍坐財帛，財路多元，但也需要有意識地培養理財紀律，才能讓進來的錢留下來。',
      '七殺': isWarn ? '七殺入財帛，財運靠努力打拼，現在這段時間先守住本金，積累實力，等時機更好了再出手。' : '七殺入財帛，財運靠自己的努力，付出就有回報，現在是積極出擊的好時機。',
      '貪狼': isWarn ? '貪狼坐財帛，財路多但也容易分散，現在要謹慎評估身邊朋友帶來的投資機會，不要因為信任就跳過風險評估。' : '貪狼坐財帛，財路多元，社交圈帶來財路的機會高，留意身邊的好機會，但要獨立判斷。',
      '紫微': isWarn ? '紫微坐財帛，格局不低，但現在要注意過度自信帶來的風險，謹慎比冒進更安全。' : '紫微坐財帛，財運格局好，有機會積累財富，維持判斷力和理財紀律，財運自然跟上。',
      '天同': isWarn ? '天同坐財帛，財運穩定，這段時間就是要維持這個穩定，不要冒不必要的風險破壞它。' : '天同坐財帛，財運溫和穩定，穩健理財是這個格局最對的方式，不求大富但生活無虞。',
      '天機': isWarn ? '天機坐財帛，財運多變動，現在這個不確定期先觀望，等方向更清楚了再行動，不要倉促出手。' : '天機坐財帛，財路靈活多元，適合靈活操作，但執行力是關鍵，有好機會就去做不要猶豫。',
      '巨門': isWarn ? '巨門入財帛，現在要特別注意財務上的糾紛和口舌，合約和借貸要看清楚再簽。' : '巨門入財帛，靠口才和溝通帶財，業務或顧問型的財路適合你。',
      '天梁': isWarn ? '天梁入財帛，有時靠貴人助財，但現在要注意不要過度依賴別人的建議，要有自己的判斷。' : '天梁入財帛，貴人助財的機率高，也可能從公益或助人的工作帶來財路。',
      '天相': isWarn ? '天相坐財帛，財運穩定，現在這段時間維持現有的理財節奏，不要輕易做出改變。' : '天相坐財帛，財運穩定，合作型的財路適合你，一起做事比單打獨鬥更有財運。',
      '太陽': isWarn ? '太陽入財帛，財運和事業名聲連結，現在先把事業做好，財運才會跟上，不要本末倒置。' : '太陽入財帛，財運隨事業一起成長，事業發展好財運自然跟上，可以樂觀看待。',
    },
    health: {
      '太陰': isWarn ? '太陰入疾厄，情緒和心理狀態對身體影響大，現在要特別注意不要讓情緒壓力轉化成身體的問題。' : '太陰入疾厄，注意情緒和睡眠，把這兩件事顧好，身體狀態就會比較穩定。',
      '天同': isWarn ? '天同坐疾厄，消化系統容易出問題，現在要特別注意飲食，不規律的吃喝習慣要改。' : '天同坐疾厄，消化和腸胃是需要維護的部位，規律飲食是最好的保養方式。',
      '武曲': isWarn ? '武曲坐疾厄，這段時間要注意骨骼和呼吸系統，工作壓力轉化成身體問題的風險要留意。' : '武曲坐疾厄，骨骼和呼吸系統要定期保養，整體健康靠的是持之以恆的好習慣。',
      '廉貞': isWarn ? '廉貞入疾厄，情緒和心血管是需要注意的地方，這段時間不要讓壓力長期累積，找到出口釋放它。' : '廉貞入疾厄，注意情緒管理和心血管健康，規律運動是最好的解壓方式。',
      '貪狼': isWarn ? '貪狼坐疾厄，生活習慣不規律對身體影響大，現在要特別建立固定的作息，讓身體得到足夠的休息。' : '貪狼坐疾厄，規律作息和飲食是健康關鍵，把生活節奏調整好，身體狀態會大幅改善。',
      '七殺': isWarn ? '七殺入疾厄，這段時間要注意不要過度勞累，意外傷害的風險也要留意，不要逞強。' : '七殺入疾厄，注意不要過度消耗體力，適時休息才能讓身體長期保持良好狀態。',
      '破軍': isWarn ? '破軍坐疾厄，健康起伏大，現在這個不好的時期要及早就醫，定期檢查比亡羊補牢好。' : '破軍坐疾厄，定期做健康檢查是這個格局最重要的保健習慣，及早發現及早處理。',
      '天機': isWarn ? '天機入疾厄，過度思考和焦慮是這個格局的健康隱患，現在要學會讓腦袋放鬆，睡眠品質是關鍵指標。' : '天機入疾厄，神經系統和睡眠是需要照顧的部分，讓腦袋得到足夠休息，是最好的健康投資。',
    },
  };

  const catTips = tips[qCat];
  if (!catTips) return '';
  return catTips[star] || '';
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
