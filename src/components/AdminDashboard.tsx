import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Role, User } from '../types';
import { Settings, Users, Shield, Building, CreditCard, RefreshCw, Plus, Trash2, Edit2, CheckCircle2, History, Camera, UserX, Edit3, KeyRound, Eye, EyeOff, Copy, Search, ShieldCheck, UserCheck, X, AlertCircle, Lock } from 'lucide-react';
import { ProfilePhotoModal } from './ProfilePhotoModal';
import { DeleteMemberModal } from './DeleteMemberModal';
import { EditNameModal } from './EditNameModal';
import { ResetPasswordModal } from './ResetPasswordModal';

export const AdminDashboard: React.FC = () => {
  const { classGroup, updateClassGroup, users, addUser, updateUser, resetDemoData, switchUser } = useApp();

  const [activeTab, setActiveTab] = useState<'users' | 'class'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('semua');
  const [selectedUserForPhoto, setSelectedUserForPhoto] = useState<User | null>(null);
  const [selectedUserForEditName, setSelectedUserForEditName] = useState<User | null>(null);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<User | null>(null);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<User | null>(null);
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
      email: newUserEmail.trim() || `${newUserUsername || 'user'}@mipa1.sch.id`,
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

        <button
          onClick={resetDemoData}
          className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reset Semua Data Demo</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Pengguna</span>
          <span className="text-2xl font-black text-slate-900">{users.length}</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Akun terdaftar</span>
        </div>
        <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-200 shadow-xs">
          <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">Admin (Akses Penuh)</span>
          <span className="text-2xl font-black text-purple-700">{adminCount}</span>
          <span className="text-[11px] text-purple-600 block mt-0.5">Super Administrator</span>
        </div>
        <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-200 shadow-xs">
          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Bendahara</span>
          <span className="text-2xl font-black text-[#2563EB]">{bendaharaCount}</span>
          <span className="text-[11px] text-blue-600 block mt-0.5">Pengelola Kas Harian</span>
        </div>
        <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Anggota (Siswa)</span>
          <span className="text-2xl font-black text-emerald-700">{anggotaCount}</span>
          <span className="text-[11px] text-emerald-600 block mt-0.5">Pembayar Uang Kas</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 text-xs font-bold">
        <button
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
                Admin dapat menambah anggota baru, mengatur hak akses, mereset sandi sementara (sandi akun bersifat privat), serta menghapus pengguna.
              </p>
            </div>

            <button
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
                            onClick={() => {
                              switchUser(u.id);
                              setSelectedUserForPhoto(u);
                            }}
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
                                onClick={() => setSelectedUserForEditName(u)}
                                className="p-1 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors cursor-pointer"
                                title={`Ubah nama ${u.name}`}
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            </div>
                            <span className="text-[10px] text-slate-400">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700">
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-slate-900 font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                              @{u.username}
                            </span>
                            <button
                              onClick={() => copyUsername(u)}
                              className="p-1 text-slate-400 hover:text-purple-600 cursor-pointer"
                              title="Salin Username"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                          {u.nisn && (
                            <span className="text-[10px] text-slate-400 block font-mono">NISN: {u.nisn}</span>
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
                        <span
                          className={`px-2.5 py-1 rounded-full font-extrabold text-[10px] capitalize ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : u.role === 'bendahara'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => setSelectedUserForPassword(u)}
                            className="p-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 text-[11px] font-bold flex items-center space-x-1 transition-colors cursor-pointer"
                            title={`Reset Sandi Sementara untuk ${u.name}`}
                          >
                            <KeyRound className="w-3 h-3" />
                            <span>Reset Sandi</span>
                          </button>

                          <button
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
                  placeholder="anggota33@mipa1.sch.id"
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
    </div>
  );
};
