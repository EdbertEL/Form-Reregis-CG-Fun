import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

const GameInput = ({ data, value, onChange }) => {
  const inputRef = useRef(null);
  const hasFocused = useRef(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!hasFocused.current && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
        hasFocused.current = true;
      }, 800);
    }
  }, [data.id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    onChange(data.id, e.target.value);
  };

  const handleRadioChange = (option) => {
    onChange(data.id, option);
  };

  const handleChoiceChange = (option) => {
    onChange(data.id, option);
    setIsOpen(false);
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

      {/* Custom Dropdown untuk type "choice" */}
      {data.type === "choice" && (
        <div className="relative mb-4" ref={dropdownRef}>
          {/* Dropdown Button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full px-4 py-3 sm:py-4 pr-12 bg-black/90 backdrop-blur-sm border-2 border-cyan-400 rounded-sm text-base sm:text-lg text-cyan-300 focus:outline-none focus:border-cyan-300 shadow-lg pixel-border pixel-glow pixel-text text-left transition-all"
          >
            {value || "-- Pilih Coach Kamu --"}
            <ChevronDown
              className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown Menu - Always opens downward */}
          {isOpen && (
            <div className="absolute z-50 w-full mt-2 bg-black/95 backdrop-blur-sm border-2 border-cyan-400 rounded-sm shadow-2xl pixel-border max-h-36 sm:max-h-48 overflow-y-auto">
              {data.options.map((option, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleChoiceChange(option)}
                  className={`w-full px-3 py-2 text-left text-sm pixel-text transition-all ${
                    value === option
                      ? "bg-cyan-900/40 text-cyan-300 font-bold"
                      : "text-cyan-400 hover:bg-cyan-900/20 hover:text-cyan-300"
                  }`}
                >
                  {value === option && (
                    <span className="mr-2 text-cyan-400">✓</span>
                  )}
                  {option}
                </button>
              ))}
            </div>
          )}

          {/* Checkmark indicator saat sudah memilih */}
          {value && !isOpen && (
            <div className="mt-4 flex items-center gap-2 text-cyan-400 text-sm sm:text-base pixel-text bg-cyan-900/20 border border-cyan-500/30 rounded-sm p-3 pixel-border">
              <span className="text-lg">✓</span>
              <span>
                Kamu memilih: <strong className="text-cyan-300">{value}</strong>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GameInput;
