import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { User, Payment } from '../types';
import { getTreasurerInfo } from '../lib/userRoles';
import { X, Coins, CheckCircle2, UserCheck, Calendar, FileText, ArrowRight, Wallet, Plus, Minus, Receipt } from 'lucide-react';

interface RecordCashPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser?: User | null;
  onSuccess?: (payment: Payment) => void;
}

export const RecordCashPaymentModal: React.FC<RecordCashPaymentModalProps> = ({
  isOpen,
  onClose,
  targetUser,
  onSuccess,
}) => {
  const { currentUser, classGroup, users, payments, markPaidManual } = useApp();
  const treasurerInfo = getTreasurerInfo(currentUser);

  const memberUsers = users.filter((u) => u.role === 'anggota');
  const [selectedUserId, setSelectedUserId] = useState<string>(targetUser ? targetUser.id : (memberUsers[0]?.id || ''));
  const [amount, setAmount] = useState<number>(1000);
  const [customInputText, setCustomInputText] = useState<string>('1.000');
  const [selectedMonth, setSelectedMonth] = useState<string>(classGroup.period || 'Agustus 2026');
  const [weekAllocation, setWeekAllocation] = useState<string>('cicilan');
  const [notes, setNotes] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [recordedPayment, setRecordedPayment] = useState<Payment | null>(null);

  // Sync when modal opens or targetUser changes
  useEffect(() => {
    if (isOpen) {
      setIsSubmitted(false);
      setRecordedPayment(null);
      setSelectedMonth(classGroup.period || 'Agustus 2026');
      setNotes('');
      if (targetUser) {
        setSelectedUserId(targetUser.id);
      } else if (!selectedUserId && memberUsers.length > 0) {
        setSelectedUserId(memberUsers[0].id);
      }
    }
  }, [isOpen, targetUser, classGroup.period]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const activeUser = users.find((u) => u.id === selectedUserId) || memberUsers[0];

  // Calculate current payment status for activeUser in selectedMonth
  const userPaymentsThisMonth = payments.filter(
    (p) => p.userId === activeUser?.id && p.monthPeriod === selectedMonth && p.status === 'lunas'
  );
  const totalPaidThisMonth = userPaymentsThisMonth.reduce((sum, p) => sum + p.amount, 0);
  const monthlyTarget = classGroup.monthlyDues || 24000;
  const remainingDues = Math.max(0, monthlyTarget - totalPaidThisMonth);

  // Update amount handler helper
  const handleSetAmount = (val: number) => {
    const validVal = Math.max(1000, Math.floor(val));
    setAmount(validVal);
    setCustomInputText(validVal.toLocaleString('id-ID'));

    // Smart week allocation suggestion based on nominal
    if (validVal === 1000) {
      setWeekAllocation('cicilan_1000');
    } else if (validVal === classGroup.weeklyDues) {
      setWeekAllocation('Minggu 1');
    } else if (validVal >= monthlyTarget) {
      setWeekAllocation('1 Bulan Penuh (Minggu 1 - 4)');
    } else {
      setWeekAllocation(`Cicilan Kas Rp ${validVal.toLocaleString('id-ID')}`);
    }
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    const num = parseInt(rawVal, 10) || 0;
    setCustomInputText(num ? num.toLocaleString('id-ID') : '');
    setAmount(num);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser || amount <= 0) return;

    let weekPeriodLabel = weekAllocation;
    if (weekAllocation === 'cicilan_1000') {
      weekPeriodLabel = 'Cicilan Kas Rp 1.000';
    } else if (weekAllocation === 'cicilan') {
      weekPeriodLabel = `Cicilan Kas Rp ${amount.toLocaleString('id-ID')}`;
    }

    const customNote = notes.trim() || `Setoran tunai diterima oleh ${treasurerInfo.senderTitle} (${weekPeriodLabel})`;

    const result = markPaidManual(activeUser.id, selectedMonth, amount, weekPeriodLabel, customNote, paymentDate);
    
    setIsSubmitted(true);
    if (result) {
      setRecordedPayment(result);
      if (onSuccess) onSuccess(result);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-100 overflow-hidden animate-fade-in my-8">
        
        {/* Header */}
        <div className="bg-linear-to-r from-emerald-600 via-teal-600 to-emerald-700 p-6 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
              <Coins className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Catat Setoran Kas Tunai</h2>
              <p className="text-xs text-emerald-100 font-medium">
                Atur nominal pembayaran tunai yang diterima dari anggota
              </p>
            </div>
          </div>
        </div>

        {/* Form Body or Success State */}
        {isSubmitted ? (
          <div className="p-6 text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">Pembayaran Tunai Berhasil Dicatat!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Kas sebesar <strong className="text-emerald-700 font-black">Rp {amount.toLocaleString('id-ID')}</strong> atas nama{' '}
                <strong className="text-slate-800">{activeUser?.name}</strong> telah masuk ke saldo kas kelas.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Anggota:</span>
                <span className="font-bold text-slate-800">{activeUser?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nominal Tunai:</span>
                <span className="font-black text-emerald-600 text-sm">Rp {amount.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Periode:</span>
                <span className="font-semibold text-slate-800">{selectedMonth} ({weekAllocation})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Dicatat Oleh:</span>
                <span className="font-semibold text-slate-800">{treasurerInfo.senderTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-[10px]">
                  🟢 LUNAS (TUNAI)
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsSubmitted(false);
                  setAmount(1000);
                  setCustomInputText('1.000');
                }}
                className="flex-1 py-3 rounded-2xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                + Catat Anggota Lain
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
              >
                Selesai
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            
            {/* Pilih Anggota */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                Pilih Anggota Siswa:
              </label>
              <div className="relative">
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full p-3.5 pl-11 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition-all cursor-pointer"
                >
                  {memberUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} {u.nisn ? `(${u.nisn})` : ''} - {u.className}
                    </option>
                  ))}
                </select>
                <div className="absolute left-3.5 top-3.5 pointer-events-none">
                  <UserCheck className="w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* Ringkasan Kas Siswa */}
              {activeUser && (
                <div className="mt-2.5 p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-center justify-between text-xs">
                  <div>
                    <p className="text-[11px] text-slate-600">
                      Total Setor Bulan Ini ({selectedMonth}):
                    </p>
                    <p className="font-black text-slate-900">
                      Rp {totalPaidThisMonth.toLocaleString('id-ID')} <span className="text-slate-400 font-normal">/ Rp {monthlyTarget.toLocaleString('id-ID')}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-slate-500">Sisa Tagihan</p>
                    <p className={`font-black text-xs ${remainingDues === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {remainingDues === 0 ? 'LUNAS ✨' : `Rp ${remainingDues.toLocaleString('id-ID')}`}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* PENGATURAN NOMINAL (Berapa Ribu yang Telah Dibayar) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                  Nominal Tunai yang Telah Dibayar:
                </label>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Kelipatan Rp 1.000
                </span>
              </div>

              {/* Input Nominal Utama dengan Stepper */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleSetAmount(amount - 1000)}
                  disabled={amount <= 1000}
                  className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 transition-colors cursor-pointer"
                  title="Kurangi Rp 1.000"
                >
                  <Minus className="w-5 h-5" />
                </button>

                <div className="relative flex-1">
                  <div className="absolute left-4 top-3.5 font-black text-slate-400 text-sm">Rp</div>
                  <input
                    type="text"
                    value={customInputText}
                    onChange={handleCustomInputChange}
                    placeholder="1.000"
                    className="w-full py-3.5 pl-12 pr-4 rounded-2xl border-2 border-emerald-400 bg-emerald-50/20 text-slate-900 font-black text-lg focus:ring-4 focus:ring-emerald-400/20 focus:border-emerald-600 focus:outline-none transition-all text-left"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleSetAmount(amount + 1000)}
                  className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                  title="Tambah Rp 1.000"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Tombol Cepat Pilihan Nominal (Chips) */}
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  Pilihan Cepat Nominal Ribuan:
                </p>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSetAmount(1000)}
                    className={`py-2 px-1.5 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                      amount === 1000
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Rp 1.000
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetAmount(2000)}
                    className={`py-2 px-1.5 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                      amount === 2000
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Rp 2.000
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetAmount(5000)}
                    className={`py-2 px-1.5 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                      amount === 5000
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Rp 5.000
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetAmount(6000)}
                    className={`py-2 px-1.5 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                      amount === 6000
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Rp 6.000 <span className="text-[9px] block font-normal">(1 Mgg)</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleSetAmount(12000)}
                    className={`py-2 px-1.5 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                      amount === 12000
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Rp 12.000 (2 Mgg)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetAmount(24000)}
                    className={`py-2 px-1.5 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                      amount === 24000
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Rp 24.000 (1 Bln)
                  </button>
                  {remainingDues > 0 && remainingDues !== 24000 && remainingDues !== 6000 && (
                    <button
                      type="button"
                      onClick={() => handleSetAmount(remainingDues)}
                      className={`py-2 px-1.5 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                        amount === remainingDues
                          ? 'border-amber-500 bg-amber-500 text-white shadow-xs'
                          : 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
                      }`}
                    >
                      Lunasi Sisa (Rp {remainingDues.toLocaleString('id-ID')})
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Periode & Alokasi Minggu */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  Periode Bulan:
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value={classGroup.period || 'Agustus 2026'}>{classGroup.period || 'Agustus 2026'} (Periode Aktif)</option>
                  <option value="Juli 2026">Juli 2026</option>
                  <option value="September 2026">September 2026</option>
                  <option value="Oktober 2026">Oktober 2026</option>
                  <option value="November 2026">November 2026</option>
                  <option value="Desember 2026">Desember 2026</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  Alokasi Minggu / Cicilan:
                </label>
                <select
                  value={weekAllocation}
                  onChange={(e) => setWeekAllocation(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="cicilan_1000">Cicilan Kas Rp 1.000</option>
                  <option value="Minggu 1">Minggu 1</option>
                  <option value="Minggu 2">Minggu 2</option>
                  <option value="Minggu 3">Minggu 3</option>
                  <option value="Minggu 4">Minggu 4</option>
                  <option value="1 Bulan Penuh (Minggu 1 - 4)">1 Bulan Penuh (Minggu 1 - 4)</option>
                  <option value="cicilan">Cicilan Kas Umum</option>
                </select>
              </div>
            </div>

            {/* Tanggal & Catatan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  Tanggal Diterima:
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  Catatan Bendahara (Opsional):
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Titip jam istirahat"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Ringkasan Konfirmasi */}
            <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-700">Total Setoran Diterima:</span>
              </div>
              <span className="text-base font-black text-emerald-700">
                Rp {amount.toLocaleString('id-ID')}
              </span>
            </div>

            {/* Tombol Aksi */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3.5 rounded-2xl border border-slate-300 font-bold text-xs text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={amount <= 0}
                className="flex-2 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <Coins className="w-4 h-4" />
                <span>Simpan Setoran Tunai Rp {amount.toLocaleString('id-ID')}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
