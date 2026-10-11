import React, { useMemo, useState } from 'react';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Download,
  FileBarChart,
  Filter,
  Search,
  TrendingUp,
  Wallet,
  XCircle,
  Clock3,
  Building2,
} from 'lucide-react';

import { Transaction, BankAccount } from '../../types/bank';

type TxStatus = 'Completed' | 'Pending' | 'Failed';
type TxType = 'Deposit' | 'Withdrawal' | 'Transfer';

interface ReportTransaction {
  id: string;
  reference: string;
  date: string; // YYYY-MM-DD
  branch: string;
  sender: string;
  receiver: string;
  type: TxType;
  amount: number;
  fee: number;
  status: TxStatus;
}

interface MonthlyActivity {
  month: string;
  deposits: number;
  withdrawals: number;
}

const SAMPLE_TRANSACTIONS: ReportTransaction[] = [
  { id: 'TXN-90211', reference: 'TXN-2026-991204', date: '2026-07-25', branch: 'Apex Main Branch', sender: 'Corporate Treasury', receiver: 'Apex Reserve', type: 'Transfer', amount: 12500, fee: 25, status: 'Completed' },
];

const MONTHLY_ACTIVITY: MonthlyActivity[] = [
  { month: 'May', deposits: 620000, withdrawals: 340000 },
  { month: 'Jun', deposits: 570000, withdrawals: 360000 },
  { month: 'Jul', deposits: 710000, withdrawals: 420000 },
  { month: 'Aug', deposits: 680000, withdrawals: 390000 },
  { month: 'Sep', deposits: 760000, withdrawals: 440000 },
  { month: 'Oct', deposits: 820000, withdrawals: 510000 },
];

const formatINR = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (value: string) => {
  if (!value) return '—';
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

interface ReportsAnalyticsViewProps {
  transactions?: Transaction[];
  accounts?: BankAccount[];
}

export const ReportsAnalyticsView: React.FC<ReportsAnalyticsViewProps> = ({
  transactions: propTransactions = [],
}) => {
  const reportTransactions: ReportTransaction[] = useMemo(() => {
    if (propTransactions && propTransactions.length > 0) {
      return propTransactions.map((t) => {
        const rawType = (t.type || 'Transfer').toLowerCase();
        const mappedType: TxType = rawType.includes('deposit')
          ? 'Deposit'
          : rawType.includes('withdraw')
          ? 'Withdrawal'
          : 'Transfer';

        const rawStatus = (t.status || 'Completed').toLowerCase();
        const mappedStatus: TxStatus = rawStatus.includes('pending')
          ? 'Pending'
          : rawStatus.includes('fail')
          ? 'Failed'
          : 'Completed';

        return {
          id: t.id.toString(),
          reference: t.referenceNumber || `REF-${t.id}`,
          date: t.date || new Date().toISOString().split('T')[0],
          branch: 'Apex Main Branch',
          sender: t.senderName || 'Account Holder',
          receiver: t.receiverName || 'Apex Core Banking',
          type: mappedType,
          amount: Number(t.amount || 0),
          fee: 0,
          status: mappedStatus,
        };
      });
    }
    return SAMPLE_TRANSACTIONS;
  }, [propTransactions]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | TxStatus>('All');
  const [typeFilter, setTypeFilter] = useState<'All' | TxType>('All');
  const [branchFilter, setBranchFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const branches = useMemo(
    () => Array.from(new Set(reportTransactions.map((transaction) => transaction.branch))).sort(),
    [reportTransactions],
  );

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();
    return reportTransactions.filter((transaction) => {
      const matchesSearch = [
        transaction.id,
        transaction.reference,
        transaction.sender,
        transaction.receiver,
        transaction.branch,
      ].some((field) => field.toLowerCase().includes(query));
      const matchesStatus = statusFilter === 'All' || transaction.status === statusFilter;
      const matchesType = typeFilter === 'All' || transaction.type === typeFilter;
      const matchesBranch = branchFilter === 'All' || transaction.branch === branchFilter;
      const matchesFrom = !dateFrom || transaction.date >= dateFrom;
      const matchesTo = !dateTo || transaction.date <= dateTo;
      return matchesSearch && matchesStatus && matchesType && matchesBranch && matchesFrom && matchesTo;
    });
  }, [reportTransactions, search, statusFilter, typeFilter, branchFilter, dateFrom, dateTo]);

  const completed = filteredTransactions.filter((transaction) => transaction.status === 'Completed');
  const pendingCount = filteredTransactions.filter((transaction) => transaction.status === 'Pending').length;
  const failedCount = filteredTransactions.filter((transaction) => transaction.status === 'Failed').length;
  const depositTotal = completed.filter((transaction) => transaction.type === 'Deposit').reduce((sum, transaction) => sum + transaction.amount, 0);
  const withdrawalTotal = completed.filter((transaction) => transaction.type === 'Withdrawal').reduce((sum, transaction) => sum + transaction.amount, 0);
  const completedVolume = completed.reduce((sum, transaction) => sum + transaction.amount, 0);
  const maxMonthlyValue = Math.max(...MONTHLY_ACTIVITY.flatMap((month) => [month.deposits, month.withdrawals]), 1);

  const exportCsv = () => {
    const headers = ['Transaction ID', 'Reference', 'Date', 'Branch', 'Sender', 'Receiver', 'Type', 'Amount INR', 'Fee INR', 'Status'];
    const rows = filteredTransactions.map((transaction) => [
      transaction.id, transaction.reference, transaction.date, transaction.branch,
      transaction.sender, transaction.receiver, transaction.type, transaction.amount,
      transaction.fee, transaction.status,
    ]);
    const csvCell = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
    const csv = [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'apex-bank-report.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('All');
    setTypeFilter('All');
    setBranchFilter('All');
    setDateFrom('');
    setDateTo('');
  };

  return (
    <div className="space-y-6 text-white">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
            <FileBarChart className="h-4 w-4" /> Banking intelligence
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Reports &amp; Analytics</h1>
          <p className="mt-1 text-sm text-slate-400">Monitor transaction activity, compare trends, and export filtered reports.</p>
        </div>
        <button type="button" onClick={exportCsv} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold shadow-lg shadow-blue-950/30 transition hover:bg-blue-500">
          <Download className="h-4 w-4" /> Export Filtered CSV
        </button>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Filtered Transactions" value={filteredTransactions.length.toLocaleString('en-IN')} caption="Matches current filters" icon={<Activity className="h-5 w-5" />} accent="blue" />
        <MetricCard label="Completed Volume" value={formatINR(completedVolume)} caption="Completed transaction amounts" icon={<Wallet className="h-5 w-5" />} accent="green" />
        <MetricCard label="Pending Review" value={pendingCount.toLocaleString('en-IN')} caption="Awaiting processing" icon={<Clock3 className="h-5 w-5" />} accent="amber" />
        <MetricCard label="Failed Transactions" value={failedCount.toLocaleString('en-IN')} caption="May require investigation" icon={<XCircle className="h-5 w-5" />} accent="red" />
      </section>

      <section className="rounded-2xl border border-slate-800 bg-[#151515] p-4 sm:p-5">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold">Report filters</h2>
            <p className="mt-1 text-xs text-slate-500">All summary figures and the table below use these filters.</p>
          </div>
          <button type="button" onClick={resetFilters} className="text-left text-xs font-semibold text-blue-400 hover:text-blue-300 sm:text-right">Reset filters</button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <div className="relative xl:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search ID, sender, receiver..." className="w-full rounded-xl border border-slate-800 bg-[#0B0B0B] py-3 pl-10 pr-3 text-sm outline-none placeholder:text-slate-600 focus:border-blue-500" />
          </div>
          <select value={branchFilter} onChange={(event) => setBranchFilter(event.target.value)} className="rounded-xl border border-slate-800 bg-[#0B0B0B] px-3 py-3 text-sm outline-none focus:border-blue-500" aria-label="Filter by branch">
            <option value="All">All branches</option>
            {branches.map((branch) => <option key={branch} value={branch}>{branch}</option>)}
          </select>
          <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as 'All' | TxType)} className="rounded-xl border border-slate-800 bg-[#0B0B0B] px-3 py-3 text-sm outline-none focus:border-blue-500" aria-label="Filter by transaction type">
            <option value="All">All types</option>
            <option value="Deposit">Deposit</option>
            <option value="Withdrawal">Withdrawal</option>
            <option value="Transfer">Transfer</option>
          </select>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'All' | TxStatus)} className="rounded-xl border border-slate-800 bg-[#0B0B0B] px-3 py-3 text-sm outline-none focus:border-blue-500" aria-label="Filter by transaction status">
            <option value="All">All statuses</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>
          <div className="grid grid-cols-2 gap-2 sm:col-span-2 xl:col-span-6 xl:grid-cols-2">
            <label className="flex items-center gap-2 rounded-xl border border-slate-800 bg-[#0B0B0B] px-3">
              <CalendarDays className="h-4 w-4 shrink-0 text-slate-500" />
              <span className="sr-only">From date</span>
              <input type="date" value={dateFrom} max={dateTo || undefined} onChange={(event) => setDateFrom(event.target.value)} className="min-w-0 w-full bg-transparent py-3 text-sm text-slate-300 outline-none" />
            </label>
            <label className="flex items-center gap-2 rounded-xl border border-slate-800 bg-[#0B0B0B] px-3">
              <CalendarDays className="h-4 w-4 shrink-0 text-slate-500" />
              <span className="sr-only">To date</span>
              <input type="date" value={dateTo} min={dateFrom || undefined} onChange={(event) => setDateTo(event.target.value)} className="min-w-0 w-full bg-transparent py-3 text-sm text-slate-300 outline-none" />
            </label>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-slate-800 bg-[#151515] p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold">Monthly banking activity</h2>
              <p className="mt-1 text-xs text-slate-500">Illustrative six-month trend · INR</p>
            </div>
            <TrendingUp className="h-5 w-5 text-blue-400" />
          </div>
          <div className="mt-6 space-y-5">
            {MONTHLY_ACTIVITY.map((month) => (
              <div key={month.month}>
                <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                  <span className="font-semibold text-slate-200">{month.month}</span>
                  <span className="text-slate-500">Deposits {formatINR(month.deposits)}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${(month.deposits / maxMonthlyValue) * 100}%` }} />
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full rounded-full bg-cyan-400 transition-all" style={{ width: `${(month.withdrawals / maxMonthlyValue) * 100}%` }} />
                </div>
                <p className="mt-1.5 text-[11px] text-slate-500">Withdrawals {formatINR(month.withdrawals)}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-4 border-t border-slate-800 pt-4 text-xs text-slate-400">
            <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Deposits</span>
            <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-cyan-400" /> Withdrawals</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#151515] p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold">Transaction status</h2>
              <p className="mt-1 text-xs text-slate-500">Current filtered selection</p>
            </div>
            <Filter className="h-5 w-5 text-blue-400" />
          </div>
          <div className="mt-6 space-y-5">
            <StatusSummary label="Completed" count={completed.length} total={filteredTransactions.length} icon={<CheckCircle2 className="h-4 w-4" />} tone="green" />
            <StatusSummary label="Pending" count={pendingCount} total={filteredTransactions.length} icon={<Clock3 className="h-4 w-4" />} tone="amber" />
            <StatusSummary label="Failed" count={failedCount} total={filteredTransactions.length} icon={<XCircle className="h-4 w-4" />} tone="red" />
          </div>
          <div className="mt-6 rounded-xl border border-slate-800 bg-[#0B0B0B] p-4">
            <p className="text-xs text-slate-500">Completed deposits</p>
            <p className="mt-1 text-xl font-bold text-emerald-400">{formatINR(depositTotal)}</p>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500"><ArrowDownRight className="h-4 w-4 text-emerald-400" /> Deposit transactions marked completed</div>
            <p className="mt-4 text-xs text-slate-500">Completed withdrawals</p>
            <p className="mt-1 text-xl font-bold text-rose-400">{formatINR(withdrawalTotal)}</p>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500"><ArrowUpRight className="h-4 w-4 text-rose-400" /> Withdrawal transactions marked completed</div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-[#151515]">
        <div className="flex flex-col gap-3 border-b border-slate-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold">Transaction report</h2>
            <p className="mt-1 text-xs text-slate-500">{filteredTransactions.length} records match your filters</p>
          </div>
          <button type="button" onClick={exportCsv} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-blue-500 hover:text-white">
            <Download className="h-4 w-4" /> Export table
          </button>
        </div>
        {filteredTransactions.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Search className="mx-auto h-8 w-8 text-slate-600" />
            <p className="mt-3 font-semibold text-slate-300">No matching transactions</p>
            <p className="mt-1 text-sm text-slate-500">Change or reset the filters to see records.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left text-sm">
              <thead className="bg-[#101010] text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3">Reference</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Branch</th>
                  <th className="px-4 py-3">Sender / Receiver</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="transition hover:bg-slate-800/20">
                    <td className="px-5 py-4">
                      <p className="font-mono text-xs font-semibold text-white">{transaction.reference}</p>
                      <p className="mt-1 font-mono text-[10px] text-slate-500">{transaction.id}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-300">{formatDate(transaction.date)}</td>
                    <td className="px-4 py-4 text-xs text-slate-300">{transaction.branch}</td>
                    <td className="px-4 py-4">
                      <p className="max-w-[180px] truncate font-medium text-slate-200" title={transaction.sender}>{transaction.sender}</p>
                      <p className="mt-1 max-w-[180px] truncate text-xs text-slate-500" title={transaction.receiver}>→ {transaction.receiver}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-2 py-1 text-xs text-blue-300">{transaction.type}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <p className="font-semibold text-white">{formatINR(transaction.amount)}</p>
                      <p className="mt-1 text-[10px] text-slate-500">Fee: {formatINR(transaction.fee)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={transaction.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex flex-col gap-2 border-t border-slate-800 px-5 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>Showing {filteredTransactions.length} of {reportTransactions.length} records</span>
          <span>Live database telemetry synchronized with PostgreSQL.</span>
        </div>
      </section>
    </div>
  );
};

const MetricCard: React.FC<{
  label: string;
  value: string;
  caption: string;
  icon: React.ReactNode;
  accent: 'blue' | 'green' | 'amber' | 'red';
}> = ({ label, value, caption, icon, accent }) => {
  const styles = {
    blue: 'border-blue-500/20 bg-blue-500/10 text-blue-400',
    green: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
    amber: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
    red: 'border-rose-500/20 bg-rose-500/10 text-rose-400',
  };
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#151515] p-5 transition hover:border-slate-700">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-400">{label}</p>
        <div className={`rounded-xl border p-2 ${styles[accent]}`}>{icon}</div>
      </div>
      <p className="mt-4 break-words text-2xl font-bold tracking-tight text-white">{value}</p>
      <p className="mt-2 text-xs text-slate-500">{caption}</p>
    </div>
  );
};

const StatusSummary: React.FC<{
  label: string;
  count: number;
  total: number;
  icon: React.ReactNode;
  tone: 'green' | 'amber' | 'red';
}> = ({ label, count, total, icon, tone }) => {
  const styles = {
    green: 'bg-emerald-400',
    amber: 'bg-amber-400',
    red: 'bg-rose-400',
  };
  const percentage = total ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="inline-flex items-center gap-2 text-slate-300">{icon}{label}</span>
        <span className="font-semibold text-white">{count} <span className="text-xs font-normal text-slate-500">({percentage}%)</span></span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <div className={`h-full rounded-full ${styles[tone]}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};

const StatusBadge: React.FC<{ status: TxStatus }> = ({ status }) => {
  const styles = {
    Completed: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400',
    Pending: 'border-amber-500/25 bg-amber-500/10 text-amber-400',
    Failed: 'border-rose-500/25 bg-rose-500/10 text-rose-400',
  };
  const icon = status === 'Completed'
    ? <CheckCircle2 className="h-3 w-3" />
    : status === 'Pending'
    ? <Clock3 className="h-3 w-3" />
    : <XCircle className="h-3 w-3" />;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${styles[status]}`}>
      {icon}{status}
    </span>
  );
};

export default ReportsAnalyticsView;
