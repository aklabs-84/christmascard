// ========================================
// Configuration Example File
// ========================================
// 이 파일을 복사하여 config.js 파일을 만들고
// 실제 API 키와 시트 ID를 입력하세요.

const CONFIG = {
    GOOGLE_SHEETS: {
        SCRIPT_URL: 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE'
        // 예: 'https://script.google.com/macros/s/AKfycby.../exec'
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
    ORNAMENT_TYPES: {
        'star': '⭐',
        'snowman': '⛄',
        'gift': '🎁',
        'bauble': '🔴',
        'candy-cane': '🍭',
        'bell': '🔔',
        'snowflake': '❄️'
    },
    FONTS: [
        'Nanum Pen Script',
        'Cute Font',
        'Gamja Flower',
        'Sunflower',
        'Jua'
    ],
    ANIMATIONS: {
        TEXT: ['fade-in', 'typing', 'sparkle', 'slide-in-left', 'slide-in-right', 'bounce'],
        CARD: ['snow', 'stars', 'snowflakes', 'lights', 'spinning-snow', 'none']
    }
};
