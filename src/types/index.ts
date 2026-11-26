// Tenant and Organization Context
export const CURRENT_TENANT_ID = 'shop-ezo-001';

// Role Definitions
export type UserRole = 'OWNER' | 'MANAGER' | 'CASHIER';

// Grouped Permissions
export type PermissionCategory = 
  | 'sales' 
  | 'inventory' 
  | 'reports' 
  | 'settings' 
  | 'financial' 
  | 'employees';

export type PermissionKey =
  // Sales
  | 'sales.view'
  | 'sales.invoices'
  | 'sales.returns'
  // Inventory
  | 'inventory.view_products'
  | 'inventory.view_stock'
  | 'inventory.adjust_stock'
  | 'inventory.manage_products'
  // Reports
  | 'reports.sales'
  | 'reports.profit_loss'
  | 'reports.gst'
  | 'reports.inventory'
  | 'reports.customers'
  // Settings
  | 'settings.view'
  | 'settings.edit'
  // Financial
  | 'financial.expenses'
  | 'financial.customer_dues'
  | 'financial.profit_loss'
  // Employees
  | 'employees.view'
  | 'employees.manage';

export interface PermissionDefinition {
  key: PermissionKey;
  label: string;
  category: PermissionCategory;
  description: string;
}

export const ALL_PERMISSIONS: PermissionDefinition[] = [
  // Sales
  { key: 'sales.view', label: 'View Sales Overview', category: 'sales', description: 'Can view general daily/monthly sales volume' },
  { key: 'sales.invoices', label: 'Inspect Invoices', category: 'sales', description: 'Can inspect individual invoice line items and customer details' },
  { key: 'sales.returns', label: 'View Returns & Refunds', category: 'sales', description: 'Can monitor returned goods and refund amounts' },

  // Inventory
  { key: 'inventory.view_products', label: 'View Products Catalog', category: 'inventory', description: 'Can view SKU catalog and retail prices' },
  { key: 'inventory.view_stock', label: 'View Real-Time Stock', category: 'inventory', description: 'Can check current warehouse and shelf stock counts' },
  { key: 'inventory.adjust_stock', label: 'Adjust Stock / Write-offs', category: 'inventory', description: 'Can record damages, audit variances, and write-offs' },
  { key: 'inventory.manage_products', label: 'Create & Edit Products', category: 'inventory', description: 'Can add new SKUs and update selling prices' },

  // Reports
  { key: 'reports.sales', label: 'Access Sales Reports', category: 'reports', description: 'Can view and export daily/monthly sales reports' },
  { key: 'reports.profit_loss', label: 'Access P&L Statements', category: 'reports', description: 'Can view COGS, Gross Margin, and Net Profit' },
  { key: 'reports.gst', label: 'Access GST Reports', category: 'reports', description: 'Can export GSTR summaries and tax liability' },
  { key: 'reports.inventory', label: 'Stock Valuation Reports', category: 'reports', description: 'Can view inventory asset valuation at cost' },
  { key: 'reports.customers', label: 'Customer Dues & Khata Reports', category: 'reports', description: 'Can inspect market receivables and customer dues' },

  // Settings
  { key: 'settings.view', label: 'View Business Settings', category: 'settings', description: 'Can view store profile and GST numbers' },
  { key: 'settings.edit', label: 'Modify Store Settings', category: 'settings', description: 'Can modify store profile, taxes, and invoice preferences' },

  // Financial
  { key: 'financial.expenses', label: 'Manage Store Expenses', category: 'financial', description: 'Can view and record daily petty cash and expenses' },
  { key: 'financial.customer_dues', label: 'Manage Customer Ledgers', category: 'financial', description: 'Can monitor and reconcile customer credit' },
  { key: 'financial.profit_loss', label: 'Financial Profit Visibility', category: 'financial', description: 'Can see full revenue vs expense net profit' },

  // Employees
  { key: 'employees.view', label: 'View Employee Directory', category: 'employees', description: 'Can see list of store staff and roles' },
  { key: 'employees.manage', label: 'Manage Staff & Roles', category: 'employees', description: 'Can create employees, reset logins, and assign permissions' },
];

export const ROLE_DEFAULT_PERMISSIONS: Record<UserRole, Record<PermissionKey, boolean>> = {
  OWNER: {
    'sales.view': true,
    'sales.invoices': true,
    'sales.returns': true,
    'inventory.view_products': true,
    'inventory.view_stock': true,
    'inventory.adjust_stock': true,
    'inventory.manage_products': true,
    'reports.sales': true,
    'reports.profit_loss': true,
    'reports.gst': true,
    'reports.inventory': true,
    'reports.customers': true,
    'settings.view': true,
    'settings.edit': true,
    'financial.expenses': true,
    'financial.customer_dues': true,
    'financial.profit_loss': true,
    'employees.view': true,
    'employees.manage': true,
  },
  MANAGER: {
    'sales.view': true,
    'sales.invoices': true,
    'sales.returns': true,
    'inventory.view_products': true,
    'inventory.view_stock': true,
    'inventory.adjust_stock': true,
    'inventory.manage_products': true,
    'reports.sales': true,
    'reports.profit_loss': false, // Hidden by default for managers
    'reports.gst': true,
    'reports.inventory': true,
    'reports.customers': true,
    'settings.view': true,
    'settings.edit': false,
    'financial.expenses': true,
    'financial.customer_dues': true,
    'financial.profit_loss': false,
    'employees.view': true,
    'employees.manage': false,
  },
  CASHIER: {
    'sales.view': false,
    'sales.invoices': false,
    'sales.returns': false,
    'inventory.view_products': true,
    'inventory.view_stock': true,
    'inventory.adjust_stock': false,
    'inventory.manage_products': false,
    'reports.sales': false,
    'reports.profit_loss': false,
    'reports.gst': false,
    'reports.inventory': false,
    'reports.customers': false,
    'settings.view': false,
    'settings.edit': false,
    'financial.expenses': false,
    'financial.customer_dues': false,
    'financial.profit_loss': false,
    'employees.view': false,
    'employees.manage': false,
  },
};

// Admin User Profile
export interface AdminUser {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  permissions: Record<PermissionKey, boolean>;
  createdAt: string;
}

// Employee Record
export interface Employee {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  joiningDate: string;
  status: 'ACTIVE' | 'INACTIVE';
  permissions: Record<PermissionKey, boolean>;
  totalSalesBilled: number;
  totalTransactionsHandled: number;
  avatarUrl?: string;
}

// Product & Inventory
export type ProductUnit = 'PCS' | 'KG' | 'GM' | 'LTR' | 'ML' | 'BOX' | 'PACKET';

export interface InventoryProduct {
  id: string;
  tenantId: string;
  name: string;
  sku: string;
  barcode: string;
  categoryId: string;
  categoryName: string;
  costPrice: number;
  sellingPrice: number;
  mrp: number;
  gstRate: number;
  taxRate?: number;
  hsnCode?: string;
  unit: ProductUnit;
  isVariableWeight?: boolean;
  stockQuantity: number;
  minStockLevel: number;
  expiryDate?: string;
  batchNo?: string;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  createdAt: string;
  updatedAt: string;
}

export interface StockAdjustment {
  id: string;
  tenantId: string;
  productId: string;
  productName: string;
  sku?: string;
  type: 'IN' | 'OUT' | 'CORRECTION' | 'DAMAGED' | 'EXPIRED';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  adjustedBy: string;
  adjustedAt: string;
}

// Sales Transactions
export type PaymentMethod = 'CASH' | 'UPI' | 'CARD' | 'CREDIT' | 'SPLIT';
export type TransactionStatus = 'COMPLETED' | 'RETURNED' | 'CANCELLED';

export interface SaleTransactionItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: ProductUnit;
  unitPrice: number;
  costPrice: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
}

export interface SaleTransaction {
  id: string;
  tenantId: string;
  invoiceNumber: string;
  dateTime: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  cashierId: string;
  cashierName: string;
  items: SaleTransactionItem[];
  itemCount: number;
  totalQuantity: number;
  grossTotal: number;
  discountTotal: number;
  taxTotal: number;
  cogsTotal: number; // Cost of goods sold for this transaction
  grossProfit: number; // netTotal - cogsTotal
  netTotal: number;
  paymentMethod: PaymentMethod;
  paymentDetails: Array<{ method: string; amount: number; reference?: string }>;
  status: TransactionStatus;
  notes?: string;
}

// Expenses
export interface ExpenseRecord {
  id: string;
  tenantId: string;
  category: string;
  amount: number;
  expenseDate: string;
  description: string;
  paymentMethod: string;
  recordedBy: string;
  createdAt: string;
}

// Business Settings
export interface BusinessProfile {
  shopName: string;
  ownerName: string;
  businessAddress: string;
  city: string;
  pincode: string;
  phone: string;
  email: string;
  gstin: string;
  businessType: string;
}

export interface InvoiceSettings {
  prefix: string;
  nextNumber: number;
  footerText: string;
  showGstBreakdown: boolean;
  showHsnSummary: boolean;
  paperFormat: 'THERMAL_80MM' | 'THERMAL_58MM' | 'A4_SHEET';
}

export interface TaxSettings {
  enabled: boolean;
  defaultGstRate: number;
  inclusivePricing: boolean;
}

export interface PaymentSettings {
  allowCash: boolean;
  allowUpi: boolean;
  allowCard: boolean;
  allowCredit: boolean;
}

export interface BusinessSettings {
  tenantId: string;
  profile: BusinessProfile;
  invoice: InvoiceSettings;
  tax: TaxSettings;
  payment: PaymentSettings;
}

// Subscription
export interface SubscriptionPlanFeature {
  name: string;
  included: boolean;
}

export interface ShopSubscription {
  tenantId: string;
  planName: string;
  planCode: 'STARTER' | 'PRO_RETAIL' | 'ENTERPRISE';
  status: 'ACTIVE' | 'TRIAL' | 'EXPIRING_SOON' | 'EXPIRED';
  pricePerMonth: number;
  billingCycle: 'MONTHLY' | 'ANNUAL';
  startDate: string;
  expiryDate: string;
  nextRenewalDate: string;
  daysRemaining: number;
  features: string[];
  invoicesHistory: Array<{
    id: string;
    invoiceNo: string;
    date: string;
    amount: number;
    paymentMethod: string;
    status: 'PAID';
  }>;
}

// Notifications
export interface AppNotification {
  id: string;
  tenantId: string;
  title: string;
  message: string;
  type: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRY' | 'SUBSCRIPTION' | 'EMPLOYEE' | 'SYSTEM';
  severity?: 'CRITICAL' | 'WARNING' | 'INFO';
  isRead: boolean;
  createdAt: string;
  linkTo?: string;
}

// Activity Log
export interface ActivityLog {
  id: string;
  tenantId: string;
  timestamp: string;
  employeeName: string;
  employeeRole: UserRole;
  action: string;
  details: string;
  ipAddress?: string;
}

// Dynamic Filter Types
export type DateFilterType = 'today' | 'yesterday' | 'last7days' | 'last30days' | 'thisMonth' | 'all';
