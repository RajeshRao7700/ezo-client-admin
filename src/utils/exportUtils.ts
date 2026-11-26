import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { InventoryProduct, SaleTransaction } from '../types';

export class ExportUtils {
  /**
   * Generates a downloadable CSV / Excel file
   */
  public static exportToCsv(filename: string, headers: string[], rows: (string | number)[][]): void {
    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row
          .map((cell) => {
            const str = String(cell ?? '').replace(/"/g, '""');
            return `"${str}"`;
          })
          .join(',')
      ),
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Generates a styled business PDF report
   */
  public static exportToPdf(
    title: string,
    subtitle: string,
    headers: string[],
    data: (string | number)[][],
    summaryStats?: Record<string, string>
  ): void {
    const doc = new jsPDF();

    // Brand Title Header
    doc.setFontSize(18);
    doc.setTextColor(0, 106, 201); // Brand Admin Blue
    doc.text('EZO BILLING - CLIENT ADMIN', 14, 18);

    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text(title, 14, 26);

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`${subtitle} | Generated on ${new Date().toLocaleString()}`, 14, 32);

    let startY = 40;

    // Optional Key Metrics Box
    if (summaryStats) {
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, startY, 182, 16, 2, 2, 'FD');

      let statX = 18;
      doc.setFontSize(8.5);
      Object.entries(summaryStats).forEach(([key, val]) => {
        doc.setTextColor(100, 116, 139);
        doc.text(key, statX, startY + 6);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(val, statX, startY + 12);
        doc.setFont('helvetica', 'normal');
        statX += 45;
      });

      startY += 22;
    }

    // Auto Table
    autoTable(doc, {
      startY,
      head: [headers],
      body: data,
      theme: 'striped',
      headStyles: {
        fillColor: [0, 106, 201],
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 8.5,
        cellPadding: 3,
        textColor: [15, 23, 42],
      },
    });

    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `EZO Client Admin - Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    doc.save(`${title.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.pdf`);
  }

  /**
   * Helper: Export Inventory to CSV
   */
  public static exportInventoryToCsv(products: InventoryProduct[]): void {
    const headers = ['SKU', 'Product Name', 'Category', 'Cost Price', 'Selling Price', 'Current Stock', 'Unit', 'Status', 'Expiry Date'];
    const rows = products.map((p) => [
      p.sku,
      p.name,
      p.categoryName,
      p.costPrice.toFixed(2),
      p.sellingPrice.toFixed(2),
      p.stockQuantity,
      p.unit,
      p.status,
      p.expiryDate || 'N/A',
    ]);
    this.exportToCsv(`Inventory_Stock_Report_${Date.now()}`, headers, rows);
  }

  /**
   * Helper: Export Inventory to PDF
   */
  public static exportInventoryToPdf(products: InventoryProduct[]): void {
    const totalCost = products.reduce((acc, p) => acc + p.stockQuantity * p.costPrice, 0);
    const lowStock = products.filter((p) => p.status === 'LOW_STOCK').length;

    const headers = ['SKU', 'Product Name', 'Category', 'Cost (₹)', 'Sell (₹)', 'Stock', 'Status'];
    const rows = products.map((p) => [
      p.sku,
      p.name,
      p.categoryName,
      p.costPrice.toFixed(2),
      p.sellingPrice.toFixed(2),
      `${p.stockQuantity} ${p.unit}`,
      p.status,
    ]);

    this.exportToPdf(
      'Inventory Stock Valuation Report',
      'Audited active catalog & warehouse stock',
      headers,
      rows,
      {
        'Total SKUs': products.length.toString(),
        'Stock Value (Cost)': `₹${totalCost.toLocaleString('en-IN')}`,
        'Low Stock Items': lowStock.toString(),
      }
    );
  }

  /**
   * Helper: Export Sales to CSV
   */
  public static exportSalesToCsv(sales: SaleTransaction[]): void {
    const headers = ['Invoice #', 'Date & Time', 'Customer', 'Cashier', 'Items', 'Gross Total', 'Discount', 'Tax', 'Net Total', 'Payment Mode', 'Status'];
    const rows = sales.map((s) => [
      s.invoiceNumber,
      s.dateTime,
      s.customerName,
      s.cashierName,
      s.itemCount,
      s.grossTotal.toFixed(2),
      s.discountTotal.toFixed(2),
      s.taxTotal.toFixed(2),
      s.netTotal.toFixed(2),
      s.paymentMethod,
      s.status,
    ]);
    this.exportToCsv(`Sales_Register_${Date.now()}`, headers, rows);
  }

  /**
   * Helper: Export Sales to PDF
   */
  public static exportSalesToPdf(sales: SaleTransaction[]): void {
    const totalRevenue = sales.reduce((acc, s) => acc + s.netTotal, 0);
    const totalProfit = sales.reduce((acc, s) => acc + (s.grossProfit || 0), 0);

    const headers = ['Invoice #', 'Date & Time', 'Customer', 'Cashier', 'Net Total (₹)', 'Mode', 'Status'];
    const rows = sales.map((s) => [
      s.invoiceNumber,
      new Date(s.dateTime).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
      s.customerName,
      s.cashierName,
      `₹${s.netTotal.toFixed(2)}`,
      s.paymentMethod,
      s.status,
    ]);

    this.exportToPdf(
      'Sales Monitoring Register',
      `Monitored store sales transactions (${sales.length} invoices)`,
      headers,
      rows,
      {
        'Total Invoices': sales.length.toString(),
        'Total Revenue': `₹${totalRevenue.toLocaleString('en-IN')}`,
        'Gross Profit': `₹${totalProfit.toLocaleString('en-IN')}`,
      }
    );
  }
}
