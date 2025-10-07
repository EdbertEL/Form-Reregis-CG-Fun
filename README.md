# ✨ CG FUN - Form Re-registration with Auto Group Assignment

Interactive gamified form untuk re-registrasi CG FUN dengan fitur **auto-assignment ke kelompok** yang disertai notifikasi email dan monitoring data.

![Tech Stack](https://img.shields.io/badge/React-18-blue)
![Vite](https://img.shields.io/badge/Vite-5-purple)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-cyan)
![Google Apps Script](https://img.shields.io/badge/Apps_Script-Web_API-green)

## 🎯 Features

- ✅ **Gamified Form Experience** - RPG-style interface dengan karakter dan progress bar
- ✅ **Auto Group Assignment** - Peserta otomatis di-assign ke kelompok (round-robin distribution)
- ✅ **Email Notification** - Email konfirmasi otomatis ke peserta dengan info kelompok
- ✅ **Real-time Display** - Info kelompok langsung tampil di completion screen
- ✅ **Google Sheets Integration** - Data tersimpan untuk monitoring tim data
- ✅ **Dual Submission** - Kirim ke Google Form + Assignment API
- ✅ **Conditional Questions** - Pertanyaan dinamis berdasarkan jawaban sebelumnya
- ✅ **Responsive Design** - Mobile-friendly dengan pixel art aesthetic

## 🏗️ Architecture

```
┌──────────────┐
│   Frontend   │
│  (React App) │
└──────┬───────┘
       │ Submit Form
       ├────────────────────────────┐
       │                            │
       ▼                            ▼
┌──────────────┐          ┌─────────────────┐
│ Google Form  │          │ Apps Script API │
│ (Responses)  │          │  (Assignment)   │
└──────────────┘          └────────┬────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
                    ▼              ▼              ▼
            ┌──────────────┐  ┌────────┐  ┌──────────┐
            │ Google Sheets│  │  Gmail │  │ Frontend │
            │ (Monitoring) │  │ (Email)│  │(Display) │
            └──────────────┘  └────────┘  └──────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ & npm
- Google Account (untuk Google Sheets & Apps Script)

### Installation

1. **Clone repository:**

   ```bash
   git clone <repo-url>
   cd Form-Reregis-CG-Fun
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Setup Backend (Google Apps Script):**

   Ikuti panduan lengkap di: **[google-apps-script/QUICK-START.md](./google-apps-script/QUICK-START.md)**

   Ringkasan:

   - Edit data kelompok di `Code.gs`
   - Deploy as Web App
   - Copy Web App URL

4. **Configure Frontend:**

   **Option A - Environment Variable (Recommended):**

   ```bash
   # Copy template
   cp .env.example .env.local

   # Edit .env.local
   VITE_ASSIGNMENT_API_URL=https://script.google.com/macros/s/YOUR_ID/exec
   ```

   **Option B - Direct Edit:**
   Edit `src/App.jsx` line ~32:

   ```javascript
   const ASSIGNMENT_API_URL = "https://script.google.com/macros/s/YOUR_ID/exec";
   ```

5. **Run development server:**

   ```bash
   npm run dev
   ```

6. **Open browser:**
   ```
   http://localhost:5173
   ```

## 📁 Project Structure

```
Form-Reregis-CG-Fun/
├── src/
│   ├── App.jsx                    # Main app logic & form submission
│   ├── App.css                    # Pixel art styles
│   ├── component/
│   │   └── GameForm/
│   │       ├── GameCharacter.jsx  # Character animation
│   │       ├── GameComplete.jsx   # Completion screen + assignment info
│   │       ├── GameInput.jsx      # Form inputs
│   │       ├── GameProgress.jsx   # Progress bar
│   │       ├── ThinkingCloud.jsx  # Question bubble
│   │       └── questionsConfig.js # Form questions config
│   └── main.jsx
│
├── google-apps-script/
│   ├── Code.gs                    # Backend API (copy to Apps Script)
│   ├── README.md                  # Detailed setup guide
│   └── QUICK-START.md             # Quick reference
│
├── public/                        # Static assets
├── .env.example                   # Environment template
└── package.json
```

## 🔧 Configuration

### Form Questions

Edit `src/component/GameForm/questionsConfig.js`:

```javascript
export default [
  {
    id: 1,
    question: "What's your name?",
    type: "text",
    mood: "happy",
  },
  // ... more questions
];
```

### Google Form Mapping

Edit `src/App.jsx` - `googleFormMapping`:

```javascript
const googleFormMapping = {
  1: "entry.534010952", // Nama
  2: "entry.885744090", // No WA
  // ... map to your form entry IDs
};
```

### Group Configuration

Edit `google-apps-script/Code.gs` - `CONFIG.GROUPS`:

```javascript
GROUPS: [
  { id: 1, name: "Kelompok 1", pic: "Ivana" },
  { id: 2, name: "Kelompok 2", pic: "Sarah" },
  // ... add all groups
];
```

## 📊 Data Flow

### 1. Form Submission

```javascript
// User fills form → Clicks "COMPLETE QUEST!"
answers = {
  1: "John Doe",
  2: "081234567890",
  3: "john@example.com",
  // ...
};
```

### 2. Dual Submission

```javascript
// Parallel submissions
await Promise.all([
  submitToGoogleForm(answers), // Form responses
  submitToAssignmentAPI(answers), // Auto-assignment
]);
```

### 3. Assignment Processing (Backend)

```javascript
// Apps Script
1. Count existing assignments
2. Calculate: groupIndex = count % GROUPS.length  // Round-robin
3. Assign to group
4. Save to "Group Assignments" sheet
5. Send email to peserta
6. Return assignment data to frontend
```

### 4. Display Results

```jsx
// GameComplete component
<InfoBox>
  Nama: {assignmentData.nama}
  Kelompok: {assignmentData.groupName}
  PIC: {assignmentData.pic}
  📧 Email sent!
</InfoBox>
```

## 📧 Email Template

Peserta akan menerima email:

**Subject:** 🎉 Welcome to CG FUN - Kelompok Assignment

**Body:**

```
Hi John Doe,

Selamat datang kembali di CG FUN Team Leader Ivana! ✨

┌─────────────────────────────────┐
│  📋 Informasi Kelompok Anda     │
├─────────────────────────────────┤
│  Kelompok:  Kelompok 2          │
│  PIC:       Sarah               │
└─────────────────────────────────┘

💡 Next Steps:
Silakan hubungi PIC kelompok Anda untuk informasi lebih lanjut.

See you at CG FUN! 🛡️
```

## 🗄️ Google Sheets Structure

### Sheet: "Group Assignments"

| Timestamp | Nama | No WA | Email | Join CG | CG Mana | Coach | Domisili | Kuliah | Kelompok ID | Nama Kelompok | PIC | Assigned At |
| --------- | ---- | ----- | ----- | ------- | ------- | ----- | -------- | ------ | ----------- | ------------- | --- | ----------- |

**Tim data** bisa:

- Filter by kelompok untuk lihat member
- Sort by timestamp untuk lihat urutan registrasi
- Export to Excel untuk analisis lebih lanjut
- Create pivot table untuk visualisasi distribusi

## 🐛 Troubleshooting

### Frontend Issues

**❌ "Assignment API is not defined"**

```bash
# Solution: Set environment variable
echo "VITE_ASSIGNMENT_API_URL=your-url" >> .env.local
npm run dev
```

**❌ CORS Error**

```
Solution:
1. Redeploy Apps Script Web App
2. Set "Who has access" to "Anyone"
```

**❌ Assignment info not showing**

```javascript
// Check console
console.log("Assignment result:", assignmentResult);

// Check API response
fetch(ASSIGNMENT_API_URL)
  .then((r) => r.json())
  .then(console.log);
```

### Backend Issues

**❌ Email not sent**

```
Check:
1. Apps Script → Executions → Error details
2. Gmail quota (100/day for free)
3. Email authorization status
4. Spam folder
```

**❌ Data not in sheets**

```
Check:
1. SPREADSHEET_ID correct?
2. Permissions authorized?
3. Sheet name matches CONFIG?
```

**❌ Uneven distribution**

```
// Verify GROUPS array
Logger.log(CONFIG.GROUPS.length);  // Should match actual groups

// Check assignment logic
Logger.log('Assignment count:', assignmentCount);
Logger.log('Group index:', groupIndex);
```

## 📚 Documentation

- **[Quick Start Guide](./google-apps-script/QUICK-START.md)** - Setup dalam 5 menit
- **[Detailed README](./google-apps-script/README.md)** - Complete documentation
- **[Apps Script Code](./google-apps-script/Code.gs)** - Backend implementation

## 🎨 Customization

### Change Assignment Logic

**Random:**

```javascript
const randomIndex = Math.floor(Math.random() * CONFIG.GROUPS.length);
```

**By Location:**

```javascript
if (formData.domisili.includes("BSD")) {
  assignedGroup = CONFIG.GROUPS[0];
}
```

**By Coach:**

```javascript
const coachGroupMap = {
  "Coach A": CONFIG.GROUPS[0],
  "Coach B": CONFIG.GROUPS[1],
};
assignedGroup = coachGroupMap[formData.coach];
```

### Modify Email Template

Edit `sendEmailNotification()` in `Code.gs`:

```javascript
const htmlBody = `
  <div style="...">
    <!-- Your custom HTML -->
  </div>
`;
```

### Add Form Fields

1. Add question in `questionsConfig.js`
2. Add entry mapping in `googleFormMapping`
3. Update backend payload in `handleSubmit()`
4. Update sheet headers in `assignToGroup()`

## 🚀 Deployment

### Frontend (Vercel/Netlify)

```bash
# Build production
npm run build

# Preview
npm run preview

# Deploy
vercel deploy --prod
# or
netlify deploy --prod
```

**Important:** Set environment variable in deployment:

```
VITE_ASSIGNMENT_API_URL=https://script.google.com/macros/s/YOUR_ID/exec
```

### Backend (Apps Script)

Already deployed as Web App! No additional deployment needed.

## 📈 Analytics

### View Distribution

```javascript
// In Apps Script
function getDistribution() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.ASSIGNMENT_SHEET_NAME);

  const data = sheet.getDataRange().getValues();
  const distribution = {};

  data.slice(1).forEach((row) => {
    const groupName = row[10]; // Nama Kelompok column
    distribution[groupName] = (distribution[groupName] || 0) + 1;
  });

  Logger.log(distribution);
}
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is created for CG FUN - Team Leader Ivana.

## 👥 Team

**Project:** CG FUN Re-registration Form  
**Team Leader:** Ivana  
**Tech Stack:** React + Vite + Google Apps Script  
**Year:** 2025

---

**Need help?** Check [QUICK-START.md](./google-apps-script/QUICK-START.md) or open an issue!

**Ready to light up?** ✨ Let's go! 🚀
