const GameComplete = ({ onRestart }) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-cyan-900 flex items-center justify-center p-4">
    <div className="max-w-2xl w-full text-center">
      <div className="bg-black/95 backdrop-blur-xl rounded-sm p-6 sm:p-10 shadow-2xl pixel-border pixel-glow">
        <div className="mb-6 sm:mb-8 relative inline-block">
          {/* GIF menggantikan div animasi bounce */}
          <div className="w-24 h-24 sm:w-36 sm:h-36 rounded-none flex items-center justify-center shadow-2xl pixel-border pixel-glow overflow-hidden">
            <img
              src="/wave.gif"
              alt="Game Icon"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="absolute -top-3 -right-3 text-xl sm:text-2xl pixel-text">
            🎉
          </div>
          <div className="absolute -bottom-1 -left-3 text-lg sm:text-xl pixel-text">
            ✨
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-cyan-300 mb-4 sm:mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent pixel-text">
          Welcome Home <span className="text-white">🎉🎉🎉</span>
        </h1>
        <p className="text-base sm:text-lg text-cyan-400 mb-6 sm:mb-8 leading-relaxed pixel-text">
          Terima kasih sudah mengisi form!
          <br />
          See U at CG FUN 🛡️
        </p>
        <div className="flex justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
          {[..."✨🌟💫🎯"].map((emoji, i) => (
            <div
              key={i}
              className="text-lg sm:text-2xl animate-bounce pixel-text"
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              {emoji}
            </div>
          ))}
        </div>
        <button
          onClick={onRestart}
          className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-black text-lg font-bold rounded-sm hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-2xl pixel-border pixel-glow pixel-text"
        >
          Isi Form Lagi? 🎮
        </button>
      </div>
    </div>
  </div>
);

export default GameComplete;
