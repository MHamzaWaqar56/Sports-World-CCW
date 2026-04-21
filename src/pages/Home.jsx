import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';
import {
  ArrowRight, ChevronRight, Quote, ShieldCheck,
  Star, Trophy, TrendingUp, Zap, CheckCircle2, XCircle,
  Truck, RotateCcw, Headphones, BadgePercent, Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useProductStore } from '../store/useStore';
import { useReviewStore } from '../store/useReviewStore';
import InfiniteReviewCarousel from '../components/common/InfiniteReviewCarousel';
import SEO from '../components/common/SEO';
import { businessInfo, localBusinessSchema, organizationSchema, websiteSchema } from '../utils/seo';

/* ─── static data ─────────────────────────────────────────── */
const collectionHighlights = [
  { name: 'Cricket Bats', image: 'https://res.cloudinary.com/da8lxpc3h/image/upload/v1776739759/bat-collection_hq8qgl.avif', href: '/shop?category=Bats', desc: 'Hand-finished willow built for timing, pickup, and explosive middle.' },
  { name: 'Protective Gear', image: 'https://res.cloudinary.com/da8lxpc3h/image/upload/v1776738944/hero-bg_g8kry5.avif', href: '/shop?category=Kits', desc: 'Pads, gloves, and guards designed for confident all-match protection.' },
  { name: 'Footwear', image: 'https://res.cloudinary.com/da8lxpc3h/image/upload/v1776739971/sportsworld-footware-collection_rd6gce.avif', href: '/shop?category=Footwear', desc: 'Performance-first grip and comfort for training blocks and match days.' },
  { name: 'Training Essentials', image: 'https://res.cloudinary.com/da8lxpc3h/image/upload/v1776740045/training-essentials_ny29o0.jpg', href: '/shop?category=Accessories', desc: 'Practice tools and utility gear that sharpen every session.' },
];

const featuredCallouts = [
  'Match-ready willow selection',
  'Fast-moving essentials for the season',
  'Trusted by players, clubs, and academies',
];

const tickerItems = [
  { icon: Truck, text: 'Free Shipping on Orders Over ₨5,000' },
  { icon: Zap, text: '24-Hour Dispatch on All In-Stock Items' },
  { icon: Trophy, text: 'Grade A English Willow Now In Stock' },
  { icon: BadgePercent, text: 'Flat 5% Off on First Order — Use: SPORTSWORLD26' },
  { icon: ShieldCheck, text: 'Authentic Gear. Zero Counterfeits. Guaranteed.' },
  { icon: RotateCcw, text: 'New Season Kits Dropped — Shop Now' },
];

const compareRows = [
  { feature: 'Grade A English Willow', us: true, others: false },
  { feature: 'Professional Player Testing', us: true, others: false },
  { feature: 'Same-Day Dispatch', us: true, others: false },
  { feature: 'Authenticity Guarantee', us: true, others: true },
  { feature: '7-Day Easy Returns', us: true, others: false },
  { feature: 'Academy Bulk Pricing', us: true, others: false },
  { feature: 'Dedicated Support', us: true, others: false },
];

const serviceFeatures = [
  { icon: Truck, title: 'Free Shipping', desc: 'On all orders above ₨5,000. Same-day dispatch for in-stock items.', badge: '5K+ Orders' },
  { icon: RotateCcw, title: '7-Day Returns', desc: 'Not satisfied? Return within 7 days for a full refund or exchange.', badge: 'Hassle Free' },
  { icon: Headphones, title: '24/7 Support', desc: 'Our athlete-support team is available around the clock for queries.', badge: 'Always On' },
  { icon: Trophy, title: 'Quality', desc: 'Premium materials, and reliable performance on every order.', badge: 'Premium Build' },
];

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const Motion = motion;

/* ─── countdown hook ──────────────────────────────────────── */
function useCountdown(targetHours = 4) {
  const [time, setTime] = useState({ h: targetHours, m: 59, s: 59 });
  useEffect(() => {
    const id = setInterval(() => {
      setTime(prev => {
        let { h, m, s } = prev;
        if (s > 0) return { h, m, s: s - 1 };
        if (m > 0) return { h, m: m - 1, s: 59 };
        if (h > 0) return { h: h - 1, m: 59, s: 59 };
        return { h: targetHours, m: 59, s: 59 };
      });
    }, 1000);
    return () => clearInterval(id);
  }, [targetHours]);
  return time;
}

function ProductInfiniteCarousel({ products = [] }) {
  const getVisibleCards = () => {
    if (typeof window === 'undefined') {
      return 4;
    }

    if (window.innerWidth >= 1024) {
      return 4;
    }

    if (window.innerWidth >= 640) {
      return 2;
    }

    return 1;
  };

  const INTERVAL = 3200;
  const DURATION = 550;
  const [visibleCards, setVisibleCards] = useState(getVisibleCards);
  const hasProducts = products.length > 0;
  const canSlide = products.length > visibleCards;

  const cloned = [
    ...products.slice(-visibleCards),
    ...products,
    ...products.slice(0, visibleCards),
  ];
  const total = cloned.length || 1;
  const startIndex = visibleCards;

  const [current, setCurrent] = useState(startIndex);
  const [transitioning, setTransitioning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setVisibleCards(getVisibleCards());

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);

    if (isPaused || !canSlide) {
      return;
    }

    timerRef.current = setInterval(() => {
      setTransitioning(true);
      setCurrent((prev) => prev + 1);
    }, INTERVAL);
  }, [INTERVAL, canSlide, isPaused]);

  useEffect(() => {
    if (!canSlide) {
      clearInterval(timerRef.current);
      return undefined;
    }

    startTimer();
    return () => clearInterval(timerRef.current);
  }, [visibleCards, products.length, isPaused, canSlide, startTimer]);

  useEffect(() => {
    if (!canSlide) return undefined;

    if (current >= total - visibleCards) {
      const timeout = setTimeout(() => {
        setTransitioning(false);
        setCurrent(startIndex);
      }, DURATION);

      return () => clearTimeout(timeout);
    }

    if (current < startIndex) {
      const timeout = setTimeout(() => {
        setTransitioning(false);
        setCurrent(total - visibleCards * 2);
      }, DURATION);

      return () => clearTimeout(timeout);
    }
  }, [current, total, visibleCards, startIndex, canSlide]);

  useEffect(() => {
    if (!transitioning) {
      const timeout = setTimeout(() => setTransitioning(true), 30);
      return () => clearTimeout(timeout);
    }
  }, [transitioning]);

  const rawIndex = current - startIndex;
  const activeDot = ((rawIndex % products.length) + products.length) % products.length;
  const cardWidthPct = 100 / total;
  const translatePct = -(current / total) * 100;

  const goTo = (index) => {
    clearInterval(timerRef.current);
    setTransitioning(true);
    setCurrent(startIndex + index);
    if (!isPaused) {
      startTimer();
    }
  };

  if (!hasProducts) {
    return null;
  }

  if (!canSlide) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {products.map((product, idx) => (
          <div key={product?._id || idx} className="h-full">
            <ProductCard product={product} variant="shop" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className="w-full overflow-hidden rounded-[1.9rem]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsPaused(false);
        }
      }}
    >
      <div
        className="flex"
        style={{
          width: `${(total / visibleCards) * 100}%`,
          transform: `translateX(${translatePct}%)`,
          transition: transitioning
            ? `transform ${DURATION}ms cubic-bezier(0.4,0,0.2,1)`
            : 'none',
        }}
      >
        {cloned.map((product, idx) => (
          <div key={`${product?._id || 'product'}-${idx}`} style={{ width: `${cardWidthPct}%` }} className="box-border flex-shrink-0 px-3">
            <ProductCard product={product} variant="shop" />
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-center gap-2">
        {products.map((_, idx) => (
          <button
            key={`product-dot-${idx}`}
            type="button"
            onClick={() => goTo(idx)}
            className={`block h-1.5 rounded-full transition-all duration-500 ${
              activeDot === idx ? 'w-6 bg-primary-500' : 'w-1.5 bg-white dark:bg-white/20 hover:bg-white/40'
            }`}
            aria-label={`Go to product ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── component ───────────────────────────────────────────── */
const Home = () => {
  const { products, loading, fetchFeaturedProducts } = useProductStore();
  const { topReviews, topReviewsLoading, fetchTopReviews  } = useReviewStore();
  const countdown = useCountdown(5);

  useEffect(() => { 
    fetchFeaturedProducts(); 
    fetchTopReviews(5);
  }, [fetchFeaturedProducts, fetchTopReviews]);

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div className="min-h-screen ">
      <SEO
        title="Sports World Chichawatni — Chichawatni's Trusted Wholesale Sports Store"
        description="Sports World Chichawatni offers a complete range of sports equipment and accessories — cricket, football, hockey, tennis, kabaddi, basketball, footwear, sleeves & more. Best prices, wholesale deals. Visit us on College Road, Chichawatni or shop online."
        canonicalPath="/"
        keywords={businessInfo.keywords}
        structuredData={[websiteSchema(), organizationSchema(), localBusinessSchema()]}
      />

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 z-0">
          <img src="https://res.cloudinary.com/da8lxpc3h/image/upload/v1776738944/hero-bg_g8kry5.avif" alt="Sports World" className="h-full w-full object-cover opacity-30" />
        </div>
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_left,rgba(220,38,38,0.34),transparent_24%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_24%),linear-gradient(180deg,rgba(2,6,23,0.18),rgba(2,6,23,0.82))]" />
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-slate-950 via-slate-950/88 to-slate-950/30" />
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-950/10 via-transparent to-slate-950" />
        <div className="absolute left-[8%] top-[11%] z-0 h-44 w-44 rounded-full border border-white/10 bg-white/5 blur-3xl" />
        <div className="absolute bottom-[6%] right-[7%] z-0 h-80 w-80 rounded-full bg-primary-600/16 blur-[140px]" />

        <div className="container-bound relative z-10 max-[1023px]:justify-center grid min-h-[72vh] items-center gap-10 py-14 sm:py-16 lg:min-h-[92vh] lg:grid-cols-[1fr_1.06fr] lg:gap-14 lg:py-20">
          <Motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: 'easeOut' }} className="max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-xl">
              <TrendingUp size={16} className="text-primary-500" />
              <span>Premium Athletic Goods</span>
            </div>
            <h1 className="mt-6 max-w-3xl text-4xl min-[320px]:max-[400px]:text-[32px] font-black uppercase leading-[0.9] tracking-tight text-white sm:text-5xl md:text-7xl xl:text-[5.8rem]">
              Built For
              <span className="mt-1 block"><span className="text-primary-500">Serious</span> Players</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base leading-7 min-[320px]:max-[430px]:text-[14px] min-[320px]:max-[430px]:leading-[22px] text-slate-300 sm:text-lg sm:leading-8 lg:mx-0 lg:text-xl">
              Sports World brings premium cricket and athletic gear together in one sharp destination for players who expect quality, trust, and performance from every purchase.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
              <Link to="/shop" className="btn-primary group w-full justify-center px-8 py-4 text-base shadow-[0_26px_54px_-22px_rgba(220,38,38,0.72)] sm:w-auto sm:text-lg">
                Shop Now <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
              <a href="#collections" className="btn-secondary w-full justify-center border-white/15 bg-white/[0.04] px-8 py-4 text-base text-white shadow-[0_20px_45px_-28px_rgba(15,23,42,0.9)] backdrop-blur-md hover:bg-white/10 hover:text-white sm:w-auto sm:text-lg">
                Explore Collection
              </a>
            </div>
           
          </Motion.div>

          <Motion.div initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.9, delay: 0.15, ease: 'easeOut' }} className="relative mx-auto w-full max-w-2xl">
            <div className="absolute -right-8 bottom-8 hidden h-48 w-48 rounded-full bg-primary-600/16 blur-3xl lg:block" />
            <div className="relative overflow-hidden rounded-[2.1rem] border border-white/12 bg-white/[0.07] p-3 shadow-[0_34px_100px_-42px_rgba(0,0,0,0.96)] backdrop-blur-xl sm:p-4">
              <div className="relative overflow-hidden rounded-[1.8rem]">
                <img src="https://res.cloudinary.com/da8lxpc3h/image/upload/v1776740615/sports-world-babar-azam-hero_gndydp.jpg" alt="Featured gear" className="h-[320px] w-full object-cover object-center transition-transform duration-700 hover:scale-[1.02] sm:h-[420px] lg:h-[560px]" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent" />
                <div className="absolute left-4 top-4 max-[767px]:bottom-[1rem] max-[767px]:top-[unset] rounded-2xl border border-white/15 bg-slate-950/68 px-3 py-2.5 backdrop-blur-md sm:left-5 sm:top-5 sm:px-4 sm:py-3">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Featured Gear</p>
                  <p className="mt-1 text-base font-black text-white sm:text-lg">Match Day Essentials</p>
                </div>
                <div className="absolute inset-x-4 bottom-4 grid gap-4 sm:inset-x-5 sm:bottom-5">
                  <div className="rounded-[1.7rem] max-[767px]:hidden border border-white/10 bg-slate-950/70 p-4 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/20 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="max-w-md">
                        <p className="text-xs font-bold uppercase tracking-[0.24em] text-white">Featured Product</p>
                        <h3 className="mt-2 text-xl font-black text-white sm:text-2xl">English Willow Match Bat</h3>
                        <p className="mt-3 text-sm leading-6 text-slate-300">Crafted for premium pickup, balanced stroke play, and dependable confidence.</p>
                      </div>
                      <div className="rounded-2xl bg-white/10 px-4 py-3 text-right shadow-inner shadow-white/5">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Starting At</p>
                        <p className="mt-1 text-xl font-black text-white sm:text-2xl">₨12,999</p>
                      </div>
                    </div>
                    <div className="mt-5 grid min-[1024px]:max-[1260px]:grid-cols-1 min-[1024px]:max-[1260px]:justify-center gap-3 border-t border-white/10 pt-4 sm:grid-cols-[1fr_auto] sm:items-center">
                      <div className="flex flex-wrap items-center gap-3">
                        {['https://res.cloudinary.com/da8lxpc3h/image/upload/v1776740323/front-foot-babar-azam_zbphe4.jpg','https://res.cloudinary.com/da8lxpc3h/image/upload/v1776740362/babar-azam_xj1yst.jpg','https://res.cloudinary.com/da8lxpc3h/image/upload/v1776740396/straight-drive-babar-azam_gxjn3z.jpg'].map((p, i) => (
                          <div key={p} className={`h-14 w-14 overflow-hidden rounded-2xl border border-white/10 bg-white/10 ${i === 1 ? 'ring-2 ring-primary-500/70' : ''}`}>
                            <img src={p} alt="preview" className="h-full w-full object-cover" />
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 sm:justify-end">
                        <div className="flex gap-1 text-yellow-400">{[...Array(5)].map((_, i) => <Star key={i} size={15} className="fill-yellow-400" />)}</div>
                        <p className="text-sm font-semibold text-white">Trusted by academies</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Motion.div>
        </div>
      </section>


      {/* ══════════════════════════════════════════
          TICKER / MARQUEE
      ══════════════════════════════════════════ */}
      <section className="overflow-hidden border-y border-white/10 bg-primary-600 py-2.5 sm:py-3">
        <div className="flex animate-[marquee_28s_linear_infinite] whitespace-nowrap">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} className="mx-8 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white min-[320px]:max-[430px]:text-[12px]">
              <item.icon size={14} className="shrink-0 text-white/90" />
              <span>{item.text}</span>
              <span className="mx-8 text-white/40">|</span>
            </span>
          ))}
        </div>
        <style>{`@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
      </section>

      {/* ══════════════════════════════════════════
          FLASH SALE BANNER
      ══════════════════════════════════════════ */}
      <section className="relative overflow-hidden border-b border-white/10 bg-[#0d0f14] py-8 sm:py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.18),transparent_60%)]" />
        <div className="container-bound relative z-10 flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left md:gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex text-white items-center gap-2 rounded-full border border-primary-500/40 bg-primary-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary-300">
              <span className="h-2 w-2 animate-pulse text-white rounded-full bg-primary-500" /> Flash Sale Live
            </div>
            <h2 className="mt-3 text-2xl font-black leading-tight text-white sm:text-3xl md:text-4xl min-[320px]:max-[400px]:text-[18px] min-[401px]:max-[430px]:text-[22px]">
              Season Opener Sale — Up to <span className="text-primary-500">20% Off</span>
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-400 sm:text-base">
              Limited stock. Premium gear at unbeatable prices. Don't miss it.
            </p>
          </div>
          <div className="flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row sm:items-end">
            <div className="grid w-full grid-cols-3 gap-2 text-center sm:w-auto sm:flex sm:gap-3">
              {[['Hours', pad(countdown.h)], ['Mins', pad(countdown.m)], ['Secs', pad(countdown.s)]].map(([label, val]) => (
                <div key={label} className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.06] px-2 py-2 text-center sm:min-w-[64px] sm:px-4 sm:py-3">
                  <p className="text-lg font-black text-white tabular-nums sm:text-2xl">{val}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
                </div>
              ))}
            </div>
            <Link to="/shop" className="btn-primary w-full justify-center whitespace-nowrap px-6 py-3 text-sm font-bold sm:w-auto">
              Shop Sale <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          COLLECTIONS
      ══════════════════════════════════════════ */}
      <section id="collections" className="relative overflow-hidden border-y border-white/10  py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(220,38,38,0.1),transparent_28%),linear-gradient(180deg,rgba(15,23,42,0),rgba(15,23,42,0.72))]" />
        <div className="container-bound relative z-10">
          <div className="relative z-10 mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <span className="section-kicker border-white/10 bg-white text-primary-300">Equip Your Ambition</span>
              <h2 className="mt-4 text-4xl font-extrabold tracking-tight  md:text-5xl min-[320px]:max-[430px]:text-[32px] min-[320px]:max-[430px]:leading-[36px]">Premium collections for every serious phase of the game.</h2>
            </div>
            <Link to="/shop" className="btn-secondary group w-fit border-white/10 bg-white hover:bg-white/[0.08]">
              View All Gear <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {collectionHighlights.map((cat, idx) => (
              <motion.div key={cat.name} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1, duration: 0.55 }}>
                <Link to={cat.href} className="group relative block overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] transition-all duration-500 hover:-translate-y-2 hover:border-white/20 hover:shadow-[0_32px_72px_-34px_rgba(220,38,38,0.28)]">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent z-10" />
                  <img src={cat.image} alt={cat.name} className="h-[340px] w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-x-0 bottom-0 z-20 p-7">
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-white text-primary-300">Featured Category</p>
                    <h3 className="mt-3 text-2xl font-black text-white">{cat.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{cat.desc}</p>
                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white">
                      Explore <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SERVICE FEATURES
      ══════════════════════════════════════════ */}
      <section className="border-b border-white/10  py-16">
        <div className="container-bound grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {serviceFeatures.map((feat, i) => (
            <motion.div key={feat.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="group relative overflow-hidden rounded-[1.6rem] border border-white/10  bg-white dark:bg-slate-800/60 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/20">
              <div className="absolute top-4 right-4 rounded-full border border-white/10  px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-300">{feat.badge}</div>
              <div className="mb-4 inline-flex rounded-2xl bg-primary-500/12 p-3 text-primary-400"><feat.icon size={24} /></div>
              <h3 className="text-base font-black ">{feat.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>


      {/* ══════════════════════════════════════════
          FEATURED PRODUCTS
      ══════════════════════════════════════════ */}
      <section className="relative overflow-hidden pb-20 pt-5">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0),rgba(15,23,42,0.48))]" />
        <div className="container-bound">
          <div className="mb-14 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <span className="section-kicker border-white/10 bg-white text-primary-300">Featured Gear</span>
              <h2 className="mt-4 text-4xl font-extrabold tracking-tight md:text-5xl min-[320px]:max-[430px]:text-[32px] min-[320px]:max-[430px]:leading-[36px]">Clean picks for players building a sharper kit.</h2>
            </div>
            <div className="max-w-md space-y-2 text-sm leading-6 text-slate-400">
              {featuredCallouts.map((item) => (
                <p key={item} className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-primary-500" />{item}
                </p>
              ))}
            </div>
          </div>
          {loading ? (
            <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {[...Array(4)].map((_, idx) => (
                <div key={idx} className="h-[420px] rounded-[1.8rem] border border-white/10 bg-white/[0.05] animate-pulse" />
              ))}
            </motion.div>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }}>
              <ProductInfiniteCarousel products={products || []} />
            </motion.div>
          )}
          <div className="mt-14 text-center relative z-[9]">
            <Link to="/shop" className="btn-primary inline-flex px-10 items-center justify-center">View Entire Collection</Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
           WHY CHOOSE US — PREMIUM REDESIGN
       ══════════════════════════════════════════ */}
<section className="relative overflow-hidden border-y border-white/10  py-20">

  {/* Glows */}
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(220,38,38,0.13),transparent_55%)] pointer-events-none" />
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.07),transparent_55%)] pointer-events-none" />

  <div className="container-bound relative z-10">

    {/* Header */}
    <div className="mb-14 text-center">
      <span className="section-kicker justify-center border-white/10 bg-white">
        Why Sports World
      </span>
      <h2 className="mt-4 text-4xl font-extrabold tracking-tight md:text-5xl min-[320px]:max-[430px]:text-[32px] min-[320px]:max-[430px]:leading-[36px]">
        We're built <span className="text-primary-500">different.</span>
      </h2>
      <p className="mt-3 text-slate-500">
        See how Sports World stacks up against typical stores.
      </p>
    </div>

    {/* Grid: Table + Side Column */}
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px] lg:items-start">

      {/* ── Comparison Table ── */}
      <div className="overflow-hidden rounded-[1.4rem] border dark:border-white/10 border-white bg-white/[0.025]">

        {/* Table header */}
        <div className="grid grid-cols-3 border-b border-white/10 dark:bg-white/[0.05] bg-white px-5 py-3.5">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] ">Feature</p>
          <div className="flex items-center justify-center gap-1.5 rounded-lg bg-primary-500/10 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-primary-400 min-[320px]:max-[430px]:text-center">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />
            Sports World
          </div>
          <p className="text-center text-[11px] font-bold uppercase tracking-[0.15em]">Others</p>
        </div>

        {/* Rows */}
        {compareRows.map((row, i) => (
          <motion.div
            key={row.feature}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className={`grid min-h-[52px] grid-cols-3 items-center px-5 transition-colors hover:bg-white/[0.03]
              ${i !== compareRows.length - 1 ? 'border-b border-white/[0.05]' : ''}
              ${i % 2 !== 0 ? 'dark:bg-primary-500/[0.02] bg-white' : ''}
            `}
          >
            <p className="text-[13px] ">{row.feature}</p>

            {/* Sports World cell */}
            <div className="flex justify-center">
              {row.us ? (
                <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-400">
                  <CheckCircle2 size={11} /> Yes
                </span>
              ) : (
                <XCircle size={16} className="text-slate-700" />
              )}
            </div>

            {/* Others cell */}
            <div className="flex justify-center">
              {row.others ? (
                <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-400">
                  <CheckCircle2 size={11} /> Yes
                </span>
              ) : (
                <XCircle size={16} className="text-slate-700" />
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Side Column ── */}
      <div className="flex flex-col gap-4">

        {/* Score card */}
        <div className="rounded-[1.4rem] border border-primary-500/25 bg-gradient-to-br from-primary-500/10 to-primary-500/[0.04] p-6 text-center">
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
            Feature advantage
          </p>
          <p className="text-[3.5rem] font-black leading-none text-primary-500">
            7<span className="text-2xl text-primary-900">/ 7</span>
          </p>
          <p className="mt-1.5 text-xs text-slate-500">Exclusive to Sports World</p>
        </div>

        {/* Mini feature cards */}
        {[
          {
            icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
            title: '100% Authentic',
            sub: 'Zero counterfeits. Guaranteed.',
          },
          {
            icon: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />,
            title: 'Pro-tested gear',
            sub: 'Verified by first-class cricketers.',
          },
          {
            icon: (
              <>
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </>
            ),
            title: 'Same-day dispatch',
            sub: 'In-stock orders ship same day.',
          },
        ].map((item) => (
          <div
            key={item.title}
            className="group flex items-center gap-3 rounded-[1.1rem] border border-white/10 bg-white dark:bg-slate-800/60 p-4 transition-all duration-300 hover:border-primary-500/30 hover:bg-primary-500/[0.04]"
          >
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary-500/10">
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 stroke-primary-500 fill-none"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {item.icon}
              </svg>
            </div>
            <div>
              <p className="text-[13px] font-bold dark:text-slate-200">{item.title}</p>
              <p className="mt-0.5 text-[11px] text-slate-500">{item.sub}</p>
            </div>
          </div>
        ))}

      </div>
    </div>
  </div>
</section>


{/* ══════════════════════════════════════════
    TESTIMONIALS — Live from Database
══════════════════════════════════════════ */}
<section className="relative overflow-hidden bg-slate-950 py-20">
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(220,38,38,0.08),transparent_50%)]" />
  <div className="container-bound relative z-10">

    {/* Header */}
    <div className="mb-14 text-center">
      <span className="section-kicker justify-center border-white/10 bg-white/[0.04] text-primary-300 text-white">
        Verified Reviews
      </span>
      <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-white md:text-5xl min-[320px]:max-[430px]:text-[32px] min-[320px]:max-[430px]:leading-[36px]">
        What players say about Sports World.
      </h2>
      <p className="mt-3 text-sm text-slate-500">
        Real reviews from verified purchasers only.
      </p>
    </div>

    {topReviewsLoading ? (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-52 animate-pulse rounded-[1.9rem] border border-white/10 bg-white/[0.05]" />
        ))}
      </div>

    ) : !topReviews?.length ? (
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] py-16 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
          <Star size={24} className="fill-yellow-400 text-yellow-400" />
        </div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">No reviews yet</p>
        <p className="mt-1 text-xs text-slate-600">Be the first to review a product.</p>
      </div>

    ) : (
      <InfiniteReviewCarousel reviews={topReviews} />
    )}

  </div>
</section>
    
    
      {/* ══════════════════════════════════════════
          NEW ARRIVALS CTA
      ══════════════════════════════════════════ */}
     <section className="pt-12">
      <div className="container-bound mb-12">
        <div className="relative overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900 p-10 text-center lg:p-16">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:40px_40px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-600/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10 max-w-xl mx-auto">
            <div className="mb-4 inline-flex text-white items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary-300 min-[320px]:max-[380px]:text-[10px]">
              <TrendingUp size={12} />New Arrivals Every Week
            </div>
            <h2 className="text-3xl font-black text-white md:text-4xl mb-4">
              Can't find what you need?
            </h2>
            <p className="text-slate-400 mb-8 leading-relaxed min-[320px]:max-[400px]:hidden">
              Our catalog grows every week. Reach out to our team and we'll source the gear you need, guaranteed authentic and at competitive prices.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/shop" className="btn-primary inline-flex h-14 px-8 items-center justify-center text-base font-bold shadow-xl shadow-primary-600/30">
                Browse All Products <ArrowRight size={18} />
              </Link>
              <a href="mailto:sportsworldccw@gmail.com"
                className="btn-secondary inline-flex h-14 px-8 items-center justify-center text-base border-white/15 bg-white/[0.04] text-white hover:bg-white/10">
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
     </section>
    
    </div>
  );
};

export default Home;