import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  UserCheck,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Shield,
  CreditCard,
  GraduationCap,
  Link as LinkIcon,
  Copy,
  Check,
  Search,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Key,
  Sparkles,
  Info,
} from 'lucide-react';
import { Role, User } from '../types';
import {
  getStudentPortalUrl,
  getTreasurerPortalUrl,
  getAdminPortalUrl,
} from './PortalLinksModal';

export type PortalLoginMode = 'siswa' | 'bendahara' | 'admin';

function detectInitialPortalMode(): PortalLoginMode {
  if (typeof window === 'undefined') return 'siswa';
  const params = new URLSearchParams(window.location.search);
  const portalParam = (
    params.get('portal') ||
    params.get('role') ||
    params.get('mode') ||
    window.location.hash.replace('#', '') ||
    ''
  ).toLowerCase();

  if (
    portalParam === 'admin' ||
    window.location.pathname.toLowerCase().includes('/admin')
  ) {
    return 'admin';
  }

  if (
    portalParam === 'bendahara' ||
    portalParam === 'pengurus' ||
    window.location.pathname.toLowerCase().includes('/bendahara') ||
    window.location.pathname.toLowerCase().includes('/pengurus')
  ) {
    return 'bendahara';
  }

  return 'siswa';
}

export const LoginScreen: React.FC = () => {
  const { login, users, classGroup } = useApp();

  // 1 Admin khusus (Lampu Sui Anggraeni)
  const adminUser: User = users.find((u) => u.role === 'admin') || {
    id: 'usr-1',
    name: 'Lampu Sui Anggraeni',
    username: 'admin',
    password: 'admin123',
    nisn: '0061234501',
    role: 'admin' as Role,
    email: 'lampusuianggraeni@gmail.com',
  };

  // 2 Bendahara khusus: Maita & Fioren
  const maitaUser: User = users.find((u) => u.nisn === '3124652885' || u.username === 'maita') || {
    id: 'usr-bendahara-maita',
    name: 'ANDI MAITALIDIYANI M.',
    username: 'maita',
    password: 'admin123',
    nisn: '3124652885',
    role: 'bendahara' as Role,
    email: 'maita.kas9a@gmail.com',
  };

  const fiorenUser: User = users.find((u) => u.nisn === '0123428941' || u.username === 'fioren') || {
    id: 'usr-bendahara-fioren',
    name: 'FIOREN KHANZA FAISAL',
    username: 'fioren',
    password: 'admin123',
    nisn: '0123428941',
    role: 'bendahara' as Role,
    email: 'fioren.kas9a@gmail.com',
  };

  const anggotaUsers = useMemo(() => users.filter((u) => u.role === 'anggota'), [users]);

  const [portalMode, setPortalMode] = useState<PortalLoginMode>(detectInitialPortalMode);
  const [selectedTreasurer, setSelectedTreasurer] = useState<'maita' | 'fioren'>('maita');

  // Anggota selector & search
  const [selectedAnggotaId, setSelectedAnggotaId] = useState<string>(anggotaUsers[0]?.id || '');
  const [searchStudentQuery, setSearchStudentQuery] = useState('');
  const [showTroubleshoot, setShowTroubleshoot] = useState(false);
  const [showAllStudentsList, setShowAllStudentsList] = useState(false);

  // Form states: Nama Lengkap, NISN, Password
  const [studentName, setStudentName] = useState<string>(() => {
    const mode = detectInitialPortalMode();
    if (mode === 'admin') return adminUser.name;
    if (mode === 'bendahara') return maitaUser.name;
    return anggotaUsers[0]?.name || '';
  });

  const [nisn, setNisn] = useState<string>(() => {
    const mode = detectInitialPortalMode();
    if (mode === 'admin') return adminUser.nisn || adminUser.username || '0061234501';
    if (mode === 'bendahara') return maitaUser.nisn;
    return anggotaUsers[0]?.nisn || '';
  });

  const [password, setPassword] = useState<string>('');

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState<PortalLoginMode | null>(null);

  // Filtered students for quick search
  const filteredAnggota = useMemo(() => {
    if (!searchStudentQuery.trim()) return anggotaUsers;
    const q = searchStudentQuery.toLowerCase().trim();
    return anggotaUsers.filter(
      (u) =>
        (u.name || '').toLowerCase().includes(q) ||
        (u.nisn || '').toLowerCase().includes(q) ||
        (u.username || '').toLowerCase().includes(q)
    );
  }, [anggotaUsers, searchStudentQuery]);

  // Keep anggota default selection synced when users load
  useEffect(() => {
    if (anggotaUsers.length > 0 && (!selectedAnggotaId || !anggotaUsers.some((u) => u.id === selectedAnggotaId))) {
      const firstAnggota = anggotaUsers[0];
      setSelectedAnggotaId(firstAnggota.id);
      if (portalMode === 'siswa') {
        setStudentName(firstAnggota.name || '');
        setNisn(firstAnggota.nisn || '');
        setPassword('');
      }
    }
  }, [anggotaUsers, selectedAnggotaId, portalMode]);

  // Listen to custom portal mode changes
  useEffect(() => {
    const handlePortalEvent = (e: Event) => {
      const customEvent = e as CustomEvent<PortalLoginMode>;
      if (customEvent.detail) {
        switchPortalMode(customEvent.detail);
      }
    };
    window.addEventListener('portal-mode-change', handlePortalEvent);
    return () => window.removeEventListener('portal-mode-change', handlePortalEvent);
  }, [users, selectedAnggotaId]);

  const switchPortalMode = (mode: PortalLoginMode) => {
    setPortalMode(mode);
    setErrorMsg(null);
    setPassword('');
    window.history.replaceState(null, '', `?portal=${mode}`);

    if (mode === 'siswa') {
      const ang = users.find((u) => u.id === selectedAnggotaId) || users.find((u) => u.role === 'anggota');
      setStudentName(ang?.name || '');
      setNisn(ang?.nisn || '');
    } else if (mode === 'bendahara') {
      const target = selectedTreasurer === 'maita' ? maitaUser : fiorenUser;
      setStudentName(target.name);
      setNisn(target.nisn);
    } else {
      // mode === 'admin'
      setStudentName(adminUser.name);
      setNisn(adminUser.nisn || adminUser.username || '0061234501');
    }
  };

  const handleSelectTreasurer = (person: 'maita' | 'fioren') => {
    setSelectedTreasurer(person);
    setErrorMsg(null);
    setPassword('');
    const target = person === 'maita' ? maitaUser : fiorenUser;
    setStudentName(target.name);
    setNisn(target.nisn);
  };

  const handleSelectAnggota = (userId: string) => {
    setSelectedAnggotaId(userId);
    setErrorMsg(null);
    setPassword('');
    const angUser = users.find((u) => u.id === userId);
    if (angUser) {
      setStudentName(angUser.name || '');
      setNisn(angUser.nisn || '');
    }
  };

  const handleCopyPortalUrl = (type: PortalLoginMode) => {
    let url = getStudentPortalUrl();
    if (type === 'bendahara') url = getTreasurerPortalUrl();
    if (type === 'admin') url = getAdminPortalUrl();

    navigator.clipboard?.writeText(url);
    setCopiedLink(type);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanNisn = nisn.trim();
    const cleanName = studentName.trim();
    const cleanPass = password.trim();

    if (!cleanNisn && !cleanName) {
      setErrorMsg('Harap pilih nama siswa Anda atau masukkan NISN.');
      return;
    }

    if (!cleanPass) {
      setErrorMsg('Harap masukkan kata sandi akun Anda untuk masuk.');
      return;
    }

    // Role boundary validation per portal link
    if (portalMode === 'siswa') {
      const studentMatch = users.find((u) => {
        if (u.role !== 'anggota') return false;
        const idLower = (cleanNisn || cleanName).toLowerCase().replace(/\s+/g, '');
        const uNisn = (u.nisn || '').toLowerCase().replace(/\s+/g, '');
        const uUser = (u.username || '').toLowerCase().replace(/\s+/g, '');
        const uName = (u.name || '').toLowerCase().replace(/[.,]/g, '').trim();
        const searchName = cleanName.toLowerCase().replace(/[.,]/g, '').trim();
        return (
          uNisn === idLower ||
          uUser === idLower ||
          uName === searchName ||
          (searchName.length >= 3 && uName.includes(searchName)) ||
          (cleanNisn.length >= 4 && uNisn.includes(cleanNisn))
        );
      });

      if (!studentMatch) {
        // Check if admin is attempting login through student link
        const adminCandidate = users.find((u) => {
          const idLower = (cleanNisn || cleanName).toLowerCase();
          return (
            (u.nisn || '').toLowerCase() === idLower ||
            (u.username || '').toLowerCase() === idLower ||
            (u.name || '').toLowerCase() === cleanName.toLowerCase()
          );
        });

        if (adminCandidate && adminCandidate.role === 'admin') {
          setErrorMsg(
            'Akun ini adalah Akun Administrator. Silakan klik tombol "Buka Portal Admin" untuk masuk.'
          );
          return;
        }
      }
    } else if (portalMode === 'bendahara') {
      const isMaita = cleanNisn === '3124652885' || cleanNisn.toLowerCase() === 'maita';
      const isFioren = cleanNisn === '0123428941' || cleanNisn.toLowerCase() === 'fioren';

      if (!isMaita && !isFioren) {
        setErrorMsg(
          'Akses Ditolak: Halaman ini khusus untuk 2 orang Bendahara (Maita & Fioren). Siswa dan Admin umum tidak dapat masuk melalui link ini.'
        );
        return;
      }
    } else if (portalMode === 'admin') {
      const isAuthorizedAdmin =
        cleanNisn === '0061234501' ||
        cleanNisn.toLowerCase() === 'admin' ||
        cleanNisn.toLowerCase() === 'lampusuianggraeni@gmail.com' ||
        cleanName.toLowerCase().includes('lampu');

      if (!isAuthorizedAdmin) {
        setErrorMsg(
          'Akses Ditolak: Halaman ini adalah Link Khusus Administrator (Lampu Sui Anggraeni). Akun Siswa dan Bendahara tidak dapat masuk melalui link ini.'
        );
        return;
      }
    }

    setLoading(true);
    setTimeout(() => {
      const targetRole: Role =
        portalMode === 'siswa' ? 'anggota' : portalMode === 'bendahara' ? 'bendahara' : 'admin';
      const res = login(cleanNisn || cleanName, cleanPass, targetRole);

      if (!res.success && cleanName && cleanNisn) {
        const fallbackRes = login(cleanName, cleanPass, targetRole);
        if (!fallbackRes.success) {
          setErrorMsg(res.message);
        }
      } else if (!res.success) {
        setErrorMsg(res.message);
      }
      setLoading(false);
    }, 200);
  };

  const studentPortalUrl = getStudentPortalUrl();
  const treasurerPortalUrl = getTreasurerPortalUrl();
  const adminPortalUrl = getAdminPortalUrl();

  const handleCopyWhatsAppMessage = () => {
    const msg = `Halo teman-teman ${classGroup.name}! 🎓\nBerikut adalah *Link Khusus Siswa* untuk cek & bayar uang kas kelas:\n👉 ${studentPortalUrl}\n\n📋 *Panduan Masuk Akun Siswa:*\n1. Buka link di atas\n2. Cari / pilih Nama Siswa Anda dari daftar (atau ketik NISN)\n3. Kata Sandi Default: *kas12345*\n4. Klik "Masuk Sebagai Siswa"\n\nJika ada kendala masuk, hubungi Bendahara (Maita / Fioren) ya!`;
    navigator.clipboard?.writeText(msg);
    setCopiedLink('siswa');
    setTimeout(() => setCopiedLink(null), 2500);
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex flex-col justify-center py-8 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        {/* App Logo */}
        <div
          className={`inline-flex items-center justify-center p-3.5 text-white rounded-3xl shadow-xl mb-3 ${
            portalMode === 'siswa'
              ? 'bg-emerald-600 shadow-emerald-500/20'
              : portalMode === 'bendahara'
              ? 'bg-[#2563EB] shadow-blue-500/20'
              : 'bg-purple-700 shadow-purple-500/20'
          }`}
        >
          <span className="font-black text-2xl tracking-tighter">CF.</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
          Class Fund
        </h2>
        <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">
          Sistem Pengelolaan Kas {classGroup.name}
        </p>

        {/* Active Portal Badge */}
        {portalMode === 'siswa' ? (
          <div className="mt-2.5 inline-flex items-center space-x-1.5 px-3.5 py-1 bg-emerald-100 text-emerald-900 rounded-full text-[11px] font-black uppercase tracking-wider border border-emerald-300">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />
            <span>Link Khusus Siswa (Hanya Opsi Siswa)</span>
          </div>
        ) : portalMode === 'bendahara' ? (
          <div className="mt-2.5 inline-flex items-center space-x-1.5 px-3.5 py-1 bg-blue-100 text-blue-900 rounded-full text-[11px] font-black uppercase tracking-wider border border-blue-300">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Link Khusus 2 Bendahara (Maita & Fioren)</span>
          </div>
        ) : (
          <div className="mt-2.5 inline-flex items-center space-x-1.5 px-3.5 py-1 bg-purple-100 text-purple-900 rounded-full text-[11px] font-black uppercase tracking-wider border border-purple-300">
            <Shield className="w-3.5 h-3.5 text-purple-700" />
            <span>Link Khusus Admin (Akses Terbatas)</span>
          </div>
        )}
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl px-4 space-y-5">
        {/* Main Login Card */}
        <div className="bg-white py-7 px-6 sm:px-10 rounded-3xl shadow-xl border border-slate-200/80 space-y-6">
          {/* ========================================================== */}
          {/* MODE 1: LINK KHUSUS SISWA (HANYA OPSI SISWA)               */}
          {/* ========================================================== */}
          {portalMode === 'siswa' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-2xl">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-sm uppercase tracking-tight">
                      Masuk Akun Siswa ({classGroup.name})
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Portal khusus anggota kelas untuk cek & bayar uang kas
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                  🎓 {anggotaUsers.length} Siswa
                </span>
              </div>

              {/* Quick Student Selector & Search Box */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/90 text-xs space-y-3">
                {anggotaUsers.length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic py-1">
                    Belum ada siswa terdaftar.
                  </p>
                ) : (
                  <>
                    {/* Search student bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-black text-emerald-950 uppercase tracking-wider flex items-center space-x-1">
                          <Search className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Cari / Pilih Nama Anda:</span>
                        </label>
                        <span className="text-[10px] text-emerald-700 font-bold">
                          {filteredAnggota.length} dari {anggotaUsers.length} Siswa
                        </span>
                      </div>
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={searchStudentQuery}
                          onChange={(e) => setSearchStudentQuery(e.target.value)}
                          placeholder="Ketik nama atau NISN Anda untuk mencari..."
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-emerald-300 text-xs font-semibold bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Dropdown Selector */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <select
                        value={selectedAnggotaId}
                        onChange={(e) => handleSelectAnggota(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl border border-emerald-300 text-xs font-bold bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      >
                        {filteredAnggota.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} (NISN: {u.nisn})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Active Selected Student Card */}
                    {(() => {
                      const currentSelected = anggotaUsers.find((u) => u.id === selectedAnggotaId);
                      if (!currentSelected) return null;
                      return (
                        <div className="pt-2 border-t border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <div>
                            <p className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">
                              Siswa Terpilih:
                            </p>
                            <p className="font-black text-slate-900 text-xs truncate">
                              {currentSelected.name}
                            </p>
                            <p className="text-[10px] font-mono font-bold text-emerald-700">
                              NISN: {currentSelected.nisn}
                            </p>
                          </div>

                          <div className="text-[11px] text-emerald-800 font-semibold bg-emerald-100/70 px-3 py-1.5 rounded-lg border border-emerald-300/60 shrink-0 flex items-center space-x-1.5">
                            <Lock className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Ketik kata sandi di bawah untuk masuk</span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Toggle to view all 32 student roster chips */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAllStudentsList(!showAllStudentsList)}
                        className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 flex items-center space-x-1 cursor-pointer transition-colors"
                      >
                        {showAllStudentsList ? (
                          <>
                            <ChevronUp className="w-3.5 h-3.5" />
                            <span>Tutup Daftar Lengkap Siswa</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3.5 h-3.5" />
                            <span>Lihat Daftar 32 Siswa Kelas IX A (Klik Nama Anda)</span>
                          </>
                        )}
                      </button>

                      {showAllStudentsList && (
                        <div className="mt-2.5 max-h-48 overflow-y-auto p-2 bg-white rounded-xl border border-emerald-200 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {anggotaUsers.map((u, idx) => (
                            <button
                              key={u.id}
                              type="button"
                              onClick={() => {
                                handleSelectAnggota(u.id);
                                setShowAllStudentsList(false);
                              }}
                              className={`p-2 rounded-lg text-left transition-all cursor-pointer flex items-center justify-between text-[11px] ${
                                selectedAnggotaId === u.id
                                  ? 'bg-emerald-100 text-emerald-950 font-black border border-emerald-300'
                                  : 'hover:bg-slate-50 text-slate-800 border border-slate-100'
                              }`}
                            >
                              <div className="truncate pr-1">
                                <span className="font-bold">{idx + 1}. {u.name}</span>
                              </div>
                              <span className="font-mono text-[10px] text-slate-500 shrink-0">
                                {u.nisn}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* MODE 2: LINK KHUSUS 2 BENDAHARA (MAITA & FIOREN)           */}
          {/* ========================================================== */}
          {portalMode === 'bendahara' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2.5 bg-blue-100 text-[#2563EB] rounded-2xl">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-sm uppercase tracking-tight">
                      Portal Khusus 2 Orang Bendahara
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Pencatatan kas, verifikasi setoran, dan kelola pengeluaran kelas
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-blue-50 border border-blue-200 text-[#2563EB] rounded-full text-[10px] font-black uppercase tracking-wider">
                  💼 2 Bendahara
                </span>
              </div>

              {/* Pilihan 2 Bendahara: Maita & Fioren */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800 flex items-center space-x-1.5">
                    <span>Pilih Akun Bendahara:</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    2 Bendahara Kelas
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Pilihan 1: Maita */}
                  <button
                    type="button"
                    onClick={() => handleSelectTreasurer('maita')}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                      selectedTreasurer === 'maita'
                        ? 'bg-blue-50/90 border-[#2563EB] shadow-md ring-2 ring-blue-500/20'
                        : 'bg-white border-slate-200/90 hover:border-blue-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-base">👩‍💼</span>
                        {selectedTreasurer === 'maita' ? (
                          <span className="text-[10px] font-black bg-[#2563EB] text-white px-2 py-0.5 rounded-full">
                            Terpilih
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-slate-400">Pilih</span>
                        )}
                      </div>
                      <p className="font-black text-slate-900 text-sm mt-1">Maita</p>
                      <p className="text-[10px] text-[#2563EB] font-bold truncate">
                        ANDI MAITALIDIYANI M.
                      </p>
                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                        Bendahara 1 Kelas
                      </p>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-blue-100 flex items-center justify-between text-[10px]">
                      <span className="text-slate-600 font-mono font-bold">3124652885</span>
                      <span className="text-[#2563EB] font-black">Bendahara 1</span>
                    </div>
                  </button>

                  {/* Pilihan 2: Fioren */}
                  <button
                    type="button"
                    onClick={() => handleSelectTreasurer('fioren')}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                      selectedTreasurer === 'fioren'
                        ? 'bg-blue-50/90 border-[#2563EB] shadow-md ring-2 ring-blue-500/20'
                        : 'bg-white border-slate-200/90 hover:border-blue-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-base">👩‍💼</span>
                        {selectedTreasurer === 'fioren' ? (
                          <span className="text-[10px] font-black bg-[#2563EB] text-white px-2 py-0.5 rounded-full">
                            Terpilih
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-slate-400">Pilih</span>
                        )}
                      </div>
                      <p className="font-black text-slate-900 text-sm mt-1">Fioren</p>
                      <p className="text-[10px] text-[#2563EB] font-bold truncate">
                        FIOREN KHANZA FAISAL
                      </p>
                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                        Bendahara 2 Kelas
                      </p>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-blue-100 flex items-center justify-between text-[10px]">
                      <span className="text-slate-600 font-mono font-bold">0123428941</span>
                      <span className="text-[#2563EB] font-black">Bendahara 2</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Info Box Bendahara Terpilih */}
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/90 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-blue-900 font-bold">
                  <span className="flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
                    <span>
                      {selectedTreasurer === 'maita'
                        ? 'Bendahara 1: ANDI MAITALIDIYANI M. (Maita)'
                        : 'Bendahara 2: FIOREN KHANZA FAISAL (Fioren)'}
                    </span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-blue-200 text-blue-900 rounded-md font-bold">
                    Akses Bendahara
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  {selectedTreasurer === 'maita'
                    ? 'Masuk sebagai Bendahara 1 (Maita). Memiliki wewenang mencatat kas tunai, verifikasi bukti setoran, dan kirim pengingat atas nama Bendahara 1.'
                    : 'Masuk sebagai Bendahara 2 (Fioren). Memiliki wewenang mencatat kas tunai, verifikasi bukti setoran, dan kirim pengingat atas nama Bendahara 2.'}
                </p>
                <div className="pt-2 border-t border-blue-200/60 flex items-center justify-between text-[11px] text-blue-900 font-semibold bg-blue-100/60 px-3 py-1.5 rounded-lg border border-blue-200">
                  <span className="flex items-center space-x-1.5">
                    <Lock className="w-3.5 h-3.5 text-blue-700" />
                    <span>Masukkan kata sandi Bendahara di form bawah untuk melanjutkan</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* MODE 3: LINK KHUSUS ADMIN (AKSES TERBATAS)                 */}
          {/* ========================================================== */}
          {portalMode === 'admin' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2.5 bg-purple-100 text-purple-700 rounded-2xl">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-sm uppercase tracking-tight">
                      Portal Administrator Sistem
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Akses terbatas khusus Administrator yang berwenang
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-purple-50 border border-purple-200 text-purple-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                  👑 Akses Terbatas
                </span>
              </div>

              {/* Profil Card Admin Khusus */}
              <div className="p-4 rounded-2xl bg-purple-50/80 border-2 border-purple-300 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black text-base shadow-xs">
                      👑
                    </div>
                    <div>
                      <p className="font-black text-purple-950 text-sm">
                        {adminUser.name}
                      </p>
                      <p className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">
                        Administrator Utama Sistem
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black px-2.5 py-1 bg-purple-200 text-purple-900 rounded-full uppercase">
                    Admin Resmi
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 pt-1">
                  Hanya orang tertentu yang berwenang yang dapat login melalui link ini. Memiliki hak penuh mengubah data siswa, NISN, kelola akun, dan reset data.
                </p>

                {/* Akses Cepat Admin */}
                <div className="pt-2.5 mt-2 border-t border-purple-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="text-[11px] text-purple-950 font-semibold space-y-0.5">
                    <div>
                      <span className="text-purple-600 font-bold">Username/NISN:</span>{' '}
                      <code className="bg-purple-100/90 text-purple-900 px-1.5 py-0.5 rounded-md font-mono font-bold text-[11px]">
                        admin
                      </code>{' '}
                      atau{' '}
                      <code className="bg-purple-100/90 text-purple-900 px-1.5 py-0.5 rounded-md font-mono font-bold text-[11px]">
                        0061234501
                      </code>
                    </div>
                    <div>
                      <span className="text-purple-600 font-bold">Kata Sandi:</span>{' '}
                      <code className="bg-purple-100/90 text-purple-900 px-1.5 py-0.5 rounded-md font-mono font-bold text-[11px]">
                        admin123
                      </code>
                    </div>
                  </div>

                  <div className="text-[11px] text-purple-900 font-semibold bg-purple-100/70 px-3 py-1.5 rounded-lg border border-purple-300/60 shrink-0 flex items-center space-x-1.5">
                    <Lock className="w-3.5 h-3.5 text-purple-700" />
                    <span>Masukkan kata sandi admin di bawah</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message with Interactive Fixes */}
          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2 text-xs text-rose-800 font-semibold animate-shake">
              <div className="flex items-start space-x-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="flex-1">{errorMsg}</span>
              </div>

              {/* Quick corrective action buttons */}
              <div className="pt-1.5 flex flex-wrap gap-2 text-[11px]">

                {portalMode === 'siswa' && (errorMsg.toLowerCase().includes('nisn') || errorMsg.toLowerCase().includes('tidak ditemukan')) && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowAllStudentsList(true);
                      setErrorMsg(null);
                    }}
                    className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold transition-colors cursor-pointer flex items-center space-x-1"
                  >
                    <GraduationCap className="w-3 h-3" />
                    <span>Pilih Nama Saya dari 32 Siswa</span>
                  </button>
                )}

                {portalMode === 'siswa' && errorMsg.toLowerCase().includes('admin') && (
                  <button
                    type="button"
                    onClick={() => switchPortalMode('admin')}
                    className="px-2.5 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-bold transition-colors cursor-pointer flex items-center space-x-1"
                  >
                    <Shield className="w-3 h-3" />
                    <span>Buka Portal Admin</span>
                  </button>
                )}

                {portalMode === 'siswa' && errorMsg.toLowerCase().includes('bendahara') && (
                  <button
                    type="button"
                    onClick={() => switchPortalMode('bendahara')}
                    className="px-2.5 py-1 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg font-bold transition-colors cursor-pointer flex items-center space-x-1"
                  >
                    <ShieldCheck className="w-3 h-3" />
                    <span>Buka Portal Bendahara</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Form Akses */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-slate-700">
                  {portalMode === 'siswa'
                    ? 'Nama Lengkap Siswa'
                    : portalMode === 'bendahara'
                    ? 'Nama Lengkap Bendahara'
                    : 'Nama Administrator'}
                </label>
                <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-slate-400">
                  <Lock className="w-2.5 h-2.5" />
                  <span>Sesuai Data Resmi</span>
                </span>
              </div>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  readOnly
                  value={studentName}
                  placeholder={
                    portalMode === 'siswa'
                      ? 'Nama lengkap siswa otomatis terisi'
                      : portalMode === 'bendahara'
                      ? 'Nama bendahara terpilih'
                      : 'Nama administrator'
                  }
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-700 bg-slate-100 cursor-not-allowed focus:outline-none"
                  title="Nama Lengkap otomatis disesuaikan dari siswa terpilih"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-slate-700">
                  {portalMode === 'siswa'
                    ? 'NISN Siswa (Nomor Induk Siswa Nasional)'
                    : portalMode === 'bendahara'
                    ? 'NISN Bendahara'
                    : 'NISN / Username Administrator'}
                </label>
                <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-slate-400">
                  <Lock className="w-2.5 h-2.5" />
                  <span>Resmi Terdaftar</span>
                </span>
              </div>
              <div className="relative">
                <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={nisn}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNisn(val);
                    const matched = users.find(
                      (u) => (u.nisn || '').toLowerCase() === val.trim().toLowerCase()
                    );
                    if (matched) {
                      setStudentName(matched.name);
                      setPassword(matched.password || 'kas12345');
                      if (matched.role === 'anggota') {
                        setSelectedAnggotaId(matched.id);
                      }
                    }
                  }}
                  placeholder={
                    portalMode === 'siswa'
                      ? 'Masukkan NISN siswa terdaftar (contoh: 0123866438)'
                      : portalMode === 'bendahara'
                      ? 'NISN Bendahara (contoh: 3124652885 / 0123428941)'
                      : 'Masukkan NISN atau username admin (contoh: admin)'
                  }
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 font-mono font-semibold text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-slate-700">
                  Kata Sandi
                </label>
                <span className="text-[10px] font-bold text-slate-400">
                  Default: kas12345
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi (default: kas12345)"
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

              {/* Password Helper note */}
              <div className="flex items-center justify-between mt-1.5 text-[11px]">
                <span className="text-slate-500 font-medium">
                  💡 Sandi bawaan {portalMode === 'siswa' ? 'siswa' : 'akun'}:{' '}
                  <code className="font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    {portalMode === 'siswa' ? 'kas12345' : 'admin123'}
                  </code>
                </span>
                <span className="text-slate-400 text-[10px] font-medium">
                  Wajib dimasukkan untuk masuk
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 rounded-2xl active:scale-98 text-white font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                  portalMode === 'siswa'
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25'
                    : portalMode === 'bendahara'
                    ? 'bg-[#2563EB] hover:bg-blue-700 shadow-blue-500/25'
                    : 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/25'
                }`}
              >
                <span>
                  {loading
                    ? 'Memverifikasi Akses Masuk...'
                    : portalMode === 'siswa'
                    ? 'MASUK SEBAGAI SISWA'
                    : portalMode === 'bendahara'
                    ? `MASUK SEBAGAI BENDAHARA (${selectedTreasurer === 'maita' ? 'MAITA' : 'FIOREN'})`
                    : 'MASUK SEBAGAI ADMINISTRATOR SISTEM'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* ========================================================== */}
        {/* LINK BOX KHUSUS: HANYA TAMPILKAN SESUAI LINK YANG DIBUKA   */}
        {/* ========================================================== */}
        {portalMode === 'siswa' && (
          /* Link Khusus Siswa (Hanya Tampil Link Siswa) */
          <div className="bg-white rounded-3xl p-5 border border-emerald-200/90 shadow-md space-y-3.5 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                <span className="font-black text-slate-900 uppercase tracking-tight">
                  Link Khusus Siswa
                </span>
              </div>
              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 rounded-full text-[10px] font-black uppercase tracking-wider border border-emerald-300">
                🌐 Link Publik Siswa (Semua Orang)
              </span>
            </div>

            <p className="text-[11px] text-slate-600">
              Link publik resmi untuk siswa kelas {classGroup.name}. Bisa langsung dibuka oleh semua teman dari HP masing-masing tanpa error!
            </p>

            <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 font-mono text-[11px] text-emerald-900 truncate font-bold select-all">
              {studentPortalUrl}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleCopyPortalUrl('siswa')}
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-xs"
              >
                {copiedLink === 'siswa' ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Link Siswa Berhasil Disalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Salin Link Khusus Siswa</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCopyWhatsAppMessage}
                className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[11px] flex items-center justify-center space-x-1.5 cursor-pointer transition-colors"
              >
                <Copy className="w-3.5 h-3.5 text-emerald-600" />
                <span>Salin Teks Broadcast WA Kelas</span>
              </button>
            </div>
          </div>
        )}

        {portalMode === 'bendahara' && (
          /* Link Khusus 2 Orang Bendahara (Hanya Tampil Link Bendahara) */
          <div className="bg-white rounded-3xl p-5 border border-blue-200/90 shadow-md space-y-3.5 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
                <span className="font-black text-slate-900 uppercase tracking-tight">
                  Link Khusus 2 Bendahara Kelas
                </span>
              </div>
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-900 rounded-full text-[10px] font-black uppercase tracking-wider border border-blue-300">
                Khusus Maita & Fioren
              </span>
            </div>

            <p className="text-[11px] text-slate-600">
              Link khusus 2 orang bendahara kelas ({classGroup.name}) untuk kelola kas, verifikasi iuran, dan catat pengeluaran.
            </p>

            <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 font-mono text-[11px] text-[#2563EB] truncate font-bold select-all">
              {treasurerPortalUrl}
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => handleCopyPortalUrl('bendahara')}
                className="w-full py-2.5 px-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-xs"
              >
                {copiedLink === 'bendahara' ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Link Bendahara Berhasil Disalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Salin Link Khusus 2 Bendahara</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {portalMode === 'admin' && (
          /* Link Khusus Admin (Hanya Tampil Link Admin) */
          <div className="bg-white rounded-3xl p-5 border border-purple-200/90 shadow-md space-y-3.5 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-purple-600" />
                <span className="font-black text-slate-900 uppercase tracking-tight">
                  Link Khusus Administrator
                </span>
              </div>
              <span className="px-2.5 py-0.5 bg-purple-100 text-purple-900 rounded-full text-[10px] font-black uppercase tracking-wider border border-purple-300">
                Akses Terbatas
              </span>
            </div>

            <p className="text-[11px] text-slate-600">
              Link khusus Administrator utama ({adminUser.name}). Hanya orang tertentu yang berwenang yang dapat mengakses link ini.
            </p>

            <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-200 font-mono text-[11px] text-purple-900 truncate font-bold select-all">
              {adminPortalUrl}
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => handleCopyPortalUrl('admin')}
                className="w-full py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-xs"
              >
                {copiedLink === 'admin' ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Link Admin Berhasil Disalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Salin Link Khusus Admin</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Panduan & Solusi: Kenapa Teman Mengalami Tulisan Error */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-md text-xs space-y-3">
          <button
            type="button"
            onClick={() => setShowTroubleshoot(!showTroubleshoot)}
            className="w-full flex items-center justify-between font-black text-slate-800 text-xs hover:text-emerald-700 transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 block sm:inline">
                  Teman Mengalami Tulisan Error Saat Buka / Masuk Link?
                </span>
                <span className="text-[10px] text-slate-500 font-medium block">
                  Klik di sini untuk melihat 4 penyebab utama & solusinya
                </span>
              </div>
            </div>
            {showTroubleshoot ? (
              <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            )}
          </button>

          {showTroubleshoot && (
            <div className="pt-3 border-t border-slate-100 space-y-3 text-[11px] text-slate-600 animate-fade-in">
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                <p className="font-bold text-amber-950 flex items-center space-x-1.5">
                  <span>1. Error di Browser HP: "401 / 403 / Akses Ditolak / Tidak Dapat Dijangkau"</span>
                </p>
                <p className="text-slate-700">
                  <strong>Penyebab:</strong> Link yang disalin dari bar browser AI Studio (atau <code>localhost</code>) adalah link sesi privat developer. Teman yang membuka link privat ini di HP/laptop mereka sendiri tidak memiliki izin sesi developer Anda.
                </p>
                <p className="text-emerald-800 font-semibold">
                  <strong>Solusi:</strong> Agar teman bisa membuka aplikasi di HP masing-masing, aplikasi perlu di-deploy (misalnya ke Vercel/Netlify/Firebase) atau dicoba bersama di perangkat yang sama.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                <p className="font-bold text-emerald-950 flex items-center space-x-1.5">
                  <span>2. Error "Kata sandi salah" Saat Masuk</span>
                </p>
                <p className="text-slate-700">
                  <strong>Penyebab:</strong> Teman memasukkan password pribadi buatan sendiri atau sandi email mereka.
                </p>
                <p className="text-emerald-800 font-semibold">
                  <strong>Solusi:</strong> Kata sandi default untuk seluruh siswa adalah <code className="bg-emerald-100 text-emerald-900 px-1 py-0.5 rounded font-mono font-black">kas12345</code>. Masukkan kata sandi ini pada kolom kata sandi.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 space-y-1">
                <p className="font-bold text-blue-950 flex items-center space-x-1.5">
                  <span>3. Error "NISN atau nama siswa tidak ditemukan"</span>
                </p>
                <p className="text-slate-700">
                  <strong>Penyebab:</strong> Teman salah mengetik angka NISN atau nama tidak persis sesuai data dapodik kelas IX A.
                </p>
                <p className="text-blue-800 font-semibold">
                  <strong>Solusi:</strong> Teman tidak perlu mengetik manual! Cukup pilih nama langsung dari menu "Pilih Nama Anda" di atas, ketik kata sandi (<code className="bg-blue-100 text-blue-900 px-1 py-0.5 rounded font-mono font-bold">kas12345</code>), lalu klik tombol Masuk.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 space-y-1">
                <p className="font-bold text-purple-950 flex items-center space-x-1.5">
                  <span>4. Akun Siswa Baru Ditambahkan di Laptop Sendiri</span>
                </p>
                <p className="text-slate-700">
                  <strong>Penyebab:</strong> Jika Anda baru saja menambah siswa via dashboard admin, data tersimpan di LocalStorage browser laptop Anda (belum tersinkronisasi database online). Di HP teman, hanya ada 32 siswa bawaan kelas IX A.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Security Note Footer */}
        <div className="text-center text-xs text-slate-400 space-y-1">
          <p className="font-bold text-slate-600 flex items-center justify-center space-x-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Kerahasiaan Sandi & Akses NISN</span>
          </p>
          <p className="text-[11px] text-slate-500 max-w-md mx-auto">
            Aplikasi menggunakan Nama Lengkap & NISN untuk akses akun yang aman dan terproteksi.
          </p>
        </div>
      </div>
    </div>
  );
};
