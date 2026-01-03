const SPREADSHEET_ID = "16w4EzHhTyS1CnTfJOWE7QQNM0o2mMQIqePpPK8TEYrg";

function clearWeeklyQuizData() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName("ketquaQuiZ");
  if (sheet && sheet.getLastRow() > 1) {
    sheet.deleteRows(2, sheet.getLastRow() - 1);
    console.log("Dữ liệu ketquaQuiZ đã được dọn dẹp.");
  }
}

function doGet(e) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const type = e.parameter.type;

  // --- TRƯỜNG HỢP 1: LẤY THỐNG KÊ (RATINGS & TOP 10) ---
  if (type === 'getStats') {
    const stats = {
      ratings: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      top10: []
    };

    // 1. Lấy dữ liệu đánh giá sao
    const sheetRate = ss.getSheetByName("danhgia");
    if (sheetRate) {
      const rateData = sheetRate.getDataRange().getValues();
      for (let i = 1; i < rateData.length; i++) {
        const star = parseInt(rateData[i][1]);
        if (star >= 1 && star <= 5) stats.ratings[star]++;
      }
    }

    // 2. Lấy dữ liệu Top 10 từ sheet Top10Display (Ưu tiên hiển thị)
    const sheetDisplay = ss.getSheetByName("Top10Display");
    if (sheetDisplay) {
      const lastRow = sheetDisplay.getLastRow();
      if (lastRow >= 2) {
        const values = sheetDisplay.getRange(2, 1, Math.min(10, lastRow - 1), 7).getValues();
        stats.top10 = values.map((row, index) => ({
          rank: index + 1,
          name: row[0],      // Cột A
          score: row[2],     // Cột C
          time: row[3],      // Cột D
          idPhone: row[6] || row[1] // Cột G (idPhone) hoặc cột B
        }));
      }
    }

    return createResponse("success", "Thành công", stats);
  }

  // --- TRƯỜNG HỢP 2: XÁC MINH HỌC SINH ---
  const idnumber = e.parameter.idnumber;
  const sbd = e.parameter.sbd;
  const sheetList = ss.getSheetByName("danhsach");
  
  // SỬA LỖI TẠI ĐÂY: Nếu KHÔNG có sheet thì mới báo lỗi
  if (!sheetList) return createResponse("error", "Không tìm thấy sheet danhsach");

  const data = sheetList.getDataRange().getValues();
  const headers = data[0].map(h => h.toString().toLowerCase().trim());
  
  const idxSbd = headers.indexOf("sbd");
  const idxId = headers.indexOf("idnumber");
  const idxName = headers.indexOf("name");
  const idxClass = headers.indexOf("class");
  const idxLimit = headers.indexOf("limit");
  const idxLimittab = headers.indexOf("limittab");
  const idxTk = headers.indexOf("taikhoanapp");

  let student = null;
  for (let i = 1; i < data.length; i++) {
    if (data[i][idxId].toString().trim() === idnumber && data[i][idxSbd].toString().trim() === sbd) {
      student = {
        sbd: data[i][idxSbd].toString(),
        name: data[i][idxName],
        class: data[i][idxClass],
        limit: parseInt(data[i][idxLimit]) || 1,
        limittab: parseInt(data[i][idxLimittab]) || 3,
        idnumber: data[i][idxId].toString(),
        taikhoanapp: data[i][idxTk] || "Free"
      };
      break;
    }
  }

  if (!student) return createResponse("error", "Thông tin SBD hoặc ID không khớp!");
  return createResponse("success", "Xác minh thành công", student);
}

function doPost(e) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const lock = LockService.getScriptLock();
  lock.tryLock(15000);

  try {
    const data = JSON.parse(e.postData.contents);
    
    if (data.type === 'rating') {
      let sheetRate = ss.getSheetByName("danhgia");
      if (!sheetRate) {
        sheetRate = ss.insertSheet("danhgia");
        sheetRate.appendRow(["Timestamp", "stars", "name", "class", "idNumber", "taikhoanapp"]);
      }
      sheetRate.appendRow([new Date(), data.stars, data.name, data.class, data.idNumber, data.taikhoanapp]);
      return createResponse("success", "OK");
    }

    if (data.type === 'quiz') {
      let sheetQuiz = ss.getSheetByName("ketquaQuiZ");
      if (!sheetQuiz) {
        sheetQuiz = ss.insertSheet("ketquaQuiZ");
        sheetQuiz.appendRow(["Timestamp", "maQuiZ", "name", "class", "school", "phoneNumber", "tongdiem", "fulltime", "sotk", "bank"]);
      }
      sheetQuiz.appendRow([
        new Date(),
        data.examCode || "QUIZ",
        data.name || "N/A",
        data.className || "",
        data.school || "",
        data.phoneNumber || "",
        data.score || 0,
        data.totalTime || "00:00",
        data.stk || "",
        data.bank || ""
      ]);
      return createResponse("success", "Đã lưu kết quả Quiz");
    }

    // Mặc định lưu kết quả kiểm tra
    let sheetResult = ss.getSheetByName("ketqua");
    if (!sheetResult) sheetResult = ss.insertSheet("ketqua");
    if (sheetResult.getLastRow() === 0) {
      sheetResult.appendRow(["Timestamp", "makiemtra", "sbd", "name", "class", "tongdiem", "fulltime", "details"]);
    }
    sheetResult.appendRow([new Date(), data.examCode, data.sbd, data.name, data.className, data.score, data.totalTime, JSON.stringify(data.details)]);

    return createResponse("success", "OK");
  } catch (error) {
    return createResponse("error", error.message);
  } finally {
    lock.releaseLock();
  }
}

function createResponse(status, message, data) {
  const output = { status: status, message: message };
  if (data) output.data = data;
  return ContentService.createTextOutput(JSON.stringify(output)).setMimeType(ContentService.MimeType.JSON);
}
