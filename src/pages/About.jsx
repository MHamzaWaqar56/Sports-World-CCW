import { useEffect } from 'react';
import { Target, ShieldCheck, Zap, Users, Star, Trophy, Package, Calendar, Mail, Phone, Facebook } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHero from '../components/common/PageHero';
import { useReviewStore } from '../store/useReviewStore';
import InfiniteReviewCarousel from '../components/common/InfiniteReviewCarousel';
import SEO from '../components/common/SEO';
import { businessInfo, localBusinessSchema, organizationSchema } from '../utils/seo';

const TikTokIcon = ({ className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M16.75 2h-3.1v12.01a2.7 2.7 0 1 1-2.7-2.7c.24 0 .48.03.7.09V8.23a5.84 5.84 0 0 0-.7-.04 5.82 5.82 0 1 0 5.82 5.82V7.8c1.16.83 2.57 1.28 4.02 1.28V6.01c-1.88 0-3.53-1.19-4.03-2.95V2Z" />
  </svg>
);

const teamMembers = [
  {
    name: 'Hafiz Asif Dogar',
    role: 'Founder & CEO',
    bio: 'Former first-class cricketer with 15 years of professional experience. Built Sports World to give every athlete access to pro-grade gear.',
    img: '/assets/Asif-Dogar.jpg',
    initials: 'AR',
    email: 'sportsworldccw@gmail.com',
    phone: '+923224841625',
    tiktok: 'https://www.tiktok.com/@sportsworldccw',
    facebook: 'https://www.facebook.com/',
  },
  {
    name: 'M Hamza Waqar',
    role: 'Web Developer & Operations Lead',
    bio: 'Web developer focused on building a fast, reliable, and user-friendly shopping experience that keeps Sports World easy to browse and trusted to buy from.',
    img: '/assets/web-developer.jpeg',
    initials: 'BH',
    email: 'hamzarajpoot3912@gmail.com',
    phone: '+923044902161',
    tiktok: 'https://www.tiktok.com/@muhammadhamzaa01?_r=1&_t=ZS-95YIXiyuAg0',
    facebook: 'https://www.facebook.com/hamza.waqar.7399',
  },
  {
    name: 'Abdul Muqeet',
    role: 'Sales Manager',
    bio: 'Passionate about building lasting relationships with athletes. He ensures every order, query, and interaction exceeds expectations.',
    img: '/assets/sales-manager.jpeg',
    initials: 'SM',
    email: 'sportsworldccw@gmail.com',
    phone: '+923157653456',
    tiktok: 'https://www.tiktok.com/@sportsworldccw',
    facebook: 'https://www.facebook.com/',
  },
];

const milestones = [
  { year: '2017', title: 'Founded in Chichawatni', desc: 'Started as a small cricket equipment shop serving local clubs and academies.' },
  { year: '2020', title: 'Pro Athlete Partnerships', desc: 'Signed agreements with 12 first-class cricketers to test and endorse our gear.' },
  { year: '2021', title: '10,000+ Athletes Served', desc: 'Crossed a major milestone, now delivering to every major city in Pakistan.' },
  { year: '2023', title: 'Online Store Launched', desc: 'Expanded digitally, reaching athletes across all of Pakistan.' },
  { year: '2024', title: 'Multi-Sport Expansion', desc: 'Launched football, badminton, and fitness gear lines alongside our cricket roots.' },
];

const About = () => {
  const { topReviews, topReviewsLoading, fetchTopReviews } = useReviewStore();

  useEffect(() => {
    fetchTopReviews(5);
  }, [fetchTopReviews]);

  return (
    <div className="min-h-screen overflow-hidden bg-transparent pb-20">
      <SEO
        title="About Sports World Chichawatni | Wholesale & Retail Sports Store"
        description={businessInfo.description}
        canonicalPath="/about"
        keywords={businessInfo.keywords}
        structuredData={[organizationSchema(), localBusinessSchema()]}
      />

      <PageHero
        Icon={Trophy}
        badge="Pakistan's Premier Sports Equipment Store"
        title="Elevating The Game For"
        highlight="Every Athlete"
        description="Sports World was born out of a passion for performance. We provide professional-grade equipment engineered for those who refuse to settle for second best."
        chips={[
          'Founded in 2018',
          'Trusted by 10K+ athletes',
          'Premium quality standards',
        ]}
        imageUrl="https://res.cloudinary.com/da8lxpc3h/image/upload/v1776738944/hero-bg_g8kry5.avif"
      />

      {/* ── Stats Bar ── */}
      <div className="container-bound mb-24">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Calendar, label: 'Founded', value: '2018', sub: 'Years of excellence' },
            { icon: Package, label: 'Products', value: '500+', sub: 'Curated SKUs' },
            { icon: Users, label: 'Athletes Served', value: '10K+', sub: 'Across Pakistan' },
            { icon: Star, label: 'Average Rating', value: '4.9★', sub: 'Verified reviews' },
          ].map((stat, i) => (
            <div
              key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="relative bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 overflow-hidden group hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary-50 dark:bg-primary-900/20 rounded-full opacity-60 group-hover:scale-150 transition-transform duration-500" />
              <stat.icon size={20} className="text-primary-600 mb-3 relative z-10" />
              <p className="text-3xl font-black text-slate-900 dark:text-white relative z-10">{stat.value}</p>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 relative z-10">{stat.label}</p>
              <p className="text-xs text-slate-400 relative z-10">{stat.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Origin Story ── */}
      <div className="container-bound mb-24">
        <div className="panel-premium flex flex-col overflow-hidden p-0 lg:flex-row">
          <div className="lg:w-1/2 relative min-h-[280px] sm:min-h-[340px] lg:min-h-[400px]">
            <img
              src="https://res.cloudinary.com/da8lxpc3h/image/upload/v1776741373/sports-world-about-img_de0uw3.avif"
              alt="Athletes in training"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/60 to-transparent" />
            <div className="absolute bottom-8 left-8 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 max-w-xs min-[320px]:max-[767px]:bottom-[0px] min-[320px]:max-[370px]:left-[0px]">
              <p className="text-white font-bold text-lg leading-tight">
                "We don't just sell equipment; we equip champions for their legacy."
              </p>
            </div>
          </div>
          <div className="lg:w-1/2 p-10 md:p-16 lg:p-20 flex flex-col justify-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
              Our Origin Story
            </h2>
            <div className="prose text-justify dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 space-y-6 min-[320px]:max-[430px]:text-[14px] min-[320px]:max-[767px]:text-justify">
              <p>
                Founded in 2017, Sports World started as a small local shop
                catering to dedicated cricketers. Frustrated by the lack of
                premium, highly-engineered sports gear at accessible prices, our
                founders decided to bridge the gap.
              </p>
              <p>
                Today, we source and manufacture the highest quality equipment —
                from Grade A English Willow bats to aerodynamic training gear.
                Every piece that carries our seal has been rigorously tested by
                professional athletes.
              </p>
              <p>
                We believe that peak performance requires uncompromised quality.
                It's not just about what you wear or wield; it's about the
                confidence that your gear will never hold you back.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Core Values ── */}
      <div className="container-bound mb-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
            Our Standard
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 min-[320px]:max-[430px]:text-[16px] min-[320px]:max-[430px]:leading-[22px]">
            Core pillars that dictate every product we design and every order we
            fulfill.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: Target, title: 'Precision Driven', desc: 'Every millimeter and gram is calculated for optimum physical output and balance.' },
            { icon: ShieldCheck, title: 'Unyielding Quality', desc: 'Sourced from premium materials and rigorously field-tested by professionals.' },
            { icon: Zap, title: 'Innovation First', desc: 'We continuously evolve our designs integrating modern biomechanical science.' },
            { icon: Users, title: 'For The Athlete', desc: 'Built for the community. We listen, adapt, and create what athletes truly need.' },
          ].map((value, i) => (
            <div
              key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="metric-card p-8 group bg-white dark:bg-slate-800/60"
            >
              <div className="w-16 h-16  bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary-600 group-hover:text-white transition-all shadow-sm">
                <value.icon size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{value.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed min-[320px]:max-[430px]:leading-[22px]">{value.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Milestones / Timeline ── */}
      <div className="container-bound mb-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
            Our Journey
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 min-[320px]:max-[430px]:text-[16px] min-[320px]:max-[430px]:leading-[22px]">
            From a single shop to Pakistan's most trusted sports equipment brand.
          </p>
        </div>
        <div className="relative">
          {/* vertical line */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700 hidden md:block" />
          <div className="space-y-12">
            {milestones.map((m, i) => (
              <div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative flex flex-col md:flex-row items-center gap-8 ${i % 2 !== 0 ? 'md:flex-row-reverse' : ''} min-[320px]:max-[430px]:gap-0`}
              >
                {/* card */}
                <div className="md:w-5/12">
                  <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 hover:-translate-y-1 transition-transform duration-300">
                    <span className="inline-block bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                      {m.year}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{m.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed min-[320px]:max-[430px]:text-[14px] min-[320px]:max-[430px]:leading-[18px]">{m.desc}</p>
                  </div>
                </div>
                {/* center dot */}
                <div className="hidden md:flex w-2/12 justify-center">
                  <div className="w-5 h-5 rounded-full bg-primary-600 border-4 border-white dark:border-slate-900 shadow-md z-10" />
                </div>
                <div className="md:w-5/12" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Meet The Team ── */}
      <div className="container-bound mb-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
            Meet The Team
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 min-[320px]:max-[430px]:text-[16px] min-[320px]:max-[430px]:leading-[22px]">
            The athletes, engineers, and visionaries behind every product.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {teamMembers.map((member, i) => (
            <div
              key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.12 }}
              className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden group hover:-translate-y-2 transition-transform duration-300"
            >
              <div className="h-80 relative overflow-hidden">
                <img
                  src={member.img}
                  alt={member.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                {/* fallback avatar */}
                <div
                  className="absolute inset-0 bg-primary-100 dark:bg-primary-900/40 items-center justify-center hidden"
                  style={{ display: 'none' }}
                >
                  <span className="text-5xl font-black text-primary-600">{member.initials}</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 translate-y-16 items-center gap-2 rounded-2xl border border-white/20 bg-black/40 px-3 py-2 opacity-0 backdrop-blur-md transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  <a
                    href={`mailto:${member.email}`}
                    aria-label={`${member.name} email`}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition hover:bg-primary-600"
                  >
                    <Mail size={16} />
                  </a>
                  <a
                    href={`tel:${member.phone}`}
                    aria-label={`${member.name} phone`}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition hover:bg-primary-600"
                  >
                    <Phone size={16} />
                  </a>
                  <a
                    href={member.tiktok}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${member.name} tiktok`}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition hover:bg-primary-600"
                  >
                    <TikTokIcon className="h-4 w-4" />
                  </a>
                  {member.facebook && (
                    <a
                      href={member.facebook}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${member.name} facebook`}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition hover:bg-primary-600"
                    >
                      <Facebook size={16} />
                    </a>
                  )}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{member.name}</h3>
                <p className="text-primary-600 font-semibold text-sm mb-3">{member.role}</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed min-[320px]:max-[767px]:text-justify min-[320px]:max-[430px]:leading-[18px]">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          TESTIMONIALS — Live from Database
      ══════════════════════════════════════════ */}
      <div className="container-bound mb-24">
        <div className="text-center mx-auto mb-16 ">

          {/* Header */}
          <div className='text-center max-w-3xl mx-auto mb-16'>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
              Athletes Speak
            </h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 min-[320px]:max-[430px]:text-[16px] min-[320px]:max-[430px]:leading-[22px]">
              Real feedback from the field, not from marketing.
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
            <InfiniteReviewCarousel reviews={topReviews} lightCardsOnLightTheme />
          )}
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="container-bound">
        <div className="bg-slate-900 dark:bg-slate-950 rounded-[2rem] p-12 lg:p-20 text-center relative overflow-hidden border border-slate-800 min-[320px]:max-[430px]:p-[32px]">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:40px_40px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-600/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-6 min-[320px]:max-[430px]:text-[26px] min-[320px]:max-[430px]:leading-[32px]">
              Ready to upgrade your game?
            </h2>
            <p className="text-lg text-slate-400 mb-10 min-[320px]:max-[399px]:hidden min-[400px]:max-[430px]:text-[16px] min-[400px]:max-[430px]:leading-[22px]">
              Experience the difference that premium, professionally-engineered
              equipment makes on the field.
            </p>
            <Link
              to="/shop"
              className="btn-primary h-16 px-10 text-lg font-bold shadow-xl shadow-primary-600/30 inline-flex items-center justify-center min-[320px]:max-[430px]:text-[16px]"
            >
              Explore The Collection
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
};

export default About;