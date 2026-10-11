import React from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  XCircle,
  PlusCircle,
  MinusCircle,
  Send,
  Eye,
  EyeOff,
  Landmark,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { Customer, BankAccount, Transaction } from '../../types/bank';

interface DashboardViewProps {
  currentUser: Customer;
  accounts: BankAccount[];
  transactions: Transaction[];
  globalAccountId?: string;
  setGlobalAccountId?: (id: string) => void;
  onOpenActionModal: (action: 'deposit' | 'withdraw' | 'transfer') => void;
  onSelectTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  accounts,
  transactions,
  globalAccountId,
  setGlobalAccountId,
  onOpenActionModal,
  onSelectTab,
}) => {
  const [showMaskedAccount, setShowMaskedAccount] = React.useState(true);

  const userAccounts = accounts.filter((a) => a.customerName === currentUser.name) || accounts;
  
  // Find the currently active account using the unique globalAccountId
  const primaryAccount = accounts.find((a) => a.id.toString() === globalAccountId) || userAccounts[0] || accounts[0];

  // Individual balance for the active account
  const primaryAccountBalance = Number(primaryAccount?.balance || 0);

  // Filter transactions belonging to this specific account ID, IBAN, or account number
  const accountTransactions = primaryAccount
    ? transactions.filter((t: any) => {
        const matchesId = t.accountId?.toString() === primaryAccount.id?.toString() || t.sourceAccountId?.toString() === primaryAccount.id?.toString();
        const matchesIban = t.senderIban === primaryAccount.iban || t.receiverIban === primaryAccount.iban;
        const matchesAccNum = t.accountNumber === primaryAccount.accountNumber;
        return matchesId || matchesIban || matchesAccNum;
      })
    : transactions;

  const displayTransactions = accountTransactions.length > 0 ? accountTransactions : transactions;

  // Account-specific deposits
  const accountDeposits = displayTransactions
    .filter((t: any) => t.type?.toLowerCase() === 'deposit' && t.status === 'Completed')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Account-specific withdrawals/expenses
  const accountWithdrawals = displayTransactions
    .filter((t: any) => (t.type?.toLowerCase() === 'withdrawal' || t.type?.toLowerCase() === 'transfer') && t.status === 'Completed')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Count all active accounts for this user
  const activeAccountsCount = userAccounts.filter(
    (a) => a.status.toLowerCase() === 'active'
  ).length;

  const getMaskedAccount = (accNum: string) => {
    if (!accNum) return '•••• •••• •••• 1102';
    const last4 = accNum.slice(-4);
    return `•••• •••• •••• ${last4}`;
  };

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Welcome Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-[#1E293B] border border-slate-700/80 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30">
              {currentUser.status} Customer
            </span>
            <span className="text-xs text-slate-400 font-mono">ID: {currentUser.id}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Welcome back, <span className="text-[#3B82F6]">{currentUser.name}</span>!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Here is your financial account balance and system summary overview.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onOpenActionModal('deposit')}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#10B981] hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Deposit</span>
          </button>

          <button
            onClick={() => onOpenActionModal('withdraw')}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#F43F5E] hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-500/20 transition-all"
          >
            <MinusCircle className="w-4 h-4" />
            <span>Withdraw</span>
          </button>

          <button
            onClick={() => onOpenActionModal('transfer')}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#3B82F6] hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Transfer</span>
          </button>
        </div>
      </div>

      {/* Account Selector Dropdown */}
      {userAccounts.length > 1 && (
        <div className="flex items-center justify-between bg-[#1E293B] p-4 rounded-2xl border border-slate-700">
          <span className="text-xs font-semibold text-slate-300">Active View Account:</span>
          <select
            value={primaryAccount?.id}
            onChange={(e) => setGlobalAccountId && setGlobalAccountId(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
          >
            {userAccounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.type} (#{acc.accountNumber}) - ₹{Number(acc.balance).toLocaleString('en-IN')}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 2. Primary Account Overview Card */}
      <div className="bg-gradient-to-br from-[#1E293B] to-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#3B82F6]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/60 pb-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#3B82F6]/20 text-[#3B82F6] flex items-center justify-center">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Account Number</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-lg font-mono font-bold text-white tracking-widest">
                  {showMaskedAccount ? getMaskedAccount(primaryAccount?.accountNumber) : primaryAccount?.accountNumber}
                </span>
                <button
                  type="button"
                  onClick={() => setShowMaskedAccount(!showMaskedAccount)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
                >
                  {showMaskedAccount ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 font-medium">Account Type & IBAN</span>
            <p className="text-sm font-semibold text-white">
              {primaryAccount?.type || 'Savings'} Account
            </p>
            <p className="text-[11px] font-mono text-[#3B82F6] mt-0.5">
              {primaryAccount?.iban || 'IN89APEX000000000000'}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Current Account Balance
          </p>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-3xl sm:text-5xl font-black text-white font-mono-num tracking-tight">
              ₹{primaryAccountBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-sm font-bold text-slate-400">INR</span>
          </div>
        </div>
      </div>

      {/* 3. Isolated Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#1E293B] p-5 rounded-2xl border border-slate-700/80 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-semibold">Account Net Balance</span>
            <div className="p-2 bg-[#3B82F6]/20 text-[#3B82F6] rounded-xl">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white font-mono-num">
            ₹{primaryAccountBalance.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-[#10B981]" /> Isolated to selected account
          </p>
        </div>

        <div className="bg-[#1E293B] p-5 rounded-2xl border border-slate-700/80 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-semibold">Account Deposits</span>
            <div className="p-2 bg-[#10B981]/20 text-[#10B981] rounded-xl">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#10B981] font-mono-num">
            +₹{accountDeposits.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Incoming funds for this account</p>
        </div>

        <div className="bg-[#1E293B] p-5 rounded-2xl border border-slate-700/80 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-semibold">Account Expenses</span>
            <div className="p-2 bg-[#F43F5E]/20 text-[#F43F5E] rounded-xl">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#F43F5E] font-mono-num">
            -₹{accountWithdrawals.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Outgoing transfers for this account</p>
        </div>

        <div className="bg-[#1E293B] p-5 rounded-2xl border border-slate-700/80 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-semibold">Account Status</span>
            <div className="p-2 bg-[#10B981]/20 text-[#10B981] rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white font-mono-num">
            {activeAccountsCount} Active
          </p>
          <p className="text-[10px] text-[#10B981] font-semibold mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Fully Operational
          </p>
        </div>
      </div>

      {/* 4. Recent Transactions Table */}
      <div className="bg-[#1E293B] rounded-3xl border border-slate-700/80 shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">Recent Transactions</h2>
            <p className="text-xs text-slate-400">
              Activity for account #{primaryAccount?.accountNumber}
            </p>
          </div>
          <button
            onClick={() => onSelectTab('transactions')}
            className="text-xs font-semibold text-[#3B82F6] hover:underline"
          >
            View All Transactions →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                <th className="pb-3 pl-2">Transaction ID</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Sender & Receiver</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Date</th>
                <th className="pb-3 pr-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {displayTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                displayTransactions.slice(0, 5).map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 pl-2 font-mono font-bold text-white">
                      {tx.referenceNumber || tx.id}
                    </td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-800 text-slate-200 border border-slate-700">
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <p className="text-white font-semibold">{tx.senderName}</p>
                      <p className="text-[10px] text-slate-400">→ {tx.receiverName}</p>
                    </td>
                    <td className="py-3.5 font-mono font-bold text-white">
                      ₹{Number(tx.amount).toLocaleString('en-IN')} {tx.currency || 'INR'}
                    </td>
                    <td className="py-3.5 text-slate-300 font-mono">
                      {tx.date}
                    </td>
                    <td className="py-3.5 pr-2">
                      {tx.status === 'Completed' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                          <CheckCircle2 className="w-3 h-3" /> Completed
                        </span>
                      )}
                      {tx.status === 'Pending' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                      {tx.status === 'Failed' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F43F5E]/15 text-[#F43F5E] border border-[#F43F5E]/30">
                          <XCircle className="w-3 h-3" /> Failed
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;