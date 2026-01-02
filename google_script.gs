
const SPREADSHEET_ID = "16w4EzHhTyS1CnTfJOWE7QQNM0o2mMQIqePpPK8TEYrg";

/**
 * Hàm xóa dữ liệu Quiz vào 23:59 Chủ Nhật hàng tuần.
 * Hướng dẫn: Trong Apps Script, chọn biểu tượng Đồng hồ (Trình kích hoạt) -> Thêm trình kích hoạt.
 * Chọn hàm: clearWeeklyQuizData | Sự kiện: Theo thời gian | Loại: Theo tuần | Ngày: Chủ nhật | Giờ: 23h-00h.
 */
function clearWeeklyQuizData() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName("ketquaQuiZ");
  if (sheet && sheet.getLastRow() > 1) {
    // Xóa từ dòng 2 đến hết
    sheet.deleteRows(2, sheet.getLastRow() - 1);
    console.log("Dữ liệu ketquaQuiZ đã được dọn dẹp định kỳ.");
  }
}

function doGet(e) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const type = e.parameter.type;

  if (type === 'getStats') {
    const stats = {
      ratings: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      top10: []
    };

    const sheetRate = ss.getSheetByName("danhgia");
    if (sheetRate) {
      const rateData = sheetRate.getDataRange().getValues();
      for (let i = 1; i < rateData.length; i++) {
        const star = parseInt(rateData[i][1]);
        if (star >= 1 && star <= 5) stats.ratings[star]++;
      }
    }

    const sheetQuiz = ss.getSheetByName("ketquaQuiZ");
    if (sheetQuiz) {
      const quizData = sheetQuiz.getDataRange().getValues();
      if (quizData.length > 1) {
        const results = [];
        for (let i = 1; i < quizData.length; i++) {
          results.push({
            name: quizData[i][2],
            score: parseFloat(quizData[i][6]) || 0,
            time: quizData[i][7] || "00:00",
            phone: quizData[i][5] ? quizData[i][5].toString() : ""
          });
        }
        results.sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          return a.time.localeCompare(b.time);
        });
        stats.top10 = results.slice(0, 10).map((r, idx) => ({
          rank: idx + 1,
          ...r
        }));
      }
    }
    return createResponse("success", "Thành công", stats);
  }

  const idnumber = e.parameter.idnumber;
  const sbd = e.parameter.sbd;
  const sheetList = ss.getSheetByName("danhsach");
  
  if (!sheetList) return createResponse("error", "Không tìm thấy sheet danhsach");

  const data = sheetList.getDataRange().getValues();
  const headers = data[0].map(h => h.toString().toLowerCase().trim());
  
  const idxSbd = headers.indexOf("sbd");
  const idxId = headers.indexOf("idnumber");
  const idxName = headers.indexOf("name");
  const idxClass = headers.indexOf("class");
  const idxLimit = headers.indexOf("limit");
  const idxLimittab = headers.indexOf("limittab");
  const idxTk = headers.indexOf("taikhoanapp"); // Cột G

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
        sheetRate.appendRow(["Timestamp", "sosao", "name", "class", "idNumber", "taikhoanapp"]);
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
        data.timestamp,
        data.examCode,
        data.name,
        data.className,
        data.school || "",
        data.phoneNumber || "",
        data.score,
        data.totalTime,
        data.stk || "",
        data.bank || ""
      ]);
      return createResponse("success", "OK");
    }

    let sheetResult = ss.getSheetByName("ketqua");
    if (!sheetResult) sheetResult = ss.insertSheet("ketqua");
    if (sheetResult.getLastRow() === 0) {
      sheetResult.appendRow(["Timestamp", "makiemtra", "sbd", "name", "class", "tongdiem", "fulltime", "details"]);
    }
    sheetResult.appendRow([
      data.timestamp,
      data.examCode,
      data.sbd,
      data.name,
      data.className,
      data.score,
      data.totalTime,
      JSON.stringify(data.details)
    ]);

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
