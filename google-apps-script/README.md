# 📋 Setup Auto-Assign Kelompok untuk CG FUN

## 🎯 Fitur

- ✅ Auto-assign peserta ke kelompok secara merata (round-robin)
- ✅ Simpan data assignment ke Google Sheets terpisah untuk monitoring tim data
- ✅ Kirim email notifikasi otomatis ke email peserta (dari form submission)
- ✅ Tampilkan info kelompok di halaman GameComplete setelah submit
- ✅ Include informasi PIC kelompok

## 🔧 Setup Instructions

### Step 1: Persiapan Data Kelompok

1. **Siapkan informasi kelompok:**

   - Jumlah kelompok yang tersedia
   - Nama PIC untuk setiap kelompok

2. **Edit konfigurasi** di file `Code.gs`:
   ```javascript
   GROUPS: [
     { id: 1, name: "Kelompok 1", pic: "Nama PIC 1" },
     { id: 2, name: "Kelompok 2", pic: "Nama PIC 2" },
     { id: 3, name: "Kelompok 3", pic: "Nama PIC 3" },
     // Tambahkan semua kelompok Anda...
   ];
   ```

### Step 2: Setup Google Apps Script

1. **Buka Google Sheets Anda:**

   - URL: https://docs.google.com/spreadsheets/d/1_t4cYFOewSeIXMmqbMqSy-9cxxviW_aEJkY2lQr_pm4/edit

2. **Buka Apps Script Editor:**

   - Klik menu **Extensions** → **Apps Script**

3. **Copy paste code:**

   - Hapus code default `function myFunction()`
   - Copy paste seluruh isi file `Code.gs` dari folder ini

4. **Sesuaikan konfigurasi:**

   - Pastikan `SPREADSHEET_ID` sudah benar
   - Update data `GROUPS` dengan data kelompok yang sebenarnya

5. **Save project:**
   - Klik icon Save atau `Ctrl + S`
   - Beri nama project: "CG FUN Auto Assignment API"

### Step 3: Deploy as Web App

1. **Deploy Web App:**

   - Klik **Deploy** → **New deployment**
   - Klik icon gear ⚙️ → Pilih **Web app**
   - Isi konfigurasi:
     - **Description:** "CG FUN Assignment API v1"
     - **Execute as:** `Me (your-email@gmail.com)`
     - **Who has access:** `Anyone` (penting!)
   - Klik **Deploy**

2. **Authorize permissions:**

   - Akan muncul popup meminta authorization
   - Klik **Authorize access**
   - Pilih akun Google Anda
   - Klik **Advanced** → **Go to [Project Name] (unsafe)**
   - Klik **Allow**
   - Permissions yang dibutuhkan:
     - View and manage spreadsheets
     - Send email as you

3. **Copy Web App URL:**
   - Setelah deploy, akan muncul **Web app URL**
   - Copy URL tersebut (format: `https://script.google.com/macros/s/XXXXX/exec`)
   - ⚠️ **PENTING:** Save URL ini untuk Step 4

### Step 4: Update Frontend Configuration

1. **Buka file:** `src/App.jsx`

2. **Ganti URL API:**

   ```javascript
   // Cari baris ini (sekitar baris 30)
   const ASSIGNMENT_API_URL =
     "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec";

   // Ganti dengan Web App URL yang Anda copy di Step 3
   const ASSIGNMENT_API_URL =
     "https://script.google.com/macros/s/AKfycbxxxxx.../exec";
   ```

3. **Save file**

### Step 5: Test Functionality

#### Test Backend (Google Apps Script):

1. **Test API endpoint:**

   - Buka Web App URL di browser
   - Seharusnya muncul JSON:
     ```json
     {
       "status": "CG FUN Assignment API is running",
       "version": "1.0",
       "timestamp": "..."
     }
     ```

2. **Test assignment function:**
   - Di Apps Script Editor, pilih function `testAssignment` dari dropdown
   - Klik **Run**
   - Check Logger output (View → Logs)
   - Check Google Sheets → akan ada sheet baru "Group Assignments"
   - Check email test@example.com untuk email notifikasi

#### Test Frontend (Real submission):

1. **Run development server:**

   ```bash
   npm run dev
   ```

2. **Submit form melalui website:**

   - Isi semua pertanyaan
   - Klik "COMPLETE QUEST! 🏆"
   - Tunggu proses submission...

3. **Verify:**
   - ✅ Halaman GameComplete muncul dengan info kelompok
   - ✅ Check Google Form → data masuk ke "Form Responses 1"
   - ✅ Check Google Sheets → data masuk ke "Group Assignments"
   - ✅ Check email peserta → terima email notifikasi

### Step 6: Monitoring & Troubleshooting

#### Check Logs:

1. Di Apps Script Editor: **View** → **Executions**
2. Lihat history dan status setiap execution

#### Check Google Sheets:

1. Buka sheet "Group Assignments"
2. Monitor data assignment real-time
3. Filter/sort berdasarkan kelompok untuk melihat distribusi

#### Common Issues:

**❌ CORS Error / Network Error di Frontend:**

```
Solution: Pastikan Web App di-deploy dengan "Who has access: Anyone"
```

**❌ Email tidak terkirim:**

- Pastikan email sudah authorized
- Check Gmail quota (max 100 email/hari untuk free account)
- Pastikan email peserta valid
- Check Execution log untuk error

**❌ Data tidak masuk ke sheets:**

- Check SPREADSHEET_ID sudah benar
- Check execution log untuk error
- Pastikan permissions sudah di-authorize

**❌ Assignment tidak muncul di GameComplete:**

- Check console.log di browser untuk error
- Pastikan ASSIGNMENT_API_URL sudah benar
- Test API endpoint di browser

**❌ Assignment tidak merata:**

- Pastikan array `GROUPS` sudah benar
- Logic round-robin akan distribusi merata otomatis

## 📊 Struktur Data

### Sheet: "Form Responses 1"

Data dari Google Form (existing) - **TIDAK BERUBAH**

### Sheet: "Group Assignments" (New - Auto Created)

| Timestamp | Nama | No WA | Email | Join CG | CG Mana | Coach | Domisili | Kuliah Dimana | Kelompok ID | Nama Kelompok | PIC | Assigned At |
| --------- | ---- | ----- | ----- | ------- | ------- | ----- | -------- | ------------- | ----------- | ------------- | --- | ----------- |

**Contoh Data:**

```
2025-10-07 14:30:00 | John Doe | 081234567890 | john@example.com | Ya | CG BSD | Coach A | BSD | UPH | 1 | Kelompok 1 | Nama PIC 1 | 2025-10-07 14:30:01
```

## 📧 Email Template

Email yang dikirim include:

- **From:** Akun Google yang deploy Apps Script (otomatis)
- **Display Name:** "CG FUN - Team Leader Ivana" (customizable)
- **Header branded** dengan gradient purple
- **Nama peserta** (dari form)
- **Info kelompok:** Nama kelompok & PIC
- **Notifikasi** untuk hubungi PIC
- **Professional footer**

**Email dikirim ke:** Email yang peserta isi di form (entry.2022784761)

**Customize email sender:** Lihat [EMAIL-CONFIG.md](./EMAIL-CONFIG.md) untuk detail lengkap

## 🔄 Flow Diagram

```
User Isi Form di Website
       ↓
User Klik "COMPLETE QUEST! 🏆"
       ↓
Frontend: Submit ke 2 tempat parallel
   ├─→ Google Form (form responses)
   └─→ Assignment API (Apps Script)
       ↓
Apps Script Processing:
   1. Assign to Group (round-robin)
   2. Save to "Group Assignments" sheet
   3. Send email to peserta
   4. Return assignment data
       ↓
Frontend: Receive assignment data
       ↓
GameComplete: Display assignment info
   - Nama peserta
   - Nama kelompok
   - Nama PIC
   - Email confirmation notice
       ↓
Done! ✅
```

## 🎨 Customization

### Mengubah metode assignment:

**Random assignment:**

```javascript
function assignToGroup(formData) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  let assignmentSheet = ss.getSheetByName(CONFIG.ASSIGNMENT_SHEET_NAME);

  // Create sheet if not exists (same as before)
  if (!assignmentSheet) {
    /* ... */
  }

  // Random assignment
  const randomIndex = Math.floor(Math.random() * CONFIG.GROUPS.length);
  const assignedGroup = CONFIG.GROUPS[randomIndex];

  return {
    groupId: assignedGroup.id,
    groupName: assignedGroup.name,
    pic: assignedGroup.pic,
    assignedAt: new Date(),
  };
}
```

**By location (domisili):**

```javascript
function assignToGroup(formData) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  let assignmentSheet = ss.getSheetByName(CONFIG.ASSIGNMENT_SHEET_NAME);

  // Create sheet if not exists (same as before)
  if (!assignmentSheet) {
    /* ... */
  }

  // Logic berdasarkan domisili
  let assignedGroup;
  if (formData.domisili.includes("BSD")) {
    assignedGroup = CONFIG.GROUPS[0]; // Kelompok 1 untuk BSD
  } else if (formData.domisili.includes("Jakarta")) {
    assignedGroup = CONFIG.GROUPS[1]; // Kelompok 2 untuk Jakarta
  } else {
    // Default: round-robin untuk lokasi lain
    const lastRow = assignmentSheet.getLastRow();
    const assignmentCount = lastRow > 1 ? lastRow - 1 : 0;
    const groupIndex = assignmentCount % CONFIG.GROUPS.length;
    assignedGroup = CONFIG.GROUPS[groupIndex];
  }

  return {
    groupId: assignedGroup.id,
    groupName: assignedGroup.name,
    pic: assignedGroup.pic,
    assignedAt: new Date(),
  };
}
```

### Mengubah email template:

Edit bagian `htmlBody` di function `sendEmailNotification()`

### Menambahkan kolom di sheet:

1. Edit header array di function `assignToGroup()`
2. Edit newRow array di function `saveAssignment()`

## 📞 Support & Debugging

### Enable Detailed Logging:

```javascript
// Add to any function for debugging
Logger.log("Debug info: " + JSON.stringify(data));
```

### Check Execution History:

1. Apps Script Editor → View → Executions
2. Filter by: Status (failed/success), Date range
3. Click row untuk detail error

### Common Console Messages:

**✅ Success:**

```
Received data: {...}
Assignment saved for: John Doe
Email sent to: john@example.com
```

**❌ Error:**

```
Error in doPost: Invalid email
→ Check: Email format valid?

Error sending email: Daily limit exceeded
→ Solution: Wait 24 hours or upgrade Gmail

Error: Cannot find sheet
→ Check: SPREADSHEET_ID correct?
```

## 🚀 Production Checklist

Before going live:

- [ ] Update `GROUPS` array dengan data real
- [ ] Test dengan 5-10 form submissions
- [ ] Verify email delivery
- [ ] Check Google Sheets data accuracy
- [ ] Test assignment distribution (should be even)
- [ ] Update `ASSIGNMENT_API_URL` in production build
- [ ] Monitor first 50 submissions closely
- [ ] Setup backup/export schedule for sheets data

## 📈 Analytics & Reports

### View Assignment Distribution:

1. Open Google Sheets → "Group Assignments"
2. Create Pivot Table:
   - Row: Nama Kelompok
   - Value: COUNT of Nama
3. Insert Chart for visualization

### Export for Analysis:

- File → Download → Excel (.xlsx) or CSV

### Share with Team:

- Share sheet with "Viewer" access to tim data
- Or: File → Share → Share link (View only)

---

**Created for:** CG FUN - Team Leader Ivana  
**Version:** 2.0 (Web App API)  
**Last Updated:** October 2025  
**Tech Stack:** Google Apps Script, React, Google Sheets API
