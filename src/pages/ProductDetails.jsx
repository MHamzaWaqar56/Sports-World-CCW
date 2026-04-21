import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useProductStore } from '../store/useStore';
import { useCartStore } from '../store/useCart';
import { useWishlistStore } from '../store/useWishlistStore';
import { useReviewStore } from '../store/useReviewStore';
import { Star, Truck, ShieldCheck, Heart, Share2, ChevronLeft, ChevronRight, Check, ShoppingCart, Gauge, Sparkles, BadgeCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { getImageUrl, getPrimaryProductImage } from '../utils/media';
import { formatPrice } from '../utils/price';
import { useAuthStore, useThemeStore } from '../store/useStore';
import PageHero from '../components/common/PageHero';
import api from '../api/axios.js';
import SEO from '../components/common/SEO';
import {
  getDisplayPrice,
  getDisplayStock,
  getProductVariants,
  getPreferredVariant,
  getVariantLabel,
  isVariableProduct,
} from '../utils/productVariant';
import { businessInfo, productSchema } from '../utils/seo';

const ProductDetails = () => {
  const { id } = useParams();
  const [qty, setQty] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [activeTab, setActiveTab] = useState('description');
  const [activeImage, setActiveImage] = useState(0);
  const imageTouchStartX = useRef(null);
  const navigate = useNavigate();

const { reviews, fetchReviews, addReview, deleteReview } = useReviewStore();
const { userInfo } = useAuthStore();
const { theme } = useThemeStore();
const isDark = theme === 'dark';
const [rating, setRating] = useState(0);
const [comment, setComment] = useState('');
const [userOrders, setUserOrders] = useState([]);
  const { addToCart } = useCartStore();
  const { product, loading, fetchProductById } = useProductStore();
  const { wishlistItems, toggleWishlist } = useWishlistStore();


  useEffect(() => {
  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders/myorders'); // 👈 your API
      setUserOrders(data);
    } catch (err) {
      console.error(err);
    }
  };

  if (userInfo) fetchOrders();
}, [userInfo]);

  useEffect(() => {
    fetchProductById(id);
    fetchReviews(id);
    window.scrollTo(0, 0);
  }, [id, fetchProductById, fetchReviews]);

  const variableProduct = useMemo(() => isVariableProduct(product), [product]);
  const variants = useMemo(() => getProductVariants(product), [product]);
  const selectedVariant = useMemo(
    () => getPreferredVariant(product, selectedVariantId),
    [product, selectedVariantId]
  );
  const displayPrice = useMemo(
    () => getDisplayPrice(product, selectedVariant),
    [product, selectedVariant]
  );
  const displayStock = useMemo(
    () => getDisplayStock(product, selectedVariant),
    [product, selectedVariant]
  );

  useEffect(() => {
    if (!variableProduct) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedVariantId('');
      return;
    }

    const preferred = getPreferredVariant(product, selectedVariantId);
    const nextVariantId = String(preferred?._id || '');
    if (nextVariantId && nextVariantId !== selectedVariantId) {
      setSelectedVariantId(nextVariantId);
    }
  }, [product, variableProduct, selectedVariantId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQty(1);
  }, [selectedVariantId, id]);

  // const addToCartHandler = () => {
  //   addToCart(product, qty);
  //   toast.success(`${qty} x ${product.name} added to cart`);
  // };


// BAAD (yeh karo)
const addToCartHandler = async () => {
  if (variableProduct && !selectedVariant?._id) {
    toast.error('Please select a variant first');
    return false;
  }
  const added = await addToCart(product, qty, selectedVariant);
  if (!added) return false;

  toast.success(`${qty} x ${product.name} added to cart`);
  return true;
};

  const galleryImages = useMemo(
    () =>
      product?.images?.length > 0
        ? product.images.map((image) => getImageUrl(image))
        : [getPrimaryProductImage(product)],
    [product]
  );

  const hasPurchased = useMemo(() => {
  return userOrders.some(order =>
    order.isPaid &&
    order.isDelivered &&
    order.orderItems.some(item => item.product === id)
  );
}, [userOrders, id]);


const topReviews = useMemo(() => {
  if (!reviews || reviews.length === 0) return [];

  return reviews
    .filter((rev) => Number(rev.rating) === 5) // ⭐ only 5 rating
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // latest first
    .slice(0, 2); // only 2
}, [reviews]);  

  const submitReviewHandler = async () => {
  if (!rating || !comment) {
    return toast.error('Please add rating and comment');
  }
  await addReview(id, { rating, comment });

  fetchProductById(id); // refresh product to get updated reviews and rating
  setRating(0);
  setComment('');
};


const handleDeleteReview = async (reviewId) => {
  await deleteReview(product._id, reviewId);

    // Refresh product to update rating immediately
  fetchProductById(product._id);
  fetchReviews(product._id); 
};

const handleRatingClick = (e, index) => {
  const { left, width } = e.currentTarget.getBoundingClientRect();
  const clickX = e.clientX - left;

  const isHalf = clickX < width / 2;

  const value = isHalf ? index + 0.5 : index + 1;

  setRating(Number(value.toFixed(1)));
};


  const hasMultipleImages = galleryImages.length > 1;

  const productFeatures = useMemo(
    () => product?.features?.filter((feature) => String(feature || '').trim()) || [],
    [product]
  );

  const productSpecifications = useMemo(
    () => product?.specifications?.filter((spec) => spec?.name && spec?.value) || [],
    [product]
  );

  const quickHighlights = useMemo(() => {
    const derived = [];

    if (product?.category) derived.push(product.category);
    if (product?.brand) derived.push(product.brand);
    if (productFeatures.length > 0) derived.push(...productFeatures.slice(0, 2));
    if (productSpecifications.length > 0) {
      productSpecifications.slice(0, 2).forEach((spec) => derived.push(spec.value));
    }

    return [...new Set(derived.filter(Boolean))].slice(0, 4);
  }, [product, productFeatures, productSpecifications]);

  const seoTitle = product?.name
    ? `${product.name} | Sports World Chichawatni`
    : 'Product Details | Sports World Chichawatni';

  const seoDescription = product?.description
    ? product.description.slice(0, 160)
    : 'Explore premium sports equipment at Sports World Chichawatni, including cricket bats, footballs, hockey sticks, footwear, sleeves, and more.';

  const performanceCards = useMemo(() => {
    const cards = [];

    if (productFeatures.length > 0) {
      cards.push({
        title: productFeatures[0],
        desc: 'Built to support a premium on-field feel with cleaner response, sharper control, and confident match-day performance.',
      });
    }

    if (productSpecifications.length > 0) {
      cards.push({
        title: productSpecifications[0].name,
        desc: `${productSpecifications[0].value} gives this product a more refined and dependable performance profile for serious players.`,
      });
    }

    cards.push({
      title: 'Build Quality',
      desc: 'Crafted to feel premium in hand, hold up through regular use, and stay reliable through training and match sessions.',
    });

    cards.push({
      title: 'Performance Balance',
      desc: 'Designed to support comfort, control, and confidence without sacrificing the premium sporting feel Sports World stands for.',
    });

    return cards.slice(0, 4);
  }, [productFeatures, productSpecifications]);

  if (loading || !product)
    return (
      <div className="min-h-screen bg-slate-950 pb-16 pt-24">
        <div className="container-bound">
          <div className="animate-pulse space-y-8">
            <div className="h-5 w-56 rounded bg-white/10"></div>
            <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-4">
                <div className="aspect-[4/5] rounded-[1.6rem] bg-white/10"></div>
              </div>
              <div className="space-y-5">
                <div className="h-5 w-40 rounded bg-white/10"></div>
                <div className="h-16 w-3/4 rounded bg-white/10"></div>
                <div className="h-8 w-48 rounded bg-white/10"></div>
                <div className="h-24 rounded bg-white/10"></div>
                <div className="h-48 rounded-[2rem] bg-white/10"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

  const isWishlisted = wishlistItems.some((item) => item._id === product._id);

  const handleWishlistToggle = () => {
    const result = toggleWishlist(product);

    if (result.removed) {
      toast.success('Removed from wishlist');
    } else if (result.added) {
      toast.success('Added to wishlist');
    }
  };

  const goToNextImage = () => {
    if (!hasMultipleImages) return;
    setActiveImage((current) => (current + 1) % galleryImages.length);
  };

  const goToPrevImage = () => {
    if (!hasMultipleImages) return;
    setActiveImage((current) => (current - 1 + galleryImages.length) % galleryImages.length);
  };

  const handleGalleryTouchStart = (event) => {
    imageTouchStartX.current = event.touches?.[0]?.clientX ?? null;
  };

  const handleGalleryTouchEnd = (event) => {
    if (!hasMultipleImages || imageTouchStartX.current === null) return;

    const endX = event.changedTouches?.[0]?.clientX ?? imageTouchStartX.current;
    const distanceX = endX - imageTouchStartX.current;
    imageTouchStartX.current = null;

    if (Math.abs(distanceX) < 40) return;

    if (distanceX < 0) {
      goToNextImage();
    } else {
      goToPrevImage();
    }
  };

  const handleShareProduct = async () => {
    const shareData = {
      title: product.name,
      text: `Check out this product from Sports World: ${product.name}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      await navigator.clipboard.writeText(window.location.href);
      toast.success('Product link copied');
    } catch (error) {
      if (error.name !== 'AbortError') {
        toast.error('Unable to share product');
      }
    }
  };

  return (
    <div className={`min-h-screen pb-20 ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <SEO
        title={seoTitle}
        description={seoDescription}
        canonicalPath={product?._id ? `/product/${product._id}` : '/shop'}
        keywords={[...(businessInfo.keywords || []), product?.name, product?.category].filter(Boolean)}
        structuredData={[productSchema(product)]}
      />
      <PageHero
        tone="dark"
        Icon={Sparkles}
        badge="Product Overview"
        title={product?.name || 'Product'}
        highlight="Details"
        description={`Explore specs, variants, reviews, and on-field performance for ${product?.name || 'this product'}.`}
        chips={[
          product?.category || 'Premium gear',
          displayStock > 0 ? `In Stock: ${displayStock}` : 'Out of stock',
          'Authenticity guaranteed',
        ]}
      />

      <div className="container-bound">
        <nav className={`mb-6 flex text-sm font-medium sm:mb-8 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1 md:gap-3">
            <li className="inline-flex items-center">
              <Link to="/" className={`transition-colors ${isDark ? 'hover:text-white' : 'hover:text-primary-600'}`}>
                Home
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRight size={16} className={`mx-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                <Link to="/shop" className={`transition-colors ${isDark ? 'hover:text-white' : 'hover:text-primary-600'}`}>
                  Shop
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRight size={16} className={`mx-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                <span className={`max-w-[220px] truncate sm:max-w-[420px] ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                  {product.name}
                </span>
              </div>
            </li>
          </ol>
        </nav>

        <div className={`relative overflow-hidden rounded-[2.5rem] p-4 sm:p-6 md:p-8 ${isDark ? 'border border-white/10 bg-[#0c1017] shadow-[0_34px_90px_-44px_rgba(0,0,0,0.96)]' : 'border border-slate-200 bg-white shadow-[0_34px_90px_-44px_rgba(15,23,42,0.12)]'}`}>
          <div className={`absolute inset-0 ${isDark ? 'bg-[radial-gradient(circle_at_top_left,rgba(220,38,38,0.18),transparent_24%),linear-gradient(180deg,rgba(2,6,23,0),rgba(2,6,23,0.4))]' : 'bg-[radial-gradient(circle_at_top_left,rgba(220,38,38,0.08),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0),rgba(248,250,252,0.9))]'}`}></div>

          <div className="relative grid gap-10 min-[1024px]:max-[1200px]:grid-cols-[1fr] lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid gap-4 md:grid-cols-[88px_minmax(0,1fr)]"
            >
              <div className="order-2 flex gap-3 overflow-x-auto md:order-1 md:flex-col">
                {galleryImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative h-20 min-w-[80px] overflow-hidden rounded-[1.35rem] border transition-all duration-300 md:h-24 md:min-w-0 ${
                      activeImage === i
                        ? 'border-primary-500 shadow-[0_14px_34px_-16px_rgba(220,38,38,0.55)]'
                        : isDark ? 'border-white/10 hover:border-white/20' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img
                      src={img}
                      className={`h-full w-full object-cover ${isDark ? 'bg-[#0b0f15]' : 'bg-slate-100'}`}
                      alt={`${product.name} ${i + 1}`}
                      onError={(e) => {
                        e.currentTarget.src = getPrimaryProductImage(product);
                      }}
                    />
                  </button>
                ))}
              </div>

              <div className={`order-1 h-fit rounded-[2rem] p-3 md:order-2 ${isDark ? 'border border-white/10 bg-white/[0.04]' : 'border border-slate-200 bg-slate-50'}`}>
                <div
                  className={`group relative aspect-[4/5] min-[320px]:max-[1200px]:aspect-[1/1] overflow-hidden rounded-[1.7rem] ${isDark ? 'bg-[#080b10]' : 'bg-slate-100'}`}
                  onTouchStart={handleGalleryTouchStart}
                  onTouchEnd={handleGalleryTouchEnd}
                >
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={activeImage}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.04 }}
                      transition={{ duration: 0.3 }}
                      src={galleryImages[activeImage] || galleryImages[0]}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      onError={(e) => {
                        e.currentTarget.src = getImageUrl();
                      }}
                    />
                  </AnimatePresence>

                  <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent' : 'bg-gradient-to-t from-white via-white/10 to-transparent'}`}></div>
                  <div className={`absolute inset-0 ${isDark ? 'bg-[radial-gradient(circle_at_bottom_right,rgba(220,38,38,0.22),transparent_26%)]' : 'bg-[radial-gradient(circle_at_bottom_right,rgba(220,38,38,0.10),transparent_26%)]'}`}></div>

                  {hasMultipleImages && (
                    <>
                      <button
                        type="button"
                        onClick={goToPrevImage}
                        aria-label="Previous product image"
                        className={`absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full backdrop-blur-md transition-all hover:scale-105 ${isDark ? 'border border-white/10 bg-slate-950/75 text-white hover:text-primary-400' : 'border border-slate-200 bg-white/90 text-slate-700 hover:text-primary-600'}`}
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        type="button"
                        onClick={goToNextImage}
                        aria-label="Next product image"
                        className={`absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full backdrop-blur-md transition-all hover:scale-105 ${isDark ? 'border border-white/10 bg-slate-950/75 text-white hover:text-primary-400' : 'border border-slate-200 bg-white/90 text-slate-700 hover:text-primary-600'}`}
                      >
                        <ChevronRight size={20} />
                      </button>
                      <div className={`absolute bottom-5 right-5 z-10 rounded-full px-3 py-1.5 text-xs font-bold backdrop-blur-md ${isDark ? 'border border-white/10 bg-slate-950/75 text-white' : 'border border-slate-200 bg-white/90 text-slate-700'}`}>
                        {activeImage + 1} / {galleryImages.length}
                      </div>
                    </>
                  )}

                  <div className="absolute right-5 top-5 z-10 flex flex-col gap-3">
                    <button
                      onClick={handleWishlistToggle}
                      className={`flex h-12 w-12 items-center justify-center rounded-full backdrop-blur-md transition-all hover:scale-105 hover:text-red-500 ${isDark ? 'border border-white/10 bg-slate-950/75 text-white' : 'border border-slate-200 bg-white/90 text-slate-700'}`}
                    >
                      <Heart size={20} className={isWishlisted ? 'fill-red-500 text-red-500' : ''} />
                    </button>
                    <button
                      type="button"
                      onClick={handleShareProduct}
                      aria-label="Share product"
                      className={`flex h-12 w-12 items-center justify-center rounded-full backdrop-blur-md transition-all hover:scale-105 ${isDark ? 'border border-white/10 bg-slate-950/75 text-white hover:text-primary-400' : 'border border-slate-200 bg-white/90 text-slate-700 hover:text-primary-600'}`}
                    >
                      <Share2 size={20} />
                    </button>
                  </div>

                  <div className={`absolute bottom-5 left-5 rounded-[1.4rem] px-5 py-4 backdrop-blur-xl ${isDark ? 'border border-white/10 bg-slate-950/72' : 'border border-slate-200 bg-white/90'}`}>
                    <p className={`text-[10px] font-bold uppercase tracking-[0.26em] ${isDark ? 'text-white' : 'text-slate-500'}`}>
                      Premium Athletic Goods
                    </p>
                    <p className={`mt-2 text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{product.brand || 'Sports World'}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col"
            >
              <div className="mb-8">
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <span className={`rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] ${isDark ? 'border border-primary-500/30 bg-primary-600 text-white shadow-[0_16px_35px_-20px_rgba(220,38,38,0.9)]' : 'border border-primary-500/20 bg-primary-50 text-primary-700 shadow-[0_16px_35px_-20px_rgba(220,38,38,0.18)]'}`}>
                    Featured Gear
                  </span>
                  <span className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                    {product.brand} • {product.category}
                  </span>
                </div>
                <h1 className={`text-3xl font-black uppercase leading-[0.95] tracking-tight sm:text-4xl md:text-6xl ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {product.name}
                </h1>

                <div className="mt-5 flex flex-wrap items-center gap-4">
                  <div className="flex gap-2 items-center  text-yellow-400">
                    
  {[...Array(5)].map((_, i) => (
    <div key={i} className="relative w-6 h-6">
      <Star size={24} className="text-gray-500" />
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{
          width: `${Math.min(Math.max(product.rating - i, 0), 1) * 100}%`,
        }}
      >
        <Star size={24} className="text-yellow-400 fill-yellow-400" />
      </div>
    </div>
  ))}




                  </div>
                  <p className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {Number(product.rating || 0).toFixed(1)} rating
                    
                  </p>
                  <p className="text-sm uppercase tracking-[0.18em] text-slate-500">
                    ({product.numReviews || 0} reviews)
                  </p>
                </div>

                <div className="mt-7 flex flex-wrap items-end gap-4">
                  <span className={`text-5xl font-black leading-none md:text-6xl ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {formatPrice(displayPrice)}
                  </span>
                  <span className={`mb-1 text-xl font-medium line-through ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    {formatPrice(displayPrice * 1.25)}
                  </span>
                </div>

                <p className={`mt-6 max-w-2xl text-lg leading-8 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{product.description}</p>

                {quickHighlights.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-3">
                    {quickHighlights.map((highlight, index) => (
                      <span
                        key={`${highlight}-${index}`}
                        className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] ${isDark ? 'border border-white/10 bg-white/[0.05] text-slate-200' : 'border border-slate-200 bg-slate-50 text-slate-600'}`}
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className={`mb-8 rounded-[2rem] p-5 shadow-[0_26px_64px_-36px_rgba(15,23,42,0.16)] sm:p-6 md:p-7 ${isDark ? 'border border-white/10 bg-[#121720]' : 'border border-slate-200 bg-white'}`}>
                {variableProduct && (
                  <div className="mb-6">
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                      Select Variant
                    </p>
                    <select
                      value={selectedVariantId}
                      onChange={(event) => setSelectedVariantId(event.target.value)}
                      className={`h-12 w-full rounded-2xl px-4 text-sm font-semibold outline-none transition-all focus:border-primary-500/40 ${isDark ? 'border border-white/10 bg-white/[0.04] text-white' : 'border border-slate-200 bg-white text-slate-900'}`}
                    >
                      {variants.map((variant) => {
                        const variantLabel = getVariantLabel(variant);
                        return (
                          <option key={variant._id} value={variant._id}>
                            {variantLabel} • {formatPrice(variant.price)}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}

                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                      Availability
                    </p>
                    <div className="mt-2">
                      {displayStock > 0 ? (
                        <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${isDark ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-300' : 'border border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
                          <Check size={16} /> In Stock ({displayStock} available)
                        </span>
                      ) : (
                        <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${isDark ? 'border border-red-500/20 bg-red-500/10 text-red-300' : 'border border-red-200 bg-red-50 text-red-700'}`}>
                          Out of Stock
                        </span>
                      )}
                    </div>
                  </div>

                  {displayStock > 0 && (
                    <div>
                      <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                        Quantity
                      </p>
                      <div className={`flex h-14 items-center overflow-hidden rounded-2xl ${isDark ? 'border border-white/10 bg-white/[0.04]' : 'border border-slate-200 bg-slate-50'}`}>
                        <button
                          onClick={() => setQty(Math.max(1, qty - 1))}
                          className={`flex h-full w-12 items-center justify-center text-xl font-medium transition-colors ${isDark ? 'text-slate-300 hover:bg-white/[0.08]' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={qty}
                          readOnly
                          className={`h-full w-12 bg-transparent text-center text-lg font-bold focus:outline-none ${isDark ? 'text-white' : 'text-slate-900'}`}
                        />
                        <button
                          onClick={() => setQty(Math.min(displayStock, qty + 1))}
                          className={`flex h-full w-12 items-center justify-center text-xl font-medium transition-colors ${isDark ? 'text-slate-300 hover:bg-white/[0.08]' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {displayStock > 0 && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <button
                      onClick={addToCartHandler}
                      className={`inline-flex items-center justify-center gap-3 rounded-2xl px-6 py-4 text-sm font-black uppercase tracking-[0.16em] transition-all hover:-translate-y-0.5 ${isDark ? 'border border-white/10 bg-white/[0.05] text-white hover:border-primary-600 hover:bg-primary-600' : 'border border-slate-200 bg-slate-50 text-slate-900 hover:border-primary-600 hover:bg-primary-600 hover:text-white'}`}
                    >
                      <ShoppingCart size={18} />
                      Add to Cart
                    </button>
                    <button
                      onClick={async() => {
                        const added = await addToCartHandler();
                        if (added) navigate('/cart');
                      }}
                      className="inline-flex items-center justify-center gap-3 rounded-2xl bg-primary-600 px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-white shadow-[0_22px_44px_-20px_rgba(220,38,38,0.18)] transition-all hover:-translate-y-0.5 hover:bg-primary-700"
                    >
                      Buy Now
                    </button>
                  </div>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className={`rounded-[1.8rem] p-5 shadow-[0_18px_40px_-26px_rgba(15,23,42,0.16)] ${isDark ? 'border border-white/10 bg-white/[0.04]' : 'border border-slate-200 bg-white'}`}>
                  <div className="flex items-start gap-4">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${isDark ? 'bg-primary-500/12 text-white' : 'bg-primary-50 text-primary-600'}`}>
                      <Truck size={20} />
                    </div>
                    <div>
                      <h4 className={`text-sm font-black uppercase tracking-[0.14em] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Fast Delivery
                      </h4>
                      <p className={`mt-2 text-sm leading-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Quick dispatch on eligible orders with trusted delivery support.
                      </p>
                    </div>
                  </div>
                </div>
                <div className={`rounded-[1.8rem] p-5 shadow-[0_18px_40px_-26px_rgba(15,23,42,0.16)] ${isDark ? 'border border-white/10 bg-white/[0.04]' : 'border border-slate-200 bg-white'}`}>
                  <div className="flex items-start gap-4">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${isDark ? 'bg-primary-500/12 text-white' : 'bg-primary-50 text-primary-600'}`}>
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <h4 className={`text-sm font-black uppercase tracking-[0.14em] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Secure Checkout
                      </h4>
                      <p className={`mt-2 text-sm leading-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Protected payments and dependable post-purchase support.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </motion.div>
          </div>
        </div>

        <section className="mt-14 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] min-[1024px]:max-[1200px]:grid-cols-[1fr]">
          <div className={`rounded-[2.2rem] p-4 shadow-[0_28px_70px_-40px_rgba(15,23,42,0.14)] sm:p-6 md:p-7 ${isDark ? 'border border-white/10 bg-[#11151d]' : 'border border-slate-200 bg-white'}`}>
            <div className="mb-5 flex items-center gap-3 sm:mb-6">
              <Gauge className={isDark ? 'text-white' : 'text-slate-900'} size={18} />
              <h2 className={`text-2xl font-black uppercase tracking-tight sm:text-3xl ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Performance Data
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
              {performanceCards.map((card, index) => (
                <div
                  key={`${card.title}-${index}`}
                  className={`rounded-[1.7rem] p-4 sm:p-5 ${isDark ? 'border border-white/10 bg-white/[0.04]' : 'border border-slate-200 bg-slate-50'}`}
                >
                  <div className={`inline-flex rounded-2xl p-2.5 sm:p-3 ${isDark ? 'bg-primary-500/12 text-white' : 'bg-primary-50 text-primary-600'}`}>
                    {index % 2 === 0 ? <Sparkles size={16} /> : <BadgeCheck size={16} />}
                  </div>
                  <h3 className={`mt-3 text-lg font-black leading-tight sm:mt-4 sm:text-xl ${isDark ? 'text-white' : 'text-slate-900'}`}>{card.title}</h3>
                  <p className={`mt-2 text-sm leading-6 sm:mt-3 sm:leading-7 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{card.desc}</p>
                  <div className={`mt-4 h-2 overflow-hidden rounded-full sm:mt-5 ${isDark ? 'bg-white/5' : 'bg-slate-200'}`}>
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-300"
                      style={{ width: `${82 - index * 8}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-[2.2rem] p-4 shadow-[0_28px_70px_-40px_rgba(15,23,42,0.14)] sm:p-6 md:p-7 ${isDark ? 'border border-white/10 bg-[#11151d]' : 'border border-slate-200 bg-white'}`}>
            <div className="mb-5 sm:mb-6">
              <p className={`text-[11px] font-bold uppercase tracking-[0.22em] sm:text-xs ${isDark ? 'text-white' : 'text-slate-500'}`}>
                Product Details
              </p>
              <h2 className={`mt-2 text-2xl font-black uppercase tracking-tight sm:mt-3 sm:text-3xl ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Deeper Product Info
              </h2>
            </div>

            <div className={`overflow-hidden rounded-[1.7rem] ${isDark ? 'border border-white/10' : 'border border-slate-200'}`}>
              <div className={`grid grid-cols-3 gap-1 sm:flex sm:overflow-x-auto sm:gap-0 ${isDark ? 'border-b border-white/10' : 'border-b border-slate-200'}`}>
                {['description', 'specifications', 'reviews'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`min-w-0 w-full border-b-2 px-2 py-3 text-[11px] min-[320px]:max-[400px]:text-[10px] min-[320px]:max-[400px]:px-[5px] font-black uppercase tracking-[0.12em] transition-colors whitespace-nowrap sm:min-w-[140px] sm:px-5 sm:py-4 sm:text-[13px] sm:tracking-[0.16em] ${
                      activeTab === tab
                        ? isDark
                          ? 'border-primary-500 bg-primary-500/10 text-white'
                          : 'border-primary-500 bg-primary-50 text-primary-700'
                        : isDark
                          ? 'border-transparent bg-transparent text-slate-500 hover:text-white'
                          : 'border-transparent bg-transparent text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-4 sm:p-6">
                {activeTab === 'description' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
                    <p className={`text-sm leading-7 sm:text-base sm:leading-8 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{product.description}</p>
                    {productFeatures.length > 0 && (
                      <div className="mt-6">
                        <h4 className={`mb-3 text-xs font-black uppercase tracking-[0.16em] sm:mb-4 sm:text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          Key Highlights
                        </h4>
                        <div className="space-y-3">
                          {productFeatures.map((feature, index) => (
                            <div key={`${feature}-${index}`} className="flex items-start gap-3">
                              <span className="mt-2 h-2 w-2 rounded-full bg-primary-500"></span>
                              <p className={`text-sm leading-6 sm:leading-7 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{feature}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'specifications' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-2"
                  >
                    {productSpecifications.length > 0 ? (
                      productSpecifications.map((spec, index) => (
                        <div
                          key={`${spec.name}-${index}`}
                          className={`flex items-center justify-between gap-4 rounded-2xl px-4 py-3 sm:gap-6 sm:py-4 ${isDark ? 'border border-white/10 bg-white/[0.03]' : 'border border-slate-200 bg-slate-50'}`}
                        >
                          <span className={`text-sm font-medium leading-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{spec.name}</span>
                          <span className={`text-right text-sm font-bold leading-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>{spec.value}</span>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-slate-500">
                        Specifications will appear here when the seller adds them.
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'reviews' && (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.25 }}
    className="space-y-8"
  >
    
    {/* ✍️ Add Review */}

{!userInfo ? (
  // ❌ Not logged in
  <div className={`rounded-2xl p-5 text-center ${isDark ? 'border border-white/10 bg-white/[0.03]' : 'border border-slate-200 bg-slate-50'}`}>
    <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
      Please{' '}
      <Link to="/login" className="text-primary-400 underline">
        login
      </Link>{' '}
      to write a review
    </p>
  </div>

) : hasPurchased ? (
  // ✅ Buyer → show form
  <div className={`rounded-2xl p-5 ${isDark ? 'border border-white/10 bg-white/[0.03]' : 'border border-slate-200 bg-slate-50'}`}>
    <h4 className={`mb-4 text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Write a Review</h4>

    {/* ⭐ Rating */}
    <div className="flex gap-2 mb-4 items-center text-yellow-400">
      {[...Array(5)].map((_, i) => (
        <button
          key={i}
          onClick={(e) => handleRatingClick(e, i)}
          className="relative"
        >
          <Star size={24} className="text-gray-500" />
          <div
            className="absolute inset-0 overflow-hidden pointer-events-none"
            style={{
              width: `${Math.min(Math.max(rating - i, 0), 1) * 100}%`,
            }}
          >
            <Star size={24} className="text-yellow-400 fill-yellow-400" />
          </div>
        </button>
      ))}
      <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{rating.toFixed(1)}</span>
    </div>

    {/* Comment */}
    <textarea
      value={comment}
      onChange={(e) => setComment(e.target.value)}
      className={`w-full rounded-xl border p-3 outline-none ${isDark ? 'border-white/10 bg-slate-950/50 text-white' : 'border-slate-200 bg-white text-slate-900'}`}
    />

    <button
      onClick={submitReviewHandler}
      className="mt-4 w-full rounded bg-primary-600 py-2 text-white"
    >
      Submit Review
    </button>
  </div>

) : (
  // ❌ Logged in but not buyer
  <div className={`rounded-2xl p-5 text-center ${isDark ? 'border border-white/10 bg-white/[0.03]' : 'border border-slate-200 bg-slate-50'}`}>
    <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
      You can only review products you have purchased
    </p>
  </div>
)}


    {/* 📦 Reviews List */}
    <div className="space-y-4  max-h-[220px] overflow-y-auto pr-2">
      {reviews.length === 0 ? (
        <p className="text-center text-slate-500">No reviews yet</p>
      ) : (
        reviews.map((rev) => (
  <div
    key={rev._id}
    className={`rounded-2xl p-5 ${isDark ? 'border border-white/10 bg-[#11151d]' : 'border border-slate-200 bg-white'}`}
  >
    <div className="flex justify-between items-start gap-4">
      
      {/* 👤 Avatar + Name */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
          {rev.name?.charAt(0)}
        </div>
        <div>
          <p className={isDark ? 'font-bold text-white' : 'font-bold text-slate-900'}>{rev.name}</p>
          <p className="text-xs text-slate-500">
            {new Date(rev.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* ⭐ Rating */}
      <div className="flex text-yellow-400">
         {[...Array(5)].map((_, i) => (
    <div key={i} className="relative w-4 h-4">
      {/* Empty Star */}
      <Star size={16} className="text-gray-500" />

      {/* Fill Star Overlay */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{
          width: `${Math.min(Math.max(rev.rating - i, 0), 1) * 100}%`,
        }}
      >
        <Star size={16} className="text-yellow-400 fill-yellow-400" />
      </div>
    </div>
  ))}
      </div>
    </div>

    {/* 💬 Comment */}
    {rev.comment && (
      <p className={`mt-4 text-sm leading-7 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
        {rev.comment}
      </p>
    )}

    {/* ✏️ Actions */}
    {userInfo && (
  (typeof rev.user === 'object'
    ? rev.user._id === userInfo._id
    : rev.user === userInfo._id
  ) && (
    <div className="mt-4 flex gap-3 justify-between">
      <button
        onClick={() => handleDeleteReview(rev._id)}
        className="text-xs flex items-end text-red-400 hover:underline"
      >
        Delete
      </button>
    </div>
  )
)}
  </div>
))
      )}
    </div>
  </motion.div>
)}



              </div>
            </div>
          </div>
        </section>

        <section className="mt-14">
  <div className="mb-8 flex items-end justify-between gap-4">
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary-300">
        Customer Feedback
      </p>
      <h2 className="mt-3 text-3xl font-black uppercase tracking-tight ">
        The Verdict
      </h2>
    </div>
  </div>

  <div className="grid gap-6 lg:grid-cols-2">
    {topReviews.length === 0 ? (
      <p className="col-span-2 text-center text-slate-500">
        No top reviews yet
      </p>
    ) : (
      topReviews.map((review) => (
        <div
          key={review._id}
          className={`rounded-[2rem] p-6 shadow-[0_24px_60px_-38px_rgba(15,23,42,0.14)] ${isDark ? 'border border-white/10 bg-[#11151d]' : 'border border-slate-200 bg-white'}`}
        >
          <div className="flex items-center justify-between gap-4">
            
            {/* 👤 Name + Avatar */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                {review.name?.charAt(0)}
              </div>
              <div>
                <p className={isDark ? 'text-sm font-black uppercase tracking-[0.16em] text-white' : 'text-sm font-black uppercase tracking-[0.16em] text-slate-900'}>
                  {review.name}
                </p>
                <p className="text-[11px] text-slate-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* ⭐ Stars */}
            <div className="flex gap-1 text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} className="fill-yellow-400" />
              ))}
            </div>
          </div>

          {/* 💬 Comment */}
          <p className={`mt-6 text-sm leading-7 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            &quot;{review.comment}&quot;
          </p>
        </div>
      ))
    )}
  </div>
</section>


      </div>
    </div>
  );
};

export default ProductDetails;
