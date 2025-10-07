// KONFIGURASI - Sesuaikan dengan data Anda
const CONFIG = {
  // ID spreadsheet Anda (dari URL)
  SPREADSHEET_ID: "1_t4cYFOewSeIXMmqbMqSy-9cxxviW_aEJkY2lQr_pm4",

  // Nama sheet untuk assignment
  ASSIGNMENT_SHEET_NAME: "Pembagian Kelompok", // Nama sheet untuk assignment

  // Data Kelompok - Sesuaikan dengan kelompok Anda
  GROUPS: [
    { id: 1, name: "Kelompok 1", pic: "Nama PIC 1" },
    { id: 2, name: "Kelompok 2", pic: "Nama PIC 2" },
    { id: 3, name: "Kelompok 3", pic: "Nama PIC 3" },
    { id: 4, name: "Kelompok 4", pic: "Nama PIC 4" },
    { id: 5, name: "Kelompok 5", pic: "Nama PIC 5" },
  ],

  // Email template
  EMAIL_SUBJECT: "🎉 Welcome to CG FUN - Kelompok Assignment",
};

/**
 * Handle POST request dari frontend
 * Endpoint untuk assign kelompok
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

    // Assign ke kelompok
    const assignment = assignToGroup(data);

    // Simpan ke sheet assignment
    saveAssignment(data, assignment);

    // Kirim email notifikasi (menggunakan email dari form submission)
    sendEmailNotification(data, assignment);

    // Return assignment info ke frontend
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
 */
function doGet(e) {
  try {
    // Check if this is an assignment request
    if (e.parameter && e.parameter.nama && e.parameter.email) {
      const data = e.parameter;

      Logger.log("Received GET data: " + JSON.stringify(data));

      // Assign ke kelompok
      const assignment = assignToGroup(data);

      // Simpan ke sheet assignment
      saveAssignment(data, assignment);

      // Kirim email notifikasi
      sendEmailNotification(data, assignment);

      // Return assignment info
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
        version: "1.5",
        timestamp: new Date().toISOString(),
        message: "Send GET request with parameters or POST request to assign",
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log("Error in doGet: " + error.toString());

    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        error: error.toString(),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Assign peserta ke kelompok secara round-robin
 * (distribusi merata ke semua kelompok)
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
 */
function sendEmailNotification(formData, assignment) {
  // Gunakan email dari form submission
  const recipientEmail = formData.email;

  if (!recipientEmail) {
    Logger.log("No email provided, skipping email notification");
    return;
  }

  const subject = CONFIG.EMAIL_SUBJECT;

  // HTML email template
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">🎉 Welcome to CG FUN! 🎉</h1>
      </div>
      
      <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; color: #333;">Hi <strong>${
          formData.nama
        }</strong>,</p>
        
        <p style="font-size: 16px; color: #333;">
          Selamat datang kembali di <strong>CG FUN</strong> Team Leader Ivana! ✨
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
          <h2 style="color: #667eea; margin-top: 0;">📋 Informasi Kelompok Anda</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #666;">Kelompok:</td>
              <td style="padding: 10px 0; font-weight: bold; color: #333;">${
                assignment.groupName
              }</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #666;">PIC (Person in Charge):</td>
              <td style="padding: 10px 0; font-weight: bold; color: #333;">${
                assignment.pic
              }</td>
            </tr>
          </table>
        </div>
        
        <div style="background: #e8f4f8; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #0066cc;">
            💡 <strong>Next Steps:</strong><br>
            Silakan hubungi PIC kelompok Anda untuk informasi lebih lanjut tentang jadwal dan kegiatan CG FUN.
          </p>
        </div>
        
        <p style="font-size: 14px; color: #666; margin-top: 30px;">
          Jika ada pertanyaan, jangan ragu untuk menghubungi kami.<br>
          See you at CG FUN! 🛡️
        </p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #999; text-align: center;">
          © ${new Date().getFullYear()} CG FUN - Team Leader Ivana<br>
          Email ini dikirim otomatis, mohon tidak membalas email ini.
        </p>
      </div>
    </div>
  `;

  // Plain text fallback
  const plainBody = `
    Hi ${formData.nama},
    
    Selamat datang kembali di CG FUN Team Leader Ivana! ✨
    
    INFORMASI KELOMPOK ANDA:
    - Kelompok: ${assignment.groupName}
    - PIC: ${assignment.pic}
    
    Silakan hubungi PIC kelompok Anda untuk informasi lebih lanjut.
    
    See you at CG FUN! 🛡️
    
    ---
    CG FUN - Team Leader Ivana
  `;

  try {
    MailApp.sendEmail({
      to: recipientEmail,
      subject: subject,
      body: plainBody,
      htmlBody: htmlBody,
      name: "CG FUN - Team Leader Ivana",
    });
    Logger.log("Email sent to: " + recipientEmail);
  } catch (error) {
    Logger.log("Error sending email: " + error.toString());
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
