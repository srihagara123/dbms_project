import React, { useState, useEffect } from 'react';
import {
  Customer,
  BankAccount,
  Transaction,
  ToastMessage,
  NavigationTab,
  ActiveTab,
  PublicPage,
  UserRole,
  LoanApplication,
  SystemNotification,
} from './types/bank';
import {
  INITIAL_CUSTOMERS,
} from './data/mockData';

import API from './services/api';

import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Toast } from './components/Toast';
import { ActionModal } from './components/modals/ActionModal';

import { LandingView } from './components/views/LandingView';
import { AboutView } from './components/views/AboutView';
import { ContactView } from './components/views/ContactView';
import { LoginView } from './components/views/LoginView';
import { RegisterView } from './components/views/RegisterView';
import { DashboardView } from './components/views/DashboardView';
import { CustomersView } from './components/views/CustomersView';
import { AccountsView } from './components/views/AccountsView';
import { TransactionsView } from './components/views/TransactionsView';
import { NotificationModal } from './components/NotificationModal';
import { ProfileView } from './components/views/ProfileView';
import { SettingsView } from './components/views/SettingsView';
import { AccessDeniedView } from './components/views/AccessDeniedView';
import BranchManagementView from './components/views/BranchManagementView';
import ReportsAnalyticsView from './components/views/ReportsAnalyticsView';
import UserSystemAdminView from './components/views/UserSystemAdminView';
import ApexAdminDashboard from './components/views/ApexAdminDashboard';

import {
  BalanceOverviewView,
  AtomicTransferView,
  AccountStatementView,
} from './components/views/CustomerViews';
import { LoanStatusView } from './components/views/LoanStatusView';
import { AdminDashboardView } from './components/views/AdminViews';
import { LoanManagementView } from './components/views/ManagerViews';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [publicPage, setPublicPage] = useState<PublicPage>('landing');
  const [currentRole, setCurrentRole] = useState<UserRole>('customer');
  const [authRole, setAuthRole] = useState<UserRole>('customer');
  const [authEmail, setAuthEmail] = useState<string>('');
  const [theme, setTheme] = useState<string>(() => localStorage.getItem('apex_theme') || 'dark');

  useEffect(() => {
    const saved = localStorage.getItem('apex_theme') || 'dark';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
    document.body.setAttribute('data-theme', saved);
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('apex_theme', newTheme);
  };

  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loans, setLoans] = useState<LoanApplication[]>([]);

  const [currentUser, setCurrentUser] = useState<Customer>(INITIAL_CUSTOMERS[0]);

  // UNIQUE ACCOUNT ID GLOBAL STATE: Tracks the active account by unique ID
  const [globalAccountId, setGlobalAccountId] = useState<string>('');

  const [actionModal, setActionModal] = useState<{ isOpen: boolean; type: 'deposit' | 'withdraw' | 'transfer'; targetAccount?: BankAccount; }>({ isOpen: false, type: 'deposit' });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<SystemNotification[]>([
    {
      id: 'notif-1',
      title: 'PostgreSQL Database Connected',
      message: 'Core banking backend cluster operational on port 5432.',
      timestamp: 'Just now',
      type: 'success',
      category: 'Security',
      read: false,
    },
    {
      id: 'notif-2',
      title: 'Apex BMS Engine Active',
      message: 'Live session encryption established with INR currency standards.',
      timestamp: 'Just now',
      type: 'info',
      category: 'Security',
      read: false,
    },
  ]);

  const showToast = (title: string, description: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToasts((prev) => [...prev, { id: `toast-${Date.now()}-${Math.random()}`, title, description, type }]);
  };
  const removeToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const addNotification = (
    title: string,
    message: string,
    type: 'success' | 'warning' | 'error' | 'info' = 'info',
    category: string = 'General'
  ) => {
    const newNotif: SystemNotification = {
      id: `notif-${Date.now()}-${Math.random()}`,
      title,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type,
      category,
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // ==========================================
  // LIVE DATABASE SYNC
  // ==========================================
  const fetchData = async () => {
    try {
      let accRes = await API.get('/accounts');
      
      if (accRes.data && accRes.data.length === 0 && currentRole === 'customer') {
        try {
          await API.post('/accounts/create', { accountType: 'Savings', initialBalance: 0, branchId: 1 });
          accRes = await API.get('/accounts');
          showToast('Apex Bank Account Opened!', 'A default Savings account has been successfully initialized.', 'success');
          addNotification('Default Savings Account Initialized', 'A new default account has been opened in the database.', 'success', 'Account');
        } catch (err) { console.error("Auto-create error:", err); }
      }

      if (accRes.data) {
        setAccounts(accRes.data);
        // Automatically select the first account ID if none is active
        if (accRes.data.length > 0 && !globalAccountId) {
          setGlobalAccountId(accRes.data[0].id.toString());
        }
      }
      
      try {
        const txnRes = await API.get('/transactions');
        if (txnRes.data) setTransactions(txnRes.data);
      } catch(e) {}

      try {
        const loanRes = await API.get('/loans');
        if (loanRes.data) setLoans(loanRes.data);
      } catch(e) {}

      // FETCH LIVE CUSTOMERS / USERS
      try {
        const custRes = await API.get('/users'); 
        if (custRes.data) {
          setCustomers(custRes.data);
        }
      } catch (e) {
        console.error("Failed to fetch live customers:", e);
      }

    } catch (error) {
      console.error("Failed to fetch live data:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, currentUser, currentRole, currentTab]);

  // LIVE LOGIN
  const handleLoginSuccess = (userData: any, role: UserRole) => {
    setCurrentRole(role);

    const dbCustomer: Customer = {
      id: userData.id,
      name: userData.name,
      username: userData.name.replace(/\s+/g, '_').toLowerCase(),
      email: userData.email,
      phone: '', 
      address: '',
      accountNumber: '',
      accountType: 'Savings',
      branch: '',
      status: 'Verified',
      totalBalance: 0,
      creditScore: 800,
      joinedDate: new Date().toISOString().split('T')[0],
      role: role,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
    };

    setCurrentUser(dbCustomer);
    setIsAuthenticated(true);
    setCurrentTab(role === 'admin' ? 'admin_dashboard' : 'customer_dashboard');

    showToast('Session Authorized', `Authenticated as ${userData.name}.`, 'success');
    addNotification(
      'Login Successful',
      `Authenticated as ${userData.name} with role ${role.toUpperCase()} at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}.`,
      'success',
      'Security'
    );
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPublicPage('landing');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAccounts([]);
    setTransactions([]);
    setLoans([]);
    setGlobalAccountId('');
    showToast('Logged Out', 'You have been securely signed out.', 'info');
  };

  const handleActionSubmit = async (data: { type: 'deposit' | 'withdraw' | 'transfer'; accountId: string; amount: number; receiverName?: string; receiverIban?: string; }) => {
    try {
      await API.post('/transactions/process', data);
      
      const accRes = await API.get('/accounts');
      if (accRes.data) setAccounts(accRes.data);

      const txnRes = await API.get('/transactions');
      if (txnRes.data) setTransactions(txnRes.data);

      const txnType = data.type === 'deposit' ? 'Deposit' : data.type === 'withdraw' ? 'Transfer' : 'Transfer';
      showToast('Transaction Completed', `${txnType} of ₹${data.amount.toLocaleString('en-IN')} processed successfully.`, 'success');
      addNotification(
        'Transaction Executed',
        `${txnType} of ₹${data.amount.toLocaleString('en-IN')} processed successfully at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}.`,
        'success',
        'General'
      );
      setActionModal({ isOpen: false, type: 'deposit' });
    } catch (err: any) {
      showToast('Transaction Failed', err.response?.data?.error || 'Transaction failed.', 'error');
    }
  };

  const handleApplyLoan = async (newLoanData: Partial<LoanApplication>) => {
    try {
      await API.post('/loans/apply', newLoanData);
      const loanRes = await API.get('/loans');
      if (loanRes.data) setLoans(loanRes.data);
      showToast('Application Submitted', 'Your loan application has been submitted successfully!', 'success');
      addNotification(
        'Loan Applied',
        `Loan application for ₹${Number(newLoanData.amount || 0).toLocaleString('en-IN')} submitted for administrative review.`,
        'info',
        'General'
      );
    } catch (error) {
      showToast('Application Error', 'Failed to submit loan application.', 'error');
    }
  };

  const handleUpdateLoanStatus = async (loanId: string, status: 'Approved' | 'Rejected', reason?: string) => {
    try {
      await API.patch(`/loans/${loanId}/status`, { status, reason });
      const loanRes = await API.get('/loans');
      if (loanRes.data) setLoans(loanRes.data);
      showToast('Status Updated', `Loan status has been successfully updated to ${status}.`, 'success');
      addNotification(
        'Loan Underwriting Decision',
        `Loan #${loanId} was ${status.toLowerCase()} by bank administration at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}.`,
        status === 'Approved' ? 'success' : 'warning',
        'General'
      );
    } catch (error) {
      showToast('Update Error', 'Failed to update loan status.', 'error');
    }
  };

  const handleUpdateCustomer = (updated: Customer) => {
    setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    if (currentUser.id === updated.id) setCurrentUser(updated);
  };

  const isTabAllowed = (role: UserRole, tab: string): boolean => {
    const customerTabs = ['customer_dashboard', 'dashboard', 'my_accounts', 'accounts', 'balance_overview', 'money_transfer', 'transaction_history', 'transactions', 'account_statement', 'loan_status', 'profile', 'settings'];
    const adminTabs = ['admin_dashboard', 'customer_management', 'account_management', 'transaction_management', 'loan_management', 'branch_management', 'reports_analytics', 'user_system_admin', 'user_management', 'role_management', 'audit_logs', 'database_health', 'database_backup', 'profile', 'settings'];
    return (role === 'admin' ? adminTabs : customerTabs).includes(tab);
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-[#0B0B0B] min-h-screen text-white font-sans">
        {publicPage === 'landing' && <LandingView onNavigateLogin={() => setPublicPage('login')} onNavigatePage={setPublicPage} />}
        {publicPage === 'about' && <AboutView onNavigateLogin={() => setPublicPage('login')} onNavigatePage={setPublicPage} />}
        {publicPage === 'contact' && <ContactView onNavigateLogin={() => setPublicPage('login')} onNavigatePage={setPublicPage} />}
        {publicPage === 'login' && (
          <LoginView
            onLoginSuccess={handleLoginSuccess}
            onNavigateRegister={(role) => {
              setAuthRole(role);
              setPublicPage('register');
            }}
            onNavigateLanding={() => setPublicPage('landing')}
            initialRole={authRole}
            prefilledEmail={authEmail}
          />
        )}
        {publicPage === 'register' && (
          <RegisterView
            onRegisterSuccess={(role, email) => {
              setAuthRole(role);
              setAuthEmail(email);
              setPublicPage('login');
              showToast(
                'Registration Successful',
                `Created ${role === 'admin' ? 'Bank Admin' : 'Customer'} account. Please sign in below.`,
                'success'
              );
            }}
            onNavigateLogin={(role, email) => {
              if (role) setAuthRole(role);
              if (email) setAuthEmail(email);
              setPublicPage('login');
            }}
            onNavigateLanding={() => setPublicPage('landing')}
            initialRole={authRole}
          />
        )}
        <Toast toasts={toasts} onDismiss={removeToast} />
      </div>
    );
  }

  const activeAccountObj = accounts.find((a) => a.id.toString() === globalAccountId) || accounts[0];

  return (
    <div data-theme={theme} className={`flex h-screen font-sans overflow-hidden ${theme === 'soft' ? 'bg-[#FAF7F2] text-[#2D2926]' : theme === 'shiny' ? 'bg-[#0a0316] text-white' : 'bg-[#0B0B0B] text-white'}`}>
      <Sidebar currentRole={currentRole} currentTab={currentTab as ActiveTab} onSelectTab={(tab) => setCurrentTab(tab as NavigationTab)} collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header currentRole={currentRole} currentUser={currentUser} unreadNotifCount={notifications.filter((n) => !n.read).length} activeTabLabel={currentTab.replace(/_/g, ' ')} onOpenNotifications={() => setIsNotifDrawerOpen(true)} onOpenQuickAction={(action) => setActionModal({ isOpen: true, type: action })} onSelectTab={setCurrentTab} onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {!isTabAllowed(currentRole, currentTab) ? (
            <AccessDeniedView currentRole={currentRole} attemptedTab={currentTab} onGoDashboard={() => { setCurrentTab(currentRole === 'admin' ? 'admin_dashboard' : 'customer_dashboard'); }} />
          ) : (
            <>
              {(currentTab === 'dashboard' || currentTab === 'customer_dashboard') && currentRole === 'customer' && <DashboardView currentUser={currentUser} accounts={accounts} transactions={transactions} globalAccountId={globalAccountId} setGlobalAccountId={setGlobalAccountId} onOpenActionModal={(action) => setActionModal({ isOpen: true, type: action })} onSelectTab={setCurrentTab} />}
              
              {(currentTab === 'my_accounts' || currentTab === 'accounts') && <AccountsView accounts={accounts} transactions={transactions} globalAccountId={globalAccountId} setGlobalAccountId={setGlobalAccountId} onAccountCreated={fetchData} onOpenActionModal={(action, acc) => setActionModal({ isOpen: true, type: action, targetAccount: acc }) } isAdmin={false} />}
              
              {currentTab === 'balance_overview' && <BalanceOverviewView accounts={accounts} currentUser={currentUser} globalAccountId={globalAccountId} setGlobalAccountId={setGlobalAccountId} />}
              
              {currentTab === 'money_transfer' && <AtomicTransferView accounts={accounts} currentUser={currentUser} onShowToast={showToast} globalAccountId={globalAccountId} setGlobalAccountId={setGlobalAccountId} />}
              
              {(currentTab === 'transaction_history' || currentTab === 'transactions') && <TransactionsView transactions={transactions} onShowToast={showToast} />}
              
              {currentTab === 'account_statement' && <AccountStatementView accounts={accounts} transactions={transactions} currentUser={currentUser} onShowToast={showToast} globalAccountId={globalAccountId} setGlobalAccountId={setGlobalAccountId} />}
              
              {currentTab === 'loan_status' && <LoanStatusView loans={loans} currentUser={currentUser} onShowToast={showToast} onApplyLoan={handleApplyLoan} onRefreshLoans={fetchData} />}
              {currentTab === 'profile' && <ProfileView currentUser={currentUser} onUpdateProfile={handleUpdateCustomer} onShowToast={showToast} />}
              {currentTab === 'settings' && (
                <SettingsView
                  currentUser={currentUser}
                  currentRole={currentRole}
                  onShowToast={showToast}
                  onSelectTab={(tab) => setCurrentTab(tab as NavigationTab)}
                  onUpdateUser={handleUpdateCustomer}
                  onLogout={handleLogout}
                  addNotification={addNotification}
                  onThemeChange={handleThemeChange}
                />
              )}
              
              {currentRole === 'admin' && currentTab === 'admin_dashboard' && <ApexAdminDashboard customers={customers} accounts={accounts} transactions={transactions} loans={loans} onShowToast={showToast} onSelectTab={(tab) => setCurrentTab(tab as NavigationTab)} />}
              {currentRole === 'admin' && currentTab === 'customer_management' && <CustomersView customers={customers} accounts={accounts} onRefreshAccounts={fetchData} onUpdateCustomer={handleUpdateCustomer} onShowToast={showToast} />}
              {currentRole === 'admin' && currentTab === 'account_management' && <AccountsView accounts={accounts} transactions={transactions} onAccountCreated={fetchData} onOpenActionModal={(action, account) => setActionModal({ isOpen: true, type: action, targetAccount: account }) } isAdmin={true} />}
              {currentRole === 'admin' && currentTab === 'transaction_management' && <TransactionsView transactions={transactions} onShowToast={showToast} />}
              {currentRole === 'admin' && currentTab === 'loan_management' && <LoanManagementView loans={loans} onShowToast={showToast} onUpdateLoanStatus={handleUpdateLoanStatus} />}
              {currentRole === 'admin' && currentTab === 'branch_management' && <BranchManagementView />}
              {currentRole === 'admin' && currentTab === 'reports_analytics' && <ReportsAnalyticsView transactions={transactions} accounts={accounts} />}
              {currentRole === 'admin' && currentTab === 'user_system_admin' && <UserSystemAdminView />}
              {currentRole === 'admin' && currentTab === 'user_management' && <UserSystemAdminView />}
              {currentRole === 'admin' && currentTab === 'role_management' && <UserSystemAdminView />}
              {currentRole === 'admin' && currentTab === 'audit_logs' && <AdminDashboardView currentTab={currentTab} onShowToast={showToast} />}
              {currentRole === 'admin' && currentTab === 'database_health' && <AdminDashboardView currentTab={currentTab} onShowToast={showToast} />}
              {currentRole === 'admin' && currentTab === 'database_backup' && <AdminDashboardView currentTab={currentTab} onShowToast={showToast} />}
            </>
          )}
        </main>
      </div>

      {actionModal.isOpen && <ActionModal type={actionModal.type} accounts={accounts} initialAccount={actionModal.targetAccount || activeAccountObj} onClose={() => setActionModal({ isOpen: false, type: 'deposit' })} onSubmit={handleActionSubmit} />}
      <NotificationModal
        isOpen={isNotifDrawerOpen}
        onClose={() => setIsNotifDrawerOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
        onToggleRead={(id) => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: !n.read } : n))}
      />
      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

export default App;