// ========================================
// Google Apps Script for Christmas Tree Card
// ========================================
// 이 코드를 Google Sheets의 Apps Script 에디터에 붙여넣으세요
//
// 사용 방법:
// 1. Google Sheets 열기
// 2. 확장 프로그램 > Apps Script 클릭
// 3. 이 코드를 붙여넣기
// 4. 배포 > 새 배포 > 유형: 웹 앱
// 5. 실행 권한: 나
// 6. 액세스 권한: 모든 사용자
// 7. 배포 URL을 복사하여 config.js의 SCRIPT_URL에 입력

// 스프레드시트의 시트 이름
const SHEET_NAME = 'Cards';

// GET 요청 핸들러 (카드 목록 조회)
function doGet(e) {
  // 디버깅 로그
  Logger.log('doGet called with action: ' + (e.parameter ? e.parameter.action : 'undefined'));

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

  if (!sheet) {
    return createResponse({
      success: false,
      error: 'Sheet not found. Please create a sheet named "Cards"'
    });
  }

  const action = e.parameter.action;

  try {
    switch(action) {
      case 'getCards':
        return getCards(sheet);
      case 'getCard':
        return getCard(sheet, e.parameter.id);
      default:
        return createResponse({
          success: false,
          error: 'Invalid action'
        });
    }
  } catch (error) {
    return createResponse({
      success: false,
      error: error.toString()
    });
  }
}

// POST 요청 핸들러 (카드 추가, 수정, 삭제)
function doPost(e) {
  // 디버깅 로그
  Logger.log('doPost called');
  Logger.log('postData: ' + (e.postData ? e.postData.contents : 'undefined'));

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

  if (!sheet) {
    return createResponse({
      success: false,
      error: 'Sheet not found. Please create a sheet named "Cards"'
    });
  }

  let data;
  try {
    data = JSON.parse(e.postData.contents);
    Logger.log('Parsed action: ' + data.action);
  } catch (error) {
    Logger.log('JSON parse error: ' + error.toString());
    return createResponse({
      success: false,
      error: 'Invalid JSON data: ' + error.toString()
    });
  }

  const action = data.action;

  try {
    switch(action) {
      case 'addCard':
        return addCard(sheet, data.card);
      case 'updateCard':
        return updateCard(sheet, data.id, data.card);
      case 'deleteCard':
        return deleteCard(sheet, data.id);
      case 'updatePosition':
        return updatePosition(sheet, data.id, data.positionX, data.positionY);
      case 'verifyPassword':
        return verifyPassword(sheet, data.id, data.passwordHash);
      default:
        return createResponse({
          success: false,
          error: 'Invalid action'
        });
    }
  } catch (error) {
    return createResponse({
      success: false,
      error: error.toString()
    });
  }
}

// OPTIONS 요청 핸들러 (CORS preflight 대응)
function doOptions(e) {
  return createResponse({
    success: true,
    message: 'CORS preflight ok'
  });
}

// 모든 카드 조회
function getCards(sheet) {
  const data = sheet.getDataRange().getValues();

  // 첫 번째 행이 헤더가 아니면 헤더 추가
  if (data[0][0] !== 'ID') {
    sheet.insertRowBefore(1);
    sheet.getRange(1, 1, 1, 11).setValues([[
      'ID', 'AuthorName', 'PasswordHash', 'OrnamentType',
      'PositionX', 'PositionY', 'CardType', 'URL',
      'CardDataJSON', 'CreatedAt', 'UpdatedAt'
    ]]);
    return createResponse({
      success: true,
      cards: []
    });
  }

  // 헤더 제외하고 데이터만 가져오기
  const cards = data.slice(1).map(row => {
    if (!row[0]) return null; // 빈 행 제외

    return {
      id: row[0],
      authorName: row[1],
      passwordHash: row[2],
      ornamentType: row[3],
      positionX: parseFloat(row[4]) || 0,
      positionY: parseFloat(row[5]) || 0,
      cardType: row[6],
      url: row[7] || null,
      cardData: row[8] ? JSON.parse(row[8]) : {},
      createdAt: row[9],
      updatedAt: row[10]
    };
  }).filter(card => card !== null);

  return createResponse({
    success: true,
    cards: cards
  });
}

// 특정 카드 조회
function getCard(sheet, id) {
  const data = sheet.getDataRange().getValues();
  const rowIndex = data.findIndex(row => row[0] === id);

  if (rowIndex === -1) {
    return createResponse({
      success: false,
      error: 'Card not found'
    });
  }

  const row = data[rowIndex];
  const card = {
    id: row[0],
    authorName: row[1],
    passwordHash: row[2],
    ornamentType: row[3],
    positionX: parseFloat(row[4]) || 0,
    positionY: parseFloat(row[5]) || 0,
    cardType: row[6],
    url: row[7] || null,
    cardData: row[8] ? JSON.parse(row[8]) : {},
    createdAt: row[9],
    updatedAt: row[10]
  };

  return createResponse({
    success: true,
    card: card
  });
}

// 카드 추가
function addCard(sheet, card) {
  const now = new Date().toISOString();
  const id = Utilities.getUuid();

  const row = [
    id,
    card.authorName,
    card.passwordHash,
    card.ornamentType,
    card.positionX || 0,
    card.positionY || 0,
    card.cardType,
    card.url || '',
    JSON.stringify(card.cardData || {}),
    now,
    now
  ];

  sheet.appendRow(row);

  return createResponse({
    success: true,
    id: id,
    message: 'Card added successfully'
  });
}

// 카드 수정
function updateCard(sheet, id, card) {
  const data = sheet.getDataRange().getValues();
  const rowIndex = data.findIndex(row => row[0] === id);

  if (rowIndex === -1) {
    return createResponse({
      success: false,
      error: 'Card not found'
    });
  }

  const now = new Date().toISOString();
  const createdAt = data[rowIndex][9]; // 생성일 유지

  const row = [
    id,
    card.authorName,
    card.passwordHash,
    card.ornamentType,
    card.positionX || 0,
    card.positionY || 0,
    card.cardType,
    card.url || '',
    JSON.stringify(card.cardData || {}),
    createdAt,
    now
  ];

  sheet.getRange(rowIndex + 1, 1, 1, 11).setValues([row]);

  return createResponse({
    success: true,
    message: 'Card updated successfully'
  });
}

// 카드 삭제
function deleteCard(sheet, id) {
  const data = sheet.getDataRange().getValues();
  const rowIndex = data.findIndex(row => row[0] === id);

  if (rowIndex === -1) {
    return createResponse({
      success: false,
      error: 'Card not found'
    });
  }

  sheet.deleteRow(rowIndex + 1);

  return createResponse({
    success: true,
    message: 'Card deleted successfully'
  });
}

// 카드 위치 업데이트
function updatePosition(sheet, id, positionX, positionY) {
  const data = sheet.getDataRange().getValues();
  const rowIndex = data.findIndex(row => row[0] === id);

  if (rowIndex === -1) {
    return createResponse({
      success: false,
      error: 'Card not found'
    });
  }

  const now = new Date().toISOString();

  sheet.getRange(rowIndex + 1, 5).setValue(positionX);
  sheet.getRange(rowIndex + 1, 6).setValue(positionY);
  sheet.getRange(rowIndex + 1, 11).setValue(now);

  return createResponse({
    success: true,
    message: 'Position updated successfully'
  });
}

// 비밀번호 확인
function verifyPassword(sheet, id, passwordHash) {
  const data = sheet.getDataRange().getValues();
  const rowIndex = data.findIndex(row => row[0] === id);

  if (rowIndex === -1) {
    return createResponse({
      success: false,
      error: 'Card not found'
    });
  }

  const storedHash = data[rowIndex][2];
  const isValid = storedHash === passwordHash;

  return createResponse({
    success: true,
    valid: isValid
  });
}

// 응답 생성 헬퍼 함수
function createResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// CORS preflight 요청을 명시적으로 처리
// 브라우저가 POST 요청 전에 OPTIONS 요청을 보낼 때 사용
// 이 함수는 자동으로 호출되지 않으므로, doPost에서 명시적으로 확인 필요
