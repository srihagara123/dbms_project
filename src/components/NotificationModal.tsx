import React, { useState } from 'react';
import { X, CheckCheck, Bell, Shield, ArrowUpRight, AlertTriangle, Info } from 'lucide-react';
import { SystemNotification } from '../types/bank';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: SystemNotification[];
  onMarkAllAsRead: () => void;
  onToggleRead: (id: string) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onToggleRead,
}) => {
  const [filter, setFilter] = useState<'All' | 'Unread' | 'SWIFT' | 'Security'>('All');

  if (!isOpen) return null;

  const filtered = notifications.filter((n) => {
    if (filter === 'Unread') return !n.read;
    if (filter === 'SWIFT') return n.category === 'SWIFT';
    if (filter === 'Security') return n.category === 'Security';
    return true;
  });

  const getIcon = (type: SystemNotification['type']) => {
    switch (type) {
      case 'success':
        return <ArrowUpRight className="w-4 h-4 text-[#22C55E]" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-[#FBBF24]" />;
      case 'error':
        return <Shield className="w-4 h-4 text-[#EF4444]" />;
      default:
        return <Info className="w-4 h-4 text-[#3B82F6]" />;
    }
  };

  return (
    // The 'justify-end' class here ensures the panel docks to the right side of the screen
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
      {/* The 'h-full max-w-md' makes it a full-height right sidebar */}
      <div className="w-full max-w-md bg-[#0B1E36] border-l border-white/10 h-full flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#050816]/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#2563EB]/20 rounded-xl text-[#3B82F6]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">System Feed & Alerts</h3>
              <p className="text-xs text-[#CBD5E1]/50">Live enterprise telemetry & logs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#CBD5E1]/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between gap-2 text-xs">
          <div className="flex gap-1.5 overflow-x-auto">
            {(['All', 'Unread', 'SWIFT', 'Security'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  filter === tab
                    ? 'bg-[#2563EB] text-white shadow-[0_0_12px_rgba(37,99,235,0.3)]'
                    : 'bg-white/5 text-[#CBD5E1]/70 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <button
            onClick={onMarkAllAsRead}
            className="flex items-center gap-1 text-[11px] text-[#3B82F6] hover:underline font-semibold shrink-0"
          >
            <CheckCheck className="w-3.5 h-3.5" /> Mark All Read
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-[#CBD5E1]/40 text-xs">
              No notifications matching current filter.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => onToggleRead(item.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                  item.read
                    ? 'bg-[#101827]/50 border-white/5 opacity-75'
                    : 'bg-[#101827] border-[#2563EB]/40 shadow-lg'
                }`}
              >
                {!item.read && (
                  <span className="absolute top-3 right-3 w-2 h-2 bg-[#3B82F6] rounded-full shadow-[0_0_8px_#3B82F6]"></span>
                )}
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white/5 rounded-lg shrink-0 mt-0.5">{getIcon(item.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between pr-4">
                      <span className="text-xs font-bold text-white">{item.title}</span>
                      <span className="text-[10px] text-[#CBD5E1]/40 font-mono-num">{item.timestamp}</span>
                    </div>
                    <p className="text-xs text-[#CBD5E1]/70 mt-1 leading-relaxed">{item.message}</p>
                    <div className="mt-2.5 flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-white/5 text-[#CBD5E1]/60">
                        {item.category}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 text-center bg-[#050816]/50">
          <p className="text-[10px] text-[#CBD5E1]/40 font-mono-num">
            CONNECTED TO FRANKFURT TELEMETRY HUB • AUDIT LOG REGISTRY
          </p>
        </div>
      </div>
    </div>
  );
};