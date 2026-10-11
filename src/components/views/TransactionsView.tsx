import React, { useState } from 'react';
import {
  ArrowLeftRight,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  FileCheck,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  X,
  Download,
  Activity,
  IndianRupee,
  CalendarDays,
} from 'lucide-react';

import {
  Transaction,
  TransactionStatus,
} from '../../types/bank';

interface TransactionsViewProps {
  transactions: Transaction[];
  onShowToast: (
    title: string,
    desc: string,
    type: 'success' | 'error' | 'warning' | 'info'
  ) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  onShowToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<'All' | TransactionStatus>('All');
  const [categoryFilter, setCategoryFilter] =
    useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [selectedTxn, setSelectedTxn] =
    useState<Transaction | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Filter transactions
  const filtered = transactions.filter((t) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      (t.senderName || '').toLowerCase().includes(search) ||
      (t.receiverName || '').toLowerCase().includes(search) ||
      (t.referenceNumber || '').toLowerCase().includes(search) ||
      (t.id || '').toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === 'All' ||
      t.status === statusFilter;

    const matchesCategory =
      categoryFilter === 'All' ||
      t.category === categoryFilter;

    const matchesType = typeFilter === 'All' || t.type === typeFilter;
    const transactionDate = String(t.date ?? '').slice(0, 10);
    const matchesDateFrom = !dateFrom || transactionDate >= dateFrom;
    const matchesDateTo = !dateTo || transactionDate <= dateTo;
    const amount = Number(t.amount) || 0;
    const matchesMinAmount = minAmount === '' || amount >= Number(minAmount);
    const matchesMaxAmount = maxAmount === '' || amount <= Number(maxAmount);

    return (
      matchesSearch && matchesStatus && matchesCategory && matchesType &&
      matchesDateFrom && matchesDateTo && matchesMinAmount && matchesMaxAmount
    );
  });

  const totalPages = Math.ceil(
    filtered.length / itemsPerPage
  ) || 1;

  React.useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const completedCount = transactions.filter((t) => t.status === 'Completed').length;
  const pendingCount = transactions.filter((t) => t.status === 'Pending').length;
  const failedCount = transactions.filter((t) => t.status === 'Failed').length;
  const totalAmount = transactions.reduce(
    (sum, t) => t.status === 'Completed' ? sum + (Number(t.amount) || 0) : sum,
    0
  );

  const exportCsv = () => {
    const headers = [
      'Reference ID', 'Transaction ID', 'Sender', 'Receiver', 'Type',
      'Category', 'Amount', 'Currency', 'Fee', 'Date', 'Time', 'Status'
    ];
    const escapeCsv = (value: unknown) =>
      `\"${String(value ?? '').replace(/"/g, '\"\"')}\"`;
    const rows = filtered.map((t) => [
      t.referenceNumber, t.id, t.senderName, t.receiverName, t.type,
      t.category, t.amount, t.currency, t.fee, t.date, t.time, t.status
    ]);
    const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'transaction-records.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    onShowToast('CSV Exported', `${filtered.length} filtered transaction records exported.`, 'success');
  };

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* Header Banner - No New Transfer Button */}
      <div className="p-6 rounded-3xl glass-card border border-white/10">
        <h2 className="text-xl lg:text-2xl font-bold text-white flex items-center gap-2">
          <ArrowLeftRight className="w-6 h-6 text-[#3B82F6]" />
          Transaction History
        </h2>

        <p className="text-xs text-[#CBD5E1]/60 mt-2">
          View your transaction records, payment details,
          transaction statuses, and receipts.
        </p>
      </div>

      {/* Admin transaction overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl border border-white/10 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-[#CBD5E1]/60">Total Transactions</p>
            <Activity className="w-5 h-5 text-blue-400" />
          </div>
          <p className="mt-3 text-3xl font-black text-white">{transactions.length.toLocaleString('en-IN')}</p>
          <p className="mt-1 text-[10px] text-[#CBD5E1]/45">All recorded transactions</p>
        </div>
        <div className="glass-panel rounded-2xl border border-emerald-500/20 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-[#CBD5E1]/60">Completed</p>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="mt-3 text-3xl font-black text-emerald-400">{completedCount.toLocaleString('en-IN')}</p>
          <p className="mt-1 text-[10px] text-[#CBD5E1]/45">Successfully processed</p>
        </div>
        <div className="glass-panel rounded-2xl border border-amber-500/20 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-[#CBD5E1]/60">Pending</p>
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <p className="mt-3 text-3xl font-black text-amber-400">{pendingCount.toLocaleString('en-IN')}</p>
          <p className="mt-1 text-[10px] text-[#CBD5E1]/45">Awaiting processing</p>
        </div>
        <div className="glass-panel rounded-2xl border border-red-500/20 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-[#CBD5E1]/60">Failed</p>
            <XCircle className="w-5 h-5 text-red-400" />
          </div>
          <p className="mt-3 text-3xl font-black text-red-400">{failedCount.toLocaleString('en-IN')}</p>
          <p className="mt-1 text-[10px] text-[#CBD5E1]/45">Require review</p>
        </div>
      </div>

      <div className="glass-panel rounded-2xl border border-white/10 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-xs text-[#CBD5E1]/55">Completed transaction volume</p>
          <p className="mt-1 flex items-center gap-2 text-xl font-black text-white">
            <IndianRupee className="w-5 h-5 text-emerald-400" />
            {totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <button type="button" onClick={exportCsv}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-500">
          <Download className="w-4 h-4" /> Export Filtered CSV
        </button>
      </div>

      {/* Search and Filters */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#CBD5E1]/40 absolute left-3.5 top-3" />

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search reference, sender, receiver..."
            className="w-full bg-[#101827] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-[#CBD5E1]/40 focus:outline-none focus:border-[#2563EB]"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-[#CBD5E1]/50 font-semibold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Status:
          </span>

          {(
            ['All', 'Completed', 'Pending', 'Failed'] as const
          ).map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                statusFilter === st
                  ? 'bg-[#2563EB] text-white shadow-[0_0_10px_rgba(37,99,235,0.3)]'
                  : 'bg-white/5 text-[#CBD5E1]/70 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="bg-[#101827] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#2563EB]"
        >
          <option value="All">All Categories</option>
          <option value="Corporate">Corporate</option>
          <option value="Retail">Retail</option>
          <option value="Interbank">Interbank</option>
          <option value="Treasury">Treasury</option>
        </select>
      </div>

      <div className="glass-panel p-4 rounded-2xl border border-white/10 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3 text-xs">
        <div>
          <label className="mb-1.5 block text-[#CBD5E1]/55">Transaction Type</label>
          <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
            className="w-full bg-[#101827] border border-white/10 rounded-xl px-3 py-2.5 text-white">
            <option value="All">All Types</option>
            <option value="Transfer">Transfer</option>
            <option value="Deposit">Deposit</option>
            <option value="Withdrawal">Withdrawal</option>
            <option value="Withdraw">Withdraw</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-[#CBD5E1]/55">From Date</label>
          <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
            className="w-full bg-[#101827] border border-white/10 rounded-xl px-3 py-2.5 text-white" />
        </div>
        <div>
          <label className="mb-1.5 block text-[#CBD5E1]/55">To Date</label>
          <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }}
            className="w-full bg-[#101827] border border-white/10 rounded-xl px-3 py-2.5 text-white" />
        </div>
        <div>
          <label className="mb-1.5 block text-[#CBD5E1]/55">Minimum Amount</label>
          <input type="number" min="0" value={minAmount} onChange={(e) => { setMinAmount(e.target.value); setCurrentPage(1); }}
            placeholder="Min amount"
            className="w-full bg-[#101827] border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder:text-slate-500" />
        </div>
        <div>
          <label className="mb-1.5 block text-[#CBD5E1]/55">Maximum Amount</label>
          <input type="number" min="0" value={maxAmount} onChange={(e) => { setMaxAmount(e.target.value); setCurrentPage(1); }}
            placeholder="Max amount"
            className="w-full bg-[#101827] border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder:text-slate-500" />
        </div>
      </div>

      {/* Transaction Table */}
      <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-[#050816]/60 text-[#CBD5E1]/60 font-semibold uppercase tracking-wider">
                <th className="p-4 pl-6">Reference ID</th>
                <th className="p-4">Sender & Receiver</th>
                <th className="p-4">Type & Category</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Receipt</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="p-12 text-center text-[#CBD5E1]/40"
                  >
                    No transactions match current filters.
                  </td>
                </tr>
              ) : (
                paginated.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-white/[0.03] transition-colors group"
                  >
                    {/* Reference ID */}
                    <td className="p-4 pl-6">
                      <p className="font-mono-num font-bold text-white group-hover:text-[#3B82F6] transition-colors">
                        {tx.referenceNumber}
                      </p>
                      <span className="text-[10px] text-[#CBD5E1]/50">
                        {tx.id}
                      </span>
                    </td>

                    {/* Sender and Receiver */}
                    <td className="p-4">
                      <p className="text-white font-semibold">
                        {tx.senderName}
                      </p>
                      <p className="text-[11px] text-[#CBD5E1]/50 truncate max-w-[200px]">
                        → {tx.receiverName}
                      </p>
                    </td>

                    {/* Transaction Type */}
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#2563EB]/15 text-[#3B82F6] border border-[#2563EB]/30">
                        {tx.type}
                      </span>
                      <p className="text-[10px] text-[#CBD5E1]/50 mt-1">
                        {tx.category}
                      </p>
                    </td>

                    {/* Amount */}
                    <td className="p-4">
                      <p className="font-mono-num text-sm font-extrabold text-white">
                        ₹{Number(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        <span className="text-[10px] text-[#CBD5E1]/50 ml-1">
                          {tx.currency}
                        </span>
                      </p>
                      <span className="text-[10px] text-[#CBD5E1]/40">
                        Fee: ₹{Number(tx.fee).toLocaleString('en-IN')}
                      </span>
                    </td>

                    {/* Date and Time */}
                    <td className="p-4">
                      <p className="font-mono-num text-white">
                        {tx.date}
                      </p>
                      <p className="text-[10px] text-[#CBD5E1]/50 font-mono-num">
                        {tx.time}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      {tx.status === 'Completed' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">
                          <CheckCircle2 className="w-3 h-3" />
                          Completed
                        </span>
                      )}
                      {tx.status === 'Pending' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          <Clock className="w-3 h-3" />
                          Pending
                        </span>
                      )}
                      {tx.status === 'Failed' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase bg-red-500/15 text-red-400 border border-red-500/30">
                          <XCircle className="w-3 h-3" />
                          Failed
                        </span>
                      )}
                    </td>

                    {/* View Receipt */}
                    <td className="p-4 pr-6 text-right">
                      <button
                        onClick={() => setSelectedTxn(tx)}
                        className="p-2 bg-white/5 hover:bg-[#2563EB]/20 text-[#CBD5E1] hover:text-[#3B82F6] rounded-xl transition-all"
                        title="View Transaction Receipt"
                      >
                        <FileCheck className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs text-[#CBD5E1]/60 bg-[#050816]/40">
          <span>
            Showing{' '}
            {filtered.length === 0
              ? 0
              : (currentPage - 1) * itemsPerPage + 1}
            {' '}to{' '}
            {Math.min(
              currentPage * itemsPerPage,
              filtered.length
            )}
            {' '}of {filtered.length} transactions
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((p) => Math.max(1, p - 1))
              }
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-40"
              title="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="font-mono-num font-bold text-white px-2">
              Page {currentPage} / {totalPages}
            </span>

            <button
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((p) =>
                  Math.min(totalPages, p + 1)
                )
              }
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-40"
              title="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Transaction Receipt Modal */}
      {selectedTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0B1E36] border border-white/15 rounded-3xl w-full max-w-xl p-6 lg:p-8 shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#22C55E]" />
                  Transaction Receipt
                </h3>
                <p className="text-xs text-[#CBD5E1]/50 font-mono-num mt-2">
                  Reference: {selectedTxn.referenceNumber}
                </p>
              </div>
              <button
                onClick={() => setSelectedTxn(null)}
                className="p-1.5 text-[#CBD5E1]/60 hover:text-white rounded-lg"
                title="Close receipt"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Receipt Details */}
            <div className="bg-[#101827] p-5 rounded-2xl border border-white/10 space-y-3 text-xs font-mono-num">
              <div className="flex justify-between gap-4 border-b border-white/5 pb-2">
                <span className="text-[#CBD5E1]/50 font-sans">Sender:</span>
                <span className="text-white font-bold text-right">{selectedTxn.senderName}</span>
              </div>

              <div className="flex justify-between gap-4 border-b border-white/5 pb-2">
                <span className="text-[#CBD5E1]/50 font-sans">Sender IBAN:</span>
                <span className="text-[#3B82F6] text-right">{selectedTxn.senderIban}</span>
              </div>

              <div className="flex justify-between gap-4 border-b border-white/5 pb-2">
                <span className="text-[#CBD5E1]/50 font-sans">Receiver:</span>
                <span className="text-white font-bold text-right">{selectedTxn.receiverName}</span>
              </div>

              <div className="flex justify-between gap-4 border-b border-white/5 pb-2">
                <span className="text-[#CBD5E1]/50 font-sans">Receiver IBAN:</span>
                <span className="text-[#3B82F6] text-right">{selectedTxn.receiverIban}</span>
              </div>

              <div className="flex justify-between gap-4 border-b border-white/5 pb-2">
                <span className="text-[#CBD5E1]/50 font-sans">Transaction Type:</span>
                <span className="text-white">{selectedTxn.type}</span>
              </div>

              <div className="flex justify-between gap-4 border-b border-white/5 pb-2">
                <span className="text-[#CBD5E1]/50 font-sans">Amount:</span>
                <span className="text-[#22C55E] text-sm font-extrabold">
                  ₹{Number(selectedTxn.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })} {selectedTxn.currency}
                </span>
              </div>

              <div className="flex justify-between gap-4 border-b border-white/5 pb-2">
                <span className="text-[#CBD5E1]/50 font-sans">Transaction Fee:</span>
                <span className="text-white">₹{Number(selectedTxn.fee).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between gap-4 border-b border-white/5 pb-2">
                <span className="text-[#CBD5E1]/50 font-sans">Date:</span>
                <span className="text-white">{selectedTxn.date}</span>
              </div>

              <div className="flex justify-between gap-4 border-b border-white/5 pb-2">
                <span className="text-[#CBD5E1]/50 font-sans">Time:</span>
                <span className="text-white">{selectedTxn.time}</span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-[#CBD5E1]/50 font-sans">Status:</span>
                <span
                  className={
                    selectedTxn.status === 'Completed'
                      ? 'text-emerald-400 font-bold'
                      : selectedTxn.status === 'Pending'
                      ? 'text-amber-400 font-bold'
                      : 'text-red-400 font-bold'
                  }
                >
                  {selectedTxn.status}
                </span>
              </div>
            </div>

            {/* Receipt Actions */}
            <div className="mt-6 flex justify-between items-center gap-4">
              <span className="text-[10px] text-[#22C55E] font-bold uppercase flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Transaction Details
              </span>
              <button
                onClick={() => {
                  onShowToast(
                    'Receipt Ready',
                    'Transaction receipt details are displayed.',
                    'success'
                  );
                  setSelectedTxn(null);
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white rounded-xl text-xs font-bold shadow-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsView;