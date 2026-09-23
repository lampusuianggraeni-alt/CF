import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PaymentStatus, User } from '../types';
import { VerificationModal } from './VerificationModal';
import { ProfilePhotoModal } from './ProfilePhotoModal';
import { EditNameModal } from './EditNameModal';
import { UserProfileModal } from './UserProfileModal';
import { MemberProfileDetailModal } from './MemberProfileDetailModal';
import { RecordCashPaymentModal } from './RecordCashPaymentModal';
import { MemberPaymentHistoryModal } from './MemberPaymentHistoryModal';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { Wallet, Users, ArrowUpRight, ArrowDownRight, Bell, CheckCircle2, Clock, AlertTriangle, Search, Filter, PlusCircle, Settings, ShieldCheck, Mail, Send, Camera, Edit3, Lock, ShieldAlert, Coins, History, FileText, Eye } from 'lucide-react';

interface TreasurerDashboardProps {
  setActiveTab: (tab: string) => void;
}

export const TreasurerDashboard: React.FC<TreasurerDashboardProps> = ({ setActiveTab }) => {
  const {
    currentUser,
    classGroup,
    users,
    payments,
    expenses,
    totalBalance,
    totalIncomeThisMonth,
    totalExpenseThisMonth,
    paidMembersCount,
    unpaidMembersCount,
    pendingVerificationCount,
    sendReminder,
    markPaidManual,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('semua');
  const [selectedPaymentForVerif, setSelectedPaymentForVerif] = useState<any>(null);
  const [reminderToast, setReminderToast] = useState<string | null>(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState<boolean>(false);
  const [isSelfNameModalOpen, setIsSelfNameModalOpen] = useState<boolean>(false);
  const [isSelfProfileModalOpen, setIsSelfProfileModalOpen] = useState<boolean>(false);
  const [selectedUserForEditName, setSelectedUserForEditName] = useState<User | null>(null);
  const [selectedUserForProfileDetail, setSelectedUserForProfileDetail] = useState<User | null>(null);

  // States for Catat Setoran Tunai & Riwayat Pembayaran Anggota
  const [isRecordCashOpen, setIsRecordCashOpen] = useState<boolean>(false);
  const [selectedUserForCash, setSelectedUserForCash] = useState<User | null>(null);
  const [isMemberHistoryOpen, setIsMemberHistoryOpen] = useState<boolean>(false);
  const [selectedUserForHistory, setSelectedUserForHistory] = useState<User | null>(null);

  const memberUsers = users.filter((u) => u.role !== 'admin');

  // Broadcast reminder to all unpaid members
  const handleBroadcastReminder = () => {
    sendReminder('all');
    setReminderToast(`Pengingat pembayaran otomatis dikirimkan ke ${unpaidMembersCount} anggota yang belum bayar.`);
    setTimeout(() => setReminderToast(null), 4000);
  };

  // Single member reminder
  const handleSingleReminder = (user: User) => {
    sendReminder(user.id);
    setReminderToast(`Notifikasi pengingat kas dikirimkan ke ${user.name}.`);
    setTimeout(() => setReminderToast(null), 4000);
  };

  // Filter members list with accurate payment calculations
  const filteredMembers = memberUsers.map((u) => {
    const userMonthPayments = payments.filter(
      (pay) => pay.userId === u.id && pay.monthPeriod === classGroup.period
    );
    const approvedPayments = userMonthPayments.filter((p) => p.status === 'lunas');
    const totalPaid = approvedPayments.reduce((sum, p) => sum + p.amount, 0);
    const pendingPayment = userMonthPayments.find((p) => p.status === 'menunggu');
    const latestPayment = userMonthPayments[0] || null;

    let status: 'lunas' | 'dicicil' | 'menunggu' | 'belum_bayar' = 'belum_bayar';
    if (pendingPayment) {
      status = 'menunggu';
    } else if (totalPaid >= classGroup.monthlyDues) {
      status = 'lunas';
    } else if (totalPaid > 0) {
      status = 'dicicil';
    }

    const remaining = Math.max(0, classGroup.monthlyDues - totalPaid);

    return {
      user: u,
      payment: latestPayment,
      pendingPayment,
      status,
      totalPaid,
      remaining,
      duesAmount: classGroup.monthlyDues,
      userMonthPayments,
    };
  }).filter((item) => {
    const matchesSearch = item.user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatusFilter === 'semua' || 
      (selectedStatusFilter === 'lunas' && item.status === 'lunas') ||
      (selectedStatusFilter === 'dicicil' && item.status === 'dicicil') ||
      (selectedStatusFilter === 'menunggu' && item.status === 'menunggu') ||
      (selectedStatusFilter === 'belum_bayar' && (item.status === 'belum_bayar' || item.status === 'dicicil'));
    return matchesSearch && matchesStatus;
  });

  // Recharts Monthly Chart Data
  const monthlyChartData = [
    { name: 'Mei', Pemasukan: 320000, Pengeluaran: 50000 },
    { name: 'Juni', Pemasukan: 350000, Pengeluaran: 80000 },
    { name: 'Juli', Pemasukan: 340000, Pengeluaran: 120000 },
    { name: 'Agustus', Pemasukan: totalIncomeThisMonth, Pengeluaran: totalExpenseThisMonth },
  ];

  const pieData = [
    { name: 'Lunas', value: paidMembersCount, color: '#10B981' },
    { name: 'Menunggu', value: pendingVerificationCount, color: '#F59E0B' },
    { name: 'Belum Bayar', value: unpaidMembersCount, color: '#EF4444' },
  ];

  const pendingPayments = payments.filter((p) => p.status === 'menunggu');

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {reminderToast && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white font-bold text-xs shadow-2xl flex items-center space-x-2 animate-fade-in border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{reminderToast}</span>
        </div>
      )}

      {/* Role Notice & Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div
            onClick={() => setIsSelfProfileModalOpen(true)}
            className="relative group cursor-pointer shrink-0"
            title="Kelola foto profil, username, dan akun bendahara"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-blue-500/20 shadow-sm"
            />
            <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-4 h-4 text-white" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 text-[#2563EB]">
                💼 Bendahara Kas
              </span>
              <span className="text-xs font-bold text-slate-400">{classGroup.name}</span>
            </div>
            <div className="flex items-center space-x-2 mt-0.5">
              <h1 className="text-xl font-black text-slate-900">{currentUser.name}</h1>
              <button
                onClick={() => setIsSelfProfileModalOpen(true)}
                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[#2563EB] rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center space-x-1 transition-colors cursor-pointer"
                title="Kelola Profil & Akun Bendahara"
              >
                <Edit3 className="w-3 h-3" />
                <span>Opsi Profil</span>
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Kelola kas kelas, verifikasi transaksi masuk, catat setor tunai, & periksa identitas anggota.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto">
          <button
            onClick={() => setActiveTab('expenses')}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-2xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
          >
            <ArrowDownRight className="w-4 h-4 text-rose-600" />
            <span>+ Catat Pengeluaran Kas</span>
          </button>
          <button
            onClick={handleBroadcastReminder}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-2xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Kirim Pengingat Masal ({unpaidMembersCount})</span>
          </button>
        </div>
      </div>

      {/* Role Restriction Info Banner */}
      <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Batas Wewenang Role Bendahara:</strong> Bendahara tidak memiliki izin untuk menambah atau menghapus anggota. Manajemen anggota dan kata sandi dikelola langsung oleh <strong>Administrator</strong>.
          </span>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Saldo Kas</span>
            <div className="p-2 bg-blue-50 text-[#2563EB] rounded-xl">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            Rp {totalBalance.toLocaleString('id-ID')}
          </p>
          <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
            Saldo kas aktif kelas saat ini
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Kas Masuk Bulan Ini</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">
            +Rp {totalIncomeThisMonth.toLocaleString('id-ID')}
          </p>
          <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
            {paidMembersCount} dari {memberUsers.length} anggota lunas
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pengeluaran Bulan Ini</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600 mt-2">
            -Rp {totalExpenseThisMonth.toLocaleString('id-ID')}
          </p>
          <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
            {expenses.length} transaksi pengeluaran
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Perlu Diverifikasi</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2">
            {pendingVerificationCount} <span className="text-sm font-bold text-slate-600">Bukti</span>
          </p>
          <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
            {pendingVerificationCount > 0 ? 'Segera periksa bukti transfer' : 'Semua transaksi terverifikasi'}
          </span>
        </div>
      </div>

      {/* Pending Verifications Section (Urgent Action Required) */}
      {pendingPayments.length > 0 && (
        <div className="bg-amber-50/60 border border-amber-200 rounded-3xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-amber-900 font-bold text-sm">
              <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
              <span>Menunggu Verifikasi Bukti Pembayaran ({pendingPayments.length})</span>
            </div>
            <span className="text-xs text-amber-700 font-semibold">
              Klik transaksi untuk verifikasi & setujui
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingPayments.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedPaymentForVerif(p)}
                className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-900 text-xs">{p.userName}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-700">
                      {p.method}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    Periode: {p.monthPeriod} {p.weekPeriod ? `(${p.weekPeriod})` : ''}
                  </p>
                  <p className="text-sm font-black text-slate-900 mt-2">
                    Rp {p.amount.toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-blue-600 font-bold">
                  <span>Lihat Bukti Struk & Setujui</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics & Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Tren Kas Masuk vs Pengeluaran</h2>
              <p className="text-xs text-slate-400">Statistik arus kas kelas 4 bulan terakhir</p>
            </div>
            <div className="flex items-center space-x-3 text-xs font-semibold">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                <span className="text-slate-600">Pemasukan</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                <span className="text-slate-600">Pengeluaran</span>
              </span>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData} barSize={18}>
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(val) => `Rp${val / 1000}k`} />
                <Tooltip
                  formatter={(val: number) => [`Rp ${val.toLocaleString('id-ID')}`, '']}
                  contentStyle={{ borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Bar dataKey="Pemasukan" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Pengeluaran" fill="#F43F5E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Member Payment Status Doughnut */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-slate-900 text-sm">Status Pembayaran Anggota</h2>
            <p className="text-xs text-slate-400">Periode: {classGroup.period}</p>

            <div className="h-40 w-full relative mt-2 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center">
                <span className="text-xl font-black text-slate-900 block">{paidMembersCount}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Lunas</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs font-semibold">
            <div className="flex justify-between items-center text-emerald-700">
              <span className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Lunas:</span>
              </span>
              <span>{paidMembersCount} Anggota ({Math.round((paidMembersCount / memberUsers.length) * 100)}%)</span>
            </div>
            <div className="flex justify-between items-center text-amber-700">
              <span className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Menunggu Verifikasi:</span>
              </span>
              <span>{pendingVerificationCount} Anggota</span>
            </div>
            <div className="flex justify-between items-center text-rose-700">
              <span className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Belum Bayar:</span>
              </span>
              <span>{unpaidMembersCount} Anggota</span>
            </div>
          </div>
        </div>
      </div>

      {/* Member Checklist & Cash Recording Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-slate-900 text-base">Checklist & Verifikasi Anggota ({memberUsers.length} Siswa)</h2>
            <p className="text-xs text-slate-400">
              Catat pembayaran tunai langsung, verifikasi bukti transfer, atau kirim pengingat personal.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Cari nama anggota..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none w-48"
              />
            </div>

            {/* Filter Tabs & Quick Action */}
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
            >
              <option value="semua">Semua Status</option>
              <option value="lunas">🟢 Lunas ({paidMembersCount})</option>
              <option value="dicicil">🔵 Sedang Dicicil</option>
              <option value="menunggu">🟡 Menunggu Verifikasi ({pendingVerificationCount})</option>
              <option value="belum_bayar">🔴 Belum Bayar ({unpaidMembersCount})</option>
            </select>

            {/* Quick Action Button for Cash Recording */}
            <button
              type="button"
              onClick={() => {
                setSelectedUserForCash(null);
                setIsRecordCashOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
              title="Catat setoran tunai dengan pilihan nominal ribuan fleksibel"
            >
              <Coins className="w-4 h-4" />
              <span>+ Catat Setoran Tunai</span>
            </button>
          </div>
        </div>

        {/* Member Checklist Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Nama Anggota</th>
                <th className="py-3 px-4">Status Kas Bulan Ini</th>
                <th className="py-3 px-4">Setoran Terkumpul</th>
                <th className="py-3 px-4">Transaksi Terakhir</th>
                <th className="py-3 px-4 text-right">Aksi Bendahara</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredMembers.map(({ user, payment, pendingPayment, status, totalPaid, remaining, duesAmount, userMonthPayments }) => (
                <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-3">
                      <div
                        onClick={() => setSelectedUserForProfileDetail(user)}
                        className="relative group cursor-pointer shrink-0"
                        title={`Klik untuk lihat foto & profil lengkap ${user.name}`}
                      >
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-2xl object-cover border-2 border-slate-200 group-hover:border-blue-500 shadow-xs transition-colors"
                        />
                        <div className="absolute inset-0 bg-blue-600/30 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Eye className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <p 
                            onClick={() => setSelectedUserForProfileDetail(user)}
                            className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer transition-colors"
                            title="Klik untuk detail profil siswa"
                          >
                            {user.name}
                          </p>
                          <button
                            onClick={() => setSelectedUserForEditName(user)}
                            className="p-1 text-slate-400 hover:text-[#2563EB] hover:bg-blue-50 rounded transition-colors cursor-pointer"
                            title={`Ubah nama ${user.name}`}
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex items-center space-x-1.5 text-[10px]">
                          <span className="font-mono font-bold text-blue-600">@{user.username || 'user'}</span>
                          {user.nisn && <span className="text-slate-400">• NISN: {user.nisn}</span>}
                        </div>
                        <p className="text-[10px] text-slate-400">{user.email} {user.phone ? `• WA: ${user.phone}` : ''}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full font-bold text-[10px] ${
                        status === 'lunas'
                          ? 'bg-emerald-100 text-emerald-800'
                          : status === 'dicicil'
                          ? 'bg-blue-100 text-blue-800'
                          : status === 'menunggu'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      <span>
                        {status === 'lunas'
                          ? '🟢 LUNAS'
                          : status === 'dicicil'
                          ? '🔵 DICICIL'
                          : status === 'menunggu'
                          ? '🟡 PERLU VERIFIKASI'
                          : '🔴 BELUM BAYAR'}
                      </span>
                    </span>
                    {status === 'dicicil' && (
                      <p className="text-[10px] text-blue-700 font-bold mt-0.5">
                        Sisa Rp {remaining.toLocaleString('id-ID')}
                      </p>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-black text-slate-900">
                      Rp {totalPaid.toLocaleString('id-ID')}
                      <span className="text-slate-400 font-medium text-[10px] block">
                        Target: Rp {duesAmount.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-500">
                    {payment ? (
                      <div>
                        <span className="font-semibold text-slate-700 capitalize">
                          {payment.method === 'cash_manual' ? '💵 Setor Tunai' : payment.method}
                        </span>
                        <p className="text-[10px] text-slate-400">
                          {payment.date} {payment.weekPeriod ? `• ${payment.weekPeriod}` : ''}
                        </p>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">Belum ada setoran</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                    {/* Tombol Lihat Profil Lengkap Anggota */}
                    <button
                      onClick={() => setSelectedUserForProfileDetail(user)}
                      className="px-2.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs transition-colors cursor-pointer inline-flex items-center space-x-1"
                      title={`Lihat foto & profil lengkap ${user.name}`}
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                      <span>Profil</span>
                    </button>

                    {/* Tombol Riwayat Pembayaran Anggota */}
                    <button
                      onClick={() => {
                        setSelectedUserForHistory(user);
                        setIsMemberHistoryOpen(true);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer inline-flex items-center space-x-1"
                      title={`Lihat riwayat pembayaran ${user.name}`}
                    >
                      <History className="w-3.5 h-3.5 text-slate-500" />
                      <span>Riwayat</span>
                    </button>

                    {/* Tombol Catat Tunai (Bisa Diatur Berapa Ribu) */}
                    <button
                      onClick={() => {
                        setSelectedUserForCash(user);
                        setIsRecordCashOpen(true);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs transition-colors cursor-pointer inline-flex items-center space-x-1"
                      title={`Catat setoran kas tunai untuk ${user.name} (Atur nominal ribuan)`}
                    >
                      <Coins className="w-3.5 h-3.5 text-emerald-600" />
                      <span>+ Catat Tunai</span>
                    </button>

                    {/* Verifikasi Bukti jika ada yang menunggu */}
                    {status === 'menunggu' && pendingPayment && (
                      <button
                        onClick={() => setSelectedPaymentForVerif(pendingPayment)}
                        className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                      >
                        Verifikasi
                      </button>
                    )}

                    {/* Tombol Pengingat jika belum lunas */}
                    {status !== 'lunas' && (
                      <button
                        onClick={() => handleSingleReminder(user)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs transition-colors cursor-pointer"
                        title="Kirim notifikasi pengingat kas"
                      >
                        Pengingat
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Profil Anggota untuk Bendahara */}
      <MemberProfileDetailModal
        user={selectedUserForProfileDetail}
        isOpen={Boolean(selectedUserForProfileDetail)}
        onClose={() => setSelectedUserForProfileDetail(null)}
        onRecordCash={(u) => {
          setSelectedUserForCash(u);
          setIsRecordCashOpen(true);
        }}
        onViewHistory={(u) => {
          setSelectedUserForHistory(u);
          setIsMemberHistoryOpen(true);
        }}
      />

      {/* Modal Profil Bendahara Sendiri */}
      <UserProfileModal
        isOpen={isSelfProfileModalOpen}
        onClose={() => setIsSelfProfileModalOpen(false)}
      />

      {/* Modal Catat Setoran Tunai (Bisa diatur berapa ribu yang dibayar) */}
      <RecordCashPaymentModal
        isOpen={isRecordCashOpen}
        targetUser={selectedUserForCash}
        onClose={() => {
          setIsRecordCashOpen(false);
          setSelectedUserForCash(null);
        }}
      />

      {/* Modal Riwayat Pembayaran Anggota */}
      <MemberPaymentHistoryModal
        isOpen={isMemberHistoryOpen}
        user={selectedUserForHistory}
        onClose={() => {
          setIsMemberHistoryOpen(false);
          setSelectedUserForHistory(null);
        }}
        onOpenRecordCash={(u) => {
          setIsMemberHistoryOpen(false);
          setSelectedUserForCash(u);
          setIsRecordCashOpen(true);
        }}
      />

      {/* Verification Drawer / Modal */}
      {selectedPaymentForVerif && (
        <VerificationModal
          payment={selectedPaymentForVerif}
          onClose={() => setSelectedPaymentForVerif(null)}
        />
      )}

      {/* Profile Photo Modal */}
      <ProfilePhotoModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
      />

      {/* Edit Member Name Modal */}
      <EditNameModal
        user={selectedUserForEditName}
        isOpen={Boolean(selectedUserForEditName)}
        onClose={() => setSelectedUserForEditName(null)}
      />

      {/* Edit Self Name Modal */}
      <EditNameModal
        user={currentUser}
        isOpen={isSelfNameModalOpen}
        onClose={() => setIsSelfNameModalOpen(false)}
      />
    </div>
  );
};
