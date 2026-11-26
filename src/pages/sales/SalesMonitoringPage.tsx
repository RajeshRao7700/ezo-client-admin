import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  X,
  Printer,
  RotateCcw,
  User,
  CreditCard,
  Building,
  CheckCircle2
} from 'lucide-react';
import { SaleTransaction, PaymentMethod, TransactionStatus } from '../../types';
import { dataRepository } from '../../services/repositories/dataRepository';
import { ExportUtils } from '../../utils/exportUtils';
import { useAdminData } from '../../context/AdminDataContext';

export const SalesMonitoringPage: React.FC = () => {
  const { settings } = useAdminData();
  const [sales, setSales] = useState<SaleTransaction[]>([]);
  const [search, setSearch] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('ALL');
  const [inspectTx, setInspectTx] = useState<SaleTransaction | null>(null);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = () => {
    setSales(dataRepository.getSales());
  };

  const employees = dataRepository.getEmployees();

  // Filtered sales
  const filtered = sales.filter((s) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchNo = s.invoiceNumber.toLowerCase().includes(q);
      const matchCust = s.customerName.toLowerCase().includes(q);
      const matchPhone = (s.customerPhone || '').includes(q);
      if (!matchNo && !matchCust && !matchPhone) return false;
    }
    if (selectedMethod !== 'ALL' && s.paymentMethod !== selectedMethod) return false;
    if (selectedStatus !== 'ALL' && s.status !== selectedStatus) return false;
    if (selectedEmployee !== 'ALL' && s.cashierId !== selectedEmployee) return false;
    return true;
  });

  const totalFilteredSales = filtered.reduce((acc, s) => acc + s.netTotal, 0);

  // Real Export to CSV
  const handleExportCsv = () => {
    const headers = ['Invoice No', 'Date', 'Customer', 'Cashier', 'Items Count', 'Gross Total', 'Discount', 'GST Tax', 'Net Total', 'Payment Method', 'Status'];
    const rows = filtered.map((s) => [
      s.invoiceNumber,
      new Date(s.dateTime).toLocaleString(),
      s.customerName,
      s.cashierName,
      s.itemCount,
      s.grossTotal,
      s.discountTotal,
      s.taxTotal,
      s.netTotal,
      s.paymentMethod,
      s.status,
    ]);
    ExportUtils.exportToCsv(`Sales_Archive_${Date.now()}`, headers, rows);
  };

  // Real Export to PDF
  const handleExportPdf = () => {
    const headers = ['Invoice No', 'Date', 'Customer', 'Cashier', 'Method', 'Net Total', 'Status'];
    const rows = filtered.map((s) => [
      s.invoiceNumber,
      new Date(s.dateTime).toLocaleDateString(),
      s.customerName.slice(0, 20),
      s.cashierName,
      s.paymentMethod,
      `INR ${s.netTotal.toFixed(2)}`,
      s.status,
    ]);
    ExportUtils.exportToPdf(
      'Sales Monitoring Report',
      `${settings.profile.shopName} - Filtered Transactions`,
      headers,
      rows,
      {
        'Total Receipts': filtered.length.toString(),
        'Total Revenue': `INR ${totalFilteredSales.toFixed(2)}`,
      }
    );
  };

  return (
    <div className="space-y-4 pb-12 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-6 h-6 text-admin-600" />
            Sales Transactions & Audit Monitoring
          </h1>
          <p className="text-xs text-slate-500">
            Real-time audit log of customer receipts, line item taxes, payment methods, and refunds
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            Export CSV
          </button>
          <button
            onClick={handleExportPdf}
            className="px-3.5 py-2 rounded-2xl bg-admin-600 hover:bg-admin-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-admin-500/20"
          >
            <Download className="w-3.5 h-3.5" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search invoice # or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            />
          </div>

          {/* Cashier / Staff Filter */}
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
          >
            <option value="ALL">All Staff Members</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
            ))}
          </select>

          {/* Payment Method */}
          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
          >
            <option value="ALL">All Payment Methods</option>
            <option value="CASH">Cash</option>
            <option value="UPI">UPI / QR</option>
            <option value="CARD">Card POS</option>
            <option value="CREDIT">Khata Credit</option>
          </select>

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
          >
            <option value="ALL">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="RETURNED">Returned / Refunded</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* Summary Mini Bar */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Found {filtered.length} transactions</span>
          <span>Filtered Total: <strong className="font-mono text-slate-900 dark:text-white">₹{totalFilteredSales.toFixed(2)}</strong></span>
        </div>
      </div>

      {/* Sales Transactions Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="py-3 px-3">Invoice No</th>
                <th className="py-3 px-3">Date & Time</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Cashier</th>
                <th className="py-3 px-3">Channel</th>
                <th className="py-3 px-3">Gross</th>
                <th className="py-3 px-3">Net Total</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                    {s.invoiceNumber}
                  </td>
                  <td className="py-3 px-3 text-slate-400">
                    {new Date(s.dateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{s.customerName}</span>
                    {s.customerPhone && <span className="text-[10px] text-slate-400 block font-mono">{s.customerPhone}</span>}
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                    {s.cashierName}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">
                      {s.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-500">
                    ₹{s.grossTotal.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 font-mono font-black text-slate-900 dark:text-white">
                    ₹{s.netTotal.toFixed(2)}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      s.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setInspectTx(s)}
                      className="p-1.5 rounded-lg text-admin-600 hover:bg-admin-50 dark:hover:bg-admin-950/40 font-bold text-xs inline-flex items-center gap-1"
                      title="Inspect Invoice"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Detail Modal */}
      {inspectTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Invoice Inspection: {inspectTx.invoiceNumber}
                </h3>
                <p className="text-[11px] text-slate-500">Billed by {inspectTx.cashierName} on {new Date(inspectTx.dateTime).toLocaleString()}</p>
              </div>
              <button onClick={() => setInspectTx(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Customer Box */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Customer Profile</span>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{inspectTx.customerName}</p>
                  {inspectTx.customerPhone && <p className="text-slate-500 font-mono">{inspectTx.customerPhone}</p>}
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Payment Channel</span>
                  <p className="font-bold text-admin-600">{inspectTx.paymentMethod}</p>
                </div>
              </div>

              {/* Items List */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] text-slate-400 font-bold uppercase">
                    <tr>
                      <th className="p-2.5">Item</th>
                      <th className="p-2.5 text-center">Qty</th>
                      <th className="p-2.5 text-right">Rate</th>
                      <th className="p-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {inspectTx.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5">
                          <p className="font-bold text-slate-900 dark:text-white">{item.productName}</p>
                          <p className="text-[10px] text-slate-400">GST: {item.taxRate}%</p>
                        </td>
                        <td className="p-2.5 text-center font-bold">{item.quantity} {item.unit}</td>
                        <td className="p-2.5 text-right font-mono">₹{item.unitPrice.toFixed(2)}</td>
                        <td className="p-2.5 text-right font-mono font-bold">₹{item.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Breakdown */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-1 font-semibold">
                <div className="flex justify-between">
                  <span className="text-slate-500">Gross Total:</span>
                  <span className="font-mono">₹{inspectTx.grossTotal.toFixed(2)}</span>
                </div>
                {inspectTx.discountTotal > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount Applied:</span>
                    <span className="font-mono">-₹{inspectTx.discountTotal.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>GST Tax Breakdown:</span>
                  <span className="font-mono">₹{inspectTx.taxTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>COGS Purchase Basis:</span>
                  <span className="font-mono">₹{inspectTx.cogsTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-bold pt-1 border-t border-slate-200">
                  <span>Gross Profit Margin on Sale:</span>
                  <span className="font-mono">₹{inspectTx.grossProfit.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-1 border-t border-slate-300">
                  <span>NET PAYABLE:</span>
                  <span className="font-mono text-admin-600">₹{inspectTx.netTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end">
              <button
                onClick={() => setInspectTx(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
