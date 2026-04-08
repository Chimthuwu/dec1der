import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Music, 
  Gamepad2, 
  Youtube, 
  Twitch, 
  ExternalLink,
  Layers,
  Palette,
  Info,
  Play
} from 'lucide-react';
import CinematicIntro from './components/CinematicIntro';
import ThinkingAssistant from './components/ThinkingAssistant';

const ARTIST_DATA = {
  name: "Dec1der",
  roles: ["Electronic Music Producer", "Sound Designer", "Composer", "Gamer"],
  bio: "Electronic music producer, sound designer, composer, and gamer. Specializing in hip hop, psytrance, EDM, and video game music. OSRS enthusiast.",
  links: [
    { name: "SoundCloud", url: "https://soundcloud.com/thedec1der", icon: <Music className="w-4 h-4" /> },
    { name: "Twitch", url: "https://www.twitch.tv/thedec1der", icon: <Twitch className="w-4 h-4" /> },
    { name: "Spotify", url: "https://open.spotify.com/artist/0epG7kZFRpxaRchGf6p5yE", icon: <Music className="w-4 h-4" /> },
    { name: "YouTube (Music)", url: "https://www.youtube.com/channel/UCBiYLb34CcObDfZqgm3cj2Q", icon: <Youtube className="w-4 h-4" /> },
    { name: "YouTube (OSRS)", url: "https://www.youtube.com/@deciderosrs", icon: <Gamepad2 className="w-4 h-4" /> },
    { name: "Bandcamp", url: "https://dec1der.bandcamp.com/", icon: <Music className="w-4 h-4" /> },
  ]
};

const TEMPLATES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

export default function App() {
  const [templateIndex, setTemplateIndex] = useState(0);
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    const hasPlayed = sessionStorage.getItem('dec1der_intro_played');
    if (!hasPlayed) {
      setShowIntro(true);
    }
  }, []);

  const handleIntroComplete = () => {
    setShowIntro(false);
    sessionStorage.setItem('dec1der_intro_played', 'true');
  };

  const currentTemplateId = TEMPLATES[templateIndex];

  const fetchAndProcessTemplate = useCallback(async (id: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/${id}.html`);
      let html = await response.text();

      // Inject base tag to handle relative assets if any
      html = html.replace('<head>', '<head><base href="/">');

      // Process HTML to inject Dec1der's data
      // 1. Replace Name (more robustly)
      html = html.replace(/404 Beats/g, "Dec1der");
      html = html.replace(/404 Ensemble/g, "Dec1der");
      html = html.replace(/404 \| Portfolio/g, "Dec1der | Portfolio");
      html = html.replace(/404 \| THE VAULT/g, "Dec1der | THE VAULT");
      html = html.replace(/ABYSSAL \| Solo Project/g, "Dec1der | Solo Project");
      html = html.replace(/>404</g, `>${ARTIST_DATA.name}<`);
      html = html.replace(/404 BEATS/g, "DEC1DER");
      html = html.replace(/404\./g, "Dec1der.");
      html = html.replace(/404/g, "Dec1der"); // Catch-all for remaining 404s
      html = html.replace(/@basic_creative/g, "@thedec1der");
      
      // 2. Replace Roles/Bio
      html = html.replace(/Composer • Pianist • Director/g, ARTIST_DATA.roles.join(" • "));
      html = html.replace(/Digital Producer • Sound Architect/g, "Producer • Sound Designer");
      html = html.replace(/PRODUCER \/ ENGINEER/g, "PRODUCER / COMPOSER");
      html = html.replace(/Atmospheric Black Metal/g, "Electronic Music & OSRS");
      html = html.replace(/AUDIO ARCHITECT/g, "ELECTRONIC MUSIC PRODUCER");
      html = html.replace(/"Injecting neon frequencies into the void. Distorting memories one bassline at a time."/g, `"${ARTIST_DATA.bio}"`);
      html = html.replace(/Making the internet loud. 🧨/g, "Making the internet loud. 🎧");
      html = html.replace(/Experimental synthesis and spatial audio for Nike's 'Move To Zero' campaign./g, ARTIST_DATA.bio);

      // 3. Replace Links (Generic approach)
      // Template 1 specific
      html = html.replace(/Symphony in C Minor/g, "SoundCloud");
      html = html.replace(/Sheet Music Archive/g, "Spotify");
      html = html.replace(/Private Commissions/g, "Twitch");

      // Template 2 specific
      html = html.replace(/Vortex Soundscape/g, "Dec1der Music");
      html = html.replace(/hello@404.com/g, "chimske@gmail.com");

      // Global link replacement (very basic)
      // We look for href="#" and replace with our links in order
      let linkIndex = 0;
      html = html.replace(/href="#"/g, () => {
        const link = ARTIST_DATA.links[linkIndex % ARTIST_DATA.links.length];
        linkIndex++;
        return `href="${link.url}" target="_blank"`;
      });

      // 4. Update Title
      html = html.replace(/<title>.*<\/title>/, `<title>${ARTIST_DATA.name} | Ascended</title>`);

      setHtmlContent(html);
    } catch (error) {
      console.error("Error fetching template:", error);
      setHtmlContent("<h1>Error loading template</h1>");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAndProcessTemplate(currentTemplateId);
  }, [currentTemplateId, fetchAndProcessTemplate]);

  const nextTemplate = () => {
    setTemplateIndex((prev) => (prev + 1) % TEMPLATES.length);
  };

  const prevTemplate = () => {
    setTemplateIndex((prev) => (prev - 1 + TEMPLATES.length) % TEMPLATES.length);
  };

  const randomizeTemplate = () => {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * TEMPLATES.length);
    } while (newIndex === templateIndex);
    setTemplateIndex(newIndex);
  };

  const replayIntro = () => {
    setShowIntro(true);
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans">
      <AnimatePresence>
        {showIntro && (
          <CinematicIntro onComplete={handleIntroComplete} />
        )}
      </AnimatePresence>

      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black z-0" />
      
      {/* Main Content (Iframe) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentTemplateId}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute inset-0 z-10"
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-white/20 animate-pulse">
              <Layers className="w-12 h-12" />
            </div>
          ) : (
            <iframe
              srcDoc={htmlContent}
              className="w-full h-full border-none"
              title={`Template ${currentTemplateId}`}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Control Panel Overlay */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-4">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`flex items-center gap-2 p-2 bg-black/80 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl transition-all duration-300 ${!showControls ? 'opacity-0 pointer-events-none' : ''}`}
        >
          <button 
            onClick={prevTemplate}
            className="p-3 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
            title="Previous Style"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="px-4 py-1 flex flex-col items-center min-w-[120px]">
            <span className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase">Style</span>
            <span className="text-sm font-black text-white tracking-widest">
              {templateIndex + 1} / {TEMPLATES.length}
            </span>
          </div>

          <button 
            onClick={nextTemplate}
            className="p-3 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
            title="Next Style"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="w-px h-8 bg-white/10 mx-2" />

          <button 
            onClick={randomizeTemplate}
            className="p-3 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
            title="Randomize Style"
          >
            <Layers className="w-5 h-5" />
          </button>

          <button 
            onClick={() => setShowControls(!showControls)}
            className="p-3 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
            title="Toggle Controls"
          >
            <Palette className="w-5 h-5" />
          </button>

          <button 
            onClick={replayIntro}
            className="p-3 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
            title="Replay Intro"
          >
            <Play className="w-5 h-5" />
          </button>
        </motion.div>

        {/* Artist Quick Info */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`flex items-center gap-4 px-6 py-3 bg-white/5 backdrop-blur-md border border-white/5 rounded-2xl transition-all duration-300 ${!showControls ? 'opacity-0 pointer-events-none' : ''}`}
        >
          <div className="flex flex-col">
            <h2 className="text-xs font-black text-white tracking-widest uppercase">{ARTIST_DATA.name}</h2>
            <p className="text-[9px] text-white/40 uppercase tracking-tighter">Ascended Identity</p>
          </div>
          <div className="flex gap-2">
            {ARTIST_DATA.links.slice(0, 3).map((link, i) => (
              <a 
                key={i} 
                href={link.url} 
                target="_blank" 
                rel="noreferrer"
                className="p-1.5 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-all"
              >
                {link.icon}
              </a>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Toggle Button (when hidden) */}
      {!showControls && (
        <button 
          onClick={() => setShowControls(true)}
          className="absolute bottom-8 right-24 z-50 p-4 bg-white/10 backdrop-blur-md rounded-full text-white/50 hover:text-white hover:bg-white/20 transition-all"
        >
          <Info className="w-6 h-6" />
        </button>
      )}

      <ThinkingAssistant />

      {/* Overlay for interaction if needed */}
      <div className="absolute top-4 left-4 z-50 pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">System Online</span>
        </div>
      </div>
    </div>
  );
}
