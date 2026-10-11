import React, { useMemo, useState, useEffect } from 'react';
import {
  Building2,
  Search,
  Plus,
  MapPin,
  Users,
  Wallet,
  X,
  Power,
  CheckCircle2,
  Pencil,
  Eye,
  ArrowUpDown,
  Activity,
} from 'lucide-react';
import API from '../../services/api';

interface Branch {
  id: number;
  name: string;
  code: string;
  location: string;
  manager: string;
  customers: number;
  deposits: number;
  status: 'Active' | 'Inactive';
}

type BranchForm = {
  name: string;
  code: string;
  location: string;
  manager: string;
  customers: string;
  deposits: string;
};

const initialBranches: Branch[] = [
  {
    id: 1,
    name: 'Apex Main Branch',
    code: 'APEX0000001',
    location: 'Main Financial Hub, Mumbai',
    manager: 'Branch Manager',
    customers: 6,
    deposits: 224294,
    status: 'Active',
  },
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

const emptyForm: BranchForm = {
  name: '',
  code: '',
  location: '',
  manager: '',
  customers: '0',
  deposits: '0',
};

export const BranchManagementView: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | Branch['status']>('All');
  const [sortBy, setSortBy] = useState<'name' | 'customers' | 'deposits'>('name');
  const [showForm, setShowForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [form, setForm] = useState<BranchForm>(emptyForm);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await API.get('/branches');
        if (res.data && res.data.length > 0) {
          setBranches(
            res.data.map((b: any) => ({
              id: Number(b.id),
              name: b.name,
              code: b.code,
              location: b.location,
              manager: b.manager || 'Branch Manager',
              customers: Number(b.customers || 0),
              deposits: Number(b.deposits || 0),
              status: (b.status === 'Inactive' ? 'Inactive' : 'Active') as 'Active' | 'Inactive',
            }))
          );
        }
      } catch (err) {
        console.error('Failed to load branches from DB:', err);
      }
    };
    fetchBranches();
  }, []);

  const activeBranches = branches.filter((branch) => branch.status === 'Active').length;
  const inactiveBranches = branches.length - activeBranches;
  const totalCustomers = branches.reduce((total, branch) => total + branch.customers, 0);
  const totalDeposits = branches.reduce((total, branch) => total + branch.deposits, 0);

  const filteredBranches = useMemo(() => {
    const query = search.trim().toLowerCase();

    return branches
      .filter((branch) => {
        const matchesSearch = [
          branch.name,
          branch.code,
          branch.location,
          branch.manager,
        ].some((value) => value.toLowerCase().includes(query));

        const matchesStatus = statusFilter === 'All' || branch.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'customers') return b.customers - a.customers;
        if (sortBy === 'deposits') return b.deposits - a.deposits;
        return a.name.localeCompare(b.name);
      });
  }, [branches, search, statusFilter, sortBy]);

  const openAddForm = () => {
    setEditingBranch(null);
    setForm(emptyForm);
    setFormError('');
    setShowForm(true);
  };

  const openEditForm = (branch: Branch) => {
    setEditingBranch(branch);
    setForm({
      name: branch.name,
      code: branch.code,
      location: branch.location,
      manager: branch.manager,
      customers: String(branch.customers),
      deposits: String(branch.deposits),
    });
    setFormError('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingBranch(null);
    setForm(emptyForm);
    setFormError('');
  };

  const saveBranch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');

    const name = form.name.trim();
    const code = form.code.trim().toUpperCase();
    const location = form.location.trim();
    const manager = form.manager.trim();
    const customers = Number(form.customers);
    const deposits = Number(form.deposits);

    if (!name || !code || !location || !manager) {
      setFormError('Please complete all required fields.');
      return;
    }

    if (!Number.isFinite(customers) || customers < 0 || !Number.isFinite(deposits) || deposits < 0) {
      setFormError('Customers and deposits must be valid non-negative numbers.');
      return;
    }

    const duplicateCode = branches.some(
      (branch) =>
        branch.code.toLowerCase() === code.toLowerCase() &&
        branch.id !== editingBranch?.id
    );

    if (duplicateCode) {
      setFormError('A branch with this code already exists.');
      return;
    }

    if (editingBranch) {
      const updatedBranch: Branch = {
        ...editingBranch,
        name,
        code,
        location,
        manager,
        customers,
        deposits,
      };
      setBranches((previous) =>
        previous.map((branch) => branch.id === editingBranch.id ? updatedBranch : branch)
      );
      setSelectedBranch((current) => current?.id === editingBranch.id ? updatedBranch : current);
    } else {
      const newBranch: Branch = {
        id: Date.now(),
        name,
        code,
        location,
        manager,
        customers,
        deposits,
        status: 'Active',
      };
      setBranches((previous) => [...previous, newBranch]);
    }

    closeForm();
  };

  const toggleBranchStatus = (branch: Branch) => {
    const nextStatus = branch.status === 'Active' ? 'Inactive' : 'Active';
    const confirmed = window.confirm(
      `${nextStatus === 'Inactive' ? 'Deactivate' : 'Activate'} ${branch.name}?`
    );
    if (!confirmed) return;

    setBranches((previous) =>
      previous.map((item) =>
        item.id === branch.id ? { ...item, status: nextStatus } : item
      )
    );
    setSelectedBranch((current) =>
      current?.id === branch.id ? { ...current, status: nextStatus } : current
    );
  };

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Branch Management</h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage branch records, monitor performance, and maintain branch status.
          </p>
        </div>
        <button
          type="button"
          onClick={openAddForm}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold transition hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" />
          Add Branch
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Branches" value={branches.length.toLocaleString('en-IN')} icon={<Building2 className="h-5 w-5" />} tone="blue" />
        <StatCard title="Active Branches" value={activeBranches.toLocaleString('en-IN')} icon={<CheckCircle2 className="h-5 w-5" />} tone="green" />
        <StatCard title="Customers Across Branches" value={totalCustomers.toLocaleString('en-IN')} icon={<Users className="h-5 w-5" />} tone="cyan" />
        <StatCard title="Total Branch Deposits" value={formatCurrency(totalDeposits)} icon={<Wallet className="h-5 w-5" />} tone="purple" />
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-800 bg-[#151515] p-4 md:grid-cols-[minmax(220px,1fr)_180px_210px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, code, location, manager..."
            className="w-full rounded-xl border border-slate-800 bg-[#0B0B0B] py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as 'All' | Branch['status'])}
          className="rounded-xl border border-slate-800 bg-[#0B0B0B] px-3 py-3 text-sm outline-none focus:border-blue-500"
          aria-label="Filter branches by status"
        >
          <option value="All">All statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
          className="rounded-xl border border-slate-800 bg-[#0B0B0B] px-3 py-3 text-sm outline-none focus:border-blue-500"
          aria-label="Sort branches"
        >
          <option value="name">Sort: Branch name</option>
          <option value="customers">Sort: Most customers</option>
          <option value="deposits">Sort: Highest deposits</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#151515]">
        <div className="flex flex-col gap-2 border-b border-slate-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-white">Registered Branches</h2>
            <p className="mt-1 text-xs text-slate-500">
              Showing {filteredBranches.length} of {branches.length} branches
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Activity className="h-4 w-4 text-blue-400" />
            {activeBranches} active · {inactiveBranches} inactive
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="px-5 py-3">Branch</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Manager</th>
                <th className="px-4 py-3">Customers</th>
                <th className="px-4 py-3">Deposits</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBranches.map((branch) => (
                <tr key={branch.id} className="border-b border-slate-800/70 transition hover:bg-slate-800/20">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-white">{branch.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{branch.code}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      {branch.location}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-200">{branch.manager}</td>
                  <td className="px-4 py-4">{branch.customers.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-4">{formatCurrency(branch.deposits)}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                      branch.status === 'Active'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {branch.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedBranch(branch)}
                        className="inline-flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300"
                        title="View branch details"
                      >
                        <Eye className="h-3.5 w-3.5" /> View
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditForm(branch)}
                        className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                        title="Edit branch"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleBranchStatus(branch)}
                        className={`inline-flex items-center gap-1 text-xs ${
                          branch.status === 'Active'
                            ? 'text-rose-400 hover:text-rose-300'
                            : 'text-emerald-400 hover:text-emerald-300'
                        }`}
                        title={branch.status === 'Active' ? 'Deactivate branch' : 'Activate branch'}
                      >
                        <Power className="h-3.5 w-3.5" />
                        {branch.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredBranches.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                    No branches match your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <form onSubmit={saveBranch} className="max-h-[90vh] w-full max-w-xl space-y-4 overflow-y-auto rounded-2xl border border-slate-700 bg-[#151515] p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">{editingBranch ? 'Edit Branch' : 'Add New Branch'}</h2>
                <p className="mt-1 text-xs text-slate-400">
                  {editingBranch ? 'Update this branch record.' : 'Enter the new branch information.'}
                </p>
              </div>
              <button type="button" onClick={closeForm} aria-label="Close form" className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <FormField label="Branch Name">
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Chennai Central Branch" className={inputClass} />
            </FormField>
            <FormField label="Branch Code">
              <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. APX005" className={inputClass} />
            </FormField>
            <FormField label="Location">
              <input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City, State" className={inputClass} />
            </FormField>
            <FormField label="Branch Manager">
              <input required value={form.manager} onChange={(e) => setForm({ ...form, manager: e.target.value })} placeholder="Manager name" className={inputClass} />
            </FormField>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Customer Count">
                <input type="number" min="0" step="1" value={form.customers} onChange={(e) => setForm({ ...form, customers: e.target.value })} className={inputClass} />
              </FormField>
              <FormField label="Total Deposits (INR)">
                <input type="number" min="0" step="1" value={form.deposits} onChange={(e) => setForm({ ...form, deposits: e.target.value })} className={inputClass} />
              </FormField>
            </div>

            {formError && (
              <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
                {formError}
              </p>
            )}

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={closeForm} className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-white/5">
                Cancel
              </button>
              <button type="submit" className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500">
                {editingBranch ? 'Save Changes' : 'Create Branch'}
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" aria-labelledby="branch-details-title" className="w-full max-w-lg rounded-2xl border border-slate-700 bg-[#151515] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">Branch Details</p>
                <h2 id="branch-details-title" className="mt-1 text-xl font-bold text-white">{selectedBranch.name}</h2>
                <p className="mt-1 text-sm text-slate-400">{selectedBranch.code}</p>
              </div>
              <button type="button" onClick={() => setSelectedBranch(null)} aria-label="Close branch details" className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Detail label="Location" value={selectedBranch.location} />
              <Detail label="Branch Manager" value={selectedBranch.manager} />
              <Detail label="Customers" value={selectedBranch.customers.toLocaleString('en-IN')} />
              <Detail label="Total Deposits" value={formatCurrency(selectedBranch.deposits)} />
              <Detail label="Status" value={selectedBranch.status} />
              <Detail label="Branch Code" value={selectedBranch.code} />
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setSelectedBranch(null)} className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5">
                Close
              </button>
              <button type="button" onClick={() => { openEditForm(selectedBranch); setSelectedBranch(null); }} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold hover:bg-blue-500">
                <Pencil className="h-4 w-4" /> Edit Branch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const inputClass =
  'w-full rounded-xl border border-slate-800 bg-[#0B0B0B] p-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500';

const FormField: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="block space-y-1.5">
    <span className="text-xs font-semibold text-slate-300">{label}</span>
    {children}
  </label>
);

const Detail: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-xl border border-slate-800 bg-[#0B0B0B] p-4">
    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
    <p className="mt-2 break-words text-sm font-semibold text-white">{value}</p>
  </div>
);

const StatCard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
  tone: 'blue' | 'green' | 'cyan' | 'purple';
}> = ({ title, value, icon, tone }) => {
  const tones = {
    blue: 'border-blue-500/20 bg-blue-500/10 text-blue-400',
    green: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
    cyan: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-400',
    purple: 'border-violet-500/20 bg-violet-500/10 text-violet-400',
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#151515] p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{title}</p>
        <div className={`rounded-xl border p-2 ${tones[tone]}`}>{icon}</div>
      </div>
      <p className="mt-3 break-words text-2xl font-bold text-white">{value}</p>
    </div>
  );
};

export default BranchManagementView;
