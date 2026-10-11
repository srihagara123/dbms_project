import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Bell,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Moon,
  Monitor,
  Palette,
  RotateCcw,
  Save,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Sun,
  UserRound,
  Users,
  FileClock,
  ServerCog,
  Download,
  KeyRound,
  LogOut,
  Send,
  Edit3,
  CreditCard,
  ArrowRight,
  Landmark,
  FileSpreadsheet,
  Sparkles,
} from 'lucide-react';
import { Customer, NavigationTab, UserRole } from '../../types/bank';
import API from '../../services/api';

interface SettingsViewProps {
  currentUser: Customer;
  currentRole?: UserRole;
  onShowToast: (
    title: string,
    desc: string,
    type: 'success' | 'error' | 'warning' | 'info'
  ) => void;
  onSelectTab?: (tab: NavigationTab) => void;
  onUpdateUser?: (updated: Customer) => void;
  onLogout?: () => void;
  addNotification?: (
    title: string,
    message: string,
    type?: 'success' | 'warning' | 'error' | 'info',
    category?: string
  ) => void;
  onThemeChange?: (theme: ThemePreference) => void;
}

type ThemePreference = 'dark' | 'soft' | 'shiny';
type SettingsTab =
  | 'overview'
  | 'general'
  | 'notifications'
  | 'privacy'
  | 'security'
  | 'system'
  | 'adminAlerts';

interface Preferences {
  theme: ThemePreference;
  transactionAlerts: boolean;
  transferAlerts: boolean;
  loginAlerts: boolean;
  securityAlerts: boolean;
  accountUpdates: boolean;
  promotionalEmails: boolean;
  emailNotifications: boolean;
  maskAccountNumbers: boolean;
  hideBalances: boolean;
  compactTables: boolean;
  autoLockNotice: boolean;
  failedTransactionAlerts: boolean;
  roleChangeAlerts: boolean;
  systemHealthAlerts: boolean;
  auditAlerts: boolean;
  twoFactorAuth: boolean;
  highValueThreshold: number;
  autoRefreshInterval: string;
}

const DEFAULT_PREFERENCES: Preferences = {
  theme: 'dark',
  transactionAlerts: true,
  transferAlerts: true,
  loginAlerts: true,
  securityAlerts: true,
  accountUpdates: true,
  promotionalEmails: false,
  emailNotifications: true,
  maskAccountNumbers: true,
  hideBalances: false,
  compactTables: false,
  autoLockNotice: true,
  failedTransactionAlerts: true,
  roleChangeAlerts: true,
  systemHealthAlerts: true,
  auditAlerts: true,
  twoFactorAuth: false,
  highValueThreshold: 50000,
  autoRefreshInterval: 'immediate',
};

const settingsKey = (userId: string, isAdmin: boolean) =>
  `apex-bank-settings-${isAdmin ? 'admin' : 'customer'}-${userId}`;

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  currentRole,
  onShowToast,
  onSelectTab,
  onUpdateUser,
  onLogout,
  addNotification,
  onThemeChange,
}) => {
  const isAdmin = currentRole
    ? currentRole === 'admin'
    : String((currentUser as any).role ?? '').toLowerCase() === 'admin';

  const [activeTab, setActiveTab] = useState<SettingsTab>(isAdmin ? 'overview' : 'overview');
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [savedPreferences, setSavedPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(currentUser.name || '');
  const [profilePhone, setProfilePhone] = useState(currentUser.phone || '');
  const [profileAddress, setProfileAddress] = useState(currentUser.address || '');
  const [profileCity, setProfileCity] = useState((currentUser as any).city || 'Mumbai');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password Update State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setActiveTab('overview');
    let loaded = DEFAULT_PREFERENCES;
    try {
      const stored = localStorage.getItem(settingsKey(String(currentUser.id), isAdmin));
      if (stored) loaded = { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
      const globalTheme = localStorage.getItem('apex_theme') as ThemePreference;
      if (globalTheme) loaded.theme = globalTheme;
    } catch {
      loaded = DEFAULT_PREFERENCES;
    }
    setPreferences(loaded);
    setSavedPreferences(loaded);
    document.documentElement.setAttribute('data-theme', loaded.theme);
    document.body.setAttribute('data-theme', loaded.theme);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setProfileName(currentUser.name || '');
    setProfilePhone(currentUser.phone || '');
    setProfileAddress(currentUser.address || '');
  }, [currentUser.id, isAdmin]);

  const hasUnsavedChanges = JSON.stringify(preferences) !== JSON.stringify(savedPreferences);

  const updatePreference = <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
    setPreferences((previous) => {
      const next = { ...previous, [key]: value };
      if (key === 'maskAccountNumbers') {
        localStorage.setItem('apex_mask_accounts', String(value));
      }
      if (key === 'hideBalances') {
        localStorage.setItem('apex_hide_balances', String(value));
      }
      if (key === 'theme') {
        localStorage.setItem('apex_theme', String(value));
        document.documentElement.setAttribute('data-theme', String(value));
        document.body.setAttribute('data-theme', String(value));
        if (onThemeChange) {
          onThemeChange(value as ThemePreference);
        }
      }
      return next;
    });
  };

  const handleThemeSelect = (themeType: ThemePreference) => {
    updatePreference('theme', themeType);
    document.documentElement.setAttribute('data-theme', themeType);
    document.body.setAttribute('data-theme', themeType);
    localStorage.setItem('apex_theme', themeType);
    if (onThemeChange) {
      onThemeChange(themeType);
    }
    const themeLabels: Record<ThemePreference, string> = {
      dark: 'Dark Cobalt (Black & Blue)',
      soft: 'Soft Warm Elegance (Peach & Beige)',
      shiny: 'Royal Amethyst Glass (Deep Violet & Crystal Platinum)',
    };
    onShowToast(
      'Theme Activated',
      `Switched interface to ${themeLabels[themeType]} mode.`,
      'success'
    );
  };

  const savePreferences = () => {
    setSaving(true);
    try {
      localStorage.setItem(settingsKey(String(currentUser.id), isAdmin), JSON.stringify(preferences));
      localStorage.setItem('apex_mask_accounts', String(preferences.maskAccountNumbers));
      localStorage.setItem('apex_hide_balances', String(preferences.hideBalances));
      localStorage.setItem('apex_theme', String(preferences.theme));
      setSavedPreferences(preferences);
      onShowToast('Settings saved', 'Your preferences have been saved successfully.', 'success');
    } catch {
      onShowToast('Could not save settings', 'Unable to persist preferences in browser storage.', 'error');
    } finally {
      window.setTimeout(() => setSaving(false), 250);
    }
  };

  const resetPreferences = () => {
    setPreferences(DEFAULT_PREFERENCES);
    try {
      localStorage.setItem(settingsKey(String(currentUser.id), isAdmin), JSON.stringify(DEFAULT_PREFERENCES));
      setSavedPreferences(DEFAULT_PREFERENCES);
      onShowToast('Preferences reset', 'Default settings have been restored.', 'info');
    } catch {
      onShowToast('Reset not saved', 'Defaults applied for this session.', 'warning');
    }
  };

  // REAL PASSWORD CHANGE HANDLER CONNECTED TO BACKEND
  const handlePasswordUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentPassword.trim()) {
      return onShowToast('Current password required', 'Please enter your current account password.', 'error');
    }
    if (newPassword.length < 6) {
      return onShowToast('Password too short', 'New password must contain at least 6 characters.', 'error');
    }
    if (newPassword !== confirmPassword) {
      return onShowToast('Passwords do not match', 'Confirmation password does not match new password.', 'error');
    }

    setIsChangingPassword(true);
    try {
      await API.post('/auth/change-password', {
        userId: currentUser.id,
        email: currentUser.email,
        currentPassword: currentPassword,
        newPassword: newPassword,
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onShowToast(
        'Password Updated Successfully',
        'Your password has been changed in the PostgreSQL database. Use it for your next login.',
        'success'
      );
      if (addNotification) {
        addNotification(
          'Security Credential Updated',
          `Password for account ${currentUser.email} was successfully changed at ${new Date().toLocaleTimeString()}.`,
          'success',
          'Security'
        );
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to change password. Please verify current password.';
      onShowToast('Password Update Failed', errorMsg, 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // REAL PROFILE UPDATE HANDLER CONNECTED TO BACKEND
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);

    try {
      const res = await API.put('/auth/profile', {
        userId: currentUser.id,
        email: currentUser.email,
        name: profileName,
        phone: profilePhone,
        address: profileAddress,
        city: profileCity,
      });

      const updatedData: Customer = {
        ...currentUser,
        name: profileName,
        phone: profilePhone,
        address: profileAddress,
      };

      if (onUpdateUser) {
        onUpdateUser(updatedData);
      }

      setIsEditingProfile(false);
      onShowToast(
        'Profile Updated',
        'Account profile details have been saved to PostgreSQL.',
        'success'
      );
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to update profile details.';
      onShowToast('Update Failed', errorMsg, 'error');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // INTERACTIVE TEST ALERT DISPATCHER
  const handleTestNotification = () => {
    const title = isAdmin ? 'Admin Security Alert Test' : 'Customer Account Alert Test';
    const message = isAdmin
      ? `Real-time monitoring engine active. Timestamp: ${new Date().toLocaleTimeString()} (PostgreSQL Core Operational).`
      : `Test alert: Your account has transaction & balance alert notifications enabled.`;

    if (addNotification) {
      addNotification(title, message, 'info', 'System');
    }
    onShowToast('Alert Dispatched', 'A live test notification was sent to your notification drawer.', 'info');
  };

  // EXPORT ACCOUNT DATA FOR CUSTOMER
  const handleExportData = () => {
    const dataToExport = {
      user: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone,
        address: currentUser.address,
        accountNumber: currentUser.accountNumber,
        accountType: currentUser.accountType,
        totalBalance: currentUser.totalBalance,
        joinedDate: currentUser.joinedDate,
      },
      exportedAt: new Date().toISOString(),
      bank: 'Apex Relational Bank Management System',
      currency: 'INR (₹)',
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `apex-bank-account-${currentUser.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
    onShowToast('Data Exported', 'Your account data summary has been downloaded as JSON.', 'success');
  };

  const tabs = useMemo(() => {
    if (isAdmin) {
      return [
        {
          id: 'overview' as const,
          label: 'Admin Overview',
          description: 'Profile & Operational Hub',
          icon: <UserRound className="h-4 w-4" />,
        },
        {
          id: 'system' as const,
          label: 'System Preferences',
          description: 'Data display & Governance',
          icon: <ServerCog className="h-4 w-4" />,
        },
        {
          id: 'adminAlerts' as const,
          label: 'Admin Alerts',
          description: 'Operational Subscriptions',
          icon: <ShieldAlert className="h-4 w-4" />,
        },
        {
          id: 'security' as const,
          label: 'Security & Auth',
          description: 'Password & Session Access',
          icon: <ShieldCheck className="h-4 w-4" />,
        },
        {
          id: 'general' as const,
          label: 'Appearance',
          description: 'Theme & Density Styles',
          icon: <Palette className="h-4 w-4" />,
        },
      ];
    } else {
      return [
        {
          id: 'overview' as const,
          label: 'Account Overview',
          description: 'Personal Profile Details',
          icon: <UserRound className="h-4 w-4" />,
        },
        {
          id: 'notifications' as const,
          label: 'Notifications',
          description: 'Transaction & Balance Alerts',
          icon: <Bell className="h-4 w-4" />,
        },
        {
          id: 'privacy' as const,
          label: 'Privacy & Data',
          description: 'Masking & Statements',
          icon: <Eye className="h-4 w-4" />,
        },
        {
          id: 'security' as const,
          label: 'Security & Password',
          description: 'Credentials & Sessions',
          icon: <ShieldCheck className="h-4 w-4" />,
        },
        {
          id: 'general' as const,
          label: 'Appearance',
          description: 'Theme & Interface Styles',
          icon: <Palette className="h-4 w-4" />,
        },
      ];
    }
  }, [isAdmin]);

  return (
    <div className="space-y-6 font-sans text-white">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
            {isAdmin ? <ShieldCheck className="h-4 w-4 text-purple-400" /> : <SlidersHorizontal className="h-4 w-4 text-blue-400" />}
            {isAdmin ? 'Bank Administrator Control Centre' : 'Customer Account Control Centre'}
          </div>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
            {isAdmin ? 'System Settings & Control' : 'Account Settings & Preferences'}
          </h1>
          <p className="mt-1 max-w-2xl text-xs sm:text-sm text-slate-400">
            {isAdmin
              ? 'Configure administrative parameters, live PostgreSQL operations, operational alert subscriptions, and security credentials.'
              : 'Manage your personal banking preferences, update contact info, configure transaction alerts, and manage passwords.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
              hasUnsavedChanges
                ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                hasUnsavedChanges ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
            />
            {hasUnsavedChanges ? 'Unsaved changes' : 'All changes saved'}
          </span>
          <button
            type="button"
            onClick={resetPreferences}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset defaults
          </button>
          <button
            type="button"
            onClick={savePreferences}
            disabled={!hasUnsavedChanges || saving}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 glow-primary"
          >
            <Save className="h-3.5 w-3.5" /> {saving ? 'Saving...' : 'Save settings'}
          </button>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        {/* Navigation Sidebar */}
        <aside className="h-fit rounded-2xl border border-slate-800 bg-[#151515] p-3 shadow-xl">
          <div className="px-3 pb-3 pt-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
              {isAdmin ? 'Administrator Settings' : 'Customer Settings'}
            </p>
          </div>
          <nav className="space-y-1.5" aria-label="Settings sections">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                    isActive
                      ? isAdmin
                        ? 'border border-purple-500/30 bg-purple-600/15 text-white'
                        : 'border border-blue-500/30 bg-blue-600/15 text-white'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span
                    className={`rounded-lg p-2 ${
                      isActive
                        ? isAdmin
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                          : 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {tab.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-bold">{tab.label}</span>
                    <span className="mt-0.5 block text-[10px] text-slate-500 truncate">
                      {tab.description}
                    </span>
                  </span>
                  <ChevronRight
                    className={`h-4 w-4 ${
                      isActive ? (isAdmin ? 'text-purple-400' : 'text-blue-400') : 'text-slate-600'
                    }`}
                  />
                </button>
              );
            })}
          </nav>

          <div className="mt-4 rounded-xl border border-slate-800 bg-[#0B0B0B] p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-xs font-bold">
                {isAdmin ? 'Live PostgreSQL Node' : 'Encrypted Banking Vault'}
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              {isAdmin
                ? 'Apex Relational Database cluster active on localhost:5432. All updates persist in real time.'
                : 'Session protected by 256-bit encryption. Currency: ₹ INR.'}
            </p>
          </div>
        </aside>

        {/* Tab Content Panes */}
        <main className="min-w-0 space-y-5">
          {/* ======================================================== */}
          {/* TAB: OVERVIEW (ADMIN OR CUSTOMER) */}
          {/* ======================================================== */}
          {activeTab === 'overview' && (
            <>
              {/* Profile Card */}
              <SectionCard
                icon={<UserRound className="h-5 w-5" />}
                title={isAdmin ? 'Administrator Profile' : 'Customer Account Profile'}
                subtitle={
                  isAdmin
                    ? 'Information and credential details for the currently signed-in system administrator.'
                    : 'Your registered personal banking details and account status in PostgreSQL.'
                }
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border text-lg font-bold ${
                        isAdmin
                          ? 'border-purple-500/30 bg-purple-500/10 text-purple-300'
                          : 'border-blue-500/30 bg-blue-500/10 text-blue-300'
                      }`}
                    >
                      {(currentUser.name || (isAdmin ? 'Admin' : 'Customer'))
                        .split(/\s+/)
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-extrabold text-white flex items-center gap-2">
                        {currentUser.name}
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 text-[10px] font-bold text-purple-300">
                            <ShieldAlert className="h-3 w-3" /> System Administrator
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-bold text-blue-300">
                            <ShieldCheck className="h-3 w-3" /> Personal Banking
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 break-all text-xs text-slate-400">
                        {currentUser.email || 'Email not registered'}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        User ID: #{currentUser.id} • Registered in PostgreSQL
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 hover:text-white"
                  >
                    <Edit3 className="h-3.5 w-3.5 text-blue-400" />
                    <span>{isEditingProfile ? 'Cancel Edit' : 'Edit Profile Details'}</span>
                  </button>
                </div>

                {/* Inline Profile Edit Form */}
                {isEditingProfile && (
                  <form
                    onSubmit={handleProfileSubmit}
                    className="mt-4 pt-4 border-t border-slate-800 space-y-3 bg-[#0B0B0B] p-4 rounded-xl border"
                  >
                    <p className="text-xs font-bold text-slate-200">
                      Update Account Details (Persists directly to Database)
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          className="w-full bg-[#151515] border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-blue-500 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="text"
                          required
                          value={profilePhone}
                          onChange={(e) => setProfilePhone(e.target.value)}
                          className="w-full bg-[#151515] border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-blue-500 text-xs font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Address
                      </label>
                      <input
                        type="text"
                        value={profileAddress}
                        onChange={(e) => setProfileAddress(e.target.value)}
                        placeholder="Street Address"
                        className="w-full bg-[#151515] border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-blue-500 text-xs"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isUpdatingProfile}
                        className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition flex items-center gap-1.5 glow-primary"
                      >
                        <Save className="h-3.5 w-3.5" />
                        <span>{isUpdatingProfile ? 'Saving...' : 'Save to PostgreSQL'}</span>
                      </button>
                    </div>
                  </form>
                )}
              </SectionCard>

              {/* Actionable Operational Cards */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {isAdmin ? (
                  <>
                    <InteractiveActionCard
                      icon={<Users className="h-5 w-5 text-purple-400" />}
                      badge="RBAC Management"
                      title="User & System Administration"
                      description="Create administrative users, assign security roles, and monitor active account statuses."
                      actionLabel="Open User Management"
                      onClick={() => onSelectTab && onSelectTab('user_system_admin')}
                    />

                    <InteractiveActionCard
                      icon={<FileClock className="h-5 w-5 text-blue-400" />}
                      badge="ACID Ledger"
                      title="Transaction & Ledger Audits"
                      description="Examine live relational transactions across all customers with full audit trail tracking."
                      actionLabel="View Transactions"
                      onClick={() => onSelectTab && onSelectTab('transaction_management')}
                    />

                    <InteractiveActionCard
                      icon={<Activity className="h-5 w-5 text-emerald-400" />}
                      badge="Health: 99.99%"
                      title="Database & Cluster Health"
                      description="Inspect PostgreSQL query latency, connection pool utilization, and relational schema integrity."
                      actionLabel="Inspect Health Node"
                      onClick={() => onSelectTab && onSelectTab('database_health')}
                    />

                    <InteractiveActionCard
                      icon={<ShieldAlert className="h-5 w-5 text-amber-400" />}
                      badge="Underwriting Queue"
                      title="Loan Underwriting & Risk"
                      description="Review customer loan requests, underwrite terms, and issue Approve or Reject decisions."
                      actionLabel="Open Loan Queue"
                      onClick={() => onSelectTab && onSelectTab('loan_management')}
                    />
                  </>
                ) : (
                  <>
                    <InteractiveActionCard
                      icon={<CreditCard className="h-5 w-5 text-blue-400" />}
                      badge="₹ Active Accounts"
                      title="My Bank Accounts"
                      description="View balances, deposit or withdraw funds, and request account deactivation if needed."
                      actionLabel="Manage Accounts"
                      onClick={() => onSelectTab && onSelectTab('my_accounts')}
                    />

                    <InteractiveActionCard
                      icon={<Send className="h-5 w-5 text-emerald-400" />}
                      badge="Instant Transfer"
                      title="Money Transfer Portal"
                      description="Execute atomic money transfers between bank accounts with instant ACID validation."
                      actionLabel="Send Money"
                      onClick={() => onSelectTab && onSelectTab('money_transfer')}
                    />

                    <InteractiveActionCard
                      icon={<FileSpreadsheet className="h-5 w-5 text-cyan-400" />}
                      badge="Statements"
                      title="Account Statements & History"
                      description="Download statement reports and inspect past transaction ledger entries with date filters."
                      actionLabel="View Statement"
                      onClick={() => onSelectTab && onSelectTab('account_statement')}
                    />

                    <InteractiveActionCard
                      icon={<Landmark className="h-5 w-5 text-amber-400" />}
                      badge="Borrowing Portal"
                      title="Loan Application & Status"
                      description="Apply for home, personal, or education loans and monitor administrative underwriting decisions."
                      actionLabel="Check Loan Status"
                      onClick={() => onSelectTab && onSelectTab('loan_status')}
                    />
                  </>
                )}
              </div>

              {/* System Telemetry Banner */}
              <div className="rounded-2xl border border-slate-800 bg-[#151515] p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">
                      Relational DBMS Cluster Operational
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Connected to PostgreSQL on localhost:5432 • Strict RBAC Portal Segregation Enforced
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTestNotification}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-700 transition"
                  >
                    <Bell className="h-3.5 w-3.5 text-blue-400" />
                    <span>Test Notification</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ======================================================== */}
          {/* TAB: SYSTEM PREFERENCES (ADMIN ONLY) */}
          {/* ======================================================== */}
          {activeTab === 'system' && isAdmin && (
            <>
              <SectionCard
                icon={<ServerCog className="h-5 w-5 text-purple-400" />}
                title="Administrative Data & Display Controls"
                subtitle="Configure display parameters across data-heavy administrative tables."
              >
                <ToggleRow
                  label="Mask Account Numbers"
                  description="Obscure sensitive customer account numbers with '•••• •••• XXXX' format."
                  checked={preferences.maskAccountNumbers}
                  onChange={(val) => updatePreference('maskAccountNumbers', val)}
                />

                <ToggleRow
                  label="Compact Table Layout"
                  description="Render denser table row heights on customer and transaction tables for faster scanning."
                  checked={preferences.compactTables}
                  onChange={(val) => updatePreference('compactTables', val)}
                />

                <ToggleRow
                  label="Session Auto-Lock Notice"
                  description="Display session security reminders during extended idle times."
                  checked={preferences.autoLockNotice}
                  onChange={(val) => updatePreference('autoLockNotice', val)}
                />

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-200">System Currency Standard</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Core accounting unit enforced across all tables and transfers.
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono font-bold text-emerald-400">
                    ₹ INR (Indian Rupee)
                  </span>
                </div>
              </SectionCard>

              <SectionCard
                icon={<ShieldCheck className="h-5 w-5 text-emerald-400" />}
                title="Access Governance & Security Policies"
                subtitle="Enforced database and portal operational policies."
              >
                <InfoLine
                  title="Strict Portal Role Segregation"
                  description="Accounts registered as Bank Admin are strictly forbidden from logging into Customer Portal, and vice versa."
                />
                <InfoLine
                  title="Dual-Step Account Deactivation"
                  description="Customer deactivation requests require explicit administrative review before account status updates in PostgreSQL."
                />
                <InfoLine
                  title="Audit Trail Permanence"
                  description="Every deposit, withdrawal, transfer, and underwriting decision is stored with timestamps in the PostgreSQL database."
                />
              </SectionCard>
            </>
          )}

          {/* ======================================================== */}
          {/* TAB: ADMIN ALERTS (ADMIN ONLY) */}
          {/* ======================================================== */}
          {activeTab === 'adminAlerts' && isAdmin && (
            <SectionCard
              icon={<ShieldAlert className="h-5 w-5 text-purple-400" />}
              title="Operational Event Subscriptions"
              subtitle="Select which banking system activities trigger notifications for administrators."
            >
              <ToggleRow
                label="High-Value Transaction Flags"
                description="Immediately flag and notify on transfers exceeding ₹50,000 threshold."
                checked={preferences.failedTransactionAlerts}
                onChange={(val) => updatePreference('failedTransactionAlerts', val)}
              />

              <ToggleRow
                label="Loan Application Submissions"
                description="Notify when a customer submits a new loan request for administrative underwriting."
                checked={preferences.auditAlerts}
                onChange={(val) => updatePreference('auditAlerts', val)}
              />

              <ToggleRow
                label="Account Deactivation Requests"
                description="Receive alerts when customers submit account deactivation requests."
                onChange={(val) => updatePreference('roleChangeAlerts', val)}
                checked={preferences.roleChangeAlerts}
              />

              <ToggleRow
                label="New Customer Registrations"
                description="Notify when new customer accounts are created in the database."
                checked={preferences.systemHealthAlerts}
                onChange={(val) => updatePreference('systemHealthAlerts', val)}
              />

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">Test Notification Engine</p>
                  <p className="text-[11px] text-slate-400">
                    Send an instantaneous test alert to your notifications drawer.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleTestNotification}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 glow-primary"
                >
                  <Bell className="h-4 w-4" />
                  <span>Send Test Alert</span>
                </button>
              </div>
            </SectionCard>
          )}

          {/* ======================================================== */}
          {/* TAB: NOTIFICATIONS (CUSTOMER ONLY) */}
          {/* ======================================================== */}
          {activeTab === 'notifications' && !isAdmin && (
            <SectionCard
              icon={<Bell className="h-5 w-5 text-blue-400" />}
              title="Customer Notification Preferences"
              subtitle="Choose which banking and transaction alerts you receive in real time."
            >
              <ToggleRow
                label="Transaction Credit / Debit Alerts"
                description="Receive notifications whenever money enters or leaves your bank accounts."
                checked={preferences.transactionAlerts}
                onChange={(val) => updatePreference('transactionAlerts', val)}
              />

              <ToggleRow
                label="Transfer & Payment Alerts"
                description="Instant confirmation alerts for outward money transfers and payee transactions."
                checked={preferences.transferAlerts}
                onChange={(val) => updatePreference('transferAlerts', val)}
              />

              <ToggleRow
                label="Loan Status Underwriting Decision"
                description="Instant notification when bank admin Approves or Rejects your loan application."
                checked={preferences.accountUpdates}
                onChange={(val) => updatePreference('accountUpdates', val)}
              />

              <ToggleRow
                label="Security Sign-In Alerts"
                description="Notify when an authenticated session is started on your customer account."
                checked={preferences.loginAlerts}
                onChange={(val) => updatePreference('loginAlerts', val)}
              />

              <ToggleRow
                label="Email Statements & Receipts"
                description="Receive digital statements and monthly balance summaries."
                checked={preferences.emailNotifications}
                onChange={(val) => updatePreference('emailNotifications', val)}
              />

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">Verify Alert Notification</p>
                  <p className="text-[11px] text-slate-400">
                    Dispatch an instant test alert to verify notification delivery.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleTestNotification}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 glow-primary"
                >
                  <Bell className="h-4 w-4" />
                  <span>Send Test Alert</span>
                </button>
              </div>
            </SectionCard>
          )}

          {/* ======================================================== */}
          {/* TAB: PRIVACY (CUSTOMER ONLY) */}
          {/* ======================================================== */}
          {activeTab === 'privacy' && !isAdmin && (
            <>
              <SectionCard
                icon={<Eye className="h-5 w-5 text-blue-400" />}
                title="Privacy & Data Concealment"
                subtitle="Protect sensitive financial figures from onlookers on this device."
              >
                <ToggleRow
                  label="Hide Balances by Default"
                  description="Obscures balance figures as '₹••••••' until clicked or hovered."
                  checked={preferences.hideBalances}
                  onChange={(val) => updatePreference('hideBalances', val)}
                />

                <ToggleRow
                  label="Mask Account Numbers"
                  description="Show only the last 4 digits of your account numbers (e.g. •••• •••• 1042)."
                  checked={preferences.maskAccountNumbers}
                  onChange={(val) => updatePreference('maskAccountNumbers', val)}
                />
              </SectionCard>

              <SectionCard
                icon={<Download className="h-5 w-5 text-emerald-400" />}
                title="Data Export & GDPR Download"
                subtitle="Download an authorized copy of your customer profile and account metadata."
              >
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-200">
                      Personal Banking Records (JSON Format)
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Includes account numbers, KYC status, contact information, and balances.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportData}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 text-xs font-bold text-white transition"
                  >
                    <Download className="h-4 w-4 text-emerald-400" />
                    <span>Download JSON Statement</span>
                  </button>
                </div>
              </SectionCard>
            </>
          )}

          {/* ======================================================== */}
          {/* TAB: SECURITY & AUTHENTICATION (ADMIN & CUSTOMER) */}
          {/* ======================================================== */}
          {activeTab === 'security' && (
            <>
              <SectionCard
                icon={<KeyRound className="h-5 w-5 text-blue-400" />}
                title="Change Account Password"
                subtitle="Update your password directly in the PostgreSQL database with bcrypt security."
              >
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <PasswordInput
                      label="Current Password"
                      value={currentPassword}
                      onChange={setCurrentPassword}
                      show={showPasswords}
                      placeholder="Enter current password"
                    />
                    <PasswordInput
                      label="New Password"
                      value={newPassword}
                      onChange={setNewPassword}
                      show={showPasswords}
                      placeholder="At least 6 characters"
                    />
                    <PasswordInput
                      label="Confirm New Password"
                      value={confirmPassword}
                      onChange={setConfirmPassword}
                      show={showPasswords}
                      placeholder="Re-enter new password"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowPasswords(!showPasswords)}
                      className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5"
                    >
                      {showPasswords ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      <span>{showPasswords ? 'Hide passwords' : 'Show passwords'}</span>
                    </button>

                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-500 disabled:opacity-50 glow-primary"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      <span>{isChangingPassword ? 'Saving to Database...' : 'Save New Password to PostgreSQL'}</span>
                    </button>
                  </div>
                </form>
              </SectionCard>

              {/* Session Details */}
              <SectionCard
                icon={<Activity className="h-5 w-5 text-purple-400" />}
                title="Active Session & Access Protocol"
                subtitle="Cryptographic session token information."
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <InfoStat label="Authentication Scheme" value="JWT Bearer Token" />
                  <InfoStat label="Host Location" value="Localhost (127.0.0.1:5173)" />
                  <InfoStat label="Encryption Standard" value="Bcrypt 10-Salt + SHA-256" />
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">Sign Out Active Session</p>
                    <p className="text-[11px] text-slate-400">
                      Terminate the current banking session and return to security login.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (onLogout) onLogout();
                      else window.location.reload();
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 text-xs font-bold transition"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out Now</span>
                  </button>
                </div>
              </SectionCard>
            </>
          )}

          {/* ======================================================== */}
          {/* TAB: APPEARANCE (ADMIN & CUSTOMER) */}
          {/* ======================================================== */}
          {activeTab === 'general' && (
            <SectionCard
              icon={<Palette className="h-5 w-5 text-blue-400" />}
              title="Interface Appearance & Themes"
              subtitle="Personalize the visual atmosphere of the Apex Bank dashboard."
            >
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <ThemeOption
                  title="Dark Cobalt"
                  description="Sleek black (#0B0B0B) interface with electric blue buttons and cobalt accents."
                  icon={<Moon className="h-5 w-5 text-blue-400" />}
                  selected={preferences.theme === 'dark'}
                  themeType="dark"
                  onClick={() => handleThemeSelect('dark')}
                />
                <ThemeOption
                  title="Soft Warm Elegance"
                  description="Soft peach & beige tones with white cards and subtle terracotta buttons."
                  icon={<Sun className="h-5 w-5 text-amber-500" />}
                  selected={preferences.theme === 'soft'}
                  themeType="soft"
                  onClick={() => handleThemeSelect('soft')}
                />
                <ThemeOption
                  title="Royal Amethyst Glass"
                  description="High-gloss crystalline amethyst cards with specular glass finish and radiant violet buttons."
                  icon={<Sparkles className="h-5 w-5 text-purple-300" />}
                  selected={preferences.theme === 'shiny'}
                  themeType="shiny"
                  onClick={() => handleThemeSelect('shiny')}
                />
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-3">
                <p className="text-xs font-bold text-slate-300">Display Layout Preference</p>
                <ToggleRow
                  label="Compact Table Grid"
                  description="Enable tighter row padding across tables."
                  checked={preferences.compactTables}
                  onChange={(val) => updatePreference('compactTables', val)}
                />
              </div>
            </SectionCard>
          )}
        </main>
      </div>
    </div>
  );
};

// ==========================================================
// SUB-COMPONENTS
// ==========================================================

const SectionCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}> = ({ icon, title, subtitle, children }) => (
  <section className="overflow-hidden rounded-2xl border border-slate-800 bg-[#151515] shadow-xl">
    <div className="flex items-start gap-3 border-b border-slate-800 px-5 py-4 sm:px-6">
      <span className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2.5 text-blue-400">
        {icon}
      </span>
      <div>
        <h2 className="text-sm font-bold text-white">{title}</h2>
        <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>
      </div>
    </div>
    <div className="space-y-4 p-5 sm:p-6">{children}</div>
  </section>
);

const InteractiveActionCard: React.FC<{
  icon: React.ReactNode;
  badge: string;
  title: string;
  description: string;
  actionLabel: string;
  onClick: () => void;
}> = ({ icon, badge, title, description, actionLabel, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="group rounded-2xl border border-slate-800 bg-[#151515] p-5 text-left transition hover:border-blue-500/50 hover:bg-[#1a1a1a] flex flex-col justify-between shadow-lg"
  >
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="rounded-xl bg-slate-800/80 border border-slate-700/60 p-2.5 group-hover:scale-105 transition-transform">
          {icon}
        </span>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
          {badge}
        </span>
      </div>
      <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
        {title}
      </h3>
      <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
        {description}
      </p>
    </div>

    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-blue-400 group-hover:text-blue-300">
      <span>{actionLabel}</span>
      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
    </div>
  </button>
);

const ToggleRow: React.FC<{
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}> = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between gap-4 border-b border-slate-800/80 pb-4 last:border-0 last:pb-0">
    <div className="min-w-0">
      <p className="text-xs sm:text-sm font-semibold text-slate-200">{label}</p>
      <p className="mt-0.5 text-[11px] sm:text-xs leading-relaxed text-slate-500">{description}</p>
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
        checked ? 'bg-blue-600' : 'bg-slate-700'
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
          checked ? 'left-6' : 'left-1'
        }`}
      />
    </button>
  </div>
);

const ThemeOption: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  selected: boolean;
  themeType: ThemePreference;
  onClick: () => void;
}> = ({ title, description, icon, selected, themeType, onClick }) => {
  const previewColors = {
    dark: {
      bg: 'bg-[#0B0B0B]',
      card: 'bg-[#151515]',
      border: 'border-slate-800',
      activeBorder: 'border-blue-500 ring-2 ring-blue-500/40 bg-blue-500/10 shadow-lg shadow-blue-500/20',
      badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      accentDot: 'bg-blue-500',
    },
    soft: {
      bg: 'bg-[#FAF7F2]',
      card: 'bg-[#FFFFFF]',
      border: 'border-[#E8DFD8]',
      activeBorder: 'border-[#E07A5F] ring-2 ring-[#E07A5F]/40 bg-[#E07A5F]/10 shadow-lg shadow-[#E07A5F]/20',
      badge: 'bg-[#E07A5F]/20 text-[#E07A5F] border-[#E07A5F]/30',
      accentDot: 'bg-[#E07A5F]',
    },
    shiny: {
      bg: 'bg-[#0a0316]',
      card: 'bg-[#1f0d3d]',
      border: 'border-purple-500/30',
      activeBorder: 'border-purple-400 ring-2 ring-purple-400/50 bg-purple-500/15 shadow-lg shadow-purple-400/30',
      badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      accentDot: 'bg-purple-400',
    },
  }[themeType];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-4 text-left transition-all relative overflow-hidden flex flex-col justify-between ${
        selected
          ? previewColors.activeBorder
          : `${previewColors.border} ${previewColors.card} hover:border-slate-600`
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-black/40 border border-white/10">
              {icon}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${previewColors.badge}`}>
              {themeType.toUpperCase()}
            </span>
          </div>
          {selected && (
            <span className="flex items-center gap-1 text-[11px] font-bold text-white bg-black/60 px-2 py-1 rounded-full border border-white/20">
              <Check className="h-3.5 w-3.5 text-emerald-400" /> Active
            </span>
          )}
        </div>

        {/* Visual Mini Palette Swatch */}
        <div className="flex items-center gap-1.5 mb-3 p-1.5 rounded-lg bg-black/50 border border-white/5">
          <div className={`w-5 h-5 rounded ${previewColors.bg} border border-white/10`} title="Background" />
          <div className={`w-5 h-5 rounded ${previewColors.card} border border-white/10`} title="Cards" />
          <div className={`w-5 h-5 rounded ${previewColors.accentDot}`} title="Accent" />
          <span className="text-[10px] text-slate-400 ml-1">Live Palette</span>
        </div>

        <p className="text-sm font-bold text-white">{title}</p>
        <p className="mt-1 text-xs text-slate-400 leading-snug">{description}</p>
      </div>

      <div className="mt-4 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-semibold text-slate-300">
        <span>{selected ? 'Theme Currently Active' : 'Click to Apply Theme'}</span>
        <span className={`w-2 h-2 rounded-full ${selected ? previewColors.accentDot : 'bg-slate-600'}`} />
      </div>
    </button>
  );
};

const PasswordInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  placeholder: string;
}> = ({ label, value, onChange, show, placeholder }) => (
  <label className="block">
    <span className="mb-1.5 block text-[11px] font-semibold text-slate-300">{label}</span>
    <input
      type={show ? 'text' : 'password'}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      autoComplete="off"
      className="w-full rounded-xl border border-slate-700 bg-[#0B0B0B] px-3.5 py-2.5 text-xs text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 font-mono"
    />
  </label>
);

const InfoLine: React.FC<{ title: string; description: string }> = ({
  title,
  description,
}) => (
  <div className="flex gap-3 rounded-xl border border-slate-800 bg-[#0D0D0D] p-3.5">
    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
    <div>
      <p className="text-xs font-semibold text-slate-200">{title}</p>
      <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">{description}</p>
    </div>
  </div>
);

const InfoStat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-xl border border-slate-800 bg-[#0D0D0D] p-3.5">
    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
    <p className="mt-1 text-xs font-semibold text-slate-200">{value}</p>
  </div>
);
