import { useState } from 'react';
import { generateClyraplayerWorkerCode } from '../services/workerGenerator';
import { VideoSource, PlayerSettings, AdSettings, WebsiteSettings, WorkerDeploymentConfig } from '../types';
import { Cpu, Copy, Check, ShieldCheck, Zap, Download, RefreshCw, AlertTriangle } from 'lucide-react';

interface WorkerBuilderProps {
  sources: VideoSource[];
  playerSettings: PlayerSettings;
  adSettings: AdSettings;
  webSettings: WebsiteSettings;
  workerConfig: WorkerDeploymentConfig;
  onUpdateConfig: (config: Partial<WorkerDeploymentConfig>) => void;
}

export default function WorkerBuilder({
  sources,
  playerSettings,
  adSettings,
  webSettings,
  workerConfig,
  onUpdateConfig,
}: WorkerBuilderProps) {
  const [copied, setCopied] = useState(false);

  const generatedCode = generateClyraplayerWorkerCode(
    sources,
    playerSettings,
    adSettings,
    webSettings,
    workerConfig
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedCode], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workerConfig.workerName || 'clyraplayer'}-worker.js`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Visual Header */}
      <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-display font-extrabold text-white flex items-center gap-2">
            <Cpu size={22} className="text-rose-500 animate-pulse" />
            Cloudflare Workers Code Generator
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Build, optimize, secure, and compile your custom script to run 100% serverless at edge locations.
          </p>
        </div>

        <div className="flex gap-2 w-full md:w-auto self-end md:self-center">
          <button
            onClick={handleDownload}
            className="flex-1 md:flex-none py-2 px-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <Download size={14} />
            Download Script (.js)
          </button>
          
          <button
            onClick={handleCopy}
            className="flex-1 md:flex-none py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            {copied ? <Check size={14} className="text-green-300" /> : <Copy size={14} />}
            {copied ? 'Tersalin!' : 'Copy Script'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Toggle Panel Options */}
        <div className="space-y-6">
          <div className="p-6 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display flex items-center gap-2 pb-3 border-b border-zinc-900">
              <Zap size={16} className="text-rose-500" />
              Settings Optimasi & Output
            </h3>

            {/* Worker Name */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Nama Cloudflare Worker
              </label>
              <input
                type="text"
                value={workerConfig.workerName}
                onChange={(e) => onUpdateConfig({ workerName: e.target.value })}
                className="w-full p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs outline-none"
                placeholder="clyra-player-worker"
              />
            </div>

            {/* CORS Policy */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                CORS Whitelist Origin
              </label>
              <input
                type="text"
                value={workerConfig.corsOrigins}
                onChange={(e) => onUpdateConfig({ corsOrigins: e.target.value })}
                className="w-full p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs outline-none font-mono"
                placeholder="*"
              />
              <span className="text-[10px] text-zinc-500 block mt-1">
                Gunakan * untuk mengizinkan semua domain pemutar video eksternal.
              </span>
            </div>

            {/* Edge Caching settings */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Bypass Cache TTL (Detik)
              </label>
              <input
                type="number"
                value={workerConfig.cacheTtlSeconds}
                onChange={(e) => onUpdateConfig({ cacheTtlSeconds: Number(e.target.value) })}
                className="w-full p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs outline-none"
                placeholder="Contoh: 3600"
              />
            </div>

            {/* Security Toggles */}
            <div className="space-y-3.5 pt-2 border-t border-zinc-900">
              <span className="block text-xs font-mono font-bold text-rose-500">
                🛡️ SECURITY & ANTI-HOTLINK SHIELDS
              </span>

              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-xs font-medium text-zinc-200">Anti-Bot Shield</span>
                  <span className="text-[10px] text-zinc-505 text-zinc-500">Blokir scraper tools, wget, python</span>
                </div>
                <input
                  type="checkbox"
                  checked={workerConfig.enableAntiBot}
                  onChange={(e) => onUpdateConfig({ enableAntiBot: e.target.checked })}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 bg-zinc-900 border-zinc-800 shrink-0"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-xs font-medium text-zinc-200">Batas Kuota Rate Limit</span>
                  <span className="text-[10px] text-zinc-505 text-zinc-500">Batasi request IP spamming per menit</span>
                </div>
                <input
                  type="checkbox"
                  checked={workerConfig.enableRateLimit}
                  onChange={(e) => onUpdateConfig({ enableRateLimit: e.target.checked })}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 bg-zinc-900 border-zinc-800 shrink-0"
                />
              </div>

              {workerConfig.enableRateLimit && (
                <div className="p-3 bg-zinc-900 rounded-lg space-y-1.5 border border-zinc-850">
                  <label className="block text-[10px] uppercase font-bold text-zinc-400">
                    Maks Request per Menit
                  </label>
                  <input
                    type="number"
                    value={workerConfig.rateLimitRequestCount}
                    onChange={(e) => onUpdateConfig({ rateLimitRequestCount: Number(e.target.value) })}
                    className="w-full p-2 bg-zinc-950 border border-zinc-800 text-white text-xs"
                    placeholder="60"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="p-5 bg-zinc-950 rounded-2xl border border-zinc-800 text-xs text-zinc-400 space-y-3">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-green-400" />
              Cara Deploy di Cloudflare:
            </h4>
            <ol className="list-decimal list-inside space-y-2 leading-relaxed">
              <li>Buka dashboard gratis <a href="https://dash.cloudflare.com" target="_blank" className="text-rose-455 hover:underline font-mono">dash.cloudflare.com</a></li>
              <li>Pilih menu <strong className="text-white font-medium">Workers & Pages</strong> lalu klik <strong className="text-white font-medium">Create Application</strong></li>
              <li>Buat Worker baru, lalu salin dan tempel (Paste) script Clyraplayer yang digenerate di editor panel</li>
              <li>Klik <strong className="text-white font-medium">Save and Deploy</strong></li>
              <li>Akses stream melaui link subdomain worker: <code className="bg-zinc-900 px-1 py-0.5 rounded text-rose-400 font-mono text-[10px]">https://[worker-name].[subdomain].workers.dev/play/[ID]</code></li>
            </ol>
          </div>
        </div>

        {/* Live Code Preview Frame */}
        <div className="lg:col-span-2 flex flex-col h-full">
          <div className="flex justify-between items-center bg-zinc-950 p-4 border-t border-x border-zinc-800 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
              <div className="w-2.5 h-2.5 bg-zinc-700 rounded-full" />
              <div className="w-2.5 h-2.5 bg-zinc-700 rounded-full" />
              <span className="text-xs text-zinc-400 font-mono ml-1">
                {workerConfig.workerName}.js
              </span>
            </div>

            <button
              onClick={handleCopy}
              className="px-2.5 py-1 text-[11px] bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-100 rounded-lg flex items-center gap-1.5 transition"
            >
              {copied ? <Check size={12} className="text-green-300" /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          <div className="flex-1 bg-zinc-950 border-x border-b border-zinc-800 rounded-b-2xl p-4 overflow-y-auto max-h-[580px] font-mono text-[11px] leading-relaxed text-zinc-300 font-light select-all custom-scrollbar-styling">
            <pre className="whitespace-pre-wrap word-wrap break-all">
              {generatedCode}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
