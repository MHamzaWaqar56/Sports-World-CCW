import { useRef, useState } from 'react';
import { Navigate, useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowRight, Mail, ShieldCheck, Sparkles, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/useStore';
import api from '../../api/axios';

const Motion = motion;

const OtpVerification = () => {
  const navigate = useNavigate();
  const { userInfo } = useAuthStore();

  const { email } = useParams();
  const [otp, setOtp] = useState(['', '', '', '', '']);
  const otpRefs = useRef([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpVerification = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== otp.length) {
      toast.error('Please enter the complete OTP.');
      return;
    }

    setLoading(true);
    try {
      const request = api.post('/users/otp-verification', {
        email,
        otp: enteredOtp,
      });

      toast.promise(request, {
        loading: 'Verifying OTP...',
        success: () => 'OTP verified successfully!',
        error: (error) => error?.response?.data?.message || 'OTP verification failed',
      });

      await request;
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  if (userInfo) {
    return <Navigate to='/' />;
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
                <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-white">OTP Verification</p>
                <h1 className="mt-6 text-4xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-5xl xl:text-6xl">
                  Verify Your Access Code.
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:mt-8 sm:text-lg sm:leading-8">
                  Enter the one-time code sent to your registered email address to continue with password recovery.
                </p>
              </div>
            </div>

            <div className="relative mt-12 space-y-5">
              {[
                {
                  icon: Mail,
                  title: 'Email Delivery',
                  text: 'The OTP is sent to the email you used for account recovery.',
                },
                {
                  icon: KeyRound,
                  title: 'Time-Sensitive Code',
                  text: 'Enter the code before it expires to complete verification.',
                },
                {
                  icon: Sparkles,
                  title: 'Fast Recovery',
                  text: 'Once verified, you can reset your password immediately.',
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
                  <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-primary-300 text-white">Premium Athletic Goods</p>
                </div>
              </Link>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-[#131820]/95 p-5 shadow-[0_28px_80px_-44px_rgba(0,0,0,0.98)] backdrop-blur-xl sm:p-8 md:p-10">
              <div className="mb-8 flex flex-col gap-2 rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-2 text-[11px] font-bold uppercase tracking-[0.14em] min-[411px]:flex-row min-[411px]:rounded-full min-[411px]:gap-3 sm:text-sm sm:tracking-[0.18em]">
                <Link
                  to="/password/forgot"
                    className="w-full rounded-full px-3 py-2.5 text-center text-slate-400 transition-all hover:text-white min-[411px]:flex-1 min-[411px]:px-4 min-[411px]:py-3"
                >
                  Forgot Password
                </Link>
                  <div className="w-full rounded-full bg-primary-600 px-3 py-2.5 text-center text-white shadow-[0_16px_36px_-18px_rgba(220,38,38,0.8)] min-[411px]:flex-1 min-[411px]:px-4 min-[411px]:py-3">
                  OTP Verification
                </div>
              </div>

              <div className="mb-8">
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-white">
                  Enter OTP
                </p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                  Verify the Code
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-400">
                  Enter the 5-digit code sent to <span className="text-white">{email}</span>.
                </p>
              </div>

              <form onSubmit={handleOtpVerification} className="space-y-5 sm:space-y-6">
                <div className="space-y-3">
                  <label className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                    One-Time Password
                  </label>
                  <div className="grid grid-cols-5 gap-2 sm:gap-3">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => {
                          otpRefs.current[index] = el;
                        }}
                        id={`otp-input-${index}`}
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleChange(e.target.value, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] text-center text-lg font-black text-white outline-none transition-all placeholder:text-slate-500 focus:border-primary-500/40 focus:bg-white/[0.06] sm:h-16 sm:text-xl"
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary-600 text-sm font-black uppercase tracking-[0.18em] text-white shadow-[0_22px_44px_-20px_rgba(220,38,38,0.7)] transition-all hover:-translate-y-0.5 hover:bg-primary-700 disabled:opacity-60"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </button>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-slate-400 min-[320px]:max-[430px]:leading-[20px] text-justify">
                  Didn’t receive the code? Check your spam folder or go back and request a new reset link.
                </div>
              </form>
            </div>
          </div>
        </div>
      </Motion.div>
    </div>
  );
};

export default OtpVerification;
