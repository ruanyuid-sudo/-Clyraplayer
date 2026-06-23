import { PlayerSettings, AdSettings, WebsiteSettings } from '../types';
import { ToggleLeft, ToggleRight, Sparkles, Sliders, Shield, Megaphone, Globe, Layers } from 'lucide-react';

interface PlayerConfiguratorProps {
  playerSettings: PlayerSettings;
  adSettings: AdSettings;
  webSettings: WebsiteSettings;
  onUpdatePlayer: (settings: Partial<PlayerSettings>) => void;
  onUpdateAds: (settings: Partial<AdSettings>) => void;
  onUpdateWeb: (settings: Partial<WebsiteSettings>) => void;
}

export default function PlayerConfigurator({
  playerSettings,
  adSettings,
  webSettings,
  onUpdatePlayer,
  onUpdateAds,
  onUpdateWeb,
}: PlayerConfiguratorProps) {
  return (
    <div className="space-y-6">
      {/* Visual Options Header */}
      <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800">
        <h2 className="text-xl font-display font-extrabold text-white flex items-center gap-2">
          <Sliders size={22} className="text-rose-500" />
          Skin & Player Engine Settings
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Sesuaikan layout website player, skin Netflix premium, server auto-skip, banner, dan penempatan sponsor iklan (Ads).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section 1: Player & Skin Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Visual Customization Card */}
          <div className="p-6 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display flex items-center gap-2 pb-3 border-b border-zinc-900">
              <Layers size={16} className="text-rose-500" />
              Engine Player & Premium Skin
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Engine Selector */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Default Player Core
                </label>
                <select
                  value={playerSettings.defaultEngine}
                  onChange={(e) => onUpdatePlayer({ defaultEngine: e.target.value as any })}
                  className="w-full p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs outline-none"
                >
                  <option value="jwplayer">JWPlayer (Optimized Streaming)</option>
                  <option value="vidstack">Vidstack (Modern Reactive HTML5)</option>
                  <option value="artplayer">Artplayer (Super lightweight + Subtitle native)</option>
                  <option value="plyr">Plyr.io (Minimalistic Clean Design)</option>
                </select>
              </div>

              {/* Skin Selection */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 font-display flex items-center gap-1">
                  Pilih Visual Skin
                  <span className="text-[10px] font-mono font-extrabold text-rose-500 animate-pulse bg-rose-500/10 px-1 rounded">HOT</span>
                </label>
                <select
                  value={playerSettings.skin}
                  onChange={(e) => onUpdatePlayer({ skin: e.target.value as any })}
                  className="w-full p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs outline-none"
                >
                  <option value="netflix">Netflix Premium Theme (Red Progress & Big Header)</option>
                  <option value="classic">Classic Obsidian</option>
                  <option value="modern">Modern Cyber Light</option>
                  <option value="synthwave">Retro Synthwave Core (Neon accents)</option>
                </select>
              </div>
            </div>

            {/* General Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/30 border border-zinc-900/80">
                <div>
                  <span className="block text-xs font-semibold text-zinc-200">Autoplay Video</span>
                  <span className="text-[10px] text-zinc-500">Putar langsung video saat loading selesai</span>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdatePlayer({ autoplay: !playerSettings.autoplay })}
                  className="text-zinc-400 hover:text-white transition"
                >
                  {playerSettings.autoplay ? (
                    <ToggleRight size={38} className="text-rose-500" />
                  ) : (
                    <ToggleLeft size={38} />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/30 border border-zinc-900/80">
                <div>
                  <span className="block text-xs font-semibold text-zinc-200">Tambahkan Overlay Logo</span>
                  <span className="text-[10px] text-zinc-500">Mencegah pembajakan dengan logo visual</span>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdatePlayer({ enableLogoOverlay: !playerSettings.enableLogoOverlay })}
                  className="text-zinc-400 hover:text-white transition"
                >
                  {playerSettings.enableLogoOverlay ? (
                    <ToggleRight size={38} className="text-rose-500" />
                  ) : (
                    <ToggleLeft size={38} />
                  )}
                </button>
              </div>
            </div>

            {/* Logo Settings input, conditional */}
            {playerSettings.enableLogoOverlay && (
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">
                    URL Logo Overlay (.png recommended)
                  </label>
                  <input
                    type="text"
                    value={playerSettings.logoOverlayUrl}
                    onChange={(e) => onUpdatePlayer({ logoOverlayUrl: e.target.value })}
                    className="w-full p-2 rounded bg-zinc-950 border border-zinc-800 text-xs text-white"
                    placeholder="https://example.com/watermark.png"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">
                    Posisi Watermark Logo
                  </label>
                  <select
                    value={playerSettings.logoOverlayPosition}
                    onChange={(e) => onUpdatePlayer({ logoOverlayPosition: e.target.value as any })}
                    className="w-full p-2 rounded bg-zinc-950 border border-zinc-800 text-xs text-white"
                  >
                    <option value="top-left">Top Left</option>
                    <option value="top-right">Top Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="bottom-right">Bottom Right</option>
                  </select>
                </div>
              </div>
            )}

            {/* More player settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Maju / Mundur Lewati (Detik)
                </label>
                <input
                  type="number"
                  value={playerSettings.forwardRewindSeconds}
                  onChange={(e) => onUpdatePlayer({ forwardRewindSeconds: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs outline-none"
                  placeholder="Detik: 10"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Interval Skip Intro / Auto-Skip (Detik)
                </label>
                <input
                  type="number"
                  value={playerSettings.autoSkipTime}
                  onChange={(e) => onUpdatePlayer({ autoSkipTime: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs outline-none"
                  placeholder="Contoh: 85 (0 jika non-aktif)"
                />
              </div>
            </div>
          </div>

          {/* Website General Settings (Site configs) */}
          <div className="p-6 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display flex items-center gap-2 pb-3 border-b border-zinc-900">
              <Globe size={16} className="text-rose-500" />
              Website Player Customization
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Nama Player Website / Branding
                </label>
                <input
                  type="text"
                  value={webSettings.siteName}
                  onChange={(e) => onUpdateWeb({ siteName: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs outline-none"
                  placeholder="Clyraplayer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Link Logo Brand Website
                </label>
                <input
                  type="text"
                  value={webSettings.siteLogo}
                  onChange={(e) => onUpdateWeb({ siteLogo: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs outline-none"
                  placeholder="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Deskripsi Website
              </label>
              <textarea
                value={webSettings.description}
                onChange={(e) => onUpdateWeb({ description: e.target.value })}
                rows={2}
                className="w-full p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs outline-none"
                placeholder="Platform server pemutar video premium support cloudflare workers bypass."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Teks Hak Cipta / Footer
                </label>
                <input
                  type="text"
                  value={webSettings.footerText}
                  onChange={(e) => onUpdateWeb({ footerText: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs outline-none"
                  placeholder="© 2026 Clyraplayer. All rights reserved."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Warna Utama Tema Visual
                </label>
                <select
                  value={webSettings.primaryColor}
                  onChange={(e) => onUpdateWeb({ primaryColor: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs outline-none"
                >
                  <option value="rose">Netflix Rose Red (Rekomendasi)</option>
                  <option value="violet">Cyber Violet Deep</option>
                  <option value="amber">Warm Amber Orange</option>
                  <option value="emerald">Light Emerald Mint</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Sponsorship Advertisement Controls */}
        <div className="space-y-6">
          <div className="p-6 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-5">
            <div className="pb-3 border-b border-zinc-900 flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display flex items-center gap-2">
                <Megaphone size={16} className="text-yellow-500 animate-bounce" />
                Iklan (Ads) Settings
              </h3>
              <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-full">
                Sponsor Active
              </span>
            </div>

            {/* Pop-under Ads configurations */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-xs font-semibold text-zinc-200">Pop-Under / Direct Link</span>
                  <span className="text-[10px] text-zinc-500">Memicu redirect tab iklan bila diklik</span>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdateAds({ enablePopAd: !adSettings.enablePopAd })}
                  className="text-zinc-400 hover:text-white transition shrink-0"
                >
                  {adSettings.enablePopAd ? (
                    <ToggleRight size={38} className="text-yellow-500" />
                  ) : (
                    <ToggleLeft size={38} />
                  )}
                </button>
              </div>

              {adSettings.enablePopAd && (
                <div className="space-y-2.5 p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                      Link Redirect Pop Ad
                    </label>
                    <input
                      type="url"
                      value={adSettings.popAdUrl}
                      onChange={(e) => onUpdateAds({ popAdUrl: e.target.value })}
                      className="w-full p-2 bg-zinc-950 border border-zinc-850 rounded text-[11px] text-white"
                      placeholder="https://sponsor.com/direct-offer"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                      Frekuensi Ganti Tab (Menit)
                    </label>
                    <input
                      type="number"
                      value={adSettings.popAdFrequencyMinutes}
                      onChange={(e) => onUpdateAds({ popAdFrequencyMinutes: Number(e.target.value) })}
                      className="w-full p-2 bg-zinc-950 border border-zinc-850 rounded text-[11px] text-white"
                      placeholder="Interval menit: 5"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Pre-Roll configurations */}
            <div className="space-y-3 border-t border-zinc-900 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-xs font-semibold text-zinc-200">Video Pre-Roll / Sponsor Intro</span>
                  <span className="text-[10px] text-zinc-500">Video promo sebelum video utama diputar</span>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdateAds({ enablePreRoll: !adSettings.enablePreRoll })}
                  className="text-zinc-400 hover:text-white transition shrink-0"
                >
                  {adSettings.enablePreRoll ? (
                    <ToggleRight size={38} className="text-yellow-500" />
                  ) : (
                    <ToggleLeft size={38} />
                  )}
                </button>
              </div>

              {adSettings.enablePreRoll && (
                <div className="space-y-2.5 p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                      Direct Video URL Intro (.mp4)
                    </label>
                    <input
                      type="url"
                      value={adSettings.preRollUrl}
                      onChange={(e) => onUpdateAds({ preRollUrl: e.target.value })}
                      className="w-full p-2 bg-zinc-950 border border-zinc-850 rounded text-[11px] text-white"
                      placeholder="https://example.com/commercial.mp4"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                      Batas tombol SKIP muncul (Detik)
                    </label>
                    <input
                      type="number"
                      value={adSettings.preRollSkipSeconds}
                      onChange={(e) => onUpdateAds({ preRollSkipSeconds: Number(e.target.value) })}
                      className="w-full p-2 bg-zinc-950 border border-zinc-850 rounded text-[11px] text-white"
                      placeholder="Contoh: 5"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Floating Banner Ads */}
            <div className="space-y-3 border-t border-zinc-900 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-xs font-semibold text-zinc-200">Responsive Banner Overlays</span>
                  <span className="text-[10px] text-zinc-505 text-zinc-500">Floating banner overlay banner di player</span>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdateAds({ enableBannerAd: !adSettings.enableBannerAd })}
                  className="text-zinc-400 hover:text-white transition shrink-0"
                >
                  {adSettings.enableBannerAd ? (
                    <ToggleRight size={38} className="text-yellow-500" />
                  ) : (
                    <ToggleLeft size={38} />
                  )}
                </button>
              </div>

              {adSettings.enableBannerAd && (
                <div className="space-y-2.5 p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                      Link URL Gambar Banner (.jpg/.png)
                    </label>
                    <input
                      type="text"
                      value={adSettings.bannerAdImage}
                      onChange={(e) => onUpdateAds({ bannerAdImage: e.target.value })}
                      className="w-full p-2 bg-zinc-950 border border-zinc-850 rounded text-[11px] text-white"
                      placeholder="https://images.unsplash.com/photo-1542751371"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                      Target Link / Web Iklan
                    </label>
                    <input
                      type="url"
                      value={adSettings.bannerAdLink}
                      onChange={(e) => onUpdateAds({ bannerAdLink: e.target.value })}
                      className="w-full p-2 bg-zinc-950 border border-zinc-850 rounded text-[11px] text-white"
                      placeholder="https://sponsor.com/landing"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
