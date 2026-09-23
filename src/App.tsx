import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { HeaderNav } from './components/HeaderNav';
import { MemberDashboard } from './components/MemberDashboard';
import { PaymentModal, PaymentDurationOption } from './components/PaymentModal';
import { PaymentHistoryView } from './components/PaymentHistoryView';
import { TreasurerDashboard } from './components/TreasurerDashboard';
import { ExpensesManager } from './components/ExpensesManager';
import { FinancialReportView } from './components/FinancialReportView';
import { AdminDashboard } from './components/AdminDashboard';
import { MemberQrModal } from './components/MemberQrModal';
import { UserProfileModal } from './components/UserProfileModal';
import { AccessDeniedBanner } from './components/AccessDeniedBanner';
import { LoginScreen } from './components/LoginScreen';
import { Home, CreditCard, History, FileText, PlusCircle, Settings, QrCode, Coins, User } from 'lucide-react';

function AppContent() {
  const { currentUser, isAuthenticated } = useApp();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isPayModalOpen, setIsPayModalOpen] = useState<boolean>(false);
  const [payModalOption, setPayModalOption] = useState<PaymentDurationOption>('nominal_1000');
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  React.useEffect(() => {
    if (activeTab === 'bayar_1000') {
      setPayModalOption('nominal_1000');
      setIsPayModalOpen(true);
      setActiveTab('dashboard');
    } else if (activeTab === 'bayar') {
      setPayModalOption('1_minggu');
      setIsPayModalOpen(true);
      setActiveTab('dashboard');
    } else if (activeTab === 'profil') {
      setIsProfileModalOpen(true);
      setActiveTab('dashboard');
    }
  }, [activeTab]);

  // If not authenticated, render Login Screen
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const isTreasurerOrAdmin = currentUser.role === 'bendahara' || currentUser.role === 'admin';
  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-[#1E293B] font-sans flex flex-col pb-20 md:pb-8">
      {/* Top Header */}
      <HeaderNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQrModal={() => setIsQrModalOpen(true)}
        onOpenPayModal={(opt = 'nominal_1000') => {
          setPayModalOption(opt);
          setIsPayModalOpen(true);
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Render Tab based on activeTab & user role */}
        {activeTab === 'dashboard' && (
          currentUser.role === 'bendahara' ? (
            <TreasurerDashboard setActiveTab={setActiveTab} />
          ) : currentUser.role === 'admin' ? (
            <AdminDashboard />
          ) : (
            <MemberDashboard
              onOpenPayModal={(opt = 'nominal_1000') => {
                setPayModalOption(opt);
                setIsPayModalOpen(true);
              }}
              setActiveTab={setActiveTab}
              onOpenQrModal={() => setIsQrModalOpen(true)}
            />
          )
        )}

        {activeTab === 'riwayat' && <PaymentHistoryView />}

        {activeTab === 'pembayaran' && (
          isTreasurerOrAdmin ? (
            <TreasurerDashboard setActiveTab={setActiveTab} />
          ) : (
            <AccessDeniedBanner requiredRole="Bendahara" setActiveTab={setActiveTab} />
          )
        )}

        {activeTab === 'pengeluaran' && (
          isTreasurerOrAdmin ? (
            <ExpensesManager />
          ) : (
            <AccessDeniedBanner requiredRole="Bendahara" setActiveTab={setActiveTab} />
          )
        )}

        {activeTab === 'laporan' && <FinancialReportView setActiveTab={setActiveTab} />}

        {activeTab === 'admin' && (
          isAdmin ? (
            <AdminDashboard />
          ) : (
            <AccessDeniedBanner requiredRole="Admin Sistem" setActiveTab={setActiveTab} />
          )
        )}
      </main>

      {/* Global Modals */}
      <PaymentModal
        isOpen={isPayModalOpen}
        defaultOption={payModalOption}
        onClose={() => setIsPayModalOpen(false)}
        onSuccess={() => {
          setIsPayModalOpen(false);
          setActiveTab('riwayat');
        }}
      />

      <MemberQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
      />

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 px-3 py-2 flex items-center justify-around shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center space-y-0.5 text-[10px] font-black uppercase tracking-wider ${
            activeTab === 'dashboard' ? 'text-[#2563EB]' : 'text-slate-400'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Beranda</span>
        </button>

        {currentUser.role === 'anggota' && (
          <>
            <button
              onClick={() => {
                setPayModalOption('nominal_1000');
                setIsPayModalOpen(true);
              }}
              className="flex flex-col items-center space-y-0.5 text-[10px] font-black uppercase tracking-wider text-amber-600 cursor-pointer"
            >
              <div className="p-2 bg-amber-400 text-slate-950 rounded-full shadow-md">
                <Coins className="w-4 h-4" />
              </div>
              <span>Rp 1.000</span>
            </button>

            <button
              onClick={() => {
                setPayModalOption('1_minggu');
                setIsPayModalOpen(true);
              }}
              className="flex flex-col items-center space-y-0.5 text-[10px] font-black uppercase tracking-wider text-[#2563EB] cursor-pointer"
            >
              <div className="p-2.5 bg-[#2563EB] text-white rounded-full shadow-lg -mt-4 border-2 border-white">
                <CreditCard className="w-5 h-5" />
              </div>
              <span>Bayar</span>
            </button>

            <button
              onClick={() => setActiveTab('riwayat')}
              className={`flex flex-col items-center space-y-0.5 text-[10px] font-black uppercase tracking-wider ${
                activeTab === 'riwayat' ? 'text-[#2563EB]' : 'text-slate-400'
              }`}
            >
              <History className="w-5 h-5" />
              <span>Riwayat</span>
            </button>
          </>
        )}

        {(currentUser.role === 'bendahara' || currentUser.role === 'admin') && (
          <>
            <button
              onClick={() => setActiveTab('pembayaran')}
              className={`flex flex-col items-center space-y-0.5 text-[10px] font-black uppercase tracking-wider ${
                activeTab === 'pembayaran' ? 'text-[#2563EB]' : 'text-slate-400'
              }`}
            >
              <CreditCard className="w-5 h-5" />
              <span>Kas Siswa</span>
            </button>

            <button
              onClick={() => setActiveTab('pengeluaran')}
              className={`flex flex-col items-center space-y-0.5 text-[10px] font-black uppercase tracking-wider ${
                activeTab === 'pengeluaran' ? 'text-[#2563EB]' : 'text-slate-400'
              }`}
            >
              <PlusCircle className="w-5 h-5" />
              <span>Keluar</span>
            </button>
          </>
        )}

        <button
          onClick={() => setActiveTab('laporan')}
          className={`flex flex-col items-center space-y-0.5 text-[10px] font-black uppercase tracking-wider ${
            activeTab === 'laporan' ? 'text-[#2563EB]' : 'text-slate-400'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span>Laporan</span>
        </button>

        {/* Profil Mobile Bottom Button */}
        <button
          onClick={() => setIsProfileModalOpen(true)}
          className="flex flex-col items-center space-y-0.5 text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-[#2563EB] cursor-pointer"
        >
          <div className="w-5 h-5 rounded-full overflow-hidden border border-slate-300">
            <img 
              src={currentUser.avatar} 
              alt="Profil" 
              className="w-full h-full object-cover"
            />
          </div>
          <span>Profil</span>
        </button>
      </div>

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
