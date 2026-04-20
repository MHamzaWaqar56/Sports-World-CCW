import { AlertCircle, Trash2 } from 'lucide-react';
import { formatPrice } from '../../utils/price';
import { useThemeStore } from '../../store/useStore.js';

const OfflineSaleItemCard = ({
  item,
  index,
  products,
  canRemove,
  onChange,
  onRemove,
}) => {
  const { theme } = useThemeStore();
  const isDarkTheme = theme === 'dark';

  const cardClass = isDarkTheme
    ? `rounded-[1.75rem] border border-white/10 p-5 shadow-[0_20px_50px_-34px_rgba(0,0,0,0.95)] transition-all hover:bg-white/[0.05] sm:p-6 ${index % 2 === 0 ? 'bg-white/[0.025]' : 'bg-white/[0.04]'}`
    : `rounded-[1.75rem] border border-slate-200 p-5 shadow-[0_20px_50px_-34px_rgba(15,23,42,0.1)] transition-all hover:bg-slate-50 sm:p-6 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`;

  const inputBaseClass = isDarkTheme
    ? 'h-12 w-full min-w-0 appearance-none rounded-2xl border border-white/10 bg-[#0b1118]/70 px-4 text-sm font-semibold text-white outline-none transition-all placeholder:text-slate-600 focus:border-primary-500/50 focus:bg-[#0e141d] focus:shadow-[0_0_0_4px_rgba(220,38,38,0.08)]'
    : 'h-12 w-full min-w-0 appearance-none rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-primary-500/50 focus:bg-slate-50 focus:shadow-[0_0_0_4px_rgba(220,38,38,0.06)]';

  const labelClass = 'text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500';

  const statCardClass = isDarkTheme
    ? 'rounded-[1.25rem] border border-white/10 bg-white/[0.035] px-4 py-3'
    : 'rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3';

  return (
  <div className={cardClass}>
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
      <div className="min-w-0 space-y-2 lg:col-span-5">
        <label className={labelClass}>Product</label>
        <select
          value={item.productId}
          onChange={(event) => onChange('productId', event.target.value)}
          className={inputBaseClass}
          required
        >
          <option value="" disabled>
            Select Product
          </option>
          {products.map((product) => (
            <option key={product._id} value={product._id}>
              {product.name}
            </option>
          ))}
        </select>
        <p className={`truncate text-xs font-semibold ${isDarkTheme ? 'text-slate-500' : 'text-slate-600'}`}>
          #{index + 1} {item.productName || 'Select Product'} | Stock: {item.availableStock ?? 0}
        </p>
      </div>

      <div className="space-y-2 lg:col-span-2">
        <label className={labelClass}>Variant</label>
        {item.hasVariants ? (
          <select
            value={item.variantId || ''}
            onChange={(event) => onChange('variantId', event.target.value)}
            className={inputBaseClass}
            required
          >
            {(item.variantOptions || []).map((variant) => (
              <option key={variant._id} value={variant._id}>
                {variant.name || 'Variant'} | Rs. {Number(variant.price || 0).toFixed(2)} | Stock {variant.countInStock || 0}
              </option>
            ))}
          </select>
        ) : (
          <div className={`${inputBaseClass} flex items-center text-xs ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
            Standard Product
          </div>
        )}
      </div>

      <div className="space-y-2 lg:col-span-1">
        <label className={labelClass}>Qty</label>
        <input
          type="number"
          min="1"
          value={item.quantity}
          onChange={(event) => onChange('quantity', event.target.value)}
          className={inputBaseClass}
          required
        />
      </div>

      <div className="space-y-2 lg:col-span-2">
        <label className={labelClass}>Sale Price</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            Rs.
          </span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={item.salePrice}
            onChange={(event) => onChange('salePrice', event.target.value)}
            className={`${inputBaseClass} pl-14`}
            required
          />
        </div>
      </div>

      <div className="space-y-2 lg:col-span-2">
        <label className={labelClass}>Cost Price</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            Rs.
          </span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={item.costPrice}
            onChange={(event) => onChange('costPrice', event.target.value)}
            className={`${inputBaseClass} pl-14`}
            placeholder="Auto-filled"
            required
          />
        </div>
      </div>
    </div>

    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div className={statCardClass}>
        <p className={labelClass}>Total Sale</p>
        <p className={`mt-2 text-base font-black ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
          {formatPrice(item.lineTotalSale || 0)}
        </p>
      </div>

      <div className={statCardClass}>
        <p className={labelClass}>Total Cost</p>
        <p className={`mt-2 text-base font-black ${isDarkTheme ? 'text-slate-200' : 'text-slate-700'}`}>
          {formatPrice(item.lineTotalCost || 0)}
        </p>
      </div>

      <div className={statCardClass}>
        <p className={labelClass}>Profit</p>
        <p
          className={`mt-2 text-base font-black ${
            item.lineProfit >= 0 ? 'text-emerald-300' : 'text-red-300'
          }`}
        >
          {formatPrice(item.lineProfit || 0)}
        </p>
      </div>

      <div className="flex items-end">
        <button
          type="button"
          onClick={onRemove}
          disabled={!canRemove}
          className={`inline-flex h-14 w-full items-center justify-center gap-2 rounded-[1.25rem] border text-xs font-black uppercase tracking-[0.16em] transition-all disabled:cursor-not-allowed disabled:opacity-40 ${isDarkTheme ? 'border-red-500/20 bg-red-500/10 text-red-200 hover:border-red-500/30 hover:bg-red-500/15' : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'}`}
          aria-label={`Remove item ${index + 1}`}
          title="Remove item"
        >
          <Trash2 size={16} />
          Remove
        </button>
      </div>
    </div>

    {item.error ? (
      <div className={`mt-4 flex items-start gap-2 rounded-2xl border px-4 py-3 text-xs font-semibold leading-5 ${isDarkTheme ? 'border-amber-500/20 bg-amber-500/10 text-amber-200' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
        <AlertCircle size={14} className="mt-0.5 shrink-0" />
        <span>{item.error}</span>
      </div>
    ) : null}
  </div>
  );
};

export default OfflineSaleItemCard;