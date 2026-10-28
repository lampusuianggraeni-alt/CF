import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Payment, User } from '../types';
import { RecordCashPaymentModal } from './RecordCashPaymentModal';
import { MemberPaymentHistoryModal } from './MemberPaymentHistoryModal';
import {
  History,
  Search,
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  X,
  ShieldCheck,
  Coins,
  Receipt,
  UserCheck,
  Layers,
  Banknote,
  QrCode,
  ArrowDownRight,
} from 'lucide-react';

export const PaymentHistoryView: React.FC = () => {
  const { currentUser, payments, users, classGroup } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('semua');
  const [selectedMethod, setSelectedMethod] = useState<string>('semua');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('semua');
  const [selectedTxn, setSelectedTxn] = useState<Payment | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedTxn) {
        setSelectedTxn(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTxn]);

  // Modals
  const [isRecordCashOpen, setIsRecordCashOpen] = useState<boolean>(false);
  const [selectedUserForCash, setSelectedUserForCash] = useState<User | null>(null);
  const [isMemberHistoryOpen, setIsMemberHistoryOpen] = useState<boolean>(false);
  const [selectedUserForHistory, setSelectedUserForHistory] = useState<User | null>(null);

  const isStaff = currentUser.role === 'bendahara' || currentUser.role === 'admin';
  const memberUsers = users.filter((u) => u.role === 'anggota');

  // Base list depending on role
  const relevantPayments = isStaff
    ? selectedMemberId === 'semua'
      ? payments
      : payments.filter((p) => p.userId === selectedMemberId)
    : payments.filter((p) => p.userId === currentUser.id);

  const filteredPayments = relevantPayments.filter((p) => {
    const matchesSearch =
      p.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.monthPeriod.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.notes && p.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = selectedStatus === 'semua' || p.status === selectedStatus;
    const matchesMethod =
      selectedMethod === 'semua' ||
      (selectedMethod === 'cash_manual' && p.method === 'cash_manual') ||
      (selectedMethod === 'digital' && p.method !== 'cash_manual');

    return matchesSearch && matchesStatus && matchesMethod;
  });

  // Calculate summary metrics
  const totalLunasAmount = filteredPayments
    .filter((p) => p.status === 'lunas')
    .reduce((sum, p) => sum + p.amount, 0);

  const cashPaymentsTotal = filteredPayments
    .filter((p) => p.status === 'lunas' && p.method === 'cash_manual')
    .reduce((sum, p) => sum + p.amount, 0);

  const digitalPaymentsTotal = filteredPayments
    .filter((p) => p.status === 'lunas' && p.method !== 'cash_manual')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Kas Masuk Terverifikasi</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">
              Rp {totalLunasAmount.toLocaleString('id-ID')}
            </p>
            <p className="text-[10px] text-slate-500 font-medium">
              Dari {filteredPayments.filter((p) => p.status === 'lunas').length} transaksi lunas
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Banknote className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Setoran Tunai (Bendahara)</p>
            <p className="text-xl font-black text-blue-600 mt-0.5">
              Rp {cashPaymentsTotal.toLocaleString('id-ID')}
            </p>
            <p className="text-[10px] text-slate-500 font-medium">
              Dicatat langsung secara tunai
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Setoran Digital (QRIS / e-Wallet)</p>
            <p className="text-xl font-black text-violet-600 mt-0.5">
              Rp {digitalPaymentsTotal.toLocaleString('id-ID')}
            </p>
            <p className="text-[10px] text-slate-500 font-medium">
              Transfer otomatis & instan
            </p>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <History className="w-6 h-6 text-emerald-600" />
              <h2 className="text-xl font-black text-slate-900">
                {isStaff ? 'Riwayat Pembayaran Kas Anggota' : 'Riwayat Pembayaran Kas Saya'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {isStaff
                ? `Laporan pembukuan seluruh setoran kas anggota kelas (${classGroup.name})`
                : `Daftar seluruh riwayat transaksi pembayaran kas atas nama ${currentUser.name}`}
            </p>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-2">
            {isStaff && (
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
                <span>+ Catat Tunai</span>
              </button>
            )}

            {/* Filter Anggota jika bendahara */}
            {isStaff && (
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none max-w-44"
              >
                <option value="semua">Semua Anggota</option>
                {memberUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            )}

            {/* Filter Metode */}
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="semua">Semua Jalur</option>
              <option value="cash_manual">💵 Tunai (Bendahara)</option>
              <option value="digital">📱 Digital (QRIS/e-Wallet)</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="semua">Semua Status</option>
              <option value="lunas">🟢 Lunas</option>
              <option value="menunggu">🟡 Menunggu Verifikasi</option>
            </select>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Cari nama, ID, periode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none w-44"
              />
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        {filteredPayments.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-3xl">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">Belum Ada Catatan Transaksi</p>
            <p className="text-xs text-slate-400 mt-1">
              Tidak ada pembayaran yang sesuai dengan kriteria filter saat ini.
            </p>
            {isStaff && (
              <button
                type="button"
                onClick={() => {
                  setSelectedUserForCash(null);
                  setIsRecordCashOpen(true);
                }}
                className="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center space-x-1.5"
              >
                <Coins className="w-4 h-4" />
                <span>Catat Pembayaran Tunai Sekarang</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Tanggal & ID</th>
                  {isStaff && <th className="py-3 px-4">Nama Anggota</th>}
                  <th className="py-3 px-4">Periode & Alokasi</th>
                  <th className="py-3 px-4">Metode</th>
                  <th className="py-3 px-4">Nominal</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredPayments.map((p) => {
                  const memberObj = users.find((u) => u.id === p.userId);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{p.date}</p>
                        <p className="font-mono text-[10px] text-slate-400">{p.transactionId}</p>
                      </td>

                      {isStaff && (
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => {
                              if (memberObj) {
                                setSelectedUserForHistory(memberObj);
                                setIsMemberHistoryOpen(true);
                              }
                            }}
                            className="text-left group flex items-center space-x-2.5 cursor-pointer"
                          >
                            <img
                              src={memberObj?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120'}
                              alt={p.userName}
                              className="w-7 h-7 rounded-full object-cover border border-slate-200"
                            />
                            <div>
                              <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                {p.userName}
                              </p>
                              <span className="text-[10px] text-slate-400 block">
                                {memberObj?.className || 'Siswa'}
                              </span>
                            </div>
                          </button>
                        </td>
                      )}

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-800">{p.monthPeriod}</p>
                        {p.weekPeriod && (
                          <span className="text-[10px] text-slate-500 block font-medium">
                            {p.weekPeriod}
                          </span>
                        )}
                        {p.notes && (
                          <p className="text-[10px] text-slate-400 italic max-w-xs truncate">
                            "{p.notes}"
                          </p>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[10px] uppercase tracking-wider">
                          {p.method === 'cash_manual' ? '💵 Setor Tunai' : p.method}
                        </span>
                        {p.verifiedBy && (
                          <span className="text-[9px] text-slate-400 block mt-0.5 font-mono">
                            Oleh: {p.verifiedBy}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                        Rp {p.amount.toLocaleString('id-ID')}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full font-bold text-[10px] ${
                            p.status === 'lunas'
                              ? 'bg-emerald-100 text-emerald-800'
                              : p.status === 'menunggu'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {p.status === 'lunas' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {p.status === 'menunggu' && <Clock className="w-3 h-3 text-amber-600" />}
                          {p.status === 'belum_bayar' && <AlertTriangle className="w-3 h-3 text-rose-600" />}
                          <span>
                            {p.status === 'lunas'
                              ? 'LUNAS'
                              : p.status === 'menunggu'
                              ? 'VERIFIKASI'
                              : 'BELUM BAYAR'}
                          </span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedTxn(p)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer inline-flex items-center space-x-1"
                        >
                          <Receipt className="w-3.5 h-3.5 text-slate-500" />
                          <span>Struk</span>
                        </button>

                        {isStaff && memberObj && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUserForCash(memberObj);
                              setIsRecordCashOpen(true);
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs transition-colors cursor-pointer inline-flex items-center space-x-1"
                            title={`Catat setoran tunai untuk ${p.userName}`}
                          >
                            <Coins className="w-3.5 h-3.5 text-emerald-600" />
                            <span>+ Setor</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Catat Pembayaran Tunai */}
      <RecordCashPaymentModal
        isOpen={isRecordCashOpen}
        targetUser={selectedUserForCash}
        onClose={() => {
          setIsRecordCashOpen(false);
          setSelectedUserForCash(null);
        }}
      />

      {/* Modal Riwayat Khusus Anggota Terpilih */}
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

      {/* Struk Modal */}
      {selectedTxn && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedTxn(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 relative border border-slate-100 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base">Struk Digital Class Fund</h3>
              <button
                type="button"
                onClick={() => setSelectedTxn(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <div className="text-center pb-3 border-b border-slate-200">
                <div className="w-10 h-10 bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center mx-auto mb-1 text-lg">
                  K
                </div>
                <p className="font-bold text-slate-900 text-sm">BUKTI PEMBAYARAN KAS</p>
                <p className="text-[10px] text-slate-400 font-mono">{selectedTxn.transactionId}</p>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Nama Pembayar:</span>
                <span className="font-bold text-slate-900">{selectedTxn.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tanggal Transaksi:</span>
                <span className="font-bold text-slate-900">{selectedTxn.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Periode Kas:</span>
                <span className="font-bold text-slate-900">{selectedTxn.monthPeriod}</span>
              </div>
              {selectedTxn.weekPeriod && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Alokasi Kas:</span>
                  <span className="font-semibold text-slate-800">{selectedTxn.weekPeriod}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Metode Pembayaran:</span>
                <span className="font-bold text-slate-900 uppercase">
                  {selectedTxn.method === 'cash_manual' ? 'SETOR TUNAI (BENDAHARA)' : selectedTxn.method}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status Verification:</span>
                <span className="font-black text-emerald-700 uppercase">{selectedTxn.status}</span>
              </div>

              {selectedTxn.verifiedBy && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Diverifikasi Oleh:</span>
                  <span className="font-bold text-slate-800">{selectedTxn.verifiedBy}</span>
                </div>
              )}

              {selectedTxn.notes && (
                <div className="pt-2 border-t border-slate-200 text-slate-600 italic">
                  Catatan: "{selectedTxn.notes}"
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex justify-between text-sm font-bold">
                <span className="text-slate-700">Nominal:</span>
                <span className="text-emerald-700 text-base font-black">
                  Rp {selectedTxn.amount.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {selectedTxn.proofUrl && (
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-700">Bukti Transfer Terlampir:</p>
                <img
                  src={selectedTxn.proofUrl}
                  alt="Proof"
                  className="w-full h-36 object-cover rounded-xl border border-slate-200"
                />
              </div>
            )}

            <button
              type="button"
              onClick={() => setSelectedTxn(null)}
              className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Tutup Struk</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
