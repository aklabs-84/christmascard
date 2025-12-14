# 🎄 Christmas Tree Card

크리스마스 트리를 중심으로 여러 사람이 카드를 만들고 공유할 수 있는 인터랙티브 웹 애플리케이션

## 📋 프로젝트 소개

이 프로젝트는 크리스마스 시즌에 친구, 가족, 동료들과 함께 디지털 카드를 만들고 공유할 수 있는 웹 애플리케이션입니다. 크리스마스 트리에 오브제(장식)처럼 카드를 달고, 각 카드를 클릭하여 메시지를 확인할 수 있습니다.

## ✨ 주요 기능

- 🎨 **카드 제작**: 텍스트, 이미지, 애니메이션을 포함한 개성있는 카드 제작
- 🎄 **트리 장식**: 만든 카드를 크리스마스 트리에 오브제로 장식
- 🔄 **실시간 공유**: Google Sheets를 활용한 실시간 카드 공유
- 🎵 **멀티미디어**: 배경 음악과 효과음 추가 가능
- 📱 **반응형**: 모바일, 태블릿, 데스크톱 모두 지원
- 🔒 **보안**: 비밀번호로 카드 수정/삭제 보호

## 🚀 시작하기

### 1. 파일 다운로드

이 저장소를 클론하거나 다운로드합니다:

```bash
git clone https://github.com/yourusername/christmas-tree-card.git
cd christmas-tree-card
```

### 2. Google Sheets API 설정

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 새 프로젝트 생성
3. Google Sheets API 활성화
4. API 키 생성 (제한 사항: HTTP 리퍼러 추가 권장)
5. Google 스프레드시트 생성 및 공개 설정 (편집 가능)

### 3. 설정 파일 생성

`config.example.js` 파일을 복사하여 `config.js` 파일을 생성합니다:

```bash
cp config.example.js config.js
```

`config.js` 파일을 열고 실제 API 키와 시트 ID를 입력합니다:

```javascript
const CONFIG = {
    GOOGLE_SHEETS: {
        API_KEY: 'your-actual-api-key-here',
        SHEET_ID: 'your-sheet-id-here',
        RANGE: 'Cards!A:K'
    },
    // ... 나머지 설정
};
```

### 4. 실행

로컬 서버로 실행하거나 직접 브라우저에서 `index.html` 파일을 엽니다:

```bash
# Python 3
python -m http.server 8000

# Node.js (http-server 필요)
npx http-server
```

브라우저에서 `http://localhost:8000` 접속

## 📁 파일 구조

```
christmas-tree-card/
├── index.html          # 메인 HTML 파일
├── styles.css          # 스타일시트
├── app.js             # 메인 JavaScript 로직
├── config.js          # API 키 설정 (Git에 업로드 안 됨)
├── config.example.js  # 설정 파일 예시
├── .gitignore         # Git 무시 파일 목록
├── README.md          # 프로젝트 문서
├── PRD.md            # 제품 요구사항 문서
├── TRD.md            # 기술 요구사항 문서
└── TaskList.md       # 작업 목록
```

## 🔑 환경 변수 및 보안

**중요**: `config.js` 파일은 `.gitignore`에 포함되어 있어 Git에 업로드되지 않습니다.

- `config.example.js`: 설정 파일 예시 (Git에 포함)
- `config.js`: 실제 API 키가 포함된 파일 (Git에서 제외)

프로젝트를 배포할 때는:
1. `config.js` 파일을 서버에서 직접 생성
2. 환경 변수를 사용하여 API 키 관리
3. 또는 서버 사이드에서 API 키 관리

## 🛠️ 기술 스택

- **HTML5**: 구조
- **CSS3**: 스타일링 및 애니메이션
- **Vanilla JavaScript (ES6+)**: 로직
- **Google Sheets API**: 데이터 저장
- **외부 라이브러리**:
  - Interact.js: 드래그 앤 드롭
  - Browser Image Compression: 이미지 최적화
  - CryptoJS: 비밀번호 해싱
  - Font Awesome: 아이콘

## 📝 Google Sheets 스키마

스프레드시트의 첫 번째 시트 이름을 "Cards"로 설정하고, 다음 열을 추가합니다:

| A | B | C | D | E | F | G | H | I | J | K |
|---|---|---|---|---|---|---|---|---|---|---|
| ID | AuthorName | PasswordHash | OrnamentType | PositionX | PositionY | CardType | URL | CardDataJSON | CreatedAt | UpdatedAt |

## 🎨 커스터마이징

### 오브제 종류 추가

`config.js`의 `ORNAMENT_TYPES`에 새로운 이모지 추가:

```javascript
ORNAMENT_TYPES: {
    'star': '⭐',
    'custom': '🎅', // 새로운 오브제
    // ...
}
```

### 폰트 추가

`config.js`의 `FONTS` 배열에 추가하고, HTML에 Google Fonts 링크 추가

### 애니메이션 추가

`config.js`의 `ANIMATIONS` 객체에 추가하고, `styles.css`에 키프레임 정의

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

## 📧 문의

프로젝트 관련 문의사항이 있으시면 이슈를 등록해주세요.

## 🎉 감사의 말

이 프로젝트를 사용해주셔서 감사합니다! 즐거운 크리스마스 되세요! 🎄✨
