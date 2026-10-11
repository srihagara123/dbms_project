import React, { useState } from 'react';
import {
  ShieldCheck,
  CreditCard,
  Lock,
  ArrowRight,
  TrendingUp,
  Zap,
  Globe,
  CheckCircle2,
  Users,
  Building2,
  Phone,
  Mail,
  MapPin,
  Database,
  Cpu,
  Code2,
  Layers,
  FileSpreadsheet,
  Workflow,
  Sparkles,
  ChevronRight,
  Server,
  FileCheck,
} from 'lucide-react';
import { PublicPage } from '../../types/bank';

interface LandingViewProps {
  onNavigateLogin: () => void;
  onNavigatePage: (page: PublicPage) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onNavigateLogin,
  onNavigatePage,
}) => {
  const [activeTechTab, setActiveTechTab] = useState<'relational' | 'frontend'>('relational');

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white font-sans flex flex-col relative overflow-x-hidden">
      {/* Background Lighting Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* 1. Sticky Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#0B0B0B]/90 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Project Name */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigatePage('landing')}>
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30 glow-primary">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white block leading-none font-sans">
                APEX<span className="text-blue-500">BANK</span>
              </span>
              <span className="text-[10px] text-cyan-400 font-semibold tracking-widest uppercase">
                Relational BMS
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <button onClick={() => onNavigatePage('landing')} className="hover:text-blue-400 transition-colors">
              Home
            </button>
            <a href="#features" className="hover:text-blue-400 transition-colors">
              Features
            </a>
            <a href="#technology" className="hover:text-blue-400 transition-colors">
              Technology
            </a>
            <button onClick={() => onNavigatePage('about')} className="hover:text-blue-400 transition-colors">
              About
            </button>
            <button onClick={() => onNavigatePage('contact')} className="hover:text-blue-400 transition-colors">
              Contact
            </button>
          </nav>

          {/* Login Button */}
          <div className="flex items-center gap-3">
            <button
              id="landing-login-btn"
              onClick={onNavigateLogin}
              className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-600/30 transition-all glow-primary flex items-center gap-2"
            >
              <span>Access System Login</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative z-10 py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Headline & Call to action */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wide">
              <Sparkles className="w-4 h-4 text-emerald-400" /> Enterprise Relational Banking Core
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
              Enterprise-Grade <span className="text-blue-500">Relational Bank</span> Management System
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              A high-availability financial management solution built on atomic transaction processing, granular Role-Based Access Control (RBAC), database trigger monitoring, and real-time ledger accounting.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <button
                id="hero-launch-app-btn"
                onClick={onNavigateLogin}
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-base rounded-xl shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-3 glow-primary"
              >
                <span>Launch Enterprise Console</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => onNavigatePage('about')}
                className="w-full sm:w-auto px-8 py-4 bg-[#151515] hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-base rounded-xl border border-slate-800 transition-all"
              >
                System Architecture
              </button>
            </div>
          </div>

          {/* Right Banking Illustration / Interactive Card Visual */}
          <div className="lg:col-span-5 relative">
            <div className="bg-[#151515] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden glass-card-accent">
              <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/30">
                    AB
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Apex Vault Core</p>
                    <p className="text-xs text-slate-400 font-mono">PostgreSQL Relational Node</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/30">
                  Online 99.999%
                </span>
              </div>

              <div className="my-6">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Vault Capitalization</p>
                <p className="text-3xl font-extrabold text-white mt-1 font-mono-num">
                  ₹1,24,500 Crores <span className="text-xs text-slate-400 font-normal">INR</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-[#0B0B0B] p-3 rounded-xl border border-slate-800 text-xs">
                  <span className="text-slate-400 block mb-1">ACID Ledger Engine</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Synchronized
                  </span>
                </div>
                <div className="bg-[#0B0B0B] p-3 rounded-xl border border-slate-800 text-xs">
                  <span className="text-slate-400 block mb-1">Audit Log Stream</span>
                  <span className="text-cyan-400 font-semibold flex items-center gap-1">
                    <Server className="w-3.5 h-3.5" /> Active Triggers
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Statistics Section */}
      <section className="py-16 bg-[#151515] border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-extrabold text-blue-500 font-mono-num">2,450,000+</p>
            <p className="text-xs uppercase tracking-wider font-bold text-slate-400">Verified Customers</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-extrabold text-cyan-400 font-mono-num">450+</p>
            <p className="text-xs uppercase tracking-wider font-bold text-slate-400">Regional Branches</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono-num">₹14,800+ Crores</p>
            <p className="text-xs uppercase tracking-wider font-bold text-slate-400">Daily Cleared Volume</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-mono-num">ISO 27001</p>
            <p className="text-xs uppercase tracking-wider font-bold text-slate-400">Security Certified</p>
          </div>
        </div>
      </section>

      {/* 4. Features Section */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-xs uppercase font-extrabold text-blue-500 tracking-widest">Enterprise Core Capabilities</h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white">Bank Management Features</p>
          <p className="text-sm text-slate-400">
            Engineered precisely according to institutional banking protocols and relational database constraints.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-[#151515] p-6 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Role-Based Access Control (RBAC)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enforces strict access partitions for Customers, Bank Tellers, Branch Managers, and Database Administrators with modular permission matrices.
            </p>
          </div>

          <div className="bg-[#151515] p-6 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Secure Authentication</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enterprise login verification, multi-tier credential validation, active session tracking, and timed logout protocols.
            </p>
          </div>

          <div className="bg-[#151515] p-6 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Atomic Transactions</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              ACID-compliant processing guarantees that fund transfers, deposits, and withdrawals complete entirely or rollback on failure.
            </p>
          </div>

          <div className="bg-[#151515] p-6 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Audit Logs</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Immutable logging captures every database mutation, recording user, timestamp, action, old value, and new value for compliance audits.
            </p>
          </div>

          <div className="bg-[#151515] p-6 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
              <Workflow className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Database Triggers</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated database triggers calculate interest rates, monitor overdraft thresholds, and dispatch fraud alerts automatically.
            </p>
          </div>

          <div className="bg-[#151515] p-6 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Loan Management & Reporting</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              End-to-end loan application workflows with EMI calculations, manager approval queues, and customizable branch reports.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Technology Stack Section */}
      <section id="technology" className="py-20 bg-[#151515] border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <h2 className="text-xs uppercase font-extrabold text-blue-500 tracking-widest">Technical Foundation</h2>
            <p className="text-3xl font-extrabold text-white">Relational Stack & UI Technologies</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
            <div className="bg-[#0B0B0B] p-5 rounded-xl border border-slate-800 flex flex-col items-center justify-center gap-2">
              <Database className="w-8 h-8 text-blue-500" />
              <span className="text-sm font-bold text-white">PostgreSQL</span>
              <span className="text-[10px] text-slate-500">Relational DBMS</span>
            </div>
            <div className="bg-[#0B0B0B] p-5 rounded-xl border border-slate-800 flex flex-col items-center justify-center gap-2">
              <Server className="w-8 h-8 text-cyan-400" />
              <span className="text-sm font-bold text-white">MySQL</span>
              <span className="text-[10px] text-slate-500">Structured Data</span>
            </div>
            <div className="bg-[#0B0B0B] p-5 rounded-xl border border-slate-800 flex flex-col items-center justify-center gap-2">
              <Code2 className="w-8 h-8 text-amber-500" />
              <span className="text-sm font-bold text-white">HTML5</span>
              <span className="text-[10px] text-slate-500">Semantic Markup</span>
            </div>
            <div className="bg-[#0B0B0B] p-5 rounded-xl border border-slate-800 flex flex-col items-center justify-center gap-2">
              <Layers className="w-8 h-8 text-blue-400" />
              <span className="text-sm font-bold text-white">CSS3 / Tailwind</span>
              <span className="text-[10px] text-slate-500">Dark FinTech UI</span>
            </div>
            <div className="bg-[#0B0B0B] p-5 rounded-xl border border-slate-800 flex flex-col items-center justify-center gap-2">
              <Cpu className="w-8 h-8 text-emerald-400" />
              <span className="text-sm font-bold text-white">JavaScript / TS</span>
              <span className="text-[10px] text-slate-500">Client Engine</span>
            </div>
            <div className="bg-[#0B0B0B] p-5 rounded-xl border border-slate-800 flex flex-col items-center justify-center gap-2">
              <Globe className="w-8 h-8 text-purple-400" />
              <span className="text-sm font-bold text-white">Responsive UI</span>
              <span className="text-[10px] text-slate-500">All Devices</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="bg-[#0B0B0B] border-t border-slate-800 text-slate-400 py-12 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                AB
              </div>
              <span className="text-base font-bold text-white">Apex Bank System</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Enterprise-Grade Relational Bank Management System for institutional banking, teller ops, branch metrics, and DBA control.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold text-white uppercase tracking-wider">Navigation</p>
            <ul className="space-y-1.5 text-slate-400">
              <li><button onClick={() => onNavigatePage('landing')} className="hover:text-white">Home</button></li>
              <li><button onClick={() => onNavigatePage('about')} className="hover:text-white">About System</button></li>
              <li><button onClick={() => onNavigatePage('contact')} className="hover:text-white">Contact & FAQs</button></li>
              <li><button onClick={onNavigateLogin} className="hover:text-white">System Login</button></li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold text-white uppercase tracking-wider">Core Roles</p>
            <ul className="space-y-1.5 text-slate-400">
              <li>Customer Portal</li>
              <li>Bank Teller Desk</li>
              <li>Branch Manager Executive</li>
              <li>Database Administrator</li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold text-white uppercase tracking-wider">Security & HQ</p>
            <p className="flex items-center gap-2 text-slate-400">
              <Building2 className="w-4 h-4 text-blue-500" /> Bandra-Kurla Complex (BKC), Mumbai, India
            </p>
            <p className="flex items-center gap-2 text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> ACID Compliant Database
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-500">
          <p>© 2026 Apex Relational Bank Management System. Production UI Prototype.</p>
          <div className="flex gap-4">
            <span>Terms of Service</span>
            <span>Security Policy</span>
            <span>Audit Protocols</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
