# 빠른 문제 해결 가이드

## 🚨 카드 수정/저장이 안 되는 문제

### 현재 발생하는 에러들
1. ❌ CORS 에러: `Access to fetch ... has been blocked by CORS policy`
2. ❌ 저장 실패: `Error updating card: TypeError: Failed to fetch`
3. ❌ 연결 종료: `The message port closed before a response was received`

### 즉시 해결 방법 (5분)

**이 에러들은 모두 Google Apps Script 배포 설정 문제입니다!**

#### 단계별 해결:

1. **Google Sheets 열기**
   - 기존에 사용하던 Sheets 열기

2. **Apps Script 에디터로 이동**
   - 확장 프로그램 > Apps Script

3. **코드 업데이트**
   - 기존 코드 전체 삭제
   - `google-apps-script.js` 파일 내용 전체 복사
   - 붙여넣기
   - **Ctrl+S 또는 Cmd+S로 저장** ⬅️ 반드시!

4. **새 배포 만들기** (가장 중요!)
   ```
   배포 버튼 클릭
   ↓
   "새 배포" 선택 (기존 배포 편집 아님!)
   ↓
   유형: ⚙️ 클릭 → "웹 앱" 선택
   ↓
   액세스 권한: "모든 사용자(익명 사용자 포함)" ✓
   ↓
   배포 클릭
   ```

5. **새 URL 복사**
   - 배포 완료 후 나오는 웹 앱 URL 전체 복사

6. **config.js 업데이트**
   ```javascript
   const CONFIG = {
       GOOGLE_SHEETS: {
           SCRIPT_URL: '여기에_새로운_URL_붙여넣기'
       },
       // ...
   };
   ```

7. **브라우저 새로고침**
   - 캐시 삭제: Ctrl+Shift+Delete
   - 페이지 새로고침: F5

---

## ✅ 올바른 배포 설정

### 반드시 확인할 것:
- ✅ 유형: **웹 앱**
- ✅ 실행 권한: **나**
- ✅ 액세스 권한: **모든 사용자(익명 사용자 포함)** ⬅️ 매우 중요!

### ❌ 잘못된 설정:
- ❌ 액세스 권한: "나만" 또는 "조직 내 사용자"
- ❌ 유형: "부가기능" 또는 다른 것
- ❌ 기존 배포 편집 (새 배포를 만들어야 함)

---

## 🔍 문제가 계속되면?

### 1. Apps Script 로그 확인
```
Apps Script 에디터
→ 실행 메뉴
→ 실행 로그
→ 로그에 "doGet called" 또는 "doPost called" 보이는지 확인
```

### 2. 브라우저 콘솔 확인
```
F12 (개발자 도구)
→ Console 탭
→ CORS 에러가 여전히 있는지 확인
```

### 3. URL 다시 확인
- config.js의 URL이 **최신 배포**에서 복사한 URL인지 확인
- URL이 `https://script.google.com/macros/s/`로 시작하는지 확인
- URL 끝에 `/exec`이 있는지 확인

---

## 💡 왜 이런 일이 발생했나?

### 근본 원인:
Google Apps Script는 CORS(Cross-Origin Resource Sharing)를 자동으로 처리하지만,
**"모든 사용자" 액세스 권한으로 배포해야만** 브라우저에서 접근할 수 있습니다.

### 수정 사항:
- `doOptions` 함수 중복 제거
- 디버깅 로그 추가
- 에러 메시지 개선
- localStorage 접근 안전성 강화
- BGM 로딩 에러 처리 추가

---

## 📞 여전히 해결이 안 된다면?

### 체크리스트:
- [ ] Apps Script에 코드를 붙여넣고 **저장**했나요? (Ctrl+S)
- [ ] **"새 배포"**를 만들었나요? (기존 배포 편집 아님)
- [ ] 배포 유형이 **"웹 앱"**인가요?
- [ ] 액세스 권한이 **"모든 사용자"**인가요?
- [ ] config.js에 **새 URL**을 붙여넣었나요?
- [ ] **브라우저 캐시**를 삭제했나요?
- [ ] 페이지를 **새로고침**했나요?

모든 체크리스트를 완료했는데도 안 되면, 브라우저 콘솔의 에러 메시지를 캡처해주세요.

---

**자세한 내용은 [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)를 참고하세요.**
