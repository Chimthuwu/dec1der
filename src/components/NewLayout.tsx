import { useEffect, useRef } from 'react';
import { Play } from 'lucide-react';

export default function NewLayout({ onReplayIntro }: { onReplayIntro: () => void }) {
  const collageContainerRef = useRef<HTMLDivElement>(null);
  const pfpRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // --- 1. DYNAMIC FL STUDIO BACKGROUND COLLAGE ---
    const collageContainer = collageContainerRef.current;
    if (!collageContainer) return;

    // Added the full list of files from your public/fl/ folder for MAX CHAOS
    const defaultFLImages = [
      "fl/1.gif", "fl/2.gif", "fl/3.png", "fl/5.gif", "fl/6.gif", "fl/7.gif", "fl/8.gif", "fl/9.gif", "fl/10.gif", "fl/11.gif",
      "fl/3c0f3e38c41334a48bf30f976fd6a8d8.gif", 
      "fl/5371b8b4dfe0d0cb90fd183d5d3f86961110525c.gif", 
      "fl/7be028109172735.5fce415e9b989.png", 
      "fl/998128a7817eda0ccd650feef29c76a9a96b4a62.gif",
      "fl/ewtfolylzza41.gif", 
      "fl/giphy.gif", 
      "fl/i-turned-all-the-fl-chan-animations-into-loopable-gifs-v0-vpduzuo6pfve1.gif",
      "fl/kTJ00t.gif", 
      "fl/synthesizer-modular.gif", 
      "fl/Zp91BY.gif"
    ];

    function resolvePath(path: string) {
      if (!path) return '';
      // Ensure path starts with / for absolute root-relative resolution
      const cleanPath = path.startsWith('/') ? path : '/' + path;
      // Add a cache-busting timestamp to bypass any Cloudflare edge caching for now
      return `${cleanPath}?v=${Date.now()}`;
    }

    function buildCollage(imageUrls: string[]) {
      if (!collageContainer || imageUrls.length === 0) return;
      console.log("Building collage with", imageUrls.length, "images");
      collageContainer.innerHTML = ''; // Clear existing
      
      let images = [...imageUrls];
      // Increase count to fill a large grid (e.g., 150-200 images)
      const targetCount = 150;
      while (images.length < targetCount && images.length > 0) {
        images = images.concat(images);
      }
      images.sort(() => Math.random() - 0.5);
      images.slice(0, targetCount).forEach(url => {
        const img = document.createElement('img');
        img.src = resolvePath(url);
        img.onerror = () => console.error("Failed to load image:", resolvePath(url));
        img.style.animationDelay = (Math.random() * 4) + 's';
        
        // Randomly make some images larger for a "collage" feel
        if (Math.random() > 0.8) {
          img.style.gridColumn = 'span 2';
          if (Math.random() > 0.5) img.style.gridRow = 'span 2';
        }
        
        // Add random rotation
        img.style.transform = `rotate(${(Math.random() - 0.5) * 10}deg)`;
        
        collageContainer.appendChild(img);
      });
    }

    // Force use local images
    buildCollage(defaultFLImages);

    // --- 2. GNOME PFP CYCLER ---
    const gnomes = [
      "gnome/5.gif", // pain-dank.gif
      "gnome/1.gif", // 200w.gif
      "gnome/2.gif", // download.gif
      "gnome/3.gif", // giphy_2.gif
      "gnome/4.gif", // ina3hi02spp21.gif
      "gnome/6.gif"  // tumblr_nabhp30Tmo1tjw4imo1_250.gif
    ];
    let gnomeIndex = 0;
    let gnomeTimeout: NodeJS.Timeout;

    const cycleGnome = () => {
      gnomeIndex = (gnomeIndex + 1) % gnomes.length;
      if (pfpRef.current) {
        const url = resolvePath(gnomes[gnomeIndex]);
        pfpRef.current.src = url;
      }
      
      const duration = gnomes[gnomeIndex].includes('5.gif') ? 500 : 7000;
      gnomeTimeout = setTimeout(cycleGnome, duration);
    };

    // Initial timeout should respect the first image (5.gif)
    const initialDuration = gnomes[0].includes('5.gif') ? 500 : 7000;
    gnomeTimeout = setTimeout(cycleGnome, initialDuration);

    if (pfpRef.current) {
      pfpRef.current.src = resolvePath(gnomes[0]);
    }

    // --- 4. KONAMI CODE ---
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === konamiCode[konamiIndex] || e.key.toLowerCase() === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                document.body.classList.add('yilmaz-mode');
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0;
        }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(gnomeTimeout);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative font-['Press_Start_2P',system-ui]">
      {/* DYNAMIC FL STUDIO COLLAGE BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-black">
        <div ref={collageContainerRef} id="fl-collage" className="collage-container"></div>
        <div className="absolute inset-0 bg-black/20 z-[2]"></div>
      </div>

      <main className="max-w-4xl w-full z-20 mt-10 flex-grow">
        <div className="flex flex-col items-center mb-12 relative">
          <div id="secret-pixel" className="absolute top-0 right-0 w-4 h-4 cursor-crosshair hover:bg-[#0f0] transition-colors" title="Don't click this, stooge."></div>

          {/* GNOME CYCLING PFP */}
          <div className="w-64 h-64 mb-6 pfp rounded-3xl overflow-hidden bg-black relative group">
            <img 
              ref={pfpRef} 
              id="gnome-pfp" 
              src="/gnome/5.gif" 
              className="w-full h-full object-cover" 
              onError={(e) => {
                console.error("Failed to load PFP:", (e.target as HTMLImageElement).src);
                // Try fallback to absolute path if relative fails
                if (!(e.target as HTMLImageElement).src.includes(window.location.origin)) {
                   (e.target as HTMLImageElement).src = window.location.origin + "/gnome/5.gif";
                }
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-crosshair">
              <p className="text-[10px] text-center text-[#0f0] leading-loose">↑ ↑ ↓ ↓<br />← → ← →<br />B A</p>
            </div>
          </div>

          <h1 className="header text-5xl md:text-7xl font-black tracking-[-4px] text-center">DEC1DER</h1>
          <p className="text-sm md:text-xl mt-3 text-[#0f0] text-center">FL STUDIO • RUNESCAPE • PURE CHAOS</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <a href="https://www.twitch.tv/thedec1der" target="_blank" rel="noreferrer" className="neo-card p-8 flex flex-col items-center text-center"><span className="text-6xl mb-4">📺</span><h2 className="text-2xl font-black">TWITCH</h2></a>
          <a href="https://soundcloud.com/thedec1der" target="_blank" rel="noreferrer" className="neo-card p-8 flex flex-col items-center text-center"><span className="text-6xl mb-4">🔊</span><h2 className="text-2xl font-black">SOUNDCLOUD</h2></a>
          <a href="https://www.youtube.com/channel/UCBiYLb34CcObDfZqgm3cj2Q" target="_blank" rel="noreferrer" className="neo-card p-8 flex flex-col items-center text-center"><span className="text-6xl mb-4">📼</span><h2 className="text-2xl font-black">YT MAIN</h2></a>
          <a href="https://www.youtube.com/@deciderosrs" target="_blank" rel="noreferrer" className="neo-card p-8 flex flex-col items-center text-center">
            <span className="text-6xl mb-4">🪓</span>
            <h2 className="text-2xl font-black">OSRS CLIPS</h2>
            <p className="text-[9px] mt-2 text-[#0f0]">NO MERCY FOR STOOGES</p>
          </a>
          <a href="https://open.spotify.com/artist/0epG7kZFRpxaRchGf6p5yE" target="_blank" rel="noreferrer" className="neo-card p-8 flex flex-col items-center text-center"><span className="text-6xl mb-4">🎵</span><h2 className="text-2xl font-black">SPOTIFY</h2></a>
          <a href="https://dec1der.bandcamp.com/" target="_blank" rel="noreferrer" className="neo-card p-8 flex flex-col items-center text-center"><span className="text-6xl mb-4">💿</span><h2 className="text-2xl font-black">BANDCAMP</h2></a>
          <a href="https://www.instagram.com/thedec1der/" target="_blank" rel="noreferrer" className="neo-card p-8 flex flex-col items-center text-center"><span className="text-6xl mb-4">📷</span><h2 className="text-2xl font-black">INSTAGRAM</h2></a>
          <a href="https://store.steampowered.com/app/2781990/Hell_On_Earth/" target="_blank" rel="noreferrer" className="neo-card p-8 flex flex-col items-center text-center">
            <span className="text-6xl mb-4">🔥</span>
            <h2 className="text-2xl font-black">HELL ON EARTH</h2>
            <p className="text-[9px] mt-2 text-[#0f0]">SOUND DESIGN BY DEC1DER</p>
          </a>
          <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank" rel="noreferrer" className="neo-card p-8 flex flex-col items-center text-center md:col-span-2 bg-[#111]" style={{borderColor: '#ec4899', boxShadow: '10px 10px 0 #ec4899'}}>
            <span className="text-6xl mb-4">📸</span>
            <h2 className="text-2xl font-black text-pink-500">ONLYFANS</h2>
            <p className="text-[10px] mt-2 text-pink-300">PREMIUM YILMAZ CONTENT INSIDE (18+)</p>
          </a>
        </div>
      </main>

      <div className="mt-8 mb-4 text-center text-[#0f0] text-[10px] font-black z-20 flex flex-col items-center gap-4">
        <p>GNOMES CYCLE IN PFP • LIVE FL STUDIO COLLAGE • DON'T BE A STOOGE</p>
      </div>

      {/* FLOATING REPLAY BUTTON */}
      <button 
        onClick={onReplayIntro}
        className="fixed top-6 right-6 z-[100] flex items-center gap-2 px-6 py-3 bg-black border-2 border-[#0f0] text-[#0f0] font-black text-xs hover:bg-[#0f0] hover:text-black transition-all rounded-xl shadow-[5px_5px_0_#0f0] active:translate-x-1 active:translate-y-1 active:shadow-none"
      >
        <Play className="w-4 h-4 fill-current" /> REPLAY INTRO
      </button>
    </div>
  );
}
