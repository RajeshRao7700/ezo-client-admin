import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  Users,
  Boxes,
  BarChart3,
  Settings,
  CreditCard,
  Bell,
  Activity,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Store
} from 'lucide-react';
import { useAdminAuth } from '../../context/AuthContext';
import { useAdminData } from '../../context/AdminDataContext';
import { CURRENT_TENANT_ID } from '../../types';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onCloseMobile?: () => void;
}

export const AdminSidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse, onCloseMobile }) => {
  const { user, role, hasPermission, logout } = useAdminAuth();
  const { settings, unreadCount } = useAdminData();
  const location = useLocation();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/sales', label: 'Sales Monitoring', icon: Receipt, permission: 'sales.view' as const },
    { to: '/employees', label: 'Employee & Access', icon: Users, permission: 'employees.view' as const },
    { to: '/inventory', label: 'Inventory & Stock', icon: Boxes, permission: 'inventory.view_products' as const },
    { to: '/reports', label: 'Financial Reports', icon: BarChart3, permission: 'reports.sales' as const },
    { to: '/settings', label: 'Business Settings', icon: Settings, permission: 'settings.view' as const },
    { to: '/subscription', label: 'Subscription Plan', icon: CreditCard },
    { to: '/notifications', label: 'Notifications', icon: Bell, badge: unreadCount > 0 ? unreadCount : undefined },
    { to: '/activity', label: 'Activity Logs', icon: Activity },
    { to: '/profile', label: 'My Profile', icon: User },
  ];

  return (
    <aside
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col h-full transition-all duration-300 select-none shrink-0 z-30`}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-admin-600 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-admin-500/20 shrink-0">
            E
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <h1 className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white leading-none">
                EZO CLIENT ADMIN
              </h1>
              <p className="text-[10px] text-slate-400 font-medium truncate mt-1 flex items-center gap-1">
                <Store className="w-3 h-3 text-admin-600 shrink-0" />
                <span className="truncate">{settings.profile.shopName}</span>
              </p>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 admin-scroll-hidden">
        {navItems.map((item) => {
          if (item.permission && !hasPermission(item.permission)) {
            return null;
          }

          const isActive = location.pathname.startsWith(item.to);
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={`flex items-center ${
                isCollapsed ? 'justify-center px-2 py-3' : 'justify-between px-3 py-2.5'
              } rounded-2xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-admin-50 text-admin-700 dark:bg-admin-950 dark:text-admin-300 font-bold border-l-4 border-admin-600 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-admin-600 dark:text-admin-400' : 'text-slate-400'}`} />
                {!isCollapsed && <span>{item.label}</span>}
              </div>

              {!isCollapsed && item.badge && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-mono text-[10px] font-bold">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} gap-2`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-admin-100 text-admin-800 font-bold text-xs flex items-center justify-center shrink-0 border border-admin-300">
              {user?.name.charAt(0) || 'A'}
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{user?.name || 'Owner'}</p>
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                  role === 'OWNER' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {role}
                </span>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
