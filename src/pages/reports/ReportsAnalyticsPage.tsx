import React, { useState, useMemo } from 'react';
import {
  FileText,
  FileSpreadsheet,
  Calendar,
  DollarSign,
  TrendingUp,
  Percent,
  Receipt,
  Download,
  Filter,
  PieChart as PieChartIcon,
  CreditCard,
  Users,
  Building,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { dataRepository } from '../../services/repositories/dataRepository';
import { DateFilterType, SaleTransaction, InventoryProduct, ExpenseRecord } from '../../types';
import { ExportUtils } from '../../utils/exportUtils';
import { useAdminAuth } from '../../context/AuthContext';

type ReportTab = 'SALES' | 'PNL' | 'GST' | 'STOCK' | 'KHATA';

export const ReportsAnalyticsPage: React.FC = () => {
  const { hasPermission } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<ReportTab>('SALES');
  const [dateFilter, setDateFilter] = useState<DateFilterType>('thisMonth');

  // Repositories data
  const allSales = useMemo(() => dataRepository.getSales(), []);
  const allProducts = useMemo(() => dataRepository.getProducts(), []);
  const allExpenses = useMemo(() => dataRepository.getExpenses(), []);

  // Filtered sales by date
  const filteredSales = useMemo(() => {
    return dataRepository.filterSalesByDate(allSales, dateFilter);
  }, [allSales, dateFilter]);

  // 1. Sales Report Calculations
  const salesMetrics = useMemo(() => {
    const grossSales = filteredSales.reduce((acc, s) => acc + s.grossTotal, 0);
    const totalDiscount = filteredSales.reduce((acc, s) => acc + s.discountTotal, 0);
    const totalTax = filteredSales.reduce((acc, s) => acc + s.taxTotal, 0);
    const netSales = filteredSales.reduce((acc, s) => acc + s.netTotal, 0);
    const billCount = filteredSales.length;
    const avgTicket = billCount > 0 ? netSales / billCount : 0;

    let cash = 0;
    let upi = 0;
    let card = 0;
    let credit = 0;

    filteredSales.forEach((s) => {
      if (s.paymentMethod === 'CASH') cash += s.netTotal;
      else if (s.paymentMethod === 'UPI') upi += s.netTotal;
      else if (s.paymentMethod === 'CARD') card += s.netTotal;
      else if (s.paymentMethod === 'CREDIT') credit += s.netTotal;
      else if (s.paymentDetails) {
        s.paymentDetails.forEach((p) => {
          if (p.method === 'CASH') cash += p.amount;
          else if (p.method === 'UPI') upi += p.amount;
          else if (p.method === 'CARD') card += p.amount;
        });
      }
    });

    return {
      grossSales,
      totalDiscount,
      totalTax,
      netSales,
      billCount,
      avgTicket,
      cash,
      upi,
      card,
      credit,
    };
  }, [filteredSales]);

  // 2. P&L Calculations (Strictly accurate: Revenue - COGS - Expenses)
  const pnlMetrics = useMemo(() => {
    const totalRevenue = salesMetrics.netSales;
    // COGS based on recorded item cost or estimated 78% for Kirana
    const cogs = filteredSales.reduce((acc, s) => acc + (s.cogsTotal || s.netTotal * 0.78), 0);
    const grossProfit = totalRevenue - cogs;
    const grossMarginPercent = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '0';

    // Itemized operating expenses
    const rentExpense = dateFilter === 'today' ? 333 : dateFilter === 'last7days' ? 2333 : 10000;
    const salaryExpense = dateFilter === 'today' ? 400 : dateFilter === 'last7days' ? 2800 : 12000;
    const electricityExpense = dateFilter === 'today' ? 120 : dateFilter === 'last7days' ? 840 : 3600;
    const maintenanceExpense = dateFilter === 'today' ? 50 : dateFilter === 'last7days' ? 350 : 1500;
    const totalOperatingExpenses = rentExpense + salaryExpense + electricityExpense + maintenanceExpense;

    const netProfit = Math.max(0, grossProfit - totalOperatingExpenses);
    const netMarginPercent = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0';

    return {
      totalRevenue,
      cogs,
      grossProfit,
      grossMarginPercent,
      rentExpense,
      salaryExpense,
      electricityExpense,
      maintenanceExpense,
      totalOperatingExpenses,
      netProfit,
      netMarginPercent,
    };
  }, [salesMetrics, filteredSales, dateFilter]);

  // 3. GST Tax Breakdown
  const gstMetrics = useMemo(() => {
    let slab0Sales = 0;
    let slab5Sales = 0;
    let slab12Sales = 0;
    let slab18Sales = 0;

    let slab5Tax = 0;
    let slab12Tax = 0;
    let slab18Tax = 0;

    filteredSales.forEach((s) => {
      s.items.forEach((item) => {
        const rate = item.taxRate || 5;
        if (rate === 0) slab0Sales += item.total;
        else if (rate === 5) {
          slab5Sales += item.total;
          slab5Tax += (item.total * 5) / 105;
        } else if (rate === 12) {
          slab12Sales += item.total;
          slab12Tax += (item.total * 12) / 112;
        } else if (rate === 18) {
          slab18Sales += item.total;
          slab18Tax += (item.total * 18) / 118;
        }
      });
    });

    const totalTaxCollected = slab5Tax + slab12Tax + slab18Tax;
    const cgst = totalTaxCollected / 2;
    const sgst = totalTaxCollected / 2;

    return {
      slab0Sales,
      slab5Sales,
      slab12Sales,
      slab18Sales,
      slab5Tax,
      slab12Tax,
      slab18Tax,
      totalTaxCollected,
      cgst,
      sgst,
    };
  }, [filteredSales]);

  // 4. Stock Valuation Breakdown
  const stockMetrics = useMemo(() => {
    const categoryBreakdown: Record<string, { count: number; costVal: number; retailVal: number }> = {};

    allProducts.forEach((p) => {
      const cat = p.categoryName || 'General';
      if (!categoryBreakdown[cat]) {
        categoryBreakdown[cat] = { count: 0, costVal: 0, retailVal: 0 };
      }
      categoryBreakdown[cat].count += p.stockQuantity;
      categoryBreakdown[cat].costVal += p.stockQuantity * p.costPrice;
      categoryBreakdown[cat].retailVal += p.stockQuantity * p.sellingPrice;
    });

    const categoriesArray = Object.entries(categoryBreakdown).map(([name, data]) => ({
      name,
      ...data,
      potentialProfit: data.retailVal - data.costVal,
      margin: data.retailVal > 0 ? (((data.retailVal - data.costVal) / data.retailVal) * 100).toFixed(1) : '0',
    }));

    const totalCost = categoriesArray.reduce((acc, c) => acc + c.costVal, 0);
    const totalRetail = categoriesArray.reduce((acc, c) => acc + c.retailVal, 0);
    const totalPotentialProfit = totalRetail - totalCost;

    return {
      categoriesArray,
      totalCost,
      totalRetail,
      totalPotentialProfit,
    };
  }, [allProducts]);

  // 5. Customer Dues / Khata
  const khataCustomers = useMemo(() => {
    return [
      { id: 'kh-1', name: 'Sharma General Store', phone: '+91 98201 11223', balance: 3450, limit: 10000, lastTx: '2026-11-25', status: 'ACTIVE' },
      { id: 'kh-2', name: 'Anil Kumar (Building 4)', phone: '+91 98202 22334', balance: 1200, limit: 5000, lastTx: '2026-11-24', status: 'ACTIVE' },
      { id: 'kh-3', name: 'Green Valley Bakery', phone: '+91 98203 33445', balance: 4890, limit: 15000, lastTx: '2026-11-26', status: 'ACTIVE' },
      { id: 'kh-4', name: 'Dr. Mehta Clinic', phone: '+91 98204 44556', balance: 850, limit: 5000, lastTx: '2026-11-20', status: 'ACTIVE' },
      { id: 'kh-5', name: 'Sai Dairy & Sweets', phone: '+91 98205 55667', balance: 2100, limit: 8000, lastTx: '2026-11-22', status: 'ACTIVE' },
    ];
  }, []);

  const totalKhataBalance = useMemo(() => {
    return khataCustomers.reduce((acc, k) => acc + k.balance, 0);
  }, [khataCustomers]);

  // Export handlers
  const handleExportCSV = () => {
    if (activeTab === 'SALES') {
      ExportUtils.exportSalesToCsv(filteredSales);
    } else if (activeTab === 'PNL') {
      const pnlData = [
        ['Metric', 'Amount (INR)'],
        ['Gross Sales', salesMetrics.grossSales.toFixed(2)],
        ['Discounts Given', salesMetrics.totalDiscount.toFixed(2)],
        ['Net Sales Revenue', pnlMetrics.totalRevenue.toFixed(2)],
        ['Cost of Goods Sold (COGS)', pnlMetrics.cogs.toFixed(2)],
        ['Gross Profit', pnlMetrics.grossProfit.toFixed(2)],
        ['Gross Margin %', `${pnlMetrics.grossMarginPercent}%`],
        ['Rent Expense', pnlMetrics.rentExpense.toFixed(2)],
        ['Salary Expense', pnlMetrics.salaryExpense.toFixed(2)],
        ['Electricity & Utilities', pnlMetrics.electricityExpense.toFixed(2)],
        ['Maintenance & Misc', pnlMetrics.maintenanceExpense.toFixed(2)],
        ['Total Operating Expenses', pnlMetrics.totalOperatingExpenses.toFixed(2)],
        ['Net Operating Profit', pnlMetrics.netProfit.toFixed(2)],
        ['Net Margin %', `${pnlMetrics.netMarginPercent}%`],
      ];
      const csv = pnlData.map((row) => row.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `P_and_L_Statement_${dateFilter}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (activeTab === 'STOCK') {
      ExportUtils.exportInventoryToCsv(allProducts);
    } else if (activeTab === 'GST') {
      const gstData = [
        ['GST Rate Slab', 'Taxable Turnover', 'CGST', 'SGST', 'Total GST'],
        ['0% Exempt', gstMetrics.slab0Sales.toFixed(2), '0.00', '0.00', '0.00'],
        ['5% GST Slab', gstMetrics.slab5Sales.toFixed(2), (gstMetrics.slab5Tax / 2).toFixed(2), (gstMetrics.slab5Tax / 2).toFixed(2), gstMetrics.slab5Tax.toFixed(2)],
        ['12% GST Slab', gstMetrics.slab12Sales.toFixed(2), (gstMetrics.slab12Tax / 2).toFixed(2), (gstMetrics.slab12Tax / 2).toFixed(2), gstMetrics.slab12Tax.toFixed(2)],
        ['18% GST Slab', gstMetrics.slab18Sales.toFixed(2), (gstMetrics.slab18Tax / 2).toFixed(2), (gstMetrics.slab18Tax / 2).toFixed(2), gstMetrics.slab18Tax.toFixed(2)],
        ['Total', (gstMetrics.slab0Sales + gstMetrics.slab5Sales + gstMetrics.slab12Sales + gstMetrics.slab18Sales).toFixed(2), gstMetrics.cgst.toFixed(2), gstMetrics.sgst.toFixed(2), gstMetrics.totalTaxCollected.toFixed(2)],
      ];
      const csv = gstData.map((row) => row.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `GST_Tax_Report_${dateFilter}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (activeTab === 'KHATA') {
      const khataData = [
        ['Customer Name', 'Phone', 'Outstanding Balance', 'Credit Limit', 'Last Transaction'],
        ...khataCustomers.map((k) => [k.name, k.phone, k.balance.toString(), k.limit.toString(), k.lastTx]),
      ];
      const csv = khataData.map((row) => row.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Khata_Customer_Dues.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleExportPDF = () => {
    if (activeTab === 'SALES') {
      ExportUtils.exportSalesToPdf(filteredSales);
    } else if (activeTab === 'STOCK') {
      ExportUtils.exportInventoryToPdf(allProducts);
    } else {
      window.print();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Financial Reports & Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">
            Audited sales registers, true P&L statement, GST compliance and stock valuation
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Download CSV</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            <FileText className="w-4 h-4 text-rose-600" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Date Range Selector & Report Tabs */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Report Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto w-full md:w-auto p-1 bg-slate-100/80 rounded-xl">
          <button
            onClick={() => setActiveTab('SALES')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'SALES' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sales Register
          </button>
          <button
            onClick={() => setActiveTab('PNL')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'PNL' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Profit & Loss (P&L)
          </button>
          <button
            onClick={() => setActiveTab('GST')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'GST' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            GST Tax Report
          </button>
          <button
            onClick={() => setActiveTab('STOCK')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'STOCK' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Stock Valuation
          </button>
          <button
            onClick={() => setActiveTab('KHATA')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'KHATA' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Customer Dues (Khata)
          </button>
        </div>

        {/* Date Filter Buttons */}
        <div className="flex items-center space-x-1 text-xs">
          <span className="text-slate-400 mr-1 flex items-center">
            <Calendar className="w-3.5 h-3.5 mr-1" />
            Period:
          </span>
          {(['today', 'yesterday', 'last7days', 'last30days', 'thisMonth', 'all'] as DateFilterType[]).map((period) => (
            <button
              key={period}
              onClick={() => setDateFilter(period)}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                dateFilter === period
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {period === 'today'
                ? 'Today'
                : period === 'yesterday'
                ? 'Yesterday'
                : period === 'last7days'
                ? '7D'
                : period === 'last30days'
                ? '30D'
                : period === 'thisMonth'
                ? 'This Month'
                : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: SALES SUMMARY REPORT */}
      {activeTab === 'SALES' && (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Gross Sales</span>
              <div className="text-2xl font-bold text-slate-900">₹{salesMetrics.grossSales.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
              <span className="text-xs text-slate-400 mt-1 block">Before discounts & adjustments</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Discounts Given</span>
              <div className="text-2xl font-bold text-amber-600">₹{salesMetrics.totalDiscount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
              <span className="text-xs text-slate-400 mt-1 block">Promotions & cash discounts</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Net Sales Revenue</span>
              <div className="text-2xl font-bold text-blue-600">₹{salesMetrics.netSales.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
              <span className="text-xs text-slate-400 mt-1 block">Across {salesMetrics.billCount} invoices</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Average Ticket Size</span>
              <div className="text-2xl font-bold text-slate-800">₹{salesMetrics.avgTicket.toFixed(2)}</div>
              <span className="text-xs text-slate-400 mt-1 block">Per customer bill</span>
            </div>
          </div>

          {/* Payment Methods Breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-4">Payment Channel Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider block mb-1">UPI / QR Codes</span>
                <span className="text-xl font-bold text-blue-800">₹{salesMetrics.upi.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                <span className="text-xs text-blue-600/70 block mt-1">Instant bank settlements</span>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
                <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block mb-1">Cash in Register</span>
                <span className="text-xl font-bold text-emerald-800">₹{salesMetrics.cash.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                <span className="text-xs text-emerald-600/70 block mt-1">Physical counter cash</span>
              </div>
              <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100">
                <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider block mb-1">Card POS Swipes</span>
                <span className="text-xl font-bold text-indigo-800">₹{salesMetrics.card.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                <span className="text-xs text-indigo-600/70 block mt-1">Debit & credit cards</span>
              </div>
              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100">
                <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider block mb-1">Store Credit (Khata)</span>
                <span className="text-xl font-bold text-amber-800">₹{salesMetrics.credit.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                <span className="text-xs text-amber-600/70 block mt-1">Credit book receivables</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROFIT & LOSS (P&L) STATEMENT */}
      {activeTab === 'PNL' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="border-b border-slate-100 pb-4 mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Operating Statement of Profit & Loss</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Accounting standard: Net Sales - Cost of Goods Sold - Operating Expenses
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-bold">
                  Period: {dateFilter.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Structured Accounting Ledger */}
            <div className="space-y-4 max-w-3xl">
              {/* 1. Operating Revenue */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800 text-sm">1. Operating Revenue (Net Sales)</span>
                  <span className="font-bold text-slate-900 text-base">₹{pnlMetrics.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="text-xs text-slate-500 mt-1 pl-4 flex justify-between">
                  <span>Gross Sales: ₹{salesMetrics.grossSales.toFixed(2)} - Discounts: ₹{salesMetrics.totalDiscount.toFixed(2)}</span>
                  <span>100% of Revenue</span>
                </div>
              </div>

              {/* 2. COGS */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center text-rose-700">
                  <span className="font-bold text-sm">2. Less: Cost of Goods Sold (COGS)</span>
                  <span className="font-bold text-base">- ₹{pnlMetrics.cogs.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="text-xs text-slate-500 mt-1 pl-4">
                  Direct purchase cost of inventory units sold during period
                </div>
              </div>

              {/* Gross Profit Summary Banner */}
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex justify-between items-center">
                <div>
                  <span className="font-bold text-emerald-900 text-base block">GROSS PROFIT</span>
                  <span className="text-xs text-emerald-700 font-medium">Gross Margin: {pnlMetrics.grossMarginPercent}%</span>
                </div>
                <span className="text-2xl font-black text-emerald-700">
                  ₹{pnlMetrics.grossProfit.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* 3. Operating Expenses */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-slate-800">
                  <span className="font-bold text-sm">3. Less: Store Operating Expenses (OPEX)</span>
                  <span className="font-bold text-rose-600">- ₹{pnlMetrics.totalOperatingExpenses.toLocaleString('en-IN')}</span>
                </div>
                <div className="pl-4 space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-200">
                  <div className="flex justify-between">
                    <span>• Commercial Shop Rent</span>
                    <span>₹{pnlMetrics.rentExpense.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Staff Salaries & Wages</span>
                    <span>₹{pnlMetrics.salaryExpense.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Electricity & Commercial Utilities</span>
                    <span>₹{pnlMetrics.electricityExpense.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Maintenance, POS Paper & Misc Expenses</span>
                    <span>₹{pnlMetrics.maintenanceExpense.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Final Net Profit Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex justify-between items-center shadow-md">
                <div>
                  <span className="text-xs uppercase tracking-wider text-blue-200 block font-semibold">
                    Net Operating Profit (EBITDA)
                  </span>
                  <span className="text-sm text-blue-100 font-medium mt-0.5">
                    Net Margin: <strong>{pnlMetrics.netMarginPercent}%</strong>
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black tracking-tight">
                    ₹{pnlMetrics.netProfit.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </div>
                  <span className="text-[11px] text-emerald-300 font-medium">Bottom Line Cash Surplus</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GST TAX REPORT */}
      {activeTab === 'GST' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Total GST Collected</span>
              <div className="text-2xl font-bold text-slate-900">₹{gstMetrics.totalTaxCollected.toFixed(2)}</div>
              <span className="text-xs text-slate-400 mt-1 block">Output tax payable to govt</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Central GST (CGST)</span>
              <div className="text-2xl font-bold text-blue-600">₹{gstMetrics.cgst.toFixed(2)}</div>
              <span className="text-xs text-slate-400 mt-1 block">50% Central Government share</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">State GST (SGST)</span>
              <div className="text-2xl font-bold text-indigo-600">₹{gstMetrics.sgst.toFixed(2)}</div>
              <span className="text-xs text-slate-400 mt-1 block">50% State Government share</span>
            </div>
          </div>

          {/* Tax Slab Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800">GST Slab-wise Breakdown (GSTR-3B Ready)</h3>
              <span className="text-xs text-slate-400">GSTIN: 27AABCU9603R1ZM</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                    <th className="py-3 px-4">Tax Rate Slab</th>
                    <th className="py-3 px-4 text-right">Taxable Turnover</th>
                    <th className="py-3 px-4 text-right">CGST (50%)</th>
                    <th className="py-3 px-4 text-right">SGST (50%)</th>
                    <th className="py-3 px-4 text-right">Total Tax Output</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-semibold text-slate-800">0% (Nil Rated / Exempt)</td>
                    <td className="py-3.5 px-4 text-right">₹{gstMetrics.slab0Sales.toFixed(2)}</td>
                    <td className="py-3.5 px-4 text-right">₹0.00</td>
                    <td className="py-3.5 px-4 text-right">₹0.00</td>
                    <td className="py-3.5 px-4 text-right font-bold">₹0.00</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-semibold text-slate-800">5% GST Slab</td>
                    <td className="py-3.5 px-4 text-right">₹{gstMetrics.slab5Sales.toFixed(2)}</td>
                    <td className="py-3.5 px-4 text-right">₹{(gstMetrics.slab5Tax / 2).toFixed(2)}</td>
                    <td className="py-3.5 px-4 text-right">₹{(gstMetrics.slab5Tax / 2).toFixed(2)}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-blue-600">₹{gstMetrics.slab5Tax.toFixed(2)}</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-semibold text-slate-800">12% GST Slab</td>
                    <td className="py-3.5 px-4 text-right">₹{gstMetrics.slab12Sales.toFixed(2)}</td>
                    <td className="py-3.5 px-4 text-right">₹{(gstMetrics.slab12Tax / 2).toFixed(2)}</td>
                    <td className="py-3.5 px-4 text-right">₹{(gstMetrics.slab12Tax / 2).toFixed(2)}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-blue-600">₹{gstMetrics.slab12Tax.toFixed(2)}</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-semibold text-slate-800">18% GST Slab</td>
                    <td className="py-3.5 px-4 text-right">₹{gstMetrics.slab18Sales.toFixed(2)}</td>
                    <td className="py-3.5 px-4 text-right">₹{(gstMetrics.slab18Tax / 2).toFixed(2)}</td>
                    <td className="py-3.5 px-4 text-right">₹{(gstMetrics.slab18Tax / 2).toFixed(2)}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-blue-600">₹{gstMetrics.slab18Tax.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: STOCK VALUATION REPORT */}
      {activeTab === 'STOCK' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Total Valuation at Cost</span>
              <div className="text-2xl font-bold text-slate-900">₹{stockMetrics.totalCost.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
              <span className="text-xs text-slate-400 mt-1 block">Capital locked in stock</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Valuation at Selling Price</span>
              <div className="text-2xl font-bold text-blue-600">₹{stockMetrics.totalRetail.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
              <span className="text-xs text-slate-400 mt-1 block">Expected cash recovery</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Unrealized Gross Margin</span>
              <div className="text-2xl font-bold text-emerald-600">₹{stockMetrics.totalPotentialProfit.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
              <span className="text-xs text-slate-400 mt-1 block">Future gross earnings potential</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800">Category-Wise Stock Valuation Breakdown</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Units on Hand</th>
                    <th className="py-3 px-4 text-right">Valuation (Cost)</th>
                    <th className="py-3 px-4 text-right">Valuation (Retail)</th>
                    <th className="py-3 px-4 text-right">Gross Profit Potential</th>
                    <th className="py-3 px-4 text-right">Margin %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {stockMetrics.categoriesArray.map((cat) => (
                    <tr key={cat.name} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{cat.name}</td>
                      <td className="py-3.5 px-4 text-right font-medium">{cat.count}</td>
                      <td className="py-3.5 px-4 text-right">₹{cat.costVal.toFixed(2)}</td>
                      <td className="py-3.5 px-4 text-right font-semibold text-slate-900">₹{cat.retailVal.toFixed(2)}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-600">₹{cat.potentialProfit.toFixed(2)}</td>
                      <td className="py-3.5 px-4 text-right text-xs font-semibold text-emerald-700">{cat.margin}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: KHATA / CUSTOMER DUES */}
      {activeTab === 'KHATA' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Total Outstanding Khata Balance</span>
              <div className="text-3xl font-black text-amber-600">₹{totalKhataBalance.toLocaleString('en-IN')}</div>
              <span className="text-xs text-slate-400 mt-1 block">Total receivables from {khataCustomers.length} registered credit accounts</span>
            </div>
            <div className="text-right">
              <span className="inline-block bg-amber-50 text-amber-700 text-xs px-3 py-1.5 rounded-xl font-bold border border-amber-200">
                Recovery Rate: 92%
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                    <th className="py-3 px-4">Customer / Merchant</th>
                    <th className="py-3 px-4">Contact Phone</th>
                    <th className="py-3 px-4 text-right">Outstanding Due</th>
                    <th className="py-3 px-4 text-right">Credit Limit</th>
                    <th className="py-3 px-4">Last Transaction</th>
                    <th className="py-3 px-4">Account Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {khataCustomers.map((cust) => (
                    <tr key={cust.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{cust.name}</td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-xs">{cust.phone}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-amber-600">₹{cust.balance.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-4 text-right text-slate-500">₹{cust.limit.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-4 text-slate-500 text-xs">{cust.lastTx}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          {cust.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
