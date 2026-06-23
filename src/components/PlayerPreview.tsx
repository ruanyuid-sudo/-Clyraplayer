import { useState, useEffect, useRef } from 'react';
import { VideoSource, PlayerSettings, AdSettings } from '../types';
import { Play, Pause, RotateCcw, Volume2, Maximize, SkipForward, Info, Tv, Film } from 'lucide-react';

interface PlayerPreviewProps {
  source: VideoSource | null;
  playerSettings: PlayerSettings;
  adSettings: AdSettings;
}

const DEFAULT_SIMULATOR_VIDEOS = [
  { url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', title: 'Sintel CGI Fantasy' },
  { url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', title: 'Tears of Steel Sci-Fi' },
  { url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', title: 'Big Buck Bunny Animation' }
];

export default function PlayerPreview({ source, playerSettings, adSettings }: PlayerPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [selectedResolution, setSelectedResolution] = useState<string>('default');
  const [showControls, setShowControls] = useState(true);

  // Resolution URL mapping
  const [playbackUrl, setPlaybackUrl] = useState('');

  // Ad simulation states
  const [isPreRollActive, setIsPreRollActive] = useState(false);
  const [preRollCountdown, setPreRollCountdown] = useState(0);
  const [canSkipPreRoll, setCanSkipPreRoll] = useState(false);
  const [bannerClosed, setBannerClosed] = useState(false);
  const [showPopNotification, setShowPopNotification] = useState(false);

  // Determine current active source to play
  const activeSource = source || {
    id: 'simulated_source',
    title: 'Sintel - Clyraplayer Offline Simulator',
    sourceType: 'direct_mp4',
    originalUrl: DEFAULT_SIMULATOR_VIDEOS[0].url,
    resolutions: {
      '1080p': DEFAULT_SIMULATOR_VIDEOS[0].url,
      '720p': DEFAULT_SIMULATOR_VIDEOS[0].url,
      '480p': DEFAULT_SIMULATOR_VIDEOS[0].url,
      '360p': DEFAULT_SIMULATOR_VIDEOS[0].url,
      'default': DEFAULT_SIMULATOR_VIDEOS[0].url,
    },
    subtitleUrl: 'https://durian.blender.org/wp-content/content/subtitles/sintel_en.srt',
    subtitleLabel: 'English VTT',
    posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80',
    createdAt: Date.now()
  };

  // Set initial resolution url
  useEffect(() => {
    // Collect non-empty resolutions
    const res = activeSource.resolutions;
    const available = Object.keys(res).filter((key) => res[key as keyof typeof res]);
    if (available.length > 0) {
      const preferred = res['720p'] || res['default'] || res[available[0] as keyof typeof res] || activeSource.originalUrl;
      setPlaybackUrl(preferred);
      setSelectedResolution(res['720p'] ? '720p' : available[0]);
    } else {
      setPlaybackUrl(activeSource.originalUrl);
      setSelectedResolution('default');
    }

    // Trigger Pre-roll Ad if enabled
    if (adSettings.enablePreRoll) {
      setIsPreRollActive(true);
      setPreRollCountdown(adSettings.preRollSkipSeconds);
      setCanSkipPreRoll(false);
    } else {
      setIsPreRollActive(false);
    }
    setBannerClosed(false);
    setIsPlaying(false);
  }, [source, adSettings.enablePreRoll]);

  // Pre-roll countdown timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPreRollActive && preRollCountdown > 0) {
      timer = setTimeout(() => {
        setPreRollCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isPreRollActive && preRollCountdown === 0) {
      setCanSkipPreRoll(true);
    }
    return () => clearTimeout(timer);
  }, [isPreRollActive, preRollCountdown]);

  // Handle Play/Pause
  const togglePlay = () => {
    if (isPreRollActive) return; // Force view pre-roll ad first

    // Simulated Pop ad click trigger
    if (adSettings.enablePopAd && !showPopNotification) {
      setShowPopNotification(true);
      setTimeout(() => setShowPopNotification(false), 4400);
    }

    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {
          // Play failed (standard iframe restrictions block auto/direct plays sometimes)
          setIsPlaying(false);
        });
      }
    }
  };

  const handleSkipPreRoll = () => {
    setIsPreRollActive(false);
    if (videoRef.current) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {});
    }
  };

  // Skip Forward/Back
  const skipForward = (secs: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += secs;
    }
  };

  const skipBackward = (secs: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime -= secs;
    }
  };

  // Select resolution
  const handleResolutionChange = (resKey: string) => {
    const freshUrl = activeSource.resolutions[resKey as keyof typeof activeSource.resolutions] || activeSource.originalUrl;
    setPlaybackUrl(freshUrl);
    setSelectedResolution(resKey);
    
    // Save state, keep current play marker
    const savedTime = videoRef.current ? videoRef.current.currentTime : 0;
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = savedTime;
        if (isPlaying) videoRef.current.play();
      }
    }, 100);
  };

  // Aspect Overlay Watermark styling position
  const getWatermarkStyle = () => {
    switch (playerSettings.logoOverlayPosition) {
      case 'top-left': return 'top-6 left-6';
      case 'top-right': return 'top-6 right-6';
      case 'bottom-left': return 'bottom-16 left-6';
      case 'bottom-right': return 'bottom-16 right-6';
      default: return 'top-6 right-6';
    }
  };

  // Convert seconds to timestamp
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-4">
      {/* Simulation Info Row */}
      <div className="flex justify-between items-center bg-zinc-950 p-4 rounded-xl border border-zinc-900">
        <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
          <Film size={15} className="text-rose-500" />
          Playing: <strong className="text-white ml-1 font-medium">{activeSource.title}</strong>
        </div>

        <div className="flex gap-2 text-[10px] items-center">
          <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-400">
            Player Style: {playerSettings.defaultEngine.toUpperCase()}
          </span>
          <span className="px-2 py-0.5 bg-rose-950/30 text-rose-455 border border-rose-500/20 rounded">
            Theme Skin: {playerSettings.skin.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Main Video Stage with responsive overlay */}
      <div 
        className={`relative w-full aspect-video rounded-2xl overflow-hidden border border-zinc-850 group select-none bg-black
          ${playerSettings.skin === 'netflix' ? 'ring-1 ring-rose-600/30 font-sans' : ''}
          ${playerSettings.skin === 'synthwave' ? 'ring-1 ring-violet-500/30' : ''}
        `}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        
        {/* Anti-hotlink / Decryption loading placeholder simulation */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-zinc-950/10 pointer-events-none transition opacity-0 group-hover:opacity-100" />

        {/* Brand logo Watermark / Overlay if configured */}
        {playerSettings.enableLogoOverlay && playerSettings.logoOverlayUrl && (
          <img 
            src={playerSettings.logoOverlayUrl} 
            alt="watermark" 
            referrerPolicy="no-referrer"
            className={`absolute z-30 max-h-7 opacity-50 pointer-events-none object-contain ${getWatermarkStyle()}`}
          />
        )}

        {/* POP-UNDER MOCK NOTIFICATION OVERLAY */}
        {showPopNotification && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 p-2.5 rounded-lg bg-yellow-500 text-black border border-yellow-400 flex items-center gap-2.5 shadow-2xl animate-bounce font-sans text-xs">
            <Tv size={16} />
            <span className="font-semibold">Simulated POP-UNDER click! Opened tab to: <code className="font-mono bg-black/10 px-1 rounded">{adSettings.popAdUrl}</code></span>
          </div>
        )}

        {/* PRE-ROLL SPONSOR AD SIMULATION LAYER */}
        {isPreRollActive && (
          <div className="absolute inset-0 z-40 bg-zinc-950/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center font-sans space-y-4">
            <span className="px-2.5 py-0.5 rounded bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[10px] font-bold tracking-widest uppercase">
              ✨ SPONSOR PRESENTMENT ADVERTISING ✨
            </span>
            <div className="max-w-md">
              <h4 className="text-white font-bold text-base">Clyraplayer Premium Proxy Engine</h4>
              <p className="text-xs text-zinc-400 mt-1">Please stand by during this sponsored presentment before your bypass stream begins.</p>
            </div>

            {/* Direct video inside ad or simple loader */}
            <div className="w-48 h-20 bg-zinc-900 border border-zinc-800 rounded-lg flex flex-col items-center justify-center gap-2">
              <span className="text-[11px] font-mono text-zinc-400">Loading sponsor promo...</span>
              <div className="w-24 h-1 bg-zinc-800 rounded overflow-hidden">
                <div className="h-full bg-rose-500 animate-pulse w-2/3" />
              </div>
            </div>

            {/* Skip Countdown buttons */}
            <div className="pt-2">
              {canSkipPreRoll ? (
                <button
                  onClick={handleSkipPreRoll}
                  className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition flex items-center gap-1.5"
                >
                  Skip Ad
                  <SkipForward size={14} />
                </button>
              ) : (
                <button
                  disabled
                  className="px-5 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-semibold"
                >
                  Lewati Iklan dalam {preRollCountdown}s...
                </button>
              )}
            </div>
            
            <a 
              href={adSettings.preRollUrl || '#'} 
              target="_blank" 
              className="text-[10px] text-zinc-550 underline hover:text-white"
            >
              Kunjungi situs pengiklan
            </a>
          </div>
        )}

        {/* BOTTOM RESPONSIVE ADS OVERLAY */}
        {adSettings.enableBannerAd && !isPreRollActive && !bannerClosed && (
          <div className="absolute bottom-[16%] left-1/2 -translate-x-1/2 z-30 max-w-[85%] w-full">
            <div className="relative p-2 rounded-xl bg-zinc-950/90 text-white flex items-center justify-between gap-4 border border-zinc-800 shadow-2xl backdrop-blur-md">
              <a 
                href={adSettings.bannerAdLink} 
                target="_blank" 
                className="flex items-center gap-2.5 overflow-hidden"
              >
                <img 
                  src={adSettings.bannerAdImage || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=80&auto=format&fit=crop&q=80'} 
                  alt="ad banner" 
                  referrerPolicy="no-referrer"
                  className="h-8 max-w-16 object-cover rounded border border-zinc-800 shadow"
                />
                <div className="text-left overflow-hidden">
                  <p className="text-[10px] font-bold text-rose-500">Sponsor Offer</p>
                  <p className="text-[9px] text-zinc-350 truncate">Pelajari detail bonus & streaming kecepatan tinggi.</p>
                </div>
              </a>

              <button 
                onClick={() => setBannerClosed(true)}
                className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:text-white text-[10px] font-bold rounded transition ml-auto shrink-0"
              >
                Tutup ×
              </button>
            </div>
          </div>
        )}

        {/* Netflix Skin: Floating top header with movie title details */}
        {playerSettings.skin === 'netflix' && showControls && !isPreRollActive && (
          <div className="absolute top-0 inset-x-0 p-6 bg-gradient-to-b from-black/90 via-black/40 to-transparent z-20 pointer-events-none transition duration-300">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-600 font-mono">
                  CLYRA CLOUD WORKER STREAMING
                </span>
                <h3 className="text-white font-extrabold text-base md:text-lg tracking-wider drop-shadow-md">
                  {activeSource.title}
                </h3>
              </div>
              
              <div className="p-1 px-2.5 rounded bg-black/60 border border-zinc-800 text-[9px] text-rose-500 font-mono font-bold uppercase shrink-0">
                PRO PLAYER: NETFLIX SKIN
              </div>
            </div>
          </div>
        )}

        {/* Simple html5 Video player */}
        <video
          ref={videoRef}
          src={playbackUrl}
          poster={activeSource.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800'}
          className="w-full h-full object-contain"
          onClick={togglePlay}
          onTimeUpdate={() => {
            if (videoRef.current) {
              setCurrentTime(videoRef.current.currentTime);
            }
          }}
          onLoadedMetadata={() => {
            if (videoRef.current) {
              setDuration(videoRef.current.duration);
            }
          }}
          playsInline
        >
          {activeSource.subtitleUrl && (
            <track 
              kind="subtitles" 
              src={activeSource.subtitleUrl} 
              label={activeSource.subtitleLabel || 'Indonesia VTT'} 
              srcLang="id" 
              default 
            />
          )}
        </video>

        {/* Video Player Visual Controls Bar Overlay */}
        {showControls && !isPreRollActive && (
          <div className={`absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/95 via-black/75 to-transparent z-20 flex flex-col gap-2 transition duration-300
            ${playerSettings.skin === 'netflix' ? 'accent-rose-600' : ''}
          `}>
            {/* Timeline Progress Bar selector */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-zinc-400 font-mono">
                {formatTime(currentTime)}
              </span>
              
              <input 
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={(e) => {
                  const targetTime = Number(e.target.value);
                  if (videoRef.current) {
                    videoRef.current.currentTime = targetTime;
                  }
                  setCurrentTime(targetTime);
                }}
                className={`flex-1 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer outline-none
                  ${playerSettings.skin === 'netflix' ? 'accent-rose-500 [&::-webkit-slider-thumb]:bg-rose-500' : 'accent-indigo-500'}
                `} 
              />
              
              <span className="text-[10px] text-zinc-400 font-mono">
                {formatTime(duration)}
              </span>
            </div>

            {/* Bottom Controls Icon Button Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button 
                  onClick={togglePlay}
                  className={`p-1.5 rounded-full text-white transition-all
                    ${playerSettings.skin === 'netflix' ? 'bg-rose-600 hover:bg-rose-500' : 'bg-zinc-900 hover:bg-zinc-800'}
                  `}
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                </button>

                {/* Forward Rewinds buttons as configured */}
                <button 
                  onClick={() => skipBackward(playerSettings.forwardRewindSeconds)}
                  className="text-zinc-400 hover:text-white transition"
                  title={`Rewind ${playerSettings.forwardRewindSeconds}s`}
                >
                  <RotateCcw size={14} />
                </button>

                <button 
                  onClick={() => skipForward(playerSettings.forwardRewindSeconds)}
                  className="text-zinc-400 hover:text-white transition"
                  title={`Forward ${playerSettings.forwardRewindSeconds}s`}
                >
                  <SkipForward size={14} />
                </button>

                <div className="flex items-center gap-1 ml-1.5">
                  <Volume2 size={14} className="text-zinc-400" />
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.05"
                    value={volume}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      if (videoRef.current) {
                        videoRef.current.volume = v;
                      }
                      setVolume(v);
                    }}
                    className="w-12 h-1 bg-zinc-800 rounded appearance-none cursor-pointer outline-none" 
                  />
                </div>
              </div>

              {/* Subtitles & Resolusi Selectors */}
              <div className="flex items-center gap-2">
                {/* Resolution selector mapping */}
                <select
                  value={selectedResolution}
                  onChange={(e) => handleResolutionChange(e.target.value)}
                  className="bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 text-[10px] text-white px-2 py-0.5 rounded outline-none cursor-pointer font-sans"
                >
                  {Object.entries(activeSource.resolutions).filter(([k,v]) => v).map(([key, value]) => (
                    <option key={key} value={key}>
                      {key === 'default' ? 'Standard' : key}
                    </option>
                  ))}
                </select>

                <button 
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.requestFullscreen().catch(() => {});
                    }
                  }}
                  className="text-zinc-400 hover:text-white transition p-1"
                >
                  <Maximize size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Simulator instructions alert warning */}
      <div className="bg-zinc-950 p-4 border border-zinc-900 rounded-xl space-y-1.5">
        <span className="text-[10px] font-bold font-mono text-rose-500 uppercase flex items-center gap-1.5">
          <Info size={13} />
          💡 KLIK PLAYER UNTUK MEMICU POP-UNDER ADVERTS
        </span>
        <p className="text-[11px] text-zinc-400 leading-normal">
          Pemutar di atas mensimulasikan script resolver bypass untuk video-video streaming Anda (seperti OK.ru, MP4Upload, Google Photos, archive.org, dll). Pengubahan setting skin, banner, watermark, ataupun default engine akan terpaparkan secara langsung dan instan pada player previewer di atas sebelum di-build ke Cloudflare Worker!
        </p>
      </div>
    </div>
  );
}
