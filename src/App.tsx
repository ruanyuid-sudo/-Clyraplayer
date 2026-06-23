import React, { useState, useEffect } from 'react';
import { VideoSource, PlayerSettings, AdSettings, WebsiteSettings, WorkerDeploymentConfig } from './types';
import AdminLogin from './components/AdminLogin';
import SourceManager from './components/SourceManager';
import PlayerConfigurator from './components/PlayerConfigurator';
import WorkerBuilder from './components/WorkerBuilder';
import PlayerPreview from './components/PlayerPreview';
import { 
  Play, 
  Settings, 
  LogOut, 
  Layers, 
  Globe, 
  Database,
  Users,
  Eye,
  Activity,
  Plus,
  Trash2,
  Sparkles,
  ChevronDown,
  Info,
  Link2,
  Lock,
  ChevronUp,
  Sliders,
  Cpu,
  Tv,
  Check,
  ExternalLink
} from 'lucide-react';

// Preloaded sources for the system
const INITIAL_SOURCES: VideoSource[] = [
  {
    id: 'sintel-classic',
    title: 'Sintel CGI masterwork bypass',
    sourceType: 'direct_mp4',
    originalUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    resolutions: {
      '1080p': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      '720p': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      '480p': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'
    },
    subtitleUrl: '',
    subtitleLabel: 'Indonesia VTT',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23',
    createdAt: Date.now() - 1000 * 60 * 60 * 2
  }
];

const DEFAULT_PLAYER_SETTINGS: PlayerSettings = {
  defaultEngine: 'artplayer',
  skin: 'netflix',
  autoplay: false,
  forwardRewindSeconds: 10,
  enableLogoOverlay: true,
  logoOverlayUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
  logoOverlayPosition: 'top-left',
  autoSkipTime: 0,
  playbackSpeeds: [0.5, 0.75, 1, 1.25, 1.5, 2],
  enableKeyboardShortcuts: true,
  theaterMode: false
};

const DEFAULT_AD_SETTINGS: AdSettings = {
  enablePreRoll: true,
  preRollUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  preRollSkipSeconds: 5,
  enableMidRoll: false,
  midRollTimeSeconds: 180,
  midRollUrl: '',
  enableBannerAd: true,
  bannerAdImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
  bannerAdLink: 'https://dash.cloudflare.com',
  enablePopAd: true,
  popAdUrl: 'https://dash.cloudflare.com',
  popAdFrequencyMinutes: 3
};

const DEFAULT_WEB_SETTINGS: WebsiteSettings = {
  siteName: 'ClyraMotion',
  siteLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=60',
  description: 'Premium Cloudflare Workers personal streaming proxy engine, supporting 10+ major hosting platforms.',
  footerText: '© 2026 ClyraMotion Premium Player.',
  primaryColor: 'rose',
  theme: 'dark',
  allowPublicUpload: true,
  apiToken: 'ruan-token-7788'
};

const DEFAULT_WORKER_CONFIG: WorkerDeploymentConfig = {
  workerName: 'clyramotion-worker',
  cacheTtlSeconds: 3600,
  enableAntiBot: true,
  enableRateLimit: true,
  rateLimitRequestCount: 60,
  corsOrigins: '*',
  cloudflareAccountEmail: 'ruanyuid@gmail.com',
  minifyScript: false
};

export default function App() {
  // Mode views: 'public' or 'admin'
  const [viewMode, setViewMode] = useState<'public' | 'admin'>('public');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [activeAdminTab, setActiveAdminTab] = useState<'dashboard' | 'sources' | 'player' | 'worker' | 'preview'>('dashboard');

  // Multi-source fields on the Public Generator page
  const [publicTitle, setPublicTitle] = useState('Sintel CGI Extra');
  const [publicSources, setPublicSources] = useState<string[]>(['https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4']);
  const [publicSubtitleUrl, setPublicSubtitleUrl] = useState('');
  const [publicSubtitleLang, setPublicSubtitleLang] = useState('Indonesian');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [showSitesList, setShowSitesList] = useState(false);

  // States
  const [sources, setSources] = useState<VideoSource[]>(() => {
    const saved = localStorage.getItem('clyra_sources');
    return saved ? JSON.parse(saved) : INITIAL_SOURCES;
  });

  const [playerSettings, setPlayerSettings] = useState<PlayerSettings>(() => {
    const saved = localStorage.getItem('clyra_player_settings');
    return saved ? JSON.parse(saved) : DEFAULT_PLAYER_SETTINGS;
  });

  const [adSettings, setAdSettings] = useState<AdSettings>(() => {
    const saved = localStorage.getItem('clyra_ad_settings');
    return saved ? JSON.parse(saved) : DEFAULT_AD_SETTINGS;
  });

  const [webSettings, setWebSettings] = useState<WebsiteSettings>(() => {
    const saved = localStorage.getItem('clyra_web_settings');
    return saved ? JSON.parse(saved) : DEFAULT_WEB_SETTINGS;
  });

  const [workerConfig, setWorkerConfig] = useState<WorkerDeploymentConfig>(() => {
    const saved = localStorage.getItem('clyra_worker_config');
    return saved ? JSON.parse(saved) : DEFAULT_WORKER_CONFIG;
  });

  // Active preview object
  const [previewSource, setPreviewSource] = useState<VideoSource | null>(null);

  // Persist configurations
  useEffect(() => {
    localStorage.setItem('clyra_sources', JSON.stringify(sources));
  }, [sources]);

  useEffect(() => {
    localStorage.setItem('clyra_player_settings', JSON.stringify(playerSettings));
  }, [playerSettings]);

  useEffect(() => {
    localStorage.setItem('clyra_ad_settings', JSON.stringify(adSettings));
  }, [adSettings]);

  useEffect(() => {
    localStorage.setItem('clyra_web_settings', JSON.stringify(webSettings));
  }, [webSettings]);

  useEffect(() => {
    localStorage.setItem('clyra_worker_config', JSON.stringify(workerConfig));
  }, [workerConfig]);

  // Methods
  const handleAddSource = (newSrc: Omit<VideoSource, 'id' | 'createdAt'>) => {
    const fresh: VideoSource = {
      ...newSrc,
      id: `source_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: Date.now()
    };
    setSources((prev) => [fresh, ...prev]);
  };

  const handleUpdateSource = (id: string, updatedFields: Partial<VideoSource>) => {
    setSources((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedFields } : item))
    );
  };

  const handleDeleteSource = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus server video ini?')) {
      setSources((prev) => prev.filter((item) => item.id !== id));
      if (previewSource?.id === id) {
        setPreviewSource(null);
      }
    }
  };

  // Generate Multi-Player Link Click Handlers
  const handleGenerateMultiPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (publicSources.length === 0 || !publicSources[0]) {
      alert('Tolong masukkan minimal satu video URL / ID.');
      return;
    }

    const firstUrl = publicSources[0];
    const generatedId = `clyra_${Math.random().toString(36).substring(2, 8)}`;

    const newGeneratedSource: VideoSource = {
      id: generatedId,
      title: publicTitle || 'Streaming Multi Resolution',
      sourceType: firstUrl.includes('ok.ru') ? 'okru' : firstUrl.includes('mp4upload') ? 'mp4upload' : 'direct_mp4',
      originalUrl: firstUrl,
      resolutions: {
        '1080p': firstUrl,
        '720p': publicSources[1] || firstUrl,
        '480p': publicSources[2] || firstUrl,
        '360p': publicSources[3] || firstUrl,
      },
      subtitleUrl: publicSubtitleUrl || undefined,
      subtitleLabel: publicSubtitleLang,
      createdAt: Date.now()
    };

    setSources((prev) => [newGeneratedSource, ...prev]);
    
    // Simulate domain url output
    const demoUrl = `${window.location.origin}/play/${generatedId}`;
    setGeneratedLink(demoUrl);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleTriggerPreview = (source: VideoSource) => {
    setPreviewSource(source);
    setActiveAdminTab('preview');
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] text-[#c5c6c7] font-sans flex flex-col justify-between">
      
      {/* HEADER / NAVBAR */}
      <header className="flex justify-between items-center px-6 py-4 bg-black/40 border-b border-gray-800/50 backdrop-blur-md sticky top-0 z-50">
        <div 
          onClick={() => setViewMode('public')}
          className="flex items-center space-x-2 text-xl font-bold tracking-wide cursor-pointer hover:opacity-80 transition"
        >
          <Play fill="#3b82f6" className="text-blue-500 text-lg w-5 h-5" />
          <span className="text-white font-display font-extrabold tracking-tight">
            Clyra<span className="text-blue-500">Motion</span>
          </span>
        </div>

        <div className="flex items-center space-x-3">
          {viewMode === 'admin' && (
            <button
              onClick={() => setViewMode('public')}
              className="px-3 py-1.5 rounded-md text-xs bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition"
            >
              ← Back to Generator
            </button>
          )}

          <button 
            onClick={() => {
              if (isLoggedIn) {
                setViewMode(viewMode === 'public' ? 'admin' : 'public');
              } else {
                setViewMode('admin');
              }
            }}
            className="flex items-center space-x-1.5 bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white px-3 py-1.5 rounded-md text-sm border border-gray-800 transition-all cursor-pointer"
          >
            <Settings size={14} className="animate-spin-slow" />
            <span>{viewMode === 'public' ? 'Admin Panel' : 'Exit Admin'}</span>
          </button>
        </div>
      </header>

      {/* RENDER VIEW: 1. PUBLIC LINK GENERATOR PAGE (ClyraMotion Style) */}
      {viewMode === 'public' && (
        <main className="flex-grow max-w-4xl w-full mx-auto px-4 py-8">
          
          {/* Alert / Banner Info */}
          <div className="bg-blue-950/30 border border-blue-900/50 text-blue-400 px-4 py-3 rounded-lg flex items-center space-x-3 mb-8 text-sm">
            <Sparkles size={16} className="text-yellow-400 shrink-0 animate-pulse" />
            <span><strong>Update:</strong> 4K Support, OK.RU bypass & Cloudflare premium cache optimization active!</span>
          </div>

          {/* Title Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-white mb-1 tracking-tight">ClyraMotion Generator</h1>
            <p className="text-gray-400 text-sm">Multi-Source Video Extractor & Premium CF Player</p>
          </div>

          <form onSubmit={handleGenerateMultiPlayer} className="space-y-6">
            {/* Title video name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nama Video / Judul Film</label>
              <input
                type="text"
                value={publicTitle}
                onChange={(e) => setPublicTitle(e.target.value)}
                required
                placeholder="cth: Sintel CGI Film Fantasy"
                className="w-full bg-[#12131a] border border-gray-850 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-600 transition-all text-white"
              />
            </div>

            {/* Input Video Source resolution channels */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-300">
                  Daftar Sumber Video <span className="text-gray-500 text-xs">(Mendukung multi resolution/server)</span>
                </label>
                <button 
                  type="button"
                  onClick={() => setPublicSources([...publicSources, ''])}
                  className="text-xs bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-800 px-2.5 py-1 rounded-md transition-all cursor-pointer"
                >
                  + Tambah Server / Resolusi
                </button>
              </div>

              <div className="space-y-3">
                {publicSources.map((sourceUrl, idx) => (
                  <div key={idx} className="flex space-x-2">
                    <span className="px-3 bg-zinc-900 border border-gray-800 text-zinc-400 rounded-lg text-xs flex items-center justify-center font-mono">
                      SRV {idx + 1}
                    </span>
                    <input 
                      type="text" 
                      value={sourceUrl}
                      onChange={(e) => {
                        const newSources = [...publicSources];
                        newSources[idx] = e.target.value;
                        setPublicSources(newSources);
                      }}
                      required={idx === 0}
                      placeholder={`Masukan Video URL / ID ke-${idx + 1} (cth: OK.ru, MP4Upload, GDrive)...`} 
                      className="w-full bg-[#12131a] border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-600 transition-all text-white"
                    />
                    {idx > 0 && (
                      <button 
                        type="button"
                        onClick={() => setPublicSources(publicSources.filter((_, i) => i !== idx))}
                        className="bg-red-950/40 text-red-400 border border-red-900/50 hover:bg-red-900/30 px-3 rounded-lg flex items-center justify-center transition-all cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Input Subtitle External */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-300">
                  Subtitle Track <span className="text-gray-500 text-xs">(Opsional)</span>
                </label>
              </div>
              <div className="flex space-x-2">
                <select 
                  value={publicSubtitleLang}
                  onChange={(e) => setPublicSubtitleLang(e.target.value)}
                  className="bg-[#12131a] border border-gray-800 rounded-lg px-3 py-3 text-sm focus:outline-none focus:border-blue-500 text-gray-300 cursor-pointer w-32"
                >
                  <option value="Indonesian">Indonesian</option>
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="Japanese">Japanese</option>
                </select>
                <input 
                  type="text" 
                  value={publicSubtitleUrl}
                  onChange={(e) => setPublicSubtitleUrl(e.target.value)}
                  placeholder="URL File Subtitle (.srt, .vtt) cth: https://domain.com/indonesia.vtt" 
                  className="w-full bg-[#12131a] border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-600 transition-all text-white"
                />
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-550 text-white font-semibold py-3.5 rounded-lg flex items-center justify-center space-x-2 text-sm shadow-lg shadow-blue-600/10 active:scale-[0.99] transition-all cursor-pointer"
              >
                <Sparkles size={16} />
                <span>GENERATE MULTI-PLAYER LINK</span>
              </button>
            </div>
          </form>

          {/* Generated Result Link Show */}
          {generatedLink && (
            <div className="mt-8 bg-[#12131a] border border-blue-900/20 p-5 rounded-2xl space-y-3.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono font-bold text-blue-400">⚡ CLIENT EDGE PLAYER LINK GENERATED SUCCESSFULLY</span>
                <span className="text-[10px] text-zinc-500 font-mono">Bypass Ready</span>
              </div>
              <p className="text-xs text-zinc-400">Salin link bypass player di bawah ini untuk digunakan pada iframe website nonton streaming movie Anda:</p>
              
              <div className="flex gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={generatedLink}
                  className="w-full bg-black/50 border border-gray-800 text-gray-200 p-2.5 rounded-lg font-mono text-xs focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-4 bg-blue-600 hover:bg-blue-550 text-white text-xs font-semibold rounded-lg transition"
                >
                  {copiedLink ? 'Copied' : 'Copy'}
                </button>
              </div>

              <div className="flex justify-between pt-1 text-[11px]">
                <a 
                  href={generatedLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-450 hover:underline flex items-center gap-1 font-semibold text-blue-400"
                >
                  <ExternalLink size={12} />
                  Mainkan di tab baru
                </a>

                <button
                  onClick={() => {
                    const matched = sources.find(s => demoUrlIncludesId(generatedLink, s.id));
                    if (matched) {
                      setPreviewSource(matched);
                      setViewMode('admin');
                      setActiveAdminTab('preview');
                    }
                  }}
                  className="text-zinc-500 hover:text-white transition"
                >
                  Simulasikan di Panel →
                </button>
              </div>
            </div>
          )}

          {/* Supported Sites Accordion */}
          <div className="mt-8">
            <div 
              onClick={() => setShowSitesList(!showSitesList)}
              className="bg-[#12131a]/50 border border-gray-800/80 rounded-xl p-4 flex justify-between items-center cursor-pointer hover:border-gray-700 transition"
            >
              <div className="flex items-center space-x-2.5 text-sm font-medium text-gray-300">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
                <span>Supported Sites List (20+ Platforms)</span>
              </div>
              <button className="flex items-center space-x-1 bg-gray-950 text-gray-400 hover:text-white px-3 py-1.5 rounded-md text-xs border border-gray-800 transition-all cursor-pointer">
                <span>{showSitesList ? 'Tutup Detail' : 'Lihat Detail'}</span>
                {showSitesList ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              </button>
            </div>

            {showSitesList && (
              <div className="bg-[#12131a]/30 border-x border-b border-gray-800/80 p-5 rounded-b-xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {[
                  'OK.ru', 'MP4Upload', 'YourUpload', 'FileDon', 
                  'TurboViPlay', 'Dailymotion', 'Google Drive', 'Google Photos', 
                  'Archive.org', 'Dropbox', 'Yandex Disk', 'Mediafire',
                  'Direct HLS (.m3u8)', 'Direct MP4/MKV', 'Flickr Video', 'uqload', 
                  'Sendvid', 'dropload', 'flickr', 'thetube'
                ].map((site) => (
                  <div key={site} className="flex items-center gap-2 p-1.5 border border-zinc-900 rounded bg-black/25">
                    <Check size={11} className="text-green-500 shrink-0" />
                    <span className="text-zinc-300">{site}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick info about Workers deploy */}
          <div className="mt-12 p-6 bg-[#12131a]/40 border border-zinc-900 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="max-w-lg">
              <h4 className="text-white text-sm font-extrabold font-display">Ingin Memiliki Player Pribadi dengan Script Workers Sendiri?</h4>
              <p className="text-xs text-zinc-400 mt-1">
                Gunakan Admin Panel untuk mengatur iklan pre-roll, pop-under, custom Netflix skin, dan download source-code yang siap diupload secara gratis pada dash.cloudflare.com.
              </p>
            </div>
            
            <button
              onClick={() => {
                if (!isLoggedIn) {
                  setViewMode('admin');
                } else {
                  setViewMode('admin');
                  setActiveAdminTab('worker');
                }
              }}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 font-bold text-xs text-white transition self-stretch md:self-center text-center"
            >
              Configure & Deploy Worker
            </button>
          </div>
        </main>
      )}

      {/* RENDER VIEW: 2. ADMIN PANEL AREA (FULLY SECURED WITH DEFAULT CREDENTIALS) */}
      {viewMode === 'admin' && (
        <>
          {!isLoggedIn ? (
            <div className="flex-1 flex items-center justify-center py-10">
              <AdminLogin onLoginSuccess={() => {
                setIsLoggedIn(true);
                setActiveAdminTab('dashboard');
              }} />
            </div>
          ) : (
            <div className="flex-1 max-w-[1400px] w-full mx-auto px-4 md:px-6 py-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
              
              {/* Sidebar Menu Panel */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-850 space-y-1.5 shadow-xl">
                  <span className="text-[10px] font-bold font-mono text-zinc-500 uppercase tracking-widest block mb-2 px-2">
                    Console Navigation
                  </span>

                  {/* TAB: Overview */}
                  <button
                    onClick={() => setActiveAdminTab('dashboard')}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition
                      ${activeAdminTab === 'dashboard' 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10' 
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'}`}
                  >
                    <Activity size={16} />
                    System Overview
                  </button>

                  {/* TAB: Sources */}
                  <button
                    onClick={() => setActiveAdminTab('sources')}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition
                      ${activeAdminTab === 'sources' 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10' 
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'}`}
                  >
                    <Database size={16} />
                    Link Servers Database ({sources.length})
                  </button>

                  {/* TAB: Player Settings */}
                  <button
                    onClick={() => setActiveAdminTab('player')}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition
                      ${activeAdminTab === 'player' 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10' 
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'}`}
                  >
                    <Sliders size={16} />
                    Skins & Monetize (Ads)
                  </button>

                  {/* TAB: Worker Builder */}
                  <button
                    onClick={() => setActiveAdminTab('worker')}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition
                      ${activeAdminTab === 'worker' 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10' 
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'}`}
                  >
                    <Cpu size={16} />
                    CF Workers Compiler
                  </button>

                  {/* TAB: Live Preview */}
                  <button
                    onClick={() => setActiveAdminTab('preview')}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition
                      ${activeAdminTab === 'preview' 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10' 
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'}`}
                  >
                    <Play size={16} />
                    Simulate Video Player
                  </button>
                </div>

                {/* Info summary */}
                <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-850 space-y-3.5 text-xs shadow-xl">
                  <h4 className="text-[11px] font-extrabold text-white uppercase tracking-wider font-mono">
                    ⚡ STATUS DEPLOMENT
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between border-b border-zinc-900 pb-1">
                      <span className="text-zinc-500 font-mono">Platform:</span>
                      <span className="text-blue-400 font-bold">Cloudflare edge</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-900 pb-1">
                      <span className="text-zinc-500 font-mono">Player Skin:</span>
                      <span className="text-rose-500 font-bold">{playerSettings.skin.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500 font-mono">Developer ID:</span>
                      <span className="text-zinc-355 text-zinc-300 select-all">ruanyuid</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Console Workspace Display */}
              <div className="lg:col-span-4 min-h-[70vh]">
                
                {/* ADMIN TAB: Dashboard Overview */}
                {activeAdminTab === 'dashboard' && (
                  <div className="space-y-6">
                    <div className="p-8 rounded-2xl border border-zinc-800 bg-gradient-to-r from-zinc-950 to-blue-950/20 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 blur-3xl rounded-full" />
                      
                      <span className="inline-block px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest mb-3">
                        ● ADMINISTRATIVE MODE ACTIVE
                      </span>
                      
                      <h2 className="text-2xl md:text-3xl font-display font-black text-white tracking-tight">
                        ClyraMotion Admin Control Engine
                      </h2>
                      
                      <p className="text-xs text-zinc-400 mt-2 max-w-2xl leading-normal">
                        Selamat datang di hub pengaturan administrator. Di sini Anda bisa mengoptimalkan performa streaming video, menambahkan anti-bot rates limiter, menyetel sponsor iklan pre-rolls, dan mengompilasi kode kustom Javascript untuk Cloudflare Workers!
                      </p>

                      <div className="flex flex-wrap gap-2.5 pt-4">
                        <button
                          onClick={() => setActiveAdminTab('worker')}
                          className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-550 text-white text-xs font-semibold transition"
                        >
                          Compile CF Worker Script
                        </button>
                        <button
                          onClick={() => setActiveAdminTab('sources')}
                          className="py-2 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold"
                        >
                          Daftar Host Video ({sources.length})
                        </button>
                      </div>
                    </div>

                    {/* Bento stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-850 flex items-center gap-4">
                        <span className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                          <Database size={20} />
                        </span>
                        <div>
                          <span className="block text-[10px] uppercase font-mono font-bold text-zinc-500">Preset Video</span>
                          <h3 className="text-white text-xl font-extrabold font-display">{sources.length} Video Host</h3>
                        </div>
                      </div>

                      <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-850 flex items-center gap-4">
                        <span className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
                          <Tv size={20} />
                        </span>
                        <div>
                          <span className="block text-[10px] uppercase font-mono font-bold text-zinc-500">Default Player</span>
                          <h3 className="text-white text-xl font-extrabold font-display">{playerSettings.defaultEngine.toUpperCase()}</h3>
                        </div>
                      </div>

                      <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-850 flex items-center gap-4">
                        <span className="p-3 bg-yellow-500/10 text-yellow-400 rounded-xl border border-yellow-500/20">
                          <Users size={20} />
                        </span>
                        <div>
                          <span className="block text-[10px] uppercase font-mono font-bold text-zinc-500">Iklan Aktif</span>
                          <h3 className="text-white text-xl font-extrabold font-display">
                            {adSettings.enablePopAd || adSettings.enablePreRoll ? 'Pop / Pre-roll Active' : 'Off'}
                          </h3>
                        </div>
                      </div>
                    </div>

                    {/* Login account info warning alert */}
                    <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-550/20 text-xs text-yellow-500/90 leading-relaxed font-sans">
                      <strong>🔑 Info Admin:</strong> Akun login bawaan Anda adalah <span className="bg-black/40 px-1 py-0.5 rounded text-white font-mono font-medium">user: ruanyuid</span> dan <span className="bg-black/40 px-1 py-0.5 rounded text-white font-mono font-medium">pass: ruanyuid</span>. Silakan catat rincian ini untuk login berulang pada previewer sandbox.
                    </div>
                  </div>
                )}

                {/* ADMIN TAB: Video Hosts manager */}
                {activeAdminTab === 'sources' && (
                  <SourceManager
                    sources={sources}
                    onAddSource={handleAddSource}
                    onUpdateSource={handleUpdateSource}
                    onDeleteSource={handleDeleteSource}
                    onPreviewSource={handleTriggerPreview}
                  />
                )}

                {/* ADMIN TAB: Skins and Configuration */}
                {activeAdminTab === 'player' && (
                  <PlayerConfigurator
                    playerSettings={playerSettings}
                    adSettings={adSettings}
                    webSettings={webSettings}
                    onUpdatePlayer={(p) => setPlayerSettings((prev) => ({ ...prev, ...p }))}
                    onUpdateAds={(a) => setAdSettings((prev) => ({ ...prev, ...a }))}
                    onUpdateWeb={(w) => setWebSettings((prev) => ({ ...prev, ...w }))}
                  />
                )}

                {/* ADMIN TAB: Workers compiling script */}
                {activeAdminTab === 'worker' && (
                  <WorkerBuilder
                    sources={sources}
                    playerSettings={playerSettings}
                    adSettings={adSettings}
                    webSettings={webSettings}
                    workerConfig={workerConfig}
                    onUpdateConfig={(c) => setWorkerConfig((prev) => ({ ...prev, ...c }))}
                  />
                )}

                {/* ADMIN TAB: Player simulations previewer */}
                {activeAdminTab === 'preview' && (
                  <PlayerPreview
                    source={previewSource}
                    playerSettings={playerSettings}
                    adSettings={adSettings}
                  />
                )}
              </div>

            </div>
          )}
        </>
      )}

      {/* FOOTER */}
      <footer className="text-center py-6 border-t border-gray-900/50 text-xs text-gray-500 mt-12 bg-black/20">
        &copy; 2026 ClyraMotion Premium Player. All rights reserved.
        <span className="block mt-1 font-mono text-[10px] text-zinc-650">
          Powered worldwide by Cloudflare Workers serverless edge servers.
        </span>
      </footer>

    </div>
  );
}

// Simple link id finder
function demoUrlIncludesId(link: string, id: string): boolean {
  return link.includes(id);
}
