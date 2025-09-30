import React from "react";

const GameProgress = ({ current, total }) => (
  <div className="flex items-center justify-center gap-1 sm:gap-2 mb-6 sm:mb-8">
    {[...Array(total)].map((_, index) => (
      <div
        key={index}
        className={`transition-all duration-500 pixel-border ${
          index === current
            ? "w-6 sm:w-8 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-none shadow-lg pixel-glow"
            : index < current
            ? "w-2 h-2 bg-cyan-600 rounded-none shadow-md"
            : "w-2 h-2 bg-gray-700 rounded-none"
        }`}
      />
    ))}
  </div>
);

export default GameProgress;
