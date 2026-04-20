import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Activity, ReceiptText, CalendarRange, ChartColumn, CircleDollarSign, Wallet, } from 'lucide-react';
import api from '../../api/axios';
import { formatPrice } from '../../utils/price';
import { useThemeStore } from '../../store/useStore.js';

const getToday = () => new Date().toISOString().slice(0, 10);
const getMonthStart = () => {
  const date = new Date();
  date.setDate(1);
  return date.toISOString().slice(0, 10);
};

const emptySummary = {
  totalSalesAmount: 0,
  totalSalesProfit: 0,
  totalRepairIncome: 0,
  totalRepairProfit: 0,
  totalExpenses: 0,
  netProfit: 0,
  noSaleDaysCount: 0,
  holidayDaysCount: 0,
};

const BusinessSummarySection = () => {
  const { theme } = useThemeStore();
  const isDarkTheme = theme === 'dark';
  const [filters, setFilters] = useState({ from: getMonthStart(), to: getToday() });
  const [summary, setSummary] = useState(emptySummary);
  const [loading, setLoading] = useState(false);

  const loadSummary = async (activeFilters) => {
    setLoading(true);

    try {
      const params = new URLSearchParams();
      if (activeFilters.from) params.set('from', activeFilters.from);
      if (activeFilters.to) params.set('to', activeFilters.to);
      const { data } = await api.get(`/admin-reports/business-summary?${params.toString()}`);
      setSummary(data.summary || emptySummary);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load business summary');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary({ from: getMonthStart(), to: getToday() });
  }, []);

  const totalRevenue = summary.totalSalesAmount || 0;
  const totalProfit = summary.totalSalesProfit || 0;
  const activeDays = Math.max(0, 30 - (summary.noSaleDaysCount || 0) - (summary.holidayDaysCount || 0));

  const kpiCards = [
    {
      label: 'Total Revenue',
      value: formatPrice(totalRevenue),
      note: 'Sales plus repair income',
      icon: CircleDollarSign,
      tone: 'text-emerald-300 bg-emerald-500/15',
    },
    {
      label: 'Net Profit',
      value: formatPrice(summary.netProfit || 0),
      note: 'After expenses',
      icon: Wallet,
      tone: 'text-primary-300 bg-primary-500/15',
    },
    {
      label: 'Sales Profit',
      value: formatPrice(summary.totalSalesProfit || 0),
      note: 'Product selling contribution',
      icon: ChartColumn,
      tone: 'text-sky-300 bg-sky-500/15',
    },
    {
      label: 'Expense Snapshot',
      value: formatPrice(summary.totalExpenses || 0),
      note: 'Tracked operating expense',
      icon: ReceiptText,
      tone: 'text-amber-300 bg-amber-500/15',
    },
  ];

  const channelRows = [
    {
      label: 'Product Sales',
      value: summary.totalSalesAmount || 0,
      profit: summary.totalSalesProfit || 0,
      tone: 'from-primary-500 to-rose-400',
    },
    {
      label: 'Bat Repair',
      value: summary.totalRepairIncome || 0,
      profit: summary.totalRepairProfit || 0,
      tone: 'from-sky-400 to-cyan-300',
    },
    {
      label: 'Expenses',
      value: summary.totalExpenses || 0,
      profit: -(summary.totalExpenses || 0),
      tone: 'from-amber-400 to-orange-300',
    },
   
  ];

  const maxChannelValue = Math.max(...channelRows.map((item) => Math.abs(item.value)), 1);
  const productivityRatio = totalRevenue > 0 ? Math.min((totalProfit / totalRevenue) * 100, 100) : 0;
  const activeDaysRatio =
    activeDays + (summary.noSaleDaysCount || 0) + (summary.holidayDaysCount || 0) > 0
      ? (activeDays /
          (activeDays + (summary.noSaleDaysCount || 0) + (summary.holidayDaysCount || 0))) *
        100
      : 0;

  const businessTheme = isDarkTheme
    ? {
        section: 'rounded-[2rem] border border-white/10 bg-[#10151d]/95 p-6 shadow-[0_28px_80px_-42px_rgba(0,0,0,0.95)] backdrop-blur-xl md:p-8',
        heroCard: 'rounded-[1.5rem] border border-white/10 bg-white/[0.04] px-5 py-4',
        statCard: 'relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#151b24] p-5 shadow-[0_22px_60px_-36px_rgba(0,0,0,0.95)]',
        softCard: 'rounded-[1.5rem] border border-white/10 bg-[#151b24] p-5',
        panel: 'rounded-[1.75rem] border border-white/10 bg-[#151b24]/80 p-6 shadow-[0_20px_50px_-34px_rgba(0,0,0,0.95)]',
        input: 'h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition-all focus:border-primary-500/40',
        label: 'text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500',
        heading: 'text-white',
        subtext: 'text-slate-400',
        chipSurface: 'rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400',
        buttonPrimary: 'inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-600 px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white shadow-[0_18px_40px_-22px_rgba(220,38,38,0.75)] transition-all hover:bg-primary-700 disabled:opacity-60',
        alertCard: 'rounded-[1.25rem] border border-white/10 bg-white/[0.06] px-4 py-3 text-center',
        donutInner: 'relative flex h-28 w-28 items-center justify-center rounded-full bg-[#10151d]',
        ring: 'relative flex h-44 w-44 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]',
      }
    : {
        section: 'rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_28px_80px_-42px_rgba(15,23,42,0.18)] backdrop-blur-xl md:p-8',
        heroCard: 'rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-4',
        statCard: 'relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 shadow-[0_22px_60px_-36px_rgba(15,23,42,0.1)]',
        softCard: 'rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5',
        panel: 'rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 shadow-[0_20px_50px_-34px_rgba(15,23,42,0.1)]',
        input: 'h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition-all focus:border-primary-500/40',
        label: 'text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500',
        heading: 'text-slate-900',
        subtext: 'text-slate-600',
        chipSurface: 'rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500',
        buttonPrimary: 'inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-600 px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white shadow-[0_18px_40px_-22px_rgba(220,38,38,0.75)] transition-all hover:bg-primary-700 disabled:opacity-60',
        alertCard: 'rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3 text-center',
        donutInner: 'relative flex h-28 w-28 items-center justify-center rounded-full bg-white',
        ring: 'relative flex h-44 w-44 items-center justify-center rounded-full border border-slate-200 bg-slate-50',
      };

  const healthCards = useMemo(
    () => [
       {
        label: 'Sales vs Repairs',
        value: `${Math.round(
          totalRevenue > 0 ? ((summary.totalSalesAmount || 0) / totalRevenue) * 100 : 0
        )}%`,
        note: 'Revenue led by product sales',
      },
      {
        label: 'Active Days',
        value: `${activeDays} days`,
        note: `${summary.noSaleDaysCount || 0} no-sale and ${summary.holidayDaysCount || 0} holiday days`,
      },
      {
        label: 'Profit Health',
        value: `${Math.round(productivityRatio)}%`,
        note: 'Profit generated from total revenue',
      },
    ],
    [
      activeDays,
      productivityRatio,
      summary.holidayDaysCount,
      summary.noSaleDaysCount,
      summary.totalSalesAmount,
      totalRevenue,
    ]
  );

  return (
    <div className="space-y-8">
      <section className={`relative overflow-hidden ${businessTheme.section}`}>
        <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top_left,rgba(220,38,38,0.18),transparent_52%)]"></div>
        <div className="relative space-y-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className={`text-[11px] font-bold uppercase tracking-[0.28em] ${businessTheme.heading}`}>
                Sports World Analytics
              </p>
              <h3 className={`mt-3 text-3xl font-black uppercase tracking-tight md:text-4xl ${businessTheme.heading}`}>
                Business Summary
              </h3>
              <p className={`mt-3 max-w-2xl text-sm leading-7 ${businessTheme.subtext}`}>
                Review sales, repair income, expenses, and operating-day performance in one
                premium summary view.
              </p>
            </div>

            <div className={businessTheme.heroCard}>
              <p className={businessTheme.label}>
                Selected Range
              </p>
              <p className={`mt-2 text-lg font-black ${businessTheme.heading}`}>
                {filters.from || 'Start'} to {filters.to || 'End'}
              </p>
              <p className={`mt-1 text-sm ${businessTheme.subtext}`}>Use the date controls below to refresh.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {kpiCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className={businessTheme.statCard}
                >
                  <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-white/5 blur-3xl"></div>
                  <div
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${card.tone}`}
                  >
                    <Icon size={20} />
                  </div>
                  <p className={`mt-4 text-[11px] font-bold uppercase tracking-[0.24em] ${businessTheme.label}`}>
                    {card.label}
                  </p>
                  <p className={`mt-3 text-[24px] font-black tracking-tight ${businessTheme.heading}`}>
                    {card.value}
                  </p>
                  <p className={`mt-2 text-sm ${businessTheme.subtext}`}>{card.note}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className={`overflow-hidden ${businessTheme.section}`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className={`text-[11px] font-bold uppercase tracking-[0.24em] ${businessTheme.heading}`}>
              Range Filters
            </p>
            <h4 className={`mt-2 text-2xl font-black tracking-tight ${businessTheme.heading}`}>
              Performance Window
            </h4>
          </div>
          <button
            type="button"
            onClick={() => loadSummary(filters)}
            disabled={loading}
            className={businessTheme.buttonPrimary}
          >
            <CalendarRange size={16} />
            {loading ? 'Loading...' : 'Apply Range'}
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className={businessTheme.label}>
              From Date
            </label>
            <input
              type="date"
              value={filters.from}
              onChange={(event) =>
                setFilters((current) => ({ ...current, from: event.target.value }))
              }
              className={businessTheme.input}
            />
          </div>

          <div className="space-y-2">
            <label className={businessTheme.label}>
              To Date
            </label>
            <input
              type="date"
              value={filters.to}
              onChange={(event) =>
                setFilters((current) => ({ ...current, to: event.target.value }))
              }
              className={businessTheme.input}
            />
          </div>
        </div>
      </section>

      <section className="grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_360px]">
        <div className={`overflow-hidden ${businessTheme.section}`}>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className={`text-[11px] font-bold uppercase tracking-[0.24em] ${businessTheme.heading}`}>
                Revenue Mix
              </p>
              <h4 className={`mt-2 text-2xl font-black tracking-tight ${businessTheme.heading}`}>
                Performance Distribution
              </h4>
            </div>
            <div className={businessTheme.chipSurface}>
              Revenue vs expense blocks
            </div>
          </div>

          <div className="mt-8 space-y-6">
            {channelRows.map((item) => (
              <div key={item.label} className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className={`text-sm font-bold ${businessTheme.heading}`}>{item.label}</p>
                    <p className={`mt-1 text-xs uppercase tracking-[0.18em] ${businessTheme.label}`}>
                      {item.label === 'Expenses'
                        ? 'Cost impact'
                        : `Profit ${formatPrice(item.profit)}`}
                    </p>
                  </div>
                  <p className={`text-lg font-black ${businessTheme.heading}`}>{formatPrice(item.value)}</p>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/[0.05]">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${item.tone}`}
                    style={{ width: `${Math.max((Math.abs(item.value) / maxChannelValue) * 100, 8)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
            {healthCards.map((card) => (
              <div
                key={card.label}
                className={businessTheme.softCard}
              >
                <p className={businessTheme.label}>
                  {card.label}
                </p>
                <p className={`mt-3 text-2xl font-black ${businessTheme.heading}`}>{card.value}</p>
                <p className={`mt-2 text-sm ${businessTheme.subtext}`}>{card.note}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className={`overflow-hidden ${businessTheme.section}`}>
            <p className={`text-[11px] font-bold uppercase tracking-[0.24em] ${businessTheme.heading}`}>
              Net Position
            </p>
            <h4 className={`mt-2 text-2xl font-black tracking-tight ${businessTheme.heading}`}>
              Margin Snapshot
            </h4>

            <div className="mt-8 flex items-center justify-center">
              <div className={businessTheme.ring}>
                <div
                  className="absolute inset-4 rounded-full"
                  style={{
                    background: `conic-gradient(rgb(220 38 38) ${Math.max(
                      productivityRatio,
                      2
                    )}%, rgba(255,255,255,0.06) 0)`,
                  }}
                ></div>
                <div className={businessTheme.donutInner}>
                  <div className="text-center">
                    <p className={`text-3xl font-black ${businessTheme.heading}`}>
                      {Math.round(productivityRatio)}%
                    </p>
                    <p className={businessTheme.label}>
                      Profit Ratio
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <div className={`flex items-center justify-between rounded-[1.3rem] border px-4 py-3 ${isDarkTheme ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'}`}>
                <span className={`text-sm ${businessTheme.subtext}`}>Revenue</span>
                <span className={`text-sm font-bold ${businessTheme.heading}`}>{formatPrice(totalRevenue)}</span>
              </div>
              <div className={`flex items-center justify-between rounded-[1.3rem] border px-4 py-3 ${isDarkTheme ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'}`}>
                <span className={`text-sm ${businessTheme.subtext}`}>Net Profit</span>
                <span className={`text-sm font-bold ${businessTheme.heading}`}>{formatPrice(summary.netProfit || 0)}</span>
              </div>
              <div className={`flex items-center justify-between rounded-[1.3rem] border px-4 py-3 ${isDarkTheme ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'}`}>
                <span className={`text-sm ${businessTheme.subtext}`}>Expenses</span>
                <span className={`text-sm font-bold ${businessTheme.heading}`}>{formatPrice(summary.totalExpenses || 0)}</span>
              </div>
            </div>
          </div>

          <div className={`overflow-hidden ${businessTheme.section}`}>
            <p className={`text-[11px] font-bold uppercase tracking-[0.24em] ${businessTheme.heading}`}>
              Operating Health
            </p>
            <h4 className={`mt-2 text-2xl font-black tracking-tight ${businessTheme.heading}`}>
              Working Day Summary
            </h4>

            <div className="mt-6 space-y-5">
              <div className={`rounded-[1.5rem] border p-4 ${isDarkTheme ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'}`}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className={`text-sm font-bold ${businessTheme.heading}`}>Active Business Days</p>
                    <p className={`mt-1 text-xs uppercase tracking-[0.18em] ${businessTheme.label}`}>
                      Estimated productive days in range
                    </p>
                  </div>
                  <p className={`text-2xl font-black ${businessTheme.heading}`}>{activeDays}</p>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.05]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary-500 to-rose-400"
                    style={{ width: `${Math.max(activeDaysRatio, 6)}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className={`rounded-[1.5rem] border p-4 ${isDarkTheme ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'}`}>
                  <p className={businessTheme.label}>
                    No Sale Days
                  </p>
                  <p className="mt-3 text-2xl font-black text-amber-300">
                    {summary.noSaleDaysCount || 0}
                  </p>
                </div>
                <div className={`rounded-[1.5rem] border p-4 ${isDarkTheme ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'}`}>
                  <p className={businessTheme.label}>
                    Holiday Days
                  </p>
                  <p className="mt-3 text-2xl font-black text-sky-300">
                    {summary.holidayDaysCount || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={`overflow-hidden rounded-[2rem] border p-6 shadow-[0_26px_70px_-42px_rgba(0,0,0,0.95)] ${isDarkTheme ? 'border-primary-500/20 bg-gradient-to-r from-primary-600/10 via-[#151b24] to-[#151b24]' : 'border-primary-200 bg-gradient-to-r from-primary-50 via-white to-slate-50'}`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className={isDarkTheme ? 'flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-[0_18px_38px_-20px_rgba(220,38,38,0.8)]' : 'flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-[0_18px_38px_-20px_rgba(220,38,38,0.8)]'}>
              <Activity size={22} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary-300">
                Summary Alert
              </p>
              <h4 className={`mt-2 text-2xl font-black tracking-tight ${businessTheme.heading}`}>
                Profit health check
              </h4>
             <p className={`mt-2 text-sm ${businessTheme.subtext}`}>
  Net profit is currently {formatPrice(summary.netProfit || 0)} in the selected business window.
</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:w-auto">
            <div className={businessTheme.alertCard}>
              <p className={businessTheme.label}>
                Repair Profit
              </p>
              <p className={`mt-2 text-lg font-black ${businessTheme.heading}`}>
                {formatPrice(summary.totalRepairProfit || 0)}
              </p>
            </div>
            <div className={businessTheme.alertCard}>
              <p className={businessTheme.label}>
                Sales Profit
              </p>
              <p className={`mt-2 text-lg font-black ${businessTheme.heading}`}>
                {formatPrice(summary.totalSalesProfit || 0)}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BusinessSummarySection;
