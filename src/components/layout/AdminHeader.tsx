import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import {
  Bell,
  Menu,
  X,
  User,
  ShieldCheck,
  ChevronDown,
  Database,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { useAdminAuth } from '../../context/AuthContext';
import { useAdminData } from '../../context/AdminDataContext';
import { UserRole, CURRENT_TENANT_ID } from '../../types';

interface HeaderProps {
  onToggleMobileNav: () => void;
}

export const AdminHeader: React.FC<HeaderProps> = ({ onToggleMobileNav }) => {
  const { user, role, switchRole, logout } = useAdminAuth();
  const { settings, notifications, unreadCount, markNotificationAsRead } = useAdminData();
  const history = useHistory();

  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-4 md:px-6 flex items-center justify-between select-none shrink-0 gap-3">
      {/* Mobile Menu & Shop Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileNav}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Demo Mode Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
          <Database className="w-3.5 h-3.5 text-admin-600" />
          <span>Tenant: <strong className="font-mono text-slate-900 dark:text-white">{CURRENT_TENANT_ID}</strong></span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-[10px] text-emerald-600 font-bold uppercase">Demo Data Active</span>
        </div>
      </div>

      {/* Right Tools: Notifications, Role Switcher, Profile */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setIsNotifDrawerOpen(!isNotifDrawerOpen)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white font-mono text-[9px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Drawer */}
          {isNotifDrawerOpen && (
            <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 bg-white dark:bg-slate-850 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
                <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-admin-600" />
                  Store Alerts & Notifications
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  {unreadCount} new
                </span>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {notifications.slice(0, 5).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      markNotificationAsRead(n.id);
                      if (n.linkTo) {
                        history.push(n.linkTo);
                        setIsNotifDrawerOpen(false);
                      }
                    }}
                    className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer ${
                      !n.isRead ? 'bg-admin-50/40 dark:bg-admin-950/20' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-slate-900 dark:text-white">{n.title}</p>
                      {!n.isRead && <span className="w-2 h-2 rounded-full bg-admin-600 shrink-0 mt-1" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">{n.message}</p>
                    <span className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-3 border-t text-center bg-slate-50 dark:bg-slate-900">
                <Link
                  to="/notifications"
                  onClick={() => setIsNotifDrawerOpen(false)}
                  className="text-xs font-bold text-admin-600 hover:underline"
                >
                  View All Notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Role Switcher (Owner vs Manager test toggle) */}
        <div className="relative">
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-admin-600" />
            <span>Role: {role}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isRoleDropdownOpen && (
            <div className="absolute right-0 top-11 z-50 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-1.5">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase">Test Active Role</div>
              {(['OWNER', 'MANAGER', 'CASHIER'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    switchRole(r);
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between ${
                    role === r
                      ? 'bg-admin-50 text-admin-700 dark:bg-admin-950 dark:text-admin-300 font-bold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{r}</span>
                  {role === r && <span className="text-admin-600 font-bold">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
