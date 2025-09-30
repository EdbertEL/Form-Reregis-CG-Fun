import React, { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react";
import questionsConfig from "./component/GameForm/questionsConfig";
import GameCharacter from "./component/GameForm/GameCharacter";
import ThinkingCloud from "./component/GameForm/ThinkingCloud";
import GameInput from "./component/GameForm/GameInput";
import GameProgress from "./component/GameForm/GameProgress";
import GameComplete from "./component/GameForm/GameComplete";
import "./App.css";

const googleFormMapping = {
  1: "entry.534010952", // Nama (id 1)
  2: "entry.1783134984", // Kampus (id 2)
  3: "entry.400217152", // Udah ikut CG? (id 3)
  4: "entry.885744090", // CG mana (id 4)
  5: "entry.11659136", // Ikut Light Up? (id 5)
  // 6: "entry.2079430505", // Pesan (id 6)
};

const App = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isComplete, setIsComplete] = useState(false);
  const [visibleQuestions, setVisibleQuestions] = useState([]);

  const [isMuted, setIsMuted] = useState(false);
  const [audioStarted, setAudioStarted] = useState(false); // ✅ fix: tambahkan state ini
  const audioRef = useRef(null);

  // Filter pertanyaan dengan conditional
  useEffect(() => {
    const filtered = questionsConfig.filter((q) => {
      if (!q.conditional) return true;
      const conditionalAnswer = answers[q.conditional.questionId];
      return conditionalAnswer === q.conditional.answer;
    });
    setVisibleQuestions(filtered);
  }, [answers]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.05; // atur volume
    }
  }, []);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(audioRef.current.muted);
    }
  };

  const startAudio = () => {
    if (audioRef.current && !audioStarted) {
      audioRef.current.play().catch((err) => {
        console.log("Autoplay diblokir, harus klik dulu:", err);
      });
      setAudioStarted(true);
    }
  };

  const handleAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentQuestion < visibleQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    const googleFormURL =
      "https://docs.google.com/forms/u/0/d/e/1FAIpQLSeXYTBSk-VnGxBYHXnITWwAHY47gLfi7yTTM13q7HvdZ6D_vQ/formResponse";

    const formData = new FormData();

    // Mapping ke Google Form field
    Object.keys(answers).forEach((qId) => {
      const entryId = googleFormMapping[qId];
      if (entryId) {
        formData.append(entryId, answers[qId]);
      }
    });

    try {
      await fetch(googleFormURL, {
        method: "POST",
        mode: "no-cors", // penting! Google Form tidak mengembalikan CORS headers
        body: formData,
      });

      setIsComplete(true);
      console.log("Submitted to Google Form:", answers);
    } catch (err) {
      console.error("Error submitting form", err);
    }
  };

  const handleRestart = () => {
    setIsComplete(false);
    setCurrentQuestion(0);
    setAnswers({});
  };

  const currentQ = visibleQuestions[currentQuestion];
  const canProceed = currentQ && answers[currentQ.id];

  if (isComplete) return <GameComplete onRestart={handleRestart} />;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-3 sm:p-4 relative overflow-hidden"
      onClick={startAudio} // ✅ mulai musik saat user klik
      style={{
        backgroundImage: `linear-gradient(rgba(17, 24, 39, 0.85), rgba(6, 78, 128, 0.85)), url('/foto.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* BACKSOUND */}
      <audio ref={audioRef} loop>
        <source src="/backsound.mp3" type="audio/mpeg" />
      </audio>

      {/* Tombol kontrol musik */}
      <button
        onClick={toggleMute}
        className="absolute top-4 right-4 bg-black/60 p-2 rounded-full text-cyan-300 hover:bg-black/80 transition"
      >
        {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
      </button>

      <div className="max-w-6xl w-full relative z-10">
        {/* Judul */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-cyan-300 mb-2 sm:mb-4 pixel-text pixel-glow">
            ✨ LIGHT UP ✨
          </h1>
          <p className="text-cyan-500 text-sm sm:text-lg font-medium pixel-text">
            CG FUN Team Leader Ivana
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8 sm:mb-12">
          <GameProgress
            current={currentQuestion}
            total={visibleQuestions.length}
          />
        </div>

        {/* Karakter + Pertanyaan */}
        <div className="space-y-6 sm:space-y-10">
          <div className="flex flex-col md:flex-row items-center gap-12 sm:gap-6 justify-center">
            <GameCharacter mood={currentQ?.mood} questionId={currentQ?.id} />
            <ThinkingCloud
              question={currentQ?.question}
              questionId={currentQ?.id}
            />
          </div>

          {/* Input Jawaban */}
          <div className="bg-black/80 backdrop-blur-md rounded-sm p-4 sm:p-6 border-2 border-cyan-400/50 shadow-2xl pixel-border pixel-glow">
            {currentQ && (
              <GameInput
                data={currentQ}
                value={answers[currentQ.id]}
                onChange={handleAnswer}
              />
            )}

            {/* Tombol navigasi */}
            <div className="flex justify-between mt-6 md:mt-8 gap-4">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className={`px-5 py-2 md:px-6 md:py-3 rounded-sm font-bold transition-all duration-300 
    flex items-center gap-2 pixel-border pixel-text 
    ${
      currentQuestion === 0
        ? "bg-gray-800/50 text-gray-200 cursor-not-allowed"
        : "bg-cyan-900/50 text-cyan-300 hover:bg-cyan-800/50 transform hover:scale-105 shadow-lg pixel-glow"
    }`}
              >
                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" /> PREVIOUS
              </button>

              <button
                onClick={handleNext}
                disabled={!canProceed}
                className={`px-5 py-2 md:px-6 md:py-3 rounded-sm font-bold transition-all duration-300 
    flex items-center gap-2 pixel-border pixel-text 
    ${
      !canProceed
        ? "bg-gray-800/50 text-gray-200 cursor-not-allowed"
        : "bg-gradient-to-r from-cyan-500 to-blue-600 text-gray-700 hover:from-cyan-600 hover:to-blue-700 transform hover:scale-105 shadow-2xl pixel-glow"
    }`}
              >
                {currentQuestion === visibleQuestions.length - 1
                  ? "COMPLETE QUEST! 🏆"
                  : "NEXT LEVEL"}
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 sm:mt-10">
          <p className="text-cyan-500/80 text-xs sm:text-base font-medium italic pixel-text">
            "WELCOME HOME" 🌟
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;
