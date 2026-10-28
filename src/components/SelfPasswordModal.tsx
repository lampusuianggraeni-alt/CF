import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, CheckCircle2, AlertCircle, X, Shield, Eye, EyeOff } from 'lucide-react';

interface SelfPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  isFirstTimeSetup?: boolean;
}

export const SelfPasswordModal: React.FC<SelfPasswordModalProps> = ({
  isOpen,
  onClose,
  isFirstTimeSetup = false,
}) => {
  const { currentUser, setSelfPassword, updateUserPassword } = useApp();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setToastMsg(null);
      setErrorMsg(null);
    }
  }, [isOpen, currentUser, isFirstTimeSetup]);

  if (!isOpen) return null;

  const hasExistingCustom = currentUser.hasCustomPassword;

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setToastMsg(null);

    const cleanNew = newPassword.trim();
    if (!cleanNew) {
      setErrorMsg('Harap masukkan kata sandi baru.');
      return;
    }
    if (cleanNew.length < 4) {
      setErrorMsg('Kata sandi baru minimal harus 4 karakter.');
      return;
    }
    if (cleanNew !== confirmPassword.trim()) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok. Harap periksa kembali.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      let res;
      if (!hasExistingCustom || isFirstTimeSetup) {
        res = setSelfPassword(currentUser.id, cleanNew);
      } else {
        res = updateUserPassword(currentUser.id, cleanNew, currentPassword);
      }

      setLoading(false);
      if (res.success) {
        setToastMsg(res.message);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          onClose();
        }, 1800);
      } else {
        setErrorMsg(res.message);
      }
    }, 350);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !isFirstTimeSetup) onClose();
      }}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-linear-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                {isFirstTimeSetup ? 'Atur Kata Sandi Pertama Kali' : 'Atur & Ubah Sandi Pribadi'}
              </h2>
              <p className="text-emerald-100 text-xs font-medium">
                Akun: <strong className="text-white">{currentUser.name}</strong> • NISN: {currentUser.nisn || '-'}
              </p>
            </div>
          </div>
          {!isFirstTimeSetup && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="p-6 space-y-4">
          {/* Privacy Box */}
          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-start space-x-3 text-xs text-emerald-900">
            <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-extrabold text-[11px] uppercase tracking-wider text-emerald-950">
                Jaminan Kerahasiaan 100% Privat
              </p>
              <p className="text-[11px] leading-relaxed text-emerald-800">
                Sandi yang Anda atur ini bersifat rahasia dan terlindungi enkripsi. <strong>Admin, Bendahara, maupun sesama anggota TIDAK DAPAT melihat kata sandi Anda.</strong>
              </p>
            </div>
          </div>

          {/* Toast / Error */}
          {toastMsg && (
            <div className="p-3.5 bg-emerald-100 border border-emerald-300 rounded-2xl flex items-center space-x-2.5 text-xs font-bold text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{toastMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-2.5 text-xs font-bold text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSavePassword} className="space-y-4 text-xs">
            {hasExistingCustom && !isFirstTimeSetup && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Kata Sandi Saat Ini (Verifikasi Pemilik)
                </label>
                <div className="relative">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Masukkan kata sandi lama Anda"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 font-mono text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {hasExistingCustom ? 'Kata Sandi Baru' : 'Atur Kata Sandi Baru'}
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  required
                  minLength={4}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 4 karakter (rahasia)"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 font-mono text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Gunakan kombinasi angka dan huruf yang mudah Anda ingat.
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Ulangi Kata Sandi Baru
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ketik ulang kata sandi baru"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="pt-2 flex items-center space-x-3">
              {!isFirstTimeSetup && (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold cursor-pointer"
                >
                  Batal
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-wider flex items-center justify-center space-x-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                <span>{loading ? 'Menyimpan...' : 'Simpan Sandi Pribadi'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
