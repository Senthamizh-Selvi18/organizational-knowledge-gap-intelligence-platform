import { useState } from "react"
import { useSearchParams, useNavigate, Link } from "react-router-dom"
import { FiLock, FiArrowRight, FiArrowLeft, FiCheckCircle, FiLoader } from "react-icons/fi"
import { resetPassword } from "../../api/authApi"

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get("token")

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!token) {
      setError("This reset link is invalid or missing a token.")
      return
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)
    try {
      await resetPassword(token, newPassword)
      setDone(true)
      setTimeout(() => navigate("/login"), 2500)
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 px-4 py-10 font-sans">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-slate-100 to-blue-100" />
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue-300/40 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-[28rem] w-[28rem] rounded-full bg-blue-400/30 blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 h-80 w-80 rounded-full bg-sky-300/30 blur-3xl" />
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
            <span className="text-sm font-semibold tracking-wide text-blue-900/70 uppercase">
              KnowGap Intelligence
            </span>
          </div>

          <h1 className="mt-8 text-balance text-4xl font-bold leading-tight tracking-tight text-slate-900 xl:text-5xl">
            Organizational Knowledge Gap Intelligence Platform
          </h1>
          <p className="mt-5 max-w-md text-pretty text-base leading-relaxed text-slate-600">
            Surface hidden skill gaps, map organizational expertise, and make
            smarter workforce decisions with enterprise-grade analytics.
          </p>

          <ul className="mt-8 flex flex-col gap-3 text-sm text-slate-600">
            {[
              "Real-time skills gap analytics",
              "Team expertise mapping",
              "Actionable learning insights",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600/10 text-blue-700">
                  <FiArrowRight className="h-3.5 w-3.5" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mx-auto w-full max-w-md">
          <div className="rounded-3xl border border-white/60 bg-white/60 p-8 shadow-2xl shadow-blue-900/10 backdrop-blur-xl sm:p-10">
            <div className="mb-8 flex flex-col items-center text-center lg:hidden">
              <img
                src="/logo.png"
                alt="Company logo"
                className="h-14 w-14 rounded-2xl bg-white/70 p-1.5 shadow-sm ring-1 ring-white/60"
              />
              <h1 className="mt-4 text-balance text-lg font-bold leading-snug text-slate-900">
                Organizational Knowledge Gap Intelligence Platform
              </h1>
            </div>

            {done ? (
              <div className="flex flex-col items-center text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                  <FiCheckCircle className="h-9 w-9" />
                </span>
                <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
                  Password Reset
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  Your password has been updated. Redirecting you to login...
                </p>

                <Link
                  to="/login"
                  className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline"
                >
                  <FiArrowLeft className="h-4 w-4" />
                  Back to Login
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center lg:text-left">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                    Reset Password
                  </h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                    Choose a new password for your account.
                  </p>
                </div>

                {!token && (
                  <p className="mt-4 text-sm font-medium text-red-600">
                    No reset token found. Please use the link from your email.
                  </p>
                )}

                <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
                  <div>
                    <label
                      htmlFor="newPassword"
                      className="mb-1.5 block text-sm font-medium text-slate-700"
                    >
                      New Password
                    </label>
                    <div className="group relative">
                      <FiLock className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600" />
                      <input
                        id="newPassword"
                        type="password"
                        required
                        minLength={8}
                        autoComplete="new-password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        className="w-full rounded-xl border border-slate-200 bg-white/70 py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 shadow-sm outline-none transition-all duration-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/15"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="mb-1.5 block text-sm font-medium text-slate-700"
                    >
                      Confirm Password
                    </label>
                    <div className="group relative">
                      <FiLock className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600" />
                      <input
                        id="confirmPassword"
                        type="password"
                        required
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full rounded-xl border border-slate-200 bg-white/70 py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 shadow-sm outline-none transition-all duration-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/15"
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="text-sm font-medium text-red-600">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !token}
                    className="group mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30 active:translate-y-0 focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:bg-blue-600"
                  >
                    {loading ? (
                      <>
                        <FiLoader className="h-4 w-4 animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      <>
                        Reset Password
                        <FiArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </form>

                <p className="mt-8 text-center text-sm text-slate-600">
                  Remember your password?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline"
                  >
                    Back to Login
                  </Link>
                </p>
              </>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            &copy; {new Date().getFullYear()} KnowGap Intelligence. Enterprise
            edition.
          </p>
        </section>
      </div>
    </main>
  )
}