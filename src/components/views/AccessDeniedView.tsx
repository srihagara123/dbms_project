import React from 'react';
import { ShieldAlert, Lock, ArrowLeft, AlertOctagon } from 'lucide-react';
import { UserRole } from '../../types/bank';

interface AccessDeniedViewProps {
  currentRole: UserRole;
  attemptedTab: string;
  onGoDashboard: () => void;
}

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({
  currentRole,
  attemptedTab,
  onGoDashboard,
}) => {
  const roleNames: Record<string, string> = {
    customer: 'Customer',
    teller: 'Bank Teller',
    manager: 'Branch Manager',
    admin: 'Database Administrator',
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center animate-fadeIn font-sans">
      <div className="bg-[#151515] border border-rose-500/30 rounded-3xl p-8 sm:p-12 max-w-lg w-full shadow-2xl relative overflow-hidden glow-primary">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Icon */}
        <div className="w-20 h-20 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-rose-500/20">
          <ShieldAlert className="w-10 h-10 animate-pulse" />
        </div>

        {/* Badge */}
        <span className="px-3 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full text-xs font-mono font-bold uppercase tracking-wider inline-block mb-3">
          Error 403: Access Denied
        </span>

        {/* Heading */}
        <h2 className="text-2xl font-black text-white mb-2">Unauthorized System Scope</h2>

        {/* Message */}
        <p className="text-xs text-slate-300 leading-relaxed mb-6">
          Your current authenticated role <strong className="text-white uppercase">[{roleNames[currentRole]}]</strong> does not have permission to access page scope <code className="text-rose-400 font-mono font-bold">{attemptedTab}</code>.
        </p>

        {/* Audit Warning */}
        <div className="p-3.5 bg-black/60 rounded-2xl border border-slate-800 text-left text-[11px] text-slate-400 space-y-1 mb-6 font-mono">
          <div className="flex items-center gap-1.5 text-rose-400 font-bold">
            <AlertOctagon className="w-4 h-4 shrink-0" />
            <span>Security Audit Logged</span>
          </div>
          <p className="text-[10px]">
            Timestamp: {new Date().toISOString()} | User Role: {currentRole.toUpperCase()} | Policy: RBAC_RESTRICTED_403
          </p>
        </div>

        {/* Action button */}
        <button
          id="access-denied-return-btn"
          onClick={onGoDashboard}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 glow-primary"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Authorized Dashboard</span>
        </button>
      </div>
    </div>
  );
};
