import React, { useState } from 'react';
import {
  Users,
  Search,
  Edit2,
  CheckCircle2,
  ShieldCheck,
  X,
  Phone,
  Mail,
  MapPin,
  Landmark,
  User,
  AlertTriangle,
  XCircle,
  Clock,
} from 'lucide-react';
import { Customer, BankAccount } from '../../types/bank';
import API from '../../services/api';

interface CustomersViewProps {
  customers: Customer[];
  accounts?: BankAccount[]; // Added to pull live account data
  onUpdateCustomer: (updated: Customer) => void;
  onShowToast: (title: string, desc: string, type: 'success' | 'error' | 'warning' | 'info') => void;
  onRefreshAccounts?: () => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  accounts = [],
  onUpdateCustomer,
  onShowToast,
  onRefreshAccounts,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [processingAccountId, setProcessingAccountId] = useState<string | null>(null);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editStatus, setEditStatus] = useState<'Verified' | 'Pending KYC' | 'Flagged'>('Verified');

  const pendingDeactivations = accounts.filter(
    (a) => a.status.toLowerCase() === 'deactivation requested'
  );

  const handleApproveDeactivation = async (account: BankAccount) => {
    try {
      setProcessingAccountId(account.id.toString());
      await API.patch(`/accounts/${account.id}/status`, { status: 'Deactivated' });
      onShowToast('Account Deactivated', `Account ${account.accountNumber} (${account.customerName}) has been deactivated.`, 'success');
      if (onRefreshAccounts) onRefreshAccounts();
    } catch (err: any) {
      onShowToast('Action Failed', err.response?.data?.error || 'Failed to deactivate account.', 'error');
    } finally {
      setProcessingAccountId(null);
    }
  };

  const handleRejectDeactivation = async (account: BankAccount) => {
    try {
      setProcessingAccountId(account.id.toString());
      await API.patch(`/accounts/${account.id}/status`, { status: 'Active' });
      onShowToast('Deactivation Rejected', `Account ${account.accountNumber} has been retained as Active.`, 'info');
      if (onRefreshAccounts) onRefreshAccounts();
    } catch (err: any) {
      onShowToast('Action Failed', err.response?.data?.error || 'Failed to update account.', 'error');
    } finally {
      setProcessingAccountId(null);
    }
  };

  // Safely filter customers
  const filteredCustomers = customers.filter(
    (c) =>
      (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.accountNumber || '').includes(searchTerm) ||
      (c.id || '').toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setEditName(c.name || '');
    setEditEmail(c.email || '');
    setEditPhone(c.phone || '');
    setEditAddress(c.address || '');
    setEditStatus(c.status || 'Verified');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;

    const updated: Customer = {
      ...editingCustomer,
      name: editName,
      email: editEmail,
      phone: editPhone,
      address: editAddress,
      status: editStatus,
    };

    onUpdateCustomer(updated);
    onShowToast('Customer Profile Updated', `Saved profile details for ${editName}.`, 'success');
    setEditingCustomer(null);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-[#1E293B] border border-slate-700/80 shadow-xl">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-[#3B82F6]" /> Customer Directory
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Search, inspect, and update bank customer profile details and account records.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            id="customer-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search name, email, account..."
            className="w-full bg-[#0F172A] border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#3B82F6]"
          />
        </div>
      </div>

      {/* Account Deactivation Requests Section */}
      <section className="p-6 sm:p-8 rounded-3xl bg-[#1E293B] border border-slate-700/80 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Pending Account Deactivation Requests
                {pendingDeactivations.length > 0 && (
                  <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {pendingDeactivations.length} Pending
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                Customer requests to deactivate their bank accounts. Review and take administrative action to approve or reject.
              </p>
            </div>
          </div>
        </div>

        {pendingDeactivations.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs flex items-center justify-center gap-2 bg-slate-900/40 rounded-2xl border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>No pending account deactivation requests. All customer accounts are active and in good standing.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingDeactivations.map((acc) => (
              <div
                key={acc.id}
                className="bg-[#0F172A] border border-amber-500/40 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      {acc.type}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      Pending Approval
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white">{acc.customerName}</h3>
                  <p className="font-mono text-xs text-slate-400 mt-0.5">Account Number: {acc.accountNumber}</p>
                  <p className="text-xs text-slate-400 mt-2">
                    Current Balance:{' '}
                    <span className="font-bold text-emerald-400 font-mono">
                      ₹{Number(acc.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  <button
                    disabled={processingAccountId === acc.id.toString()}
                    onClick={() => handleApproveDeactivation(acc)}
                    className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/20 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {processingAccountId === acc.id.toString() ? 'Processing...' : 'Approve Deactivation'}
                  </button>
                  <button
                    disabled={processingAccountId === acc.id.toString()}
                    onClick={() => handleRejectDeactivation(acc)}
                    className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-slate-700 disabled:opacity-50"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    {processingAccountId === acc.id.toString() ? 'Processing...' : 'Reject Request'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Customer List Cards / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500">
            No customers found matching your search.
          </div>
        ) : (
          filteredCustomers.map((cust) => {
            // LINK REAL DATABASE ACCOUNTS TO THIS SPECIFIC CUSTOMER
            const userAccounts = accounts.filter(
              (a) => a.customerName === cust.name || (a as any).userId?.toString() === cust.id?.toString()
            );
            const primaryAcc = userAccounts[0];
            const liveTotalBalance = userAccounts.reduce((sum, a) => sum + Number(a.balance || 0), 0);
            
            const displayAccountNumber = primaryAcc ? primaryAcc.accountNumber : (cust.accountNumber || 'No Account');
            const displayAccountType = primaryAcc ? primaryAcc.type : (cust.accountType || 'N/A');

            return (
              <div
                key={cust.id}
                className="bg-[#1E293B] border border-slate-700/80 rounded-3xl p-6 shadow-xl flex flex-col justify-between hover:border-[#3B82F6]/50 transition-all"
              >
                <div>
                  {/* Top Row: Avatar & Status */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={cust.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(cust.name || 'User')}&background=0F172A&color=3B82F6`}
                        alt={cust.name}
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-[#3B82F6]"
                      />
                      <div>
                        <h3 className="text-base font-bold text-white">{cust.name}</h3>
                        <p className="text-[11px] text-slate-400 font-mono">@{cust.username || 'user'}</p>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                        cust.status === 'Verified'
                          ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30'
                          : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {cust.status || 'Verified'}
                    </span>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 text-xs text-slate-300 bg-[#0F172A] p-4 rounded-2xl border border-slate-800 mb-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[#3B82F6] shrink-0" />
                      <span className="truncate">{cust.email || 'No email provided'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#3B82F6] shrink-0" />
                      <span>{cust.phone || 'No phone provided'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#3B82F6] shrink-0" />
                      <span className="truncate">{cust.address || 'Address not on file'}</span>
                    </div>
                  </div>

                  {/* LIVE Account Details */}
                  <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                    <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                      <span className="text-[10px] text-slate-400 block">Account Number</span>
                      <span className="font-mono font-bold text-white">{displayAccountNumber}</span>
                    </div>
                    <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                      <span className="text-[10px] text-slate-400 block">Account Type</span>
                      <span className="font-semibold text-white">{displayAccountType}</span>
                    </div>
                  </div>

                  {/* LIVE Total Balance */}
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 rounded-2xl border border-blue-800/40 mb-4">
                    <span className="text-xs text-slate-300 font-semibold">Total Balance</span>
                    <span className="text-base font-black text-[#10B981] font-mono-num">
                      ₹{liveTotalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} INR
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <button
                  onClick={() => openEditModal(cust)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-[#3B82F6] text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-slate-700 hover:border-blue-500"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Customer Details</span>
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-[#1E293B] border border-slate-700 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setEditingCustomer(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-[#3B82F6]" /> Edit Customer Profile
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Update details for {editingCustomer.name} (ID: {editingCustomer.id})
            </p>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-[#3B82F6]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-[#0F172A] border border-slate-700 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Mobile Phone</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-[#0F172A] border border-slate-700 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Residential Address</label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-[#3B82F6]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Verification Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-[#3B82F6]"
                >
                  <option value="Verified">Verified</option>
                  <option value="Pending KYC">Pending KYC</option>
                  <option value="Flagged">Flagged</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-[#3B82F6] hover:bg-blue-600 text-white rounded-xl font-bold transition shadow-lg shadow-blue-500/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};