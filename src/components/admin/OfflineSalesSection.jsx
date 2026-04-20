import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
  CalendarDays,
  ChartColumn,
  CircleDollarSign,
  Clock3,
  Download,
  FileUp,
  Filter,
  MessageCircle,
  Plus,
  Package,
  Pencil,
  ReceiptText,
  RotateCcw,
  Trash2,
  Wallet,
} from 'lucide-react';
import api from '../../api/axios';
import { formatPrice } from '../../utils/price';
import ConfirmModal from '../common/ConfirmModal';
import BillModal from './BillModal';
import {
  buildInvoiceDataFromSale,
  buildWhatsAppBillMessage,
  formatPhoneForWhatsApp,
} from './billUtils';
import OfflineSaleItemCard from './OfflineSaleItemCard';
import { useThemeStore } from '../../store/useStore.js';
import {
  getPreferredVariant,
  getVariantById,
  getVariantLabel,
  isVariableProduct,
} from '../../utils/productVariant';

const paymentModes = ['Cash', 'Online', 'Pending'];

const getToday = () => new Date().toISOString().slice(0, 10);

const emptySummary = {
  totalSale: 0,
  totalCost: 0,
  totalProfit: 0,
  totalQuantitySold: 0,
};

const emptyPendingSummary = {
  totalPendingAmount: 0,
  totalPendingEntries: 0,
  totalUniqueCustomers: 0,
};

const createEmptyForm = () => ({
  saleDate: getToday(),
  customerName: '',
  customerPhone: '',
  paidAmount: '',
  paymentMode: 'Cash',
  notes: '',
});

const createEmptySaleItem = () => ({
  productId: '',
  variantId: '',
  variantName: '',
  variantSku: '',
  variantAttributes: [],
  productName: '',
  quantity: '1',
  salePrice: '',
  costPrice: '',
  availableStock: null,
  lineTotalSale: 0,
  lineTotalCost: 0,
  lineProfit: 0,
  error: '',
});

const buildSaleItemState = (item, products) => {
  const product = products.find((entry) => entry._id === item.productId) || null;
  const selectedVariant = getVariantById(product, item.variantId) || getPreferredVariant(product);
  const hasVariants = isVariableProduct(product);
  const quantity = Number(item.quantity) || 0;
  const salePrice = Number(item.salePrice || selectedVariant?.price || 0) || 0;
  const costPrice = Number(item.costPrice || selectedVariant?.costPrice || 0) || 0;
  const lineTotalSale = quantity * salePrice;
  const lineTotalCost = quantity * costPrice;
  const availableStock = selectedVariant
    ? Number(selectedVariant.countInStock ?? 0)
    : product
      ? Number(product.countInStock ?? 0)
      : item.availableStock;
  let error = '';

  if (item.productId && !product) {
    error = 'Selected product was not found in inventory';
  } else if (product && quantity > availableStock) {
    error = `Only ${availableStock} unit(s) available in stock`;
  }

  return {
    ...item,
    productId: item.productId || '',
    variantId: selectedVariant?._id || item.variantId || '',
    variantName: selectedVariant?.name || item.variantName || '',
    variantSku: selectedVariant?.sku || item.variantSku || '',
    variantAttributes: Array.isArray(selectedVariant?.attributes)
      ? selectedVariant.attributes
      : Array.isArray(item.variantAttributes)
        ? item.variantAttributes
        : [],
    variantLabel: selectedVariant ? getVariantLabel(selectedVariant) : '',
    hasVariants,
    variantOptions: hasVariants ? product?.variants || [] : [],
    productName: product?.name || item.productName || '',
    quantity: String(item.quantity ?? '1'),
    salePrice: String(item.salePrice ?? selectedVariant?.price ?? ''),
    costPrice: String(item.costPrice ?? selectedVariant?.costPrice ?? ''),
    availableStock,
    lineTotalSale,
    lineTotalCost,
    lineProfit: lineTotalSale - lineTotalCost,
    error,
  };
};

const OfflineSalesSection = () => {
  const { theme } = useThemeStore();
  const isDarkTheme = theme === 'dark';
  const formRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState(emptySummary);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [pendingSummary, setPendingSummary] = useState(emptyPendingSummary);
  const [loadingSales, setLoadingSales] = useState(false);
  const [loadingPending, setLoadingPending] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingSheet, setUploadingSheet] = useState(false);
  const [sheetFile, setSheetFile] = useState(null);
  const [sheetResult, setSheetResult] = useState(null);
  const [editingSaleId, setEditingSaleId] = useState('');
  const [filters, setFilters] = useState({ date: '', month: '', from: '', to: '' });
  const [appliedFilters, setAppliedFilters] = useState({ date: '', month: '', from: '', to: '' });
  const [form, setForm] = useState(createEmptyForm());
  const [saleItems, setSaleItems] = useState([createEmptySaleItem()]);
  const [billPreviewSale, setBillPreviewSale] = useState(null);
  const [selectedSaleNote, setSelectedSaleNote] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const billSummary = useMemo(
    () =>
      saleItems.reduce(
        (totals, item) => ({
          totalItems: totals.totalItems + (Number(item.quantity) || 0),
          totalSale: totals.totalSale + (Number(item.lineTotalSale) || 0),
          totalCost: totals.totalCost + (Number(item.lineTotalCost) || 0),
          totalProfit: totals.totalProfit + (Number(item.lineProfit) || 0),
        }),
        {
          totalItems: 0,
          totalSale: 0,
          totalCost: 0,
          totalProfit: 0,
        }
      ),
    [saleItems]
  );
  const paidAmountValue = useMemo(() => {
    if (form.paidAmount !== '') {
      return Number(form.paidAmount) || 0;
    }

    return form.paymentMode === 'Pending' ? 0 : billSummary.totalSale;
  }, [billSummary.totalSale, form.paidAmount, form.paymentMode]);
  const pendingAmount = useMemo(
    () => Math.max(billSummary.totalSale - paidAmountValue, 0),
    [billSummary.totalSale, paidAmountValue]
  );
  const pendingBalance = useMemo(
    () => sales.reduce((sum, sale) => sum + (Number(sale.pendingAmount) || 0), 0),
    [sales]
  );
  const todayRevenue = useMemo(() => {
    const today = getToday();
    return sales.reduce(
      (sum, sale) =>
        sale.saleDate?.slice(0, 10) === today ? sum + (Number(sale.totalSale) || 0) : sum,
      0
    );
  }, [sales]);
  const todaySalesCount = useMemo(() => {
    const today = getToday();
    return sales.filter((sale) => sale.saleDate?.slice(0, 10) === today).length;
  }, [sales]);

  const resetForm = () => {
    setEditingSaleId('');
    setForm(createEmptyForm());
    setSaleItems([buildSaleItemState(createEmptySaleItem(), products)]);
  };

  const openNoteModal = (sale) => {
    setSelectedSaleNote(sale);
  };

  const closeNoteModal = () => {
    setSelectedSaleNote(null);
  };

  const openDeleteConfirm = (saleId) => {
    setDeleteConfirm(saleId);
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirm(null);
  };

  const loadProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data.products || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load products');
    }
  };

  const loadSales = async (activeFilters = appliedFilters) => {
    setLoadingSales(true);

    try {
      const params = new URLSearchParams();

      if (activeFilters.date) {
        params.set('date', activeFilters.date);
      } else if (activeFilters.month) {
        params.set('month', activeFilters.month);
      } else {
        if (activeFilters.from) {
          params.set('from', activeFilters.from);
        }
        if (activeFilters.to) {
          params.set('to', activeFilters.to);
        }
      }

      const query = params.toString();
      const { data } = await api.get(`/admin-inventory/offline-sales${query ? `?${query}` : ''}`);
      setSales(data.sales || []);
      setSummary(data.summary || emptySummary);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load offline sales');
    } finally {
      setLoadingSales(false);
    }
  };

  const getPendingDateRangeParams = (activeFilters = appliedFilters) => {
    if (activeFilters.date) {
      return {
        fromDate: activeFilters.date,
        toDate: activeFilters.date,
      };
    }

    if (activeFilters.month) {
      const [year, month] = activeFilters.month.split('-').map(Number);

      if (!year || !month) {
        return {};
      }

      const start = `${activeFilters.month}-01`;
      const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
      const end = `${activeFilters.month}-${String(lastDay).padStart(2, '0')}`;

      return {
        fromDate: start,
        toDate: end,
      };
    }

    return {
      ...(activeFilters.from ? { fromDate: activeFilters.from } : {}),
      ...(activeFilters.to ? { toDate: activeFilters.to } : {}),
    };
  };

  const loadPendingPayments = async (activeFilters = appliedFilters) => {
    setLoadingPending(true);

    try {
      const params = new URLSearchParams(getPendingDateRangeParams(activeFilters));
      const query = params.toString();
      const { data } = await api.get(
        `/admin/offline-sales/pending${query ? `?${query}` : ''}`
      );

      setPendingPayments(data.pendingPayments || []);
      setPendingSummary(data.summary || emptyPendingSummary);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load pending payments');
    } finally {
      setLoadingPending(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    setSaleItems((currentItems) =>
      currentItems.map((item) => buildSaleItemState(item, products))
    );
  }, [products]);

  useEffect(() => {
    loadSales(appliedFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFilters]);

  useEffect(() => {
    loadPendingPayments(appliedFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFilters]);

  const handleSaleItemChange = (index, field, value) => {
    setSaleItems((currentItems) =>
      currentItems.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }

        let nextItem = {
          ...item,
          [field]: value,
        };

        if (field === 'productId') {
          const product = products.find((entry) => entry._id === value);
          const preferredVariant = getPreferredVariant(product);
          const isVariable = isVariableProduct(product);
          nextItem = {
            ...nextItem,
            productId: value,
            variantId: isVariable ? String(preferredVariant?._id || '') : '',
            variantName: isVariable ? String(preferredVariant?.name || '') : '',
            variantSku: isVariable ? String(preferredVariant?.sku || '') : '',
            variantAttributes: isVariable && Array.isArray(preferredVariant?.attributes)
              ? preferredVariant.attributes
              : [],
            productName: product?.name || '',
            salePrice:
              preferredVariant?.price !== undefined && preferredVariant?.price !== null
                ? String(preferredVariant.price)
                : product?.price !== undefined && product?.price !== null
                  ? String(product.price)
                : '',
            costPrice:
              preferredVariant?.costPrice !== undefined && preferredVariant?.costPrice !== null
                ? String(preferredVariant.costPrice)
                : product?.costPrice !== undefined && product?.costPrice !== null
                  ? String(product.costPrice)
                : '',
            availableStock: preferredVariant
              ? Number(preferredVariant.countInStock ?? 0)
              : product
                ? Number(product.countInStock ?? 0)
                : null,
          };
        }

        if (field === 'variantId') {
          const product = products.find((entry) => entry._id === nextItem.productId);
          const selectedVariant = getVariantById(product, value);
          nextItem = {
            ...nextItem,
            variantId: String(selectedVariant?._id || ''),
            variantName: String(selectedVariant?.name || ''),
            variantSku: String(selectedVariant?.sku || ''),
            variantAttributes: Array.isArray(selectedVariant?.attributes)
              ? selectedVariant.attributes
              : [],
            salePrice:
              selectedVariant?.price !== undefined && selectedVariant?.price !== null
                ? String(selectedVariant.price)
                : nextItem.salePrice,
            costPrice:
              selectedVariant?.costPrice !== undefined && selectedVariant?.costPrice !== null
                ? String(selectedVariant.costPrice)
                : nextItem.costPrice,
            availableStock:
              selectedVariant?.countInStock !== undefined &&
              selectedVariant?.countInStock !== null
                ? Number(selectedVariant.countInStock)
                : nextItem.availableStock,
          };
        }

        return buildSaleItemState(nextItem, products);
      })
    );
  };

  const addSaleItem = () => {
    setSaleItems((currentItems) => [
      ...currentItems,
      buildSaleItemState(createEmptySaleItem(), products),
    ]);
  };

  const removeSaleItem = (index) => {
    setSaleItems((currentItems) => {
      if (currentItems.length === 1) {
        return currentItems;
      }

      return currentItems.filter((_, itemIndex) => itemIndex !== index);
    });
  };

  const getNormalizedSaleItems = () => {
    const normalizedItems = saleItems.map((item) => buildSaleItemState(item, products));
    setSaleItems(normalizedItems);
    return normalizedItems;
  };

  const validateBillDraft = () => {
    const normalizedItems = getNormalizedSaleItems();

    if (!normalizedItems.length || normalizedItems.every((item) => !item.productId)) {
      toast.error('Add products to create bill');
      return null;
    }

    const invalidItem = normalizedItems.find((item) => !item.productId || item.error);
    if (invalidItem) {
      toast.error(invalidItem.error || 'Please select a product for every bill item');
      return null;
    }

    if (pendingAmount > 0 && !form.customerName.trim()) {
      toast.error('Customer name is required when payment is pending');
      return null;
    }

    if (paidAmountValue > billSummary.totalSale) {
      toast.error('Paid amount cannot be greater than grand total sale');
      return null;
    }

    return normalizedItems;
  };

  const createDraftSaleData = (normalizedItems) => ({
    saleDate: form.saleDate,
    customerName: form.customerName.trim(),
    customerPhone: form.customerPhone.trim(),
    paymentMode: form.paymentMode,
    receivedAmount: paidAmountValue,
    pendingAmount,
    notes: form.notes,
    items: normalizedItems.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      variantId: item.variantId || null,
      variantName: item.variantName || '',
      variantSku: item.variantSku || '',
      variantAttributes: Array.isArray(item.variantAttributes)
        ? item.variantAttributes
        : [],
      quantity: Number(item.quantity) || 0,
      salePrice: Number(item.salePrice) || 0,
      costPrice: Number(item.costPrice) || 0,
      totalSale: Number(item.lineTotalSale) || 0,
      totalCost: Number(item.lineTotalCost) || 0,
      profit: Number(item.lineProfit) || 0,
    })),
    totalSale: billSummary.totalSale,
    totalCost: billSummary.totalCost,
    totalProfit: billSummary.totalProfit,
  });

  const openWhatsAppForInvoice = (invoiceData, rawPhone) => {
    const formattedPhone = formatPhoneForWhatsApp(rawPhone);

    if (!formattedPhone) {
      toast.error('Enter a valid customer mobile number to send the bill on WhatsApp');
      return;
    }

    const message = buildWhatsAppBillMessage(invoiceData);
    window.open(
      `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleSendBillViaWhatsApp = () => {
    const normalizedItems = validateBillDraft();

    if (!normalizedItems) {
      return;
    }

    const draftSale = createDraftSaleData(normalizedItems);
    const invoiceData = buildInvoiceDataFromSale(draftSale);
    openWhatsAppForInvoice(invoiceData, form.customerPhone);
  };

  const handleSubmit = async (event, shouldOpenBill = false) => {
    event.preventDefault();

    const normalizedItems = validateBillDraft();

    if (!normalizedItems) {
      return;
    }

    setSubmitting(true);

    const draftSale = createDraftSaleData(normalizedItems);
    const payload = {
      saleDate: draftSale.saleDate,
      customerName: draftSale.customerName,
      paymentMode: draftSale.paymentMode,
      paidAmount: draftSale.receivedAmount,
      customerPhone: draftSale.customerPhone,
      pendingAmount: draftSale.pendingAmount,
      notes: draftSale.notes,
      items: draftSale.items,
      totalSale: draftSale.totalSale,
      totalCost: draftSale.totalCost,
      totalProfit: draftSale.totalProfit,
    };

    try {
      let savedSale = null;

      if (editingSaleId) {
        const { data } = await api.put(`/admin-inventory/offline-sales/${editingSaleId}`, payload);
        savedSale = data.sale || null;
        toast.success('Offline sale updated');
      } else {
        const { data } = await api.post('/admin-inventory/offline-sales', payload);
        savedSale = data.sale || null;
        toast.success('Offline sale saved');
      }

      if (shouldOpenBill && savedSale) {
        setBillPreviewSale({
          ...savedSale,
          customerPhone: draftSale.customerPhone,
        });
      }

      resetForm();
      await Promise.all([loadProducts(), loadSales(appliedFilters), loadPendingPayments(appliedFilters)]);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          (editingSaleId ? 'Failed to update offline sale' : 'Failed to save offline sale')
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (sale) => {
    const editableItems = Array.isArray(sale.items) && sale.items.length > 0
      ? sale.items.map((item) =>
          buildSaleItemState(
            {
              productId: item.product?._id || item.product || '',
              variantId: item.variantId ? String(item.variantId) : '',
              variantName: item.variantName || '',
              variantSku: item.variantSku || '',
              variantAttributes: Array.isArray(item.variantAttributes)
                ? item.variantAttributes
                : [],
              productName: item.productName || '',
              quantity: String(item.quantity ?? 1),
              salePrice: String(item.salePrice ?? ''),
              costPrice: String(item.costPrice ?? ''),
              availableStock: null,
            },
            products
          )
        )
      : [
          buildSaleItemState(
            {
              productId: sale.product?._id || sale.product || '',
              variantId: sale.variantId ? String(sale.variantId) : '',
              variantName: sale.variantName || '',
              variantSku: sale.variantSku || '',
              variantAttributes: Array.isArray(sale.variantAttributes)
                ? sale.variantAttributes
                : [],
              productName: sale.productName || '',
              quantity: String(sale.quantitySold ?? 1),
              salePrice: String(sale.salePricePerItem ?? ''),
              costPrice: String(sale.costPricePerItem ?? ''),
              availableStock: null,
            },
            products
          ),
        ];

    setEditingSaleId(sale._id);
    setForm({
      saleDate: sale.saleDate?.slice(0, 10) || getToday(),
      customerName: sale.customerName || '',
      customerPhone: sale.customerPhone || '',
      paidAmount: String(
        sale.receivedAmount ?? Math.max((Number(sale.totalSale) || 0) - (Number(sale.pendingAmount) || 0), 0)
      ),
      paymentMode: sale.paymentMode || 'Cash',
      notes: sale.notes || '',
    });
    setSaleItems(editableItems);

    window.requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const handleDelete = async (saleId) => {
    openDeleteConfirm(saleId);
  };

  const handleSheetUpload = async (event) => {
    event.preventDefault();

    if (!sheetFile) {
      toast.error('Please choose an offline sales sheet first');
      return;
    }

    const formData = new FormData();
    formData.append('offlineSalesSheet', sheetFile);
    setUploadingSheet(true);

    try {
      const { data } = await api.post('/admin-inventory/offline-sales/upload', formData);
      setSheetResult(data);
      toast.success(data.message || 'Offline sales sheet uploaded');
      await Promise.all([loadProducts(), loadSales(appliedFilters), loadPendingPayments(appliedFilters)]);
    } catch (error) {
      setSheetResult(null);
      toast.error(error.response?.data?.message || 'Failed to upload offline sales sheet');
    } finally {
      setUploadingSheet(false);
    }
  };

  const applyFilters = () => {
    setAppliedFilters(filters);
  };

  const clearFilters = () => {
    const cleared = { date: '', month: '', from: '', to: '' };
    setFilters(cleared);
    setAppliedFilters(cleared);
  };

  const offlineTheme = isDarkTheme
    ? {
        section: 'rounded-[2rem] border border-white/10 bg-[#10151d]/95 p-6 shadow-[0_28px_80px_-42px_rgba(0,0,0,0.95)] backdrop-blur-xl md:p-8',
        heroCard: 'rounded-[1.5rem] border border-white/10 bg-white/[0.04] px-5 py-4',
        statCard: 'relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#151b24] p-5 shadow-[0_22px_60px_-36px_rgba(0,0,0,0.95)]',
        softCard: 'rounded-[1.3rem] border border-white/10 bg-[#151b24] p-4',
        panel: 'rounded-[1.75rem] border border-white/10 bg-[#151b24]/80 p-6 shadow-[0_20px_50px_-34px_rgba(0,0,0,0.95)]',
        input: 'h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-primary-500/40',
        select: 'h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition-all focus:border-primary-500/40',
        textarea: 'w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-primary-500/40',
        label: 'text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500',
        heading: 'text-white',
        subtext: 'text-slate-400',
        tableWrapper: 'overflow-x-auto rounded-[1.75rem] border border-white/10 bg-[#151b24]',
        tableHeadRow: 'bg-white/[0.02] text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500',
        tableCellMuted: 'text-slate-400',
        buttonPrimary: 'inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-5 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white shadow-[0_18px_40px_-22px_rgba(220,38,38,0.75)] transition-all hover:bg-primary-700',
        buttonSecondary: 'inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold uppercase tracking-[0.16em] text-slate-200 transition-all hover:border-white/20 hover:bg-white/[0.06]',
        buttonGhost: 'inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-200 transition-all hover:border-white/20 hover:bg-white/[0.06]',
        chipSurface: 'rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400',
        modalBackdrop: 'fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm',
        modalShell: 'w-full max-w-lg rounded-[2rem] border border-white/10 bg-[#10151d] p-6 shadow-[0_32px_100px_-40px_rgba(0,0,0,1)]',
        noteCard: 'rounded-2xl border border-white/10 bg-white/[0.03] p-4',
        noteText: 'text-slate-200',
        iconBox: 'flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-[0_18px_38px_-20px_rgba(220,38,38,0.8)]',
        outlineCard: 'rounded-[1.5rem] border border-white/10 bg-[#151b24] p-5 shadow-[0_20px_50px_-34px_rgba(0,0,0,0.95)]',
      }
    : {
        section: 'rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_28px_80px_-42px_rgba(15,23,42,0.18)] backdrop-blur-xl md:p-8',
        heroCard: 'rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-4',
        statCard: 'relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 shadow-[0_22px_60px_-36px_rgba(15,23,42,0.1)]',
        softCard: 'rounded-[1.3rem] border border-slate-200 bg-slate-50 p-4',
        panel: 'rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 shadow-[0_20px_50px_-34px_rgba(15,23,42,0.1)]',
        input: 'h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-primary-500/40',
        select: 'h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition-all focus:border-primary-500/40',
        textarea: 'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-primary-500/40',
        label: 'text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500',
        heading: 'text-slate-900',
        subtext: 'text-slate-600',
        tableWrapper: 'overflow-x-auto rounded-[1.75rem] border border-slate-200 bg-white',
        tableHeadRow: 'bg-slate-50 text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500',
        tableCellMuted: 'text-slate-500',
        buttonPrimary: 'inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-5 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white shadow-[0_18px_40px_-22px_rgba(220,38,38,0.75)] transition-all hover:bg-primary-700',
        buttonSecondary: 'inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.16em] text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50',
        buttonGhost: 'inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50',
        chipSurface: 'rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500',
        modalBackdrop: 'fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm',
        modalShell: 'w-full max-w-lg rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_32px_100px_-40px_rgba(15,23,42,0.22)]',
        noteCard: 'rounded-2xl border border-slate-200 bg-slate-50 p-4',
        noteText: 'text-slate-600',
        iconBox: 'flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-[0_18px_38px_-20px_rgba(220,38,38,0.8)]',
        outlineCard: 'rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 shadow-[0_20px_50px_-34px_rgba(15,23,42,0.1)]',
      };

  return (
    <div className="space-y-8">
      <section className={`relative overflow-hidden ${offlineTheme.section}`}>
        <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top_left,rgba(220,38,38,0.18),transparent_52%)]"></div>
        <div className="relative space-y-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className={`text-[11px] font-bold uppercase tracking-[0.28em] ${offlineTheme.heading}`}>Sports World Sales Console</p>
              <h2 className={`mt-3 text-3xl font-black uppercase tracking-tight md:text-4xl ${offlineTheme.heading}`}>Offline Sales Tracker</h2>
              <p className={`mt-3 max-w-2xl text-sm leading-7 ${offlineTheme.subtext}`}>
                Monitor premium counter sales, protect margin visibility, and keep pending collections clearly tracked in one place.
              </p>
            </div>
            <div className={offlineTheme.heroCard}>
              <p className={offlineTheme.label}>Today's Tracking</p>
              <p className={`mt-2 text-xl font-black ${offlineTheme.heading}`}>{todaySalesCount} entries</p>
              <p className={`mt-1 text-sm ${offlineTheme.subtext}`}>{formatPrice(todayRevenue)} booked today</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Today's Revenue",
                value: formatPrice(todayRevenue),
                note: `${todaySalesCount} sales today`,
                icon: CircleDollarSign,
                tone: 'text-emerald-300 bg-emerald-500/15',
              },
              {
                label: 'Total Units Sold',
                value: summary.totalQuantitySold || 0,
                note: `${sales.length} records in current view`,
                icon: Package,
                tone: 'text-sky-300 bg-sky-500/15',
              },
              {
                label: 'Total Profit',
                value: formatPrice(summary.totalProfit || 0),
                note: 'Based on current filtered sales',
                icon: ChartColumn,
                tone: 'text-primary-300 bg-primary-500/15',
              },
              {
                label: 'Pending Balance',
                value: formatPrice(pendingBalance),
                note: `${sales.filter((sale) => Number(sale.pendingAmount) > 0).length} pending entries`,
                icon: Wallet,
                tone: 'text-amber-300 bg-amber-500/15',
              },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className={offlineTheme.statCard}>
                  <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-white/5 blur-3xl"></div>
                  <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${card.tone}`}>
                    <Icon size={20} />
                  </div>
                  <p className={`mt-4 text-[11px] font-bold uppercase tracking-[0.24em] ${offlineTheme.label}`}>{card.label}</p>
                  <p className={`mt-3 text-3xl font-black tracking-tight ${offlineTheme.heading}`}>{card.value}</p>
                  <p className={`mt-2 text-sm ${offlineTheme.subtext}`}>{card.note}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section
        ref={formRef}
        className={`overflow-hidden ${offlineTheme.section}`}
      >
        <div>
          <p className={`text-[11px] font-bold uppercase tracking-[0.24em] ${offlineTheme.heading}`}>Import Sheet</p>
          <h3 className={`mt-2 text-2xl font-black tracking-tight ${offlineTheme.heading}`}>Upload Offline Sales Sheet</h3>
          <p className={`mt-2 text-sm ${offlineTheme.subtext}`}>
            Upload .xlsx or .csv with columns: Date, Product Name, Quantity Sold, Sale Price Per Item, Cost Price Per Item, Payment Mode, Notes
          </p>
        </div>

        <form onSubmit={handleSheetUpload} className="space-y-5">
          <div className="space-y-2">
            <label className={offlineTheme.label}>Offline Sales Sheet</label>
            <input
              type="file"
              accept=".xlsx,.csv"
              onChange={(event) => setSheetFile(event.target.files?.[0] || null)}
              className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none file:mr-4 file:rounded-xl file:border-0 file:bg-primary-600 file:px-4 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-[0.16em] file:text-white ${isDarkTheme ? 'border-white/10 bg-white/[0.04] text-white' : 'border-slate-200 bg-white text-slate-900'}`}
            />
            <p className={`text-xs ${offlineTheme.label}`}>
              Example row: 2026-03-31, LQ Shirt, 2, 2400, 2000, Cash, Counter sale
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={uploadingSheet}
              className={offlineTheme.buttonSecondary}
            >
              <FileUp size={16} />
              {uploadingSheet ? 'Uploading...' : 'Upload Sheet'}
            </button>
          </div>
        </form>

        {sheetResult && (
          <div className="space-y-6">
            <div className={`rounded-2xl border px-4 py-3 ${isDarkTheme ? 'border-emerald-500/20 bg-emerald-500/10' : 'border-emerald-200 bg-emerald-50'}`}>
              <p className={`text-sm font-semibold ${isDarkTheme ? 'text-emerald-300' : 'text-emerald-700'}`}>{sheetResult.message}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                ['Total Rows Processed', sheetResult.totalRowsProcessed ?? 0],
                ['Imported Successfully', sheetResult.importedSuccessfully ?? 0],
                ['Skipped / Failed', sheetResult.skippedRows ?? 0],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className={offlineTheme.softCard}
                >
                  <p className={offlineTheme.label}>{label}</p>
                  <p className={`mt-3 text-2xl font-black ${offlineTheme.heading}`}>{value}</p>
                </div>
              ))}
            </div>

            {Array.isArray(sheetResult.errors) && sheetResult.errors.length > 0 && (
              <div className="rounded-[1.3rem] border border-amber-500/20 bg-amber-500/10 p-4">
                <p className="mb-3 text-sm font-bold text-amber-300">Skipped Rows</p>
                <div className="space-y-2">
                  {sheetResult.errors.map((item) => (
                    <p key={item} className="text-sm text-amber-200">
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      <section className={`overflow-hidden ${offlineTheme.section}`}>
        <div className="flex pb-[20px] flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className={`text-[11px] font-bold uppercase tracking-[0.24em] ${offlineTheme.heading}`}>Recovery Desk</p>
            <h3 className={`mt-2 text-2xl font-black tracking-tight ${offlineTheme.heading}`}>Pending Payments</h3>
            <p className={`mt-2 text-sm ${offlineTheme.subtext}`}>
              Track unpaid counter entries from the current filter window without leaving the Offline Sales page.
            </p>
          </div>
          <div className={offlineTheme.chipSurface}>
            {loadingPending ? 'Loading pending data...' : `${pendingSummary.totalPendingEntries || 0} pending entries`}
          </div>
        </div>

        <div className="grid pb-[20px] grid-cols-1 gap-5 md:grid-cols-3">
          {[
            ['Total Pending Amount', formatPrice(pendingSummary.totalPendingAmount || 0), 'text-amber-300'],
            ['Pending Entries', pendingSummary.totalPendingEntries || 0, ''],
            ['Unique Customers', pendingSummary.totalUniqueCustomers || 0, 'text-sky-300'],
          ].map(([label, value, tone]) => (
            <div
              key={label}
              className={offlineTheme.softCard}
            >
              <p className={offlineTheme.label}>{label}</p>
              <p className={`mt-3 text-2xl font-black ${tone}`}>{value}</p>
            </div>
          ))}
        </div>

        <div className={offlineTheme.tableWrapper}>
          <table className="min-w-full text-left">
            <thead>
              <tr className={offlineTheme.tableHeadRow}>
                <th className="px-6 py-5">Date</th>
                <th className="px-6 py-5">Customer Name</th>
                <th className="px-6 py-5">Product Name</th>
                <th className="px-6 py-5 text-center">Total Sale</th>
                <th className="px-6 py-5 text-center">Paid Amount</th>
                <th className="px-6 py-5 text-center">Pending Amount</th>
                <th className="px-6 py-5 text-center">Payment Mode</th>
                <th className="px-6 py-5">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loadingPending ? (
                <tr>
                  <td colSpan="8" className={`px-6 py-12 text-center text-sm ${offlineTheme.tableCellMuted}`}>
                    Loading pending payments...
                  </td>
                </tr>
              ) : pendingPayments.length === 0 ? (
                <tr>
                  <td colSpan="8" className={`px-6 py-12 text-center text-sm ${offlineTheme.tableCellMuted}`}>
                    No pending payments found
                  </td>
                </tr>
              ) : (
                pendingPayments.map((sale) => (
                  <tr key={sale._id} className="bg-amber-500/[0.04] transition-colors hover:bg-amber-500/[0.08]">
                    <td className={`px-6 py-5 text-sm ${offlineTheme.subtext}`}>{sale.date?.slice(0, 10) || '-'}</td>
                    <td className={`px-6 py-5 text-sm font-semibold ${offlineTheme.heading}`}>{sale.customerName || '-'}</td>
                    <td className={`px-6 py-5 text-sm ${offlineTheme.subtext}`}>{sale.productName || '-'}</td>
                    <td className={`px-6 py-5 text-center text-sm font-semibold ${offlineTheme.heading}`}>{formatPrice(sale.totalSale)}</td>
                    <td className="px-6 py-5 text-center text-sm font-semibold text-emerald-300">{formatPrice(sale.paidAmount)}</td>
                    <td className="px-6 py-5 text-center text-sm font-bold text-red-300">{formatPrice(sale.pendingAmount)}</td>
                    <td className="px-6 py-5 text-center">
                      <span className="inline-flex rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-amber-300">
                        {sale.paymentMode || 'Pending'}
                      </span>
                    </td>
                    <td className={`px-6 py-5 text-sm ${offlineTheme.subtext}`}>{sale.notes || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className={`overflow-hidden ${offlineTheme.section}`}>
        <div>
          <p className={`text-[11px] font-bold uppercase tracking-[0.24em] ${offlineTheme.heading}`}>
            {editingSaleId ? 'Edit Bill' : 'Record New Bill'}
          </p>
          <h3 className={`mt-2 text-2xl font-black tracking-tight ${offlineTheme.heading}`}>
            Offline Sales Billing Console
          </h3>
          <p className={`mt-2 text-sm ${offlineTheme.subtext}`}>
            Build a multi-product counter invoice with live margin, paid amount, and pending balance tracking.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
          <div className="space-y-6">
            <div className={offlineTheme.panel}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className={`text-[11px] font-bold uppercase tracking-[0.24em] ${offlineTheme.heading}`}>Sale Details</p>
                  <h4 className={`mt-2 text-xl font-black tracking-tight ${offlineTheme.heading}`}>Customer and Payment</h4>
                </div>
                <div className={offlineTheme.chipSurface}>
                  {form.saleDate}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className={offlineTheme.label}>Sale Date</label>
                  <input
                    type="date"
                    value={form.saleDate}
                    onChange={(event) => setForm((current) => ({ ...current, saleDate: event.target.value }))}
                    className={offlineTheme.input}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className={offlineTheme.label}>Payment Mode</label>
                  <select
                    value={form.paymentMode}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        paymentMode: event.target.value,
                        paidAmount: event.target.value === 'Pending' ? '0' : current.paidAmount,
                      }))
                    }
                    className={offlineTheme.select}
                    required
                  >
                    {paymentModes.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className={offlineTheme.label}>
                    Customer Name {pendingAmount > 0 ? <span className="text-primary-300">(Required)</span> : null}
                  </label>
                  <input
                    type="text"
                    value={form.customerName}
                    onChange={(event) => setForm((current) => ({ ...current, customerName: event.target.value }))}
                    className={`h-12 w-full rounded-2xl border px-4 text-sm outline-none transition-all ${
                      pendingAmount > 0
                        ? 'border-primary-500/30 bg-primary-500/10 focus:border-primary-500/50'
                        : 'border-white/10 bg-white/[0.04] focus:border-primary-500/40'
                    }`}
                    placeholder={pendingAmount > 0 ? 'Required for credit bill' : 'Walk-in customer'}
                    required={pendingAmount > 0}
                  />
                </div>

                <div className="space-y-2">
                  <label className={offlineTheme.label}>Customer Mobile Number</label>
                  <input
                    type="tel"
                    value={form.customerPhone}
                    onChange={(event) => setForm((current) => ({ ...current, customerPhone: event.target.value }))}
                    className={offlineTheme.input}
                    placeholder="9876543210 or +91 9876543210"
                    inputMode="tel"
                  />
                </div>

                <div className="space-y-2">
                  <label className={offlineTheme.label}>Paid Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                      Rs.
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.paidAmount}
                      onChange={(event) => setForm((current) => ({ ...current, paidAmount: event.target.value }))}
                      className={`${offlineTheme.input} pl-14`}
                      placeholder={formatPrice(form.paymentMode === 'Pending' ? 0 : billSummary.totalSale)}
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className={offlineTheme.label}>Notes</label>
                  <textarea
                    rows="3"
                    value={form.notes}
                    onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                    className={offlineTheme.textarea}
                    placeholder="Optional invoice note or delivery instruction"
                  />
                </div>
              </div>
            </div>

            <div className={offlineTheme.panel}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className={`text-[11px] font-bold uppercase tracking-[0.24em] ${offlineTheme.heading}`}>Products Card</p>
                  <h4 className={`mt-2 text-xl font-black tracking-tight ${offlineTheme.heading}`}>Bill Line Items</h4>
                  <p className={`mt-2 text-sm ${offlineTheme.subtext}`}>
                    {saleItems.length ? 'Each product row calculates sale, cost, and profit in real time.' : 'Add products to create bill'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addSaleItem}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-primary-500/20 bg-primary-500/10 px-5 py-3 text-xs font-black uppercase tracking-[0.16em] transition-all hover:bg-primary-500/15"
                >
                  <Plus size={16} />
                  Add Product
                </button>
              </div>

              <div className="mt-6 space-y-4">
                {saleItems.map((item, index) => (
                  <OfflineSaleItemCard
                    key={`${item.productId || 'item'}-${index}`}
                    item={item}
                    index={index}
                    products={products}
                    canRemove={saleItems.length > 1}
                    onChange={(field, value) => handleSaleItemChange(index, field, value)}
                    onRemove={() => removeSaleItem(index)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className={offlineTheme.panel}>
              <p className={`text-[11px] font-bold uppercase tracking-[0.24em] ${offlineTheme.heading}`}>Summary Card</p>
              <h4 className={`mt-2 text-xl font-black tracking-tight ${offlineTheme.heading}`}>Invoice Totals</h4>

              <div className="mt-6 space-y-3">
                {[
                  ['Total Items', billSummary.totalItems],
                  ['Grand Total Sale', formatPrice(billSummary.totalSale)],
                  ['Grand Total Cost', formatPrice(billSummary.totalCost)],
                  ['Total Profit', formatPrice(billSummary.totalProfit)],
                  ['Paid Amount', formatPrice(paidAmountValue)],
                  ['Pending Amount', formatPrice(pendingAmount)],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm ${isDarkTheme ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'}`}
                  >
                    <span className={`font-bold ${offlineTheme.subtext}`}>{label}</span>
                    <span className={`font-black ${label === 'Pending Amount' && pendingAmount > 0 ? 'text-amber-300' : label === 'Total Profit' ? 'text-emerald-300' : offlineTheme.heading}`}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className={`rounded-[1.75rem] border p-6 shadow-[0_20px_50px_-34px_rgba(0,0,0,0.95)] ${isDarkTheme ? 'border-primary-500/20 bg-gradient-to-br from-primary-600/10 via-[#151b24] to-[#151b24]' : 'border-primary-200 bg-gradient-to-br from-primary-50 via-white to-slate-50'}`}>
              <p className={`text-[11px] font-bold uppercase tracking-[0.24em] ${offlineTheme.heading}`}>Action Card</p>
              <h4 className={`mt-2 text-xl font-black tracking-tight ${offlineTheme.heading}`}>Finalize Bill</h4>

              <div className="mt-6 space-y-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`${offlineTheme.buttonPrimary}  w-full flex justify-center`}
                >
                  <ReceiptText size={16} />
                  {submitting ? 'Saving...' : editingSaleId ? 'Update Sale' : 'Save Sale'}
                </button>
                <button
                  type="button"
                  onClick={(event) => handleSubmit(event, true)}
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-6 py-4 text-sm font-black uppercase tracking-[0.18em] dark:text-amber-200 transition-all hover:bg-amber-500/15 disabled:opacity-60"
                >
                  <ReceiptText size={16} />
                  Save and Generate Bill
                </button>
                <button
                  type="button"
                  onClick={handleSendBillViaWhatsApp}
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-6 py-4 text-sm font-black uppercase tracking-[0.18em] dark:text-emerald-200 transition-all hover:bg-emerald-500/15 disabled:opacity-60"
                >
                  <MessageCircle size={16} />
                  Send via WhatsApp
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className={offlineTheme.buttonSecondary}
                >
                  <RotateCcw size={16} />
                  {editingSaleId ? 'Reset Bill and Exit Edit' : 'Reset Bill'}
                </button>
              </div>

              <p className={`mt-5 rounded-2xl px-4 py-3 text-xs leading-6 ${isDarkTheme ? 'border border-white/10 bg-white/[0.03] text-slate-400' : 'border border-slate-200 bg-slate-50 text-slate-600'}`}>
                Pending amount is auto-calculated from grand total minus paid amount. Customer name is required whenever a balance remains.
              </p>
            </div>
          </div>
        </form>
      </section>

      <section className={`overflow-hidden ${offlineTheme.section}`}> 
        <div className="flex flex-col pb-[20px] md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className={`text-[11px] font-bold uppercase tracking-[0.24em] ${offlineTheme.heading}`}>Sales History Log</p>
            <h3 className={`mt-2 text-2xl font-black tracking-tight ${offlineTheme.heading}`}>Filters and Summary</h3>
            <p className={`mt-2 text-sm ${offlineTheme.subtext}`}>
              Filter by single date, month, or custom range.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={applyFilters}
              className={offlineTheme.buttonPrimary}
            >
              <Filter size={16} />
              Apply Filters
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className={offlineTheme.buttonSecondary}
            >
              <Download size={16} />
              Clear
            </button>
          </div>
        </div>

        <div className="grid pb-[20px] grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className={offlineTheme.label}>Single Date</label>
            <input
              type="date"
              value={filters.date}
              onChange={(event) => setFilters((current) => ({ ...current, date: event.target.value, month: '' }))}
              className={offlineTheme.input}
            />
          </div>
          <div className="space-y-2">
            <label className={offlineTheme.label}>Month</label>
            <input
              type="month"
              value={filters.month}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  date: '',
                  month: event.target.value,
                  from: '',
                  to: '',
                }))
              }
              className={offlineTheme.input}
            />
          </div>
          <div className="space-y-2">
            <label className={offlineTheme.label}>From</label>
            <input
              type="date"
              value={filters.from}
              onChange={(event) =>
                setFilters((current) => ({ ...current, date: '', month: '', from: event.target.value }))
              }
              className={offlineTheme.input}
            />
          </div>
          <div className="space-y-2">
            <label className={offlineTheme.label}>To</label>
            <input
              type="date"
              value={filters.to}
              onChange={(event) =>
                setFilters((current) => ({ ...current, date: '', month: '', to: event.target.value }))
              }
              className={offlineTheme.input}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {[
            ['Total Sale', formatPrice(summary.totalSale || 0)],
            ['Total Cost', formatPrice(summary.totalCost || 0)],
            ['Total Profit', formatPrice(summary.totalProfit || 0)],
            ['Total Quantity Sold', summary.totalQuantitySold || 0],
          ].map(([label, value]) => (
            <div
              key={label}
              className={offlineTheme.softCard}
            >
              <p className={offlineTheme.label}>{label}</p>
              <p className={`mt-3 text-2xl font-black ${offlineTheme.heading}`}>{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={`overflow-hidden ${offlineTheme.section}`}> 
        <div className={`flex flex-col gap-4 border-b p-6 md:flex-row md:items-center md:justify-between md:p-8 ${isDarkTheme ? 'border-white/10' : 'border-slate-200'}`}>
          <div>
            <p className={`text-[11px] font-bold uppercase tracking-[0.24em] ${offlineTheme.heading}`}>Sales History Log</p>
            <h3 className={`mt-2 text-2xl font-black tracking-tight ${offlineTheme.heading}`}>Offline Sales Entries</h3>
          </div>
          <div className={offlineTheme.chipSurface}>
            {sales.length} visible entries
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className={offlineTheme.tableHeadRow}>
                <th className="px-6 py-5">Date</th>
                <th className="px-6 py-5">Product</th>
                <th className="px-6 py-5 text-center">Qty</th>
                <th className="px-6 py-5 text-center">Total Sale</th>
                <th className="px-6 py-5 text-center">Total Profit</th>
                <th className="px-6 py-5 text-center">Payment</th>
                <th className="px-6 py-5 text-center">Pending Amount</th>
                <th className="px-6 py-5">Customer Name</th>
                <th className="px-6 py-5 text-center">Notes</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {!loadingSales && sales.length === 0 && (
                <tr>
                  <td colSpan="10" className={`px-6 py-12 text-center text-sm ${offlineTheme.tableCellMuted}`}>
                    No offline sales found for the selected filter.
                  </td>
                </tr>
              )}
              {sales.map((sale) => (
                <tr
                  key={sale._id}
                  className={`transition-colors hover:bg-white/[0.03] ${sale.paymentMode === 'Pending' ? 'bg-amber-500/[0.06]' : ''}`}
                >
                  <td className={`px-6 py-5 text-sm ${offlineTheme.subtext}`}>
                    {sale.saleDate?.slice(0, 10)}
                  </td>
                  <td className="px-6 py-5">
                    <p className={`font-bold ${offlineTheme.heading}`}>{sale.productName}</p>
                  </td>
                  <td className={`px-6 py-5 text-center text-sm font-semibold ${offlineTheme.subtext}`}>{sale.quantitySold}</td>
                  <td className={`px-6 py-5 text-center text-sm font-bold ${offlineTheme.heading}`}>{formatPrice(sale.totalSale)}</td>
                  <td className="px-6 py-5 text-center text-sm font-bold text-emerald-300">{formatPrice(sale.profit)}</td>
                  <td className="px-6 py-5 text-center">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] ${
                        sale.paymentMode === 'Pending'
                          ? 'border-amber-500/20 bg-amber-500/10 text-amber-300'
                          : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                      }`}
                    >
                      {sale.paymentMode}
                    </span>
                  </td>
                  <td className={`px-6 py-5 text-center text-sm font-bold ${sale.pendingAmount > 0 ? 'text-amber-300' : offlineTheme.tableCellMuted}`}>
                    {sale.pendingAmount > 0 ? formatPrice(sale.pendingAmount) : formatPrice(0)}
                  </td>
                  <td className={`px-6 py-5 text-sm ${offlineTheme.subtext}`}>{sale.customerName || '-'}</td>
                  <td className="px-6 py-5 text-center">
                    <button
                      type="button"
                      onClick={() => openNoteModal(sale)}
                      className={`rounded-xl border px-3 py-2 text-xs font-bold transition-all ${sale.notes ? 'border-primary-500/20 bg-primary-500/10 text-slate-400 hover:bg-primary-500/15' : 'border-slate-200/10 bg-white/[0.04] text-slate-400 hover:border-white/20 hover:bg-white/[0.06]'}`}
                    >
                      {sale.notes ? 'View Note' : 'No Note'}
                    </button>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setBillPreviewSale(sale)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-amber-200 transition-all hover:bg-amber-500/15"
                      >
                        <ReceiptText size={14} />
                        Bill
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEdit(sale)}
                        className={offlineTheme.buttonGhost}
                        aria-label="Edit offline sale"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(sale._id)}
                        className={isDarkTheme ? 'inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-300 transition-all hover:bg-red-500/15' : 'inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-600 transition-all hover:bg-red-100'}
                        aria-label="Delete offline sale"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={`rounded-[2rem] border p-6 shadow-[0_26px_70px_-42px_rgba(0,0,0,0.95)] ${isDarkTheme ? 'border-primary-500/20 bg-gradient-to-r from-primary-600/10 via-[#151b24] to-[#151b24]' : 'border-primary-200 bg-gradient-to-r from-primary-50 via-white to-slate-50'}`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className={offlineTheme.iconBox}>
              <Clock3 size={22} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary-300">Recovery Insight</p>
              <h4 className={`mt-2 text-2xl font-black tracking-tight ${offlineTheme.heading}`}>Pending collection watch</h4>
              <p className={`mt-2 text-sm ${offlineTheme.subtext}`}>
                Current pending balance stands at {formatPrice(pendingBalance)} across {sales.filter((sale) => Number(sale.pendingAmount) > 0).length} entries.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={applyFilters}
            className={offlineTheme.buttonSecondary}
          >
            Refresh Insight
          </button>
        </div>
      </section>

      <BillModal
        sale={billPreviewSale}
        customerPhone={billPreviewSale?.customerPhone}
        onClose={() => setBillPreviewSale(null)}
      />

      {selectedSaleNote && (
        <div className={offlineTheme.modalBackdrop}>
          <div className={offlineTheme.modalShell}>
            <div className={`flex items-start justify-between gap-4 pb-4 ${isDarkTheme ? 'border-b border-white/10' : 'border-b border-slate-200'}`}>
              <div>
                <p className={`text-[11px] font-bold uppercase tracking-[0.24em] ${isDarkTheme ? 'text-primary-300' : 'text-primary-600'}`}>Offline Sale Note</p>
                <h3 className={`mt-2 text-2xl font-black ${offlineTheme.heading}`}>Sale Entry Note</h3>
              </div>
              <button
                type="button"
                onClick={closeNoteModal}
                className={isDarkTheme ? 'rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold text-slate-300 transition-all hover:bg-white/[0.06] hover:text-white' : 'rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900'}
              >
                Close
              </button>
            </div>

            <div className={`mt-5 space-y-4 text-sm ${offlineTheme.subtext}`}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className={offlineTheme.noteCard}>
                  <p className={`text-[10px] font-bold uppercase tracking-[0.22em] ${offlineTheme.label}`}>Product</p>
                  <p className={`mt-2 font-bold ${offlineTheme.heading}`}>{selectedSaleNote.productName || '—'}</p>
                </div>
                <div className={offlineTheme.noteCard}>
                  <p className={`text-[10px] font-bold uppercase tracking-[0.22em] ${offlineTheme.label}`}>Customer</p>
                  <p className={`mt-2 font-bold ${offlineTheme.heading}`}>{selectedSaleNote.customerName || '—'}</p>
                </div>
              </div>

              <div className={offlineTheme.noteCard}>
                <p className={`text-[10px] font-bold uppercase tracking-[0.22em] ${offlineTheme.label}`}>Note</p>
                <p className={`mt-3 whitespace-pre-wrap leading-7 ${offlineTheme.noteText}`}>
                  {selectedSaleNote.notes?.trim() || 'No note available for this entry.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      <ConfirmModal
        open={Boolean(deleteConfirm)}
        title="Delete Offline Sale"
        description="Delete this offline sale entry? This action cannot be undone."
        confirmLabel="Yes, Delete"
        tone="danger"
        onCancel={closeDeleteConfirm}
        onConfirm={async () => {
          if (!deleteConfirm) return;

          try {
            await api.delete(`/admin-inventory/offline-sales/${deleteConfirm}`);

            if (editingSaleId === deleteConfirm) {
              resetForm();
            }

            toast.success('Offline sale deleted');
            await Promise.all([loadProducts(), loadSales(appliedFilters), loadPendingPayments(appliedFilters)]);
          } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete offline sale');
          } finally {
            closeDeleteConfirm();
          }
        }}
      />
    </div>
  );
};

export default OfflineSalesSection;