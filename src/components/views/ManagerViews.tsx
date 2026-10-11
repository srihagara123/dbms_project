import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  Building2,
  Scale,
  CheckSquare,
  BarChart3,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  TrendingUp,
  DollarSign,
  Users,
  ShieldCheck,
  Code,
  Play,
  Database,
  Download,
  Printer,
  Search,
  Filter,
  Award,
  Clock,
  Briefcase,
  RefreshCw,
} from 'lucide-react';
import API from '../../services/api';
import { LoanApplication, BranchMetric } from '../../types/bank';
import { INITIAL_BRANCH_METRICS } from '../../data/mockData';

interface ManagerViewsProps {
  currentTab: string;
  loans: LoanApplication[];
  onShowToast: (title: string, desc: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  onUpdateLoanStatus?: (loanId: string, status: 'Approved' | 'Rejected', reason?: string) => void;
}

// ----------------------------------------------------------------------
// 1. MANAGER DASHBOARD
// ----------------------------------------------------------------------
export const ManagerDashboardView: React.FC<ManagerViewsProps> = ({
  loans,
  onShowToast,
  onUpdateLoanStatus,
}) => {
  const [loanList, setLoanList] = useState<LoanApplication[]>(loans);
  React.useEffect(() => {
    setLoanList(loans);
  }, [loans]);
  const pendingLoans = loanList.filter((l) => l.status === 'Pending');
  const totalLiquidity = INITIAL_BRANCH_METRICS.reduce((s, b) => s + b.vaultLiquidity, 0);

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#1E293B] border border-slate-700 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-500/20 text-purple-400 border border-purple-500/30">
              Executive Branch Desk
            </span>
            <span className="text-xs text-slate-400 font-mono">Scope: All International Branches</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Branch Manager Executive Overview</h1>
          <p className="text-xs text-slate-300">
            Real-time branch KPI summary, liquidity health, credit underwriting, and employee performance metrics.
          </p>
        </div>

        <div className="bg-slate-900/80 px-5 py-3 rounded-2xl border border-slate-700/80 text-right">
          <p className="text-[10px] uppercase font-bold text-slate-400">Total Vault Reserve Liquidity</p>
          <p className="text-2xl font-black text-purple-400 font-mono-num">
            ₹{(totalLiquidity / 10000000).toFixed(2)} Cr INR
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <div className="bg-[#1E293B] p-5 rounded-2xl border border-slate-700 shadow-md">
          <p className="text-xs text-slate-400 font-semibold">Pending Loan Approvals</p>
          <p className="text-2xl font-black text-amber-400 font-mono mt-1">{pendingLoans.length} Applications</p>
        </div>
        <div className="bg-[#1E293B] p-5 rounded-2xl border border-slate-700 shadow-md">
          <p className="text-xs text-slate-400 font-semibold">Average Reserve Ratio</p>
          <p className="text-2xl font-black text-emerald-400 font-mono mt-1">27.9%</p>
        </div>
        <div className="bg-[#1E293B] p-5 rounded-2xl border border-slate-700 shadow-md">
          <p className="text-xs text-slate-400 font-semibold">Monthly Branch Revenue</p>
          <p className="text-2xl font-black text-white font-mono mt-1">₹15.85 Cr</p>
        </div>
        <div className="bg-[#1E293B] p-5 rounded-2xl border border-slate-700 shadow-md">
          <p className="text-xs text-slate-400 font-semibold">Active Customers</p>
          <p className="text-2xl font-black text-blue-400 font-mono mt-1">44,550</p>
        </div>
      </div>

      {/* Branch Liquidity Chart Preview */}
      <div className="bg-[#1E293B] p-6 rounded-3xl border border-slate-700 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center justify-between border-b border-slate-700 pb-3">
          <span className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-400" />
            Branch Liquidity Position Comparison
          </span>
          <span className="text-xs text-slate-400 font-mono">Vault vs Total Liabilities</span>
        </h2>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={INITIAL_BRANCH_METRICS}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="branchName" stroke="#94A3B8" fontSize={11} />
              <YAxis stroke="#94A3B8" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#fff' }} />
              <Bar dataKey="vaultLiquidity" name="Vault Liquidity (₹)" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
              <Bar dataKey="totalDeposits" name="Total Deposits (₹)" fill="#3B82F6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// 2. LIQUIDITY ANALYSIS VIEW
// ----------------------------------------------------------------------
export const BranchLiquidityView: React.FC = () => {
  const liquidityForecast = [
    { day: 'Mon', Inflow: 4.2, Outflow: 3.1, Reserve: 28.5 },
    { day: 'Tue', Inflow: 5.5, Outflow: 3.8, Reserve: 29.8 },
    { day: 'Wed', Inflow: 3.9, Outflow: 4.2, Reserve: 28.9 },
    { day: 'Thu', Inflow: 6.1, Outflow: 3.5, Reserve: 31.2 },
    { day: 'Fri', Inflow: 7.0, Outflow: 5.0, Reserve: 32.5 },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#1E293B] border border-slate-700 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-500/20 text-purple-400 border border-purple-500/30">
              Liquidity & Vault Operations
            </span>
            <span className="text-xs text-slate-400 font-mono">Compliance: Basel III Standard</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Branch Liquidity & Cash Reserve Analysis</h1>
          <p className="text-xs text-slate-300">
            Monitor cash inflows, outflows, vault reserve ratios, and predictive cash flow forecasts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-[#1E293B] p-5 rounded-2xl border border-slate-700">
          <p className="text-xs text-slate-400 font-semibold">Total Inflow Today</p>
          <p className="text-2xl font-black text-emerald-400 font-mono mt-1">+₹7,02,00,000 INR</p>
        </div>
        <div className="bg-[#1E293B] p-5 rounded-2xl border border-slate-700">
          <p className="text-xs text-slate-400 font-semibold">Total Outflow Today</p>
          <p className="text-2xl font-black text-rose-400 font-mono mt-1">-₹5,01,00,000 INR</p>
        </div>
        <div className="bg-[#1E293B] p-5 rounded-2xl border border-slate-700">
          <p className="text-xs text-slate-400 font-semibold">Central Bank Reserve Ratio</p>
          <p className="text-2xl font-black text-purple-400 font-mono mt-1">32.5% (Min Req: 20%)</p>
        </div>
      </div>

      {/* Liquidity Forecast Chart */}
      <div className="bg-[#1E293B] p-6 rounded-3xl border border-slate-700 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center justify-between border-b border-slate-700 pb-3">
          <span>Weekly Cash Flow & Reserve Ratio Trend (₹ Crores)</span>
          <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
            Optimal Liquidity
          </span>
        </h2>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={liquidityForecast}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} />
              <YAxis stroke="#94A3B8" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#fff' }} />
              <Line type="monotone" dataKey="Inflow" stroke="#10B981" strokeWidth={3} name="Inflow ($M)" />
              <Line type="monotone" dataKey="Outflow" stroke="#EF4444" strokeWidth={3} name="Outflow ($M)" />
              <Line type="monotone" dataKey="Reserve" stroke="#8B5CF6" strokeWidth={3} name="Reserve Ratio (%)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// 3. LOAN MANAGEMENT / UNDERWRITING VIEW
// ----------------------------------------------------------------------
export const LoanManagementView: React.FC<{
  loans: LoanApplication[];
  onShowToast: (title: string, desc: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  onUpdateLoanStatus?: (loanId: string, status: 'Approved' | 'Rejected', reason?: string) => void;
}> = ({ loans, onShowToast, onUpdateLoanStatus }) => {
  const [loanList, setLoanList] = useState<LoanApplication[]>(loans);
  const [loading, setLoading] = useState(false);

  const fetchLiveLoans = async () => {
    try {
      setLoading(true);
      const res = await API.get('/loans');
      if (res.data && Array.isArray(res.data)) {
        setLoanList(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch live loans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveLoans();
  }, []);

  useEffect(() => {
    if (loans && loans.length > 0) {
      setLoanList(loans);
    }
  }, [loans]);

  const [rejectReasonModal, setRejectReasonModal] = useState<{ open: boolean; loanId: string }>({
    open: false,
    loanId: '',
  });
  const [rejectReasonText, setRejectReasonText] = useState('');

  const handleApproveLoan = async (id: string) => {
    try {
      await API.patch(`/loans/${id}/status`, { status: 'Approved', reason: 'Underwriting risk approved by Bank Admin' });
      setLoanList((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: 'Approved', reason: 'Underwriting risk approved by Bank Admin' } : l))
      );
      if (onUpdateLoanStatus) onUpdateLoanStatus(id, 'Approved', 'Underwriting risk approved by Bank Admin');
      onShowToast('Loan Application Approved', `Loan #${id} approved successfully in the database.`, 'success');
      fetchLiveLoans();
    } catch (err: any) {
      console.error('Failed to approve loan:', err);
      onShowToast('Error', err.response?.data?.error || 'Failed to approve loan in database.', 'error');
    }
  };

  const handleConfirmReject = async () => {
    const id = rejectReasonModal.loanId;
    try {
      const reason = rejectReasonText || 'Eligibility criteria not met';
      await API.patch(`/loans/${id}/status`, { status: 'Rejected', reason });
      setLoanList((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: 'Rejected', reason } : l))
      );
      if (onUpdateLoanStatus) onUpdateLoanStatus(id, 'Rejected', reason);
      onShowToast('Loan Rejected', `Loan #${id} marked as Rejected.`, 'error');
      setRejectReasonModal({ open: false, loanId: '' });
      fetchLiveLoans();
    } catch (err: any) {
      console.error('Failed to reject loan:', err);
      onShowToast('Error', err.response?.data?.error || 'Failed to reject loan in database.', 'error');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#1E293B] border border-slate-700 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-500/20 text-purple-400 border border-purple-500/30">
              Admin Loan Management
            </span>
            <span className="text-xs text-slate-400 font-mono">Live PostgreSQL Connected</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Customer Loan Underwriting & Approval</h1>
          <p className="text-xs text-slate-300">
            Review live loan applications submitted by bank customers, inspect credit terms, and approve or reject them.
          </p>
        </div>
      </div>

      <div className="bg-[#1E293B] p-6 rounded-3xl border border-slate-700 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700 pb-3">
          <h2 className="text-base font-bold text-white">
            Active Customer Loan Applications
          </h2>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchLiveLoans}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-850 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh Applications
            </button>
            <span className="text-xs text-slate-400 font-mono">{loanList.length} Total Applications</span>
          </div>
        </div>

        {loanList.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs bg-slate-900/40 rounded-2xl border border-slate-800">
            No loan applications found in the database. When a customer applies for a loan, it will appear here for review.
          </div>
        ) : (
          <div className="space-y-4">
            {loanList.map((loan) => {
              const statusLower = String(loan.status || '').toLowerCase();
              const isApproved = statusLower === 'approved' || statusLower === 'accepted';
              const isRejected = statusLower === 'rejected';

              return (
                <div key={loan.id} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{loan.customerName}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          {loan.loanType}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400">
                          Credit Score: {loan.creditScore}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-slate-400 mt-1">ID: {loan.id} • Applied: {loan.appliedDate}</p>
                    </div>

                    <div>
                      {isApproved && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Approved
                        </span>
                      )}
                      {isRejected && (
                        <div className="flex flex-col items-end">
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            Rejected
                          </span>
                          {loan.reason && (
                            <span className="text-[10px] text-rose-300 mt-0.5 max-w-[200px] text-right truncate" title={loan.reason}>
                              {loan.reason}
                            </span>
                          )}
                        </div>
                      )}
                      {!isApproved && !isRejected && (
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 mr-1">
                            Pending Review
                          </span>
                          <button
                            onClick={() => handleApproveLoan(loan.id)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg flex items-center gap-1.5 transition"
                          >
                            <CheckCircle2 className="w-4 h-4" /> Approve
                          </button>
                          <button
                            onClick={() => setRejectReasonModal({ open: true, loanId: loan.id })}
                            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg flex items-center gap-1.5 transition"
                          >
                            <XCircle className="w-4 h-4" /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono bg-black/40 p-3 rounded-xl border border-slate-800">
                    <div>
                      <p className="text-[10px] font-sans text-slate-400">Principal</p>
                      <p className="font-bold text-white">₹{Number(loan.amount).toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-sans text-slate-400">Rate</p>
                      <p className="font-bold text-purple-400">{loan.interestRate}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-sans text-slate-400">Tenure</p>
                      <p className="font-bold text-slate-300">{loan.termMonths} Months</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-sans text-slate-400">Monthly EMI</p>
                      <p className="font-bold text-emerald-400">₹{Number(loan.emi).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {rejectReasonModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#1E293B] border border-slate-700 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Specify Rejection Reason</h3>
            <div>
              <label className="block text-xs text-slate-300 mb-1">Reason for Underwriting Rejection</label>
              <textarea
                value={rejectReasonText}
                onChange={(e) => setRejectReasonText(e.target.value)}
                placeholder="e.g., Credit score below minimum threshold..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none h-24"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setRejectReasonModal({ open: false, loanId: '' })}
                className="w-1/2 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="w-1/2 py-2.5 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-500 text-xs"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ----------------------------------------------------------------------
// 4. BRANCH METRICS & PERFORMANCE VIEW
// ----------------------------------------------------------------------
export const BranchMetricsView: React.FC = () => {
  const employees = [
    { name: 'Sarah Jenkins', role: 'Head Teller', tickets: 142, rating: '4.9/5' },
    { name: 'Marcus Vance', role: 'Senior Teller', tickets: 128, rating: '4.8/5' },
    { name: 'Elena Rostova', role: 'Credit Officer', tickets: 95, rating: '5.0/5' },
    { name: 'David Chen', role: 'Compliance Officer', tickets: 110, rating: '4.7/5' },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#1E293B] border border-slate-700 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-500/20 text-purple-400 border border-purple-500/30">
              Branch Analytics
            </span>
            <span className="text-xs text-slate-400 font-mono">Rank: #1 Globally</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Branch Metrics & Staff Productivity</h1>
          <p className="text-xs text-slate-300">
            Employee service ticket speeds, monthly branch revenue growth, and customer satisfaction ratings.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Employee Productivity */}
        <div className="bg-[#1E293B] p-6 rounded-3xl border border-slate-700 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-700 pb-3">
            <Briefcase className="w-5 h-5 text-purple-400" />
            Teller & Staff Productivity Matrix
          </h2>

          <div className="space-y-3">
            {employees.map((e, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">{e.name}</p>
                  <p className="text-xs text-slate-400">{e.role}</p>
                </div>
                <div className="text-right font-mono">
                  <p className="text-xs font-bold text-purple-400">{e.tickets} Tickets/Wk</p>
                  <p className="text-[10px] text-emerald-400">{e.rating} Score</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global Branch Ranking */}
        <div className="bg-[#1E293B] p-6 rounded-3xl border border-slate-700 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-700 pb-3">
            <Award className="w-5 h-5 text-amber-400" />
            International Branch Ranking
          </h2>

          <div className="space-y-3">
            {INITIAL_BRANCH_METRICS.map((b) => (
              <div key={b.branchName} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between font-mono">
                <div>
                  <p className="text-sm font-bold text-white font-sans">{b.branchName}</p>
                  <p className="text-xs text-slate-400">Main Regional Hub</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-emerald-400">₹{(b.vaultLiquidity / 10000000).toFixed(2)} Cr INR</p>
                  <p className="text-[10px] text-slate-400">Ratio: {b.reserveRatio}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// 5. MANAGER REPORTS VIEW (ADVANCED SQL CONCEPTS)
// ----------------------------------------------------------------------
export const ManagerReportsView: React.FC<{
  onShowToast: (title: string, desc: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}> = ({ onShowToast }) => {
  const [selectedQuery, setSelectedQuery] = useState<number>(1);
  const [executing, setExecuting] = useState(false);

  const queries = [
    {
      id: 1,
      title: 'Branch Vault Liquidity vs Total Liabilities',
      sql: `SELECT branch_name, vault_liquidity, total_deposits, reserve_ratio \nFROM branch_metrics \nORDER BY vault_liquidity DESC;`,
    },
    {
      id: 2,
      title: 'Loan Amortization Portfolio & Average Interest APY',
      sql: `SELECT loan_type, COUNT(id) as total_applications, AVG(interest_rate) as avg_apy, SUM(amount) as total_exposure \nFROM loan_applications \nGROUP BY loan_type;`,
    },
    {
      id: 3,
      title: 'High Volume Transactions & NEFT/RTGS Transfers Aggregate',
      sql: `SELECT type, COUNT(id) as volume, SUM(amount) as total_inr, AVG(fee) as avg_fee \nFROM transactions \nWHERE status = 'Completed' \nGROUP BY type;`,
    },
  ];

  const currentQ = queries.find((q) => q.id === selectedQuery) || queries[0];

  const handleRunQuery = () => {
    setExecuting(true);
    setTimeout(() => {
      setExecuting(false);
      onShowToast('Analytical Query Executed', 'SQL query completed in 0.042ms. Aggregated dataset returned.', 'success');
    }, 400);
  };

  const handleExportCSV = () => {
    onShowToast('Export Complete', 'Analytical dataset exported to CSV file successfully.', 'success');
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#1E293B] border border-slate-700 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-500/20 text-purple-400 border border-purple-500/30">
              Analytical Engine
            </span>
            <span className="text-xs text-slate-400 font-mono">SQL OLAP Optimizer</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Advanced Reporting & Analytical SQL Reports</h1>
          <p className="text-xs text-slate-300">
            Generate analytical financial reports leveraging relational aggregation and export to CSV/PDF.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-purple-600/20 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Export Query Dataset CSV</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {queries.map((q) => (
          <button
            key={q.id}
            onClick={() => setSelectedQuery(q.id)}
            className={`p-4 rounded-2xl border text-left transition-all ${
              selectedQuery === q.id
                ? 'bg-purple-600/20 border-purple-500 text-white shadow-lg shadow-purple-600/10'
                : 'bg-[#1E293B] border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <p className="text-xs font-bold uppercase text-purple-400 font-mono">Query Preset #{q.id}</p>
            <p className="text-xs font-bold text-white mt-1">{q.title}</p>
          </button>
        ))}
      </div>

      <div className="bg-[#0F172A] p-6 rounded-3xl border border-slate-700 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
            <Code className="w-4 h-4 text-purple-400" />
            <span>Analytical Query Editor</span>
          </div>
          <button
            onClick={handleRunQuery}
            disabled={executing}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            <span>{executing ? 'Executing SQL...' : 'Run Query'}</span>
          </button>
        </div>

        <pre className="p-4 bg-black/80 rounded-2xl font-mono text-xs text-purple-300 border border-slate-800 overflow-x-auto">
          {currentQ.sql}
        </pre>
      </div>

      <div className="bg-[#1E293B] p-6 rounded-3xl border border-slate-700 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-700 pb-3">
          <BarChart3 className="w-5 h-5 text-purple-400" />
          Query Output Visualizer
        </h2>

        {selectedQuery === 1 && (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={INITIAL_BRANCH_METRICS}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="branchName" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#fff' }} />
                <Bar dataKey="vaultLiquidity" name="Vault Liquidity ($)" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="totalDeposits" name="Total Deposits ($)" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {selectedQuery === 2 && (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { type: 'Personal Loan', count: 1, total: 75000, rate: 7.2 },
                  { type: 'Home Mortgage', count: 1, total: 1200000, rate: 5.8 },
                  { type: 'Business Expansion', count: 2, total: 3000000, rate: 5.7 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="type" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#fff' }} />
                <Bar dataKey="total" name="Total Exposure ($)" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {selectedQuery === 3 && (
          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Wire Transfers', value: 12500 },
                    { name: 'Vault Deposits', value: 84000 },
                    { name: 'Withdrawals', value: 420000 },
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label
                >
                  <Cell fill="#3B82F6" />
                  <Cell fill="#10B981" />
                  <Cell fill="#F59E0B" />
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};
