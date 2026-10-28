import React, { useEffect } from 'react';
import { ShieldCheck, UserCheck, ShieldAlert, X, Check, Lock, KeyRound, Users, Shield } from 'lucide-react';

interface RolePermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RolePermissionModal: React.FC<RolePermissionModalProps> = ({ isOpen, onClose }) => {
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

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full p-6 sm:p-8 relative border border-slate-100 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 bg-blue-100 text-[#2563EB] rounded-2xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                Struktur 3 Role Pengguna & Hak Akses
              </h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                Admin • Bendahara • Anggota (Class Fund)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
          {/* 1. ADMIN */}
          <div className="p-5 rounded-3xl bg-purple-50/60 border border-purple-200 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-purple-700 text-white text-xs font-black uppercase tracking-wider">
                  👑 1. Administrator
                </span>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                  Akses Penuh
                </span>
              </div>
              <p className="text-xs text-purple-950 font-medium">
                Admin memiliki otoritas tertinggi atas seluruh aplikasi dan pengelolaan akun.
              </p>

              <div className="space-y-2 text-xs">
                <div className="flex items-start space-x-2 text-slate-700">
                  <Check className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                  <span><strong>Menyediakan & mengelola login</strong> untuk seluruh pengguna (Admin, Bendahara, Anggota).</span>
                </div>
                <div className="flex items-start space-x-2 text-slate-700">
                  <Check className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                  <span><strong>Tambah anggota baru</strong> dan buat username/password awal.</span>
                </div>
                <div className="flex items-start space-x-2 text-slate-700">
                  <Check className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                  <span><strong>Hapus akun anggota/pengguna</strong> dari sistem kas kelas.</span>
                </div>
                <div className="flex items-start space-x-2 text-slate-700">
                  <Check className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                  <span><strong>Reset kata sandi sementara</strong> (kata sandi asli pengguna terlindungi privasi & tidak dapat dilihat siapapun).</span>
                </div>
                <div className="flex items-start space-x-2 text-slate-700">
                  <Check className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                  <span>Konfigurasi data kelas, nominal kas, jatuh tempo, & nomor rekening kas.</span>
                </div>
              </div>
            </div>

            <div className="mt-3 p-2.5 bg-purple-100/60 rounded-xl text-[11px] font-semibold text-purple-900">
              NISN Admin: <code className="font-mono bg-white px-1.5 py-0.5 rounded">0061234501</code> / Sandi: <code className="font-mono bg-white px-1.5 py-0.5 rounded">admin123</code>
            </div>
          </div>

          {/* 2. BENDAHARA */}
          <div className="p-5 rounded-3xl bg-blue-50/60 border border-blue-200 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-[#2563EB] text-white text-xs font-black uppercase tracking-wider">
                  💼 2. Bendahara
                </span>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                  Pengelola Kas
                </span>
              </div>
              <p className="text-xs text-blue-950 font-medium">
                Wewenang penuh untuk operasional arus kas, verifikasi, dan pencatatan pengeluaran.
              </p>

              <div className="space-y-2 text-xs">
                <div className="flex items-start space-x-2 text-slate-700">
                  <Check className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <span>Verifikasi atau tolak bukti transfer pembayaran uang kas dari seluruh siswa.</span>
                </div>
                <div className="flex items-start space-x-2 text-slate-700">
                  <Check className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <span>Input setor tunai langsung (Tandai Lunas kas mingguan / bulanan).</span>
                </div>
                <div className="flex items-start space-x-2 text-slate-700">
                  <Check className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <span>Tambah, edit, dan hapus pengeluaran kas kelas (lengkap nota).</span>
                </div>
                <div className="flex items-start space-x-2 text-slate-700">
                  <Check className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <span>Kirim pengingat pembayaran ke anggota.</span>
                </div>

                <div className="pt-2 border-t border-blue-200/80 space-y-1 text-rose-700 font-semibold">
                  <div className="flex items-start space-x-1.5">
                    <Lock className="w-3.5 h-3.5 text-rose-600 mt-0.5 shrink-0" />
                    <span><strong>Tidak bisa menambah anggota baru</strong> (Khusus Admin).</span>
                  </div>
                  <div className="flex items-start space-x-1.5">
                    <Lock className="w-3.5 h-3.5 text-rose-600 mt-0.5 shrink-0" />
                    <span><strong>Tidak bisa menghapus anggota</strong> (Khusus Admin).</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 p-2.5 bg-blue-100/60 rounded-xl text-[11px] font-semibold text-blue-900">
              NISN Bendahara: <code className="font-mono bg-white px-1.5 py-0.5 rounded">BND-IXA-01</code> / Sandi: <code className="font-mono bg-white px-1.5 py-0.5 rounded">bendahara123</code>
            </div>
          </div>

          {/* 3. ANGGOTA */}
          <div className="p-5 rounded-3xl bg-emerald-50/60 border border-emerald-200 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-emerald-700 text-white text-xs font-black uppercase tracking-wider">
                  🎓 3. Anggota Siswa
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  Siswa
                </span>
              </div>
              <p className="text-xs text-emerald-950 font-medium">
                Siswa membayar uang kas secara mandiri dan memantau transparansi keuangan kelas.
              </p>

              <div className="space-y-2 text-xs">
                <div className="flex items-start space-x-2 text-slate-700">
                  <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>Login dengan kata sandi pribadi yang 100% rahasia (tidak bisa dilihat oleh sesama siswa, bendahara, atau admin).</span>
                </div>
                <div className="flex items-start space-x-2 text-slate-700">
                  <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>Bayar uang kas mingguan Rp 6.000 atau bulanan Rp 24.000 via QRIS / Rekening / Tunai.</span>
                </div>
                <div className="flex items-start space-x-2 text-slate-700">
                  <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>Upload bukti transfer & unduh kuitansi digital lunas.</span>
                </div>
                <div className="flex items-start space-x-2 text-slate-700">
                  <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>Lihat QR ID Anggota, riwayat pembayaran pribadi, dan laporan kas terbuka.</span>
                </div>
              </div>
            </div>

            <div className="mt-3 p-2.5 bg-emerald-100/60 rounded-xl text-[11px] font-semibold text-emerald-900">
              Akun Siswa: Didaftarkan oleh Administrator melalui Dashboard Admin.
            </div>
          </div>
        </div>

        <div className="pt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-[#2563EB] hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-md shadow-blue-200 cursor-pointer"
          >
            Mengerti & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
