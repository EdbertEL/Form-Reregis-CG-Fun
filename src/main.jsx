import { StrictMode, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Volume2, VolumeX } from "lucide-react";
import "./index.css";
import App from "./App";

// Wrapper untuk audio global
function AppWithAudio() {
  const [isMuted, setIsMuted] = useState(false);
  const [audioStarted, setAudioStarted] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.02;
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

  return (
    <div onClick={startAudio}>
      {/* Audio Global */}
      <audio ref={audioRef} loop>
        <source src="/backsound.mp3" type="audio/mpeg" />
      </audio>

      {/* Tombol Mute */}
      <button
        onClick={toggleMute}
        className="fixed top-4 right-4 bg-black/60 p-2 rounded-full text-cyan-300 hover:bg-black/80 transition z-[9999]"
      >
        {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
      </button>

      {/* App Component */}
      <App />
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppWithAudio />
  </StrictMode>
);
