import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PaymentStatus } from '../types';
import { CreditCard, History, FileText, CheckCircle2, AlertTriangle, Clock, ArrowRight, ShieldCheck, QrCode, Wallet, TrendingUp, Sparkles, Check, XCircle, Camera, Edit3, Coins, Lock, KeyRound, Mail } from 'lucide-react';
import { ProfilePhotoModal } from './ProfilePhotoModal';
import { EditNameModal } from './EditNameModal';
import { UserProfileModal } from './UserProfileModal';
import { SelfPasswordModal } from './SelfPasswordModal';
import { PaymentDurationOption } from './PaymentModal';

interface MemberDashboardProps {
  onOpenPayModal: (option?: PaymentDurationOption) => void;
  setActiveTab: (tab: string) => void;
  onOpenQrModal: () => void;
}

export const MemberDashboard: React.FC<MemberDashboardProps> = ({
  onOpenPayModal,
  setActiveTab,
  onOpenQrModal,
}) => {
  const { currentUser, classGroup, payments, totalBalance, paidMembersCount, users } = useApp();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const weeklyFee = classGroup.weeklyDues || 6000;
  const monthlyFee = classGroup.monthlyDues || 24000;

  // Find all payments for current member in this month
  const userMonthPayments = payments.filter(
    (p) => p.userId === currentUser.id && p.monthPeriod === classGroup.period && p.status === 'lunas'
  );

  const totalPaidThisMonth = userMonthPayments.reduce((sum, p) => sum + p.amount, 0);

  // Check which weeks are paid
  const isWeekPaid = (weekNum: number) => {
    return totalPaidThisMonth >= weekNum * weeklyFee;
  };

  const isFullMonthPaid = totalPaidThisMonth >= monthlyFee;
  const hasPendingPayment = payments.some(
    (p) => p.userId === currentUser.id && p.monthPeriod === classGroup.period && p.status === 'menunggu'
  );

  // Total members in class
  const memberList = users.filter((u) => u.role === 'anggota');
  const totalMembers = memberList.length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner Card with Profile Photo */}
      <div className="relative overflow-hidden rounded-3xl bg-[#2563EB] text-white p-6 sm:p-8 shadow-xl border border-blue-400/30">
        <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center space-x-4">
            {/* Avatar with quick edit trigger */}
            <div className="relative group shrink-0">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-white/90 shadow-xl"
              />
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="absolute bottom-0 right-0 p-1.5 bg-[#1E293B] hover:bg-slate-900 text-white rounded-full shadow-md border-2 border-white transition-transform hover:scale-110 cursor-pointer"
                title="Ganti Foto Profil"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center space-x-2 px-3 py-0.5 bg-white/15 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-wider text-white border border-white/20">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>HAK AKSES: ANGGOTA KELAS ({currentUser.name})</span>
              </div>
              <h1 className="text-xl sm:text-3xl font-black tracking-tight uppercase">
                Halo, {currentUser.name}! 👋
              </h1>
              <p className="text-blue-100 text-xs sm:text-sm font-medium">
                Iuran kas: <strong>Rp {weeklyFee.toLocaleString('id-ID')} / minggu</strong> • {totalMembers} Anggota {classGroup.name}
              </p>

              {/* Google Email Connected Indicator */}
              <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[11px] text-blue-100">
                <span className="flex items-center space-x-1.5 bg-black/20 px-2.5 py-0.5 rounded-lg border border-white/10">
                  <Mail className="w-3.5 h-3.5 text-amber-300" />
                  <span>Google: <strong className="text-white font-mono">{currentUser.googleEmail || currentUser.email}</strong></span>
                </span>
                <span className="px-2 py-0.5 bg-emerald-400/25 text-emerald-200 border border-emerald-400/40 rounded-lg text-[10px] font-black uppercase tracking-wider">
                  ✓ Email Terverifikasi
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 pt-1.5">
                <button
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="text-[11px] font-black text-emerald-950 uppercase tracking-wider bg-emerald-300 hover:bg-emerald-200 px-3 py-1.5 rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-md shadow-emerald-950/20 transition-all border border-emerald-200"
                  title="Atur atau Ubah Kata Sandi Pribadi Anda Sendiri"
                >
                  <Lock className="w-3.5 h-3.5 text-emerald-900" />
                  <span>🔐 Atur & Ubah Sandi Pribadi</span>
                </button>
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="text-[11px] font-black text-slate-900 uppercase tracking-wider bg-amber-300 hover:bg-amber-200 px-3 py-1.5 rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-md shadow-amber-950/20 transition-all border border-amber-200"
                  title="Kelola Foto Profil, Username Login & Kontak Siswa"
                >
                  <Camera className="w-3.5 h-3.5 text-slate-900" />
                  <span>⚙️ Opsi Profil & Username</span>
                </button>
                <button
                  onClick={() => setIsNameModalOpen(true)}
                  className="text-[11px] font-black text-white hover:text-amber-200 uppercase tracking-wider bg-white/15 hover:bg-white/25 px-2.5 py-1.5 rounded-xl flex items-center space-x-1.5 cursor-pointer border border-white/20 transition-all"
                  title="Ubah Nama Tampilan Siswa"
                >
                  <Edit3 className="w-3 h-3 text-amber-300" />
                  <span>Ganti Nama</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onOpenPayModal('nominal_1000')}
              className="px-5 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-950/20 flex items-center space-x-2 transition-all cursor-pointer border border-amber-300"
              title="Bayar Uang Kas Ringan Rp 1.000"
            >
              <Coins className="w-4 h-4 text-slate-950" />
              <span>BAYAR KAS RP 1.000</span>
            </button>
            <button
              onClick={() => onOpenPayModal('1_minggu')}
              className="px-5 py-3.5 rounded-2xl bg-white text-[#2563EB] hover:bg-blue-50 active:scale-95 font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-900/20 flex items-center space-x-2 transition-all cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>BAYAR KAS MINGGUAN</span>
            </button>
            <button
              onClick={onOpenQrModal}
              className="px-4 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-black text-xs uppercase tracking-wider flex items-center space-x-2 border border-white/20 transition-all cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>ID QR Setor</span>
            </button>
          </div>
        </div>
      </div>

      {/* Self-service Password Setup Alert for Members who haven't set custom password */}
      {!currentUser.hasCustomPassword && (
        <div className="rounded-3xl bg-linear-to-r from-emerald-50 via-teal-50 to-blue-50 p-4 sm:p-5 border border-emerald-300 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-sm shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                  Atur Sandi Pribadi Anda Sendiri
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-black text-[9px] uppercase tracking-wider">
                  100% Privat
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Akun Anda saat ini masih memakai sandi bawaan. Buat kata sandi rahasia Anda sendiri yang tidak bisa dilihat oleh siapa pun (termasuk Admin & Bendahara).
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-emerald-500/20 flex items-center space-x-2 transition-all cursor-pointer shrink-0"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Atur Sandi Sekarang</span>
          </button>
        </div>
      )}

      {/* Opsi Bayar Kas Rp 1.000 (Cicilan Fleksibel) */}
      <div className="rounded-3xl bg-linear-to-r from-amber-50/90 via-orange-50/40 to-blue-50/70 p-5 sm:p-6 border border-amber-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-amber-500 text-slate-950 rounded-2xl shadow-sm shrink-0">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Opsi Bayar Kas Rp 1.000 Tersedia!</h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-black text-[9px] uppercase tracking-wider">
                Khusus Anggota
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              Ingin menyicil uang kas harian atau bayar uang receh? Anggota dapat setor langsung kelipatan Rp 1.000 via QRIS, e-Wallet, atau tunai ke bendahara.
            </p>
          </div>
        </div>
        <button
          onClick={() => onOpenPayModal('nominal_1000')}
          className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md shadow-amber-200 flex items-center space-x-2 transition-all cursor-pointer shrink-0"
        >
          <Coins className="w-4 h-4 text-slate-950" />
          <span>Bayar Kas Rp 1.000</span>
        </button>
      </div>

      {/* Weekly Breakdown Matrix for Member */}
      <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">
              Status Pembayaran Kas Mingguan ({classGroup.period})
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Tarif: <strong>Rp {weeklyFee.toLocaleString('id-ID')}</strong> per pekan • Total Bulan: <strong>Rp {monthlyFee.toLocaleString('id-ID')}</strong>
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
              isFullMonthPaid
                ? 'bg-emerald-100 text-emerald-800'
                : hasPendingPayment
                ? 'bg-amber-100 text-amber-800'
                : 'bg-rose-100 text-rose-800'
            }`}>
              {isFullMonthPaid ? '1 Bulan Penuh Lunas ✅' : hasPendingPayment ? 'Menunggu Verifikasi 🟡' : 'Belum Lunas 4 Minggu'}
            </span>
          </div>
        </div>

        {/* 4-Week Progress Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((wk) => {
            const paid = isWeekPaid(wk);
            return (
              <div
                key={wk}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  paid
                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Minggu #{wk}
                  </span>
                  {paid ? (
                    <span className="p-1 bg-emerald-600 text-white rounded-full">
                      <Check className="w-3 h-3" />
                    </span>
                  ) : (
                    <span className="p-1 bg-slate-300 text-slate-600 rounded-full">
                      <Clock className="w-3 h-3" />
                    </span>
                  )}
                </div>

                <p className="text-lg font-black text-slate-900">
                  Rp {weeklyFee.toLocaleString('id-ID')}
                </p>
                <span
                  className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    paid
                      ? 'bg-emerald-200/80 text-emerald-900'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {paid ? 'Lunas ✅' : 'Belum Bayar'}
                </span>
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-blue-900 font-medium">
            💡 Total sudah disetor bulan ini: <strong className="text-[#2563EB] font-black">Rp {totalPaidThisMonth.toLocaleString('id-ID')}</strong> dari <strong className="font-black">Rp {monthlyFee.toLocaleString('id-ID')}</strong>.
          </div>
          {!isFullMonthPaid && (
            <button
              onClick={onOpenPayModal}
              className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-black rounded-xl uppercase tracking-wider shadow-xs cursor-pointer shrink-0"
            >
              Bayar Sisa Tagihan
            </button>
          )}
        </div>
      </div>

      {/* Main Status & Dues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Monthly Payment Summary Card */}
        <div className="col-span-1 md:col-span-2 rounded-3xl p-6 border shadow-sm flex flex-col justify-between bg-white border-slate-200">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-[#2563EB]" />
                <span className="text-xs font-black text-slate-600 uppercase tracking-widest">
                  Ringkasan Kas Anggota
                </span>
              </div>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                Jatuh Tempo: Tgl {classGroup.dueDate} {classGroup.period}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Iuran Kas Mingguan</p>
                <p className="text-2xl font-black text-slate-900">
                  Rp {weeklyFee.toLocaleString('id-ID')} <span className="text-xs font-bold text-slate-500">/ pekan</span>
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Kas 1 Bulan (4 Pekan)</p>
                <p className="text-2xl font-black text-[#2563EB]">
                  Rp {monthlyFee.toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Bendahara Kelas: <span className="font-black text-slate-900">{classGroup.treasurerName}</span>
            </div>

            <button
              onClick={() => setActiveTab('riwayat')}
              className="text-xs font-black uppercase tracking-wider text-[#2563EB] hover:text-blue-800 flex items-center space-x-1 cursor-pointer"
            >
              <span>Lihat Kuitansi Saya</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Class Balance Summary Card */}
        <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Saldo Kas Kelas</span>
              <div className="p-2.5 bg-blue-50 text-[#2563EB] rounded-2xl">
                <Wallet className="w-5 h-5" />
              </div>
            </div>

            <p className="text-3xl font-black text-[#2563EB] tracking-tight">
              Rp {totalBalance.toLocaleString('id-ID')}
            </p>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">
              Kas Aktif {totalMembers} Anggota {classGroup.name}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
            <button
              onClick={() => setActiveTab('laporan')}
              className="w-full py-3 bg-[#2563EB] hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center space-x-1.5 shadow-md shadow-blue-200 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Transparansi Laporan Kas</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={onOpenPayModal}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-[#2563EB] hover:shadow-md transition-all text-left group flex items-center space-x-4 cursor-pointer"
        >
          <div className="p-3.5 rounded-2xl bg-blue-50 text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm group-hover:text-[#2563EB] transition-colors uppercase tracking-tight">
              Bayar Kas (Rp 6.000)
            </h3>
            <p className="text-xs text-slate-500 font-medium">QRIS, E-Wallet, atau Transfer</p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('riwayat')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all text-left group flex items-center space-x-4 cursor-pointer"
        >
          <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-600 transition-colors uppercase tracking-tight">
              Kuitansi & Riwayat
            </h3>
            <p className="text-xs text-slate-500 font-medium">Download bukti pembayaran</p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('laporan')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-purple-500 hover:shadow-md transition-all text-left group flex items-center space-x-4 cursor-pointer"
        >
          <div className="p-3.5 rounded-2xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm group-hover:text-purple-600 transition-colors uppercase tracking-tight">
              Laporan Keuangan
            </h3>
            <p className="text-xs text-slate-500 font-medium">Cek pengeluaran & nota kelas</p>
          </div>
        </button>
      </div>

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Edit Name Modal */}
      <EditNameModal
        user={currentUser}
        isOpen={isNameModalOpen}
        onClose={() => setIsNameModalOpen(false)}
      />

      {/* Self Password Modal */}
      <SelfPasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
};
