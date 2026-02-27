import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const TRACKS = [
  {
    title: "Midnight Study",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    author: "SoundHelix"
  },
  {
    title: "Campus Rain",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    author: "SoundHelix"
  }
];

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [showPlayer, setShowPlayer] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    const startAudio = async () => {
      if (audioRef.current) {
        try {
          await audioRef.current.play();
          setIsBlocked(false);
          setIsPlaying(true);
        } catch (err) {
          console.log("Autoplay blocked, waiting for interaction");
          setIsBlocked(true);
        }
      }
    };

    const handleFirstInteraction = () => {
      startAudio();
      window.removeEventListener('mousedown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    window.addEventListener('mousedown', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    // Initial attempt
    startAudio();

    return () => {
      window.removeEventListener('mousedown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [currentTrackIndex]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsBlocked(true));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <AnimatePresence>
        {showPlayer && (
          <motion.div
            initial={{ opacity: 0, x: -20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.9 }}
            className="mb-4 p-4 bg-brand-card border border-brand-border rounded-2xl shadow-2xl w-64 glass"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-brand-accent/20 flex items-center justify-center animate-pulse">
                <Music className="w-5 h-5 text-brand-accent" />
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-white truncate">{currentTrack.title}</div>
                <div className="text-[10px] text-slate-500 truncate">Ambient Study Beats</div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlay}
                  className="p-2 bg-brand-accent hover:bg-blue-600 text-white rounded-full transition-all"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={nextTrack}
                  className="text-[10px] font-bold text-slate-400 hover:text-white transition-colors"
                >
                  Next Track
                </button>
              </div>
              <button
                onClick={toggleMute}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
            
            <audio
              ref={audioRef}
              src={currentTrack.url}
              onEnded={nextTrack}
              loop={TRACKS.length === 1}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setShowPlayer(!showPlayer)}
        className={`p-4 rounded-full shadow-xl transition-all flex items-center justify-center group relative ${
          showPlayer ? 'bg-brand-accent text-white' : 'bg-brand-card border border-brand-border text-slate-400 hover:text-white'
        }`}
      >
        <Music className={`w-6 h-6 ${isPlaying && !isMuted ? 'animate-bounce' : ''}`} />
        {isBlocked && !showPlayer && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-12 left-0 bg-brand-accent text-white text-[10px] font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg"
          >
            Click to enable audio 🎵
            <div className="absolute -bottom-1 left-4 w-2 h-2 bg-brand-accent rotate-45" />
          </motion.div>
        )}
        {!showPlayer && isPlaying && !isBlocked && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-brand-accent rounded-full animate-ping" />
        )}
      </button>
    </div>
  );
}
