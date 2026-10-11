import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  X,
  CheckCircle2,
  ShieldAlert,
  Loader2,
} from 'lucide-react';

import { UserRole } from '../../types/bank';
import API from '../../services/api';

interface LoginViewProps {
  onLoginSuccess: (userData: any, role: UserRole) => void;
  onNavigateRegister: (role: UserRole) => void;
  onNavigateLanding: () => void;
  initialRole?: UserRole;
  prefilledEmail?: string;
}

// Ensure this line has "export const LoginView"
export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  onNavigateRegister,
  onNavigateLanding,
  initialRole = 'customer',
  prefilledEmail = '',
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);

  const [username, setUsername] = useState(prefilledEmail);
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const [loggingIn, setLoggingIn] = useState(false);
  const [welcomeName, setWelcomeName] = useState('');

  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  React.useEffect(() => {
    if (initialRole) {
      setSelectedRole(initialRole);
    }
  }, [initialRole]);

  React.useEffect(() => {
    if (prefilledEmail) {
      setUsername(prefilledEmail);
    }
  }, [prefilledEmail]);

  const rolePresets: Record<UserRole, { label: string; icon: React.ReactNode; desc: string }> = {
    customer: {
      label: 'Customer',
      icon: <User className="w-4 h-4" />,
      desc: 'View accounts, transactions, statements, and loans',
    },
    admin: {
      label: 'Bank Admin',
      icon: <ShieldAlert className="w-4 h-4" />,
      desc: 'Manage customers, accounts, loans, branches, and reports',
    },
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setUsername('');
    setPassword('');
    setErrorMessage('');
  };

  // LIVE DATABASE LOGIN
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please enter your email and password.');
      return;
    }

    setLoggingIn(true);

    try {
      const response = await API.post('/auth/login', { 
        email: username, 
        password: password,
        requiredRole: selectedRole
      });
      
      const realRole = (response.data.user.role || 'customer').toLowerCase() as UserRole;
      if (realRole !== selectedRole) {
        setLoggingIn(false);
        const registeredRole = realRole === 'admin' ? 'Bank Admin' : 'Customer';
        const allowedPortal = realRole === 'admin' ? 'Bank Admin Portal' : 'Customer Portal';
        const attemptedPortal = selectedRole === 'admin' ? 'Bank Admin Portal' : 'Customer Portal';
        setErrorMessage(`Access Denied: This account was created as a ${registeredRole}. You can only log in through the ${allowedPortal}, not the ${attemptedPortal}.`);
        return;
      }

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      setWelcomeName(response.data.user.name);
      
      setTimeout(() => {
        onLoginSuccess(response.data.user, realRole);
      }, 1500);

    } catch (error: any) {
      setLoggingIn(false);
      setErrorMessage(error.response?.data?.error || 'Invalid email or password.');
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotSubmitted(true);
    setTimeout(() => {
      setForgotSubmitted(false);
      setForgotModalOpen(false);
      setForgotEmail('');
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-x-hidden font-sans">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

      <header className="relative z-10 max-w-7xl mx-auto w-full py-4 flex items-center justify-between">
        <button onClick={onNavigateLanding} className="flex items-center gap-3 text-left focus:outline-none group">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform glow-primary">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-wider text-white block leading-none">
              APEX<span className="text-blue-500">BANK</span>
            </span>
            <span className="text-[10px] text-cyan-400 font-semibold uppercase tracking-widest">
              Enterprise Relational BMS
            </span>
          </div>
        </button>
        <button onClick={onNavigateLanding} className="text-xs text-slate-400 hover:text-white transition-colors">
          ← Main Site
        </button>
      </header>

      <main className="relative z-10 max-w-xl mx-auto w-full my-auto py-8">
        <div className="bg-[#151515] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl glass-panel glow-primary">
          <div className="text-center mb-6 space-y-1">
            <h1 className="text-2xl font-extrabold text-white">System Security Authentication</h1>
            <p className="text-xs text-slate-400">Select your authorization role to enter the system</p>
          </div>

          <div className="mb-6 space-y-2">
            <div className="grid grid-cols-2 gap-3">
              {(['customer', 'admin'] as UserRole[]).map((role) => {
                const isSelected = selectedRole === role;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleRoleSelect(role)}
                    className={`p-4 rounded-xl text-xs font-semibold flex flex-col items-center gap-2 transition border ${
                      isSelected
                        ? role === 'admin'
                          ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30 glow-primary'
                          : 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30 glow-primary'
                        : 'bg-[#0B0B0B] text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {rolePresets[role].icon}
                    <span>{rolePresets[role].label}</span>
                  </button>
                );
              })}
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 text-center">
              {selectedRole === 'admin' ? (
                <span>⚡ <strong>Bank Admin Portal</strong>: Only accounts created as <strong>Bank Admin</strong> can log in here.</span>
              ) : (
                <span>🛡️ <strong>Customer Portal</strong>: Only accounts created as <strong>Customer</strong> can log in here.</span>
              )}
            </div>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your registered email"
                  className="w-full bg-[#0B0B0B] border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">Password</label>
                <button type="button" onClick={() => setForgotModalOpen(true)} className="text-[11px] text-blue-400 hover:underline">
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-[#0B0B0B] border border-slate-800 rounded-xl py-2.5 pl-10 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all font-mono"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-3 text-slate-400 hover:text-white">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className={`w-full py-3.5 mt-4 text-white rounded-xl text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-2 glow-primary disabled:opacity-70 ${
                selectedRole === 'admin'
                  ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30'
                  : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30'
              }`}
            >
              <span>{selectedRole === 'admin' ? 'Authenticate & Enter Bank Admin Portal' : 'Authenticate & Enter Customer Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400 border-t border-slate-800 pt-4 flex flex-col items-center gap-2">
            <div>
              Don't have a registered account yet?{' '}
              <button
                type="button"
                onClick={() => onNavigateRegister(selectedRole)}
                className={`font-semibold underline transition-colors ${
                  selectedRole === 'admin' ? 'text-purple-400 hover:text-purple-300' : 'text-blue-400 hover:text-blue-300'
                }`}
              >
                {selectedRole === 'admin' ? 'Register Bank Admin Account' : 'Open Customer Account'}
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              {selectedRole === 'admin'
                ? '⚡ Clicking above opens the Bank Admin Registration Form.'
                : '🛡️ Clicking above opens the Customer Registration Form.'}
            </p>
          </div>
        </div>
      </main>

      {loggingIn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-[#151515] border border-slate-800 rounded-2xl p-8 max-w-sm w-full text-center space-y-4 shadow-2xl glow-primary">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Login Successful</h3>
              <p className="text-sm font-semibold text-blue-400 mt-1">Welcome, {welcomeName}</p>
            </div>
          </div>
        </div>
      )}

      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#151515] border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button onClick={() => setForgotModalOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-1">Reset Password</h3>
            <p className="text-xs text-slate-400 mb-4">Enter your email address to receive password reset instructions.</p>
            {forgotSubmitted ? (
              <div className="p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>Instructions dispatched to your inbox.</span>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <input type="email" required value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="name@domain.com" className="w-full bg-[#0B0B0B] border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-blue-500" />
                <div className="flex gap-3">
                  <button type="button" onClick={() => setForgotModalOpen(false)} className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold">Cancel</button>
                  <button type="submit" className="w-1/2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold">Send</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <footer className="relative z-10 max-w-7xl mx-auto w-full text-center text-[11px] text-slate-500 py-2">
        © 2026 Apex Relational Bank Management System.
      </footer>
    </div>
  );
};