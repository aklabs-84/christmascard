# Google Apps Script 배포 가이드

## 🚨 중요: 수정된 스크립트를 재배포해야 합니다!

CORS 에러와 doOptions 중복을 해결하기 위해 `google-apps-script.js` 파일이 수정되었습니다.
아래 단계를 **정확히** 따라 Google Apps Script를 재배포해주세요.

**수정 내역:**
- ✅ doOptions 함수 중복 제거
- ✅ 디버깅 로그 추가
- ✅ 에러 메시지 개선

---

## 배포 단계 (매우 중요!)

### 1. Google Sheets 열기
- 기존에 사용하던 Google Sheets를 열어주세요.
- 또는 새로운 Google Sheets를 생성하세요.

### 2. Apps Script 에디터 열기
- 상단 메뉴: **확장 프로그램** > **Apps Script** 클릭

### 3. 스크립트 코드 업데이트
- Apps Script 에디터에서 기존 코드를 모두 삭제
- `google-apps-script.js` 파일의 **전체 내용**을 복사하여 붙여넣기
- **Ctrl+S (또는 Cmd+S)** 로 저장

### 4. 새 배포 만들기 (중요!)

**⚠️ 주의: 기존 배포를 업데이트하지 말고, 새 배포를 만드세요!**

1. 우측 상단의 **배포** 버튼 클릭
2. **새 배포** 선택 (기존 배포 관리 아님!)
3. 설정 (매우 중요):
   - **유형 선택**: ⚙️ (톱니바퀴) 아이콘 클릭 → **웹 앱** 선택
   - **설명**: "CORS fix v2" 또는 현재 날짜 입력
   - **실행 권한**: **나** 선택
   - **액세스 권한**: **모든 사용자(익명 사용자 포함)** 선택 ⬅️ **매우 중요!**
   - **실행 대상**: **나** 선택
4. **배포** 버튼 클릭

**스크린샷 가이드:**
```
┌─────────────────────────────────────┐
│ 새 배포                              │
├─────────────────────────────────────┤
│ 유형 선택: ⚙️ → 웹 앱                │
│ 설명: CORS fix v2                   │
│                                     │
│ 웹 앱                                │
│ ├ 실행 권한: 나                      │
│ └ 액세스 권한: 모든 사용자 ✓         │
│                                     │
│         [취소]  [배포]               │
└─────────────────────────────────────┘
```

### 5. 권한 승인
- "승인이 필요합니다" 메시지가 뜜 경우:
  1. **권한 검토** 클릭
  2. Google 계정 선택
  3. **고급** 클릭
  4. **[프로젝트명](안전하지 않음)으로 이동** 클릭
  5. **허용** 클릭

### 6. 배포 URL 복사
- 배포가 완료되면 **웹 앱 URL**이 표시됩니다
- 이 URL을 복사하세요 (예: `https://script.google.com/macros/s/...`)

### 7. config.js 업데이트
- `config.js` 파일을 열고
- `GOOGLE_SHEETS.SCRIPT_URL`에 새로운 URL을 붙여넣기:

```javascript
const CONFIG = {
    GOOGLE_SHEETS: {
        SCRIPT_URL: '여기에_새로운_배포_URL_붙여넣기'
    },
    // ... 나머지 설정
};
```

### 8. 시트 이름 확인
- Google Sheets에서 시트 이름이 **"Cards"** 인지 확인
- 다른 이름이면 **"Cards"** 로 변경하거나
- `google-apps-script.js`의 `SHEET_NAME` 변수를 수정

### 9. Apps Script 로그 확인 (선택사항, 디버깅용)
배포 후 문제가 있으면 로그를 확인하세요:
1. Apps Script 에디터에서 **실행** 메뉴 → **실행 로그** 클릭
2. 또는 좌측 메뉴에서 **실행** 아이콘 클릭
3. 웹 앱에서 요청을 보낸 후 로그 확인
4. `doGet called`, `doPost called` 등의 메시지 확인

---

## 테스트

### 배포 확인 방법
1. 브라우저를 새로고침 (또는 캐시 삭제 후 새로고침)
2. 개발자 도구 (F12) → Console 탭 확인
3. CORS 에러가 사라지고 데이터가 로드되는지 확인

### 예상 결과
- ✅ "Google Apps Script handler initialized" 메시지
- ✅ "Loaded cards: ..." 메시지
- ✅ CORS 에러 없음

---

## 문제 해결

### ⚠️ CORS 에러가 계속 발생하는 경우

**증상:**
```
Access to fetch at 'https://script.google.com/macros/s/...'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header
```

**원인과 해결방법:**

1. **배포 설정 문제 (가장 흔한 원인)**
   - ❌ 잘못된 설정: "액세스 권한: 나만"
   - ✅ 올바른 설정: "액세스 권한: 모든 사용자(익명 사용자 포함)"
   - **해결**: 새 배포를 만들고 액세스 권한을 정확히 설정

2. **배포 유형 문제**
   - ❌ "부가기능" 또는 다른 유형으로 배포
   - ✅ 반드시 "웹 앱"으로 배포
   - **해결**: 배포 관리에서 유형 확인 후 재배포

3. **잘못된 URL 사용**
   - 이전 배포 URL을 사용하고 있는지 확인
   - 최신 배포 URL을 config.js에 정확히 붙여넣었는지 확인
   - **해결**: 새 배포 후 URL을 다시 복사하여 config.js 업데이트

4. **브라우저 캐시 문제**
   - **해결**: Ctrl+Shift+Delete → 캐시 및 쿠키 삭제 → 페이지 새로고침

5. **스크립트 저장 안 됨**
   - Apps Script에 코드를 붙여넣은 후 저장하지 않았을 수 있음
   - **해결**: Ctrl+S로 저장 후 재배포

**체크리스트:**
- [ ] Apps Script에서 코드 저장 (Ctrl+S)
- [ ] "새 배포" 선택 (기존 배포 편집 아님)
- [ ] 유형: "웹 앱" 선택
- [ ] 액세스 권한: "모든 사용자" 선택
- [ ] 배포 완료 후 새 URL 복사
- [ ] config.js에 새 URL 붙여넣기
- [ ] 브라우저 캐시 삭제
- [ ] 페이지 새로고침

### "Card not found" 에러
1. Google Sheets의 시트 이름이 "Cards"인지 확인
2. 첫 번째 행에 헤더가 자동으로 추가되는지 확인
3. 스크립트가 올바르게 저장되었는지 확인

### "Error updating card" 또는 "Error saving card" 에러

**증상:**
- 카드 수정 버튼을 눌렀는데 저장이 안 됨
- 콘솔에 "Failed to fetch" 또는 "TypeError" 에러

**원인과 해결방법:**
1. **CORS 에러가 근본 원인**
   - 위의 CORS 에러 해결 방법을 먼저 시도하세요

2. **네트워크 연결 문제**
   - 인터넷 연결 확인
   - Google Apps Script 서비스 상태 확인

3. **JSON 파싱 에러**
   - Apps Script 로그를 확인하여 어떤 데이터가 전송되는지 확인
   - 특수 문자가 포함된 텍스트를 입력했는지 확인

### "The message port closed before a response was received" 에러

**원인:**
- 요청이 완료되기 전에 연결이 끊김
- 보통 CORS 에러와 함께 발생

**해결:**
- CORS 에러를 먼저 해결하면 자동으로 해결됩니다

### localStorage 에러
- 이 에러는 이제 자동으로 처리됩니다
- 브라우저 설정에서 쿠키/저장소 차단이 해제되어 있는지 확인
- 시크릿 모드에서는 localStorage가 제한될 수 있습니다

---

## 추가 정보

### 배포 관리
- 기존 배포를 수정하려면: **배포** > **배포 관리** 에서 편집
- 여러 버전을 관리할 수 있습니다

### 보안
- 비밀번호는 SHA-256으로 해시되어 저장됩니다
- Google Sheets에 평문 비밀번호는 저장되지 않습니다

### 데이터 구조
Google Sheets의 "Cards" 시트는 다음 컬럼을 가집니다:
- ID, AuthorName, PasswordHash, OrnamentType
- PositionX, PositionY, CardType, URL
- CardDataJSON, CreatedAt, UpdatedAt

---

배포 후 문제가 발생하면 브라우저 콘솔의 에러 메시지를 확인하세요!
