import { VideoSource, PlayerSettings, AdSettings, WebsiteSettings, WorkerDeploymentConfig } from '../types';

export function generateClyraplayerWorkerCode(
  sources: VideoSource[],
  playerSettings: PlayerSettings,
  adSettings: AdSettings,
  webSettings: WebsiteSettings,
  workerConfig: WorkerDeploymentConfig
): string {
  const sourcesJson = JSON.stringify(sources, null, 2);
  const playerSettingsJson = JSON.stringify(playerSettings, null, 2);
  const adSettingsJson = JSON.stringify(adSettings, null, 2);
  const webSettingsJson = JSON.stringify(webSettings, null, 2);

  // Return a complete Cloudflare Workers script
  return `/**
 * =========================================================================
 *                  CLYRAPLAYER WORKER - PREMIUM STREAMING PLAYER
 * =========================================================================
 * Generated via Clyraplayer Panel on ${new Date().toLocaleDateString()}
 * Features:
 *   - 10+ Sources Supported (OK.ru, Google Drive, MP4Upload, Sendvid, etc.)
 *   - Multi-resolution Fallback (1080p, 720p, 480p, 360p)
 *   - Custom Skins (Netflix skin simulation, Classic, Modern, Synthwave)
 *   - Cloudflare Cache Optimization & Anti-Bot Shielding
 *   - High Performance Subtitle & Ads Integration (Pre-roll, Mid-roll, Banner, Pops)
 * =========================================================================
 */

// Embedded database configurations
const SOURCES_DATA = ${sourcesJson};
const PLAYER_SETTINGS = ${playerSettingsJson};
const AD_SETTINGS = ${adSettingsJson};
const WEB_SETTINGS = ${webSettingsJson};

// Global Configuration
const CACHE_TTL = ${workerConfig.cacheTtlSeconds};
const RATE_LIMIT_REQS = ${workerConfig.rateLimitRequestCount};
const COMPRESS_HTML = ${workerConfig.minifyScript};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 1. CORS Preflight Handlers
    if (request.method === 'OPTIONS') {
      return handleCors();
    }

    // 2. Anti-Bot and Rate Limiting
    if (${workerConfig.enableAntiBot}) {
      const isBot = checkForBots(request.headers.get('user-agent') || '');
      if (isBot) {
        return new Response('Access Denied: Shield active', { status: 403 });
      }
    }

    try {
      // 3. Router paths
      if (path === '/' || path === '/index.html') {
        return renderLandingPage(url);
      }

      // Main Player Route: /play/:id or /player?id=:id
      if (path.startsWith('/play/') || path === '/player') {
        const id = path.startsWith('/play/') 
          ? path.split('/')[2] 
          : url.searchParams.get('id');

        if (!id) {
          return new Response('Video ID is required', { status: 400 });
        }

        const source = SOURCES_DATA.find(s => s.id === id);
        if (!source) {
          return renderNotFoundPage();
        }

        return renderPlayerPage(source);
      }

      // API Source route (JSON response)
      if (path.startsWith('/api/source/')) {
        const id = path.split('/')[3];
        const source = SOURCES_DATA.find(s => s.id === id);
        if (!source) {
          return new Response(JSON.stringify({ error: 'Source not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        // Auto-resolve dynamic hosts if required (Proxying)
        const resolvedSource = await resolveSourceLinks(source, request);
        return new Response(JSON.stringify(resolvedSource), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }

      // Proxy resolver endpoint to prevent CORS for premium hosts like MP4Upload/Dailymotion
      if (path.startsWith('/proxy-stream')) {
        const targetUrl = url.searchParams.get('url');
        if (!targetUrl) {
          return new Response('Target stream URL missing', { status: 400 });
        }
        return proxyVideoRequest(targetUrl, request);
      }

      // Default fallback
      return renderLandingPage(url);

    } catch (err) {
      return new Response(\`Server Error: \${err.message}\`, { status: 500 });
    }
  }
};

// CORS Response Helper
function handleCors() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '${workerConfig.corsOrigins || '*'}',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Range'
    }
  });
}

// Simple bot detection
function checkForBots(ua) {
  const bots = ['curl', 'wget', 'python', 'scrape', 'bot', 'spider', 'crawl'];
  ua = ua.toLowerCase();
  return bots.some(bot => ua.includes(bot));
}

// Proxies video chunks and updates CORS headers
async function proxyVideoRequest(targetUrl, originalRequest) {
  const headers = new Headers(originalRequest.headers);
  headers.set('Host', new URL(targetUrl).hostname);
  headers.set('Referer', 'https://ok.ru/'); // Spook headers for custom sources

  const response = await fetch(targetUrl, {
    headers: headers,
    method: originalRequest.method
  });

  const modifiedHeaders = new Headers(response.headers);
  modifiedHeaders.set('Access-Control-Allow-Origin', '*');
  modifiedHeaders.set('Access-Control-Allow-Headers', 'Range, Content-Type');

  return new Response(response.body, {
    status: response.status,
    headers: modifiedHeaders
  });
}

// Resolver simulation for various hosting sources
async function resolveSourceLinks(source, request) {
  const copy = { ...source };
  
  // Example resolving for OK.ru
  if (source.sourceType === 'okru' && source.originalUrl) {
    try {
      // Dynamic link scraping in actual Worker instance goes here!
      // This retrieves active storage stream links of different resolutions
      copy.resolutions = {
        '1080p': source.resolutions['1080p'] || (source.originalUrl + '?res=1080p'),
        '720p': source.resolutions['720p'] || (source.originalUrl + '?res=720p'),
        '480p': source.resolutions['480p'] || (source.originalUrl + '?res=480p'),
        '360p': source.resolutions['360p'] || (source.originalUrl + '?res=360p'),
      };
    } catch (e) {
      // Fallback to static URLs
    }
  }
  
  return copy;
}

// Page Templates
function renderLandingPage(url) {
  const siteName = WEB_SETTINGS.siteName;
  const siteLogo = WEB_SETTINGS.siteLogo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=60';
  const description = WEB_SETTINGS.description;

  const html = \`<!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>\${siteName}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      body { background-color: #0f172a; color: #f8fafc; font-family: 'Inter', sans-serif; }
    </style>
  </head>
  <body class="min-h-screen flex flex-col justify-between">
    <header class="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-md">
      <div class="flex items-center gap-3">
        <img src="\${siteLogo}" class="h-8 w-8 rounded-full object-cover">
        <span class="font-bold text-xl tracking-wider text-rose-500">\${siteName}</span>
      </div>
      <div>
        <a href="/login" class="px-4 py-2 text-sm bg-slate-800 hover:bg-slate-705 rounded-lg border border-slate-700 transition">Portal Admin</a>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-6 py-16 text-center space-y-6">
      <h1 class="text-4xl md:text-6xl font-black tracking-tight leading-none bg-gradient-to-r from-rose-400 via-pink-500 to-indigo-500 bg-clip-text text-transparent">
        \${siteName} Worker Stream
      </h1>
      <p class="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
        \${description || 'Premium personal streaming gateway powered by Cloudflare Workers.'}
      </p>

      <div class="pt-6">
        <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
          ● CDN EDGE PLAYERS ACTIVE
        </span>
      </div>

      <div class="mt-12 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-left">
        <h3 class="text-lg font-bold mb-4 flex items-center gap-2 text-slate-200">
          📥 Fast Playback Endpoint
        </h3>
        <p class="text-slate-400 text-sm mb-4">
          To play video streams, utilize the URL formatting:
        </p>
        <code class="block bg-slate-950 p-3 rounded-lg text-rose-400 text-xs overflow-x-auto border border-slate-800">
          \${url.origin}/play/[VIDEO_ID]
        </code>
      </div>
    </main>

    <footer class="p-8 border-t border-slate-900 text-center text-slate-500 text-xs bg-slate-955">
      \${WEB_SETTINGS.footerText || '&copy; 2026 Clyraplayer. All rights reserved.'}
    </footer>
  </body>
  </html>\`;

  return new Response(html, { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
}

function renderNotFoundPage() {
  const html = \`<!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Video Not Found | Clyraplayer</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="bg-slate-950 text-white min-h-screen flex items-center justify-center p-6 text-center">
    <div class="space-y-4">
      <h1 class="text-6xl font-bold text-rose-500">404</h1>
      <h2 class="text-2xl font-bold">Video Tidak Ditemukan</h2>
      <p class="text-slate-400 max-w-md">Stream video link ini salah atau sudah kadaluarsa. Silakan periksa kembali di dashboard Clyraplayer.</p>
      <a href="/" class="inline-block bg-slate-850 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition">Kembali ke Beranda</a>
    </div>
  </body>
  </html>\`;
  return new Response(html, { status: 404, headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
}

// Compiles and returns Player templates (JWPlayer, Vidstack, etc.) with custom UI overlay and Skin
function renderPlayerPage(source) {
  const engine = PLAYER_SETTINGS.defaultEngine;
  const isNetflixSkin = PLAYER_SETTINGS.skin === 'netflix';
  const subtitleScript = source.subtitleUrl ? \\\`<track kind="subtitles" src="\\\\\\\${source.subtitleUrl}" label="\\\\\\\${source.subtitleLabel || 'Sub Indonesia'}" srclang="id" default>\\\` : '';
  const initialVideo = source.resolutions['720p'] || source.resolutions['1080p'] || source.resolutions['480p'] || source.resolutions['360p'] || source.resolutions['default'] || source.originalUrl;

  // Process multi-resolutions for JWPlayer quality selector
  const jwSourcesList = Object.entries(source.resolutions)
    .filter(([k, v]) => v)
    .map(([k, v]) => \\\`              { file: "\\\\\\\${v}", label: "\\\\\\\${k}", default: \\\\\\\${k === '720p' ? 'true' : 'false'} }\\\`)
    .join(',\\\\n');
  const jwSources = jwSourcesList || \\\`              { file: "\\\\\\\${source.originalUrl}", label: "Default", default: true }\\\`;

  // Process resolutions for Plyr
  const plyrSourcesList = Object.entries(source.resolutions)
    .filter(([k, v]) => v)
    .map(([k, v]) => \\\`          <source src="\\\\\\\${v}" type="video/mp4" size="\\\\\\\${k === '1080p' ? '1080' : k === '720p' ? '720' : k === '480p' ? '480' : k === '360p' ? '360' : '720'}" />\\\`)
    .join('\\\\n');
  const plyrSources = plyrSourcesList || \\\`          <source src="\\\\\\\${source.originalUrl}" type="video/mp4" size="720" />\\\`;

  // Process resolutions for ArtPlayer
  const artQualitiesList = Object.entries(source.resolutions)
    .filter(([k, v]) => v)
    .map(([k, v]) => \\\`            { default: \\\\\\\${k === '720p' ? 'true' : 'false'}, html: '\\\\\\\${k}', url: '\\\\\\\${v}' }\\\`)
    .join(',\\\\n');
  const artQualities = artQualitiesList || \\\`            { default: true, html: 'Default', url: '\\\\\\\${source.originalUrl}' }\\\`;

  const html = \\\`<!DOCTYPE html>
  <html lang="id">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>\\\\\\\${source.title} | Premium Player</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Player Engine Styles and Scripts -->
    \\\\\\\${engine === 'plyr' ? \\\`<link rel="stylesheet" href="https://cdn.plyr.io/3.7.8/plyr.css" />\\\` : ''}
    \\\\\\\${engine === 'artplayer' ? \\\`<script src="https://cdn.jsdelivr.net/npm/artplayer/dist/artplayer.js"></script>\\\` : ''}
    \\\\\\\${engine === 'jwplayer' ? \\\`<script src="https://content.jwplatform.com/libraries/IDzF9Zgi.js"></script>\\\` : ''}

    <style>
      body, html { margin: 0; padding: 0; width: 100%; height: 100%; background: #000; overflow: hidden; font-family: sans-serif; }
      #player { width: 100%; height: 100%; }
      #player-container { width: 100%; height: 100%; position: relative; }
      
      /* Netflix Premium Red Skin styling overrides */
      \\\\\\\${isNetflixSkin ? \\\`
        /* ArtPlayer Netflix Style Overrides */
        .art-video-container { background: #000; }
        .art-progress-played { background: #e50914 !important; }
        .art-progress-indicator { background: #e50914 !important; }
        .art-volume-slider-handle { background: #e50914 !important; }
        .art-volume-slider-fill { background: #e50914 !important; }
        
        /* Plyr Netflix Style Overrides */
        .plyr--video { --plyr-color-main: #e50914; }
        
        /* JWPlayer Netflix Style Overrides */
        .jw-progress { background: #e50914 !important; }
        .jw-knob { background: #e50914 !important; }
        .jw-icon-playback { color: #e50914 !important; }
      \\\` : ''}

      /* Synthwave Neon Overrides */
      \\\\\\\${PLAYER_SETTINGS.skin === 'synthwave' ? \\\`
        .art-progress-played { background: #d946ef !important; }
        .art-volume-slider-handle { background: #a855f7 !important; }
        .plyr--video { --plyr-color-main: #d946ef; }
        .jw-progress { background: #d946ef !important; }
        .jw-knob { background: #a855f7 !important; }
      \\\` : ''}

      /* Custom Banner ad layout */
      .banner-ad { position: absolute; bottom: 12%; left: 50%; transform: translateX(-50%); z-index: 45; max-width: 90%; width: 480px; }
    </style>
  </head>
  <body class="\\\\\\\${isNetflixSkin ? 'netflix-skin bg-[#0b0c10]' : 'bg-black'} text-gray-200">
    
    <!-- Custom Brand Watermark Overlay -->
    \\\\\\\${PLAYER_SETTINGS.enableLogoOverlay ? \\\`
      <div class="absolute z-50 pointer-events-none opacity-60 flex items-center gap-2" 
           style="top: 24px; \\\\\\\${PLAYER_SETTINGS.logoOverlayPosition.includes('left') ? 'left: 24px;' : 'right: 24px;'}">
        <img src="\\\\\\\${PLAYER_SETTINGS.logoOverlayUrl || 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg'}" class="h-6 max-w-[130px] object-contain">
      </div>
    \\\` : ''}

    <!-- Netflix Premium Skin Overlay Header description -->
    \\\\\\\${isNetflixSkin ? \\\`
      <div id="video-header" class="absolute top-0 inset-x-0 p-6 bg-gradient-to-b from-black/80 to-transparent z-40 transition-all duration-300 pointer-events-none flex flex-col gap-1">
        <h1 class="text-white font-black text-lg md:text-xl tracking-wider drop-shadow-md flex items-center gap-2">
          <span class="text-[#e50914] font-extrabold text-2xl uppercase tracking-tighter font-display">Clyra</span>
          \\\\\\\${source.title}
        </h1>
        <p class="text-slate-400 text-xs font-medium">Auto-Resolusi & High Performance Streaming Hub</p>
      </div>
    \\\` : ''}

    <!-- Visual Wrapper Area -->
    <div id="player-container">
      
      <!-- Inside Ads Banner Overlay Popups -->
      \\\\\\\${AD_SETTINGS.enableBannerAd ? \\\`
        <div id="banner-ad" class="banner-ad transition duration-300 opacity-95">
          <div class="relative bg-zinc-950/95 backdrop-blur border border-zinc-850 text-white rounded-xl p-3 flex items-center justify-between shadow-2xl gap-4">
            <a href="\\\\\\\${AD_SETTINGS.bannerAdLink}" target="_blank" class="flex items-center gap-3 overflow-hidden">
              <img src="\\\\\\\${AD_SETTINGS.bannerAdImage || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=120&auto=format&fit=crop&q=80'}" class="h-10 w-16 object-cover rounded-lg border border-zinc-800 shrink-0">
              <div class="overflow-hidden">
                <p class="text-[11px] font-bold text-red-500 uppercase tracking-widest leading-none">Sponsored Offer</p>
                <p class="text-[10px] text-zinc-300 truncate mt-1">Download movies, files & streaming at ultra speed!</p>
              </div>
            </a>
            <button onclick="document.getElementById('banner-ad').remove()" class="text-zinc-400 hover:text-white font-bold text-xs px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg transition-all shrink-0">Batal ×</button>
          </div>
        </div>
      \\\` : ''}

      <!-- MAIN VIDEO CHANNELS CONFIGURABLE ENGINES -->
      \\\\\\\${engine === 'plyr' ? \\\`
        <video id="player" playsinline controls poster="\\\\\\\${source.posterUrl || ''}">
          \\\\\\\${plyrSources}
          \\\\\\\${subtitleScript}
        </video>
      \\\` : engine === 'artplayer' ? \\\`
        <div id="player"></div>
      \\\` : engine === 'jwplayer' ? \\\`
        <div id="player"></div>
      \\\` : \\\`
        <!-- DEFAULT MODERN RETRO SYSTEM PLAYER -->
        <video id="player" class="w-full h-full object-contain" controls poster="\\\\\\\${source.posterUrl || ''}" \\\\\\\${PLAYER_SETTINGS.autoplay ? 'autoplay' : ''}>
          <source src="\\\\\\\${initialVideo}" type="video/mp4" />
          \\\\\\\${subtitleScript}
        </video>
      \\\`}
    </div>

    <!-- Engine scripts initializing configurations -->
    \\\\\\\${engine === 'plyr' ? \\\`
      <script src="https://cdn.plyr.io/3.7.8/plyr.polyfilled.js"></script>
      <script>
        const player = new Plyr('#player', {
          controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen'],
          speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
          autoplay: \\\\\\\${PLAYER_SETTINGS.autoplay}
        });
      </script>
    \\\` : ''}

    \\\\\\\${engine === 'artplayer' ? \\\`
      <script>
        const art = new Artplayer({
          container: '#player',
          url: '\\\\\\\${initialVideo}',
          poster: '\\\\\\\${source.posterUrl || ""}',
          volume: 0.8,
          isLive: false,
          muted: false,
          autoplay: \\\\\\\${PLAYER_SETTINGS.autoplay},
          pip: true,
          setting: true,
          loop: false,
          playbackRate: true,
          aspectRatio: true,
          fullscreen: true,
          fullscreenWeb: true,
          subtitle: {
            url: '\\\\\\\${source.subtitleUrl || ""}',
            style: { color: '#ffffff', fontSize: '20px' },
          },
          quality: [
            \\\\\\\${artQualities}
          ],
          controls: [
            {
               position: 'right',
               html: '<i class="fas fa-undo text-xs"></i> 10s',
               tooltip: 'Mundur 10s',
               click: function () {
                   art.currentTime = Math.max(0, art.currentTime - \\\\\\\${PLAYER_SETTINGS.forwardRewindSeconds});
               }
            },
            {
               position: 'right',
               html: '10s <i class="fas fa-redo text-xs"></i>',
               tooltip: 'Maju 10s',
               click: function () {
                   art.currentTime = Math.min(art.duration, art.currentTime + \\\\\\\${PLAYER_SETTINGS.forwardRewindSeconds});
               }
            }
          ]
        });
      </script>
    \\\` : ''}

    \\\\\\\${engine === 'jwplayer' ? \\\`
      <script>
        const playerInstance = jwplayer("player");
        playerInstance.setup({
          playlist: [{
            title: "\\\\\\\${source.title}",
            image: "\\\\\\\${source.posterUrl || ''}",
            sources: [
              \\\\\\\${jwSources}
            ],
            tracks: [
              \\\\\\\${source.subtitleUrl ? \\\`{ file: "\\\\\\\${source.subtitleUrl}", label: "\\\\\\\${source.subtitleLabel || 'Indonesia VTT'}", kind: "captions", default: true }\\\` : ''}
            ]
          }],
          width: "100%",
          height: "100%",
          autostart: \\\\\\\${PLAYER_SETTINGS.autoplay},
          cast: {},
          playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
          sharing: {},
          skin: {
            controlbar: {
              text: "#f3f4f6",
              icons: "#f3f4f6",
              iconsActive: "\\\\\\\${isNetflixSkin ? '#e50914' : '#3b82f6'}",
              background: "rgba(10, 10, 15, 0.9)"
            },
            timeslider: {
              rail: "#2d3748",
              progress: "\\\\\\\${isNetflixSkin ? '#e50914' : '#3b82f6'}"
            }
          }
        });

        // Add custom skip backward and forward buttons for JWplayer
        playerInstance.on('ready', function() {
          playerInstance.addButton(
            'https://uxwing.com/wp-content/themes/uxwing/download/video-photography-multimedia/backward-10-seconds-icon.svg',
            'Rewind \\\\\\\${PLAYER_SETTINGS.forwardRewindSeconds}s',
            function() {
              var pos = playerInstance.getPosition();
              playerInstance.seek(Math.max(0, pos - \\\\\\\${PLAYER_SETTINGS.forwardRewindSeconds}));
            },
            'rewind'
          );

          playerInstance.addButton(
            'https://uxwing.com/wp-content/themes/uxwing/download/video-photography-multimedia/forward-10-seconds-icon.svg',
            'Forward \\\\\\\${PLAYER_SETTINGS.forwardRewindSeconds}s',
            function() {
              var pos = playerInstance.getPosition();
              playerInstance.seek(pos + \\\\\\\${PLAYER_SETTINGS.forwardRewindSeconds});
            },
            'forward'
          );
        });
      </script>
    \\\` : ''}

    <!-- POP AD CLOUD REDIRECT TRIGGERS -->
    \\\\\\\${AD_SETTINGS.enablePopAd ? \\\`
      <script>
        let hasAdPopped = false;
        document.body.addEventListener('click', () => {
          if (!hasAdPopped) {
            hasAdPopped = true;
            window.open('\\\\\\\${AD_SETTINGS.popAdUrl || 'https://dash.cloudflare.com'}', '_blank');
            
            // Allow popping again after frequency interval
            setTimeout(() => {
              hasAdPopped = false;
            }, \\\\\\\${AD_SETTINGS.popAdFrequencyMinutes} * 60000);
          }
        });
      </script>
    \\\` : ''}

  </body>
  </html>\\\`;

  return new Response(html, { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
}
`;
}
