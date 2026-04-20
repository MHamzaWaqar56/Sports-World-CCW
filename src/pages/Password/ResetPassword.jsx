import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Lock, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuthStore } from "../../store/useStore";

const Motion = motion;

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword, userInfo } = useAuthStore();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const request = resetPassword(token, password, confirmPassword);

      toast.promise(request, {
        loading: 'Resetting password...',
        success: (data) => data?.message || 'Password reset successfully.',
        error: (error) => error?.message || 'Password reset failed.',
      });

      await request;
      // Redirect to login after successful reset
      navigate("/login");
    } catch (error) {
      toast.error(error?.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  // Agar user already logged in, home pe redirect
  if (userInfo) {
    return <Navigate to="/" />;
  }

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
                <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-white">Secure Reset</p>
                <h1 className="mt-6 text-4xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-5xl xl:text-6xl">
                  Set A New Password Safely.
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:mt-8 sm:text-lg sm:leading-8">
                  Create a new password and confirm it below. Once updated, you can sign in again and continue using your Sports World account.
                </p>
              </div>
            </div>

            <div className="relative mt-12 space-y-5">
              {[
                {
                  icon: Lock,
                  title: 'New Credentials',
                  text: 'Choose a strong password you have not used before.',
                },
                {
                  icon: ShieldCheck,
                  title: 'Protected Update',
                  text: 'The reset flow updates your account through a secure token.',
                },
                {
                  icon: Sparkles,
                  title: 'Quick Sign-In',
                  text: 'After saving the new password, you can go straight back to login.',
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
                  <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-primary-300">Premium Athletic Goods</p>
                </div>
              </Link>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-[#131820]/95 p-5 shadow-[0_28px_80px_-44px_rgba(0,0,0,0.98)] backdrop-blur-xl sm:p-8 md:p-10">
              <div className="mb-8 flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] p-1 text-xs font-bold uppercase tracking-[0.18em] sm:text-sm">
                <Link
                  to="/password/forgot"
                  className="flex-1 rounded-full px-4 py-3 text-center text-slate-400 transition-all hover:text-white"
                >
                  Forgot Password
                </Link>
                <div className="flex-1 rounded-full bg-primary-600 px-4 py-3 text-center text-white shadow-[0_16px_36px_-18px_rgba(220,38,38,0.8)]">
                  Reset Password
                </div>
              </div>

              <div className="mb-8">
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-primary-300">
                  Reset Password
                </p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                  Choose Your New Password
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-400">
                  Enter a new password twice to confirm the change.
                </p>
              </div>

              <form className="space-y-5 sm:space-y-6" onSubmit={handleResetPassword}>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-12 pr-12 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-primary-500/40"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-white"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-12 pr-12 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-primary-500/40"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary-600 text-sm font-black uppercase tracking-[0.18em] text-white shadow-[0_22px_44px_-20px_rgba(220,38,38,0.7)] transition-all hover:-translate-y-0.5 hover:bg-primary-700 disabled:opacity-60"
                >
                  {loading ? (
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                  ) : (
                    <>
                      Reset Password
                      <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-slate-400">
                  Make sure both passwords match before submitting. After a successful reset, you’ll be redirected to the login page.
                </div>
              </form>
            </div>
          </div>
        </div>
      </Motion.div>
    </div>
  );
};

export default ResetPassword;