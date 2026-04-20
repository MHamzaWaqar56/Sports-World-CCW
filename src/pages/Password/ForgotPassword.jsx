
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuthStore } from "../../store/useStore";

const Motion = motion;

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useAuthStore(); // store method
  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const request = forgotPassword(email);

      toast.promise(request, {
        loading: 'Sending reset link...',
        success: (data) => data?.message || 'Reset link sent successfully.',
        error: (error) => error?.message || 'Failed to send reset link.',
      });

      await request;

      // Optional: user ko login page ya instructions page pe redirect
      navigate("/login");
    } catch (err) {
      toast.error(err?.message || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-10 pt-24 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(220,38,38,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.12),transparent_26%)]"></div>
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:72px_72px]"></div>

      <Motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto flex w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#101317]/95 shadow-[0_35px_120px_-50px_rgba(0,0,0,0.98)] backdrop-blur-xl"
      >
        <div className="hidden w-[48%] border-r border-white/10 lg:flex lg:flex-col lg:justify-between">
          <div className="relative flex h-full flex-col justify-between overflow-hidden p-10 xl:p-14">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(220,38,38,0.18),transparent_34%),linear-gradient(160deg,rgba(255,255,255,0.03),transparent_55%)]"></div>
            <div className="relative">
              <Link to="/" className="inline-flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 text-sm font-black uppercase tracking-[0.18em] text-white shadow-[0_18px_42px_-18px_rgba(220,38,38,0.8)]">
                  SW
                </div>
                <div>
                  <p className="text-xl font-black uppercase tracking-tight text-white">Sports World</p>
                  <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-white">Premium Athletic Goods</p>
                </div>
              </Link>

              <div className="mt-20 max-w-xl">
                <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-white">Account Recovery</p>
                <h1 className="mt-6 text-4xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-4xl xl:text-5xl">
                  Recover Your Sports World Access.
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:mt-8 sm:text-lg sm:leading-8">
                  Enter the email linked to your account and we will send password reset instructions so you can get back to your orders, wishlist, and dashboard.
                </p>
              </div>
            </div>

            <div className="relative mt-12 space-y-5">
              {[
                {
                  icon: Mail,
                  title: 'Email Verification',
                  text: 'We send the reset link only to the email address you entered.',
                },
                {
                  icon: ShieldCheck,
                  title: 'Secure Reset Flow',
                  text: 'Your new password is updated through the same secure authentication flow.',
                },
                {
                  icon: Sparkles,
                  title: 'Fast Recovery',
                  text: 'Most password resets can be completed in a few quick steps.',
                },
              ].map((point) => {
                const Icon = point.icon;
                return (
                  <div
                    key={point.title}
                    className="rounded-[1.5rem] border border-white/10 bg-[#131820]/95 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.06] text-white">
                        <Icon size={20} />
                      </div>
                      <div>
                        <p className="text-base font-black text-white">{point.title}</p>
                        <p className="mt-2 text-sm leading-7 text-slate-400">{point.text}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="relative flex w-full flex-1 items-center justify-center px-5 py-8 sm:px-8 lg:px-10 xl:px-14">
          <div className="w-full max-w-xl">
            <div className="mb-8 lg:hidden">
              <Link to="/" className="inline-flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-600 text-sm font-black uppercase tracking-[0.18em] text-white">
                  SW
                </div>
                <div>
                  <p className="text-xl font-black uppercase tracking-tight text-white">Sports World</p>
                  <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-white">Premium Athletic Goods</p>
                </div>
              </Link>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-[#131820]/95 p-5 shadow-[0_28px_80px_-44px_rgba(0,0,0,0.98)] backdrop-blur-xl sm:p-8 md:p-10">
              <div className="mb-8 flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] p-1 text-xs font-bold uppercase tracking-[0.18em] sm:text-sm">
                <div className="flex-1 rounded-full bg-primary-600 px-4 py-3 text-center text-white shadow-[0_16px_36px_-18px_rgba(220,38,38,0.8)]">
                  Reset Link
                </div>
                <Link
                  to="/login"
                  className="flex-1 rounded-full px-4 py-3 text-center text-slate-400 transition-all hover:text-white"
                >
                  Back to Login
                </Link>
              </div>

              <div className="mb-8">
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-white">
                  Forgot Password
                </p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl min-[320px]:max-[430px]:text-[22px] min-[320px]:max-[430px]:leading-[32px]">
                  Send Reset Instructions
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-400 min-[320px]:max-[430px]:leading-[20px]">
                  Enter your account email and we’ll send you a password reset link.
                </p>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-5 sm:space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                      type="email"
                      placeholder="athlete@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-12 pr-4 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-primary-500/40"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary-600 text-sm font-black uppercase tracking-[0.18em] text-white shadow-[0_22px_44px_-20px_rgba(220,38,38,0.7)] transition-all hover:-translate-y-0.5 hover:bg-primary-700"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </button>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-slate-400 min-[320px]:max-[430px]:leading-[20px] text-justify">
                  Check your inbox and spam folder. If you don’t see the email, make sure you entered the same address that you used to sign up.
                </div>
              </form>
            </div>
          </div>
        </div>
      </Motion.div>
    </div>
  );
};

export default ForgotPassword;