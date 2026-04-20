import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  BarChart3,
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Mail,
  Edit,
  ShoppingCart,
  FileSpreadsheet,
  HelpCircle,
  ImagePlus,
  LogOut,
  Menu,
  Package,
  Plus,
  ReceiptIndianRupee,
  Search,
  Settings,
  ShoppingBag,
  Sparkles,
  Trash2,
  Wallet,
  Wrench,
  Users,
  XCircle,
  X,
  Star,
} from "lucide-react";
import api from "../api/axios";
import { useAuthStore, useProductStore, useThemeStore } from "../store/useStore";
import { useOrderStore } from "../store/useOrderStore";
import { getImageUrl, getPrimaryProductImage } from "../utils/media";
import { formatPrice } from "../utils/price";
import ConfirmModal from "../components/common/ConfirmModal";
import UploadStockSheetSection from "../components/admin/UploadStockSheetSection";
import SalesReportSection from "../components/admin/SalesReportSection";
import BusinessSummarySection from "../components/admin/BusinessSummarySection";
import StockInwardSection from "../components/admin/StockInwardSection";
import MessageSection from "../components/admin/MessageSection";
import { AnimatePresence, motion } from "framer-motion";
import { useReviewStore } from "../store/useReviewStore";
import OfflineSalesSection from "../components/admin/OfflineSalesSection";
import ExpenseManagementSection from "../components/admin/ExpenseManagementSection";
import BatRepairSection from "../components/admin/BatRepairSection";

const Motion = motion;

const CATEGORY_OPTIONS = [
  "Bat",
  "Footwear",
  "Hockey",
  "Outdoor",
  "Indoor",
  "Basketball",
  "Volleyball",
  "Ludo",
  "Snooker",
  "Carromboard",
  "Chess",
  "Racket",
  "Shuttlecock",
  "Bag",
  "Award",
  "Football",
  "Ball",
  "Bottomwear",
  "Gloves",
  "Accessories",
  "Sleeves",
  "Shaker",
  "Other",
];

const OTHER_SPECIFICATION_OPTION = "Other / Add New Specification";
const DEFAULT_SPECIFICATION_OPTIONS_BY_CATEGORY = {
  Bat: [
    "Weight",
    "Height",
    "Length",
    "Willow Type",
    "Grip Type",
    "Bat Size",
    "Blade Thickness",
    "Handle Type",
    OTHER_SPECIFICATION_OPTION,
  ],
  Ball: [
    "Weight",
    "Material",
    "Type",
    "Color",
    "Pack Size",
    "Bounce Type",
    OTHER_SPECIFICATION_OPTION,
  ],
  Gloves: [
    "Size",
    "Material",
    "Hand Type",
    "Padding Type",
    "Color",
    OTHER_SPECIFICATION_OPTION,
  ],
  Accessories: [
    "Size",
    "Color",
    "Material",
    "Quantity",
    OTHER_SPECIFICATION_OPTION,
  ],
  Sleeves: [
    "Size",
    "Color",
    "Fabric",
    "Stretch Type",
    OTHER_SPECIFICATION_OPTION,
  ],
  Shaker: [
    "Capacity",
    "Material",
    "Color",
    "Lid Type",
    OTHER_SPECIFICATION_OPTION,
  ],
  Other: [OTHER_SPECIFICATION_OPTION],
};
const cloneSpecificationOptionsMap = () =>
  Object.fromEntries(
    Object.entries(DEFAULT_SPECIFICATION_OPTIONS_BY_CATEGORY).map(
      ([category, options]) => [category, [...options]],
    ),
  );
let nextFormRowId = 0;
const createFormRowId = () => `row-${nextFormRowId++}`;
const getSpecificationOptionsForCategory = (
  category,
  specificationOptionsMap,
) => specificationOptionsMap[category] || [OTHER_SPECIFICATION_OPTION];
const getSpecificationFields = (
  name = "",
  value = "",
  category = "",
  specificationOptionsMap = DEFAULT_SPECIFICATION_OPTIONS_BY_CATEGORY,
) => {
  const normalizedName = String(name || "").trim();
  const options = getSpecificationOptionsForCategory(
    category,
    specificationOptionsMap,
  );
  if (!normalizedName)
    return { id: createFormRowId(), option: "", customName: "", value };
  return options.includes(normalizedName)
    ? { id: createFormRowId(), option: normalizedName, customName: "", value }
    : {
        id: createFormRowId(),
        option: OTHER_SPECIFICATION_OPTION,
        customName: normalizedName,
        value,
      };
};
const getResolvedSpecificationName = (spec) => {
  if (spec.option === OTHER_SPECIFICATION_OPTION) return spec.customName.trim();
  return spec.option.trim();
};
const createSpec = () => ({
  id: createFormRowId(),
  option: "",
  customName: "",
  value: "",
});
const FEATURE_OPTIONS = [
  "Durable Build",
  "Lightweight",
  "Premium Quality",
  "High Performance",
  "Comfortable Grip",
  "Long Lasting",
  "Professional Use",
  "Beginner Friendly",
  "Anti Slip",
  "Sweat Resistant",
];
const OTHER_FEATURE_OPTION = "Other / Add New Feature";
const getFeatureFields = (feature = "") => {
  const normalizedFeature = String(feature || "").trim();
  if (!normalizedFeature)
    return { id: createFormRowId(), option: "", customValue: "" };
  return FEATURE_OPTIONS.includes(normalizedFeature)
    ? { id: createFormRowId(), option: normalizedFeature, customValue: "" }
    : {
        id: createFormRowId(),
        option: OTHER_FEATURE_OPTION,
        customValue: normalizedFeature,
      };
};
const getResolvedFeatureValue = (feature) => {
  if (feature.option === OTHER_FEATURE_OPTION)
    return feature.customValue.trim();
  return feature.option.trim();
};
const createFeature = () => ({
  id: createFormRowId(),
  option: "",
  customValue: "",
});
const createVariantRow = () => ({
  id: createFormRowId(),
  name: "",
  sku: "",
  price: "",
  costPrice: "",
  countInStock: "",
  image: "",
  imageFile: null,
  attributes: [{ id: createFormRowId(), key: "", value: "" }],
});
const PRODUCT_NAME_OPTIONS = [
  "CA Bat",
  "HS Bat",
  "7T7T Bat",
  "Gloves Premium",
  "Gloves Regular",
  "Cock (10)",
  "Cock (20)",
  "Cock (50)",
  "Kookaburra Ball",
  "Daynite Box",
  "Wind Ball",
  "Leather Ball Heavy",
  "Leather Ball Medium",
  "Shaker",
  "Spin Ball",
  "Plastic Bat",
  "Fibre Bat",
];
const OTHER_PRODUCT_OPTION = "Other / Add New Product";
const getProductNameFields = (name = "") => {
  const normalizedName = String(name || "").trim();
  if (!normalizedName) return { productNameOption: "", customProductName: "" };
  return PRODUCT_NAME_OPTIONS.includes(normalizedName)
    ? { productNameOption: normalizedName, customProductName: "" }
    : {
        productNameOption: OTHER_PRODUCT_OPTION,
        customProductName: normalizedName,
      };
};
const getResolvedProductName = (form) => {
  if (form.productNameOption === OTHER_PRODUCT_OPTION)
    return form.customProductName.trim();
  return form.productNameOption.trim();
};
const emptyForm = {
  name: "",
  productNameOption: "",
  customProductName: "",
  productType: "single",
  price: "",
  brand: "",
  category: "",
  countInStock: "",
  description: "",
  codAvailable: true,
  isFeatured: false,
  variants: [createVariantRow()],
  features: [createFeature()],
  specifications: [createSpec()],
};
const DASHBOARD_WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { userInfo, logout } = useAuthStore();
  const { theme } = useThemeStore();
  const isDarkTheme = theme === "dark";
  const {
    products,
    product,
    fetchProducts,
    fetchProductById,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useProductStore();

  const {
    orders,
    loading: ordersLoading,
    error: ordersError,
    fetchMyOrders,
    fetchAllOrders,
    dispatchOrder,
    deliverOrder,
    payOrder,
    cancelOrder,
    saveCancelReason,
    createPromo,
    getAllPromos,
    togglePromo,
    getPromoStats,
    deletePromo,
    deleteExpiredPromos,
    promos,   
  } = useOrderStore();
  const [form, setForm] = useState(emptyForm);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [categoryOptions, setCategoryOptions] = useState(CATEGORY_OPTIONS);
  const [productNameOptions, setProductNameOptions] =
    useState(PRODUCT_NAME_OPTIONS);
  const [featureOptions, setFeatureOptions] = useState(FEATURE_OPTIONS);
  const [specificationOptionsMap, setSpecificationOptionsMap] = useState(
    cloneSpecificationOptionsMap,
  );
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [showCancelReasonModal, setShowCancelReasonModal] = useState(false);
  const [selectedCancelledOrder, setSelectedCancelledOrder] = useState(null);
  const [cancelReasonInput, setCancelReasonInput] = useState('');
  const [isCancelReasonReadOnly, setIsCancelReasonReadOnly] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null); // review modal
  const [images, setImages] = useState([]);
  const [code, setCode] = useState('');
  // const { createPromo } = useOrderStore();
  const [discount, setDiscount] = useState('');
  const [expiry, setExpiry] = useState('');
  const [promoFilter, setPromoFilter] = useState('all');
  const [promoStatsModal, setPromoStatsModal] = useState(null);
  const [maxUses, setMaxUses] = useState('');
  const [confirmClearExpired, setConfirmClearExpired] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(null);
  // const [promos, setPromos] = useState([]);
  const [saving, setSaving] = useState(false);
  const { fetchReviews, addReview } = useReviewStore();
  const [generatingDetails, setGeneratingDetails] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isProductNameMenuOpen, setIsProductNameMenuOpen] = useState(false);
  const [revenueTrendRange, setRevenueTrendRange] = useState("week");
  const productNameMenuRef = useRef(null);
  const isSeller = userInfo?.role === "seller";
  const isEdit = Boolean(id);
  const addProductTheme = isDarkTheme
    ? {
        shell: "relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#10151d]/95 p-6 shadow-[0_28px_80px_-42px_rgba(0,0,0,0.95)] backdrop-blur-xl md:p-8",
        glow: "absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top_left,rgba(220,38,38,0.16),transparent_46%)]",
        eyebrow: "text-white",
        title: "text-white",
        body: "text-slate-400",
        secondaryButton: "rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-slate-200 transition-all hover:border-white/20 hover:bg-white/[0.06]",
        primaryButton: "rounded-2xl bg-primary-600 px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-white shadow-[0_18px_40px_-20px_rgba(220,38,38,0.75)] transition-all hover:bg-primary-700 disabled:opacity-60",
        panel: "overflow-hidden rounded-[2rem] border border-white/10 bg-[#10151d]/95 p-6 shadow-[0_28px_80px_-42px_rgba(0,0,0,0.95)] backdrop-blur-xl md:p-8",
        panelTitle: "text-white",
        panelBody: "text-slate-400",
        label: "text-slate-500",
        labelStrong: "text-white",
        input: "h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-primary-500/40",
        select: "h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition-all focus:border-primary-500/40",
        control: "rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-slate-300 transition-all hover:border-white/20 hover:bg-white/[0.06]",
        checkbox: "flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 transition-all hover:border-white/20 hover:bg-white/[0.06]",
        checkboxTitle: "text-white",
        checkboxBody: "text-slate-400",
        menuButtonActive: "border-primary-500/40 bg-[#151b24] shadow-[0_18px_36px_-24px_rgba(220,38,38,0.45)]",
        menuButtonInactive: "border-white/10 bg-[#151b24] hover:border-white/20 hover:bg-white/[0.05]",
        menuPanel: "absolute left-0 right-0 top-[calc(100%+0.75rem)] z-30 overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#121821]/98 shadow-[0_28px_70px_-36px_rgba(0,0,0,0.98)] backdrop-blur-xl",
        menuInner: "max-h-72 overflow-y-auto p-2",
        menuOptionActive: "bg-primary-500/12 text-white ring-1 ring-inset ring-primary-500/30",
        menuOptionInactive: "text-slate-200 hover:bg-white/[0.06] hover:text-white",
        menuTextFilled: "truncate text-white",
        menuTextEmpty: "truncate text-slate-500",
        variantCard: "rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4",
        muted: "text-slate-400",
      }
    : {
        shell: "relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.25)] backdrop-blur-xl md:p-8",
        glow: "absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top_left,rgba(220,38,38,0.10),transparent_46%)]",
        eyebrow: "text-slate-700",
        title: "text-slate-900",
        body: "text-slate-600",
        secondaryButton: "rounded-2xl border border-slate-200 bg-slate-50 px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-100",
        primaryButton: "rounded-2xl bg-primary-600 px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-white shadow-[0_18px_40px_-20px_rgba(220,38,38,0.28)] transition-all hover:bg-primary-700 disabled:opacity-60",
        panel: "overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.25)] backdrop-blur-xl md:p-8",
        panelTitle: "text-slate-900",
        panelBody: "text-slate-600",
        label: "text-slate-500",
        labelStrong: "text-slate-900",
        input: "h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-primary-500/40",
        select: "h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition-all focus:border-primary-500/40",
        control: "rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-100",
        checkbox: "flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition-all hover:border-slate-300 hover:bg-slate-100",
        checkboxTitle: "text-slate-900",
        checkboxBody: "text-slate-600",
        menuButtonActive: "border-primary-500/40 bg-slate-50 shadow-[0_18px_36px_-24px_rgba(220,38,38,0.18)]",
        menuButtonInactive: "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
        menuPanel: "absolute left-0 right-0 top-[calc(100%+0.75rem)] z-30 overflow-hidden rounded-[1.35rem] border border-slate-200 bg-white shadow-[0_24px_60px_-30px_rgba(15,23,42,0.18)]",
        menuInner: "max-h-72 overflow-y-auto p-2",
        menuOptionActive: "bg-primary-500/10 text-slate-900 ring-1 ring-inset ring-primary-500/20",
        menuOptionInactive: "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
        menuTextFilled: "truncate text-slate-900",
        menuTextEmpty: "truncate text-slate-500",
        variantCard: "rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4",
        muted: "text-slate-500",
      };
  const addPromoTheme = isDarkTheme
    ? {
        shell: "overflow-hidden rounded-[2rem] border border-white/10 bg-[#10151d]/95 p-6 shadow-[0_26px_70px_-42px_rgba(0,0,0,0.95)] backdrop-blur-xl md:p-8",
        sectionTitle: "text-white",
        sectionBody: "text-slate-500",
        label: "text-white",
        input: "h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20",
        inputSelect: "h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition-all focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20",
        inputDate: "h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition-all focus:border-primary-500/50 [color-scheme:dark]",
        button: "rounded-2xl bg-primary-600 px-8 py-3 text-xs font-black uppercase tracking-[0.2em] text-white shadow-[0_14px_32px_-14px_rgba(220,38,38,0.7)] transition-all hover:bg-primary-500 active:scale-[0.98]",
        preview: "inline-flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/8 px-5 py-3",
        previewCode: "rounded-lg border border-emerald-500/30 bg-emerald-500/15 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-emerald-300",
        previewText: "text-sm text-slate-400",
        previewTextMuted: "text-slate-500",
        tableShell: "overflow-hidden rounded-[2rem] border border-white/10 bg-[#10151d]/95 shadow-[0_26px_70px_-42px_rgba(0,0,0,0.95)] backdrop-blur-xl",
        tableHead: "border-b border-white/10 px-6 py-6 md:px-8",
        tableTitle: "text-white",
        tableCount: "ml-3 rounded-full border border-white/10 bg-white/[0.06] px-3 py-0.5 text-sm font-bold text-slate-400",
        tableHeaderRow: "border-b border-white/5 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500",
        tableRow: "group text-sm text-slate-300 transition-colors hover:bg-white/[0.02]",
        codeBadge: "rounded-xl border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-black uppercase tracking-wider text-white",
        discount: "text-2xl font-black text-primary-300",
        statusExpired: "inline-flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-red-400",
        statusActive: "inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-300",
        statusInactive: "inline-flex items-center gap-1.5 rounded-full border border-slate-500/20 bg-slate-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400",
        expiryText: "text-xs text-slate-300",
        emptyTitle: "text-slate-500",
        emptyBody: "text-slate-600",
        actionButton: "rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-300 transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-white",
        toggleActive: "border-amber-500/20 bg-amber-500/10 text-amber-400 hover:bg-amber-500/18",
        toggleInactive: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/18",
        deleteButton: "rounded-xl border border-red-500/20 bg-red-500/8 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-red-400 transition-all hover:bg-red-500/15",
        emptyIcon: "mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]",
        modalShell: "w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-[#10151d]/98 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.98)] backdrop-blur-xl",
        modalHeader: "flex items-center justify-between border-b border-white/10 px-6 py-5",
        modalTitle: "text-white",
        modalClose: "flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-400 transition-all hover:border-white/20 hover:text-white",
        modalBody: "p-6 space-y-4",
        card: "relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4",
        cardLabel: "text-slate-500",
        cardSub: "mt-0.5 text-[10px] text-slate-600",
        usageShell: "rounded-2xl border border-white/10 bg-white/[0.04] p-4",
        usageTrack: "h-2 w-full rounded-full bg-white/[0.08] overflow-hidden",
        usageMeta: "mt-2 flex justify-between text-[10px] text-slate-600",
        expiryShell: (expired) =>
          `rounded-2xl border p-4 ${expired ? "border-red-500/20 bg-red-500/8" : "border-white/10 bg-white/[0.04]"}`,
        expiryLabel: "text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500",
        expiryValue: (expired) =>
          `mt-1.5 text-sm font-bold ${expired ? "text-red-400" : "text-white"}`,
      }
    : {
        shell: "overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.25)] backdrop-blur-xl md:p-8",
        sectionTitle: "text-slate-900",
        sectionBody: "text-slate-600",
        label: "text-slate-900",
        input: "h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20",
        inputSelect: "h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition-all focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20",
        inputDate: "h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition-all focus:border-primary-500/50",
        button: "rounded-2xl bg-primary-600 px-8 py-3 text-xs font-black uppercase tracking-[0.2em] text-white shadow-[0_14px_32px_-14px_rgba(220,38,38,0.28)] transition-all hover:bg-primary-500 active:scale-[0.98]",
        preview: "inline-flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-5 py-3",
        previewCode: "rounded-lg border border-emerald-300 bg-emerald-100 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-emerald-700",
        previewText: "text-sm text-slate-600",
        previewTextMuted: "text-slate-500",
        tableShell: "overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_50px_-30px_rgba(15,23,42,0.25)] backdrop-blur-xl",
        tableHead: "border-b border-slate-200 px-6 py-6 md:px-8 flex justify-between items-center",
        tableTitle: "text-slate-900",
        tableCount: "ml-3 rounded-full border border-slate-200 bg-slate-50 px-3 py-0.5 text-sm font-bold text-slate-500",
        tableHeaderRow: "border-b border-slate-200 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500",
        tableRow: "group text-sm text-slate-700 transition-colors hover:bg-slate-50",
        codeBadge: "rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-slate-900",
        discount: "text-2xl font-black text-primary-600",
        statusExpired: "inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-red-500",
        statusActive: "inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-600",
        statusInactive: "inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500",
        expiryText: "text-xs text-slate-600",
        emptyTitle: "text-slate-500",
        emptyBody: "text-slate-600",
        actionButton: "rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900",
        toggleActive: "border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100",
        toggleInactive: "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100",
        deleteButton: "rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-red-600 transition-all hover:bg-red-100",
        emptyIcon: "mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50",
        modalShell: "w-full max-w-md overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_80px_-34px_rgba(15,23,42,0.25)] backdrop-blur-xl",
        modalHeader: "flex items-center justify-between border-b border-slate-200 px-6 py-5",
        modalTitle: "text-slate-900",
        modalClose: "flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition-all hover:border-slate-300 hover:text-slate-900",
        modalBody: "p-6 space-y-4",
        card: "relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-4",
        cardLabel: "text-slate-500",
        cardSub: "mt-0.5 text-[10px] text-slate-500",
        usageShell: "rounded-2xl border border-slate-200 bg-slate-50 p-4",
        usageTrack: "h-2 w-full rounded-full bg-slate-200 overflow-hidden",
        usageMeta: "mt-2 flex justify-between text-[10px] text-slate-500",
        expiryShell: (expired) =>
          `rounded-2xl border p-4 ${expired ? "border-red-200 bg-red-50" : "border-slate-200 bg-slate-50"}`,
        expiryLabel: "text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500",
        expiryValue: (expired) =>
          `mt-1.5 text-sm font-bold ${expired ? "text-red-500" : "text-slate-900"}`,
      };
  const tab = !isSeller
    ? "orders"
    : location.pathname.includes("/business-summary")
      ? "business-summary"
    : location.pathname.includes("/add-promo-code")
      ? "add-promo-code"
      : location.pathname.includes("/upload-stock-sheet")
        ? "upload-stock-sheet"
        : location.pathname.includes("/stock-inward")
          ? "stock-inward"
          : location.pathname.includes("/offline-sales")
          ? "offline-sales"
          : location.pathname.includes("/bat-repair")
          ? "bat-repair"
          : location.pathname.includes("/expenses")
          ? "expenses"
          : location.pathname.includes("/messages")
          ? "messages"
          : location.pathname.includes("/sales-report")
            ? "sales-report"
            : location.pathname.includes("/orders")
              ? "orders"
              : location.pathname.includes("/edit-product/")
                ? "edit"
                : location.pathname.includes("/add-product")
                  ? "form"
                  : location.pathname.includes("/manage-products")
                    ? "inventory"
                    : "overview";


const openReviewModal = (productId) => {
  setSelectedProductId(productId);
  setRating(0);
  setComment('');
  setShowReviewModal(true);
};

// ── Fetch promos when tab opens ──
useEffect(() => {
  if (isSeller && tab === 'add-promo-code') {
    getAllPromos().catch(() => {});
  }
}, [isSeller, tab, getAllPromos]);

// ── Get Stats ──
const fetchPromoStats = async (id) => {
  try {
    const data = await getPromoStats(id);  // store function
    setPromoStatsModal(data);
  } catch (e) {
    toast.error(e.message || 'Failed to fetch stats');
  }
};

// ── Delete Expired ──
const handleDeleteExpired = async () => {
  try {
    const data = await deleteExpiredPromos();  // store function
    toast.success(data.message);
    setConfirmClearExpired(false);
  } catch (e) {
    toast.error(e.message || 'Failed to delete expired promos');
  }
};

// ── Create Promo ──
const handleCreatePromo = async (e) => {
  e.preventDefault();
  try {
    await createPromo({           // store function (already existing)
      code,
      discountPercentage: Number(discount),
      expiryDate: expiry || undefined,
      maxUses: maxUses ? Number(maxUses) : undefined,
    });
    setCode('');
    setDiscount('');
    setExpiry('');
    setMaxUses('');
    toast.success('Promo created!');
  } catch (e) {
    toast.error(e.message || 'Failed');
  }
};

// ── Filtered promos (pure computed — no async) ──
const filteredPromos = (promos || []).filter(p => {
  const isExpired = p.expiryDate && new Date(p.expiryDate) < new Date();
  if (promoFilter === 'active')   return p.isActive && !isExpired;
  if (promoFilter === 'inactive') return !p.isActive && !isExpired;
  if (promoFilter === 'expired')  return isExpired;
  return true;
});

  const openProductsModal = (order) => {
    setSelectedOrder(order);
    setShowProductsModal(true);
};

  const handleRatingClick = (e, index) => {
  const { left, width } = e.currentTarget.getBoundingClientRect();
  const clickX = e.clientX - left;

  const isHalf = clickX < width / 2;

  const value = isHalf ? index + 0.5 : index + 1;

  setRating(Number(value.toFixed(1)));
};

const submitModalReview = async () => {
  if (!rating || !comment) {
    return toast.error('Please add rating and comment');
  }

  await addReview(selectedProductId, { rating, comment });

  fetchProductById(selectedProductId);
  fetchReviews(selectedProductId);

  setShowReviewModal(false);
  setRating(0);
  setComment('');

  // toast.success('Review added');
};

const onCancelOrder = async (oid) => {
  openConfirmDialog({
    title: 'Cancel Order',
    description: 'Are you sure you want to cancel this order?',
    confirmLabel: 'Yes, Cancel Order',
    tone: 'warning',
    onConfirm: async () => {
      try {
        await cancelOrder(oid);
        toast.success('Order cancelled');
      } catch (e) {
        toast.error(e.message || 'Cancel failed');
      }
    },
  });
};

const onOpenCancelReasonModal = (order, readOnly = false) => {
  setSelectedCancelledOrder(order);
  setCancelReasonInput(order.cancelReason || '');
  setIsCancelReasonReadOnly(readOnly);
  setShowCancelReasonModal(true);
};

const onSaveCancelReason = async () => {
  const reason = cancelReasonInput.trim();

  if (!selectedCancelledOrder?._id) {
    return;
  }

  if (!reason) {
    toast.error('Please write a cancellation reason');
    return;
  }

  try {
    await saveCancelReason(selectedCancelledOrder._id, reason);
    toast.success('Cancellation reason saved');
    setShowCancelReasonModal(false);
    setSelectedCancelledOrder(null);
    setCancelReasonInput('');
    setIsCancelReasonReadOnly(false);
  } catch (e) {
    toast.error(e.message || 'Failed to save cancellation reason');
  }
};

  useEffect(() => {
    if (isSeller) {
      if (tab === "overview") {
        Promise.all([fetchProducts(), fetchAllOrders()]).catch(() => {});
      } else if (tab === "orders") {
        fetchAllOrders().catch(() => {});
      } else {
        fetchProducts().catch(() => {});
      }
    } else {
      fetchMyOrders().catch(() => {});
    }
  }, [isSeller, tab, fetchAllOrders, fetchMyOrders, fetchProducts]);
  useEffect(() => {
    if (isSeller && isEdit && id) {
      fetchProductById(id).catch((e) => {
        toast.error(e.message || "Failed to load product");
        navigate("/admin/manage-products", { replace: true });
      });
    } else {
      setForm(emptyForm);
    }
  }, [isSeller, isEdit, id, fetchProductById, navigate]);
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        productNameMenuRef.current &&
        !productNameMenuRef.current.contains(event.target)
      ) {
        setIsProductNameMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  useEffect(() => {
    setIsProductNameMenuOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    if (isEdit && product?._id === id) {
      const { productNameOption, customProductName } = getProductNameFields(
        product.name,
      );
      const nextCategory = product.category || "";
      const nextCategoryOptions =
        nextCategory && categoryOptions.includes(nextCategory)
          ? categoryOptions
          : [...categoryOptions, ...(nextCategory ? [nextCategory] : [])];
      const nextSpecificationOptionsMap = cloneSpecificationOptionsMap();

      nextCategoryOptions.forEach((category) => {
        if (!nextSpecificationOptionsMap[category]) {
          nextSpecificationOptionsMap[category] = [OTHER_SPECIFICATION_OPTION];
        }
      });

      (product.specifications || []).forEach((spec) => {
        const specName = String(spec?.name || "").trim();
        if (!specName || !nextCategory) return;
        if (!nextSpecificationOptionsMap[nextCategory]) {
          nextSpecificationOptionsMap[nextCategory] = [
            OTHER_SPECIFICATION_OPTION,
          ];
        }
        if (!nextSpecificationOptionsMap[nextCategory].includes(specName)) {
          nextSpecificationOptionsMap[nextCategory] = [
            ...nextSpecificationOptionsMap[nextCategory].filter(
              (option) => option !== OTHER_SPECIFICATION_OPTION,
            ),
            specName,
            OTHER_SPECIFICATION_OPTION,
          ];
        }
      });

      setCategoryOptions(nextCategoryOptions);
      setSpecificationOptionsMap(nextSpecificationOptionsMap);
      setForm({
        name: product.name || "",
        productNameOption,
        customProductName,
        productType: product.productType || "single",
        price: product.price ?? "",
        brand: product.brand || "",
        category: nextCategory,
        countInStock: product.countInStock ?? "",
        description: product.description || "",
        codAvailable: product.codAvailable !== false,
        isFeatured: Boolean(product.isFeatured),
        variants:
          Array.isArray(product.variants) && product.variants.length
            ? product.variants.map((variant) => ({
                id: createFormRowId(),
                name: variant?.name || "",
                sku: variant?.sku || "",
                price: variant?.price ?? "",
                costPrice: variant?.costPrice ?? "",
                countInStock: variant?.countInStock ?? "",
                image: variant?.image || "",
                imageFile: null,
                attributes:
                  Array.isArray(variant?.attributes) && variant.attributes.length
                    ? variant.attributes.map((attribute) => ({
                        id: createFormRowId(),
                        key: attribute?.key || "",
                        value: attribute?.value || "",
                      }))
                    : [{ id: createFormRowId(), key: "", value: "" }],
              }))
            : [createVariantRow()],
        features: product.features?.length
          ? product.features.map(getFeatureFields)
          : [createFeature()],
        specifications: product.specifications?.length
          ? product.specifications.map((spec) =>
              getSpecificationFields(
                spec.name,
                spec.value,
                nextCategory,
                nextSpecificationOptionsMap,
              ),
            )
          : [createSpec()],
      });
    }
  }, [isEdit, product, id, categoryOptions]);

  const filtered = useMemo(
    () =>
      products.filter((p) =>
        [p.name, p.brand, p.category]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [products, search],
  );
  const selectedProductOption = form.productNameOption;
  const canManageSelectedProduct =
    selectedProductOption && selectedProductOption !== OTHER_PRODUCT_OPTION;
  const currentSpecificationOptions = getSpecificationOptionsForCategory(
    form.category,
    specificationOptionsMap,
  );
  if (!userInfo) return null;

  const totalSales = orders.reduce(
    (sum, order) => sum + Number(order.totalPrice || 0),
    0,
  );
  const pendingAmount = orders.reduce(
    (sum, order) => (!order.isPaid ? sum + Number(order.totalPrice || 0) : sum),
    0,
  );
  const paidSales = orders.reduce(
    (sum, order) => (order.isPaid ? sum + Number(order.totalPrice || 0) : sum),
    0,
  );
  const netProfitEstimate = paidSales * 0.22;
  const todayLabel = new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date());
  const pageTitleMap = {
    overview: "Dashboard",
    inventory: "Inventory",
    form: "Inventory",
    edit: "Inventory",
    "upload-stock-sheet": "Upload Stock Sheet",
    "stock-inward": "Stock Inward",
    "business-summary": "Summary",
    "sales-report": "Sales Report",
    orders: "Orders",
  };
  const pageTitle = pageTitleMap[tab] || "Dashboard";
  const overviewCards = [
    {
      label: "Total Sales",
      value: formatPrice(totalSales),
      note: `${orders.length} recorded orders`,
      accent: "text-emerald-300",
      tone: "bg-emerald-500/15",
      icon: ReceiptIndianRupee,
    },
    {
      label: "Net Profit",
      value: formatPrice(netProfitEstimate),
      note: "Estimated from paid order flow",
      accent: "text-sky-300",
      tone: "bg-sky-500/15",
      icon: Wallet,
    },
    {
      label: "Pending Amount",
      value: formatPrice(pendingAmount),
      note: `${orders.filter((order) => !order.isPaid).length} payments awaiting`,
      accent: "text-amber-300",
      tone: "bg-amber-500/15",
      icon: Clock,
    },
    {
      label: "Total Orders",
      value: String(orders.length),
      note: `${orders.filter((order) => order.isDelivered).length} delivered so far`,
      accent: "text-rose-300",
      tone: "bg-rose-500/15",
      icon: ShoppingBag,
    },
  ];
  const weeklySalesData = DASHBOARD_WEEK_DAYS.map((day, dayIndex) => {
    const amount = orders.reduce((sum, order) => {
      if (!order.createdAt) return sum;
      const orderDay = new Date(order.createdAt).getDay();
      const normalizedDay = orderDay === 0 ? 6 : orderDay - 1;
      return normalizedDay === dayIndex
        ? sum + Number(order.totalPrice || 0)
        : sum;
    }, 0);
    return { day, amount };
  });
  const peakWeeklySales = Math.max(
    ...weeklySalesData.map((item) => item.amount),
    1,
  );
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIndex = now.getMonth();
  const daysInCurrentMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  const monthlySalesData = Array.from({ length: daysInCurrentMonth }, (_, dayOffset) => {
    const dayNumber = dayOffset + 1;
    const amount = orders.reduce((sum, order) => {
      if (!order.createdAt) return sum;
      const orderDate = new Date(order.createdAt);
      if (Number.isNaN(orderDate.getTime())) return sum;

      return orderDate.getFullYear() === currentYear &&
        orderDate.getMonth() === currentMonthIndex &&
        orderDate.getDate() === dayNumber
        ? sum + Number(order.totalPrice || 0)
        : sum;
    }, 0);

    return { day: String(dayNumber), amount };
  });
  const peakMonthlySales = Math.max(
    ...monthlySalesData.map((item) => item.amount),
    1,
  );
  const activeSalesData =
    revenueTrendRange === "month" ? monthlySalesData : weeklySalesData;
  const activePeakSales =
    revenueTrendRange === "month" ? peakMonthlySales : peakWeeklySales;
  const currentMonthLabel = new Intl.DateTimeFormat("en-IN", { month: "long" }).format(now);
  const revenueTrendTitle =
    revenueTrendRange === "month"
      ? `${currentMonthLabel} Day-wise Sales Performance`
      : "Weekly Sales Performance";
  const topInventoryItems = [...products]
    .sort(
      (a, b) =>
        Number(b.price || 0) * Math.max(Number(b.countInStock || 0), 1) -
        Number(a.price || 0) * Math.max(Number(a.countInStock || 0), 1),
    )
    .slice(0, 4);
  const recentTransactions = [...orders]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);
  const ordersScrollThreshold = 15;
  const ordersTableScrollStyle =
    orders.length > ordersScrollThreshold
      ? { maxHeight: "720px", overflowY: "auto" }
      : undefined;
  const customerOrdersScrollStyle =
    !isSeller && orders.length > ordersScrollThreshold
      ? { maxHeight: "720px", overflowY: "auto" }
      : undefined;
  const inventoryScrollStyle =
    isSeller && filtered.length > ordersScrollThreshold
      ? { maxHeight: "720px", overflowY: "auto" }
      : undefined;

  const openConfirmDialog = ({
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    tone = 'danger',
    onConfirm,
  }) => {
    setConfirmDialog({
      title,
      description,
      confirmLabel,
      cancelLabel,
      tone,
      onConfirm,
    });
  };

  const closeConfirmDialog = () => setConfirmDialog(null);

  const handleConfirmDialogConfirm = async () => {
    if (!confirmDialog?.onConfirm) {
      closeConfirmDialog();
      return;
    }

    await confirmDialog.onConfirm();
    closeConfirmDialog();
  };

  const onLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };
  const onDelete = async (pid) => {
    openConfirmDialog({
      title: 'Delete Product',
      description: 'Delete this product permanently? This action cannot be undone.',
      confirmLabel: 'Yes, Delete Product',
      tone: 'danger',
      onConfirm: async () => {
        try {
          await deleteProduct(pid);
          toast.success('Product deleted');
        } catch (e) {
          toast.error(e.message || 'Delete failed');
        }
      },
    });
  };
  const onDeliver = async (oid) => {
    try {
      await deliverOrder(oid);
      toast.success("Order delivered");
    } catch (e) {
      toast.error(e.message || "Update failed");
    }
  };
  const onDispatch = async (oid) => {
    try {
      await dispatchOrder(oid);
      toast.success("Order dispatched and customer notified");
    } catch (e) {
      toast.error(e.message || "Update failed");
    }
  };
  const onFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 4) {
      toast.error("Max 4 images");
      return;
    }
    setImages((prev) => [...prev, ...files]);
    e.target.value = null;
  };
  const onGenerateDetails = async () => {
    const resolvedName = getResolvedProductName(form);
    if (!resolvedName) {
      toast.error("Select or enter a product name first");
      return;
    }
    if (!form.category) {
      toast.error("Select a category first");
      return;
    }
    setGeneratingDetails(true);
    try {
      const { data } = await api.post("/products/generate-details", {
        name: resolvedName,
        category: form.category,
      });
      setForm((prev) => ({
        ...prev,
        description: data.description || prev.description,
        features:
          Array.isArray(data.features) && data.features.length
            ? data.features.map(getFeatureFields)
            : prev.features,
        specifications:
          Array.isArray(data.specifications) && data.specifications.length
            ? data.specifications.map((spec) =>
                getSpecificationFields(
                  spec.name,
                  spec.value,
                  form.category,
                  specificationOptionsMap,
                ),
              )
            : prev.specifications,
      }));
      toast.success("Product details generated");
    } catch (e) {
      toast.error(
        e.response?.data?.message ||
          e.message ||
          "Failed to generate product details",
      );
    } finally {
      setGeneratingDetails(false);
    }
  };
  const updateFeature = (index, key, value) =>
    setForm((prev) => ({
      ...prev,
      features: prev.features.map((feature, i) =>
        i === index ? { ...feature, [key]: value } : feature,
      ),
    }));
  const addFeature = () =>
    setForm((prev) => ({
      ...prev,
      features: [...prev.features, createFeature()],
    }));
  const removeFeature = (index) =>
    setForm((prev) => ({
      ...prev,
      features:
        prev.features.length === 1
          ? [createFeature()]
          : prev.features.filter((_, i) => i !== index),
    }));
  const updateSpec = (index, key, value) =>
    setForm((prev) => ({
      ...prev,
      specifications: prev.specifications.map((spec, i) =>
        i === index ? { ...spec, [key]: value } : spec,
      ),
    }));
  const addSpec = () =>
    setForm((prev) => ({
      ...prev,
      specifications: [...prev.specifications, createSpec()],
    }));
  const removeSpec = (index) =>
    setForm((prev) => ({
      ...prev,
      specifications:
        prev.specifications.length === 1
          ? [createSpec()]
          : prev.specifications.filter((_, i) => i !== index),
    }));
  const onCategoryChange = (value) =>
    setForm((prev) => ({
      ...prev,
      category: value,
      specifications: prev.specifications.map((spec) =>
        getSpecificationFields(
          getResolvedSpecificationName(spec),
          spec.value,
          value,
          specificationOptionsMap,
        ),
      ),
    }));
  const onProductNameOptionChange = (value) => {
    setForm((prev) => ({
      ...prev,
      productNameOption: value,
      customProductName:
        value === OTHER_PRODUCT_OPTION ? prev.customProductName : "",
    }));
    setIsProductNameMenuOpen(false);
  };
  const onCustomProductNameChange = (value) =>
    setForm((prev) => ({ ...prev, customProductName: value }));
  const onAddProductName = () => {
    const nextName = window.prompt("Enter new product name");
    const normalizedName = nextName?.trim();
    if (!normalizedName) return;
    if (
      productNameOptions.some(
        (option) => option.toLowerCase() === normalizedName.toLowerCase(),
      )
    ) {
      toast.error("Product name already exists");
      return;
    }
    setProductNameOptions((prev) => [...prev, normalizedName]);
    setForm((prev) => ({
      ...prev,
      productNameOption: normalizedName,
      customProductName: "",
    }));
  };
  const onEditProductName = () => {
    if (!canManageSelectedProduct) {
      toast.error("Select a product name to edit");
      return;
    }
    const nextName = window.prompt(
      "Rename product name",
      selectedProductOption,
    );
    const normalizedName = nextName?.trim();
    if (!normalizedName || normalizedName === selectedProductOption) return;
    if (
      productNameOptions.some(
        (option) =>
          option !== selectedProductOption &&
          option.toLowerCase() === normalizedName.toLowerCase(),
      )
    ) {
      toast.error("Product name already exists");
      return;
    }
    setProductNameOptions((prev) =>
      prev.map((option) =>
        option === selectedProductOption ? normalizedName : option,
      ),
    );
    setForm((prev) => ({
      ...prev,
      productNameOption: normalizedName,
      customProductName: "",
    }));
  };
  const onDeleteProductNameOption = () => {
    if (!canManageSelectedProduct) {
      toast.error("Select a product name to delete");
      return;
    }
    openConfirmDialog({
      title: 'Delete Product Name',
      description: `Delete "${selectedProductOption}" from the product list?`,
      confirmLabel: 'Yes, Delete',
      tone: 'danger',
      onConfirm: async () => {
        setProductNameOptions((prev) =>
          prev.filter((option) => option !== selectedProductOption),
        );
        setForm((prev) => ({
          ...prev,
          productNameOption: "",
          customProductName: "",
        }));
      },
    });
  };
  const onAddCategoryOption = () => {
    const nextCategory = window.prompt("Enter new category");
    const normalizedCategory = nextCategory?.trim();
    if (!normalizedCategory) return;
    if (
      categoryOptions.some(
        (option) => option.toLowerCase() === normalizedCategory.toLowerCase(),
      )
    ) {
      toast.error("Category already exists");
      return;
    }
    setCategoryOptions((prev) => [...prev, normalizedCategory]);
    setSpecificationOptionsMap((prev) => ({
      ...prev,
      [normalizedCategory]: [OTHER_SPECIFICATION_OPTION],
    }));
    setForm((prev) => ({
      ...prev,
      category: normalizedCategory,
      specifications: prev.specifications.map((spec) =>
        getSpecificationFields(
          getResolvedSpecificationName(spec),
          spec.value,
          normalizedCategory,
          {
            ...specificationOptionsMap,
            [normalizedCategory]: [OTHER_SPECIFICATION_OPTION],
          },
        ),
      ),
    }));
  };
  const onEditCategoryOption = () => {
    if (!form.category) {
      toast.error("Select a category to edit");
      return;
    }
    const nextCategory = window.prompt("Rename category", form.category);
    const normalizedCategory = nextCategory?.trim();
    if (!normalizedCategory || normalizedCategory === form.category) return;
    if (
      categoryOptions.some(
        (option) =>
          option !== form.category &&
          option.toLowerCase() === normalizedCategory.toLowerCase(),
      )
    ) {
      toast.error("Category already exists");
      return;
    }
    setCategoryOptions((prev) =>
      prev.map((option) =>
        option === form.category ? normalizedCategory : option,
      ),
    );
    setSpecificationOptionsMap((prev) => {
      const next = { ...prev };
      next[normalizedCategory] = next[form.category]
        ? [...next[form.category]]
        : [OTHER_SPECIFICATION_OPTION];
      delete next[form.category];
      return next;
    });
    setForm((prev) => ({ ...prev, category: normalizedCategory }));
  };
  const onDeleteCategoryOption = () => {
    if (!form.category) {
      toast.error("Select a category to delete");
      return;
    }
    openConfirmDialog({
      title: 'Delete Category',
      description: `Delete "${form.category}" from the category list?`,
      confirmLabel: 'Yes, Delete',
      tone: 'danger',
      onConfirm: async () => {
        setCategoryOptions((prev) =>
          prev.filter((option) => option !== form.category),
        );
        setSpecificationOptionsMap((prev) => {
          const next = { ...prev };
          delete next[form.category];
          return next;
        });
        setForm((prev) => ({
          ...prev,
          category: "",
          specifications: [createSpec()],
        }));
      },
    });
  };
  const onFeatureOptionChange = (index, value) =>
    setForm((prev) => ({
      ...prev,
      features: prev.features.map((feature, i) =>
        i === index
          ? {
              ...feature,
              option: value,
              customValue:
                value === OTHER_FEATURE_OPTION ? feature.customValue : "",
            }
          : feature,
      ),
    }));
  const onCustomFeatureChange = (index, value) =>
    updateFeature(index, "customValue", value);
  const onAddFeatureOption = (index) => {
    const nextFeature = window.prompt("Enter new feature");
    const normalizedFeature = nextFeature?.trim();
    if (!normalizedFeature) return;
    if (
      featureOptions.some(
        (option) => option.toLowerCase() === normalizedFeature.toLowerCase(),
      )
    ) {
      toast.error("Feature already exists");
      return;
    }
    setFeatureOptions((prev) => [...prev, normalizedFeature]);
    setForm((prev) => ({
      ...prev,
      features: prev.features.map((feature, i) =>
        i === index
          ? { ...feature, option: normalizedFeature, customValue: "" }
          : feature,
      ),
    }));
  };
  const onEditFeatureOption = (index) => {
    const selectedOption = form.features[index]?.option;
    if (!selectedOption || selectedOption === OTHER_FEATURE_OPTION) {
      toast.error("Select a feature to edit");
      return;
    }
    const nextFeature = window.prompt("Rename feature", selectedOption);
    const normalizedFeature = nextFeature?.trim();
    if (!normalizedFeature || normalizedFeature === selectedOption) return;
    if (
      featureOptions.some(
        (option) =>
          option !== selectedOption &&
          option.toLowerCase() === normalizedFeature.toLowerCase(),
      )
    ) {
      toast.error("Feature already exists");
      return;
    }
    setFeatureOptions((prev) =>
      prev.map((option) =>
        option === selectedOption ? normalizedFeature : option,
      ),
    );
    setForm((prev) => ({
      ...prev,
      features: prev.features.map((feature) =>
        feature.option === selectedOption
          ? { ...feature, option: normalizedFeature }
          : feature,
      ),
    }));
  };
  const onDeleteFeatureOption = (index) => {
    const selectedOption = form.features[index]?.option;
    if (!selectedOption || selectedOption === OTHER_FEATURE_OPTION) {
      toast.error("Select a feature to delete");
      return;
    }
    openConfirmDialog({
      title: 'Delete Feature',
      description: `Delete "${selectedOption}" from the feature list?`,
      confirmLabel: 'Yes, Delete',
      tone: 'danger',
      onConfirm: async () => {
        setFeatureOptions((prev) =>
          prev.filter((option) => option !== selectedOption),
        );
        setForm((prev) => ({
          ...prev,
          features: prev.features.map((feature, i) =>
            feature.option === selectedOption
              ? {
                  ...feature,
                  option: i === index ? "" : feature.option,
                  customValue: "",
                }
              : feature,
          ),
        }));
      },
    });
  };
  const onSpecificationOptionChange = (index, value) =>
    setForm((prev) => ({
      ...prev,
      specifications: prev.specifications.map((spec, i) =>
        i === index
          ? {
              ...spec,
              option: value,
              customName:
                value === OTHER_SPECIFICATION_OPTION ? spec.customName : "",
            }
          : spec,
      ),
    }));
  const onCustomSpecificationNameChange = (index, value) =>
    updateSpec(index, "customName", value);
  const onAddSpecificationOption = (index) => {
    if (!form.category) {
      toast.error("Select a category first");
      return;
    }
    const nextSpecification = window.prompt("Enter new specification name");
    const normalizedSpecification = nextSpecification?.trim();
    if (!normalizedSpecification) return;
    if (
      currentSpecificationOptions.some(
        (option) =>
          option.toLowerCase() === normalizedSpecification.toLowerCase(),
      )
    ) {
      toast.error("Specification already exists");
      return;
    }
    const nextOptions = [
      ...currentSpecificationOptions.filter(
        (option) => option !== OTHER_SPECIFICATION_OPTION,
      ),
      normalizedSpecification,
      OTHER_SPECIFICATION_OPTION,
    ];
    setSpecificationOptionsMap((prev) => ({
      ...prev,
      [form.category]: nextOptions,
    }));
    setForm((prev) => ({
      ...prev,
      specifications: prev.specifications.map((spec, i) =>
        i === index
          ? { ...spec, option: normalizedSpecification, customName: "" }
          : spec,
      ),
    }));
  };
  const onEditSpecificationOption = (index) => {
    if (!form.category) {
      toast.error("Select a category first");
      return;
    }
    const selectedOption = form.specifications[index]?.option;
    if (!selectedOption || selectedOption === OTHER_SPECIFICATION_OPTION) {
      toast.error("Select a specification to edit");
      return;
    }
    const nextSpecification = window.prompt(
      "Rename specification",
      selectedOption,
    );
    const normalizedSpecification = nextSpecification?.trim();
    if (!normalizedSpecification || normalizedSpecification === selectedOption)
      return;
    if (
      currentSpecificationOptions.some(
        (option) =>
          option !== selectedOption &&
          option.toLowerCase() === normalizedSpecification.toLowerCase(),
      )
    ) {
      toast.error("Specification already exists");
      return;
    }
    setSpecificationOptionsMap((prev) => ({
      ...prev,
      [form.category]: prev[form.category].map((option) =>
        option === selectedOption ? normalizedSpecification : option,
      ),
    }));
    setForm((prev) => ({
      ...prev,
      specifications: prev.specifications.map((spec) =>
        spec.option === selectedOption
          ? { ...spec, option: normalizedSpecification }
          : spec,
      ),
    }));
  };
  const onDeleteSpecificationOption = (index) => {
    if (!form.category) {
      toast.error("Select a category first");
      return;
    }
    const selectedOption = form.specifications[index]?.option;
    if (!selectedOption || selectedOption === OTHER_SPECIFICATION_OPTION) {
      toast.error("Select a specification to delete");
      return;
    }
    openConfirmDialog({
      title: 'Delete Specification',
      description: `Delete "${selectedOption}" from the specification list?`,
      confirmLabel: 'Yes, Delete',
      tone: 'danger',
      onConfirm: async () => {
        setSpecificationOptionsMap((prev) => ({
          ...prev,
          [form.category]: prev[form.category].filter(
            (option) => option !== selectedOption,
          ),
        }));
        setForm((prev) => ({
          ...prev,
          specifications: prev.specifications.map((spec) =>
            spec.option === selectedOption
              ? { ...spec, option: "", customName: "" }
              : spec,
          ),
        }));
      },
    });
  };

  const onMarkPaid = async (id) => {
    try {
      await payOrder(id);
      toast.success("Order marked as paid");
    } catch (e) {
      toast.error(e.message);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isEdit && !images.length) {
      toast.error("Upload at least one image");
      return;
    }
    const resolvedProductName = getResolvedProductName(form);
    if (!resolvedProductName) {
      toast.error(
        form.productNameOption === OTHER_PRODUCT_OPTION
          ? "Enter new product name"
          : "Select Product Name",
      );
      return;
    }
    if (!form.category) {
      toast.error("Select Category");
      return;
    }
    if (
      form.features.some(
        (feature) =>
          feature.option === OTHER_FEATURE_OPTION &&
          !feature.customValue.trim(),
      )
    ) {
      toast.error("Enter new feature name");
      return;
    }
    if (
      form.specifications.some(
        (spec) =>
          spec.option === OTHER_SPECIFICATION_OPTION && !spec.customName.trim(),
      )
    ) {
      toast.error("Enter new specification name");
      return;
    }
    if (form.productType === "variable") {
      const validVariants = form.variants
        .map((variant) => ({
          ...variant,
          name: String(variant.name || "").trim(),
          price: Number(variant.price),
          costPrice: Number(variant.costPrice),
          countInStock: Number(variant.countInStock),
          attributes: (variant.attributes || [])
            .map((attribute) => ({
              key: String(attribute.key || "").trim(),
              value: String(attribute.value || "").trim(),
            }))
            .filter((attribute) => attribute.key && attribute.value),
        }))
        .filter((variant) => variant.name);

      if (!validVariants.length) {
        toast.error("Add at least one valid variant");
        return;
      }

      if (
        validVariants.some(
          (variant) =>
            !Number.isFinite(variant.price) ||
            !Number.isFinite(variant.countInStock) ||
            variant.price < 0 ||
            variant.countInStock < 0,
        )
      ) {
        toast.error("Variant price and stock must be valid values");
        return;
      }
    }
    const resolvedSpecifications = form.specifications
      .map((spec) => ({
        name: getResolvedSpecificationName(spec),
        value: String(spec.value || "").trim(),
      }))
      .filter((spec) => spec.name && spec.value);
    const variantImageFiles = [];
    const resolvedVariants =
      form.productType === "variable"
        ? form.variants
            .map((variant) => {
              const nextVariant = {
                name: String(variant.name || "").trim(),
                sku: String(variant.sku || "").trim(),
                price: Number(variant.price || 0),
                costPrice: Number(variant.costPrice || 0),
                countInStock: Number(variant.countInStock || 0),
                image: String(variant.image || "").trim(),
                attributes: (variant.attributes || [])
                  .map((attribute) => ({
                    key: String(attribute.key || "").trim(),
                    value: String(attribute.value || "").trim(),
                  }))
                  .filter((attribute) => attribute.key && attribute.value),
              };

              if (variant.imageFile instanceof File) {
                nextVariant.imageFileIndex = variantImageFiles.length;
                variantImageFiles.push(variant.imageFile);
                nextVariant.image = "";
              }

              return nextVariant;
            })
            .filter((variant) => variant.name)
        : [];
    const fd = new FormData();
    fd.append("name", resolvedProductName);
    fd.append("price", form.price);
    fd.append("brand", form.brand);
    fd.append("category", form.category);
    fd.append("countInStock", form.countInStock);
    fd.append("productType", form.productType);
    fd.append("variants", JSON.stringify(resolvedVariants));
    fd.append("description", form.description);
    fd.append("codAvailable", form.codAvailable);
    fd.append("isFeatured", form.isFeatured);
    fd.append(
      "features",
      JSON.stringify(
        form.features.map(getResolvedFeatureValue).filter(Boolean),
      ),
    );
    fd.append("specifications", JSON.stringify(resolvedSpecifications));
    images.forEach((file) => fd.append("images", file));
    variantImageFiles.forEach((file) => fd.append("variantImages", file));
    setSaving(true);
    try {
      if (isEdit) {
        await updateProduct(id, fd);
        toast.success("Product updated");
      } else {
        await createProduct(fd);
        toast.success("Product created");
      }
      setImages([]);
      setForm(emptyForm);
      setCategoryOptions(CATEGORY_OPTIONS);
      setSpecificationOptionsMap(cloneSpecificationOptionsMap());
      navigate("/admin/manage-products");
    } catch (err) {
      toast.error(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const sidebar = isSeller
    ? [
        ["messages", "/admin/messages", Mail, "Messages"],
        ["add-product", "/admin/add-product", Package, "Add Product"],
        ["inventory", "/admin/manage-products", Package, "Inventory"],
        ["add-promo-code", "/admin/add-promo-code", Package, "Add Promo"],
        ["stock-inward", "/admin/stock-inward", Package, "Stock Inward"],
        ["bat-repair", "/admin/bat-repair", Wrench, "Bat Repair"],
        ["offline-sales", "/admin/offline-sales", ShoppingCart, "Offline Sales"],
        ["expenses", "/admin/expenses", Wallet, "Expenses"],
        ["business-summary", "/admin/business-summary", BarChart3, "Summary"],
        ["performances", "/admin/performances", BarChart3, "Performances"],
        ["orders", "/admin/orders", Users, "Orders"],
        ["sales-report", "/admin/sales-report", BarChart3, "Sales Report"],
      ]
    : [["orders", "/profile", ShoppingBag, "Order History"]];

  return (
    <div className="min-h-screen bg-transparent pb-16 pt-[40px]">
      <div className="container-bound">
        <div className="mb-6 flex items-center justify-between gap-3 lg:hidden">
          <button
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[#121720] text-white shadow-[0_20px_40px_-24px_rgba(0,0,0,0.9)]"
          >
            <Menu size={20} />
          </button>
          <div className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-[#121720] px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-white">
              Worlds Sports
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-white">
              {pageTitle}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
          <aside
            className={`${sidebarOpen ? "block" : "hidden"} w-full shrink-0 lg:block lg:w-[290px]`}
          >
            <div className="sticky top-24 overflow-hidden rounded-[2rem] border border-white/10 bg-[#0f131b]/95 p-6 shadow-[0_28px_80px_-42px_rgba(0,0,0,0.95)] backdrop-blur-xl">
              <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(220,38,38,0.18),transparent_58%)]"></div>
              <div className="relative">
                <div className="flex items-center gap-3 pb-7">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 text-sm font-black uppercase tracking-[0.18em] text-white shadow-[0_18px_40px_-20px_rgba(220,38,38,0.75)]">
                    SW
                  </div>
                  <div>
                    <p className="text-lg font-black uppercase tracking-tight text-white">
                      Sports World
                    </p>
                    <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-slate-500">
                      Seller Console
                    </p>
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-red-400 text-xl font-black text-white">
                      {userInfo.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-base font-bold text-white">
                        {userInfo.name}
                      </p>
                      <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.24em] text-white">
                        {isSeller ? "Premium Seller" : "Customer Account"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <p className="mb-3 px-2 text-[11px] font-bold uppercase tracking-[0.28em] text-slate-500">
                    Navigation
                  </p>
                  <div className="space-y-2">
                    {sidebar.map((item, index) => {
                      const key = item[0];
                      const path = item[1];
                      const Icon = item[2];
                      const label = item[3];
                      const active =
                        tab === key ||
                        (key === "inventory-tools" &&
                          (tab === "form" || tab === "edit"));
                      return (
                        <button
                          key={`${key}-${index}`}
                          onClick={() => navigate(path)}
                          className={`group flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left text-sm font-bold transition-all ${active ? "border-primary-500/40 bg-primary-600 text-white shadow-[0_20px_44px_-24px_rgba(220,38,38,0.75)]" : "border-transparent bg-transparent text-slate-300 hover:border-white/10 hover:bg-white/[0.04] hover:text-white"}`}
                        >
                          <span
                            className={`flex h-10 w-10 items-center justify-center rounded-2xl ${active ? "bg-white/15 text-white" : "bg-white/[0.04] text-slate-400 group-hover:text-white"}`}
                          >
                            <Icon size={18} />
                          </span>
                          <span className="flex-1">{label}</span>
                          <ChevronRight
                            size={16}
                            className={
                              active
                                ? "text-white"
                                : "text-slate-600 group-hover:text-slate-300"
                            }
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                    Quick Support
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Need help with stock, orders, or reports? Keep your
                    storefront moving with faster admin actions.
                  </p>
                  <div className="mt-4 space-y-2">
                    <Link to="/contact">
                    <button className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-white transition-all hover:border-white/20 hover:bg-white/[0.06]">
                      <HelpCircle size={18} />
                      Support
                    </button>
                    </Link>
                    <button
                      onClick={onLogout}
                      className="flex w-full items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300 transition-all hover:bg-red-500/15"
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </aside>
          <main className="min-w-0 flex-1 space-y-8">
            <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#10151d]/95 shadow-[0_28px_80px_-44px_rgba(0,0,0,0.95)] backdrop-blur-xl">
              <div className="flex min-[600px]:max-[1023px]:flex min-[600px]:max-[1023px]:flex-row min-[600px]:max-[1023px]:justify-between flex-col gap-5 border-b border-white/10 px-5 py-5 md:px-8 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white">
                    Sports World Dashboard
                  </p>
                  <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-white md:text-4xl min-[320px]:max-[430px]:text-[26px]  min-[320px]:max-[430px]:leading-[32px]">
                    {isSeller
                      ? tab === "overview"
                        ? "Performance Hub"
                        : pageTitle
                      : "Your Orders"}
                  </h1>
                  <p className="mt-2 text-sm text-slate-400">
                    {isSeller
                      ? `Live operational view for ${todayLabel}. Monitor inventory, sales, and order flow in one place.`
                      : "Track your purchases, payment status, and delivery progress."}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="max-[1160px]:hidden relative min-w-0 sm:w-72">
                    <Search
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                      size={17}
                    />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search orders, stock..."
                      className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-11 pr-4 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-primary-500/40"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    {/* <button className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-300 transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-white">
                      <Bell size={18} />
                    </button>
                    <button className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-300 transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-white">
                      <Settings size={18} />
                    </button> */}
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-sm font-black text-white">
                        {userInfo.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className=" sm:block">
                        <p className="text-sm font-bold text-white">
                          {userInfo.name}
                        </p>
                        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                          {pageTitle}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {isSeller && tab === "overview" && (
              <>
                <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                  {overviewCards.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.label}
                        className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#10151d]/95 p-6 shadow-[0_26px_70px_-42px_rgba(0,0,0,0.95)] backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-white/15"
                      >
                        <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-primary-600/10 blur-3xl"></div>
                        <div
                          className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${item.tone} ${item.accent}`}
                        >
                          <Icon size={22} />
                        </div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-slate-500">
                          {item.label}
                        </p>
                        <p className="mt-4 text-2xl font-black tracking-tight text-white">
                          {item.value}
                        </p>
                        <p className="mt-2 text-sm text-slate-400">
                          {item.note}
                        </p>
                      </div>
                    );
                  })}
                </section>

                <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_360px]">
                  <div className="rounded-[2rem] border border-white/10 bg-[#10151d]/95 p-6 shadow-[0_26px_70px_-42px_rgba(0,0,0,0.95)] backdrop-blur-xl md:p-7">
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-white">
                          Revenue Trends
                        </p>
                        <h3 className="mt-2 text-2xl font-black uppercase tracking-tight text-white min-[320px]:max-[400px]:text-[22px]">
                          {revenueTrendTitle}
                        </h3>
                      </div>
                      <div className="inline-flex rounded-full border w-fit border-white/10 bg-white/[0.04] p-1 text-xs font-bold uppercase tracking-[0.2em]">
                        <button
                          type="button"
                          onClick={() => setRevenueTrendRange("week")}
                          className={`rounded-full px-4 py-2 transition-colors ${
                            revenueTrendRange === "week"
                              ? "bg-white text-slate-900"
                              : "text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          Weekly
                        </button>
                        <button
                          type="button"
                          onClick={() => setRevenueTrendRange("month")}
                          className={`rounded-full px-4 py-2 transition-colors ${
                            revenueTrendRange === "month"
                              ? "bg-white text-slate-900"
                              : "text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          Monthly
                        </button>
                      </div>
                    </div>
                    {revenueTrendRange === "month" ? (
                      <div className="max-h-[260px] overflow-y-auto pr-1 pb-1">
                        <div className="grid h-auto grid-cols-4 gap-3 min-[400px]:grid-cols-5 min-[511px]:grid-cols-7 lg:h-[320px]">
                        {activeSalesData.map((item) => (
                          <div
                            key={item.day}
                            className="rounded-2xl border border-white/10 bg-white/[0.03] p-2 text-center"
                          >
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                              {item.day}
                            </p>
                            <div className="mt-2 flex h-16 items-end justify-center rounded-xl bg-white/[0.03] px-1 py-2">
                              <div
                                className="w-full rounded-lg bg-gradient-to-t from-primary-600 via-rose-400 to-[#ffd2d2]"
                                style={{
                                  height: `${Math.max((item.amount / activePeakSales) * 100, 12)}%`,
                                }}
                              ></div>
                            </div>
                            <p className="mt-2 text-[10px] font-semibold text-slate-300">
                              {formatPrice(item.amount)}
                            </p>
                          </div>
                        ))}
                        </div>
                      </div>
                    ) : (
                      <div className="overflow-x-auto pb-1">
                        <div className="grid h-[320px] grid-cols-4 gap-3 min-[400px]:grid-cols-5 min-[511px]:grid-cols-7 sm:min-w-0">
                        {activeSalesData.map((item) => (
                          <div
                            key={item.day}
                            className="rounded-2xl border h-fit border-white/10 bg-white/[0.03] p-2 text-center"
                          >
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                              {item.day}
                            </p>
                            <div className="mt-2 flex h-16 items-end justify-center rounded-xl bg-white/[0.03] px-1 py-2">
                              <div
                                className="w-full rounded-lg bg-gradient-to-t from-primary-600 via-rose-400 to-[#ffd2d2]"
                                style={{
                                  height: `${Math.max((item.amount / activePeakSales) * 100, 12)}%`,
                                }}
                              ></div>
                            </div>
                            <p className="mt-2 text-[10px] font-semibold text-slate-300">
                              {formatPrice(item.amount)}
                            </p>
                          </div>
                        ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="rounded-[2rem] border border-white/10 bg-[#10151d]/95 p-6 shadow-[0_26px_70px_-42px_rgba(0,0,0,0.95)] backdrop-blur-xl">
                    <div className="mb-6 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-white">
                          Top Items
                        </p>
                        <h3 className="mt-2 text-2xl font-black uppercase tracking-tight text-white">
                          Best Products
                        </h3>
                      </div>
                      <button
                        onClick={() => navigate("/admin/manage-products")}
                        className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] transition-all hover:border-white/20 hover:bg-white/[0.06]"
                      >
                        View Inventory
                      </button>
                    </div>
                    <div className="space-y-4">
                      {topInventoryItems.map((item) => (
                        <div
                          key={item._id}
                          className="flex items-center gap-4 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-3"
                        >
                          <img
                            src={getPrimaryProductImage(item)}
                            alt={item.name}
                            className="h-16 w-16 rounded-2xl object-cover"
                            onError={(e) => {
                              e.currentTarget.src = getPrimaryProductImage({});
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-white">
                              {item.name}
                            </p>
                            <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                              {item.category || "Gear"} /{" "}
                              {item.countInStock || 0} in stock
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-white">
                              {formatPrice(item.price)}
                            </p>
                            <p className="mt-1 text-xs font-semibold text-emerald-300">
                              {Math.max(Number(item.countInStock || 0), 0)}{" "}
                              units
                            </p>
                          </div>
                        </div>
                      ))}
                      {!topInventoryItems.length && (
                        <div className="rounded-[1.5rem] border border-dashed border-white/10 px-4 py-10 text-center text-sm text-slate-500">
                          Top items will appear here once products are
                          available.
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                <section className={isDarkTheme ? "rounded-[2rem] border border-white/10 bg-[#10151d]/95 shadow-[0_26px_70px_-42px_rgba(0,0,0,0.95)] backdrop-blur-xl" : "rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_60px_-36px_rgba(15,23,42,0.16)] backdrop-blur-xl"}>
                  <div className={isDarkTheme ? "flex flex-col gap-3 border-b border-white/10 px-6 py-6 md:flex-row md:items-center md:justify-between md:px-8" : "flex flex-col gap-3 border-b border-slate-200 px-6 py-6 md:flex-row md:items-center md:justify-between md:px-8"}>
                    <div>
                      <p className={isDarkTheme ? "text-[11px] font-bold uppercase tracking-[0.28em] text-white" : "text-[11px] font-bold uppercase tracking-[0.28em] text-slate-700"}>
                        Transactions
                      </p>
                      <h3 className={isDarkTheme ? "mt-2 text-2xl font-black uppercase tracking-tight text-white" : "mt-2 text-2xl font-black uppercase tracking-tight text-slate-900"}>
                        Recent Transactions
                      </h3>
                    </div>
                    <p className={isDarkTheme ? "text-xs font-bold uppercase tracking-[0.22em] text-slate-500" : "text-xs font-bold uppercase tracking-[0.22em] text-slate-500"}>
                      Showing latest order flow
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                      <thead>
                        <tr className={isDarkTheme ? "text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500" : "text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500 bg-slate-50"}>
                          <th className="px-6 py-4 md:px-8">Order ID</th>
                          <th className="px-6 py-4">Customer Name</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Total</th>
                          <th className="px-6 py-4 text-right md:px-8">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className={isDarkTheme ? "divide-y divide-white/5" : "divide-y divide-slate-200"}>
                        {recentTransactions.map((order) => (
                          <tr
                            key={order._id}
                            className={isDarkTheme ? "text-sm text-slate-300" : "text-sm text-slate-600"}
                          >
                            <td className="px-6 py-5 md:px-8">
                              <p className={isDarkTheme ? "font-bold text-white" : "font-bold text-slate-900"}>
                                #{order._id.slice(-8).toUpperCase()}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {order.createdAt?.substring(0, 10)}
                              </p>
                            </td>
                            <td className="px-6 py-5">
                              <p className={isDarkTheme ? "font-semibold text-white" : "font-semibold text-slate-900"}>
                                {order.user?.name || "Customer"}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {order.user?.email || "Order account"}
                              </p>
                            </td>
                            <td className="px-6 py-5">
                              <span
                                className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] ${order.isDelivered ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300" : order.isPaid ? "border-sky-500/20 bg-sky-500/10 text-sky-300" : "border-amber-500/20 bg-amber-500/10 text-amber-300"}`}
                              >
                                {order.isDelivered
                                  ? "Delivered"
                                  : order.isPaid
                                    ? "Processing"
                                    : "Pending"}
                              </span>
                            </td>
                            <td className={isDarkTheme ? "px-6 py-5 text-right font-black text-white" : "px-6 py-5 text-right font-black text-slate-900"}>
                              {formatPrice(order.totalPrice)}
                            </td>
                            <td className="px-6 py-5 text-right md:px-8">
                              <button
                                onClick={() => navigate("/admin/orders")}
                                className={isDarkTheme ? "rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white transition-all hover:border-white/20 hover:bg-white/[0.06]" : "rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"}
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                        {!recentTransactions.length && (
                          <tr>
                            <td
                              colSpan="5"
                              className={isDarkTheme ? "px-6 py-12 text-center text-sm text-slate-500 md:px-8" : "px-6 py-12 text-center text-sm text-slate-500 md:px-8"}
                            >
                              Recent transactions will appear here after orders
                              start coming in.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              </>
            )}

            {isSeller && tab === "add-promo-code" && (
  <div className="space-y-6">

    {/* ══════════════════════════════════════════
        STATS CARDS
    ══════════════════════════════════════════ */}
    <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      {[
        {
          label: "Total Promos",
          value: promos.length,
          note: "All codes combined",
          accent: "text-white",
          glow: "bg-primary-600/10",
        },
        {
          label: "Active",
          value: promos.filter(p =>
            p.isActive && !(p.expiryDate && new Date(p.expiryDate) < new Date())
          ).length,
          note: "Currently usable",
          accent: "text-emerald-300",
          glow: "bg-emerald-500/10",
        },
        {
          label: "Inactive",
          value: promos.filter(p => !p.isActive).length,
          note: "Manually disabled",
          accent: "text-slate-300",
          glow: "bg-slate-500/10",
        },
        {
          label: "Expired",
          value: promos.filter(p =>
            p.expiryDate && new Date(p.expiryDate) < new Date()
          ).length,
          note: "Past expiry date",
          accent: "text-red-300",
          glow: "bg-red-500/10",
        },
      ].map((item, i) => (
        <div key={i}
          className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#10151d]/95 p-6 shadow-[0_26px_70px_-42px_rgba(0,0,0,0.95)] backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-white/15"
        >
          <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full ${item.glow} blur-3xl`} />
          <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-white">
            {item.label}
          </p>
          <p className={`mt-4 text-3xl font-black tracking-tight ${item.accent}`}>
            {item.value}
          </p>
          <p className="mt-2 text-xs text-slate-500">{item.note}</p>
        </div>
      ))}
    </section>

    {/* ══════════════════════════════════════════
        FILTER TABS
    ══════════════════════════════════════════ */}
    <section className="flex flex-wrap gap-2">
      {[
        { key: "all",      label: "All Promos"  },
        { key: "active",   label: "Active"      },
        { key: "inactive", label: "Inactive"    },
        { key: "expired",  label: "Expired"     },
      ].map(f => (
        <button key={f.key} type="button"
          onClick={() => setPromoFilter(f.key)}
          className={`rounded-full border px-5 py-2.5 text-xs font-bold uppercase tracking-[0.18em] transition-all ${
            promoFilter === f.key
              ? "border-primary-500 bg-primary-600 text-white shadow-[0_8px_24px_-10px_rgba(220,38,38,0.6)]"
              : "border-white/10 bg-white dark:bg-white/[0.04] dark:hover:border-white/20 hover:border-black/20 dark:hover:bg-white/[0.06] dark:hover:text-white"
          }`}
        >
          {f.label}
          <span className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-black ${
            promoFilter === f.key ? "bg-white/20 text-white" : "bg-white/[0.06] text-slate-500"
          }`}>
            {f.key === "all"      && promos.length}
            {f.key === "active"   && promos.filter(p => p.isActive && !(p.expiryDate && new Date(p.expiryDate) < new Date())).length}
            {f.key === "inactive" && promos.filter(p => !p.isActive).length}
            {f.key === "expired"  && promos.filter(p => p.expiryDate && new Date(p.expiryDate) < new Date()).length}
          </span>
        </button>
      ))}
    </section>

    {/* ══════════════════════════════════════════
        CREATE PROMO FORM
    ══════════════════════════════════════════ */}
    <section className={addPromoTheme.shell}>
      <div className="mb-7">
        <p className={`text-[11px] font-bold uppercase tracking-[0.28em] ${addPromoTheme.sectionTitle}`}>
          New Code
        </p>
        <h3 className={`mt-2 text-2xl font-black uppercase tracking-tight ${addPromoTheme.sectionTitle}`}>
          Create Promo Code
        </h3>
        <p className={`mt-1.5 text-sm ${addPromoTheme.sectionBody}`}>
          Add a discount code for your customers in Chichawatni.
        </p>
      </div>

      <form onSubmit={handleCreatePromo} className="space-y-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

          {/* Code */}
          <div className="space-y-2">
            <label className={`text-[10px] font-bold uppercase tracking-[0.24em] ${addPromoTheme.label}`}>
              Promo Code *
            </label>
            <input
              type="text"
              placeholder="e.g. EID20"
              value={code}
              required
              onChange={e => setCode(e.target.value.toUpperCase())}
              className={addPromoTheme.input}
            />
          </div>

          {/* Discount */}
          <div className="space-y-2">
            <label className={`text-[10px] font-bold uppercase tracking-[0.24em] ${addPromoTheme.label}`}>
              Discount % *
            </label>
            <div className="relative">
              <input
                type="number"
                placeholder="e.g. 15"
                min="1" max="99"
                value={discount}
                required
                onChange={e => setDiscount(e.target.value)}
                className={addPromoTheme.input}
              />
              <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black ${addPromoTheme.previewTextMuted}`}>%</span>
            </div>
          </div>

          {/* Max Uses */}
          <div className="space-y-2">
            <label className={`text-[10px] font-bold uppercase tracking-[0.24em] ${addPromoTheme.label}`}>
              Max Uses <span className={`normal-case tracking-normal ${isDarkTheme ? "text-slate-600" : "text-slate-500"}`}>(optional)</span>
            </label>
            <input
              type="number"
              placeholder="e.g. 50 (unlimited if empty)"
              min="1"
              value={maxUses}
              onChange={e => setMaxUses(e.target.value)}
              className={addPromoTheme.input}
            />
          </div>

          {/* Expiry */}
          <div className="space-y-2">
            <label className={`text-[10px] font-bold uppercase tracking-[0.24em] ${addPromoTheme.label}`}>
              Expiry Date <span className={`normal-case tracking-normal ${isDarkTheme ? "text-slate-600" : "text-slate-500"}`}>(optional)</span>
            </label>
            <input
              type="date"
              value={expiry}
              onChange={e => setExpiry(e.target.value)}
              className={addPromoTheme.inputDate}
            />
          </div>
        </div>

        {/* Live Preview Badge */}
        {code && discount && (
          <div className={addPromoTheme.preview}>
            <span className={addPromoTheme.previewCode}>
              {code}
            </span>
            <span className={addPromoTheme.previewText}>
              saves <span className="font-black text-emerald-300">{discount}%</span>
              {maxUses && <> · max <span className={`font-bold ${isDarkTheme ? "text-slate-200" : "text-slate-700"}`}>{maxUses}</span> uses</>}
              {expiry && <> · expires <span className={`font-bold ${isDarkTheme ? "text-slate-200" : "text-slate-700"}`}>{expiry}</span></>}
              {!expiry && !maxUses && <> · <span className={addPromoTheme.previewTextMuted}>no restrictions</span></>}
            </span>
          </div>
        )}

        <div className="flex justify-end">
          <button type="submit"
            className={addPromoTheme.button}
          >
            + Create Promo Code
          </button>
        </div>
      </form>
    </section>

    {/* ══════════════════════════════════════════
        PROMO TABLE
    ══════════════════════════════════════════ */}
    <section className={addPromoTheme.tableShell}>

      {/* Table Header */}
      <div className={addPromoTheme.tableHead}>
        <div>
          <p className={`text-[11px] font-bold uppercase tracking-[0.28em] ${addPromoTheme.tableTitle}`}>
            Promo Management
          </p>
          <h3 className={`mt-2 text-2xl font-black uppercase tracking-tight ${addPromoTheme.tableTitle}`}>
            All Promo Codes
            <span className={addPromoTheme.tableCount}>
              {filteredPromos.length}
            </span>
          </h3>
        </div>

        {/* Bulk Delete Expired */}
        {promos.filter(p => p.expiryDate && new Date(p.expiryDate) < new Date()).length > 0 && (
          <button type="button"
            onClick={() => setConfirmClearExpired(true)}
            className="inline-flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/8 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-red-400 transition-all hover:bg-red-500/15"
          >
            <Trash2 size={13} />
            Clear Expired ({promos.filter(p => p.expiryDate && new Date(p.expiryDate) < new Date()).length})
          </button>
        )}
      </div>

      {/* Confirm Clear Expired Banner */}
      <AnimatePresence>
        {confirmClearExpired && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="border-b border-red-500/10 bg-red-500/8 px-6 py-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-500/15">
                  <Trash2 size={14} className="text-red-400" />
                </div>
                <p className={`text-sm font-bold ${addPromoTheme.sectionTitle}`}>
                  Delete all {promos.filter(p => p.expiryDate && new Date(p.expiryDate) < new Date()).length} expired promo codes?
                  <span className={`ml-2 text-xs font-normal ${addPromoTheme.sectionBody}`}>This cannot be undone.</span>
                </p>
              </div>
              <div className="flex gap-3 shrink-0">
                <button type="button" onClick={() => setConfirmClearExpired(false)}
                  className={isDarkTheme ? "rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-bold text-slate-300 hover:bg-white/[0.08]" : "rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"}>
                  Cancel
                </button>
                <button type="button" onClick={handleDeleteExpired}
                  className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-500">
                  Yes, Delete All
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className={addPromoTheme.tableHeaderRow}>
              <th className="text-left px-6 py-4 md:px-8">Code</th>
              <th className="px-6 py-4 text-center">Discount</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-center">Expiry</th>
              <th className="px-6 py-4 text-right md:px-8">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/5">
            {filteredPromos.map((promo) => {
              const isExpired = promo.expiryDate && new Date(promo.expiryDate) < new Date();
              const daysLeft = promo.expiryDate
                ? Math.ceil((new Date(promo.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
                : null;

              return (
                <tr key={promo._id}
                  className={addPromoTheme.tableRow}
                >
                  {/* Code */}
                  <td className="px-6 py-5 md:px-8 text-left">
                    <span className={addPromoTheme.codeBadge}>
                      {promo.code}
                    </span>
                  </td>

                  {/* Discount */}
                  <td className="px-6 py-5 text-center">
                    <span className={addPromoTheme.discount}>{promo.discountPercentage}</span>
                    <span className={`text-2xl ${addPromoTheme.emptyTitle}`}>%</span>
                  </td>


                  {/* Status */}
                  <td className="px-6 py-5 text-center">
                    {isExpired ? (
                      <span className={addPromoTheme.statusExpired}>
                        <span className="h-1.5 w-1.5 rounded-full bg-red-400" />Expired
                      </span>
                    ) : promo.isActive ? (
                      <span className={addPromoTheme.statusActive}>
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />Active
                      </span>
                    ) : (
                      <span className={addPromoTheme.statusInactive}>
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />Inactive
                      </span>
                    )}
                  </td>

                  {/* Expiry */}
                  <td className="px-6 py-5 text-center">
                    {promo.expiryDate ? (
                      <div>
                        <p className={addPromoTheme.expiryText}>{promo.expiryDate.substring(0, 10)}</p>
                        {!isExpired && daysLeft !== null && (
                          <p className={`mt-0.5 text-[10px] font-bold ${
                            daysLeft <= 3 ? "text-amber-400" :
                            daysLeft <= 7 ? "text-yellow-400" : "text-slate-500"
                          }`}>
                            {daysLeft === 0 ? "Expires today" : `${daysLeft}d left`}
                          </p>
                        )}
                        {isExpired && (
                          <p className="mt-0.5 text-[10px] font-bold text-red-400/70">Expired</p>
                        )}
                      </div>
                    ) : (
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        No Expiry
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="text-right px-6 py-5 md:px-8">
                    <div className="flex items-center justify-end gap-2">

                      {/* Stats button */}
                      <button type="button"
                        onClick={() => fetchPromoStats(promo._id)}
                        className={addPromoTheme.actionButton}
                      >
                        Stats
                      </button>

                      {/* Toggle */}
                      {!isExpired && (
                        <button type="button"
                          onClick={() => togglePromo(promo._id)}
                          className={`rounded-xl border px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all ${promo.isActive ? addPromoTheme.toggleActive : addPromoTheme.toggleInactive}`}
                        >
                          {promo.isActive ? "Disable" : "Enable"}
                        </button>
                      )}

                      {/* Delete */}
                      <button type="button"
                        onClick={() => deletePromo(promo._id)}
                        className={addPromoTheme.deleteButton}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredPromos.length === 0 && (
              <tr>
                <td colSpan="6" className="py-16 text-center">
                  <div className={addPromoTheme.emptyIcon}>
                    <span className="text-2xl">🎟</span>
                  </div>
                  <p className={`text-sm font-bold uppercase tracking-[0.2em] ${addPromoTheme.emptyTitle}`}>
                    No promo codes found
                  </p>
                  <p className={`mt-1 text-xs ${addPromoTheme.emptyBody}`}>
                    {promoFilter !== 'all' ? 'Try a different filter.' : 'Create your first code above.'}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>

    {/* ══════════════════════════════════════════
        STATS MODAL
    ══════════════════════════════════════════ */}
    <AnimatePresence>
      {promoStatsModal && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className={`fixed inset-0 !mt-[0px] z-50 flex items-center justify-center backdrop-blur-sm ${isDarkTheme ? "bg-black/70" : "bg-slate-950/35"}`}
        >
          <motion.div
            initial={{ scale: 0.9, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 16 }}
            className={addPromoTheme.modalShell}
          >
            {/* Modal Header */}
            <div className={addPromoTheme.modalHeader}>
              <div>
                <p className={`text-[11px] font-bold uppercase tracking-[0.26em] ${addPromoTheme.modalTitle}`}>
                  Promo Analytics
                </p>
                <h3 className={`mt-1 text-xl font-black uppercase tracking-tight ${addPromoTheme.modalTitle}`}>
                  {promoStatsModal.code}
                </h3>
              </div>
              <button type="button" onClick={() => setPromoStatsModal(null)}
                className={addPromoTheme.modalClose}>
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className={addPromoTheme.modalBody}>

              {/* Status badges */}
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${
                  promoStatsModal.isExpired
                    ? isDarkTheme
                      ? "border-red-500/20 bg-red-500/10 text-red-400"
                      : "border-red-200 bg-red-50 text-red-600"
                    : promoStatsModal.isActive
                      ? isDarkTheme
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                        : "border-emerald-200 bg-emerald-50 text-emerald-600"
                      : isDarkTheme
                        ? "border-slate-500/20 bg-slate-500/10 text-slate-400"
                        : "border-slate-200 bg-slate-50 text-slate-500"
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${
                    promoStatsModal.isExpired ? "bg-red-400" :
                    promoStatsModal.isActive ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
                  }`} />
                  {promoStatsModal.isExpired ? "Expired" : promoStatsModal.isActive ? "Active" : "Inactive"}
                </span>
                <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${
                  isDarkTheme
                    ? "border-primary-500/20 bg-primary-500/10 text-white"
                    : "border-primary-200 bg-primary-50 text-primary-700"
                }`}>
                  {promoStatsModal.discountPercentage}% Discount
                </span>

              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    label: "Total Uses",
                    value: promoStatsModal.usedCount || 0,
                    sub: promoStatsModal.maxUses ? `of ${promoStatsModal.maxUses} max` : "unlimited",
                    accent: isDarkTheme ? "text-white" : "text-slate-900",
                  },
                  {
                    label: "Uses Remaining",
                    value: promoStatsModal.usesRemaining !== null
                      ? promoStatsModal.usesRemaining
                      : "∞",
                    sub: "before limit hit",
                    accent: promoStatsModal.usesRemaining === 0
                      ? isDarkTheme ? "text-red-300" : "text-red-600"
                      : isDarkTheme ? "text-emerald-300" : "text-emerald-600",
                  },
                  {
                    label: "Total Discount Given",
                    value: `₨${(promoStatsModal.totalDiscountGiven || 0).toLocaleString()}`,
                    sub: "across all orders",
                    accent: isDarkTheme ? "text-amber-300" : "text-amber-600",
                  },
                  {
                    label: "Created",
                    value: promoStatsModal.createdAt?.substring(0, 10) || "—",
                    sub: "creation date",
                    accent: isDarkTheme ? "text-slate-300" : "text-slate-700",
                  },
                ].map((s, i) => (
                  <div key={i}
                    className={addPromoTheme.card}
                  >
                    <p className={`text-[10px] font-bold uppercase tracking-[0.22em] ${addPromoTheme.cardLabel}`}>{s.label}</p>
                    <p className={`mt-2 text-2xl font-black ${s.accent}`}>{s.value}</p>
                    <p className={addPromoTheme.cardSub}>{s.sub}</p>
                  </div>
                ))}
              </div>

              {/* Usage bar (if maxUses set) */}
              {promoStatsModal.maxUses && (
                <div className={addPromoTheme.usageShell}>
                  <div className="flex items-center justify-between mb-2">
                    <p className={`text-[10px] font-bold uppercase tracking-[0.22em] ${addPromoTheme.cardLabel}`}>Usage Progress</p>
                    <p className={`text-xs font-black ${addPromoTheme.modalTitle}`}>
                      {Math.round((promoStatsModal.usedCount / promoStatsModal.maxUses) * 100)}%
                    </p>
                  </div>
                  <div className={addPromoTheme.usageTrack}>
                    <div
                      className={`h-full rounded-full transition-all ${
                        (promoStatsModal.usedCount / promoStatsModal.maxUses) >= 0.9 ? "bg-red-500" :
                        (promoStatsModal.usedCount / promoStatsModal.maxUses) >= 0.6 ? "bg-amber-400" : "bg-emerald-400"
                      }`}
                      style={{ width: `${Math.min((promoStatsModal.usedCount / promoStatsModal.maxUses) * 100, 100)}%` }}
                    />
                  </div>
                  <div className={addPromoTheme.usageMeta}>
                    <span>{promoStatsModal.usedCount} used</span>
                    <span>{promoStatsModal.maxUses} total</span>
                  </div>
                </div>
              )}

              {/* Expiry info */}
              {promoStatsModal.expiryDate && (
                <div className={addPromoTheme.expiryShell(promoStatsModal.isExpired)}>
                  <p className={addPromoTheme.expiryLabel}>Expiry Date</p>
                  <p className={addPromoTheme.expiryValue(promoStatsModal.isExpired)}>
                    {promoStatsModal.expiryDate.substring(0, 10)}
                  </p>
                  {promoStatsModal.isExpired && (
                    <p className="mt-0.5 text-[10px] font-bold text-red-400/70">This promo has expired.</p>
                  )}
                </div>
              )}
            </div>

            
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

  </div>
)}

            {isSeller && tab === "inventory" && (
              <section className="table-shell">
                <div className="p-6 md:p-8 border-b border-slate-100 dark:border-dark-border flex flex-col sm:flex-row justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Product Inventory
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 min-[320px]:max-[430px]:leading-[20px]">
                      Products are loaded directly from Database and stay
                      persistent across refresh and relogin.
                    </p>
                  </div>
                  <div className="relative w-full sm:w-72">
                    <Search
                      className="absolute left-3.5 top-3 text-slate-400"
                      size={16}
                    />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search products..."
                      className="input-premium pl-10 pr-4 py-3"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto" style={inventoryScrollStyle}>
                  <table className="table-premium">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th className="text-center">Price</th>
                        <th className="text-center">Category</th>
                        <th className="text-center">Stock</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((item) => (
                        <tr key={item._id}>
                          <td>
                            <div className="flex items-center gap-4 min-[1024px]:max-[1140px]:flex-col min-[320px]:max-[767px]:flex-col">
                              <img
                                src={getPrimaryProductImage(item)}
                                alt={item.name}
                                className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-dark-border shadow-sm ring-1 ring-slate-100 dark:ring-dark-border"
                                onError={(e) => {
                                  e.currentTarget.src = getPrimaryProductImage(
                                    {},
                                  );
                                }}
                              />
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white">
                                  {item.name}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {item.brand}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="text-center">
                            <div className="inline-flex flex-col items-center">
                              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                Selling Price
                              </span>
                              <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                                {formatPrice(item.price)}
                              </span>
                            </div>
                          </td>
                          <td className="text-center">
                            <span className="bg-slate-100 dark:bg-dark-bg text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold border uppercase tracking-wider">
                              {item.category}
                            </span>
                          </td>
                          <td className="text-center">
                            {item.countInStock > 0 ? (
                              <span className="text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-900/20 px-3.5 py-2 rounded-full text-xs border border-emerald-200 dark:border-emerald-900/40 inline-flex items-center gap-1.5 shadow-sm">
                                <CheckCircle2 size={14} />
                                {item.countInStock} in stock
                              </span>
                            ) : (
                              <span className="text-red-600 dark:text-red-300 font-bold bg-red-50 dark:bg-red-900/20 px-3.5 py-2 rounded-full text-xs border border-red-200 dark:border-red-900/40 inline-flex items-center gap-1.5 shadow-sm">
                                <XCircle size={14} />
                                Out of stock
                              </span>
                            )}
                          </td>
                          <td className="text-right">
                            <div className="flex items-center justify-end gap-2 min-[320px]:max-[767px]:flex-col">
                              <button
                                onClick={() =>
                                  navigate(`/admin/edit-product/${item._id}`)
                                }
                                className="p-3 text-slate-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl border border-slate-200 dark:border-dark-border transition-all shadow-sm hover:shadow-md"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => onDelete(item._id)}
                                className="p-3 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl border border-slate-200 dark:border-dark-border transition-all shadow-sm hover:shadow-md"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {isSeller && tab === "orders" && (
              <section className="table-shell">
                <div className="p-6 md:p-8 border-b">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Customer Orders
                  </h3>
                </div>

                {/* ✅ Loading */}
                {ordersLoading && (
                  <p className="p-6 text-center text-slate-500">
                    Loading orders...
                  </p>
                )}

                {/* ✅ Error */}
                {ordersError && (
                  <p className="p-6 text-center text-red-500">{ordersError}</p>
                )}

                {/* ✅ Empty state */}
                {!ordersLoading && orders.length === 0 && (
                  <p className="p-6 text-center text-slate-500">
                    No orders found
                  </p>
                )}

                <div className="overflow-x-auto" style={ordersTableScrollStyle}>
                  <table className="table-premium">
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th className="text-center">Amount</th>
                        <th className="text-center">Payment</th>
                        <th className="text-center">Delivery</th>
                        <th className="text-center">Details</th>
                        <th className="text-center">Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {orders.map((order) => (
                        <tr key={order._id}>
                          {/* Customer */}
                          <td>
                            <p className="font-bold text-slate-900 dark:text-white">
                              {order.user?.name || "Customer"}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              #{order._id.slice(-8).toUpperCase()}
                            </p>
                          </td>

                          {/* Date */}
                          {/* <td className="text-center text-slate-600 dark:text-slate-400">
                            {order.createdAt?.substring(0, 10)}
                          </td> */}

                          {/* Amount */}
                          <td className="text-center font-bold text-slate-900 dark:text-white">
                            {formatPrice(order.totalPrice)}
                          </td>

                        

                          {/* Payment */}
                          <td className="text-center">
                            <span
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold `}
                            >
                              {/* {order.isPaid ? 'Paid' : 'Pending'} */}

                              <td className="text-center">
                                <select
                                  value={order.isPaid ? "paid" : "pending"}
                                  disabled={order.isCancelled}
                                  onChange={(e) => {
                                    if (
                                      e.target.value === "paid" &&
                                      !order.isPaid
                                    ) {
                                      onMarkPaid(order._id);
                                    }
                                  }}
                                  className={`px-3 py-1.5 ${order.isCancelled  ? "bg-slate-200 text-slate-400 cursor-not-allowed"  : "bg-red-600 text-white cursor-pointer" } rounded-lg text-xs font-bold border
      ${
        order.isPaid
          ? "bg-blue-50 text-blue-600 border-blue-200"
          : "bg-yellow-50 text-yellow-600 border-yellow-200"
      }`}
                                >
                                  <option value="pending">Pending</option>
                                  <option value="paid">Paid</option>
                                </select>
                              </td>
                            </span>
                          </td>

                          {/* Delivery */}
                          <td className="text-right">
                            <div className="flex items-center justify-center gap-2">
                              {order.isCancelled ? (
                                <span className="text-slate-500 font-bold cursor-not-allowed">
                                  Cancelled
                                </span>
                              ) : (
                                <select
                                  value={
                                    order.isDelivered
                                      ? "delivered"
                                      : order.isDispatched
                                        ? "dispatched"
                                        : "pending"
                                  }
                                  onChange={(e) => {
                                    if (e.target.value === "dispatched" && !order.isDispatched) {
                                      onDispatch(order._id);
                                    }
                                    if (e.target.value === "delivered" && !order.isDelivered) {
                                      if (!order.isDispatched) {
                                        toast.error("Dispatch the order first");
                                        return;
                                      }
                                      onDeliver(order._id);
                                    }
                                  }}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                                    order.isDelivered
                                      ? "bg-green-50 text-green-600 border-green-200"
                                      : order.isDispatched
                                        ? "bg-sky-50 text-sky-600 border-sky-200"
                                        : "bg-slate-100 text-slate-600 border-slate-200"
                                  }`}
                                >
                                  <option value="pending">Pending</option>
                                  <option value="dispatched">Dispatched</option>
                                  <option value="delivered" disabled={!order.isDispatched}>
                                    Delivered
                                  </option>
                                </select>
                              )}

                            </div>
                          </td>

                               {/* Address */}
                          <td className="text-center">
  <button
    onClick={() => {
      setSelectedAddress({
  ...order.shippingAddress,
  orderDate: order.createdAt?.substring(0, 10),
});
      setShowAddressModal(true);
    }}
    className="rounded-full border border-black/20  dark:border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em]  transition-all hover:border-black/50 hover:bg-white/[0.06]"
  >
    View
  </button>
</td>

                              {/* Cancel Order */}
<td className="text-center">
  {order.isCancelled ? (
    order.cancelledBy === 'seller' ? (
    <button
      onClick={() => onOpenCancelReasonModal(order)}
      className="px-3 py-2 text-xs rounded-lg bg-slate-700 text-white hover:bg-slate-800"
    >
      Note
    </button>
    ) : (
    <span className="inline-flex px-3 py-2 text-xs rounded-lg bg-slate-300 text-slate-500 cursor-not-allowed font-bold">
      Cancelled
    </span>
    )
  ) : (
    <button
      onClick={() => onCancelOrder(order._id)}
      disabled={order.isPaid || order.isDispatched || order.isDelivered}
      className={`px-3 py-2 text-xs rounded-lg ${
        order.isPaid || order.isDispatched || order.isDelivered
          ? "bg-slate-300 text-slate-500 cursor-not-allowed"
          : "bg-yellow-500 text-white hover:bg-yellow-600"
      }`}
    >
      {order.isPaid && order.isDelivered
        ? "Completed"
        : order.isDispatched
          ? "Dispatched"
          : order.isPaid
            ? "Paid"
            : "Cancel"}
    </button>
  )}
</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {isSeller && tab === "upload-stock-sheet" && (
              <UploadStockSheetSection />
            )}

            {isSeller && tab === "offline-sales" && <OfflineSalesSection /> }

            {isSeller && tab === "bat-repair" && <BatRepairSection /> }

            {isSeller && tab === "expenses" && <ExpenseManagementSection /> }

            {isSeller && tab === "stock-inward" && <StockInwardSection />}

            {isSeller && tab === "business-summary" && (
              <BusinessSummarySection />
            )}

            {isSeller && tab === "messages" && <MessageSection />}

            {isSeller && tab === "sales-report" && <SalesReportSection />}

            {isSeller && (tab === "form" || tab === "edit") && (
              <form onSubmit={onSubmit} className="space-y-8">
                <section className={addProductTheme.shell}>
                  <div className={addProductTheme.glow}></div>
                  <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <p className={`text-[11px] font-bold uppercase tracking-[0.28em] ${addProductTheme.eyebrow}`}>
                        Inventory Management
                      </p>
                      <h3 className={`mt-3 text-3xl font-black uppercase tracking-tight md:text-4xl ${addProductTheme.title}`}>
                        {isEdit ? "Edit Product" : "Add New Product"}
                      </h3>
                      <p className={`mt-3 max-w-2xl text-sm leading-7 ${addProductTheme.body}`}>
                        {isEdit
                          ? "Update product details, media, and specifications while preserving your current Sports World inventory workflow."
                          : "Configure a new premium gear listing for the storefront using the existing product creation and upload flow."}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3 justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          setImages([]);
                          setForm(emptyForm);
                          setCategoryOptions(CATEGORY_OPTIONS);
                          setProductNameOptions(PRODUCT_NAME_OPTIONS);
                          setFeatureOptions(FEATURE_OPTIONS);
                          setSpecificationOptionsMap(
                            cloneSpecificationOptionsMap(),
                          );
                          navigate("/admin/manage-products");
                        }}
                        className={addProductTheme.secondaryButton}
                      >
                        Discard
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className={addProductTheme.primaryButton}
                      >
                        {saving
                          ? "Saving..."
                          : isEdit
                            ? "Save Changes"
                            : "Save Product"}
                      </button>
                    </div>
                  </div>
                </section>

                <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.2fr)_360px]">
                  <div className="space-y-8">
                    <section className={addProductTheme.panel}>
                      <div className="mb-6">
                        <p className={`text-[11px] font-bold uppercase tracking-[0.24em] ${addProductTheme.panelTitle}`}>
                          Basic Information
                        </p>
                        <h4 className={`mt-2 text-2xl font-black tracking-tight ${addProductTheme.panelTitle}`}>
                          Core Product Setup
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <label className={`text-[11px] font-bold uppercase tracking-[0.22em] ${addProductTheme.label}`}>
                              Product Name
                            </label>
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={onAddProductName}
                                className={addProductTheme.control}
                              >
                                Add
                              </button>
                              <button
                                type="button"
                                onClick={onEditProductName}
                                className={addProductTheme.control}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={onDeleteProductNameOption}
                                className={addProductTheme.control}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                          <div className="relative" ref={productNameMenuRef}>
                            <button
                              type="button"
                              onClick={() =>
                                setIsProductNameMenuOpen((prev) => !prev)
                              }
                              className={`flex h-12 w-full items-center justify-between rounded-2xl border px-4 text-left text-sm transition-all ${isProductNameMenuOpen ? addProductTheme.menuButtonActive : addProductTheme.menuButtonInactive}`}
                            >
                              <span className={form.productNameOption ? addProductTheme.menuTextFilled : addProductTheme.menuTextEmpty}>
                                {form.productNameOption ||
                                  "Select Product Name"}
                              </span>
                              <ChevronDown
                                size={18}
                                className={`shrink-0 transition-transform ${addProductTheme.muted} ${isProductNameMenuOpen ? "rotate-180 text-primary-300" : ""}`}
                              />
                            </button>

                            {isProductNameMenuOpen && (
                              <div className={addProductTheme.menuPanel}>
                                <div className={addProductTheme.menuInner}>
                                  {[
                                    ...productNameOptions,
                                    OTHER_PRODUCT_OPTION,
                                  ].map((option) => (
                                    <button
                                      key={option}
                                      type="button"
                                      onClick={() =>
                                        onProductNameOptionChange(option)
                                      }
                                      className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm transition-all ${form.productNameOption === option ? addProductTheme.menuOptionActive : addProductTheme.menuOptionInactive}`}
                                    >
                                      <span className="truncate">{option}</span>
                                      {form.productNameOption === option && (
                                        <span className="ml-3 text-[10px] font-bold uppercase tracking-[0.22em] text-primary-300">
                                          Selected
                                        </span>
                                      )}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className={`text-[11px] font-bold uppercase tracking-[0.22em] ${addProductTheme.label}`}>
                            Product Type
                          </label>
                          <select
                            value={form.productType}
                            onChange={(e) =>
                              setForm((p) => ({
                                ...p,
                                productType: e.target.value,
                                variants:
                                  e.target.value === "variable" && p.variants.length === 0
                                    ? [createVariantRow()]
                                    : p.variants,
                              }))
                            }
                            className={addProductTheme.select}
                          >
                            <option value="single">Single Product</option>
                            <option value="variable">Variable Product</option>
                          </select>
                        </div>

                        <label className={addProductTheme.checkbox}>
                          <div>
                            <p className={`text-sm font-semibold ${addProductTheme.checkboxTitle}`}>Featured Product</p>
                            <p className={`mt-1 text-xs ${addProductTheme.checkboxBody}`}>
                              Show this product on the Home page featured section.
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={form.isFeatured}
                            onChange={(e) =>
                              setForm((p) => ({
                                ...p,
                                isFeatured: e.target.checked,
                              }))
                            }
                            className={isDarkTheme ? "h-5 w-5 rounded border-white/20 bg-white/[0.06] text-primary-600 focus:ring-primary-500" : "h-5 w-5 rounded border-slate-300 bg-white text-primary-600 focus:ring-primary-500"}
                          />
                        </label>

                        <div className="space-y-2">
                          <label className={`text-[11px] font-bold uppercase tracking-[0.22em] ${addProductTheme.label}`}>
                            Price
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={form.price}
                            onChange={(e) =>
                              setForm((p) => ({ ...p, price: e.target.value }))
                            }
                            required={form.productType !== "variable"}
                            placeholder="Price"
                            className={addProductTheme.input}
                          />
                        </div>

                        {form.productNameOption === OTHER_PRODUCT_OPTION && (
                          <div className="space-y-2">
                            <label className={`text-[11px] font-bold uppercase tracking-[0.22em] ${addProductTheme.label}`}>
                              Custom Product Name
                            </label>
                            <input
                              value={form.customProductName}
                              onChange={(e) =>
                                onCustomProductNameChange(e.target.value)
                              }
                              required
                              placeholder="Enter new product name"
                              className={addProductTheme.input}
                            />
                          </div>
                        )}

                        <div className="space-y-2">
                          <label className={`text-[11px] font-bold uppercase tracking-[0.22em] ${addProductTheme.label}`}>
                            Brand
                          </label>
                          <input
                            value={form.brand}
                            onChange={(e) =>
                              setForm((p) => ({ ...p, brand: e.target.value }))
                            }
                            required
                            placeholder="Brand"
                            className={addProductTheme.input}
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <label className={`text-[11px] font-bold uppercase tracking-[0.22em] ${addProductTheme.label}`}>
                              Category
                            </label>
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={onAddCategoryOption}
                                className={addProductTheme.control}
                              >
                                Add
                              </button>
                              <button
                                type="button"
                                onClick={onEditCategoryOption}
                                className={addProductTheme.control}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={onDeleteCategoryOption}
                                className={addProductTheme.control}
                              >
                                Delete
                              </button>
                              <button
                                type="button"
                                onClick={onGenerateDetails}
                                disabled={generatingDetails}
                                className={`inline-flex items-center gap-1 ${addProductTheme.control} disabled:opacity-60`}
                              >
                                <Sparkles size={12} />
                                {generatingDetails
                                  ? "Generating..."
                                  : "Generate Details"}
                              </button>
                            </div>
                          </div>
                          <select
                            value={form.category}
                            onChange={(e) => onCategoryChange(e.target.value)}
                            required
                            className={addProductTheme.select}
                          >
                            <option value="" disabled>
                              Select Category
                            </option>
                            {categoryOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className={`text-[11px] font-bold uppercase tracking-[0.22em] ${addProductTheme.label}`}>
                            Stock Count
                          </label>
                          <input
                            type="number"
                            value={form.countInStock}
                            onChange={(e) =>
                              setForm((p) => ({
                                ...p,
                                countInStock: e.target.value,
                              }))
                            }
                            required={form.productType !== "variable"}
                            placeholder="Stock Count"
                            className={addProductTheme.input}
                          />
                        </div>

                        {form.productType === "variable" && (
                            <div className="space-y-4 md:col-span-2">
                            <div className="flex items-center justify-between gap-3">
                              <label className={`text-[11px] font-bold uppercase tracking-[0.22em] ${addProductTheme.label}`}>
                                Variants
                              </label>
                              <button
                                type="button"
                                onClick={() =>
                                  setForm((p) => ({
                                    ...p,
                                    variants: [...p.variants, createVariantRow()],
                                  }))
                                }
                                className={addProductTheme.control}
                              >
                                Add Variant
                              </button>
                            </div>

                            <div className="space-y-4">
                              {form.variants.map((variant, variantIndex) => (
                                <div
                                  key={variant.id}
                                  className={addProductTheme.variantCard}
                                >
                                  <div className="mb-3 flex items-center justify-between gap-3">
                                    <p className={`text-xs font-bold uppercase tracking-[0.18em] ${addProductTheme.muted}`}>
                                      Variant {variantIndex + 1}
                                    </p>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setForm((p) => ({
                                          ...p,
                                          variants:
                                            p.variants.length === 1
                                              ? [createVariantRow()]
                                              : p.variants.filter(
                                                  (item) => item.id !== variant.id,
                                                ),
                                        }))
                                      }
                                      className="text-xs font-bold uppercase tracking-[0.16em] text-rose-300"
                                    >
                                      Remove
                                    </button>
                                  </div>

                                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                    <input
                                      placeholder="Variant name (e.g. Size M)"
                                      value={variant.name}
                                      onChange={(e) =>
                                        setForm((p) => ({
                                          ...p,
                                          variants: p.variants.map((item) =>
                                            item.id === variant.id
                                              ? { ...item, name: e.target.value }
                                              : item,
                                          ),
                                        }))
                                      }
                                      className={isDarkTheme ? "h-11 w-full rounded-xl border border-white/10 bg-[#151b24] px-3 text-sm text-white outline-none" : "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none"}
                                    />
                                    <input
                                      placeholder="SKU (optional)"
                                      value={variant.sku}
                                      onChange={(e) =>
                                        setForm((p) => ({
                                          ...p,
                                          variants: p.variants.map((item) =>
                                            item.id === variant.id
                                              ? { ...item, sku: e.target.value }
                                              : item,
                                          ),
                                        }))
                                      }
                                      className={isDarkTheme ? "h-11 w-full rounded-xl border border-white/10 bg-[#151b24] px-3 text-sm text-white outline-none" : "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none"}
                                    />
                                    <input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      placeholder="Price"
                                      value={variant.price}
                                      onChange={(e) =>
                                        setForm((p) => ({
                                          ...p,
                                          variants: p.variants.map((item) =>
                                            item.id === variant.id
                                              ? { ...item, price: e.target.value }
                                              : item,
                                          ),
                                        }))
                                      }
                                      className={isDarkTheme ? "h-11 w-full rounded-xl border border-white/10 bg-[#151b24] px-3 text-sm text-white outline-none" : "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none"}
                                    />
                                    <input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      placeholder="Cost price"
                                      value={variant.costPrice}
                                      onChange={(e) =>
                                        setForm((p) => ({
                                          ...p,
                                          variants: p.variants.map((item) =>
                                            item.id === variant.id
                                              ? {
                                                  ...item,
                                                  costPrice: e.target.value,
                                                }
                                              : item,
                                          ),
                                        }))
                                      }
                                      className={isDarkTheme ? "h-11 w-full rounded-xl border border-white/10 bg-[#151b24] px-3 text-sm text-white outline-none" : "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none"}
                                    />
                                    <input
                                      type="number"
                                      min="0"
                                      placeholder="Stock count"
                                      value={variant.countInStock}
                                      onChange={(e) =>
                                        setForm((p) => ({
                                          ...p,
                                          variants: p.variants.map((item) =>
                                            item.id === variant.id
                                              ? {
                                                  ...item,
                                                  countInStock: e.target.value,
                                                }
                                              : item,
                                          ),
                                        }))
                                      }
                                      className="h-11 w-full rounded-xl border border-white/10 bg-[#151b24] px-3 text-sm text-white outline-none"
                                    />
                                    <div className="space-y-2">
                                      <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0] || null;
                                          setForm((p) => ({
                                            ...p,
                                            variants: p.variants.map((item) =>
                                              item.id === variant.id
                                                ? {
                                                    ...item,
                                                    imageFile: file,
                                                    image: file ? "" : item.image,
                                                  }
                                                : item,
                                            ),
                                          }));
                                        }}
                                        className={isDarkTheme ? "h-11 w-full rounded-xl border border-white/10 bg-[#151b24] px-3 text-sm text-white file:mr-3 file:rounded-lg file:border-0 file:bg-primary-600 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white outline-none" : "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 file:mr-3 file:rounded-lg file:border-0 file:bg-primary-600 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white outline-none"}
                                      />
                                        <p className={`text-[10px] ${addProductTheme.muted}`}>
                                        {variant.imageFile
                                          ? `Selected: ${variant.imageFile.name}`
                                          : variant.image
                                            ? "Existing variant image will be kept"
                                            : "No variant image selected"}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </section>

                    <section className={addProductTheme.panel}>
                      <div className="mb-6">
                        <p className={`text-[11px] font-bold uppercase tracking-[0.24em] ${addProductTheme.panelTitle}`}>
                          Product Details
                        </p>
                        <h4 className={`mt-2 text-2xl font-black tracking-tight ${addProductTheme.panelTitle}`}>
                          Features & Specifications
                        </h4>
                      </div>

                      <div className="space-y-8">
                        <div className="space-y-4">
                          <h4 className={`text-[11px] font-bold uppercase tracking-[0.22em] ${addProductTheme.label}`}>
                            Key Features
                          </h4>
                          <div className="space-y-4">
                            {form.features.map((feature, index) => (
                              <div
                                key={feature.id}
                                className={addProductTheme.variantCard}
                              >
                                <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-4 items-start">
                                  <div className="space-y-3">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                      <span className={`text-[11px] font-bold uppercase tracking-[0.22em] ${addProductTheme.label}`}>
                                        Feature
                                      </span>
                                      <div className="flex flex-wrap items-center gap-2">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            onAddFeatureOption(index)
                                          }
                                          className={addProductTheme.control}
                                        >
                                          Add
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            onEditFeatureOption(index)
                                          }
                                          className={addProductTheme.control}
                                        >
                                          Edit
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            onDeleteFeatureOption(index)
                                          }
                                          className={addProductTheme.control}
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    </div>
                                    <div className="space-y-3">
                                      <select
                                        value={feature.option}
                                        onChange={(e) =>
                                          onFeatureOptionChange(
                                            index,
                                            e.target.value,
                                          )
                                        }
                                        className={addProductTheme.select}
                                      >
                                        <option value="" disabled>
                                          Select Feature
                                        </option>
                                        {featureOptions.map((option) => (
                                          <option key={option} value={option}>
                                            {option}
                                          </option>
                                        ))}
                                        <option value={OTHER_FEATURE_OPTION}>
                                          {OTHER_FEATURE_OPTION}
                                        </option>
                                      </select>
                                      {feature.option ===
                                        OTHER_FEATURE_OPTION && (
                                        <input
                                          value={feature.customValue}
                                          onChange={(e) =>
                                            onCustomFeatureChange(
                                              index,
                                              e.target.value,
                                            )
                                          }
                                          placeholder="Enter new feature"
                                          className={isDarkTheme ? "h-12 w-full rounded-2xl border border-white/10 bg-[#151b24] px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-primary-500/40" : "h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-primary-500/40"}
                                        />
                                      )}
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeFeature(index)}
                                    className="w-full xl:w-auto rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300 transition-all hover:bg-red-500/15"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={addFeature}
                            className={`inline-flex items-center gap-2 ${addProductTheme.control} px-4 py-3 text-sm`}
                          >
                            <Plus size={16} />
                            Add Feature
                          </button>
                        </div>

                        <div className="space-y-4">
                          <h4 className={`text-[11px] font-bold uppercase tracking-[0.22em] ${addProductTheme.label}`}>
                            Specifications
                          </h4>
                          <div className="space-y-4">
                            {form.specifications.map((spec, index) => (
                              <div
                                key={spec.id}
                                className={addProductTheme.variantCard}
                              >
                                <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-4 items-start">
                                  <div className="space-y-3">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                      <span className={`text-[11px] font-bold uppercase tracking-[0.22em] ${addProductTheme.label}`}>
                                        Specification
                                      </span>
                                      <div className="flex flex-wrap items-center gap-2">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            onAddSpecificationOption(index)
                                          }
                                          className={addProductTheme.control}
                                        >
                                          Add
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            onEditSpecificationOption(index)
                                          }
                                          className={addProductTheme.control}
                                        >
                                          Edit
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            onDeleteSpecificationOption(index)
                                          }
                                          className={addProductTheme.control}
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      <div className="space-y-3">
                                        <select
                                          value={spec.option}
                                          onChange={(e) =>
                                            onSpecificationOptionChange(
                                              index,
                                              e.target.value,
                                            )
                                          }
                                          className={addProductTheme.select}
                                        >
                                          <option value="" disabled>
                                            Select Specification Name
                                          </option>
                                          {currentSpecificationOptions.map(
                                            (option) => (
                                              <option
                                                key={`${form.category}-${option}`}
                                                value={option}
                                              >
                                                {option}
                                              </option>
                                            ),
                                          )}
                                        </select>
                                        {spec.option ===
                                          OTHER_SPECIFICATION_OPTION && (
                                          <input
                                            value={spec.customName}
                                            onChange={(e) =>
                                              onCustomSpecificationNameChange(
                                                index,
                                                e.target.value,
                                              )
                                            }
                                            placeholder="Enter new specification name"
                                            className={isDarkTheme ? "h-12 w-full rounded-2xl border border-white/10 bg-[#151b24] px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-primary-500/40" : "h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-primary-500/40"}
                                          />
                                        )}
                                      </div>
                                      <input
                                        value={spec.value}
                                        onChange={(e) =>
                                          updateSpec(
                                            index,
                                            "value",
                                            e.target.value,
                                          )
                                        }
                                        placeholder="Specification value"
                                        className={isDarkTheme ? "h-12 w-full rounded-2xl border border-white/10 bg-[#151b24] px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-primary-500/40" : "h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-primary-500/40"}
                                      />
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeSpec(index)}
                                    className="w-full xl:w-auto rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300 transition-all hover:bg-red-500/15"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={addSpec}
                            className={`inline-flex items-center gap-2 ${addProductTheme.control} px-4 py-3 text-sm`}
                          >
                            <Plus size={16} />
                            Add Specification
                          </button>
                        </div>
                      </div>
                    </section>

                    <section className={addProductTheme.panel}>
                      <div className="mb-6">
                        <p className={`text-[11px] font-bold uppercase tracking-[0.24em] ${addProductTheme.panelTitle}`}>
                          Description
                        </p>
                        <h4 className={`mt-2 text-2xl font-black tracking-tight ${addProductTheme.panelTitle}`}>
                          Storefront Content
                        </h4>
                      </div>
                      <div className="space-y-4">
                        <label className={`text-[11px] font-bold uppercase tracking-[0.22em] ${addProductTheme.label}`}>
                          Description
                        </label>
                        <textarea
                          rows="5"
                          value={form.description}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              description: e.target.value,
                            }))
                          }
                          required
                          placeholder="Describe the product, performance benefits, and any key selling points."
                          className={isDarkTheme ? "w-full rounded-[1.5rem] border border-white/10 bg-white/[0.04] px-4 py-4 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-primary-500/40" : "w-full rounded-[1.5rem] border border-slate-200 bg-white px-4 py-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-primary-500/40"}
                        />
                      </div>
                    </section>
                  </div>

                  <aside className="space-y-8">
                    <section className={addProductTheme.panel}>
                      <div className="mb-6">
                        <p className={`text-[11px] font-bold uppercase tracking-[0.24em] ${addProductTheme.panelTitle}`}>
                          Product Media
                        </p>
                        <h4 className={`mt-2 text-2xl font-black tracking-tight ${addProductTheme.panelTitle}`}>
                          Image Uploads
                        </h4>
                      </div>

                      <div className="space-y-5">
                        {isEdit &&
                          product?.images?.length > 0 &&
                          !images.length && (
                            <div className="flex flex-wrap gap-4">
                              {product.images.map((img, i) => (
                                <div
                                  key={i}
                                  className={isDarkTheme ? "h-24 w-24 overflow-hidden rounded-2xl border border-white/10 bg-[#151b24] shadow-sm md:h-28 md:w-28" : "h-24 w-24 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm md:h-28 md:w-28"}
                                >
                                  <img
                                    src={getImageUrl(img)}
                                    alt={`Existing ${i + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        <label className={isDarkTheme ? "flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-white/15 bg-white/[0.03] px-6 py-8 text-center transition-all hover:border-primary-500/40 hover:bg-white/[0.05]" : "flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center transition-all hover:border-primary-500/40 hover:bg-slate-100"}>
                          <span className={isDarkTheme ? "mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600/15 text-white" : "mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600/10 text-primary-700"}>
                            <ImagePlus size={24} />
                          </span>
                          <span className={`text-sm font-bold uppercase tracking-[0.16em] ${addProductTheme.panelTitle}`}>
                            Upload Product Images
                          </span>
                          <span className={`mt-2 text-xs leading-6 ${addProductTheme.muted}`}>
                            PNG, JPG or WEBP. Up to 4 images supported by the
                            current uploader.
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={onFiles}
                            className="hidden"
                          />
                        </label>
                        {images.length > 0 && (
                          <p className={`text-xs ${addProductTheme.muted}`}>
                            {images.length} new image(s) selected
                          </p>
                        )}
                        <div className={isDarkTheme ? "rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4" : "rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4"}>
                          <p className={`text-[11px] font-bold uppercase tracking-[0.22em] ${addProductTheme.label}`}>
                            Visibility
                          </p>
                          <label className={`mt-4 flex items-center gap-3 text-sm font-medium ${addProductTheme.panelTitle}`}>
                            <input
                              type="checkbox"
                              checked={form.codAvailable}
                              onChange={(e) =>
                                setForm((p) => ({
                                  ...p,
                                  codAvailable: e.target.checked,
                                }))
                              }
                            />
                            Allow COD for this product
                          </label>
                        </div>
                      </div>
                    </section>

                    <section className={addProductTheme.panel}>
                      <div className="mb-6">
                        <p className={`text-[11px] font-bold uppercase tracking-[0.24em] ${addProductTheme.panelTitle}`}>
                          Action Panel
                        </p>
                        <h4 className={`mt-2 text-2xl font-black tracking-tight ${addProductTheme.panelTitle}`}>
                          Publish Controls
                        </h4>
                      </div>
                      <div className="space-y-4">
                        <button
                          type="submit"
                          disabled={saving}
                          className={`flex w-full items-center justify-center ${addProductTheme.primaryButton}`}
                        >
                          {saving
                            ? "Saving..."
                            : isEdit
                              ? "Update Product"
                              : "Save Product"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setImages([]);
                            setForm(emptyForm);
                            setCategoryOptions(CATEGORY_OPTIONS);
                            setProductNameOptions(PRODUCT_NAME_OPTIONS);
                            setFeatureOptions(FEATURE_OPTIONS);
                            setSpecificationOptionsMap(
                              cloneSpecificationOptionsMap(),
                            );
                            navigate("/admin/manage-products");
                          }}
                          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] dark:text-slate-200 transition-all hover:border-white/20 hover:bg-white/[0.06]"
                        >
                          Cancel
                        </button>
                      </div>
                    </section>
                  </aside>
                </div>
              </form>
            )}

            {!isSeller && (
              <section className="bg-white dark:bg-dark-card rounded-3xl shadow-sm border border-slate-100 dark:border-dark-border overflow-hidden">
                {orders.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-dark-bg rounded-full flex items-center justify-center mb-6 mx-auto text-slate-300">
                      <Package size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                      No orders yet
                    </h3>
                    <p className="text-slate-500 mb-6">
                      Start shopping and your confirmed orders will appear here.
                    </p>
                    <Link to="/shop" className="btn-primary h-12 px-8">
                      Shop Premium Gear
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto" style={customerOrdersScrollStyle}>
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/80 dark:bg-dark-bg/80 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-widest">
                          <th className="px-6 py-5 border-b">Order</th>
                          <th className="px-6 py-5 border-b text-center">
                            Date
                          </th>
                          <th className="px-6 py-5 border-b text-center">
                            Total
                          </th>
                          <th className="px-6 py-5 border-b text-center">
                            Payment
                          </th>
                          <th className="px-6 py-5 border-b text-right">
                            Delivery
                          </th>
                          <th className="px-6 py-5 border-b text-center">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
                        {orders.map((order) => (
                          <tr key={order._id}>
                            <td className="px-6 py-5">
                              <p className="font-bold text-slate-900 dark:text-white">
                                #{order._id.slice(-8).toUpperCase()}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {order.paymentMethod}
                              </p>
                            </td>
                            <td className="px-6 py-5 text-center text-slate-600 dark:text-slate-400">
                              <span className="inline-flex items-center gap-2">
                                <Clock size={14} className="text-slate-400" />
                                {order.createdAt?.substring(0, 10)}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-center font-extrabold text-slate-900 dark:text-white">
                              {formatPrice(order.totalPrice)}
                            </td>
                            <td className="px-6 py-5 text-center">
                              <span
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border inline-flex items-center gap-1.5 ${order.isPaid ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-yellow-50 text-yellow-600 border-yellow-200"}`}
                              >
                                {order.isPaid ? "Paid" : "Pending"}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-right">
                              <span
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border inline-flex items-center gap-1.5 ${order.isCancelled ? "bg-slate-200 text-slate-500 border-slate-300 cursor-not-allowed" : order.isDelivered ? "bg-green-50 text-green-600 border-green-200" : order.isDispatched ? "bg-sky-50 text-sky-600 border-sky-200" : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-dark-bg dark:border-dark-border"}`}
                              >
                                {order.isCancelled ? "Cancelled" : order.isDelivered ? "Delivered" : order.isDispatched ? "Dispatched" : "Pending"}
                              </span>
                            </td>

                            <td className="px-6 py-5 text-center">
                              {order.isPaid && order.isDelivered ? (
                                <button
                                  onClick={() => openProductsModal(order)}
                                  className="px-4 py-2 text-xs rounded-lg bg-red-600 text-white"
                                >
                                  Add Review
                                </button>
                              ) : order.isCancelled ? (
                                order.cancelledBy === 'seller' ? (
                                  <button
                                    onClick={() => onOpenCancelReasonModal(order, true)}
                                    className="px-3 py-2 text-xs rounded-lg bg-slate-700 text-white hover:bg-slate-800"
                                  >
                                    Note
                                  </button>
                                ) : (
                                  <span className="inline-flex px-3 py-2 text-xs rounded-lg bg-slate-300 text-slate-500 cursor-not-allowed font-bold">
                                    Cancelled
                                  </span>
                                )
                              ) : (
                                <button
                                  onClick={() => onCancelOrder(order._id)}
                                  disabled={order.isDispatched || order.isDelivered}
                                  className={`px-3 py-2 text-xs rounded-lg ${
                                    order.isDispatched || order.isDelivered
                                      ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                                      : "bg-red-600 text-white hover:bg-red-700"
                                  }`}
                                >
                                  {order.isDispatched
                                    ? "Dispatched"
                                    : order.isDelivered
                                      ? "Delivered"
                                      : "Cancel"}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}


            <AnimatePresence>
  {showProductsModal && (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white dark:bg-dark-card p-6 rounded-2xl w-full max-w-2xl">

        <h2 className="text-lg font-bold mb-4">Ordered Products</h2>

        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {selectedOrder?.orderItems?.map((item) => (
            <div key={item._id} className="flex justify-between items-center border p-3 rounded-lg">

              {/* Product Info */}
              <div className="flex gap-3 items-center">
                <img src={item.image} className="w-12 h-12 rounded" />
                <div>
                  <p className="font-bold">{item.name}</p>
                  <p className="text-xs text-slate-400">
                    {formatPrice(item.price)}
                  </p>
                </div>
              </div>

              {/* Review Button */}
              <button
                disabled={!(selectedOrder.isPaid && selectedOrder.isDelivered)}
                onClick={() => openReviewModal(item.product)}
                className={`px-3 py-2 text-xs rounded-lg ${
                  selectedOrder.isPaid && selectedOrder.isDelivered
                    ? "bg-primary-600 text-white"
                    : "bg-slate-300 text-slate-500 cursor-not-allowed"
                }`}
              >
                Review
              </button>

            </div>
          ))}
        </div>

        <div className="mt-4 text-right">
          <button
            onClick={() => setShowProductsModal(false)}
            className="px-4 py-2 bg-slate-200 rounded-lg"
          >
            Close
          </button>
        </div>

      </div>
    </motion.div>
  )}
</AnimatePresence>

            <AnimatePresence>
  {showCancelReasonModal && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="w-full max-w-lg rounded-2xl bg-white p-6 dark:bg-dark-card"
      >
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Cancellation Note
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {isCancelReasonReadOnly
            ? 'Reason shared by admin for this cancelled order.'
            : 'Add or update the reason shown for this cancelled order.'}
        </p>

        <textarea
          value={cancelReasonInput}
          onChange={(e) => setCancelReasonInput(e.target.value)}
          readOnly={isCancelReasonReadOnly}
          placeholder={
            isCancelReasonReadOnly
              ? 'No cancellation reason added yet.'
              : 'Write why this order was cancelled...'
          }
          className="mt-4 min-h-[120px] w-full rounded-lg border border-slate-200 p-3 text-sm dark:border-dark-border dark:bg-dark-bg"
        />

        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={() => {
              setShowCancelReasonModal(false);
              setSelectedCancelledOrder(null);
              setCancelReasonInput('');
              setIsCancelReasonReadOnly(false);
            }}
            className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Close
          </button>
          {!isCancelReasonReadOnly && (
            <button
              onClick={onSaveCancelReason}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Save Note
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

            <AnimatePresence>
              {showReviewModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
                >
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.9 }}
                    className="bg-white dark:bg-dark-card rounded-2xl p-6 w-full max-w-md"
                  >
                    <h2 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">
                      Add Review
                    </h2>

                    {/* ⭐ Rating */}
                   <div className="flex gap-2 mb-4 items-center text-yellow-400">
  {[...Array(5)].map((_, i) => (
    <button
      key={i}
      onClick={(e) => handleRatingClick(e, i)}
      className="relative"
      type="button"
    >
      {/* Empty Star */}
      <Star size={24} className="text-gray-500" />

      {/* Fill Star Overlay */}
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

  {/* show value */}
  <span className="ml-2 text-sm text-slate-400">
    {rating.toFixed(1)}
  </span>
</div>

                    {/* Comment */}
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Write your review..."
                      className="w-full border rounded-lg p-3 mb-4 dark:bg-dark-bg"
                    />

                    {/* Buttons */}
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setShowReviewModal(false)}
                        className="px-4 py-2 text-sm bg-slate-200 rounded-lg"
                      >
                        Cancel
                      </button>

                      <button
                        onClick={submitModalReview}
                        className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg"
                      >
                        Submit
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
  {showAddressModal && (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#10151d]/95 p-6 shadow-[0_26px_70px_-42px_rgba(0,0,0,0.95)] backdrop-blur-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-black text-white uppercase tracking-wide">
            Customer Address
          </h3>

          <button
            onClick={() => setShowAddressModal(false)}
            className="text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Address Content */}
        <div className="space-y-3 text-sm text-slate-300">
          <p>
            <span className="text-slate-500">Name:</span>{" "}
            {selectedAddress?.fullName}
          </p>

          <p>
            <span className="text-slate-500">Phone:</span>{" "}
            {selectedAddress?.phone}
          </p>

          <p>
            <span className="text-slate-500">Address:</span>{" "}
            {selectedAddress?.address}
          </p>

          <p>
            <span className="text-slate-500">City:</span>{" "}
            {selectedAddress?.city}
          </p>

          <p>
            <span className="text-slate-500">Postal Code:</span>{" "}
            {selectedAddress?.postalCode}
          </p>

          <p>
            <span className="text-slate-500">Country:</span>{" "}
            {selectedAddress?.country}
          </p>

          <p>
            <span className="text-slate-500">Order Date:</span>{" "}
            {selectedAddress?.orderDate}
          </p>

          
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setShowAddressModal(false)}
            className="rounded-full bg-primary-600 px-5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white shadow-lg shadow-primary-600/30"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
      <ConfirmModal
        open={Boolean(confirmDialog)}
        title={confirmDialog?.title || 'Confirm Action'}
        description={confirmDialog?.description || ''}
        confirmLabel={confirmDialog?.confirmLabel || 'Confirm'}
        cancelLabel={confirmDialog?.cancelLabel || 'Cancel'}
        tone={confirmDialog?.tone || 'danger'}
        loading={false}
        onCancel={closeConfirmDialog}
        onConfirm={handleConfirmDialogConfirm}
      />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
