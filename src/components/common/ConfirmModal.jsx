import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

const Motion = motion;

const toneStyles = {
  danger: {
    badge: 'bg-red-500/15 text-red-300 border-red-500/20',
    confirm: 'bg-red-600 text-white hover:bg-red-500',
  },
  warning: {
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
    confirm: 'bg-amber-500 text-slate-950 hover:bg-amber-400',
  },
  neutral: {
    badge: 'bg-white/10 text-white border-white/10',
    confirm: 'bg-primary-600 text-white hover:bg-primary-700',
  },
};

const ConfirmModal = ({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
  tone = 'danger',
}) => {
  const styles = toneStyles[tone] || toneStyles.danger;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
          <Motion.button
            type="button"
            aria-label="Close confirmation dialog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-black/25 backdrop-blur-sm transition-opacity dark:bg-white/5"
          />

          <Motion.div
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 18 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#11151d] shadow-[0_32px_90px_-36px_rgba(0,0,0,0.95)]"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] ${styles.badge}`}>
                <AlertTriangle size={13} />
                Confirmation
              </div>
              <button
                type="button"
                onClick={onCancel}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-6 py-6">
              <h3 className="text-xl font-black uppercase tracking-tight text-white sm:text-2xl">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                {description}
              </p>
            </div>

            <div className="flex flex-col gap-3 border-t border-white/10 px-6 py-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold "
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className={`rounded-2xl px-5 py-3 text-sm font-black transition-colors disabled:opacity-60 ${styles.confirm}`}
              >
                {loading ? 'Working...' : confirmLabel}
              </button>
            </div>
          </Motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
