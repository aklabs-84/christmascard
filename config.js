// ========================================
// Configuration File
// ========================================
// 실제 API 키를 여기에 입력하세요
// 이 파일은 .gitignore에 포함되어 Git에 업로드되지 않습니다

const CONFIG = {
    GOOGLE_SHEETS: {
        SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbw19zq99K0KUFFQUTE65LzVlgtTiqEG0w41T4sN5mUu3d3ITSAIZN7EfC1nb2ZL3Gd7GQ/exec'
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
    },
    DEFAULT_STICKERS: [
        { id: 'default_1', name: '루돌프', path: 'image/Christmas1.png' },
        { id: 'default_2', name: '산타', path: 'image/Christmas2.png' },
        { id: 'default_3', name: '핫초코', path: 'image/Christmas3.png' },
        { id: 'default_4', name: '겨우살이', path: 'image/Christmas4.png' }
    ],
    CUSTOM_STICKER: {
        MAX_SIZE: 2 * 1024 * 1024, // 2MB
        MAX_WIDTH: 1200,
        MAX_HEIGHT: 1200,
        QUALITY: 0.7,
        OUTPUT_TYPE: 'image/webp'
    }
};
