import React, { useState, useEffect } from 'react';
import { ShieldCheck, User, Mail, Phone, MapPin, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight, ShieldAlert, Building2 } from 'lucide-react';
import API from '../../services/api'; // Connected to live backend

interface RegisterViewProps {
  onRegisterSuccess: (role: 'customer' | 'admin', email: string) => void;
  onNavigateLogin: (role?: 'customer' | 'admin', email?: string) => void;
  onNavigateLanding: () => void;
  initialRole?: 'customer' | 'admin';
}

interface BranchOption {
  id: number;
  name: string;
  code: string;
  location: string;
}

export const RegisterView: React.FC<RegisterViewProps> = ({
  onRegisterSuccess,
  onNavigateLogin,
  onNavigateLanding,
  initialRole = 'customer',
}) => {
  const [selectedRole, setSelectedRole] = useState<'customer' | 'admin'>(initialRole);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string | number>('');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await API.get('/branches');
        if (res.data && res.data.length > 0) {
          setBranches(res.data);
          setSelectedBranchId(res.data[0].id);
        }
      } catch (err) {
        console.warn('Could not fetch branches in register form', err);
      }
    };
    fetchBranches();
  }, []);

  useEffect(() => {
    if (initialRole) {
      setSelectedRole(initialRole);
    }
  }, [initialRole]);

  // LIVE DATABASE REGISTRATION
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (password.length < 6) return setErrorMessage('Password must be at least 6 characters.');
    if (password !== confirmPassword) return setErrorMessage('Passwords do not match.');

    try {
      const targetRole = selectedRole === 'admin' ? 'Admin' : 'Customer';
      // Send the data to your PostgreSQL Backend with target role and assigned branch!
      await API.post('/auth/register', {
        name: fullName,
        email: email,
        phone: mobileNumber,
        address: address,
        city: 'City (Default)',
        dob: '1990-01-01',
        password: password,
        role: targetRole,
        branchId: selectedBranchId,
      });

      setSuccessMessage(
        selectedRole === 'admin'
          ? '⚡ Bank Admin account created successfully! Redirecting to Bank Admin Login...'
          : '🛡️ Customer account created successfully! Redirecting to Customer Login...'
      );
      setTimeout(() => {
        onRegisterSuccess(selectedRole, email);
      }, 1500);

    } catch (error: any) {
      setErrorMessage(error.response?.data?.error || 'Registration failed. Email may already be in use.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-x-hidden font-sans">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      <header className="relative z-10 max-w-7xl mx-auto w-full py-4 flex items-center justify-between">
        <button onClick={onNavigateLanding} className="flex items-center gap-3 text-left focus:outline-none group">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform glow-primary">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-wider text-white block leading-none">APEX<span className="text-blue-500">BANK</span></span>
            <span className="text-[10px] text-cyan-400 font-semibold uppercase tracking-widest">New Account Registration</span>
          </div>
        </button>
        <button onClick={onNavigateLanding} className="text-xs text-slate-400 hover:text-white transition-colors">← Main Site</button>
      </header>

      <main className="relative z-10 max-w-xl mx-auto w-full my-auto py-6">
        <div className={`bg-[#151515] border rounded-2xl p-6 sm:p-8 shadow-2xl glass-panel glow-primary transition-all ${
          selectedRole === 'admin' ? 'border-purple-600/50 shadow-purple-900/20' : 'border-blue-600/40 shadow-blue-900/20'
        }`}>
          <div className="text-center mb-6 space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-2 border">
              {selectedRole === 'admin' ? (
                <span className="bg-purple-500/20 text-purple-300 border-purple-500/30 px-3 py-0.5 rounded-full flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" /> BANK ADMIN ACCESS REGISTRATION
                </span>
              ) : (
                <span className="bg-blue-500/20 text-blue-300 border-blue-500/30 px-3 py-0.5 rounded-full flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> CUSTOMER PORTAL REGISTRATION
                </span>
              )}
            </div>
            <h1 className="text-2xl font-extrabold text-white">
              {selectedRole === 'admin' ? 'Bank Admin Registration Form' : 'Customer Registration Form'}
            </h1>
            <p className="text-xs text-slate-400">
              {selectedRole === 'admin'
                ? 'Accounts created here are authorized ONLY for the Bank Admin Portal.'
                : 'Accounts created here are authorized ONLY for the Customer Portal.'}
            </p>
          </div>

          {/* Account Role Selector */}
          <div className="mb-6 space-y-2">
            <label className="block text-xs font-semibold text-slate-300">Choose Account Type to Create</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedRole('customer')}
                className={`p-3.5 rounded-xl text-xs font-semibold flex flex-col items-center gap-1.5 transition border ${
                  selectedRole === 'customer'
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30 glow-primary ring-2 ring-blue-400/50'
                    : 'bg-[#0B0B0B] text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Customer Account</span>
                <span className="text-[10px] opacity-80">Customer Portal Only</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('admin')}
                className={`p-3.5 rounded-xl text-xs font-semibold flex flex-col items-center gap-1.5 transition border ${
                  selectedRole === 'admin'
                    ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30 glow-primary ring-2 ring-purple-400/50'
                    : 'bg-[#0B0B0B] text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Bank Admin Account</span>
                <span className="text-[10px] opacity-80">Admin Portal Only</span>
              </button>
            </div>
            
            {/* Live Role Guidance Banner */}
            {selectedRole === 'admin' ? (
              <div className="p-3.5 rounded-xl bg-purple-950/50 border border-purple-500/40 text-xs text-purple-200 flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-purple-300 text-xs uppercase tracking-wide">Bank Admin Account Active</p>
                  <p className="text-[11px] text-purple-200/90 mt-0.5">
                    This account will be created with <strong>Bank Administrator</strong> privileges. You can <strong>only log in through the Bank Admin Login form</strong>, not Customer Login.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-blue-950/50 border border-blue-500/40 text-xs text-blue-200 flex items-start gap-2.5">
                <User className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-blue-300 text-xs uppercase tracking-wide">Customer Account Active</p>
                  <p className="text-[11px] text-blue-200/90 mt-0.5">
                    This account will be created with <strong>Customer Banking</strong> privileges. You can <strong>only log in through the Customer Login form</strong>, not Bank Admin Login.
                  </p>
                </div>
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /><span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" /><span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input required type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" className="w-full bg-[#0B0B0B] border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@domain.com" className="w-full bg-[#0B0B0B] border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Mobile Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input required type="text" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} placeholder="+91 9876543210" className="w-full bg-[#0B0B0B] border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Residential Address</label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input required type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street Address, City" className="w-full bg-[#0B0B0B] border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input required type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className="w-full bg-[#0B0B0B] border border-slate-800 rounded-xl py-2.5 pl-10 pr-10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-3 text-slate-400 hover:text-white">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input required type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm your password" className="w-full bg-[#0B0B0B] border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {selectedRole === 'admin' ? 'Assigned Bank Branch (Administration)' : 'Home Branch (Primary Account Branch)'}
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <select
                  required
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="w-full bg-[#0B0B0B] border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 text-xs"
                >
                  {branches.length === 0 ? (
                    <option value="4">Apex Main Branch - Mumbai (APEX0000001)</option>
                  ) : (
                    branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.code}) — {b.location}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {selectedRole === 'admin'
                  ? 'Administrator credentials will be bound to this operational branch.'
                  : 'Your initial accounts and records will be established under this regional branch.'}
              </p>
            </div>

            {selectedRole === 'admin' ? (
              <button
                type="submit"
                className="w-full py-3.5 mt-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 glow-primary"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Register Bank Admin Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                className="w-full py-3.5 mt-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 glow-primary"
              >
                <User className="w-4 h-4" />
                <span>Register Customer Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </form>

          <div className="mt-6 text-center text-xs text-slate-400 border-t border-slate-800 pt-4">
            Already registered?{' '}
            <button
              type="button"
              onClick={() => onNavigateLogin(selectedRole, email)}
              className="text-blue-400 hover:underline font-semibold"
            >
              Sign In to {selectedRole === 'admin' ? 'Bank Admin Portal' : 'Customer Portal'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};