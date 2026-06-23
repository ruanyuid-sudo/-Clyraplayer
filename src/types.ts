export interface VideoSource {
  id: string;
  title: string;
  sourceType: string; // 'okru' | 'mp4upload' | 'gdrive' | 'gphotos' | 'dropbox' | 'mediafire' | 'yandex' | 'archive' | 'direct_hls' | 'direct_mp4' | 'sendvid' | 'uqload' | 'dropload' | 'sendvid' | 'flickr' | 'thetube' | string;
  originalUrl: string;
  resolutions: {
    '1080p'?: string;
    '720p'?: string;
    '480p'?: string;
    '360p'?: string;
    'default'?: string;
  };
  subtitleUrl?: string;
  subtitleLabel?: string;
  posterUrl?: string;
  backupUrl?: string;
  createdAt: number;
}

export type PlayerEngine = 'jwplayer' | 'vidstack' | 'artplayer' | 'plyr';
export type PlayerSkin = 'netflix' | 'classic' | 'modern' | 'synthwave';

export interface PlayerSettings {
  defaultEngine: PlayerEngine;
  skin: PlayerSkin;
  autoplay: boolean;
  forwardRewindSeconds: number;
  enableLogoOverlay: boolean;
  logoOverlayUrl: string;
  logoOverlayPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  autoSkipTime: number; // 0 to disable, or seconds to show dynamic auto-skip button
  playbackSpeeds: number[];
  enableKeyboardShortcuts: boolean;
  theaterMode: boolean;
}

export interface AdSettings {
  enablePreRoll: boolean;
  preRollUrl: string; // Video URL or banner or custom ad script link
  preRollSkipSeconds: number;
  enableMidRoll: boolean;
  midRollTimeSeconds: number;
  midRollUrl: string;
  enableBannerAd: boolean;
  bannerAdImage: string;
  bannerAdLink: string;
  enablePopAd: boolean;
  popAdUrl: string;
  popAdFrequencyMinutes: number;
}

export interface WebsiteSettings {
  siteName: string;
  siteLogo: string;
  description: string;
  footerText: string;
  primaryColor: string; // Tailwind color class or hex
  theme: 'dark' | 'light';
  allowPublicUpload: boolean;
  apiToken: string;
}

export interface WorkerDeploymentConfig {
  workerName: string;
  cacheTtlSeconds: number;
  enableAntiBot: boolean;
  enableRateLimit: boolean;
  rateLimitRequestCount: number;
  corsOrigins: string;
  cloudflareAccountEmail: string;
  minifyScript: boolean;
}
