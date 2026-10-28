import React, { useEffect } from 'react';
import { User, PaymentStatus } from '../types';
import { useApp } from '../context/AppContext';
import { 
  X, 
  User as UserIcon, 
  AtSign, 
  Phone, 
  Mail, 
  Hash, 
  ShieldCheck, 
  Coins, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  QrCode, 
  MessageCircle,
  History,
  Lock
} from 'lucide-react';
import { getTreasurerInfo } from '../lib/userRoles';

interface MemberProfileDetailModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onRecordCash?: (user: User) => void;
  onViewHistory?: (user: User) => void;
}

export const MemberProfileDetailModal: React.FC<MemberProfileDetailModalProps> = ({
  user,
  isOpen,
  onClose,
  onRecordCash,
  onViewHistory,
}) => {
  const { classGroup, payments, currentUser } = useApp();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  // Calculate user dues for this month
  const duesAmount = classGroup.monthlyDues || 24000;
  const userMonthPayments = payments.filter(
    (p) => p.userId === user.id && p.monthPeriod === classGroup.period && p.status === 'lunas'
  );
  const totalPaid = userMonthPayments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = Math.max(0, duesAmount - totalPaid);
  const hasPending = payments.some(
    (p) => p.userId === user.id && p.monthPeriod === classGroup.period && p.status === 'menunggu'
  );

  let status: PaymentStatus | 'dicicil' = 'belum_bayar';
  if (totalPaid >= duesAmount) {
    status = 'lunas';
  } else if (totalPaid > 0) {
    status = 'dicicil';
  } else if (hasPending) {
    status = 'menunggu';
  }

  // Format WhatsApp Link with specific Treasurer designation
  const cleanPhone = (user.phone || '').replace(/\D/g, '');
  const waPhone = cleanPhone.startsWith('0') ? `62${cleanPhone.slice(1)}` : cleanPhone;
  const treasurerInfo = getTreasurerInfo(currentUser);
  const senderLabel = treasurerInfo.isTreasurer ? treasurerInfo.senderTitle : `Bendahara (${currentUser.name})`;
  const waUrl = cleanPhone 
    ? `https://wa.me/${waPhone}?text=Halo%20${encodeURIComponent(user.name)},%20ini%20informasi%20dari%20${encodeURIComponent(senderLabel)}%20Kas%20${encodeURIComponent(classGroup.name)}`
    : null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-100 overflow-hidden my-6 space-y-0 animate-scale-up">
        
        {/* Header with Student Photo Banner */}
        <div className="relative bg-gradient-to-r from-[#2563EB] to-blue-700 p-6 text-white text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative inline-block mx-auto mb-3">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl ring-4 ring-white/20"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
              }}
            />
            <span className="absolute bottom-0 right-0 p-1.5 bg-emerald-500 text-white rounded-full border-2 border-white shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
            </span>
          </div>

          <h2 className="text-xl font-black tracking-tight">{user.name}</h2>
          <p className="text-xs text-blue-100 font-mono font-bold mt-0.5">
            @{user.username || 'username'}
          </p>
          <div className="flex items-center justify-center space-x-2 mt-2">
            <span className="px-2.5 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-wider text-white border border-white/20">
              {user.role.toUpperCase()}
            </span>
            <span className="text-[11px] text-blue-100 font-medium">
              {classGroup.name}
            </span>
          </div>
        </div>

        {/* Body content */}
        <div className="p-6 space-y-5 text-xs">
          
          {/* Status Kas Siswa Bulan Ini */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-500 text-[11px] uppercase tracking-wider">
                Status Kas ({classGroup.period})
              </span>
              <span
                className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase tracking-wider ${
                  status === 'lunas'
                    ? 'bg-emerald-100 text-emerald-800'
                    : status === 'dicicil'
                    ? 'bg-blue-100 text-blue-800'
                    : status === 'menunggu'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {status === 'lunas' && <CheckCircle2 className="w-3 h-3" />}
                {status === 'dicicil' && <Clock className="w-3 h-3" />}
                {status === 'menunggu' && <AlertCircle className="w-3 h-3" />}
                {status === 'belum_bayar' && <AlertCircle className="w-3 h-3" />}
                <span>
                  {status === 'lunas'
                    ? 'LUNAS'
                    : status === 'dicicil'
                    ? 'SEDANG DICICIL'
                    : status === 'menunggu'
                    ? 'VERIFIKASI'
                    : 'BELUM BAYAR'}
                </span>
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-[10px] text-slate-400">Total Setoran:</p>
                <p className="text-base font-black text-slate-900">
                  Rp {totalPaid.toLocaleString('id-ID')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400">Target / Sisa:</p>
                <p className={`text-base font-black ${remaining > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {remaining > 0 ? `Sisa Rp ${remaining.toLocaleString('id-ID')}` : 'Selesai'}
                </p>
              </div>
            </div>
          </div>

          {/* Rincian Informasi Kontak & Akun */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
              Identitas & Kontak Siswa
            </h3>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="flex items-center space-x-2 text-slate-500 font-medium">
                  <AtSign className="w-4 h-4 text-blue-600" />
                  <span>Username Akun:</span>
                </span>
                <span className="font-mono font-bold text-slate-900">@{user.username || '-'}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="flex items-center space-x-2 text-slate-500 font-medium">
                  <Hash className="w-4 h-4 text-blue-600" />
                  <span>NISN / ID Siswa:</span>
                </span>
                <span className="font-mono font-bold text-slate-900">{user.nisn || '-'}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="flex items-center space-x-2 text-slate-500 font-medium">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <span>No. WhatsApp:</span>
                </span>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900">{user.phone || '-'}</span>
                  {waUrl && (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-md font-bold text-[10px] flex items-center space-x-1"
                    >
                      <MessageCircle className="w-3 h-3 text-emerald-600" />
                      <span>Chat</span>
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="flex items-center space-x-2 text-slate-500 font-medium">
                  <QrCode className="w-4 h-4 text-blue-600" />
                  <span>ID Kartu Digital:</span>
                </span>
                <span className="font-mono font-bold text-slate-900">{user.memberQrCode}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                <span className="flex items-center space-x-2 text-emerald-800 font-medium">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <span>Kata Sandi Akun:</span>
                </span>
                <span className="inline-flex items-center space-x-1.5 text-emerald-700 font-bold text-[11px]">
                  <span>••••••••</span>
                  <span className="px-1.5 py-0.5 bg-emerald-200/70 text-emerald-800 rounded text-[9px] uppercase font-black" title="Sandi terlindungi enkripsi privat. Bendahara & sesama anggota tidak dapat melihatnya.">
                    Privat
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions for Treasurer */}
          <div className="pt-2 space-y-2">
            {onRecordCash && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRecordCash(user);
                }}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer"
              >
                <Coins className="w-4 h-4" />
                <span>+ Catat Setoran Tunai ({user.name.split(' ')[0]})</span>
              </button>
            )}

            {onViewHistory && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onViewHistory(user);
                }}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                <History className="w-4 h-4 text-blue-600" />
                <span>Lihat Riwayat Pembayaran Siswa</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
