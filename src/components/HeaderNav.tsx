import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import { Bell, CheckCircle, ShieldCheck, UserCheck, Users, QrCode, RefreshCw, Sparkles, ChevronDown, ShieldAlert, Info, Camera, Edit3, LogOut, KeyRound, Coins } from 'lucide-react';
import { RolePermissionModal } from './RolePermissionModal';
import { ProfilePhotoModal } from './ProfilePhotoModal';
import { EditNameModal } from './EditNameModal';
import { UserProfileModal } from './UserProfileModal';
import { SelfPasswordModal } from './SelfPasswordModal';
import { PaymentDurationOption } from './PaymentModal';

interface HeaderNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenQrModal: () => void;
  onOpenPayModal?: (option: PaymentDurationOption) => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ activeTab, setActiveTab, onOpenQrModal, onOpenPayModal }) => {
  const { currentUser, switchRole, switchUser, users, notifications, markNotificationRead, markAllNotificationsRead, resetDemoData, classGroup, logout } = useApp();
  const [showNotificationsPopover, setShowNotificationsPopover] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showProfilePhotoModal, setShowProfilePhotoModal] = useState(false);
  const [showEditNameModal, setShowEditNameModal] = useState(false);
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [showSelfPasswordModal, setShowSelfPasswordModal] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowNotificationsPopover(false);
        setShowUserDropdown(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const myNotifications = notifications.filter(
    (n) => n.userId === currentUser.id || n.userId === 'all'
  );
  const unreadCount = myNotifications.filter((n) => !n.isRead).length;
  const memberCount = users.filter((u) => u.role === 'anggota').length;

  const roleColors: Record<Role, { bg: string; border: string; label: string; badge: string }> = {
    anggota: { bg: 'bg-emerald-50 text-emerald-700', border: 'border-emerald-200', label: `👦 Anggota (${memberCount})`, badge: 'bg-emerald-600' },
    bendahara: { bg: 'bg-blue-50 text-blue-700', border: 'border-blue-200', label: '💼 Bendahara', badge: 'bg-[#2563EB]' },
    admin: { bg: 'bg-purple-50 text-purple-700', border: 'border-purple-200', label: '👑 Admin', badge: 'bg-purple-600' },
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-[#2563EB] text-white shadow-lg">
        {/* Top Info Bar (Role & Class Portal) */}
        <div className="bg-[#1E293B] text-slate-200 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-white font-black text-[10px] tracking-wider uppercase ${
                currentUser.role === 'admin'
                  ? 'bg-purple-600'
                  : currentUser.role === 'bendahara'
                  ? 'bg-[#2563EB]'
                  : 'bg-emerald-600'
              }`}
            >
              {currentUser.role === 'admin'
                ? 'PORTAL ADMINISTRATOR KELAS'
                : currentUser.role === 'bendahara'
                ? 'PORTAL BENDAHARA KELAS'
                : 'PORTAL ANGGOTA KELAS'}
            </span>
            <span className="text-slate-300 font-bold text-[11px] hidden sm:inline uppercase tracking-wider">
              {currentUser.name} • {classGroup.name}
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setShowPermissionModal(true)}
              className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 font-bold text-[11px] uppercase tracking-wider flex items-center space-x-1 border border-amber-400/30 cursor-pointer"
              title="Lihat Perbedaan Hak Akses Role"
            >
              <Info className="w-3 h-3" />
              <span>Info Hak Akses</span>
            </button>

            <button
              onClick={logout}
              title="Keluar ke Halaman Login"
              className="ml-1 px-2.5 py-1 rounded-full bg-rose-900/80 hover:bg-rose-800 text-rose-200 font-bold text-[11px] uppercase tracking-wider flex items-center space-x-1 border border-rose-500/30 cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Main Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="bg-white text-[#2563EB] font-black px-2.5 py-1 rounded-xl text-lg tracking-tighter shadow-md">
              CF.
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-black text-white tracking-tight leading-none uppercase">Class Fund</h1>
                <span className="text-[10px] font-black px-2 py-0.5 bg-white/20 text-white rounded-full uppercase tracking-wider">
                  {classGroup.name}
                </span>
              </div>
              <p className="text-[11px] text-blue-100 font-bold">
                Kas Rp{(classGroup.weeklyDues || 6000).toLocaleString('id-ID')} / Minggu — {memberCount} Anggota
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Role Specific) */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-white text-[#2563EB] shadow-md'
                  : 'text-white/90 hover:bg-white/10'
              }`}
            >
              {currentUser.role === 'admin'
                ? 'Dashboard Admin'
                : currentUser.role === 'bendahara'
                ? 'Dashboard Bendahara'
                : 'Beranda Anggota'}
            </button>

            {currentUser.role === 'anggota' && (
              <>
                <button
                  onClick={() => {
                    if (onOpenPayModal) {
                      onOpenPayModal('nominal_1000');
                    } else {
                      setActiveTab('bayar_1000');
                    }
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-1.5 ${
                    activeTab === 'bayar_1000'
                      ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-white/30'
                      : 'bg-amber-400/25 text-amber-200 hover:bg-amber-400/40 hover:text-white border border-amber-300/40'
                  }`}
                  title="Bayar Kas Rp 1.000 (Cicil Kas Ringan / Harian)"
                >
                  <Coins className="w-3.5 h-3.5 text-amber-300" />
                  <span>Bayar Kas Rp 1.000</span>
                </button>
                <button
                  onClick={() => {
                    if (onOpenPayModal) {
                      onOpenPayModal('1_minggu');
                    } else {
                      setActiveTab('bayar');
                    }
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === 'bayar'
                      ? 'bg-white text-[#2563EB] shadow-md'
                      : 'text-white/90 hover:bg-white/10'
                  }`}
                >
                  Bayar Kas (Rp6.000)
                </button>
                <button
                  onClick={() => setActiveTab('riwayat')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === 'riwayat'
                      ? 'bg-white text-[#2563EB] shadow-md'
                      : 'text-white/90 hover:bg-white/10'
                  }`}
                >
                  Riwayat Kas Saya
                </button>
              </>
            )}

            {(currentUser.role === 'bendahara' || currentUser.role === 'admin') && (
              <>
                <button
                  onClick={() => setActiveTab('pembayaran')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === 'pembayaran'
                      ? 'bg-white text-[#2563EB] shadow-md'
                      : 'text-white/90 hover:bg-white/10'
                  }`}
                >
                  Status 32 Anggota
                </button>
                <button
                  onClick={() => setActiveTab('pengeluaran')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === 'pengeluaran'
                      ? 'bg-white text-[#2563EB] shadow-md'
                      : 'text-white/90 hover:bg-white/10'
                  }`}
                >
                  Kelola Pengeluaran Kas
                </button>
              </>
            )}

            <button
              onClick={() => setActiveTab('laporan')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'laporan'
                  ? 'bg-white text-[#2563EB] shadow-md'
                  : 'text-white/90 hover:bg-white/10'
              }`}
            >
              Laporan Kas
            </button>

            {currentUser.role === 'admin' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-white text-[#2563EB] shadow-md'
                    : 'text-white/90 hover:bg-white/10'
                }`}
              >
                Pengaturan Admin
              </button>
            )}
          </nav>

          {/* Backdrop to close popovers/dropdowns on outside click */}
          {(showNotificationsPopover || showUserDropdown) && (
            <div
              className="fixed inset-0 z-40 bg-transparent cursor-default"
              onClick={() => {
                setShowNotificationsPopover(false);
                setShowUserDropdown(false);
              }}
            />
          )}

          {/* Right Actions: QR Code, Notifications, Profile */}
          <div className="flex items-center space-x-2 relative z-50">
            {/* Profil Saya Quick Button */}
            <button
              onClick={() => setShowUserProfileModal(true)}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-black uppercase tracking-wider border border-white/20 transition-all cursor-pointer shadow-xs"
              title="Kelola Foto Profil, Username Akun, & Kontak"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-300" />
              <span>Profil Saya</span>
            </button>

            {/* Member QR Code Button */}
            <button
              onClick={onOpenQrModal}
              className="p-2 text-white hover:bg-white/15 rounded-xl transition-colors relative cursor-pointer"
              title="Tampilkan QR ID Kas Saya"
            >
              <QrCode className="w-5 h-5 text-white" />
            </button>

            {/* Notifications Trigger */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationsPopover(!showNotificationsPopover)}
                className="p-2 text-white hover:bg-white/15 rounded-xl transition-colors relative cursor-pointer"
                title="Notifikasi"
              >
                <Bell className="w-5 h-5 text-white" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse border border-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Popover */}
              {showNotificationsPopover && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-slate-800 rounded-3xl shadow-2xl border border-slate-200 z-50 p-5 space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-black text-slate-900 text-sm uppercase tracking-tight">Notifikasi</h3>
                      {unreadCount > 0 && (
                        <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 font-bold text-xs">
                          {unreadCount} Baru
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-xs text-[#2563EB] hover:underline font-bold cursor-pointer"
                      >
                        Tandai dibaca
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1">
                    {myNotifications.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-xs font-bold uppercase tracking-wider">
                        Belum ada notifikasi
                      </div>
                    ) : (
                      myNotifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => markNotificationRead(notif.id)}
                          className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all ${
                            !notif.isRead
                              ? 'bg-blue-50/80 border-blue-200 text-slate-900 font-medium shadow-xs'
                              : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <span className="font-extrabold text-slate-900">{notif.title}</span>
                            <span className="text-[10px] text-slate-400 font-bold">{notif.createdAt}</span>
                          </div>
                          <p className="text-slate-600 leading-relaxed">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Active Profile Pill */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center space-x-2 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all border border-white/20 cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-white"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 bg-[#2563EB] text-white p-0.5 rounded-full border border-white">
                    <Camera className="w-2.5 h-2.5" />
                  </div>
                </div>
                <div className="text-left hidden lg:block pr-1">
                  <p className="text-xs font-black text-white leading-none">{currentUser.name}</p>
                  <p className="text-[10px] text-blue-100 font-bold uppercase tracking-wider">{currentUser.role}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-white/80 pr-0.5" />
              </button>

              {/* Profile / Switch User Dropdown */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white text-slate-800 rounded-3xl shadow-2xl border border-slate-200 z-50 p-3 space-y-2 text-xs">
                  <div className="px-3 py-2.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <div className="flex items-center space-x-3">
                      <div className="relative group cursor-pointer" onClick={() => {
                        setShowUserDropdown(false);
                        setShowProfilePhotoModal(true);
                      }}>
                        <img
                          src={currentUser.avatar}
                          alt={currentUser.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-[#2563EB]"
                        />
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-sm">{currentUser.name}</p>
                        <p className="text-slate-500 text-[11px] font-medium font-mono">@{currentUser.username}</p>
                      </div>
                    </div>

                    {/* Primary Profile Action */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserDropdown(false);
                        setShowUserProfileModal(true);
                      }}
                      className="w-full py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl font-black text-[11px] uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-md shadow-blue-500/20"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-amber-300" />
                      <span>⚙️ Pengaturan Profil & Akun</span>
                    </button>

                    {/* Self Password Management Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserDropdown(false);
                        setShowSelfPasswordModal(true);
                      }}
                      className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-xl font-black text-[11px] uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-colors cursor-pointer border border-emerald-300"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-emerald-700" />
                      <span>🔐 Atur & Ubah Sandi Pribadi</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowUserDropdown(false);
                          setShowEditNameModal(true);
                        }}
                        className="w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-black text-[11px] uppercase tracking-wider flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Ganti Nama</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowUserDropdown(false);
                          setShowUserProfileModal(true);
                        }}
                        className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-black text-[11px] uppercase tracking-wider flex items-center justify-center space-x-1 transition-colors cursor-pointer border border-slate-200"
                      >
                        <Camera className="w-3.5 h-3.5 text-blue-600" />
                        <span>Ubah Foto</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-white text-[10px] font-black uppercase tracking-wider ${roleColors[currentUser.role].badge}`}>
                        ROLE: {currentUser.role.toUpperCase()}
                      </span>
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          setShowPermissionModal(true);
                        }}
                        className="text-[10px] text-[#2563EB] font-bold hover:underline cursor-pointer"
                      >
                        Cek Hak Akses
                      </button>
                    </div>

                    {/* Logout Button in User Dropdown */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserDropdown(false);
                        logout();
                      }}
                      className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-black text-[11px] uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-colors cursor-pointer border border-rose-200/80 mt-1"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-600" />
                      <span>Keluar (Halaman Login)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <UserProfileModal
        isOpen={showUserProfileModal}
        onClose={() => setShowUserProfileModal(false)}
      />

      <RolePermissionModal
        isOpen={showPermissionModal}
        onClose={() => setShowPermissionModal(false)}
      />

      <ProfilePhotoModal
        isOpen={showProfilePhotoModal}
        onClose={() => setShowProfilePhotoModal(false)}
      />

      <EditNameModal
        user={currentUser}
        isOpen={showEditNameModal}
        onClose={() => setShowEditNameModal(false)}
      />

      <SelfPasswordModal
        isOpen={showSelfPasswordModal}
        onClose={() => setShowSelfPasswordModal(false)}
      />
    </>
  );
};
