import React, { createContext, useContext, useEffect, useState } from 'react';
import { initialClassGroup, initialExpenses, initialNotifications, initialPayments, initialUsers } from '../data/mockData';
import { ClassGroup, Expense, Notification, Payment, PaymentMethod, PaymentStatus, Role, User } from '../types';

interface AppContextType {
  currentUser: User;
  isAuthenticated: boolean;
  login: (identifier: string, password?: string, googleEmail?: string) => { success: boolean; message: string; user?: User; requiresPasswordSetup?: boolean };
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
  markPaidManual: (userId: string, monthPeriod: string, amount: number, weekPeriod?: string) => void;
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, updated: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  sendReminder: (userId: string | 'all', title?: string, message?: string) => void;
  resetDemoData: () => void;
  // Computed Stats
  totalBalance: number;
  totalIncomeThisMonth: number;
  totalExpenseThisMonth: number;
  paidMembersCount: number;
  unpaidMembersCount: number;
  pendingVerificationCount: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'kasku_digital_state_v5';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_users`);
    return saved ? JSON.parse(saved) : initialUsers;
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
    // Default to true for smooth initial load, but can be logged out cleanly
    return savedAuth !== null ? savedAuth === 'true' : true;
  });

  const [classGroup, setClassGroup] = useState<ClassGroup>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_class`);
    return saved ? JSON.parse(saved) : initialClassGroup;
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

  // Login handler with Google Email & Password support
  const login = (
    identifier: string,
    password?: string,
    googleEmail?: string
  ): { success: boolean; message: string; user?: User; requiresPasswordSetup?: boolean } => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password ? password.trim() : '';
    const cleanGoogle = googleEmail ? googleEmail.trim().toLowerCase() : '';

    if (!cleanId && !cleanGoogle) {
      return { success: false, message: 'Harap masukkan Email Google Anda untuk mengakses aplikasi.' };
    }

    // Match by Google email, email, username, or NISN
    const matchedUser = users.find((u) => {
      const matchGoogle = cleanGoogle && (u.googleEmail?.toLowerCase() === cleanGoogle || u.email?.toLowerCase() === cleanGoogle);
      const matchUsername = u.username?.toLowerCase() === cleanId;
      const matchEmail = u.email?.toLowerCase() === cleanId;
      const matchNisn = u.nisn?.toLowerCase() === cleanId;
      const matchDirectGoogle = u.googleEmail?.toLowerCase() === cleanId;
      return matchGoogle || matchUsername || matchEmail || matchNisn || matchDirectGoogle;
    });

    if (!matchedUser) {
      // If user provided a valid Google email (e.g. lampusuianggraeni@gmail.com or other @gmail.com)
      const isGmail = (cleanGoogle || cleanId).includes('@gmail.com') || (cleanGoogle || cleanId).includes('@');
      if (isGmail) {
        // Link to first student user if not yet registered
        const targetStudent = users.find((u) => u.role === 'anggota') || users[0];
        if (targetStudent) {
          const updatedStudent: User = {
            ...targetStudent,
            googleEmail: cleanGoogle || cleanId,
            email: cleanGoogle || cleanId,
          };
          setUsers((prev) => prev.map((u) => (u.id === targetStudent.id ? updatedStudent : u)));
          setCurrentUser(updatedStudent);
          setIsAuthenticated(true);
          return {
            success: true,
            message: `Akun Google "${cleanGoogle || cleanId}" berhasil terhubung ke ${updatedStudent.name}. Silakan atur kata sandi pribadi Anda!`,
            user: updatedStudent,
            requiresPasswordSetup: !updatedStudent.hasCustomPassword,
          };
        }
      }

      return {
        success: false,
        message: 'Akun atau Email Google tidak ditemukan. Masukkan email Google yang terdaftar atau pilih siswa.',
      };
    }

    // If password provided, verify it
    if (cleanPass) {
      const expectedPass = matchedUser.password || 'kas12345';
      if (expectedPass !== cleanPass) {
        return {
          success: false,
          message: 'Kata sandi salah. Anda dapat mengatur ulang kata sandi menggunakan Email Google Anda.',
        };
      }
    } else if (matchedUser.hasCustomPassword) {
      return {
        success: false,
        message: 'Akun ini memiliki kata sandi pribadi. Silakan masukkan kata sandi Anda.',
      };
    }

    // Success login
    setCurrentUser(matchedUser);
    setIsAuthenticated(true);
    return {
      success: true,
      message: `Selamat datang kembali, ${matchedUser.name}! Anda berhasil masuk sebagai ${
        matchedUser.role === 'admin' ? 'Administrator' : matchedUser.role === 'bendahara' ? 'Bendahara Utama' : 'Anggota Kelas'
      }.`,
      user: matchedUser,
      requiresPasswordSetup: !matchedUser.hasCustomPassword,
    };
  };

  // Login via Google One-Tap / Google Account
  const loginWithGoogle = (
    googleEmail: string
  ): { success: boolean; message: string; user?: User; requiresPasswordSetup?: boolean } => {
    const cleanEmail = googleEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Harap masukkan alamat Email Google (Gmail) yang valid.' };
    }

    let matchedUser = users.find(
      (u) =>
        u.googleEmail?.toLowerCase() === cleanEmail ||
        u.email?.toLowerCase() === cleanEmail ||
        u.username?.toLowerCase() === cleanEmail.split('@')[0]
    );

    // If not found, bind to student usr-1 or create friendly student profile
    if (!matchedUser) {
      const defaultAnggota = users.find((u) => u.id === 'usr-1') || users.find((u) => u.role === 'anggota');
      if (defaultAnggota) {
        matchedUser = {
          ...defaultAnggota,
          googleEmail: cleanEmail,
          email: cleanEmail,
        };
        setUsers((prev) => prev.map((u) => (u.id === defaultAnggota.id ? matchedUser! : u)));
      }
    }

    if (!matchedUser) {
      return { success: false, message: 'Tidak dapat mengautentikasi akun Google.' };
    }

    setCurrentUser(matchedUser);
    setIsAuthenticated(true);

    return {
      success: true,
      message: `Berhasil masuk dengan akun Google: ${cleanEmail}. Selamat datang, ${matchedUser.name}!`,
      user: matchedUser,
      requiresPasswordSetup: !matchedUser.hasCustomPassword,
    };
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

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, password: cleanPass, hasCustomPassword: true } : u))
    );

    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({ ...prev, password: cleanPass, hasCustomPassword: true }));
    }

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

  // Reset kata sandi mandiri menggunakan Email Google
  const resetPasswordWithGoogle = (googleEmail: string, newPassword: string): { success: boolean; message: string } => {
    const cleanEmail = googleEmail.trim().toLowerCase();
    const cleanPass = newPassword.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Harap masukkan Email Google yang valid.' };
    }
    if (!cleanPass || cleanPass.length < 4) {
      return { success: false, message: 'Kata sandi baru minimal harus 4 karakter.' };
    }

    const target = users.find(
      (u) =>
        u.googleEmail?.toLowerCase() === cleanEmail ||
        u.email?.toLowerCase() === cleanEmail
    );

    if (!target) {
      return {
        success: false,
        message: `Email Google "${cleanEmail}" belum terdaftar. Pastikan email Google Anda cocok dengan profil siswa.`,
      };
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === target.id ? { ...u, password: cleanPass, hasCustomPassword: true } : u))
    );

    if (currentUser.id === target.id) {
      setCurrentUser((prev) => ({ ...prev, password: cleanPass, hasCustomPassword: true }));
    }

    return {
      success: true,
      message: `Kata sandi untuk ${target.name} berhasil diatur ulang via Email Google! Silakan masuk dengan sandi baru Anda.`,
    };
  };

  // Link Email Google ke akun siswa
  const linkGoogleEmail = (userId: string, googleEmail: string): { success: boolean; message: string } => {
    const cleanEmail = googleEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Alamat Email Google tidak valid.' };
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, googleEmail: cleanEmail, email: cleanEmail } : u))
    );

    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({ ...prev, googleEmail: cleanEmail, email: cleanEmail }));
    }

    return {
      success: true,
      message: `Email Google "${cleanEmail}" berhasil ditautkan ke akun Anda.`,
    };
  };

  const logout = () => {
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
    setClassGroup((prev) => ({ ...prev, ...updated }));
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
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updated } : u)));
    
    if (currentUser.id === id) {
      setCurrentUser((prev) => ({ ...prev, ...updated }));
    }

    // If name is updated, sync payment history name & treasurer name
    if (updated.name && existingUser && updated.name !== existingUser.name) {
      setPayments((prev) =>
        prev.map((p) => (p.userId === id ? { ...p, userName: updated.name! } : p))
      );

      if (existingUser.role === 'bendahara' && classGroup.treasurerName === existingUser.name) {
        setClassGroup((prev) => ({ ...prev, treasurerName: updated.name! }));
      }

      const newNotif: Notification = {
        id: `notif-${Date.now()}`,
        userId: id,
        title: 'Nama Profil Diperbarui ✏️',
        message: `Nama profil berhasil diubah dari "${existingUser.name}" menjadi "${updated.name}".`,
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

    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, password: cleanPass } : u)));
    if (currentUser.id === id) {
      setCurrentUser((prev) => ({ ...prev, password: cleanPass }));
    }

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

    setPayments((prev) =>
      prev.map((p) => {
        if (p.id === paymentId) {
          targetPayment = {
            ...p,
            status,
            notes: notes || p.notes,
            verifiedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            verifiedBy: currentUser.name,
          };
          return targetPayment;
        }
        return p;
      })
    );

    if (targetPayment) {
      const isApproved = status === 'lunas';
      const newNotif: Notification = {
        id: `notif-${Date.now()}`,
        userId: targetPayment.userId,
        title: isApproved ? 'Pembayaran Diverifikasi LUNAS ✅' : 'Verifikasi Pembayaran Ditolak ❌',
        message: isApproved
          ? `Pembayaran kas periode ${targetPayment.monthPeriod} kamu telah disetujui oleh Bendahara ${currentUser.name}.`
          : `Pembayaran kas periode ${targetPayment.monthPeriod} ditolak. Catatan Bendahara: ${notes || 'Bukti kurang jelas'}.`,
        isRead: false,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        type: isApproved ? 'payment_success' : 'reminder',
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }
  };

  const markPaidManual = (userId: string, monthPeriod: string, amount: number, weekPeriod?: string) => {
    const userObj = users.find((u) => u.id === userId);
    if (!userObj) return;

    addPayment({
      userId,
      userName: userObj.name,
      amount,
      date: new Date().toISOString().split('T')[0],
      monthPeriod,
      weekPeriod: weekPeriod || (amount === classGroup.weeklyDues ? 'Minggu 1' : '1 Bulan Penuh (Minggu 1 - 4)'),
      method: 'cash_manual',
      status: 'lunas',
      notes: `Setor tunai dicatat oleh Bendahara (${weekPeriod || 'Lunas'})`,
      verifiedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      verifiedBy: currentUser.name,
    });
  };

  // Expense Handlers
  const addExpense = (expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      recordedBy: currentUser.name,
    };
    setExpenses((prev) => [newExpense, ...prev]);
  };

  const updateExpense = (id: string, updated: Partial<Expense>) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updated } : e))
    );
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const sendReminder = (targetUserId: string | 'all', title?: string, message?: string) => {
    const defaultTitle = 'Pengingat Uang Kas (Rp 6.000/mg) ⚠️';
    const defaultMsg = `Halo! Diingatkan untuk membayar kas kelas ${classGroup.period} (Rp 6.000 / minggu atau Rp 24.000 / bulan).`;

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
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }
  };

  // Reset Demo Data
  const resetDemoData = () => {
    setUsers(initialUsers);
    setCurrentUser(initialUsers[2]); // Default to admin for full visibility after reset
    setIsAuthenticated(true);
    setClassGroup(initialClassGroup);
    setPayments(initialPayments);
    setExpenses(initialExpenses);
    setNotifications(initialNotifications);
    localStorage.clear();
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

  const totalExpenseThisMonth = expenses
    .filter((e) => e.date.startsWith('2026-08'))
    .reduce((sum, e) => sum + e.amount, 0);

  const memberUsers = users.filter((u) => u.role !== 'admin');
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
