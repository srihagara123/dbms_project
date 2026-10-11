import React from 'react';
import { Download, Printer, X, CheckCircle, Building2, ShieldCheck } from 'lucide-react';
import { Transaction } from '../../types/bank';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, transaction }) => {
  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const textData = `
==================================================
        APEX RELATIONAL BANKING SYSTEM
           OFFICIAL TRANSACTION RECEIPT
==================================================
Ref Number:    ${transaction.referenceNumber}
Date & Time:   ${transaction.date} ${transaction.time}
Status:        ${transaction.status.toUpperCase()}
Type:          ${transaction.type}
--------------------------------------------------
Sender:        ${transaction.senderName}
Sender IBAN:   ${transaction.senderIban}
--------------------------------------------------
Receiver:      ${transaction.receiverName}
Receiver IBAN: ${transaction.receiverIban}
--------------------------------------------------
Amount:        ₹${Number(transaction.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })} ${transaction.currency}
Fee Charged:   ₹${Number(transaction.fee).toLocaleString('en-IN', { minimumFractionDigits: 2 })} ${transaction.currency}
Branch:        ${transaction.branch}
Description:   ${transaction.description || 'N/A'}
==================================================
Security: ACID Compliant - 256-Bit Encrypted
    `.trim();

    const blob = new Blob([textData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt-${transaction.referenceNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-[#151515] border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl glow-primary">
        {/* Receipt Header */}
        <div className="p-6 bg-gradient-to-r from-blue-900/40 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Apex Bank Receipt</h3>
              <p className="text-xs text-slate-400">Official Financial Record</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Content Body */}
        <div id="printable-receipt" className="p-6 space-y-6 text-slate-200">
          <div className="flex flex-col items-center justify-center py-2 text-center border-b border-slate-800/80 pb-4">
            <CheckCircle className="w-12 h-12 text-emerald-400 mb-2 animate-bounce" />
            <p className="text-xs font-semibold text-emerald-400 tracking-wider uppercase mb-1">
              Transaction {transaction.status}
            </p>
            <h2 className="text-3xl font-extrabold text-white font-mono-num">
              ₹{Number(transaction.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })} <span className="text-sm font-normal text-slate-400">{transaction.currency}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">{transaction.date} {transaction.time}</p>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-1 border-b border-slate-800/50">
              <span className="text-slate-400">Reference Number</span>
              <span className="font-mono text-blue-400 font-semibold">{transaction.referenceNumber}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/50">
              <span className="text-slate-400">Transaction Type</span>
              <span className="font-medium text-white">{transaction.type}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/50">
              <span className="text-slate-400">Sender Name</span>
              <span className="font-medium text-white">{transaction.senderName}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/50">
              <span className="text-slate-400">Sender IBAN</span>
              <span className="font-mono text-xs text-slate-300">{transaction.senderIban}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/50">
              <span className="text-slate-400">Receiver Name</span>
              <span className="font-medium text-white">{transaction.receiverName}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/50">
              <span className="text-slate-400">Receiver IBAN</span>
              <span className="font-mono text-xs text-slate-300">{transaction.receiverIban}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/50">
              <span className="text-slate-400">Processing Fee</span>
              <span className="font-medium text-white">₹{Number(transaction.fee).toLocaleString('en-IN', { minimumFractionDigits: 2 })} {transaction.currency}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/50">
              <span className="text-slate-400">Servicing Branch</span>
              <span className="font-medium text-white">{transaction.branch}</span>
            </div>

            {transaction.description && (
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Description</span>
                <span className="font-medium text-slate-300 text-right max-w-[200px] truncate">{transaction.description}</span>
              </div>
            )}
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0" />
            <p className="text-xs text-slate-400">
              Secured by Apex Relational Banking ACID Compliance Engine. Digital Signature Verified.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 transition text-sm font-medium"
          >
            <Download className="w-4 h-4" /> Download Text
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition text-sm glow-primary"
          >
            <Printer className="w-4 h-4" /> Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};