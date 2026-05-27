// 78 張塔羅牌完整資料
const TAROT_CARDS = [
  // ── 大阿爾克那 Major Arcana (0-21) ──
  {
    id: 0, name: '愚者', name_en: 'The Fool', number: '0', arcana: 'major',
    symbol: '🌟', color: '#f0d060',
    keywords: ['新開始', '冒險', '自由'],
    upright: '全新的旅程正在展開，帶著純真與好奇心踏入未知。此刻是勇敢冒險、相信直覺的時機，不要讓恐懼阻止你前進。',
    reversed: '衝動魯莽導致不必要的風險，或因過度謹慎而錯失良機。需要在自由與責任之間找到平衡。'
  },
  {
    id: 1, name: '魔術師', name_en: 'The Magician', number: 'I', arcana: 'major',
    symbol: '✨', color: '#f0d060',
    keywords: ['意志力', '技巧', '行動'],
    upright: '你擁有實現目標所需的一切資源與能力。此刻是將想法化為行動的最佳時機，專注意志，展現才華。',
    reversed: '才能未被善用，或有人以技巧欺騙你。警惕自我欺騙，確認動機是否真誠。'
  },
  {
    id: 2, name: '女祭司', name_en: 'The High Priestess', number: 'II', arcana: 'major',
    symbol: '🌙', color: '#f0d060',
    keywords: ['直覺', '神秘', '內在智慧'],
    upright: '深層的直覺與潛意識正在引導你。靜心傾聽內在聲音，答案藏於內心而非外部世界。',
    reversed: '忽略直覺的警示，過度依賴外在意見。隱藏的資訊即將浮現，保持警覺。'
  },
  {
    id: 3, name: '女皇', name_en: 'The Empress', number: 'III', arcana: 'major',
    symbol: '🌿', color: '#f0d060',
    keywords: ['豐盛', '母性', '創造力'],
    upright: '豐盛與創造能量圍繞著你。此刻適合孕育新計劃、滋養人際關係，感受大自然的美好與富饒。',
    reversed: '創造力受阻或過度依賴他人。需要重新連結自身的豐盛感，避免過度付出而忘了照顧自己。'
  },
  {
    id: 4, name: '皇帝', name_en: 'The Emperor', number: 'IV', arcana: 'major',
    symbol: '👑', color: '#f0d060',
    keywords: ['權威', '穩定', '結構'],
    upright: '以理性與秩序建立穩固的基礎。設立清晰的界限與規則，展現領導力，承擔責任。',
    reversed: '過度控制或剛愎自用導致關係緊張。需要在權威與靈活之間取得平衡。'
  },
  {
    id: 5, name: '教皇', name_en: 'The Hierophant', number: 'V', arcana: 'major',
    symbol: '⛪', color: '#f0d060',
    keywords: ['傳統', '信仰', '精神導師'],
    upright: '傳統智慧與精神指引帶來穩定力量。尋求導師的教誨，或遵循已驗證的道路前行。',
    reversed: '質疑既有體制或打破傳統的時機到來。探索個人的靈性道路，不必受限於外在教條。'
  },
  {
    id: 6, name: '戀人', name_en: 'The Lovers', number: 'VI', arcana: 'major',
    symbol: '❤️', color: '#f0d060',
    keywords: ['愛情', '選擇', '靈魂連結'],
    upright: '重要的選擇與深刻的連結。這可能關乎愛情或價值觀的抉擇，遵從內心最真實的渴望。',
    reversed: '價值觀衝突或錯誤的選擇帶來後悔。重新審視你的核心需求，避免妥協真實的自我。'
  },
  {
    id: 7, name: '戰車', name_en: 'The Chariot', number: 'VII', arcana: 'major',
    symbol: '🏆', color: '#f0d060',
    keywords: ['勝利', '意志力', '決心'],
    upright: '以堅定的意志克服障礙，勝利在望。集中所有能量朝目標前進，不允許任何事物阻擋你的腳步。',
    reversed: '失去方向感或意志力薄弱。過於衝動的行動可能導致失控，需要重新找回內在的掌舵力。'
  },
  {
    id: 8, name: '力量', name_en: 'Strength', number: 'VIII', arcana: 'major',
    symbol: '🦁', color: '#f0d060',
    keywords: ['勇氣', '內在力量', '慈悲'],
    upright: '以溫柔的力量和內在勇氣面對挑戰。真正的強大來自慈悲與耐心，而非蠻力。',
    reversed: '自我懷疑或內在衝突削弱你的力量。相信自己有能力克服恐懼，找回內在的安全感。'
  },
  {
    id: 9, name: '隱士', name_en: 'The Hermit', number: 'IX', arcana: 'major',
    symbol: '🕯️', color: '#f0d060',
    keywords: ['內省', '孤獨', '智慧'],
    upright: '需要獨處與內省的時期。暫時退出喧囂，深化自我了解，智慧在靜默中顯現。',
    reversed: '過度孤立或拒絕接受他人指引。適度的孤獨是健康的，但不要讓退縮成為逃避。'
  },
  {
    id: 10, name: '命運之輪', name_en: 'Wheel of Fortune', number: 'X', arcana: 'major',
    symbol: '☸️', color: '#f0d060',
    keywords: ['命運', '轉折', '循環'],
    upright: '命運的輪盤正在轉動，帶來重大的轉機與改變。順應宇宙的流動，時機已然成熟。',
    reversed: '逆境當前，但這只是循環的一部分。抗拒改變只會加劇痛苦，接受無常才是智慧。'
  },
  {
    id: 11, name: '正義', name_en: 'Justice', number: 'XI', arcana: 'major',
    symbol: '⚖️', color: '#f0d060',
    keywords: ['公平', '真相', '因果'],
    upright: '公平與真相將得到彰顯。法律、合約或重要決定需要誠實與公正，業力正在運作。',
    reversed: '不公正的對待或逃避責任。面對自己行為的後果，真相終將浮現。'
  },
  {
    id: 12, name: '吊人', name_en: 'The Hanged Man', number: 'XII', arcana: 'major',
    symbol: '🔄', color: '#f0d060',
    keywords: ['犧牲', '等待', '新視角'],
    upright: '暫停與等待帶來新的洞見。以不同的角度看待問題，有時放下才能獲得真正的自由。',
    reversed: '無謂的犧牲或長期的停滯。評估當前的犧牲是否有意義，避免在無益的境況中空耗。'
  },
  {
    id: 13, name: '死神', name_en: 'Death', number: 'XIII', arcana: 'major',
    symbol: '🌑', color: '#f0d060',
    keywords: ['結束', '轉變', '蛻變'],
    upright: '舊的章節即將結束，為新的開始騰出空間。接受必要的結束，蛻變後將迎來嶄新的面貌。',
    reversed: '抗拒必要的改變導致停滯不前。放下過去的執著，才能讓生命之流繼續前進。'
  },
  {
    id: 14, name: '節制', name_en: 'Temperance', number: 'XIV', arcana: 'major',
    symbol: '⚗️', color: '#f0d060',
    keywords: ['平衡', '耐心', '融合'],
    upright: '以耐心和節制調和生活中的各種元素。中庸之道帶來和諧，長期目標正穩步實現。',
    reversed: '失衡與過度放縱打亂節奏。重新調整生活方式，找回內心的平靜與方向感。'
  },
  {
    id: 15, name: '惡魔', name_en: 'The Devil', number: 'XV', arcana: 'major',
    symbol: '⛓️', color: '#f0d060',
    keywords: ['束縛', '物質', '陰影'],
    upright: '審視那些束縛你的習慣、關係或信念。物質執著或上癮模式需要被正視和面對。',
    reversed: '掙脫束縛、重獲自由的時機。你比自己以為的更有力量，陰影面正在被整合。'
  },
  {
    id: 16, name: '高塔', name_en: 'The Tower', number: 'XVI', arcana: 'major',
    symbol: '⚡', color: '#f0d060',
    keywords: ['崩塌', '啟示', '覺醒'],
    upright: '突如其來的劇變打破既有結構。雖然過程痛苦，但這是必要的清除，讓真相得以顯現。',
    reversed: '雖能避開最壞情況，但改變已無可避免。越早面對，衝擊越小。'
  },
  {
    id: 17, name: '星星', name_en: 'The Star', number: 'XVII', arcana: 'major',
    symbol: '⭐', color: '#f0d060',
    keywords: ['希望', '靈感', '療癒'],
    upright: '希望之光在黑暗中閃耀。傷口正在癒合，宇宙的支持與引導確實存在，相信美好終將到來。',
    reversed: '信念動搖或感到幻滅。即便在最黑暗的時刻，星光依然存在，重新連結你的希望。'
  },
  {
    id: 18, name: '月亮', name_en: 'The Moon', number: 'XVIII', arcana: 'major',
    symbol: '🌕', color: '#f0d060',
    keywords: ['幻象', '潛意識', '迷惑'],
    upright: '潛意識的恐懼與幻象模糊了現實。此刻事情並非表面那樣，直覺會指引你穿越迷霧。',
    reversed: '困惑逐漸消散，真相浮現。勇敢面對內心的恐懼，才能從幻象中解脫。'
  },
  {
    id: 19, name: '太陽', name_en: 'The Sun', number: 'XIX', arcana: 'major',
    symbol: '☀️', color: '#f0d060',
    keywords: ['快樂', '活力', '成功'],
    upright: '充滿活力與喜悅的時期！成功、清晰與幸福感圍繞著你，以開放的心迎接生命的美好。',
    reversed: '短暫的陰雲遮蔽了陽光，但太陽依然存在。避免過度樂觀，保持腳踏實地。'
  },
  {
    id: 20, name: '審判', name_en: 'Judgement', number: 'XX', arcana: 'major',
    symbol: '📯', color: '#f0d060',
    keywords: ['覺醒', '更新', '召喚'],
    upright: '靈魂深處的召喚正在呼喚你。過去的行為正在被評估，寬恕自己並回應更高的使命。',
    reversed: '拒絕接受覺醒的呼喚，或沉溺於後悔之中。是時候原諒過去，重新開始。'
  },
  {
    id: 21, name: '世界', name_en: 'The World', number: 'XXI', arcana: 'major',
    symbol: '🌍', color: '#f0d060',
    keywords: ['完成', '圓滿', '整合'],
    upright: '一個重要的循環圓滿完成。你已整合所有的經驗與教訓，值得慶祝這份成就。',
    reversed: '距離完成還差臨門一腳。評估是什麼阻礙了最終的完成，不要在終點前放棄。'
  },

  // ── 小阿爾克那 Minor Arcana ──
  // 聖杯 Cups (水 Water – 情感、關係)
  {
    id: 22, name: '聖杯首牌', name_en: 'Ace of Cups', number: 'Ace', arcana: 'minor', suit: 'cups',
    symbol: '🏆', color: '#4fc3f7',
    keywords: ['新感情', '直覺', '靈感'],
    upright: '情感的新開始，愛的能量正在湧現。無論是新戀情、新友誼還是靈性的開啟，都充滿美好的可能性。',
    reversed: '情感壓抑或無法接受愛。檢視阻礙你向外表達情感的內在障礙。'
  },
  {
    id: 23, name: '聖杯二', name_en: 'Two of Cups', number: '2', arcana: 'minor', suit: 'cups',
    symbol: '🏆', color: '#4fc3f7',
    keywords: ['吸引', '夥伴', '聯合'],
    upright: '兩個靈魂之間美好的連結與相互吸引。合作關係或愛情中充滿和諧，相互尊重帶來美好。',
    reversed: '關係中的不平衡或誤解需要溝通解決。重新評估這段連結是否真的對等。'
  },
  {
    id: 24, name: '聖杯三', name_en: 'Three of Cups', number: '3', arcana: 'minor', suit: 'cups',
    symbol: '🏆', color: '#4fc3f7',
    keywords: ['慶祝', '友誼', '歡聚'],
    upright: '值得慶祝的時刻！與好友歡聚、共享喜悅，社交生活充實愉快，感恩豐盛的人際連結。',
    reversed: '過度放縱或三角關係帶來困擾。確保歡樂是真誠而非逃避現實的方式。'
  },
  {
    id: 25, name: '聖杯四', name_en: 'Four of Cups', number: '4', arcana: 'minor', suit: 'cups',
    symbol: '🏆', color: '#4fc3f7',
    keywords: ['冷漠', '內省', '不滿'],
    upright: '對現有的事物感到漠然，沉浸在自己的世界中。退一步內省是好事，但不要錯過新的機會。',
    reversed: '從冷漠中甦醒，重新對生活產生興趣。新的動力正在萌芽，抓住眼前的機遇。'
  },
  {
    id: 26, name: '聖杯五', name_en: 'Five of Cups', number: '5', arcana: 'minor', suit: 'cups',
    symbol: '🏆', color: '#4fc3f7',
    keywords: ['失落', '悲傷', '後悔'],
    upright: '面對失去所帶來的悲傷。給自己時間哀悼，但記得轉身看向仍然完整的事物，重拾希望。',
    reversed: '從悲傷中緩緩走出，接受過去的失落。原諒自己或他人，迎接新的情感連結。'
  },
  {
    id: 27, name: '聖杯六', name_en: 'Six of Cups', number: '6', arcana: 'minor', suit: 'cups',
    symbol: '🏆', color: '#4fc3f7',
    keywords: ['懷舊', '純真', '給予'],
    upright: '美好的童年記憶或舊日緣份重現。以純真的心給予和接受，感受過去帶來的溫暖與治癒。',
    reversed: '沉溺於過去阻礙前進。欣賞美好的回憶，但不要讓懷舊成為逃避現在的藉口。'
  },
  {
    id: 28, name: '聖杯七', name_en: 'Seven of Cups', number: '7', arcana: 'minor', suit: 'cups',
    symbol: '🏆', color: '#4fc3f7',
    keywords: ['幻想', '選擇', '白日夢'],
    upright: '面對眾多誘人的選擇，容易陷入幻想。釐清什麼是真實的渴望，什麼只是短暫的幻象。',
    reversed: '從幻想中回到現實，開始採取具體行動。將夢想落實的時機已到。'
  },
  {
    id: 29, name: '聖杯八', name_en: 'Eight of Cups', number: '8', arcana: 'minor', suit: 'cups',
    symbol: '🏆', color: '#4fc3f7',
    keywords: ['離開', '追尋', '放下'],
    upright: '放下表面上看似完整、但實際已空洞的事物，勇敢踏上尋找更深意義的旅程。',
    reversed: '猶豫是否要放棄，留戀讓你無法前行。誠實面對你是否真的願意繼續下去。'
  },
  {
    id: 30, name: '聖杯九', name_en: 'Nine of Cups', number: '9', arcana: 'minor', suit: 'cups',
    symbol: '🏆', color: '#4fc3f7',
    keywords: ['願望實現', '滿足', '幸福'],
    upright: '心願得償！情感上的滿足與幸福感包圍著你，享受這份得之不易的美好時刻。',
    reversed: '表面的滿足掩蓋了內心的空虛。反思真正讓你感到富足的是什麼，而非只是表象。'
  },
  {
    id: 31, name: '聖杯十', name_en: 'Ten of Cups', number: '10', arcana: 'minor', suit: 'cups',
    symbol: '🏆', color: '#4fc3f7',
    keywords: ['家庭和諧', '圓滿', '幸福'],
    upright: '情感與家庭生活達到圓滿的境界。長期的努力帶來和諧美滿的結果，充滿感恩。',
    reversed: '家庭和諧受到干擾，或對完美家庭抱持不切實際的期望。聚焦真實的連結而非理想。'
  },
  {
    id: 32, name: '聖杯侍者', name_en: 'Page of Cups', number: 'Page', arcana: 'minor', suit: 'cups',
    symbol: '🏆', color: '#4fc3f7',
    keywords: ['創意', '靈感', '敏感'],
    upright: '靈感與直覺的訊息正在降臨。以開放、好奇的心態接收來自內心的創意靈感與感性訊息。',
    reversed: '情緒化或缺乏現實感。以更成熟的方式整合敏感與創意，避免沉溺在幻想中。'
  },
  {
    id: 33, name: '聖杯騎士', name_en: 'Knight of Cups', number: 'Knight', arcana: 'minor', suit: 'cups',
    symbol: '🏆', color: '#4fc3f7',
    keywords: ['浪漫', '追夢', '魅力'],
    upright: '以浪漫與理想主義追求內心的渴望。情感的使者帶來美好的邀請，相信愛的力量。',
    reversed: '情緒化且不可靠，以幻想代替行動。在追求理想時保持腳踏實地。'
  },
  {
    id: 34, name: '聖杯皇后', name_en: 'Queen of Cups', number: 'Queen', arcana: 'minor', suit: 'cups',
    symbol: '🏆', color: '#4fc3f7',
    keywords: ['關懷', '直覺', '情感成熟'],
    upright: '以深邃的情感智慧和無私的關懷滋養他人。你的直覺與同理心是強大的禮物。',
    reversed: '情緒起伏不定或以情緒操控他人。建立健康的情感邊界，先照顧自己。'
  },
  {
    id: 35, name: '聖杯國王', name_en: 'King of Cups', number: 'King', arcana: 'minor', suit: 'cups',
    symbol: '🏆', color: '#4fc3f7',
    keywords: ['情感智慧', '外交', '成熟'],
    upright: '以成熟的情感智慧引領自己和他人。在理性與感性之間取得完美平衡，是可靠的情感支柱。',
    reversed: '情感操控或壓抑內心感受。允許自己感受，同時保持情緒的健康管理。'
  },

  // 權杖 Wands (火 Fire – 行動、熱情、事業)
  {
    id: 36, name: '權杖首牌', name_en: 'Ace of Wands', number: 'Ace', arcana: 'minor', suit: 'wands',
    symbol: '🔥', color: '#ff8c42',
    keywords: ['靈感', '新計劃', '熱情'],
    upright: '創業的火花與行動的能量正在點燃！新計劃的靈感噴湧而出，此刻是啟動大膽夢想的最佳時機。',
    reversed: '靈感受阻或計劃夭折。重新點燃熱情，找出阻礙你前進的內在障礙。'
  },
  {
    id: 37, name: '權杖二', name_en: 'Two of Wands', number: '2', arcana: 'minor', suit: 'wands',
    symbol: '🔥', color: '#ff8c42',
    keywords: ['計劃', '展望', '大膽'],
    upright: '站在高點眺望廣闊的未來，制定長遠計劃。世界是你的，選擇你的方向並準備出發。',
    reversed: '計劃停滯或缺乏勇氣踏出第一步。重新評估目標，找回前進的動力。'
  },
  {
    id: 38, name: '權杖三', name_en: 'Three of Wands', number: '3', arcana: 'minor', suit: 'wands',
    symbol: '🔥', color: '#ff8c42',
    keywords: ['進步', '領導', '擴展'],
    upright: '計劃正在順利展開，進展中。等待已久的機會與回報即將到來，繼續保持領導力。',
    reversed: '計劃受阻或擴展遇到困難。重新審視策略，靈活調整前進方向。'
  },
  {
    id: 39, name: '權杖四', name_en: 'Four of Wands', number: '4', arcana: 'minor', suit: 'wands',
    symbol: '🔥', color: '#ff8c42',
    keywords: ['慶典', '家庭', '穩固'],
    upright: '值得慶賀的里程碑！家庭和諧、社群的支持以及努力的成果讓人感到真正的安全與快樂。',
    reversed: '家庭關係緊張或缺乏歸屬感。尋找真正讓你有家的感覺的地方和人。'
  },
  {
    id: 40, name: '權杖五', name_en: 'Five of Wands', number: '5', arcana: 'minor', suit: 'wands',
    symbol: '🔥', color: '#ff8c42',
    keywords: ['競爭', '衝突', '混亂'],
    upright: '多方意見相互碰撞，競爭激烈。雖然混亂，但此刻的衝突有助於找出最佳方案。',
    reversed: '避免不必要的衝突，尋求合作而非競爭。放下好勝心，以開放態度傾聽。'
  },
  {
    id: 41, name: '權杖六', name_en: 'Six of Wands', number: '6', arcana: 'minor', suit: 'wands',
    symbol: '🔥', color: '#ff8c42',
    keywords: ['勝利', '認可', '公眾'],
    upright: '你的努力得到公眾的認可與讚賞！成功與榮譽已然到來，享受屬於你的勝利時刻。',
    reversed: '遲來的成功或缺乏他人認可令人沮喪。不要因為外在評價而動搖對自己的信心。'
  },
  {
    id: 42, name: '權杖七', name_en: 'Seven of Wands', number: '7', arcana: 'minor', suit: 'wands',
    symbol: '🔥', color: '#ff8c42',
    keywords: ['捍衛', '立場', '挑戰'],
    upright: '面對來自四方的挑戰，你需要勇敢捍衛自己的立場。你佔有優勢，保持決心。',
    reversed: '在壓力下退縮，難以維持立場。評估哪些值得你繼續堅持，哪些可以適度放手。'
  },
  {
    id: 43, name: '權杖八', name_en: 'Eight of Wands', number: '8', arcana: 'minor', suit: 'wands',
    symbol: '🔥', color: '#ff8c42',
    keywords: ['快速行動', '消息', '進展'],
    upright: '事情快速向前推進，消息如箭飛來！旅行或遠距溝通的機會，一切都在加速。',
    reversed: '行動受阻，訊息延誤或誤解。減慢速度，確認方向再出發。'
  },
  {
    id: 44, name: '權杖九', name_en: 'Nine of Wands', number: '9', arcana: 'minor', suit: 'wands',
    symbol: '🔥', color: '#ff8c42',
    keywords: ['韌性', '堅持', '防衛'],
    upright: '雖然疲憊，但你幾乎到達終點了。集中最後的力量守住陣地，勝利就在眼前。',
    reversed: '過度防衛或在即將成功時放棄。放下不必要的戒心，允許他人的幫助進入。'
  },
  {
    id: 45, name: '權杖十', name_en: 'Ten of Wands', number: '10', arcana: 'minor', suit: 'wands',
    symbol: '🔥', color: '#ff8c42',
    keywords: ['重擔', '責任', '過度'],
    upright: '承擔了過多責任，感到沉重疲憊。是時候評估哪些負擔可以放下或分擔。',
    reversed: '終於將過重的擔子放下，重新感受輕盈。學習適當委派，照顧自己的能量。'
  },
  {
    id: 46, name: '權杖侍者', name_en: 'Page of Wands', number: 'Page', arcana: 'minor', suit: 'wands',
    symbol: '🔥', color: '#ff8c42',
    keywords: ['冒險', '好奇', '新消息'],
    upright: '充滿活力與好奇心的新探索者。關於新計劃的好消息即將到來，以熱情迎接挑戰。',
    reversed: '衝動莽撞，缺乏方向。在行動前多思考，確立清晰的計劃再出發。'
  },
  {
    id: 47, name: '權杖騎士', name_en: 'Knight of Wands', number: 'Knight', arcana: 'minor', suit: 'wands',
    symbol: '🔥', color: '#ff8c42',
    keywords: ['行動', '勇氣', '衝勁'],
    upright: '充滿熱情地快速行動，勇往直前。旅行或大膽的冒險即將展開，抓住機會！',
    reversed: '衝動魯莽或能量散亂。在採取行動前先確保方向正確，避免過度承諾。'
  },
  {
    id: 48, name: '權杖皇后', name_en: 'Queen of Wands', number: 'Queen', arcana: 'minor', suit: 'wands',
    symbol: '🔥', color: '#ff8c42',
    keywords: ['自信', '魅力', '熱情'],
    upright: '散發自信與磁性魅力，以熱情領導並激勵他人。你的創業精神與活力是最大的優勢。',
    reversed: '妒忌或虛榮心作祟，或能量耗盡。回到內在的源頭，重新點燃真實的熱情。'
  },
  {
    id: 49, name: '權杖國王', name_en: 'King of Wands', number: 'King', arcana: 'minor', suit: 'wands',
    symbol: '🔥', color: '#ff8c42',
    keywords: ['領導', '願景', '企業家'],
    upright: '以宏大的願景和自然的領導力帶領眾人前進。你的魅力和創業精神帶來巨大的成就。',
    reversed: '獨裁或過度激進的領導方式令人退縮。學習傾聽，在力量中保有謙遜。'
  },

  // 寶劍 Swords (風 Air – 思想、溝通、衝突)
  {
    id: 50, name: '寶劍首牌', name_en: 'Ace of Swords', number: 'Ace', arcana: 'minor', suit: 'swords',
    symbol: '⚔️', color: '#90caf9',
    keywords: ['清晰', '真相', '突破'],
    upright: '思維的清晰與突破！真相大白，新的想法如利劍劃破迷霧，以理性和決斷力迎接挑戰。',
    reversed: '思緒混亂或溝通失誤。暫緩重大決定，等待心智恢復清晰。'
  },
  {
    id: 51, name: '寶劍二', name_en: 'Two of Swords', number: '2', arcana: 'minor', suit: 'swords',
    symbol: '⚔️', color: '#90caf9',
    keywords: ['困境', '選擇', '平衡'],
    upright: '面臨困難的選擇，試圖保持表面的平靜。拒絕面對問題不是辦法，需要勇氣去做決定。',
    reversed: '終於願意面對問題，資訊浮現幫助做出決定。謊言與欺騙也可能被揭穿。'
  },
  {
    id: 52, name: '寶劍三', name_en: 'Three of Swords', number: '3', arcana: 'minor', suit: 'swords',
    symbol: '⚔️', color: '#90caf9',
    keywords: ['心痛', '悲傷', '分離'],
    upright: '心碎、分離或悲傷的時期。允許自己感受這份痛苦，傷痛是療癒的必經之路。',
    reversed: '從傷痛中緩慢復原。過去的傷已在癒合，原諒並放下是走向自由的關鍵。'
  },
  {
    id: 53, name: '寶劍四', name_en: 'Four of Swords', number: '4', arcana: 'minor', suit: 'swords',
    symbol: '⚔️', color: '#90caf9',
    keywords: ['休息', '靜養', '冥想'],
    upright: '需要暫時從戰場退下，好好休息與靜養。以冥想和安靜恢復能量，為下一場戰鬥做準備。',
    reversed: '過度休息或拒絕回到現實。逐漸準備好重新出發，是時候採取行動了。'
  },
  {
    id: 54, name: '寶劍五', name_en: 'Five of Swords', number: '5', arcana: 'minor', suit: 'swords',
    symbol: '⚔️', color: '#90caf9',
    keywords: ['衝突', '失敗', '不道德'],
    upright: '贏得了戰鬥，但代價是什麼？審視自己的手段是否符合道德，勝利是否真的值得。',
    reversed: '衝突即將結束，和解的可能性浮現。放下求勝的執念，選擇和平。'
  },
  {
    id: 55, name: '寶劍六', name_en: 'Six of Swords', number: '6', arcana: 'minor', suit: 'swords',
    symbol: '⚔️', color: '#90caf9',
    keywords: ['過渡', '離開', '平靜'],
    upright: '從動盪中平靜地過渡到更安靜的水域。離開困境，前往更平和的地方，旅行帶來療癒。',
    reversed: '無法離開困境，或過渡期遇到阻礙。耐心等待，平靜的時期終將到來。'
  },
  {
    id: 56, name: '寶劍七', name_en: 'Seven of Swords', number: '7', arcana: 'minor', suit: 'swords',
    symbol: '⚔️', color: '#90caf9',
    keywords: ['策略', '欺騙', '逃避'],
    upright: '採取迂迴的策略達到目的。但要警惕：欺騙或逃避責任最終將付出代價。',
    reversed: '欺騙被揭穿，或終於決定誠實面對。逃避只會讓問題更複雜，正面迎擊才是解決之道。'
  },
  {
    id: 57, name: '寶劍八', name_en: 'Eight of Swords', number: '8', arcana: 'minor', suit: 'swords',
    symbol: '⚔️', color: '#90caf9',
    keywords: ['束縛', '自限', '困境'],
    upright: '感到被困住，但其實束縛是自己加在自己身上的。改變思維方式，你比你以為的更自由。',
    reversed: '逐漸解開自我設限的束縛，重獲自由。以新的視角看待困境，走出陰影。'
  },
  {
    id: 58, name: '寶劍九', name_en: 'Nine of Swords', number: '9', arcana: 'minor', suit: 'swords',
    symbol: '⚔️', color: '#90caf9',
    keywords: ['焦慮', '恐懼', '噩夢'],
    upright: '深夜的焦慮與恐懼放大了現實的問題。很多時候，恐懼本身比真實情況更可怕。',
    reversed: '從焦慮的深淵中爬出，恐懼開始消退。尋求支持與幫助，你不必獨自承受。'
  },
  {
    id: 59, name: '寶劍十', name_en: 'Ten of Swords', number: '10', arcana: 'minor', suit: 'swords',
    symbol: '⚔️', color: '#90caf9',
    keywords: ['結束', '背叛', '崩潰'],
    upright: '痛苦的結局，但已觸底。曙光就在黑暗之後，這個結束為更好的未來奠定基礎。',
    reversed: '從最低潮緩緩復甦。雖然傷痕猶在，但最糟糕的時刻已經過去。'
  },
  {
    id: 60, name: '寶劍侍者', name_en: 'Page of Swords', number: 'Page', arcana: 'minor', suit: 'swords',
    symbol: '⚔️', color: '#90caf9',
    keywords: ['好奇', '機警', '真相'],
    upright: '充滿好奇心的探尋者，熱愛學習並追求真相。消息靈通，但說話前先思考影響。',
    reversed: '八卦或說話輕率帶來麻煩。在分享資訊前先確認準確性，慎思言行。'
  },
  {
    id: 61, name: '寶劍騎士', name_en: 'Knight of Swords', number: 'Knight', arcana: 'minor', suit: 'swords',
    symbol: '⚔️', color: '#90caf9',
    keywords: ['直接', '野心', '魯莽'],
    upright: '以強烈的決心和速度直奔目標。思維敏銳，行動迅速，但需要注意不要踩傷他人。',
    reversed: '衝動行事帶來後悔。在採取激進行動前先深思熟慮，考慮所有可能的後果。'
  },
  {
    id: 62, name: '寶劍皇后', name_en: 'Queen of Swords', number: 'Queen', arcana: 'minor', suit: 'swords',
    symbol: '⚔️', color: '#90caf9',
    keywords: ['獨立', '智慧', '清晰'],
    upright: '以敏銳的智慧和獨立精神清楚地看穿事物本質。直接溝通，不帶情緒地做出明智判斷。',
    reversed: '刻薄或因過去傷害而封閉心扉。以智慧也以慈悲對待自己和他人。'
  },
  {
    id: 63, name: '寶劍國王', name_en: 'King of Swords', number: 'King', arcana: 'minor', suit: 'swords',
    symbol: '⚔️', color: '#90caf9',
    keywords: ['智識', '公正', '道德'],
    upright: '以理性、道德和清晰的判斷力帶領眾人。公正且直接，是值得信賴的智識權威。',
    reversed: '以智識操控或濫用權力。確保你的決策基於公正而非個人私利。'
  },

  // 星幣 Pentacles (土 Earth – 物質、財富、健康)
  {
    id: 64, name: '星幣首牌', name_en: 'Ace of Pentacles', number: 'Ace', arcana: 'minor', suit: 'pentacles',
    symbol: '🪙', color: '#a5d6a7',
    keywords: ['機會', '財富', '物質'],
    upright: '物質層面的新機會到來！財務的新開始、新工作或投資機會，踏實地把握這份豐盛的種子。',
    reversed: '財務機會流失或計劃不切實際。重新審視資源，打好基礎再出發。'
  },
  {
    id: 65, name: '星幣二', name_en: 'Two of Pentacles', number: '2', arcana: 'minor', suit: 'pentacles',
    symbol: '🪙', color: '#a5d6a7',
    keywords: ['平衡', '靈活', '適應'],
    upright: '在多項事務間靈活周旋，保持財務平衡。雜耍技巧雖難，但你有能力應付各種變化。',
    reversed: '財務失衡或多頭馬車導致混亂。專注在最重要的事情上，適時放下次要任務。'
  },
  {
    id: 66, name: '星幣三', name_en: 'Three of Pentacles', number: '3', arcana: 'minor', suit: 'pentacles',
    symbol: '🪙', color: '#a5d6a7',
    keywords: ['合作', '技巧', '成果'],
    upright: '團隊合作帶來卓越成果。技能得到認可，與他人共創的工作充滿意義且成效顯著。',
    reversed: '缺乏合作精神或工作品質下滑。重新調整團隊動態，確保每個人貢獻所長。'
  },
  {
    id: 67, name: '星幣四', name_en: 'Four of Pentacles', number: '4', arcana: 'minor', suit: 'pentacles',
    symbol: '🪙', color: '#a5d6a7',
    keywords: ['保守', '安全感', '執著'],
    upright: '保護財富與安全感，但過度的守護可能阻礙成長。適度的穩健是美德，但別讓吝嗇限制了你。',
    reversed: '放開對財物的執著，學習慷慨與分享。真正的安全感來自內在，而非外在擁有物。'
  },
  {
    id: 68, name: '星幣五', name_en: 'Five of Pentacles', number: '5', arcana: 'minor', suit: 'pentacles',
    symbol: '🪙', color: '#a5d6a7',
    keywords: ['貧困', '困難', '排除'],
    upright: '財務或物質上的困難時期，感到被孤立。尋求援助並非軟弱，幫助就在身邊等待你開口。',
    reversed: '困境逐漸改善，財務狀況回穩。接受幫助，重建物質基礎。'
  },
  {
    id: 69, name: '星幣六', name_en: 'Six of Pentacles', number: '6', arcana: 'minor', suit: 'pentacles',
    symbol: '🪙', color: '#a5d6a7',
    keywords: ['給予', '慷慨', '公平'],
    upright: '慷慨的給予與公平的分享。財富的流動帶來祝福，今日的給予明日將以倍增的形式回報。',
    reversed: '施予或接受中存在不平等。警惕有附加條件的給予，確保財務關係中的公平。'
  },
  {
    id: 70, name: '星幣七', name_en: 'Seven of Pentacles', number: '7', arcana: 'minor', suit: 'pentacles',
    symbol: '🪙', color: '#a5d6a7',
    keywords: ['評估', '等待', '長期'],
    upright: '在長期投入後評估成果的時刻。耐心等待，播下的種子需要時間成熟，方向是正確的。',
    reversed: '對投入的努力感到挫折，或選錯了投資方向。重新評估策略，確認付出能有所回報。'
  },
  {
    id: 71, name: '星幣八', name_en: 'Eight of Pentacles', number: '8', arcana: 'minor', suit: 'pentacles',
    symbol: '🪙', color: '#a5d6a7',
    keywords: ['勤奮', '技能', '工藝'],
    upright: '專注磨練技能，以工匠精神精進每一個細節。持續的努力與學習帶來卓越的成果。',
    reversed: '缺乏工作動力或技能發展停滯。重新燃起對技藝的熱情，避免馬虎了事。'
  },
  {
    id: 72, name: '星幣九', name_en: 'Nine of Pentacles', number: '9', arcana: 'minor', suit: 'pentacles',
    symbol: '🪙', color: '#a5d6a7',
    keywords: ['成就', '豐盛', '自足'],
    upright: '以自己的努力創造出優雅而豐盛的生活。享受獨立自足帶來的滿足感，你值得這份美好。',
    reversed: '物質上的成功卻感到內心空虛。審視什麼才是真正讓你感到富足的事物。'
  },
  {
    id: 73, name: '星幣十', name_en: 'Ten of Pentacles', number: '10', arcana: 'minor', suit: 'pentacles',
    symbol: '🪙', color: '#a5d6a7',
    keywords: ['財富', '遺產', '家族'],
    upright: '物質生活達到圓滿，家族的財富與傳承得到保障。長期的穩定與安全感讓人深感感恩。',
    reversed: '家族衝突影響財務或遺產問題。重新審視家族關係中的金錢動態。'
  },
  {
    id: 74, name: '星幣侍者', name_en: 'Page of Pentacles', number: 'Page', arcana: 'minor', suit: 'pentacles',
    symbol: '🪙', color: '#a5d6a7',
    keywords: ['學習', '實際', '機會'],
    upright: '認真學習新技能或探索新的實際機會。踏實努力、一步一腳印，未來充滿潛力。',
    reversed: '缺乏專注或逃避責任。建立扎實的基礎比空想更重要，從小處著手培養技能。'
  },
  {
    id: 75, name: '星幣騎士', name_en: 'Knight of Pentacles', number: 'Knight', arcana: 'minor', suit: 'pentacles',
    symbol: '🪙', color: '#a5d6a7',
    keywords: ['負責', '勤勉', '可靠'],
    upright: '以負責任和一絲不苟的態度處理每一件事。雖然進展緩慢，但穩健可靠的努力終將帶來成果。',
    reversed: '過於保守或害怕改變阻礙了進步。在穩定與必要的冒險之間找到平衡。'
  },
  {
    id: 76, name: '星幣皇后', name_en: 'Queen of Pentacles', number: 'Queen', arcana: 'minor', suit: 'pentacles',
    symbol: '🪙', color: '#a5d6a7',
    keywords: ['豐盛', '實際', '大地母親'],
    upright: '以實際的智慧和豐盛的能量滋養家庭和事業。慷慨的照顧者，善於在物質層面創造美好。',
    reversed: '忽略自身需求只為照顧他人。學習說「不」並優先照顧自己，才能持續給予。'
  },
  {
    id: 77, name: '星幣國王', name_en: 'King of Pentacles', number: 'King', arcana: 'minor', suit: 'pentacles',
    symbol: '🪙', color: '#a5d6a7',
    keywords: ['財務安全', '可靠', '成功'],
    upright: '以踏實的智慧和豐富的經驗建立穩固的財務王國。值得信賴的成功者，慷慨且有遠見。',
    reversed: '物質主義或以財富衡量一切。真正的成功包括精神與情感的富足，勿讓金錢遮蔽視野。'
  }
];

// 牌陣定義
const SPREADS = {
  single: {
    name: '單張牌占卜',
    description: '一張牌直接回應你的問題',
    positions: [{ name: '訊息', desc: '宇宙給你的訊息' }]
  },
  three: {
    name: '三張牌占卜',
    description: '過去・現在・未來的時間軸解讀',
    positions: [
      { name: '過去', desc: '影響此刻的過去因素' },
      { name: '現在', desc: '當前的狀況與核心' },
      { name: '未來', desc: '可能的發展方向' }
    ]
  },
  celtic: {
    name: '凱爾特十字',
    description: '十張牌深度解析完整局面',
    positions: [
      { name: '核心', desc: '問題的核心本質' },
      { name: '挑戰', desc: '橫跨在你面前的阻礙' },
      { name: '根基', desc: '潛意識的基礎' },
      { name: '過去', desc: '近期的過去影響' },
      { name: '可能', desc: '可能浮現的最佳結果' },
      { name: '未來', desc: '即將發生的事情' },
      { name: '自我', desc: '你自己在此局面中的位置' },
      { name: '環境', desc: '周遭環境與他人的影響' },
      { name: '希望', desc: '你的希望與恐懼' },
      { name: '結果', desc: '最終的可能結果' }
    ]
  }
};
