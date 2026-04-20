import { Download, MessageCircle, Printer, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatPrice } from '../../utils/price';
import { useThemeStore } from '../../store/useStore.js';

const storeInfo = {
  name: 'Sports World',
  address: 'Sports World, College Road',
  phone: '+92 30000000',
};

const escapeHtml = (value = '') =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const formatBillDate = (dateValue) => {
  if (!dateValue) {
    return new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  return new Date(dateValue).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const generateBillNumber = (sale) => {
  const saleDate = new Date(sale?.saleDate || sale?.createdAt || Date.now());
  const dateCode = saleDate.toISOString().slice(0, 10).replaceAll('-', '');
  const token = String(sale?._id || sale?.createdAt || Date.now()).slice(-6).toUpperCase();

  return `KS-OFF-${dateCode}-${token}`;
};

const getBillTotals = (sale) => {
  const subtotal = Number(sale?.totalSale) || 0;
  const pendingAmount = Math.max(Number(sale?.pendingAmount) || 0, 0);
  const paidAmount = sale?.receivedAmount !== undefined
    ? Number(sale.receivedAmount) || 0
    : Math.max(subtotal - pendingAmount, 0);

  return {
    subtotal,
    pendingAmount,
    paidAmount,
  };
};

const buildPrintableHtml = (sale) => {
  const billNumber = generateBillNumber(sale);
  const billDate = formatBillDate(sale?.saleDate || sale?.createdAt);
  const productName = sale?.productName || sale?.product?.name || 'Offline Sale Item';
  const quantity = Number(sale?.quantitySold) || 0;
  const unitPrice = Number(sale?.salePricePerItem) || 0;
  const lineTotal = Number(sale?.totalSale) || quantity * unitPrice;
  const { subtotal, paidAmount, pendingAmount } = getBillTotals(sale);

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(billNumber)}</title>
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        background: #f4f4f5;
        color: #0f172a;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      .sheet {
        max-width: 860px;
        margin: 24px auto;
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 24px;
        padding: 32px;
      }
      .top {
        display: flex;
        justify-content: space-between;
        gap: 24px;
        border-bottom: 2px solid #111827;
        padding-bottom: 20px;
      }
      .brand {
        font-size: 34px;
        font-weight: 900;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .meta {
        text-align: right;
        font-size: 14px;
        line-height: 1.8;
      }
      .section {
        margin-top: 24px;
        display: grid;
        grid-template-columns: 1.5fr 1fr;
        gap: 24px;
      }
      .label {
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        color: #64748b;
      }
      .value {
        margin-top: 8px;
        font-size: 16px;
        font-weight: 700;
        color: #0f172a;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 28px;
      }
      th, td {
        border: 1px solid #d4d4d8;
        padding: 14px 12px;
        font-size: 14px;
      }
      th {
        background: #f8fafc;
        text-align: left;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: #475569;
      }
      .right { text-align: right; }
      .summary {
        margin-top: 24px;
        margin-left: auto;
        width: min(360px, 100%);
        border: 1px solid #d4d4d8;
        border-radius: 18px;
        overflow: hidden;
      }
      .summary-row {
        display: flex;
        justify-content: space-between;
        padding: 14px 18px;
        border-bottom: 1px solid #e5e7eb;
        font-size: 14px;
        font-weight: 700;
      }
      .summary-row:last-child { border-bottom: 0; }
      .grand {
        background: #111827;
        color: #ffffff;
      }
      .footer {
        margin-top: 36px;
        text-align: center;
        font-size: 13px;
        font-weight: 700;
        color: #334155;
      }
      @media print {
        body { background: #ffffff; }
        .sheet {
          margin: 0;
          max-width: none;
          border: 0;
          border-radius: 0;
        }
      }
    </style>
  </head>
  <body>
    <div class="sheet">
      <div class="top">
        <div>
          <div class="brand">${escapeHtml(storeInfo.name)}</div>
          <div class="value">${escapeHtml(storeInfo.address)}</div>
          <div class="value">${escapeHtml(storeInfo.phone)}</div>
        </div>
        <div class="meta">
          <div><strong>Bill No:</strong> ${escapeHtml(billNumber)}</div>
          <div><strong>Date:</strong> ${escapeHtml(billDate)}</div>
          <div><strong>Customer:</strong> ${escapeHtml(sale?.customerName || 'Walk-in Customer')}</div>
        </div>
      </div>

      <div class="section">
        <div>
          <div class="label">Customer Name</div>
          <div class="value">${escapeHtml(sale?.customerName || 'Walk-in Customer')}</div>
        </div>
        <div>
          <div class="label">Payment Mode</div>
          <div class="value">${escapeHtml(sale?.paymentMode || 'Cash')}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Product Name</th>
            <th class="right">Quantity</th>
            <th class="right">Price</th>
            <th class="right">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${escapeHtml(productName)}</td>
            <td class="right">${quantity}</td>
            <td class="right">${escapeHtml(formatPrice(unitPrice))}</td>
            <td class="right">${escapeHtml(formatPrice(lineTotal))}</td>
          </tr>
        </tbody>
      </table>

      <div class="summary">
        <div class="summary-row"><span>Subtotal</span><span>${escapeHtml(formatPrice(subtotal))}</span></div>
        <div class="summary-row"><span>Paid Amount</span><span>${escapeHtml(formatPrice(paidAmount))}</span></div>
        <div class="summary-row"><span>Pending Amount</span><span>${escapeHtml(formatPrice(pendingAmount))}</span></div>
        <div class="summary-row grand"><span>Grand Total</span><span>${escapeHtml(formatPrice(subtotal))}</span></div>
      </div>

      <div class="footer">Thank you for shopping with Sports World</div>
    </div>
    <script>
      window.onload = () => {
        window.focus();
      };
    </script>
  </body>
</html>`;
};

const BillModal = ({ sale, onClose }) => {
  const { theme } = useThemeStore();
  const isDarkTheme = theme === 'dark';

  if (!sale) {
    return null;
  }

  const billTheme = isDarkTheme
    ? {
        backdrop: 'fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm',
        shell: 'w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#0f141c] shadow-[0_35px_90px_-30px_rgba(0,0,0,0.95)]',
        header: 'flex flex-col gap-4 border-b border-white/10 p-6 sm:flex-row sm:items-center sm:justify-between',
        body: 'rounded-[2rem] border border-white/10 bg-white/[0.03] p-6',
        innerCard: 'rounded-3xl border border-white/10 bg-[#0d1118] p-5',
        metaCard: 'rounded-3xl border border-primary-500/20 bg-primary-500/10 px-5 py-4 text-left sm:text-right',
        textPrimary: 'text-white',
        textMuted: 'text-slate-400',
        textSubtle: 'text-slate-300',
        buttonSecondary: 'inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-white transition-all hover:border-white/20 hover:bg-white/[0.08]',
        iconButton: 'inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] p-3 text-white transition-all hover:border-white/20 hover:bg-white/[0.08]',
      }
    : {
        backdrop: 'fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm',
        shell: 'w-full max-w-4xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_35px_90px_-30px_rgba(15,23,42,0.18)]',
        header: 'flex flex-col gap-4 border-b border-slate-200 p-6 sm:flex-row sm:items-center sm:justify-between',
        body: 'rounded-[2rem] border border-slate-200 bg-slate-50 p-6',
        innerCard: 'rounded-3xl border border-slate-200 bg-white p-5',
        metaCard: 'rounded-3xl border border-primary-200 bg-primary-50 px-5 py-4 text-left sm:text-right',
        textPrimary: 'text-slate-900',
        textMuted: 'text-slate-500',
        textSubtle: 'text-slate-600',
        buttonSecondary: 'inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50',
        iconButton: 'inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-3 text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50',
      };

  const billNumber = generateBillNumber(sale);
  const billDate = formatBillDate(sale.saleDate || sale.createdAt);
  const productName = sale.productName || sale.product?.name || 'Offline Sale Item';
  const quantity = Number(sale.quantitySold) || 0;
  const unitPrice = Number(sale.salePricePerItem) || 0;
  const lineTotal = Number(sale.totalSale) || quantity * unitPrice;
  const { subtotal, paidAmount, pendingAmount } = getBillTotals(sale);

  const openPrintableBill = () => {
    const printWindow = window.open('', '_blank', 'width=980,height=900,scrollbars=yes,resizable=yes');

    if (!printWindow) {
      toast.error('Please allow popups to print or download the bill');
      return;
    }

    printWindow.document.open();
    printWindow.document.write(buildPrintableHtml(sale));
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.focus();
      window.setTimeout(() => {
        printWindow.print();
      }, 150);
    };
  };

  const handleShareOnWhatsApp = () => {
    const message = `Sports World Offline Sale Bill\nBill No: ${billNumber}\nCustomer: ${sale.customerName || 'Walk-in Customer'}\nTotal: ${formatPrice(subtotal)}\nPaid: ${formatPrice(paidAmount)}\nPending: ${formatPrice(pendingAmount)}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={billTheme.backdrop}>
      <div className={billTheme.shell}>
        <div className={billTheme.header}>
          <div>
            <p className={`text-[11px] font-bold uppercase tracking-[0.28em] ${isDarkTheme ? 'text-primary-300' : 'text-primary-600'}`}>Sports World Invoice</p>
            <h3 className={`mt-2 text-2xl font-black tracking-tight ${billTheme.textPrimary}`}>Offline Sale Bill Preview</h3>
            <p className={`mt-1 text-sm ${billTheme.textMuted}`}>{billNumber}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={openPrintableBill}
              className={billTheme.buttonSecondary}
            >
              <Printer size={14} />
              Print
            </button>
            <button
              type="button"
              onClick={openPrintableBill}
              className="inline-flex items-center gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-amber-200 transition-all hover:bg-amber-500/15"
            >
              <Download size={14} />
              Download PDF
            </button>
            <button
              type="button"
              onClick={handleShareOnWhatsApp}
              className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-emerald-200 transition-all hover:bg-emerald-500/15"
            >
              <MessageCircle size={14} />
              WhatsApp
            </button>
            <button
              type="button"
              onClick={onClose}
              className={billTheme.iconButton}
              aria-label="Close bill preview"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="max-h-[calc(100vh-180px)] overflow-y-auto p-6">
          <div className={billTheme.body}>
            <div className={`flex flex-col gap-5 pb-5 sm:flex-row sm:items-start sm:justify-between ${isDarkTheme ? 'border-b border-white/10' : 'border-b border-slate-200'}`}>
              <div>
                <p className={`text-3xl font-black uppercase tracking-[0.18em] ${billTheme.textPrimary}`}>{storeInfo.name}</p>
                <p className={`mt-3 text-sm font-semibold ${billTheme.textSubtle}`}>{storeInfo.address}</p>
                <p className={`mt-1 text-sm font-semibold ${billTheme.textSubtle}`}>{storeInfo.phone}</p>
              </div>
              <div className={billTheme.metaCard}>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary-200">Bill No</p>
                <p className={`mt-2 text-lg font-black ${billTheme.textPrimary}`}>{billNumber}</p>
                <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.22em] text-primary-200">Date</p>
                <p className={`mt-2 text-sm font-semibold ${billTheme.textPrimary}`}>{billDate}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className={billTheme.innerCard}>
                <p className={`text-[11px] font-bold uppercase tracking-[0.22em] ${billTheme.textMuted}`}>Customer Name</p>
                <p className={`mt-3 text-lg font-black ${billTheme.textPrimary}`}>{sale.customerName || 'Walk-in Customer'}</p>
                <p className={`mt-2 text-sm ${billTheme.textMuted}`}>{sale.notes || 'Thank you for shopping with us.'}</p>
              </div>
              <div className={billTheme.innerCard}>
                <p className={`text-[11px] font-bold uppercase tracking-[0.22em] ${billTheme.textMuted}`}>Payment Mode</p>
                <p className={`mt-3 text-lg font-black ${billTheme.textPrimary}`}>{sale.paymentMode || 'Cash'}</p>
                <p className={`mt-2 text-sm ${billTheme.textMuted}`}>Invoice generated for offline counter sale.</p>
              </div>
            </div>

            <div className={`mt-6 overflow-hidden rounded-[1.5rem] border ${isDarkTheme ? 'border-white/10' : 'border-slate-200'}`}>
              <div className={`grid grid-cols-[1.5fr_0.6fr_0.8fr_0.8fr] gap-3 px-5 py-4 text-[11px] font-bold uppercase tracking-[0.22em] ${isDarkTheme ? 'bg-white/[0.04] text-slate-500' : 'bg-slate-50 text-slate-500'}`}>
                <span>Product Name</span>
                <span className="text-right">Qty</span>
                <span className="text-right">Price</span>
                <span className="text-right">Total</span>
              </div>
              <div className={`grid grid-cols-[1.5fr_0.6fr_0.8fr_0.8fr] gap-3 px-5 py-5 text-sm font-semibold ${isDarkTheme ? 'bg-[#0d1118] text-white' : 'bg-white text-slate-900'}`}>
                <span className="min-w-0">{productName}</span>
                <span className="text-right">{quantity}</span>
                <span className="text-right">{formatPrice(unitPrice)}</span>
                <span className="text-right text-amber-200">{formatPrice(lineTotal)}</span>
              </div>
            </div>

            <div className={`mt-6 ml-auto max-w-sm rounded-[1.5rem] border p-5 ${isDarkTheme ? 'border-white/10 bg-[#0d1118]' : 'border-slate-200 bg-white'}`}>
              <div className={`flex items-center justify-between py-2 text-sm ${billTheme.textSubtle}`}>
                <span>Subtotal</span>
                <span className={`font-bold ${billTheme.textPrimary}`}>{formatPrice(subtotal)}</span>
              </div>
              <div className={`flex items-center justify-between py-2 text-sm ${billTheme.textSubtle}`}>
                <span>Paid Amount</span>
                <span className="font-bold text-emerald-300">{formatPrice(paidAmount)}</span>
              </div>
              <div className={`flex items-center justify-between py-2 text-sm ${billTheme.textSubtle}`}>
                <span>Pending Amount</span>
                <span className="font-bold text-amber-300">{formatPrice(pendingAmount)}</span>
              </div>
              <div className={`mt-3 flex items-center justify-between rounded-2xl px-4 py-4 text-sm font-black ${isDarkTheme ? 'bg-gradient-to-r from-amber-500/15 to-primary-500/10 text-white' : 'bg-gradient-to-r from-amber-50 to-primary-50 text-slate-900'}`}>
                <span>Grand Total</span>
                <span className="text-amber-200">{formatPrice(subtotal)}</span>
              </div>
            </div>

            <p className={`mt-8 text-center text-sm font-bold ${billTheme.textSubtle}`}>
              Thank you for shopping with Sports World. We hope to see you again soon!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillModal;
