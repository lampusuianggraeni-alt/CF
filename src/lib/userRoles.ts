import { User } from '../types';

export interface TreasurerInfo {
  isTreasurer: boolean;
  treasurerNumber: 1 | 2 | null;
  shortLabel: string; // 'Bendahara 1' | 'Bendahara 2' | 'Bendahara Kelas' | 'Admin' | 'Anggota'
  fullLabel: string; // 'Bendahara 1: ANDI MAITALIDIYANI M. (Maita)'
  senderTitle: string; // 'Bendahara 1 (ANDI MAITALIDIYANI M.)'
  callName: string; // 'Maita' | 'Fioren'
  colorBadgeClass: string;
  themeColor: 'indigo' | 'teal' | 'blue' | 'purple';
  partnerName?: string;
  partnerRole?: string;
  partnerUsername?: string;
}

export function getTreasurerInfo(user?: Partial<User> | null): TreasurerInfo {
  if (!user) {
    return {
      isTreasurer: false,
      treasurerNumber: null,
      shortLabel: 'Tamu',
      fullLabel: 'Tamu',
      senderTitle: 'Sistem',
      callName: 'Tamu',
      colorBadgeClass: 'bg-slate-100 text-slate-700 border border-slate-200',
      themeColor: 'blue',
    };
  }

  const id = (user.id || '').toLowerCase();
  const nisn = (user.nisn || '').trim();
  const username = (user.username || '').toLowerCase().trim();
  const name = (user.name || '').toLowerCase();

  const isMaita =
    id.includes('maita') ||
    username === 'maita' ||
    nisn === '3124652885' ||
    name.includes('maita') ||
    name.includes('maitalidiyani');

  const isFioren =
    id.includes('fioren') ||
    username === 'fioren' ||
    nisn === '0123428941' ||
    name.includes('fioren');

  if (isMaita) {
    return {
      isTreasurer: true,
      treasurerNumber: 1,
      shortLabel: 'Bendahara 1',
      fullLabel: 'Bendahara 1: ANDI MAITALIDIYANI M. (Maita)',
      senderTitle: 'Bendahara 1 (ANDI MAITALIDIYANI M.)',
      callName: 'Maita',
      colorBadgeClass: 'bg-indigo-100 text-indigo-800 border border-indigo-300 font-black',
      themeColor: 'indigo',
      partnerName: 'FIOREN KHANZA FAISAL',
      partnerRole: 'Bendahara 2',
      partnerUsername: 'fioren',
    };
  }

  if (isFioren) {
    return {
      isTreasurer: true,
      treasurerNumber: 2,
      shortLabel: 'Bendahara 2',
      fullLabel: 'Bendahara 2: FIOREN KHANZA FAISAL (Fioren)',
      senderTitle: 'Bendahara 2 (FIOREN KHANZA FAISAL)',
      callName: 'Fioren',
      colorBadgeClass: 'bg-teal-100 text-teal-800 border border-teal-300 font-black',
      themeColor: 'teal',
      partnerName: 'ANDI MAITALIDIYANI M.',
      partnerRole: 'Bendahara 1',
      partnerUsername: 'maita',
    };
  }

  if (user.role === 'bendahara') {
    return {
      isTreasurer: true,
      treasurerNumber: 1,
      shortLabel: 'Bendahara Kelas',
      fullLabel: `Bendahara Kelas: ${user.name || 'Bendahara'}`,
      senderTitle: `Bendahara Kelas (${user.name || 'Bendahara'})`,
      callName: user.name || 'Bendahara',
      colorBadgeClass: 'bg-blue-100 text-blue-800 border border-blue-300 font-black',
      themeColor: 'blue',
      partnerName: 'Fioren / Maita',
      partnerRole: 'Rekan Bendahara',
      partnerUsername: 'fioren',
    };
  }

  if (user.role === 'admin') {
    return {
      isTreasurer: false,
      treasurerNumber: null,
      shortLabel: 'Administrator',
      fullLabel: `Administrator: ${user.name || 'Admin'}`,
      senderTitle: `Admin (${user.name || 'Lampu Sui Anggraeni'})`,
      callName: user.name || 'Admin',
      colorBadgeClass: 'bg-purple-100 text-purple-800 border border-purple-300 font-black',
      themeColor: 'purple',
    };
  }

  return {
    isTreasurer: false,
    treasurerNumber: null,
    shortLabel: 'Anggota Siswa',
    fullLabel: `Siswa: ${user.name || 'Siswa'}`,
    senderTitle: `Siswa (${user.name || 'Siswa'})`,
    callName: user.name || 'Siswa',
    colorBadgeClass: 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-black',
    themeColor: 'blue',
  };
}
