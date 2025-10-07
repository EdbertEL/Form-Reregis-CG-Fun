const GameComplete = ({ onRestart, assignmentData }) => (
  <div
    className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-cyan-900 flex items-center justify-center p-4"
    style={{
      backgroundImage: `linear-gradient(rgba(17, 24, 39, 0.85), rgba(6, 78, 128, 0.85)), url('/foto.jpg')`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    }}
  >
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

        <h1 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-gray-400 to-gray-200 bg-clip-text text-transparent pixel-text">
          Welcome Home <span className="text-white">🎉🎉🎉</span>
        </h1>

        {/* Info Kelompok Assignment */}
        {assignmentData ? (
          <div className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 backdrop-blur-sm rounded-sm p-4 sm:p-6 mb-6 border-2 border-cyan-400/50 pixel-border">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-300 mb-4 pixel-text">
              📋 Informasi Kelompok Kamu
            </h2>
            <div className="space-y-3 text-left">
              <div className="flex justify-between items-center border-b border-cyan-400/30 pb-2">
                <span className="text-gray-300 pixel-text">Nama:</span>
                <span className="text-gray-200 font-bold pixel-text">
                  {assignmentData.nama}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-cyan-400/30 pb-2">
                <span className="text-gray-300 pixel-text">Kelompok:</span>
                <span className="text-gray-200 font-bold pixel-text">
                  {assignmentData.groupName}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 pixel-text">PIC:</span>
                <span className="text-gray-200 font-bold pixel-text">
                  {assignmentData.pic}
                </span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-900/30 rounded-sm border border-cyan-400/20">
              <p className="text-sm text-gray-200 pixel-text">
                📧 Email konfirmasi sudah dikirim ke inbox kamu ya...!
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-900/30 backdrop-blur-sm rounded-sm p-4 mb-6 border border-yellow-400/50">
            <p className="text-yellow-300 text-sm pixel-text">
              ⚠️ Sedang memproses assignment kelompok...
            </p>
          </div>
        )}

        <p className="text-base sm:text-lg text-gray-200 mb-6 sm:mb-8 leading-relaxed pixel-text">
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
          className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-gray-800 text-lg font-bold rounded-sm hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-2xl pixel-border pixel-glow pixel-text"
        >
          Isi Form Lagi? 🎮
        </button>
      </div>
    </div>
  </div>
);

export default GameComplete;
