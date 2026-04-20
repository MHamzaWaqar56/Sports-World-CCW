import { useCallback, useEffect, useRef, useState } from 'react';
import { Quote, Star } from 'lucide-react';

const getVisibleCards = () => {
  if (typeof window === 'undefined') {
    return 1;
  }

  if (window.innerWidth >= 1024) {
    return 3;
  }

  if (window.innerWidth >= 640) {
    return 2;
  }

  return 1;
};

const InfiniteReviewCarousel = ({ reviews = [], lightCardsOnLightTheme = false }) => {
  const INTERVAL = 3000;
  const DURATION = 500;
  const reviewItems = Array.isArray(reviews) ? reviews : [];
  const hasReviews = reviewItems.length > 0;
  const [visibleCards, setVisibleCards] = useState(getVisibleCards);
  const canSlide = reviewItems.length > visibleCards;

  const cloned     = [
    ...reviewItems.slice(-visibleCards),
    ...reviewItems,
    ...reviewItems.slice(0, visibleCards),
  ];
  const total      = cloned.length || 1;
  const startIndex = visibleCards;

  const [current,       setCurrent]       = useState(startIndex);
  const [transitioning, setTransitioning] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setVisibleCards(getVisibleCards());

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let transitionTimeout;
    const resetTimeout = setTimeout(() => {
      setTransitioning(false);
      setCurrent(visibleCards);

      transitionTimeout = setTimeout(() => setTransitioning(true), 30);
    }, 0);

    return () => {
      clearTimeout(resetTimeout);
      clearTimeout(transitionTimeout);
    };
  }, [visibleCards, reviewItems.length]);

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);

    if (!canSlide) {
      return;
    }

    timerRef.current = setInterval(() => {
      setTransitioning(true);
      setCurrent(prev => prev + 1);
    }, INTERVAL);
  }, [INTERVAL, canSlide]);

  useEffect(() => {
    if (!canSlide) {
      clearInterval(timerRef.current);
      return undefined;
    }

    startTimer();
    return () => clearInterval(timerRef.current);
  }, [canSlide, startTimer]);

  useEffect(() => {
    if (!canSlide) {
      return undefined;
    }

    if (current >= total - visibleCards) {
      const t = setTimeout(() => { setTransitioning(false); setCurrent(startIndex); }, DURATION);
      return () => clearTimeout(t);
    }
    if (current < startIndex) {
      const t = setTimeout(() => { setTransitioning(false); setCurrent(total - visibleCards * 2); }, DURATION);
      return () => clearTimeout(t);
    }
  }, [current, total, startIndex, canSlide, visibleCards]);

  useEffect(() => {
    if (!transitioning) {
      const t = setTimeout(() => setTransitioning(true), 30);
      return () => clearTimeout(t);
    }
  }, [transitioning]);

  const realCount    = reviewItems.length || 1;
  const rawIndex     = current - startIndex;
  const dotActive    = ((rawIndex % realCount) + realCount) % realCount;
  const cardWidthPct = 100 / total;
  const translatePct = -(current / total) * 100;

  const goTo = (i) => {
    if (!canSlide) return;

    clearInterval(timerRef.current);
    setTransitioning(true);
    setCurrent(startIndex + i);
    startTimer();
  };

  if (!hasReviews) return null;

  return (
    <div className="w-full overflow-hidden rounded-[1.9rem]">
      {/* ── Sliding Track ── */}
      <div
        className="flex"
        style={{
          width:      `${(total / visibleCards) * 100}%`,
          transform:  `translateX(${translatePct}%)`,
          transition: transitioning
            ? `transform ${DURATION}ms cubic-bezier(0.4,0,0.2,1)`
            : 'none',
        }}
      >
        {cloned.map((review, i) => (
          <div
            key={i}
            style={{ width: `${cardWidthPct}%` }}
            className="flex-shrink-0 px-3 box-border"
          >
            <ReviewCard review={review} lightCardsOnLightTheme={lightCardsOnLightTheme} />
          </div>
        ))}
      </div>

      {/* ── Dots ── */}
      <div className="mt-8 flex items-center justify-center gap-2">
        {reviewItems.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`block h-1.5 rounded-full transition-all duration-500 ${
              dotActive === i ? 'w-6 bg-primary-500' : 'w-1.5 bg-white/20 hover:bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

/* ── Review Card — design matches reference ── */
const ReviewCard = ({ review, lightCardsOnLightTheme = false }) => (
  <div
    className={`flex h-full flex-col justify-between rounded-[1.9rem] p-7 backdrop-blur-xl ${
      lightCardsOnLightTheme
        ? 'border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.05]'
        : 'border border-white/10 bg-white/[0.05]'
    }`}
  >
    {/* Top */}
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex gap-1">
          {[...Array(5)].map((_, s) => (
            <Star key={s} size={15} className="fill-yellow-400 text-yellow-400" />
          ))}
        </div>
        <div className={`rounded-2xl p-2.5 ${lightCardsOnLightTheme ? 'border border-slate-200 bg-slate-50 text-slate-700 dark:border-white/10 dark:bg-white/[0.05] dark:text-white' : 'border border-white/10 bg-white/[0.05] text-white'}`}>
          <Quote size={16} />
        </div>
      </div>
      <p
        className={`text-sm text-justify leading-7 ${lightCardsOnLightTheme ? 'text-slate-700 dark:text-slate-300' : 'text-slate-300'}`}
        style={{
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        "{review?.comment ?? review?.text ?? review?.review ?? ''}"
      </p>
    </div>

    {/* Bottom */}
    <div className={`mt-6 flex items-center gap-3 pt-5 ${lightCardsOnLightTheme ? 'border-t border-slate-200 dark:border-white/10' : 'border-t border-white/10'}`}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-xs font-black text-white shadow-lg shadow-primary-600/25">
        {(review?.userName ?? review?.name ?? 'U').charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0">
        <p className={`truncate text-left text-sm font-black uppercase tracking-[0.14em] ${lightCardsOnLightTheme ? 'text-slate-900 dark:text-white' : 'text-white'}`}>
          {review?.userName ?? review?.name ?? 'Verified Buyer'}
        </p>
        <p className={`mt-0.5 truncate text-xs ${lightCardsOnLightTheme ? 'text-slate-500 dark:text-slate-500' : 'text-slate-500'}`}>
          Verified Purchase · {review?.productName ?? 'Purchase'}
        </p>
      </div>
    </div>
  </div>
);

export default InfiniteReviewCarousel;