완벽합니다! 상세한 답변 감사합니다. 이제 PRD, TRD, TaskList를 작성하겠습니다.

# Technical Requirements Document (TRD)

# Christmas Tree Card Web Application

## 1. 기술 스택

### 1.1 코어 기술

* **HTML5** : 단일 파일 구조
* **CSS3** : 애니메이션, 그라데이션, Flexbox/Grid
* **Vanilla JavaScript (ES6+)** : 모든 로직 구현

### 1.2 외부 라이브러리 (CDN)

```html
<!-- UI Framework -->
<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">

<!-- Drag and Drop -->
<script src="https://cdn.jsdelivr.net/npm/interactjs@1.10.19/dist/interact.min.js"></script>

<!-- Image Processing -->
<script src="https://cdn.jsdelivr.net/npm/browser-image-compression@2.0.2/dist/browser-image-compression.js"></script>

<!-- Google Sheets API -->
<script src="https://apis.google.com/js/api.js"></script>

<!-- Icons -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

<!-- Crypto for password hashing -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js"></script>
```

### 1.3 Google Fonts

```html
<!-- Cute Korean fonts for Christmas theme -->
<link href="https://fonts.googleapis.com/css2?family=Nanum+Pen+Script&family=Cute+Font&family=Gamja+Flower&family=Sunflower:wght@300;500;700&family=Jua&display=swap" rel="stylesheet">
```

## 2. 아키텍처 설계

### 2.1 파일 구조 (단일 HTML)

```
index.html
├── <head>
│   ├── Meta tags
│   ├── External CSS (CDN)
│   ├── Google Fonts
│   └── <style> Internal CSS
├── <body>
│   ├── Main Tree View
│   ├── Card Editor View
│   ├── Card Detail Modal
│   ├── My Cards Modal
│   ├── Loading Overlay
│   └── Toast Notifications
└── <script>
    ├── Constants & Config
    ├── Google Sheets API Handler
    ├── State Management
    ├── UI Controllers
    ├── Event Handlers
    ├── Animation Engine
    ├── Audio Manager
    ├── Image Processor
    └── Utility Functions
```

### 2.2 모듈 구조

#### 2.2.1 Config Module

```javascript
const CONFIG = {
  GOOGLE_SHEETS: {
    API_KEY: 'YOUR_API_KEY',
    SHEET_ID: 'YOUR_SHEET_ID',
    RANGE: 'Cards!A:K'
  },
  IMAGE: {
    MAX_SIZE: 200 * 1024, // 200KB
    MAX_WIDTH: 1200,
    MAX_HEIGHT: 1200,
    QUALITY: 0.8,
    OUTPUT_TYPE: 'image/webp'
  },
  AUDIO: {
    MAX_MUSIC_SIZE: 5 * 1024 * 1024, // 5MB
    MAX_EFFECT_SIZE: 1024 * 1024 // 1MB
  },
  ORNAMENT_TYPES: [
    'star', 'snowman', 'gift', 'bauble', 
    'candy-cane', 'bell', 'snowflake'
  ],
  FONTS: [
    'Nanum Pen Script', 'Cute Font', 'Gamja Flower',
    'Sunflower', 'Jua'
  ],
  ANIMATIONS: {
    TEXT: ['fade-in', 'typing', 'sparkle', 'slide-in', 'bounce'],
    CARD: ['snow', 'stars', 'snowflakes', 'lights', 'spinning-snow', 'none']
  }
};
```

#### 2.2.2 Google Sheets Handler

```javascript
class GoogleSheetsHandler {
  async init() { /* Google API 초기화 */ }
  async loadCards() { /* 모든 카드 데이터 로드 */ }
  async saveCard(cardData) { /* 새 카드 저장 */ }
  async updateCard(id, cardData) { /* 카드 수정 */ }
  async deleteCard(id) { /* 카드 삭제 */ }
  async verifyPassword(id, password) { /* 비밀번호 확인 */ }
}
```

#### 2.2.3 State Manager

```javascript
class StateManager {
  constructor() {
    this.currentView = 'tree'; // 'tree', 'editor', 'detail'
    this.cards = [];
    this.editingCard = null;
    this.selectedOrnament = null;
  }
  
  setView(view) { /* 화면 전환 */ }
  updateCards(cards) { /* 카드 목록 업데이트 */ }
  selectCard(cardId) { /* 카드 선택 */ }
}
```

#### 2.2.4 UI Controllers

```javascript
class TreeViewController {
  render() { /* 트리 화면 렌더링 */ }
  renderOrnaments() { /* 오브제 렌더링 */ }
  autoArrange() { /* 자동 배치 */ }
  enableDragAndDrop() { /* 드래그 활성화 */ }
}

class CardEditorController {
  render() { /* 편집기 렌더링 */ }
  addTextBox() { /* 텍스트 박스 추가 */ }
  addImage() { /* 이미지 추가 */ }
  updatePreview() { /* 미리보기 업데이트 */ }
  saveCard() { /* 카드 저장 */ }
}

class CardDetailController {
  open(cardId) { /* 카드 상세 모달 열기 */ }
  close() { /* 모달 닫기 */ }
  playAnimations() { /* 애니메이션 재생 */ }
  playAudio() { /* 오디오 재생 */ }
}
```

#### 2.2.5 Animation Engine

```javascript
class AnimationEngine {
  createSnowfall() { /* 눈 내리기 애니메이션 */ }
  createStars() { /* 반짝이는 별 */ }
  createLights() { /* 트윙클 라이트 */ }
  createOrnamentFlyAnimation(ornament, targetPos) { /* 오브제 날아가기 */ }
  applyTextAnimation(element, animationType) { /* 텍스트 애니메이션 */ }
}
```

#### 2.2.6 Image Processor

```javascript
class ImageProcessor {
  async compress(file) {
    // browser-image-compression 사용
    const options = {
      maxSizeMB: 0.2,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
      fileType: 'image/webp'
    };
    return await imageCompression(file, options);
  }
  
  async toBase64(file) { /* Base64 변환 */ }
  validateFile(file) { /* 파일 검증 */ }
}
```

#### 2.2.7 Audio Manager

```javascript
class AudioManager {
  constructor() {
    this.bgMusic = null;
    this.effectSound = null;
  }
  
  async loadMusic(file) { /* 배경음악 로드 */ }
  async loadEffect(file) { /* 효과음 로드 */ }
  play(type) { /* 재생 */ }
  stop(type) { /* 정지 */ }
  setVolume(type, volume) { /* 볼륨 조절 */ }
  toBase64(file) { /* Base64 변환 */ }
}
```

## 3. 데이터 모델

### 3.1 Google Sheets 스키마

```
| A     | B          | C           | D            | E         | F         | G        | H          | I            | J            | K            |
|-------|------------|-------------|--------------|-----------|-----------|----------|------------|--------------|--------------|--------------|
| ID    | AuthorName | PasswordHash| OrnamentType | PositionX | PositionY | CardType | URL        | CardDataJSON | CreatedAt    | UpdatedAt    |
| uuid  | string     | sha256      | string       | number    | number    | string   | string/null| JSON string  | ISO datetime | ISO datetime |
```

### 3.2 CardData JSON 구조

```javascript
{
  // 일반 카드 (cardType: 'normal')
  backgroundColor: '#ffffff',
  backgroundGradient: 'linear-gradient(to bottom, #fff, #f0f0f0)',
  animation: 'snow', // 'snow', 'stars', 'snowflakes', 'lights', 'spinning-snow', 'none'
  
  textBoxes: [
    {
      id: 'text-1',
      content: '메리 크리스마스!',
      font: 'Nanum Pen Script',
      fontSize: 24,
      color: '#ff0000',
      align: 'center',
      animation: 'fade-in',
      position: { x: 100, y: 50 },
      width: 200,
      height: 50
    }
  ],
  
  images: [
    {
      id: 'img-1',
      data: 'data:image/webp;base64,...',
      position: { x: 50, y: 100 },
      width: 300,
      height: 200,
      rotation: 0,
      zIndex: 1
    }
  ],
  
  audio: {
    music: 'data:audio/mp3;base64,...', // or null
    effect: 'data:audio/wav;base64,...', // or null
    musicVolume: 70,
    effectVolume: 100
  }
}

// URL 카드 (cardType: 'url')
// CardDataJSON은 빈 객체 {}
```

## 4. 주요 기능 구현

### 4.1 Google Sheets API 연동

```javascript
// API 초기화
function initGoogleSheets() {
  gapi.load('client', async () => {
    await gapi.client.init({
      apiKey: CONFIG.GOOGLE_SHEETS.API_KEY,
      discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4']
    });
  });
}

// 데이터 읽기
async function loadCards() {
  const response = await gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: CONFIG.GOOGLE_SHEETS.SHEET_ID,
    range: CONFIG.GOOGLE_SHEETS.RANGE
  });
  return response.result.values;
}

// 데이터 쓰기
async function saveCard(cardData) {
  await gapi.client.sheets.spreadsheets.values.append({
    spreadsheetId: CONFIG.GOOGLE_SHEETS.SHEET_ID,
    range: 'Cards!A:K',
    valueInputOption: 'RAW',
    resource: {
      values: [[
        generateUUID(),
        cardData.authorName,
        hashPassword(cardData.password),
        cardData.ornamentType,
        cardData.positionX,
        cardData.positionY,
        cardData.cardType,
        cardData.url || '',
        JSON.stringify(cardData.cardData),
        new Date().toISOString(),
        new Date().toISOString()
      ]]
    }
  });
}
```

### 4.2 드래그 앤 드롭 (interact.js)

```javascript
function enableOrnamentDrag() {
  interact('.ornament').draggable({
    inertia: true,
    modifiers: [
      interact.modifiers.restrictRect({
        restriction: '.tree-container',
        endOnly: true
      })
    ],
    autoScroll: true,
    listeners: {
      move: dragMoveListener,
      end: async (event) => {
        const target = event.target;
        const cardId = target.dataset.cardId;
        const x = parseFloat(target.getAttribute('data-x')) || 0;
        const y = parseFloat(target.getAttribute('data-y')) || 0;
    
        // 위치 저장
        await updateCardPosition(cardId, x, y);
      }
    }
  });
}

function dragMoveListener(event) {
  const target = event.target;
  const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
  const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

  target.style.transform = `translate(${x}px, ${y}px)`;
  target.setAttribute('data-x', x);
  target.setAttribute('data-y', y);
}
```

### 4.3 이미지 최적화

```javascript
async function optimizeImage(file) {
  // 파일 타입 검증
  if (!file.type.startsWith('image/')) {
    throw new Error('이미지 파일만 업로드 가능합니다.');
  }
  
  // 압축
  const compressed = await imageCompression(file, {
    maxSizeMB: 0.2,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
    fileType: 'image/webp'
  });
  
  // Base64 변환
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(compressed);
  });
}
```

### 4.4 애니메이션 구현

```javascript
// CSS 애니메이션
const animations = `
@keyframes snowfall {
  0% { transform: translateY(-100px); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(100vh); opacity: 0; }
}

@keyframes sparkle {
  0%, 100% { opacity: 0; transform: scale(0); }
  50% { opacity: 1; transform: scale(1); }
}

@keyframes typing {
  from { width: 0; }
  to { width: 100%; }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.snow-particle {
  position: absolute;
  background: white;
  border-radius: 50%;
  animation: snowfall linear infinite;
}

.star-particle {
  position: absolute;
  color: gold;
  animation: sparkle 2s ease-in-out infinite;
}
`;

// JavaScript 애니메이션 생성
function createSnowfall(container) {
  for (let i = 0; i < 50; i++) {
    const snow = document.createElement('div');
    snow.className = 'snow-particle';
    snow.style.left = Math.random() * 100 + '%';
    snow.style.width = (Math.random() * 3 + 2) + 'px';
    snow.style.height = snow.style.width;
    snow.style.animationDuration = (Math.random() * 3 + 2) + 's';
    snow.style.animationDelay = Math.random() * 2 + 's';
    container.appendChild(snow);
  }
}
```

### 4.5 오브제 날아가기 애니메이션

```javascript
async function playOrnamentFlyAnimation(ornamentData) {
  // 임시 오브제 생성
  const ornament = document.createElement('div');
  ornament.className = 'flying-ornament';
  ornament.innerHTML = getOrnamentIcon(ornamentData.type);
  ornament.style.position = 'fixed';
  ornament.style.left = '50%';
  ornament.style.top = '50%';
  ornament.style.transform = 'translate(-50%, -50%) scale(2)';
  ornament.style.zIndex = '9999';
  document.body.appendChild(ornament);
  
  // 목표 위치 계산
  const targetPos = ornamentData.position;
  
  // 애니메이션
  await ornament.animate([
    { transform: 'translate(-50%, -50%) scale(2)', opacity: 1 },
    { 
      transform: `translate(${targetPos.x}px, ${targetPos.y}px) scale(1) rotate(360deg)`,
      opacity: 1 
    }
  ], {
    duration: 1500,
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    fill: 'forwards'
  }).finished;
  
  ornament.remove();
}
```

### 4.6 오디오 처리

```javascript
class AudioManager {
  async loadAudioFile(file, maxSize) {
    if (file.size > maxSize) {
      throw new Error(`파일 크기는 ${maxSize / 1024 / 1024}MB 이하여야 합니다.`);
    }
  
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const audio = new Audio(reader.result);
        audio.oncanplaythrough = () => resolve(reader.result);
        audio.onerror = reject;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  
  playAudio(base64Data, volume = 1) {
    const audio = new Audio(base64Data);
    audio.volume = volume;
    audio.play().catch(err => {
      console.warn('Audio playback failed:', err);
      // 사용자 인터랙션 필요 시 버튼 표시
    });
    return audio;
  }
}
```

## 5. 반응형 디자인

### 5.1 Breakpoints

```css
/* Mobile First */
:root {
  --tree-size: 80vw;
  --ornament-size: 40px;
}

/* Tablet */
@media (min-width: 768px) {
  :root {
    --tree-size: 60vw;
    --ornament-size: 50px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  :root {
    --tree-size: 500px;
    --ornament-size: 60px;
  }
}
```

### 5.2 터치 최적화

```javascript
// 터치 이벤트 지원
function setupTouchSupport() {
  // Prevent zoom on double tap
  let lastTap = 0;
  document.addEventListener('touchend', (e) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    if (tapLength < 500 && tapLength > 0) {
      e.preventDefault();
    }
    lastTap = currentTime;
  });
  
  // 드래그 시 스크롤 방지
  interact('.draggable').on('dragstart', () => {
    document.body.style.overflow = 'hidden';
  }).on('dragend', () => {
    document.body.style.overflow = '';
  });
}
```

## 6. 보안

### 6.1 비밀번호 해싱

```javascript
function hashPassword(password) {
  return CryptoJS.SHA256(password).toString();
}

function verifyPassword(inputPassword, storedHash) {
  return hashPassword(inputPassword) === storedHash;
}
```

### 6.2 XSS 방지

```javascript
function sanitizeHTML(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function sanitizeCardData(cardData) {
  // 텍스트 콘텐츠 sanitize
  if (cardData.textBoxes) {
    cardData.textBoxes.forEach(box => {
      box.content = sanitizeHTML(box.content);
    });
  }
  return cardData;
}
```

## 7. 성능 최적화

### 7.1 이미지 Lazy Loading

```javascript
function lazyLoadImages() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        observer.unobserve(img);
      }
    });
  });
  
  document.querySelectorAll('img[data-src]').forEach(img => {
    observer.observe(img);
  });
}
```

### 7.2 Debounce & Throttle

```javascript
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// 사용 예
const handleResize = debounce(() => {
  adjustTreeSize();
}, 250);

const handleScroll = throttle(() => {
  updateVisibleOrnaments();
}, 100);
```

## 8. 에러 핸들링

```javascript
class ErrorHandler {
  static show(message, type = 'error') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
  
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);
  
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
  
  static async handle(error, userMessage) {
    console.error(error);
    this.show(userMessage || '오류가 발생했습니다. 다시 시도해주세요.');
  }
}

// 전역 에러 핸들러
window.addEventListener('unhandledrejection', (event) => {
  ErrorHandler.handle(event.reason, '예상치 못한 오류가 발생했습니다.');
});
```

## 9. 브라우저 호환성

### 9.1 Polyfills (필요시)

```javascript
// Promise.allSettled polyfill (구형 브라우저용)
if (!Promise.allSettled) {
  Promise.allSettled = function(promises) {
    return Promise.all(
      promises.map(p => Promise.resolve(p)
        .then(value => ({ status: 'fulfilled', value }))
        .catch(reason => ({ status: 'rejected', reason }))
      )
    );
  };
}
```

### 9.2 Feature Detection

```javascript
function checkBrowserSupport() {
  const features = {
    localStorage: 'localStorage' in window,
    FileReader: 'FileReader' in window,
    crypto: 'crypto' in window,
    webp: checkWebPSupport()
  };
  
  const unsupported = Object.entries(features)
    .filter(([, supported]) => !supported)
    .map(([feature]) => feature);
  
  if (unsupported.length > 0) {
    ErrorHandler.show(
      '일부 기능이 지원되지 않는 브라우저입니다. 최신 브라우저를 사용해주세요.',
      'warning'
    );
  }
}

function checkWebPSupport() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('image/webp') > -1;
}
```
