import { useState } from "react"
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"
import {
  FiAward,
  FiTarget,
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
  FiBell,
  FiBookOpen,
  FiUserCheck,
  FiActivity,
  FiEdit3,
  FiCheckSquare,
  FiBarChart2,
  FiArrowUpRight,
} from "react-icons/fi"
import DashboardLayout from "../../components/layout/DashboardLayout.jsx"

const STATS = [
  {
    label: "Total Skills",
    value: 42,
    delta: "+3 this month",
    icon: FiAward,
    accent: "text-blue-600",
    ring: "ring-blue-500/15",
    bg: "bg-blue-50",
  },
  {
    label: "Competencies",
    value: 18,
    delta: "+2 this month",
    icon: FiTarget,
    accent: "text-sky-600",
    ring: "ring-sky-500/15",
    bg: "bg-sky-50",
  },
  {
    label: "Completed Trainings",
    value: 27,
    delta: "+5 this quarter",
    icon: FiCheckCircle,
    accent: "text-emerald-600",
    ring: "ring-emerald-500/15",
    bg: "bg-emerald-50",
  },
  {
    label: "Pending Programs",
    value: 6,
    delta: "2 due soon",
    icon: FiClock,
    accent: "text-amber-600",
    ring: "ring-amber-500/15",
    bg: "bg-amber-50",
  },
]

const SKILLS = [
  { name: "React & Frontend", level: 88 },
  { name: "Data Analysis", level: 76 },
  { name: "Cloud Architecture", level: 64 },
  { name: "Project Management", level: 81 },
  { name: "Communication", level: 92 },
]

const COMPETENCY_DATA = [
  { area: "Technical", value: 85 },
  { area: "Leadership", value: 68 },
  { area: "Communication", value: 90 },
  { area: "Problem Solving", value: 78 },
  { area: "Collaboration", value: 82 },
  { area: "Innovation", value: 70 },
]

const TRAINING_PROGRESS = [
  { month: "Jan", completed: 3 },
  { month: "Feb", completed: 5 },
  { month: "Mar", completed: 4 },
  { month: "Apr", completed: 6 },
  { month: "May", completed: 5 },
  { month: "Jun", completed: 8 },
]

const NOTIFICATIONS = [
  {
    icon: FiBell,
    accent: "text-blue-600 bg-blue-50",
    title: "Q3 Skills Assessment is now open",
    meta: "Announcement · 2h ago",
  },
  {
    icon: FiBookOpen,
    accent: "text-amber-600 bg-amber-50",
    title: "Reminder: Complete 'Advanced SQL' by Friday",
    meta: "Training · 5h ago",
  },
  {
    icon: FiUserCheck,
    accent: "text-emerald-600 bg-emerald-50",
    title: "Your manager approved your learning path",
    meta: "Manager update · Yesterday",
  },
  {
    icon: FiBell,
    accent: "text-sky-600 bg-sky-50",
    title: "New mentorship program launching next week",
    meta: "Announcement · 2 days ago",
  },
]

const ACTIVITY = [
  {
    icon: FiEdit3,
    accent: "text-blue-600 bg-blue-50",
    title: "Updated your professional profile",
    meta: "Profile · Today, 9:24 AM",
  },
  {
    icon: FiCheckSquare,
    accent: "text-emerald-600 bg-emerald-50",
    title: "Completed 'Cloud Fundamentals' course",
    meta: "Training · Yesterday, 4:10 PM",
  },
  {
    icon: FiBarChart2,
    accent: "text-sky-600 bg-sky-50",
    title: "Finished Communication skill assessment",
    meta: "Assessment · 2 days ago",
  },
  {
    icon: FiEdit3,
    accent: "text-indigo-600 bg-indigo-50",
    title: "Added 'Kubernetes' to your skills",
    meta: "Profile · 3 days ago",
  },
]

const cardClass =
  "rounded-3xl border border-white/60 bg-white/60 shadow-2xl shadow-blue-900/10 backdrop-blur-xl"

function SkillBar({ name, level }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{name}</span>
        <span className="font-semibold text-slate-500">{level}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-sky-500 transition-all duration-700 ease-out"
          style={{ width: `${level}%` }}
        />
      </div>
    </div>
  )
}

export default function EmployeeDashboard() {
  const [today] = useState(
    new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  )

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* 1. Welcome Card */}
        <section
          className={`${cardClass} relative overflow-hidden p-6 sm:p-8`}
        >
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-blue-400/20 blur-3xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">{today}</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Welcome back, Sneha
              </h1>
              <p className="mt-2 max-w-xl text-pretty text-sm leading-relaxed text-slate-600">
                Every skill you sharpen closes a gap in your team. Keep learning,
                keep growing — you&apos;re on a strong streak this quarter.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-blue-600 px-5 py-4 text-white shadow-lg shadow-blue-600/25">
              <FiTrendingUp className="h-8 w-8" />
              <div>
                <p className="text-2xl font-bold leading-none">86%</p>
                <p className="mt-1 text-xs text-blue-100">Growth score</p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Statistics Cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {STATS.map(({ label, value, delta, icon: Icon, accent, ring, bg }) => (
            <div
              key={label}
              className={`${cardClass} group p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-blue-900/15`}
            >
              <div className="flex items-start justify-between">
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${bg} ${accent} ring-1 ${ring}`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <FiArrowUpRight className="h-4 w-4 text-slate-300 transition-colors group-hover:text-blue-500" />
              </div>
              <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
                {value}
              </p>
              <p className="mt-1 text-sm font-medium text-slate-500">{label}</p>
              <p className={`mt-2 text-xs font-medium ${accent}`}>{delta}</p>
            </div>
          ))}
        </section>

        {/* 3 & 4. Skills Overview + Competency Analytics */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Skills Overview */}
          <div className={`${cardClass} p-6`}>
            <div className="mb-5 flex items-center gap-2">
              <FiAward className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">Skills Overview</h2>
            </div>
            <div className="flex flex-col gap-5">
              {SKILLS.map((s) => (
                <SkillBar key={s.name} name={s.name} level={s.level} />
              ))}
            </div>
          </div>

          {/* Competency Analytics */}
          <div className={`${cardClass} p-6`}>
            <div className="mb-2 flex items-center gap-2">
              <FiTarget className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Competency Analytics
              </h2>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={COMPETENCY_DATA} outerRadius="72%">
                  <PolarGrid stroke="#cbd5e1" />
                  <PolarAngleAxis
                    dataKey="area"
                    tick={{ fill: "#475569", fontSize: 12 }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fill: "#94a3b8", fontSize: 10 }}
                    axisLine={false}
                  />
                  <Radar
                    name="Competency"
                    dataKey="value"
                    stroke="#2563eb"
                    fill="#3b82f6"
                    fillOpacity={0.35}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "0.75rem",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 10px 30px rgba(30,58,138,0.12)",
                      fontSize: "12px",
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Training progress bar chart */}
        <section className={`${cardClass} p-6`}>
          <div className="mb-4 flex items-center gap-2">
            <FiBarChart2 className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">
              Training Completed (Last 6 Months)
            </h2>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={TRAINING_PROGRESS} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#475569", fontSize: 12 }}
                  axisLine={{ stroke: "#cbd5e1" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(59,130,246,0.08)" }}
                  contentStyle={{
                    borderRadius: "0.75rem",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 10px 30px rgba(30,58,138,0.12)",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="completed" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 5 & 6. Notifications + Recent Activity */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Notifications */}
          <div className={`${cardClass} p-6`}>
            <div className="mb-5 flex items-center gap-2">
              <FiBell className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">Notifications</h2>
            </div>
            <ul className="flex flex-col gap-2">
              {NOTIFICATIONS.map((n, i) => (
                <li
                  key={i}
                  className="group flex items-start gap-3 rounded-2xl border border-transparent p-3 transition-all duration-200 hover:border-slate-200 hover:bg-white/70"
                >
                  <span
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${n.accent}`}
                  >
                    <n.icon className="h-4.5 w-4.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800">
                      {n.title}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">{n.meta}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Recent Activity */}
          <div className={`${cardClass} p-6`}>
            <div className="mb-5 flex items-center gap-2">
              <FiActivity className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
            </div>
            <ol className="relative flex flex-col gap-1 border-l border-slate-200 pl-4">
              {ACTIVITY.map((a, i) => (
                <li key={i} className="group relative pb-4 last:pb-0">
                  <span
                    className={`absolute -left-[1.55rem] flex h-8 w-8 items-center justify-center rounded-xl ${a.accent} ring-4 ring-white/70`}
                  >
                    <a.icon className="h-4 w-4" />
                  </span>
                  <div className="rounded-2xl p-2 transition-colors duration-200 group-hover:bg-white/70">
                    <p className="text-sm font-medium text-slate-800">
                      {a.title}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">{a.meta}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}
