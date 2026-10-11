// ============================================
// USER ROLES
// ============================================

export type UserRole = 'customer' | 'admin';

// ============================================
// PUBLIC PAGES
// ============================================

export type PublicPage =
  | 'landing'
  | 'login'
  | 'register'
  | 'about'
  | 'contact';

// ============================================
// CUSTOMER NAVIGATION
// ============================================

export type CustomerTab =
  | 'customer_dashboard'
  | 'my_accounts'
  | 'balance_overview'
  | 'money_transfer'
  | 'transaction_history'
  | 'account_statement'
  | 'loan_status'
  | 'notifications'
  | 'profile'
  | 'settings';

// ============================================
// ADMIN NAVIGATION
// ============================================

export type AdminTab =
  | 'admin_dashboard'
  | 'customer_management'
  | 'account_management'
  | 'transaction_management'
  | 'loan_management'
  | 'branch_management'
  | 'reports_analytics'
  | 'user_system_admin'
  | 'user_management'
  | 'role_management'
  | 'audit_logs'
  | 'database_health'
  | 'database_backup'
  | 'settings';

// ============================================
// ACTIVE NAVIGATION TAB
// ============================================

export type ActiveTab = CustomerTab | AdminTab;

export type NavigationTab = ActiveTab | string;

// ============================================
// ACCOUNT TYPES
// ============================================

export type AccountType =
  | 'Savings'
  | 'Checking'
  | 'Investment'
  | 'Money Market'
  | 'Current'
  | 'Fixed Deposit';

export type AccountStatus =
  | 'Active'
  | 'Dormant'
  | 'Frozen'
  | 'Closed'
  | 'Deactivation Requested'
  | 'Deactivated';

// ============================================
// CUSTOMER
// ============================================

export interface Customer {
  id: string;
  name: string;
  username: string;
  phone: string;
  email: string;
  address: string;
  accountNumber: string;
  accountType: AccountType;
  branch: string;
  status: 'Verified' | 'Pending KYC' | 'Flagged';
  totalBalance: number;
  creditScore: number;
  joinedDate: string;
  avatar: string;
  role?: UserRole | string;
}

// ============================================
// BANK ACCOUNT
// ============================================

export interface BankAccount {
  id: string;
  accountNumber: string;
  iban: string;
  customerName: string;
  type: AccountType;
  balance: number;
  currency: string;
  interestRate: number;
  status: AccountStatus;
  branch: string;
  openedDate: string;
}

// ============================================
// TRANSACTIONS
// ============================================

export type TransactionStatus =
  | 'Completed'
  | 'Pending'
  | 'Failed'
  | 'In Review';

export type TransactionType =
  | 'Deposit'
  | 'Withdrawal'
  | 'Transfer'
  | 'Cheque'
  | 'SWIFT Transfer'
  | 'Wire Transfer';

export interface Transaction {
  id: string;
  referenceNumber: string;
  senderName: string;
  senderIban: string;
  receiverName: string;
  receiverIban: string;
  amount: number;
  currency: string;
  date: string;
  time: string;
  type: TransactionType;
  status: TransactionStatus;
  branch: string;
  category: string;
  fee: number;
  description?: string;
  tellerId?: string;
}

// ============================================
// LOAN APPLICATION
// ============================================

export interface LoanApplication {
  id: string;
  customerName: string;
  customerId: string;
  loanType:
    | 'Personal Loan'
    | 'Home Mortgage'
    | 'Business Expansion'
    | 'Auto Loan';
  amount: number;
  interestRate: number;
  termMonths: number;
  emi: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  reason?: string;
  appliedDate: string;
  creditScore: number;
}

// ============================================
// CHEQUE
// ============================================

export interface ChequeItem {
  id: string;
  chequeNumber: string;
  bankName: string;
  drawerName: string;
  payeeName: string;
  accountNumber: string;
  amount: number;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  image: string;
  rejectionReason?: string;
}

// ============================================
// AUDIT LOGS
// ============================================

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  affectedTable: string;
  oldValue: string;
  newValue: string;
  status: 'Success' | 'Failed';
}

// ============================================
// SYSTEM USERS
// ============================================

export interface SysUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole | string;
  branch: string;
  status: 'Active' | 'Inactive' | 'Locked';
  lastLogin: string;
  permissions: string[];
  isLocked?: boolean;
  mfaEnabled?: boolean;
}

// ============================================
// DATABASE HEALTH
// ============================================

export interface DbHealthMetric {
  status: 'Healthy' | 'Degraded' | 'Critical';
  cpuUsage: number;
  memoryUsage: number;
  storageUsage: number;
  activeConnections: number;
  backupStatus: 'Up-to-Date' | 'Scheduled' | 'Failed';
  triggerCount: number;
  replicationLagMs: number;
}

// ============================================
// BRANCH METRICS
// ============================================

export interface BranchMetric {
  branchName: string;
  vaultLiquidity: number;
  totalDeposits: number;
  totalLoans: number;
  activeCustomers: number;
  reserveRatio: number;
  monthlyRevenue: number;
}

// ============================================
// DATABASE BACKUP
// ============================================

export interface BackupRecord {
  id: string;
  filename: string;
  timestamp: string;
  sizeMb: number;
  type: 'Automated' | 'Manual' | 'Snapshot';
  status: 'Completed' | 'In Progress' | 'Restored';
}

// ============================================
// SYSTEM NOTIFICATIONS
// ============================================

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'success' | 'warning' | 'error' | 'info';
  read: boolean;
  category: string;
}

// ============================================
// TOAST MESSAGES
// ============================================

export interface ToastMessage {
  id: string;
  title: string;
  description: string;
  type: 'success' | 'error' | 'warning' | 'info';
}