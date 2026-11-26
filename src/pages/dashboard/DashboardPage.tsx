import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Receipt,
  DollarSign,
  Boxes,
  AlertTriangle,
  ArrowUpRight,
  Calendar,
  CreditCard,
  Banknote,
  QrCode,
  UserCheck,
  Package,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { dataRepository } from '../../services/repositories/dataRepository';
import { DateFilterType } from '../../types';
import { useAdminAuth } from '../../context/AuthContext';
import { useAdminData } from '../../context/AdminDataContext';

export const DashboardPage: React.FC = () => {
  const { user } = useAdminAuth();
  const { settings, notifications } = useAdminData();
  const [dateFilter, setDateFilter] = useState<DateFilterType>('today');

  // Metrics update dynamically whenever dateFilter changes
  const metrics = useMemo(() => {
    return dataRepository.getDashboardMetrics(dateFilter);
  }, [dateFilter]);

  const filterTabs: Array<{ id: DateFilterType; label: string }> = [
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'last7days', label: 'Last 7 Days' },
    { id: 'last30days', label: 'Last 30 Days' },
    { id: 'thisMonth', label: 'This Month' },
    { id: 'all', label: 'All Time' },
  ];

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* 1. Welcome & Date Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-admin-600 dark:text-admin-400 uppercase tracking-wider">
              {settings.profile.shopName}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200">
              Operations Active
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Store Performance & Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time sales, inventory valuation, and net profitability dashboard.
          </p>
        </div>

        {/* Date Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-x-auto admin-scroll-hidden shrink-0">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setDateFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                dateFilter === tab.id
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-extrabold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Primary 8 KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Total Sales */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gross Sales Revenue</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">
            ₹{metrics.totalSales.toFixed(2)}
          </p>
          <p className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Billed across {metrics.totalBills} receipts
          </p>
        </div>

        {/* Gross Profit */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gross Margin (Profit)</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">
            ₹{metrics.grossProfit.toFixed(2)}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            Margin: {metrics.totalSales > 0 ? ((metrics.grossProfit / metrics.totalSales) * 100).toFixed(1) : 0}% of revenue
          </p>
        </div>

        {/* Estimated Net Profit */}
        <div className="p-4 rounded-3xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-800/40 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Net Profit</p>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-800 dark:text-emerald-300 mt-1 font-mono">
            ₹{metrics.estimatedNetProfit.toFixed(2)}
          </p>
          <p className="text-[10px] text-emerald-600 mt-1 font-medium">After COGS & store expenses</p>
        </div>

        {/* Average Bill Value */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Average Ticket Size</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">
            ₹{metrics.avgBillValue.toFixed(2)}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Basket value per shopper</p>
        </div>

        {/* Total Products */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Inventory SKUs</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">
            {metrics.totalProducts}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Products across 6 categories</p>
        </div>

        {/* Stock Valuation */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Stock Value</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">
            ₹{metrics.totalStockValuation.toFixed(2)}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Valued at wholesale cost</p>
        </div>

        {/* Low Stock Alerts */}
        <div className="p-4 rounded-3xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/40 shadow-sm">
          <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Low Stock Warnings</p>
          <p className="text-2xl font-black text-amber-800 dark:text-amber-300 mt-1 font-mono">
            {metrics.lowStockCount}
          </p>
          <p className="text-[10px] text-amber-600 mt-1 font-medium">Below reorder threshold</p>
        </div>

        {/* Out of Stock */}
        <div className="p-4 rounded-3xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-800/40 shadow-sm">
          <p className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">Out of Stock</p>
          <p className="text-2xl font-black text-rose-800 dark:text-rose-300 mt-1 font-mono">
            {metrics.outOfStockCount}
          </p>
          <p className="text-[10px] text-rose-600 mt-1 font-medium">Requires supplier order</p>
        </div>
      </div>

      {/* 3. Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Sales Trend (2 Cols) */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-admin-600" />
                Sales Volume Trend ({dateFilter.toUpperCase()})
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600">
                INR (₹)
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="adminSalesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#006ac9" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#006ac9" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <Tooltip
                    formatter={(val: any) => [`₹${val}`, 'Sales Revenue']}
                    contentStyle={{ borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#006ac9"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#adminSalesGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Payment Method Distribution (1 Col) */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-admin-600" />
                Payment Channels
              </h3>
            </div>

            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.paymentMethodsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {metrics.paymentMethodsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`₹${val}`, 'Amount']}
                    contentStyle={{ borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              {metrics.paymentMethodsData.map((pm) => (
                <div key={pm.name} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: pm.color }} />
                  <span className="truncate text-slate-600 dark:text-slate-400">{pm.name}:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">₹{pm.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Category Sales & Top Performing Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Category Breakdown Bar Chart */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Department Sales Breakdown</h3>
            <span className="text-xs text-slate-400">By Product Category</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.categorySalesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <Tooltip
                  formatter={(val: any) => [`₹${val}`, 'Sales']}
                  contentStyle={{ borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Bar dataKey="amount" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performing Products */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Top 5 Revenue Generators</h3>
            <Link to="/inventory" className="text-xs font-semibold text-admin-600 hover:underline">
              Inventory Catalog →
            </Link>
          </div>

          <div className="space-y-3">
            {metrics.topProducts.map((p, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-850 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 h-6 rounded-xl bg-admin-100 text-admin-800 font-black text-[11px] flex items-center justify-center shrink-0">
                    #{idx + 1}
                  </span>
                  <p className="font-bold text-slate-900 dark:text-white truncate">{p.name}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono font-black text-slate-900 dark:text-white">₹{p.revenue.toFixed(2)}</span>
                  <p className="text-[10px] text-slate-400">{p.qty} sold</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Recent Sales Transactions Table */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-4 h-4 text-admin-600" />
            Recent Monitored Invoices
          </h3>
          <Link to="/sales" className="text-xs font-semibold text-admin-600 hover:underline">
            View All Sales Archive →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="py-2.5 px-3">Invoice No</th>
                <th className="py-2.5 px-3">Date & Time</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Cashier</th>
                <th className="py-2.5 px-3">Channel</th>
                <th className="py-2.5 px-3">Net Total</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
              {metrics.recentTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                    {tx.invoiceNumber}
                  </td>
                  <td className="py-3 px-3 text-slate-400">
                    {new Date(tx.dateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                    {tx.customerName}
                  </td>
                  <td className="py-3 px-3 text-slate-500">
                    {tx.cashierName}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">
                      {tx.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-black text-slate-900 dark:text-white">
                    ₹{tx.netTotal.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      tx.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
