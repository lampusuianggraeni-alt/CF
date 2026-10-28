import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { useApp } from '../context/AppContext';
import { getTreasurerInfo } from '../lib/userRoles';
import {
  X,
  Send,
  Bell,
  MessageCircle,
  Copy,
  CheckCircle2,
  Users,
  User as UserIcon,
  ShieldCheck,
  Coins,
  Sparkles,
} from 'lucide-react';

interface SendReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser?: User | null; // null if broadcast to all unpaid
  onSent?: (msg: string) => void;
}

export const SendReminderModal: React.FC<SendReminderModalProps> = ({
  isOpen,
  onClose,
  targetUser,
  onSent,
}) => {
  const { currentUser, classGroup, users, payments, sendReminder } = useApp();
  const treasurerInfo = getTreasurerInfo(currentUser);

  const unpaidMembers = users.filter((u) => {
    if (u.role === 'admin' || u.role === 'bendahara') return false;
    const p = payments.find(
      (pay) => pay.userId === u.id && pay.monthPeriod === classGroup.period && pay.status === 'lunas'
    );
    return !p;
  });

  const isBroadcast = !targetUser;
  const senderTitle = treasurerInfo.isTreasurer
    ? treasurerInfo.senderTitle
    : `Administrator (${currentUser.name})`;

  const senderShort = treasurerInfo.isTreasurer
    ? `${treasurerInfo.shortLabel} (${treasurerInfo.callName})`
    : `Admin`;

  // Dynamic message template based on current treasurer
  const defaultTitle = `⚠️ Pengingat Kas dari ${senderShort}`;

  const defaultMessage = isBroadcast
    ? `Halo teman-teman ${classGroup.name}!\nIni adalah pengingat resmi dari ${senderTitle} untuk iuran kas kelas periode ${classGroup.period} (Rp 6.000 / minggu atau Rp 24.000 / bulan). Mohon segera melakukan pembayaran via QRIS aplikasi atau setor tunai langsung ke ${treasurerInfo.callName}.\n\nTerima kasih atas kerjasamanya!\n— ${senderTitle}`
    : `Halo ${targetUser?.name || 'Siswa'}!\nIni adalah pengingat resmi dari ${senderTitle} untuk iuran kas kelas ${classGroup.name} periode ${classGroup.period}.\nMohon segera melunasi iuran (Rp 6.000 / minggu atau Rp 24.000 / bulan) melalui transfer QRIS atau setor tunai langsung ke ${treasurerInfo.callName}.\n\nTerima kasih!\n— ${senderTitle}`;

  const [title, setTitle] = useState(defaultTitle);
  const [message, setMessage] = useState(defaultMessage);
  const [customNote, setCustomNote] = useState('');
  const [copiedWa, setCopiedWa] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(defaultTitle);
      setMessage(defaultMessage);
      setCustomNote('');
      setCopiedWa(false);
    }
  }, [isOpen, targetUser, currentUser.id]);

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

  const finalMessage = customNote.trim()
    ? `${message}\n\nCatatan Tambahan: "${customNote.trim()}"`
    : message;

  const handleSendInApp = () => {
    if (isBroadcast) {
      sendReminder('all', title, finalMessage);
      if (onSent) {
        onSent(
          `Pengingat masal berhasil dikirim atas nama ${senderTitle} ke ${unpaidMembers.length} siswa.`
        );
      }
    } else if (targetUser) {
      sendReminder(targetUser.id, title, finalMessage);
      if (onSent) {
        onSent(
          `Pengingat kas berhasil dikirim atas nama ${senderTitle} ke ${targetUser.name}.`
        );
      }
    }
    onClose();
  };

  const handleCopyWhatsApp = () => {
    navigator.clipboard?.writeText(finalMessage);
    setCopiedWa(true);
    setTimeout(() => setCopiedWa(false), 3000);
  };

  const cleanTargetPhone = targetUser?.phone ? targetUser.phone.replace(/\D/g, '') : '';
  const waPhone = cleanTargetPhone.startsWith('0') ? `62${cleanTargetPhone.slice(1)}` : cleanTargetPhone;
  const waDirectUrl = !isBroadcast && waPhone
    ? `https://wa.me/${waPhone}?text=${encodeURIComponent(finalMessage)}`
    : null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-100 overflow-hidden my-6 space-y-0 animate-scale-up">
        {/* Modal Header */}
        <div
          className={`p-5 text-white flex items-center justify-between ${
            treasurerInfo.treasurerNumber === 1
              ? 'bg-gradient-to-r from-indigo-600 to-blue-700'
              : treasurerInfo.treasurerNumber === 2
              ? 'bg-gradient-to-r from-teal-600 to-blue-600'
              : 'bg-gradient-to-r from-blue-600 to-indigo-700'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-xs">
              <Send className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white">
                  {treasurerInfo.shortLabel}
                </span>
                <span className="text-xs text-white/80 font-bold">{classGroup.name}</span>
              </div>
              <h2 className="text-base font-black text-white mt-0.5">
                {isBroadcast ? 'Kirim Pengingat Masal' : `Kirim Pengingat ke ${targetUser?.name?.split(' ')[0]}`}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Active Sender Identity Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                Identitas Pengirim Resmi
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${treasurerInfo.colorBadgeClass}`}
              >
                {treasurerInfo.shortLabel} Terverifikasi
              </span>
            </div>

            <div className="flex items-center space-x-3 pt-1">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-10 h-10 rounded-2xl object-cover border-2 border-white shadow-xs"
              />
              <div>
                <p className="font-black text-slate-900 text-sm">{currentUser.name}</p>
                <p className="text-[11px] font-bold text-slate-500 font-mono">
                  {senderTitle} • Akun @{currentUser.username}
                </p>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 border-t border-slate-200 pt-2">
              Pesan yang dikirim akan secara eksplisit mencantumkan nama pengirim Anda (
              <strong>{senderTitle}</strong>), sehingga penerima tahu pasti bahwa pengingat berasal dari Anda.
            </p>
          </div>

          {/* Target Recipient Info */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900">
            <div className="flex items-center space-x-2 font-bold">
              {isBroadcast ? <Users className="w-4 h-4 text-blue-600" /> : <UserIcon className="w-4 h-4 text-blue-600" />}
              <span>
                Penerima: {isBroadcast ? `${unpaidMembers.length} Siswa yang Belum Lunas` : `${targetUser?.name} (NISN: ${targetUser?.nisn || '-'})`}
              </span>
            </div>
            <span className="text-[10px] bg-blue-200 text-blue-900 px-2 py-0.5 rounded-full font-black">
              {classGroup.period}
            </span>
          </div>

          {/* Title Input */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Judul Pesan Notifikasi
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Message Textarea */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Isi Pesan Pengingat
            </label>
            <textarea
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Optional Custom Note */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Tambahan Catatan Khusus (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Harap dibayar paling lambat hari Jumat besok ya!"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={handleSendInApp}
              className={`w-full py-3 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer ${
                treasurerInfo.treasurerNumber === 1
                  ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'
                  : 'bg-teal-600 hover:bg-teal-700 shadow-teal-500/20'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Kirim Notifikasi Aplikasi (Atas Nama {treasurerInfo.shortLabel})</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopyWhatsApp}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer border border-slate-200"
              >
                {copiedWa ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
                <span>{copiedWa ? 'Teks Tersalin!' : 'Salin Teks untuk WhatsApp'}</span>
              </button>

              {waDirectUrl && (
                <a
                  href={waDirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm transition-all text-center"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Kirim Langsung via WA</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
