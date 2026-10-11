import React from 'react';

import {
  LayoutDashboard,
  Users,
  Landmark,
  ArrowLeftRight,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  History,
  Scale,
  BarChart3,
  UserCog,
  Bell,
  Settings as SettingsIcon,
  PieChart,
  Receipt,
  Building2,
  HandCoins,
} from 'lucide-react';

import { UserRole, ActiveTab } from '../types/bank';

interface SidebarProps {
  currentRole: UserRole;
  currentTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  onLogout,
}) => {
  // ============================================
  // CUSTOMER NAVIGATION
  // ============================================

  const customerItems: {
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'customer_dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'my_accounts',
      label: 'My Accounts',
      icon: <Landmark className="w-4 h-4" />,
    },
    {
      id: 'balance_overview',
      label: 'Balance Overview',
      icon: <PieChart className="w-4 h-4" />,
    },
    {
      id: 'transaction_history',
      label: 'Transaction History',
      icon: <History className="w-4 h-4" />,
    },
    {
      id: 'account_statement',
      label: 'Account Statement',
      icon: <Receipt className="w-4 h-4" />,
    },
    {
      id: 'loan_status',
      label: 'Loan Status',
      icon: <Scale className="w-4 h-4" />,
    },
    // The notifications tab was completely removed from here
    {
      id: 'profile',
      label: 'Profile',
      icon: <User className="w-4 h-4" />,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <SettingsIcon className="w-4 h-4" />,
    },
  ];

  // ============================================
  // ADMIN NAVIGATION
  // ============================================

  const adminItems: {
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'admin_dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'customer_management',
      label: 'Customer Management',
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: 'account_management',
      label: 'Account Management',
      icon: <Landmark className="w-4 h-4" />,
    },
    {
      id: 'transaction_management',
      label: 'Transaction Management',
      icon: <ArrowLeftRight className="w-4 h-4" />,
    },
    {
      id: 'loan_management',
      label: 'Loan Management',
      icon: <HandCoins className="w-4 h-4" />,
    },
    {
      id: 'branch_management',
      label: 'Branch Management',
      icon: <Building2 className="w-4 h-4" />,
    },
    {
      id: 'reports_analytics',
      label: 'Reports & Analytics',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'user_system_admin',
      label: 'User & System Administration',
      icon: <UserCog className="w-4 h-4" />,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <SettingsIcon className="w-4 h-4" />,
    },
  ];

  // ============================================
  // ROLE-BASED NAVIGATION
  // ============================================

  const menuItems = currentRole === 'admin' ? adminItems : customerItems;

  const roleTitles: Record<UserRole, string> = {
    customer: 'Customer Portal',
    admin: 'Bank Administrator',
  };

  // ============================================
  // SIDEBAR UI
  // ============================================

  return (
    <aside
      id="sidebar-navigation"
      className={`relative flex flex-col bg-[#151515] border-r border-slate-800 transition-all duration-300 z-30 shrink-0 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo Section */}
      <div className="p-5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 shrink-0 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20 glow-primary">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>

          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white leading-none font-sans">
                APEX<span className="text-blue-500">BANK</span>
              </h1>

              <p className="text-[10px] text-cyan-400 font-semibold uppercase tracking-widest mt-1 truncate">
                {roleTitles[currentRole]}
              </p>
            </div>
          )}
        </div>

        <button
          id="toggle-sidebar-button"
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {!collapsed && (
          <p className="px-3 pt-1 pb-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
            {roleTitles[currentRole]} Navigation
          </p>
        )}

        {menuItems.map((item) => {
          const isActive = currentTab === item.id;

          return (
            <button
              id={`nav-item-${item.id}`}
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-xs font-medium ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 font-semibold glow-primary'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
              title={collapsed ? item.label : undefined}
              aria-current={isActive ? 'page' : undefined}
            >
              <div
                className={`transition-colors shrink-0 ${
                  isActive
                    ? 'text-white'
                    : 'text-slate-400 group-hover:text-blue-400'
                }`}
              >
                {item.icon}
              </div>

              {!collapsed && (
                <span className="flex-1 text-left truncate">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout Section */}
      <div className="p-3 border-t border-slate-800">
        <button
          id="logout-button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-xs font-medium"
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />

          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};