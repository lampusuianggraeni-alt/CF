import { createClient } from '@supabase/supabase-js';
import { User, ClassGroup, Payment, Expense, Notification } from '../types';

export const SUPABASE_URL: string =
  ((import.meta as any).env?.VITE_SUPABASE_URL as string) || 'https://swtgjikzzprbcsytatls.supabase.co';

export const SUPABASE_ANON_KEY: string =
  ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3dGdqaWt6enByYmNzeXRhdGxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxMTg4NDUsImV4cCI6MjEwNTY5NDg0NX0.pAF-qf3eJlOmffg8lIHXNhVEkdROecg8LORCcRXZQRg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const SUPABASE_SCHEMA_SQL = `-- ==============================================================================
-- SKRIP SQL DATABASE SUPABASE KAS KELAS (CLASS FUND)
-- URL Proyek: https://swtgjikzzprbcsytatls.supabase.co
-- Cara Pasang: Buka Supabase Dashboard -> SQL Editor -> Tempel Script Ini -> Run
-- ==============================================================================

-- 1. TABEL PENGGUNA & ANGGOTA (users)
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT NOT NULL,
  password TEXT DEFAULT 'kas12345',
  nisn TEXT,
  email TEXT NOT NULL,
  google_email TEXT,
  has_custom_password BOOLEAN DEFAULT false,
  phone TEXT DEFAULT '',
  role TEXT NOT NULL CHECK (role IN ('anggota', 'bendahara', 'admin')),
  avatar TEXT DEFAULT '',
  class_id TEXT DEFAULT 'cls-ix-a',
  class_name TEXT DEFAULT 'IX. A CLASS',
  member_qr_code TEXT DEFAULT '',
  status TEXT DEFAULT 'aktif' CHECK (status IN ('aktif', 'nonaktif')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT DEFAULT 'admin'
);

-- 2. TABEL PENGATURAN KAS & KELAS (class_group)
CREATE TABLE IF NOT EXISTS public.class_group (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  treasurer_name TEXT NOT NULL,
  monthly_dues NUMERIC NOT NULL DEFAULT 24000,
  weekly_dues NUMERIC NOT NULL DEFAULT 6000,
  period TEXT NOT NULL DEFAULT '2026/2027',
  due_date INTEGER NOT NULL DEFAULT 10,
  bank_name TEXT NOT NULL DEFAULT 'BCA',
  account_number TEXT NOT NULL DEFAULT '8920192810',
  account_name TEXT NOT NULL DEFAULT 'Bendahara IX. A CLASS',
  qris_url TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABEL PEMBAYARAN KAS (payments)
CREATE TABLE IF NOT EXISTS public.payments (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  date DATE NOT NULL,
  month_period TEXT NOT NULL,
  week_period TEXT,
  weeks_paid JSONB DEFAULT '[]'::jsonb,
  method TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('lunas', 'menunggu', 'belum_bayar', 'terlambat')),
  transaction_id TEXT NOT NULL,
  proof_url TEXT,
  notes TEXT,
  verified_at TIMESTAMPTZ,
  verified_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABEL PENGELUARAN KAS (expenses)
CREATE TABLE IF NOT EXISTS public.expenses (
  id TEXT PRIMARY KEY,
  class_id TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  date DATE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('keperluan_kelas', 'kegiatan', 'perlengkapan', 'lainnya')),
  description TEXT NOT NULL,
  receipt_url TEXT,
  recorded_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABEL NOTIFIKASI KAS (notifications)
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  type TEXT NOT NULL CHECK (type IN ('reminder', 'payment_success', 'verification', 'info')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABEL LOG AUDIT (audit_logs)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  "user" TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT NOT NULL
);

-- ==============================================================================
-- AKTIFKAN ROW LEVEL SECURITY (RLS) & IZIN AKSES PUBLIC / ANON
-- ==============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_group ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Kebijakan Akses Penuh untuk Anon Client (Key Anon Supabase)
DROP POLICY IF EXISTS "Public Anon Akses users" ON public.users;
CREATE POLICY "Public Anon Akses users" ON public.users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Anon Akses class_group" ON public.class_group;
CREATE POLICY "Public Anon Akses class_group" ON public.class_group FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Anon Akses payments" ON public.payments;
CREATE POLICY "Public Anon Akses payments" ON public.payments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Anon Akses expenses" ON public.expenses;
CREATE POLICY "Public Anon Akses expenses" ON public.expenses FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Anon Akses notifications" ON public.notifications;
CREATE POLICY "Public Anon Akses notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Anon Akses audit_logs" ON public.audit_logs;
CREATE POLICY "Public Anon Akses audit_logs" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);

-- Buat Index untuk Query Cepat
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_google_email ON public.users(google_email);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(date);
`;

export interface SupabaseHealth {
  connected: boolean;
  projectUrl: string;
  tables: {
    users: boolean;
    class_group: boolean;
    payments: boolean;
    expenses: boolean;
    notifications: boolean;
  };
  tableCounts?: {
    users?: number;
    payments?: number;
    expenses?: number;
    notifications?: number;
  };
  error?: string | null;
}

// Convert camelCase User to snake_case for Supabase
export const userToSupabase = (u: User) => ({
  id: u.id,
  name: u.name,
  username: u.username,
  password: u.password || 'kas12345',
  nisn: u.nisn || '',
  email: u.email,
  google_email: u.googleEmail || u.email,
  has_custom_password: !!u.hasCustomPassword,
  phone: u.phone || '',
  role: u.role,
  avatar: u.avatar || '',
  class_id: u.classId || 'cls-ix-a',
  class_name: u.className || 'IX. A CLASS',
  member_qr_code: u.memberQrCode || '',
  status: u.status || 'aktif',
  created_at: u.createdAt || new Date().toISOString(),
  created_by: u.createdBy || 'admin',
});

// Convert snake_case from Supabase back to camelCase User
export const userFromSupabase = (row: any): User => ({
  id: row.id,
  name: row.name,
  username: row.username,
  password: row.password,
  nisn: row.nisn,
  email: row.email,
  googleEmail: row.google_email || row.email,
  hasCustomPassword: !!row.has_custom_password,
  phone: row.phone || '',
  role: row.role,
  avatar: row.avatar || '',
  classId: row.class_id || 'cls-ix-a',
  className: row.class_name || 'IX. A CLASS',
  memberQrCode: row.member_qr_code || '',
  status: row.status || 'aktif',
  createdAt: row.created_at,
  createdBy: row.created_by,
});

// Convert ClassGroup
export const classGroupToSupabase = (c: ClassGroup) => ({
  id: c.id,
  name: c.name,
  treasurer_name: c.treasurerName,
  monthly_dues: c.monthlyDues,
  weekly_dues: c.weeklyDues,
  period: c.period,
  due_date: c.dueDate,
  bank_name: c.bankInfo.bankName,
  account_number: c.bankInfo.accountNumber,
  account_name: c.bankInfo.accountName,
  qris_url: c.bankInfo.qrisUrl || '',
  updated_at: new Date().toISOString(),
});

export const classGroupFromSupabase = (row: any): ClassGroup => ({
  id: row.id,
  name: row.name,
  treasurerName: row.treasurer_name,
  monthlyDues: Number(row.monthly_dues),
  weeklyDues: Number(row.weekly_dues),
  period: row.period,
  dueDate: Number(row.due_date),
  bankInfo: {
    bankName: row.bank_name,
    accountNumber: row.account_number,
    accountName: row.account_name,
    qrisUrl: row.qris_url,
  },
});

// Convert Payment
export const paymentToSupabase = (p: Payment) => ({
  id: p.id,
  user_id: p.userId,
  user_name: p.userName,
  amount: p.amount,
  date: p.date,
  month_period: p.monthPeriod,
  week_period: p.weekPeriod || null,
  weeks_paid: p.weeksPaid || [],
  method: p.method,
  status: p.status,
  transaction_id: p.transactionId,
  proof_url: p.proofUrl || null,
  notes: p.notes || null,
  verified_at: p.verifiedAt || null,
  verified_by: p.verifiedBy || null,
});

export const paymentFromSupabase = (row: any): Payment => ({
  id: row.id,
  userId: row.user_id,
  userName: row.user_name,
  amount: Number(row.amount),
  date: row.date,
  monthPeriod: row.month_period,
  weekPeriod: row.week_period || undefined,
  weeksPaid: Array.isArray(row.weeks_paid) ? row.weeks_paid : [],
  method: row.method,
  status: row.status,
  transactionId: row.transaction_id,
  proofUrl: row.proof_url || undefined,
  notes: row.notes || undefined,
  verifiedAt: row.verified_at || undefined,
  verifiedBy: row.verified_by || undefined,
});

// Convert Expense
export const expenseToSupabase = (e: Expense) => ({
  id: e.id,
  class_id: e.classId,
  amount: e.amount,
  date: e.date,
  category: e.category,
  description: e.description,
  receipt_url: e.receiptUrl || null,
  recorded_by: e.recordedBy,
});

export const expenseFromSupabase = (row: any): Expense => ({
  id: row.id,
  classId: row.class_id,
  amount: Number(row.amount),
  date: row.date,
  category: row.category,
  description: row.description,
  receiptUrl: row.receipt_url || undefined,
  recordedBy: row.recorded_by,
});

// Convert Notification
export const notificationToSupabase = (n: Notification) => ({
  id: n.id,
  user_id: n.userId,
  title: n.title,
  message: n.message,
  is_read: n.isRead,
  type: n.type,
  created_at: n.createdAt,
});

export const notificationFromSupabase = (row: any): Notification => ({
  id: row.id,
  userId: row.user_id,
  title: row.title,
  message: row.message,
  isRead: !!row.is_read,
  type: row.type,
  createdAt: row.created_at,
});

// Test connection and health
export async function checkSupabaseHealth(): Promise<SupabaseHealth> {
  const result: SupabaseHealth = {
    connected: false,
    projectUrl: SUPABASE_URL,
    tables: {
      users: false,
      class_group: false,
      payments: false,
      expenses: false,
      notifications: false,
    },
    tableCounts: {},
  };

  try {
    // Check users table
    const { count: userCount, error: userError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (!userError) {
      result.connected = true;
      result.tables.users = true;
      result.tableCounts!.users = userCount || 0;
    } else if (userError.code !== 'PGRST205') {
      result.connected = true; // Supabase answered
    }

    // Check class_group table
    const { error: classError } = await supabase.from('class_group').select('*', { head: true });
    if (!classError) result.tables.class_group = true;

    // Check payments table
    const { count: payCount, error: payError } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true });
    if (!payError) {
      result.tables.payments = true;
      result.tableCounts!.payments = payCount || 0;
    }

    // Check expenses table
    const { count: expCount, error: expError } = await supabase
      .from('expenses')
      .select('*', { count: 'exact', head: true });
    if (!expError) {
      result.tables.expenses = true;
      result.tableCounts!.expenses = expCount || 0;
    }

    // Check notifications table
    const { count: notifCount, error: notifError } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true });
    if (!notifError) {
      result.tables.notifications = true;
      result.tableCounts!.notifications = notifCount || 0;
    }

    // Even if tables don't exist yet, if we got a response from the Supabase server, we are connected!
    result.connected = true;
  } catch (err: any) {
    result.connected = false;
    result.error = err?.message || 'Gagal terhubung ke Supabase';
  }

  return result;
}

// Fetch all app data from Supabase
export async function fetchAllFromSupabase(): Promise<{
  users?: User[];
  classGroup?: ClassGroup;
  payments?: Payment[];
  expenses?: Expense[];
  notifications?: Notification[];
  success: boolean;
  message: string;
}> {
  try {
    // 1. Fetch Users
    const { data: userData, error: userErr } = await supabase.from('users').select('*');
    if (userErr) {
      return { success: false, message: `Tabel users belum siap: ${userErr.message}` };
    }

    // 2. Fetch ClassGroup
    const { data: classData, error: classErr } = await supabase.from('class_group').select('*').limit(1);

    // 3. Fetch Payments
    const { data: payData, error: payErr } = await supabase.from('payments').select('*');

    // 4. Fetch Expenses
    const { data: expData, error: expErr } = await supabase.from('expenses').select('*');

    // 5. Fetch Notifications
    const { data: notifData, error: notifErr } = await supabase.from('notifications').select('*');

    return {
      success: true,
      message: 'Berhasil memuat data dari Supabase!',
      users: userData && userData.length > 0 ? userData.map(userFromSupabase) : undefined,
      classGroup: classData && classData.length > 0 ? classGroupFromSupabase(classData[0]) : undefined,
      payments: payData ? payData.map(paymentFromSupabase) : undefined,
      expenses: expData ? expData.map(expenseFromSupabase) : undefined,
      notifications: notifData ? notifData.map(notificationFromSupabase) : undefined,
    };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Gagal memuat data dari Supabase' };
  }
}

// Push all local data to Supabase (Seed/Migrate)
export async function pushAllToSupabase(payload: {
  users: User[];
  classGroup: ClassGroup;
  payments: Payment[];
  expenses: Expense[];
  notifications: Notification[];
}): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    // 1. Push Users
    const formattedUsers = payload.users.map(userToSupabase);
    const { error: userErr } = await supabase.from('users').upsert(formattedUsers, { onConflict: 'id' });
    if (userErr) {
      return {
        success: false,
        message: `Gagal upload pengguna ke Supabase: ${userErr.message}. Pastikan Anda telah menjalankan skrip SQL di Supabase.`,
      };
    }

    // 2. Push Class Group
    const formattedClass = classGroupToSupabase(payload.classGroup);
    const { error: classErr } = await supabase.from('class_group').upsert([formattedClass], { onConflict: 'id' });
    if (classErr) {
      return { success: false, message: `Gagal upload pengaturan kas: ${classErr.message}` };
    }

    // 3. Push Payments
    if (payload.payments.length > 0) {
      const formattedPayments = payload.payments.map(paymentToSupabase);
      const { error: payErr } = await supabase.from('payments').upsert(formattedPayments, { onConflict: 'id' });
      if (payErr) {
        return { success: false, message: `Gagal upload pembayaran: ${payErr.message}` };
      }
    }

    // 4. Push Expenses
    if (payload.expenses.length > 0) {
      const formattedExpenses = payload.expenses.map(expenseToSupabase);
      const { error: expErr } = await supabase.from('expenses').upsert(formattedExpenses, { onConflict: 'id' });
      if (expErr) {
        return { success: false, message: `Gagal upload pengeluaran: ${expErr.message}` };
      }
    }

    // 5. Push Notifications
    if (payload.notifications.length > 0) {
      const formattedNotifs = payload.notifications.map(notificationToSupabase);
      const { error: notifErr } = await supabase.from('notifications').upsert(formattedNotifs, { onConflict: 'id' });
      if (notifErr) {
        return { success: false, message: `Gagal upload notifikasi: ${notifErr.message}` };
      }
    }

    return {
      success: true,
      message: `Semua data (${payload.users.length} pengguna, kas kelas, pembayaran, dan pengeluaran) berhasil disinkronkan ke database Supabase!`,
    };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Terjadi kesalahan saat upload ke Supabase' };
  }
}

// Live individual upsert helpers (called on action)
export async function syncUserToSupabase(user: User) {
  try {
    await supabase.from('users').upsert([userToSupabase(user)], { onConflict: 'id' });
  } catch {
    // silent catch, fallback to local
  }
}

export async function deleteUserFromSupabase(userId: string) {
  try {
    await supabase.from('users').delete().eq('id', userId);
  } catch {
    // silent catch
  }
}

export async function syncPaymentToSupabase(payment: Payment) {
  try {
    await supabase.from('payments').upsert([paymentToSupabase(payment)], { onConflict: 'id' });
  } catch {
    // silent catch
  }
}

export async function syncExpenseToSupabase(expense: Expense) {
  try {
    await supabase.from('expenses').upsert([expenseToSupabase(expense)], { onConflict: 'id' });
  } catch {
    // silent catch
  }
}

export async function deleteExpenseFromSupabase(expenseId: string) {
  try {
    await supabase.from('expenses').delete().eq('id', expenseId);
  } catch {
    // silent catch
  }
}

export async function syncClassGroupToSupabase(classGroup: ClassGroup) {
  try {
    await supabase.from('class_group').upsert([classGroupToSupabase(classGroup)], { onConflict: 'id' });
  } catch {
    // silent catch
  }
}
