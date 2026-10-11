import React, { useMemo, useState, useEffect } from 'react';
import API from '../../services/api';
import {
  Users,
  ShieldCheck,
  UserCheck,
  UserX,
  Search,
  Plus,
  MoreHorizontal,
  ChevronDown,
  X,
  Mail,
  CalendarDays,
  Clock3,
  Shield,
  CheckCircle2,
  AlertTriangle,
  LockKeyhole,
  Pencil,
  Power,
  UserCog,
  Filter,
} from 'lucide-react';

type UserRole = 'Customer' | 'Admin';
type UserStatus = 'Active' | 'Inactive' | 'Locked';

interface SystemUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLogin: string;
  createdAt: string;
}

type UserForm = {
  name: string;
  username: string;
  email: string;
  role: UserRole;
  branchId: string;
};

const INITIAL_USERS: SystemUser[] = [
  {
    id: 'USR-1001',
    name: 'Eleanor Vance',
    username: 'eleanor_vance',
    email: 'eleanor@example.com',
    role: 'Customer',
    status: 'Active',
    lastLogin: '2026-10-09 10:30',
    createdAt: '2026-08-14',
  },
  {
    id: 'USR-1002',
    name: 'Alexander Vance',
    username: 'dba_root',
    email: 'admin@example.com',
    role: 'Admin',
    status: 'Active',
    lastLogin: '2026-10-09 09:15',
    createdAt: '2026-01-02',
  },
  {
    id: 'USR-1003',
    name: 'Priya Nair',
    username: 'priya_nair',
    email: 'priya@example.com',
    role: 'Customer',
    status: 'Inactive',
    lastLogin: '2026-10-05 14:20',
    createdAt: '2026-04-19',
  },
  {
    id: 'USR-1004',
    name: 'Rahul Sharma',
    username: 'rahul_sharma',
    email: 'rahul@example.com',
    role: 'Customer',
    status: 'Locked',
    lastLogin: '2026-10-02 11:00',
    createdAt: '2026-03-06',
  },
];

const EMPTY_FORM: UserForm = {
  name: '',
  username: '',
  email: '',
  role: 'Customer',
  branchId: '4',
};

export const UserSystemAdminView: React.FC<{ accounts?: any[] }> = () => {
  const [users, setUsers] = useState<SystemUser[]>(INITIAL_USERS);
  const [branches, setBranches] = useState<{ id: number; name: string; code: string; location: string }[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | UserRole>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | UserStatus>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [pendingRoleChange, setPendingRoleChange] = useState<{ user: SystemUser; role: UserRole } | null>(null);
  const [form, setForm] = useState<UserForm>(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');
  const [menuUserId, setMenuUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await API.get('/branches');
        if (res.data && res.data.length > 0) {
          setBranches(res.data);
          setForm((prev) => ({ ...prev, branchId: String(res.data[0].id) }));
        }
      } catch (err) {
        console.warn('Could not fetch branches:', err);
      }
    };
    fetchBranches();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await API.get('/users');
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          const mapped: SystemUser[] = res.data.map((u: any) => ({
            id: `USR-${u.id}`,
            name: u.name,
            username: u.username || u.name.replace(/\s+/g, '_').toLowerCase(),
            email: u.email,
            role: (u.role === 'Admin' || u.role === 'admin' ? 'Admin' : 'Customer') as UserRole,
            status: (u.status === 'Flagged' ? 'Locked' : u.status === 'Pending KYC' ? 'Inactive' : 'Active') as UserStatus,
            lastLogin: u.lastLogin || 'Active Today',
            createdAt: u.createdAt || u.joinedDate || new Date().toISOString().slice(0, 10),
          }));
          setUsers(mapped);
        }
      } catch (err) {
        console.warn('Live user fetch note (using local cache):', err);
      }
    };
    fetchUsers();
  }, []);

  const admins = users.filter((user) => user.role === 'Admin');
  const activeCount = users.filter((user) => user.status === 'Active').length;
  const lockedCount = users.filter((user) => user.status === 'Locked').length;
  const inactiveCount = users.filter((user) => user.status === 'Inactive').length;

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesSearch = [user.name, user.username, user.email, user.id]
        .some((value) => value.toLowerCase().includes(query));
      const matchesRole = roleFilter === 'All' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'All' || user.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const openAddModal = () => {
    setForm(EMPTY_FORM);
    setFormError('');
    setShowAddModal(true);
  };

  const addUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    const name = form.name.trim();
    const username = form.username.trim().replace(/^@/, '').replace(/\s+/g, '_').toLowerCase();
    const email = form.email.trim().toLowerCase();

    if (!name || !username || !email) {
      setFormError('Complete all fields before creating the user.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError('Enter a valid email address.');
      return;
    }
    if (users.some((user) => user.email.toLowerCase() === email || user.username.toLowerCase() === username)) {
      setFormError('That email or username is already registered.');
      return;
    }

    try {
      await API.post('/users/create', { name, email, role: form.role, branchId: form.branchId });
    } catch (e) {
      console.warn('API user creation note:', e);
    }

    const nextUserId =
      Math.max(
        1000,
        ...users.map(
          (user) => Number(user.id.replace(/\D/g, '')) || 0
        )
      ) + 1;

    const newUser: SystemUser = {
      id: `USR-${nextUserId}`,
      name,
      username,
      email,
      role: form.role,
      status: 'Active',
      lastLogin: 'Active Today',
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setUsers((previous) => [newUser, ...previous]);
    setShowAddModal(false);
    setNotice(`${name} was added as ${form.role}.`);
    window.setTimeout(() => setNotice(''), 3500);
  };

  const askRoleChange = (user: SystemUser, role: UserRole) => {
    if (user.role === role) return;
    setPendingRoleChange({ user, role });
    setMenuUserId(null);
  };

  const confirmRoleChange = async () => {
    if (!pendingRoleChange) return;
    const { user, role } = pendingRoleChange;
    try {
      await API.patch(`/users/${user.id.replace(/\D/g, '')}/role`, { role });
    } catch (e) {
      console.warn('API role change note:', e);
    }
    setUsers((previous) => previous.map((item) => item.id === user.id ? { ...item, role } : item));
    setNotice(`${user.name}'s role was changed to ${role}.`);
    setPendingRoleChange(null);
    window.setTimeout(() => setNotice(''), 3500);
  };

  const toggleStatus = async (user: SystemUser) => {
    if (user.id === 'USR-1002') {
      setNotice('The primary demo administrator is protected from deactivation.');
      window.setTimeout(() => setNotice(''), 3500);
      setMenuUserId(null);
      return;
    }
    const nextStatus: UserStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    const confirmed = window.confirm(`${nextStatus === 'Inactive' ? 'Deactivate' : 'Activate'} ${user.name}?`);
    if (!confirmed) return;
    try {
      await API.patch(`/users/${user.id.replace(/\D/g, '')}/status`, { status: nextStatus });
    } catch (e) {
      console.warn('API status change note:', e);
    }
    setUsers((previous) => previous.map((item) => item.id === user.id ? { ...item, status: nextStatus } : item));
    setNotice(`${user.name} is now ${nextStatus.toLowerCase()}.`);
    setMenuUserId(null);
    window.setTimeout(() => setNotice(''), 3500);
  };

  const resetFilters = () => {
    setSearch('');
    setRoleFilter('All');
    setStatusFilter('All');
  };

  return (
    <div className="space-y-6 text-white">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
            <ShieldCheck className="h-4 w-4" /> Access control centre
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">User &amp; System Administration</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Manage user accounts, assign Customer or Admin access, and review account status.
          </p>
        </div>
        <button type="button" onClick={openAddModal} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold shadow-lg shadow-blue-950/30 transition hover:bg-blue-500">
          <Plus className="h-4 w-4" /> Add User
        </button>
      </header>

      {notice && (
        <div role="status" className="flex items-start gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> {notice}
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total users" value={users.length.toLocaleString('en-IN')} caption="Registered in this demo" icon={<Users className="h-5 w-5" />} tone="blue" />
        <MetricCard label="Active users" value={activeCount.toLocaleString('en-IN')} caption="Accounts currently active" icon={<UserCheck className="h-5 w-5" />} tone="green" />
        <MetricCard label="Administrators" value={admins.length.toLocaleString('en-IN')} caption="Users with admin role" icon={<Shield className="h-5 w-5" />} tone="purple" />
        <MetricCard label="Needs attention" value={(lockedCount + inactiveCount).toLocaleString('en-IN')} caption={`${lockedCount} locked · ${inactiveCount} inactive`} icon={<UserX className="h-5 w-5" />} tone="amber" />
      </section>

      <section className="rounded-2xl border border-slate-800 bg-[#151515] p-4 sm:p-5">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold">User directory</h2>
            <p className="mt-1 text-xs text-slate-500">Search accounts and manage their assigned application role.</p>
          </div>
          <button type="button" onClick={resetFilters} className="text-left text-xs font-semibold text-blue-400 hover:text-blue-300 sm:text-right">Reset filters</button>
        </div>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(220px,1fr)_190px_190px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, username, email, or user ID..." className="w-full rounded-xl border border-slate-800 bg-[#0B0B0B] py-3 pl-10 pr-3 text-sm outline-none placeholder:text-slate-600 focus:border-blue-500" />
          </div>
          <label className="relative">
            <span className="sr-only">Filter by role</span>
            <UserCog className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value as 'All' | UserRole)} className="w-full appearance-none rounded-xl border border-slate-800 bg-[#0B0B0B] py-3 pl-10 pr-9 text-sm outline-none focus:border-blue-500">
              <option value="All">All roles</option>
              <option value="Customer">Customer</option>
              <option value="Admin">Admin</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          </label>
          <label className="relative">
            <span className="sr-only">Filter by status</span>
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'All' | UserStatus)} className="w-full appearance-none rounded-xl border border-slate-800 bg-[#0B0B0B] py-3 pl-10 pr-9 text-sm outline-none focus:border-blue-500">
              <option value="All">All statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Locked">Locked</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          </label>
        </div>
      </section>

      <section className="overflow-visible rounded-2xl border border-slate-800 bg-[#151515]">
        <div className="flex flex-col gap-2 border-b border-slate-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold">Registered accounts</h2>
            <p className="mt-1 text-xs text-slate-500">Showing {filteredUsers.length} of {users.length} users</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500"><LockKeyhole className="h-4 w-4 text-emerald-400" /> Role changes require confirmation</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left text-sm">
            <thead className="bg-[#101010] text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-4">User</th>
                <th className="px-4 py-4">Email</th>
                <th className="px-4 py-4">Assigned role</th>
                <th className="px-4 py-4">Account status</th>
                <th className="px-4 py-4">Last login</th>
                <th className="px-5 py-4 text-right">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredUsers.map((user) => {
                const protectedAdmin = user.id === 'USR-1002';
                return (
                  <tr key={user.id} className="transition hover:bg-slate-800/20">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.name} role={user.role} />
                        <div>
                          <p className="font-semibold text-white">{user.name}</p>
                          <p className="mt-1 text-xs text-slate-500">@{user.username} · {user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-300">{user.email}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${
                        user.role === 'Admin'
                          ? 'border-violet-500/25 bg-violet-500/10 text-violet-300'
                          : 'border-blue-500/25 bg-blue-500/10 text-blue-300'
                      }`}>
                        {user.role === 'Admin' ? <ShieldCheck className="h-3.5 w-3.5" /> : <Users className="h-3.5 w-3.5" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-4"><StatusBadge status={user.status} /></td>
                    <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-400">{user.lastLogin}</td>
                    <td className="px-5 py-4">
                      <div className="relative flex justify-end">
                        <button type="button" onClick={() => setMenuUserId(menuUserId === user.id ? null : user.id)} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white">
                          Manage <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                        {menuUserId === user.id && (
                          <div className="absolute right-0 top-10 z-30 w-56 rounded-xl border border-slate-700 bg-[#101010] p-2 shadow-2xl">
                            <button type="button" onClick={() => { setSelectedUser(user); setMenuUserId(null); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs text-slate-300 hover:bg-white/5">
                              <Pencil className="h-4 w-4" /> View user details
                            </button>
                            <div className="my-1 border-t border-slate-800" />
                            <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Assign role</p>
                            <button type="button" disabled={user.role === 'Customer'} onClick={() => askRoleChange(user, 'Customer')} className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-xs text-slate-300 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40">
                              <span className="flex items-center gap-2"><Users className="h-4 w-4" /> Customer</span>
                              {user.role === 'Customer' && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                            </button>
                            <button type="button" disabled={user.role === 'Admin'} onClick={() => askRoleChange(user, 'Admin')} className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-xs text-slate-300 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40">
                              <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Admin</span>
                              {user.role === 'Admin' && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                            </button>
                            <div className="my-1 border-t border-slate-800" />
                            <button type="button" onClick={() => toggleStatus(user)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs text-rose-300 hover:bg-rose-500/10">
                              <Power className="h-4 w-4" /> {user.status === 'Active' ? 'Deactivate account' : 'Activate account'}
                            </button>
                          </div>
                        )}
                        {protectedAdmin && <span className="sr-only">Primary demo administrator</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-500">No users match these filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-2 border-t border-slate-800 px-5 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>{admins.length} administrator account{admins.length === 1 ? '' : 's'}</span>
          <span>Demo data only · Changes reset when the page is reloaded</span>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-2 text-violet-300"><ShieldCheck className="h-5 w-5" /></div>
            <div>
              <h3 className="font-semibold text-white">Administrator access</h3>
              <p className="mt-1 text-sm leading-6 text-slate-400">Admins can open the administration workspace. Assign this role only to trusted users who need to manage the banking system.</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-2 text-amber-300"><AlertTriangle className="h-5 w-5" /></div>
            <div>
              <h3 className="font-semibold text-white">Demo security notice</h3>
              <p className="mt-1 text-sm leading-6 text-slate-400">This page updates frontend state only. A real system must verify identity and permissions on the server; hiding or changing UI controls alone is not security.</p>
            </div>
          </div>
        </div>
      </section>

      {showAddModal && (
        <Modal onClose={() => setShowAddModal(false)} title="Add user account" subtitle="Create a demo user record and assign an application role.">
          <form onSubmit={addUser} className="space-y-4">
            <FormField label="Full name">
              <input autoFocus required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Ananya Rao" className={inputClass} />
            </FormField>
            <FormField label="Username">
              <input required value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} placeholder="e.g. ananya_rao" className={inputClass} />
            </FormField>
            <FormField label="Email address">
              <input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="name@example.com" className={inputClass} />
            </FormField>
            <FormField label="Application role">
              <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as UserRole })} className={inputClass}>
                <option value="Customer">Customer</option>
                <option value="Admin">Admin</option>
              </select>
            </FormField>
            <FormField label="Assigned Bank Branch">
              <select
                value={form.branchId}
                onChange={(event) => setForm({ ...form, branchId: event.target.value })}
                className={inputClass}
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
            </FormField>
            {form.role === 'Admin' && <p className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs leading-5 text-amber-300">You are assigning broad administrative access. Only do this for a trusted user. This demo does not create login credentials.</p>}
            {formError && <p role="alert" className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{formError}</p>}
            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setShowAddModal(false)} className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-white/5">Cancel</button>
              <button type="submit" className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500">Create user</button>
            </div>
          </form>
        </Modal>
      )}

      {pendingRoleChange && (
        <Modal onClose={() => setPendingRoleChange(null)} title="Confirm role change" subtitle="Review this permission change before applying it.">
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
              <div>
                <p className="font-semibold text-white">{pendingRoleChange.user.name}</p>
                <p className="mt-1 text-sm text-slate-400">{pendingRoleChange.user.email}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                  <RolePill role={pendingRoleChange.user.role} />
                  <span className="text-slate-500">→</span>
                  <RolePill role={pendingRoleChange.role} />
                </div>
                {pendingRoleChange.role === 'Admin' && <p className="mt-3 text-xs leading-5 text-amber-200">Admin access can expose user and system management functions. Confirm only if this person is trusted.</p>}
              </div>
            </div>
          </div>
          <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => setPendingRoleChange(null)} className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-white/5">Cancel</button>
            <button type="button" onClick={confirmRoleChange} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500">Confirm role change</button>
          </div>
        </Modal>
      )}

      {selectedUser && (
        <Modal onClose={() => setSelectedUser(null)} title="User details" subtitle="Account profile and access information.">
          <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-[#0B0B0B] p-4">
            <Avatar name={selectedUser.name} role={selectedUser.role} large />
            <div className="min-w-0">
              <p className="font-semibold text-white">{selectedUser.name}</p>
              <p className="mt-1 text-sm text-slate-400">@{selectedUser.username}</p>
              <div className="mt-2"><RolePill role={selectedUser.role} /></div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Detail label="User ID" value={selectedUser.id} />
            <Detail label="Status" value={selectedUser.status} />
            <Detail label="Email" value={selectedUser.email} />
            <Detail label="Last login" value={selectedUser.lastLogin} />
            <Detail label="Created on" value={selectedUser.createdAt} />
            <Detail label="Role" value={selectedUser.role} />
          </div>
          <div className="mt-5 flex justify-end">
            <button type="button" onClick={() => setSelectedUser(null)} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold hover:bg-blue-500">Done</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

const inputClass = 'w-full rounded-xl border border-slate-800 bg-[#0B0B0B] p-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500';

const FormField: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="block space-y-1.5">
    <span className="text-xs font-semibold text-slate-300">{label}</span>
    {children}
  </label>
);

const Modal: React.FC<{ title: string; subtitle: string; onClose: () => void; children: React.ReactNode }> = ({ title, subtitle, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
    <div role="dialog" aria-modal="true" className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-700 bg-[#151515] p-6 shadow-2xl">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div><h2 className="text-lg font-bold text-white">{title}</h2><p className="mt-1 text-sm text-slate-400">{subtitle}</p></div>
        <button type="button" onClick={onClose} aria-label="Close dialog" className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white"><X className="h-5 w-5" /></button>
      </div>
      {children}
    </div>
  </div>
);

const MetricCard: React.FC<{ label: string; value: string; caption: string; icon: React.ReactNode; tone: 'blue' | 'green' | 'purple' | 'amber' }> = ({ label, value, caption, icon, tone }) => {
  const styles = {
    blue: 'border-blue-500/20 bg-blue-500/10 text-blue-400',
    green: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
    purple: 'border-violet-500/20 bg-violet-500/10 text-violet-400',
    amber: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
  };
  return <div className="rounded-2xl border border-slate-800 bg-[#151515] p-5 transition hover:border-slate-700">
    <div className="flex items-center justify-between gap-3"><p className="text-sm text-slate-400">{label}</p><div className={`rounded-xl border p-2 ${styles[tone]}`}>{icon}</div></div>
    <p className="mt-4 text-3xl font-bold tracking-tight text-white">{value}</p>
    <p className="mt-2 text-xs text-slate-500">{caption}</p>
  </div>;
};

const Avatar: React.FC<{ name: string; role: UserRole; large?: boolean }> = ({ name, role, large = false }) => (
  <div className={`${large ? 'h-12 w-12 text-sm' : 'h-10 w-10 text-xs'} flex shrink-0 items-center justify-center rounded-xl border font-bold ${role === 'Admin' ? 'border-violet-500/25 bg-violet-500/10 text-violet-300' : 'border-blue-500/25 bg-blue-500/10 text-blue-300'}`}>
    {name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()}
  </div>
);

const RolePill: React.FC<{ role: UserRole }> = ({ role }) => (
  <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${role === 'Admin' ? 'border-violet-500/25 bg-violet-500/10 text-violet-300' : 'border-blue-500/25 bg-blue-500/10 text-blue-300'}`}>
    {role === 'Admin' ? <ShieldCheck className="h-3.5 w-3.5" /> : <Users className="h-3.5 w-3.5" />}{role}
  </span>
);

const StatusBadge: React.FC<{ status: UserStatus }> = ({ status }) => {
  const styles = {
    Active: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400',
    Inactive: 'border-slate-600 bg-slate-700/30 text-slate-300',
    Locked: 'border-rose-500/25 bg-rose-500/10 text-rose-400',
  };
  const icon = status === 'Active' ? <CheckCircle2 className="h-3 w-3" /> : status === 'Locked' ? <LockKeyhole className="h-3 w-3" /> : <Clock3 className="h-3 w-3" />;
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${styles[status]}`}>{icon}{status}</span>;
};

const Detail: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-xl border border-slate-800 bg-[#0B0B0B] p-4">
    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
    <p className="mt-2 break-words text-sm font-semibold text-white">{value}</p>
  </div>
);

export default UserSystemAdminView;
