import React, { useState } from 'react';
import {
  Activity,
  HardDriveDownload,
  ScrollText,
  ShieldAlert,
  UserCog,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  Zap,
  Lock,
  Unlock,
  PlusCircle,
  Check,
  ShieldCheck,
  RefreshCw,
  Search,
  Download,
  Users,
} from 'lucide-react';
import { AuditLog, SysUser, DbHealthMetric, BackupRecord, UserRole } from '../../types/bank';
import {
  INITIAL_AUDIT_LOGS,
  INITIAL_SYS_USERS,
  INITIAL_DB_HEALTH,
  INITIAL_BACKUPS,
} from '../../data/mockData';

interface AdminViewsProps {
  currentTab: string;
  onShowToast: (title: string, desc: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

// ----------------------------------------------------------------------
// 1. ADMIN DASHBOARD
// ----------------------------------------------------------------------
export const AdminDashboardView: React.FC<AdminViewsProps> = ({ onShowToast }) => {
  const [health] = useState<DbHealthMetric>(INITIAL_DB_HEALTH);

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#1E293B] border border-slate-700 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30">
              Database Administrator Core
            </span>
            <span className="text-xs text-slate-400 font-mono">PostgreSQL 16 Cluster Node 01</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Database Administration Command Center</h1>
          <p className="text-xs text-slate-300">
            RBAC security policies, DB triggers, transaction audit logs, replication health, and backup snapshots.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono font-bold text-emerald-400">Cluster Status: {health.status}</span>
        </div>
      </div>

      {/* Cluster Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#1E293B] p-5 rounded-2xl border border-slate-700 shadow-md">
          <p className="text-xs text-slate-400 font-semibold">CPU Utilization</p>
          <p className="text-2xl font-black text-white font-mono mt-1">{health.cpuUsage}%</p>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
            <div className="bg-blue-500 h-full" style={{ width: `${health.cpuUsage}%` }} />
          </div>
        </div>

        <div className="bg-[#1E293B] p-5 rounded-2xl border border-slate-700 shadow-md">
          <p className="text-xs text-slate-400 font-semibold">Memory Usage</p>
          <p className="text-2xl font-black text-white font-mono mt-1">{health.memoryUsage}%</p>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-500 h-full" style={{ width: `${health.memoryUsage}%` }} />
          </div>
        </div>

        <div className="bg-[#1E293B] p-5 rounded-2xl border border-slate-700 shadow-md">
          <p className="text-xs text-slate-400 font-semibold">Active DB Connections</p>
          <p className="text-2xl font-black text-emerald-400 font-mono mt-1">{health.activeConnections}</p>
          <p className="text-[10px] text-slate-400 mt-1">PgBouncer Pool Active</p>
        </div>

        <div className="bg-[#1E293B] p-5 rounded-2xl border border-slate-700 shadow-md">
          <p className="text-xs text-slate-400 font-semibold">Replication Lag</p>
          <p className="text-2xl font-black text-cyan-400 font-mono mt-1">{health.replicationLagMs} ms</p>
          <p className="text-[10px] text-slate-400 mt-1">Sync Standby In Sync</p>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// 2. USER MANAGEMENT VIEW
// ----------------------------------------------------------------------
export const UserManagementView: React.FC<{
  onShowToast: (title: string, desc: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}> = ({ onShowToast }) => {
  const [users, setUsers] = useState<SysUser[]>(INITIAL_SYS_USERS);
  const [search, setSearch] = useState('');

  const toggleLock = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const updated = !u.isLocked;
          onShowToast(
            'User Account Updated',
            `User ${u.username} account ${updated ? 'Locked' : 'Unlocked'} by DBA.`,
            updated ? 'warning' : 'success'
          );
          return { ...u, isLocked: updated };
        }
        return u;
      })
    );
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#1E293B] border border-slate-700 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30">
              Identity Management
            </span>
            <span className="text-xs text-slate-400 font-mono">Exactly 4 User Roles Enforced</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">System User Accounts & Authorization</h1>
          <p className="text-xs text-slate-300">
            Manage system users across Customer, Teller, Branch Manager, and DBA roles. Toggle locks and MFA status.
          </p>
        </div>
      </div>

      <div className="bg-[#1E293B] p-4 rounded-2xl border border-slate-700 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter system users by username, email, or role..."
          className="bg-transparent border-none text-xs text-white focus:outline-none w-full"
        />
      </div>

      <div className="bg-[#1E293B] p-6 rounded-3xl border border-slate-700 shadow-xl overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400 uppercase text-[10px] font-bold">
              <th className="pb-3 pl-2">Username & Email</th>
              <th className="pb-3">Assigned Role</th>
              <th className="pb-3">MFA Status</th>
              <th className="pb-3">Last Login</th>
              <th className="pb-3 pr-2 text-right">Account Lock Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 font-mono">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-slate-800/50">
                <td className="py-3.5 pl-2">
                  <p className="font-bold text-white font-sans">{u.username}</p>
                  <p className="text-[10px] text-slate-400">{u.email}</p>
                </td>
                <td className="py-3.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30 font-sans uppercase">
                    {u.role}
                  </span>
                </td>
                <td className="py-3.5">
                  {u.mfaEnabled ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Enforced
                    </span>
                  ) : (
                    <span className="text-slate-400">Disabled</span>
                  )}
                </td>
                <td className="py-3.5 text-slate-300">{u.lastLogin}</td>
                <td className="py-3.5 pr-2 text-right">
                  <button
                    onClick={() => toggleLock(u.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold font-sans flex items-center gap-1.5 ml-auto ${
                      u.isLocked
                        ? 'bg-rose-600 text-white hover:bg-rose-500'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    {u.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    <span>{u.isLocked ? 'Locked' : 'Active'}</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// 3. ROLE-BASED ACCESS CONTROL (RBAC) MANAGEMENT
// ----------------------------------------------------------------------
export const RoleManagementView: React.FC<{
  onShowToast: (title: string, desc: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}> = ({ onShowToast }) => {
  const [permissions, setPermissions] = useState<Record<string, Record<string, boolean>>>({
    customer: {
      READ_OWN_ACCOUNT: true,
      EXECUTE_ATOMIC_TXN: true,
      OVERRIDE_TELLER_LIMIT: false,
      APPROVE_LOAN: false,
      VIEW_AUDIT_LOGS: false,
      TRIGGER_BACKUP: false,
      MONITOR_HEALTH: false,
      MANAGE_RBAC: false,
    },
    teller: {
      READ_OWN_ACCOUNT: true,
      EXECUTE_ATOMIC_TXN: true,
      OVERRIDE_TELLER_LIMIT: false,
      APPROVE_LOAN: false,
      VIEW_AUDIT_LOGS: false,
      TRIGGER_BACKUP: false,
      MONITOR_HEALTH: false,
      MANAGE_RBAC: false,
    },
    manager: {
      READ_OWN_ACCOUNT: true,
      EXECUTE_ATOMIC_TXN: true,
      OVERRIDE_TELLER_LIMIT: true,
      APPROVE_LOAN: true,
      VIEW_AUDIT_LOGS: true,
      TRIGGER_BACKUP: false,
      MONITOR_HEALTH: false,
      MANAGE_RBAC: false,
    },
    admin: {
      READ_OWN_ACCOUNT: true,
      EXECUTE_ATOMIC_TXN: true,
      OVERRIDE_TELLER_LIMIT: true,
      APPROVE_LOAN: true,
      VIEW_AUDIT_LOGS: true,
      TRIGGER_BACKUP: true,
      MONITOR_HEALTH: true,
      MANAGE_RBAC: true,
    },
  });

  const togglePermission = (role: string, perm: string) => {
    setPermissions((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [perm]: !prev[role][perm],
      },
    }));
  };

  const handleSaveRBAC = () => {
    onShowToast('RBAC Policies Updated', 'Security access control policies successfully applied to PostgreSQL role schemas.', 'success');
  };

  const rolesList = [
    { key: 'customer', label: 'Customer' },
    { key: 'teller', label: 'Bank Teller' },
    { key: 'manager', label: 'Branch Manager' },
    { key: 'admin', label: 'Database Admin' },
  ];

  const permKeys = [
    'READ_OWN_ACCOUNT',
    'EXECUTE_ATOMIC_TXN',
    'OVERRIDE_TELLER_LIMIT',
    'APPROVE_LOAN',
    'VIEW_AUDIT_LOGS',
    'TRIGGER_BACKUP',
    'MONITOR_HEALTH',
    'MANAGE_RBAC',
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#1E293B] border border-slate-700 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30">
              RBAC Engine
            </span>
            <span className="text-xs text-slate-400 font-mono">Exactly 4 User Roles</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Role-Based Access Control (RBAC) Matrix</h1>
          <p className="text-xs text-slate-300">
            Configure granular privilege matrices across Customer, Teller, Branch Manager, and Database Administrator roles.
          </p>
        </div>

        <button
          onClick={handleSaveRBAC}
          className="flex items-center gap-2 px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-rose-600/20 transition-all"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Apply Security Policies</span>
        </button>
      </div>

      <div className="bg-[#1E293B] p-6 rounded-3xl border border-slate-700 shadow-xl overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400 uppercase text-[10px] font-bold">
              <th className="pb-3 pl-2">System Privilege / Permission</th>
              {rolesList.map((r) => (
                <th key={r.key} className="pb-3 text-center">
                  {r.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 font-mono">
            {permKeys.map((perm) => (
              <tr key={perm} className="hover:bg-slate-800/50">
                <td className="py-3.5 pl-2 font-bold text-white font-sans">{perm}</td>
                {rolesList.map((r) => {
                  const isChecked = permissions[r.key]?.[perm];
                  return (
                    <td key={r.key} className="py-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => togglePermission(r.key, perm)}
                        className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// 4. AUDIT LOGS VIEW
// ----------------------------------------------------------------------
export const AuditLogsView: React.FC<{
  onShowToast: (title: string, desc: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}> = ({ onShowToast }) => {
  const [logs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [search, setSearch] = useState('');

  const filtered = logs.filter(
    (l) =>
      l.user.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.affectedTable.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#1E293B] border border-slate-700 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
              System Audit Trail
            </span>
            <span className="text-xs text-slate-400 font-mono">Immutable Write-Ahead Audit Log</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Database System Audit Trail</h1>
          <p className="text-xs text-slate-300">
            Real-time immutable audit trail capturing all DML mutations, user actions, and trigger events.
          </p>
        </div>

        <button
          onClick={() => onShowToast('Audit Log Exported', 'CSV Audit log file downloaded.', 'success')}
          className="flex items-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-xs font-bold border border-slate-700"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit CSV</span>
        </button>
      </div>

      <div className="bg-[#1E293B] p-4 rounded-2xl border border-slate-700 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter audit logs by user, action, or table..."
          className="bg-transparent border-none text-xs text-white focus:outline-none w-full"
        />
      </div>

      <div className="bg-[#1E293B] p-6 rounded-3xl border border-slate-700 shadow-xl overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400 uppercase text-[10px] font-bold">
              <th className="pb-3 pl-2">Timestamp</th>
              <th className="pb-3">User & Role</th>
              <th className="pb-3">Action</th>
              <th className="pb-3">Table</th>
              <th className="pb-3">Old Value → New Value</th>
              <th className="pb-3 pr-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 font-mono">
            {filtered.map((log) => (
              <tr key={log.id} className="hover:bg-slate-800/50">
                <td className="py-3 pl-2 text-slate-300">{log.timestamp}</td>
                <td className="py-3">
                  <p className="font-bold text-white font-sans">{log.user}</p>
                  <p className="text-[10px] text-slate-400 font-sans">{log.role}</p>
                </td>
                <td className="py-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-rose-300 border border-slate-700">
                    {log.action}
                  </span>
                </td>
                <td className="py-3 text-cyan-400 font-bold">{log.affectedTable}</td>
                <td className="py-3 text-slate-400 text-[11px]">
                  <span className="text-rose-400">{log.oldValue}</span> → <span className="text-emerald-400">{log.newValue}</span>
                </td>
                <td className="py-3 pr-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// 5. DATABASE HEALTH & TRIGGERS MONITORING
// ----------------------------------------------------------------------
export const DatabaseHealthView: React.FC<{
  onShowToast: (title: string, desc: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}> = ({ onShowToast }) => {
  const [triggers] = useState([
    { name: 'trg_audit_loan_change', table: 'loan_applications', event: 'AFTER UPDATE', status: 'Active', count: 1842, avgMs: 0.12 },
    { name: 'trg_enforce_min_balance', table: 'accounts', event: 'BEFORE UPDATE', status: 'Active', count: 9402, avgMs: 0.08 },
    { name: 'trg_update_account_timestamp', table: 'accounts', event: 'BEFORE UPDATE', status: 'Active', count: 12401, avgMs: 0.05 },
    { name: 'trg_log_failed_transactions', table: 'transactions', event: 'AFTER INSERT', status: 'Active', count: 320, avgMs: 0.15 },
  ]);

  const handleTestTrigger = (trgName: string) => {
    onShowToast('Database Trigger Fired', `Trigger ${trgName} executed successfully in 0.08ms.`, 'success');
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#1E293B] border border-slate-700 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              Cluster Monitoring
            </span>
            <span className="text-xs text-slate-400 font-mono">Uptime: 99.999%</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Database Health & Automated Triggers</h1>
          <p className="text-xs text-slate-300">
            Real-time cluster telemetry and automated database procedure trigger monitoring.
          </p>
        </div>
      </div>

      <div className="bg-[#1E293B] p-6 rounded-3xl border border-slate-700 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-700 pb-3">
          <Zap className="w-5 h-5 text-cyan-400" />
          Active Automated Database Triggers
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 uppercase text-[10px] font-bold">
                <th className="pb-3 pl-2">Trigger Function</th>
                <th className="pb-3">Target Table</th>
                <th className="pb-3">Event Timing</th>
                <th className="pb-3">Executions</th>
                <th className="pb-3">Avg Speed</th>
                <th className="pb-3 pr-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {triggers.map((t) => (
                <tr key={t.name} className="hover:bg-slate-800/50">
                  <td className="py-3.5 pl-2 font-bold text-cyan-400">{t.name}</td>
                  <td className="py-3.5 text-white font-sans">{t.table}</td>
                  <td className="py-3.5 text-amber-400">{t.event}</td>
                  <td className="py-3.5 text-slate-300">{t.count.toLocaleString()}</td>
                  <td className="py-3.5 text-emerald-400">{t.avgMs} ms</td>
                  <td className="py-3.5 pr-2 text-right">
                    <button
                      onClick={() => handleTestTrigger(t.name)}
                      className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-[10px] font-bold font-sans"
                    >
                      Test Fire Trigger
                    </button>
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
// 6. DATABASE BACKUP MANAGEMENT (SNAPSHOTS & PITR)
// ----------------------------------------------------------------------
export const DatabaseBackupView: React.FC<{
  onShowToast: (title: string, desc: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}> = ({ onShowToast }) => {
  const [backups, setBackups] = useState<BackupRecord[]>(INITIAL_BACKUPS);
  const [backingUp, setBackingUp] = useState(false);

  const handleCreateBackup = () => {
    setBackingUp(true);
    setTimeout(() => {
      const newB: BackupRecord = {
        id: `BAK-${Date.now()}`,
        filename: `apex_db_manual_${new Date().toISOString().slice(0, 10)}.pgdump`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        sizeMb: 4280.0,
        type: 'Manual',
        status: 'Completed',
      };
      setBackups((prev) => [newB, ...prev]);
      setBackingUp(false);
      onShowToast('Backup Created', 'Manual pg_dump snapshot created successfully.', 'success');
    }, 1200);
  };

  const handleRestore = (filename: string) => {
    onShowToast('PITR Rollback Restored', `Point-in-time recovery to snapshot ${filename} completed successfully.`, 'warning');
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#1E293B] border border-slate-700 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Disaster Recovery
            </span>
            <span className="text-xs text-slate-400 font-mono">RPO: 0 sec • RTO: &lt; 1 min</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Database Backup & PITR Restoration</h1>
          <p className="text-xs text-slate-300">
            pg_dump snapshots, WAL archive point-in-time recovery, and automated backup schedules.
          </p>
        </div>

        <button
          onClick={handleCreateBackup}
          disabled={backingUp}
          className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50"
        >
          <HardDriveDownload className="w-4 h-4" />
          <span>{backingUp ? 'Creating Snapshot...' : 'Trigger Manual DB Snapshot'}</span>
        </button>
      </div>

      <div className="bg-[#1E293B] p-6 rounded-3xl border border-slate-700 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-700 pb-3">
          <HardDriveDownload className="w-5 h-5 text-blue-400" />
          Available PostgreSQL Dump Snapshots
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 uppercase text-[10px] font-bold">
                <th className="pb-3 pl-2">Snapshot ID</th>
                <th className="pb-3">Dump Filename</th>
                <th className="pb-3">Timestamp</th>
                <th className="pb-3">Size</th>
                <th className="pb-3">Type</th>
                <th className="pb-3 pr-2 text-right">PITR Restore</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {backups.map((b) => (
                <tr key={b.id} className="hover:bg-slate-800/50">
                  <td className="py-3.5 pl-2 font-bold text-blue-400">{b.id}</td>
                  <td className="py-3.5 text-white">{b.filename}</td>
                  <td className="py-3.5 text-slate-300">{b.timestamp}</td>
                  <td className="py-3.5 text-slate-300">{b.sizeMb} MB</td>
                  <td className="py-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {b.type}
                    </span>
                  </td>
                  <td className="py-3.5 pr-2 text-right">
                    <button
                      onClick={() => handleRestore(b.filename)}
                      className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-[10px] font-bold font-sans"
                    >
                      Restore PITR
                    </button>
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
