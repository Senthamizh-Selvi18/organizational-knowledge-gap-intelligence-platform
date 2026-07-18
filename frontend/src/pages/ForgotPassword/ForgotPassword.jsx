import { useState } from "react"
import { Link } from "react-router-dom"
import { FiMail, FiArrowRight, FiArrowLeft, FiCheckCircle, FiLoader } from "react-icons/fi"
import { forgotPassword } from "../../api/authApi"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await forgotPassword(email)
      setSent(true)
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg px-4 py-10 font-sans">
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
        <section className="hidden flex-col justify-center lg:flex">
          <div className="flex items-center gap-3">
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

        <section className="mx-auto w-full max-w-md">
          <div className="rounded-3xl border border-white/60 bg-panel/60 p-8 shadow-2xl shadow-blue-900/10 backdrop-blur-xl sm:p-10">
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

            {sent ? (
              <div className="flex flex-col items-center text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                  <FiCheckCircle className="h-9 w-9" />
                </span>
                <h2 className="mt-6 text-2xl font-bold tracking-tight text-text">
                  Check Your Email
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-sub">
                  If an account exists for{" "}
                  <span className="font-semibold text-text">
                    {email || "your email"}
                  </span>
                  , we&apos;ve sent a password reset link. Please check your inbox
                  and spam folder.
                </p>

                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-panel/80 py-3 text-sm font-semibold text-text shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-line hover:bg-panel hover:shadow-md focus:outline-none focus:ring-4 focus:ring-line"
                >
                  Resend Link
                </button>

                <Link
                  to="/login"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary-dark hover:underline"
                >
                  <FiArrowLeft className="h-4 w-4" />
                  Back to Login
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center lg:text-left">
                  <h2 className="text-2xl font-bold tracking-tight text-text">
                    Forgot Password
                  </h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-sub">
                    Enter your registered email address and we&apos;ll send you a
                    password reset link.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1.5 block text-sm font-medium text-text"
                    >
                      Email Address
                    </label>
                    <div className="group relative">
                      <FiMail className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-mute transition-colors group-focus-within:text-primary" />
                      <input
                        id="email"
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full rounded-xl border border-line bg-panel/70 py-3 pl-11 pr-4 text-sm text-text placeholder-slate-400 shadow-sm outline-none transition-all duration-200 focus:border-primary focus:bg-panel focus:ring-4 focus:ring-primary/15"
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="text-sm font-medium text-red-600">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="group mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-text shadow-lg shadow-blue-600/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-xl hover:shadow-blue-600/30 active:translate-y-0 focus:outline-none focus:ring-4 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:bg-primary"
                  >
                    {loading ? (
                      <>
                        <FiLoader className="h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Reset Link
                        <FiArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </form>

                <p className="mt-8 text-center text-sm text-sub">
                  Remember your password?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-primary transition-colors hover:text-primary-dark hover:underline"
                  >
                    Back to Login
                  </Link>
                </p>
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