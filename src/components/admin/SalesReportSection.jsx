import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  ArrowDownRight, ReceiptText, ArrowUpRight, BarChart3, CalendarDays, ChevronDown, Download, FileSpreadsheet, PackageCheck, TrendingUp, Wallet,
} from 'lucide-react';
import api from '../../api/axios';
import { formatPrice } from '../../utils/price';
import { useThemeStore } from '../../store/useStore';

const getToday = () => new Date().toISOString().slice(0, 10);
const getWeekStart = () => {
  const date = new Date();
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date.toISOString().slice(0, 10);
};
const getMonthStart = () => {
  const date = new Date();
  date.setDate(1);
  return date.toISOString().slice(0, 10);
};

const emptySummary = {
  totalOfflineSale: 0,
  totalOnlineSale: 0,
  totalSalesAmount: 0,
  totalSalesProfit: 0,
  totalRepairIncome: 0,
  totalRepairCost: 0,
  totalRepairProfit: 0,
  totalExpenses: 0,
  netProfit: 0,
  noSaleDaysCount: 0,
  holidayDaysCount: 0,
  combinedTotalSale: 0,
  combinedTotalCost: 0,
  combinedTotalProfit: 0,
  totalTransactions: 0,
  totalQuantitySold: 0,
};

const SalesReportSection = () => {
  const { theme } = useThemeStore();
  const isDarkTheme = theme === 'dark';
  const [filters, setFilters] = useState({ from: getMonthStart(), to: getToday() });
  const [report, setReport] = useState({ summary: emptySummary, dailyBreakdown: [] });
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const reportTheme = {
    shell: isDarkTheme
      ? 'border border-white/10 bg-[#10151d]/95 shadow-[0_28px_80px_-42px_rgba(0,0,0,0.95)] backdrop-blur-xl'
      : 'border border-slate-200 bg-white/95 shadow-[0_26px_72px_-42px_rgba(15,23,42,0.16)] backdrop-blur-xl',
    innerShell: isDarkTheme
      ? 'border border-white/10 bg-[#10151d]/95 shadow-[0_28px_80px_-42px_rgba(0,0,0,0.95)] backdrop-blur-xl'
      : 'border border-slate-200 bg-white shadow-[0_22px_60px_-40px_rgba(15,23,42,0.14)] backdrop-blur-xl',
    heading: isDarkTheme ? 'text-white' : 'text-slate-900',
    subtext: isDarkTheme ? 'text-slate-400' : 'text-slate-500',
    label: isDarkTheme ? 'text-slate-500' : 'text-slate-500',
    input: isDarkTheme
      ? 'h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-500 focus:border-primary-500/40'
      : 'h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-primary-500/40',
    quickFilterInactive: isDarkTheme
      ? 'border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.06]'
      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100',
    quickFilterActive: isDarkTheme
      ? 'border-primary-500/30 bg-primary-500/15 text-white shadow-[0_16px_32px_-22px_rgba(220,38,38,0.75)]'
      : 'border-primary-500/30 bg-primary-500/15 text-slate-900 shadow-[0_16px_32px_-22px_rgba(220,38,38,0.25)]',
    exportButton: isDarkTheme
      ? 'inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold transition-all hover:bg-white/[0.06] disabled:opacity-60'
      : 'inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 disabled:opacity-60',
    exportMenu: isDarkTheme
      ? 'border border-white/10 bg-[#10151d] shadow-[0_22px_70px_-35px_rgba(0,0,0,1)]'
      : 'border border-slate-200 bg-white shadow-[0_22px_70px_-35px_rgba(15,23,42,0.16)]',
    exportItem: isDarkTheme
      ? 'text-slate-200 hover:bg-white/[0.06]'
      : 'text-slate-700 hover:bg-slate-50',
    kpiCard: isDarkTheme
      ? 'border border-white/10 bg-gradient-to-br shadow-[0_24px_70px_-40px_rgba(0,0,0,0.9)]'
      : 'border border-slate-200 bg-gradient-to-br shadow-[0_22px_60px_-42px_rgba(15,23,42,0.12)]',
    kpiIcon: isDarkTheme
      ? 'bg-white/[0.05] text-white'
      : 'bg-slate-100 text-slate-700',
    statCard: isDarkTheme
      ? 'rounded-[1.75rem] border border-white/10 bg-[#10151d]/95 p-6 shadow-[0_24px_70px_-42px_rgba(0,0,0,0.95)] backdrop-blur-xl'
      : 'rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_22px_60px_-42px_rgba(15,23,42,0.14)] backdrop-blur-xl',
    ledgerCard: isDarkTheme
      ? 'rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4'
      : 'rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4',
    ledgerMini: isDarkTheme
      ? 'rounded-2xl border border-white/10 bg-[#0d1118]/60 p-3 min-[320px]:max-[767px]:mt-[15px]'
      : 'rounded-2xl border border-slate-200 bg-white p-3 min-[320px]:max-[767px]:mt-[15px]',
    tableShell: isDarkTheme
      ? 'overflow-x-auto rounded-[1.75rem] border border-white/10 bg-[#151b24]'
      : 'overflow-x-auto rounded-[1.75rem] border border-slate-200 bg-white',
    tableHeadRow: isDarkTheme
      ? 'bg-white/[0.02] text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500'
      : 'bg-slate-50 text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500',
    tableBodyRow: isDarkTheme
      ? 'transition-colors hover:bg-white/[0.04]'
      : 'transition-colors hover:bg-slate-50',
    tableRowOdd: isDarkTheme ? 'bg-white/[0.015]' : 'bg-white',
    tableRowEven: isDarkTheme ? 'bg-transparent' : 'bg-slate-50/40',
    tableCell: isDarkTheme ? 'text-white' : 'text-slate-900',
    tableSubCell: isDarkTheme ? 'text-slate-300' : 'text-slate-600',
    tableDivider: isDarkTheme ? 'divide-y divide-white/5' : 'divide-y divide-slate-200',
    emptyState: isDarkTheme
      ? 'rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-4 py-8 text-center text-sm text-slate-500'
      : 'rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500',
    dayChip: isDarkTheme
      ? 'rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300'
      : 'rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500',
    metricSurface: isDarkTheme ? 'rounded-2xl border border-white/10 bg-[#0d1118]/60 p-3' : 'rounded-2xl border border-slate-200 bg-white p-3',
    metricValue: isDarkTheme ? 'font-bold text-slate-100' : 'font-bold text-slate-900',
    groupTitle: isDarkTheme ? 'text-white' : 'text-slate-900',
  };

  const loadReport = async (activeFilters = filters) => {
    setLoading(true);

    try {
      const params = new URLSearchParams();
      if (activeFilters.from) params.set('from', activeFilters.from);
      if (activeFilters.to) params.set('to', activeFilters.to);
      const { data } = await api.get(`/admin-reports/sales-report?${params.toString()}`);
      setReport({
        summary: data.summary || emptySummary,
        dailyBreakdown: data.dailyBreakdown || [],
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load sales report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport(filters);
    // Run initial report load only once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyQuickFilter = (type) => {
    const nextFilters =
      type === 'today'
        ? { from: getToday(), to: getToday() }
        : type === 'week'
          ? { from: getWeekStart(), to: getToday() }
          : { from: getMonthStart(), to: getToday() };

    setFilters(nextFilters);
    loadReport(nextFilters);
  };

  const applyRange = () => {
    loadReport(filters);
  };

  const getActiveQuickFilter = () => {
    if (filters.from === getToday() && filters.to === getToday()) return 'today';
    if (filters.from === getWeekStart() && filters.to === getToday()) return 'week';
    if (filters.from === getMonthStart() && filters.to === getToday()) return 'month';
    return '';
  };

  const downloadExcel = async () => {
    setExporting(true);

    try {
      const res = await api.get('/admin/export-sales', {
        params: {
          fromDate: filters.from,
          toDate: filters.to,
        },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'sales-report.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to download sales report');
    } finally {
      setExporting(false);
    }
  };

  const downloadCsv = () => {
    const headers = ['Date', 'Offline Sale', 'Online Sale', 'Repair Income', 'Total Sale', 'Total Profit', 'Status'];
    const lines = report.dailyBreakdown.map((day) => [
      day.date,
      day.offlineSale || 0,
      day.onlineSale || 0,
      day.repairIncome || 0,
      day.totalSale || 0,
      day.totalProfit || 0,
      day.status || (day.totalSale > 0 ? '-' : 'No Sale'),
    ]);
    const csv = [headers, ...lines]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const url = window.URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sales-report.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const printReport = () => window.print();

  const activeQuickFilter = getActiveQuickFilter();
  const summarySections = [
    {
      title: 'Sales',
      cards: [
        { label: 'Total Sales', value: formatPrice(report.summary.totalSalesAmount || 0), icon: ReceiptText, color: 'dark:text-emerald-300', trend: 'up' },
        { label: 'Offline Sales', value: formatPrice(report.summary.totalOfflineSale || 0), icon: ReceiptText, color: ' dark:text-primary-200', trend: 'up' },
        { label: 'Online Sales', value: formatPrice(report.summary.totalOnlineSale || 0), icon: BarChart3, color: 'dark:text-sky-300', trend: 'up' },
      ],
    },
    {
      title: 'Profit',
      cards: [
        { label: 'Total Profit', value: formatPrice(report.summary.totalSalesProfit || 0), icon: TrendingUp, color: 'dark:text-emerald-300', trend: report.summary.totalSalesProfit >= 0 ? 'up' : 'down' },
        { label: 'Repair Profit', value: formatPrice(report.summary.totalRepairProfit || 0), icon: Wallet, color: 'dark:text-amber-200', trend: report.summary.totalRepairProfit >= 0 ? 'up' : 'down' },
        { label: 'Net Profit', value: formatPrice(report.summary.netProfit || 0), icon: ReceiptText, color: report.summary.netProfit >= 0 ? 'dark:text-emerald-300' : 'dark:text-rose-300', trend: report.summary.netProfit >= 0 ? 'up' : 'down' },
      ],
    },
    {
      title: 'Operations',
      cards: [
        { label: 'Orders', value: report.summary.totalTransactions || 0, icon: PackageCheck, color: '', trend: 'up' },
        { label: 'Quantity Sold', value: report.summary.totalQuantitySold || 0, icon: PackageCheck, color: '', trend: 'up' },
        { label: 'No Sale Days', value: report.summary.noSaleDaysCount || 0, icon: CalendarDays, color: '', trend: report.summary.noSaleDaysCount > 0 ? 'down' : 'up' },
      ],
    },
  ];

  const heroKpis = [
    { label: 'Total Sales', value: formatPrice(report.summary.totalSalesAmount || 0), icon: ReceiptText, glow: 'from-emerald-500/15 to-white/[0.04]', valueClass: 'dark:text-emerald-200' },
    { label: 'Net Profit', value: formatPrice(report.summary.netProfit || 0), icon: TrendingUp, glow: 'from-primary-500/15 to-white/[0.04]', valueClass: report.summary.netProfit >= 0 ? '' : 'dark:text-rose-200' },
    { label: 'Total Expenses', value: formatPrice(report.summary.totalExpenses || 0), icon: Wallet, glow: 'from-amber-500/15 to-white/[0.04]', valueClass: 'dark:text-amber-100' },
  ];


  return (
    <div className="space-y-10">
      <section className={`relative z-30 overflow-visible rounded-[2rem] p-6 md:p-8 ${reportTheme.shell}`}>
        <div className="rounded-t-[30px] absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_left,rgba(220,38,38,0.2),transparent_40%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.16),transparent_32%)]" />
        <div className="relative space-y-8">
          <div>
            <p className={`text-[11px] font-bold uppercase tracking-[0.28em] ${reportTheme.heading}`}>Performance Analytics</p>
            <h3 className={`mt-3 text-3xl font-black uppercase tracking-tight md:text-4xl ${reportTheme.heading}`}>Sales Report</h3>
            <p className={`mt-3 max-w-2xl text-sm leading-7 ${reportTheme.subtext} min-[320px]:max-[430px]:leading-[20px]`}>
              Combine offline sales history and paid online orders into one premium date-wise report.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            {heroKpis.map((kpi) => {
              const Icon = kpi.icon;
              return (
                <div
                  key={kpi.label}
                  className={`rounded-[1.8rem] bg-gradient-to-br ${kpi.glow} p-6 ${reportTheme.kpiCard}`}
                >
                  <div className="flex items-center justify-between">
                    <p className={`text-[11px] font-bold uppercase tracking-[0.24em] ${reportTheme.label}`}>{kpi.label}</p>
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${reportTheme.kpiIcon}`}>
                      <Icon size={18} />
                    </div>
                  </div>
                  <p className={`mt-5 text-2xl font-black tracking-tight md:text-2xl ${kpi.valueClass} min-[320px]:max-[430px]:text-[20px] min-[320px]:max-[430px]:mt-0`}>{kpi.value}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-[1fr_1fr_auto]">
          <div className="space-y-2">
            <label className={`text-xs font-bold uppercase tracking-widest ${reportTheme.label}`}>From Date</label>
            <input
              type="date"
              value={filters.from}
              onChange={(event) => setFilters((current) => ({ ...current, from: event.target.value }))}
              className={reportTheme.input}
            />
          </div>
          <div className="space-y-2">
            <label className={`text-xs font-bold uppercase tracking-widest ${reportTheme.label}`}>To Date</label>
            <input
              type="date"
              value={filters.to}
              onChange={(event) => setFilters((current) => ({ ...current, to: event.target.value }))}
              className={reportTheme.input}
            />
          </div>
          <div className="md:col-span-2 xl:col-span-1 flex flex-wrap items-end gap-3">
            {[
              ['today', 'Today'],
              ['week', 'This Week'],
              ['month', 'This Month'],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => applyQuickFilter(key)}
                className={`rounded-2xl border px-5 py-3 text-sm font-bold transition-all ${
                  activeQuickFilter === key
                    ? reportTheme.quickFilterActive
                    : reportTheme.quickFilterInactive
                }`}
              >
                {label}
              </button>
            ))}
            <button type="button" onClick={applyRange} className="rounded-2xl bg-primary-600 px-6 py-3 text-sm font-black text-white shadow-[0_18px_40px_-20px_rgba(220,38,38,0.75)] transition-all hover:bg-primary-700">Apply</button>
            <div className="relative z-50">
              <button
                type="button"
                onClick={() => setShowExportMenu((current) => !current)}
                disabled={exporting}
                className={reportTheme.exportButton}
              >
                <Download size={16} />
                {exporting ? 'Exporting...' : 'Export'}
                <ChevronDown size={16} />
              </button>
              {showExportMenu && (
                <div className={`absolute right-0 top-[calc(100%+0.75rem)] z-[120] w-40 overflow-hidden rounded-2xl ${reportTheme.exportMenu}`}>
                  {[
                    ['Excel', downloadExcel],
                    ['CSV', downloadCsv],
                    ['PDF', printReport],
                  ].map(([label, action]) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => {
                        setShowExportMenu(false);
                        action();
                      }}
                      className={`flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold transition-all ${reportTheme.exportItem}`}
                    >
                      <FileSpreadsheet size={15} className="text-primary-300" />
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-8">
        {summarySections.map((group) => (
          <div key={group.title} className="space-y-4">
            <p className={`text-[11px] font-bold uppercase tracking-[0.28em] ${reportTheme.groupTitle}`}>{group.title}</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {group.cards.map((card) => {
                const Icon = card.icon;
                const TrendIcon = card.trend === 'down' ? ArrowDownRight : ArrowUpRight;
                return (
                  <div key={card.label} className={reportTheme.statCard}>
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <p className={`text-[11px] font-bold uppercase tracking-[0.22em] ${reportTheme.label}`}>{card.label}</p>
                        <p className={`mt-4 text-2xl min-[768px]:max-[900px]:text-[22px] font-black tracking-tigh ${card.color}`}>{card.value}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${reportTheme.kpiIcon}`}>
                          <Icon size={18} />
                        </div>
                        <TrendIcon size={18} className={card.trend === 'down' ? 'text-rose-300' : 'text-emerald-300'} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      <section className={`overflow-hidden rounded-[2rem] ${reportTheme.innerShell}`}>
        <div className={`border-b p-6 md:p-8 ${isDarkTheme ? 'border-white/10' : 'border-slate-200'}`}>
          <p className={`text-[11px] font-bold uppercase tracking-[0.24em] ${reportTheme.heading}`}>Daily Ledger</p>
          <h3 className={`mt-2 text-2xl font-black ${reportTheme.heading}`}>Date-wise Breakdown</h3>
        </div>
        <div className="max-h-[640px] overflow-auto">
          <div className="space-y-4 p-4 sm:hidden">
            {!loading && report.dailyBreakdown.length === 0 && (
              <div className={reportTheme.emptyState}>
                No report data found for the selected range.
              </div>
            )}

            {report.dailyBreakdown.map((day) => (
              <div
                key={day.date}
                className={reportTheme.ledgerCard}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className={`text-[10px] font-bold uppercase tracking-[0.22em] ${reportTheme.label}`}>Date</p>
                    <p className={`mt-2 text-sm font-semibold ${reportTheme.heading}`}>{day.date}</p>
                  </div>
                  <div className={reportTheme.dayChip}>
                    {day.status || (day.totalSale > 0 ? '-' : 'No Sale')}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className={reportTheme.ledgerMini}>
                    <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${reportTheme.label}`}>Offline Sale</p>
                    <p className={`mt-2 text-sm font-bold ${reportTheme.heading}`}>{formatPrice(day.offlineSale)}</p>
                  </div>
                  <div className={reportTheme.ledgerMini}>
                    <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${reportTheme.label}`}>Online Sale</p>
                    <p className={`mt-2 text-sm font-bold ${reportTheme.heading}`}>{formatPrice(day.onlineSale)}</p>
                  </div>
                  <div className={reportTheme.ledgerMini}>
                    <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${reportTheme.label}`}>Repair Income</p>
                    <p className={`mt-2 text-sm font-bold ${reportTheme.heading}`}>{formatPrice(day.repairIncome)}</p>
                  </div>
                  <div className={reportTheme.ledgerMini}>
                    <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${reportTheme.label}`}>Total Profit</p>
                    <p className={`mt-2 text-sm font-bold ${Number(day.totalProfit || 0) >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                      {formatPrice(day.totalProfit)}
                    </p>
                  </div>
                </div>

                <div className={reportTheme.metricSurface}>
                  <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${reportTheme.label}`}>Total Sale</p>
                  <p className={`mt-2 text-base font-black ${reportTheme.metricValue}`}>{formatPrice(day.totalSale)}</p>
                </div>
              </div>
            ))}

            <div className={reportTheme.ledgerCard}>
              <p className={`text-[10px] font-bold uppercase tracking-[0.22em] ${reportTheme.label}`}>Total Summary</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className={reportTheme.ledgerMini}>
                  <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${reportTheme.label}`}>Offline</p>
                  <p className={`mt-2 font-bold ${reportTheme.heading}`}>{formatPrice(report.summary.totalOfflineSale || 0)}</p>
                </div>
                <div className={reportTheme.ledgerMini}>
                  <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${reportTheme.label}`}>Online</p>
                  <p className={`mt-2 font-bold ${reportTheme.heading}`}>{formatPrice(report.summary.totalOnlineSale || 0)}</p>
                </div>
                <div className={reportTheme.ledgerMini}>
                  <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${reportTheme.label}`}>Repair</p>
                  <p className={`mt-2 font-bold ${reportTheme.heading}`}>{formatPrice(report.summary.totalRepairIncome || 0)}</p>
                </div>
                <div className={reportTheme.ledgerMini}>
                  <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${reportTheme.label}`}>Days</p>
                  <p className={`mt-2 font-bold ${reportTheme.heading}`}>{loading ? 'Loading...' : `${report.dailyBreakdown.length} Days`}</p>
                </div>
              </div>
              <div className={`mt-3 rounded-2xl border p-3 ${isDarkTheme ? 'border-white/10 bg-[#0d1118]/60' : 'border-slate-200 bg-white'}`}>
                <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${reportTheme.label}`}>Sales / Profit / Expenses</p>
                <div className="mt-2 grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
                  <p className={reportTheme.metricValue}>{formatPrice(report.summary.totalSalesAmount || 0)}</p>
                  <p className={`${Number(report.summary.totalSalesProfit || 0) >= 0 ? 'text-emerald-300' : 'text-rose-300'} font-bold`}>
                    {formatPrice(report.summary.totalSalesProfit || 0)}
                  </p>
                  <p className={reportTheme.metricValue}>{formatPrice(report.summary.totalExpenses || 0)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className={`hidden sm:block overflow-x-auto rounded-[1.75rem] ${reportTheme.tableShell}`}>
            <table className="min-w-full text-left">
              <thead>
                <tr className={reportTheme.tableHeadRow}>
                  <th className="px-6 py-5">Date</th>
                  <th className="px-6 py-5 text-center">Offline Sale</th>
                  <th className="px-6 py-5 text-center">Online Sale</th>
                  <th className="px-6 py-5 text-center">Repair Income</th>
                  <th className="px-6 py-5 text-center">Total Sale</th>
                  <th className="px-6 py-5 text-center">Total Profit</th>
                  <th className="px-6 py-5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className={reportTheme.tableDivider}>
                {!loading && report.dailyBreakdown.length === 0 && (
                  <tr>
                    <td colSpan="7" className={`px-6 py-12 text-center text-sm ${reportTheme.subtext}`}>
                      No report data found for the selected range.
                    </td>
                  </tr>
                )}
                {report.dailyBreakdown.map((day, index) => (
                  <tr
                    key={day.date}
                    className={`${reportTheme.tableBodyRow} ${index % 2 === 0 ? reportTheme.tableRowOdd : reportTheme.tableRowEven}`}
                  >
                    <td className={`px-5 py-5 text-sm font-semibold ${reportTheme.tableCell}`}>{day.date}</td>
                    <td className={`px-5 py-5 text-center text-sm ${reportTheme.tableSubCell}`}>{formatPrice(day.offlineSale)}</td>
                    <td className={`px-5 py-5 text-center text-sm ${reportTheme.tableSubCell}`}>{formatPrice(day.onlineSale)}</td>
                    <td className={`px-5 py-5 text-center text-sm ${reportTheme.tableSubCell}`}>{formatPrice(day.repairIncome)}</td>
                    <td className={`px-5 py-5 text-center text-sm font-black ${reportTheme.tableCell}`}>{formatPrice(day.totalSale)}</td>
                    <td className={`px-5 py-5 text-center text-sm font-black ${Number(day.totalProfit || 0) >= 0 ? 'dark:text-emerald-300' : 'dark:text-rose-300'}`}>
                      {formatPrice(day.totalProfit)}
                    </td>
                    <td className={`px-6 py-5 text-center text-sm ${reportTheme.tableSubCell}`}>{day.status || (day.totalSale > 0 ? '-' : 'No Sale')}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className={`text-sm font-black ${reportTheme.heading} ${isDarkTheme ? 'bg-white/[0.02]' : 'bg-slate-50'}`}>
                  <td className="px-6 py-5">Total</td>
                  <td className="px-6 py-5 text-center">{formatPrice(report.summary.totalOfflineSale || 0)}</td>
                  <td className="px-6 py-5 text-center">{formatPrice(report.summary.totalOnlineSale || 0)}</td>
                  <td className="px-6 py-5 text-center">{formatPrice(report.summary.totalRepairIncome || 0)}</td>
                  <td className="px-6 py-5 text-center dark:text-amber-100">{formatPrice(report.summary.totalSalesAmount || 0)}</td>
                  <td className={`px-6 py-5 text-center ${Number(report.summary.totalSalesProfit || 0) >= 0 ? 'dark:text-emerald-300' : 'dark:text-rose-300'}`}>
                    {formatPrice(report.summary.totalSalesProfit || 0)}
                  </td>
                  <td className={`px-6 py-5 text-center ${reportTheme.subtext}`}>{loading ? 'Loading...' : `${report.dailyBreakdown.length} Days`}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SalesReportSection;
