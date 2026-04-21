import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Shield, Lock, Eye, AlertTriangle, FileText, TrendingUp,
  ChevronDown, ChevronUp, Mail, MapPin, Phone, Scale,
  ShoppingCart, RefreshCw, CreditCard, Truck, Ban,
  UserX, Globe, Gavel, HelpCircle, CheckCircle
} from 'lucide-react';
import { useState } from 'react';
import SEO from '../components/common/SEO';
import { businessInfo } from '../utils/seo';
import { useThemeStore } from '../store/useStore';

const Motion = motion;


const tocSections = [
  { id: "acceptance",         icon: CheckCircle,  title: "Acceptance of Terms"          },
  { id: "eligibility",        icon: UserX,        title: "Eligibility & Account"        },
  { id: "products-orders",    icon: ShoppingCart, title: "Products & Orders"            },
  { id: "pricing-payment",    icon: CreditCard,   title: "Pricing & Payment"            },
  { id: "shipping-delivery",  icon: Truck,        title: "Account & Disputes"           },
  { id: "returns-refunds",    icon: RefreshCw,    title: "Terms Updates"                },
  { id: "prohibited",         icon: Ban,          title: "Contact & Support"            },
  { id: "contact-terms",      icon: Mail,         title: "Contact Us"                   },
];

const sections = [
  {
    id: "acceptance",
    icon: CheckCircle,
    title: "General Terms",
    content: [
      {
        subtitle: "What are the terms for using this website?",
        text: "By using this website, you agree to our Terms of Service. If you do not agree, please stop using the website.",
      },
    ],
  },
  {
    id: "eligibility",
    icon: UserX,
    title: "Orders & Delivery",
    content: [
      {
        subtitle: "Can I cancel my order after placing it?",
        text: "You may request a cancellation via WhatsApp or email before the order is dispatched. Cancellations are not possible once the order has been dispatched or shipped.",
      },
      {
        subtitle: "How long does delivery take?",
        text: "Delivery locally takes 60 Minutes. Remote(outstation) areas may take a little longer 2 to 3 working days. Tracking updates will be shared via WhatsApp.",
      },
    ],
  },
  {
    id: "products-orders",
    icon: ShoppingCart,
    title: "Pricing & Product Care",
    content: [
      {
        subtitle: "Can prices change?",
        text: "Yes, prices may change based on market conditions. The final price at the time of order confirmation will apply.",
      },
      {
        subtitle: "What should I do if I receive a damaged product?",
        text: "Report the issue with photos via WhatsApp within 6 hours of delivery. We will arrange a replacement or refund accordingly.",
      },
    ],
  },
  {
    id: "pricing-payment",
    icon: CreditCard,
    title: "Website Use & Content",
    content: [
      {
        subtitle: "Is copying website content allowed?",
        text: "No. Any content on this website, including images, text, and logo, may not be copied or reused without prior written permission.",
      },
      {
        subtitle: "Are third-party links on the website safe?",
        text: "We are not responsible for the content of any third-party websites linked from our site. Please browse external links with caution.",
      },
    ],
  },
  {
    id: "shipping-delivery",
    icon: Truck,
    title: "Account & Disputes",
    content: [
      {
        subtitle: "Do I need an account to shop?",
        text: "No account is required for browsing. However, creating an account is recommended for order tracking and purchase history.",
      },
      {
        subtitle: "How are disputes resolved?",
        text: "All disputes will first be addressed through our customer support team. Legal matters, if any, will be handled under the laws of Pakistan.",
      },
    ],
  },
  {
    id: "returns-refunds",
    icon: RefreshCw,
    title: "Terms Updates",
    content: [
      {
        subtitle: "Can the Terms of Service change?",
        text: "Yes, we reserve the right to update our terms at any time. The latest version will always be available on our website.",
      },
    ],
  },
  {
    id: "prohibited",
    icon: Ban,
    title: "Contact & Support",
    content: [
      {
        subtitle: "How can I contact customer support?",
        text: "You can contact us by email at sportsworldccw@gmail.com or on WhatsApp at +92 322 4841625. We are available from 8 AM to 10 PM daily.",
      },
    ],
  },
];

/* ─── Section component ───────────────────────────────────── */
const TermsSection = ({ section, index, open, onToggle, isLightTheme }) => {
  const cardClass = isLightTheme
    ? 'rounded-[2rem] border border-slate-200 bg-white overflow-hidden shadow-[0_24px_70px_-42px_rgba(15,23,42,0.12)]'
    : 'rounded-[2rem] border border-white/10 bg-[#11151d] overflow-hidden';
  const headerTextClass = isLightTheme ? 'text-slate-900' : 'text-white';
  const bodyBorderClass = isLightTheme ? 'border-t border-slate-200' : 'border-t border-white/8';
  const subtitleClass = isLightTheme ? 'text-primary-700' : 'text-primary-300';
  const answerClass = isLightTheme ? 'text-sm leading-7 text-slate-600 min-[320px]:max-[430px]:leading-[20px] text-justify' : 'text-sm leading-7 text-slate-400 min-[320px]:max-[430px]:leading-[20px] text-justify';
  const contactCardClass = isLightTheme
    ? 'rounded-2xl border border-slate-200 bg-slate-50 p-4'
    : 'rounded-2xl border border-white/10 bg-white/[0.04] p-4';
  const contactValueClass = isLightTheme ? 'text-sm text-slate-600' : 'text-sm text-slate-400';

  return (
    <motion.div
      id={section.id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06 }}
      className={cardClass}
    >
      {/* Section header */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-8 py-6 text-left"
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${isLightTheme ? 'bg-primary-50 text-primary-600' : 'bg-primary-500/12 text-white'}`}>
            <section.icon size={18} className={isLightTheme ? 'text-primary-600' : 'text-white'} />
          </div>
          <h2 className={`text-lg font-black uppercase tracking-tight ${headerTextClass} min-[320px]:max-[430px]:text-[16px] min-[320px]:max-[430px]:leading-[24px]`}>{section.title}</h2>
        </div>
        <span className={`shrink-0 rounded-full p-1.5 transition-colors ${open ? (isLightTheme ? 'bg-primary-500/15 text-primary-600' : 'bg-primary-500/20 text-slate-300') : (isLightTheme ? 'bg-slate-100 text-slate-500' : 'bg-white/[0.06] text-slate-400')}`}>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {/* Section body */}
      {open && (
        <div className={`px-8 pb-8 ${bodyBorderClass}`}>
          <div className="space-y-6 pt-6">
            {section.content.map((block, i) => (
              <div key={i}>
                <h3 className={`text-sm font-black uppercase tracking-[0.16em] mb-2 ${subtitleClass}`}>
                  {block.subtitle}
                </h3>
                <p className={answerClass}>{block.text}</p>
              </div>
            ))}

            {/* Contact block inside last section */}
            {section.isContact && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { icon: Mail,   label: "Email",   value: "sportsworldccw@gmail.com",            href: "mailto:sportsworldccw@gmail.com" },
                  { icon: Phone,  label: "Phone",   value: "+92 300 000 0000",                  href: "tel:+92300000000" },
                  { icon: MapPin, label: "Address", value: "College Road, Chichawatni, Punjab", href: null },
                ].map((item, i) => (
                  <div key={i} className={contactCardClass}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isLightTheme ? 'bg-primary-50' : 'bg-primary-500/12'}`}>
                        <item.icon size={14} className={isLightTheme ? 'text-primary-600' : 'text-primary-400'} />
                      </div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
                    </div>
                    {item.href
                      ? <a href={item.href} className={`text-sm transition-colors font-medium ${isLightTheme ? 'text-primary-600 hover:text-primary-500' : 'text-primary-400 hover:text-primary-300'}`}>{item.value}</a>
                      : <p className={contactValueClass}>{item.value}</p>
                    }
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

/* ─── main component ──────────────────────────────────────── */
const TermsOfServices = () => {
  const [activeSectionId, setActiveSectionId] = useState(sections[0]?.id ?? null);
  const { theme } = useThemeStore();
  const isLightTheme = theme !== 'dark';

  const getLastUpdated = () => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toLocaleDateString("en-US", { 
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const lastUpdated = getLastUpdated();

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openSectionAndScroll = (id) => {
    setActiveSectionId(id);
    window.requestAnimationFrame(() => scrollTo(id));
  };

  return (
    <div className="min-h-screen pb-24">
      <SEO
        title="Terms of Service | Sports World Chichawatni"
        description="Read the Terms of Service for Sports World Chichawatni covering website use, orders, delivery, pricing, product care, dispute handling, and content rights."
        canonicalPath="/terms"
        keywords={businessInfo.keywords}
      />

    
      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <div className="container-bound pt-8">
        <div className="relative mb-10 overflow-hidden rounded-[2.25rem] border border-white/10 bg-[#0c1017] px-5 py-14 shadow-[0_28px_80px_-40px_rgba(0,0,0,0.9)] sm:px-6 sm:py-16 md:px-10 md:py-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(220,38,38,0.18),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_24%)]" />
          <div className="absolute inset-0 opacity-15">
            <img
              src="https://res.cloudinary.com/da8lxpc3h/image/upload/v1776738944/hero-bg_g8kry5.avif"
              alt="backdrop"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-bold uppercase tracking-[0.26em] text-white backdrop-blur-xl"
            >
              <Scale size={13} />Fair & Transparent
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="mb-4 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl md:mb-5 md:text-6xl"
            >
              Terms of <span className="text-primary-500">Service</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
              className="mx-auto mb-8 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8 min-[320px]:max-[430px]:leading-[22px]"
            >
              These terms govern your use of the Sports World website and services. We've written them clearly so you understand exactly what to expect when shopping with us in Chichawatni and across Pakistan.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-300"
            >
              <FileText size={12} />Last Updated: {lastUpdated}
            </motion.div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          TRUST STATS BAR
      ══════════════════════════════════════════ */}
      <div className="container-bound mb-10">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {[
            { icon: Shield,    value: "100%",    label: "Authentic Products"     },
            { icon: RefreshCw, value: "7-Day",   label: "Return Window"          },
            { icon: Truck,     value: "24hr",    label: "Local Dispatch"         },
            { icon: Lock,      value: "Secure",  label: "Payments Protected"     },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-white dark:bg-slate-800/60 p-5 group hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-primary-600/10 rounded-full opacity-60 group-hover:scale-150 transition-transform duration-500" />
              <s.icon size={18} className="text-primary-400 mb-2 relative z-10" />
              <p className="text-2xl font-black relative z-10">{s.value}</p>
              <p className="text-xs font-semibold text-slate-400 relative z-10">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          MAIN LAYOUT: TOC + CONTENT
      ══════════════════════════════════════════ */}
      <div className="container-bound">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">

          {/* ── Sticky Table of Contents ── */}
          <div className="hidden shrink-0 lg:block lg:w-72">
            <div className="rounded-[2rem] border border-white/10 bg-[#11151d] p-6 shadow-[0_24px_70px_-38px_rgba(0,0,0,0.9)] lg:sticky lg:top-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-xl bg-primary-500/12 flex items-center justify-center text-white">
                  <FileText size={14} className="text-white" />
                </div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-white">Contents</p>
              </div>
              <ul className="space-y-1">
                {tocSections.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => openSectionAndScroll(s.id)}
                      className="flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-left text-xs font-medium text-slate-400 transition-all hover:border-white/10 hover:bg-white/[0.04] hover:text-white"
                    >
                      <s.icon size={13} className="text-primary-500 shrink-0" />
                      {s.title}
                    </button>
                  </li>
                ))}
              </ul>

              {/* Important notice */}
              <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/8 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={13} className="text-amber-400" />
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-400">Important</p>
                </div>
                <p className="text-xs leading-5 text-slate-400">By placing an order or using our website, you agree to these Terms of Service in full.</p>
              </div>

              {/* Quick links */}
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <HelpCircle size={13} className="text-slate-400" />
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-white">Quick Links</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Link
                    to="/privacy"
                    className="text-xs text-white hover:text-white transition-colors font-medium"
                  >
                    → Privacy Policy
                  </Link>
                  <Link
                    to="/contact"
                    className="text-xs text-white hover:text-white transition-colors font-medium"
                  >
                    → Contact Support
                  </Link>
                  <Link
                    to="/shop"
                    className="text-xs text-white hover:text-white transition-colors font-medium"
                  >
                    → Browse Products
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* ── Terms Sections ── */}
          <div className="flex-1 space-y-4">
            {sections.map((section, i) => (
              <TermsSection
                key={section.id}
                section={section}
                index={i}
                open={activeSectionId === section.id}
                isLightTheme={isLightTheme}
                onToggle={() =>
                  setActiveSectionId((current) =>
                    current === section.id ? null : section.id
                  )
                }
              />
            ))}
          </div>

        </div>
      </div>

      {/* ══════════════════════════════════════════
          BOTTOM CTA
      ══════════════════════════════════════════ */}
      <div className="container-bound mt-16">
        <div className="relative overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900 p-8 text-center sm:p-10 lg:p-16">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:40px_40px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-600/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10 max-w-xl mx-auto">
            <div className="mb-4 inline-flex text-white items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary-300">
              <TrendingUp size={12} />Ready to Shop?
            </div>
            <h2 className="text-3xl font-black text-white md:text-4xl mb-4 min-[320px]:max-[430px]:text-[26px] min-[320px]:max-[430px]:leading-[32px]">
              Shop with confidence.
            </h2>
            <p className="text-slate-400 mb-8 leading-relaxed min-[320px]:max-[420px]:hidden">
              Our terms are designed to protect you. Browse our full collection of authentic cricket, football, and fitness gear — delivered fast to Chichawatni and across Pakistan.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/shop"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-primary-600 px-8 text-base font-black uppercase tracking-[0.12em] text-white transition-all hover:bg-primary-500 shadow-xl shadow-primary-600/30"
              >
                Explore The Collection
              </Link>
              <Link
                to="/contact"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.04] px-8 text-base font-bold text-white transition-all hover:bg-white/10"
              >
                <Mail size={18} />Have Questions?
              </Link>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default TermsOfServices;