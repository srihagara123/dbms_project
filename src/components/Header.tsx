import React, { useState } from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  LogOut,
  SlidersHorizontal,
  BadgeCheck,
} from 'lucide-react';

import { Customer, UserRole } from '../types/bank';

interface HeaderProps {
  currentUser: Customer;
  currentRole: UserRole;
  unreadNotifCount: number;
  activeTabLabel: string;
  onOpenNotifications: () => void;
  onOpenQuickAction: (
    type: 'deposit' | 'withdraw' | 'transfer'
  ) => void;
  onSelectTab: (tab: any) => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  currentRole,
  unreadNotifCount,
  activeTabLabel,
  onOpenNotifications,
  onSelectTab,
  onLogout,
}) => {
  const [search, setSearch] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);

  // Role labels for the two supported roles
  const roleLabels: Record<
    UserRole,
    { title: string; badgeClass: string }
  > = {
    customer: {
      title: 'Customer Portal',
      badgeClass:
        'bg-blue-500/20 text-blue-400 border-blue-500/30',
    },
    admin: {
      title: 'Database Administrator',
      badgeClass:
        'bg-purple-500/20 text-purple-400 border-purple-500/30',
    },
  };

  return (
    <header
      id="main-app-header"
      className="h-20 flex items-center justify-between px-6 lg:px-8 border-b border-slate-800/80 bg-[#0B0B0B]/90 backdrop-blur-md sticky top-0 z-20 shrink-0"
    >
      {/* Left: Breadcrumb and Search */}
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 font-medium">
          <span className="text-slate-500">Apex BMS</span>

          <span>/</span>

          <span className="capitalize text-slate-300 font-semibold">
            {currentRole}
          </span>

          <span>/</span>

          <span className="text-white font-bold">
            {activeTabLabel}
          </span>
        </div>

        {/* Global Search */}
        <div className="relative w-48 sm:w-64 lg:w-72">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 pointer-events-none">
            <Search className="w-4 h-4" />
          </span>

          <input
            id="header-search-input"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search accounts, SSN, logs..."
            className="w-full bg-[#151515] border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Right: Role Badge, Notifications and Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Role Badge */}
        <span
          className={`hidden xl:inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${
            roleLabels[currentRole].badgeClass
          }`}
        >
          <BadgeCheck className="w-3.5 h-3.5" />

          {roleLabels[currentRole].title}
        </span>

        {/* Notifications */}
        <button
          id="notifications-button"
          onClick={onOpenNotifications}
          className="relative p-2.5 bg-[#151515] hover:bg-slate-800 rounded-xl text-slate-300 hover:text-white transition-all border border-slate-800"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />

          {unreadNotifCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#0B0B0B] animate-pulse">
              {unreadNotifCount}
            </span>
          )}
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            id="user-profile-menu-button"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-3 border-l border-slate-800 pl-4 focus:outline-none"
            aria-expanded={profileOpen}
            aria-label="Open user profile menu"
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs sm:text-sm font-semibold text-white leading-tight">
                {currentUser.name}
              </p>

              <p className="text-[10px] text-slate-400 font-medium capitalize">
                {currentRole} Account
              </p>
            </div>

            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-blue-600 shadow-sm"
              />

              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0B0B0B]" />
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Profile Dropdown Menu */}
          {profileOpen && (
            <div
              id="user-profile-dropdown"
              className="absolute right-0 mt-3 w-64 bg-[#151515] border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-fadeIn"
            >
              {/* User Information */}
              <div className="p-3 border-b border-slate-800">
                <p className="text-xs font-bold text-white">
                  {currentUser.name}
                </p>

                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                  {currentUser.email}
                </p>

                <span className="mt-2 inline-block px-2 py-0.5 text-[9px] font-semibold bg-emerald-500/20 text-emerald-400 rounded border border-emerald-500/30">
                  {currentUser.status}
                </span>
              </div>

              {/* Profile Actions */}
              <div className="py-1">
                <button
                  id="profile-dropdown-settings"
                  onClick={() => {
                    onSelectTab('settings');
                    setProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />

                  System Settings
                </button>

                <button
                  id="profile-logout-link"
                  onClick={() => {
                    setProfileOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors mt-1 border-t border-slate-800"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />

                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;