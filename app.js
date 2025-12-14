// ========================================
// Configuration is loaded from config.js
// ========================================
// CONFIG variable is loaded from config.js file

// ========================================
// Utility Functions
// ========================================
const Utils = {
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    getCleanTextContent(element) {
        // clone to strip resize handles and convert to plain text with newlines
        const clone = element.cloneNode(true);
        clone.querySelectorAll('.resize-handle').forEach(h => h.remove());

        // Replace block-level tags with newlines before extracting text
        clone.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
        clone.querySelectorAll('div, p').forEach(node => {
            const txt = document.createTextNode('\n' + node.textContent);
            node.replaceWith(txt);
        });

        return clone.textContent.trim();
    },

    formatDate(date) {
        return new Date(date).toLocaleString('ko-KR');
    },

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    },

    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    sanitizeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    hashPassword(password) {
        return CryptoJS.SHA256(password).toString();
    }
};

// ========================================
// Toast Notification System
// ========================================
class ToastManager {
    static show(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// ========================================
// Loading Manager
// ========================================
class LoadingManager {
    static show(message = '로딩 중...') {
        const overlay = document.getElementById('loading-overlay');
        const text = overlay.querySelector('.loading-text');
        text.textContent = message;
        overlay.classList.add('active');
    }

    static hide() {
        document.getElementById('loading-overlay').classList.remove('active');
    }
}

// ========================================
// Google Apps Script Handler
// ========================================
class GoogleSheetsHandler {
    constructor() {
        this.scriptUrl = CONFIG.GOOGLE_SHEETS.SCRIPT_URL;
    }

    async init() {
        // Apps Script는 별도 초기화가 필요 없음
        if (!this.scriptUrl || this.scriptUrl === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE') {
            throw new Error('Google Apps Script URL이 설정되지 않았습니다. config.js 파일을 확인해주세요.');
        }
    }

    async loadCards() {
        try {
            const url = `${this.scriptUrl}?action=getCards&t=${Date.now()}`;
            const response = await fetch(url, {
                method: 'GET'
                // GET 요청에서는 Content-Type 헤더를 보내지 않음 (CORS preflight 방지)
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to load cards');
            }

            return result.cards || [];
        } catch (error) {
            console.error('Error loading cards:', error);
            throw error;
        }
    }

    async saveCard(cardData) {
        try {
            const card = {
                authorName: cardData.authorName,
                passwordHash: Utils.hashPassword(cardData.password),
                ornamentType: cardData.ornamentType,
                positionX: cardData.positionX || 0,
                positionY: cardData.positionY || 0,
                cardType: cardData.cardType,
                url: cardData.url || '',
                cardData: cardData.cardData || {}
            };

            const response = await fetch(this.scriptUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain'
                },
                body: JSON.stringify({
                    action: 'addCard',
                    card: card
                })
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to save card');
            }

            return result.id;
        } catch (error) {
            console.error('Error saving card:', error);
            throw error;
        }
    }

    async updateCard(cardId, cardData) {
        try {
            const response = await fetch(this.scriptUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain'
                },
                body: JSON.stringify({
                    action: 'updateCard',
                    id: cardId,
                    card: cardData
                })
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to update card');
            }

            return true;
        } catch (error) {
            console.error('Error updating card:', error);
            throw error;
        }
    }

    async deleteCard(cardId) {
        try {
            const response = await fetch(this.scriptUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain'
                },
                body: JSON.stringify({
                    action: 'deleteCard',
                    id: cardId
                })
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to delete card');
            }

            return true;
        } catch (error) {
            console.error('Error deleting card:', error);
            throw error;
        }
    }

    async verifyPassword(cardId, password) {
        try {
            const passwordHash = Utils.hashPassword(password);

            const response = await fetch(this.scriptUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain'
                },
                body: JSON.stringify({
                    action: 'verifyPassword',
                    id: cardId,
                    passwordHash: passwordHash
                })
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to verify password');
            }

            return result.valid;
        } catch (error) {
            console.error('Error verifying password:', error);
            return false;
        }
    }

    async updateCardPosition(cardId, positionX, positionY) {
        try {
            const response = await fetch(this.scriptUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain'
                },
                body: JSON.stringify({
                    action: 'updatePosition',
                    id: cardId,
                    positionX: positionX,
                    positionY: positionY
                })
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to update position');
            }

            return true;
        } catch (error) {
            console.error('Error updating card position:', error);
            throw error;
        }
    }
}

// ========================================
// Animation Engine
// ========================================
class AnimationEngine {
    static createSnowfall(container) {
        for (let i = 0; i < 50; i++) {
            const snow = document.createElement('div');
            snow.className = 'snow-particle';
            snow.style.left = Math.random() * 100 + '%';
            snow.style.width = (Math.random() * 3 + 2) + 'px';
            snow.style.height = snow.style.width;

            // 눈송이를 화면 전체에 초기 분산
            const initialY = Math.random() * 100; // 0-100vh 사이에 랜덤 배치
            snow.style.top = initialY + 'vh';

            snow.style.animationDuration = (Math.random() * 10 + 15) + 's'; // 15-25초로 아주 느리게
            snow.style.animationDelay = -Math.random() * 25 + 's'; // 음수 딜레이로 이미 진행 중인 것처럼
            container.appendChild(snow);
        }
    }

    static createStars(container) {
        for (let i = 0; i < 30; i++) {
            const star = document.createElement('div');
            star.className = 'star-particle';
            star.innerHTML = '✨';
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.fontSize = (Math.random() * 1 + 0.5) + 'rem';
            star.style.animationDelay = Math.random() * 2 + 's';
            star.style.animationDuration = (Math.random() * 2 + 1) + 's';
            container.appendChild(star);
        }
    }
}

// ========================================
// Sticker Manager
// ========================================
class StickerManager {
    constructor() {
        this.stickers = [];
        this.isLoaded = false;
        this.customStickers = [];
        this.loadCustomStickers();
    }

    async loadStickers() {
        if (this.isLoaded) return [...this.stickers, ...this.customStickers];

        const allStickers = [];

        for (const stickerConfig of CONFIG.DEFAULT_STICKERS) {
            try {
                const sticker = await this.loadSingleSticker(stickerConfig);
                allStickers.push(sticker);
            } catch (error) {
                console.error(`Error loading sticker ${stickerConfig.name}:`, error);
            }
        }

        this.stickers = allStickers;
        this.isLoaded = true;
        return [...allStickers, ...this.customStickers];
    }

    async loadSingleSticker(stickerConfig) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';

            img.onload = () => {
                // Create canvas to process the sticker
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                // Get image data and remove background
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                this.removeWhiteBackground(imageData);

                // Put processed image back
                ctx.putImageData(imageData, 0, 0);

                // Convert to base64
                const base64 = canvas.toDataURL('image/png');

                resolve({
                    id: stickerConfig.id,
                    name: stickerConfig.name,
                    data: base64,
                    sheetName: 'Default',
                    isDefault: true
                });
            };

            img.onerror = () => reject(new Error(`Failed to load ${stickerConfig.path}`));
            img.src = stickerConfig.path;
        });
    }

    loadCustomStickers() {
        try {
            const stored = localStorage.getItem('customStickers');
            if (stored) {
                this.customStickers = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error loading custom stickers:', error);
            this.customStickers = [];
        }
    }

    saveCustomStickers() {
        try {
            localStorage.setItem('customStickers', JSON.stringify(this.customStickers));
        } catch (error) {
            console.error('Error saving custom stickers:', error);
        }
    }

    async addCustomSticker(file) {
        return new Promise((resolve, reject) => {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                reject(new Error('이미지 파일만 업로드할 수 있습니다'));
                return;
            }

            // Validate file size
            if (file.size > CONFIG.CUSTOM_STICKER.MAX_SIZE) {
                reject(new Error('파일 크기가 너무 큽니다 (최대 2MB)'));
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    try {
                        // Compress and resize image
                        const compressed = this.compressImage(img);

                        // Create sticker object
                        const sticker = {
                            id: 'custom_' + Date.now(),
                            name: file.name.replace(/\.[^/.]+$/, ''),
                            data: compressed,
                            sheetName: 'Custom',
                            isCustom: true
                        };

                        this.customStickers.push(sticker);
                        this.saveCustomStickers();
                        resolve(sticker);
                    } catch (error) {
                        reject(error);
                    }
                };
                img.onerror = () => reject(new Error('이미지 로드에 실패했습니다'));
                img.src = e.target.result;
            };
            reader.onerror = () => reject(new Error('파일 읽기에 실패했습니다'));
            reader.readAsDataURL(file);
        });
    }

    compressImage(img) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Calculate new dimensions
        let width = img.width;
        let height = img.height;
        const maxWidth = CONFIG.CUSTOM_STICKER.MAX_WIDTH;
        const maxHeight = CONFIG.CUSTOM_STICKER.MAX_HEIGHT;

        if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;

        // Draw image
        ctx.drawImage(img, 0, 0, width, height);

        // Try different quality settings to get under 2MB Base64 size
        let quality = CONFIG.CUSTOM_STICKER.QUALITY;
        let base64 = canvas.toDataURL(CONFIG.CUSTOM_STICKER.OUTPUT_TYPE, quality);

        // Base64 string is roughly 1.37x the binary size
        // We want to stay well under 2MB to account for overhead
        const maxBase64Size = 2 * 1024 * 1024; // 2MB in characters

        // Reduce quality if needed to stay under limit
        while (base64.length > maxBase64Size && quality > 0.3) {
            quality -= 0.1;
            base64 = canvas.toDataURL(CONFIG.CUSTOM_STICKER.OUTPUT_TYPE, quality);
        }

        // If still too large, reduce dimensions
        if (base64.length > maxBase64Size) {
            const scale = Math.sqrt(maxBase64Size / base64.length);
            canvas.width = Math.floor(width * scale);
            canvas.height = Math.floor(height * scale);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            base64 = canvas.toDataURL(CONFIG.CUSTOM_STICKER.OUTPUT_TYPE, 0.7);
        }

        return base64;
    }

    deleteCustomSticker(stickerId) {
        this.customStickers = this.customStickers.filter(s => s.id !== stickerId);
        this.saveCustomStickers();
    }

    removeWhiteBackground(imageData) {
        const data = imageData.data;

        // Calculate average background color from corners
        const cornerSamples = [
            this.getPixelColor(data, 0, 0, imageData.width),
            this.getPixelColor(data, imageData.width - 1, 0, imageData.width),
            this.getPixelColor(data, 0, imageData.height - 1, imageData.width),
            this.getPixelColor(data, imageData.width - 1, imageData.height - 1, imageData.width)
        ];

        // Calculate average background color
        let avgR = 0, avgG = 0, avgB = 0;
        cornerSamples.forEach(sample => {
            avgR += sample.r;
            avgG += sample.g;
            avgB += sample.b;
        });
        avgR /= cornerSamples.length;
        avgG /= cornerSamples.length;
        avgB /= cornerSamples.length;

        // Remove background color (allowing some tolerance)
        const tolerance = 40;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Check if pixel is close to background color
            const rDiff = Math.abs(r - avgR);
            const gDiff = Math.abs(g - avgG);
            const bDiff = Math.abs(b - avgB);

            // If pixel is similar to background, make it transparent
            if (rDiff < tolerance && gDiff < tolerance && bDiff < tolerance) {
                data[i + 3] = 0; // Set alpha to 0 (transparent)
            }
            // Also remove pure white and very light colors
            else if (r > 240 && g > 240 && b > 240) {
                data[i + 3] = 0;
            }
        }
    }

    getPixelColor(data, x, y, width) {
        const idx = (y * width + x) * 4;
        return {
            r: data[idx],
            g: data[idx + 1],
            b: data[idx + 2],
            a: data[idx + 3]
        };
    }
}

// ========================================
// Main Application
// ========================================
const app = {
    currentView: 'tree',
    cards: [],
    currentCard: null,
    cardElements: [],
    selectedElement: null,
    propertyMenuInitialized: false,
    audio: null,
    audioStarted: false,
    isTreeZoomed: false,
    sheetsHandler: new GoogleSheetsHandler(),
    stickerManager: new StickerManager(),

    // Pagination
    currentTreePage: 1,
    currentListPage: 1,
    itemsPerPage: 10,

    // SVG viewBox: 0 -10 200 295
    // 트리의 실제 형태를 기반으로 Y 위치에 따른 최대 너비를 계산
    getTreeWidthAtY(svgY) {
        // SVG 좌표계에서 트리의 각 레이어별 너비
        // 위에서 아래로 갈수록 넓어지는 원뿔 형태
        // 초록색 영역만 포함 (트렁크 제외, 별 제외)
        if (svgY < 40) {
            // 별 부분 - 제외
            return 0;
        } else if (svgY < 60) {
            // 탑 레이어 진입부
            return 35;
        } else if (svgY < 90) {
            // 탑 레이어 (rx=40) - 보수적으로 축소
            return 70;
        } else if (svgY < 125) {
            // 미들-탑 레이어 (rx=52)
            return 90;
        } else if (svgY < 165) {
            // 미들 레이어 (rx=65)
            return 115;
        } else if (svgY < 210) {
            // 미들-바텀 레이어 (rx=75)
            return 135;
        } else if (svgY <= 215) {
            // 바텀 레이어 (rx=85)
            return 155;
        } else {
            // 트렁크 부분 - 제외
            return 0;
        }
    },

    // SVG 좌표를 직접 반환 (화면 크기와 무관하게 동일한 위치)
    getRandomTreePosition(existingPositions = []) {
        const maxAttempts = 50; // 최대 시도 횟수
        let attempts = 0;

        // SVG 좌표계에서 최소 거리 (오버랩 방지)
        const minSvgDistance = 15; // SVG 단위

        while (attempts < maxAttempts) {
            // 트리의 실제 영역 내에서 랜덤 위치 생성
            // SVG viewBox: 0 -10 200 295
            // 트리 초록색 영역: Y 50~210, X는 Y에 따라 다름
            const minSvgY = 50;  // 별 아래
            const maxSvgY = 210; // 바텀 레이어
            const svgCenter = 100; // 트리 중심

            // 랜덤 Y 위치 선택
            const randomSvgY = minSvgY + Math.random() * (maxSvgY - minSvgY);

            // 해당 Y 위치에서의 최대 너비 계산
            const maxWidth = this.getTreeWidthAtY(randomSvgY);

            // 트리 형태 내부로 더 제한 (패딩 증가)
            const widthPadding = 10; // SVG 단위로 10px 패딩
            const minSvgX = svgCenter - (maxWidth / 2) + widthPadding;
            const maxSvgX = svgCenter + (maxWidth / 2) - widthPadding;
            const randomSvgX = minSvgX + Math.random() * (maxSvgX - minSvgX);

            // 기존 오브제와 겹치지 않는지 확인 (SVG 좌표로 직접 비교)
            let isValid = true;
            for (const pos of existingPositions) {
                const dx = randomSvgX - pos.x;
                const dy = randomSvgY - pos.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < minSvgDistance) {
                    isValid = false;
                    break;
                }
            }

            if (isValid) {
                return { x: randomSvgX, y: randomSvgY };
            }

            attempts++;
        }

        // 최대 시도 횟수를 초과하면 그냥 반환 (매우 드물게 발생)
        console.warn('Could not find non-overlapping position after', maxAttempts, 'attempts');
        const fallbackY = 50 + Math.random() * 160;
        const fallbackWidth = this.getTreeWidthAtY(fallbackY);
        const fallbackX = 100 + (Math.random() - 0.5) * (fallbackWidth - 20);
        return { x: fallbackX, y: fallbackY };
    },

    async init() {
        const isEditorPage = document.body.dataset.initialView === 'editor';

        this.setupBackgroundAnimations();
        this.setupAudioControls();
        this.setupEventListeners();

        // 새 페이지에서 바로 에디터가 보이도록 초기 뷰 전환
        if (isEditorPage) {
            this.switchView('editor');
            this.setupKeyboardListeners();
        } else {
            this.renderTree();
        }

        // Initialize Google Apps Script and load cards
        try {
            LoadingManager.show('데이터를 불러오는 중...');
            await this.sheetsHandler.init();
            // 트리 페이지에서만 카드 로드/렌더
            if (!isEditorPage) {
                await this.loadCards();
                ToastManager.show('크리스마스 트리 카드에 오신 것을 환영합니다! 🎄', 'success');

                // URL 파라미터로 공유된 카드 확인
                this.checkSharedCard();
            }
        } catch (error) {
            console.error('Initialization error:', error);
            ToastManager.show('데이터를 불러오는 중 오류가 발생했습니다. Apps Script URL을 확인해주세요.', 'error');
        } finally {
            LoadingManager.hide();
        }
    },

    checkSharedCard() {
        const urlParams = new URLSearchParams(window.location.search);
        const sharedCardId = urlParams.get('card');

        if (sharedCardId) {
            // 카드가 존재하는지 확인
            const card = this.cards.find(c => c.id === sharedCardId);
            if (card) {
                // 해당 카드가 있는 페이지로 이동
                const cardIndex = this.cards.findIndex(c => c.id === sharedCardId);
                const targetPage = Math.floor(cardIndex / this.itemsPerPage) + 1;

                if (this.currentTreePage !== targetPage) {
                    this.currentTreePage = targetPage;
                    this.renderOrnaments();
                }

                // 카드 상세 모달 바로 열기
                this.openCardDetail(sharedCardId);

                // URL에서 파라미터 제거 (히스토리 정리)
                window.history.replaceState({}, document.title, window.location.pathname);
            } else {
                ToastManager.show('공유된 카드를 찾을 수 없습니다', 'warning');
            }
        }
    },

    async loadCards() {
        try {
            this.cards = await this.sheetsHandler.loadCards();
            // 카드 데이터가 갱신될 때마다 페이지를 처음으로 리셋
            this.currentTreePage = 1;
            this.currentListPage = 1;
            this.renderOrnaments();
            this.renderCardList();
        } catch (error) {
            console.error('Error loading cards:', error);
            throw error;
        }
    },

    renderOrnaments() {
        const christmasTree = document.getElementById('christmas-tree');
        if (!christmasTree) return;

        // SVG 내부의 ornaments-group 찾기
        const ornamentsGroup = christmasTree.querySelector('#ornaments-group');
        if (!ornamentsGroup) {
            console.warn('Ornaments group not found in SVG');
            return;
        }

        // 기존 오브제 모두 제거 (SVG 그룹 내부)
        ornamentsGroup.innerHTML = '';

        // 카드가 없으면 종료
        if (!this.cards || this.cards.length === 0) {
            this.updateTreePagination();
            return;
        }

        // 페이징 처리
        const totalPages = Math.max(1, Math.ceil(this.cards.length / this.itemsPerPage));
        if (this.currentTreePage > totalPages) {
            this.currentTreePage = totalPages;
        }
        const startIdx = (this.currentTreePage - 1) * this.itemsPerPage;
        const endIdx = startIdx + this.itemsPerPage;
        const pageCards = this.cards.slice(startIdx, endIdx);

        // 각 카드를 SVG <text> 요소로 렌더링
        pageCards.forEach(card => {
            // SVG 좌표 가져오기
            let svgX = card.positionX || 100;
            let svgY = card.positionY || 150;

            // 레거시 픽셀 좌표 데이터 처리 (300 이상이면 픽셀 좌표로 간주)
            if (svgX > 200 || svgY > 300) {
                // 기존 데이터가 저장될 때의 대략적인 트리 크기를 가정 (600px 기준)
                const oldTreeWidth = 600;
                const oldTreeHeight = 800;
                svgX = (svgX / oldTreeWidth) * 200;
                svgY = ((svgY / oldTreeHeight) * 305) - 10;
            }

            // 오브제 아이콘
            const icon = CONFIG.ORNAMENT_TYPES[card.ornamentType] || '🎁';

            // SVG <text> 요소 생성 (SVG 네임스페이스 필요)
            const ornament = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            ornament.setAttribute('x', svgX);
            ornament.setAttribute('y', svgY);
            ornament.setAttribute('text-anchor', 'middle');
            ornament.setAttribute('dominant-baseline', 'middle');
            ornament.setAttribute('font-size', '18');
            ornament.setAttribute('class', 'svg-ornament');
            ornament.setAttribute('data-card-id', card.id);
            ornament.setAttribute('style', 'cursor: pointer;');
            ornament.textContent = icon;

            // 클릭 이벤트 - 카드 열기
            ornament.addEventListener('click', () => {
                const confirmOpen = window.confirm('카드를 열어보시겠습니까?');
                if (!confirmOpen) return;

                if (card.cardType === 'url' && card.url) {
                    window.open(card.url, '_blank');
                } else {
                    this.openCardDetail(card.id);
                }
            });

            ornamentsGroup.appendChild(ornament);
        });

        // 페이징 UI 업데이트
        this.updateTreePagination();
    },

    updateTreePagination() {
        const totalPages = Math.max(1, Math.ceil(this.cards.length / this.itemsPerPage));
        const pageInfo = document.getElementById('tree-page-info');
        const prevBtn = document.getElementById('tree-prev-btn');
        const nextBtn = document.getElementById('tree-next-btn');

        if (pageInfo) {
            pageInfo.textContent = `${this.currentTreePage} / ${totalPages}`;
        }

        if (prevBtn) {
            prevBtn.disabled = this.currentTreePage <= 1;
        }

        if (nextBtn) {
            nextBtn.disabled = this.currentTreePage >= totalPages;
        }
    },

    changeTreePage(delta) {
        const totalPages = Math.max(1, Math.ceil(this.cards.length / this.itemsPerPage));
        const newPage = this.currentTreePage + delta;

        if (newPage >= 1 && newPage <= totalPages) {
            this.currentTreePage = newPage;
            this.renderOrnaments();
        }
    },

    updateListPagination(totalPagesOverride) {
        const totalPages = Math.max(1, totalPagesOverride || Math.ceil((this.cards?.length || 0) / this.itemsPerPage));
        const pageInfo = document.getElementById('list-page-info');
        const mobilePageInfo = document.getElementById('mobile-list-page-info');
        const prevBtn = document.getElementById('list-prev-btn');
        const nextBtn = document.getElementById('list-next-btn');

        const pageText = `${this.currentListPage} / ${totalPages}`;
        if (pageInfo) pageInfo.textContent = pageText;
        if (mobilePageInfo) mobilePageInfo.textContent = pageText;

        if (prevBtn) {
            prevBtn.disabled = this.currentListPage <= 1 || !this.cards || this.cards.length === 0;
        }

        if (nextBtn) {
            nextBtn.disabled = this.currentListPage >= totalPages || !this.cards || this.cards.length === 0;
        }
    },

    changeListPage(delta) {
        const totalPages = Math.max(1, Math.ceil((this.cards?.length || 0) / this.itemsPerPage));
        const newPage = this.currentListPage + delta;

        if (newPage >= 1 && newPage <= totalPages) {
            this.currentListPage = newPage;
            this.renderCardList();
        }
    },

    async randomizeAllPositions() {
        if (!this.cards || this.cards.length === 0) {
            ToastManager.show('변경할 카드가 없습니다', 'warning');
            return;
        }

        const confirmRandomize = window.confirm('모든 오브제의 위치를 랜덤하게 변경하시겠습니까?');
        if (!confirmRandomize) return;

        try {
            LoadingManager.show('위치 변경 중...');

            // 겹침 방지를 위해 순차적으로 위치 지정
            const existingPositions = [];
            const updatePromises = [];

            for (const card of this.cards) {
                // SVG 좌표로 직접 새 위치 생성
                const svgPos = this.getRandomTreePosition(existingPositions);

                card.positionX = svgPos.x;
                card.positionY = svgPos.y;

                // 새 위치를 기존 위치 목록에 추가 (SVG 좌표)
                existingPositions.push({ x: svgPos.x, y: svgPos.y });

                // 서버에 저장 (SVG 좌표)
                updatePromises.push(
                    this.sheetsHandler.updateCardPosition(card.id, svgPos.x, svgPos.y)
                );
            }

            // 모든 업데이트가 완료될 때까지 대기
            await Promise.all(updatePromises);

            // 오브제 다시 렌더링
            this.renderOrnaments();

            ToastManager.show('모든 오브제 위치가 변경되었습니다! 🎄', 'success');
        } catch (error) {
            console.error('Error randomizing positions:', error);
            ToastManager.show('위치 변경에 실패했습니다', 'error');
        } finally {
            LoadingManager.hide();
        }
    },

    openCardDetail(cardId) {
        const card = this.cards.find(c => c.id === cardId);
        if (!card) return;

        this.currentCard = card;
        this.currentCardId = cardId;

        const modal = document.getElementById('card-detail-modal');
        const content = document.getElementById('card-detail-content');

        // 카드 내용 렌더링
        if (card.cardType === 'url') {
            // URL 카드
            content.innerHTML = `
                <h3 style="font-size: 1.5rem; margin-bottom: 1rem; color: var(--christmas-red);">
                    ${card.authorName}님의 카드
                </h3>
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 8px; min-height: 200px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                    <p style="color: white; font-size: 1.2rem; margin-bottom: 1rem;">링크 카드</p>
                    <a href="${card.url}" target="_blank" style="color: #FFD700; font-size: 1.1rem; text-decoration: underline;">
                        ${card.url}
                    </a>
                </div>
            `;
        } else {
            // 일반 카드
            const cardData = card.cardData || {};
            const texts = cardData.texts || [];
            const images = cardData.images || [];
            const background = cardData.background || { color: '#ffffff', animation: 'none' };

            // Build card content
            let cardContent = '';

            // Add images
            images.forEach(img => {
                const fitMode = img.fitMode || 'contain';
                cardContent += `
                    <div style="position: absolute; left: 50%; top: 50%; transform: translate(${img.x}px, ${img.y}px) rotate(${img.rotation}deg); width: ${img.width}px; height: ${img.height}px;">
                        <img src="${img.src}" style="width: 100%; height: 100%; display: block; object-fit: ${fitMode};" />
                    </div>
                `;
            });

            // Add texts
            texts.forEach(text => {
                const animationClass = text.animation && text.animation !== 'none' ? text.animation : '';
                const escapedText = text.text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                const formattedText = escapedText.replace(/\n/g, '<br>');
                cardContent += `
                    <div class="${animationClass}" style="position: absolute; left: 50%; top: 50%; transform: translate(${text.x}px, ${text.y}px); font-size: ${text.fontSize}px; font-family: '${text.fontFamily}'; color: ${text.color}; text-align: ${text.textAlign}; padding: 10px; width: ${text.width}px; height: ${text.height}px;">
                        ${formattedText}
                    </div>
                `;
            });

            // Calculate scale for mobile
            const isMobile = window.innerWidth <= 768;
            const cardWidth = 600;
            const cardHeight = 400;

            content.innerHTML = `
                <h3 style="font-size: 1.5rem; margin-bottom: 1rem; color: var(--christmas-red);">
                    ${card.authorName}님의 카드
                </h3>
                <div class="card-detail-card-container">
                    <div class="card-detail-card ${background.animation !== 'none' ? background.animation : ''}"
                        style="background: ${background.color};"
                        data-original-width="${cardWidth}"
                        data-original-height="${cardHeight}">
                        <div class="card-content-scaled" style="width: ${cardWidth}px; height: ${cardHeight}px; position: relative;">
                            ${cardContent || '<p style="color: #666; text-align: center; padding-top: 160px;">빈 카드입니다</p>'}
                        </div>
                    </div>
                </div>
            `;

            // Apply scale for mobile after rendering
            if (isMobile) {
                requestAnimationFrame(() => {
                    this.scaleCardForMobile();
                });
            }
        }

        modal.classList.add('active');
    },

    scaleCardForMobile() {
        const cardContainer = document.querySelector('.card-detail-card');
        const cardContent = document.querySelector('.card-content-scaled');

        if (!cardContainer || !cardContent) return;

        const originalWidth = 600;
        const containerWidth = cardContainer.offsetWidth;

        if (containerWidth < originalWidth) {
            const scale = containerWidth / originalWidth;
            cardContent.style.transform = `scale(${scale})`;
            cardContent.style.transformOrigin = 'top left';
            // Adjust container height based on scale
            cardContainer.style.height = `${400 * scale}px`;
        }
    },

    setupBackgroundAnimations() {
        const container = document.getElementById('background-animations');
        AnimationEngine.createSnowfall(container);
        AnimationEngine.createStars(container);
    },

    setupAudioControls() {
        try {
            const playBtn = document.getElementById('audio-play');
            const pauseBtn = document.getElementById('audio-pause');
            const muteBtn = document.getElementById('audio-mute');
            const volumeSlider = document.getElementById('audio-volume');
            const toggleBtn = document.getElementById('audio-toggle');
            const controls = document.getElementById('audio-controls');

            if (!playBtn || !pauseBtn || !muteBtn || !volumeSlider) return;

            // 전역 Audio 객체 사용 (페이지 간 공유)
            if (!window.globalAudio) {
                window.globalAudio = new Audio('christmas-background-magic-443349.mp3');
                window.globalAudio.loop = true;
                window.globalAudio.preload = 'auto';

                // localStorage에서 저장된 상태 복원 (try-catch로 안전하게)
                let savedVolume = 0.3;
                let savedMuted = false;
                try {
                    const storedVolume = localStorage.getItem('bgm_volume');
                    const storedMuted = localStorage.getItem('bgm_muted');
                    savedVolume = storedVolume ? parseFloat(storedVolume) : 0.3;
                    savedMuted = storedMuted === 'true';
                } catch (error) {
                    console.warn('localStorage access denied, using default audio settings', error);
                }

                window.globalAudio.volume = savedVolume;
                window.globalAudio.muted = savedMuted;

                // 즉시 로드 시작
                window.globalAudio.load();

                if (volumeSlider) {
                    volumeSlider.value = window.globalAudio.volume;
                }
            }

            this.audio = window.globalAudio;
            this.audioStarted = !this.audio.paused;

            const updateButtons = (isPlaying) => {
                playBtn.style.display = isPlaying ? 'none' : 'inline-flex';
                pauseBtn.style.display = isPlaying ? 'inline-flex' : 'none';
            };

            const tryPlay = async (force = false) => {
                if (this.audioStarted && !force) return;
                try {
                    await this.audio.play();
                    updateButtons(true);
                    this.audioStarted = true;
                    // BGM 재생 시작되면 로딩 인디케이터 숨김
                    if (toggleBtn) {
                        toggleBtn.classList.remove('loading');
                        toggleBtn.innerHTML = '<i class="fas fa-music"></i> BGM 설정';
                    }
                } catch (err) {
                    console.warn('Autoplay blocked, waiting for user gesture');
                    const oncePlay = async () => {
                        try {
                            await this.audio.play();
                            updateButtons(true);
                            this.audioStarted = true;
                            if (toggleBtn) {
                                toggleBtn.classList.remove('loading');
                                toggleBtn.innerHTML = '<i class="fas fa-music"></i> BGM 설정';
                            }
                            document.removeEventListener('pointerdown', oncePlay);
                        } catch (e2) {
                            console.warn('Play failed after gesture', e2);
                        }
                    };
                    document.addEventListener('pointerdown', oncePlay, { once: true });
                }
            };

            // 로딩 인디케이터 표시
            if (toggleBtn) {
                toggleBtn.classList.add('loading');
                toggleBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> BGM 로딩 중...';
            }

            // 오디오 로드 에러 핸들링
            this.audio.addEventListener('error', (e) => {
                console.error('BGM loading error:', e);
                if (toggleBtn) {
                    toggleBtn.classList.remove('loading');
                    toggleBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> BGM 로드 실패';
                }
            }, { once: true });

            // canplay: 충분한 데이터가 로드되어 재생을 시작할 수 있을 때 (빠른 로딩)
            this.audio.addEventListener('canplay', () => {
                tryPlay();
            }, { once: true });

            playBtn.addEventListener('click', () => {
                this.audio.play();
                this.audioStarted = true;
                updateButtons(true);
            });

            pauseBtn.addEventListener('click', () => {
                this.audio.pause();
                updateButtons(false);
            });

            muteBtn.addEventListener('click', () => {
                this.audio.muted = !this.audio.muted;
                muteBtn.textContent = this.audio.muted ? '음소거 해제' : '음소거';
                // localStorage에 음소거 상태 저장 (try-catch로 안전하게)
                try {
                    localStorage.setItem('bgm_muted', this.audio.muted);
                } catch (error) {
                    console.warn('localStorage write failed', error);
                }
            });

            volumeSlider.addEventListener('input', (e) => {
                const v = parseFloat(e.target.value);
                this.audio.volume = isNaN(v) ? 0.3 : v;
                if (this.audio.muted && v > 0) {
                    this.audio.muted = false;
                    muteBtn.textContent = '음소거';
                    try {
                        localStorage.setItem('bgm_muted', false);
                    } catch (error) {
                        console.warn('localStorage write failed', error);
                    }
                }
                // localStorage에 볼륨 저장 (try-catch로 안전하게)
                try {
                    localStorage.setItem('bgm_volume', this.audio.volume);
                } catch (error) {
                    console.warn('localStorage write failed', error);
                }
            });

            if (toggleBtn && controls) {
                toggleBtn.addEventListener('click', () => {
                    controls.classList.toggle('hidden');
                });
            }

            // UI 상태 초기화
            updateButtons(!this.audio.paused);
            muteBtn.textContent = this.audio.muted ? '음소거 해제' : '음소거';

            // 이미 재생 중이면 자동재생 시도하지 않음
            if (!this.audioStarted) {
                // initial play attempt
                tryPlay();
            } else {
                // 이미 재생 중이면 로딩 인디케이터 제거
                if (toggleBtn) {
                    toggleBtn.classList.remove('loading');
                    toggleBtn.innerHTML = '<i class="fas fa-music"></i> BGM 설정';
                }
            }
        } catch (error) {
            console.error('Error setting up audio controls:', error);
        }
    },

    setupEventListeners() {
        // Card type radio buttons
        const cardTypeRadios = document.querySelectorAll('input[name="card-type"]');
        cardTypeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                const urlGroup = document.getElementById('url-input-group');
                const normalTools = document.getElementById('normal-card-tools');

                if (e.target.value === 'url') {
                    urlGroup.classList.remove('hidden');
                    normalTools.classList.add('hidden');
                } else {
                    urlGroup.classList.add('hidden');
                    normalTools.classList.remove('hidden');
                }
            });
        });
    },

    renderCardList() {
        const cardListContent = document.getElementById('card-list-content');
        const mobileCardList = document.getElementById('mobile-card-list');
        const mobileCardCount = document.getElementById('mobile-card-count');

        // Update mobile card count badge
        if (mobileCardCount) {
            mobileCardCount.textContent = this.cards ? this.cards.length : 0;
        }

        if (!this.cards || this.cards.length === 0) {
            const emptyMsg = '<p class="empty-message">아직 작성된 카드가 없습니다</p>';
            if (cardListContent) cardListContent.innerHTML = emptyMsg;
            if (mobileCardList) mobileCardList.innerHTML = emptyMsg;
            this.currentListPage = 1;
            this.updateListPagination(1);
            return;
        }

        // 최신순 정렬 (createdAt 또는 updatedAt 기준)
        const sortedCards = [...this.cards].sort((a, b) => {
            const dateA = new Date(a.updatedAt || a.createdAt);
            const dateB = new Date(b.updatedAt || b.createdAt);
            return dateB - dateA; // 내림차순 (최신이 위로)
        });

        const totalPages = Math.max(1, Math.ceil(sortedCards.length / this.itemsPerPage));
        if (this.currentListPage > totalPages) {
            this.currentListPage = totalPages;
        }

        const startIdx = (this.currentListPage - 1) * this.itemsPerPage;
        const endIdx = startIdx + this.itemsPerPage;
        const pageCards = sortedCards.slice(startIdx, endIdx);

        const cardListHTML = pageCards.map(card => {
            const icon = CONFIG.ORNAMENT_TYPES[card.ornamentType] || '🎁';
            // 카드 제목: URL 카드면 URL, 일반 카드면 첫 텍스트 또는 작성자 이름
            let title = card.authorName + '님의 카드';
            if (card.cardType === 'url' && card.url) {
                title = card.url.length > 30 ? card.url.substring(0, 30) + '...' : card.url;
            } else if (card.cardData && card.cardData.texts && card.cardData.texts.length > 0) {
                const firstText = card.cardData.texts[0].content || '';
                if (firstText.length > 20) {
                    title = firstText.substring(0, 20) + '...';
                } else if (firstText) {
                    title = firstText;
                }
            }

            return `
                <div class="card-list-item" data-card-id="${card.id}">
                    <div class="card-list-item-title" onclick="app.highlightOrnament('${card.id}')">
                        ${icon} ${title}
                    </div>
                    <div class="card-list-item-author">작성자: ${card.authorName}</div>
                    <div class="card-list-item-buttons">
                        <button class="card-list-item-btn" onclick="app.openCardFromList('${card.id}')">
                            카드 보기
                        </button>
                        <button class="card-list-item-btn btn-location" onclick="app.findOrnamentLocation('${card.id}')">
                            위치 찾기
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // Update both desktop and mobile card lists
        if (cardListContent) cardListContent.innerHTML = cardListHTML;
        if (mobileCardList) mobileCardList.innerHTML = cardListHTML;

        this.updateListPagination(totalPages);
    },

    toggleMobileCardList() {
        const overlay = document.getElementById('mobile-card-overlay');
        if (overlay) {
            overlay.classList.toggle('active');
            // Prevent body scroll when overlay is open
            document.body.style.overflow = overlay.classList.contains('active') ? 'hidden' : '';
        }
    },

    highlightOrnament(cardId) {
        // 1. 카드가 전체 카드 목록에서 몇 번째인지 찾기
        const cardIndex = this.cards.findIndex(c => c.id === cardId);
        if (cardIndex === -1) return;

        // 2. 해당 카드가 몇 페이지에 있는지 계산
        const targetPage = Math.floor(cardIndex / this.itemsPerPage) + 1;

        // 3. 현재 페이지와 다르면 페이지 이동
        if (this.currentTreePage !== targetPage) {
            this.currentTreePage = targetPage;
            this.renderOrnaments();
        }

        // 4. 약간의 지연 후 오브제 강조 (렌더링 완료 대기)
        setTimeout(() => {
            const ornament = document.querySelector(`.ornament[data-card-id="${cardId}"]`);
            if (!ornament) return;

            // 5. 강조 애니메이션 추가 (크게 확대 + 빛나는 효과)
            ornament.classList.add('highlight');

            // 6. 트리가 보이도록 스크롤
            ornament.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // 7. 애니메이션 끝나면 클래스 제거
            setTimeout(() => {
                ornament.classList.remove('highlight');
            }, 1500);
        }, 100);
    },

    openCardFromList(cardId) {
        const card = this.cards.find(c => c.id === cardId);
        if (!card) return;

        // Close mobile card list overlay if open
        const mobileOverlay = document.getElementById('mobile-card-overlay');
        if (mobileOverlay && mobileOverlay.classList.contains('active')) {
            mobileOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }

        if (card.cardType === 'url' && card.url) {
            const confirmOpen = window.confirm('링크로 이동하시겠습니까?\n' + card.url);
            if (confirmOpen) {
                window.open(card.url, '_blank');
            }
        } else {
            this.openCardDetail(cardId);
        }
    },

    renderTree() {
        const treeElement = document.getElementById('christmas-tree');
        if (!treeElement) return;
        treeElement.innerHTML = `
            <svg viewBox="0 -10 200 295" style="width: auto; height: 90%; max-width: 90%;" preserveAspectRatio="xMidYMid meet">
                <!-- Tree trunk -->
                <rect x="85" y="220" width="30" height="60" fill="#654321" rx="2"/>
                <rect x="80" y="275" width="40" height="10" fill="#8B4513" rx="2"/>

                <!-- Tree layers with more detail -->
                <!-- Bottom layer -->
                <ellipse cx="100" cy="210" rx="85" ry="25" fill="#0A5F42" opacity="0.8"/>
                <path d="M 15,210 Q 100,160 185,210" fill="#0F8A5F"/>
                <path d="M 25,210 Q 100,165 175,210" fill="#16a561" opacity="0.7"/>

                <!-- Middle-bottom layer -->
                <ellipse cx="100" cy="165" rx="75" ry="22" fill="#0A5F42" opacity="0.8"/>
                <path d="M 25,165 Q 100,115 175,165" fill="#0F8A5F"/>
                <path d="M 35,165 Q 100,120 165,165" fill="#16a561" opacity="0.7"/>

                <!-- Middle layer -->
                <ellipse cx="100" cy="125" rx="65" ry="20" fill="#0A5F42" opacity="0.8"/>
                <path d="M 35,125 Q 100,75 165,125" fill="#0F8A5F"/>
                <path d="M 42,125 Q 100,80 158,125" fill="#16a561" opacity="0.7"/>

                <!-- Middle-top layer -->
                <ellipse cx="100" cy="90" rx="52" ry="17" fill="#0A5F42" opacity="0.8"/>
                <path d="M 48,90 Q 100,45 152,90" fill="#0F8A5F"/>
                <path d="M 54,90 Q 100,50 146,90" fill="#16a561" opacity="0.7"/>

                <!-- Top layer -->
                <ellipse cx="100" cy="60" rx="40" ry="14" fill="#0A5F42" opacity="0.8"/>
                <path d="M 60,60 Q 100,20 140,60" fill="#0F8A5F"/>
                <path d="M 65,60 Q 100,25 135,60" fill="#16a561" opacity="0.7"/>

                <!-- Very top -->
                <path d="M 100,15 L 85,40 L 115,40 Z" fill="#0F8A5F"/>

                <!-- Decorative lights (small circles) -->
                <circle cx="60" cy="210" r="3" fill="#FFD700" opacity="0.8">
                    <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/>
                </circle>
                <circle cx="140" cy="210" r="3" fill="#FF6B6B" opacity="0.8">
                    <animate attributeName="opacity" values="0.3;1;0.3" dur="2.5s" repeatCount="indefinite"/>
                </circle>
                <circle cx="50" cy="165" r="3" fill="#4ECDC4" opacity="0.8">
                    <animate attributeName="opacity" values="0.3;1;0.3" dur="1.8s" repeatCount="indefinite"/>
                </circle>
                <circle cx="150" cy="165" r="3" fill="#FFD700" opacity="0.8">
                    <animate attributeName="opacity" values="0.3;1;0.3" dur="2.2s" repeatCount="indefinite"/>
                </circle>
                <circle cx="70" cy="125" r="3" fill="#FF6B6B" opacity="0.8">
                    <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite"/>
                </circle>
                <circle cx="130" cy="125" r="3" fill="#4ECDC4" opacity="0.8">
                    <animate attributeName="opacity" values="0.3;1;0.3" dur="2.8s" repeatCount="indefinite"/>
                </circle>
                <circle cx="85" cy="90" r="2.5" fill="#FFD700" opacity="0.8">
                    <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/>
                </circle>
                <circle cx="115" cy="90" r="2.5" fill="#FF6B6B" opacity="0.8">
                    <animate attributeName="opacity" values="0.3;1;0.3" dur="1.7s" repeatCount="indefinite"/>
                </circle>

                <!-- Star on top with glow -->
                <defs>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
                <text x="100" y="20" text-anchor="middle" font-size="28" fill="#FFD700" filter="url(#glow)">⭐</text>

                <!-- Ornaments group - will be populated by renderOrnaments() -->
                <g id="ornaments-group"></g>
            </svg>
        `;
    },

    openCardEditor() {
        // 새 카드 작성 시 에디터 초기화
        this.resetEditor();
        this.switchView('editor');
        this.setupKeyboardListeners();
    },

    closeCardEditor() {
        // Always use SPA navigation to preserve BGM
        this.switchView('tree');
        this.resetEditor();
        this.removeKeyboardListeners();

        // 트리 뷰로 돌아갈 때 트리가 없으면 렌더링
        const treeElement = document.getElementById('christmas-tree');
        if (!treeElement || !treeElement.innerHTML.trim()) {
            this.renderTree();
            this.renderOrnaments();
            this.renderCardList();
        }
    },

    switchView(viewName) {
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });

        const targetView = viewName === 'tree' ? 'tree-view' : 'card-editor-view';
        document.getElementById(targetView).classList.add('active');
        this.currentView = viewName;
    },

    resetEditor() {
        document.getElementById('author-name').value = '';
        document.getElementById('card-password').value = '';
        document.getElementById('card-url').value = '';
        document.getElementById('editor-canvas').innerHTML = '';
        this.cardElements = [];
        this.selectedElement = null;

        // Show base panel and hide properties panels
        const basePanel = document.getElementById('base-form-panel');
        const textPanel = document.getElementById('text-properties-panel');
        const imagePanel = document.getElementById('image-properties-panel');

        if (basePanel) basePanel.classList.remove('hidden');
        if (textPanel) textPanel.classList.add('hidden');
        if (imagePanel) imagePanel.classList.add('hidden');
    },

    setupKeyboardListeners() {
        this.keyboardHandler = (e) => {
            // Delete key or Backspace
            if ((e.key === 'Delete' || e.key === 'Backspace') && this.selectedElement) {
                // Don't delete if user is editing text inside a contentEditable element
                if (document.activeElement === this.selectedElement &&
                    this.selectedElement.getAttribute('contenteditable') === 'true') {
                    return;
                }

                e.preventDefault();
                this.deleteSelectedElement();
            }
        };

        document.addEventListener('keydown', this.keyboardHandler);
    },

    removeKeyboardListeners() {
        if (this.keyboardHandler) {
            document.removeEventListener('keydown', this.keyboardHandler);
            this.keyboardHandler = null;
        }
    },

    addTextBox() {
        const canvas = document.getElementById('editor-canvas');

        // Create text box element
        const textBox = document.createElement('div');
        textBox.className = 'card-element text-box';
        textBox.contentEditable = true;
        textBox.textContent = '텍스트를 입력하세요';
        textBox.style.position = 'absolute';
        textBox.style.left = '50%';
        textBox.style.top = '50%';
        textBox.style.transform = 'translate(-50%, -50%)';
        textBox.style.padding = '10px';
        textBox.style.minWidth = '100px';
        textBox.style.minHeight = '30px';
        textBox.style.width = '200px';
        textBox.style.height = '80px';
        textBox.style.fontSize = '16px';
        textBox.style.fontFamily = CONFIG.FONTS[0];
        textBox.style.color = '#000000';
        textBox.style.textAlign = 'left';
        textBox.style.cursor = 'move';
        textBox.style.border = '2px dashed #ccc';
        textBox.style.borderRadius = '4px';
        textBox.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        textBox.style.outline = 'none';
        textBox.style.touchAction = 'none';

        // Add unique ID
        const elementId = 'text-' + Date.now();
        textBox.setAttribute('data-element-id', elementId);

        this.addResizeHandles(textBox);

        // Make draggable with interact.js (ignore resize handles)
        interact(textBox).draggable({
            inertia: true,
            ignoreFrom: '.resize-handle',
            modifiers: [
                interact.modifiers.restrictRect({
                    restriction: 'parent',
                    endOnly: true
                })
            ],
            autoScroll: true,
            listeners: {
                move: (event) => {
                    const target = event.target;
                    const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
                    const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

                    target.style.transform = `translate(${x}px, ${y}px)`;
                    target.setAttribute('data-x', x);
                    target.setAttribute('data-y', y);
                }
            }
        });

        // Resize via handles
        interact(textBox).resizable({
            edges: {
                left: '.resize-handle.w, .resize-handle.sw, .resize-handle.nw',
                right: '.resize-handle.e, .resize-handle.se, .resize-handle.ne',
                top: '.resize-handle.n, .resize-handle.nw, .resize-handle.ne',
                bottom: '.resize-handle.s, .resize-handle.sw, .resize-handle.se'
            },
            margin: 0,
            listeners: {
                move: (event) => {
                    const target = event.target;
                    let x = parseFloat(target.getAttribute('data-x')) || 0;
                    let y = parseFloat(target.getAttribute('data-y')) || 0;

                    target.style.width = event.rect.width + 'px';
                    target.style.height = event.rect.height + 'px';

                    x += event.deltaRect.left;
                    y += event.deltaRect.top;

                    target.style.transform = `translate(${x}px, ${y}px)`;
                    target.setAttribute('data-x', x);
                    target.setAttribute('data-y', y);
                }
            },
            modifiers: [
                interact.modifiers.restrictSize({
                    min: { width: 80, height: 40 },
                    max: { width: 800, height: 600 }
                })
            ]
        });

        // Click to select
        textBox.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectElement(textBox);
        });

        // Focus event
        textBox.addEventListener('focus', () => {
            textBox.style.border = '2px solid var(--christmas-gold)';
        });

        textBox.addEventListener('blur', () => {
            textBox.style.border = '2px dashed #ccc';
        });

        canvas.appendChild(textBox);

        // Store element data
        const elementData = {
            id: elementId,
            type: 'text',
            element: textBox,
            data: {
                text: textBox.textContent,
                fontSize: 16,
                fontFamily: CONFIG.FONTS[0],
                color: '#000000',
                textAlign: 'left',
                animation: 'none',
                x: 0,
                y: 0,
                width: 200,
                height: 80
            }
        };

        this.cardElements.push(elementData);
        this.selectElement(textBox);

        ToastManager.show('텍스트 박스가 추가되었습니다', 'success');
    },

    async addSticker() {
        try {
            LoadingManager.show('스티커를 불러오는 중...');

            // Load stickers if not already loaded
            const stickers = await this.stickerManager.loadStickers();

            LoadingManager.hide();

            // Show sticker selection modal
            this.showStickerPicker(stickers);
        } catch (error) {
            console.error('Error loading stickers:', error);
            ToastManager.show('스티커를 불러오는데 실패했습니다', 'error');
            LoadingManager.hide();
        }
    },

    showStickerPicker(stickers) {
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'sticker-picker-modal';
        modal.style.zIndex = '10001';

        let stickerGrid = '';
        stickers.forEach(sticker => {
            const deleteBtn = sticker.isCustom ? `
                <button class="delete-sticker-btn" data-sticker-id="${sticker.id}"
                    style="position: absolute; top: 0; right: 0; background: var(--christmas-red); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-size: 12px; display: none; z-index: 10;">
                    <i class="fas fa-times"></i>
                </button>
            ` : '';

            stickerGrid += `
                <div class="sticker-item" data-sticker-id="${sticker.id}" style="position: relative; cursor: pointer; padding: 0.5rem; border: 2px solid transparent; border-radius: 8px; transition: all 0.3s;">
                    ${deleteBtn}
                    <img src="${sticker.data}" style="width: 100%; height: 100%; object-fit: contain;" alt="${sticker.name}">
                </div>
            `;
        });

        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <button class="modal-close" onclick="app.closeStickerPicker()">
                    <i class="fas fa-times"></i>
                </button>
                <h2 class="text-center mb-3" style="color: var(--christmas-gold);">스티커 선택</h2>

                <div style="margin-bottom: 1rem; text-align: center;">
                    <input type="file" id="custom-sticker-upload" accept="image/*" style="display: none;">
                    <button class="btn btn-secondary" onclick="document.getElementById('custom-sticker-upload').click()">
                        <i class="fas fa-upload"></i> 내 스티커 추가 (최대 2MB)
                    </button>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 1rem; max-height: 60vh; overflow-y: auto;">
                    ${stickerGrid}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Handle file upload
        const uploadInput = document.getElementById('custom-sticker-upload');
        uploadInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                LoadingManager.show('스티커를 업로드하는 중...');
                await this.stickerManager.addCustomSticker(file);
                LoadingManager.hide();
                ToastManager.show('커스텀 스티커가 추가되었습니다', 'success');

                // Reload sticker picker
                this.closeStickerPicker();
                const updatedStickers = await this.stickerManager.loadStickers();
                this.showStickerPicker(updatedStickers);
            } catch (error) {
                LoadingManager.hide();
                ToastManager.show(error.message, 'error');
            }
        });

        // Add click handlers to stickers
        modal.querySelectorAll('.sticker-item').forEach(item => {
            item.addEventListener('click', (e) => {
                // Don't select sticker if clicking delete button
                if (e.target.closest('.delete-sticker-btn')) return;

                const stickerId = item.dataset.stickerId;
                const sticker = stickers.find(s => s.id === stickerId);
                if (sticker) {
                    this.createImageElement(sticker.data);
                    this.closeStickerPicker();
                    ToastManager.show('스티커가 추가되었습니다', 'success');
                }
            });

            // Hover effect
            item.addEventListener('mouseenter', () => {
                item.style.border = '2px solid var(--christmas-gold)';
                item.style.transform = 'scale(1.1)';

                // Show delete button for custom stickers
                const deleteBtn = item.querySelector('.delete-sticker-btn');
                if (deleteBtn) {
                    deleteBtn.style.display = 'block';
                }
            });
            item.addEventListener('mouseleave', () => {
                item.style.border = '2px solid transparent';
                item.style.transform = 'scale(1)';

                // Hide delete button
                const deleteBtn = item.querySelector('.delete-sticker-btn');
                if (deleteBtn) {
                    deleteBtn.style.display = 'none';
                }
            });
        });

        // Add delete handlers for custom stickers
        modal.querySelectorAll('.delete-sticker-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();

                const stickerId = btn.dataset.stickerId;
                if (confirm('이 스티커를 삭제하시겠습니까?')) {
                    this.stickerManager.deleteCustomSticker(stickerId);
                    ToastManager.show('스티커가 삭제되었습니다', 'success');

                    // Reload sticker picker
                    this.closeStickerPicker();
                    const updatedStickers = await this.stickerManager.loadStickers();
                    this.showStickerPicker(updatedStickers);
                }
            });
        });
    },

    closeStickerPicker() {
        const modal = document.getElementById('sticker-picker-modal');
        if (modal) {
            modal.remove();
        }
    },

    createImageElement(base64Data) {
        const canvas = document.getElementById('editor-canvas');

        // Create image element container
        const imageContainer = document.createElement('div');
        imageContainer.className = 'card-element image-box';
        imageContainer.style.position = 'absolute';
        imageContainer.style.left = '50%';
        imageContainer.style.top = '50%';
        imageContainer.style.transform = 'translate(-50%, -50%)';
        imageContainer.style.cursor = 'move';
        imageContainer.style.border = '2px dashed #ccc';
        imageContainer.style.borderRadius = '4px';
        imageContainer.style.width = '200px';
        imageContainer.style.height = '200px';

        // Create image
        const img = document.createElement('img');
        img.src = base64Data;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.display = 'block';
        img.style.objectFit = 'contain';
        img.style.pointerEvents = 'none';

        imageContainer.appendChild(img);

        // Add unique ID
        const elementId = 'image-' + Date.now();
        imageContainer.setAttribute('data-element-id', elementId);

        // Make draggable and resizable
        interact(imageContainer)
            .draggable({
                inertia: true,
                modifiers: [
                    interact.modifiers.restrictRect({
                        restriction: 'parent',
                        endOnly: true
                    })
                ],
                autoScroll: true,
                listeners: {
                    move: (event) => {
                        const target = event.target;
                        const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
                        const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

                        target.style.transform = `translate(${x}px, ${y}px) rotate(${target.getAttribute('data-rotation') || 0}deg)`;
                        target.setAttribute('data-x', x);
                        target.setAttribute('data-y', y);
                    }
                }
            })
            .resizable({
                edges: { left: true, right: true, bottom: true, top: true },
                listeners: {
                    move: (event) => {
                        const target = event.target;
                        let x = parseFloat(target.getAttribute('data-x')) || 0;
                        let y = parseFloat(target.getAttribute('data-y')) || 0;

                        // Update the element's style
                        target.style.width = event.rect.width + 'px';
                        target.style.height = event.rect.height + 'px';

                        // Translate when resizing from top or left edges
                        x += event.deltaRect.left;
                        y += event.deltaRect.top;

                        target.style.transform = `translate(${x}px, ${y}px) rotate(${target.getAttribute('data-rotation') || 0}deg)`;
                        target.setAttribute('data-x', x);
                        target.setAttribute('data-y', y);
                    }
                },
                modifiers: [
                    // Keep aspect ratio when shift key is held
                    interact.modifiers.aspectRatio({
                        ratio: 'preserve',
                        enabled: true
                    }),
                    interact.modifiers.restrictSize({
                        min: { width: 50, height: 50 },
                        max: { width: 500, height: 500 }
                    })
                ]
            });

        // Click to select
        imageContainer.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectElement(imageContainer);
        });

        canvas.appendChild(imageContainer);

        // Store element data
        const elementData = {
            id: elementId,
            type: 'image',
            element: imageContainer,
            data: {
                src: base64Data,
                width: 200,
                height: 200,
                rotation: 0,
                fitMode: 'contain',
                x: 0,
                y: 0
            }
        };

        this.cardElements.push(elementData);
        this.selectElement(imageContainer);
    },

    createTextElementFromData(textData) {
        const canvas = document.getElementById('editor-canvas');

        const textBox = document.createElement('div');
        textBox.className = 'card-element text-box';
        textBox.contentEditable = true;
        textBox.style.position = 'absolute';
        textBox.style.left = '50%';
        textBox.style.top = '50%';
        textBox.style.transform = 'translate(-50%, -50%)';
        textBox.style.padding = '10px';
        textBox.style.minWidth = '100px';
        textBox.style.minHeight = '30px';
        textBox.style.width = '200px';
        textBox.style.height = '80px';
        textBox.style.border = '2px dashed #ccc';
        textBox.style.borderRadius = '4px';
        textBox.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        textBox.style.outline = 'none';
        textBox.style.cursor = 'move';
        textBox.style.touchAction = 'none';

        textBox.style.fontSize = (textData.fontSize || 16) + 'px';
        textBox.style.fontFamily = (textData.fontFamily || CONFIG.FONTS[0]);
        textBox.style.color = textData.color || '#000000';
        textBox.style.textAlign = textData.textAlign || 'left';
        textBox.innerHTML = (textData.text || '').replace(/\n/g, '<br>');

        if (textData.width) {
            textBox.style.width = textData.width + 'px';
        }
        if (textData.height) {
            textBox.style.height = textData.height + 'px';
        }

        const x = parseFloat(textData.x) || 0;
        const y = parseFloat(textData.y) || 0;
        textBox.style.transform = `translate(${x}px, ${y}px)`;
        textBox.setAttribute('data-x', x);
        textBox.setAttribute('data-y', y);

        // Add unique ID
        const elementId = 'text-' + Date.now() + Math.random().toString(16).slice(2);
        textBox.setAttribute('data-element-id', elementId);

        this.addResizeHandles(textBox);

        interact(textBox).draggable({
            inertia: true,
            ignoreFrom: '.resize-handle',
            modifiers: [
                interact.modifiers.restrictRect({
                    restriction: 'parent',
                    endOnly: true
                })
            ],
            autoScroll: true,
            listeners: {
                move: (event) => {
                    const target = event.target;
                    const moveX = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
                    const moveY = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

                    target.style.transform = `translate(${moveX}px, ${moveY}px)`;
                    target.setAttribute('data-x', moveX);
                    target.setAttribute('data-y', moveY);
                }
            }
        });

        // Resize text box via visible handles (edges mapped to handles)
        interact(textBox).resizable({
            edges: {
                left: '.resize-handle.w, .resize-handle.sw, .resize-handle.nw',
                right: '.resize-handle.e, .resize-handle.se, .resize-handle.ne',
                top: '.resize-handle.n, .resize-handle.nw, .resize-handle.ne',
                bottom: '.resize-handle.s, .resize-handle.sw, .resize-handle.se'
            },
            margin: 0,
            listeners: {
                move: (event) => {
                    const target = event.target;
                    let moveX = parseFloat(target.getAttribute('data-x')) || 0;
                    let moveY = parseFloat(target.getAttribute('data-y')) || 0;

                    target.style.width = event.rect.width + 'px';
                    target.style.height = event.rect.height + 'px';

                    moveX += event.deltaRect.left;
                    moveY += event.deltaRect.top;

                    target.style.transform = `translate(${moveX}px, ${moveY}px)`;
                    target.setAttribute('data-x', moveX);
                    target.setAttribute('data-y', moveY);
                }
            },
            modifiers: [
                interact.modifiers.restrictSize({
                    min: { width: 80, height: 40 },
                    max: { width: 800, height: 600 }
                })
            ]
        });

        textBox.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectElement(textBox);
        });

        textBox.addEventListener('focus', () => {
            textBox.style.border = '2px solid var(--christmas-gold)';
        });

        textBox.addEventListener('blur', () => {
            textBox.style.border = '2px dashed #ccc';
        });

        canvas.appendChild(textBox);

        const elementData = {
            id: elementId,
            type: 'text',
            element: textBox,
            data: {
                text: textData.text || '',
                fontSize: textData.fontSize || 16,
                fontFamily: textData.fontFamily || CONFIG.FONTS[0],
                color: textData.color || '#000000',
                textAlign: textData.textAlign || 'left',
                animation: textData.animation || 'none',
                x: x,
                y: y,
                width: parseFloat(textBox.style.width) || textBox.offsetWidth || 200,
                height: parseFloat(textBox.style.height) || textBox.offsetHeight || 80
            }
        };

        this.cardElements.push(elementData);
    },

    createImageElementFromData(imageData) {
        const canvas = document.getElementById('editor-canvas');

        const imageContainer = document.createElement('div');
        imageContainer.className = 'card-element image-box';
        imageContainer.style.position = 'absolute';
        imageContainer.style.left = '50%';
        imageContainer.style.top = '50%';
        imageContainer.style.cursor = 'move';
        imageContainer.style.border = '2px dashed #ccc';
        imageContainer.style.borderRadius = '4px';
        imageContainer.style.width = (imageData.width || 200) + 'px';
        imageContainer.style.height = (imageData.height || 200) + 'px';

        const img = document.createElement('img');
        img.src = imageData.src;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.display = 'block';
        img.style.objectFit = imageData.fitMode || 'contain';
        img.style.pointerEvents = 'none';
        imageContainer.appendChild(img);

        const x = parseFloat(imageData.x) || 0;
        const y = parseFloat(imageData.y) || 0;
        const rotation = parseFloat(imageData.rotation) || 0;
        imageContainer.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg)`;
        imageContainer.setAttribute('data-x', x);
        imageContainer.setAttribute('data-y', y);
        imageContainer.setAttribute('data-rotation', rotation);

        const elementId = 'image-' + Date.now() + Math.random().toString(16).slice(2);
        imageContainer.setAttribute('data-element-id', elementId);

        interact(imageContainer)
            .draggable({
                inertia: true,
                modifiers: [
                    interact.modifiers.restrictRect({
                        restriction: 'parent',
                        endOnly: true
                    })
                ],
                autoScroll: true,
                listeners: {
                    move: (event) => {
                        const target = event.target;
                        const moveX = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
                        const moveY = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

                        target.style.transform = `translate(${moveX}px, ${moveY}px) rotate(${target.getAttribute('data-rotation') || 0}deg)`;
                        target.setAttribute('data-x', moveX);
                        target.setAttribute('data-y', moveY);
                    }
                }
            })
            .resizable({
                edges: { left: true, right: true, bottom: true, top: true },
                listeners: {
                    move: (event) => {
                        const target = event.target;
                        let moveX = parseFloat(target.getAttribute('data-x')) || 0;
                        let moveY = parseFloat(target.getAttribute('data-y')) || 0;

                        target.style.width = event.rect.width + 'px';
                        target.style.height = event.rect.height + 'px';

                        moveX += event.deltaRect.left;
                        moveY += event.deltaRect.top;

                        target.style.transform = `translate(${moveX}px, ${moveY}px) rotate(${target.getAttribute('data-rotation') || 0}deg)`;
                        target.setAttribute('data-x', moveX);
                        target.setAttribute('data-y', moveY);
                    }
                },
                modifiers: [
                    interact.modifiers.aspectRatio({
                        ratio: 'preserve',
                        enabled: true
                    }),
                    interact.modifiers.restrictSize({
                        min: { width: 50, height: 50 },
                        max: { width: 500, height: 500 }
                    })
                ]
            });

        imageContainer.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectElement(imageContainer);
        });

        canvas.appendChild(imageContainer);

        const elementData = {
            id: elementId,
            type: 'image',
            element: imageContainer,
            data: {
                src: imageData.src,
                width: imageData.width || 200,
                height: imageData.height || 200,
                rotation: rotation,
                fitMode: imageData.fitMode || 'contain',
                x: x,
                y: y
            }
        };

        this.cardElements.push(elementData);
    },

    addResizeHandles(target) {
        const positions = ['nw','ne','sw','se','n','s','w','e'];
        positions.forEach(pos => {
            if (target.querySelector(`.resize-handle.${pos}`)) return;
            const handle = document.createElement('div');
            handle.className = `resize-handle ${pos}`;
            target.appendChild(handle);
        });
    },

    selectElement(element) {
        // Deselect previous
        if (this.selectedElement) {
            this.selectedElement.classList.remove('selected');
            this.selectedElement.style.border = '2px dashed #ccc';
        }

        // Select new
        this.selectedElement = element;
        element.classList.add('selected');
        element.style.border = '2px solid var(--christmas-gold)';

        // Show appropriate properties panel
        const textPropsPanel = document.getElementById('text-properties-panel');
        const imagePropsPanel = document.getElementById('image-properties-panel');
        const basePanel = document.getElementById('base-form-panel');

        if (element.classList.contains('text-box')) {
            textPropsPanel.classList.remove('hidden');
            imagePropsPanel.classList.add('hidden');
            if (basePanel) basePanel.classList.add('hidden');

            const fontSize = parseInt(element.style.fontSize) || 16;
            const fontFamily = element.style.fontFamily || 'Jua';
            const color = this.rgbToHex(element.style.color) || '#000000';
            const textAlign = element.style.textAlign || 'left';

            document.getElementById('text-size').value = fontSize;
            document.getElementById('text-size-value').textContent = fontSize + 'px';
            document.getElementById('text-font').value = fontFamily.replace(/['"]/g, '');
            document.getElementById('text-color').value = color;

            this.setupTextPropertyListeners();
        } else if (element.classList.contains('image-box')) {
            textPropsPanel.classList.add('hidden');
            imagePropsPanel.classList.remove('hidden');
            if (basePanel) basePanel.classList.add('hidden');

            const img = element.querySelector('img');
            const fitMode = img ? img.style.objectFit : 'contain';
            document.getElementById('image-fit').value = fitMode || 'contain';

            this.setupImagePropertyListeners();
        }
    },

    rgbToHex(rgb) {
        if (!rgb || rgb === '') return '#000000';
        if (rgb.startsWith('#')) return rgb;

        const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        if (!match) return '#000000';

        const r = parseInt(match[1]).toString(16).padStart(2, '0');
        const g = parseInt(match[2]).toString(16).padStart(2, '0');
        const b = parseInt(match[3]).toString(16).padStart(2, '0');
        return '#' + r + g + b;
    },

    setupTextPropertyListeners() {
        const fontSelect = document.getElementById('text-font');
        const colorInput = document.getElementById('text-color');
        const animationSelect = document.getElementById('text-animation');

        this.setupPropertyMenuToggles();

        // Remove previous listeners by cloning
        const newFontSelect = fontSelect.cloneNode(true);
        fontSelect.parentNode.replaceChild(newFontSelect, fontSelect);

        const newColorInput = colorInput.cloneNode(true);
        colorInput.parentNode.replaceChild(newColorInput, colorInput);

        const newAnimationSelect = animationSelect.cloneNode(true);
        animationSelect.parentNode.replaceChild(newAnimationSelect, animationSelect);

        // Add new listeners
        newFontSelect.addEventListener('change', (e) => {
            if (this.selectedElement) {
                this.selectedElement.style.fontFamily = e.target.value;
            }
        });

        newColorInput.addEventListener('change', (e) => {
            if (this.selectedElement) {
                this.selectedElement.style.color = e.target.value;
            }
        });

        newAnimationSelect.addEventListener('change', (e) => {
            if (this.selectedElement) {
                const animation = e.target.value;
                // Remove previous animation classes
                this.selectedElement.classList.remove('fade-in', 'typing', 'sparkle', 'slide-in-left', 'slide-in-right', 'bounce');

                if (animation !== 'none') {
                    this.selectedElement.classList.add(animation);
                    // Store animation for saving
                    const elementData = this.cardElements.find(item => item.element === this.selectedElement);
                    if (elementData) {
                        elementData.animation = animation;
                    }
                }
            }
        });
    },

    setupImagePropertyListeners() {
        // Image property listeners are set up via onchange in HTML
    },

    setupPropertyMenuToggles() {
        if (this.propertyMenuInitialized) return;
        const buttons = document.querySelectorAll('.property-menu-btn');
        const sections = document.querySelectorAll('.property-section');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.dataset.target;
                sections.forEach(sec => {
                    if (sec.id === targetId) {
                        sec.classList.toggle('hidden');
                    } else {
                        sec.classList.add('hidden');
                    }
                });
            });
        });
        this.propertyMenuInitialized = true;
    },

    showBaseTools() {
        const base = document.getElementById('base-form-panel');
        const textPanel = document.getElementById('text-properties-panel');
        const imagePanel = document.getElementById('image-properties-panel');
        if (base) base.classList.remove('hidden');
        if (textPanel) textPanel.classList.add('hidden');
        if (imagePanel) imagePanel.classList.add('hidden');
    },
    populateEditorFromCardData(cardData) {
        const canvas = document.getElementById('editor-canvas');
        canvas.innerHTML = '';
        this.cardElements = [];
        this.selectedElement = null;

        // 배경 설정 (색상만)
        if (cardData.background && cardData.background.color) {
            canvas.style.background = cardData.background.color;
        } else {
            canvas.style.background = 'white';
        }

        const texts = cardData.texts || [];
        const images = cardData.images || [];

        texts.forEach(textData => this.createTextElementFromData(textData));
        images.forEach(imageData => this.createImageElementFromData(imageData));
    },

    updateTextSize(value) {
        document.getElementById('text-size-value').textContent = value + 'px';
        if (this.selectedElement && this.selectedElement.classList.contains('text-box')) {
            this.selectedElement.style.fontSize = value + 'px';
        }
    },

    setTextAlign(align) {
        if (this.selectedElement && this.selectedElement.classList.contains('text-box')) {
            this.selectedElement.style.textAlign = align;
        }
    },

    updateImageSize(value) {
        document.getElementById('image-size-value').textContent = value + 'px';
        if (this.selectedElement && this.selectedElement.classList.contains('image-box')) {
            this.selectedElement.style.width = value + 'px';
            this.selectedElement.style.height = 'auto';
        }
    },

    rotateImage(degrees) {
        if (this.selectedElement && this.selectedElement.classList.contains('image-box')) {
            const x = parseFloat(this.selectedElement.getAttribute('data-x')) || 0;
            const y = parseFloat(this.selectedElement.getAttribute('data-y')) || 0;

            this.selectedElement.style.transform = `translate(${x}px, ${y}px) rotate(${degrees}deg)`;
            this.selectedElement.setAttribute('data-rotation', degrees);

            // Store rotation for saving
            const elementData = this.cardElements.find(item => item.element === this.selectedElement);
            if (elementData) {
                elementData.data.rotation = degrees;
            }
        }
    },

    setImageFit(fitMode) {
        if (this.selectedElement && this.selectedElement.classList.contains('image-box')) {
            const img = this.selectedElement.querySelector('img');
            img.style.objectFit = fitMode;

            // Store fit mode
            const elementData = this.cardElements.find(item => item.element === this.selectedElement);
            if (elementData) {
                elementData.data.fitMode = fitMode;
            }
        }
    },

    cropSticker() {
        if (!this.selectedElement || !this.selectedElement.classList.contains('image-box')) {
            ToastManager.show('자르기할 스티커를 선택해주세요', 'warning');
            return;
        }

        const img = this.selectedElement.querySelector('img');
        if (!img || !img.src) {
            ToastManager.show('스티커 이미지를 찾을 수 없습니다', 'error');
            return;
        }

        // 원본 이미지 백업
        this.cropBackup = {
            element: this.selectedElement,
            originalSrc: img.src,
            elementData: this.cardElements.find(item => item.element === this.selectedElement)
        };

        // Show crop overlay
        const overlay = document.getElementById('crop-overlay');
        const container = document.getElementById('crop-container');
        overlay.classList.remove('hidden');

        // Clear previous content
        container.innerHTML = '';

        // Create image element
        const cropImg = document.createElement('img');
        cropImg.className = 'crop-image';
        cropImg.src = img.src;
        container.appendChild(cropImg);

        // Wait for image to load to get dimensions
        cropImg.onload = () => {
            const imgRect = cropImg.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();

            // Calculate image position relative to container
            const offsetX = imgRect.left - containerRect.left;
            const offsetY = imgRect.top - containerRect.top;

            // Create crop box (initially 80% of image size, centered)
            const cropBox = document.createElement('div');
            cropBox.className = 'crop-box';
            cropBox.id = 'crop-box';

            const initialWidth = imgRect.width * 0.8;
            const initialHeight = imgRect.height * 0.8;
            const initialLeft = offsetX + (imgRect.width - initialWidth) / 2;
            const initialTop = offsetY + (imgRect.height - initialHeight) / 2;

            cropBox.style.left = initialLeft + 'px';
            cropBox.style.top = initialTop + 'px';
            cropBox.style.width = initialWidth + 'px';
            cropBox.style.height = initialHeight + 'px';

            // Add resize handles
            const handles = ['nw', 'ne', 'sw', 'se', 'n', 's', 'w', 'e'];
            handles.forEach(pos => {
                const handle = document.createElement('div');
                handle.className = `crop-handle ${pos}`;
                handle.setAttribute('data-position', pos);
                cropBox.appendChild(handle);
            });

            container.appendChild(cropBox);

            // Make crop box draggable and resizable
            this.initCropBox(cropBox, cropImg);
        };
    },

    initCropBox(cropBox, cropImg) {
        const container = document.getElementById('crop-container');
        let isDragging = false;
        let isResizing = false;
        let currentHandle = null;
        let startX, startY, startLeft, startTop, startWidth, startHeight;

        const getImageBounds = () => {
            const imgRect = cropImg.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            return {
                left: imgRect.left - containerRect.left,
                top: imgRect.top - containerRect.top,
                right: imgRect.right - containerRect.left,
                bottom: imgRect.bottom - containerRect.top,
                width: imgRect.width,
                height: imgRect.height
            };
        };

        const constrainToBounds = (box) => {
            const bounds = getImageBounds();
            let { left, top, width, height } = box;

            // Constrain position
            left = Math.max(bounds.left, Math.min(left, bounds.right - width));
            top = Math.max(bounds.top, Math.min(top, bounds.bottom - height));

            // Constrain size
            width = Math.max(20, Math.min(width, bounds.right - left));
            height = Math.max(20, Math.min(height, bounds.bottom - top));

            return { left, top, width, height };
        };

        // Handle mouse down on crop box (for dragging)
        cropBox.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('crop-handle')) {
                isResizing = true;
                currentHandle = e.target.getAttribute('data-position');
            } else {
                isDragging = true;
            }

            startX = e.clientX;
            startY = e.clientY;
            startLeft = parseFloat(cropBox.style.left);
            startTop = parseFloat(cropBox.style.top);
            startWidth = parseFloat(cropBox.style.width);
            startHeight = parseFloat(cropBox.style.height);

            e.preventDefault();
        });

        // Handle mouse move
        document.addEventListener('mousemove', (e) => {
            if (!isDragging && !isResizing) return;

            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            if (isDragging) {
                const newBox = constrainToBounds({
                    left: startLeft + deltaX,
                    top: startTop + deltaY,
                    width: startWidth,
                    height: startHeight
                });

                cropBox.style.left = newBox.left + 'px';
                cropBox.style.top = newBox.top + 'px';
            } else if (isResizing) {
                let newLeft = startLeft;
                let newTop = startTop;
                let newWidth = startWidth;
                let newHeight = startHeight;

                // Handle resize based on which handle is being dragged
                if (currentHandle.includes('n')) {
                    newTop = startTop + deltaY;
                    newHeight = startHeight - deltaY;
                }
                if (currentHandle.includes('s')) {
                    newHeight = startHeight + deltaY;
                }
                if (currentHandle.includes('w')) {
                    newLeft = startLeft + deltaX;
                    newWidth = startWidth - deltaX;
                }
                if (currentHandle.includes('e')) {
                    newWidth = startWidth + deltaX;
                }

                const newBox = constrainToBounds({
                    left: newLeft,
                    top: newTop,
                    width: newWidth,
                    height: newHeight
                });

                cropBox.style.left = newBox.left + 'px';
                cropBox.style.top = newBox.top + 'px';
                cropBox.style.width = newBox.width + 'px';
                cropBox.style.height = newBox.height + 'px';
            }
        });

        // Handle mouse up
        document.addEventListener('mouseup', () => {
            isDragging = false;
            isResizing = false;
            currentHandle = null;
        });
    },

    applyCrop() {
        const cropBox = document.getElementById('crop-box');
        const cropImg = document.querySelector('.crop-image');

        if (!cropBox || !cropImg) {
            ToastManager.show('자르기 영역을 찾을 수 없습니다', 'error');
            this.restoreCropBackup();
            return;
        }

        try {
            const imgRect = cropImg.getBoundingClientRect();
            const cropRect = cropBox.getBoundingClientRect();

            // Calculate crop coordinates relative to the image
            const scaleX = cropImg.naturalWidth / imgRect.width;
            const scaleY = cropImg.naturalHeight / imgRect.height;

            const cropX = (cropRect.left - imgRect.left) * scaleX;
            const cropY = (cropRect.top - imgRect.top) * scaleY;
            const cropWidth = cropRect.width * scaleX;
            const cropHeight = cropRect.height * scaleY;

            // Validate crop dimensions
            if (cropWidth <= 0 || cropHeight <= 0 || cropX < 0 || cropY < 0) {
                throw new Error('잘못된 자르기 영역입니다');
            }

            // Create canvas to crop the image
            const canvas = document.createElement('canvas');
            canvas.width = cropWidth;
            canvas.height = cropHeight;
            const ctx = canvas.getContext('2d');

            // Draw cropped portion
            ctx.drawImage(
                cropImg,
                cropX, cropY, cropWidth, cropHeight,
                0, 0, cropWidth, cropHeight
            );

            // Get cropped image as base64
            const croppedDataUrl = canvas.toDataURL('image/png');

            // Update the selected element with cropped image
            const img = this.selectedElement.querySelector('img');
            img.src = croppedDataUrl;

            // Update element data
            const elementData = this.cardElements.find(item => item.element === this.selectedElement);
            if (elementData) {
                elementData.data.src = croppedDataUrl;
            }

            // Clear backup on success
            this.cropBackup = null;

            // Close crop overlay
            this.cancelCrop();

            ToastManager.show('스티커가 잘렸습니다', 'success');
        } catch (error) {
            console.error('Crop error:', error);
            ToastManager.show('자르기에 실패했습니다. 원본으로 복원합니다.', 'error');
            this.restoreCropBackup();
            this.cancelCrop();
        }
    },

    restoreCropBackup() {
        if (!this.cropBackup) return;

        try {
            const img = this.cropBackup.element.querySelector('img');
            if (img) {
                img.src = this.cropBackup.originalSrc;
            }

            if (this.cropBackup.elementData) {
                this.cropBackup.elementData.data.src = this.cropBackup.originalSrc;
            }

            this.cropBackup = null;
        } catch (error) {
            console.error('Restore backup error:', error);
        }
    },

    cancelCrop() {
        const overlay = document.getElementById('crop-overlay');
        overlay.classList.add('hidden');

        // Clear container
        const container = document.getElementById('crop-container');
        container.innerHTML = '';
    },

    deleteSelectedElement() {
        if (!this.selectedElement) {
            ToastManager.show('삭제할 요소를 선택해주세요', 'warning');
            return;
        }

        // Remove from DOM
        this.selectedElement.remove();

        // Remove from cardElements array
        this.cardElements = this.cardElements.filter(item => item.element !== this.selectedElement);

        // Hide properties panels
        document.getElementById('text-properties-panel').classList.add('hidden');
        document.getElementById('image-properties-panel').classList.add('hidden');

        this.selectedElement = null;

        ToastManager.show('요소가 삭제되었습니다', 'success');
    },

    async saveCard() {
        const authorName = document.getElementById('author-name').value.trim();
        const password = document.getElementById('card-password').value;
        const ornamentType = document.getElementById('ornament-type').value;
        const cardTypeRadio = document.querySelector('input[name="card-type"]:checked');
        const cardType = cardTypeRadio ? cardTypeRadio.value : 'normal';
        const url = document.getElementById('card-url').value.trim();

        // 유효성 검사
        if (!authorName) {
            ToastManager.show('작성자 이름을 입력해주세요', 'warning');
            return;
        }

        if (!password) {
            ToastManager.show('비밀번호를 입력해주세요', 'warning');
            return;
        }

        if (cardType === 'url' && !url) {
            ToastManager.show('URL을 입력해주세요', 'warning');
            return;
        }

        try {
            LoadingManager.show('카드를 저장하는 중...');

            // 기존 카드 위치들 수집 (SVG 좌표)
            const existingPositions = this.cards.map(card => {
                const x = card.positionX || 100;
                const y = card.positionY || 150;
                // 레거시 픽셀 좌표인 경우 SVG 좌표로 변환
                if (x > 200 || y > 300) {
                    return { x: (x / 600) * 200, y: ((y / 800) * 305) - 10 };
                }
                return { x, y };
            });

            // SVG 좌표로 직접 랜덤 위치 생성 (겹침 방지)
            const svgPos = this.getRandomTreePosition(existingPositions);
            const positionX = svgPos.x;  // SVG X 좌표
            const positionY = svgPos.y;  // SVG Y 좌표

            // Collect card element data
            const texts = [];
            const images = [];

            this.cardElements.forEach(elementData => {
                if (elementData.type === 'text') {
                    const element = elementData.element;
                    texts.push({
                        text: Utils.getCleanTextContent(element),
                        fontSize: parseInt(element.style.fontSize) || 16,
                        fontFamily: (element.style.fontFamily || CONFIG.FONTS[0]).replace(/['"]/g, ''),
                        color: element.style.color || '#000000',
                        textAlign: element.style.textAlign || 'left',
                        animation: 'none',  // 애니메이션 고정
                        x: parseFloat(element.getAttribute('data-x')) || 0,
                        y: parseFloat(element.getAttribute('data-y')) || 0,
                        width: parseFloat(element.style.width) || element.offsetWidth || 200,
                        height: parseFloat(element.style.height) || element.offsetHeight || 80
                    });
                } else if (elementData.type === 'image') {
                    const element = elementData.element;
                    const img = element.querySelector('img');
                    images.push({
                        src: img.src,
                        width: parseInt(element.style.width) || 200,
                        height: parseInt(element.style.height) || 200,
                        rotation: parseInt(element.getAttribute('data-rotation')) || 0,
                        fitMode: img.style.objectFit || 'contain',
                        x: parseFloat(element.getAttribute('data-x')) || 0,
                        y: parseFloat(element.getAttribute('data-y')) || 0
                    });
                }
            });

            const cardData = {
                authorName: authorName,
                password: password,
                ornamentType: ornamentType,
                positionX: positionX,  // SVG X 좌표로 저장
                positionY: positionY,  // SVG Y 좌표로 저장
                cardType: cardType,
                url: cardType === 'url' ? url : null,
                cardData: {
                    texts: texts,
                    images: images,
                    background: {
                        color: '#ffffff',
                        animation: 'none'
                    },
                    audio: null
                }
            };

            const cardId = await this.sheetsHandler.saveCard(cardData);

            ToastManager.show('카드가 저장되었습니다! 🎉', 'success');

            // 트리 페이지에서만 카드 목록 새로고침
            if (document.getElementById('tree-container')) {
                await this.loadCards();
            }

            // 편집기 닫기/이동
            this.closeCardEditor();

        } catch (error) {
            console.error('Error saving card:', error);
            ToastManager.show('카드 저장에 실패했습니다', 'error');
        } finally {
            LoadingManager.hide();
        }
    },

    async autoArrangeOrnaments() {
        if (!this.cards || this.cards.length === 0) {
            ToastManager.show('배치할 카드가 없습니다', 'info');
            return;
        }

        try {
            LoadingManager.show('오브제를 배치하는 중...');

            // 겹침 방지를 위해 순차적으로 위치 지정
            const existingPositions = [];

            // 트리 영역 내에서 겹치지 않는 랜덤 위치 생성
            for (const card of this.cards) {
                // SVG 좌표로 직접 랜덤 위치 생성
                const svgPos = this.getRandomTreePosition(existingPositions);

                // 서버에 SVG 좌표 저장
                await this.sheetsHandler.updateCardPosition(card.id, svgPos.x, svgPos.y);
                card.positionX = svgPos.x;
                card.positionY = svgPos.y;

                // 새 위치를 기존 위치 목록에 추가 (SVG 좌표)
                existingPositions.push({ x: svgPos.x, y: svgPos.y });
            }

            // 오브제 다시 렌더링
            this.renderOrnaments();

            ToastManager.show('오브제가 재배치되었습니다', 'success');
        } catch (error) {
            console.error('Error arranging ornaments:', error);
            ToastManager.show('오브제 배치에 실패했습니다', 'error');
        } finally {
            LoadingManager.hide();
        }
    },

    async openMyCards() {
        const modal = document.getElementById('my-cards-modal');
        if (!modal) return;

        try {
            LoadingManager.show('카드를 불러오는 중...');
            await this.loadCards();
            modal.classList.add('active');
            this.renderMyCardsList(this.cards);
        } catch (error) {
            console.error('Error opening my cards:', error);
            ToastManager.show('카드를 불러오는 중 오류가 발생했습니다', 'error');
        } finally {
            LoadingManager.hide();
        }
    },

    closeMyCards() {
        const modal = document.getElementById('my-cards-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    },

    async searchMyCards() {
        const searchName = document.getElementById('search-author-name').value.trim();
        if (!searchName) {
            ToastManager.show('검색할 이름을 입력해주세요', 'warning');
            return;
        }

        try {
            // ensure latest data
            await this.loadCards();
            const lower = searchName.toLowerCase();
            const filtered = this.cards.filter(card => (card.authorName || '').toLowerCase().includes(lower));
            this.renderMyCardsList(filtered);
            ToastManager.show(`${filtered.length}개의 카드를 찾았습니다`, 'info');
        } catch (error) {
            console.error('Error searching cards:', error);
            ToastManager.show('카드 검색 중 오류가 발생했습니다', 'error');
        }
    },

    renderMyCardsList(cards) {
        const container = document.getElementById('my-cards-list');
        if (!container) return;

        if (!cards || cards.length === 0) {
            container.innerHTML = '<p style="color: #ccc; text-align: center;">카드를 찾지 못했습니다</p>';
            return;
        }

        let html = '';
        cards.forEach(card => {
            const ornamentIcon = CONFIG.ORNAMENT_TYPES[card.ornamentType] || '🎁';
            const dateText = card.updatedAt ? Utils.formatDate(card.updatedAt) : (card.createdAt ? Utils.formatDate(card.createdAt) : '');
            html += `
                <div class="my-card-item" data-card-id="${card.id}"
                    style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08); margin-bottom: 0.75rem; display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-weight: 700; color: var(--christmas-gold); margin-bottom: 0.25rem;">
                            ${ornamentIcon} ${card.authorName || '이름 없음'}
                        </div>
                        <div style="font-size: 0.9rem; color: #ccc;">
                            ${card.cardType === 'url' ? 'URL 카드' : '일반 카드'} · ${dateText || '날짜 없음'}
                        </div>
                    </div>
                    <button class="btn btn-secondary view-card-btn" data-card-id="${card.id}" style="min-width: 90px;">
                        <i class="fas fa-eye"></i> 보기
                    </button>
                </div>
            `;
        });

        container.innerHTML = html;

        container.querySelectorAll('.view-card-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-card-id');
                const card = this.cards.find(c => c.id === id);
                if (card) {
                    this.currentCard = card;
                    this.closeMyCards();
                    this.openCardDetail(id);
                } else {
                    ToastManager.show('카드를 찾을 수 없습니다', 'error');
                }
            });
        });
    },

    closeCardDetail() {
        document.getElementById('card-detail-modal').classList.remove('active');
    },

    async deleteCard() {
        if (!this.currentCard) {
            ToastManager.show('선택된 카드가 없습니다', 'error');
            return;
        }

        const confirmDelete = window.confirm('이 카드를 삭제하시겠습니까?');
        if (!confirmDelete) return;

        const password = window.prompt('카드 비밀번호를 입력해주세요');
        if (password === null || password.trim() === '') {
            ToastManager.show('비밀번호가 입력되지 않았습니다', 'warning');
            return;
        }

        LoadingManager.show('카드를 삭제하는 중...');
        try {
            const isValid = await this.sheetsHandler.verifyPassword(this.currentCard.id, password.trim());
            if (!isValid) {
                ToastManager.show('비밀번호가 일치하지 않습니다', 'error');
                return;
            }

            await this.sheetsHandler.deleteCard(this.currentCard.id);
            this.cards = this.cards.filter(card => card.id !== this.currentCard.id);
            this.currentCard = null;
            this.renderOrnaments();
            this.renderCardList();
            this.closeCardDetail();
            ToastManager.show('카드가 삭제되었습니다', 'success');
        } catch (error) {
            console.error('Error deleting card:', error);
            ToastManager.show('카드 삭제 중 오류가 발생했습니다', 'error');
        } finally {
            LoadingManager.hide();
        }
    },

    async shareCard() {
        if (!this.currentCardId) {
            ToastManager.show('공유할 카드를 찾을 수 없습니다', 'error');
            return;
        }

        const card = this.cards.find(c => c.id === this.currentCardId);
        if (!card) {
            ToastManager.show('카드 정보를 찾을 수 없습니다', 'error');
            return;
        }

        // 공유할 URL 생성 (현재 페이지 URL + 카드 ID 파라미터)
        const shareUrl = `${window.location.origin}${window.location.pathname}?card=${this.currentCardId}`;
        const shareTitle = `${card.authorName}님의 크리스마스 카드`;
        const shareText = '크리스마스 트리에 달린 특별한 카드를 확인해보세요!';

        // Web Share API 지원 여부 확인
        if (navigator.share) {
            try {
                await navigator.share({
                    title: shareTitle,
                    text: shareText,
                    url: shareUrl
                });
                ToastManager.show('카드가 공유되었습니다!', 'success');
            } catch (error) {
                // 사용자가 공유 취소한 경우
                if (error.name !== 'AbortError') {
                    this.copyToClipboard(shareUrl);
                }
            }
        } else {
            // Web Share API 미지원 시 클립보드 복사
            this.copyToClipboard(shareUrl);
        }
    },

    copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text)
                .then(() => {
                    ToastManager.show('링크가 클립보드에 복사되었습니다!', 'success');
                })
                .catch(() => {
                    this.fallbackCopyToClipboard(text);
                });
        } else {
            this.fallbackCopyToClipboard(text);
        }
    },

    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            ToastManager.show('링크가 클립보드에 복사되었습니다!', 'success');
        } catch (err) {
            ToastManager.show('링크 복사에 실패했습니다', 'error');
        }
        document.body.removeChild(textArea);
    },

    findOrnamentLocation(cardId) {
        // 카드 ID 결정 (파라미터로 받거나 현재 열린 카드 사용)
        const targetCardId = cardId || this.currentCardId;

        if (!targetCardId) {
            ToastManager.show('카드를 찾을 수 없습니다', 'error');
            return;
        }

        // 카드가 전체 카드 목록에서 몇 번째인지 찾기
        const cardIndex = this.cards.findIndex(c => c.id === targetCardId);
        if (cardIndex === -1) {
            ToastManager.show('카드를 찾을 수 없습니다', 'error');
            return;
        }

        // 해당 카드가 트리 페이지의 몇 페이지에 있는지 계산
        const targetPage = Math.floor(cardIndex / this.itemsPerPage) + 1;

        // 현재 페이지와 다르면 페이지 이동
        if (this.currentTreePage !== targetPage) {
            this.currentTreePage = targetPage;
            this.renderOrnaments();
        }

        // Close the card detail modal if open
        this.closeCardDetail();

        // Close mobile card list overlay if open
        const mobileOverlay = document.getElementById('mobile-card-overlay');
        if (mobileOverlay && mobileOverlay.classList.contains('active')) {
            mobileOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }

        // Scroll to the tree
        const treeContainer = document.getElementById('tree-container');
        if (treeContainer) {
            treeContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        // Wait for scroll and render to complete, then highlight
        setTimeout(() => {
            // SVG 오너먼트 찾기
            const ornament = document.querySelector(`[data-card-id="${targetCardId}"]`);
            if (!ornament) {
                ToastManager.show('오너먼트를 찾을 수 없습니다', 'error');
                return;
            }

            // Add highlight animation class
            ornament.classList.add('ornament-highlight');

            // Remove the class after animation completes (1.5s)
            setTimeout(() => {
                ornament.classList.remove('ornament-highlight');
            }, 1500);
        }, 600);
    }
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}
