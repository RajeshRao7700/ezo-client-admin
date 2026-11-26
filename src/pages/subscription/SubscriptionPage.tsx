import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle,
  Calendar,
  Clock,
  Download,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  HelpCircle,
  FileText,
  X,
  PhoneCall,
  Sparkles,
} from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { ShopSubscription } from '../../types';

export const SubscriptionPage: React.FC = () => {
  const { subscription } = useAdminData();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [targetPlan, setTargetPlan] = useState<'ANNUAL' | 'ENTERPRISE'>('ANNUAL');
  const [upgradeNotes, setUpgradeNotes] = useState('');
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  // Invoices history
  const invoices = [
    { id: 'INV-SUB-2026-11', date: '01 Nov 2026', plan: 'EZO Pro Retail (1 Month)', amount: 999, method: 'UPI AutoPay', status: 'PAID' },
    { id: 'INV-SUB-2026-10', date: '01 Oct 2026', plan: 'EZO Pro Retail (1 Month)', amount: 999, method: 'UPI AutoPay', status: 'PAID' },
    { id: 'INV-SUB-2026-09', date: '01 Sep 2026', plan: 'EZO Pro Retail (1 Month)', amount: 999, method: 'Credit Card', status: 'PAID' },
  ];

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setRequestSubmitted(true);
    setTimeout(() => {
      setIsUpgradeModalOpen(false);
      setRequestSubmitted(false);
    }, 2500);
  };

  const handleDownloadInvoice = (invId: string) => {
    alert(`Downloading PDF receipt for invoice ${invId}...`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">EZO Billing Subscription & Plan</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your shop SaaS license, billing history and register capacity
          </p>
        </div>
        <button
          onClick={() => setIsUpgradeModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl text-sm hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm shadow-blue-500/20"
        >
          <Sparkles className="w-4 h-4" />
          <span>Upgrade or Renew Plan</span>
        </button>
      </div>

      {/* Plan Overview Card */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden border border-blue-900/40">
        {/* Subtle background glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="bg-blue-500/20 text-blue-300 text-xs font-bold px-3 py-1 rounded-full border border-blue-400/30">
                ACTIVE SUBSCRIPTION
              </span>
              <span className="text-xs text-blue-200">Tenant: shop-ezo-001</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight">{subscription.planName}</h2>
            <p className="text-blue-200/80 text-sm mt-1 max-w-lg">
              Full-featured store operations tier for growing retail supermarkets, marts and grocery chains.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 text-right min-w-[200px]">
            <span className="text-xs text-blue-200 font-medium block">Subscription Fee</span>
            <div className="text-3xl font-black text-white mt-0.5">
              ₹{subscription.pricePerMonth}
              <span className="text-sm font-normal text-blue-200"> / month</span>
            </div>
            <div className="mt-2 text-xs text-emerald-400 font-semibold flex items-center justify-end space-x-1">
              <Clock className="w-3.5 h-3.5" />
              <span>35 Days Remaining</span>
            </div>
          </div>
        </div>

        {/* Validity & Dates Bar */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-blue-200 relative z-10">
          <div>
            <span className="text-blue-400/80 block uppercase tracking-wider font-semibold">Active Since</span>
            <span className="text-white font-medium text-sm mt-0.5 block">{subscription.startDate}</span>
          </div>
          <div>
            <span className="text-blue-400/80 block uppercase tracking-wider font-semibold">Renews / Expiry</span>
            <span className="text-white font-medium text-sm mt-0.5 block">{subscription.expiryDate}</span>
          </div>
          <div>
            <span className="text-blue-400/80 block uppercase tracking-wider font-semibold">Billing Frequency</span>
            <span className="text-white font-medium text-sm mt-0.5 block">Monthly (AutoPay Active)</span>
          </div>
          <div>
            <span className="text-blue-400/80 block uppercase tracking-wider font-semibold">Support SLA</span>
            <span className="text-emerald-300 font-semibold text-sm mt-0.5 block">Priority 24/7 WhatsApp</span>
          </div>
        </div>
      </div>

      {/* Plan Features Inclusions */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          <span>Included in Your Current EZO Pro Plan</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {subscription.features.map((feature, idx) => (
            <div key={idx} className="flex items-start space-x-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span className="text-xs font-semibold text-slate-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Payment & Invoices History */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">Subscription Invoices & Receipts</h3>
            <p className="text-xs text-slate-400 mt-0.5">Official GST invoices issued for your subscription charges</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Billing Date</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4">Payment Mode</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-700">{inv.id}</td>
                  <td className="py-3.5 px-4 text-slate-600 text-xs">{inv.date}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">{inv.plan}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">₹{inv.amount.toFixed(2)}</td>
                  <td className="py-3.5 px-4 text-xs text-slate-500">{inv.method}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDownloadInvoice(inv.id)}
                      className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Receipt</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upgrade / Renewal Modal */}
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Request Subscription Upgrade</h3>
              <button
                onClick={() => setIsUpgradeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {requestSubmitted ? (
              <div className="p-8 text-center space-y-3">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-lg font-bold text-slate-900">Request Dispatched!</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Your request has been forwarded to the EZO SaaS Super Admin team. Our relationship manager will verify
                  and activate your requested plan upgrade immediately.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendRequest} className="p-6 space-y-4">
                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800">
                  <p className="font-semibold mb-1">EZO SaaS Architecture Note:</p>
                  <p>
                    All subscription upgrades, multi-branch licenses and billing changes are verified and provisioned by the
                    central <strong>EZO Super Admin Portal</strong> for security and invoice compliance.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Select Upgrade Target Plan
                  </label>
                  <div className="space-y-2">
                    <label
                      onClick={() => setTargetPlan('ANNUAL')}
                      className={`block p-3 rounded-xl border cursor-pointer transition-all ${
                        targetPlan === 'ANNUAL'
                          ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800 text-sm">Annual Pro (Save 20%)</span>
                        <span className="font-bold text-blue-600 text-sm">₹9,999 / year</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Includes 5 POS Counters & 12 months uninterrupted support</p>
                    </label>

                    <label
                      onClick={() => setTargetPlan('ENTERPRISE')}
                      className={`block p-3 rounded-xl border cursor-pointer transition-all ${
                        targetPlan === 'ENTERPRISE'
                          ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800 text-sm">Multi-Store Enterprise</span>
                        <span className="font-bold text-blue-600 text-sm">Custom Pricing</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Central warehouse synchronization and multi-branch rollups</p>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Special Instructions / Billing Notes
                  </label>
                  <textarea
                    rows={2}
                    value={upgradeNotes}
                    onChange={(e) => setUpgradeNotes(e.target.value)}
                    placeholder="e.g. Please add 2 additional barcode scanner terminals..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsUpgradeModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20"
                  >
                    Send Upgrade Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
