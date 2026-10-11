import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Banknote,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Plus,
  X,
  RefreshCw,
} from 'lucide-react';
import { Customer, LoanApplication } from '../../types/bank';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface LoanStatusViewProps {
  loans: LoanApplication[];
  currentUser: Customer;
  onShowToast: (
    title: string,
    description: string,
    type: ToastType
  ) => void;
  onApplyLoan: (loanData: Partial<LoanApplication>) => void;
  onRefreshLoans?: () => void;
}

const money = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);

const statusClass = (status: string) => {
  const value = status.toLowerCase();
  if (value.includes('approv') || value === 'active') {
    return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  }
  if (value.includes('reject') || value.includes('declin')) {
    return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
  }
  if (value.includes('clos')) {
    return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
  }
  return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
};

export const LoanStatusView: React.FC<LoanStatusViewProps> = ({
  loans,
  currentUser,
  onShowToast,
  onApplyLoan,
  onRefreshLoans,
}) => {
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<LoanApplication | null>(null);
  const [loanType, setLoanType] = useState('Personal Loan');
  const [amount, setAmount] = useState('25000');
  const [interestRate, setInterestRate] = useState('7.5');
  const [termMonths, setTermMonths] = useState('36');

  // Customers should only see loans associated with their own customer ID.
  const myLoans = useMemo(
    () =>
      loans.filter(
        (loan) =>
          String(loan.customerId) === String(currentUser.id) ||
          (loan.customerName?.trim().toLowerCase() === currentUser.name?.trim().toLowerCase())
      ),
    [loans, currentUser.id, currentUser.name]
  );

  const activeCount = myLoans.filter((loan) => {
    const status = String(loan.status).toLowerCase();
    return status === 'active' || status === 'approved';
  }).length;

  const pendingCount = myLoans.filter((loan) => {
    const status = String(loan.status).toLowerCase();
    return status.includes('pending') || status.includes('review') || status.includes('applied');
  }).length;

  const handleApply = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const principal = Number(amount);
    const rate = Number(interestRate);
    const months = Number(termMonths);

    if (!Number.isFinite(principal) || principal < 1000) {
      onShowToast('Invalid Loan Amount', 'Enter a loan amount of at least ₹1,000.', 'error');
      return;
    }
    if (!Number.isFinite(rate) || rate <= 0 || rate > 40) {
      onShowToast('Invalid Interest Rate', 'Enter an annual interest rate greater than 0 and no more than 40%.', 'error');
      return;
    }
    if (!Number.isInteger(months) || months < 6 || months > 360) {
      onShowToast('Invalid Tenure', 'Choose a tenure between 6 and 360 months.', 'error');
      return;
    }

    const monthlyRate = rate / 100 / 12;
    const emi =
      monthlyRate === 0
        ? principal / months
        : (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
          (Math.pow(1 + monthlyRate, months) - 1);

    onApplyLoan({
      customerName: currentUser.name,
      customerId: currentUser.id,
      // Tell TypeScript this string matches the interface's strict union
      loanType: loanType as LoanApplication['loanType'], 
      amount: principal,
      interestRate: rate,
      termMonths: months,
      emi: Number(emi.toFixed(2)),
      creditScore: currentUser.creditScore || 0,
    });
    setShowApplyForm(false);
    onShowToast(
      'Application Submitted',
      'Your loan application has been submitted for review.',
      'success'
    );
  };

  return (
    <div className="space-y-6 font-sans text-white">
      <section className="flex flex-col gap-4 rounded-3xl border border-slate-700/80 bg-[#1E293B] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-300">
            <FileText className="h-3.5 w-3.5" />
            Customer Loans
          </div>
          <h1 className="text-2xl font-black sm:text-3xl">Loan Status</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Track your loan applications, approval decisions, and repayment details.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {onRefreshLoans && (
            <button
              type="button"
              onClick={onRefreshLoans}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-bold text-slate-200 transition hover:bg-slate-700"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Status
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowApplyForm(true)}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#3B82F6] px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-600"
          >
            <Plus className="h-4 w-4" />
            Apply for a Loan
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          title="Total Loans"
          value={myLoans.length}
          detail="Your applications and loans"
          icon={<Banknote className="h-5 w-5" />}
        />
        <SummaryCard
          title="Active / Approved"
          value={activeCount}
          detail="Approved or active loans"
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <SummaryCard
          title="Pending Applications"
          value={pendingCount}
          detail="Awaiting a decision"
          icon={<Clock3 className="h-5 w-5" />}
        />
      </section>

      <section className="rounded-3xl border border-slate-700/80 bg-[#1E293B] p-5 shadow-xl sm:p-7">
        <div className="mb-5 flex items-center justify-between gap-3 border-b border-slate-700/70 pb-4">
          <div>
            <h2 className="text-lg font-bold">My Loans</h2>
            <p className="mt-1 text-xs text-slate-400">
              Only loans associated with your customer profile are shown.
            </p>
          </div>
          <span className="rounded-full border border-slate-600 bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">
            {myLoans.length} {myLoans.length === 1 ? 'record' : 'records'}
          </span>
        </div>

        {myLoans.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-[#0F172A]/60 px-5 py-12 text-center">
            <div className="mb-4 rounded-2xl bg-blue-500/10 p-4 text-blue-400">
              <Banknote className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold">No loans found</h3>
            <p className="mt-2 max-w-md text-sm text-slate-400">
              You don't have any loan applications linked to this profile yet. Apply for a loan to get started.
            </p>
            <button
              type="button"
              onClick={() => setShowApplyForm(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#3B82F6] px-4 py-2.5 text-sm font-bold hover:bg-blue-600"
            >
              <Plus className="h-4 w-4" />
              Apply for a Loan
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {myLoans.map((loan) => (
              <article
                key={loan.id}
                className="rounded-2xl border border-slate-700/80 bg-[#0F172A] p-5 transition hover:border-blue-500/50"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <span className="inline-flex rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-300">
                      {loan.loanType}
                    </span>
                    <h3 className="mt-3 text-base font-bold">{loan.loanType}</h3>
                    <p className="mt-1 font-mono text-xs text-slate-400">ID: {loan.id}</p>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-[11px] font-bold ${statusClass(String(loan.status))}`}>
                    {loan.status}
                  </span>
                </div>

                <div className="my-5 grid grid-cols-2 gap-4 border-y border-slate-800 py-4 sm:grid-cols-3">
                  <Metric label="Principal Amount" value={money(Number(loan.amount))} />
                  <Metric label="Annual Interest" value={`${loan.interestRate}%`} />
                  <Metric label="Monthly EMI" value={money(Number(loan.emi))} highlight />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="flex items-center gap-1.5 text-xs text-slate-400">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Applied: {loan.appliedDate || 'Date unavailable'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedLoan(loan)}
                    className="rounded-lg border border-blue-500/40 px-4 py-2 text-xs font-bold text-blue-300 transition hover:bg-blue-500/10"
                  >
                    View Details
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {showApplyForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-xl rounded-3xl border border-slate-700 bg-[#1E293B] p-6 shadow-2xl sm:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-black">Apply for a Loan</h2>
                <p className="mt-1 text-sm text-slate-400">Enter the details for your loan application.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowApplyForm(false)}
                aria-label="Close application form"
                className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleApply} className="space-y-4">
              <Field label="Loan Type">
                <select 
                  value={loanType} 
                  onChange={(e) => setLoanType(e.target.value)} 
                  className={inputClass}
                >
                  <option value="Personal Loan">Personal Loan</option>
                  <option value="Home Mortgage">Home Mortgage</option>
                  <option value="Auto Loan">Auto Loan</option>
                  <option value="Education Loan">Education Loan</option>
                  <option value="Business Expansion">Business Expansion</option>
                </select>
              </Field>
              <Field label="Loan Amount (₹ INR)">
                <input type="number" min="1000" step="500" required value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClass} />
              </Field>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Annual Interest Rate (%)">
                  <input type="number" min="0.1" max="40" step="0.1" required value={interestRate} onChange={(e) => setInterestRate(e.target.value)} className={inputClass} />
                </Field>
                <Field label="Tenure (months)">
                  <select value={termMonths} onChange={(e) => setTermMonths(e.target.value)} className={inputClass}>
                    <option value="12">12 months</option>
                    <option value="24">24 months</option>
                    <option value="36">36 months</option>
                    <option value="48">48 months</option>
                    <option value="60">60 months</option>
                    <option value="120">120 months</option>
                    <option value="240">240 months</option>
                    <option value="360">360 months</option>
                  </select>
                </Field>
              </div>
              <div className="flex justify-end gap-3 border-t border-slate-700 pt-5">
                <button type="button" onClick={() => setShowApplyForm(false)} className="rounded-xl border border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/5">
                  Cancel
                </button>
                <button type="submit" className="rounded-xl bg-[#3B82F6] px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-600">
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-lg rounded-3xl border border-slate-700 bg-[#1E293B] p-6 shadow-2xl sm:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <button type="button" onClick={() => setSelectedLoan(null)} className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to My Loans
                </button>
                <h2 className="text-xl font-black">{selectedLoan.loanType}</h2>
                <p className="mt-1 font-mono text-xs text-slate-400">{selectedLoan.id}</p>
              </div>
              <button type="button" onClick={() => setSelectedLoan(null)} aria-label="Close loan details" className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-5">
              <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusClass(String(selectedLoan.status))}`}>
                {selectedLoan.status}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Detail label="Principal Amount" value={money(Number(selectedLoan.amount))} />
              <Detail label="Annual Interest Rate" value={`${selectedLoan.interestRate}%`} />
              <Detail label="Monthly EMI" value={money(Number(selectedLoan.emi))} />
              <Detail label="Loan Tenure" value={`${selectedLoan.termMonths} months`} />
              <Detail label="Application Date" value={selectedLoan.appliedDate || 'Not available'} />
              <Detail label="Credit Score at Application" value={String(selectedLoan.creditScore ?? 'Not available')} />
            </div>
            {selectedLoan.reason && (
              <div className="mt-4 rounded-xl border border-slate-700 bg-[#0F172A] p-4">
                <p className="text-xs font-bold text-slate-300">Decision Notes</p>
                <p className="mt-1 text-sm text-slate-400">{selectedLoan.reason}</p>
              </div>
            )}
            <button type="button" onClick={() => setSelectedLoan(null)} className="mt-6 w-full rounded-xl bg-[#3B82F6] py-3 text-sm font-bold hover:bg-blue-600">
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const inputClass =
  'w-full rounded-xl border border-slate-700 bg-[#0F172A] px-3.5 py-3 text-sm text-white outline-none transition focus:border-blue-500';

function SummaryCard({
  title,
  value,
  detail,
  icon,
}: {
  title: string;
  value: number;
  detail: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-700/80 bg-[#1E293B] p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-slate-300">{title}</span>
        <span className="rounded-xl bg-blue-500/10 p-2 text-blue-400">{icon}</span>
      </div>
      <p className="mt-4 text-3xl font-black">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{detail}</p>
    </div>
  );
}

function Metric({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className={`mt-1 break-words text-sm font-bold ${highlight ? 'text-emerald-400' : 'text-white'}`}>{value}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-slate-300">{label}</span>
      {children}
    </label>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-700/70 bg-[#0F172A] p-4">
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className="mt-1 break-words text-sm font-bold text-white">{value}</p>
    </div>
  );
}

export default LoanStatusView;