import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Upload, 
  Camera, 
  Sparkles, 
  Check, 
  CheckCircle2, 
  AlertCircle, 
  User as UserIcon, 
  AtSign, 
  Phone, 
  Mail, 
  Hash, 
  ShieldCheck, 
  Eye, 
  EyeOff,
  RefreshCw, 
  Link as LinkIcon,
  BadgeCheck,
  CreditCard,
  Lock,
  KeyRound,
  Shield
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=300&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=300&h=300&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&h=300&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=faces',
  // Vector/Illustration avatars
  'https://api.dicebear.com/7.x/bottts/svg?seed=kasku1',
  'https://api.dicebear.com/7.x/bottts/svg?seed=kasku2',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=felix',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=aneka',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=happy',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=luna',
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateUser, updateUserPassword, setSelfPassword, users, classGroup } = useApp();

  // Form states initialized with currentUser data
  const [name, setName] = useState<string>(currentUser.name);
  const [username, setUsername] = useState<string>(currentUser.username || '');
  const [nisn, setNisn] = useState<string>(currentUser.nisn || '');
  const [phone, setPhone] = useState<string>(currentUser.phone || '');
  const [email, setEmail] = useState<string>(currentUser.email || '');
  const [avatar, setAvatar] = useState<string>(currentUser.avatar);

  // Photo tab options: 'upload' | 'preset' | 'url'
  const [photoSubTab, setPhotoSubTab] = useState<'upload' | 'preset' | 'url'>('upload');
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [dragOver, setDragOver] = useState<boolean>(false);

  // Private Password Change states
  const [showPasswordSection, setShowPasswordSection] = useState<boolean>(false);
  const [currentPasswordInput, setCurrentPasswordInput] = useState<string>('');
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState<string>('');
  const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [passwordToast, setPasswordToast] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);

  // Validation & UI states
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Re-sync whenever user or modal open changes
  useEffect(() => {
    if (isOpen && currentUser) {
      setName(currentUser.name);
      setUsername(currentUser.username || '');
      setNisn(currentUser.nisn || '');
      setPhone(currentUser.phone || '');
      setEmail(currentUser.email || '');
      setAvatar(currentUser.avatar);
      setErrorMsg(null);
      setSuccessToast(null);

      // Reset password change form
      setCurrentPasswordInput('');
      setNewPasswordInput('');
      setConfirmPasswordInput('');
      setPasswordToast(null);
      setPasswordError(null);
      setShowPasswordSection(false);
    }
  }, [isOpen, currentUser]);

  // Support ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Handle local file upload with Canvas compression (square 300x300)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Harap pilih file gambar (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('Ukuran file gambar maksimal 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 300;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, 300, 300);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
          setAvatar(dataUrl);
        } else {
          setAvatar(event.target?.result as string);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    setErrorMsg(null);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 300;
          canvas.height = 300;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const minDim = Math.min(img.width, img.height);
            const sx = (img.width - minDim) / 2;
            const sy = (img.height - minDim) / 2;
            ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, 300, 300);
            setAvatar(canvas.toDataURL('image/jpeg', 0.88));
          } else {
            setAvatar(event.target?.result as string);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      setErrorMsg('Format file tidak didukung. Harap masukkan file gambar.');
    }
  };

  const handleApplyUrl = () => {
    if (!customUrlInput.trim()) return;
    setAvatar(customUrlInput.trim());
    setCustomUrlInput('');
  };

  const handleResetAvatar = () => {
    const defaultAvatar = `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`;
    setAvatar(defaultAvatar);
  };

  // Form submit handler with validation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const isAdmin = currentUser.role === 'admin';
    const cleanName = isAdmin ? name.trim() : currentUser.name;
    const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '');
    const cleanNisn = isAdmin ? nisn.trim() : (currentUser.nisn || '');
    const cleanPhone = phone.trim();
    const cleanEmail = email.trim();

    if (isAdmin && !cleanName) {
      setErrorMsg('Nama lengkap tidak boleh kosong.');
      return;
    }

    if (!cleanUsername) {
      setErrorMsg('Username akun tidak boleh kosong.');
      return;
    }

    if (cleanUsername.length < 3) {
      setErrorMsg('Username minimal harus 3 karakter (huruf, angka, atau garis bawah).');
      return;
    }

    // Check if username is already taken by another user
    const usernameTaken = users.some(
      (u) => u.id !== currentUser.id && u.username?.toLowerCase() === cleanUsername
    );
    if (usernameTaken) {
      setErrorMsg(`Username "@${cleanUsername}" sudah digunakan oleh pengguna lain. Silakan pilih username yang berbeda.`);
      return;
    }

    setIsSaving(true);

    try {
      updateUser(currentUser.id, {
        ...(isAdmin ? { name: cleanName, nisn: cleanNisn } : {}),
        username: cleanUsername,
        phone: cleanPhone,
        email: cleanEmail,
        avatar: avatar,
      });

      setSuccessToast('Profil berhasil disimpan! Foto, username, & kontak Anda kini tersinkronisasi.');
      setIsSaving(false);

      setTimeout(() => {
        onClose();
      }, 1300);
    } catch {
      setErrorMsg('Terjadi kesalahan saat menyimpan profil. Silakan coba lagi.');
      setIsSaving(false);
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordToast(null);

    const cleanNew = newPasswordInput.trim();
    const hasCustom = currentUser.hasCustomPassword;

    if (hasCustom && !currentPasswordInput) {
      setPasswordError('Harap masukkan kata sandi Anda saat ini untuk verifikasi.');
      return;
    }
    if (!cleanNew) {
      setPasswordError('Harap masukkan kata sandi baru Anda.');
      return;
    }
    if (cleanNew.length < 4) {
      setPasswordError('Kata sandi baru minimal harus 4 karakter.');
      return;
    }
    if (cleanNew !== confirmPasswordInput.trim()) {
      setPasswordError('Konfirmasi kata sandi baru tidak cocok. Silakan ketik ulang.');
      return;
    }

    setIsChangingPassword(true);
    setTimeout(() => {
      let res;
      if (!hasCustom) {
        res = setSelfPassword(currentUser.id, cleanNew);
      } else {
        res = updateUserPassword(currentUser.id, cleanNew, currentPasswordInput);
      }

      if (res.success) {
        setPasswordToast(res.message);
        setCurrentPasswordInput('');
        setNewPasswordInput('');
        setConfirmPasswordInput('');
      } else {
        setPasswordError(res.message);
      }
      setIsChangingPassword(false);
    }, 400);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-100 overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-linear-to-r from-[#2563EB] to-blue-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/15 rounded-2xl backdrop-blur-md">
              <UserIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                Pengaturan Profil & Akun Siswa
              </h2>
              <p className="text-xs text-blue-100 font-medium">
                Kelola foto profil, username login, dan info akun Anda
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/15 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-7 space-y-6 flex-1 text-xs">
          
          {/* Banner Transparansi: Dilihat oleh Bendahara */}
          <div className="p-4 rounded-2xl bg-blue-50/90 border border-blue-200/90 flex items-start space-x-3 text-blue-900">
            <div className="p-2 bg-blue-600 text-white rounded-xl shrink-0 mt-0.5 shadow-xs">
              <Eye className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <p className="font-black text-xs uppercase tracking-wider flex items-center space-x-1.5">
                <span>Foto & Data Anda Dapat Dilihat Langsung oleh Bendahara</span>
                <span className="px-2 py-0.2 bg-blue-200 text-blue-900 rounded-full text-[9px] font-bold">
                  Transparan
                </span>
              </p>
              <p className="text-[11px] text-blue-800 leading-relaxed font-medium">
                Foto profil, username, dan nama yang Anda pasang akan otomatis muncul di tabel checklist setoran kas, verifikasi bukti transfer, riwayat kas, dan struk digital kelas sehingga Bendahara mudah mengenali identitas Anda.
              </p>
            </div>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 font-bold flex items-center space-x-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successToast && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 font-bold flex items-center space-x-2 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successToast}</span>
            </div>
          )}

          {/* BAGIAN 1: FOTO PROFIL */}
          <div className="space-y-4 bg-slate-50/80 p-5 rounded-3xl border border-slate-200/80">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
                  <Camera className="w-4 h-4 text-[#2563EB]" />
                  <span>1. Foto Profil Siswa</span>
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Tambahkan foto asli atau pilih avatar menarik yang mudah dikenali oleh bendahara
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetAvatar}
                className="text-[10px] text-slate-500 hover:text-slate-800 font-bold underline cursor-pointer"
              >
                Reset Bawaan
              </button>
            </div>

            {/* Avatar Preview Display */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pt-2">
              <div className="relative group shrink-0">
                <img
                  src={avatar}
                  alt="Avatar Preview"
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-white shadow-lg ring-4 ring-blue-500/20"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1.5 -right-1.5 p-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-2xl shadow-md border-2 border-white transition-transform hover:scale-110 cursor-pointer"
                  title="Pilih foto dari file"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 w-full space-y-3">
                {/* Photo Tabs */}
                <div className="flex border-b border-slate-200">
                  <button
                    type="button"
                    onClick={() => setPhotoSubTab('upload')}
                    className={`pb-2 px-3 text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 border-b-2 transition-all cursor-pointer ${
                      photoSubTab === 'upload'
                        ? 'border-[#2563EB] text-[#2563EB]'
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload Foto</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoSubTab('preset')}
                    className={`pb-2 px-3 text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 border-b-2 transition-all cursor-pointer ${
                      photoSubTab === 'preset'
                        ? 'border-[#2563EB] text-[#2563EB]'
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Pilihan Avatar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoSubTab('url')}
                    className={`pb-2 px-3 text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 border-b-2 transition-all cursor-pointer ${
                      photoSubTab === 'url'
                        ? 'border-[#2563EB] text-[#2563EB]'
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <LinkIcon className="w-3 h-3" />
                    <span>Link URL</span>
                  </button>
                </div>

                {/* SubTab 1: Upload */}
                {photoSubTab === 'upload' && (
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/png, image/jpeg, image/webp"
                      className="hidden"
                    />
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                      }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                        dragOver
                          ? 'border-[#2563EB] bg-blue-50/60 scale-[1.01]'
                          : 'border-slate-300 hover:border-[#2563EB] hover:bg-white'
                      }`}
                    >
                      <Upload className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                      <p className="font-extrabold text-slate-800 text-xs">
                        Klik untuk Unggah Foto dari Galeri / Kamera
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        JPG, PNG, atau WebP (Otomatis dipotong rapi 1:1)
                      </p>
                    </div>
                  </div>
                )}

                {/* SubTab 2: Presets */}
                {photoSubTab === 'preset' && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Klik salah satu avatar untuk memilih:
                    </p>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 max-h-36 overflow-y-auto p-1 bg-white rounded-2xl border border-slate-200">
                      {PRESET_AVATARS.map((url, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAvatar(url)}
                          className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all cursor-pointer ${
                            avatar === url
                              ? 'border-[#2563EB] ring-2 ring-blue-500 scale-105 shadow-md'
                              : 'border-slate-200 hover:border-slate-400'
                          }`}
                        >
                          <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                          {avatar === url && (
                            <div className="absolute inset-0 bg-[#2563EB]/40 flex items-center justify-center">
                              <Check className="w-4 h-4 text-white stroke-[3]" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* SubTab 3: URL */}
                {photoSubTab === 'url' && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="url"
                      placeholder="https://contoh.com/foto-saya.jpg"
                      value={customUrlInput}
                      onChange={(e) => setCustomUrlInput(e.target.value)}
                      className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#2563EB] focus:outline-none bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleApplyUrl}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black text-xs uppercase tracking-wider cursor-pointer"
                    >
                      Pasang
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* BAGIAN 2: IDENTITAS AKUN & KREDENSIAL */}
          <div className="space-y-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
                <AtSign className="w-4 h-4 text-[#2563EB]" />
                <span>2. Identitas Akun & Informasi Login</span>
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Data ini digunakan untuk login dan pencatatan resmi di kas kelas
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Field: Nama Lengkap Siswa (Hanya Admin yang bisa ubah) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block font-black text-slate-700 uppercase tracking-wider text-[11px] flex items-center space-x-1">
                    <span>Nama Lengkap Siswa</span>
                    {currentUser.role === 'admin' && <span className="text-rose-500">*</span>}
                  </label>
                  {currentUser.role !== 'admin' && (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[9px] font-black uppercase">
                      <Lock className="w-2.5 h-2.5 text-slate-600" />
                      <span>Dikunci Admin</span>
                    </span>
                  )}
                </div>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    readOnly={currentUser.role !== 'admin'}
                    disabled={currentUser.role !== 'admin'}
                    value={name}
                    onChange={(e) => {
                      if (currentUser.role === 'admin') setName(e.target.value);
                    }}
                    placeholder="Masukkan Nama Lengkap Siswa"
                    className={`w-full pl-9 pr-3.5 py-2.5 rounded-2xl border text-xs font-bold focus:outline-none ${
                      currentUser.role === 'admin'
                        ? 'border-slate-200 text-slate-900 focus:ring-2 focus:ring-[#2563EB] bg-slate-50 focus:bg-white'
                        : 'border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed select-none'
                    }`}
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  {currentUser.role === 'admin'
                    ? 'Sebagai Admin, Anda dapat mengubah nama lengkap ini.'
                    : 'Nama lengkap resmi hanya dapat diubah oleh Administrator.'}
                </p>
              </div>

              {/* Field: NISN Siswa (Hanya Admin yang bisa ubah) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block font-black text-slate-700 uppercase tracking-wider text-[11px] flex items-center space-x-1">
                    <span>NISN Siswa</span>
                    {currentUser.role === 'admin' && <span className="text-rose-500">*</span>}
                  </label>
                  {currentUser.role !== 'admin' && (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[9px] font-black uppercase">
                      <Lock className="w-2.5 h-2.5 text-slate-600" />
                      <span>Dikunci Admin</span>
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    readOnly={currentUser.role !== 'admin'}
                    disabled={currentUser.role !== 'admin'}
                    value={nisn}
                    onChange={(e) => {
                      if (currentUser.role === 'admin') setNisn(e.target.value);
                    }}
                    placeholder="contoh: 0061234501"
                    className={`w-full pl-9 pr-3.5 py-2.5 rounded-2xl border text-xs font-mono font-bold focus:outline-none ${
                      currentUser.role === 'admin'
                        ? 'border-slate-200 text-slate-900 focus:ring-2 focus:ring-[#2563EB] bg-slate-50 focus:bg-white'
                        : 'border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed select-none'
                    }`}
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  {currentUser.role === 'admin'
                    ? 'Sebagai Admin, Anda dapat memperbarui NISN ini.'
                    : 'NISN resmi tidak dapat diubah sendiri (hanya oleh Admin).'}
                </p>
              </div>

              {/* Field: Username Akun */}
              <div className="space-y-1.5">
                <label className="block font-black text-slate-700 uppercase tracking-wider text-[11px] flex items-center space-x-1">
                  <span>Username Akun (@)</span>
                  <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold">
                    @
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    placeholder="nama_pengguna"
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#2563EB] focus:outline-none bg-slate-50 focus:bg-white"
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  ID pendek akun di dalam kelas.
                </p>
              </div>

              {/* Field: Nomor WhatsApp / HP */}
              <div className="space-y-1.5">
                <label className="block font-black text-slate-700 uppercase tracking-wider text-[11px]">
                  Nomor WhatsApp / HP
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08123456789"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#2563EB] focus:outline-none bg-slate-50 focus:bg-white"
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  Memudahkan Bendahara menghubungi Anda terkait kas.
                </p>
              </div>
            </div>
          </div>

          {/* BAGIAN 3: KEAMANAN & KATA SANDI PRIBADI */}
          <div className="space-y-3 p-4 sm:p-5 rounded-3xl bg-slate-50 border border-slate-200/90">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider">
                    3. Keamanan & Sandi Akun Privat
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Atur kata sandi rahasia yang hanya Anda sendiri yang tahu
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-[10px] font-black border border-emerald-300 self-start sm:self-auto">
                <Shield className="w-3 h-3" />
                <span>100% Privat & Terenkripsi</span>
              </span>
            </div>

            {/* Jaminan Privasi Box */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 space-y-1">
              <p className="font-extrabold text-[11px] flex items-center space-x-1.5 text-emerald-900">
                <Lock className="w-3.5 h-3.5 text-emerald-700" />
                <span>Jaminan Privasi: Tidak Bisa Dilihat Siapapun</span>
              </p>
              <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">
                Kata sandi Anda tersimpan secara privat. <strong>Sesama siswa, Bendahara, maupun Admin TIDAK DAPAT MELIHAT kata sandi ini</strong>. Anda memegang kendali penuh atas keamanan akun Anda.
              </p>
            </div>

            {/* Password Feedback */}
            {passwordError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 font-bold flex items-center space-x-2 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordToast && (
              <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-900 font-bold flex items-center space-x-2 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{passwordToast}</span>
              </div>
            )}

            {/* Accordion or Form toggle */}
            {!showPasswordSection ? (
              <button
                type="button"
                onClick={() => setShowPasswordSection(true)}
                className="w-full py-2.5 px-4 rounded-2xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-xs flex items-center justify-center space-x-2 shadow-xs transition-colors cursor-pointer"
              >
                <KeyRound className="w-4 h-4 text-emerald-600" />
                <span>{currentUser.hasCustomPassword ? 'Ganti / Perbarui Kata Sandi Pribadi Saya' : 'Atur Kata Sandi Pribadi Saya'}</span>
              </button>
            ) : (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Current Password - only needed if user already has custom password */}
                  {currentUser.hasCustomPassword && (
                    <div className="space-y-1 sm:col-span-2">
                      <label className="block font-bold text-slate-700 text-[11px]">
                        Kata Sandi Saat Ini (Verifikasi Pemilik)
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={currentPasswordInput}
                          onChange={(e) => setCurrentPasswordInput(e.target.value)}
                          placeholder="Ketik kata sandi Anda saat ini"
                          className="w-full pl-3.5 pr-10 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* New Password */}
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700 text-[11px]">
                      {currentUser.hasCustomPassword ? 'Kata Sandi Baru' : 'Atur Kata Sandi Baru'}
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPasswordInput}
                        onChange={(e) => setNewPasswordInput(e.target.value)}
                        placeholder="Minimal 4 karakter"
                        className="w-full pl-3.5 pr-10 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700 text-[11px]">
                      Ulangi Kata Sandi Baru
                    </label>
                    <input
                      type="password"
                      value={confirmPasswordInput}
                      onChange={(e) => setConfirmPasswordInput(e.target.value)}
                      placeholder="Ketik ulang kata sandi baru"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordSection(false);
                      setPasswordError(null);
                      setPasswordToast(null);
                    }}
                    className="py-2 px-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleChangePassword}
                    disabled={isChangingPassword}
                    className="flex-1 py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>{isChangingPassword ? 'Menyimpan Sandi...' : 'Simpan Kata Sandi Privat'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* BAGIAN 4: PRATINJAU KARTU SISWA (BAGAIMANA BENDAHARA MELIHATNYA) */}
          <div className="p-4 rounded-3xl bg-linear-to-br from-slate-900 to-slate-800 text-white space-y-3 shadow-md border border-slate-700">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-700/80 pb-2">
              <span className="flex items-center space-x-1.5 text-blue-300">
                <BadgeCheck className="w-3.5 h-3.5" />
                <span>Pratinjau Kartu Siswa di Layar Bendahara</span>
              </span>
              <span>{classGroup.name}</span>
            </div>

            <div className="flex items-center space-x-3.5">
              <img
                src={avatar}
                alt={name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-blue-400/40 shadow-sm"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
                }}
              />
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <p className="font-extrabold text-white text-sm">{name || 'Nama Siswa'}</p>
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-md text-[9px] font-black uppercase tracking-wider">
                    {currentUser.role}
                  </span>
                </div>
                <p className="text-xs text-blue-200 font-mono">
                  @{username || 'username'} {nisn ? `• NISN: ${nisn}` : ''}
                </p>
                <p className="text-[10px] text-slate-400">
                  {phone ? `WA: ${phone}` : 'Belum ada kontak'} • {email}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-2xl bg-[#2563EB] hover:bg-blue-700 active:scale-95 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-500/25 flex items-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Simpan Perubahan Profil</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
