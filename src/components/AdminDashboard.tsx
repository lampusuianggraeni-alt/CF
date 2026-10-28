import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Role, User } from '../types';
import { Settings, Users, Shield, Building, CreditCard, RefreshCw, Plus, Trash2, Edit2, CheckCircle2, History, Camera, UserX, Edit3, KeyRound, Eye, EyeOff, Copy, Search, ShieldCheck, UserCheck, X, AlertCircle, Lock, Link as LinkIcon, GraduationCap } from 'lucide-react';
import { ProfilePhotoModal } from './ProfilePhotoModal';
import { DeleteMemberModal } from './DeleteMemberModal';
import { EditNameModal } from './EditNameModal';
import { ResetPasswordModal } from './ResetPasswordModal';
import { PortalLinksModal, getStudentPortalUrl, getTreasurerPortalUrl, getAdminPortalUrl } from './PortalLinksModal';

interface AdminDashboardProps {
  initialTab?: 'users' | 'class';
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ initialTab = 'users' }) => {
  const { classGroup, updateClassGroup, users, addUser, updateUser, resetDemoData, switchUser } = useApp();

  const [activeTab, setActiveTab] = useState<'users' | 'class'>(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('semua');
  const [selectedUserForPhoto, setSelectedUserForPhoto] = useState<User | null>(null);
  const [selectedUserForEditName, setSelectedUserForEditName] = useState<User | null>(null);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<User | null>(null);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<User | null>(null);
  const [showPortalLinksModal, setShowPortalLinksModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Class settings form
  const [className, setClassName] = useState(classGroup.name);
  const [treasurerName, setTreasurerName] = useState(classGroup.treasurerName);
  const [monthlyDues, setMonthlyDues] = useState(classGroup.monthlyDues);
  const [weeklyDues, setWeeklyDues] = useState(classGroup.weeklyDues || 6000);
  const [dueDate, setDueDate] = useState(classGroup.dueDate);
  const [bankName, setBankName] = useState(classGroup.bankInfo.bankName);
  const [accountNumber, setAccountNumber] = useState(classGroup.bankInfo.accountNumber);
  const [accountName, setAccountName] = useState(classGroup.bankInfo.accountName);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    setClassName(classGroup.name);
    setTreasurerName(classGroup.treasurerName);
    setMonthlyDues(classGroup.monthlyDues);
    setWeeklyDues(classGroup.weeklyDues || 6000);
    setDueDate(classGroup.dueDate);
    setBankName(classGroup.bankInfo.bankName);
    setAccountNumber(classGroup.bankInfo.accountNumber);
    setAccountName(classGroup.bankInfo.accountName);
  }, [classGroup]);

  // New User form
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('kas12345');
  const [newUserNisn, setNewUserNisn] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState<Role>('anggota');
  const [addUserError, setAddUserError] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showAddUserModal) {
        setShowAddUserModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAddUserModal]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const copyUsername = (user: User) => {
    const text = `@${user.username}`;
    navigator.clipboard?.writeText(text);
    showToast(`Username ${text} untuk ${user.name} berhasil disalin!`);
  };

  const copyNisn = (user: User) => {
    if (!user.nisn) return;
    navigator.clipboard?.writeText(user.nisn);
    showToast(`NISN ${user.nisn} untuk ${user.name} berhasil disalin!`);
  };

  const handleSaveClassSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateClassGroup({
      name: className,
      treasurerName,
      monthlyDues: Number(monthlyDues),
      weeklyDues: Number(weeklyDues),
      dueDate: Number(dueDate),
      bankInfo: {
        bankName,
        accountNumber,
        accountName,
      },
    });
    showToast('Pengaturan kelas & rekening pembayaran berhasil diperbarui!');
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) return;

    const res = addUser({
      name: newUserName.trim(),
      username: newUserUsername.trim() || `user${Math.floor(100 + Math.random() * 900)}`,
      password: newUserPassword.trim() || 'kas12345',
      nisn: newUserNisn.trim() || `006${Math.floor(1000000 + Math.random() * 9000000)}`,
      email: newUserEmail.trim() || `${newUserUsername || 'user'}@ixa.sch.id`,
      phone: newUserPhone.trim() || '081234567890',
      role: newUserRole,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      classId: classGroup.id,
      className: classGroup.name,
      memberQrCode: `KASKU-MEMBER-${Math.floor(100 + Math.random() * 900)}`,
    });

    if (res.success) {
      showToast(res.message);
      setAddUserError(null);
      setShowAddUserModal(false);
      setNewUserName('');
      setNewUserUsername('');
      setNewUserPassword('kas12345');
      setNewUserNisn('');
      setNewUserEmail('');
      setNewUserPhone('');
    } else {
      setAddUserError(res.message);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.nisn && u.nisn.includes(searchTerm));
    const matchesRole = roleFilter === 'semua' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const adminCount = users.filter((u) => u.role === 'admin').length;
  const bendaharaCount = users.filter((u) => u.role === 'bendahara').length;
  const anggotaCount = users.filter((u) => u.role === 'anggota').length;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-purple-600 text-white font-bold text-xs shadow-xl flex items-center space-x-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-purple-100 text-purple-800 rounded-full text-[10px] font-black uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>HAK AKSES ADMINISTRATOR UTAMA</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
            Panel Pengaturan Admin
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Admin memiliki akses penuh: kelola kredensial login, tambah/hapus anggota, reset password, dan konfigurasi kelas
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setShowPortalLinksModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer shadow-sm"
          >
            <LinkIcon className="w-4 h-4" />
            <span>Bagikan Link Siswa & Pengurus</span>
          </button>

          <button
            type="button"
            onClick={() => {
              resetDemoData();
              showToast('Data kelas dan daftar 32 siswa berhasil disegarkan!');
            }}
            className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Muat Ulang Data Kelas</span>
          </button>
        </div>
      </div>

      {/* Dedicated Portal Links Banner (3 Link Terpisah) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Link 1: Siswa */}
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-3xl p-4 flex flex-col justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center space-x-1.5">
              <GraduationCap className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="text-xs font-black text-emerald-950 uppercase tracking-tight">
                1. Link Khusus Siswa
              </span>
            </div>
            <p className="text-[10px] text-emerald-800 font-medium">
              Hanya menampilkan opsi masuk Siswa kelas
            </p>
            <p className="text-[11px] text-emerald-900 font-mono truncate font-bold bg-white/70 px-2 py-1 rounded-lg">
              {getStudentPortalUrl()}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(getStudentPortalUrl());
              showToast('Link Khusus Siswa berhasil disalin!');
            }}
            className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] uppercase tracking-wider flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Salin Link Siswa</span>
          </button>
        </div>

        {/* Link 2: 2 Bendahara (Maita & Fioren) */}
        <div className="bg-blue-50/80 border border-blue-200 rounded-3xl p-4 flex flex-col justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-[#2563EB] shrink-0" />
              <span className="text-xs font-black text-slate-900 uppercase tracking-tight">
                2. Link Khusus 2 Bendahara
              </span>
            </div>
            <p className="text-[10px] text-slate-600 font-medium">
              Khusus 2 bendahara: <strong>Maita</strong> & <strong>Fioren</strong>
            </p>
            <p className="text-[11px] text-[#2563EB] font-mono truncate font-bold bg-white/70 px-2 py-1 rounded-lg">
              {getTreasurerPortalUrl()}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(getTreasurerPortalUrl());
              showToast('Link Khusus 2 Bendahara berhasil disalin!');
            }}
            className="w-full py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-black text-[11px] uppercase tracking-wider flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Salin Link Bendahara</span>
          </button>
        </div>

        {/* Link 3: Admin (Akses Terbatas) */}
        <div className="bg-purple-50/80 border border-purple-200 rounded-3xl p-4 flex flex-col justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center space-x-1.5">
              <Shield className="w-4 h-4 text-purple-700 shrink-0" />
              <span className="text-xs font-black text-purple-950 uppercase tracking-tight">
                3. Link Khusus Admin
              </span>
            </div>
            <p className="text-[10px] text-purple-800 font-medium">
              Akses terbatas untuk Administrator sistem
            </p>
            <p className="text-[11px] text-purple-900 font-mono truncate font-bold bg-white/70 px-2 py-1 rounded-lg">
              {getAdminPortalUrl()}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(getAdminPortalUrl());
              showToast('Link Khusus Administrator berhasil disalin!');
            }}
            className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-[11px] uppercase tracking-wider flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Salin Link Admin</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => {
            setActiveTab('users');
            setRoleFilter('semua');
          }}
          className={`bg-white p-4 rounded-2xl border text-left transition-all cursor-pointer shadow-xs ${
            roleFilter === 'semua' ? 'border-slate-400 ring-2 ring-slate-200' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Pengguna</span>
          <span className="text-2xl font-black text-slate-900">{users.length}</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Klik untuk lihat semua</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('users');
            setRoleFilter('admin');
          }}
          className={`bg-purple-50/50 p-4 rounded-2xl border text-left transition-all cursor-pointer shadow-xs ${
            roleFilter === 'admin' ? 'border-purple-500 ring-2 ring-purple-200' : 'border-purple-200 hover:border-purple-300'
          }`}
        >
          <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">Admin (Akses Penuh)</span>
          <span className="text-2xl font-black text-purple-700">{adminCount}</span>
          <span className="text-[11px] text-purple-600 block mt-0.5">Super Administrator</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('users');
            setRoleFilter('bendahara');
          }}
          className={`bg-blue-50/50 p-4 rounded-2xl border text-left transition-all cursor-pointer shadow-xs ${
            roleFilter === 'bendahara' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-blue-200 hover:border-blue-300'
          }`}
        >
          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Bendahara</span>
          <span className="text-2xl font-black text-[#2563EB]">{bendaharaCount}</span>
          <span className="text-[11px] text-blue-600 block mt-0.5">Pengelola Kas Harian</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('users');
            setRoleFilter('anggota');
          }}
          className={`bg-emerald-50/50 p-4 rounded-2xl border text-left transition-all cursor-pointer shadow-xs ${
            roleFilter === 'anggota' ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-emerald-200 hover:border-emerald-300'
          }`}
        >
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Anggota (Siswa)</span>
          <span className="text-2xl font-black text-emerald-700">{anggotaCount}</span>
          <span className="text-[11px] text-emerald-600 block mt-0.5">Pembayar Uang Kas</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-4 flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'border-purple-600 text-purple-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Kelola Pengguna & Akun Login ({users.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('class')}
          className={`pb-3 px-4 flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'class'
              ? 'border-purple-600 text-purple-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Pengaturan Kas & Rekening Bank</span>
        </button>
      </div>

      {/* Tab 1: Manage Users */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-bold text-slate-900 text-base">
                Daftar Akun Pengguna & Hak Akses
              </h2>
              <p className="text-xs text-slate-400">
                Admin dapat menambah anggota baru, mengubah nama & NISN siswa, mengatur hak akses, mereset sandi sementara, serta menghapus pengguna.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddUserModal(true)}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-purple-200 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Anggota / Pengguna Baru</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama, username, NISN, atau email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white"
            >
              <option value="semua">Semua Role ({users.length})</option>
              <option value="admin">Admin ({adminCount})</option>
              <option value="bendahara">Bendahara ({bendaharaCount})</option>
              <option value="anggota">Anggota ({anggotaCount})</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Pengguna</th>
                  <th className="py-3 px-4">Username & NISN</th>
                  <th className="py-3 px-4">Privasi Sandi & Akun</th>
                  <th className="py-3 px-4">Role Akses</th>
                  <th className="py-3 px-4 text-right">Aksi Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredUsers.map((u) => {
                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div
                            onClick={() => setSelectedUserForPhoto(u)}
                            className="relative group cursor-pointer shrink-0"
                            title="Klik untuk mengubah foto profil"
                          >
                            <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full object-cover border border-slate-200" />
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Camera className="w-3.5 h-3.5 text-white" />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="font-extrabold text-slate-900 block">{u.name}</span>
                              <button
                                type="button"
                                onClick={() => setSelectedUserForEditName(u)}
                                className="p-1 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors cursor-pointer"
                                title={`Ubah nama & NISN ${u.name}`}
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            </div>
                            <span className="text-[10px] text-slate-400">NISN: {u.nisn || '-'}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-slate-900 font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                              @{u.username}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyUsername(u)}
                              className="p-1 text-slate-400 hover:text-purple-600 cursor-pointer"
                              title="Salin Username"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                          {u.nisn && (
                            <div className="flex items-center space-x-1">
                              <span className="text-[10px] text-slate-500 font-mono font-semibold">NISN: {u.nisn}</span>
                              <button
                                type="button"
                                onClick={() => copyNisn(u)}
                                className="p-0.5 text-slate-400 hover:text-blue-600 cursor-pointer"
                                title="Salin NISN"
                              >
                                <Copy className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 font-mono text-xs font-bold">
                            <Lock className="w-3 h-3 text-emerald-600" />
                            <span>••••••••</span>
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200" title="Sandi terlindungi enkripsi privat. Tidak dapat dilihat oleh Admin, Bendahara, maupun sesama anggota.">
                            Privat
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Hanya diketahui pemilik akun
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          value={u.role}
                          onChange={(e) => {
                            const nextRole = e.target.value as Role;
                            updateUser(u.id, { role: nextRole });
                            showToast(`Hak akses ${u.name} diubah menjadi ${nextRole.toUpperCase()}!`);
                          }}
                          className={`px-2.5 py-1 rounded-full font-extrabold text-[10px] uppercase cursor-pointer border focus:outline-none ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-800 border-purple-200'
                              : u.role === 'bendahara'
                              ? 'bg-blue-100 text-blue-800 border-blue-200'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          }`}
                          title="Klik untuk mengubah Role pengguna"
                        >
                          <option value="anggota">ANGGOTA</option>
                          <option value="bendahara">BENDAHARA</option>
                          <option value="admin">ADMIN</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedUserForEditName(u)}
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-[11px] font-bold flex items-center space-x-1 transition-colors cursor-pointer"
                            title={`Edit Nama & NISN ${u.name}`}
                          >
                            <Edit3 className="w-3 h-3" />
                            <span className="hidden md:inline">Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedUserForPassword(u)}
                            className="p-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 text-[11px] font-bold flex items-center space-x-1 transition-colors cursor-pointer"
                            title={`Reset Sandi Sementara untuk ${u.name}`}
                          >
                            <KeyRound className="w-3 h-3" />
                            <span>Reset Sandi</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedUserForDelete(u)}
                            className="p-1.5 rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer inline-flex items-center space-x-1"
                            title={`Hapus Akun ${u.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="text-[11px] font-bold hidden sm:inline">Hapus</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Class & Dues Settings */}
      {activeTab === 'class' && (
        <form onSubmit={handleSaveClassSettings} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <h2 className="font-bold text-slate-900 text-base pb-2 border-b border-slate-100">
            Pengaturan Informasi Kelas & Nominal Kas
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Kelas / Kelompok</label>
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Bendahara Utama</label>
              <input
                type="text"
                value={treasurerName}
                onChange={(e) => setTreasurerName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nominal Kas Mingguan (Rp)</label>
              <input
                type="number"
                step={1000}
                value={weeklyDues}
                onChange={(e) => setWeeklyDues(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nominal Kas Bulanan (Rp)</label>
              <input
                type="number"
                step={1000}
                value={monthlyDues}
                onChange={(e) => setMonthlyDues(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tanggal Jatuh Tempo Setiap Bulan</label>
              <input
                type="number"
                min={1}
                max={31}
                value={dueDate}
                onChange={(e) => setDueDate(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900"
              />
            </div>
          </div>

          <h3 className="font-bold text-slate-900 text-sm pt-4 border-t border-slate-100">
            Pengaturan Rekening Bank & QRIS
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Bank / Penyedia</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nomor Rekening</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Atas Nama Rekening</label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            className="py-3 px-6 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            SIMPAN PENGATURAN KELAS
          </button>
        </form>
      )}

      {/* Add User Modal (Admin Exclusive) */}
      {showAddUserModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddUserModal(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
        >
          <form
            onSubmit={handleAddUser}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-7 space-y-4 text-xs relative my-8 border border-slate-100"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Tambah Anggota / Pengguna Baru
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Kredensial login dibuat dan disediakan oleh Admin
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {addUserError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 font-bold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{addUserError}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Siswa/Pengguna</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Anggota #33 atau Budi Santoso"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Username Login</label>
                  <input
                    type="text"
                    required
                    placeholder="anggota33"
                    value={newUserUsername}
                    onChange={(e) => setNewUserUsername(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sandi Awal Sementara</label>
                  <input
                    type="password"
                    required
                    placeholder="Sandi awal sementara"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Privat: Siswa wajib menggantinya nanti di Profil Saya
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">NISN / Nomor Anggota</label>
                  <input
                    type="text"
                    placeholder="0061234533"
                    value={newUserNisn}
                    onChange={(e) => setNewUserNisn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role Sistem</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as Role)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-white text-slate-800"
                  >
                    <option value="anggota">Anggota (Siswa)</option>
                    <option value="bendahara">Bendahara (Pengelola Kas)</option>
                    <option value="admin">Admin (Akses Penuh)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Sekolah / Kontak</label>
                <input
                  type="email"
                  placeholder="anggota33@ixa.sch.id"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium"
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="w-1/3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="w-2/3 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>SIMPAN ANGGOTA & KREDENSIAL</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Profile Photo Modal */}
      <ProfilePhotoModal
        user={selectedUserForPhoto}
        isOpen={Boolean(selectedUserForPhoto)}
        onClose={() => setSelectedUserForPhoto(null)}
      />

      {/* Delete Member Confirmation Modal */}
      <DeleteMemberModal
        user={selectedUserForDelete}
        isOpen={Boolean(selectedUserForDelete)}
        onClose={() => setSelectedUserForDelete(null)}
      />

      {/* Edit User Name Modal */}
      <EditNameModal
        user={selectedUserForEditName}
        isOpen={Boolean(selectedUserForEditName)}
        onClose={() => setSelectedUserForEditName(null)}
      />

      {/* Reset Password Modal */}
      <ResetPasswordModal
        user={selectedUserForPassword}
        isOpen={Boolean(selectedUserForPassword)}
        onClose={() => setSelectedUserForPassword(null)}
      />

      {/* Portal Links Modal */}
      <PortalLinksModal
        isOpen={showPortalLinksModal}
        onClose={() => setShowPortalLinksModal(false)}
      />
    </div>
  );
};
