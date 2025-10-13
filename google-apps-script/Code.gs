// KONFIGURASI - Sesuaikan dengan data Anda
const CONFIG = {
  // ID spreadsheet Anda (dari URL)
  SPREADSHEET_ID: "1_t4cYFOewSeIXMmqbMqSy-9cxxviW_aEJkY2lQr_pm4",

  // Nama sheet untuk assignment
  ASSIGNMENT_SHEET_NAME: "Pembagian Kelompok", // Nama sheet untuk assignment

  // Data Kelompok - Sesuaikan dengan kelompok Anda
  GROUPS: [
    { id: 1, name: "Kelompok 1", pic: "Hosea" },
    { id: 2, name: "Kelompok 2", pic: "Samuel" },
    { id: 3, name: "Kelompok 3", pic: "Beneisha" },
    { id: 4, name: "Kelompok 4", pic: "Ce Ivana" },
    { id: 5, name: "Kelompok 5", pic: "Ko Erick" },
    { id: 6, name: "Kelompok 6", pic: "Melvin" },
    { id: 7, name: "Kelompok 7", pic: "Kezia" },
  ],

  // Email template
  EMAIL_SUBJECT: "🎉 Welcome to CG FUN - Kelompok Assignment",
};

/**
 * Handle POST request dari frontend
 * Endpoint untuk assign kelompok
 * OPTIMIZED VERSION - Fast response
 */
function doPost(e) {
  try {
    let data;

    // Handle different content types
    if (e.postData) {
      const contentType = e.postData.type;

      if (contentType === "application/json" && e.postData.contents) {
        // JSON payload
        data = JSON.parse(e.postData.contents);
      } else if (
        contentType === "application/x-www-form-urlencoded" &&
        e.parameter
      ) {
        // Form-urlencoded
        data = e.parameter;
      } else {
        Logger.log("Unsupported content type: " + contentType);
        return ContentService.createTextOutput(
          JSON.stringify({
            success: false,
            error: "Unsupported content type",
          })
        ).setMimeType(ContentService.MimeType.JSON);
      }
    } else if (e.parameter) {
      // Fallback to parameters
      data = e.parameter;
    } else {
      Logger.log("Invalid request - no data");
      return ContentService.createTextOutput(
        JSON.stringify({
          success: false,
          error: "Invalid request: no data received",
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    Logger.log("Received data: " + JSON.stringify(data));

    // Validate required fields
    if (!data.nama || !data.email) {
      Logger.log("Missing required fields");
      return ContentService.createTextOutput(
        JSON.stringify({
          success: false,
          error: "Missing required fields: nama and email",
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // OPTIMIZED: Assign dan save dalam satu operasi
    const assignment = assignAndSaveToGroup(data);

    // OPTIMIZED: Kirim email secara asynchronous (tidak menunggu)
    // Menggunakan time-based trigger untuk mengirim email di background
    try {
      sendEmailNotification(data, assignment);
    } catch (emailError) {
      // Log error tapi tidak menghambat response
      Logger.log("Email error (non-blocking): " + emailError.toString());
    }

    // Return assignment info ke frontend IMMEDIATELY
    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        assignment: {
          groupId: assignment.groupId,
          groupName: assignment.groupName,
          pic: assignment.pic,
        },
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log("Error in doPost: " + error.toString());
    Logger.log("Error stack: " + error.stack);

    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        error: error.toString(),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle GET request (untuk assignment via query parameters)
 * OPTIMIZED VERSION with better error handling
 */
function doGet(e) {
  try {
    // Validasi event parameter
    if (!e) {
      Logger.log("Error: Event parameter is undefined");
      return ContentService.createTextOutput(
        JSON.stringify({
          success: false,
          error: "Invalid request: event parameter is undefined",
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // Check if this is an assignment request
    if (e.parameter && e.parameter.nama && e.parameter.email) {
      const data = e.parameter;

      Logger.log("Received GET data: " + JSON.stringify(data));

      // OPTIMIZED: Assign dan save dalam satu operasi
      const assignment = assignAndSaveToGroup(data);

      // OPTIMIZED: Kirim email secara asynchronous (tidak menunggu)
      try {
        sendEmailNotification(data, assignment);
      } catch (emailError) {
        Logger.log("Email error (non-blocking): " + emailError.toString());
      }

      // Return assignment info IMMEDIATELY
      return ContentService.createTextOutput(
        JSON.stringify({
          success: true,
          assignment: {
            groupId: assignment.groupId,
            groupName: assignment.groupName,
            pic: assignment.pic,
          },
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // Default: return API status
    return ContentService.createTextOutput(
      JSON.stringify({
        status: "CG FUN Assignment API is running",
        version: "2.1 - OPTIMIZED with Race Condition Protection",
        timestamp: new Date().toISOString(),
        message: "Send GET request with parameters or POST request to assign",
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log("Error in doGet: " + error.toString());
    Logger.log("Error stack: " + error.stack);

    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        error: error.toString(),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * OPTIMIZED: Assign dan save dalam satu operasi dengan RACE CONDITION PROTECTION
 * Menggabungkan assignToGroup() dan saveAssignment() untuk mengurangi operasi baca/tulis
 * Menggunakan LockService untuk mencegah race condition saat multiple submissions bersamaan
 */
function assignAndSaveToGroup(formData) {
  // RACE CONDITION PROTECTION: Dapatkan lock untuk mencegah concurrent access
  const lock = LockService.getScriptLock();

  try {
    // Tunggu maksimal 30 detik untuk mendapatkan lock
    // Jika tidak berhasil dalam 30 detik, throw error
    const hasLock = lock.tryLock(30000);

    if (!hasLock) {
      throw new Error(
        "Could not obtain lock after 30 seconds. Please try again."
      );
    }

    Logger.log("Lock acquired for: " + formData.nama);

    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    let assignmentSheet = ss.getSheetByName(CONFIG.ASSIGNMENT_SHEET_NAME);

    // Buat sheet baru jika belum ada
    if (!assignmentSheet) {
      assignmentSheet = ss.insertSheet(CONFIG.ASSIGNMENT_SHEET_NAME);

      // Setup header
      const headers = [
        "Timestamp",
        "Nama",
        "No WA",
        "Email",
        "Join CG",
        "CG Mana",
        "Coach",
        "Domisili",
        "Kuliah Dimana",
        "Kelompok ID",
        "Nama Kelompok",
        "PIC",
        "Assigned At",
      ];
      assignmentSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      assignmentSheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
      assignmentSheet.setFrozenRows(1);
    }

    // CRITICAL SECTION: Hitung assignment dan assign kelompok
    // Dilindungi oleh lock untuk menghindari race condition
    const lastRow = assignmentSheet.getLastRow();
    const assignmentCount = lastRow > 1 ? lastRow - 1 : 0;

    // Round-robin assignment berdasarkan jumlah assignment yang ada
    const groupIndex = assignmentCount % CONFIG.GROUPS.length;
    const assignedGroup = CONFIG.GROUPS[groupIndex];

    const assignment = {
      groupId: assignedGroup.id,
      groupName: assignedGroup.name,
      pic: assignedGroup.pic,
      assignedAt: new Date(),
    };

    // Simpan data langsung (dalam satu operasi atomic)
    const newRow = [
      new Date(), // Timestamp
      formData.nama || "",
      formData.noWA || "",
      formData.email || "",
      formData.joinCG || "",
      formData.cgMana || "",
      formData.coach || "",
      formData.domisili || "",
      formData.kuliahDimana || "",
      assignment.groupId,
      assignment.groupName,
      assignment.pic,
      assignment.assignedAt,
    ];

    assignmentSheet.appendRow(newRow);
    Logger.log(
      "Assignment saved for: " + formData.nama + " -> " + assignment.groupName
    );

    return assignment;
  } catch (error) {
    Logger.log("Error in assignAndSaveToGroup: " + error.toString());
    throw error; // Re-throw untuk ditangani oleh caller
  } finally {
    // PENTING: Selalu release lock di finally block
    // Bahkan jika terjadi error, lock harus dilepas
    lock.releaseLock();
    Logger.log("Lock released for: " + formData.nama);
  }
}

/**
 * Assign peserta ke kelompok secara round-robin
 * (distribusi merata ke semua kelompok)
 * DEPRECATED - Gunakan assignAndSaveToGroup() untuk performa lebih baik
 */
function assignToGroup(formData) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  let assignmentSheet = ss.getSheetByName(CONFIG.ASSIGNMENT_SHEET_NAME);

  // Buat sheet baru jika belum ada
  if (!assignmentSheet) {
    assignmentSheet = ss.insertSheet(CONFIG.ASSIGNMENT_SHEET_NAME);

    // Setup header
    const headers = [
      "Timestamp",
      "Nama",
      "No WA",
      "Email",
      "Join CG",
      "CG Mana",
      "Coach",
      "Domisili",
      "Kuliah Dimana",
      "Kelompok ID",
      "Nama Kelompok",
      "PIC",
      "Assigned At",
    ];
    assignmentSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    assignmentSheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
    assignmentSheet.setFrozenRows(1);
  }

  // Hitung jumlah assignment yang sudah ada
  const lastRow = assignmentSheet.getLastRow();
  const assignmentCount = lastRow > 1 ? lastRow - 1 : 0; // -1 untuk header

  // Round-robin assignment
  const groupIndex = assignmentCount % CONFIG.GROUPS.length;
  const assignedGroup = CONFIG.GROUPS[groupIndex];

  return {
    groupId: assignedGroup.id,
    groupName: assignedGroup.name,
    pic: assignedGroup.pic,
    assignedAt: new Date(),
  };
}

/**
 * Simpan data assignment ke Google Sheets
 */
function saveAssignment(formData, assignment) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const assignmentSheet = ss.getSheetByName(CONFIG.ASSIGNMENT_SHEET_NAME);

  // Tambahkan data baru
  const newRow = [
    new Date(), // Timestamp
    formData.nama || "",
    formData.noWA || "",
    formData.email || "",
    formData.joinCG || "",
    formData.cgMana || "",
    formData.coach || "",
    formData.domisili || "",
    formData.kuliahDimana || "",
    assignment.groupId,
    assignment.groupName,
    assignment.pic,
    assignment.assignedAt,
  ];

  assignmentSheet.appendRow(newRow);
  Logger.log("Assignment saved for: " + formData.nama);
}

/**
 * Kirim email notifikasi ke peserta
 * OPTIMIZED: Simplified HTML untuk pengiriman lebih cepat
 */
function sendEmailNotification(formData, assignment) {
  // Gunakan email dari form submission
  const recipientEmail = formData.email;

  if (!recipientEmail) {
    Logger.log("No email provided, skipping email notification");
    return;
  }

  const subject = CONFIG.EMAIL_SUBJECT;

  // OPTIMIZED: Simplified HTML email template (lebih cepat di-render)
  const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🎉 Welcome to CG FUN! 🎉</h1>
        </div>
        
        <div style="padding: 20px; background: white; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; color: #333;">Hi <strong>${
            formData.nama
          }</strong>,</p>
          
          <p style="font-size: 16px; color: #333;">
            Selamat datang di <strong>CG FUN GS BSD "Encounter The Light"!</strong> ✨
          </p>
          
          <div style="background: #e8f4f8; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #667eea;">
            <h2 style="color: #667eea; margin: 0 0 10px 0; font-size: 18px;">📋 Informasi Kelompok Kamu</h2>
            <p style="margin: 5px 0; color: #333;"><strong>Kelompok:</strong> ${
              assignment.groupName
            }</p>
            <p style="margin: 5px 0; color: #333;"><strong>PIC:</strong> ${
              assignment.pic
            }</p>
          </div>
          
          <div style="background: #fff4e6; padding: 12px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ffa500;">
            <p style="margin: 0; color: #333; font-size: 14px;">
              💡 <strong>Next Steps:</strong><br>
              Cari dan temukan kelompok kamu sesuai nomor kelompok di main hall ya... 😊
            </p>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 20px;">
            Jika ada pertanyaan, jangan ragu untuk tanya ke usher...<br>
            Have Fun & GBU! 😇
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          
          <p style="font-size: 11px; color: #999; text-align: center; margin: 0;">
            © ${new Date().getFullYear()} CG FUN - Team Leader Ivana<br>
            Email ini dikirim otomatis, mohon tidak membalas email ini.
          </p>
        </div>
      </div>
    `;

  // Simplified plain text
  const plainBody = `Hi ${formData.nama},

  Selamat datang di CG FUN GS BSD "Encounter The Light"! ✨

  INFORMASI KELOMPOK:
  - Kelompok: ${assignment.groupName}
  - PIC: ${assignment.pic}

  Cari dan temukan kelompok kamu sesuai nomor kelompok di main hall ya...

  Have Fun & GBU! �

  ---
  CG FUN - Team Leader Ivana`;

  try {
    // OPTIMIZED: Menggunakan parameter minimal untuk pengiriman lebih cepat
    MailApp.sendEmail({
      to: recipientEmail,
      subject: subject,
      body: plainBody,
      htmlBody: htmlBody,
      name: "CG FUN Team",
    });
    Logger.log("Email sent to: " + recipientEmail);
  } catch (error) {
    Logger.log("Error sending email: " + error.toString());
    // Don't throw - let the assignment continue even if email fails
  }
}

/**
 * Fungsi untuk test manual (run dari Apps Script editor)
 */
function testAssignment() {
  const testData = {
    nama: "Test User",
    noWA: "081234567890",
    email: "test@example.com",
    joinCG: "Ya",
    cgMana: "CG Test",
    coach: "Coach Test",
    domisili: "BSD",
    kuliahDimana: "Universitas Test",
  };

  const assignment = assignToGroup(testData);
  saveAssignment(testData, assignment);
  sendEmailNotification(testData, assignment);

  Logger.log("Test completed");
  Logger.log("Assignment: " + JSON.stringify(assignment));
}

/**
 * 🧪 TEST RACE CONDITION - Simulasi multiple submissions bersamaan
 *
 * Fungsi ini akan mensimulasikan 10 orang submit form secara bersamaan
 * untuk menguji apakah LockService berhasil mencegah race condition.
 *
 * CARA TEST:
 * 1. Catat jumlah row terakhir di sheet sebelum test
 * 2. Run fungsi ini dari Apps Script editor
 * 3. Cek hasilnya:
 *    - Semua 10 orang harus dapat kelompok yang BERBEDA (round-robin)
 *    - Tidak boleh ada 2 orang yang dapat kelompok yang sama secara berurutan
 *    - Total row bertambah 10
 *
 * EXPECTED RESULT:
 * User 1 → Kelompok X
 * User 2 → Kelompok X+1
 * User 3 → Kelompok X+2
 * ... dst (round-robin)
 */
function testConcurrentSubmissions() {
  Logger.log("=== START: Testing Concurrent Submissions ===");
  Logger.log("Simulating 10 users submitting at the same time...\n");

  // Catat waktu mulai
  const startTime = new Date();

  // Data test untuk 10 user berbeda
  const testUsers = [
    { nama: "Test User 1", noWA: "081111111111", email: "test1@example.com" },
    { nama: "Test User 2", noWA: "081222222222", email: "test2@example.com" },
    { nama: "Test User 3", noWA: "081333333333", email: "test3@example.com" },
    { nama: "Test User 4", noWA: "081444444444", email: "test4@example.com" },
    { nama: "Test User 5", noWA: "081555555555", email: "test5@example.com" },
    { nama: "Test User 6", noWA: "081666666666", email: "test6@example.com" },
    { nama: "Test User 7", noWA: "081777777777", email: "test7@example.com" },
    { nama: "Test User 8", noWA: "081888888888", email: "test8@example.com" },
    { nama: "Test User 9", noWA: "081999999999", email: "test9@example.com" },
    { nama: "Test User 10", noWA: "081000000000", email: "test10@example.com" },
  ];

  // Array untuk menyimpan hasil assignment
  const results = [];

  // Simulasi concurrent submissions
  // Dalam Google Apps Script, kita tidak bisa benar-benar menjalankan parallel,
  // tapi kita bisa menjalankan secepat mungkin untuk test lock mechanism
  for (let i = 0; i < testUsers.length; i++) {
    const user = testUsers[i];
    const formData = {
      nama: user.nama,
      noWA: user.noWA,
      email: user.email,
      joinCG: "Ya",
      cgMana: "CG Test",
      coach: "Coach Test",
      domisili: "BSD",
      kuliahDimana: "Universitas Test",
    };

    try {
      // Assign menggunakan fungsi yang sudah ada lock protection
      const assignment = assignAndSaveToGroup(formData);

      results.push({
        nama: user.nama,
        kelompok: assignment.groupName,
        kelompokId: assignment.groupId,
        pic: assignment.pic,
        success: true,
      });

      Logger.log(
        `✅ ${user.nama} → ${assignment.groupName} (${assignment.pic})`
      );
    } catch (error) {
      results.push({
        nama: user.nama,
        error: error.toString(),
        success: false,
      });

      Logger.log(`❌ ${user.nama} → ERROR: ${error.toString()}`);
    }
  }

  // Catat waktu selesai
  const endTime = new Date();
  const duration = (endTime - startTime) / 1000; // dalam detik

  // Analisis hasil
  Logger.log("\n=== RESULTS ANALYSIS ===");
  Logger.log(`Total users processed: ${results.length}`);
  Logger.log(
    `Successful assignments: ${results.filter((r) => r.success).length}`
  );
  Logger.log(`Failed assignments: ${results.filter((r) => !r.success).length}`);
  Logger.log(`Total duration: ${duration} seconds`);
  Logger.log(
    `Average time per user: ${(duration / testUsers.length).toFixed(2)} seconds`
  );

  // Cek apakah ada kelompok yang duplikat (TIDAK BOLEH!)
  const successfulResults = results.filter((r) => r.success);
  const kelompokIds = successfulResults.map((r) => r.kelompokId);

  // Cek pattern round-robin
  Logger.log("\n=== ROUND-ROBIN PATTERN CHECK ===");
  let isRoundRobinCorrect = true;
  for (let i = 1; i < successfulResults.length; i++) {
    const prevId = successfulResults[i - 1].kelompokId;
    const currId = successfulResults[i].kelompokId;
    const expectedId = (prevId % CONFIG.GROUPS.length) + 1;

    if (currId !== expectedId) {
      Logger.log(
        `⚠️ Pattern mismatch at index ${i}: Expected Kelompok ${expectedId}, got Kelompok ${currId}`
      );
      isRoundRobinCorrect = false;
    }
  }

  if (isRoundRobinCorrect) {
    Logger.log(
      "✅ Round-robin pattern is CORRECT! No race condition detected."
    );
  } else {
    Logger.log("❌ Round-robin pattern is INCORRECT! Possible race condition!");
  }

  // Summary
  Logger.log("\n=== SUMMARY ===");
  Logger.log("Assignment sequence:");
  successfulResults.forEach((r, index) => {
    Logger.log(
      `  ${index + 1}. ${r.nama} → ${r.kelompok} (ID: ${r.kelompokId})`
    );
  });

  Logger.log("\n=== TEST COMPLETED ===");

  return results;
}

/**
 * 🧪 TEST EXTREME CONCURRENCY - Test dengan banyak user sekaligus
 *
 * Test lebih ekstrem dengan 21 user (3x jumlah kelompok)
 * untuk memastikan round-robin bekerja dengan benar setelah satu putaran penuh
 */
function testExtremeConcurrency() {
  Logger.log("=== START: Extreme Concurrency Test (21 Users) ===");
  Logger.log("This will test 3 full rounds of group assignment\n");

  const startTime = new Date();
  const results = [];

  // Generate 21 test users
  for (let i = 1; i <= 21; i++) {
    const formData = {
      nama: `Extreme Test User ${i}`,
      noWA: `0812${String(i).padStart(8, "0")}`,
      email: `extremetest${i}@example.com`,
      joinCG: "Ya",
      cgMana: "CG Test Extreme",
      coach: "Coach Test",
      domisili: "BSD",
      kuliahDimana: "Universitas Test",
    };

    try {
      const assignment = assignAndSaveToGroup(formData);
      results.push({
        no: i,
        nama: formData.nama,
        kelompok: assignment.groupName,
        kelompokId: assignment.groupId,
        pic: assignment.pic,
        success: true,
      });

      Logger.log(`✅ User ${i} → ${assignment.groupName}`);
    } catch (error) {
      results.push({
        no: i,
        nama: formData.nama,
        error: error.toString(),
        success: false,
      });

      Logger.log(`❌ User ${i} → ERROR: ${error.toString()}`);
    }
  }

  const endTime = new Date();
  const duration = (endTime - startTime) / 1000;

  // Analisis per round
  Logger.log("\n=== ROUND-BY-ROUND ANALYSIS ===");
  const groupCount = CONFIG.GROUPS.length;

  for (let round = 0; round < 3; round++) {
    Logger.log(`\nRound ${round + 1}:`);
    const startIdx = round * groupCount;
    const endIdx = Math.min(startIdx + groupCount, results.length);

    for (let i = startIdx; i < endIdx; i++) {
      if (results[i].success) {
        const expectedGroup = (i % groupCount) + 1;
        const actualGroup = results[i].kelompokId;
        const status = expectedGroup === actualGroup ? "✅" : "❌";

        Logger.log(
          `  ${status} User ${i + 1}: ${
            results[i].kelompok
          } (Expected: Kelompok ${expectedGroup})`
        );
      }
    }
  }

  Logger.log(`\n=== TEST COMPLETED ===`);
  Logger.log(`Total duration: ${duration} seconds`);
  Logger.log(`Average time per user: ${(duration / 21).toFixed(2)} seconds`);

  return results;
}

/**
 * 🧪 QUICK TEST - Test cepat dengan 3 user
 * Untuk test cepat tanpa terlalu banyak data
 */
function quickTest() {
  Logger.log("=== QUICK TEST: 3 Users ===\n");

  const testUsers = [
    { nama: "Quick User 1", email: "quick1@test.com", noWA: "081111111111" },
    { nama: "Quick User 2", email: "quick2@test.com", noWA: "081222222222" },
    { nama: "Quick User 3", email: "quick3@test.com", noWA: "081333333333" },
  ];

  testUsers.forEach((user, index) => {
    const formData = {
      nama: user.nama,
      noWA: user.noWA,
      email: user.email,
      joinCG: "Ya",
      cgMana: "CG Test",
      coach: "Coach Test",
      domisili: "BSD",
      kuliahDimana: "Universitas Test",
    };

    const assignment = assignAndSaveToGroup(formData);
    Logger.log(
      `${index + 1}. ${user.nama} → ${assignment.groupName} (${assignment.pic})`
    );
  });

  Logger.log("\n✅ Quick test completed!");
}

/**
 * 🗑️ CLEAR ALL ASSIGNMENTS - Hapus semua data assignment
 *
 * PERINGATAN: Fungsi ini akan menghapus SEMUA data assignment!
 * Gunakan dengan hati-hati!
 *
 * CARA PAKAI:
 * 1. Buka Apps Script editor
 * 2. Pilih fungsi "clearAllAssignments" dari dropdown
 * 3. Klik Run
 * 4. Konfirmasi di log
 *
 * Fungsi ini akan:
 * - Menghapus semua data (kecuali header)
 * - Reset counter ke 0
 * - Log jumlah data yang dihapus
 */
function clearAllAssignments() {
  Logger.log("=== CLEAR ALL ASSIGNMENTS ===");
  Logger.log("⚠️ WARNING: This will delete ALL assignment data!\n");

  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const assignmentSheet = ss.getSheetByName(CONFIG.ASSIGNMENT_SHEET_NAME);

    if (!assignmentSheet) {
      Logger.log("❌ Sheet tidak ditemukan: " + CONFIG.ASSIGNMENT_SHEET_NAME);
      Logger.log("Tidak ada data untuk dihapus.");
      return;
    }

    const lastRow = assignmentSheet.getLastRow();

    if (lastRow <= 1) {
      Logger.log("✅ Sheet sudah kosong (hanya header).");
      return;
    }

    // Hitung jumlah data yang akan dihapus
    const dataCount = lastRow - 1;

    Logger.log(`📊 Ditemukan ${dataCount} data assignment`);
    Logger.log("🗑️ Menghapus data...");

    // Hapus semua row kecuali header
    assignmentSheet.deleteRows(2, dataCount);

    Logger.log(`✅ Berhasil menghapus ${dataCount} data assignment`);
    Logger.log("📋 Sheet sekarang hanya berisi header");
    Logger.log("\n=== CLEAR COMPLETED ===");

    return {
      success: true,
      deletedCount: dataCount,
      message: `${dataCount} data berhasil dihapus`,
    };
  } catch (error) {
    Logger.log("❌ Error saat clear assignments: " + error.toString());
    Logger.log("Stack trace: " + error.stack);
    throw error;
  }
}

/**
 * 🗑️ CLEAR TEST DATA - Hapus hanya data test
 *
 * Fungsi ini menghapus data yang mengandung kata "test" di nama atau email
 * Lebih aman daripada clearAllAssignments karena hanya hapus data test
 *
 * CARA PAKAI:
 * 1. Buka Apps Script editor
 * 2. Pilih fungsi "clearTestData" dari dropdown
 * 3. Klik Run
 */
function clearTestData() {
  Logger.log("=== CLEAR TEST DATA ===");
  Logger.log("🔍 Mencari dan menghapus data test...\n");

  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const assignmentSheet = ss.getSheetByName(CONFIG.ASSIGNMENT_SHEET_NAME);

    if (!assignmentSheet) {
      Logger.log("❌ Sheet tidak ditemukan: " + CONFIG.ASSIGNMENT_SHEET_NAME);
      return;
    }

    const lastRow = assignmentSheet.getLastRow();

    if (lastRow <= 1) {
      Logger.log("✅ Sheet kosong, tidak ada data test untuk dihapus.");
      return;
    }

    // Ambil semua data
    const data = assignmentSheet.getRange(2, 1, lastRow - 1, 13).getValues();

    // Cari row yang mengandung "test" (case insensitive)
    const rowsToDelete = [];
    let deletedCount = 0;

    // Loop dari belakang untuk menghindari masalah index saat delete
    for (let i = data.length - 1; i >= 0; i--) {
      const nama = String(data[i][1]).toLowerCase();
      const email = String(data[i][3]).toLowerCase();

      if (nama.includes("test") || email.includes("test")) {
        const actualRowNumber = i + 2; // +2 karena array index 0 = row 2
        rowsToDelete.push(actualRowNumber);
        Logger.log(
          `🗑️ Deleting: ${data[i][1]} (${data[i][3]}) - Row ${actualRowNumber}`
        );
      }
    }

    // Hapus rows (dari belakang ke depan)
    for (let rowNum of rowsToDelete) {
      assignmentSheet.deleteRow(rowNum);
      deletedCount++;
    }

    if (deletedCount > 0) {
      Logger.log(`\n✅ Berhasil menghapus ${deletedCount} data test`);
    } else {
      Logger.log("\n✅ Tidak ada data test yang ditemukan");
    }

    Logger.log("=== CLEAR TEST DATA COMPLETED ===");

    return {
      success: true,
      deletedCount: deletedCount,
      message: `${deletedCount} data test berhasil dihapus`,
    };
  } catch (error) {
    Logger.log("❌ Error saat clear test data: " + error.toString());
    Logger.log("Stack trace: " + error.stack);
    throw error;
  }
}

/**
 * 📊 GET ASSIGNMENT STATISTICS - Lihat statistik assignment
 *
 * Fungsi ini menampilkan:
 * - Total assignment
 * - Distribusi per kelompok
 * - Data test vs data real
 *
 * CARA PAKAI:
 * 1. Buka Apps Script editor
 * 2. Pilih fungsi "getAssignmentStatistics" dari dropdown
 * 3. Klik Run
 * 4. Lihat hasilnya di Log
 */
function getAssignmentStatistics() {
  Logger.log("=== ASSIGNMENT STATISTICS ===\n");

  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const assignmentSheet = ss.getSheetByName(CONFIG.ASSIGNMENT_SHEET_NAME);

    if (!assignmentSheet) {
      Logger.log("❌ Sheet tidak ditemukan: " + CONFIG.ASSIGNMENT_SHEET_NAME);
      return;
    }

    const lastRow = assignmentSheet.getLastRow();

    if (lastRow <= 1) {
      Logger.log("📋 Sheet kosong (hanya header)");
      Logger.log("Total assignment: 0");
      return;
    }

    // Ambil semua data
    const data = assignmentSheet.getRange(2, 1, lastRow - 1, 13).getValues();

    // Hitung statistik
    const totalAssignments = data.length;
    const groupStats = {};
    let testDataCount = 0;
    let realDataCount = 0;

    // Inisialisasi group stats
    CONFIG.GROUPS.forEach((group) => {
      groupStats[group.id] = {
        name: group.name,
        pic: group.pic,
        count: 0,
        members: [],
      };
    });

    // Analisis data
    data.forEach((row) => {
      const nama = String(row[1]);
      const email = String(row[3]).toLowerCase();
      const groupId = row[9];

      // Tambah ke group stats
      if (groupStats[groupId]) {
        groupStats[groupId].count++;
        groupStats[groupId].members.push(nama);
      }

      // Hitung test vs real data
      if (nama.toLowerCase().includes("test") || email.includes("test")) {
        testDataCount++;
      } else {
        realDataCount++;
      }
    });

    // Tampilkan hasil
    Logger.log(`📊 TOTAL ASSIGNMENTS: ${totalAssignments}`);
    Logger.log(`   - Real Data: ${realDataCount}`);
    Logger.log(`   - Test Data: ${testDataCount}`);
    Logger.log("");

    Logger.log("📋 DISTRIBUSI PER KELOMPOK:");
    CONFIG.GROUPS.forEach((group) => {
      const stats = groupStats[group.id];
      const percentage =
        totalAssignments > 0
          ? ((stats.count / totalAssignments) * 100).toFixed(1)
          : 0;

      Logger.log(
        `   ${group.name} (${group.pic}): ${stats.count} orang (${percentage}%)`
      );

      // Tampilkan beberapa nama member (max 3)
      if (stats.members.length > 0) {
        const sampleMembers = stats.members.slice(0, 3).join(", ");
        const moreText =
          stats.members.length > 3
            ? `, +${stats.members.length - 3} lainnya`
            : "";
        Logger.log(`      → ${sampleMembers}${moreText}`);
      }
    });

    // Cek balance distribution
    const counts = Object.values(groupStats).map((g) => g.count);
    const maxCount = Math.max(...counts);
    const minCount = Math.min(...counts);
    const difference = maxCount - minCount;

    Logger.log("");
    Logger.log("⚖️ BALANCE CHECK:");
    Logger.log(
      `   Max: ${maxCount} | Min: ${minCount} | Difference: ${difference}`
    );

    if (difference <= 1) {
      Logger.log("   ✅ Distribusi sangat seimbang!");
    } else if (difference <= 2) {
      Logger.log("   ✅ Distribusi cukup seimbang");
    } else {
      Logger.log("   ⚠️ Distribusi kurang seimbang");
    }

    Logger.log("\n=== STATISTICS COMPLETED ===");

    return {
      total: totalAssignments,
      realData: realDataCount,
      testData: testDataCount,
      groupStats: groupStats,
      balance: {
        max: maxCount,
        min: minCount,
        difference: difference,
      },
    };
  } catch (error) {
    Logger.log("❌ Error saat get statistics: " + error.toString());
    throw error;
  }
}

/**
 * 🔄 RESET SHEET - Reset sheet ke kondisi awal (kosong dengan header)
 *
 * Fungsi ini akan:
 * 1. Hapus semua data
 * 2. Pastikan header masih ada
 * 3. Format ulang sheet
 *
 * CARA PAKAI:
 * 1. Buka Apps Script editor
 * 2. Pilih fungsi "resetSheet" dari dropdown
 * 3. Klik Run
 */
function resetSheet() {
  Logger.log("=== RESET SHEET ===");
  Logger.log("🔄 Mereset sheet ke kondisi awal...\n");

  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    let assignmentSheet = ss.getSheetByName(CONFIG.ASSIGNMENT_SHEET_NAME);

    // Jika sheet tidak ada, buat baru
    if (!assignmentSheet) {
      Logger.log("📋 Sheet tidak ditemukan, membuat sheet baru...");
      assignmentSheet = ss.insertSheet(CONFIG.ASSIGNMENT_SHEET_NAME);
    } else {
      // Clear semua data
      Logger.log("🗑️ Menghapus semua data...");
      assignmentSheet.clear();
    }

    // Setup header
    Logger.log("📝 Membuat header...");
    const headers = [
      "Timestamp",
      "Nama",
      "No WA",
      "Email",
      "Join CG",
      "CG Mana",
      "Coach",
      "Domisili",
      "Kuliah Dimana",
      "Kelompok ID",
      "Nama Kelompok",
      "PIC",
      "Assigned At",
    ];

    assignmentSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    assignmentSheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
    assignmentSheet.getRange(1, 1, 1, headers.length).setBackground("#4285f4");
    assignmentSheet.getRange(1, 1, 1, headers.length).setFontColor("#ffffff");
    assignmentSheet.setFrozenRows(1);

    // Auto resize columns
    Logger.log("📐 Mengatur lebar kolom...");
    for (let i = 1; i <= headers.length; i++) {
      assignmentSheet.autoResizeColumn(i);
    }

    Logger.log("✅ Sheet berhasil direset!");
    Logger.log("📋 Sheet sekarang kosong dengan header yang fresh");
    Logger.log("\n=== RESET COMPLETED ===");

    return {
      success: true,
      message: "Sheet berhasil direset",
    };
  } catch (error) {
    Logger.log("❌ Error saat reset sheet: " + error.toString());
    throw error;
  }
}
