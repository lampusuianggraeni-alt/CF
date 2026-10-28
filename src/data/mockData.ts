import { ClassGroup, Expense, Notification, Payment, User } from '../types';

export const initialClassGroup: ClassGroup = {
  id: 'cls-ix-a',
  name: 'IX. A CLASS',
  treasurerName: 'Maita & Fioren (Bendahara)',
  weeklyDues: 6000,
  monthlyDues: 24000,
  period: 'Agustus 2026',
  dueDate: 15,
  bankInfo: {
    bankName: 'Bank Central Asia (BCA)',
    accountNumber: '8820491028',
    accountName: 'Kas IX. A CLASS (Maita & Fioren)',
    qrisUrl: '',
  },
};

const avatarPool = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
];

const studentRoster: Array<{ nisn: string; name: string }> = [
  { nisn: '0123866438', name: 'ABID RAZA AQILLA HASFIAN' },
  { nisn: '0123925482', name: 'AFIQAH ZAHIRA ASTKA' },
  { nisn: '3120165052', name: 'AHMAD FIRNAZ DZAL AIDI' },
  { nisn: '0124439278', name: 'ALEN RAMADANI EKDIR' },
  { nisn: '0126668350', name: 'ANA ALTHOFU NISA' },
  { nisn: '3124652885', name: 'ANDI MAITALIDIYANI M.' },
  { nisn: '0126338680', name: 'ANNISA ININNAWA NABI' },
  { nisn: '0123473724', name: 'ASIFA NUR FAIZAH' },
  { nisn: '0118980009', name: 'ASYIFA MUTMAINNAH' },
  { nisn: '0121894153', name: 'AVISCHA DWI ULANDARY' },
  { nisn: '0116268914', name: 'DHEAN SUWARDHANI KUDUS' },
  { nisn: '0129361551', name: 'DWI NUR ANGGRAENI' },
  { nisn: '0125990352', name: 'FADHILAH KHAERUNNISA' },
  { nisn: '0115445503', name: 'FILZAH RIZKIA RAMADHANI' },
  { nisn: '0123428941', name: 'FIOREN KHANZA FAISAL' },
  { nisn: '0114079763', name: 'IKRAM AL MUGHNI' },
  { nisn: '0125843587', name: 'INAYAH PUTRI' },
  { nisn: '0115397895', name: 'IZAN AFIF ADITYA' },
  { nisn: '0127851612', name: 'LA ODE MUHAMMAD AMIRUL HAMZAH' },
  { nisn: '0118377604', name: 'MUH. AKBAR PRATAMA' },
  { nisn: '0127211672', name: 'MUH. FAJRUL JANUARD' },
  { nisn: '0125915904', name: 'MUH. IRSYAD PRATAMA IRMAN' },
  { nisn: '3126061986', name: 'MUHAMMAD ALFIAN FADHILAN IRWAN' },
  { nisn: '0124346278', name: 'MUHAMMAD FAQIH TARIMANU AL-AHMAD' },
  { nisn: '0126426068', name: 'MUHAMMAD RAFFA SEHEREZAD' },
  { nisn: '3129770130', name: 'NASYA NURUL AQHILLA' },
  { nisn: '0124205302', name: 'NAYLA AZZAHRA' },
  { nisn: '0121524080', name: 'NAYLHA ALYA SYAHIRA AGUSTIN' },
  { nisn: '3114395697', name: 'RAFAH FURQON' },
  { nisn: '0127059514', name: 'SITI MAYMUN' },
  { nisn: '0129046702', name: 'UFAIRA SABILA MUTMAINNAH' },
  { nisn: '0127198270', name: 'YUSKHALIFAH ZAHWA AL HADI' },
];

const studentUsers: User[] = studentRoster.map((student, idx) => {
  const num = idx + 1;
  const padNum = num < 10 ? `0${num}` : `${num}`;
  return {
    id: `usr-siswa-${padNum}`,
    name: student.name,
    username: `siswa${padNum}`,
    password: 'kas12345',
    nisn: student.nisn,
    email: `siswa${padNum}@ixa.sch.id`,
    hasCustomPassword: false,
    phone: '-',
    role: 'anggota',
    avatar: avatarPool[idx % avatarPool.length],
    classId: 'cls-ix-a',
    className: 'IX. A CLASS',
    memberQrCode: `KASKU-IXA-S${padNum}`,
    status: 'aktif',
    createdAt: '2026-08-01',
    createdBy: 'Administrator',
  };
});

export const adminUser: User = {
  id: 'usr-1',
  name: 'Lampu Sui Anggraeni',
  username: 'admin',
  password: 'admin123',
  nisn: '0061234501',
  email: 'lampusuianggraeni@gmail.com',
  googleEmail: 'lampusuianggraeni@gmail.com',
  hasCustomPassword: true,
  phone: '081234567801',
  role: 'admin',
  avatar: avatarPool[0],
  classId: 'cls-ix-a',
  className: 'IX. A CLASS',
  memberQrCode: 'KASKU-IXA-ADM01',
  status: 'aktif',
  createdAt: '2026-08-01',
  createdBy: 'Sistem Pusat',
};

export const bendaharaMaita: User = {
  id: 'usr-bendahara-maita',
  name: 'ANDI MAITALIDIYANI M.',
  username: 'maita',
  password: 'admin123',
  nisn: '3124652885',
  email: 'maita.kas9a@gmail.com',
  googleEmail: 'maita.kas9a@gmail.com',
  hasCustomPassword: true,
  phone: '081234567802',
  role: 'bendahara',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  classId: 'cls-ix-a',
  className: 'IX. A CLASS',
  memberQrCode: 'KASKU-IXA-BND01',
  status: 'aktif',
  createdAt: '2026-08-01',
  createdBy: 'Sistem Pusat',
};

export const bendaharaFioren: User = {
  id: 'usr-bendahara-fioren',
  name: 'FIOREN KHANZA FAISAL',
  username: 'fioren',
  password: 'admin123',
  nisn: '0123428941',
  email: 'fioren.kas9a@gmail.com',
  googleEmail: 'fioren.kas9a@gmail.com',
  hasCustomPassword: true,
  phone: '081234567803',
  role: 'bendahara',
  avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  classId: 'cls-ix-a',
  className: 'IX. A CLASS',
  memberQrCode: 'KASKU-IXA-BND02',
  status: 'aktif',
  createdAt: '2026-08-01',
  createdBy: 'Sistem Pusat',
};

// Aliases for compatibility
export const adminMaita: User = bendaharaMaita;
export const adminFioren: User = bendaharaFioren;

export const initialUsers: User[] = [
  adminUser,
  bendaharaMaita,
  bendaharaFioren,
  ...studentUsers,
];

export const initialPayments: Payment[] = [];

export const initialExpenses: Expense[] = [];

export const initialNotifications: Notification[] = [];
