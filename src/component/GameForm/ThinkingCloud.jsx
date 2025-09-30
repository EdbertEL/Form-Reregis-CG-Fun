import React, { useEffect, useRef, useState } from "react";

const ThinkingCloud = ({ question, questionId }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setIsTyping(true);
    setDisplayedText("");

    if (!question) return;

    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < question.length) {
        setDisplayedText(question.substring(0, i + 1));
        i++;
      } else {
        setIsTyping(false);
        clearInterval(typingInterval);
      }
    }, 30);

    return () => {
      clearInterval(typingInterval);
    };
  }, [questionId, question]); // <-- cukup bergantung ke questionId & question

  return (
    <div className="relative flex-1 max-w-full sm:max-w-2xl w-full">
      <div className="absolute -left-2 top-6 w-3 h-3 bg-black transform rotate-45 pixel-border hidden sm:block"></div>

      <div className="bg-black/95 backdrop-blur-md p-4 sm:p-5 rounded-sm shadow-2xl border-2 border-cyan-400 relative overflow-hidden pixel-border pixel-glow">
        <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-cyan-400 to-transparent"></div>

        <div className="absolute top-2 right-3 flex gap-1">
          <div className="w-2 h-2 bg-cyan-400 rounded-none animate-pulse pixel-border"></div>
          <div
            className="w-2 h-2 bg-cyan-400 rounded-none animate-pulse pixel-border"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <div
            className="w-2 h-2 bg-cyan-400 rounded-none animate-pulse pixel-border"
            style={{ animationDelay: "0.4s" }}
          ></div>
        </div>

        <div className="relative z-10">
          <div className="min-h-[3rem] sm:min-h-[4rem] flex items-center">
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-cyan-300 leading-relaxed pixel-text">
              {displayedText}
              {isTyping && (
                <span className="inline-block w-2 h-5 sm:h-6 bg-cyan-400 ml-1 animate-pulse pixel-border"></span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThinkingCloud;
