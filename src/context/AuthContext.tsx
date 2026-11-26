import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser, UserRole, PermissionKey } from '../types';
import { adminAuthService } from '../services/api/authService';

export interface AdminAuthContextType {
  user: AdminUser | null;
  currentUser: AdminUser | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasPermission: (key: PermissionKey) => boolean;
  login: (identifier: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
  switchDemoRole: (role: UserRole) => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const current = adminAuthService.getCurrentUser();
    setUser(current);
    setIsLoading(false);
  }, []);

  const hasPermission = (key: PermissionKey): boolean => {
    if (!user) return false;
    if (user.role === 'OWNER') return true;
    return Boolean(user.permissions[key]);
  };

  const login = async (identifier: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await adminAuthService.login(identifier, pass);
      setUser(res.user);
      setIsLoading(false);
      return true;
    } catch (e) {
      setIsLoading(false);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    await adminAuthService.logout();
    setUser(null);
  };

  const switchRole = async (role: UserRole): Promise<void> => {
    const updated = await adminAuthService.switchRole(role);
    setUser(updated);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        currentUser: user,
        role: user?.role || 'OWNER',
        isAuthenticated: Boolean(user),
        isLoading,
        hasPermission,
        login,
        logout,
        switchRole,
        switchDemoRole: switchRole,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const AuthProvider = AdminAuthProvider;

export const useAdminAuth = (): AdminAuthContextType => {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return context;
};
