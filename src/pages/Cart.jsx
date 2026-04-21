import { useAuthStore } from '../store/useStore';
import { useOrderStore } from '../store/useOrderStore';
import { useCartStore } from '../store/useCart';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2, ArrowRight, ShieldCheck, Tag, ShoppingBag,
  AlertTriangle, X, Truck, RefreshCw, Lock, ChevronRight,
  MapPin, Phone, User, Hash, Package, CreditCard, CheckCircle,
  Gift, Percent, HelpCircle
} from 'lucide-react';
import PageHero from '../components/common/PageHero';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getPrimaryProductImage } from '../utils/media';
import { formatPrice } from '../utils/price';
import ConfirmModal from '../components/common/ConfirmModal';
import {
  getCartItemStock,
  getCartItemUnitPrice,
  getVariantLabel,
  getCartItemVariant,
} from '../utils/productVariant';

const Motion = motion;

const roundCurrency = (value) => Number(Number(value || 0).toFixed(2));

/* ─── Checkout Step Indicator ─────────────────────────────── */
const StepIndicator = ({ currentStep }) => {
  const steps = [
    { id: 1, label: 'Shipping', icon: MapPin },
    { id: 2, label: 'Payment', icon: CreditCard },
    { id: 3, label: 'Confirm', icon: CheckCircle },
  ];
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((step, i) => (
        <div key={step.id} className="flex items-center">
          <div className={`flex flex-col items-center gap-1.5`}>
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300
              ${currentStep >= step.id
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                : 'bg-slate-100 dark:bg-dark-bg text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-dark-border'}`}>
              {currentStep > step.id ? <CheckCircle size={16} /> : <step.icon size={15} />}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider
              ${currentStep >= step.id ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'}`}>
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-16 sm:w-24 h-0.5 mb-5 mx-2 transition-all duration-300
              ${currentStep > step.id ? 'bg-primary-600' : 'bg-slate-200 dark:bg-dark-border'}`} />
          )}
        </div>
      ))}
    </div>
  );
};

/* ─── Trust Badges ────────────────────────────────────────── */
const TrustBadges = () => (
  <div className="grid grid-cols-3 gap-3 mt-6">
    {[
      { icon: Lock,     label: 'Secure', sub: 'SSL Encrypted' },
      { icon: Truck,    label: 'Fast',   sub: 'Local Dispatch' },
      { icon: RefreshCw,label: '7-Day',  sub: 'Easy Returns'  },
    ].map((b, i) => (
      <div key={i} className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-dark-bg border border-slate-100 dark:border-dark-border">
        <div className="w-8 h-8 rounded-xl bg-primary-600/10 flex items-center justify-center">
          <b.icon size={15} className="text-primary-600 dark:text-primary-400" />
        </div>
        <span className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-wide">{b.label}</span>
        <span className="text-[10px] text-slate-400 font-medium text-center leading-tight">{b.sub}</span>
      </div>
    ))}
  </div>
);

/* ─── Cart Item Row ───────────────────────────────────────── */
const CartItemRow = ({ item, onQtyChange, onRemove }) => (
  <motion.div
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }} layout
    key={item._id}
    className="py-6 sm:py-7 flex flex-col sm:grid sm:grid-cols-12 items-center sm:items-start gap-5 group"
  >
    {(() => {
      const unitPrice = getCartItemUnitPrice(item);
      const stock = getCartItemStock(item);
      const matchedVariant = getCartItemVariant(item);
      const variantLabel =
        item.variantName || getVariantLabel(matchedVariant) || item.variantSku || '';

      return (
        <>
    {/* Image & Title */}
    <div className="col-span-6 w-full flex items-center gap-5">
      <Link
        to={`/product/${item.product._id}`}
        className="shrink-0 w-24 h-24 bg-slate-50 dark:bg-dark-bg rounded-2xl overflow-hidden border border-slate-200 dark:border-dark-border shadow-sm relative"
      >
        <img
          src={getPrimaryProductImage(item.product)}
          alt={item.product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
          onError={(e) => { e.currentTarget.src = getPrimaryProductImage({}); }}
        />
        {stock <= 5 && stock > 0 && (
          <div className="absolute bottom-1 left-1 right-1 bg-amber-500/90 backdrop-blur-sm text-white text-[9px] font-black uppercase tracking-wide text-center rounded-lg py-0.5">
            Only {stock} left
          </div>
        )}
      </Link>
      <div className="flex flex-col gap-1 min-w-0">
        <span className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">{item.product.category}</span>
        <Link
          to={`/product/${item.product._id}`}
          className="font-bold text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-base leading-snug line-clamp-2"
        >
          {item.product.name}
        </Link>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Unit:</span>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{formatPrice(unitPrice)}</span>
        </div>
        {variantLabel && (
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Variant: {variantLabel}
          </p>
        )}
        {/* Mobile price */}
        <span className="text-base font-black text-slate-900 dark:text-white block sm:hidden mt-1">
          {formatPrice(unitPrice * item.quantity)}
        </span>
      </div>
    </div>

    {/* Quantity */}
    <div className="col-span-3 w-full sm:w-auto flex justify-center pt-0 sm:pt-1">
      <div className="flex items-center border border-slate-200 dark:border-dark-border rounded-xl w-32 h-11 bg-slate-50 dark:bg-dark-bg overflow-hidden shadow-inner shadow-slate-100 dark:shadow-black">
        <button
          onClick={() => onQtyChange(item.product, Math.max(1, item.quantity - 1), matchedVariant)}
          disabled={item.quantity === 1}
          className={`w-10 h-full flex items-center justify-center font-bold text-lg transition-colors
            ${item.quantity === 1
              ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-gray-800 hover:text-slate-900 dark:hover:text-white'}`}
        >
          −
        </button>
        <div className="w-12 h-full flex items-center justify-center font-black text-slate-900 dark:text-white bg-transparent text-sm">
          {item.quantity}
        </div>
        <button
          onClick={() => onQtyChange(item.product, Math.min(stock, item.quantity + 1), matchedVariant)}
          disabled={item.quantity >= stock}
          className={`w-10 h-full flex items-center justify-center font-bold text-lg transition-colors
            ${item.quantity >= stock
              ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-gray-800 hover:text-slate-900 dark:hover:text-white'}`}
        >
          +
        </button>
      </div>
    </div>

    {/* Price */}
    <div className="col-span-2 hidden sm:flex justify-end items-start pt-1.5">
      <span className="text-xl font-extrabold text-slate-900 dark:text-white">
        {formatPrice(unitPrice * item.quantity)}
      </span>
    </div>

    {/* Remove */}
    <div className="col-span-1 flex justify-end items-start pt-1">
      <button
        onClick={() => onRemove(item.product._id, item.variantId)}
        className="p-2.5 text-slate-400 hover:text-red-500 bg-white hover:bg-red-50 dark:bg-transparent dark:hover:bg-red-900/20 rounded-xl transition-all shadow-sm border border-transparent hover:border-red-100 dark:hover:border-red-900/50"
        title="Remove item"
      >
        <Trash2 size={18} />
      </button>
    </div>
        </>
      );
    })()}
  </motion.div>
);

/* ─── Main Cart Component ─────────────────────────────────── */
const Cart = () => {
  const { userInfo } = useAuthStore();
  const { cartItems, addToCart, removeFromCart, clearCart, fetchCart } = useCartStore();
  const { createOrder, validatePromo, promo, promoLoading } = useOrderStore();
  const navigate = useNavigate();

  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Pakistan',
  });
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [promoCode, setPromoCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showShippingGuide, setShowShippingGuide] = useState(false);
  const [showClearCartConfirm, setShowClearCartConfirm] = useState(false);

  const isCodEligible = cartItems.every(item => item.codAvailable !== false);

  useEffect(() => {
    if (userInfo) fetchCart();
  }, [userInfo, fetchCart]);

  useEffect(() => {
    if (!isCodEligible && paymentMethod === 'COD') setPaymentMethod('JazzCash');
  }, [isCodEligible, paymentMethod]);

  const handleQtyChange = (product, qty, selectedVariant = null) =>
    addToCart(product, Number(qty), selectedVariant);
  const removeItemHandler = (id, variantId = null) => removeFromCart(id, variantId);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + getCartItemUnitPrice(item) * item.quantity, 0
  );
  const shippingFee = (() => {
    const normalizedSubtotal = roundCurrency(subtotal);

    if (normalizedSubtotal >= 5000) return 0;
    if (normalizedSubtotal <= 500) return 50;
    if (normalizedSubtotal <= 1000) return 100;
    if (normalizedSubtotal <= 2000) return 150;
    if (normalizedSubtotal <= 4000) return 180;

    return 200;
  })();

  const preDiscountTotal = roundCurrency(subtotal + shippingFee);
  const discountAmount = promo
    ? roundCurrency(preDiscountTotal * (promo.discountPercentage / 100))
    : 0;

  const total = roundCurrency(preDiscountTotal - discountAmount);

const handlePromoApply = async () => {
  if (!promoCode.trim()) return;

  try {
    const res = await validatePromo(promoCode);

    toast.success(`Promo applied! ${res.discountPercentage}% discount`);
  } catch (e) {
    toast.error(e.message);
  }
};

  const handleNextStep = (e) => {
    e.preventDefault();
    setCheckoutStep(2);
  };

  const handlePlaceOrder = async (e) => {
  e.preventDefault();

  if (!userInfo) {
    toast.error('Please login to place an order');
    navigate('/login');
    return;
  }

  setIsProcessing(true);

  try {
    const formattedItems = cartItems.map(item => ({
      _id: item.product._id,
      qty: item.quantity,
      variantId: item.variantId || null,
      variantName: item.variantName || '',
      variantSku: item.variantSku || '',
      variantAttributes: Array.isArray(item.variantAttributes)
        ? item.variantAttributes
        : [],
    }));

    await createOrder({
      orderItems: formattedItems,
      shippingAddress,
      paymentMethod,
      promoCode: promo?.code || null, // ONLY THIS RELATED TO PROMO
    });

    toast.success('Order placed successfully!');
    clearCart();
    setShowCheckout(false);
    navigate('/profile');

  } catch (err) {
    toast.error(err.message || 'Failed to place order');
  } finally {
    setIsProcessing(false);
  }
};

  /* ── Shared input class ── */
  const inputCls = "w-full bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-600/30 focus:border-primary-600 outline-none text-slate-900 dark:text-white font-medium transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600";
  const labelCls = "text-[11px] font-black  dark:text-slate-400 uppercase tracking-[0.14em]";

  return (
    <div className="min-h-screen bg-transparent pb-20">
      <PageHero
        Icon={ShoppingBag}
        badge="Checkout Center"
        title="Shopping"
        highlight="Cart"
        description={`${cartItems.length} ${cartItems.length === 1 ? 'item' : 'items'} ready for checkout. Review quantities, delivery details, and payment before placing your order.`}
        chips={[
          'Secure checkout',
          'Fast local dispatch',
          '7-day easy returns',
        ]}
      />

      <div className="container-bound max-w-7xl">
        <div className="mb-10 md:mb-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-[0.2em] mb-2">
                Sports World
              </p>
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
            {cartItems.length > 0 && (
              <button
                onClick={() => setShowClearCartConfirm(true)}
                className="inline-flex items-center gap-2 text-sm font-bold hover:text-red-500 transition-colors self-start md:self-auto"
              >
                <Trash2 size={15} />
                Clear Cart
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 mt-4 text-xs text-slate-400 font-medium">
            <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link to="/shop" className="hover:text-primary-600 transition-colors">Shop</Link>
            <ChevronRight size={12} />
            <span className="text-slate-600 dark:text-slate-300 font-bold">Cart</span>
          </div>
        </div>

        {/* ── Empty State ── */}
        {cartItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="empty-state"
          >
            <div className="w-28 h-28 bg-slate-50 dark:bg-dark-bg rounded-full flex items-center justify-center mb-6 text-slate-900 dark:text-white border border-slate-100 dark:border-dark-border shadow-inner">
              <ShoppingBag size={48} />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Your cart is empty
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-10 leading-relaxed text-center min-[320px]:max-[420px]:text-[14px] min-[320px]:max-[420px]:leading-[20px]">
              Looks like you haven't added anything yet. Browse our premium cricket, football, and fitness gear — delivered fast in Chichawatni.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/shop" className="btn-primary inline-flex px-10 h-14 items-center gap-2">
                <Package size={18} />
                Explore Premium Gear
              </Link>
              <Link to="/" className="inline-flex h-14 items-center justify-center gap-2 px-8 rounded-2xl border border-slate-200 dark:border-dark-border text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-dark-bg transition-colors">
                Back to Home
              </Link>
            </div>

            {/* Popular categories nudge */}
            <div className="mt-16 w-full max-w-xl mx-auto">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 text-center">Popular Categories</p>
              <div className="flex flex-wrap gap-3 justify-center">
                {['Cricket', 'Football', 'Badminton', 'Fitness', 'Athletics'].map(cat => (
                  <Link
                    key={cat}
                    to={`/shop?category=${cat}`}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-dark-border text-sm font-bold text-slate-600 dark:text-slate-300 hover:border-primary-600 hover:text-primary-600 dark:hover:text-primary-400 transition-all bg-white dark:bg-dark-card"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

            {/* ── Cart Items ── */}
            <div className="lg:w-2/3">
              <div className="table-shell">
                {/* Table Header */}
                <div className="px-6 md:px-8 py-4 hidden sm:grid grid-cols-12 gap-4 border-b border-slate-200 dark:border-dark-border bg-slate-50/80 dark:bg-dark-bg text-xs font-black  dark:text-slate-500 uppercase tracking-[0.16em]">
                  <div className="col-span-6">Product Details</div>
                  <div className="col-span-3 text-center">Quantity</div>
                  <div className="col-span-2 text-right">Total</div>
                  <div className="col-span-1" />
                </div>

                {/* Items */}
                <div className="divide-y divide-slate-100 dark:divide-dark-border px-6 md:px-8">
                  <AnimatePresence>
                    {cartItems.filter(item => item.product).map((item) => (
                      <CartItemRow
                        key={item._id}
                        item={item}
                        onQtyChange={handleQtyChange}
                        onRemove={removeItemHandler}
                      />
                    ))}
                  </AnimatePresence>
                </div>

                {/* Cart Footer */}
                <div className="px-6 md:px-8 py-5 border-t border-slate-100 dark:border-dark-border bg-slate-50/60 dark:bg-dark-bg flex flex-col sm:flex-row items-center justify-between gap-4">
                  <Link
                    to="/shop"
                    className="inline-flex items-center gap-2 text-sm font-bold text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    ← Continue Shopping
                  </Link>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <ShieldCheck size={14} className="text-green-500" />
                    All products are authentic & quality-checked
                  </div>
                </div>
              </div>

              {/* ── Shipping Notice Banner ── */}
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className={`mt-4 rounded-2xl border px-5 py-4 flex items-center gap-3 ${
                  subtotal >= 5000
                    ? 'border-green-200 dark:border-green-800/40 bg-green-50 dark:bg-green-900/10'
                    : 'border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-900/10'
                }`}
              >
                <Truck size={18} className={subtotal >= 5000 ? 'text-green-500' : 'text-amber-500'} />
                {subtotal >= 5000 ? (
                  <p className="text-sm font-bold text-green-700 dark:text-green-400">
                    🎉 You've unlocked <span className="underline">Free Shipping!</span>
                  </p>
                ) : (
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                    Add <span className="font-black">{formatPrice(5000 - subtotal)}</span> more to get{' '}
                    <span className="font-black">Free Shipping</span>
                  </p>
                )}
              </motion.div>

              
            </div>

            {/* ── Order Summary Sidebar ── */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:w-1/3">
              <div className="panel-premium sticky top-28 p-6 md:p-8">
                <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight">
                  Order Summary
                </h2>

                {/* Promo Code */}
                <div className="mb-6">
                  <label className={`${labelCls} mb-2 block`}>
                    <Gift size={11} className="inline mr-1" />Promo Code
                  </label>
                  <div className="relative flex items-center bg-slate-50 dark:bg-dark-bg rounded-xl border border-slate-200 dark:border-dark-border p-1 focus-within:ring-2 focus-within:ring-primary-600/20 focus-within:border-primary-600 transition-all">
                    <Tag className="absolute left-4 text-slate-400" size={15} />
                    <input
                      type="text"
                      placeholder="e.g. SPORTS WORLD"
                      value={promoCode}
                      onChange={e => setPromoCode(e.target.value)}
                      disabled={!!promo}
                      className="w-full bg-transparent pl-10 pr-24 h-11 text-sm text-slate-900 dark:text-white focus:outline-none placeholder:text-slate-400 font-medium disabled:opacity-60"
                    />
                    {promo ? (
                      <div className="absolute right-2 flex items-center gap-1 text-green-600 font-black text-xs px-3 py-2">
                        <CheckCircle size={13} /> Applied
                      </div>
                    ) : (
                      <button
                        onClick={handlePromoApply}
                        className="absolute right-2 font-black text-xs text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-primary-600 dark:hover:bg-primary-600 dark:hover:text-white px-4 py-2.5 rounded-lg transition-colors uppercase tracking-wider"
                      >
                        {promoLoading ? "Checking..." : "Apply"}
                      </button>
                    )}
                  </div>
                  {promo && (
  <motion.p className="text-xs text-green-600 font-bold mt-2 flex items-center gap-1">
    <Percent size={11} /> {promo.code} — {promo.discountPercentage}% discount applied!
  </motion.p>
)}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3.5 text-sm font-medium border-t border-slate-100 dark:border-dark-border pt-5">
                  <div className="flex justify-between text-slate-500 dark:text-slate-400 items-center">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-slate-400 items-center">
                    <span className="flex items-center gap-1.5 flex-wrap">
                      Shipping Fee
                      <button
                        type="button"
                        onClick={() => setShowShippingGuide(true)}
                        className="inline-flex items-center gap-1 rounded-full border border-primary-200 bg-primary-50 px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-primary-700 transition-colors hover:bg-primary-100 dark:border-primary-500/30 dark:bg-primary-500/10 dark:text-primary-300 dark:hover:bg-primary-500/15"
                      >
                        <HelpCircle size={11} />
                        Shipping Guide
                      </button>
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatPrice(shippingFee)}</span>
                  </div>
                  
                  {promo && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span className="flex items-center gap-1 font-bold">
                        <Percent size={12} /> Promo Discount
                      </span>
                      <span className="font-bold">− {formatPrice(discountAmount)}</span>
                    </div>
                  )}

                  {/* Total */}
                  <div className="border-t border-dashed border-slate-200 dark:border-dark-border pt-4 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">Total</span>
                      <div className="text-right">
                        <span className="font-black text-3xl text-slate-900 dark:text-white tracking-tight leading-none">
                          {formatPrice(total)}
                        </span>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">incl. all charges</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="flex flex-col gap-3 mt-6">
                  <button
                    onClick={() => { setShowCheckout(true); setCheckoutStep(1); }}
                    className="w-full btn-primary h-14 text-sm tracking-[0.1em] font-black shadow-lg shadow-primary-600/25 flex items-center justify-center gap-2 uppercase"
                  >
                    Proceed to Checkout <ArrowRight size={18} />
                  </button>
                  <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
                    <ShieldCheck size={13} className="text-green-500" />
                    Secure SSL Checkout — Your data is safe
                  </p>
                </div>

                {/* Trust Badges */}
                <TrustBadges />
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════
          CHECKOUT MODAL
      ══════════════════════════════════════════ */}
      <AnimatePresence>
        {showCheckout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/5 backdrop-blur-sm"
              onClick={() => !isProcessing && setShowCheckout(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 24 }}
              className="relative w-full max-w-2xl bg-white dark:bg-dark-card rounded-3xl shadow-2xl border border-slate-100 dark:border-dark-border overflow-hidden max-h-[92vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-dark-border bg-slate-50 dark:bg-dark-bg shrink-0">
                <div>
                  <h3 className="font-extrabold text-xl text-slate-900 dark:text-white tracking-tight">
                    Secure Checkout
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">Sports World — Chichawatni</p>
                </div>
                <button
                  onClick={() => !isProcessing && setShowCheckout(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-200 dark:bg-gray-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Step Indicator */}
              <div className="px-6 pt-6 shrink-0">
                <StepIndicator currentStep={checkoutStep} />
              </div>

              {/* Scrollable Body */}
              <div className="px-6 md:px-8 pb-4 overflow-y-auto hide-scrollbar flex-1">

                {/* ── STEP 1: Shipping ── */}
                {checkoutStep === 1 && (
                  <form id="shippingForm" onSubmit={handleNextStep} className="space-y-5 pb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center">
                        <MapPin size={12} className="text-white" />
                      </div>
                      <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-[0.18em]">
                        Delivery Information
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Full Name */}
                      <div className="space-y-1.5">
                        <label className={labelCls}>
                          <User size={10} className="inline mr-1" />Full Name
                        </label>
                        <input
                          required
                          placeholder="Your full name"
                          value={shippingAddress.fullName || ''}
                          onChange={e => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                          className={inputCls}
                        />
                      </div>

                      {/* Phone */}
                      <div className="space-y-1.5">
                        <label className={labelCls}>
                          <Phone size={10} className="inline mr-1" />Phone Number
                        </label>
                        <input
                          required
                          placeholder="+92 300 0000000"
                          value={shippingAddress.phone || ''}
                          onChange={e => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                          className={inputCls}
                        />
                      </div>

                      {/* Street Address */}
                      <div className="sm:col-span-2 space-y-1.5">
                        <label className={labelCls}>
                          <MapPin size={10} className="inline mr-1" />Street Address
                        </label>
                        <input
                          required
                          placeholder="House / Street / Area"
                          value={shippingAddress.address}
                          onChange={e => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                          className={inputCls}
                        />
                      </div>

                      {/* City */}
                      <div className="space-y-1.5">
                        <label className={labelCls}>City</label>
                        <input
                          required
                          placeholder="e.g. Chichawatni"
                          value={shippingAddress.city}
                          onChange={e => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                          className={inputCls}
                        />
                      </div>

                      {/* Postal Code */}
                      <div className="space-y-1.5">
                        <label className={labelCls}>
                          <Hash size={10} className="inline mr-1" />Postal Code
                        </label>
                        <input
                          required
                          placeholder="e.g. 57200"
                          value={shippingAddress.postalCode}
                          onChange={e => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                          className={inputCls}
                        />
                      </div>

                      {/* Country */}
                      <div className="sm:col-span-2 space-y-1.5">
                        <label className={labelCls}>Country</label>
                        <input
                          required
                          value={shippingAddress.country}
                          onChange={e => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                          className={inputCls}
                        />
                      </div>
                    </div>

                    {/* Local delivery note */}
                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 mt-2">
                      <Truck size={16} className="text-blue-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-700 dark:text-blue-400 font-medium leading-relaxed">
                        <span className="font-black">Local Delivery (Chichawatni):</span> Orders within Chichawatni are delivered within 60 minutes approximately. Outstation orders via TCS, Leopards, or M&P take 2 to 3 working days.
                      </p>
                    </div>
                  </form>
                )}

                {/* ── STEP 2: Payment ── */}
                {checkoutStep === 2 && (
                  <form id="paymentForm" onSubmit={handlePlaceOrder} className="space-y-5 pb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center">
                        <CreditCard size={12} className="text-white" />
                      </div>
                      <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-[0.18em]">
                        Payment Method
                      </h4>
                    </div>

                    {/* COD warning */}
                    {!isCodEligible && (
                      <div className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30 flex items-start gap-3">
                        <AlertTriangle className="text-orange-500 shrink-0 mt-0.5" size={16} />
                        <p className="text-xs text-orange-800 dark:text-orange-300 font-medium leading-relaxed">
                          Some items in your cart are not eligible for Cash on Delivery. Please select an online payment method.
                        </p>
                      </div>
                    )}

                    {/* Payment options */}
                    <div className="space-y-3">
                      {/* COD */}
                      <label className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        !isCodEligible
                          ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg'
                          : paymentMethod === 'COD'
                            ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/10 shadow-sm'
                            : 'border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg hover:border-slate-300 dark:hover:border-slate-600'
                      }`}>
                        <input
                          type="radio" name="paymentMethod" value="COD"
                          disabled={!isCodEligible}
                          checked={paymentMethod === 'COD'}
                          onChange={e => setPaymentMethod(e.target.value)}
                          className="w-4 h-4 text-primary-600 border-slate-300 focus:ring-primary-600"
                        />
                        <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center shrink-0">
                          <Package size={18} className="text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-black text-slate-900 dark:text-white block text-sm">Cash on Delivery</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Pay cash to the delivery person upon arrival</span>
                        </div>
                        {paymentMethod === 'COD' && (
                          <CheckCircle size={18} className="text-primary-600 shrink-0" />
                        )}
                      </label>

                      {/* JazzCash - Coming Soon */}
                      <label className="flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg opacity-50 cursor-not-allowed">
                        <input type="radio" name="paymentMethod" value="JazzCash" disabled className="w-4 h-4 text-primary-600 border-slate-300" />
                        <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                          <CreditCard size={18} className="text-red-500" />
                        </div>
                        <div className="flex-1">
                          <span className="font-black text-slate-900 dark:text-white block text-sm">JazzCash / EasyPaisa</span>
                          <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">Coming Soon</span>
                        </div>
                      </label>
                    </div>

                    {/* Order Summary recap */}
                    <div className="rounded-2xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg p-4 mt-2 space-y-2.5">
                      <p className="text-xs font-black uppercase tracking-widest mb-3">Order Recap</p>
                      {cartItems.filter(i => i.product).map(item => (
                        <div key={item._id} className="flex items-center gap-3">
                          <img
                            src={getPrimaryProductImage(item.product)}
                            alt={item.product.name}
                            className="w-9 h-9 rounded-lg object-cover border border-slate-200 dark:border-dark-border"
                          />
                          <span className="flex-1 text-xs font-medium text-slate-600 dark:text-slate-400 line-clamp-1">{item.product.name}</span>
                          <span className="text-xs font-black text-slate-900 dark:text-white">×{item.quantity}</span>
                          <span className="text-xs font-black text-slate-900 dark:text-white">{formatPrice(getCartItemUnitPrice(item) * item.quantity)}</span>
                        </div>
                      ))}
                      <div className="border-t border-slate-200 dark:border-dark-border pt-2.5 flex justify-between">
                        <span className="text-xs font-black text-slate-500 uppercase tracking-wide">Total</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white">{formatPrice(total)}</span>
                      </div>
                    </div>
                  </form>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-5 border-t border-slate-100 dark:border-dark-border bg-slate-50 dark:bg-dark-bg flex items-center justify-between gap-4 shrink-0">
                <div>
                  {checkoutStep === 1 ? (
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-black ">Cart Total</p>
                      <p className="text-xl font-black text-slate-900 dark:text-white">{formatPrice(total)}</p>
                    </div>
                  ) : (
                    <button
                      onClick={() => setCheckoutStep(1)}
                      disabled={isProcessing}
                      className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-1"
                    >
                      ← Back
                    </button>
                  )}
                </div>

                <button
                  form={checkoutStep === 1 ? 'shippingForm' : 'paymentForm'}
                  type="submit"
                  disabled={isProcessing}
                  className="btn-primary px-8 h-13 tracking-wide shadow-lg shadow-primary-600/20 flex items-center gap-2 font-black uppercase text-sm disabled:opacity-50"
                >
                  {isProcessing
                    ? 'Processing...'
                    : checkoutStep === 1
                      ? <><span>Continue</span><ArrowRight size={16} /></>
                      : paymentMethod === 'COD'
                        ? 'Place Order'
                        : 'Pay Now'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        open={showClearCartConfirm}
        title="Clear Cart"
        description="Remove all items from your cart? This action cannot be undone."
        confirmLabel="Yes, Clear Cart"
        cancelLabel="Keep Items"
        tone="danger"
        onCancel={() => setShowClearCartConfirm(false)}
        onConfirm={async () => {
          await clearCart();
          setShowClearCartConfirm(false);
        }}
      />

      {/* Shipping Guide Modal */}
      <AnimatePresence>
        {showShippingGuide && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.button
              type="button"
              aria-label="Close shipping guide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShippingGuide(false)}
              className="absolute inset-0 bg-white/5 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ duration: 0.22 }}
              className="relative z-10 w-full max-w-2xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_40px_100px_-40px_rgba(15,23,42,0.45)] dark:border-white/10 dark:bg-[#10151d]"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-white/10">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.26em] text-primary-600 dark:text-primary-400">
                    Shipping Guidance
                  </p>
                  <h3 className="mt-1 text-xl font-black text-slate-900 dark:text-white">
                    Shipping Fee Slabs
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowShippingGuide(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:border-red-200 hover:text-red-500 dark:border-white/10 dark:text-slate-300 dark:hover:border-red-500/30 dark:hover:text-red-400"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 px-6 py-6">
                <p className="text-sm leading-6 text-slate-600 dark:text-slate-300 text-justify min-[320px]:max-[430px]:leading-[20px]">
                  Shipping fees are calculated based on the subtotal of the items. This fee is added before the discount is applied, and then apply the promo discount to the final total.
                </p>

                <div className="grid gap-3">
                  {[
                    ['0 - 500', 'Rs. 50'],
                    ['501 - 1000', 'Rs. 100'],
                    ['1001 - 2000', 'Rs. 150'],
                    ['2001 - 4000', 'Rs. 180'],
                    ['4001 - 4999', 'Rs. 200'],
                    ['5000 and above', 'Free'],
                  ].map(([range, fee]) => (
                    <div
                      key={range}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]"
                    >
                      <span className="text-sm font-bold text-slate-800 dark:text-white">{range}</span>
                      <span className="text-sm font-black text-primary-600 dark:text-primary-400">{fee}</span>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-900 dark:border-primary-500/20 dark:bg-primary-500/10 dark:text-white">
                  Promo discount is applied after shipping fee is added to the items subtotal.
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Cart;