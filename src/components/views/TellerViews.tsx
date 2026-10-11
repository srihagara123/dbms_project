import React, { useState } from 'react';
import {
  Search,
  PlusCircle,
  MinusCircle,
  FileCheck2,
  ListOrdered,
  History,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  ShieldCheck,
  Play,
  Check,
  Building2,
  RotateCcw,
  DollarSign,
  Printer,
  KeyRound,
  FileText,
  AlertCircle,
  Calculator,
} from 'lucide-react';
import { Customer, BankAccount, Transaction, ChequeItem } from '../../types/bank';
import { INITIAL_CHEQUES, INITIAL_TELLER_QUEUE } from '../../data/mockData';

interface TellerViewsProps {
  currentTab: string;
  customers: Customer[];
  accounts: BankAccount[];
  transactions: Transaction[];
  onOpenActionModal: (action: 'deposit' | 'withdraw' | 'transfer', acc?: BankAccount) => void;
  onShowToast: (title: string, desc: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  onProcessDeposit?: (accountId: string, amount: number) => void;
  onProcessWithdrawal?: (accountId: string, amount: number) => void;
}

// ----------------------------------------------------------------------
// 1. TELLER DASHBOARD
// ----------------------------------------------------------------------
export const TellerDashboardView: React.FC<TellerViewsProps> = ({
  customers,
  accounts,
  transactions,
  onOpenActionModal,
  onShowToast,
}) => {
  const [queue, setQueue] = useState(INITIAL_TELLER_QUEUE);

  const handleCallNext = () => {
    if (queue.length === 0) return;
    const updated = queue.map((q, idx) => {
      if (idx === 0) return { ...q, status: 'Completed' };
      if (idx === 1) return { ...q, status: 'In Progress' };
      return q;
    });
    setQueue(updated);
    onShowToast('Queue Advanced', `Calling Next Ticket #${queue[1]?.ticketNumber || 'Completed'}.`, 'info');
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#1E293B] border border-slate-700 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Teller Terminal #04
            </span>
            <span className="text-xs text-slate-400 font-mono">Branch: New York Wall Street</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Bank Teller Operations Desk</h1>
          <p className="text-xs text-slate-300">
            Process cash deposits, withdrawals, cheque clearing, and customer queue management.
          </p>
        </div>

        <button
          onClick={handleCallNext}
          className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all"
        >
          <Play className="w-4 h-4" />
          <span>Call Next Customer in Queue</span>
        </button>
      </div>

      {/* Quick Action Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <button
          onClick={() => onOpenActionModal('deposit')}
          className="p-6 rounded-3xl bg-[#1E293B] border border-slate-700 hover:border-emerald-500 text-left transition-all group shadow-xl"
        >
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl w-fit group-hover:scale-110 transition-transform">
            <PlusCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mt-4">Cash Deposit Terminal</h3>
          <p className="text-xs text-slate-400 mt-1">Instant ledger credit with audit logging</p>
        </button>

        <button
          onClick={() => onOpenActionModal('withdraw')}
          className="p-6 rounded-3xl bg-[#1E293B] border border-slate-700 hover:border-rose-500 text-left transition-all group shadow-xl"
        >
          <div className="p-3 bg-rose-500/20 text-rose-400 rounded-2xl w-fit group-hover:scale-110 transition-transform">
            <MinusCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mt-4">Cash Withdrawal Terminal</h3>
          <p className="text-xs text-slate-400 mt-1">Balance verification check & debit</p>
        </button>

        <div className="p-6 rounded-3xl bg-[#1E293B] border border-slate-700 shadow-xl">
          <div className="p-3 bg-blue-500/20 text-blue-400 rounded-2xl w-fit">
            <UserCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mt-4">Queue Status</h3>
          <p className="text-xs text-slate-400 mt-1">{queue.filter(q => q.status !== 'Completed').length} Customers Waiting</p>
        </div>
      </div>

      {/* Live Teller Queue Table */}
      <div className="bg-[#1E293B] p-6 rounded-3xl border border-slate-700 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <ListOrdered className="w-5 h-5 text-emerald-400" />
          Active Customer Counter Queue
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 uppercase text-[10px] font-bold">
                <th className="pb-3 pl-2">Ticket #</th>
                <th className="pb-3">Customer Name</th>
                <th className="pb-3">Service Required</th>
                <th className="pb-3">Wait Time</th>
                <th className="pb-3 pr-2">Queue Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {queue.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/50">
                  <td className="py-3 pl-2 font-bold text-emerald-400">{item.ticketNumber}</td>
                  <td className="py-3 font-sans text-white font-bold">{item.customerName}</td>
                  <td className="py-3 font-sans text-slate-300">{item.serviceType}</td>
                  <td className="py-3 text-slate-400">{item.waitTimeMin} mins</td>
                  <td className="py-3 pr-2">
                    {item.status === 'In Progress' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        In Counter Service
                      </span>
                    )}
                    {item.status === 'Waiting' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        Waiting
                      </span>
                    )}
                    {item.status === 'Completed' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Completed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// 2. TELLER DEPOSIT PROCESSING VIEW
// ----------------------------------------------------------------------
export const TellerDepositView: React.FC<{
  customers: Customer[];
  accounts: BankAccount[];
  transactions: Transaction[];
  onShowToast: (title: string, desc: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  onProcessDeposit?: (accountId: string, amount: number) => void;
}> = ({ customers, accounts, transactions, onShowToast, onProcessDeposit }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccId, setSelectedAccId] = useState<string>(accounts[0]?.id || '');
  const [depositAmount, setDepositAmount] = useState<number>(1000);

  // Cash Denomination breakdown state (Indian Rupee Denominations)
  const [notes500, setNotes500] = useState<number>(2);
  const [notes200, setNotes200] = useState<number>(0);
  const [notes100, setNotes100] = useState<number>(0);
  const [notes50, setNotes50] = useState<number>(0);
  const [notes20, setNotes20] = useState<number>(0);
  const [notes10, setNotes10] = useState<number>(0);

  const calculatedTotal =
    notes500 * 500 + notes200 * 200 + notes100 * 100 + notes50 * 50 + notes20 * 20 + notes10 * 10;

  const selectedAcc = accounts.find((a) => a.id === selectedAccId) || accounts[0];
  const selectedCustomer = customers.find((c) => c.name === selectedAcc?.customerName) || customers[0];

  const filteredAccounts = accounts.filter(
    (a) =>
      a.accountNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.iban.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (depositAmount <= 0) {
      onShowToast('Validation Error', 'Deposit amount must be greater than zero.', 'error');
      return;
    }

    if (calculatedTotal !== depositAmount) {
      onShowToast(
        'Denomination Mismatch',
        `Physical cash sum (₹${calculatedTotal.toLocaleString('en-IN')}) does not match deposit input (₹${depositAmount.toLocaleString('en-IN')}).`,
        'warning'
      );
      return;
    }

    if (onProcessDeposit) {
      onProcessDeposit(selectedAcc.id, depositAmount);
    }

    onShowToast(
      'Deposit Credit Processed',
      `₹${depositAmount.toLocaleString('en-IN')} INR credited to Account #${selectedAcc?.accountNumber}. Cash ledger updated.`,
      'success'
    );
  };

  const depositHistory = transactions.filter((t) => t.type === 'Deposit');

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#1E293B] border border-slate-700 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Teller Deposit Terminal
            </span>
            <span className="text-xs text-slate-400 font-mono">Teller Station #04</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Cash Deposit & Verification Processing</h1>
          <p className="text-xs text-slate-300">
            Verify customer identity, calculate cash denomination breakdown, and execute atomic deposit ledger credit.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Verification & Denominations Form */}
        <div className="lg:col-span-7 bg-[#1E293B] p-6 rounded-3xl border border-slate-700 shadow-xl space-y-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-700 pb-3">
            <PlusCircle className="w-5 h-5 text-emerald-400" />
            1. Customer Account Verification & Selection
          </h2>

          <div className="space-y-4">
            {/* Search */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Search Customer / Account # / SSN</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter name, account #, or IBAN..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Select Account */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Account</label>
              <select
                value={selectedAccId}
                onChange={(e) => setSelectedAccId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {filteredAccounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.customerName} — {a.type} (#{a.accountNumber}) — Bal: ₹{a.balance.toLocaleString('en-IN')} INR
                  </option>
                ))}
              </select>
            </div>

            {/* Customer Verification Card */}
            {selectedAcc && (
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedCustomer?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
                    alt={selectedAcc.customerName}
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-500 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-white">{selectedAcc.customerName}</p>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {selectedCustomer?.status || 'Verified KYC'}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-slate-400 mt-0.5">IBAN: {selectedAcc.iban}</p>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <p className="text-[10px] text-slate-400 uppercase">Available Balance</p>
                  <p className="text-lg font-extrabold text-emerald-400">₹{selectedAcc.balance.toLocaleString('en-IN')} INR</p>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleDepositSubmit} className="space-y-4 pt-2 border-t border-slate-700">
            <h2 className="text-base font-bold text-white flex items-center gap-2 pt-2">
              <Calculator className="w-5 h-5 text-emerald-400" />
              2. Deposit Amount & Cash Denomination Breakdown
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Declared Deposit Amount (₹ INR)</label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-3 text-sm font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Cash Denominations Grid */}
            <div className="p-4 rounded-2xl bg-black/40 border border-slate-800 space-y-3">
              <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Physical Cash Denomination Counter (INR)</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div>
                  <span className="text-slate-400">₹500 Notes</span>
                  <input
                    type="number"
                    min={0}
                    value={notes500}
                    onChange={(e) => setNotes500(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white mt-1"
                  />
                </div>
                <div>
                  <span className="text-slate-400">₹200 Notes</span>
                  <input
                    type="number"
                    min={0}
                    value={notes200}
                    onChange={(e) => setNotes200(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white mt-1"
                  />
                </div>
                <div>
                  <span className="text-slate-400">₹100 Notes</span>
                  <input
                    type="number"
                    min={0}
                    value={notes100}
                    onChange={(e) => setNotes100(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white mt-1"
                  />
                </div>
                <div>
                  <span className="text-slate-400">₹50 Notes</span>
                  <input
                    type="number"
                    min={0}
                    value={notes50}
                    onChange={(e) => setNotes50(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white mt-1"
                  />
                </div>
                <div>
                  <span className="text-slate-400">₹20 Notes</span>
                  <input
                    type="number"
                    min={0}
                    value={notes20}
                    onChange={(e) => setNotes20(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white mt-1"
                  />
                </div>
                <div>
                  <span className="text-slate-400">₹10 Notes</span>
                  <input
                    type="number"
                    min={0}
                    value={notes10}
                    onChange={(e) => setNotes10(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white mt-1"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs font-mono font-bold">
                <span className="text-slate-300">Total Counted Cash Sum:</span>
                <span className={calculatedTotal === depositAmount ? 'text-emerald-400' : 'text-rose-400 font-extrabold'}>
                  ₹{calculatedTotal.toLocaleString('en-IN')} INR {calculatedTotal !== depositAmount && `(Mismatch ₹${calculatedTotal - depositAmount})`}
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Execute Deposit Transaction & Generate Receipt</span>
            </button>
          </form>
        </div>

        {/* Right: Deposit History */}
        <div className="lg:col-span-5 bg-[#1E293B] p-6 rounded-3xl border border-slate-700 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center justify-between border-b border-slate-700 pb-3">
            <span>Recent Counter Deposit Logs</span>
            <span className="text-xs text-slate-400 font-mono">{depositHistory.length} Recorded</span>
          </h2>

          <div className="space-y-3">
            {depositHistory.map((t) => (
              <div key={t.id} className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs font-mono">
                <div>
                  <p className="font-bold text-white font-sans">{t.senderName}</p>
                  <p className="text-[10px] text-slate-400">{t.referenceNumber} • {t.time}</p>
                </div>
                <span className="text-sm font-bold text-emerald-400">+₹{t.amount.toLocaleString('en-IN')} INR</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// 3. TELLER WITHDRAWAL PROCESSING VIEW
// ----------------------------------------------------------------------
export const TellerWithdrawalView: React.FC<{
  customers: Customer[];
  accounts: BankAccount[];
  transactions: Transaction[];
  onShowToast: (title: string, desc: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  onProcessWithdrawal?: (accountId: string, amount: number) => void;
}> = ({ customers, accounts, transactions, onShowToast, onProcessWithdrawal }) => {
  const [selectedAccId, setSelectedAccId] = useState<string>(accounts[0]?.id || '');
  const [amount, setAmount] = useState<number>(500);

  // Identity OTP verification step
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);

  const selectedAcc = accounts.find((a) => a.id === selectedAccId) || accounts[0];
  const selectedCustomer = customers.find((c) => c.name === selectedAcc?.customerName) || customers[0];

  const handleSendOTP = () => {
    setOtpSent(true);
    setOtpInput('482901'); // Pre-fill mock OTP for smooth verification
    onShowToast('OTP Dispatched', `6-Digit OTP security code sent to customer phone ${selectedCustomer?.phone || '+1 555-0192'}.`, 'info');
  };

  const handleVerifyOTP = () => {
    if (otpInput === '482901' || otpInput.length === 6) {
      setOtpVerified(true);
      onShowToast('Identity Verified', 'Customer OTP identity authorization confirmed.', 'success');
    } else {
      onShowToast('Invalid OTP', 'The OTP code entered is incorrect.', 'error');
    }
  };

  const handleWithdrawalSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (amount <= 0) {
      onShowToast('Validation Error', 'Withdrawal amount must be greater than zero.', 'error');
      return;
    }

    if (amount > selectedAcc.balance) {
      onShowToast(
        'Insufficient Balance',
        `Account balance ($${selectedAcc.balance.toLocaleString()}) is less than requested withdrawal ($${amount.toLocaleString()}).`,
        'error'
      );
      return;
    }

    if (amount > 50000 && !otpVerified) {
      onShowToast('Withdrawal Limit Exceeded', 'Withdrawals over ₹50,000 require customer OTP identity verification.', 'warning');
      return;
    }

    if (onProcessWithdrawal) {
      onProcessWithdrawal(selectedAcc.id, amount);
    }

    onShowToast(
      'Withdrawal Executed',
      `₹${amount.toLocaleString('en-IN')} INR debited from Account #${selectedAcc?.accountNumber}. Cash handed to customer.`,
      'success'
    );
  };

  const withdrawalHistory = transactions.filter((t) => t.type === 'Withdrawal');

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#1E293B] border border-slate-700 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30">
              Teller Withdrawal Terminal
            </span>
            <span className="text-xs text-slate-400 font-mono">Teller Station #04</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Cash Withdrawal & OTP Identity Verification</h1>
          <p className="text-xs text-slate-300">
            Verify customer identity with 2FA OTP, validate balance limits, and process cash debit.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-[#1E293B] p-6 rounded-3xl border border-slate-700 shadow-xl space-y-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-700 pb-3">
            <MinusCircle className="w-5 h-5 text-rose-400" />
            Withdrawal Account & Identity Check
          </h2>

          <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Select Account</label>
              <select
                value={selectedAccId}
                onChange={(e) => setSelectedAccId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.customerName} — {a.type} (#{a.accountNumber}) — Bal: ₹{a.balance.toLocaleString('en-IN')} INR
                  </option>
                ))}
              </select>
            </div>

            {selectedAcc && (
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">{selectedAcc.customerName}</p>
                  <p className="text-[10px] font-mono text-slate-400">Account #{selectedAcc.accountNumber}</p>
                </div>
                <div className="text-right font-mono">
                  <p className="text-[10px] text-slate-400 uppercase">Available Balance</p>
                  <p className="text-lg font-extrabold text-emerald-400">₹{selectedAcc.balance.toLocaleString('en-IN')} INR</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Requested Withdrawal Amount (₹ INR)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-3 text-sm font-mono font-bold text-rose-400 focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* OTP Security Verification Block */}
            <div className="p-4 rounded-2xl bg-black/40 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  Customer 2FA Identity OTP Verification
                </span>
                {otpVerified ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    OTP Verified
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Verification Required
                  </span>
                )}
              </div>

              {!otpSent ? (
                <button
                  type="button"
                  onClick={handleSendOTP}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700"
                >
                  Send OTP Code to Customer Phone
                </button>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    placeholder="Enter 6-digit OTP code"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOTP}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold"
                  >
                    Confirm OTP
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/20 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Execute Withdrawal & Hand Cash</span>
            </button>
          </form>
        </div>

        {/* Withdrawal Logs */}
        <div className="lg:col-span-5 bg-[#1E293B] p-6 rounded-3xl border border-slate-700 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center justify-between border-b border-slate-700 pb-3">
            <span>Recent Counter Withdrawal Logs</span>
            <span className="text-xs text-slate-400 font-mono">{withdrawalHistory.length} Recorded</span>
          </h2>

          <div className="space-y-3">
            {withdrawalHistory.map((t) => (
              <div key={t.id} className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs font-mono">
                <div>
                  <p className="font-bold text-white font-sans">{t.senderName}</p>
                  <p className="text-[10px] text-slate-400">{t.referenceNumber} • {t.time}</p>
                </div>
                <span className="text-sm font-bold text-rose-400">-₹{t.amount.toLocaleString('en-IN')} INR</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// 4. TELLER DAILY SUMMARY VIEW
// ----------------------------------------------------------------------
export const TellerDailySummaryView: React.FC<{
  transactions: Transaction[];
}> = ({ transactions }) => {
  const totalDeposits = transactions
    .filter((t) => t.type === 'Deposit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalWithdrawals = transactions
    .filter((t) => t.type === 'Withdrawal')
    .reduce((sum, t) => sum + t.amount, 0);

  const netVaultPosition = totalDeposits - totalWithdrawals;

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#1E293B] border border-slate-700 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Daily Ledger Audit
            </span>
            <span className="text-xs text-slate-400 font-mono">Terminal: TELLER-04</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Daily Transaction Processing & Summary</h1>
          <p className="text-xs text-slate-300">
            End-of-day counter ledger balancing, total cash receipts vs disbursements, and vault reconciliation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-[#1E293B] p-5 rounded-2xl border border-slate-700 shadow-md">
          <p className="text-xs text-slate-400 font-semibold">Total Counter Cash Received (Deposits)</p>
          <p className="text-2xl font-black text-emerald-400 font-mono mt-1">+₹{totalDeposits.toLocaleString('en-IN')} INR</p>
        </div>

        <div className="bg-[#1E293B] p-5 rounded-2xl border border-slate-700 shadow-md">
          <p className="text-xs text-slate-400 font-semibold">Total Cash Disbursed (Withdrawals)</p>
          <p className="text-2xl font-black text-rose-400 font-mono mt-1">-₹{totalWithdrawals.toLocaleString('en-IN')} INR</p>
        </div>

        <div className="bg-[#1E293B] p-5 rounded-2xl border border-slate-700 shadow-md">
          <p className="text-xs text-slate-400 font-semibold">Net Vault Counter Balance Shift</p>
          <p className="text-2xl font-black text-blue-400 font-mono mt-1">
            {netVaultPosition >= 0 ? '+' : ''}₹{netVaultPosition.toLocaleString('en-IN')} INR
          </p>
        </div>
      </div>

      <div className="bg-[#1E293B] p-6 rounded-3xl border border-slate-700 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center justify-between border-b border-slate-700 pb-3">
          <span>Today's Processed Transactions</span>
          <span className="text-xs text-slate-400 font-mono">{transactions.length} Transactions</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 uppercase text-[10px] font-bold">
                <th className="pb-3 pl-2">Ref Number</th>
                <th className="pb-3">Time</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Type</th>
                <th className="pb-3 pr-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-800/50">
                  <td className="py-3 pl-2 font-bold text-white">{t.referenceNumber}</td>
                  <td className="py-3 text-slate-300">{t.time}</td>
                  <td className="py-3 font-sans text-slate-200">{t.senderName}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {t.type}
                    </span>
                  </td>
                  <td
                    className={`py-3 pr-2 text-right font-bold ${
                      t.type === 'Deposit' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {t.type === 'Deposit' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')} INR
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// 5. CHEQUE CLEARING TERMINAL
// ----------------------------------------------------------------------
export const ChequeClearingView: React.FC<{
  onShowToast: (title: string, desc: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}> = ({ onShowToast }) => {
  const [cheques, setCheques] = useState<ChequeItem[]>(INITIAL_CHEQUES);

  const handleApprove = (id: string) => {
    setCheques((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'Approved' } : c))
    );
    onShowToast('Cheque Cleared', `Cheque #${id} approved and credited to payee account via MICR clearing.`, 'success');
  };

  const handleReject = (id: string) => {
    setCheques((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'Rejected', rejectionReason: 'Signature mismatch' } : c))
    );
    onShowToast('Cheque Rejected', `Cheque #${id} rejected. Reversal audit entry created.`, 'error');
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#1E293B] border border-slate-700 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30">
              MICR Clearing House
            </span>
            <span className="text-xs text-slate-400 font-mono font-bold">Standard: ANSI X9.100</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Cheque Clearing Terminal</h1>
          <p className="text-xs text-slate-300">
            Magnetic Ink Character Recognition (MICR) cheque image scanner and automated account clearing.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cheques.map((item) => (
          <div key={item.id} className="bg-[#1E293B] p-6 rounded-3xl border border-slate-700 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-blue-400">{item.chequeNumber}</span>
                <p className="text-xs font-bold text-white mt-0.5">{item.bankName}</p>
              </div>
              {item.status === 'Approved' && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Approved & Cleared
                </span>
              )}
              {item.status === 'Pending' && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Pending MICR Scan
                </span>
              )}
              {item.status === 'Rejected' && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  Rejected
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
              <div>
                <p className="text-[10px] font-sans text-slate-400">Drawer</p>
                <p className="font-bold text-white">{item.drawerName}</p>
              </div>
              <div>
                <p className="text-[10px] font-sans text-slate-400">Payee</p>
                <p className="font-bold text-white">{item.payeeName}</p>
              </div>
              <div>
                <p className="text-[10px] font-sans text-slate-400">Amount</p>
                <p className="font-bold text-emerald-400">₹{item.amount.toLocaleString('en-IN')} INR</p>
              </div>
              <div>
                <p className="text-[10px] font-sans text-slate-400">Account #</p>
                <p className="font-bold text-slate-300">{item.accountNumber}</p>
              </div>
            </div>

            {item.rejectionReason && (
              <p className="text-xs text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 font-mono">
                Reason: {item.rejectionReason}
              </p>
            )}

            {item.status === 'Pending' && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handleApprove(item.id)}
                  className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve & Credit
                </button>
                <button
                  onClick={() => handleReject(item.id)}
                  className="py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  Reject Cheque
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
