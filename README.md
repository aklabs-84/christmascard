# 🎄 Christmas Tree Card

크리스마스 트리를 중심으로 여러 사람이 카드를 만들고 공유할 수 있는 인터랙티브 웹 애플리케이션

## 📋 프로젝트 소개

크리스마스 시즌에 친구, 가족, 동료들과 함께 디지털 카드를 만들고 공유할 수 있는 웹 애플리케이션입니다. 크리스마스 트리에 오브제(장식)처럼 카드를 달고, 각 카드를 클릭하여 메시지를 확인할 수 있습니다.  
데이터 저장은 **Google Sheets에 연결된 Apps Script 웹앱**을 통해 이뤄지며, 별도의 Google Sheets API 키는 사용하지 않습니다.

## ✨ 주요 기능

- 🎨 **카드 제작**: 텍스트, 이미지, 애니메이션을 포함한 개성있는 카드 제작
- 🎄 **트리 장식**: 만든 카드를 크리스마스 트리에 오브제로 장식
- 🔄 **실시간 공유**: Apps Script 웹앱으로 Google Sheets에 저장/조회
- 🎵 **멀티미디어**: 배경 음악과 효과음 추가 가능
- 📱 **반응형**: 모바일, 태블릿, 데스크톱 모두 지원
- 🔒 **보안**: 비밀번호로 카드 수정/삭제 보호

## 🚀 시작하기

### 1. 파일 다운로드

저장소를 클론하거나 다운로드합니다:

```bash
git clone https://github.com/yourusername/christmas-tree-card.git
cd christmas-tree-card
```

### 2. Google Apps Script 배포 (중요)

1. Google Sheets를 만들고 시트 이름을 **"Cards"** 로 설정
2. 시트에서 **확장 프로그램 → Apps Script** 열기
3. `google-apps-script.js` 파일 내용을 모두 복사하여 붙여넣고 저장 (Ctrl/Cmd+S)
4. **배포 → 새 배포 → 유형: 웹 앱** 선택
   - 실행 권한: **나**
   - 액세스 권한: **모든 사용자(익명 사용자 포함)**
5. 배포 후 표시되는 **웹 앱 URL**을 복사 (예: `https://script.google.com/macros/s/.../exec`)

### 3. 설정 파일 생성

`config.example.js` 파일을 복사하여 `config.js` 파일을 생성합니다:

```bash
cp config.example.js config.js
```

`config.js` 파일을 열고 Apps Script 웹앱 URL을 넣습니다. 필요 시 기본 설정(스티커, 폰트 등)도 수정할 수 있습니다.

```javascript
const CONFIG = {
    GOOGLE_SHEETS: {
        SCRIPT_URL: '여기에_웹앱_URL_붙여넣기'
    }
    // ... 나머지 설정은 옵션
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
Christmas_Tree/
├── index.html               # 메인 HTML
├── styles.css               # 스타일시트
├── app.js                   # 클라이언트 로직
├── config.example.js        # 설정 예시 (복사 후 SCRIPT_URL 입력)
├── config.js                # 실사용 설정 (Git에 올리지 않음)
├── google-apps-script.js    # Google Apps Script 코드
├── DEPLOYMENT_GUIDE.md      # Apps Script 배포 가이드
├── TROUBLESHOOTING.md       # 문제 해결 가이드
├── image/                   # 기본 스티커 이미지
└── christmas-background-magic-443349.mp3  # 배경 음악
```

## 🔑 환경 변수 및 보안

`config.js`는 `.gitignore`에 포함되어 있어 Git에 업로드되지 않습니다.  
비밀번호는 클라이언트에서 SHA-256으로 해시되어 시트에 저장됩니다. 시트 공유 범위를 제한하고, 필요 시 Apps Script에서 추가 검증 로직을 넣어주세요.

## 🛠️ 기술 스택

- **HTML5**: 구조
- **CSS3**: 스타일링 및 애니메이션
- **Vanilla JavaScript (ES6+)**: 로직
- **Google Apps Script + Google Sheets**: 데이터 저장/조회
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

- **오브제 추가**: `config.js`의 `ORNAMENT_TYPES`에 이모지 추가
- **폰트 추가**: `config.js`의 `FONTS` 배열에 추가 후 HTML에 폰트 링크 삽입
- **애니메이션 추가**: `config.js`의 `ANIMATIONS`에 추가하고 `styles.css`에 키프레임 정의

## 🆘 문제 해결

배포/CORS 관련 오류는 `DEPLOYMENT_GUIDE.md`, `TROUBLESHOOTING.md`를 참고하세요.  
특히 Apps Script는 **새 배포**를 만들고, 액세스 권한을 **모든 사용자(익명 포함)** 으로 설정해야 정상 동작합니다.

## 🎉 감사의 말

즐거운 크리스마스 되세요! 🎄✨
