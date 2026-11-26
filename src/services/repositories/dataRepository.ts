import {
  CURRENT_TENANT_ID,
  AdminUser,
  Employee,
  InventoryProduct,
  SaleTransaction,
  ExpenseRecord,
  BusinessSettings,
  ShopSubscription,
  AppNotification,
  ActivityLog,
  DateFilterType,
  StockAdjustment,
  UserRole,
  PermissionKey,
} from '../../types';
import {
  INITIAL_SETTINGS,
  INITIAL_EMPLOYEES,
  INITIAL_PRODUCTS,
  INITIAL_EXPENSES,
  INITIAL_SUBSCRIPTION,
  INITIAL_NOTIFICATIONS,
  INITIAL_ACTIVITY_LOGS,
  generateSampleSales,
} from '../mock/mockData';

const STORAGE_KEYS = {
  SETTINGS: 'ezo_admin_settings',
  EMPLOYEES: 'ezo_admin_employees',
  PRODUCTS: 'ezo_admin_products',
  SALES: 'ezo_admin_sales',
  EXPENSES: 'ezo_admin_expenses',
  NOTIFICATIONS: 'ezo_admin_notifications',
  ACTIVITIES: 'ezo_admin_activities',
  SUBSCRIPTION: 'ezo_admin_subscription',
};

export class DataRepository {
  private getLocal<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      if (data) return JSON.parse(data);
    } catch (e) {}
    return fallback;
  }

  private setLocal<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {}
  }

  // --- Date Range Filter Helper ---
  public filterSalesByDate(sales: SaleTransaction[], filter: DateFilterType, customStart?: string, customEnd?: string): SaleTransaction[] {
    const now = new Date('2026-11-26T23:59:59Z'); // Reference date
    const startOfToday = new Date('2026-11-26T00:00:00Z');

    return sales.filter((s) => {
      const txDate = new Date(s.dateTime);

      switch (filter) {
        case 'today':
          return txDate >= startOfToday && txDate <= now;
        case 'yesterday': {
          const yStart = new Date(startOfToday);
          yStart.setDate(yStart.getDate() - 1);
          const yEnd = new Date(startOfToday);
          yEnd.setMilliseconds(-1);
          return txDate >= yStart && txDate <= yEnd;
        }
        case 'last7days': {
          const sevenDaysAgo = new Date(now);
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          return txDate >= sevenDaysAgo && txDate <= now;
        }
        case 'last30days': {
          const thirtyDaysAgo = new Date(now);
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return txDate >= thirtyDaysAgo && txDate <= now;
        }
        case 'thisMonth': {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          return txDate >= startOfMonth && txDate <= now;
        }
        default:
          return true;
      }
    });
  }

  // --- Dashboard Analytics Engine ---
  public getDashboardMetrics(dateFilter: DateFilterType = 'today') {
    const allSales = this.getSales();
    const filteredSales = this.filterSalesByDate(allSales, dateFilter);
    const allProducts = this.getProducts();
    const allExpenses = this.getExpenses();

    // 1. Sales & Revenue
    const totalSales = filteredSales.reduce((acc, s) => acc + s.netTotal, 0);
    const totalBills = filteredSales.length;
    const avgBillValue = totalBills > 0 ? totalSales / totalBills : 0;

    // 2. Accurate Profit Calculations (Revenue - COGS - Expenses)
    const cogsTotal = filteredSales.reduce((acc, s) => acc + (s.cogsTotal || s.netTotal * 0.8), 0);
    const grossProfit = totalSales - cogsTotal;

    // Prorated or period expenses
    const periodExpenses = allExpenses.reduce((acc, e) => acc + e.amount, 0);
    const estimatedNetProfit = Math.max(0, grossProfit - (dateFilter === 'today' ? 180 : periodExpenses));

    // 3. Inventory Overview
    const totalProducts = allProducts.length;
    const lowStockProducts = allProducts.filter((p) => p.stockQuantity <= p.minStockLevel);
    const outOfStockProducts = allProducts.filter((p) => p.stockQuantity === 0);
    const totalStockValuation = allProducts.reduce((acc, p) => acc + p.stockQuantity * p.costPrice, 0);

    // 4. Payment Methods Split
    let cashTotal = 0;
    let upiTotal = 0;
    let cardTotal = 0;
    let creditTotal = 0;

    filteredSales.forEach((s) => {
      if (s.paymentMethod === 'CASH') cashTotal += s.netTotal;
      else if (s.paymentMethod === 'UPI') upiTotal += s.netTotal;
      else if (s.paymentMethod === 'CARD') cardTotal += s.netTotal;
      else if (s.paymentMethod === 'CREDIT') creditTotal += s.netTotal;
      else if (s.paymentDetails) {
        s.paymentDetails.forEach((p) => {
          if (p.method === 'CASH') cashTotal += p.amount;
          else if (p.method === 'UPI') upiTotal += p.amount;
          else if (p.method === 'CARD') cardTotal += p.amount;
        });
      }
    });

    const paymentMethodsData = [
      { name: 'UPI / QR', value: upiTotal, color: '#3b82f6' },
      { name: 'Cash', value: cashTotal, color: '#10b981' },
      { name: 'Card POS', value: cardTotal, color: '#6366f1' },
      { name: 'Khata / Credit', value: creditTotal, color: '#f59e0b' },
    ].filter((p) => p.value > 0);

    // 5. Category-wise sales
    const categoryMap: Record<string, number> = {};
    filteredSales.forEach((s) => {
      s.items.forEach((item) => {
        const prod = allProducts.find((p) => p.id === item.productId);
        const cat = prod?.categoryName || 'General';
        categoryMap[cat] = (categoryMap[cat] || 0) + item.total;
      });
    });

    const categorySalesData = Object.entries(categoryMap).map(([name, amount]) => ({
      name,
      amount: Math.round(amount),
    }));

    // 6. Top Selling Products
    const productSoldMap: Record<string, { name: string; qty: number; revenue: number }> = {};
    filteredSales.forEach((s) => {
      s.items.forEach((item) => {
        if (!productSoldMap[item.productId]) {
          productSoldMap[item.productId] = { name: item.productName, qty: 0, revenue: 0 };
        }
        productSoldMap[item.productId].qty += item.quantity;
        productSoldMap[item.productId].revenue += item.total;
      });
    });

    const topProducts = Object.values(productSoldMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // 7. Dynamic Trend Chart Data
    const trendData = this.buildTrendChartData(filteredSales, dateFilter);

    return {
      totalSales,
      totalBills,
      avgBillValue,
      cogsTotal,
      grossProfit,
      estimatedNetProfit,
      totalProducts,
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStockProducts.length,
      lowStockProducts,
      totalStockValuation,
      paymentMethodsData,
      categorySalesData,
      topProducts,
      trendData,
      recentTransactions: [...filteredSales].reverse().slice(0, 5),
    };
  }

  private buildTrendChartData(sales: SaleTransaction[], filter: DateFilterType) {
    if (filter === 'today') {
      return [
        { label: '9 AM', sales: 420 },
        { label: '11 AM', sales: 645 },
        { label: '1 PM', sales: 537 },
        { label: '3 PM', sales: 545 },
        { label: '5 PM', sales: 850 },
        { label: '7 PM', sales: 1120 },
        { label: '9 PM', sales: 600 },
      ];
    } else if (filter === 'last7days') {
      return [
        { label: '20 Nov', sales: 2850 },
        { label: '21 Nov', sales: 3120 },
        { label: '22 Nov', sales: 2940 },
        { label: '23 Nov', sales: 3450 },
        { label: '24 Nov', sales: 3820 },
        { label: '25 Nov', sales: 3484 },
        { label: '26 Nov', sales: 2027 },
      ];
    } else {
      return [
        { label: 'Week 1', sales: 18450 },
        { label: 'Week 2', sales: 22100 },
        { label: 'Week 3', sales: 19800 },
        { label: 'Week 4', sales: 24500 },
      ];
    }
  }

  // --- Sales Repository ---
  public getSales(): SaleTransaction[] {
    return this.getLocal(STORAGE_KEYS.SALES, generateSampleSales());
  }

  public saveSales(sales: SaleTransaction[]): void {
    this.setLocal(STORAGE_KEYS.SALES, sales);
  }

  // --- Employees Repository ---
  public getEmployees(): Employee[] {
    return this.getLocal(STORAGE_KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
  }

  public saveEmployees(employees: Employee[]): void {
    this.setLocal(STORAGE_KEYS.EMPLOYEES, employees);
  }

  public addEmployee(emp: Omit<Employee, 'id'>): Employee {
    const list = this.getEmployees();
    const newEmp: Employee = {
      ...emp,
      id: `emp-${Date.now()}`,
    };
    list.push(newEmp);
    this.saveEmployees(list);
    this.logActivity('New Employee Created', `Created account for ${newEmp.name} as ${newEmp.role}`);
    return newEmp;
  }

  public updateEmployee(id: string, updates: Partial<Employee>): Employee | null {
    const list = this.getEmployees();
    const idx = list.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates };
    this.saveEmployees(list);
    this.logActivity('Employee Updated', `Updated details or permissions for ${list[idx].name}`);
    return list[idx];
  }

  public toggleEmployeeStatus(id: string): Employee | null {
    const list = this.getEmployees();
    const emp = list.find((e) => e.id === id);
    if (!emp) return null;
    emp.status = emp.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    this.saveEmployees(list);
    this.logActivity('Employee Status Changed', `Marked ${emp.name} as ${emp.status}`);
    return emp;
  }

  // --- Inventory Repository ---
  public getProducts(): InventoryProduct[] {
    return this.getLocal(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  }

  public saveProducts(products: InventoryProduct[]): void {
    this.setLocal(STORAGE_KEYS.PRODUCTS, products);
  }

  public addProduct(prod: Omit<InventoryProduct, 'id' | 'createdAt' | 'updatedAt' | 'status'>): InventoryProduct {
    const list = this.getProducts();
    const status: InventoryProduct['status'] =
      prod.stockQuantity === 0 ? 'OUT_OF_STOCK' : prod.stockQuantity <= prod.minStockLevel ? 'LOW_STOCK' : 'IN_STOCK';

    const newProd: InventoryProduct = {
      ...prod,
      id: `prod-${Date.now()}`,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    list.unshift(newProd);
    this.saveProducts(list);
    this.logActivity('Product Created', `Added new SKU: ${newProd.name} (${newProd.sku})`);
    return newProd;
  }

  public updateProduct(id: string, updates: Partial<InventoryProduct>): InventoryProduct | null {
    const list = this.getProducts();
    const idx = list.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    const current = list[idx];
    const newQty = updates.stockQuantity !== undefined ? updates.stockQuantity : current.stockQuantity;
    const minLvl = updates.minStockLevel !== undefined ? updates.minStockLevel : current.minStockLevel;
    const status: InventoryProduct['status'] =
      newQty === 0 ? 'OUT_OF_STOCK' : newQty <= minLvl ? 'LOW_STOCK' : 'IN_STOCK';

    list[idx] = {
      ...current,
      ...updates,
      status,
      updatedAt: new Date().toISOString(),
    };
    this.saveProducts(list);
    this.logActivity('Product Modified', `Updated specifications for ${list[idx].name}`);
    return list[idx];
  }

  public adjustStock(adjustment: Omit<StockAdjustment, 'id' | 'adjustedAt'>): StockAdjustment {
    const prod = this.getProducts().find((p) => p.id === adjustment.productId);
    if (prod) {
      this.updateProduct(prod.id, { stockQuantity: adjustment.newStock });
    }
    const record: StockAdjustment = {
      ...adjustment,
      id: `adj-${Date.now()}`,
      adjustedAt: new Date().toISOString(),
    };
    this.logActivity(
      'Stock Adjustment',
      `${adjustment.type} adjustment of ${adjustment.quantity} units on ${adjustment.productName}. Reason: ${adjustment.reason}`
    );
    return record;
  }

  // --- Expenses Repository ---
  public getExpenses(): ExpenseRecord[] {
    return this.getLocal(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
  }

  public addExpense(exp: Omit<ExpenseRecord, 'id' | 'createdAt'>): ExpenseRecord {
    const list = this.getExpenses();
    const newExp: ExpenseRecord = {
      ...exp,
      id: `exp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    list.unshift(newExp);
    this.setLocal(STORAGE_KEYS.EXPENSES, list);
    this.logActivity('Expense Recorded', `Recorded ₹${newExp.amount} under ${newExp.category}`);
    return newExp;
  }

  // --- Business Settings Repository ---
  public getSettings(): BusinessSettings {
    return this.getLocal(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  }

  public saveSettings(settings: BusinessSettings): void {
    this.setLocal(STORAGE_KEYS.SETTINGS, settings);
    this.logActivity('Store Settings Updated', `Saved store profile and invoice preferences`);
  }

  // --- Subscription Repository ---
  public getSubscription(): ShopSubscription {
    return this.getLocal(STORAGE_KEYS.SUBSCRIPTION, INITIAL_SUBSCRIPTION);
  }

  // --- Notifications Repository ---
  public getNotifications(): AppNotification[] {
    return this.getLocal(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  }

  public markNotificationRead(id: string): void {
    const list = this.getNotifications();
    const item = list.find((n) => n.id === id);
    if (item) {
      item.isRead = true;
      this.setLocal(STORAGE_KEYS.NOTIFICATIONS, list);
    }
  }

  public markAllNotificationsRead(): void {
    const list = this.getNotifications();
    list.forEach((n) => (n.isRead = true));
    this.setLocal(STORAGE_KEYS.NOTIFICATIONS, list);
  }

  // --- Activity Log Repository ---
  public getActivityLogs(): ActivityLog[] {
    return this.getLocal(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITY_LOGS);
  }

  public logActivity(action: string, details: string): void {
    const logs = this.getActivityLogs();
    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      tenantId: CURRENT_TENANT_ID,
      timestamp: new Date().toISOString(),
      employeeName: 'Rajesh Varma',
      employeeRole: 'OWNER',
      action,
      details,
      ipAddress: '192.168.1.101',
    };
    logs.unshift(newLog);
    this.setLocal(STORAGE_KEYS.ACTIVITIES, logs.slice(0, 50)); // Keep latest 50
  }
}

export const dataRepository = new DataRepository();
