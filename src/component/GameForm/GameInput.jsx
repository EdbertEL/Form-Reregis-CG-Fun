import React, { useState, useEffect, useRef } from "react";

const GameInput = ({ data, value, onChange }) => {
  const inputRef = useRef(null);
  const hasFocused = useRef(false);

  useEffect(() => {
    if (!hasFocused.current && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
        hasFocused.current = true;
      }, 800);
    }
  }, [data.id]);

  const handleInputChange = (e) => {
    onChange(data.id, e.target.value);
  };

  const handleRadioChange = (option) => {
    onChange(data.id, option);
  };

  const inputClasses =
    "w-full px-4 py-3 bg-black/90 backdrop-blur-sm border-2 border-cyan-400 rounded-sm text-base text-cyan-300 placeholder:text-cyan-400/80 focus:outline-none focus:border-cyan-300 shadow-lg pixel-border pixel-glow pixel-text";

  return (
    <div className="w-full max-w-full sm:max-w-2xl mx-auto">
      {data.type === "text" && (
        <input
          ref={inputRef}
          type="text"
          placeholder={data.placeholder}
          value={value || ""}
          onChange={handleInputChange}
          className={inputClasses}
        />
      )}

      {data.type === "textarea" && (
        <textarea
          ref={inputRef}
          placeholder={data.placeholder}
          value={value || ""}
          onChange={handleInputChange}
          rows="3"
          className={`${inputClasses} resize-none`}
        />
      )}

      {data.type === "radio" && (
        <div className="space-y-2">
          {data.options.map((option, index) => (
            <label
              key={index}
              className={`flex items-center p-3 sm:p-4 bg-black/90 backdrop-blur-sm border-2 rounded-sm cursor-pointer transition-all pixel-border ${
                value === option
                  ? "border-cyan-400 bg-cyan-900/30 shadow-md pixel-glow"
                  : "border-cyan-600 hover:border-cyan-400"
              }`}
            >
              <input
                type="radio"
                name={`question-${data.id}`}
                value={option}
                checked={value === option}
                onChange={() => handleRadioChange(option)}
                className="sr-only"
              />
              <div
                className={`w-4 h-4 sm:w-5 sm:h-5 rounded-none border-2 mr-2 sm:mr-3 flex items-center justify-center pixel-border ${
                  value === option
                    ? "border-cyan-400 bg-cyan-400"
                    : "border-cyan-600"
                }`}
              >
                {value === option && (
                  <div className="w-2 h-2 bg-black pixel-border"></div>
                )}
              </div>
              <span
                className={`text-sm sm:text-base font-medium pixel-text ${
                  value === option ? "text-cyan-300" : "text-cyan-400"
                }`}
              >
                {option}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default GameInput;
