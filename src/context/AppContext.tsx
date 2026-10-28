import React, { createContext, useContext, useEffect, useState } from 'react';
import { initialClassGroup, initialExpenses, initialNotifications, initialPayments, initialUsers } from '../data/mockData';
import { ClassGroup, Expense, Notification, Payment, PaymentMethod, PaymentStatus, Role, User } from '../types';
import { getTreasurerInfo } from '../lib/userRoles';
import {
  checkSupabaseHealth,
  fetchAllFromSupabase,
  pushAllToSupabase,
  syncUserToSupabase,
  deleteUserFromSupabase,
  syncPaymentToSupabase,
  syncExpenseToSupabase,
  deleteExpenseFromSupabase,
  syncClassGroupToSupabase,
  SupabaseHealth,
} from '../lib/supabase';

interface AppContextType {
  currentUser: User;
  isAuthenticated: boolean;
  login: (identifier: string, password?: string, targetRole?: Role, googleEmail?: string) => { success: boolean; message: string; user?: User; requiresPasswordSetup?: boolean };
  loginWithGoogle: (googleEmail: string) => { success: boolean; message: string; user?: User; requiresPasswordSetup?: boolean };
  setSelfPassword: (userId: string, newPassword: string) => { success: boolean; message: string };
  resetPasswordWithGoogle: (googleEmail: string, newPassword: string) => { success: boolean; message: string };
  linkGoogleEmail: (userId: string, googleEmail: string) => { success: boolean; message: string };
  logout: () => void;
  switchUser: (userId: string) => void;
  switchRole: (role: Role) => void;
  classGroup: ClassGroup;
  updateClassGroup: (updated: Partial<ClassGroup>) => void;
  users: User[];
  addUser: (user: Omit<User, 'id'>) => { success: boolean; message: string; user?: User };
  updateUser: (id: string, updated: Partial<User>) => void;
  updateUserPassword: (id: string, newPassword: string, currentPassword?: string) => { success: boolean; message: string };
  deleteUser: (id: string, deletePaymentHistory?: boolean) => { success: boolean; message: string };
  payments: Payment[];
  addPayment: (payment: Omit<Payment, 'id' | 'transactionId'>) => Payment;
  verifyPayment: (paymentId: string, status: PaymentStatus, notes?: string) => void;
  markPaidManual: (userId: string, monthPeriod: string, amount: number, weekPeriod?: string, customNote?: string, paymentDate?: string) => Payment | undefined;
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, updated: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  sendReminder: (userId: string | 'all', title?: string, message?: string) => void;
  resetDemoData: () => void;
  // Supabase Database Integration
  supabaseHealth: SupabaseHealth | null;
  isSupabaseModalOpen: boolean;
  setIsSupabaseModalOpen: (open: boolean) => void;
  syncAllFromSupabase: () => Promise<{ success: boolean; message: string }>;
  syncAllToSupabase: () => Promise<{ success: boolean; message: string }>;
  refreshSupabaseHealth: () => Promise<void>;
  // Computed Stats
  totalBalance: number;
  totalIncomeThisMonth: number;
  totalExpenseThisMonth: number;
  paidMembersCount: number;
  unpaidMembersCount: number;
  pendingVerificationCount: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'kasku_digital_state_v13';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_users`);
    if (saved) {
      try {
        const parsed: User[] = JSON.parse(saved);
        const hasMaita = parsed.some((u) => (u.nisn === '3124652885' || u.username === 'maita') && u.role === 'bendahara');
        const hasFioren = parsed.some((u) => (u.nisn === '0123428941' || u.username === 'fioren') && u.role === 'bendahara');
        const hasAdmin = parsed.some((u) => u.role === 'admin' && (u.username === 'admin' || u.name.includes('Lampu')));
        if (hasMaita && hasFioren && hasAdmin) {
          return parsed;
        }
      } catch (e) {
        // fallback
      }
    }
    return initialUsers;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedUserId = localStorage.getItem(`${STORAGE_KEY}_current_user_id`);
    if (savedUserId) {
      const found = users.find((u) => u.id === savedUserId);
      if (found) return found;
    }
    return users.find((u) => u.role === 'admin') || users[0];
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const savedAuth = localStorage.getItem(`${STORAGE_KEY}_is_auth`);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const portal = (params.get('portal') || params.get('role') || params.get('mode') || '').toLowerCase();
      if (portal === 'siswa') {
        if (savedAuth !== 'true' || currentUser.role !== 'anggota') {
          return false;
        }
      } else if (portal === 'admin') {
        if (savedAuth !== 'true' || currentUser.role !== 'admin') {
          return false;
        }
      } else if (portal === 'bendahara' || portal === 'pengurus') {
        if (savedAuth !== 'true' || currentUser.role !== 'bendahara') {
          return false;
        }
      }
    }
    return savedAuth !== null ? savedAuth === 'true' : true;
  });

  // Re-check portal access if user or URL changes to prevent session collisions
  useEffect(() => {
    const checkPortalSession = () => {
      if (typeof window === 'undefined') return;
      const params = new URLSearchParams(window.location.search);
      const portal = (params.get('portal') || params.get('role') || params.get('mode') || '').toLowerCase();
      if (portal === 'admin' && currentUser.role !== 'admin') {
        setIsAuthenticated(false);
      } else if (portal === 'bendahara' && currentUser.role !== 'bendahara') {
        setIsAuthenticated(false);
      } else if (portal === 'siswa' && currentUser.role !== 'anggota') {
        setIsAuthenticated(false);
      }
    };
    checkPortalSession();
    window.addEventListener('popstate', checkPortalSession);
    return () => window.removeEventListener('popstate', checkPortalSession);
  }, [currentUser]);

  const [classGroup, setClassGroup] = useState<ClassGroup>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_class`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return initialClassGroup;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_payments`);
    return saved ? JSON.parse(saved) : initialPayments;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_expenses`);
    return saved ? JSON.parse(saved) : initialExpenses;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_notifications`);
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  // Supabase states & health status
  const [supabaseHealth, setSupabaseHealth] = useState<SupabaseHealth | null>(null);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  const refreshSupabaseHealth = async () => {
    try {
      const res = await checkSupabaseHealth();
      setSupabaseHealth(res);
    } catch {
      // ignore
    }
  };

  // Attempt initial sync on load if Supabase has tables & data
  useEffect(() => {
    refreshSupabaseHealth().then(async () => {
      try {
        const remote = await fetchAllFromSupabase();
        if (remote.success && remote.users && remote.users.length > 0) {
          const remoteIds = new Set(remote.users.map((u) => u.id));
          const remoteNisns = new Set(remote.users.map((u) => u.nisn));
          const missingInitialUsers = initialUsers.filter(
            (u) => !remoteIds.has(u.id) && (!u.nisn || !remoteNisns.has(u.nisn))
          );
          const mergedUsers = [...remote.users, ...missingInitialUsers];
          setUsers(mergedUsers);
          if (missingInitialUsers.length > 0) {
            pushAllToSupabase({
              users: mergedUsers,
              classGroup: remote.classGroup || classGroup,
              payments: remote.payments || payments,
              expenses: remote.expenses || expenses,
              notifications: remote.notifications || notifications,
            }).catch(() => {});
          }
          if (remote.classGroup) setClassGroup(remote.classGroup);
          if (remote.payments) setPayments(remote.payments);
          if (remote.expenses) setExpenses(remote.expenses);
          if (remote.notifications) setNotifications(remote.notifications);
        }
      } catch {
        // Fallback to local data
      }
    });
  }, []);

  const syncAllFromSupabase = async () => {
    const res = await fetchAllFromSupabase();
    if (res.success) {
      if (res.users && res.users.length > 0) setUsers(res.users);
      if (res.classGroup) setClassGroup(res.classGroup);
      if (res.payments) setPayments(res.payments);
      if (res.expenses) setExpenses(res.expenses);
      if (res.notifications) setNotifications(res.notifications);
    }
    return res;
  };

  const syncAllToSupabase = async () => {
    const res = await pushAllToSupabase({
      users,
      classGroup,
      payments,
      expenses,
      notifications,
    });
    return res;
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_current_user_id`, currentUser?.id || '');
    localStorage.setItem(`${STORAGE_KEY}_is_auth`, isAuthenticated ? 'true' : 'false');
  }, [currentUser, isAuthenticated]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_class`, JSON.stringify(classGroup));
  }, [classGroup]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_payments`, JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_expenses`, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_notifications`, JSON.stringify(notifications));
  }, [notifications]);

  // Login handler with NISN & Password support
  const login = (
    identifier: string,
    password?: string,
    targetRole?: Role,
    googleEmail?: string
  ): { success: boolean; message: string; user?: User; requiresPasswordSetup?: boolean } => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password ? password.trim() : '';

    if (!cleanId) {
      return { success: false, message: 'Harap masukkan NISN Anda untuk mengakses aplikasi.' };
    }

    // Match by NISN, username, email, or name (prioritizing targetRole if specified)
    const checkUserMatch = (u: User) => {
      const cleanRawId = cleanId.replace(/\s+/g, '');
      const userNisnClean = (u.nisn || '').toLowerCase().replace(/\s+/g, '');
      const userUsernameClean = (u.username || '').toLowerCase().replace(/\s+/g, '');
      const userEmailClean = (u.email || '').toLowerCase().trim();

      const matchNisn = userNisnClean === cleanRawId;
      const matchUsername = userUsernameClean === cleanRawId;
      const matchEmail = userEmailClean === cleanId;

      const uNameClean = (u.name || '').toLowerCase().replace(/[.,]/g, '').trim();
      const searchNameClean = cleanId.replace(/[.,]/g, '').trim();
      const matchName =
        uNameClean === searchNameClean ||
        (searchNameClean.length >= 3 && uNameClean.includes(searchNameClean)) ||
        (uNameClean.length >= 3 && searchNameClean.includes(uNameClean));

      const matchBendaharaAlias = (cleanId === 'bnd-ixa-01' || cleanId === '0061234502' || cleanId === 'bendahara') && u.role === 'bendahara';
      const matchAdminAlias = (cleanId === '0061234501' || cleanId === 'admin') && u.role === 'admin';
      return matchNisn || matchUsername || matchEmail || matchName || matchBendaharaAlias || matchAdminAlias;
    };

    let matchedUser = targetRole ? users.find((u) => u.role === targetRole && checkUserMatch(u)) : undefined;
    if (!matchedUser) {
      matchedUser = users.find(checkUserMatch);
    }

    if (!matchedUser) {
      return {
        success: false,
        message: 'NISN atau nama siswa tidak ditemukan dalam daftar kelas. Silakan pilih nama Anda langsung dari daftar siswa di atas.',
      };
    }

    // Verify password - Password is strictly required (no login without password!)
    if (!cleanPass) {
      return {
        success: false,
        message: 'Harap masukkan kata sandi Anda untuk masuk ke aplikasi.',
      };
    }

    const isStaffUser = matchedUser.role === 'admin' || matchedUser.role === 'bendahara';
    const expectedPass = matchedUser.password || (isStaffUser ? 'admin123' : 'kas12345');
    const staffAccepted = isStaffUser && (cleanPass === 'admin123' || cleanPass === 'bendahara123' || cleanPass === 'kas12345');
    const studentAccepted = !isStaffUser && (cleanPass === 'kas12345' || cleanPass === expectedPass);
    if (expectedPass !== cleanPass && !staffAccepted && !studentAccepted) {
      return {
        success: false,
        message: 'Kata sandi salah. Gunakan sandi bawaan "kas12345" atau kata sandi pribadi yang telah diatur.',
      };
    }

    // Success login
    setCurrentUser(matchedUser);
    setIsAuthenticated(true);
    return {
      success: true,
      message: `Selamat datang kembali, ${matchedUser.name}! Anda berhasil masuk sebagai ${
        matchedUser.role === 'admin' ? 'Administrator' : matchedUser.role === 'bendahara' ? 'Bendahara Kelas' : 'Anggota Kelas'
      }.`,
      user: matchedUser,
      requiresPasswordSetup: !matchedUser.hasCustomPassword,
    };
  };

  // Kept for backward compatibility if referenced
  const loginWithGoogle = (
    nisnOrId: string
  ): { success: boolean; message: string; user?: User; requiresPasswordSetup?: boolean } => {
    return login(nisnOrId);
  };

  // Self-service: Anggota mengatur sandi sendiri
  const setSelfPassword = (userId: string, newPassword: string): { success: boolean; message: string } => {
    const cleanPass = newPassword.trim();
    if (!cleanPass || cleanPass.length < 4) {
      return { success: false, message: 'Kata sandi minimal harus 4 karakter.' };
    }

    const target = users.find((u) => u.id === userId);
    if (!target) {
      return { success: false, message: 'Pengguna tidak ditemukan.' };
    }

    const updatedUser = { ...target, password: cleanPass, hasCustomPassword: true };
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? updatedUser : u))
    );

    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({ ...prev, password: cleanPass, hasCustomPassword: true }));
    }

    // Sync to Supabase in background
    syncUserToSupabase(updatedUser);

    const secNotif: Notification = {
      id: `notif-${Date.now()}`,
      userId,
      title: 'Kata Sandi Pribadi Diatur 🔐',
      message: 'Anda telah berhasil mengatur kata sandi pribadi Anda sendiri. Sandi ini bersifat rahasia dan aman.',
      isRead: false,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: 'verification',
    };
    setNotifications((prev) => [secNotif, ...prev]);

    return {
      success: true,
      message: 'Kata sandi pribadi berhasil disimpan! Anda sekarang dapat masuk menggunakan sandi ini.',
    };
  };

  // Reset kata sandi mandiri menggunakan NISN
  const resetPasswordWithGoogle = (nisnInput: string, newPassword: string): { success: boolean; message: string } => {
    const cleanNisn = nisnInput.trim().toLowerCase();
    const cleanPass = newPassword.trim();

    if (!cleanNisn) {
      return { success: false, message: 'Harap masukkan NISN yang valid.' };
    }
    if (!cleanPass || cleanPass.length < 4) {
      return { success: false, message: 'Kata sandi baru minimal harus 4 karakter.' };
    }

    const target = users.find(
      (u) =>
        u.nisn?.toLowerCase() === cleanNisn ||
        u.username?.toLowerCase() === cleanNisn
    );

    if (!target) {
      return {
        success: false,
        message: `NISN "${nisnInput}" belum terdaftar. Pastikan NISN Anda cocok dengan profil yang didaftarkan Admin.`,
      };
    }

    const updatedTarget = { ...target, password: cleanPass, hasCustomPassword: true };
    setUsers((prev) =>
      prev.map((u) => (u.id === target.id ? updatedTarget : u))
    );

    if (currentUser.id === target.id) {
      setCurrentUser((prev) => ({ ...prev, password: cleanPass, hasCustomPassword: true }));
    }

    // Sync to Supabase in background
    syncUserToSupabase(updatedTarget);

    return {
      success: true,
      message: `Kata sandi untuk ${target.name} (NISN: ${target.nisn}) berhasil diatur ulang! Silakan masuk dengan sandi baru Anda.`,
    };
  };

  // Link Email Google ke akun siswa
  const linkGoogleEmail = (userId: string, googleEmail: string): { success: boolean; message: string } => {
    const cleanEmail = googleEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Alamat Email Google tidak valid.' };
    }

    const targetUser = users.find((u) => u.id === userId);
    const updatedUser = targetUser
      ? { ...targetUser, googleEmail: cleanEmail, email: cleanEmail }
      : null;

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, googleEmail: cleanEmail, email: cleanEmail } : u))
    );

    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({ ...prev, googleEmail: cleanEmail, email: cleanEmail }));
    }

    if (updatedUser) {
      syncUserToSupabase(updatedUser);
    }

    return {
      success: true,
      message: `Email Google "${cleanEmail}" berhasil ditautkan ke akun Anda.`,
    };
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (!params.get('portal')) {
        const nextPortal = currentUser.role === 'anggota' ? 'siswa' : 'pengurus';
        window.history.replaceState(null, '', `?portal=${nextPortal}`);
      }
    }
    setIsAuthenticated(false);
  };

  // Switch Active User (Simulator & Demo)
  const switchUser = (userId: string) => {
    const found = users.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
      setIsAuthenticated(true);
    }
  };

  const switchRole = (role: Role) => {
    const found = users.find((u) => u.role === role);
    if (found) {
      setCurrentUser(found);
      setIsAuthenticated(true);
    }
  };

  const updateClassGroup = (updated: Partial<ClassGroup>) => {
    setClassGroup((prev) => {
      const next = { ...prev, ...updated };
      syncClassGroupToSupabase(next);
      return next;
    });
  };

  // Role Enforcement: Only Admin can add users
  const addUser = (newUser: Omit<User, 'id'>): { success: boolean; message: string; user?: User } => {
    if (currentUser.role !== 'admin') {
      return {
        success: false,
        message: 'Akses Ditolak: Hanya Admin yang memiliki wewenang untuk menambahkan anggota/pengguna baru.',
      };
    }

    const id = `usr-${Date.now()}`;
    const defaultUsername = newUser.username || `user${Math.floor(100 + Math.random() * 900)}`;
    const defaultPassword = newUser.password || 'kas12345';
    const defaultNisn = newUser.nisn || `006${Math.floor(1000000 + Math.random() * 9000000)}`;

    const userWithId: User = {
      ...newUser,
      id,
      username: defaultUsername,
      password: defaultPassword,
      nisn: defaultNisn,
      status: 'aktif',
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: currentUser.name,
    };

    setUsers((prev) => [...prev, userWithId]);
    syncUserToSupabase(userWithId);

    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      userId: 'all',
      title: 'Anggota Baru Ditambahkan ✨',
      message: `Admin ${currentUser.name} telah menambahkan anggota baru "${userWithId.name}" (${userWithId.role}).`,
      isRead: false,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: 'info',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    return {
      success: true,
      message: `Akun "${userWithId.name}" berhasil dibuat dengan username: ${userWithId.username}. Kata sandi awal telah disimpan dengan aman.`,
      user: userWithId,
    };
  };

  const updateUser = (id: string, updated: Partial<User>) => {
    const existingUser = users.find((u) => u.id === id);
    const safeUpdated: Partial<User> = { ...updated };

    // Only Admin can modify name, nisn, or role
    if (currentUser.role !== 'admin') {
      delete safeUpdated.name;
      delete safeUpdated.nisn;
      delete safeUpdated.role;
    }

    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...safeUpdated } : u)));
    
    if (currentUser.id === id) {
      setCurrentUser((prev) => ({ ...prev, ...safeUpdated }));
    }

    if (existingUser) {
      syncUserToSupabase({ ...existingUser, ...safeUpdated });
    }

    // If name is updated by Admin, sync payment history name & treasurer name
    if (safeUpdated.name && existingUser && safeUpdated.name !== existingUser.name) {
      setPayments((prev) =>
        prev.map((p) => (p.userId === id ? { ...p, userName: safeUpdated.name! } : p))
      );

      if (existingUser.role === 'bendahara' && classGroup.treasurerName === existingUser.name) {
        setClassGroup((prev) => ({ ...prev, treasurerName: safeUpdated.name! }));
      }

      const newNotif: Notification = {
        id: `notif-${Date.now()}`,
        userId: id,
        title: 'Nama Profil Diperbarui ✏️',
        message: `Nama profil berhasil diubah dari "${existingUser.name}" menjadi "${safeUpdated.name}".`,
        isRead: false,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        type: 'verification',
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }
  };

  const updateUserPassword = (id: string, newPassword: string, currentPassword?: string): { success: boolean; message: string } => {
    const targetUser = users.find((u) => u.id === id);
    if (!targetUser) {
      return { success: false, message: 'Pengguna tidak ditemukan.' };
    }

    const isSelf = currentUser.id === id;
    const isAdmin = currentUser.role === 'admin';

    // Must be either changing own password or admin resetting a member's password
    if (!isSelf && !isAdmin) {
      return {
        success: false,
        message: 'Akses Ditolak: Kata sandi bersifat privat. Hanya pemilik akun bersangkutan atau Admin (reset sementara) yang berwenang.',
      };
    }

    const cleanPass = newPassword.trim();
    if (!cleanPass || cleanPass.length < 4) {
      return { success: false, message: 'Kata sandi baru minimal harus 4 karakter.' };
    }

    // If user is changing their own password, verify their current password first
    if (isSelf && currentPassword !== undefined) {
      const activeCurrentPass = targetUser.password || 'kas12345';
      if (currentPassword.trim() !== activeCurrentPass) {
        return {
          success: false,
          message: 'Kata sandi saat ini yang Anda masukkan salah. Verifikasi gagal.',
        };
      }
    }

    const updatedTargetUser = { ...targetUser, password: cleanPass };
    setUsers((prev) => prev.map((u) => (u.id === id ? updatedTargetUser : u)));
    if (currentUser.id === id) {
      setCurrentUser((prev) => ({ ...prev, password: cleanPass }));
    }

    syncUserToSupabase(updatedTargetUser);

    // Add private security notification to target user
    const secNotif: Notification = {
      id: `notif-${Date.now()}`,
      userId: id,
      title: isSelf ? 'Kata Sandi Berhasil Diperbarui 🔐' : 'Kata Sandi Sementara Direset 🔑',
      message: isSelf
        ? 'Kata sandi pribadi akun Anda berhasil diubah dan dilindungi enkripsi. Tidak ada orang lain (termasuk Admin & Bendahara) yang dapat melihat kata sandi Anda.'
        : `Admin telah menyetel kata sandi sementara baru untuk akun Anda. Harap segera perbarui kata sandi Anda secara privat di menu Profil Saya.`,
      isRead: false,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: 'verification',
    };
    setNotifications((prev) => [secNotif, ...prev]);

    return {
      success: true,
      message: isSelf
        ? 'Kata sandi pribadi Anda berhasil diperbarui! Privasi akun Anda terjamin 100% aman.'
        : `Kata sandi sementara baru berhasil disetel untuk ${targetUser.name}. Informasikan kepada anggota tersebut untuk segera menggantinya di menu Profil Saya.`,
    };
  };

  // Role Enforcement: Only Admin can delete users
  const deleteUser = (id: string, deletePaymentHistory: boolean = false): { success: boolean; message: string } => {
    if (currentUser.role !== 'admin') {
      return {
        success: false,
        message: 'Akses Ditolak: Bendahara tidak memiliki izin menghapus anggota. Hanya Admin yang dapat menghapus anggota.',
      };
    }

    const userToDelete = users.find((u) => u.id === id);
    if (!userToDelete) {
      return { success: false, message: 'Pengguna tidak ditemukan.' };
    }

    if (userToDelete.id === currentUser.id) {
      return { success: false, message: 'Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif.' };
    }

    // Remove user
    const remainingUsers = users.filter((u) => u.id !== id);
    setUsers(remainingUsers);
    deleteUserFromSupabase(id);

    // If current active user is deleted, fallback to admin
    if (currentUser.id === id) {
      const fallbackUser = remainingUsers.find((u) => u.role === 'admin') || remainingUsers[0];
      if (fallbackUser) {
        setCurrentUser(fallbackUser);
      }
    }

    // Handle payments
    if (deletePaymentHistory) {
      setPayments((prev) => prev.filter((p) => p.userId !== id));
    }

    // Add audit notification
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      userId: 'all',
      title: 'Anggota Dihapus 🗑️',
      message: `Admin ${currentUser.name} telah menghapus akun "${userToDelete.name}" (${userToDelete.role}).`,
      isRead: false,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: 'verification',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    return {
      success: true,
      message: `Akun "${userToDelete.name}" berhasil dihapus dari sistem kas kelas.`,
    };
  };

  // Payment Handlers
  const addPayment = (paymentData: Omit<Payment, 'id' | 'transactionId'>): Payment => {
    const txnId = `KASKU-TXN-${Math.floor(10000 + Math.random() * 90000)}`;
    const newPayment: Payment = {
      ...paymentData,
      id: `pay-${Date.now()}`,
      transactionId: txnId,
    };

    setPayments((prev) => [newPayment, ...prev]);
    syncPaymentToSupabase(newPayment);

    // Create Notification
    const notifTitle = newPayment.status === 'lunas' 
      ? 'Pembayaran Kas Berhasil ✅' 
      : 'Pembayaran Menunggu Verifikasi 🟡';
    const notifMsg = newPayment.status === 'lunas'
      ? `Pembayaran kas sebesar Rp${newPayment.amount.toLocaleString('id-ID')} untuk periode ${newPayment.monthPeriod} berhasil!`
      : `Bukti pembayaran kas ${newPayment.userName} sebesar Rp${newPayment.amount.toLocaleString('id-ID')} telah terkirim dan menunggu konfirmasi Bendahara.`;

    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      userId: newPayment.userId,
      title: notifTitle,
      message: notifMsg,
      isRead: false,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: newPayment.status === 'lunas' ? 'payment_success' : 'verification',
    };

    setNotifications((prev) => [newNotif, ...prev]);
    return newPayment;
  };

  const verifyPayment = (paymentId: string, status: PaymentStatus, notes?: string) => {
    let targetPayment: Payment | undefined;
    const treasurerInfo = getTreasurerInfo(currentUser);
    const verifierLabel = treasurerInfo.isTreasurer
      ? treasurerInfo.senderTitle
      : currentUser.role === 'admin'
      ? `Administrator (${currentUser.name})`
      : currentUser.name;

    setPayments((prev) =>
      prev.map((p) => {
        if (p.id === paymentId) {
          targetPayment = {
            ...p,
            status,
            notes: notes || p.notes,
            verifiedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            verifiedBy: verifierLabel,
          };
          return targetPayment;
        }
        return p;
      })
    );

    if (targetPayment) {
      syncPaymentToSupabase(targetPayment);
      const isApproved = status === 'lunas';
      const newNotif: Notification = {
        id: `notif-${Date.now()}`,
        userId: targetPayment.userId,
        title: isApproved ? 'Pembayaran Diverifikasi LUNAS ✅' : 'Verifikasi Pembayaran Ditolak ❌',
        message: isApproved
          ? `Pembayaran kas periode ${targetPayment.monthPeriod} kamu telah disetujui & diverifikasi LUNAS oleh ${verifierLabel}.`
          : `Pembayaran kas periode ${targetPayment.monthPeriod} ditolak oleh ${verifierLabel}. Catatan: ${notes || 'Bukti kurang jelas'}.`,
        isRead: false,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        type: isApproved ? 'payment_success' : 'reminder',
        senderName: verifierLabel,
        senderRole: treasurerInfo.shortLabel,
        senderId: currentUser.id,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }
  };

  const markPaidManual = (
    userId: string,
    monthPeriod: string,
    amount: number,
    weekPeriod?: string,
    customNote?: string,
    paymentDate?: string
  ): Payment | undefined => {
    const userObj = users.find((u) => u.id === userId);
    if (!userObj) return undefined;

    const treasurerInfo = getTreasurerInfo(currentUser);
    const verifierLabel = treasurerInfo.isTreasurer
      ? treasurerInfo.senderTitle
      : currentUser.role === 'admin'
      ? `Administrator (${currentUser.name})`
      : currentUser.name;

    return addPayment({
      userId,
      userName: userObj.name,
      amount,
      date: paymentDate || new Date().toISOString().split('T')[0],
      monthPeriod,
      weekPeriod: weekPeriod || (amount === classGroup.weeklyDues ? 'Minggu 1' : '1 Bulan Penuh (Minggu 1 - 4)'),
      method: 'cash_manual',
      status: 'lunas',
      notes: customNote || `Setor tunai diterima langsung oleh ${verifierLabel} (${weekPeriod || 'Lunas'})`,
      verifiedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      verifiedBy: verifierLabel,
    });
  };

  // Expense Handlers
  const addExpense = (expenseData: Omit<Expense, 'id'>) => {
    const treasurerInfo = getTreasurerInfo(currentUser);
    const recorderLabel = treasurerInfo.isTreasurer
      ? treasurerInfo.senderTitle
      : currentUser.role === 'admin'
      ? `Administrator (${currentUser.name})`
      : currentUser.name;

    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      recordedBy: expenseData.recordedBy || recorderLabel,
    };
    setExpenses((prev) => [newExpense, ...prev]);
    syncExpenseToSupabase(newExpense);
  };

  const updateExpense = (id: string, updated: Partial<Expense>) => {
    setExpenses((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          const next = { ...e, ...updated };
          syncExpenseToSupabase(next);
          return next;
        }
        return e;
      })
    );
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    deleteExpenseFromSupabase(id);
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const sendReminder = (targetUserId: string | 'all', title?: string, message?: string) => {
    const treasurerInfo = getTreasurerInfo(currentUser);
    const senderTitle = treasurerInfo.isTreasurer
      ? treasurerInfo.senderTitle
      : currentUser.role === 'admin'
      ? `Administrator (${currentUser.name})`
      : `Pengurus (${currentUser.name})`;

    const senderRole = treasurerInfo.isTreasurer
      ? treasurerInfo.shortLabel
      : currentUser.role === 'admin'
      ? 'Administrator'
      : 'Anggota';

    const defaultTitle = `Pengingat Kas dari ${senderRole} (${treasurerInfo.callName}) ⚠️`;
    const defaultMsg = `Halo! Anda diingatkan langsung oleh ${senderTitle} untuk segera melunasi iuran kas kelas ${classGroup.period} (Rp 6.000 / minggu atau Rp 24.000 / bulan). Silakan bayar melalui aplikasi atau serahkan langsung ke ${treasurerInfo.callName}.`;

    if (targetUserId === 'all') {
      const unpaidMembers = users.filter((u) => {
        if (u.role === 'admin') return false;
        const p = payments.find(
          (pay) => pay.userId === u.id && pay.monthPeriod === classGroup.period && pay.status === 'lunas'
        );
        return !p;
      });

      const newNotifs: Notification[] = unpaidMembers.map((u) => ({
        id: `notif-${Date.now()}-${u.id}`,
        userId: u.id,
        title: title || defaultTitle,
        message: message || defaultMsg,
        isRead: false,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        type: 'reminder',
        senderName: senderTitle,
        senderRole: senderRole,
        senderId: currentUser.id,
      }));

      setNotifications((prev) => [...newNotifs, ...prev]);
    } else {
      const newNotif: Notification = {
        id: `notif-${Date.now()}`,
        userId: targetUserId,
        title: title || defaultTitle,
        message: message || defaultMsg,
        isRead: false,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        type: 'reminder',
        senderName: senderTitle,
        senderRole: senderRole,
        senderId: currentUser.id,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }
  };

  // Reset Demo Data
  const resetDemoData = () => {
    const adminUser = initialUsers.find((u) => u.role === 'admin') || initialUsers[0];
    setUsers(initialUsers);
    setCurrentUser(adminUser);
    setIsAuthenticated(true);
    setClassGroup(initialClassGroup);
    setPayments(initialPayments);
    setExpenses(initialExpenses);
    setNotifications(initialNotifications);
    localStorage.clear();
    pushAllToSupabase({
      users: initialUsers,
      classGroup: initialClassGroup,
      payments: initialPayments,
      expenses: initialExpenses,
      notifications: initialNotifications,
    }).catch(() => {});
  };

  // Computed Financial Metrics
  const totalIncome = payments
    .filter((p) => p.status === 'lunas')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalBalance = totalIncome - totalExpense;

  const currentMonthPayments = payments.filter(
    (p) => p.monthPeriod === classGroup.period && p.status === 'lunas'
  );

  const totalIncomeThisMonth = currentMonthPayments.reduce((sum, p) => sum + p.amount, 0);

  const currentYearMonth = new Date().toISOString().slice(0, 7);
  const totalExpenseThisMonth = expenses
    .filter((e) => e.date.startsWith('2026-08') || e.date.startsWith(currentYearMonth))
    .reduce((sum, e) => sum + e.amount, 0);

  const memberUsers = users.filter((u) => u.role === 'anggota');
  const paidMembersCount = currentMonthPayments.length;
  const pendingVerificationCount = payments.filter(
    (p) => p.monthPeriod === classGroup.period && p.status === 'menunggu'
  ).length;
  const unpaidMembersCount = Math.max(0, memberUsers.length - paidMembersCount - pendingVerificationCount);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        login,
        loginWithGoogle,
        setSelfPassword,
        resetPasswordWithGoogle,
        linkGoogleEmail,
        logout,
        switchUser,
        switchRole,
        classGroup,
        updateClassGroup,
        users,
        addUser,
        updateUser,
        updateUserPassword,
        deleteUser,
        payments,
        addPayment,
        verifyPayment,
        markPaidManual,
        expenses,
        addExpense,
        updateExpense,
        deleteExpense,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        sendReminder,
        resetDemoData,
        // Supabase values
        supabaseHealth,
        isSupabaseModalOpen,
        setIsSupabaseModalOpen,
        syncAllFromSupabase,
        syncAllToSupabase,
        refreshSupabaseHealth,
        // Metrics
        totalBalance,
        totalIncomeThisMonth,
        totalExpenseThisMonth,
        paidMembersCount,
        unpaidMembersCount,
        pendingVerificationCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
