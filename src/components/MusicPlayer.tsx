import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const PLAYLIST = [
  {
    title: "Stooge Zone",
    artist: "Dec1der",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    title: "Gnome Dance",
    artist: "Dec1der",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    title: "Wildy Fire",
    artist: "Dec1der",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  }
];

export default function MusicPlayer({ autoPlay = false }: { autoPlay?: boolean }) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack, volume]);

  useEffect(() => {
    if (autoPlay) setIsPlaying(true);
  }, [autoPlay]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const nextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % PLAYLIST.length);
    setProgress(0);
  };

  const prevTrack = () => {
    setCurrentTrack((prev) => (prev - 1 + PLAYLIST.length) % PLAYLIST.length);
    setProgress(0);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const p = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(p || 0);
    }
  };

  return (
    <motion.div 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-6 left-6 z-[60] w-72 bg-black/90 backdrop-blur-xl border-2 border-[#0f0] rounded-2xl p-4 shadow-[0_0_20px_rgba(0,255,0,0.3)]"
    >
      <audio 
        ref={audioRef}
        src={PLAYLIST[currentTrack].url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={nextTrack}
      />

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#0f0]/20 rounded-lg flex items-center justify-center border border-[#0f0]/40 overflow-hidden">
            <motion.div 
              animate={isPlaying ? { scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Music className="text-[#0f0] w-6 h-6" />
            </motion.div>
          </div>
          <div className="flex-grow overflow-hidden">
            <h3 className="text-[#0f0] text-[10px] font-black truncate uppercase tracking-tighter">
              {PLAYLIST[currentTrack].title}
            </h3>
            <p className="text-[#0f0]/60 text-[8px] uppercase tracking-widest">
              {PLAYLIST[currentTrack].artist}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-[#0f0]/20 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-[#0f0]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={prevTrack} className="text-[#0f0] hover:scale-110 transition-transform">
              <SkipBack className="w-4 h-4" />
            </button>
            <button 
              onClick={togglePlay}
              className="w-8 h-8 bg-[#0f0] rounded-full flex items-center justify-center text-black hover:scale-110 transition-transform"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>
            <button onClick={nextTrack} className="text-[#0f0] hover:scale-110 transition-transform">
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 group">
            <Volume2 className="text-[#0f0] w-3 h-3" />
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.1" 
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-16 h-1 bg-[#0f0]/20 rounded-full appearance-none cursor-pointer accent-[#0f0]"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

import { Music } from 'lucide-react';
