import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, UserCheck, Lock, User as UserIcon, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight, Sparkles, KeyRound, Mail, Shield } from 'lucide-react';
import { Role, User } from '../types';
import { GoogleResetPasswordModal } from './GoogleResetPasswordModal';

export const LoginScreen: React.FC = () => {
  const { login, loginWithGoogle, users, classGroup } = useApp();

  // Primary input is Google Email
  const [googleEmail, setGoogleEmail] = useState('lampusuianggraeni@gmail.com');
  const [password, setPassword] = useState('kas12345');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedRoleTab, setSelectedRoleTab] = useState<Role>('anggota');
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [showGooglePromptModal, setShowGooglePromptModal] = useState(false);

  // Anggota selector for quick demo testing
  const anggotaUsers = users.filter((u) => u.role === 'anggota');
  const [selectedAnggotaId, setSelectedAnggotaId] = useState<string>(anggotaUsers[0]?.id || 'usr-1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = googleEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMsg('Harap masukkan alamat Email Google (Gmail) untuk mengakses aplikasi.');
      return;
    }

    if (!cleanEmail.includes('@')) {
      setErrorMsg('Alamat Email Google tidak valid. Gunakan format seperti nama@gmail.com.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = login(cleanEmail, password, cleanEmail);
      if (!res.success) {
        setErrorMsg(res.message);
      }
      setLoading(false);
    }, 250);
  };

  const handleGoogleOneTap = (emailToUse: string) => {
    setErrorMsg(null);
    setLoading(true);
    setTimeout(() => {
      const res = loginWithGoogle(emailToUse);
      if (!res.success) {
        setErrorMsg(res.message);
      }
      setLoading(false);
      setShowGooglePromptModal(false);
    }, 300);
  };

  const handleRoleTabChange = (role: Role) => {
    setSelectedRoleTab(role);
    setErrorMsg(null);

    if (role === 'admin') {
      const adminUser = users.find((u) => u.role === 'admin');
      setGoogleEmail(adminUser?.googleEmail || adminUser?.email || 'admin.kas12@gmail.com');
      setPassword(adminUser?.password || 'admin123');
    } else if (role === 'bendahara') {
      const bndUser = users.find((u) => u.role === 'bendahara');
      setGoogleEmail(bndUser?.googleEmail || bndUser?.email || 'bendahara.kas12@gmail.com');
      setPassword(bndUser?.password || 'bendahara123');
    } else if (role === 'anggota') {
      const angUser = users.find((u) => u.id === selectedAnggotaId) || users.find((u) => u.role === 'anggota');
      setGoogleEmail(angUser?.googleEmail || angUser?.email || 'lampusuianggraeni@gmail.com');
      setPassword(angUser?.password || 'kas12345');
    }
  };

  const handleSelectAnggota = (userId: string) => {
    setSelectedAnggotaId(userId);
    const angUser = users.find((u) => u.id === userId);
    if (angUser) {
      setGoogleEmail(angUser.googleEmail || angUser.email || `anggota01@gmail.com`);
      setPassword(angUser.password || 'kas12345');
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* App Logo */}
        <div className="inline-flex items-center justify-center p-3.5 bg-[#2563EB] text-white rounded-3xl shadow-xl shadow-blue-500/20 mb-3">
          <span className="font-black text-2xl tracking-tighter">CF.</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
          Class Fund
        </h2>
        <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">
          Sistem Pengelolaan Kas {classGroup.name}
        </p>
        <div className="mt-2 inline-flex items-center space-x-1.5 px-3 py-1 bg-blue-100/80 text-blue-900 rounded-full text-[11px] font-bold border border-blue-200">
          <Mail className="w-3.5 h-3.5 text-blue-600" />
          <span>Akses Wajib Menggunakan Email Google</span>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl px-4">
        {/* Main Card */}
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl shadow-xl border border-slate-200/80 space-y-6">
          {/* Google Sign In One-Tap CTA */}
          <div>
            <button
              type="button"
              onClick={() => setShowGooglePromptModal(true)}
              className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-700 hover:text-slate-900 font-bold text-xs flex items-center justify-center space-x-3 shadow-sm hover:shadow-md transition-all cursor-pointer group"
            >
              {/* Official Google G Logo SVG */}
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Lanjutkan dengan Akun Google (1-Klik)</span>
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  atau masuk dengan email google & kata sandi
                </span>
              </div>
            </div>
          </div>

          {/* Quick Role Preset Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Pilih Akun Kelas Terdaftar:
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleRoleTabChange('admin')}
                className={`py-2 px-2 rounded-2xl text-xs font-black transition-all flex flex-col items-center justify-center border cursor-pointer ${
                  selectedRoleTab === 'admin'
                    ? 'bg-purple-50 border-purple-300 text-purple-700 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>👑 Admin</span>
                <span className="text-[10px] font-normal text-purple-600">Akses Penuh</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleTabChange('bendahara')}
                className={`py-2 px-2 rounded-2xl text-xs font-black transition-all flex flex-col items-center justify-center border cursor-pointer ${
                  selectedRoleTab === 'bendahara'
                    ? 'bg-blue-50 border-blue-300 text-[#2563EB] shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>💼 Bendahara</span>
                <span className="text-[10px] font-normal text-blue-600">Kas & Pengeluaran</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleTabChange('anggota')}
                className={`py-2 px-2 rounded-2xl text-xs font-black transition-all flex flex-col items-center justify-center border cursor-pointer ${
                  selectedRoleTab === 'anggota'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>🎓 Anggota</span>
                <span className="text-[10px] font-normal text-emerald-600">32 Siswa</span>
              </button>
            </div>
          </div>

          {/* Quick Info Box for Selected Role */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5">
            {selectedRoleTab === 'admin' && (
              <>
                <div className="flex items-center justify-between text-purple-900 font-bold">
                  <span className="flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <span>Administrator (Akses Penuh)</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-purple-200 text-purple-800 rounded-md font-bold">
                    Super Admin
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Dapat mengelola akun seluruh pengguna, <strong>menambah & menghapus anggota</strong>, mereset kata sandi sementara, dan konfigurasi kelas.
                </p>
                <div className="pt-1 text-[11px] font-semibold text-slate-700 flex flex-wrap gap-x-4">
                  <span>Email Google: <code className="bg-purple-100 text-purple-900 px-1.5 py-0.5 rounded font-mono">admin.kas12@gmail.com</code></span>
                </div>
              </>
            )}

            {selectedRoleTab === 'bendahara' && (
              <>
                <div className="flex items-center justify-between text-blue-900 font-bold">
                  <span className="flex items-center space-x-1.5">
                    <UserCheck className="w-4 h-4 text-[#2563EB]" />
                    <span>Bendahara Utama Kas</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-blue-200 text-blue-800 rounded-md font-bold">
                    Pengelola Kas
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Wewenang verifikasi pembayaran, catat/edit/hapus pengeluaran kas, kirim pengingat kas.
                </p>
                <div className="pt-1 text-[11px] font-semibold text-slate-700 flex flex-wrap gap-x-4">
                  <span>Email Google: <code className="bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded font-mono">bendahara.kas12@gmail.com</code></span>
                </div>
              </>
            )}

            {selectedRoleTab === 'anggota' && (
              <>
                <div className="flex items-center justify-between text-emerald-900 font-bold">
                  <span className="flex items-center space-x-1.5">
                    <UserIcon className="w-4 h-4 text-emerald-600" />
                    <span>Anggota Kelas (Siswa)</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-200 text-emerald-800 rounded-md font-bold">
                    32 Anggota
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Anggota dapat <strong>mengatur dan mengubah kata sandi pribadi sendiri</strong> secara mandiri.
                </p>
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="text-[11px] font-bold text-slate-600">Pilih Siswa:</label>
                  <select
                    value={selectedAnggotaId}
                    onChange={(e) => handleSelectAnggota(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-800"
                  >
                    {anggotaUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.googleEmail || u.email})
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start space-x-2.5 text-xs text-rose-800 font-semibold animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form Akses */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-slate-700">
                  Email Google (Gmail)
                </label>
                <span className="text-[10px] font-bold text-blue-600 flex items-center space-x-1">
                  <Mail className="w-3 h-3" />
                  <span>Wajib untuk Akses</span>
                </span>
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  placeholder="Masukkan Email Google (contoh: lampusuianggraeni@gmail.com)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-slate-700">
                  Kata Sandi Pribadi
                </label>
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(true)}
                  className="text-[10px] text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
                >
                  Lupa / Atur Ulang Sandi?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi pribadi Anda"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-[#2563EB] hover:bg-blue-700 active:scale-98 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <span>{loading ? 'Memverifikasi Email Google & Sandi...' : 'MASUK DENGAN EMAIL GOOGLE'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Self-service Password Setup CTA for Members */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 text-[11px]">Ingin atur sandi mandiri?</span>
            <button
              type="button"
              onClick={() => setIsResetModalOpen(true)}
              className="font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1 cursor-pointer text-[11px]"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Atur Sandi Baru dengan Email Google</span>
            </button>
          </div>
        </div>

        {/* Security Note Footer */}
        <div className="mt-6 text-center text-xs text-slate-400 space-y-1">
          <p className="font-bold text-slate-600 flex items-center justify-center space-x-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Kerahasiaan Sandi & Akses Email Google</span>
          </p>
          <p className="text-[11px] text-slate-500 max-w-md mx-auto">
            Aplikasi mewajibkan Email Google untuk akses. Anggota memiliki kebebasan penuh mengatur dan mengubah kata sandi pribadi yang 100% rahasia dari siapa pun.
          </p>
        </div>
      </div>

      {/* Google Reset / Set Password Modal */}
      <GoogleResetPasswordModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        defaultEmail={googleEmail}
        onSuccess={(email) => {
          setGoogleEmail(email);
        }}
      />

      {/* Google One-Tap Account Dialog Modal */}
      {showGooglePromptModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowGooglePromptModal(false);
          }}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden p-6 space-y-4 animate-scale-up">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                Pilih Akun Google untuk Masuk
              </h3>
              <p className="text-[11px] text-slate-500">
                Akses instan aplikasi Kas Kelas dengan verifikasi Email Google
              </p>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleGoogleOneTap('lampusuianggraeni@gmail.com')}
                className="w-full p-3 rounded-2xl bg-blue-50/70 hover:bg-blue-100/80 border border-blue-200 text-left flex items-center space-x-3 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  L
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-xs text-slate-900 truncate">Lampu Sui Anggraeni</p>
                  <p className="text-[11px] text-blue-700 truncate font-mono">lampusuianggraeni@gmail.com</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleGoogleOneTap('anggota01@gmail.com')}
                className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left flex items-center space-x-3 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  A
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-xs text-slate-900 truncate">Anggota #01</p>
                  <p className="text-[11px] text-slate-500 truncate font-mono">anggota01@gmail.com</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleGoogleOneTap('bendahara.kas12@gmail.com')}
                className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left flex items-center space-x-3 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  B
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-xs text-slate-900 truncate">Bendahara Utama</p>
                  <p className="text-[11px] text-slate-500 truncate font-mono">bendahara.kas12@gmail.com</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleGoogleOneTap('admin.kas12@gmail.com')}
                className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left flex items-center space-x-3 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  ADM
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-xs text-slate-900 truncate">Administrator Kas</p>
                  <p className="text-[11px] text-slate-500 truncate font-mono">admin.kas12@gmail.com</p>
                </div>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowGooglePromptModal(false)}
              className="w-full py-2 text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer text-center"
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
