import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ShieldCheck, Truck, RefreshCcw, CreditCard, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import PageHero from "../components/common/PageHero";
import SEO from '../components/common/SEO';
import { businessInfo, faqSchema } from '../utils/seo';

const Motion = motion;

const faqs = [
  {
    category: "Store Information",
    icon: HelpCircle,
    questions: [
      {
        q: "Where is Sports World Chichawatni located?",
        a: "Our store is located on College Road, Chichawatni, District Sahiwal, Punjab, Pakistan. You can also find us on Google Maps.",
      },
      {
        q: "What are your store opening hours?",
        a: "Our store is open every day, Monday to Sunday, from 8:00 AM to 10:00 PM.",
      },
      {
        q: "How can I reach customer support?",
        a: "You can contact us via email at sportsworldccw@gmail.com or on WhatsApp at +92 322 4841625. We are available from 8 AM to 10 PM daily.",
      },
    ],
  },
  {
    category: "Delivery",
    icon: Truck,
    questions: [
      {
        q: "Do you offer online delivery?",
        a: "Yes, we deliver all across Pakistan. You can place your order through our website or via WhatsApp at +92 322 4841625. Local Delivery (Chichawatni): Orders within Chichawatni are delivered within 60 minutes. Outstation orders via TCS, Leopards, or M&P take 2–3 working days.",
      },
      {
        q: "How long does delivery take?",
        a: "Local delivery in Chichawatni takes around 60 minutes. Outstation orders usually take 2 to 3 working days.",
      },
      {
        q: "Can I stay updated on new arrivals?",
        a: "Yes, follow our Facebook and TikTok pages. We regularly share new products and offers there.",
      },
    ],
  },
  {
    category: "Products & Pricing",
    icon: ShieldCheck,
    questions: [
      {
        q: "What types of sports equipment do you sell?",
        a: "We carry cricket, football, hockey, footware, sleeves, tennis, basketball, kabaddi, indoor games, outdoor games, and all kinds of sports accessories.",
      },
      {
        q: "Is wholesale pricing available?",
        a: "Yes, Sports World Chichawatni is a wholesale sports store. Special discounts are available on bulk orders. Contact us at +92 322 4841625.",
      },
      {
        q: "Do you accept custom sports kit or team orders?",
        a: "Yes, we accept bulk and custom orders for schools, clubs, and academies. Contact us on WhatsApp to discuss your requirements.",
      },
    ],
  },
  {
    category: "Payments & Returns",
    icon: CreditCard,
    questions: [
      {
        q: "Do I have to pay online?",
        a: "No, you can also choose Cash on Delivery (COD). Bank transfers are accepted as well.",
      },
      {
        q: "Can I return or exchange a product?",
        a: "Yes, returns and exchanges are accepted within 7 days of delivery for defective or incorrect items, provided the product is in its original condition.",
      },
    ],
  },
];

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggle = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen pb-20 overflow-hidden">
      <SEO
        title="Sports World Chichawatni FAQ | Delivery, Wholesale & Support"
        description="Find answers about Sports World Chichawatni location, delivery across Pakistan, wholesale pricing, payments, returns, team orders, and customer support."
        canonicalPath="/faq"
        keywords={businessInfo.keywords}
        structuredData={[faqSchema(faqs.flatMap((section) => section.questions))]}
      />

      <PageHero
        Icon={HelpCircle}
        badge="Answers Before Checkout"
        title="Frequently Asked"
        highlight="Questions"
          description="Everything you need to know about Sports World Chichawatni — location, delivery, wholesale pricing, payments, and returns."
        chips={[
            'Store info',
            'Delivery & payments',
            'Wholesale support',
        ]}
      />

      {/* ── FAQ Sections ── */}
      <div className="container-bound space-y-16">
        {faqs.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-xl flex items-center justify-center">
                <section.icon size={22} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {section.category}
              </h2>
            </div>

            {/* Questions */}
            <div className="space-y-4">
              {section.questions.map((item, i) => {
                const index = `${sectionIndex}-${i}`;
                const isOpen = activeIndex === index;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 rounded-2xl overflow-hidden"
                  >
                    {/* Question */}
                    <button
                      onClick={() => toggle(index)}
                      className="w-full flex items-center justify-between p-6 text-left"
                    >
                      <span className="font-semibold text-slate-900 dark:text-white min-[320px]:max-[430px]:text-[14px]">
                        {item.q}
                      </span>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                      >
                        <ChevronDown className="text-slate-400" />
                      </motion.div>
                    </button>

                    {/* Answer */}
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-6 pb-6 text-slate-500 dark:text-slate-400 text-sm min-[320px]:max-[430px]:text-[12px] min-[320px]:max-[430px]:leading-[18px]"
                        >
                          {item.a}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ── CTA ── */}
      <div className="container-bound mt-24">
        <div className="bg-slate-900 rounded-[2rem] p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.05]" />
          <div className="absolute w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] lg:w-[500px] lg:h-[500px] bg-primary-600/20 blur-[100px] rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />

          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 min-[320px]:max-[430px]:text-[26px] min-[320px]:max-[430px]:leading-[32px]">
              Still have questions?
            </h2>
            <p className="text-slate-400 mb-8">
              Our team is here to help you 24/7.
            </p>

            <Link
              to="/contact"
              className="btn-primary px-8 py-4 text-lg font-bold"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
};

export default FAQ;