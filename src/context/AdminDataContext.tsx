import React, { createContext, useContext, useState, useEffect } from 'react';
import { BusinessSettings, ShopSubscription, AppNotification } from '../types';
import { dataRepository } from '../services/repositories/dataRepository';

export interface AdminDataContextType {
  settings: BusinessSettings;
  subscription: ShopSubscription;
  notifications: AppNotification[];
  unreadCount: number;
  updateSettings: (newSettings: BusinessSettings) => void;
  markNotificationAsRead: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  markAllAsRead: () => void;
  refreshData: () => void;
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);

export const AdminDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<BusinessSettings>(dataRepository.getSettings());
  const [subscription, setSubscription] = useState<ShopSubscription>(dataRepository.getSubscription());
  const [notifications, setNotifications] = useState<AppNotification[]>(dataRepository.getNotifications());

  const refreshData = () => {
    setSettings(dataRepository.getSettings());
    setSubscription(dataRepository.getSubscription());
    setNotifications(dataRepository.getNotifications());
  };

  const updateSettings = (newSettings: BusinessSettings) => {
    dataRepository.saveSettings(newSettings);
    setSettings(newSettings);
  };

  const markNotificationAsRead = (id: string) => {
    dataRepository.markNotificationRead(id);
    setNotifications([...dataRepository.getNotifications()]);
  };

  const markAllNotificationsAsRead = () => {
    dataRepository.markAllNotificationsRead();
    setNotifications([...dataRepository.getNotifications()]);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AdminDataContext.Provider
      value={{
        settings,
        subscription,
        notifications,
        unreadCount,
        updateSettings,
        markNotificationAsRead,
        markAsRead: markNotificationAsRead,
        markAllNotificationsAsRead,
        markAllAsRead: markAllNotificationsAsRead,
        refreshData,
      }}
    >
      {children}
    </AdminDataContext.Provider>
  );
};

export const useAdminData = (): AdminDataContextType => {
  const context = useContext(AdminDataContext);
  if (!context) throw new Error('useAdminData must be used within AdminDataProvider');
  return context;
};
