import { useState, useEffect } from "react"
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
  FiGrid,
} from "react-icons/fi"
import DashboardLayout from "../../components/layout/DashboardLayout.jsx"
import EmployeeGapAnalysis from "../EmployeeGapAnalysis/EmployeeGapAnalysis";
import {
  getDashboardStats,
  getSkillsOverview,
  getCompetencyAnalytics,
  getTrainingProgress,
  getNotifications,
  getRecentActivity,
  getSkillGapHeatmap,
} from "../../services/dashboardService"

// ---------------------------------------------------------------------------
// FALLBACK / DEFAULT DATA
// Used whenever a real backend endpoint isn't available yet, or the call
// fails for any reason. This guarantees the dashboard never renders blank
// or broken, even before Members 1-4 finish their APIs.
// ---------------------------------------------------------------------------

const DEFAULT_STATS = [
  {
    label: "Total Skills",
    value: 42,
    delta: "+3 this month",
    icon: FiAward,
    accent: "text-primary",
    ring: "ring-primary/15",
    bg: "bg-primary-tint",
  },
  {
    label: "Competencies",
    value: 18,
    delta: "+2 this month",
    icon: FiTarget,
    accent: "text-primary",
    ring: "ring-primary/15",
    bg: "bg-primary-tint",
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

// Icon/color metadata cannot come from a JSON API, so real stats data is
// merged into this shape by label when it arrives (see mergeStats below).
const STAT_ICON_MAP = {
  "Total Skills": { icon: FiAward, accent: "text-primary", ring: "ring-primary/15", bg: "bg-primary-tint" },
  "Competencies": { icon: FiTarget, accent: "text-primary", ring: "ring-primary/15", bg: "bg-primary-tint" },
  "Completed Trainings": { icon: FiCheckCircle, accent: "text-emerald-600", ring: "ring-emerald-500/15", bg: "bg-emerald-50" },
  "Pending Programs": { icon: FiClock, accent: "text-amber-600", ring: "ring-amber-500/15", bg: "bg-amber-50" },
}

const DEFAULT_SKILLS = [
  { name: "React & Frontend", level: 88 },
  { name: "Data Analysis", level: 76 },
  { name: "Cloud Architecture", level: 64 },
  { name: "Project Management", level: 81 },
  { name: "Communication", level: 92 },
]

const DEFAULT_COMPETENCY_DATA = [
  { area: "Technical", value: 85 },
  { area: "Leadership", value: 68 },
  { area: "Communication", value: 90 },
  { area: "Problem Solving", value: 78 },
  { area: "Collaboration", value: 82 },
  { area: "Innovation", value: 70 },
]

const DEFAULT_TRAINING_PROGRESS = [
  { month: "Jan", completed: 3 },
  { month: "Feb", completed: 5 },
  { month: "Mar", completed: 4 },
  { month: "Apr", completed: 6 },
  { month: "May", completed: 5 },
  { month: "Jun", completed: 8 },
]

const DEFAULT_NOTIFICATIONS = [
  {
    icon: FiBell,
    accent: "text-primary bg-primary-tint",
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
    accent: "text-primary bg-primary-tint",
    title: "New mentorship program launching next week",
    meta: "Announcement · 2 days ago",
  },
]

const NOTIFICATION_ICON_MAP = {
  bell: FiBell,
  book: FiBookOpen,
  user: FiUserCheck,
}

const DEFAULT_ACTIVITY = [
  {
    icon: FiEdit3,
    accent: "text-primary bg-primary-tint",
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
    accent: "text-primary bg-primary-tint",
    title: "Finished Communication skill assessment",
    meta: "Assessment · 2 days ago",
  },
  {
    icon: FiEdit3,
    accent: "text-primary bg-indigo-50",
    title: "Added 'Kubernetes' to your skills",
    meta: "Profile · 3 days ago",
  },
]

const ACTIVITY_ICON_MAP = {
  edit: FiEdit3,
  check: FiCheckSquare,
  chart: FiBarChart2,
}

// Dummy skill-gap heatmap data: rows = employees, columns = skills.
// value: 0-100, where higher = smaller gap (more proficient),
// lower = bigger gap (needs training).
const DEFAULT_HEATMAP_SKILLS = ["Java", "Spring Boot", "React.js", "PostgreSQL", "AWS", "Docker"]

const DEFAULT_HEATMAP_DATA = [
  { employee: "Senthamizh", values: [90, 85, 80, 78, 40, 35] },
  { employee: "Sneha", values: [55, 60, 88, 45, 30, 20] },
  { employee: "Arjun", values: [70, 75, 65, 82, 60, 55] },
  { employee: "Priya", values: [95, 92, 70, 88, 75, 65] },
  { employee: "Karthik", values: [40, 35, 90, 30, 25, 15] },
]

function getHeatmapColor(value) {
  // 0-39: red (critical gap), 40-59: orange, 60-79: yellow, 80-100: green
  if (value >= 80) return "bg-emerald-500"
  if (value >= 60) return "bg-lime-400"
  if (value >= 40) return "bg-amber-400"
  return "bg-red-500"
}

function getHeatmapTextColor(value) {
  if (value >= 60) return "text-text"
  return "text-white"
}

const cardClass =
  "rounded-3xl border border-line bg-panel shadow-2xl shadow-blue-900/10 backdrop-blur-xl"

function SkillBar({ name, level }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
       <span className="font-medium text-text">{name}</span>
        <span className="font-semibold text-sub dark:text-mute">{level}%</span>
      </div>
     <div className="h-2 w-full overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-sky-500 transition-all duration-700 ease-out"
          style={{ width: `${level}%` }}
        />
      </div>
    </div>
  )
}

export default function EmployeeDashboard() {
  const userName = localStorage.getItem("name") || "User";
  const [today] = useState(
    new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  )

  const [stats, setStats] = useState(DEFAULT_STATS)
  const [growthScore, setGrowthScore] = useState(86)
  const [skills, setSkills] = useState(DEFAULT_SKILLS)
  const [competencyData, setCompetencyData] = useState(DEFAULT_COMPETENCY_DATA)
  const [trainingProgress, setTrainingProgress] = useState(DEFAULT_TRAINING_PROGRESS)
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS)
  const [activity, setActivity] = useState(DEFAULT_ACTIVITY)
  const [heatmapSkills, setHeatmapSkills] = useState(DEFAULT_HEATMAP_SKILLS)
  const [heatmapData, setHeatmapData] = useState(DEFAULT_HEATMAP_DATA)

  useEffect(() => {

    // Each section fetches independently and falls back to its own default
    // data on failure, so one missing/broken endpoint never blanks out the
    // rest of the dashboard.

    getDashboardStats()
      .then((data) => {
        if (Array.isArray(data?.stats) && data.stats.length > 0) {
          const merged = data.stats.map((s) => ({
            ...s,
            ...(STAT_ICON_MAP[s.label] || {
              icon: FiAward,
              accent: "text-primary",
              ring: "ring-primary/15",
              bg: "bg-primary-tint",
            }),
          }))
          setStats(merged)
        }
        if (typeof data?.growthScore === "number") {
          setGrowthScore(data.growthScore)
        }
      })
      .catch((error) => {
        console.log("Dashboard stats unavailable, using defaults:", error)
      })

    getSkillsOverview()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // Real backend field names for EmployeeSkillResponseDTO aren't
          // confirmed yet, so we defensively check common variants here.
          // This guarantees the chart never breaks/crashes even if the
          // exact field names differ from what's guessed below — worst
          // case a row shows a generic label until confirmed.
          const mapped = data.map((s) => ({
            name: s.skillName ?? s.name ?? s.skill ?? "Skill",
            level: Number(s.proficiencyLevel ?? s.level ?? s.score ?? s.proficiency ?? 0),
          }))
          setSkills(mapped)
        }
      })
      .catch((error) => {
        console.log("Skills overview unavailable, using defaults:", error)
      })

    getCompetencyAnalytics()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCompetencyData(data)
        }
      })
      .catch((error) => {
        console.log("Competency analytics unavailable, using defaults:", error)
      })

    getTrainingProgress()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setTrainingProgress(data)
        }
      })
      .catch((error) => {
        console.log("Training progress unavailable, using defaults:", error)
      })

    getNotifications()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((n) => ({
            ...n,
            icon: NOTIFICATION_ICON_MAP[n.iconKey] || FiBell,
          }))
          setNotifications(mapped)
        }
      })
      .catch((error) => {
        console.log("Notifications unavailable, using defaults:", error)
      })

    getRecentActivity()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((a) => ({
            ...a,
            icon: ACTIVITY_ICON_MAP[a.iconKey] || FiEdit3,
          }))
          setActivity(mapped)
        }
      })
      .catch((error) => {
        console.log("Recent activity unavailable, using defaults:", error)
      })

    getSkillGapHeatmap()
      .then((data) => {
        if (Array.isArray(data?.skills) && Array.isArray(data?.employees) && data.skills.length > 0) {
          setHeatmapSkills(data.skills)
          setHeatmapData(data.employees)
        }
      })
      .catch((error) => {
        console.log("Skill gap heatmap unavailable, using defaults:", error)
      })

  }, [])

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* 1. Welcome Card */}
        <section
          className={`${cardClass} relative overflow-hidden p-6 sm:p-8`}
        >
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-primary">{today}</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-text sm:text-3xl">
                Welcome back, {userName}
              </h1>
              <p className="mt-2 max-w-xl text-pretty text-sm leading-relaxed text-sub">
                Every skill you sharpen closes a gap in your team. Keep learning,
                keep growing — you&apos;re on a strong streak this quarter.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-primary px-5 py-4 text-white shadow-lg shadow-blue-600/25">
              <FiTrendingUp className="h-8 w-8" />
              <div>
                <p className="text-2xl font-bold leading-none">{growthScore}%</p>
                <p className="mt-1 text-xs text-primary-tint">Growth score</p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Statistics Cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ label, value, delta, icon: Icon, accent, ring, bg }) => (
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
                <FiArrowUpRight className="h-4 w-4 text-sub transition-colors group-hover:text-primary" />
              </div>
              <p className="mt-4 text-3xl font-bold tracking-tight text-text">
                {value}
              </p>
              <p className="mt-1 text-sm font-medium text-sub">{label}</p>
              <p className={`mt-2 text-xs font-medium ${accent}`}>{delta}</p>
            </div>
          ))}
        </section>
        {/* My Gap Analysis */}
          <EmployeeGapAnalysis />
        {/* 3 & 4. Skills Overview + Competency Analytics */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Skills Overview */}
          <div className={`${cardClass} p-6`}>
            <div className="mb-5 flex items-center gap-2">
              <FiAward className="h-5 w-5 text-primary" />
             <h2 className="text-lg font-bold text-text">Skills Overview</h2>
            </div>
            <div className="flex flex-col gap-5">
              {skills.map((s) => (
                <SkillBar key={s.name} name={s.name} level={s.level} />
              ))}
            </div>
          </div>

          {/* Competency Analytics */}
          <div className={`${cardClass} p-6`}>
            <div className="mb-2 flex items-center gap-2">
              <FiTarget className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-text">
                Competency Analytics
              </h2>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={competencyData} outerRadius="72%">
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
            <FiBarChart2 className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-text">
              Training Completed (Last 6 Months)
            </h2>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trainingProgress} barCategoryGap="30%">
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

        {/* NEW: Skill Gap Heatmap */}
        <section className={`${cardClass} p-6`}>
          <div className="mb-5 flex items-center gap-2">
            <FiGrid className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-text">
              Skill Gap Heatmap
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] border-separate border-spacing-1">
              <thead>
                <tr>
                  <th className="p-2 text-left text-xs font-semibold text-sub dark:text-mute">
                    Employee
                  </th>
                  {heatmapSkills.map((skillName) => (
                    <th
                      key={skillName}
                      className="p-2 text-center text-xs font-semibold text-sub dark:text-mute"
                    >
                      {skillName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heatmapData.map((row) => (
                  <tr key={row.employee}>
                    <td className="whitespace-nowrap p-2 text-sm font-medium text-text">
                      {row.employee}
                    </td>
                    {row.values.map((value, colIndex) => (
                      <td key={colIndex} className="p-1">
                        <div
                          className={`flex h-10 w-full min-w-[56px] items-center justify-center rounded-lg text-xs font-semibold transition-transform duration-150 hover:scale-105 ${getHeatmapColor(value)} ${getHeatmapTextColor(value)}`}
                          title={`${row.employee} — ${heatmapSkills[colIndex]}: ${value}%`}
                        >
                          {value}%
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-sub dark:text-mute">
            <span className="font-medium">Legend:</span>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-red-500" /> Critical gap (&lt;40%)
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-amber-400" /> Needs training (40-59%)
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-lime-400" /> Developing (60-79%)
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-emerald-500" /> Proficient (80%+)
            </div>
          </div>
        </section>

        {/* 5 & 6. Notifications + Recent Activity */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Notifications */}
          <div className={`${cardClass} p-6`}>
            <div className="mb-5 flex items-center gap-2">
              <FiBell className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-text">Notifications</h2>
            </div>
            <ul className="flex flex-col gap-2">
              {notifications.map((n, i) => (
                <li
                  key={i}
                  className="group flex items-start gap-3 rounded-2xl border border-transparent p-3 transition-all duration-200 hover:border-line hover:bg-panel/70 dark:hover:bg-line"
                >
                  <span
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${n.accent}`}
                  >
                    <n.icon className="h-4.5 w-4.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text">
                      {n.title}
                    </p>
                    <p className="mt-0.5 text-xs text-mute dark:text-sub">{n.meta}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Recent Activity */}
          <div className={`${cardClass} p-6`}>
            <div className="mb-5 flex items-center gap-2">
              <FiActivity className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-text">Recent Activity</h2>
            </div>
            <ol className="relative flex flex-col gap-1 border-l border-line pl-4">
              {activity.map((a, i) => (
                <li key={i} className="group relative pb-4 last:pb-0">
                  <span
                    className={`absolute -left-[1.55rem] flex h-8 w-8 items-center justify-center rounded-xl ${a.accent} ring-4 ring-white/70`}
                  >
                    <a.icon className="h-4 w-4" />
                  </span>
                  <div className="rounded-2xl p-2 transition-colors duration-200 group-hover:bg-panel/70 dark:hover:bg-line">
                    <p className="text-sm font-medium text-text">
                      {a.title}
                    </p>
                    <p className="mt-0.5 text-xs text-mute">{a.meta}</p>
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