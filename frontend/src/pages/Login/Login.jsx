import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiShield,
} from "react-icons/fi"
import { FcGoogle } from "react-icons/fc"
import { login, sendOtp, verifyOtp } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import { toast } from "../../components/ui/Toast.jsx";

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)

  const [step, setStep] = useState("login") // "login" | "otp"
  const [userId, setUserId] = useState(null)
  const [pendingRole, setPendingRole] = useState(null)
  const [otp, setOtp] = useState("")
  const [otpLoading, setOtpLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const navigate = useNavigate();

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const proceedToDashboard = (role) => {
    const normalizedRole = (role || "employee").toLowerCase();

    if (normalizedRole === "employee" || normalizedRole === "intern") {
      navigate("/employee-dashboard");
    } else {
      navigate("/dashboard");
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const data = await login(email, password);

    console.log("Response:", data);

    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);
    localStorage.setItem("userId", data.userId);
    localStorage.setItem("employeeId", data.employeeId);
    localStorage.setItem("name", data.name);

    if (data.firstLogin) {
      setUserId(data.userId);
      setPendingRole(data.role);
      setStep("otp");

      setOtpLoading(true);
      try {
        await sendOtp(data.userId);
        setResendCooldown(60);
        toast.success("OTP sent to your registered email.");
      } catch (otpError) {
        console.error(otpError);
        const message =
          otpError.response?.data?.message || "Failed to send OTP. Please try again.";
        toast.error(message);
      } finally {
        setOtpLoading(false);
      }

      return;
    }

    toast.success("Login Successful!");
    proceedToDashboard(data.role);

  } catch (error) {
    console.error(error);
    const message =
      error.response?.data?.message || "Login failed. Please try again.";
    toast.error(message);
  }
};

  const handleResendOtp = async () => {
    setOtpLoading(true);
    try {
      await sendOtp(userId);
      setResendCooldown(60);
      toast.success("OTP resent to your registered email.");
    } catch (error) {
      console.error(error);
      const message =
        error.response?.data?.message || "Failed to resend OTP. Please try again.";
      toast.error(message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.warning("Please enter the 6-digit OTP.");
      return;
    }

    setOtpLoading(true);
    try {
      const data = await verifyOtp(userId, otp);

      if (data.verified) {
        toast.success("Verification successful! Login complete.");
        proceedToDashboard(pendingRole);
      } else {
        toast.error("Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error(error);
      const message =
        error.response?.data?.message || "OTP verification failed. Please try again.";
      toast.error(message);
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg px-4 py-10 font-sans">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-tint via-bg to-primary-tint" />
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/40 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-[28rem] w-[28rem] rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 h-80 w-80 rounded-full bg-primary/30 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#1e3a8a 1px, transparent 1px), linear-gradient(90deg, #1e3a8a 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
      </div>

      <div className="relative z-10 grid w-full max-w-5xl items-center gap-10 lg:grid-cols-2">
        {/* Left brand panel */}
        <section className="hidden flex-col justify-center lg:flex">
          <div className="flex items-center gap-3">
           <img
              src="/logo.png"
              alt="Company logo"
              className="h-12 w-12 rounded-xl bg-panel/60 p-1.5 shadow-sm ring-1 ring-white/60"
            />
            <span className="text-sm font-semibold tracking-wide text-primary-dark/70 uppercase">
              KnowGap Intelligence
            </span>
          </div>

          <h1 className="mt-8 text-balance text-4xl font-bold leading-tight tracking-tight text-text xl:text-5xl">
            Organizational Knowledge Gap Intelligence Platform
          </h1>
          <p className="mt-5 max-w-md text-pretty text-base leading-relaxed text-sub">
            Surface hidden skill gaps, map organizational expertise, and make
            smarter workforce decisions with enterprise-grade analytics.
          </p>

          <ul className="mt-8 flex flex-col gap-3 text-sm text-sub">
            {[
              "Real-time skills gap analytics",
              "Team expertise mapping",
              "Actionable learning insights",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary-dark">
                  <FiArrowRight className="h-3.5 w-3.5" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Login card */}
        <section className="mx-auto w-full max-w-md">
          <div className="rounded-3xl border border-white/60 bg-panel/60 p-8 shadow-2xl shadow-blue-900/10 backdrop-blur-xl sm:p-10">
            {/* Mobile logo + title */}
            <div className="mb-8 flex flex-col items-center text-center lg:hidden">
              <img
                src="/logo.png"
                alt="Company logo"
                className="h-14 w-14 rounded-2xl bg-panel/70 p-1.5 shadow-sm ring-1 ring-white/60"
              />
              <h1 className="mt-4 text-balance text-lg font-bold leading-snug text-text">
                Organizational Knowledge Gap Intelligence Platform
              </h1>
            </div>

            {step === "login" ? (
              <>
                <div className="text-center lg:text-left">
                  <h2 className="text-2xl font-bold tracking-tight text-text">
                    Welcome Back
                  </h2>
                  <p className="mt-1.5 text-sm text-sub">
                    Sign in to access your intelligence dashboard.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1.5 block text-sm font-medium text-text"
                    >
                      Email
                    </label>
                    <div className="group relative">
                      <FiMail className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-mute transition-colors group-focus-within:text-primary" />
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full rounded-xl border border-line bg-panel/70 py-3 pl-11 pr-4 text-sm text-text placeholder-slate-400 shadow-sm outline-none transition-all duration-200 focus:border-primary focus:bg-panel focus:ring-4 focus:ring-primary/15"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label
                      htmlFor="password"
                      className="mb-1.5 block text-sm font-medium text-text"
                    >
                      Password
                    </label>
                    <div className="group relative">
                      <FiLock className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-mute transition-colors group-focus-within:text-primary" />
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full rounded-xl border border-line bg-panel/70 py-3 pl-11 pr-11 text-sm text-text placeholder-slate-400 shadow-sm outline-none transition-all duration-200 focus:border-primary focus:bg-panel focus:ring-4 focus:ring-primary/15"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-mute transition-colors hover:bg-bg hover:text-sub"
                      >
                        {showPassword ? (
                          <FiEyeOff className="h-5 w-5" />
                        ) : (
                          <FiEye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember + Forgot */}
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="remember"
                      className="flex cursor-pointer items-center gap-2 text-sm text-sub select-none"
                    >
                      <input
                        id="remember"
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="h-4 w-4 rounded border-line text-primary accent-blue-600 focus:ring-primary"
                      />
                      Remember Me
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-sm font-medium text-primary transition-colors hover:text-primary-dark hover:underline"
                    >
                      Forgot Password?
                    </Link>
                  </div>

                  {/* Login button */}
                  <button
                    type="submit"
                    className="group mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-text shadow-lg shadow-blue-600/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-xl hover:shadow-blue-600/30 active:translate-y-0 focus:outline-none focus:ring-4 focus:ring-primary/30"
                  >
                    Login
                    <FiArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </button>

                  {/* Divider */}
                  <div className="flex items-center gap-4">
                    <span className="h-px flex-1 bg-line" />
                    <span className="text-xs font-medium uppercase tracking-wide text-mute">
                      or
                    </span>
                    <span className="h-px flex-1 bg-line" />
                  </div>

                  {/* Google */}
                  <button
                    type="button"
                    onClick={() => {
                      window.location.href = `${import.meta.env.VITE_API_ORIGIN}/oauth2/authorization/google`;
                    }}
                    className="flex w-full items-center justify-center gap-3 rounded-xl border border-line bg-panel/80 py-3 text-sm font-semibold text-text shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-line hover:bg-panel hover:shadow-md focus:outline-none focus:ring-4 focus:ring-line"
                  >
                    <FcGoogle className="h-5 w-5" />
                    Continue with Google
                  </button>
                </form>

                {/* Register */}
                <p className="mt-8 text-center text-sm text-sub">
                  Don&apos;t have an account?{" "}
                  <Link
                    to="/register"
                    className="font-semibold text-primary transition-colors hover:text-primary-dark hover:underline"
                  >
                    Register
                  </Link>
                </p>
              </>
            ) : (
              <>
                <div className="text-center lg:text-left">
                  <h2 className="text-2xl font-bold tracking-tight text-text">
                    Verify Your Email
                  </h2>
                  <p className="mt-1.5 text-sm text-sub">
                    {otpLoading
                      ? "Sending OTP to your registered email..."
                      : "This is your first login — enter the 6-digit OTP sent to your registered email."}
                  </p>
                </div>

                <form onSubmit={handleVerifyOtp} className="mt-8 flex flex-col gap-5">
                  <div>
                    <label
                      htmlFor="otp"
                      className="mb-1.5 block text-sm font-medium text-text"
                    >
                      Enter OTP
                    </label>
                    <div className="group relative">
                      <FiShield className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-mute transition-colors group-focus-within:text-primary" />
                      <input
                        id="otp"
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        placeholder="6-digit OTP"
                        className="w-full rounded-xl border border-line bg-panel/70 py-3 pl-11 pr-4 text-sm tracking-widest text-text placeholder-slate-400 shadow-sm outline-none transition-all duration-200 focus:border-primary focus:bg-panel focus:ring-4 focus:ring-primary/15"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={otpLoading}
                    className="group mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-text shadow-lg shadow-blue-600/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-xl hover:shadow-blue-600/30 active:translate-y-0 focus:outline-none focus:ring-4 focus:ring-primary/30 disabled:opacity-60"
                  >
                    {otpLoading ? "Verifying..." : "Verify & Continue"}
                    <FiArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || otpLoading}
                    className="text-sm font-medium text-primary transition-colors hover:text-primary-dark hover:underline disabled:cursor-not-allowed disabled:text-mute disabled:no-underline"
                  >
                    {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : "Resend OTP"}
                  </button>
                </form>
              </>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-mute">
            &copy; {new Date().getFullYear()} KnowGap Intelligence. Enterprise
            edition.
          </p>
        </section>
      </div>
    </main>
  )
}