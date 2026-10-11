import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  MapPin,
  Send,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  CheckCircle2,
  Clock,
  HelpCircle,
} from 'lucide-react';
import { PublicPage } from '../../types/bank';

interface ContactViewProps {
  onNavigateLogin: () => void;
  onNavigatePage: (page: PublicPage) => void;
}

export const ContactView: React.FC<ContactViewProps> = ({ onNavigateLogin, onNavigatePage }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
    }, 4000);
  };

  const faqs = [
    {
      q: 'How does Role-Based Access Control (RBAC) work in Apex BMS?',
      a: 'The system segregates permissions into four distinct user roles: Customer, Bank Teller, Branch Manager, and Database Administrator. Each role has custom dashboards, forms, and navigation menus restricted to its operational authorization.',
    },
    {
      q: 'Are financial transactions atomic and ACID compliant?',
      a: 'Yes. Every money transfer, deposit, or withdrawal executes within an atomic database transaction. If any part of the transfer fails, all mutations are rolled back automatically to preserve ledger consistency.',
    },
    {
      q: 'How can a Database Administrator review Audit Logs?',
      a: 'DBAs have access to a dedicated Audit Logs module. Every operation records the exact timestamp, executing user, action type, affected database table, and a diff between old and new row values.',
    },
    {
      q: 'Where can I find branch liquidity metrics and loan approvals?',
      a: 'Branch Managers can log into the Branch Manager Dashboard to inspect real-time vault liquidity, reserve ratios, monthly revenue trends, and review pending customer loan applications with approval/rejection workflows.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white font-sans flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0B0B0B]/90 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigatePage('landing')}>
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg glow-primary">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-extrabold text-white block leading-none">
                APEX<span className="text-blue-500">BANK</span>
              </span>
              <span className="text-[10px] text-cyan-400 font-semibold tracking-widest uppercase">
                Support & Inquiries
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigatePage('landing')}
              className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" /> Home
            </button>
            <button
              onClick={onNavigateLogin}
              className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl glow-primary"
            >
              Portal Login
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Title */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Contact & Support Operations</h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
            Get in touch with our enterprise banking support team or consult system documentation.
          </p>
        </div>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Column */}
          <div className="lg:col-span-7 bg-[#151515] p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-400" /> Send an Inquiry
            </h2>

            {submitted ? (
              <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 flex flex-col items-center text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
                <h3 className="text-lg font-bold">Message Transmitted</h3>
                <p className="text-xs text-slate-300">
                  Thank you for reaching out. Our enterprise support team will review your inquiry shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="w-full bg-[#0B0B0B] border border-slate-800 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. john@company.com"
                      className="w-full bg-[#0B0B0B] border border-slate-800 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Inquiry Topic</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-[#0B0B0B] border border-slate-800 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Role Access Permission">Role Access Permission</option>
                    <option value="Audit & Compliance">Audit & Compliance</option>
                    <option value="Database Integration">Database Integration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Message Details</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your inquiry..."
                    className="w-full bg-[#0B0B0B] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg glow-primary transition flex items-center justify-center gap-2 text-sm"
                >
                  <Send className="w-4 h-4" /> Submit Inquiry
                </button>
              </form>
            )}
          </div>

          {/* Info Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#151515] p-6 rounded-2xl border border-slate-800 space-y-4 text-xs">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-400" /> Support Information & HQ
              </h3>

              <div className="space-y-3 text-slate-300">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Global Headquarters</p>
                    <p className="text-slate-400">100 Wall Street Financial Plaza, Level 28, New York, NY 10005</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Telephone Hotlines</p>
                    <p className="text-slate-400">+1 (800) 555-APEX (US & Canada)</p>
                    <p className="text-slate-400">+44 20 7946 0990 (International)</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Operations Hours</p>
                    <p className="text-slate-400">24/7 Security Operations Center (SOC)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQs Accordion */}
        <div className="bg-[#151515] p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/20 rounded-xl text-blue-400">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
              <p className="text-xs text-slate-400">Common questions about the Bank Management System</p>
            </div>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="border border-slate-800 rounded-xl bg-[#0B0B0B] overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-semibold text-white hover:text-blue-400"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-blue-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="p-4 pt-0 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 mt-1">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#0B0B0B] border-t border-slate-800 py-6 text-center text-xs text-slate-500 mt-auto">
        <p>© 2026 Apex Relational Bank Management System.</p>
      </footer>
    </div>
  );
};
