import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { User } from '../types';
import { KeyRound, X, CheckCircle2, Shield, Eye, EyeOff, Lock, Sparkles, RefreshCw } from 'lucide-react';

interface ResetPasswordModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ user, isOpen, onClose }) => {
  const { updateUserPassword } = useApp();
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user && isOpen) {
      setNewPassword('');
      setToast(null);
      setErrorMsg(null);
    }
  }, [user, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  const handleGenerateRandom = () => {
    const randomPass = `kas${Math.floor(1000 + Math.random() * 9000)}`;
    setNewPassword(randomPass);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      setErrorMsg('Harap masukkan kata sandi baru.');
      return;
    }

    if (newPassword.trim().length < 4) {
      setErrorMsg('Kata sandi minimal 4 karakter.');
      return;
    }

    const res = updateUserPassword(user.id, newPassword.trim());
    if (res.success) {
      setToast(res.message);
      setErrorMsg(null);
      setTimeout(() => {
        setToast(null);
        onClose();
      }, 1800);
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-7 relative border border-slate-100 space-y-4 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Reset Kata Sandi Sementara
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Khusus jika pengguna lupa kata sandi akunnya
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Banner Privasi: Sandi Privat */}
        <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-2xl flex items-start space-x-2.5 text-amber-900">
          <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-[11px] leading-relaxed">
            <p className="font-bold text-amber-900 uppercase tracking-wider text-[10px]">
              Kebijakan Privasi Kata Sandi
            </p>
            <p className="text-amber-800">
              Kata sandi lama milik <strong>{user.name}</strong> dienkripsi secara privat dan <strong>tidak dapat dilihat oleh Admin, Bendahara, maupun sesama anggota</strong>.
            </p>
            <p className="text-amber-700 text-[10px]">
              Admin hanya dapat mengatur kata sandi sementara baru apabila siswa bersangkutan meminta reset.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 font-bold flex items-center space-x-2">
            <span className="text-xs">{errorMsg}</span>
          </div>
        )}

        {toast ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-2 text-emerald-800 font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{toast}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <p className="font-bold text-slate-900">{user.name}</p>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500">
                <span>Username: <strong className="text-slate-800">@{user.username}</strong></span>
                <span>•</span>
                <span>Role: <strong className="uppercase text-purple-700">{user.role}</strong></span>
                <span>•</span>
                <span>Google: <strong className="text-blue-700 font-mono">{user.googleEmail || user.email}</strong></span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-slate-700">
                  Kata Sandi Sementara Baru
                </label>
                <button
                  type="button"
                  onClick={handleGenerateRandom}
                  className="text-[10px] font-bold text-purple-600 hover:text-purple-800 flex items-center space-x-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Buat Sandi Acak</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={4}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Ketik kata sandi sementara baru..."
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 font-mono font-semibold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Berikan sandi sementara ini kepada pengguna dan sarankan untuk langsung menggantinya di menu Profil Saya agar sandi menjadi 100% rahasia pribadi mereka.
              </p>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="w-2/3 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Setel Sandi Sementara</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
