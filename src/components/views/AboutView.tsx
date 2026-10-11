import React from 'react';
import {
  ShieldCheck,
  Zap,
  Lock,
  Workflow,
  ScrollText,
  FileSpreadsheet,
  Scale,
  Database,
  ArrowLeft,
  ChevronRight,
  Server,
  KeyRound,
  Layers,
} from 'lucide-react';
import { PublicPage } from '../../types/bank';

interface AboutViewProps {
  onNavigateLogin: () => void;
  onNavigatePage: (page: PublicPage) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigateLogin, onNavigatePage }) => {
  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white font-sans flex flex-col">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-50 bg-[#0B0B0B]/90 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigatePage('landing')}>
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg glow-primary">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-extrabold text-white block leading-none">
                APEX<span className="text-blue-500">BANK</span>
              </span>
              <span className="text-[10px] text-cyan-400 font-semibold tracking-widest uppercase">
                Architecture & Security
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigatePage('landing')}
              className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </button>
            <button
              onClick={onNavigateLogin}
              className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl glow-primary"
            >
              Portal Login
            </button>
          </div>
        </div>
      </header>

      {/* Main About Content */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Title Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
            System Abstract & Architecture
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white">
            Enterprise-Grade Relational Bank Management System
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Designed to simulate institutional banking operations with high transactional integrity, database triggers, multi-role partition, and immutable audit logs.
          </p>
        </div>

        {/* System Abstract Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Item 1 */}
          <div className="bg-[#151515] p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Role-Based Access Control (RBAC)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enforces strict segregation of duties between Customers, Bank Tellers, Branch Managers, and Database Administrators. Users can only access UI components and execute actions permitted by their active role.
            </p>
          </div>

          {/* Item 2 */}
          <div className="bg-[#151515] p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Atomic Transactions (ACID)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Guarantees strict Atomicity, Consistency, Isolation, and Durability. Money transfers automatically debit the sender and credit the receiver in a single database transaction context, rolling back if any step fails.
            </p>
          </div>

          {/* Item 3 */}
          <div className="bg-[#151515] p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <ScrollText className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Comprehensive Audit Logs</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Captures every database mutation across all modules. Records precise timestamps, user identities, action types, affected tables, and previous versus new record states for compliance audits.
            </p>
          </div>

          {/* Item 4 */}
          <div className="bg-[#151515] p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Workflow className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Database Triggers</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated triggers handle real-time overdraft checks, daily compound interest calculations, automated backup timestamping, and instant notification dispatches upon high-value withdrawals.
            </p>
          </div>

          {/* Item 5 */}
          <div className="bg-[#151515] p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Advanced Reporting</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Provides Branch Managers and DBAs with interactive analytical tools, liquidity metrics, revenue graphs, account statement generation, and downloadable PDF/CSV exports.
            </p>
          </div>

          {/* Item 6 */}
          <div className="bg-[#151515] p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Loan Management & Security</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Structured credit risk assessment, interest rate modeling, EMI amortization tables, manager approval gates, and 256-bit encrypted data persistence.
            </p>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="bg-gradient-to-r from-blue-900/40 via-slate-900 to-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">Experience the Enterprise Banking System Interface</h2>
          <p className="text-xs text-slate-300 max-w-xl mx-auto">
            Test all four role dashboards (Customer, Teller, Branch Manager, Database Administrator) with live interactive forms, tables, and receipts.
          </p>
          <button
            onClick={onNavigateLogin}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm glow-primary inline-flex items-center gap-2"
          >
            Go to System Login <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#0B0B0B] border-t border-slate-800 py-6 text-center text-xs text-slate-500 mt-auto">
        <p>© 2026 Apex Relational Bank Management System.</p>
      </footer>
    </div>
  );
};
