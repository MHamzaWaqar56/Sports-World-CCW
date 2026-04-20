
import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/product/ProductCard";
import {
  Search, SlidersHorizontal, Check, X, Filter,
  ChevronDown, Sparkles, Star, ArrowRight, Trophy,
  Zap, ShieldCheck, Package, Clock, Tag, TrendingUp,
  Truck, RotateCcw, BadgePercent
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useProductStore } from "../store/useStore";
import { getDisplayPrice } from "../utils/productVariant";
import SEO from '../components/common/SEO';
import { businessInfo, localBusinessSchema, organizationSchema } from '../utils/seo';

const Motion = motion;

/* ─── static data ─────────────────────────────────────────── */
const categoryOptions = [
  { label: "All", values: ["All"] },
  { label: "Bats", values: ["Bats", "Bat"] },
  { label: "Balls", values: ["Balls", "Ball"] },
  { label: "Accessories", values: ["Accessories", "Accessory", "other", "Bag", "Award", "Shaker"] },
  { label: "Gloves", values: ["Gloves", "Glove"] },
  { label: "Shoes", values: ["Shoes", "Shoe", "Footwear"] },
  { label: "Gear", values: ["Kits", "Kit", "Gear", "Bottomware", "Sleeves", "Sleeve"] },
  { label: "Outdoor", values: ["Hockey", "Football", "Bat", "Basketball", "Volleyball", "Outdoor"] },
  { label: "Indoor", values: ["Ludo", "Snooker", "Carrom Board", "Chess", "Racket", "Shuttlecock", "Indoor"] },
];

const resolveCategoryLabel = (rawCategory) => {
  const normalized = String(rawCategory || "").trim().toLowerCase();

  if (!normalized) {
    return "All";
  }

  const matchedOption = categoryOptions.find((option) => {
    const labelMatch = option.label.toLowerCase() === normalized;
    const valueMatch = option.values.some((value) => String(value).toLowerCase() === normalized);
    return labelMatch || valueMatch;
  });

  return matchedOption?.label || "All";
};

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "name", label: "Name: A to Z" },
];

const getShopBadgeLabel = (product) => {
  if (product?.isNewArrival) return "New Arrival";
  if (product?.isFeatured) return "Featured";
  return "";
};
const PRODUCTS_PER_PAGE = 9;

const categoryIcons = {
  All: "🏆", Bats: "🏏", Balls: "⚾", Accessories: "🎒",
  Gloves: "🥊", Shoes: "👟", Gear: "🛡️", Outdoor: "⚽", Indoor: "🎯",
};

const trustStats = [
  { icon: Package, value: "500+", label: "Products" },
  { icon: Trophy, value: "15+", label: "Brands" },
  { icon: Star, value: "4.9★", label: "Avg Rating" },
  { icon: Truck, value: "24hr", label: "Dispatch" },
];

const servicePerks = [
  { icon: Truck, title: "Free Shipping", desc: "On orders above ₨5,000" },
  { icon: RotateCcw, title: "7-Day Returns", desc: "Hassle-free returns" },
  { icon: ShieldCheck, title: "100% Authentic", desc: "Zero counterfeit gear" },
  { icon: BadgePercent, title: "Loyalty Points", desc: "Earn on every order" },
];

/* ─── countdown hook ──────────────────────────────────────── */
function useCountdown(hours = 6) {
  const [time, setTime] = useState({ h: hours, m: 29, s: 59 });
  useEffect(() => {
    const id = setInterval(() => {
      setTime(prev => {
        let { h, m, s } = prev;
        if (s > 0) return { h, m, s: s - 1 };
        if (m > 0) return { h, m: m - 1, s: 59 };
        if (h > 0) return { h: h - 1, m: 59, s: 59 };
        return { h: hours, m: 29, s: 59 };
      });
    }, 1000);
    return () => clearInterval(id);
  }, [hours]);
  return time;
}

/* ─── component ───────────────────────────────────────────── */
const Shop = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [category, setCategory] = useState(
    resolveCategoryLabel(searchParams.get("category"))
  );
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [minRating, setMinRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState(15000);
  const [currentPage, setCurrentPage] = useState(1);
  const countdown = useCountdown(6);

  const { products, loading, fetchProducts, productPages, totalProducts } = useProductStore();

  useEffect(() => {
    if (typeof fetchProducts === "function") {
      fetchProducts({ page: currentPage, limit: PRODUCTS_PER_PAGE }).catch(() => {});
    }
  }, [fetchProducts, currentPage]);
  useEffect(() => {
    setCategory(resolveCategoryLabel(searchParams.get("category")));
  }, [searchParams]);

  const triggerLocalLoading = () => { setLocalLoading(true); setTimeout(() => setLocalLoading(false), 250); };

  const goToPage = (nextPage) => {
    const maxPages = Math.max(1, productPages || Math.ceil((totalProducts || 0) / PRODUCTS_PER_PAGE) || 1);
    const safePage = Math.min(Math.max(1, nextPage), maxPages);

    if (safePage === currentPage) {
      return;
    }

    triggerLocalLoading();
    setCurrentPage(safePage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCategoryChange = (sel) => {
    triggerLocalLoading();
    setCategory(sel);
    setCurrentPage(1);
    if (sel === "All") { const p = new URLSearchParams(searchParams); p.delete("category"); setSearchParams(p); return; }
    setSearchParams({ category: sel });
  };

  const handleSearchChange = (e) => { triggerLocalLoading(); setSearchTerm(e.target.value); setCurrentPage(1); };

  const safeProducts = useMemo(() => Array.isArray(products) ? products : [], [products]);

  const highestPrice = useMemo(() => {
    const m = safeProducts.reduce(
      (max, p) => Math.max(max, Number(getDisplayPrice(p) || 0)),
      0
    );
    return Math.max(15000, Math.ceil(m / 500) * 500 || 15000);
  }, [safeProducts]);

  useEffect(() => { setMaxPrice(highestPrice); }, [highestPrice]);

  const clearFilters = () => {
    triggerLocalLoading();
    setSearchTerm(""); setCategory("All"); setSortBy("featured");
    setMinRating(0); setMaxPrice(highestPrice);
    setShowMobileFilters(false); setSearchParams({}); setCurrentPage(1);
  };

  const filteredProducts = useMemo(() => {
    const active = categoryOptions.find(i => i.label === category);
    return [...safeProducts.filter(product => {
      const name = String(product?.name || "").toLowerCase();
      const cat = String(product?.category || "").toLowerCase();
      return (
        name.includes(searchTerm.toLowerCase()) &&
        (!active || category === "All" || active.values.some(v => cat === v.toLowerCase())) &&
        Number(getDisplayPrice(product) || 0) <= maxPrice &&
        Number(product?.rating || 0) >= minRating
      );
    })].sort((a, b) => {
      if (sortBy === "price-low") return Number(getDisplayPrice(a) || 0) - Number(getDisplayPrice(b) || 0);
      if (sortBy === "price-high") return Number(getDisplayPrice(b) || 0) - Number(getDisplayPrice(a) || 0);
      if (sortBy === "rating") return Number(b?.rating || 0) - Number(a?.rating || 0);
      if (sortBy === "name") return String(a?.name || "").localeCompare(String(b?.name || ""));
      return 0;
    });
  }, [safeProducts, searchTerm, category, maxPrice, minRating, sortBy]);

  const isDataLoading = loading || localLoading;
  const hasActiveFilters = searchTerm || category !== "All" || minRating > 0 || maxPrice < highestPrice || sortBy !== "featured";
  const pad = n => String(n).padStart(2, "0");
  const totalPageCount = Math.max(1, productPages || Math.ceil((totalProducts || 0) / PRODUCTS_PER_PAGE) || 1);
  const visiblePageStart = Math.max(1, currentPage - 2);
  const visiblePageEnd = Math.min(totalPageCount, visiblePageStart + 4);
  const pageNumbers = Array.from({ length: visiblePageEnd - visiblePageStart + 1 }, (_, index) => visiblePageStart + index);

  return (
    <div className="min-h-screen pb-24">
      <SEO
        title="Shop Sports Equipment Online | Sports World Chichawatni"
        description="Browse cricket bats, footballs, hockey sticks, footwear, sleeves, tennis equipment, basketballs, kabaddi gear, indoor games, outdoor games, and sports accessories at Sports World Chichawatni."
        canonicalPath="/shop"
        keywords={businessInfo.keywords}
        structuredData={[organizationSchema(), localBusinessSchema()]}
      />

      {/* ══════════════════════════════════════════
          HERO BANNER
      ══════════════════════════════════════════ */}
      <div className="container-bound pt-6 sm:pt-8">
        <div className="relative mb-8 overflow-hidden rounded-[2.25rem] border border-white/10 bg-[#0c1017] px-5 py-14 shadow-[0_28px_80px_-40px_rgba(0,0,0,0.9)] sm:px-6 sm:py-16 md:px-10 md:py-24">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(220,38,38,0.18),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_24%)]" />
          <div className="absolute inset-0 opacity-20">
            <img src="https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80" alt="backdrop" className="h-full w-full object-cover" loading="lazy" decoding="async" />
          </div>
          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <div className="mb-5 inline-flex min-[320px]:max-[380px]:text-[10px] text-white items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-bold uppercase tracking-[0.26em] text-primary-300 backdrop-blur-xl">
              <Sparkles size={13} />Performance Collection
            </div>
            <h1 className="mb-4 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl md:mb-5 md:text-6xl">
              Premium <span className="text-primary-500">Cricket & Sports</span> Gear
            </h1>
            <p className="mx-auto max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
              Explore the full Sports World collection with premium gear for match day, training, recovery, and every serious upgrade in between.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-slate-400 max-[767px]:hidden">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-primary-500" />Premium athletic goods
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2">
                <Star size={14} className="fill-yellow-400 text-yellow-400" />Trusted by serious players
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2">
                <Zap size={14} className="text-primary-400" />24hr Dispatch
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          TRUST STATS BAR  (matches About stats bar)
      ══════════════════════════════════════════ */}
      <div className="container-bound mb-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {trustStats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="relative overflow-hidden rounded-2xl border border-white/10 dark:bg-slate-800/60 bg-white p-5 group hover:-translate-y-1 transition-transform duration-300">
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-primary-600/10  rounded-full opacity-60 group-hover:scale-150 transition-transform duration-500" />
              <s.icon size={18} className="text-primary-400 mb-2 relative z-10" />
              <p className="text-2xl font-black  relative z-10">{s.value}</p>
              <p className="text-xs font-semibold text-slate-400 relative z-10">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>


      {/* ══════════════════════════════════════════
          DEAL OF THE DAY BANNER
      ══════════════════════════════════════════ */}
      <div className="container-bound mb-10">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0d0f14] p-5 sm:p-6 md:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.15),transparent_60%)]" />
          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-8">
            <div className="space-y-3 text-center md:text-left">
              <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-primary-500/40 bg-primary-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">
                <span className="h-2 w-2 animate-pulse rounded-full bg-primary-500" />Deal of the Day
              </div>
              <h3 className="text-xl font-black leading-tight text-white sm:text-2xl md:text-3xl">
                Season Opener Sale — Up to <span className="text-primary-500">20% Off</span>
              </h3>
              <p className="mx-auto max-w-xl text-sm text-slate-400 md:mx-0">
                Limited stock. Premium gear at unbeatable prices.
              </p>
            </div>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:flex-wrap sm:justify-center md:shrink-0 md:justify-end">
              <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-3">
                {[["Hrs", pad(countdown.h)], ["Min", pad(countdown.m)], ["Sec", pad(countdown.s)]].map(([label, val]) => (
                  <div key={label} className="min-w-[88px] rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-center sm:min-w-[64px]">
                    <p className="text-lg font-black text-white tabular-nums sm:text-xl">{val}</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => handleCategoryChange("All")}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-primary-500 shadow-lg shadow-primary-600/25 sm:w-auto">
                Shop Sale <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          MAIN LAYOUT  (sidebar + grid)
      ══════════════════════════════════════════ */}
      <div className="container-bound">
        <div className="flex flex-col gap-10 lg:flex-row">

          {/* ── DESKTOP SIDEBAR ── */}
          <div className="hidden space-y-6 lg:block lg:w-[300px]">

            {/* Search */}
            <div className="rounded-[2rem] border border-white/10 bg-[#11151d] p-6 shadow-[0_24px_70px_-38px_rgba(0,0,0,0.9)]">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-white">
                <Search size={16} className="text-primary-500" />Search Catalog
              </h3>
              <div className="relative">
                <input type="text" placeholder="Search premium gear..." value={searchTerm} onChange={handleSearchChange}
                  className="input-premium h-12 w-full focus:bg-transparent border-white/10 bg-white/[0.05] pl-11 pr-10 text-white placeholder:text-slate-500 focus:border-primary-600 focus:ring-primary-600/20" />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                {searchTerm && (
                  <button type="button" onClick={() => { triggerLocalLoading(); setSearchTerm(""); }}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full bg-white/[0.06] p-1 text-slate-400 hover:text-red-500">
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Category */}
            <div className="rounded-[2rem] border border-white/10 bg-[#11151d] p-6 shadow-[0_24px_70px_-38px_rgba(0,0,0,0.9)]">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-white">
                <Filter size={16} className="text-primary-500" />Category
              </h3>
              <ul className="space-y-2">
                {categoryOptions.map((item) => (
                  <li key={item.label}>
                    <button type="button" onClick={() => handleCategoryChange(item.label)}
                      className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left font-medium transition-all duration-300 ${
                        category === item.label
                          ? "border-primary-500/40 bg-primary-600/12 text-white"
                          : "border-transparent text-slate-400 hover:border-white/10 hover:bg-white/[0.04] hover:text-white"
                      }`}>
                      <span className="flex items-center gap-2">
                        <span>{categoryIcons[item.label]}</span>{item.label}
                      </span>
                      {category === item.label && <Check size={16} className="text-primary-400" />}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Range */}
            <div className="rounded-[2rem] border border-white/10 bg-[#11151d] p-6 shadow-[0_24px_70px_-38px_rgba(0,0,0,0.9)]">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-white">
                <Tag size={16} className="text-primary-500" />Price Range
              </h3>
              <input type="range" min="0" max={highestPrice} step="500" value={maxPrice}
                onChange={(e) => { triggerLocalLoading(); setMaxPrice(Number(e.target.value)); }}
                className="h-2 w-full cursor-pointer accent-primary-500" />
              <div className="mt-4 flex items-center justify-between">
                <span className="rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-bold text-slate-400">₨ 0</span>
                <span className="rounded-lg border border-primary-500/30 bg-primary-500/10 px-3 py-1.5 text-xs font-bold text-white">₨ {maxPrice.toLocaleString()}</span>
              </div>
            </div>

            {/* Rating */}
            <div className="rounded-[2rem] border border-white/10 bg-[#11151d] p-6 shadow-[0_24px_70px_-38px_rgba(0,0,0,0.9)]">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-white">
                <Star size={16} className="text-primary-500" />Minimum Rating
              </h3>
              <div className="space-y-2">
                {[0, 3, 4].map((value) => (
                  <button key={value} type="button" onClick={() => { triggerLocalLoading(); setMinRating(value); }}
                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                      minRating === value
                        ? "border-primary-500/40 bg-primary-600/12 text-white"
                        : "border-transparent text-slate-400 hover:border-white/10 hover:bg-white/[0.04] hover:text-white"
                    }`}>
                    <span>{value === 0 ? "All Ratings" : `${value} Stars & Up`}</span>
                    <div className="flex gap-0.5 text-yellow-400">
                      {[...Array(value || 5)].map((_, idx) => <Star key={idx} size={11} className="fill-yellow-400" />)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Pro callout — matches About page card style */}
            <div className="rounded-[2rem] border border-primary-500/20 bg-[linear-gradient(180deg,rgba(220,38,38,0.16),rgba(14,20,30,0.85))] p-6 shadow-[0_24px_70px_-38px_rgba(220,38,38,0.4)]">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary-300">
                <Trophy size={11} />Pakistan's #1 Sports Store
              </div>
              <h3 className="text-xl font-black text-white">Built for match-ready confidence.</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">Use filters to narrow by category, price, and rating to find your perfect gear.</p>
            </div>

            {hasActiveFilters && (
              <button type="button" onClick={clearFilters}
                className="w-full rounded-xl border border-white/10 py-3 text-sm font-bold uppercase tracking-[0.18em] text-red-400 transition-colors hover:bg-red-500/10">
                Clear All Filters
              </button>
            )}
          </div>

          {/* ── MAIN CONTENT ── */}
          <div className="lg:flex-1">

            {/* Mobile filters */}
            <div className="mb-6 flex flex-col gap-4 lg:hidden">
              <div className="flex justify-between items-center gap-4">
                <button type="button" onClick={() => setShowMobileFilters(p => !p)}
                  className="btn-secondary h-12 flex-1 border-white/10 dark:bg-white/[0.05] dark:text-white">
                  <SlidersHorizontal size={18} />Filters
                  {hasActiveFilters && <span className="w-2.5 h-2.5 rounded-full bg-primary-600 shadow-sm shadow-primary-600/50" />}
                </button>
                <div className="relative flex-1">
                  <input type="text" placeholder="Search..." value={searchTerm} onChange={handleSearchChange}
                    className="input-premium h-12 w-full border-white/10 dark:bg-white/[0.05] pl-10 dark:text-white placeholder:text-slate-500" />
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                </div>
              </div>
              <AnimatePresence>
                {showMobileFilters && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="rounded-[1.6rem] border border-white/10 bg-[#11151d] p-5">
                      <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-white">Categories</h3>
                      <div className="flex flex-wrap gap-2">
                        {categoryOptions.map((item) => (
                          <button type="button" key={item.label} onClick={() => { handleCategoryChange(item.label); setShowMobileFilters(false); }}
                            className={`rounded-full border px-5 py-2.5 text-sm font-medium transition-colors ${
                              category === item.label
                                ? "bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-600/20"
                                : "bg-transparent text-slate-300 border-white/10 hover:border-primary-600"
                            }`}>
                            {categoryIcons[item.label]} {item.label}
                          </button>
                        ))}
                      </div>
                    
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sort / results bar */}
            <div className="mb-8 flex flex-col gap-5 rounded-[2rem] border border-white/10 bg-[#11151d] p-6 shadow-[0_24px_70px_-38px_rgba(0,0,0,0.9)] xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight text-white">
                  {category === "All" ? "All Products" : category}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Premium gear for players who want performance and clean design.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative min-w-[220px]">
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                    className="input-premium h-12 w-full  focus:bg-transparent appearance-none border-white/10 bg-white/[0.05] pr-10 text-white">
                    {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                </div>
                <p className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-medium text-slate-400">
                  <span className="font-bold text-white">{isDataLoading ? "..." : filteredProducts.length}</span> Results
                </p>
              </div>
            </div>

            {/* Product grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {isDataLoading ? (
                [...Array(6)].map((_, i) => (
                  <div key={`skel-${i}`} className="h-[520px] rounded-[2rem] border border-white/10 bg-white/[0.05] animate-pulse" />
                ))
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product, index) => (
                  <motion.div key={product?._id || index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: index * 0.03 }} className="h-full">
                    <ProductCard product={product} variant="shop" badgeLabel={getShopBadgeLabel(product)} />
                  </motion.div>
                ))
              ) : (
                /* ── EMPTY STATE ── */
                <div className="col-span-full rounded-[2rem] border border-white/10 bg-[#11151d] px-6 py-16 text-center">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-500/10">
                    <Search size={32} className="text-white" />
                  </div>
                  <h2 className="mb-2 text-2xl font-black text-white">No Products Found</h2>
                  <p className="mx-auto mb-3 max-w-md text-slate-400">
                    We couldn't find any products matching your current filters or search term{" "}
                    {searchTerm && <span className="font-bold text-slate-200">"{searchTerm}"</span>}.
                  </p>
                  <p className="mb-8 text-sm text-slate-500">Try adjusting your filters or clearing the search.</p>
                  <button type="button" onClick={clearFilters} className="btn-primary inline-flex px-8 h-12">
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>

            {/* Bottom pagination hint */}
            <div className="mt-12 flex flex-col items-center gap-4">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white dark:bg-[#11151d] px-5 py-3 text-sm ">
                Showing page <span className="font-black ">{currentPage}</span> of <span className="font-black">{totalPageCount}</span>
                <ArrowRight size={16} className="text-primary-400" />
              </div>

              {totalPageCount > 1 && (
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="rounded-full border border-white/10 bg-white dark:bg-[#11151d] px-4 py-2 text-sm font-bold  transition-colors hover:border-primary-500/40 hover:bg-primary-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Prev
                  </button>

                  {pageNumbers.map((pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => goToPage(pageNumber)}
                      className={`min-w-11 rounded-full border px-4 py-2 text-sm font-bold transition-colors ${
                        pageNumber === currentPage
                          ? "border-primary-500 bg-primary-600 text-white"
                          : "border-white/10 dark:bg-[#11151d] bg-white  hover:border-primary-500/40 hover:bg-primary-500/10 hover:text-white"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPageCount}
                    className="rounded-full border border-white/10 bg-white dark:bg-[#11151d] px-4 py-2 text-sm font-bold  transition-colors hover:border-primary-500/40 hover:bg-primary-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          SERVICE PERKS BAR  (matches About page style)
      ══════════════════════════════════════════ */}
      <div className="container-bound mt-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {servicePerks.map((perk, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white dark:bg-slate-800/60 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/20">
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-primary-600/10 rounded-full opacity-60 group-hover:scale-150 transition-transform duration-500" />
              <div className="mb-3 inline-flex rounded-xl bg-primary-500/12 p-2.5 text-primary-400 relative z-10">
                <perk.icon size={18} />
              </div>
              <p className="font-black text-sm relative z-10">{perk.title}</p>
              <p className="text-xs text-slate-400 mt-1 relative z-10">{perk.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          BOTTOM CTA  (matches About page CTA style)
      ══════════════════════════════════════════ */}
      <div className="container-bound mt-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900 p-10 text-center lg:p-16">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:40px_40px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-600/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10 max-w-xl mx-auto">
            <div className="mb-4 inline-flex items-center text-white gap-2 rounded-full border border-primary-500/30 bg-primary-500/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary-300">
              <TrendingUp size={12} />New Arrivals Every Week
            </div>
            <h2 className="text-3xl font-black text-white md:text-4xl mb-4">
              Can't find what you need?
            </h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              Our catalog grows every week. Reach out to our team and we'll source the gear you need, guaranteed authentic and at competitive prices.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button type="button" onClick={() => handleCategoryChange("All")}
                className="btn-primary inline-flex h-14 px-8 items-center justify-center text-base font-bold shadow-xl shadow-primary-600/30">
                Browse All Products <ArrowRight size={18} />
              </button>
              <a href="mailto:sportsworldccw@gmail.com"
                className="btn-secondary inline-flex h-14 px-8 items-center justify-center text-base border-white/15 bg-white/[0.04] text-white hover:bg-white/10">
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Shop;