import React, { useState } from 'react';
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Package,
  Calendar,
  CreditCard,
  Info,
  Clock,
  Check,
  Filter,
} from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { AppNotification } from '../../types';

export const NotificationsPage: React.FC = () => {
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useAdminData();
  const [filterType, setFilterType] = useState<'ALL' | 'UNREAD'>('ALL');

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === 'UNREAD') return !n.isRead;
    return true;
  });

  const getNotificationIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'LOW_STOCK':
      case 'OUT_OF_STOCK':
        return <Package className="w-5 h-5 text-amber-600" />;
      case 'EXPIRY':
        return <Calendar className="w-5 h-5 text-purple-600" />;
      case 'SUBSCRIPTION':
        return <CreditCard className="w-5 h-5 text-blue-600" />;
      case 'SYSTEM':
      case 'EMPLOYEE':
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      default:
        return <Info className="w-5 h-5 text-slate-500" />;
    }
  };

  const getSeverityBadge = (severity?: AppNotification['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full">CRITICAL</span>;
      case 'WARNING':
        return <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">WARNING</span>;
      default:
        return <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">INFO</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notifications & Store Alerts</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time triggers for critical inventory reorders, expiry notices and sales milestones
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Mark All as Read ({unreadCount})</span>
          </button>
        )}
      </div>

      {/* Filter Chips */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setFilterType('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            filterType === 'ALL'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilterType('UNREAD')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            filterType === 'UNREAD'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Unread Alerts ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200/80 shadow-sm">
            <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-600 font-semibold">No notifications to display</p>
            <p className="text-xs text-slate-400 mt-1">You are completely caught up with all store alerts</p>
          </div>
        ) : (
          filteredNotifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markAsRead(n.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                n.isRead
                  ? 'bg-white border-slate-200/80 opacity-80 hover:opacity-100'
                  : 'bg-blue-50/40 border-blue-200/80 shadow-sm'
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <div className="p-2.5 rounded-xl bg-white border border-slate-100 shadow-xs flex-shrink-0">
                  {getNotificationIcon(n.type)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-800">{n.title}</span>
                    {getSeverityBadge(n.severity)}
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{n.message}</p>
                  <div className="flex items-center space-x-1 text-[11px] text-slate-400 mt-2">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(n.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  </div>
                </div>
              </div>

              {!n.isRead && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    markAsRead(n.id);
                  }}
                  title="Mark as read"
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap p-1"
                >
                  Mark read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
