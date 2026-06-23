import React, { useState } from 'react';
import { VideoSource } from '../types';
import { Plus, Search, Trash2, Edit3, Link, Settings, Server, Import, Eye, Sparkles } from 'lucide-react';

interface SourceManagerProps {
  sources: VideoSource[];
  onAddSource: (src: Omit<VideoSource, 'id' | 'createdAt'>) => void;
  onUpdateSource: (id: string, src: Partial<VideoSource>) => void;
  onDeleteSource: (id: string) => void;
  onPreviewSource: (source: VideoSource) => void;
}

const SUPPORTED_HOSTS = [
  { id: 'okru', name: 'OK.ru', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  { id: 'mp4upload', name: 'MP4Upload', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  { id: 'gdrive', name: 'Google Drive', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { id: 'gphotos', name: 'Google Photos', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  { id: 'dropbox', name: 'Dropbox', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  { id: 'sendvid', name: 'Sendvid', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  { id: 'uqload', name: 'Uqload', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  { id: 'dropload', name: 'Dropload', color: 'bg-teal-500/10 text-teal-400 border-teal-500/20' },
  { id: 'mediafire', name: 'MediaFire', color: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
  { id: 'archive', name: 'Archive.org', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  { id: 'direct_hls', name: 'Direct m3u8 (HLS)', color: 'bg-pink-500/10 text-pink-400 border-pink-500/20' },
  { id: 'direct_mp4', name: 'Direct MP4/MKV', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
];

export default function SourceManager({
  sources,
  onAddSource,
  onUpdateSource,
  onDeleteSource,
  onPreviewSource,
}: SourceManagerProps) {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [isAdding, setIsAdding] = useState(false);
  const [isBulkImporting, setIsBulkImporting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [sourceType, setSourceType] = useState('okru');
  const [originalUrl, setOriginalUrl] = useState('');
  const [res1080p, setRes1080p] = useState('');
  const [res720p, setRes720p] = useState('');
  const [res480p, setRes480p] = useState('');
  const [res360p, setRes360p] = useState('');
  const [resDefault, setResDefault] = useState('');
  const [subtitleUrl, setSubtitleUrl] = useState('');
  const [subtitleLabel, setSubtitleLabel] = useState('Indonesia VTT');
  const [posterUrl, setPosterUrl] = useState('');
  const [backupUrl, setBackupUrl] = useState('');

  // Bulk Import State
  const [bulkText, setBulkText] = useState('');

  const resetForm = () => {
    setTitle('');
    setSourceType('okru');
    setOriginalUrl('');
    setRes1080p('');
    setRes720p('');
    setRes480p('');
    setRes360p('');
    setResDefault('');
    setSubtitleUrl('');
    setSubtitleLabel('Indonesia VTT');
    setPosterUrl('');
    setBackupUrl('');
    setEditingId(null);
  };

  const handleEdit = (src: VideoSource) => {
    setEditingId(src.id);
    setTitle(src.title);
    setSourceType(src.sourceType);
    setOriginalUrl(src.originalUrl);
    setRes1080p(src.resolutions['1080p'] || '');
    setRes720p(src.resolutions['720p'] || '');
    setRes480p(src.resolutions['480p'] || '');
    setRes360p(src.resolutions['360p'] || '');
    setResDefault(src.resolutions['default'] || '');
    setSubtitleUrl(src.subtitleUrl || '');
    setSubtitleLabel(src.subtitleLabel || 'Indonesia VTT');
    setPosterUrl(src.posterUrl || '');
    setBackupUrl(src.backupUrl || '');
    setIsAdding(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !originalUrl) return;

    const sourceData = {
      title,
      sourceType,
      originalUrl,
      resolutions: {
        '1080p': res1080p || undefined,
        '720p': res720p || undefined,
        '480p': res480p || undefined,
        '360p': res360p || undefined,
        'default': resDefault || undefined,
      },
      subtitleUrl: subtitleUrl || undefined,
      subtitleLabel: subtitleLabel || undefined,
      posterUrl: posterUrl || undefined,
      backupUrl: backupUrl || undefined,
    };

    if (editingId) {
      onUpdateSource(editingId, sourceData);
    } else {
      onAddSource(sourceData);
    }

    setIsAdding(false);
    resetForm();
  };

  const handleBulkImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkText.trim()) return;

    // Formats supported: 
    // Title | SourceType | URL
    // e.g.: "Sintel Movie|direct_mp4|https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
    const lines = bulkText.split('\n');
    let importedCount = 0;

    lines.forEach((line) => {
      const parts = line.split('|');
      if (parts.length >= 2) {
        const itemTitle = parts[0].trim();
        const itemUrl = parts[parts.length - 1].trim();
        const itemType = parts.length === 3 ? parts[1].trim() : 'direct_mp4';

        if (itemTitle && itemUrl) {
          onAddSource({
            title: itemTitle,
            sourceType: itemType,
            originalUrl: itemUrl,
            resolutions: {
              '720p': itemUrl, // default mapping to 720p for fast preview
            },
            subtitleLabel: 'Indonesia VTT',
          });
          importedCount++;
        }
      }
    });

    setBulkText('');
    setIsBulkImporting(false);
    alert(`Berhasil mengimpor ${importedCount} link server video!`);
  };

  const filteredSources = sources.filter((s) => {
    const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase()) || 
                          s.originalUrl.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === 'all' || s.sourceType === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-950 p-6 rounded-2xl border border-zinc-800">
        <div>
          <h2 className="text-xl font-display font-extrabold text-white flex items-center gap-2">
            <Server size={22} className="text-rose-500" />
            Management Link Server Video
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Kelola backup host, resolusi video bypass, subtitle files, dan visual thumbnail.
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto shrink-0">
          <button
            onClick={() => {
              setIsBulkImporting(true);
              setIsAdding(false);
            }}
            className="flex-1 sm:flex-none py-2 px-3.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <Import size={15} />
            Bulk Import
          </button>
          
          <button
            onClick={() => {
              setIsAdding(true);
              setIsBulkImporting(false);
              resetForm();
            }}
            className="flex-1 sm:flex-none py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-md shadow-rose-600/10"
          >
            <Plus size={15} />
            Tambah Server
          </button>
        </div>
      </div>

      {/* Bulk Import Overlay Form */}
      {isBulkImporting && (
        <form onSubmit={handleBulkImport} className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 space-y-4">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles size={16} className="text-rose-500" />
              Bypass Import Multi Link
            </h3>
            <button
              type="button"
              onClick={() => setIsBulkImporting(false)}
              className="text-xs text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
          <p className="text-xs text-zinc-400 leading-normal">
            Masukkan format link video streaming multi-baris kamu. Format baris: <code className="text-rose-450 bg-zinc-900 px-1 rounded">Nama Stream | SourceType | URL Streaming</code> atau langsung <code className="text-rose-455 bg-zinc-900 px-1 rounded">Nama Stream | URL Streaming</code>
          </p>
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            rows={5}
            className="w-full p-4 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-rose-600 text-white font-mono text-xs outline-none focus:ring-1 focus:ring-rose-600"
            placeholder={`Sintel Film Penyelamat | direct_mp4 | https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4&#10;Tears of Steel Film fiksi | okru | https://ok.ru/videoembed/908239082390`}
          />
          <button
            type="submit"
            className="w-full py-2 bg-rose-600 hover:bg-rose-500 font-semibold text-xs text-white rounded-xl transition"
          >
            Proses Ekstrak & Tambah Server
          </button>
        </form>
      )}

      {/* Adding / Editing Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 space-y-5">
          <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">
              {editingId ? 'Edit Configuration Link Server' : 'Tambah Baru Support Video Host'}
            </h3>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                resetForm();
              }}
              className="text-xs text-zinc-500 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Judul Video / Film
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 focus:border-zinc-700 text-white text-xs outline-none transition"
                placeholder="Contoh: Sintel Sci-fi CGI HD"
              />
            </div>

            {/* Source Type */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Modul Hosting Platform
              </label>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 focus:border-zinc-700 text-white text-xs outline-none transition"
              >
                {SUPPORTED_HOSTS.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Original Source URL */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Original URL (Wajib diisi)
            </label>
            <div className="relative">
              <Link size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="url"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 focus:border-zinc-700 text-white text-xs outline-none transition"
                placeholder="Contoh: https://ok.ru/videoembed/23490234023 atau direct mp4"
              />
            </div>
          </div>

          {/* Multi-Resolution configuration togglers */}
          <div className="border border-zinc-900 rounded-xl p-4 space-y-3 bg-zinc-900/10">
            <span className="block text-xs font-mono font-bold text-rose-500">
              🛠️ MULTI-RESOLUTION CHANNELS (Optional)
            </span>
            <p className="text-[10px] text-zinc-400">
              Masukkan link video direct (format mp4/mkv/hls) untuk memicu tombol ganti resolusi otomatis di player admin-panel.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">
                  HD 1080p URL
                </label>
                <input
                  type="text"
                  value={res1080p}
                  onChange={(e) => setRes1080p(e.target.value)}
                  className="w-full p-2 rounded bg-zinc-900 border border-zinc-800 text-white text-[11px] outline-none"
                  placeholder="https://server.domain/1080p.mp4"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">
                  HD 720p URL
                </label>
                <input
                  type="text"
                  value={res720p}
                  onChange={(e) => setRes720p(e.target.value)}
                  className="w-full p-2 rounded bg-zinc-900 border border-zinc-800 text-white text-[11px] outline-none"
                  placeholder="https://server.domain/720p.mp4"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">
                  SD 480p URL
                </label>
                <input
                  type="text"
                  value={res480p}
                  onChange={(e) => setRes480p(e.target.value)}
                  className="w-full p-2 rounded bg-zinc-900 border border-zinc-800 text-white text-[11px] outline-none"
                  placeholder="https://server.domain/480p.mp4"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">
                  LQ 360p URL
                </label>
                <input
                  type="text"
                  value={res360p}
                  onChange={(e) => setRes360p(e.target.value)}
                  className="w-full p-2 rounded bg-zinc-900 border border-zinc-800 text-white text-[11px] outline-none"
                  placeholder="https://server.domain/360p.mp4"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Subtitle config */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                VTT Subtitle link/track URL
              </label>
              <input
                type="text"
                value={subtitleUrl}
                onChange={(e) => setSubtitleUrl(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 face-border text-white text-xs outline-none"
                placeholder="Contoh: https://example.com/subs.vtt"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Labels (Sub Bahasa)
              </label>
              <input
                type="text"
                value={subtitleLabel}
                onChange={(e) => setSubtitleLabel(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs outline-none"
                placeholder="Contoh: Indonesia WebVTT"
              />
            </div>

            {/* Poster thumbnail & Backup URL */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Poster/Custom Thumbnail Image
              </label>
              <input
                type="text"
                value={posterUrl}
                onChange={(e) => setPosterUrl(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs outline-none"
                placeholder="Contoh: https://example.com/banner.jpg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Backup Server Link
              </label>
              <input
                type="text"
                value={backupUrl}
                onChange={(e) => setBackupUrl(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs outline-none"
                placeholder="Link cadangan jika server mati"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-3">
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                resetForm();
              }}
              className="px-4 py-2 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-lg text-xs transition"
            >
              Kembali
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-rose-600 hover:bg-rose-500 font-semibold text-xs text-white rounded-lg transition"
            >
              {editingId ? 'Simpan Perubahan' : 'Publish Server'}
            </button>
          </div>
        </form>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white text-xs outline-none transition"
            placeholder="Cari server berdasarkan nama atau domain URL..."
          />
        </div>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="p-2 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs outline-none shrink-0"
        >
          <option value="all">Semua Tipe Hosting ({sources.length})</option>
          {SUPPORTED_HOSTS.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name} ({sources.filter((s) => s.sourceType === h.id).length})
            </option>
          ))}
        </select>
      </div>

      {/* Video Source Table / Cards */}
      {filteredSources.length === 0 ? (
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl py-12 text-center">
          <p className="text-sm text-zinc-500">Tidak ada video host yang terdaftar sesuai pencarian.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSources.map((source) => {
            const hostObj = SUPPORTED_HOSTS.find((h) => h.id === source.sourceType) || {
              name: source.sourceType.toUpperCase(),
              color: 'bg-zinc-800 text-zinc-300 border-zinc-700',
            };

            const directStreamingCount = Object.values(source.resolutions).filter(Boolean).length;

            return (
              <div
                key={source.id}
                className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 flex flex-col justify-between transition-all group"
              >
                <div>
                  <div className="flex justify-between items-start gap-1 pb-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${hostObj.color}`}>
                      {hostObj.name}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      ID: {source.id}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white tracking-wide group-hover:text-rose-500 transition line-clamp-1 pb-1">
                    {source.title}
                  </h4>

                  <p className="text-[11px] text-zinc-400 font-mono break-all line-clamp-1 py-1 bg-zinc-900/40 p-1.5 rounded border border-zinc-900/60 mt-1">
                    {source.originalUrl}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {source.resolutions['1080p'] && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-zinc-900 rounded text-green-400 border border-zinc-800">1080p</span>
                    )}
                    {source.resolutions['720p'] && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-zinc-900 rounded text-blue-400 border border-zinc-800">720p</span>
                    )}
                    {source.resolutions['480p'] && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-zinc-900 rounded text-yellow-400 border border-zinc-800">480p</span>
                    )}
                    {source.resolutions['360p'] && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-zinc-900 rounded text-amber-500 border border-zinc-800">360p</span>
                    )}
                    {source.subtitleUrl && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-rose-500/10 text-rose-400 rounded border border-rose-500/20">CC: {source.subtitleLabel}</span>
                    )}
                    {source.backupUrl && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-teal-500/10 text-teal-400 rounded border border-teal-500/20">Backup Server</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-zinc-900 pt-3 mt-4">
                  <span className="text-[10px] text-zinc-500">
                    Resolusi: {directStreamingCount > 0 ? `${directStreamingCount} Speeds` : 'Standard link'}
                  </span>
                  
                  <div className="flex gap-1">
                    <button
                      onClick={() => onPreviewSource(source)}
                      className="p-1.5 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition title='Preview Player'"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => handleEdit(source)}
                      className="p-1.5 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => onDeleteSource(source.id)}
                      className="p-1.5 hover:bg-rose-500/10 rounded-lg text-zinc-500 hover:text-rose-500 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
