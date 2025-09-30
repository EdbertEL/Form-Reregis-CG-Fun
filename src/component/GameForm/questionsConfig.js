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
    question: "Kamu kuliah dimana nih? 🎓",
    type: "text",
    placeholder: "Nama universitas dan jurusan...",
    mood: "curious",
  },
  {
    id: 3,
    question: "Udah ikut CG belum? 🌟",
    type: "radio",
    options: ["Sudah dong!", "Belum nih, penasaran!"],
    mood: "excited",
  },
  {
    id: 4,
    question: "Kalau sudah, CG mana? 😊",
    type: "text",
    placeholder: "Sebutkan nama CG kamu...",
    mood: "happy",
    conditional: { questionId: 3, answer: "Sudah dong!" },
  },
  {
    id: 5,
    question: "Mau ikut acara Light Up kan? 💡",
    type: "radio",
    options: ["Pasti ikut!", "Masih mikir-mikir", "Cek jadwal dulu"],
    mood: "hopeful",
  },
  {
    id: 6,
    question: "Ada pesan untuk Team Leader Ivana? 💌",
    type: "textarea",
    placeholder: "Tulis pesan, doa, atau harapan kamu...",
    mood: "love",
  },
];

export default questionsConfig;
