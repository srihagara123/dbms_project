import React, { useEffect, useState } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Save,
  Landmark,
  CalendarDays,
  CreditCard,
} from 'lucide-react';
import { Customer } from '../../types/bank';

interface ProfileViewProps {
  currentUser: Customer;
  onUpdateProfile: (updated: Customer) => void;
  onShowToast: (
    title: string,
    desc: string,
    type: 'success' | 'error' | 'warning' | 'info'
  ) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  onUpdateProfile,
  onShowToast,
}) => {
  const [name, setName] = useState(currentUser.name ?? '');
  const [email, setEmail] = useState(currentUser.email ?? '');
  const [phone, setPhone] = useState(currentUser.phone ?? '');
  const [address, setAddress] = useState(currentUser.address ?? '');

  useEffect(() => {
    setName(currentUser.name ?? '');
    setEmail(currentUser.email ?? '');
    setPhone(currentUser.phone ?? '');
    setAddress(currentUser.address ?? '');
  }, [currentUser]);

  const handleProfileSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !address.trim()) {
      onShowToast('Missing Information', 'Please complete all personal information fields.', 'error');
      return;
    }

    onUpdateProfile({
      ...currentUser,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
    });
    onShowToast('Profile Saved', 'Your personal information has been updated.', 'success');
  };

  const maskedAccount = currentUser.accountNumber
    ? `•••• •••• ${currentUser.accountNumber.slice(-4)}`
    : 'Not available';

  return (
    <div className="space-y-6 font-sans text-white">
      <div>
        <h1 className="text-2xl font-black">My Profile</h1>
        <p className="mt-1 text-sm text-slate-400">Manage your personal information and banking identity.</p>
      </div>

      <section className="flex flex-col gap-5 rounded-3xl border border-slate-700/80 bg-[#1E293B] p-6 shadow-xl sm:flex-row sm:items-center sm:p-8">
        {currentUser.avatar ? (
          <img
            src={currentUser.avatar}
            alt={`${currentUser.name}'s profile`}
            className="h-24 w-24 rounded-3xl border-4 border-[#3B82F6] object-cover shadow-xl"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-[#3B82F6] bg-slate-800 text-3xl font-black text-blue-300">
            {(currentUser.name || 'U').charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1 space-y-2 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <h2 className="text-2xl font-black">{currentUser.name}</h2>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" /> {currentUser.status || 'Status unavailable'}
            </span>
          </div>
          <p className="break-words text-xs text-slate-300">Username: @{currentUser.username || 'not set'}</p>
          <p className="text-xs text-slate-300">Customer ID: {currentUser.id}</p>
          <p className="text-xs text-slate-400">Branch: {currentUser.branch || 'Not assigned'} · Member since {currentUser.joinedDate || 'Not available'}</p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <section className="rounded-3xl border border-slate-700/80 bg-[#1E293B] p-6 shadow-xl sm:p-8 xl:col-span-3">
          <div className="mb-6 flex items-center gap-2 border-b border-slate-700/60 pb-4">
            <User className="h-5 w-5 text-[#3B82F6]" />
            <h2 className="text-lg font-bold">Personal Information</h2>
          </div>

          <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
            <div>
              <label htmlFor="profile-name" className="mb-1 block font-semibold text-slate-300">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input id="profile-name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-slate-700 bg-[#0F172A] py-2.5 pl-10 pr-4 text-white outline-none focus:border-[#3B82F6]" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="profile-email" className="mb-1 block font-semibold text-slate-300">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input id="profile-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-slate-700 bg-[#0F172A] py-2.5 pl-10 pr-4 text-white outline-none focus:border-[#3B82F6]" />
                </div>
              </div>
              <div>
                <label htmlFor="profile-phone" className="mb-1 block font-semibold text-slate-300">Mobile Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input id="profile-phone" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-xl border border-slate-700 bg-[#0F172A] py-2.5 pl-10 pr-4 text-white outline-none focus:border-[#3B82F6]" />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="profile-address" className="mb-1 block font-semibold text-slate-300">Residential Address</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input id="profile-address" type="text" required value={address} onChange={(e) => setAddress(e.target.value)} className="w-full rounded-xl border border-slate-700 bg-[#0F172A] py-2.5 pl-10 pr-4 text-white outline-none focus:border-[#3B82F6]" />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-[#3B82F6] px-5 py-3 text-xs font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-600">
                <Save className="h-4 w-4" /> Save Personal Info
              </button>
              <button type="button" onClick={() => { setName(currentUser.name ?? ''); setEmail(currentUser.email ?? ''); setPhone(currentUser.phone ?? ''); setAddress(currentUser.address ?? ''); }} className="rounded-xl border border-slate-600 px-5 py-3 text-xs font-bold text-slate-300 transition hover:bg-slate-800">Reset Changes</button>
            </div>
          </form>
        </section>

        <section className="space-y-4 rounded-3xl border border-slate-700/80 bg-[#1E293B] p-6 shadow-xl sm:p-8 xl:col-span-2">
          <div className="flex items-center gap-2 border-b border-slate-700/60 pb-4">
            <Landmark className="h-5 w-5 text-[#3B82F6]" />
            <h2 className="text-lg font-bold">Banking Information</h2>
          </div>
          <InfoRow icon={<CreditCard className="h-4 w-4" />} label="Primary Account" value={maskedAccount} />
          <InfoRow icon={<Landmark className="h-4 w-4" />} label="Account Type" value={currentUser.accountType || 'Not available'} />
          <InfoRow icon={<ShieldCheck className="h-4 w-4" />} label="Verification Status" value={currentUser.status || 'Not available'} />
          <InfoRow icon={<MapPin className="h-4 w-4" />} label="Home Branch" value={currentUser.branch || 'Not assigned'} />
          <InfoRow icon={<CalendarDays className="h-4 w-4" />} label="Member Since" value={currentUser.joinedDate || 'Not available'} />
          <p className="rounded-xl border border-slate-700 bg-[#0F172A]/70 p-3 text-[11px] leading-relaxed text-slate-400">For your security, account numbers are masked on this page.</p>
        </section>
      </div>
    </div>
  );
};

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 border-b border-slate-700/50 py-3 last:border-b-0">
    <span className="mt-0.5 text-blue-300">{icon}</span>
    <div className="min-w-0 flex-1">
      <p className="text-[11px] font-medium text-slate-400">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-white">{value}</p>
    </div>
  </div>
);

export default ProfileView;
