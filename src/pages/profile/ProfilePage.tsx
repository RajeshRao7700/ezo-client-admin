import React, { useState } from 'react';
import {
  User,
  Shield,
  Key,
  CheckCircle,
  Building,
  Mail,
  Phone,
  Clock,
  Lock,
  X,
  Sparkles,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

export const ProfilePage: React.FC = () => {
  const { currentUser, switchDemoRole } = useAdminAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    showToast('Password updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Toast */}
      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Profile & Credentials</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your account profile, role-based authorization keys and security access
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-md">
            {currentUser?.name?.charAt(0) || 'R'}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-slate-900">{currentUser?.name}</h2>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  currentUser?.role === 'OWNER'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {currentUser?.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{currentUser?.email}</p>
            <div className="flex items-center space-x-3 text-xs text-slate-400 mt-2">
              <span className="flex items-center">
                <Building className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Tenant ID: <strong className="text-slate-700 ml-1 font-mono">{currentUser?.tenantId}</strong>
              </span>
              <span>•</span>
              <span className="flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Session: Active
              </span>
            </div>
          </div>
        </div>

        {/* Role Switcher Pill */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">
            Switch Role (Demo Simulation)
          </span>
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => switchDemoRole('OWNER')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentUser?.role === 'OWNER'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Owner
            </button>
            <button
              onClick={() => switchDemoRole('MANAGER')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentUser?.role === 'MANAGER'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Manager
            </button>
          </div>
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <h3 className="text-base font-bold text-slate-800 mb-2 flex items-center space-x-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <span>Active Role Authorizations ({Object.values(currentUser?.permissions || {}).filter(Boolean).length} granted)</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Permissions enforced by the client router and backend Laravel Sanctum policies
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {Object.entries(currentUser?.permissions || {})
            .filter(([_, granted]) => granted)
            .map(([perm]) => (
              <div
                key={perm}
                className="flex items-center space-x-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-mono font-medium text-slate-700"
              >
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span className="truncate">{perm}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Change Password Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center space-x-2">
          <Lock className="w-5 h-5 text-amber-600" />
          <span>Change Admin Password</span>
        </h3>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              New Password (Min 6 Characters)
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};
