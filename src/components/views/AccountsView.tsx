import React, { useState, useEffect } from 'react';
import {
  Landmark,
  CheckCircle2,
  TrendingUp,
  ArrowLeft,
  Clock,
  XCircle,
  CalendarDays,
  Building2,
  Search,
  ShieldCheck,
  AlertTriangle,
  Snowflake,
  Eye,
  Plus,
} from 'lucide-react';
import { BankAccount, Transaction } from '../../types/bank';
import API from '../../services/api';

interface AccountsViewProps {
  accounts: BankAccount[];
  transactions: Transaction[];
  globalAccountId?: string;
  setGlobalAccountId?: (id: string) => void;
  onOpenActionModal?: (
    action: 'deposit' | 'withdraw' | 'transfer',
    targetAccount?: BankAccount
  ) => void;
  onAccountCreated?: () => void;
  isAdmin?: boolean;
}

const money = (amount: number, currency = 'INR') =>
  `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const AccountsView: React.FC<AccountsViewProps> = ({
  accounts,
  transactions,
  globalAccountId,
  setGlobalAccountId,
  onAccountCreated,
  isAdmin = false,
}) => {
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAccountType, setNewAccountType] = useState('Savings');
  const [branches, setBranches] = useState<{ id: number; name: string; code: string; location: string }[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string | number>('');
  const [isCreating, setIsCreating] = useState(false);
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null);
  const [adminProcessingId, setAdminProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await API.get('/branches');
        if (res.data && res.data.length > 0) {
          setBranches(res.data);
          setSelectedBranchId(res.data[0].id);
        }
      } catch (err) {
        console.warn('Could not fetch branches in accounts view:', err);
      }
    };
    fetchBranches();
  }, []);

  const handleAdminProcessDeactivation = async (acc: BankAccount, approve: boolean) => {
    try {
      setAdminProcessingId(acc.id.toString());
      const newStatus = approve ? 'Deactivated' : 'Active';
      await API.patch(`/accounts/${acc.id}/status`, { status: newStatus });
      if (selectedAccount && selectedAccount.id === acc.id) {
        setSelectedAccount((prev) => prev ? { ...prev, status: newStatus } : null);
      }
      if (onAccountCreated) onAccountCreated();
    } catch (err: any) {
      console.error('Failed to update account status:', err);
      alert(err.response?.data?.error || 'Failed to update account status.');
    } finally {
      setAdminProcessingId(null);
    }
  };

  const activeAccounts = accounts.filter(
    (account) => account.status.toLowerCase() === 'active'
  ).length;

  const frozenAccounts = accounts.filter(
    (account) => account.status.toLowerCase() === 'frozen'
  ).length;

  const pendingAccounts = accounts.filter(
    (account) => account.status.toLowerCase() === 'deactivation requested' || account.status.toLowerCase() === 'pending'
  ).length;

  const filteredAccounts = accounts.filter((account) => {
    const search = searchTerm.trim().toLowerCase();
    const matchesSearch =
      account.customerName.toLowerCase().includes(search) ||
      account.accountNumber.toLowerCase().includes(search) ||
      account.id.toString().toLowerCase().includes(search) ||
      account.iban.toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === 'All' ||
      account.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesType =
      typeFilter === 'All' ||
      account.type.toLowerCase() === typeFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesType;
  });

  const scrollMainToTop = () => {
    requestAnimationFrame(() => {
      const main = document.querySelector('main');
      if (main) main.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  const openAccount = (account: BankAccount) => {
    setSelectedAccount(account);
    if (setGlobalAccountId) setGlobalAccountId(account.id.toString());
    scrollMainToTop();
  };

  const backToAccounts = () => {
    setSelectedAccount(null);
    scrollMainToTop();
  };

  const accountTransactions = selectedAccount
    ? transactions.filter(
        (transaction) =>
          transaction.senderIban === selectedAccount.iban ||
          transaction.receiverIban === selectedAccount.iban
      )
    : [];

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const res = await API.post('/accounts/create', {
        accountType: newAccountType,
        initialBalance: 1000,
        branchId: selectedBranchId,
      });
      setIsModalOpen(false);
      if (res.data && res.data.account && setGlobalAccountId) {
        setGlobalAccountId(res.data.account.accountid || res.data.account.id);
      }
      if (onAccountCreated) onAccountCreated();
    } catch (error) {
      console.error('Failed to create account:', error);
      alert('Failed to open account. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleRequestDeactivation = async (acc: BankAccount) => {
    const confirmDeactivation = window.confirm(
      `Are you sure you want to request deactivation for account ${acc.accountNumber}? This will be sent to the bank admin for review.`
    );
    if (!confirmDeactivation) return;

    try {
      setDeactivatingId(acc.id.toString());
      await API.patch(`/accounts/${acc.id}/status`, { status: 'Deactivation Requested' });
      alert('Deactivation request sent successfully! A bank admin will review your request.');
      if (selectedAccount && selectedAccount.id === acc.id) {
        setSelectedAccount((prev) => prev ? { ...prev, status: 'Deactivation Requested' } : null);
      }
      if (onAccountCreated) onAccountCreated();
    } catch (err: any) {
      console.error('Error requesting account deactivation:', err);
      alert(err.response?.data?.error || 'Failed to submit deactivation request.');
    } finally {
      setDeactivatingId(null);
    }
  };

  if (selectedAccount) {
    const acc = selectedAccount;

    return (
      <div className="space-y-6 font-sans">
        <button
          type="button"
          onClick={backToAccounts}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-[#1E293B] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-[#3B82F6] hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Account Records
        </button>

        <section className="rounded-3xl border border-slate-700/80 bg-[#1E293B] p-6 shadow-xl sm:p-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
            <div>
              <span className="inline-flex rounded-full border border-[#3B82F6]/30 bg-[#3B82F6]/20 px-3 py-1 text-xs font-bold text-[#60A5FA]">
                {acc.type} Account
              </span>
              <h1 className="mt-3 text-2xl font-black text-white sm:text-3xl">
                Account Details
              </h1>
              <p className="mt-1 text-sm text-slate-400">Account ID: {acc.id}</p>
              <p className="mt-1 text-sm text-slate-300">
                Account holder: {acc.customerName}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <span
                className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase ${
                  acc.status.toLowerCase() === 'active'
                    ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-400'
                    : acc.status.toLowerCase() === 'deactivation requested'
                    ? 'border-amber-500/30 bg-amber-500/15 text-amber-400'
                    : 'border-rose-500/30 bg-rose-500/15 text-rose-400'
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {acc.status}
              </span>

              {isAdmin && acc.status.toLowerCase() === 'deactivation requested' && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={adminProcessingId === acc.id.toString()}
                    onClick={() => handleAdminProcessDeactivation(acc, true)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 text-xs font-bold transition shadow"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Approve Deactivation
                  </button>
                  <button
                    type="button"
                    disabled={adminProcessingId === acc.id.toString()}
                    onClick={() => handleAdminProcessDeactivation(acc, false)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 text-xs font-bold transition"
                  >
                    <XCircle className="h-3.5 w-3.5" /> Reject Request
                  </button>
                </div>
              )}

              {!isAdmin && acc.status.toLowerCase() === 'active' && (
                <button
                  type="button"
                  disabled={deactivatingId === acc.id.toString()}
                  onClick={() => handleRequestDeactivation(acc)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 text-xs font-bold text-rose-400 transition"
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {deactivatingId === acc.id.toString() ? 'Requesting...' : 'Request Deactivation'}
                </button>
              )}
            </div>
          </div>

          {acc.status.toLowerCase() === 'deactivation requested' && (
            <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-300 flex items-center gap-3">
              <Clock className="h-5 w-5 shrink-0 text-amber-400" />
              <div>
                <p className="font-bold">Deactivation Request Under Review</p>
                <p className="text-amber-300/80 mt-0.5">
                  {isAdmin
                    ? 'The customer has submitted a request to deactivate this account. You can approve or reject this request.'
                    : 'Your request to deactivate this account has been forwarded to bank administration for approval.'}
                </p>
              </div>
            </div>
          )}

          <div className="mt-7 rounded-2xl border border-slate-700 bg-gradient-to-br from-[#0F172A] to-slate-900 p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Current Balance
            </p>
            <p className="mt-2 break-words text-3xl font-black text-emerald-400 sm:text-5xl">
              {money(acc.balance, acc.currency)}
            </p>
            <div className="mt-3 flex items-center gap-2 text-sm text-slate-400">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              Interest rate: {acc.interestRate}% APY
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Detail label="Account Number" value={acc.accountNumber} />
            <Detail label="IBAN / IFSC Code" value={acc.iban} />
            <Detail label="Account Type" value={acc.type} />
            <Detail
              label="Branch"
              value={acc.branch || 'Not available'}
              icon={<Building2 className="h-4 w-4" />}
            />
            <Detail
              label="Date Opened"
              value={acc.openedDate || 'Not available'}
              icon={<CalendarDays className="h-4 w-4" />}
            />
            <Detail label="Account Status" value={acc.status} />
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-700/80 bg-[#1E293B] p-5 shadow-xl sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-white">Account Transaction History</h2>
          </div>

          {accountTransactions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-700 p-8 text-center">
              <Landmark className="mx-auto h-8 w-8 text-slate-500" />
              <p className="mt-3 font-semibold text-slate-200">No transactions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-700 text-[10px] uppercase tracking-wider text-slate-400">
                    <th className="pb-3 pl-2">Reference</th>
                    <th className="pb-3">Type</th>
                    <th className="pb-3">Description / Parties</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3 pr-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {accountTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-800/40">
                      <td className="py-4 pl-2 font-mono font-semibold text-white">
                        {tx.referenceNumber || tx.id}
                      </td>
                      <td className="py-4 text-slate-200">{tx.type}</td>
                      <td className="py-4">
                        <p className="font-semibold text-white">{tx.senderName || '—'}</p>
                      </td>
                      <td className="py-4 font-mono font-bold text-white">
                        {money(Number(tx.amount), tx.currency)}
                      </td>
                      <td className="py-4 text-slate-300">{tx.date}</td>
                      <td className="py-4 pr-2">{tx.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <section className="rounded-3xl border border-slate-700/80 bg-[#1E293B] p-6 shadow-xl sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-black text-white">
              <Landmark className="h-6 w-6 text-[#3B82F6]" />
              Account Management
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              Review bank accounts, monitor account status, and inspect account activity.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-500 shadow-lg shadow-blue-600/20"
          >
            <Plus className="h-5 w-5" />
            Open New Account
          </button>
        </div>
      </section>

      {/* Admin Review Banner for Deactivation Requests */}
      {isAdmin && (
        (() => {
          const deactivationRequests = accounts.filter(
            (a) => a.status.toLowerCase() === 'deactivation requested'
          );
          if (deactivationRequests.length === 0) return null;
          return (
            <section className="rounded-3xl border border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-[#1E293B] to-[#1E293B] p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/20 pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                  <h2 className="text-lg font-bold text-white">Pending Account Deactivation Requests</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {deactivationRequests.length} Pending
                  </span>
                </div>
                <p className="text-xs text-slate-400">Review requests submitted by customers to deactivate their bank accounts</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {deactivationRequests.map((reqAcc) => (
                  <div key={reqAcc.id} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 flex flex-col justify-between gap-3 shadow-md">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{reqAcc.customerName}</span>
                        <span className="text-[11px] font-mono text-slate-400">#{reqAcc.accountNumber}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-slate-300">
                        <span>Type: <strong className="text-white">{reqAcc.type}</strong></span>
                        <span>Balance: <strong className="text-emerald-400">{money(reqAcc.balance, reqAcc.currency)}</strong></span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                      <button
                        type="button"
                        disabled={adminProcessingId === reqAcc.id.toString()}
                        onClick={() => handleAdminProcessDeactivation(reqAcc, true)}
                        className="flex-1 py-2 px-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve Deactivation
                      </button>
                      <button
                        type="button"
                        disabled={adminProcessingId === reqAcc.id.toString()}
                        onClick={() => handleAdminProcessDeactivation(reqAcc, false)}
                        className="flex-1 py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center justify-center gap-1.5 border border-slate-700"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject Request
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })()
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredAccounts.map((acc) => (
          <div
            key={acc.id}
            className="flex flex-col justify-between rounded-3xl border border-slate-700/80 bg-[#1E293B] p-6 text-left shadow-xl transition-all hover:border-[#3B82F6]/70"
          >
            <div className="w-full">
              <div className="mb-4 flex items-center justify-between gap-2">
                <span className="rounded-full border border-[#3B82F6]/30 bg-[#3B82F6]/20 px-3 py-1 text-xs font-bold text-[#60A5FA]">
                  {acc.type}
                </span>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                    acc.status.toLowerCase() === 'active'
                      ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-400'
                      : acc.status.toLowerCase() === 'deactivation requested'
                      ? 'border-amber-500/30 bg-amber-500/15 text-amber-400'
                      : 'border-rose-500/30 bg-rose-500/15 text-rose-400'
                  }`}
                >
                  {acc.status}
                </span>
              </div>
              <h3 className="mb-1 text-lg font-bold text-white">{acc.customerName}</h3>
              <p className="mb-4 font-mono text-xs text-slate-400">ID: {acc.id}</p>
              <div className="mb-5 space-y-2 rounded-2xl border border-slate-800 bg-[#0F172A] p-4">
                <span className="block text-[10px] font-semibold uppercase text-slate-400">Account Number</span>
                <span className="break-all font-mono text-sm font-extrabold text-white">{acc.accountNumber}</span>
              </div>
              <div className="mb-4">
                <span className="text-xs font-semibold uppercase text-slate-400">Current Balance</span>
                <p className="mt-0.5 text-2xl font-black text-emerald-400">{money(acc.balance, acc.currency)}</p>
              </div>

              {/* If Admin: show Approve/Reject buttons if deactivation is requested */}
              {isAdmin && acc.status.toLowerCase() === 'deactivation requested' && (
                <div className="mb-4 space-y-2">
                  <div className="py-1 px-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300 text-[11px] font-medium flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                    <span>Customer requested deactivation</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={adminProcessingId === acc.id.toString()}
                      onClick={() => handleAdminProcessDeactivation(acc, true)}
                      className="w-1/2 py-2 px-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center justify-center gap-1 shadow"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      type="button"
                      disabled={adminProcessingId === acc.id.toString()}
                      onClick={() => handleAdminProcessDeactivation(acc, false)}
                      className="w-1/2 py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition border border-slate-700 flex items-center justify-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </div>
              )}

              {/* If Customer: show Request Deactivation button or pending badge */}
              {!isAdmin && acc.status.toLowerCase() === 'active' && (
                <button
                  type="button"
                  disabled={deactivatingId === acc.id.toString()}
                  onClick={() => handleRequestDeactivation(acc)}
                  className="mb-4 w-full py-2 px-3 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {deactivatingId === acc.id.toString() ? 'Submitting...' : 'Request Deactivation'}
                </button>
              )}
              {!isAdmin && acc.status.toLowerCase() === 'deactivation requested' && (
                <div className="mb-4 py-2 px-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-medium flex items-center justify-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  <span>Deactivation Pending Admin Review</span>
                </div>
              )}
              {acc.status.toLowerCase() === 'deactivated' && (
                <div className="mb-4 py-2 px-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs font-medium flex items-center justify-center gap-1.5">
                  <XCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>Account Deactivated</span>
                </div>
              )}
            </div>
            <div className="flex w-full items-center justify-between border-t border-slate-700/60 pt-4">
              <button
                type="button"
                onClick={() => openAccount(acc)}
                className="flex items-center justify-between w-full text-xs font-bold text-[#60A5FA] hover:text-blue-300 transition"
              >
                <span>View account details</span>
                <Eye className="h-4 w-4 text-[#60A5FA]" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-700 bg-[#1E293B] p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-2">Open New Account</h2>
            <p className="text-xs text-slate-400 mb-4">Choose the type of bank account to open. A standard minimum opening balance of ₹1,000 will be allocated.</p>
            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setNewAccountType('Savings')}
                  className={`py-3 px-4 rounded-xl border text-sm font-bold transition ${newAccountType === 'Savings' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'}`}
                >
                  Savings Account
                </button>
                <button
                  type="button"
                  onClick={() => setNewAccountType('Checking')}
                  className={`py-3 px-4 rounded-xl border text-sm font-bold transition ${newAccountType === 'Checking' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'}`}
                >
                  Checking Account
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Designated Bank Branch
                </label>
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
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

              <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-700/70 text-xs">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Required Minimum Balance</span>
                <span className="text-emerald-400 font-black text-base mt-0.5 block">₹1,000.00 INR</span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-3 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700 text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="w-1/2 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs transition shadow-lg shadow-blue-600/20"
                >
                  {isCreating ? 'Opening Account...' : 'Confirm & Open'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const Detail: React.FC<{ label: string; value: string; icon?: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="rounded-2xl border border-slate-700/80 bg-[#0F172A] p-4">
    <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">{icon} {label}</p>
    <p className="mt-2 break-all text-sm font-semibold text-white">{value}</p>
  </div>
);

export default AccountsView;