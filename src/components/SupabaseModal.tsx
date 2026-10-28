import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  SUPABASE_URL,
  SUPABASE_SCHEMA_SQL,
  checkSupabaseHealth,
  fetchAllFromSupabase,
  pushAllToSupabase,
  SupabaseHealth,
} from '../lib/supabase';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  X,
  Copy,
  Check,
  RefreshCw,
  UploadCloud,
  DownloadCloud,
  ExternalLink,
  ShieldCheck,
  Terminal,
  Server,
  Layers,
  Sparkles,
} from 'lucide-react';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose }) => {
  const { users, classGroup, payments, expenses, notifications, syncAllFromSupabase } = useApp();

  const [health, setHealth] = useState<SupabaseHealth | null>(null);
  const [checking, setChecking] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'sql' | 'sync'>('overview');

  const runHealthCheck = async () => {
    setChecking(true);
    try {
      const res = await checkSupabaseHealth();
      setHealth(res);
    } catch {
      // error handled in checkSupabaseHealth
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runHealthCheck();
      setToastMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopied(true);
    setToastMsg({ type: 'success', text: 'Skrip SQL berhasil disalin ke papan klip!' });
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePushAll = async () => {
    setSyncing(true);
    setToastMsg(null);
    try {
      const res = await pushAllToSupabase({
        users,
        classGroup,
        payments,
        expenses,
        notifications,
      });

      if (res.success) {
        setToastMsg({ type: 'success', text: res.message });
        await runHealthCheck();
      } else {
        setToastMsg({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setToastMsg({ type: 'error', text: err?.message || 'Gagal sinkronisasi data' });
    } finally {
      setSyncing(false);
    }
  };

  const handlePullAll = async () => {
    setSyncing(true);
    setToastMsg(null);
    try {
      const res = await syncAllFromSupabase();
      if (res.success) {
        setToastMsg({ type: 'success', text: res.message });
        await runHealthCheck();
      } else {
        setToastMsg({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setToastMsg({ type: 'error', text: err?.message || 'Gagal mengambil data' });
    } finally {
      setSyncing(false);
    }
  };

  const allTablesReady =
    health &&
    health.tables.users &&
    health.tables.class_group &&
    health.tables.payments &&
    health.tables.expenses;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-scale-up my-4 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-linear-to-r from-emerald-700 via-teal-800 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 bg-emerald-500/20 border border-emerald-400/30 backdrop-blur-md rounded-2xl flex items-center justify-center">
              {/* Official Supabase logo SVG */}
              <svg className="w-6 h-6 text-emerald-400" viewBox="0 0 109 113" fill="currentColor">
                <path d="M63.7076 110.284C60.848 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0632H99.1934C106.491 40.0632 110.648 48.3302 106.273 54.1687L63.7076 110.284Z" fill="#3ECF8E" />
                <path d="M45.317 2.71607C48.1766 -0.884699 53.9744 1.08779 54.0433 5.68605L54.3475 72.9368H9.8312C2.53381 72.9368 -1.62346 64.6698 2.75161 58.8313L45.317 2.71607Z" fill="#3ECF8E" fillOpacity="0.7" />
              </svg>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  Database Supabase Kas Kelas
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  PostgreSQL
                </span>
              </div>
              <p className="text-emerald-100/90 text-xs font-medium font-mono truncate max-w-xs sm:max-w-md">
                {SUPABASE_URL}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2 shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-4 font-bold text-xs flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Status Koneksi & Tabel</span>
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`pb-3 px-4 font-bold text-xs flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'sql'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Skrip SQL Supabase</span>
          </button>
          <button
            onClick={() => setActiveTab('sync')}
            className={`pb-3 px-4 font-bold text-xs flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'sync'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Sinkronisasi Data</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Toast Notification */}
          {toastMsg && (
            <div
              className={`p-3.5 rounded-2xl flex items-center space-x-2.5 text-xs font-bold ${
                toastMsg.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-300 text-emerald-900'
                  : 'bg-rose-50 border border-rose-300 text-rose-900'
              }`}
            >
              {toastMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{toastMsg.text}</span>
            </div>
          )}

          {/* TAB 1: OVERVIEW & STATUS */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Connection Status Card */}
              <div className="p-4 rounded-2xl bg-linear-to-r from-slate-900 to-slate-800 text-white border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="relative flex h-3 w-3">
                      <span
                        className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                          health?.connected ? 'bg-emerald-400' : 'bg-amber-400'
                        }`}
                      ></span>
                      <span
                        className={`relative inline-flex rounded-full h-3 w-3 ${
                          health?.connected ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                      ></span>
                    </span>
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-300">
                      Status Supabase Backend:
                    </span>
                    <span
                      className={`font-black text-xs px-2 py-0.5 rounded-md ${
                        health?.connected
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {checking ? 'Memeriksa...' : health?.connected ? 'Terhubung (Online)' : 'Memeriksa Koneksi'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono">
                    Project URL: <span className="text-emerald-400">{SUPABASE_URL}</span>
                  </p>
                </div>
                <button
                  onClick={runHealthCheck}
                  disabled={checking}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer border border-white/10"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
                  <span>Cek Ulang</span>
                </button>
              </div>

              {/* Tables Checklist */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    <span>Status Tabel Database PostgreSQL</span>
                  </h4>
                  <span className="text-[11px] text-slate-500 font-semibold">
                    {allTablesReady ? 'Semua Tabel Siap ✓' : 'Perlu Inisialisasi SQL'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { key: 'users', label: 'users (Pengguna, NISN, Akun)', count: health?.tableCounts?.users },
                    { key: 'class_group', label: 'class_group (Pengaturan Kas & QRIS)' },
                    { key: 'payments', label: 'payments (Transaksi Kas Siswa)', count: health?.tableCounts?.payments },
                    { key: 'expenses', label: 'expenses (Pengeluaran Kas)', count: health?.tableCounts?.expenses },
                    { key: 'notifications', label: 'notifications (Notifikasi)', count: health?.tableCounts?.notifications },
                  ].map((tbl) => {
                    const isReady = health?.tables?.[tbl.key as keyof typeof health.tables];
                    return (
                      <div
                        key={tbl.key}
                        className={`p-3 rounded-2xl border flex items-center justify-between ${
                          isReady
                            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                            : 'bg-amber-50/70 border-amber-200 text-amber-950'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-mono font-bold text-xs truncate">{tbl.label}</p>
                          <p className="text-[10px] text-slate-500">
                            {isReady
                              ? `Tabel aktif ${tbl.count !== undefined ? `(${tbl.count} baris data)` : ''}`
                              : 'Tabel belum dibuat di Supabase'}
                          </p>
                        </div>
                        <div className="shrink-0">
                          {isReady ? (
                            <span className="p-1 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </span>
                          ) : (
                            <button
                              onClick={() => setActiveTab('sql')}
                              className="text-[10px] font-black text-amber-800 bg-amber-200 px-2 py-0.5 rounded cursor-pointer hover:bg-amber-300"
                            >
                              Buat Tabel
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Banner depending on readiness */}
              {!allTablesReady ? (
                <div className="p-4 bg-linear-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 space-y-2">
                  <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Langkah Mudah: Jalankan Skrip SQL di Dashboard Supabase</span>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Untuk membuat tabel di database Supabase Anda, cukup buka <strong>SQL Editor</strong> di Supabase Dashboard Anda, tempelkan skrip yang telah kami siapkan, lalu klik <strong>Run</strong>.
                  </p>
                  <div className="pt-1 flex flex-wrap gap-2">
                    <button
                      onClick={() => setActiveTab('sql')}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-sm"
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Lihat & Salin Skrip SQL</span>
                    </button>
                    <a
                      href="https://supabase.com/dashboard/project/swtgjikzzprbcsytatls/sql"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
                    >
                      <span>Buka Supabase SQL Editor</span>
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-linear-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 space-y-2">
                  <div className="flex items-center space-x-2 text-emerald-900 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Database Supabase Aktif & Siap Digunakan!</span>
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Semua tabel PostgreSQL telah siap di Supabase. Anda dapat menyinkronkan seluruh data aplikasi (32 siswa, iuran kas, dan pengeluaran) ke Supabase.
                  </p>
                  <div className="pt-1 flex flex-wrap gap-2">
                    <button
                      onClick={handlePushAll}
                      disabled={syncing}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center space-x-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>{syncing ? 'Mengunggah...' : 'Unggah Data Sekarang'}</span>
                    </button>
                    <button
                      onClick={handlePullAll}
                      disabled={syncing}
                      className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <DownloadCloud className="w-3.5 h-3.5" />
                      <span>{syncing ? 'Memuat...' : 'Tarik Data dari Supabase'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SQL SCRIPT & SCHEMA */}
          {activeTab === 'sql' && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Skrip SQL Lengkap untuk Supabase
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Mencakup 6 tabel, relasi, Row Level Security (RLS), dan indeks performa.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopySql}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Tersalin!' : 'Salin Skrip SQL'}</span>
                  </button>
                  <a
                    href="https://supabase.com/dashboard/project/swtgjikzzprbcsytatls/sql"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Buka Supabase</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Instructions box */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-700 space-y-1">
                <p className="font-bold text-slate-900">Cara Menjalankan Skrip Ini di Supabase:</p>
                <ol className="list-decimal list-inside space-y-0.5 text-slate-600">
                  <li>Klik tombol hijau <strong>"Salin Skrip SQL"</strong> di atas.</li>
                  <li>Buka proyek Supabase Anda: <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">swtgjikzzprbcsytatls</code>.</li>
                  <li>Pilih menu <strong>SQL Editor</strong> di bilah navigasi kiri Supabase.</li>
                  <li>Klik <strong>New Query</strong>, tempel (Paste) skrip, lalu klik tombol hijau <strong>Run</strong>.</li>
                  <li>Selesai! Kembali ke tab <strong>"Status Koneksi"</strong> lalu klik <strong>"Cek Ulang"</strong>.</li>
                </ol>
              </div>

              {/* Code Viewer */}
              <div className="relative rounded-2xl bg-slate-950 p-4 border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-72 select-all">
                <pre className="whitespace-pre">{SUPABASE_SCHEMA_SQL}</pre>
              </div>
            </div>
          )}

          {/* TAB 3: SYNC DATA */}
          {activeTab === 'sync' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center space-x-2 text-slate-900 font-bold text-xs">
                  <Database className="w-4 h-4 text-emerald-600" />
                  <span>Sinkronisasi Data Dua Arah (Supabase & Aplikasi)</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Aplikasi dilengkapi dengan sinkronisasi otomatis: setiap kali ada perubahan data (seperti pembayaran, pengeluaran kas, atau pendaftaran anggota), perubahan tersebut akan langsung disimpan ke Supabase PostgreSQL.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {/* Push Option */}
                  <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-2">
                    <p className="font-bold text-xs text-slate-800 flex items-center space-x-1.5">
                      <UploadCloud className="w-4 h-4 text-blue-600" />
                      <span>Unggah Data Lokal ke Supabase</span>
                    </p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Kirim seluruh data lokal ({users.length} siswa, kas {classGroup.name}, {payments.length} transaksi pembayaran, dan {expenses.length} catatan pengeluaran) ke database Supabase.
                    </p>
                    <button
                      onClick={handlePushAll}
                      disabled={syncing}
                      className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>{syncing ? 'Mengunggah...' : 'Kirim Semua Data ke Supabase'}</span>
                    </button>
                  </div>

                  {/* Pull Option */}
                  <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-2">
                    <p className="font-bold text-xs text-slate-800 flex items-center space-x-1.5">
                      <DownloadCloud className="w-4 h-4 text-emerald-600" />
                      <span>Tarik Data dari Supabase</span>
                    </p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Ambil data terbaru yang ada di database Supabase untuk diperbarui ke dalam tampilan aplikasi.
                    </p>
                    <button
                      onClick={handlePullAll}
                      disabled={syncing}
                      className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                    >
                      <DownloadCloud className="w-3.5 h-3.5" />
                      <span>{syncing ? 'Mengambil...' : 'Tarik Data dari Supabase'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>swtgjikzzprbcsytatls.supabase.co</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold cursor-pointer transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
