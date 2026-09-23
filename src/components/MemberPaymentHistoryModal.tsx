import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { User, Payment } from '../types';
import { X, History, Coins, CheckCircle2, Clock, AlertTriangle, FileText, Download, UserCheck, ShieldCheck, Plus, Receipt } from 'lucide-react';

interface MemberPaymentHistoryModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenRecordCash?: (user: User) => void;
}

export const MemberPaymentHistoryModal: React.FC<MemberPaymentHistoryModalProps> = ({
  user,
  isOpen,
  onClose,
  onOpenRecordCash,
}) => {
  const { payments, classGroup } = useApp();
  const [selectedTxn, setSelectedTxn] = useState<Payment | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('semua');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedTxn) {
          setSelectedTxn(null);
        } else if (isOpen) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedTxn, onClose]);

  if (!isOpen || !user) return null;

  // Filter payments for this specific user
  const userPayments = payments.filter((p) => p.userId === user.id);

  // Totals
  const totalPaidAllTime = userPayments
    .filter((p) => p.status === 'lunas')
    .reduce((sum, p) => sum + p.amount, 0);

  const currentPeriod = classGroup.period || 'Maret 2025';
  const paymentsThisMonth = userPayments.filter(
    (p) => p.monthPeriod === currentPeriod && p.status === 'lunas'
  );
  const totalPaidThisMonth = paymentsThisMonth.reduce((sum, p) => sum + p.amount, 0);
  const monthlyTarget = classGroup.monthlyDues || 24000;
  const remainingThisMonth = Math.max(0, monthlyTarget - totalPaidThisMonth);

  const filteredPayments = userPayments.filter((p) => {
    if (statusFilter === 'semua') return true;
    return p.status === statusFilter;
  });

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-100 overflow-hidden animate-fade-in my-8 space-y-0">
        
        {/* Header */}
        <div className="bg-linear-to-r from-slate-900 via-blue-950 to-slate-900 p-6 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-4">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120'}
              alt={user.name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-white/30 shadow-md"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-black tracking-tight text-white">{user.name}</h2>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200 text-[10px] font-bold uppercase tracking-wider border border-blue-400/30">
                  {user.className}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono mt-0.5">
                NISN / ID: {user.nisn || user.username} • {user.email}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats Summary */}
        <div className="p-6 bg-slate-50 border-b border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Setor Bulan Ini ({currentPeriod})</p>
              <p className="text-base font-black text-emerald-600 mt-1">
                Rp {totalPaidThisMonth.toLocaleString('id-ID')}
              </p>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                Target: Rp {monthlyTarget.toLocaleString('id-ID')}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sisa Tagihan Bulan Ini</p>
              <p className={`text-base font-black mt-1 ${remainingThisMonth === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {remainingThisMonth === 0 ? 'LUNAS ✨' : `Rp ${remainingThisMonth.toLocaleString('id-ID')}`}
              </p>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                {remainingThisMonth === 0 ? 'Semua minggu lunas' : 'Belum terlunasi'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Setoran Keseluruhan</p>
              <p className="text-base font-black text-[#2563EB] mt-1">
                Rp {totalPaidAllTime.toLocaleString('id-ID')}
              </p>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                {userPayments.length} kali riwayat transaksi
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <History className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                Daftar Riwayat Transaksi ({userPayments.length})
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="semua">Semua Status</option>
                <option value="lunas">🟢 Lunas</option>
                <option value="menunggu">🟡 Menunggu</option>
              </select>

              {onOpenRecordCash && (
                <button
                  type="button"
                  onClick={() => onOpenRecordCash(user)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Catat Tunai</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="p-6 max-h-96 overflow-y-auto space-y-3">
          {filteredPayments.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">Belum Ada Riwayat Transaksi</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {user.name} belum memiliki catatan setoran kas.
              </p>
              {onOpenRecordCash && (
                <button
                  type="button"
                  onClick={() => onOpenRecordCash(user)}
                  className="mt-3 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer inline-flex items-center space-x-1.5"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>Catat Setoran Tunai Sekarang</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredPayments.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-black text-sm text-slate-900">
                        Rp {p.amount.toLocaleString('id-ID')}
                      </span>
                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider ${
                          p.status === 'lunas'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {p.status === 'lunas' ? <CheckCircle2 className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                        <span>{p.status === 'lunas' ? 'Lunas' : 'Menunggu'}</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold uppercase">
                        {p.method === 'cash_manual' ? 'Tunai (Bendahara)' : p.method}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-700">
                      Periode: <strong className="text-slate-900">{p.monthPeriod}</strong>{' '}
                      {p.weekPeriod && <span className="text-slate-500">({p.weekPeriod})</span>}
                    </p>

                    {p.notes && (
                      <p className="text-[11px] text-slate-500 italic">
                        "{p.notes}"
                      </p>
                    )}

                    <p className="text-[10px] text-slate-400 font-mono">
                      {p.date} • ID: {p.transactionId} {p.verifiedBy ? `• Diverifikasi: ${p.verifiedBy}` : ''}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedTxn(p)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer flex items-center space-x-1"
                    >
                      <Receipt className="w-3.5 h-3.5 text-slate-500" />
                      <span>Lihat Struk</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

        {/* Sub-Modal Struk Bukti */}
        {selectedTxn && (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedTxn(null);
            }}
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 relative border border-slate-100 space-y-4 animate-scale-up">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <Receipt className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-extrabold text-slate-900 text-base">Struk Kas Anggota</h3>
                </div>
                <button
                  onClick={() => setSelectedTxn(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nama Anggota:</span>
                  <span className="font-bold text-slate-900">{selectedTxn.userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Nominal Setoran:</span>
                  <span className="font-black text-emerald-600 text-sm">
                    Rp {selectedTxn.amount.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Periode:</span>
                  <span className="font-semibold text-slate-800">{selectedTxn.monthPeriod}</span>
                </div>
                {selectedTxn.weekPeriod && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Alokasi:</span>
                    <span className="font-semibold text-slate-800">{selectedTxn.weekPeriod}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Metode:</span>
                  <span className="font-semibold text-slate-800 uppercase">
                    {selectedTxn.method === 'cash_manual' ? 'Setor Tunai' : selectedTxn.method}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-[10px]">
                    🟢 LUNAS
                  </span>
                </div>
                {selectedTxn.verifiedBy && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Dicatat / Diverifikasi:</span>
                    <span className="font-semibold text-slate-800">{selectedTxn.verifiedBy}</span>
                  </div>
                )}
                {selectedTxn.notes && (
                  <div className="pt-2 border-t border-slate-200 text-slate-600 italic">
                    Catatan: "{selectedTxn.notes}"
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>ID: {selectedTxn.transactionId}</span>
                  <span>{selectedTxn.date}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTxn(null)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  Tutup Struk
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
