// src/components/GameForm/questionsConfig.js
const questionsConfig = [
  {
    id: 1,
    question: "Halo! Siapa nama kamu? 👋",
    type: "text",
    placeholder: "Tulis nama lengkap kamu di sini...",
    mood: "greeting",
  },
  {
    id: 2,
    question: "Udah join CG belum nih? 🌟",
    type: "radio",
    options: ["Udah dong! 🎉", "Belum nih, penasaran! 🤔"],
    mood: "excited",
  },
  // Pertanyaan untuk yang SUDAH join CG
  {
    id: 3,
    question: "Wah asik! Dari CG mana kamu? 🏠",
    type: "text",
    placeholder: "Contoh: CG-101 (Jika coach isi 'Coach')",
    mood: "happy",
    conditional: { questionId: 2, answer: "Udah dong! 🎉" },
  },
  {
    id: 4,
    question: "Siapa Coach/Penggembalaan kamu? 😊",
    type: "choice", // 👈 Ubah menjadi "choice"
    options: [
      "Coach Nael",
      "Coach Alvin",
      "Coach Debora",
      "Coach Erick",
      "Coach Kebob",
      "Coach Keycia",
      "Coach Levi",
      "Coach Mike",
      "Coach Nicholas",
      "Coach Shella",
      "Coach Vebry",
    ],
    mood: "curious",
    conditional: { questionId: 2, answer: "Udah dong! 🎉" },
  },
  // Pertanyaan untuk yang BELUM join CG
  {
    id: 5,
    question: "Boleh minta nomor WA kamu? 📱",
    type: "text",
    placeholder: "Contoh: 08776655xxxx...",
    mood: "friendly",
    conditional: { questionId: 2, answer: "Belum nih, penasaran! 🤔" },
  },
  {
    id: 6,
    question: "Kamu tinggal di daerah mana? 📍",
    type: "radio",
    options: ["Gading Serpong", "BSD", "Lainnya"],
    mood: "curious",
    conditional: { questionId: 2, answer: "Belum nih, penasaran! 🤔" },
  },
  {
    id: 7,
    question: "Boleh tau daerah kamu dimana? 📍",
    type: "text",
    placeholder: "Tulis daerah domisili kamu...",
    mood: "curious",
    conditional: { questionId: 6, answer: "Lainnya" },
    isOtherOption: true, // 👈 Tambahkan ini
    parentEntry: "entry.11659136", // 👈 Dan ini (entry ID dari pertanyaan 6)
  },
  {
    id: 8,
    question: "Kuliah dimana sekarang? 🎓",
    type: "text",
    placeholder: "Nama universitas dan jurusan...",
    mood: "interested",
    conditional: { questionId: 2, answer: "Belum nih, penasaran! 🤔" },
  },
];

export default questionsConfig;
