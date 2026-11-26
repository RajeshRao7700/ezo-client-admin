import { AdminUser, UserRole, PermissionKey, CURRENT_TENANT_ID, ROLE_DEFAULT_PERMISSIONS } from '../../types';
import { apiClient } from './apiClient';

const ACTIVE_ADMIN_KEY = 'ezo_active_admin_user';

export const MOCK_ADMIN_USERS: AdminUser[] = [
  {
    id: 'admin-owner-1',
    tenantId: CURRENT_TENANT_ID,
    name: 'Rajesh Varma (Owner)',
    email: 'owner@ezomart.com',
    phone: '9820011223',
    role: 'OWNER',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    permissions: ROLE_DEFAULT_PERMISSIONS.OWNER,
    createdAt: '2025-01-15T00:00:00Z',
  },
  {
    id: 'admin-mgr-1',
    tenantId: CURRENT_TENANT_ID,
    name: 'Sunil Patil (Store Manager)',
    email: 'manager@ezomart.com',
    phone: '9820044556',
    role: 'MANAGER',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    permissions: ROLE_DEFAULT_PERMISSIONS.MANAGER,
    createdAt: '2025-03-01T00:00:00Z',
  },
];

export class AdminAuthService {
  private currentUser: AdminUser | null = null;

  constructor() {
    this.loadPersistedUser();
  }

  private loadPersistedUser(): void {
    try {
      const data = localStorage.getItem(ACTIVE_ADMIN_KEY);
      if (data) {
        this.currentUser = JSON.parse(data);
      } else {
        this.currentUser = MOCK_ADMIN_USERS[0];
        localStorage.setItem(ACTIVE_ADMIN_KEY, JSON.stringify(this.currentUser));
      }
    } catch (e) {
      this.currentUser = MOCK_ADMIN_USERS[0];
    }
  }

  public getCurrentUser(): AdminUser | null {
    if (!this.currentUser) {
      this.loadPersistedUser();
    }
    return this.currentUser;
  }

  public async login(identifier: string, pass: string): Promise<{ user: AdminUser; token: string }> {
    await new Promise((r) => setTimeout(r, 400));
    const trimmed = identifier.trim().toLowerCase();

    const matched = MOCK_ADMIN_USERS.find(
      (u) => u.email.toLowerCase() === trimmed || u.phone.includes(trimmed)
    );

    if (matched) {
      this.setCurrentUser(matched);
      const token = `ezo_admin_token_${matched.id}`;
      apiClient.setToken(token);
      return { user: matched, token };
    }

    // Default to Owner
    const customUser: AdminUser = {
      id: `admin-${Date.now()}`,
      tenantId: CURRENT_TENANT_ID,
      name: identifier.split('@')[0] || 'Store Owner',
      email: identifier.includes('@') ? identifier : `${identifier}@ezomart.com`,
      phone: '9820099999',
      role: 'OWNER',
      permissions: ROLE_DEFAULT_PERMISSIONS.OWNER,
      createdAt: new Date().toISOString(),
    };
    this.setCurrentUser(customUser);
    const token = `ezo_admin_token_${Date.now()}`;
    apiClient.setToken(token);
    return { user: customUser, token };
  }

  public async switchRole(role: UserRole): Promise<AdminUser> {
    const matched = MOCK_ADMIN_USERS.find((u) => u.role === role) || {
      ...MOCK_ADMIN_USERS[0],
      role,
      permissions: ROLE_DEFAULT_PERMISSIONS[role],
    };
    this.setCurrentUser(matched);
    return matched;
  }

  public setCurrentUser(user: AdminUser | null): void {
    this.currentUser = user;
    if (user) {
      localStorage.setItem(ACTIVE_ADMIN_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(ACTIVE_ADMIN_KEY);
    }
  }

  public async logout(): Promise<void> {
    apiClient.clearToken();
    this.currentUser = null;
    localStorage.removeItem(ACTIVE_ADMIN_KEY);
  }

  public async forgotPassword(email: string): Promise<boolean> {
    await new Promise((r) => setTimeout(r, 400));
    return true;
  }

  public async resetPassword(token: string, newPass: string): Promise<boolean> {
    await new Promise((r) => setTimeout(r, 400));
    return true;
  }
}

export const adminAuthService = new AdminAuthService();
