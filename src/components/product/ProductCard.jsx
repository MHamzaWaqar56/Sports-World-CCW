
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Eye, Heart } from 'lucide-react';
import { useCartStore } from '../../store/useCart.js';
import { useWishlistStore } from '../../store/useWishlistStore';
import toast from 'react-hot-toast';
import { getPrimaryProductImage } from '../../utils/media';
import { formatPrice } from '../../utils/price';
import { useAuthStore, useThemeStore } from '../../store/useStore.js';
import {
  getDisplayPrice,
  getDisplayStock,
  getPreferredVariant,
  getVariantLabel,
  isVariableProduct,
} from '../../utils/productVariant';



const ProductCard = ({ product, variant = 'default', badgeLabel = '' }) => {
  const { addToCart } = useCartStore();
  const { wishlistItems, toggleWishlist } = useWishlistStore();
  const { userInfo } = useAuthStore();
  const { theme } = useThemeStore();
  const productId = product?._id;
  const productName = product?.name || 'Product';
  const productCategory = product?.category || 'All';
  const isWishlisted = wishlistItems.some((item) => item._id === productId);
  const isShopVariant = variant === 'shop';
  const isDarkTheme = theme === 'dark';
  const useLightShopCard = isShopVariant && !isDarkTheme;
  const resolvedBadgeLabel = ['New Arrival', 'Featured'].includes(badgeLabel)
    ? badgeLabel
    : '';
  const reviewCount = Number(product?.numReviews || product?.reviews?.length || 0);
  const rating = Number(product?.rating || 0);
  const preferredVariant = getPreferredVariant(product);
  const unitPrice = getDisplayPrice(product, preferredVariant);
  const stockCount = getDisplayStock(product, preferredVariant);
  const variableProduct = isVariableProduct(product);
  const description = String(product?.description || '').trim();
  const subtitle = description ? `${description.slice(0, 88)}${description.length > 88 ? '...' : ''}` : 'Premium athletic gear curated for serious performance.';

  const handleAddToCart = async (e) => {
    e.preventDefault();

    if (!userInfo) {
      toast.error('User must be logged in to add to cart');
      return;
    }

    const added = await addToCart(product, 1, preferredVariant);
    if (!added) return;

    toast.success(`${product.name} added to cart`);
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();

    if (!userInfo) {
      toast.error('You must be logged in to add to wishlist');
      return;
    }

    try {
      const result = await toggleWishlist(productId);
      if (result.added) {
        toast.success('Added to wishlist');
      } else if (result.removed) {
        toast.success('Removed from wishlist');
      }
    } catch (err) {
      toast.error('Failed to update wishlist');
      console.error(err);
    }
  };

  return (
    <div
      className={`group relative flex h-full flex-col overflow-hidden transition-all duration-500 ${
        useLightShopCard
          ? 'rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_70px_-36px_rgba(15,23,42,0.14)] hover:-translate-y-1.5 hover:border-slate-300 hover:shadow-[0_34px_80px_-34px_rgba(15,23,42,0.18)]'
          : isShopVariant
            ? 'rounded-[2rem] border border-white/10 bg-[#11151d] shadow-[0_24px_70px_-36px_rgba(0,0,0,0.95)] hover:-translate-y-1.5 hover:border-white/20 hover:shadow-[0_34px_80px_-34px_rgba(220,38,38,0.24)]'
          : 'card-premium'
      }`}
    >
      <Link
        to={`/product/${productId}`}
        className={`relative block overflow-hidden ${
          useLightShopCard
            ? 'aspect-[4/4.35] rounded-[1.8rem] m-3 bg-slate-100'
            : isShopVariant
              ? 'aspect-[4/4.35] rounded-[1.8rem] m-3 bg-[#0a0d13]'
            : 'aspect-[4/5] bg-slate-100 dark:bg-gray-800/80'
        }`}
      >
        
        <div className={`absolute inset-0 ${useLightShopCard ? 'bg-gradient-to-t from-white via-white/12 to-transparent opacity-100' : isShopVariant ? 'bg-gradient-to-t from-slate-950 via-slate-950/22 to-transparent opacity-100' : 'bg-gradient-to-b from-transparent via-transparent to-slate-950/30 opacity-0 group-hover:opacity-100'} transition-opacity duration-500`}></div>
        {stockCount === 0 && (
          <div className="absolute left-4 top-4 z-10 rounded-full border border-red-400/30 bg-red-500/90 px-3 py-1.5 text-xs font-bold text-white shadow-sm backdrop-blur-md">
            Sold Out
          </div>
        )}
        {resolvedBadgeLabel && stockCount > 0 && (
          <div className={`absolute left-4 top-4 z-10 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] shadow-[0_14px_30px_-16px_rgba(220,38,38,0.85)] ${useLightShopCard ? 'border-primary-500/20 bg-primary-600 text-white' : 'border-primary-400/25 bg-primary-600 text-white'}`}>
            {resolvedBadgeLabel}
          </div>
        )}
        <div className={`absolute right-4 top-4 z-10 flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-bold shadow-sm backdrop-blur-md ${
          useLightShopCard
            ? 'border border-slate-200 bg-white/95 text-slate-800'
            : isShopVariant
              ? 'border border-white/10 bg-slate-950/80 text-white'
            : 'border border-slate-200 bg-white/92 text-slate-800 dark:border-dark-border dark:bg-dark-card/90 dark:text-white'
        }`}>
          <Star size={12} className="fill-yellow-400 text-yellow-400" />
          {rating.toFixed(1)}
        </div>

        <img
          src={getPrimaryProductImage(product)}
          alt={productName}
          className={`h-full w-full object-cover transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${isShopVariant ? 'group-hover:scale-105' : 'group-hover:scale-110 group-hover:rotate-1'}`}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = getPrimaryProductImage({});
          }}
        />

        <div className={`absolute inset-x-0 bottom-0 flex justify-center gap-3 bg-gradient-to-t from-black/65 via-black/15 to-transparent p-4 transition-all duration-300 ${
          useLightShopCard ? 'translate-y-0 opacity-100 sm:translate-y-4 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100' : isShopVariant ? 'translate-y-0 opacity-100 sm:translate-y-4 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100' : 'translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100'
        }`}>
          <button
            onClick={handleWishlistToggle} // 🔹 Updated handler
            className={`flex h-10 w-10 items-center justify-center rounded-full shadow-xl transition-transform hover:scale-110 ${
              useLightShopCard ? 'border border-slate-200 bg-white text-slate-700' : isShopVariant ? 'border border-white/10 bg-slate-950/88 text-white' : 'bg-white dark:bg-dark-card text-slate-700 dark:text-gray-200'
            }`}
          >
            <Heart size={18} className={isWishlisted ? 'fill-red-500 text-red-500' : 'hover:text-red-500 transition-colors'} />
          </button>
          <div className={`flex h-10 w-10 items-center justify-center rounded-full shadow-xl transition-transform hover:scale-110 ${
            useLightShopCard ? 'border border-slate-200 bg-white text-slate-700' : isShopVariant ? 'border border-white/10 bg-slate-950/88 text-white' : 'bg-white dark:bg-dark-card text-slate-700 dark:text-gray-200'
          }`}>
            <Eye size={18} />
          </div>
        </div>
      </Link>

      
        <div className={`relative z-10 flex flex-grow flex-col p-5 ${useLightShopCard ? 'bg-white pt-3' : isShopVariant ? 'bg-transparent pt-3' : 'bg-white/95 dark:bg-dark-card/95'}`}>
          <div className="mb-2 flex items-center justify-between gap-3">
           <Link
            to={`/shop?category=${productCategory}`}
            className={`inline-flex w-fit items-center  rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.24em] transition-colors ${
              useLightShopCard
                ? 'border-slate-200 bg-slate-50 text-slate-700 hover:text-primary-600'
                : isShopVariant
                  ? 'border-white/10 bg-white/[0.05] text-primary-300 hover:text-white'
                : 'border-primary-500/15 bg-primary-500/10 text-primary-700 hover:text-red-500 dark:border-primary-500/20 dark:bg-primary-500/12 dark:text-primary-300'
            }`}
          >
            {product.category}
          </Link>
          {isShopVariant && (
            <span className="text-xs font-semibold text-slate-500">
              {reviewCount > 0 ? `${reviewCount} reviews` : 'Curated pick'}
            </span>
          )}
        </div>

        <Link to={`/product/${productId}`}>
          <h3 className={`mb-2 line-clamp-2 leading-tight transition-colors ${
            useLightShopCard
              ? 'text-[1.45rem] font-black uppercase text-slate-900 group-hover:text-primary-600'
              : isShopVariant
                ? 'text-[1.45rem] font-black uppercase text-white group-hover:text-primary-300'
              : 'text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary-600'
          }`}>
            {product.name}
          </h3>
        </Link>

        <div className="relative z-30 mb-4">
          <p
            className={`peer inline-block cursor-help line-clamp-2 text-sm leading-6 ${useLightShopCard ? 'text-slate-500' : isShopVariant ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}
          >
            {subtitle}
          </p>

          {description && (
            <div className="pointer-events-none absolute bottom-full left-0 z-40 mb-2 max-w-full translate-y-1 opacity-0 transition-all duration-200 peer-hover:translate-y-0 peer-hover:opacity-100 peer-focus:translate-y-0 peer-focus:opacity-100">
              <div className={`max-h-56 overflow-auto rounded-2xl border px-4 py-3 text-sm leading-6 shadow-2xl ${useLightShopCard ? 'border-slate-200 bg-white text-slate-700' : isShopVariant ? 'border-white/10 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-700 dark:border-dark-border dark:bg-dark-card dark:text-white'}`}>
                {description}
              </div>
            </div>
          )}
        </div>

        <div className={`mt-auto ${isShopVariant ? 'border-t border-white/10' : 'border-t border-slate-100 dark:border-dark-border/50'}`}>
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className={`mb-0.5 text-sm line-through ${useLightShopCard ? 'text-slate-400' : isShopVariant ? 'text-slate-500' : 'text-slate-400'}`}>
                {formatPrice(unitPrice * 1.25)}
              </span>
              <span className={`leading-none ${useLightShopCard ? 'text-2xl font-black text-slate-900' : isShopVariant ? 'text-2xl font-black text-white' : 'text-xl font-extrabold text-slate-900 dark:text-white'}`}>
                {formatPrice(unitPrice)}
              </span>
            </div>

            <div className={`flex items-center gap-1 text-sm ${useLightShopCard ? 'text-slate-500' : isShopVariant ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
              <Star size={14} className="fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{rating.toFixed(1)}</span>
            </div>
          </div>

          {variableProduct && preferredVariant && (
            <p className={`mb-3 text-xs font-semibold ${useLightShopCard ? 'text-slate-500' : isShopVariant ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>
              Variant: {getVariantLabel(preferredVariant)}
            </p>
          )}

          <button
            onClick={handleAddToCart}
            disabled={stockCount === 0}
            className={`group/btn flex h-12 w-full items-center justify-center gap-2 rounded-2xl border text-sm font-bold uppercase tracking-[0.14em] transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${
              useLightShopCard
                ? 'border-slate-200 bg-slate-100 text-slate-700 hover:-translate-y-0.5 hover:border-primary-600 hover:bg-primary-600 hover:text-white hover:shadow-[0_22px_40px_-18px_rgba(220,38,38,0.22)]'
                : isShopVariant
                  ? 'border-white/10 bg-white/[0.06] text-white hover:-translate-y-0.5 hover:border-primary-600 hover:bg-primary-600 hover:shadow-[0_22px_40px_-18px_rgba(220,38,38,0.55)]'
                : 'border-slate-200 bg-slate-100 text-slate-600 shadow-sm hover:-translate-y-0.5 hover:border-primary-600 hover:bg-primary-600 hover:text-white hover:shadow-primary-600/30 dark:border-dark-border dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-primary-600 dark:hover:text-white'
            }`}
            aria-label="Add to Cart"
          >
            <ShoppingCart size={18} className="transition-transform group-hover/btn:scale-110" />
            {stockCount === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
      
      
      </div>
  );
};

export default ProductCard;