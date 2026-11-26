import React, { useState, useMemo } from 'react';
import {
  Package,
  AlertTriangle,
  AlertOctagon,
  Calendar,
  Plus,
  Search,
  Filter,
  Download,
  ArrowUpDown,
  Edit2,
  Sliders,
  DollarSign,
  Layers,
  CheckCircle,
  X,
  FileSpreadsheet,
  FileText,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { InventoryProduct, StockAdjustment, ProductUnit } from '../../types';
import { dataRepository } from '../../services/repositories/dataRepository';
import { ExportUtils } from '../../utils/exportUtils';
import { useAdminAuth } from '../../context/AuthContext';

export const InventoryMonitoringPage: React.FC = () => {
  const { hasPermission } = useAdminAuth();
  const [products, setProducts] = useState<InventoryProduct[]>(() => dataRepository.getProducts());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRING'>('ALL');
  
  // Modals
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<InventoryProduct | null>(null);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustingProduct, setAdjustingProduct] = useState<InventoryProduct | null>(null);
  
  // Form States - Add/Edit
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formBarcode, setFormBarcode] = useState('');
  const [formCategory, setFormCategory] = useState('Groceries');
  const [formUnit, setFormUnit] = useState<ProductUnit>('KG');
  const [formCostPrice, setFormCostPrice] = useState<number>(0);
  const [formSellingPrice, setFormSellingPrice] = useState<number>(0);
  const [formTaxRate, setFormTaxRate] = useState<number>(5);
  const [formStockQty, setFormStockQty] = useState<number>(0);
  const [formMinStock, setFormMinStock] = useState<number>(10);
  const [formExpiryDate, setFormExpiryDate] = useState('');
  const [formBatchNo, setFormBatchNo] = useState('');
  
  // Form States - Adjustment
  const [adjustType, setAdjustType] = useState<StockAdjustment['type']>('IN');
  const [adjustQty, setAdjustQty] = useState<number>(10);
  const [adjustReason, setAdjustReason] = useState('Stock Arrival / Supplier Delivery');
  const [adjustNotes, setAdjustNotes] = useState('');

  // Toast / notification
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3500);
  };

  const reloadProducts = () => {
    setProducts(dataRepository.getProducts());
  };

  // Distinct categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.categoryName) set.add(p.categoryName);
    });
    return Array.from(set);
  }, [products]);

  // Expiry check helper (within 30 days)
  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const exp = new Date(expiryDate).getTime();
    const now = new Date('2026-11-26').getTime();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    return exp >= now && exp - now <= thirtyDaysMs;
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.barcode && p.barcode.includes(searchQuery));

      // Category
      const matchesCategory = selectedCategory === 'ALL' || p.categoryName === selectedCategory;

      // Status
      let matchesStatus = true;
      if (statusFilter === 'IN_STOCK') {
        matchesStatus = p.stockQuantity > p.minStockLevel;
      } else if (statusFilter === 'LOW_STOCK') {
        matchesStatus = p.stockQuantity > 0 && p.stockQuantity <= p.minStockLevel;
      } else if (statusFilter === 'OUT_OF_STOCK') {
        matchesStatus = p.stockQuantity === 0;
      } else if (statusFilter === 'EXPIRING') {
        matchesStatus = isExpiringSoon(p.expiryDate);
      }

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchQuery, selectedCategory, statusFilter]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalCount = products.length;
    const totalValuationCost = products.reduce((acc, p) => acc + p.stockQuantity * p.costPrice, 0);
    const totalValuationRetail = products.reduce((acc, p) => acc + p.stockQuantity * p.sellingPrice, 0);
    const lowStockCount = products.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= p.minStockLevel).length;
    const outOfStockCount = products.filter((p) => p.stockQuantity === 0).length;
    const expiringCount = products.filter((p) => isExpiringSoon(p.expiryDate)).length;

    return {
      totalCount,
      totalValuationCost,
      totalValuationRetail,
      lowStockCount,
      outOfStockCount,
      expiringCount,
    };
  }, [products]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormName('');
    setFormSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormBarcode(`890${Math.floor(100000000 + Math.random() * 900000000)}`);
    setFormCategory('Groceries');
    setFormUnit('KG');
    setFormCostPrice(50);
    setFormSellingPrice(70);
    setFormTaxRate(5);
    setFormStockQty(25);
    setFormMinStock(10);
    setFormExpiryDate('2027-06-30');
    setFormBatchNo('BATCH-26');
    setIsAddEditModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (p: InventoryProduct) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormSku(p.sku);
    setFormBarcode(p.barcode || '');
    setFormCategory(p.categoryName);
    setFormUnit(p.unit);
    setFormCostPrice(p.costPrice);
    setFormSellingPrice(p.sellingPrice);
    setFormTaxRate(p.gstRate || 5);
    setFormStockQty(p.stockQuantity);
    setFormMinStock(p.minStockLevel);
    setFormExpiryDate(p.expiryDate || '');
    setFormBatchNo(p.batchNo || '');
    setIsAddEditModalOpen(true);
  };

  // Save Product (Add or Edit)
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formSku.trim()) {
      alert('Product Name and SKU are mandatory');
      return;
    }

    if (editingProduct) {
      dataRepository.updateProduct(editingProduct.id, {
        name: formName,
        sku: formSku,
        barcode: formBarcode,
        categoryName: formCategory,
        unit: formUnit,
        costPrice: Number(formCostPrice),
        sellingPrice: Number(formSellingPrice),
        mrp: Number(formSellingPrice),
        gstRate: Number(formTaxRate),
        stockQuantity: Number(formStockQty),
        minStockLevel: Number(formMinStock),
        expiryDate: formExpiryDate,
        batchNo: formBatchNo,
      });
      showToast(`Updated product "${formName}" successfully`);
    } else {
      dataRepository.addProduct({
        tenantId: 'shop-ezo-001',
        sku: formSku,
        barcode: formBarcode,
        name: formName,
        categoryId: 'cat-general',
        categoryName: formCategory,
        costPrice: Number(formCostPrice),
        sellingPrice: Number(formSellingPrice),
        mrp: Number(formSellingPrice),
        gstRate: Number(formTaxRate),
        stockQuantity: Number(formStockQty),
        minStockLevel: Number(formMinStock),
        unit: formUnit,
        expiryDate: formExpiryDate,
        batchNo: formBatchNo,
      });
      showToast(`Added product "${formName}" to inventory`);
    }

    setIsAddEditModalOpen(false);
    reloadProducts();
  };

  // Open Adjustment Modal
  const handleOpenAdjust = (p: InventoryProduct) => {
    setAdjustingProduct(p);
    setAdjustType('IN');
    setAdjustQty(10);
    setAdjustReason('Stock Arrival / Supplier Delivery');
    setAdjustNotes('');
    setIsAdjustModalOpen(true);
  };

  // Save Adjustment
  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct) return;

    const previousStock = adjustingProduct.stockQuantity;
    let newStock = previousStock;

    if (adjustType === 'IN') {
      newStock = previousStock + Number(adjustQty);
    } else if (adjustType === 'OUT' || adjustType === 'DAMAGED' || adjustType === 'EXPIRED') {
      newStock = Math.max(0, previousStock - Number(adjustQty));
    } else if (adjustType === 'CORRECTION') {
      newStock = Number(adjustQty); // Absolute count
    }

    dataRepository.adjustStock({
      tenantId: 'shop-ezo-001',
      productId: adjustingProduct.id,
      productName: adjustingProduct.name,
      sku: adjustingProduct.sku,
      type: adjustType,
      previousStock,
      newStock,
      quantity: Number(adjustQty),
      reason: adjustReason,
      adjustedBy: 'Rajesh Varma (Owner)',
    });

    showToast(`Stock updated for ${adjustingProduct.name}: ${previousStock} -> ${newStock} ${adjustingProduct.unit}`);
    setIsAdjustModalOpen(false);
    reloadProducts();
  };

  // Export handlers
  const handleExportCSV = () => {
    ExportUtils.exportInventoryToCsv(filteredProducts);
  };

  const handleExportPDF = () => {
    ExportUtils.exportInventoryToPdf(filteredProducts);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {actionMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="text-sm font-medium">{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inventory & Stock Monitoring</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time stock valuation, reorder levels, expiry tracking and inventory adjustments
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-colors shadow-sm"
          >
            <FileText className="w-4 h-4 text-rose-600" />
            <span>Export PDF</span>
          </button>
          {hasPermission('inventory.manage_products') && (
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          )}
        </div>
      </div>

      {/* Inventory KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Total SKUs */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active SKUs</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{metrics.totalCount}</div>
          <p className="text-xs text-slate-400 mt-1">Catalog items</p>
        </div>

        {/* Total Stock Cost Value */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Stock Value (Cost)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-700">₹{metrics.totalValuationCost.toLocaleString('en-IN')}</div>
          <p className="text-xs text-slate-400 mt-1">Retail: ₹{metrics.totalValuationRetail.toLocaleString('en-IN')}</p>
        </div>

        {/* Low Stock Warning */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'LOW_STOCK' ? 'ALL' : 'LOW_STOCK')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-sm ${
            statusFilter === 'LOW_STOCK'
              ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/30'
              : 'bg-white border-slate-200/80 hover:border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">Low Stock Alert</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600">{metrics.lowStockCount}</div>
          <p className="text-xs text-amber-600/80 mt-1">Below minimum threshold</p>
        </div>

        {/* Out of Stock */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'OUT_OF_STOCK' ? 'ALL' : 'OUT_OF_STOCK')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-sm ${
            statusFilter === 'OUT_OF_STOCK'
              ? 'bg-rose-50/80 border-rose-300 ring-2 ring-rose-400/30'
              : 'bg-white border-slate-200/80 hover:border-rose-200'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700">Out of Stock</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-600">{metrics.outOfStockCount}</div>
          <p className="text-xs text-rose-600/80 mt-1">Needs urgent replenishment</p>
        </div>

        {/* Expiring Soon */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'EXPIRING' ? 'ALL' : 'EXPIRING')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-sm ${
            statusFilter === 'EXPIRING'
              ? 'bg-purple-50/80 border-purple-300 ring-2 ring-purple-400/30'
              : 'bg-white border-slate-200/80 hover:border-purple-200'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-700">Expiring &lt;30d</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-700">{metrics.expiringCount}</div>
          <p className="text-xs text-purple-600/80 mt-1">Check shelf date</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Name, SKU, Barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category & Status Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category Dropdown */}
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-sm text-slate-700">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent border-none text-sm text-slate-800 font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Chips */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                statusFilter === 'ALL' ? 'bg-white text-slate-800 shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All ({products.length})
            </button>
            <button
              onClick={() => setStatusFilter('LOW_STOCK')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                statusFilter === 'LOW_STOCK'
                  ? 'bg-amber-500 text-white shadow-sm font-semibold'
                  : 'text-slate-500 hover:text-amber-700'
              }`}
            >
              Low Stock
            </button>
            <button
              onClick={() => setStatusFilter('OUT_OF_STOCK')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                statusFilter === 'OUT_OF_STOCK'
                  ? 'bg-rose-500 text-white shadow-sm font-semibold'
                  : 'text-slate-500 hover:text-rose-700'
              }`}
            >
              Out of Stock
            </button>
            <button
              onClick={() => setStatusFilter('EXPIRING')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                statusFilter === 'EXPIRING'
                  ? 'bg-purple-600 text-white shadow-sm font-semibold'
                  : 'text-slate-500 hover:text-purple-700'
              }`}
            >
              Expiring
            </button>
          </div>
        </div>
      </div>

      {/* Product Catalog Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Product & SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Cost Price</th>
                <th className="py-3 px-4 text-right">Selling Price</th>
                <th className="py-3 px-4 text-right">Stock Level</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Package className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-medium text-slate-600">No products match your criteria</p>
                    <p className="text-xs text-slate-400 mt-1">Try resetting the search or category filters</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const expiring = isExpiringSoon(p.expiryDate);
                  const marginPercent =
                    p.sellingPrice > 0 ? (((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100).toFixed(1) : '0';

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Name & SKU */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{p.name}</div>
                        <div className="text-xs text-slate-400 flex items-center space-x-2 mt-0.5">
                          <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px] text-slate-600">
                            {p.sku}
                          </span>
                          {p.barcode && <span>• Barcode: {p.barcode}</span>}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-lg font-medium">
                          {p.categoryName}
                        </span>
                      </td>

                      {/* Cost Price */}
                      <td className="py-3.5 px-4 text-right font-medium text-slate-600">
                        ₹{p.costPrice.toFixed(2)}
                      </td>

                      {/* Selling Price & Margin */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-bold text-slate-900">₹{p.sellingPrice.toFixed(2)}</div>
                        <div className="text-[11px] text-emerald-600 font-medium">
                          {marginPercent}% margin
                        </div>
                      </td>

                      {/* Stock Quantity */}
                      <td className="py-3.5 px-4 text-right">
                        <div
                          className={`font-bold ${
                            p.stockQuantity === 0
                              ? 'text-rose-600'
                              : p.stockQuantity <= p.minStockLevel
                              ? 'text-amber-600'
                              : 'text-slate-800'
                          }`}
                        >
                          {p.stockQuantity} <span className="text-xs font-normal text-slate-400">{p.unit}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">Min: {p.minStockLevel}</div>
                      </td>

                      {/* Expiry Date */}
                      <td className="py-3.5 px-4">
                        {p.expiryDate ? (
                          <div
                            className={`text-xs font-medium flex items-center space-x-1 ${
                              expiring ? 'text-purple-700 font-semibold' : 'text-slate-600'
                            }`}
                          >
                            {expiring && <Clock className="w-3.5 h-3.5 text-purple-600" />}
                            <span>{new Date(p.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">N/A</span>
                        )}
                        {p.batchNo && <span className="text-[10px] text-slate-400 block">B: {p.batchNo}</span>}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        {p.stockQuantity === 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                            Out of Stock
                          </span>
                        ) : p.stockQuantity <= p.minStockLevel ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                            In Stock
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {hasPermission('inventory.manage_products') && (
                            <>
                              <button
                                onClick={() => handleOpenAdjust(p)}
                                title="Adjust Stock (In/Out/Damage)"
                                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Sliders className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleOpenEdit(p)}
                                title="Edit Product Details"
                                className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200/80 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Showing <strong className="text-slate-800">{filteredProducts.length}</strong> of{' '}
            <strong className="text-slate-800">{products.length}</strong> total products
          </span>
          <span className="text-slate-400">Total Valuation: ₹{metrics.totalValuationCost.toLocaleString('en-IN')} (Cost Price)</span>
        </div>
      </div>

      {/* Modal 1: Add or Edit Product */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">
                {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Inventory SKU'}
              </h3>
              <button
                onClick={() => setIsAddEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Product Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Product Title / Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Fortune Sunlite Refined Sunflower Oil 1L"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* SKU */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    SKU Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    placeholder="e.g. SKU-1049"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Barcode */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Barcode (EAN-13 / UPC)
                  </label>
                  <input
                    type="text"
                    value={formBarcode}
                    onChange={(e) => setFormBarcode(e.target.value)}
                    placeholder="e.g. 8901030383838"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="Groceries">Groceries</option>
                    <option value="Dairy & Bakery">Dairy & Bakery</option>
                    <option value="Snacks & Beverages">Snacks & Beverages</option>
                    <option value="Personal Care">Personal Care</option>
                    <option value="Household Essentials">Household Essentials</option>
                    <option value="Spices & Masalas">Spices & Masalas</option>
                  </select>
                </div>

                {/* Unit of Measurement */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Unit
                  </label>
                  <select
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value as ProductUnit)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="KG">KG (Kilogram)</option>
                    <option value="GM">GM (Gram)</option>
                    <option value="LTR">LTR (Litre)</option>
                    <option value="ML">ML (Millilitre)</option>
                    <option value="PCS">PCS (Pieces)</option>
                    <option value="BOX">BOX (Box)</option>
                    <option value="PACKET">PACKET (Packet)</option>
                  </select>
                </div>

                {/* Cost Price */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Purchase / Cost Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formCostPrice}
                    onChange={(e) => setFormCostPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Selling Price */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Retail Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formSellingPrice}
                    onChange={(e) => setFormSellingPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold text-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Tax Slab */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    GST Rate (%)
                  </label>
                  <select
                    value={formTaxRate}
                    onChange={(e) => setFormTaxRate(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value={0}>0% (Exempt)</option>
                    <option value={5}>5% GST</option>
                    <option value={12}>12% GST</option>
                    <option value={18}>18% GST</option>
                    <option value={28}>28% GST</option>
                  </select>
                </div>

                {/* Current Stock */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Current Stock Quantity
                  </label>
                  <input
                    type="number"
                    required
                    value={formStockQty}
                    onChange={(e) => setFormStockQty(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Min Stock Level */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Min Stock (Reorder Alert)
                  </label>
                  <input
                    type="number"
                    required
                    value={formMinStock}
                    onChange={(e) => setFormMinStock(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formExpiryDate}
                    onChange={(e) => setFormExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Batch No */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Batch / Lot Number
                  </label>
                  <input
                    type="text"
                    value={formBatchNo}
                    onChange={(e) => setFormBatchNo(e.target.value)}
                    placeholder="e.g. LOT-2026-NOV"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Stock Adjustment */}
      {isAdjustModalOpen && adjustingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Adjust Product Stock</h3>
                <p className="text-xs text-slate-500 mt-0.5">{adjustingProduct.name}</p>
              </div>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} className="p-6 space-y-4">
              {/* Product Info Banner */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between text-sm">
                <div>
                  <span className="text-xs text-slate-500 block">Current Stock</span>
                  <span className="text-base font-bold text-slate-900">
                    {adjustingProduct.stockQuantity} {adjustingProduct.unit}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Cost Valuation</span>
                  <span className="text-sm font-semibold text-slate-700">
                    ₹{(adjustingProduct.stockQuantity * adjustingProduct.costPrice).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Adjustment Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Adjustment Type *
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustType('IN');
                      setAdjustReason('Stock Arrival / Supplier Delivery');
                    }}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      adjustType === 'IN'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    + Stock In (Purchase)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustType('OUT');
                      setAdjustReason('Internal Store Consumption');
                    }}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      adjustType === 'OUT'
                        ? 'bg-amber-50 border-amber-500 text-amber-800 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    - Stock Out (Usage)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustType('DAMAGED');
                      setAdjustReason('Damaged in transit / spillage');
                    }}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      adjustType === 'DAMAGED'
                        ? 'bg-rose-50 border-rose-500 text-rose-800 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Damaged / Broken
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustType('EXPIRED');
                      setAdjustReason('Expired shelf-life disposal');
                    }}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      adjustType === 'EXPIRED'
                        ? 'bg-purple-50 border-purple-500 text-purple-800 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Expired Write-Off
                  </button>
                </div>
              </div>

              {/* Adjustment Quantity */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Quantity to Adjust ({adjustingProduct.unit}) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-base font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <p className="text-xs text-slate-500 mt-1">
                  {adjustType === 'IN' && `New Stock will be: ${adjustingProduct.stockQuantity + Number(adjustQty)} ${adjustingProduct.unit}`}
                  {adjustType !== 'IN' && `New Stock will be: ${Math.max(0, adjustingProduct.stockQuantity - Number(adjustQty))} ${adjustingProduct.unit}`}
                </p>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Reason / Purpose *
                </label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Physical inventory mismatch count"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Notes / PO Reference (Optional)
                </label>
                <textarea
                  rows={2}
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  placeholder="Invoice or Supplier PO #1089..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
