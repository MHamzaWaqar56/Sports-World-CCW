
import { MapPin, Phone, Mail, Clock, Send, ChevronDown,
         Trophy, Star, Zap, ShieldCheck, MessageCircle,
         Instagram, Facebook, Youtube, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from "react";
import { useContactStore } from '../store/useContactStore';
import SEO from '../components/common/SEO';
import { businessInfo, localBusinessSchema, organizationSchema } from '../utils/seo';

const Motion = motion;


const contactStats = [
  { icon: MessageCircle, value: "< 2hrs",  label: "Avg Response Time" },
  { icon: Star,          value: "4.9★",    label: "Customer Rating"   },
  { icon: ShieldCheck,   value: "100%",    label: "Issue Resolution"  },
  { icon: Trophy,        value: "10K+",    label: "Happy Athletes"    },
];

const faqs = [
  {
    q: "Where is Sports World Chichawatni located?",
    a: "Our store is located on College Road, Chichawatni, District Sahiwal, Punjab, Pakistan. You can also find us on Google Maps.",
  },
  {
    q: "What are your store opening hours?",
    a: "Our store is open every day, Monday to Sunday, from 8:00 AM to 10:00 PM.",
  },
  {
    q: "Do you offer online delivery?",
    a: "Yes, we deliver all across Pakistan. Local delivery in Chichawatni usually takes around 60 minutes, while outstation orders through courier partners like TCS, Leopards, or M&P usually take 2 to 3 working days.",
  },
  {
    q: "What types of sports equipment do you sell?",
    a: "We carry cricket, football, hockey, footwear, sleeves, tennis, basketball, kabaddi, indoor games, outdoor games, and all kinds of sports accessories.",
  },
  {
    q: "Can I return or exchange a product?",
    a: "Yes, returns and exchanges are accepted within 7 days of delivery for defective or incorrect items, provided the product is in its original condition.",
  },
  {
    q: "Who can I contact for privacy or support concerns?",
    a: "Reach us at sportsworldccw@gmail.com or on WhatsApp at +92 322 4841625. For privacy requests, you can also email us at sportsworldccw@gmail.com and we will respond promptly.",
  },
];

/* ─── FAQ accordion item ──────────────────────────────────── */
const FaqItem = ({ faq, index, open, onToggle }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.07 }}
      className="bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 rounded-2xl overflow-hidden"
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 text-left"
      >
        <span className="font-semibold text-slate-900 dark:text-white">
          {faq.q}
        </span>
        <motion.div animate={{ rotate: open ? 180 : 0 }}>
          <ChevronDown className="text-slate-400" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="px-6 pb-6 text-slate-500 dark:text-slate-400 text-sm"
          >
            {faq.a}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ─── main component ──────────────────────────────────────── */
const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "",
    phone: "", subject: "General Inquiry", message: "",
  });
  const [activeFaqIndex, setActiveFaqIndex] = useState(null);

  const { sendMessage, loading, success, error } = useContactStore();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isSent = await sendMessage(formData);
    if (isSent) {
      setFormData({ firstName: "", lastName: "", email: "", phone: "", subject: "General Inquiry", message: "" });
    }
  };

  return (
    <div className="min-h-screen  pb-24">
      <SEO
        title="Contact Sports World Chichawatni | College Road, Chichawatni"
        description="Contact Sports World Chichawatni for wholesale sports equipment, retail orders, custom team gear, and customer support at College Road, Chichawatni."
        canonicalPath="/contact"
        keywords={businessInfo.keywords}
        structuredData={[organizationSchema(), localBusinessSchema()]}
      />

      {/* ══════════════════════════════════════════
                    HERO BANNER
       ══════════════════════════════════════════ */}
      <div className="container-bound pt-8">
        <div className="relative mb-10 overflow-hidden rounded-[2.25rem] border border-white/10 bg-[#0c1017] px-5 py-16 shadow-[0_28px_80px_-40px_rgba(0,0,0,0.9)] sm:px-6 sm:py-20 md:px-10 md:py-24">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(220,38,38,0.18),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_24%)]" />
          <div className="absolute inset-0 opacity-15">
            <img src="https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80" alt="backdrop" className="h-full w-full object-cover" loading="lazy" decoding="async" />
          </div>
          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
              className="mb-5 inline-flex text-white items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-bold uppercase tracking-[0.26em] text-primary-300 backdrop-blur-xl"
            >
              <MessageCircle size={13} />We're Here to Help
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="mb-4 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl md:mb-5 md:text-6xl"
            >
              Get in <span className="text-primary-500">Touch</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
              className="mx-auto max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8"
            >
              Whether you have a question about premium gear, need sizing guidance, or want to discuss bulk team orders — our experts are ready to assist you.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-slate-400 max-[767px]:hidden"
            >
              {["24hr Response Guarantee", "Expert Gear Advice", "Bulk Order Support"].map((t, i) => (
                <span key={i} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2">
                  <span className="h-2 w-2 rounded-full bg-primary-500" />{t}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          TRUST STATS BAR  (matches About page)
      ══════════════════════════════════════════ */}
      <div className="container-bound mb-10 ">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {contactStats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="relative overflow-hidden bg-white dark:bg-slate-800/60 rounded-2xl border border-white/10  p-5 group hover:-translate-y-1 transition-transform duration-300">
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-primary-600/10 rounded-full opacity-60 group-hover:scale-150 transition-transform duration-500" />
              <s.icon size={18} className="text-primary-400 mb-2 relative z-10" />
              <p className="text-2xl font-black  relative z-10">{s.value}</p>
              <p className="text-xs font-semibold text-slate-400 relative z-10">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          CONTACT INFO + FORM
      ══════════════════════════════════════════ */}
      <div className="container-bound mb-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">

          {/* ── LEFT: Contact Info ── */}
          <div className="space-y-6 lg:col-span-5">

            {/* Info Card */}
            <motion.div
              initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
              className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0c1017] p-6 shadow-[0_28px_80px_-40px_rgba(0,0,0,0.9)] sm:p-8 md:p-10"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/15 rounded-full blur-[80px] pointer-events-none" />

              <h3 className="text-xl font-black uppercase tracking-tight text-white mb-8 relative z-10">Contact Information</h3>

              <div className="space-y-7 relative z-10">
                {/* Address */}
                <div className="flex items-start gap-5">
                  <div className="w-11 text-white h-11 rounded-2xl bg-primary-500/12 flex items-center justify-center shrink-0">
                    <MapPin className="text-primary-400" size={20} />
                  </div>
                  <div>
                    <h4 className="font-black text-white text-sm uppercase tracking-[0.16em] mb-1">Headquarters</h4>
                    <p className="text-slate-400 text-sm leading-6">Sports World<br />College Road, Chichawatni<br />Punjab, Pakistan — 57200</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-5">
                  <div className="w-11 text-white h-11 rounded-2xl bg-primary-500/12 flex items-center justify-center shrink-0">
                    <Phone className="text-primary-400" size={20} />
                  </div>
                  <div>
                    <h4 className="font-black text-white text-sm uppercase tracking-[0.16em] mb-1">Phone</h4>
                    <p className="text-slate-400 text-sm mb-3">+92 322 484 1625</p>
                    <a href="tel:+923224841625"
                      className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-green-500">
                      <Phone size={13} />Call Now
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-5">
                  <div className="w-11 text-white h-11 rounded-2xl bg-primary-500/12 flex items-center justify-center shrink-0">
                    <Mail className="text-primary-400" size={20} />
                  </div>
                  <div>
                    <h4 className="font-black text-white text-sm uppercase tracking-[0.16em] mb-1">Email</h4>
                    <div className="flex flex-col gap-1 text-sm text-slate-400">
                      <a href="mailto:sportsworldccw@gmail.com" className="hover:text-primary-400 transition-colors">sportsworldccw@gmail.com</a>
                    </div>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-start gap-5">
                  <div className="w-11 text-white h-11 rounded-2xl bg-primary-500/12 flex items-center justify-center shrink-0">
                    <Clock className="text-primary-400" size={20} />
                  </div>
                  <div>
                    <h4 className="font-black text-white text-sm uppercase tracking-[0.16em] mb-1">Working Hours</h4>
                    <div className="flex flex-col gap-1 text-sm text-slate-400">
                      <span>Mon – Thu, Sat – Sun: 10 AM – 8 PM</span>
                      <span className="text-amber-400/80">Friday: Holiday (On-call available)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social buttons */}
              <div className="mt-8 relative z-10">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-3">Connect With Us</p>
                <div className="flex flex-wrap gap-3">
                  <a href="https://wa.me/923224841625" target="_blank"
                    className="inline-flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-600/10 px-4 py-2.5 text-xs font-bold text-green-400 transition-all hover:bg-green-600/20">
                    <MessageCircle size={14} />WhatsApp
                  </a>
                  <a href="https://instagram.com/sportsworldccw" target="_blank"
                    className="inline-flex items-center gap-2 rounded-xl border border-pink-500/30 bg-pink-500/10 px-4 py-2.5 text-xs font-bold text-pink-400 transition-all hover:bg-pink-500/20">
                    <Instagram size={14} />Instagram
                  </a>
                  <a href="https://facebook.com/sportsworldccw" target="_blank"
                    className="inline-flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2.5 text-xs font-bold text-blue-400 transition-all hover:bg-blue-500/20">
                    <Facebook size={14} />Facebook
                  </a>
                </div>

                <div className="mt-6 -mx-8 md:-mx-10 -mb-8 md:-mb-10 overflow-hidden border-t border-white/10">
                  <div className="bg-[#0c1017] px-5 py-3.5 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-primary-500/12 flex items-center justify-center">
                        <MapPin size={15} className="text-primary-400" />
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-white">Our Location</p>
                        <p className="text-xs text-slate-500">College Road, Chichawatni</p>
                      </div>
                    </div>
                  </div>
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3436.694516137323!2d72.69352077465273!3d30.52967609541949!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39232b004976efb1%3A0x5bc52194ca2885a4!2sSports%20World%20Chichawatni!5e0!3m2!1sen!2s!4v1776170491330!5m2!1sen!2s"
                    width="100%" height="250"
                    style={{ border: 0, display: 'block' }}
                    loading="lazy"
                  />
                </div>
              </div>
            </motion.div>

          </div>

          {/* ── RIGHT: Contact Form ── */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
              className="relative overflow-hidden rounded-[2rem] border border-white/10 p-6 shadow-[0_28px_80px_-40px_rgba(0,0,0,0.9)] sm:p-8 md:p-10"
            >
              <div className="absolute top-0 left-0 w-72 h-72 bg-primary-600/8 rounded-full blur-[100px] pointer-events-none" />

              <div className="relative z-10 mb-8">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-primary-300">
                  <Send size={11} />Send a Message
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight ">We'll reply within 2 hours</h3>
                <p className="mt-2 text-sm text-slate-400">Fill out the form and our team will get back to you promptly.</p>
              </div>

              <form className="relative z-10 space-y-5" onSubmit={handleSubmit}>
                {/* Name row */}
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-[0.2em]  mb-2">First Name</label>
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name"
                      className="input-premium h-12 w-full bg-white/[0.05] placeholder:text-slate-600 focus:border-primary-600 focus:ring-primary-600/20" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-2">Last Name</label>
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name"
                      className="input-premium h-12 w-full bg-white/[0.05] placeholder:text-slate-600 focus:border-primary-600 focus:ring-primary-600/20" />
                  </div>
                </div>

                {/* Email + Phone row */}
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-2">Email Address</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Your Email"
                      className="input-premium h-12 w-full bg-white/[0.05] placeholder:text-slate-600 focus:border-primary-600 focus:ring-primary-600/20" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-2">Phone <span className="text-slate-600 normal-case tracking-normal">(Optional)</span></label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Your Phone no"
                      className="input-premium h-12 w-full bg-white/[0.05] placeholder:text-slate-600 focus:border-primary-600 focus:ring-primary-600/20" />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-2">Subject</label>
                  <div className="relative">
                    <select name="subject" value={formData.subject} onChange={handleChange}
                      className="input-premium h-12 w-full appearance-none bg-white/[0.05] pr-10 focus:border-primary-600 focus:ring-primary-600/20">
                      <option className="">General Inquiry</option>
                      <option className="">Order Status Support</option>
                      <option className="">Returns & Exchanges</option>
                      <option className="">Product Sizing Advice</option>
                      <option className="">Bulk / Team Orders</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-2">Message</label>
                  <textarea rows="5" name="message" value={formData.message} onChange={handleChange}
                    placeholder="Tell us how we can help — gear questions, order support, bulk inquiries..."
                    className="w-full resize-none rounded-2xl border bg-white/[0.05] px-5 py-4 text-sm placeholder:text-slate-600 transition-all focus:border-primary-600/50 focus:outline-none focus:ring-2 focus:ring-primary-600/30"
                  />
                </div>

                {/* Submit */}
                <button type="submit" disabled={loading}
                  className="group w-full inline-flex items-center justify-center gap-3 rounded-2xl bg-primary-600 px-8 py-4 text-base font-black uppercase tracking-[0.16em] text-white transition-all hover:bg-primary-500 disabled:opacity-60 shadow-lg shadow-primary-600/25 h-14">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Sending...
                    </span>
                  ) : (
                    <><Send size={18} className="group-hover:translate-x-1 transition-transform" />Send Message</>
                  )}
                </button>

                {success && (
                  <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4">
                    <span className="text-emerald-400 text-lg">✅</span>
                    <p className="text-sm font-bold text-emerald-400">Message sent successfully! We'll reply within 2 hours.</p>
                  </div>
                )}
                {error && (
                  <div className="flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4">
                    <span className="text-red-400 text-lg">⚠️</span>
                    <p className="text-sm font-bold text-red-400">{error}</p>
                  </div>
                )}
              </form>
            </motion.div>
          </div>

        </div>
      </div>

      {/* ══════════════════════════════════════════
          FAQ SECTION
          ══════════════════════════════════════════ */}
      <div className="container-bound mb-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="mb-4 inline-flex items-center gap-2 bg-white rounded-full border border-white/10 dark:bg-white/[0.04] px-4 py-2 text-xs font-bold uppercase tracking-[0.26em] text-primary-300">
            <Zap size={12} />Frequently Asked
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tight  md:text-4xl mb-4">
            Common Questions
          </h2>
          <p className=" text-base leading-7">
            Quick answers to what most athletes ask before reaching out.
          </p>
        </div>

        <div className="mx-auto max-w-3xl space-y-3">
          {faqs.map((faq, i) => (
            <FaqItem
              key={i}
              faq={faq}
              index={i}
              open={activeFaqIndex === i}
              onToggle={() => setActiveFaqIndex((prev) => (prev === i ? null : i))}
            />
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          BOTTOM CTA  (matches About page CTA)
      ══════════════════════════════════════════ */}
      <div className="container-bound">
        <div className="relative overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900 p-8 text-center sm:p-10 lg:p-16">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:40px_40px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-600/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10 max-w-xl mx-auto">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white">
              <TrendingUp size={12} />Ready to Upgrade?
            </div>
            <h2 className="text-3xl font-black text-white md:text-4xl mb-4">
              Ready to upgrade your game?
            </h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              Experience the difference that premium, professionally-engineered equipment makes on the field. Browse our full collection today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/shop"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-primary-600 px-8 text-base font-black uppercase tracking-[0.12em] text-white transition-all hover:bg-primary-500 shadow-xl shadow-primary-600/30">
                Explore The Collection
              </a>
              <a href="https://wa.me/923000000000" target="_blank"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.04] px-8 text-base font-bold text-white transition-all hover:bg-white/10">
                <MessageCircle size={18} />WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Contact;