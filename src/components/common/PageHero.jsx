import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import React from 'react';

const Motion = motion;

const PageHero = ({
  badge,
  title,
  highlight,
  description,
  chips = [],
  imageUrl = 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80',
  Icon = Sparkles,
  tone = 'dark',
}) => {
  const isLight = tone === 'light';

  return (
    <div className="container-bound pt-6 sm:pt-8">
      <div className={`relative mb-8 overflow-hidden rounded-[2.25rem] px-5 py-16 shadow-[0_28px_80px_-40px_rgba(15,23,42,0.18)] sm:px-6 sm:py-20 md:px-10 md:py-24 ${isLight ? 'border border-slate-200 bg-white' : 'border border-white/10 bg-[#0c1017] shadow-[0_28px_80px_-40px_rgba(0,0,0,0.9)]'}`}>
        <div className={`absolute inset-0 ${isLight ? 'bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(220,38,38,0.08),transparent_24%)]' : 'bg-[radial-gradient(circle_at_top_left,rgba(220,38,38,0.18),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_24%)]'}`} />
        <div className="absolute inset-0 opacity-15">
          <img src={imageUrl} alt="Sports World hero backdrop" className="h-full w-full object-cover" />
        </div>

        <div className="relative z-10 text-center max-w-3xl mx-auto">
          {badge ? (
            <Motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className={`mb-5 inline-flex min-[320px]:max-[380px]:text-[10px] items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.26em] backdrop-blur-xl ${isLight ? 'border border-slate-200 bg-white/90 text-slate-700' : 'border border-white/10 bg-white/[0.05] text-white'}`}
            >
              {React.createElement(Icon, { size: 13 })}{badge}
            </Motion.div>
          ) : null}

          <Motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`mb-4 text-3xl font-black uppercase tracking-tight sm:text-4xl md:mb-5 md:text-6xl ${isLight ? 'text-slate-900' : 'text-white'}`}
          >
            {title}{' '}
            {highlight ? <span className="text-primary-500">{highlight}</span> : null}
          </Motion.h1>

          {description ? (
            <Motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className={`mx-auto max-w-2xl text-base leading-7 sm:text-lg sm:leading-8 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}
            >
              {description}
            </Motion.p>
          ) : null}

          {chips.length > 0 ? (
            <Motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`mt-6 flex flex-wrap items-center justify-center gap-3 text-xs sm:mt-8 sm:gap-4 sm:text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'} max-[767px]:hidden`}
            >
              {chips.map((chip) => (
                <span key={chip} className={`inline-flex items-center gap-2 rounded-full px-3 py-2 sm:px-4 ${isLight ? 'border border-slate-200 bg-slate-50' : 'border border-white/10 bg-white/[0.05]'}`}>
                  <span className="h-2 w-2 rounded-full bg-primary-500" />{chip}
                </span>
              ))}
            </Motion.div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default PageHero;
