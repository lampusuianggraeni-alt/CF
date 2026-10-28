import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Link as LinkIcon, Copy, Check, GraduationCap, ShieldCheck, Shield, ExternalLink, Sparkles, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export type PortalTargetMode = 'siswa' | 'bendahara' | 'admin';

interface PortalLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchPortalPreview?: (mode: PortalTargetMode) => void;
  filterMode?: PortalTargetMode | 'all';
}

export function getPortalBaseUrl(): string {
  if (typeof window === 'undefined') return '';
  let origin = window.location.origin;

  // Crucial: Konversi URL developer privat (ais-dev-) ke Shared App URL publik (ais-pre-)
  // agar semua orang (teman sekelas, bendahara, orang tua) dapat langsung mengakses tanpa error 401/403.
  if (origin.includes('ais-dev-')) {
    origin = origin.replace('ais-dev-', 'ais-pre-');
  } else if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
    origin = 'https://ais-pre-fietvw3xjjr2jcmndoaz4c-202963900813.asia-southeast1.run.app';
  }

  return origin + window.location.pathname.replace(/\/$/, '');
}

export function getMainPublicAppUrl(): string {
  return getPortalBaseUrl();
}

export function getStudentPortalUrl(): string {
  return `${getPortalBaseUrl()}/?portal=siswa`;
}

export function getTreasurerPortalUrl(): string {
  return `${getPortalBaseUrl()}/?portal=bendahara`;
}

export function getAdminPortalUrl(): string {
  return `${getPortalBaseUrl()}/?portal=admin`;
}

// Backward compatibility
export function getStaffPortalUrl(): string {
  return getTreasurerPortalUrl();
}

export const PortalLinksModal: React.FC<PortalLinksModalProps> = ({
  isOpen,
  onClose,
  onSwitchPortalPreview,
  filterMode,
}) => {
  const { classGroup, logout, currentUser } = useApp();
  const [copiedType, setCopiedType] = useState<PortalTargetMode | 'wa_siswa' | null>(null);
  const [showTroubleshoot, setShowTroubleshoot] = useState(false);

  // If currentUser is student, force 'siswa' mode so they never see bendahara or admin links
  const effectiveMode: PortalTargetMode | 'all' =
    filterMode ||
    (currentUser.role === 'anggota'
      ? 'siswa'
      : currentUser.role === 'bendahara'
      ? 'bendahara'
      : 'all');

  const [tabSelection, setTabSelection] = useState<PortalTargetMode>(() => {
    if (effectiveMode === 'siswa') return 'siswa';
    if (effectiveMode === 'bendahara') return 'bendahara';
    if (effectiveMode === 'admin') return 'admin';
    return 'siswa';
  });

  useEffect(() => {
    if (effectiveMode !== 'all') {
      setTabSelection(effectiveMode);
    }
  }, [effectiveMode]);

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

  const studentUrl = getStudentPortalUrl();
  const treasurerUrl = getTreasurerPortalUrl();
  const adminUrl = getAdminPortalUrl();

  const handleCopy = (text: string, type: PortalTargetMode | 'wa_siswa') => {
    navigator.clipboard?.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleCopyWhatsAppMessage = () => {
    const msg = `Halo teman-teman ${classGroup.name}! 🎓\nBerikut adalah *Link Khusus Siswa* untuk cek & bayar uang kas kelas:\n👉 ${studentUrl}\n\n📋 *Panduan Masuk Akun Siswa:*\n1. Buka link di atas\n2. Cari / pilih Nama Siswa Anda dari daftar (atau ketik NISN)\n3. Kata Sandi Default: *kas12345*\n4. Klik "Masuk Sebagai Siswa"\n\nJika ada kendala masuk, hubungi Bendahara (Maita / Fioren) ya!`;
    handleCopy(msg, 'wa_siswa');
  };

  const handlePreviewPortal = (mode: PortalTargetMode) => {
    const targetQuery = `?portal=${mode}`;
    window.history.replaceState(null, '', targetQuery);
    window.dispatchEvent(new CustomEvent('portal-mode-change', { detail: mode }));
    if (onSwitchPortalPreview) {
      onSwitchPortalPreview(mode);
    }
    onClose();
    logout();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div
          className={`p-5 sm:p-6 text-white flex items-center justify-between ${
            effectiveMode === 'siswa'
              ? 'bg-linear-to-r from-emerald-600 to-teal-700'
              : effectiveMode === 'bendahara'
              ? 'bg-linear-to-r from-[#2563EB] to-blue-700'
              : effectiveMode === 'admin'
              ? 'bg-linear-to-r from-purple-700 to-indigo-800'
              : 'bg-linear-to-r from-slate-900 via-indigo-900 to-blue-900'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/15 rounded-2xl backdrop-blur-md">
              {effectiveMode === 'siswa' ? (
                <GraduationCap className="w-5 h-5 text-white" />
              ) : effectiveMode === 'bendahara' ? (
                <ShieldCheck className="w-5 h-5 text-white" />
              ) : (
                <Shield className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black uppercase tracking-tight">
                {effectiveMode === 'siswa'
                  ? `Link Khusus Siswa (${classGroup.name})`
                  : effectiveMode === 'bendahara'
                  ? 'Link Khusus 2 Bendahara (Maita & Fioren)'
                  : effectiveMode === 'admin'
                  ? 'Link Khusus Admin (Akses Terbatas)'
                  : '3 Link Portal Kelas Terpisah'}
              </h2>
              <p className="text-xs text-white/80 font-medium">
                {effectiveMode === 'siswa'
                  ? 'Link khusus seluruh siswa/anggota kelas (hanya opsi siswa)'
                  : effectiveMode === 'bendahara'
                  ? 'Link khusus 2 bendahara kelas: Maita dan Fioren'
                  : effectiveMode === 'admin'
                  ? 'Link khusus administrator sistem yang berwenang'
                  : 'Salin dan bagikan 3 link terpisah sesuai hak peran pengguna'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Banner Status Akses Publik */}
        <div className="bg-emerald-50 border-b border-emerald-200 px-5 sm:px-6 py-3 flex items-center justify-between text-xs text-emerald-950 font-semibold">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span>
              <strong>Akses Publik Aktif:</strong> Link di bawah ini menggunakan <strong>Shared App URL</strong> resmi yang bisa dibuka oleh siapa saja di HP/laptop masing-masing tanpa error!
            </span>
          </div>
          <span className="hidden sm:inline-block px-2.5 py-0.5 bg-emerald-200 text-emerald-900 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 ml-2">
            🌐 Semua Orang Bisa Akses
          </span>
        </div>

        {/* 3 Tabs switch when viewing all or as staff */}
        {effectiveMode === 'all' && (
          <div className="px-6 pt-4 border-b border-slate-100 flex space-x-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setTabSelection('siswa')}
              className={`py-2 px-3 sm:px-4 rounded-t-xl font-black text-xs uppercase tracking-wider border-b-2 cursor-pointer transition-colors shrink-0 ${
                tabSelection === 'siswa'
                  ? 'border-emerald-600 text-emerald-800 bg-emerald-50/60'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              🎓 1. Khusus Siswa
            </button>
            <button
              type="button"
              onClick={() => setTabSelection('bendahara')}
              className={`py-2 px-3 sm:px-4 rounded-t-xl font-black text-xs uppercase tracking-wider border-b-2 cursor-pointer transition-colors shrink-0 ${
                tabSelection === 'bendahara'
                  ? 'border-[#2563EB] text-[#2563EB] bg-blue-50/60'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              💼 2. Khusus Bendahara (Maita & Fioren)
            </button>
            <button
              type="button"
              onClick={() => setTabSelection('admin')}
              className={`py-2 px-3 sm:px-4 rounded-t-xl font-black text-xs uppercase tracking-wider border-b-2 cursor-pointer transition-colors shrink-0 ${
                tabSelection === 'admin'
                  ? 'border-purple-600 text-purple-700 bg-purple-50/60'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              👑 3. Khusus Admin
            </button>
          </div>
        )}

        {/* Bendahara role tab view (sees Bendahara & Siswa link) */}
        {currentUser.role === 'bendahara' && effectiveMode !== 'siswa' && (
          <div className="px-6 pt-4 border-b border-slate-100 flex space-x-2">
            <button
              type="button"
              onClick={() => setTabSelection('bendahara')}
              className={`py-2 px-4 rounded-t-xl font-black text-xs uppercase tracking-wider border-b-2 cursor-pointer transition-colors ${
                tabSelection === 'bendahara'
                  ? 'border-[#2563EB] text-[#2563EB] bg-blue-50/60'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              💼 Link Khusus Bendahara (2 Orang)
            </button>
            <button
              type="button"
              onClick={() => setTabSelection('siswa')}
              className={`py-2 px-4 rounded-t-xl font-black text-xs uppercase tracking-wider border-b-2 cursor-pointer transition-colors ${
                tabSelection === 'siswa'
                  ? 'border-emerald-600 text-emerald-800 bg-emerald-50/60'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              🎓 Link Khusus Siswa (Untuk Dibagikan)
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-5 text-xs">
          {/* ========================================================== */}
          {/* TAB 1: LINK KHUSUS SISWA                                   */}
          {/* ========================================================== */}
          {(effectiveMode === 'siswa' || tabSelection === 'siswa') && (
            <div className="p-5 rounded-3xl bg-emerald-50/70 border-2 border-emerald-200 space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2.5 bg-emerald-600 text-white rounded-2xl shadow-xs">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-black text-emerald-950 text-sm uppercase tracking-tight">
                        Link 1: Khusus Siswa / Anggota
                      </h3>
                      <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded-full text-[10px] font-black uppercase">
                        Hanya Opsi Siswa
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-800 font-medium">
                      Halaman login hanya menampilkan nama-nama siswa kelas tanpa opsi bendahara atau admin
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white p-2.5 rounded-2xl border border-emerald-200">
                <input
                  type="text"
                  readOnly
                  value={studentUrl}
                  className="flex-1 px-2 py-1 text-xs font-mono font-bold text-emerald-900 bg-transparent focus:outline-none select-all"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(studentUrl, 'siswa')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all cursor-pointer shrink-0 shadow-xs"
                >
                  {copiedType === 'siswa' ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Link Siswa Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Salin Link Siswa</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyWhatsAppMessage}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-emerald-100/70 text-emerald-800 border border-emerald-300 font-bold text-[11px] flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  {copiedType === 'wa_siswa' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Pesan Broadcast WA Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Salin Pesan Broadcast WA Kelas</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handlePreviewPortal('siswa')}
                  className="px-3.5 py-2 rounded-xl bg-emerald-900/10 hover:bg-emerald-900/20 text-emerald-950 font-black text-[11px] uppercase tracking-wider flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka Halaman Login Siswa</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 2: LINK KHUSUS 2 ORANG BENDAHARA (MAITA & FIOREN)       */}
          {/* ========================================================== */}
          {(effectiveMode === 'bendahara' || (effectiveMode === 'all' && tabSelection === 'bendahara')) && (
            <div className="p-5 rounded-3xl bg-blue-50/70 border-2 border-blue-200 space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2.5 bg-[#2563EB] text-white rounded-2xl shadow-xs">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-black text-slate-900 text-sm uppercase tracking-tight">
                        Link 2: Khusus 2 Bendahara Kelas
                      </h3>
                      <span className="px-2 py-0.5 bg-blue-200 text-blue-900 rounded-full text-[10px] font-black uppercase">
                        Maita & Fioren
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium">
                      Halaman login khusus 2 orang bendahara: <strong>ANDI MAITALIDIYANI M. (Maita)</strong> dan <strong>FIOREN KHANZA FAISAL (Fioren)</strong>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white p-2.5 rounded-2xl border border-blue-200">
                <input
                  type="text"
                  readOnly
                  value={treasurerUrl}
                  className="flex-1 px-2 py-1 text-xs font-mono font-bold text-[#2563EB] bg-transparent focus:outline-none select-all"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(treasurerUrl, 'bendahara')}
                  className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all cursor-pointer shrink-0 shadow-xs"
                >
                  {copiedType === 'bendahara' ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Link Bendahara Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Salin Link Bendahara</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-end pt-1">
                <button
                  type="button"
                  onClick={() => handlePreviewPortal('bendahara')}
                  className="px-3.5 py-2 rounded-xl bg-blue-900/10 hover:bg-blue-900/20 text-blue-950 font-black text-[11px] uppercase tracking-wider flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka Halaman Login Bendahara</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 3: LINK KHUSUS ADMIN                                   */}
          {/* ========================================================== */}
          {(effectiveMode === 'admin' || (effectiveMode === 'all' && tabSelection === 'admin')) && (
            <div className="p-5 rounded-3xl bg-purple-50/70 border-2 border-purple-200 space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2.5 bg-purple-600 text-white rounded-2xl shadow-xs">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-black text-purple-950 text-sm uppercase tracking-tight">
                        Link 3: Khusus Administrator Sistem
                      </h3>
                      <span className="px-2 py-0.5 bg-purple-200 text-purple-900 rounded-full text-[10px] font-black uppercase">
                        Akses Khusus Tertentu
                      </span>
                    </div>
                    <p className="text-[11px] text-purple-800 font-medium">
                      Halaman login khusus orang tertentu yang berwenang (Administrator: Lampu Sui Anggraeni). Siswa dan bendahara tidak dapat login di link ini.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white p-2.5 rounded-2xl border border-purple-200">
                <input
                  type="text"
                  readOnly
                  value={adminUrl}
                  className="flex-1 px-2 py-1 text-xs font-mono font-bold text-purple-800 bg-transparent focus:outline-none select-all"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(adminUrl, 'admin')}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all cursor-pointer shrink-0 shadow-xs"
                >
                  {copiedType === 'admin' ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Link Admin Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Salin Link Admin</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-end pt-1">
                <button
                  type="button"
                  onClick={() => handlePreviewPortal('admin')}
                  className="px-3.5 py-2 rounded-xl bg-purple-900/10 hover:bg-purple-900/20 text-purple-950 font-black text-[11px] uppercase tracking-wider flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka Halaman Login Admin</span>
                </button>
              </div>
            </div>
          )}

          {/* Panduan & Solusi: Kenapa Teman Mengalami Tulisan Error */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs space-y-2">
            <button
              type="button"
              onClick={() => setShowTroubleshoot(!showTroubleshoot)}
              className="w-full flex items-center justify-between font-black text-amber-950 text-xs hover:text-amber-800 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>❓ Kenapa Teman Mengalami Tulisan Error Saat Membuka Link?</span>
              </div>
              {showTroubleshoot ? (
                <ChevronUp className="w-4 h-4 text-amber-700 shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 text-amber-700 shrink-0" />
              )}
            </button>

            {showTroubleshoot && (
              <div className="pt-2 border-t border-amber-200/80 space-y-2.5 text-[11px] text-slate-700 animate-fade-in">
                <div className="space-y-0.5">
                  <p className="font-bold text-amber-900">
                    1. Error di Browser HP: "401 Unauthorized / 403 / Tidak Dapat Dijangkau"
                  </p>
                  <p>
                    Link yang disalin dari bar browser AI Studio (atau <code>localhost</code>) adalah link sesi privat developer. Teman yang membuka link ini di HP mereka tidak dapat mengakses tanpa izin sesi Anda. Agar teman dapat mengakses di HP masing-masing, aplikasi perlu di-deploy (misalnya ke Vercel/Netlify/Firebase) atau dicoba bersama di perangkat yang sama.
                  </p>
                </div>

                <div className="space-y-0.5">
                  <p className="font-bold text-emerald-900">
                    2. Error "Kata sandi salah"
                  </p>
                  <p>
                    Teman sering memasukkan kata sandi buatan sendiri atau sandi email. Seluruh 32 siswa kelas IX A memiliki kata sandi default: <code className="font-mono font-bold bg-emerald-100 text-emerald-900 px-1 py-0.5 rounded">kas12345</code>.
                  </p>
                </div>

                <div className="space-y-0.5">
                  <p className="font-bold text-blue-900">
                    3. Error "NISN tidak ditemukan"
                  </p>
                  <p>
                    Teman tidak perlu mengetik manual. Cukup pilih nama mereka langsung dari menu pencarian di halaman login siswa, masukkan kata sandi (<code className="font-mono font-bold bg-blue-100 text-blue-900 px-1 py-0.5 rounded">kas12345</code>), lalu klik tombol Masuk.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
