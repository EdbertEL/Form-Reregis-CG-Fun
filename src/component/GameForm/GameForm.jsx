const GameForm = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isComplete, setIsComplete] = useState(false);
  const [visibleQuestions, setVisibleQuestions] = useState([]);

  useEffect(() => {
    const filtered = questionsConfig.filter((q) => {
      if (!q.conditional) return true;
      const conditionalAnswer = answers[q.conditional.questionId];
      return conditionalAnswer === q.conditional.answer;
    });
    setVisibleQuestions(filtered);
  }, [answers[3]]);

  useEffect(() => {
    setVisibleQuestions(questionsConfig.filter((q) => !q.conditional));
  }, []);

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

  const handleSubmit = () => {
    setIsComplete(true);
    console.log("Form submitted:", answers);
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
      style={{
        backgroundImage: `linear-gradient(
          rgba(17, 24, 39, 0.85),   /* gelap */
          rgba(6, 78, 128, 0.85)   /* biru */
        ), url('/src/assets/foto.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Background Effects dengan Pixel Style */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-40 sm:w-64 h-40 sm:h-64 bg-cyan-400/10 rounded-none blur-2xl animate-pulse pixel-border"></div>
        <div
          className="absolute bottom-1/3 right-1/4 w-52 sm:w-80 h-52 sm:h-80 bg-blue-500/10 rounded-none blur-2xl animate-pulse pixel-border"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 right-1/3 w-40 sm:w-56 h-40 sm:h-56 bg-cyan-300/10 rounded-none blur-2xl animate-pulse pixel-border"
          style={{ animationDelay: "4s" }}
        ></div>

        {/* Grid Pixel Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
          }}
        ></div>
      </div>

      <div className="max-w-6xl w-full relative z-10">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-cyan-300 mb-2 sm:mb-4 pixel-text pixel-glow">
            ✨ LIGHT UP ✨
          </h1>
          <p className="text-cyan-500 text-sm sm:text-lg font-medium pixel-text">
            CG FUN Team Leader Ivana
          </p>
        </div>

        <div className="mb-8 sm:mb-12">
          <GameProgress
            current={currentQuestion}
            total={visibleQuestions.length}
          />
        </div>

        <div className="space-y-6 sm:space-y-10">
          <div className="flex flex-col md:flex-row items-center gap-12 sm:gap-6 justify-center">
            <GameCharacter mood={currentQ?.mood} questionId={currentQ?.id} />
            <ThinkingCloud
              question={currentQ?.question}
              questionId={currentQ?.id}
            />
          </div>

          <div className="bg-black/80 backdrop-blur-md rounded-sm p-4 sm:p-6 border-2 border-cyan-400/50 shadow-2xl pixel-border pixel-glow">
            {currentQ && (
              <GameInput
                data={currentQ}
                value={answers[currentQ.id]}
                onChange={handleAnswer}
              />
            )}

            <div className="flex justify-between mt-6 md:mt-8 gap-4">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className={`px-5 py-2 md:px-6 md:py-3 rounded-sm font-bold transition-all duration-300 flex items-center gap-2 pixel-border pixel-text ${
                  currentQuestion === 0
                    ? "bg-gray-800/50 text-gray-500 cursor-not-allowed"
                    : "bg-cyan-900/50 text-cyan-300 hover:bg-cyan-800/50 transform hover:scale-105 shadow-lg pixel-glow"
                }`}
              >
                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                PREVIOUS
              </button>

              <button
                onClick={handleNext}
                disabled={!canProceed}
                className={`px-5 py-2 md:px-6 md:py-3 rounded-sm font-bold transition-all duration-300 flex items-center gap-2 pixel-border pixel-text ${
                  !canProceed
                    ? "bg-gray-800/50 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-cyan-500 to-blue-600 text-black hover:from-cyan-600 hover:to-blue-700 transform hover:scale-105 shadow-2xl pixel-glow"
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

        <div className="text-center mt-6 sm:mt-10">
          <p className="text-cyan-500/80 text-xs sm:text-base font-medium italic pixel-text">
            "WELCOME HOME" 🌟
          </p>
        </div>
      </div>

      {/* Tambahkan style CSS untuk efek pixelated */}
      <style jsx>{`
        .pixel-text {
          font-family: "Courier New", monospace;
          text-shadow: 0 0 5px #00ffff, 0 0 10px #00ffff;
        }

        .pixel-border {
          border-style: solid;
          image-rendering: pixelated;
        }

        .pixel-glow {
          box-shadow: 0 0 5px #00ffff, 0 0 10px #00ffff, inset 0 0 5px #00ffff;
        }

        .pixelated {
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
        }
      `}</style>
    </div>
  );
};

export default GameForm;
