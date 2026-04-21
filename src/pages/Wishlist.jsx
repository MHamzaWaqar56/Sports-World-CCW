import React, { useEffect, useMemo, useState } from 'react';
import { useWishlistStore } from '../store/useWishlistStore';
import { useAuthStore } from '../store/useStore.js';
import ProductCard from '../components/product/ProductCard';
import {
  Heart, ShoppingBag, Trash2, LogIn, Sparkles,
  TrendingUp, Shield, Zap, Star, ArrowRight, Package
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Motion = motion;
const PRODUCTS_PER_PAGE = 4;


const suggestedCategories = [
  { label: "Cricket Bats",      href: "/shop?category=Bats",        emoji: "🏏" },
  { label: "Protective Gear",   href: "/shop?category=Gear",        emoji: "🛡️" },
  { label: "Shoes",             href: "/shop?category=Shoes",       emoji: "👟" },
  { label: "Accessories",       href: "/shop?category=Accessories", emoji: "🎒" },
  { label: "Outdoor Sports",    href: "/shop?category=Outdoor",     emoji: "⚽" },
  { label: "Indoor Games",      href: "/shop?category=Indoor",      emoji: "🎯" },
];

const whyWishlist = [
  { icon: Heart,    title: "Save for Later",    desc: "Pin gear you love and come back when you're ready to buy."        },
  { icon: Zap,      title: "Quick Add to Cart", desc: "Move saved items to your cart instantly with one tap."            },
  { icon: Shield,   title: "Price Tracking",    desc: "Get notified when your saved items go on sale or drop in price."  },
  { icon: Star,     title: "Curate Your Kit",   desc: "Build your perfect match-day loadout before committing."         },
];

/* ─── Not Logged In State ─────────────────────────────────── */
const NotLoggedIn = () => (
  <div className="min-h-screen pb-24">
 

    <div className="container-bound pt-16 flex items-center justify-center min-h-[80vh]">
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-lg text-center"
      >
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0c1017] p-12 shadow-[0_28px_80px_-40px_rgba(0,0,0,0.9)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(220,38,38,0.12),transparent_60%)]" />
          <div className="relative z-10">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/[0.05]">
              <Heart size={36} className="text-white" />
            </div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-white">
              <LogIn size={11} />Login Required
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tight text-white mb-4 min-[320px]:max-[430px]:text-[26px] min-[320px]:max-[430px]:leading-[32px]">
              Sign In to View<br />Your Wishlist
            </h2>
            <p className="text-slate-400 text-sm leading-7 mb-8 min-[320px]:max-[430px]:leading-[20px]">
              Save your favorite Sports World gear, track prices, and build your perfect match-day kit. Login to access your personal wishlist.
            </p>
            <div className="flex flex-col gap-3">
              <Link to="/login"
                className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl bg-primary-600 px-8 py-4 text-sm font-black uppercase tracking-[0.14em] text-white transition-all hover:bg-primary-500 shadow-lg shadow-primary-600/25">
                <LogIn size={16} />Login to Your Account
              </Link>
              <Link to="/shop"
                className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-8 py-4 text-sm font-bold text-slate-300 transition-all hover:bg-white/[0.08] hover:text-white">
                <ShoppingBag size={16} />Browse Collection
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  </div>
);

/* ─── Empty Wishlist State ────────────────────────────────── */
const EmptyWishlist = () => (
  <div className="space-y-12">
    {/* Empty hero */}
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0c1017] p-12 text-center shadow-[0_28px_80px_-40px_rgba(0,0,0,0.9)]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.1),transparent_60%)]" />
      <div className="relative z-10">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/[0.05]">
          <Heart size={36} className="text-white" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-3">
          Your Wishlist is Empty
        </h2>
        <p className="text-slate-400 text-sm leading-7 mb-8 max-w-md mx-auto">
          You haven't saved any gear yet. Browse our premium collection and tap the heart icon on any product to save it here.
        </p>
        <Link to="/shop"
          className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-8 py-4 text-sm font-black uppercase tracking-[0.14em] text-white transition-all hover:bg-primary-500 shadow-lg shadow-primary-600/25">
          <ShoppingBag size={16} />Explore Collection <ArrowRight size={15} />
        </Link>
      </div>
    </motion.div>

    {/* Why use wishlist */}
    <div>
      <div className="text-center mb-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 dark:bg-white/[0.04] bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.26em] ">
          <Sparkles size={12} />Wishlist Features
        </div>
        <h3 className="text-2xl font-black uppercase tracking-tight ">Why Save to Wishlist?</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {whyWishlist.map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-white dark:bg-slate-800/60 p-5 group hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-primary-600/10 rounded-full opacity-60 group-hover:scale-150 transition-transform duration-500" />
            <div className="mb-3 inline-flex rounded-xl bg-primary-500/12 p-2.5 text-primary-400 relative z-10">
              <item.icon size={17} />
            </div>
            <p className="font-black text-sm mb-1 relative z-10">{item.title}</p>
            <p className="text-xs text-slate-400 leading-5 relative z-10">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>

    {/* Browse categories */}
    <div>
      <div className="text-center mb-8">
        <h3 className="text-2xl font-black uppercase tracking-tight ">Browse by Category</h3>
        <p className="text-slate-400 text-sm mt-2">Find gear worth saving to your wishlist.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {suggestedCategories.map((cat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
            <Link to={cat.href}
              className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white dark:bg-slate-800/60 p-4 text-center transition-all hover:border-primary-500/40 hover:bg-primary-600/8 hover:-translate-y-1 group">
              <span className="text-2xl">{cat.emoji}</span>
              <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">{cat.label}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

/* ─── Main Component ──────────────────────────────────────── */
const Wishlist = () => {
  const { wishlistItems, clearWishlist, fetchWishlist } = useWishlistStore();
  const { userInfo } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPageCount = Math.max(1, Math.ceil(wishlistItems.length / PRODUCTS_PER_PAGE));
  const visiblePageStart = Math.max(1, currentPage - 2);
  const visiblePageEnd = Math.min(totalPageCount, visiblePageStart + 4);
  const pageNumbers = Array.from(
    { length: visiblePageEnd - visiblePageStart + 1 },
    (_, index) => visiblePageStart + index
  );

  const paginatedWishlistItems = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return wishlistItems.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  }, [wishlistItems, currentPage]);

  useEffect(() => {
    if (userInfo) fetchWishlist();
  }, [userInfo, fetchWishlist]);

  useEffect(() => {
    if (currentPage > totalPageCount) {
      setCurrentPage(totalPageCount);
    }
  }, [currentPage, totalPageCount]);

  const goToPage = (nextPage) => {
    const safePage = Math.min(Math.max(1, nextPage), totalPageCount);

    if (safePage === currentPage) return;

    setCurrentPage(safePage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearWishlist = async () => {
    try {
      setLoading(true);
      await clearWishlist();
      setShowConfirm(false);
    } catch (e) {
      console.error('Failed to clear wishlist', e);
    } finally {
      setLoading(false);
    }
  };

  if (!userInfo) return <NotLoggedIn />;

  return (
    <div className="min-h-screen pb-24">

   
      {/* ══════════════════════════════════════════
          HERO BANNER
      ══════════════════════════════════════════ */}
      <div className="container-bound pt-8">
        <div className="relative mb-8 overflow-hidden rounded-[2.25rem] border border-white/10 bg-[#0c1017] px-6 py-14 shadow-[0_28px_80px_-40px_rgba(0,0,0,0.9)] md:px-10 md:py-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(220,38,38,0.18),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_24%)]" />
          <div className="absolute inset-0 opacity-10">
            <img src="https://res.cloudinary.com/da8lxpc3h/image/upload/v1776738944/hero-bg_g8kry5.avif" alt="backdrop" className="h-full w-full object-cover" loading="lazy" decoding="async" />
          </div>
          <div className="relative z-10 flex flex-col items-center gap-6 text-center">
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-bold uppercase tracking-[0.26em] text-white backdrop-blur-xl min-[320px]:max-[392px]:text-[10px]"
              >
                <Heart size={12} className="fill-primary-400 text-primary-400" />Your Personal Collection
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                className="text-4xl font-black uppercase tracking-tight text-white md:text-5xl mb-3"
              >
                Your <span className="text-primary-500">Wishlist</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
                className="max-w-xl text-base leading-7 text-slate-300 min-[320px]:max-[430px]:leading-[20px]"
              >
                Your saved premium gear — ready when you are. Every item you've hearted lives here.
              </motion.p>
            </div>

            {/* Stats pills */}
            {wishlistItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
                className="flex flex-wrap justify-center gap-3 min-[320px]:max-[430px]:flex-nowrap"
              >
                <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3 text-center">
                  <p className="text-2xl font-black text-white">{wishlistItems.length}</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Saved Items</p>
                </div>
                <div className="rounded-2xl border border-primary-500/30 bg-primary-500/10 px-5 py-3 text-center">
                  <p className="text-2xl font-black text-white">
                    ₨{wishlistItems.reduce((sum, p) => sum + Number(p?.price || 0), 0).toLocaleString()}
                  </p>
                  <p className="text-xs font-bold uppercase tracking-widest text-white">Total Value</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          TRUST STATS BAR
      ══════════════════════════════════════════ */}
      {wishlistItems.length > 0 && (
        <div className="container-bound mb-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Package, value: wishlistItems.length,         label: "Items Saved"         },
              { icon: Shield,  value: "100%",                       label: "Authentic Gear"      },
              { icon: Zap,     value: "24hr",                       label: "Dispatch Available"  },
              { icon: Star,    value: "4.9★",                       label: "Store Rating"        },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-white dark:bg-slate-800/60  p-5 group hover:-translate-y-1 transition-transform duration-300">
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-primary-600/10 rounded-full opacity-60 group-hover:scale-150 transition-transform duration-500" />
                <s.icon size={17} className="text-primary-400 mb-2 relative z-10" />
                <p className="text-2xl font-black relative z-10">{s.value}</p>
                <p className="text-xs font-semibold text-slate-400 relative z-10">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════ */}
      <div className="container-bound">
        {wishlistItems.length === 0 ? (
          <EmptyWishlist />
        ) : (
          <div>
            {/* Toolbar */}
            <div className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-[#11151d] p-5 sm:flex-row sm:items-center sm:justify-between shadow-[0_24px_70px_-38px_rgba(0,0,0,0.9)]">
              <div>
                <h2 className="text-lg font-black uppercase tracking-tight text-white">
                  Saved Items
                  <span className="ml-3 rounded-full border border-white/10 bg-white/[0.06] px-3 py-0.5 text-sm font-bold text-slate-400">
                    {wishlistItems.length}
                  </span>
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Items saved to your Sports World wishlist
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link to="/shop"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-bold text-slate-300 transition-all hover:bg-white/[0.08] hover:text-white">
                  <ShoppingBag size={14} />Continue Shopping
                </Link>
                <button
                  type="button"
                  onClick={() => setShowConfirm(true)}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-2.5 text-xs font-bold text-red-400 transition-all hover:bg-red-500/15 disabled:opacity-50"
                >
                  <Trash2 size={14} />Clear All
                </button>
              </div>
            </div>

            {/* Confirm Clear Modal */}
            <AnimatePresence>
              {showConfirm && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="mb-6 rounded-2xl border border-red-500/20 bg-white dark:bg-slate-800/60 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-red-500/15 flex items-center justify-center shrink-0">
                      <Trash2 size={14} className="text-red-400" />
                    </div>
                    <p className="text-sm font-bold">
                      Remove all {wishlistItems.length} items from your wishlist?
                      <span className="block text-xs font-normal text-slate-400 mt-0.5">This action cannot be undone.</span>
                    </p>
                  </div>
                  <div className="flex gap-3 shrink-0">
                    <button type="button" onClick={() => setShowConfirm(false)}
                      className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-bold  hover:bg-white/[0.1]">
                      Cancel
                    </button>
                    <button type="button" onClick={handleClearWishlist} disabled={loading}
                      className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-500 disabled:opacity-50 flex items-center gap-2">
                      {loading
                        ? <><span className="h-3 w-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />Clearing...</>
                        : <><Trash2 size={12} />Yes, Clear All</>}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Product grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence>
                {paginatedWishlistItems.map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, scale: 0.95, y: 16 }}
                    animate={{ opacity: 1, scale: 1,  y: 0  }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.04 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>


            {/* Pagination */}
            {totalPageCount > 1 && (
              <div className="mt-6 flex flex-col items-center gap-4">
                <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white dark:bg-[#11151d] px-5 py-3 text-sm ">
                  Showing page <span className="font-black ">{currentPage}</span> of <span className="font-black">{totalPageCount}</span>
                  <ArrowRight size={16} className="text-primary-400" />
                </div>

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
                          ? 'border-primary-500 bg-primary-600 text-white'
                          : 'border-white/10 dark:bg-[#11151d] bg-white  hover:border-primary-500/40 hover:bg-primary-500/10 hover:text-white'
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
              </div>
            )}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════
          BOTTOM CTA  (matches About/Shop/Contact)
      ══════════════════════════════════════════ */}
      <div className="container-bound mt-16">
        <div className="relative overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900 p-10 text-center lg:p-16">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:40px_40px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-600/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10 max-w-xl mx-auto">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white">
              <TrendingUp size={12} />New Arrivals Weekly
            </div>
            <h2 className="text-3xl font-black text-white md:text-4xl mb-4 min-[320px]:max-[430px]:text-[26px] min-[320px]:max-[430px]:leading-[32px]">
              Ready to upgrade your game?
            </h2>
            <p className="text-slate-400 mb-8 leading-relaxed min-[320px]:max-[400px]:hidden">
              Browse the full Sports World collection and discover premium gear worth adding to your wishlist — delivered right to your door in Chichawatni.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/shop"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-primary-600 px-8 text-sm font-black uppercase tracking-[0.12em] text-white transition-all hover:bg-primary-500 shadow-xl shadow-primary-600/30">
                <ShoppingBag size={16} />Explore Collection
              </Link>
              <Link to="/contact"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.04] px-8 text-sm font-bold text-white transition-all hover:bg-white/10">
                <Heart size={16} />Need Help?
              </Link>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Wishlist;