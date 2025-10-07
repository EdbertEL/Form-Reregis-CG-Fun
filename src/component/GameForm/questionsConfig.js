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
    question: "Boleh minta nomor WA kamu? 📱",
    type: "text",
    placeholder: "Contoh: 08776655xxxx...",
    mood: "friendly",
  },
    {
    id: 3,
    question: "Boleh minta email kamu? 📩",
    type: "text",
    placeholder: "Contoh: encounterthelight@gmail.com",
    mood: "default",
  },
  {
    id: 4,
    question: "Udah join CG belum nih? 🌟",
    type: "radio",
    options: ["Udah dong! 🎉", "Belum nih, penasaran! 🤔"],
    mood: "excited",
  },
  // Pertanyaan untuk yang SUDAH join CG
  {
    id: 5,
    question: "Wah asik! Dari CG mana kamu? 🏠",
    type: "text",
    placeholder: "Contoh: CG 101 / 'Coach' (untuk coach)",
    mood: "happy",
    conditional: { questionId: 4, answer: "Udah dong! 🎉" },
  },
  {
    id: 6,
    question: "Siapa Coach/Penggembalaan kamu? 😊",
    type: "choice",
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
    conditional: { questionId: 4, answer: "Udah dong! 🎉" },
  },
  // Pertanyaan untuk yang BELUM join CG
  {
    id: 7,
    question: "Kamu tinggal di daerah mana? 📍",
    type: "radio",
    options: ["Gading Serpong", "BSD", "Lainnya"],
    mood: "curious",
    conditional: { questionId: 4, answer: "Belum nih, penasaran! 🤔" },
  },
  {
    id: 8,
    question: "Boleh tau daerah kamu dimana? 📍",
    type: "text",
    placeholder: "Tulis daerah domisili kamu...",
    mood: "curious",
    conditional: { questionId: 7, answer: "Lainnya" },
    isOtherOption: true,
    parentEntry: "entry.123821330",
  },
  {
    id: 9,
    question: "Kuliah dimana sekarang? 🎓",
    type: "text",
    placeholder: "Contoh: UMN / Prasmul / Atmajaya...",
    mood: "interested",
    conditional: { questionId: 4, answer: "Belum nih, penasaran! 🤔" },
  },
];

export default questionsConfig;
