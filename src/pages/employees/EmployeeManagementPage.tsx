import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  ShieldCheck,
  Check,
  X,
  Phone,
  Mail,
  Calendar,
  Lock,
  UserCheck,
  Sliders,
  AlertCircle
} from 'lucide-react';
import { Employee, UserRole, ALL_PERMISSIONS, PermissionCategory, PermissionKey, ROLE_DEFAULT_PERMISSIONS } from '../../types';
import { dataRepository } from '../../services/repositories/dataRepository';
import { useAdminAuth } from '../../context/AuthContext';

export const EmployeeManagementPage: React.FC = () => {
  const { hasPermission } = useAdminAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('CASHIER');
  const [permissions, setPermissions] = useState<Record<PermissionKey, boolean>>(ROLE_DEFAULT_PERMISSIONS.CASHIER);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = () => {
    setEmployees(dataRepository.getEmployees());
  };

  const openCreateModal = () => {
    setEditingEmployee(null);
    setName('');
    setPhone('');
    setEmail('');
    setRole('CASHIER');
    setPermissions({ ...ROLE_DEFAULT_PERMISSIONS.CASHIER });
    setIsModalOpen(true);
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setName(emp.name);
    setPhone(emp.phone);
    setEmail(emp.email);
    setRole(emp.role);
    setPermissions({ ...emp.permissions });
    setIsModalOpen(true);
  };

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    setPermissions({ ...ROLE_DEFAULT_PERMISSIONS[newRole] });
  };

  const togglePermission = (key: PermissionKey) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    if (editingEmployee) {
      dataRepository.updateEmployee(editingEmployee.id, {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        role,
        permissions,
      });
    } else {
      dataRepository.addEmployee({
        tenantId: 'shop-ezo-001',
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        role,
        joiningDate: new Date().toISOString().split('T')[0],
        status: 'ACTIVE',
        permissions,
        totalSalesBilled: 0,
        totalTransactionsHandled: 0,
      });
    }

    setIsModalOpen(false);
    loadEmployees();
  };

  const handleToggleStatus = (id: string) => {
    dataRepository.toggleEmployeeStatus(id);
    loadEmployees();
  };

  const permissionCategories: Array<{ id: PermissionCategory; label: string }> = [
    { id: 'sales', label: 'Sales & Receipts' },
    { id: 'inventory', label: 'Inventory & Stock' },
    { id: 'reports', label: 'Reports & Analytics' },
    { id: 'financial', label: 'Financial & Expenses' },
    { id: 'settings', label: 'Store Settings' },
    { id: 'employees', label: 'Employee Control' },
  ];

  return (
    <div className="space-y-4 pb-12 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-admin-600" />
            Staff & Role-Based Access Control (RBAC)
          </h1>
          <p className="text-xs text-slate-500">
            Manage store employees, cashier permissions, supervisor authorizations, and sales metrics
          </p>
        </div>

        {hasPermission('employees.manage') && (
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-2xl bg-admin-600 hover:bg-admin-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-admin-500/20"
          >
            <Plus className="w-4 h-4" />
            Add Staff Member
          </button>
        )}
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {employees.map((emp) => {
          const activePermsCount = Object.values(emp.permissions || {}).filter(Boolean).length;

          return (
            <div
              key={emp.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      emp.role === 'OWNER'
                        ? 'bg-emerald-100 text-emerald-800'
                        : emp.role === 'MANAGER'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {emp.role}
                  </span>

                  <button
                    onClick={() => handleToggleStatus(emp.id)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors ${
                      emp.status === 'ACTIVE'
                        ? 'border-emerald-300 text-emerald-700 bg-emerald-50'
                        : 'border-slate-300 text-slate-400 bg-slate-50'
                    }`}
                  >
                    {emp.status}
                  </button>
                </div>

                <div className="flex items-center gap-3 mt-3">
                  <div className="w-12 h-12 rounded-2xl bg-admin-100 text-admin-800 font-black text-sm flex items-center justify-center shrink-0 border border-admin-300">
                    {emp.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">{emp.name}</h3>
                    <p className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {emp.phone}
                    </p>
                  </div>
                </div>

                {/* Sales metric */}
                <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total Sales Billed:</span>
                    <span className="font-black font-mono text-slate-800 dark:text-slate-200">
                      ₹{emp.totalSalesBilled.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Bills Handled:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                      {emp.totalTransactionsHandled}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">
                  {activePermsCount} Active Permissions
                </span>

                <button
                  onClick={() => openEditModal(emp)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1"
                >
                  <Sliders className="w-3 h-3" />
                  Configure
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Employee & Permissions Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60 shrink-0">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {editingEmployee ? `Configure Staff: ${editingEmployee.name}` : 'Register New Staff Member'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
              {/* Employee Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full p-2.5 rounded-xl border font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9820012345"
                    className="w-full p-2.5 rounded-xl border font-mono font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. ramesh@ezomart.com"
                    className="w-full p-2.5 rounded-xl border font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Assigned Role *</label>
                  <select
                    value={role}
                    onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                    className="w-full p-2.5 rounded-xl border font-bold"
                  >
                    <option value="OWNER">OWNER (Full Administrative Access)</option>
                    <option value="MANAGER">MANAGER (Operations & Inventory)</option>
                    <option value="CASHIER">CASHIER (Checkout Counter Operator)</option>
                  </select>
                </div>
              </div>

              {/* Grouped Permissions Matrix */}
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-admin-600" />
                    Granular Access Control Matrix
                  </span>
                  <span className="text-[10px] text-slate-400">Customizable permissions</span>
                </div>

                <div className="space-y-4">
                  {permissionCategories.map((cat) => {
                    const perms = ALL_PERMISSIONS.filter((p) => p.category === cat.id);
                    return (
                      <div key={cat.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">{cat.label}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {perms.map((p) => {
                            const isChecked = Boolean(permissions[p.key]);
                            return (
                              <label
                                key={p.key}
                                className={`flex items-start gap-2 p-2 rounded-xl border cursor-pointer transition-all ${
                                  isChecked
                                    ? 'bg-white dark:bg-slate-900 border-admin-300 dark:border-admin-700 shadow-sm'
                                    : 'bg-slate-100/60 dark:bg-slate-800/30 border-transparent text-slate-400'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => togglePermission(p.key)}
                                  className="mt-0.5 rounded text-admin-600"
                                />
                                <div>
                                  <span className="font-bold block text-[11px] text-slate-900 dark:text-white leading-tight">
                                    {p.label}
                                  </span>
                                  <span className="text-[10px] text-slate-400 leading-tight">
                                    {p.description}
                                  </span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-admin-600 hover:bg-admin-500 text-white font-bold shadow-md shadow-admin-500/20"
                >
                  Save Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
