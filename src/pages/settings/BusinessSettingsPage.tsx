import React, { useState } from 'react';
import {
  Store,
  FileText,
  Percent,
  CreditCard,
  Save,
  CheckCircle,
  X,
  Printer,
  ShieldCheck,
  Building,
  Phone,
  Mail,
  MapPin,
  QrCode,
} from 'lucide-react';
import { dataRepository } from '../../services/repositories/dataRepository';
import { BusinessSettings } from '../../types';
import { useAdminAuth } from '../../context/AuthContext';
import { useAdminData } from '../../context/AdminDataContext';

export const BusinessSettingsPage: React.FC = () => {
  const { hasPermission } = useAdminAuth();
  const { settings, updateSettings } = useAdminData();

  // Local form state initialized from context
  const [profile, setProfile] = useState(settings.profile);
  const [invoice, setInvoice] = useState(settings.invoice);
  const [tax, setTax] = useState(settings.tax);

  const [activeTab, setActiveTab] = useState<'PROFILE' | 'INVOICE' | 'TAX' | 'PAYMENTS'>('PROFILE');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermission('settings.edit')) {
      alert('You do not have permission to modify business settings.');
      return;
    }

    const updated: BusinessSettings = {
      ...settings,
      profile,
      invoice,
      tax,
    };

    updateSettings(updated);
    showToast('Business & POS settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Store & System Settings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure your shop identity, thermal receipt formats, GST tax preferences and payment methods
          </p>
        </div>
        {hasPermission('settings.edit') && (
          <button
            onClick={handleSave}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20"
          >
            <Save className="w-4 h-4" />
            <span>Save All Settings</span>
          </button>
        )}
      </div>

      {/* Main Settings Card with Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Navigation Tabs */}
        <div className="border-b border-slate-100 flex items-center px-6 overflow-x-auto space-x-6 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('PROFILE')}
            className={`py-4 border-b-2 flex items-center space-x-2 transition-colors whitespace-nowrap ${
              activeTab === 'PROFILE'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Store Profile</span>
          </button>
          <button
            onClick={() => setActiveTab('INVOICE')}
            className={`py-4 border-b-2 flex items-center space-x-2 transition-colors whitespace-nowrap ${
              activeTab === 'INVOICE'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>Bill & Receipt Format</span>
          </button>
          <button
            onClick={() => setActiveTab('TAX')}
            className={`py-4 border-b-2 flex items-center space-x-2 transition-colors whitespace-nowrap ${
              activeTab === 'TAX'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Percent className="w-4 h-4" />
            <span>GST & Taxes</span>
          </button>
          <button
            onClick={() => setActiveTab('PAYMENTS')}
            className={`py-4 border-b-2 flex items-center space-x-2 transition-colors whitespace-nowrap ${
              activeTab === 'PAYMENTS'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Payment Methods</span>
          </button>
        </div>

        {/* Tab 1: Store Profile */}
        {activeTab === 'PROFILE' && (
          <form onSubmit={handleSave} className="p-6 space-y-6 max-w-3xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Store Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={profile.shopName}
                  onChange={(e) => setProfile({ ...profile, shopName: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <p className="text-xs text-slate-400 mt-1">This name will appear on POS receipts and customer SMS</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Owner / Authorized Signatory
                </label>
                <input
                  type="text"
                  value={profile.ownerName}
                  onChange={(e) => setProfile({ ...profile, ownerName: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  GSTIN (15 Digits)
                </label>
                <input
                  type="text"
                  value={profile.gstin || ''}
                  onChange={(e) => setProfile({ ...profile, gstin: e.target.value })}
                  placeholder="27AABCU9603R1ZM"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Contact Phone Number *
                </label>
                <input
                  type="text"
                  required
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Shop Physical Address *
                </label>
                <textarea
                  rows={2}
                  value={profile.businessAddress}
                  onChange={(e) => setProfile({ ...profile, businessAddress: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={profile.city}
                  onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  PIN Code
                </label>
                <input
                  type="text"
                  value={profile.pincode}
                  onChange={(e) => setProfile({ ...profile, pincode: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20"
              >
                Save Profile Changes
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Bill & Receipt Format */}
        {activeTab === 'INVOICE' && (
          <form onSubmit={handleSave} className="p-6 space-y-6 max-w-3xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Invoice Number Prefix
                </label>
                <input
                  type="text"
                  value={invoice.prefix}
                  onChange={(e) => setInvoice({ ...invoice, prefix: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <p className="text-xs text-slate-400 mt-1">e.g. "INV-" results in INV-1045</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Next Invoice Sequence Number
                </label>
                <input
                  type="number"
                  value={invoice.nextNumber}
                  onChange={(e) => setInvoice({ ...invoice, nextNumber: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  POS Printer Paper Format
                </label>
                <select
                  value={invoice.paperFormat}
                  onChange={(e) => setInvoice({ ...invoice, paperFormat: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="THERMAL_80MM">80mm Thermal Paper (Standard 3-Inch)</option>
                  <option value="THERMAL_58MM">58mm Thermal Paper (Compact 2-Inch)</option>
                  <option value="A4">A4 Full Sheet (Office Printer)</option>
                  <option value="A5">A5 Half Sheet</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Receipt Footer Greeting / Return Policy
                </label>
                <textarea
                  rows={2}
                  value={invoice.footerText}
                  onChange={(e) => setInvoice({ ...invoice, footerText: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                />
              </div>

              <div className="sm:col-span-2 space-y-3 pt-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={invoice.showGstBreakdown}
                    onChange={(e) => setInvoice({ ...invoice, showGstBreakdown: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-semibold text-slate-800 block">Print GST Tax Breakdown (CGST + SGST)</span>
                    <span className="text-xs text-slate-500">Shows individual tax components on consumer receipts</span>
                  </div>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={invoice.showHsnSummary}
                    onChange={(e) => setInvoice({ ...invoice, showHsnSummary: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-semibold text-slate-800 block">Print HSN / SAC Code Summary Table</span>
                    <span className="text-xs text-slate-500">Required for B2B tax invoices above ₹50,000</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20"
              >
                Save Receipt Preferences
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: GST & Taxes */}
        {activeTab === 'TAX' && (
          <form onSubmit={handleSave} className="p-6 space-y-6 max-w-3xl">
            <div className="space-y-4">
              <label className="flex items-center space-x-3 cursor-pointer p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <input
                  type="checkbox"
                  checked={tax.enabled}
                  onChange={(e) => setTax({ ...tax, enabled: e.target.checked })}
                  className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-bold text-slate-800 block">Enable GST Tax System</span>
                  <span className="text-xs text-slate-500">
                    When enabled, sales will calculate CGST and SGST according to Indian tax regulations.
                  </span>
                </div>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Default GST Slab for New Items (%)
                  </label>
                  <select
                    value={tax.defaultGstRate}
                    onChange={(e) => setTax({ ...tax, defaultGstRate: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value={0}>0% (Tax-Free / Grains)</option>
                    <option value={5}>5% (Packaged Essentials)</option>
                    <option value={12}>12% (Processed Foods / Snacks)</option>
                    <option value={18}>18% (Personal Care & Home)</option>
                    <option value={28}>28% (Luxury Items)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Pricing Mode
                  </label>
                  <select
                    value={tax.inclusivePricing ? 'inclusive' : 'exclusive'}
                    onChange={(e) => setTax({ ...tax, inclusivePricing: e.target.value === 'inclusive' })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="inclusive">MRP Tax Inclusive (Retail Standard)</option>
                    <option value="exclusive">Tax Added on Checkout (B2B Wholesale)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20"
              >
                Save Tax Configuration
              </button>
            </div>
          </form>
        )}

        {/* Tab 4: Payment Methods */}
        {activeTab === 'PAYMENTS' && (
          <div className="p-6 space-y-6 max-w-3xl">
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-slate-800 block">Cash Counter Payments</span>
                  <span className="text-xs text-slate-500">Accept physical notes and change calculator</span>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                  Always Active
                </span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-slate-800 block">UPI QR Code & Dynamic QR</span>
                  <span className="text-xs text-slate-500">VPA: ezomart@okaxis (Supports GPay, PhonePe, Paytm)</span>
                </div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                  Enabled
                </span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-slate-800 block">Credit / Debit Card POS Machine</span>
                  <span className="text-xs text-slate-500">Pine Labs / Mosambee POS integration</span>
                </div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                  Enabled
                </span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-slate-800 block">Customer Khata / Store Credit</span>
                  <span className="text-xs text-slate-500">Allows credit billing against customer phone number</span>
                </div>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                  Enabled (Limit: ₹15,000)
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
