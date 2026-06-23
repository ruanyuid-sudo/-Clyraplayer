import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ShieldAlert } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [username, setUsername] = useState('ruanyuid');
  const [password, setPassword] = useState('ruanyuid');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate quick server validation
    setTimeout(() => {
      if (username === 'ruanyuid' && password === 'ruanyuid') {
        onLoginSuccess();
      } else {
        setError('Kombinasi Username atau Password salah!');
      }
      setLoading(false);
    }, 450);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-950/85 backdrop-blur-md rounded-2xl border border-zinc-800 p-8 shadow-2xl relative overflow-hidden">
        {/* Glow behind logo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-rose-600/10 blur-3xl rounded-full -z-10" />

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-full text-xs font-mono font-bold uppercase tracking-widest mb-3 select-none">
            ● Secure Console
          </div>
          <h2 className="text-3xl font-display font-extrabold text-white tracking-tight">
            CLYRA<span className="text-rose-600">PLAYER</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1.5 font-sans">
            Admin Management Gateway & CF Workers Compiler
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex gap-2.5 items-center text-sm text-rose-455">
            <ShieldAlert size={18} className="text-rose-500 shrink-0" />
            <span className="font-medium text-xs">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Username Admin
            </label>
            <div className="relative">
              <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-rose-600 text-white text-sm placeholder-zinc-600 outline-none transition"
                placeholder="Masukkan username..."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-rose-600 text-white text-sm placeholder-zinc-600 outline-none transition"
                placeholder="Masukkan password..."
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 active:scale-[0.98] text-white font-semibold text-sm transition shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Masuk ke Panel Control'
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-zinc-900 text-center space-y-1.5">
          <p className="text-[11px] text-zinc-500 font-mono">
            Default Developer Credentials:
          </p>
          <div className="inline-flex gap-4 px-3 py-1 bg-zinc-905 rounded-md border border-zinc-900 text-[11px] font-mono select-all">
            <span className="text-zinc-400">user: <strong className="text-rose-500">ruanyuid</strong></span>
            <span className="text-zinc-500">|</span>
            <span className="text-zinc-400">pass: <strong className="text-rose-500">ruanyuid</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
