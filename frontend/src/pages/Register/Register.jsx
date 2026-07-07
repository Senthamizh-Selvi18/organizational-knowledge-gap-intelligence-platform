import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiBriefcase,
  FiCheck,
  FiX,
} from "react-icons/fi"
import { FcGoogle } from "react-icons/fc"
import { register, getRegisterableRoles } from "../../services/authService";

function getPasswordStrength(password) {
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (!password) return { score: 0, label: "", color: "", bar: "w-0" }
  if (score <= 1)
    return { score, label: "Weak", color: "text-red-600", bar: "w-1/4 bg-red-500" }
  if (score === 2)
    return {
      score,
      label: "Fair",
      color: "text-amber-600",
      bar: "w-2/4 bg-amber-500",
    }
  if (score === 3)
    return {
      score,
      label: "Good",
      color: "text-blue-600",
      bar: "w-3/4 bg-blue-500",
    }
  return {
    score,
    label: "Strong",
    color: "text-emerald-600",
    bar: "w-full bg-emerald-500",
  }
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [roles, setRoles] = useState([])
  const [rolesLoading, setRolesLoading] = useState(true)

  useEffect(() => {
    getRegisterableRoles()
      .then((data) => setRoles(data))
      .catch(() => alert("Failed to load roles. Please refresh the page."))
      .finally(() => setRolesLoading(false))
  }, [])

  const strength = getPasswordStrength(password)
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword
  const passwordsMismatch =
    confirmPassword.length > 0 && password !== confirmPassword

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fullName.trim()) {
      alert("Please enter your full name.");
      return;
    }
    if (!email.trim()) {
      alert("Please enter your email address.");
      return;
    }
    if (!password) {
      alert("Please enter a password.");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    if (!role) {
      alert("Please select a role.");
      return;
    }

    try {
      await register({
        name: fullName.trim(),
        email: email.trim(),
        password,
        roleId: Number(role),
      });

      alert("Registration successful!");
      navigate("/login");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (typeof err.response?.data === "string"
          ? err.response.data
          : null) ||
        err.message;
      alert(message || "Registration failed. Please try again.");
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 px-4 py-10 font-sans">
      {/* Decorative background */}
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
        {/* Left brand panel */}
        <section className="hidden flex-col justify-center lg:flex">
          <div className="flex items-center gap-3">
            {/*<img
              src="/logo.png"
              alt="Company logo"
              className="h-12 w-12 rounded-xl bg-white/60 p-1.5 shadow-sm ring-1 ring-white/60"
            />*/}
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

        {/* Register card */}
        <section className="mx-auto w-full max-w-md">
          <div className="rounded-3xl border border-white/60 bg-white/60 p-8 shadow-2xl shadow-blue-900/10 backdrop-blur-xl sm:p-10">
            {/* Mobile logo + title */}
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

            <div className="text-center lg:text-left">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Create Your Account
              </h2>
              <p className="mt-1.5 text-sm text-slate-500">
                Join the Organizational Knowledge Gap Intelligence Platform.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
              {/* Full Name */}
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Full Name
                </label>
                <div className="group relative">
                  <FiUser className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600" />
                  <input
                    id="fullName"
                    type="text"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full rounded-xl border border-slate-200 bg-white/70 py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 shadow-sm outline-none transition-all duration-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/15"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Email Address
                </label>
                <div className="group relative">
                  <FiMail className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full rounded-xl border border-slate-200 bg-white/70 py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 shadow-sm outline-none transition-all duration-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/15"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <div className="group relative">
                  <FiLock className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    className="w-full rounded-xl border border-slate-200 bg-white/70 py-3 pl-11 pr-11 text-sm text-slate-900 placeholder-slate-400 shadow-sm outline-none transition-all duration-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <FiEyeOff className="h-5 w-5" />
                    ) : (
                      <FiEye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {/* Password strength indicator (UI only) */}
                {password && (
                  <div className="mt-2">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${strength.bar}`}
                      />
                    </div>
                    <p
                      className={`mt-1 text-xs font-medium ${strength.color}`}
                      aria-live="polite"
                    >
                      Password strength: {strength.label}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
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
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className={`w-full rounded-xl border bg-white/70 py-3 pl-11 pr-11 text-sm text-slate-900 placeholder-slate-400 shadow-sm outline-none transition-all duration-200 focus:bg-white focus:ring-4 ${
                      passwordsMismatch
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/15"
                        : passwordsMatch
                          ? "border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/15"
                          : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/15"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  >
                    {showConfirm ? (
                      <FiEyeOff className="h-5 w-5" />
                    ) : (
                      <FiEye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {/* Confirm password match indicator (UI only) */}
                {confirmPassword && (
                  <p
                    className={`mt-1.5 flex items-center gap-1.5 text-xs font-medium ${
                      passwordsMatch ? "text-emerald-600" : "text-red-600"
                    }`}
                    aria-live="polite"
                  >
                    {passwordsMatch ? (
                      <>
                        <FiCheck className="h-3.5 w-3.5" /> Passwords match
                      </>
                    ) : (
                      <>
                        <FiX className="h-3.5 w-3.5" /> Passwords do not match
                      </>
                    )}
                  </p>
                )}
              </div>

              {/* Role dropdown */}
              <div>
                <label
                  htmlFor="role"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Role
                </label>
                <div className="group relative">
                  <FiBriefcase className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600" />
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    disabled={rolesLoading || roles.length === 0}
                    className={`w-full appearance-none rounded-xl border border-slate-200 bg-white/70 py-3 pl-11 pr-10 text-sm shadow-sm outline-none transition-all duration-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/15 ${
                      role ? "text-slate-900" : "text-slate-400"
                    }`}
                  >
                    <option value="" disabled>
                      {rolesLoading
                        ? "Loading roles..."
                        : roles.length === 0
                          ? "No roles available"
                          : "Select your role"}
                    </option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.roleName}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.4a.75.75 0 01-1.08 0l-4.25-4.4a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              {/* Register button */}
              <button
                type="submit"
                className="group mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30 active:translate-y-0 focus:outline-none focus:ring-4 focus:ring-blue-500/30"
              >
                Register
                <FiArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4">
                <span className="h-px flex-1 bg-slate-200" />
                <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  or
                </span>
                <span className="h-px flex-1 bg-slate-200" />
              </div>

              {/* Google */}
              <button
                type="button"
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white/80 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-md focus:outline-none focus:ring-4 focus:ring-slate-200"
              >
                <FcGoogle className="h-5 w-5" />
                Continue with Google
              </button>
            </form>

            {/* Login link */}
            <p className="mt-8 text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline"
              >
                Login
              </Link>
            </p>
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
