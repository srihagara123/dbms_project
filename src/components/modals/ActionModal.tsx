import React, { useState, useEffect } from 'react';
import {
  X,
  PlusCircle,
  MinusCircle,
  Send,
  AlertCircle,
  Landmark,
} from 'lucide-react';
import { BankAccount } from '../../types/bank';

interface ActionModalProps {
  type: 'deposit' | 'withdraw' | 'transfer';
  accounts: BankAccount[];
  initialAccount?: BankAccount;
  onClose: () => void;
  onSubmit: (data: {
    type: 'deposit' | 'withdraw' | 'transfer';
    accountId: string;
    amount: number;
    receiverName?: string;
    receiverIban?: string;
  }) => void;
}

export const ActionModal: React.FC<ActionModalProps> = ({
  type,
  accounts,
  initialAccount,
  onClose,
  onSubmit,
}) => {
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  
  const [amount, setAmount] = useState<string>('');
  
  // Explicitly defaults to Apex Bank for transfers
  const [receiverBank, setReceiverBank] = useState<string>('Apex Bank');
  const [receiverName, setReceiverName] = useState<string>('');
  const [receiverIban, setReceiverIban] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (initialAccount) {
      setSelectedAccountId(initialAccount.id);
    } else if (accounts && accounts.length > 0) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [initialAccount, accounts]);

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedAccountId) {
      setError('No valid account selected. Please open an account first.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }

    if ((type === 'withdraw' || type === 'transfer') && selectedAccount) {
      if (numAmount > Number(selectedAccount.balance)) {
        setError(
          `Insufficient account balance. Available: ₹${Number(selectedAccount.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
        );
        return;
      }
    }

    if (type === 'transfer') {
      if (!receiverName.trim() || !receiverIban.trim()) {
        setError('Recipient name and Account Number/IFSC are required.');
        return;
      }
    }

    onSubmit({
      type,
      accountId: selectedAccountId,
      amount: numAmount,
      receiverName: type === 'transfer' ? `${receiverName} (${receiverBank})` : undefined,
      receiverIban: type === 'transfer' ? receiverIban : undefined,
    });
  };

  const titles = {
    deposit: 'Quick Account Deposit',
    withdraw: 'Account Funds Withdrawal',
    transfer: 'Transfer / Wire Payment',
  };

  const icons = {
    deposit: <PlusCircle className="w-5 h-5 text-emerald-400" />,
    withdraw: <MinusCircle className="w-5 h-5 text-rose-400" />,
    transfer: <Send className="w-5 h-5 text-blue-400" />,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#151515] border border-slate-800 rounded-2xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative font-sans glow-primary">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            {icons[type]}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{titles[type]}</h3>
            <p className="text-xs text-slate-400">
              {type === 'deposit' && 'Add funds to your Apex Bank account balance'}
              {type === 'withdraw' && 'Withdraw cash from your Apex Bank account'}
              {type === 'transfer' && 'Transfer funds to an external bank account'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Your Apex Bank Account Dropdown */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-blue-400" />
              {type === 'transfer' ? 'From (Your Apex Bank Account)' : 'Select Bank Account'}
            </label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full bg-[#0B0B0B] border border-slate-800 rounded-xl py-3 px-3 text-white focus:outline-none focus:border-blue-500"
            >
              {accounts && accounts.length > 0 ? (
                accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    Apex Bank — {acc.type || 'Savings'} ({acc.accountNumber || 'Unknown'}) — Balance: ₹{Number(acc.balance || 0).toLocaleString('en-IN')}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No accounts available (Please open an account first)
                </option>
              )}
            </select>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Amount (INR)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-[#0B0B0B] border border-slate-800 rounded-xl py-3 pl-8 pr-4 text-white text-sm font-mono font-bold focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Transfer fields (Includes list of Indian Banks) */}
          {type === 'transfer' && (
            <>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Transfer To (Recipient Bank)</label>
                <select
                  value={receiverBank}
                  onChange={(e) => setReceiverBank(e.target.value)}
                  className="w-full bg-[#0B0B0B] border border-slate-800 rounded-xl py-3 px-3 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Apex Bank">Apex Bank</option>
                  <option value="State Bank of India (SBI)">State Bank of India (SBI)</option>
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="Axis Bank">Axis Bank</option>
                  <option value="Punjab National Bank (PNB)">Punjab National Bank (PNB)</option>
                  <option value="Bank of Baroda">Bank of Baroda</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Recipient Name</label>
                <input
                  type="text"
                  required
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-[#0B0B0B] border border-slate-800 rounded-xl py-3 px-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Recipient Account Number / IFSC</label>
                <input
                  type="text"
                  required
                  value={receiverIban}
                  onChange={(e) => setReceiverIban(e.target.value)}
                  placeholder="e.g. IN33SBIN0000112940192"
                  className="w-full bg-[#0B0B0B] border border-slate-800 rounded-xl py-3 px-3 text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </>
          )}

          {/* Buttons */}
          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedAccountId}
              className={`w-1/2 py-3 rounded-xl text-white font-bold shadow-lg transition-all ${
                !selectedAccountId 
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : type === 'deposit'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20'
                  : type === 'withdraw'
                  ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/20'
                  : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20 glow-primary'
              }`}
            >
              Confirm {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActionModal;