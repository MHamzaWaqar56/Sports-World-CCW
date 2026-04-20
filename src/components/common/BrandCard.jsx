const BrandCard = ({ brand }) => (
  <div className="group inline-flex flex-shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-7 py-5 transition-all duration-300 hover:border-primary-500/30 hover:bg-primary-500/[0.05] cursor-default select-none dark:border-white/8 dark:bg-slate-800/60">
    {/* Brand short name */}
    <span className="text-lg font-black tracking-tight text-slate-900 transition-colors group-hover:text-primary-500 dark:text-white dark:group-hover:text-primary-400">
      {brand.name}
    </span>
    {/* Full name */}
    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 transition-colors group-hover:text-slate-600 dark:text-slate-400 dark:group-hover:text-slate-300">
      {brand.full}
    </span>
  </div>
);

export default BrandCard;