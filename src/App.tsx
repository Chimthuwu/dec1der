import { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import CinematicIntro from './components/CinematicIntro';
import NewLayout from './components/NewLayout';
import MusicPlayer from './components/MusicPlayer';

export default function App() {
  const [showIntro, setShowIntro] = useState(false);
  const [autoPlayMusic, setAutoPlayMusic] = useState(false);

  useEffect(() => {
    const hasPlayed = sessionStorage.getItem('dec1der_intro_played');
    if (!hasPlayed) {
      setShowIntro(true);
    }
  }, []);

  const handleIntroComplete = (useMusic: boolean) => {
    setShowIntro(false);
    setAutoPlayMusic(useMusic);
    sessionStorage.setItem('dec1der_intro_played', 'true');
  };

  const replayIntro = () => {
    setShowIntro(true);
  };

  return (
    <div className="relative w-full min-h-screen bg-black overflow-x-hidden font-sans">
      <AnimatePresence>
        {showIntro && (
          <CinematicIntro onComplete={handleIntroComplete} />
        )}
      </AnimatePresence>

      <NewLayout onReplayIntro={replayIntro} />
      
      {!showIntro && (
        <MusicPlayer autoPlay={autoPlayMusic} />
      )}
    </div>
  );
}
