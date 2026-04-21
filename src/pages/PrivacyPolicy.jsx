import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Shield, Lock, Eye, Database, UserCheck, Bell, HelpCircle,
  Cookie, Mail, MapPin, Phone, FileText, TrendingUp,
  ChevronDown, ChevronUp, AlertTriangle
} from 'lucide-react';
import { useState } from 'react';
import SEO from '../components/common/SEO';
import { businessInfo } from '../utils/seo';
import { useThemeStore } from '../store/useStore';

const Motion = motion;


const tocSections = [
  { id: "information-we-collect",  icon: Database,   title: "What Data We Collect"         },
  { id: "how-we-use",              icon: Eye,        title: "How We Use Data"              },
  { id: "data-sharing",            icon: UserCheck,  title: "Sharing With Third Parties"   },
  { id: "data-security",           icon: Lock,       title: "Security & Payments"          },
  { id: "cookies",                 icon: Cookie,     title: "Cookies & Retention"          },
  { id: "your-rights",             icon: Shield,     title: "Your Rights"                  },
  { id: "local-delivery",          icon: MapPin,     title: "Children & Policy Updates"    },
  { id: "notifications",           icon: Bell,       title: "Contact for Privacy"          },
];

const sections = [
  {
    id: "information-we-collect",
    icon: Database,
    title: "Information We Collect",
    content: [
      {
        subtitle: "What data do you collect?",
        text: "We collect your name, phone number, email address, delivery address, and order details only what is necessary to provide our service.",
      },
      {
        subtitle: "Order & Transaction Data",
        text: "We maintain records of your purchases, order history, product preferences, and any returns or exchanges you initiate. This helps us provide accurate order tracking, resolve disputes, and improve our product catalog.",
      },
      
    ],
  },
  {
    id: "how-we-use",
    icon: Eye,
    title: "How We Use Your Information",
    content: [
      {
        subtitle: "How is my data used?",
        text: "Your data is used solely for order processing, delivery, customer support, and promotional offers from Sports World Chichawatni.",
      },
      {
        subtitle: "Customer Support",
        text: "We use your contact information to respond to queries, resolve order issues, process returns, and provide sizing or product guidance. Our support team only accesses the minimum data required to assist you.",
      },
      {
        subtitle: "Service Improvement",
        text: "Aggregated and anonymized usage data helps us understand which products are most popular, how customers navigate our website, and where we can improve the overall shopping experience. No individual user is identified in this analysis.",
      },
    ],
  },
  {
    id: "data-sharing",
    icon: UserCheck,
    title: "Data Sharing & Disclosure",
    content: [
      {
        subtitle: "Is my information shared with third parties?",
        text: "Only the necessary information is shared with courier companies for delivery purposes. We do not sell your data to anyone.",
      },
      {
        subtitle: "Delivery Partners",
        text: "For orders outside our direct delivery zone in Chichawatni, we may share your name, phone number, and delivery address with a trusted courier partner solely for the purpose of completing your delivery. These partners are contractually bound to protect your information.",
      },
      {
        subtitle: "Legal Requirements",
        text: "We may disclose your data if required to do so by Pakistani law, a court order, or governmental authority. We will always attempt to notify you of such a requirement unless prohibited by law.",
      },
    ],
  },
  {
    id: "data-security",
    icon: Lock,
    title: "Security & Payment",
    content: [
      {
        subtitle: "Does the website use cookies?",
        text: "Yes, we use basic cookies to improve website performance and enhance user experience.",
      },
      {
        subtitle: "Is my payment information secure?",
        text: "We do not store any payment card details. All transactions are processed through secure channels.",
      },
      {
        subtitle: "How long is my data retained?",
        text: "Your data is retained for as long as your account remains active or as required by applicable legal obligations.",
      },
    ],
  },
  {
    id: "cookies",
    icon: Cookie,
    title: "Cookies & Retention",
    content: [
      {
        subtitle: "Can I request deletion of my data?",
        text: "Yes, email us at sportsworldccw@gmail.com to submit a data deletion request. We will process it promptly.",
      },
      {
        subtitle: "Does the website use cookies?",
        text: "Yes, we use basic cookies to improve website performance and enhance user experience.",
      },
      {
        subtitle: "How will I know if the Privacy Policy changes?",
        text: "A notice will be posted on the website when the policy is updated.",
      },
    ],
  },
  {
    id: "your-rights",
    icon: Shield,
    title: "Your Rights",
    content: [
      {
        subtitle: "How is my data used?",
        text: "Your data is used solely for order processing, delivery, customer support, and promotional offers from Sports World Chichawatni.",
      },
      {
        subtitle: "Can I request deletion of my data?",
        text: "Yes, email us at sportsworldccw@gmail.com to submit a data deletion request. We will process it promptly.",
      },
      {
        subtitle: "Who can I contact for privacy concerns?",
        text: "Reach us at sportsworldccw@gmail.com or WhatsApp +92 322 4841625. We will respond within 24 hours.",
      },
      {
        subtitle: "How is children's privacy protected?",
        text: "We do not knowingly collect data from children under the age of 13. If such data is identified, please contact us for immediate removal.",
      },
    ],
  },
  {
    id: "local-delivery",
    icon: MapPin,
    title: "Children & Policy Updates",
    content: [
      {
        subtitle: "How is children's privacy protected?",
        text: "We do not knowingly collect data from children under the age of 13. If such data is identified, please contact us for immediate removal.",
      },
      {
        subtitle: "How will I know if the Privacy Policy changes?",
        text: "A notice will be posted on the website when the policy is updated.",
      },
    ],
  },
  {
    id: "notifications",
    icon: Bell,
    title: "Contact for Privacy Matters",
    content: [
      {
        subtitle: "Who can I contact for privacy concerns?",
        text: "Reach us at sportsworldccw@gmail.com or WhatsApp +92 322 4841625. We will respond within 24 hours.",
      },
    ],
  },
];

/* ─── Section component ───────────────────────────────────── */
const PolicySection = ({ section, index, open, onToggle, isLightTheme }) => {
  const cardClass = isLightTheme
    ? 'rounded-[2rem] border border-slate-200 bg-white overflow-hidden shadow-[0_24px_70px_-42px_rgba(15,23,42,0.12)]'
    : 'rounded-[2rem] border border-white/10 bg-[#11151d] overflow-hidden';
  const headerTextClass = isLightTheme ? 'text-slate-900' : 'text-white';
  const subtitleClass = isLightTheme ? 'text-primary-700' : 'text-primary-300';
  const bodyClass = isLightTheme ? 'border-t border-slate-200' : 'border-t border-white/8';
  const answerClass = isLightTheme ? 'text-sm leading-7 text-slate-600 min-[320px]:max-[430px]:leading-[20px] text-justify' : 'text-justify text-sm leading-7 text-slate-400 min-[320px]:max-[430px]:leading-[20px]';
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
          <h2 className={`text-lg font-black uppercase tracking-tight ${headerTextClass} min-[320px]:max-[430px]:text-[16px] min-[320px]:max-[430px]:leading-[22px]`}>{section.title}</h2>
        </div>
        <span className={`shrink-0 rounded-full p-1.5 transition-colors ${open ? (isLightTheme ? 'bg-primary-500/15 text-primary-600' : 'bg-primary-500/20 text-slate-300') : (isLightTheme ? 'bg-slate-100 text-slate-500' : 'bg-white/[0.06] text-slate-400')}`}>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {/* Section body */}
      {open && (
        <div className={`px-8 pb-8 ${bodyClass}`}>
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
                  { icon: Mail,    label: "Email",    value: "sportsworldccw@gmail.com",   href: "mailto:sportsworldccw@gmail.com" },
                  { icon: Phone,   label: "Phone",    value: "+92 300 000 0000",         href: "tel:+92300000000" },
                  { icon: MapPin,  label: "Address",  value: "College Road, Chichawatni, Punjab", href: null },
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
const PrivacyPolicy = () => {
const [activeSectionId, setActiveSectionId] = useState(sections[0]?.id || null);
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
//   const lastUpdated = "January 1, 2026";

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openSectionAndScroll = (id) => {
    setActiveSectionId(id);
    window.requestAnimationFrame(() => scrollTo(id));
  };

  return (
    <div className="min-h-screen  pb-24">
      <SEO
        title="Privacy Policy | Sports World Chichawatni"
        description="Learn how Sports World Chichawatni collects, uses, stores, and protects your data, including order details, delivery information, cookies, and privacy requests."
        canonicalPath="/privacy"
        keywords={businessInfo.keywords}
      />

      {/* ══════════════════════════════════════════
          HERO
          ══════════════════════════════════════════ */}
      <div className="container-bound pt-8">
        <div className="relative mb-10 overflow-hidden rounded-[2.25rem] border border-white/10 bg-[#0c1017] px-5 py-14 shadow-[0_28px_80px_-40px_rgba(0,0,0,0.9)] sm:px-6 sm:py-16 md:px-10 md:py-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(220,38,38,0.18),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_24%)]" />
          <div className="absolute inset-0 opacity-10">
            <img src="https://res.cloudinary.com/da8lxpc3h/image/upload/v1776738944/hero-bg_g8kry5.avif" alt="backdrop" className="h-full w-full object-cover" loading="lazy" decoding="async" />
          </div>
          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
              className="mb-5 inline-flex items-center gap-2 text-white rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-bold uppercase tracking-[0.26em] text-primary-300 backdrop-blur-xl"
            >
              <Shield size={13} />Your Privacy Matters
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="mb-4 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl md:mb-5 md:text-6xl"
            >
              Privacy <span className="text-primary-500">Policy</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
              className="mx-auto mb-8 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8 min-[320px]:max-[430px]:leading-[22px]"
            >
              We are committed to protecting your personal data. This policy explains how Sports World collects, uses, and safeguards your information — especially for our customers in Chichawatni and across Pakistan.
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
            { icon: Lock,      value: "100%",    label: "Data Encrypted"      },
            { icon: Shield,    value: "Zero",    label: "Data Sold"           },
            { icon: UserCheck, value: "GDPR",    label: "Compliant Practices" },
            { icon: MapPin,    value: "Local",   label: "Chichawatni First"   },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-white dark:bg-slate-800/60 p-5 group hover:-translate-y-1 transition-transform duration-300">
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
            <div className="rounded-[2rem] border border-white/10 bg-[#11151d] p-6 shadow-[0_24px_70px_-38px_rgba(0,0,0,0.9)] lg:sticky lg:top-6 dark:bg-slate-800/60">
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
                <p className="text-xs leading-5 text-slate-400">By using our website or placing an order, you agree to the terms of this Privacy Policy.</p>
              </div>

              {/* Quick links */}
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="mb-3 flex items-center gap-2">
                  <HelpCircle size={13} className="text-slate-400" />
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-white">Quick Links</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Link to="/terms" className="text-xs font-medium text-white transition-colors hover:text-white">
                    → Terms of Service
                  </Link>
                  <Link to="/shop" className="text-xs font-medium text-white transition-colors hover:text-white">
                    → Browse Products
                  </Link>
                  <Link to="/contact" className="text-xs font-medium text-white transition-colors hover:text-white">
                    → Contact Support
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* ── Policy Sections ── */}
          <div className="flex-1 space-y-4">
            {sections.map((section, i) => (
              <PolicySection
                key={section.id}
                section={section}
                index={i}
                open={activeSectionId === section.id}
                isLightTheme={isLightTheme}
                onToggle={() => setActiveSectionId(prev => (prev === section.id ? null : section.id))}
              />
            ))}
          </div>

        </div>
      </div>

      {/* ══════════════════════════════════════════
          BOTTOM CTA  (matches About page)
      ══════════════════════════════════════════ */}
      <div className="container-bound mt-16">
        <div className="relative overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900 p-8 text-center sm:p-10 lg:p-16">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:40px_40px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-600/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10 max-w-xl mx-auto">
            <div className="mb-4 inline-flex items-center text-white gap-2 rounded-full border border-primary-500/30 bg-primary-500/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary-300">
              <TrendingUp size={12} />Ready to Shop?
            </div>
            <h2 className="text-3xl font-black text-white md:text-4xl mb-4 min-[320px]:max-[430px]:text-[26px] min-[320px]:max-[430px]:leading-[32px]">
              Ready to upgrade your game?
            </h2>
            <p className="text-slate-400 mb-8 leading-relaxed min-[320px]:max-[420px]:hidden">
              Your data is safe with us. Browse our full premium collection and experience the difference that professional-grade equipment makes on the field.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/shop"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-primary-600 px-8 text-base font-black uppercase tracking-[0.12em] text-white transition-all hover:bg-primary-500 shadow-xl shadow-primary-600/30">
                Explore The Collection
              </Link>
              <Link to="/contact"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.04] px-8 text-base font-bold text-white transition-all hover:bg-white/10">
                <Mail size={18} />Privacy Questions?
              </Link>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default PrivacyPolicy;