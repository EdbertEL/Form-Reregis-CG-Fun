import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import questionsConfig from "./component/GameForm/questionsConfig";
import GameCharacter from "./component/GameForm/GameCharacter";
import ThinkingCloud from "./component/GameForm/ThinkingCloud";
import GameInput from "./component/GameForm/GameInput";
import GameProgress from "./component/GameForm/GameProgress";
import GameComplete from "./component/GameForm/GameComplete";
import "./App.css";

const googleFormMapping = {
  1: "entry.534010952", // Nama (id 1)
  2: "entry.885744090", // No WA (id 2)
  3: "entry.2022784761", // Email (id 3)
  4: "entry.1783134984", // Join CG (id 4)
  5: "entry.400217152", // CG Mana? (id 5)
  6: "entry.2113108464", // Coach mana? (id 6)
  7: "entry.11659136", // Domisili (id 7)
  8: "entry.11659136.other_option_response", // Daerah untuk "Lainnya" (id 8)
  9: "entry.2079430505", // Kuliah Dimana? (id 9)
};

const App = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isComplete, setIsComplete] = useState(false);
  const [visibleQuestions, setVisibleQuestions] = useState([]);

  // Filter pertanyaan dengan conditional
  useEffect(() => {
    const filtered = questionsConfig.filter((q) => {
      if (!q.conditional) return true;
      const conditionalAnswer = answers[q.conditional.questionId];
      return conditionalAnswer === q.conditional.answer;
    });
    setVisibleQuestions(filtered);

    // Reset ke pertanyaan terakhir yang valid jika currentQuestion melebihi panjang array
    if (currentQuestion >= filtered.length && filtered.length > 0) {
      setCurrentQuestion(filtered.length - 1);
    }
  }, [answers, currentQuestion]);

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
      "https://docs.google.com/forms/d/e/1FAIpQLSef3YKIBgsw2GPdgE0Nr3bir3UtUlc0qdNkzgBDiX6xs4nVmA/formResponse";

    const formData = new FormData();

    // Mapping ke Google Form field
    Object.keys(answers).forEach((qId) => {
      const entryId = googleFormMapping[qId];
      const question = questionsConfig.find((q) => q.id === parseInt(qId));

      if (entryId) {
        // Handle pertanyaan "Lainnya" dengan benar
        if (parseInt(qId) === 7) {
          // Pertanyaan 8 adalah "other option" dari pertanyaan 7
          // Kirim "__other_option__" untuk pertanyaan 7
          formData.append("entry.11659136", "__other_option__");
          // Kirim nilai sebenarnya ke other_option_response
          formData.append("entry.11659136.other_option_response", answers[qId]);
        } else if (parseInt(qId) === 7 && answers[qId] === "Lainnya") {
          // Jika user pilih "Lainnya" di pertanyaan 7
          // Tapi jawaban sebenarnya ada di pertanyaan 7, jadi skip dulu
          if (!answers[7]) {
            // Kalau belum ada jawaban di pertanyaan 7, kirim "Lainnya"
            formData.append(entryId, answers[qId]);
          }
        } else {
          // Pertanyaan biasa
          formData.append(entryId, answers[qId]);
        }
      }
    });

    try {
      await fetch(googleFormURL, {
        method: "POST",
        mode: "no-cors",
        body: formData,
      });

      setIsComplete(true);
      console.log("Submitted to Google Form:", answers);
      console.log("FormData entries:", Array.from(formData.entries()));
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

  // Cek apakah ada pertanyaan conditional yang bergantung pada pertanyaan saat ini
  const hasConditionalQuestions = questionsConfig.some(
    (q) => q.conditional && q.conditional.questionId === currentQ?.id
  );

  // Tentukan apakah ini pertanyaan terakhir
  const isLastQuestion =
    currentQuestion === visibleQuestions.length - 1 && !hasConditionalQuestions;

  if (isComplete) return <GameComplete onRestart={handleRestart} />;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-3 sm:p-4 relative overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(17, 24, 39, 0.85), rgba(6, 78, 128, 0.85)), url('/foto.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="max-w-6xl w-full relative z-10">
        {/* Judul */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-100 mb-2 sm:mb-4 pixel-text pixel-glow">
            ✨ LIGHT UP ✨
          </h1>
          <p className="text-gray-100 text-sm sm:text-lg font-medium pixel-text">
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
        : "bg-gradient-to-r from-cyan-500 to-blue-600 text-cyan-800 hover:from-cyan-600 hover:to-blue-700 transform hover:scale-105 shadow-2xl pixel-glow"
    }`}
              >
                {isLastQuestion ? "COMPLETE QUEST! 🏆" : "NEXT LEVEL"}
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
