import React, { useEffect, useRef } from "react";

const GameCharacter = ({ mood, questionId }) => {
  const characterRef = useRef(null);

  useEffect(() => {
    const character = characterRef.current;
    if (!character) return;

    const animateCharacter = () => {
      character.style.transform = "translateY(0px)";
      setTimeout(() => {
        character.style.transform = "translateY(-4px)";
      }, 1500);
    };

    const interval = setInterval(animateCharacter, 3000);
    animateCharacter();

    return () => clearInterval(interval);
  }, []);

  const getCharacterAsset = () => {
    const assets = {
      greeting: "🤗",
      curious: "🤔",
      excited: "😆",
      friendly: "😊",
      interested: "🧐",
      happy: "😄",
      hopeful: "🌟",
      love: "💝",
      default: "👾",
    };
    return assets[mood] || assets.default;
  };

  return (
    <div className="relative">
      <div
        ref={characterRef}
        className="relative w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center transition-all duration-1000 ease-in-out pixelated"
        style={{ imageRendering: "pixelated" }}
      >
        <div className="relative z-10 text-5xl sm:text-6xl pixel-text">
          {getCharacterAsset()}
        </div>
        <div className="absolute inset-0 rounded-sm bg-cyan-400/40 blur-md pixel-glow"></div>
      </div>

      <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-900 to-cyan-500 text-gray-200 px-2 sm:px-3 py-1 rounded-sm shadow-lg pixel-border pixel-glow">
        <p className="text-[10px] sm:text-xs font-bold whitespace-nowrap pixel-text">
          Light Buddy
        </p>
      </div>
    </div>
  );
};

export default GameCharacter;
