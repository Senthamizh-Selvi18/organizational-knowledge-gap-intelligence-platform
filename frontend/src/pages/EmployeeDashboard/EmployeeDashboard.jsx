import { useState, useEffect } from "react";
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
} from "recharts";

import {
  FiAward,
  FiTarget,
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
  FiBell,
  FiActivity,
  FiBarChart2,
  FiGrid,
  FiUser,
  FiBriefcase,
} from "react-icons/fi";
import { LabelList } from "recharts";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import {
  getDashboardStats,
  getSkillsOverview,
  getCompetencyAnalytics,
  getNotifications,
  getRecentActivity,
  getSkillGapHeatmap,
} from "../../services/dashboardService";

import { getLearningDashboard } from "../../services/learningService";

/* =========================================================
   CARD STYLE
========================================================= */

const cardClass =
  "rounded-3xl border border-line bg-panel shadow-2xl shadow-blue-900/10 backdrop-blur-xl";

/* =========================================================
   STAT CARD STYLES
   Only UI styling is static.
   Values will come from real data.
========================================================= */

const STAT_CONFIG = {
  "Total Skills": {
    icon: FiAward,
    accent: "text-primary",
    ring: "ring-primary/15",
    bg: "bg-primary-tint",
  },

  Competencies: {
    icon: FiTarget,
    accent: "text-primary",
    ring: "ring-primary/15",
    bg: "bg-primary-tint",
  },

  "Completed Trainings": {
    icon: FiCheckCircle,
    accent: "text-emerald-600",
    ring: "ring-emerald-500/15",
    bg: "bg-emerald-50",
  },

  "Pending Programs": {
    icon: FiClock,
    accent: "text-amber-600",
    ring: "ring-amber-500/15",
    bg: "bg-amber-50",
  },
};

/* =========================================================
   EMPTY CHART DATA
   These are only chart labels, not fake employee values.
========================================================= */

const EMPTY_COMPETENCY_DATA = [
  { area: "Technical", value: 0 },
  { area: "Leadership", value: 0 },
  { area: "Communication", value: 0 },
  { area: "Problem Solving", value: 0 },
  { area: "Collaboration", value: 0 },
  { area: "Innovation", value: 0 },
];

const EMPTY_TRAINING_PROGRESS = [
  { month: "Jan", completed: 0 },
  { month: "Feb", completed: 0 },
  { month: "Mar", completed: 0 },
  { month: "Apr", completed: 0 },
  { month: "May", completed: 0 },
  { month: "Jun", completed: 0 },
];

/* =========================================================
   SKILL BAR

   Important:
   null proficiencyLevel = Not Assessed
   It should NOT be displayed as 0%.
========================================================= */

function SkillBar({ name, level }) {
  const isAssessed =
    level !== null &&
    level !== undefined &&
    level !== "";

  const numericLevel = isAssessed ? Number(level) : null;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-medium text-text">{name}</span>

        <span className="font-semibold text-sub dark:text-mute">
          {isAssessed && !Number.isNaN(numericLevel)
            ? `${numericLevel}%`
            : "Not Assessed"}
        </span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-sky-500 transition-all duration-700 ease-out"
          style={{
            width:
              isAssessed && !Number.isNaN(numericLevel)
                ? `${Math.min(Math.max(numericLevel, 0), 100)}%`
                : "0%",
          }}
        />
      </div>
    </div>
  );
}

/* =========================================================
   HEATMAP HELPERS
========================================================= */

function getHeatmapColor(value) {
  if (value === null || value === undefined) {
    return "bg-gray-200";
  }

  if (value >= 80) return "bg-emerald-500";
  if (value >= 60) return "bg-lime-400";
  if (value >= 40) return "bg-amber-400";

  return "bg-red-500";
}

function getHeatmapTextColor(value) {
  if (value === null || value === undefined) {
    return "text-gray-600";
  }

  if (value >= 60) return "text-text";

  return "text-white";
}
const formatDateTime = (dateTime) => {
  if (!dateTime) return "";

  const date = new Date(dateTime);

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/* =========================================================
   EMPLOYEE DASHBOARD
========================================================= */

export default function EmployeeDashboard() {
  /* -------------------------------------------------------
     Logged-in user information
  ------------------------------------------------------- */

  const userName = localStorage.getItem("name") || "User";

  const userRole =
    localStorage.getItem("role") ||
    "Employee";

  const [today] = useState(
    new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  );

  /* -------------------------------------------------------
     Employee-specific states
  ------------------------------------------------------- */

  const [skills, setSkills] = useState([]);

  const [employeeInfo, setEmployeeInfo] = useState({
    department: "",
    designation: "",
  });

  const [growthScore, setGrowthScore] = useState(null);

  const [stats, setStats] = useState([
    {
      label: "Total Skills",
      value: 0,
      delta: "Assigned skills",
      ...STAT_CONFIG["Total Skills"],
    },
    {
      label: "Competencies",
      value: "—",
      delta: "No data available",
      ...STAT_CONFIG["Competencies"],
    },
    {
      label: "Completed Trainings",
      value: "—",
      delta: "No data available",
      ...STAT_CONFIG["Completed Trainings"],
    },
    {
      label: "Pending Programs",
      value: "—",
      delta: "No data available",
      ...STAT_CONFIG["Pending Programs"],
    },
  ]);

  const [competencyData, setCompetencyData] =
    useState(EMPTY_COMPETENCY_DATA);

  const [hasCompetencyData, setHasCompetencyData] =
    useState(false);

  const [trainingProgress, setTrainingProgress] =
    useState(EMPTY_TRAINING_PROGRESS);

  const [hasTrainingData, setHasTrainingData] =
    useState(false);

  const [notifications, setNotifications] =
    useState([]);

  const [activity, setActivity] =
    useState([]);

  const [heatmapSkills, setHeatmapSkills] =
    useState([]);

  const [heatmapData, setHeatmapData] =
    useState([]);

  const [loadingSkills, setLoadingSkills] =
    useState(true);

  /* =======================================================
     LOAD DASHBOARD DATA
  ======================================================= */

  useEffect(() => {
    /* -----------------------------------------------------
       1. LOAD LOGGED-IN EMPLOYEE SKILLS

       Your API currently returns:

       [
         {
           skillId: 1,
           skillName: "Java",
           proficiencyLevel: null
         }
       ]

       We preserve null instead of converting it to zero.
    ----------------------------------------------------- */

    const loadSkills = async () => {
      try {
        setLoadingSkills(true);

        const data = await getSkillsOverview();

        if (Array.isArray(data)) {
          const mappedSkills = data.map((skill) => ({
            id: skill.skillId,
            name:
              skill.skillName ||
              skill.name ||
              "Skill",

            level:
              skill.proficiencyLevel === null ||
              skill.proficiencyLevel === undefined
                ? null
                : Number(skill.proficiencyLevel),
          }));

          setSkills(mappedSkills);

          /* Total Skills is now employee-specific */

          setStats((previousStats) =>
            previousStats.map((stat) =>
              stat.label === "Total Skills"
                ? {
                    ...stat,
                    value: mappedSkills.length,
                    delta:
                      mappedSkills.length === 1
                        ? "1 assigned skill"
                        : `${mappedSkills.length} assigned skills`,
                  }
                : stat
            )
          );
        } else {
          setSkills([]);
        }
      } catch (error) {
        console.error(
          "Unable to load employee skills:",
          error
        );

        setSkills([]);
      } finally {
        setLoadingSkills(false);
      }
    };

    loadSkills();

    /* -----------------------------------------------------
       2. DASHBOARD STATS

       Only use values if backend actually returns them.
       We do NOT restore old fake fallback numbers.
    ----------------------------------------------------- */

    getDashboardStats()
      .then((data) => {
        if (
          typeof data?.growthScore === "number"
        ) {
          setGrowthScore(data.growthScore);
        }

        if (
          Array.isArray(data?.stats) &&
          data.stats.length > 0
        ) {
          setStats((previousStats) =>
            previousStats.map((currentStat) => {
              /*
               Do not overwrite Total Skills here.

               Total Skills is calculated directly from
               the logged-in employee's actual skills.
              */

              if (
                currentStat.label === "Total Skills"
              ) {
                return currentStat;
              }

              const backendStat =
                data.stats.find(
                  (item) =>
                    item.label === currentStat.label
                );

              if (!backendStat) {
                return currentStat;
              }

              return {
                ...currentStat,
                value:
                  backendStat.value ?? "—",
                delta:
                  backendStat.delta ||
                  "Current data",
              };
            })
          );
        }
      })
      .catch((error) => {
        console.log(
          "Dashboard stats unavailable:",
          error
        );
      });

    /* -----------------------------------------------------
       3. COMPETENCY ANALYTICS
    ----------------------------------------------------- */

   getCompetencyAnalytics()
  .then((data) => {
    const competencies = data?.competencies || [];

    if (competencies.length > 0) {

      const levelToPercentage = {
        Beginner: 25,
        Intermediate: 50,
        Advanced: 75,
        Expert: 100,
      };

      const mapped = competencies.map((item) => ({
        area: item.skillName || "Competency",
        value: levelToPercentage[item.level] || 0,
      }));

      setCompetencyData(mapped);

      setHasCompetencyData(true);

      setStats((previousStats) =>
        previousStats.map((stat) =>
          stat.label === "Competencies"
            ? {
                ...stat,
                value: data.totalCompetencies,
                delta: `${data.totalCompetencies} competencies`,
              }
            : stat
        )
      );
    } else {
      setHasCompetencyData(false);
    }
  })
  .catch((error) => {
    console.log(
      "Competency analytics unavailable:",
      error
    );

    setHasCompetencyData(false);
  });
    /* -----------------------------------------------------
       4. TRAINING PROGRESS
    ----------------------------------------------------- */

    const employeeId = Number(localStorage.getItem("employeeId"));

if (employeeId) {
  getLearningDashboard(employeeId)
    .then((response) => {

      const data = response.data;

      setTrainingProgress([
  {
    name: "Enrolled",
    value: data.enrolled,
  },
  {
    name: "Completed",
    value: data.completed,
  },
  {
    name: "In Progress",
    value: data.pending,
  },
]);

setHasTrainingData(true);
      setStats((previousStats) =>
        previousStats.map((stat) => {

          if (stat.label === "Completed Trainings") {
            return {
              ...stat,
              value: data.completed,
              delta: `${data.completed} completed trainings`,
            };
          }

          if (stat.label === "Pending Programs") {
            return {
              ...stat,
              value: data.pending,
              delta: `${data.pending} training(s) in progress`,
            };
          }

          return stat;
        })
      );

    })
    .catch((error) => {
      console.error(error);
    });
}

    /* -----------------------------------------------------
       5. NOTIFICATIONS

       No dummy notifications are shown if API fails.
    ----------------------------------------------------- */

    getNotifications()
      .then((data) => {
        if (Array.isArray(data)) {
          setNotifications(data);
        }
      })
      .catch((error) => {
        console.log(
          "Notifications unavailable:",
          error
        );

        setNotifications([]);
      });

    /* -----------------------------------------------------
       6. RECENT ACTIVITY

       No dummy activity is shown if API fails.
    ----------------------------------------------------- */

    getRecentActivity()
      .then((data) => {
        if (Array.isArray(data)) {
          setActivity(data);
        }
      })
      .catch((error) => {
        console.log(
          "Recent activity unavailable:",
          error
        );

        setActivity([]);
      });

    /* -----------------------------------------------------
       7. SKILL GAP HEATMAP

       We only keep the logged-in employee's row.
       An Employee/Intern should not see every employee.
    ----------------------------------------------------- */

    getSkillGapHeatmap()
      .then((data) => {
        if (
          Array.isArray(data?.skills) &&
          Array.isArray(data?.employees)
        ) {
          const currentEmployee =
            data.employees.find(
              (employee) =>
                employee.employee
                  ?.trim()
                  .toLowerCase() ===
                userName
                  .trim()
                  .toLowerCase()
            );

          if (currentEmployee) {
            setHeatmapSkills(data.skills);

            setHeatmapData([
              currentEmployee,
            ]);
          } else {
            setHeatmapSkills([]);
            setHeatmapData([]);
          }
        }
      })
      .catch((error) => {
        console.log(
          "Skill gap heatmap unavailable:",
          error
        );

        setHeatmapSkills([]);
        setHeatmapData([]);
      });
  }, [userName]);

  /* =======================================================
     CALCULATED VALUES
  ======================================================= */

  const assessedSkills =
    skills.filter(
      (skill) =>
        skill.level !== null &&
        !Number.isNaN(skill.level)
    );

  const calculatedGrowthScore =
    assessedSkills.length > 0
      ? Math.round(
          assessedSkills.reduce(
            (total, skill) =>
              total + skill.level,
            0
          ) / assessedSkills.length
        )
      : null;

  /*
   Prefer a genuine backend growth score.

   If unavailable, use average assessed skill proficiency.

   If the employee has not been assessed yet,
   display "Not Available".
  */

  const displayedGrowthScore =
    growthScore !== null
      ? growthScore
      : calculatedGrowthScore;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">

        {/* =================================================
            WELCOME SECTION
        ================================================= */}

        <section
          className={`${cardClass} relative overflow-hidden p-6 sm:p-8`}
        >
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-sm font-medium text-primary">
                {today}
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-text sm:text-3xl">
                Welcome back, {userName}
              </h1>

              {/* Logged-in role */}

              <div className="mt-3 flex flex-wrap gap-2">

                <span className="inline-flex items-center gap-2 rounded-full bg-primary-tint px-3 py-1 text-xs font-semibold text-primary">
                  <FiUser />
                  {userRole}
                </span>

                {employeeInfo.designation && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    <FiBriefcase />
                    {employeeInfo.designation}
                  </span>
                )}

                {employeeInfo.department && (
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                    {employeeInfo.department}
                  </span>
                )}

              </div>

              <p className="mt-3 max-w-xl text-pretty text-sm leading-relaxed text-sub">
                Track your skills, assessments and
                learning progress in one place.
              </p>
            </div>

            {/* Growth Score */}

            <div className="flex items-center gap-3 rounded-2xl bg-primary px-5 py-4 text-white shadow-lg shadow-blue-600/25">

              <FiTrendingUp className="h-8 w-8" />

              <div>
                <p className="text-2xl font-bold leading-none">
                  {displayedGrowthScore !== null
                    ? `${displayedGrowthScore}%`
                    : "—"}
                </p>

                <p className="mt-1 text-xs text-primary-tint">
                  {displayedGrowthScore !== null
                    ? "Growth score"
                    : "Not assessed yet"}
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* =================================================
            STATISTICS
        ================================================= */}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {stats.map(
            ({
              label,
              value,
              delta,
              icon: Icon,
              accent,
              ring,
              bg,
            }) => (

              <div
                key={label}
                className={`${cardClass} p-5 transition-all duration-200 hover:-translate-y-1`}
              >

                <div className="flex items-start justify-between">

                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${bg} ${accent} ring-1 ${ring}`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>

                </div>

                <p className="mt-4 text-3xl font-bold tracking-tight text-text">
                  {value}
                </p>

                <p className="mt-1 text-sm font-medium text-sub">
                  {label}
                </p>

                <p
                  className={`mt-2 text-xs font-medium ${accent}`}
                >
                  {delta}
                </p>

              </div>
            )
          )}

        </section>

        {/* =================================================
            SKILLS + COMPETENCY SECTION
        ================================================= */}

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* SKILLS OVERVIEW */}

          <div className={`${cardClass} p-6`}>

            <div className="mb-5 flex items-center justify-between">

              <div className="flex items-center gap-2">

                <FiAward className="h-5 w-5 text-primary" />

                <h2 className="text-lg font-bold text-text">
                  My Skills Overview
                </h2>

              </div>

              {!loadingSkills && (
                <span className="rounded-full bg-primary-tint px-3 py-1 text-xs font-semibold text-primary">
                  {skills.length} Skills
                </span>
              )}

            </div>

            {loadingSkills ? (

              <div className="py-12 text-center text-sm text-sub">
                Loading your skills...
              </div>

            ) : skills.length > 0 ? (

              <div className="flex flex-col gap-5">

                {skills.map((skill) => (
                  <SkillBar
                    key={
                      skill.id ||
                      skill.name
                    }
                    name={skill.name}
                    level={skill.level}
                  />
                ))}

                {assessedSkills.length === 0 && (

                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">

                    <p className="text-sm font-semibold text-amber-800">
                      Skills assigned, assessment pending
                    </p>

                    <p className="mt-1 text-xs leading-relaxed text-amber-700">
                      You have {skills.length} assigned{" "}
                      {skills.length === 1
                        ? "skill"
                        : "skills"}
                      , but proficiency levels have not
                      been recorded yet.
                    </p>

                  </div>
                )}

              </div>

            ) : (

              <div className="py-12 text-center">

                <FiAward className="mx-auto h-10 w-10 text-mute" />

                <p className="mt-3 font-medium text-text">
                  No skills assigned
                </p>

                <p className="mt-1 text-sm text-sub">
                  Your assigned skills will appear here.
                </p>

              </div>
            )}

          </div>

          {/* COMPETENCY ANALYTICS */}

          <div className={`${cardClass} p-6`}>

            <div className="mb-2 flex items-center gap-2">

              <FiTarget className="h-5 w-5 text-primary" />

              <h2 className="text-lg font-bold text-text">
                My Competency Analytics
              </h2>

            </div>

            {hasCompetencyData ? (

              <div className="h-64 w-full">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <RadarChart
                    data={competencyData}
                    outerRadius="72%"
                  >

                    <PolarGrid stroke="#cbd5e1" />

                    <PolarAngleAxis
                      dataKey="area"
                      tick={{
                        fill: "#475569",
                        fontSize: 12,
                      }}
                    />

                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tick={{
                        fill: "#94a3b8",
                        fontSize: 10,
                      }}
                      axisLine={false}
                    />

                    <Radar
                      name="Competency"
                      dataKey="value"
                      stroke="#2563eb"
                      fill="#3b82f6"
                      fillOpacity={0.35}
                    />

                    <Tooltip />

                  </RadarChart>

                </ResponsiveContainer>

              </div>

            ) : (

              <div className="flex h-64 flex-col items-center justify-center text-center">

                <FiTarget className="h-10 w-10 text-mute" />

                <p className="mt-3 font-medium text-text">
                  No competency data available
                </p>

                <p className="mt-1 max-w-xs text-sm text-sub">
                  Your competency analytics will appear
                  after competency assessments are
                  available.
                </p>

              </div>
            )}

          </div>

        </section>
                {/* =================================================
            TRAINING PROGRESS
        ================================================= */}

        <section className="grid grid-cols-1 gap-6">

          <div className={`${cardClass} p-6`}>

            <div className="mb-5 flex items-center justify-between">

              <div className="flex items-center gap-2">
                 <FiBarChart2 className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <h2 className="text-lg font-bold text-text">
                        Learning Analytics
                      </h2>

                      <p className="text-sm text-sub mt-1">
                        Monitor your learning progress and course completion.
                      </p>
                    </div>
              </div>

            </div>

            {hasTrainingData ? (

              <div className="h-72 w-full">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={trainingProgress}
                    margin={{
                      top: 10,
                      right: 10,
                      left: -20,
                      bottom: 0,
                    }}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e2e8f0"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: "#64748b",
                        fontSize: 12,
                      }}
                    />

                   <YAxis
                    allowDecimals={false}
                    domain={[0, "dataMax + 1"]}
                />

                    <Tooltip
                      cursor={{
                        fill: "rgba(37, 99, 235, 0.05)",
                      }}
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid #e2e8f0",
                      }}
                    />

                    <Bar
                        dataKey="value"
                        fill="#2563eb"
                        radius={[8, 8, 0, 0]}
                        >
                         <LabelList dataKey="value" position="top" />
                      </Bar>

                  </BarChart>
                </ResponsiveContainer>

              </div>

            ) : (

              <div className="flex h-64 flex-col items-center justify-center text-center">

                <FiBarChart2 className="h-10 w-10 text-mute" />

                <p className="mt-3 font-medium text-text">
                  No training progress available
                </p>

                <p className="mt-1 max-w-sm text-sm text-sub">
                  Your completed training history will
                  appear here when training progress is
                  recorded.
                </p>

              </div>
            )}

          </div>

        </section>

        {/* =================================================
            MY SKILL GAP
        ================================================= */}

        <section className={`${cardClass} overflow-hidden`}>

          <div className="flex flex-col gap-2 border-b border-line px-6 py-5 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-2">

              <FiGrid className="h-5 w-5 text-primary" />

              <div>
                <h2 className="text-lg font-bold text-text">
                  My Skill Gap
                </h2>

                <p className="mt-0.5 text-xs text-sub">
                  Your current proficiency against skill
                  requirements
                </p>
              </div>

            </div>

          </div>

          {heatmapSkills.length > 0 &&
          heatmapData.length > 0 ? (

            <>
              <div className="overflow-x-auto">

                <table className="w-full min-w-[700px] text-sm">

                  <thead>

                    <tr className="border-b border-line bg-surface/60">

                      <th className="sticky left-0 z-10 bg-surface/95 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-sub">
                        Employee
                      </th>

                      {heatmapSkills.map((skill) => (

                        <th
                          key={skill}
                          className="px-4 py-3 text-center text-xs font-semibold text-sub"
                        >
                          {skill}
                        </th>

                      ))}

                    </tr>

                  </thead>

                  <tbody>

                    {heatmapData.map((row) => (

                      <tr
                        key={row.employee}
                        className="border-b border-line last:border-0"
                      >

                        <td className="sticky left-0 z-10 whitespace-nowrap bg-panel px-5 py-4 font-semibold text-text">
                          {row.employee}
                        </td>

                        {heatmapSkills.map((skill) => {

                          const value =
                            row.values?.[skill];

                          const hasValue =
                            value !== null &&
                            value !== undefined;

                          return (

                            <td
                              key={skill}
                              className="px-3 py-3 text-center"
                            >

                              <div
                                className={`mx-auto flex h-10 w-14 items-center justify-center rounded-lg text-xs font-bold shadow-sm ${getHeatmapColor(
                                  value
                                )} ${getHeatmapTextColor(
                                  value
                                )}`}
                              >
                                {hasValue
                                  ? `${value}%`
                                  : "N/A"}
                              </div>

                            </td>

                          );
                        })}

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

              {/* Legend */}

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line px-6 py-4">

                <span className="text-xs font-semibold text-sub">
                  Legend:
                </span>

                {[
                  {
                    label: "Critical gap (<40%)",
                    cls: "bg-red-500",
                  },
                  {
                    label:
                      "Needs training (40-59%)",
                    cls: "bg-amber-400",
                  },
                  {
                    label:
                      "Developing (60-79%)",
                    cls: "bg-lime-400",
                  },
                  {
                    label: "Proficient (80%+)",
                    cls: "bg-emerald-500",
                  },
                  {
                    label: "Not assessed",
                    cls: "bg-gray-200",
                  },
                ].map((item) => (

                  <span
                    key={item.label}
                    className="flex items-center gap-1.5 text-xs text-sub"
                  >

                    <span
                      className={`h-2.5 w-2.5 rounded-sm ${item.cls}`}
                    />

                    {item.label}

                  </span>

                ))}

              </div>
            </>

          ) : (

            <div className="flex min-h-[220px] flex-col items-center justify-center px-6 py-10 text-center">

              <FiGrid className="h-10 w-10 text-mute" />

              <p className="mt-3 font-medium text-text">
                No skill gap analysis available
              </p>

              <p className="mt-1 max-w-md text-sm text-sub">
                Your personal skill gap analysis will
                appear here when proficiency and required
                skill levels are available.
              </p>

            </div>

          )}

        </section>

        {/* =================================================
            NOTIFICATIONS + RECENT ACTIVITY
        ================================================= */}

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* NOTIFICATIONS */}

          <div className={`${cardClass} overflow-hidden`}>

            <div className="flex items-center gap-2 border-b border-line px-6 py-4">

              <FiBell className="h-5 w-5 text-primary" />

              <h2 className="text-lg font-bold text-text">
                My Notifications
              </h2>

              {notifications.length > 0 && (

                <span className="ml-auto rounded-full bg-primary-tint px-2.5 py-0.5 text-xs font-bold text-primary">
                  {notifications.length}
                </span>

              )}

            </div>

            {notifications.length > 0 ? (

              <div className="divide-y divide-line">

                {notifications.map(
                  (notification, index) => (

                    <div
                      key={
                        notification.id ||
                        index
                      }
                      className="group flex gap-3 px-6 py-4 transition-colors hover:bg-primary-tint/30"
                    >

                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />

                      <div className="min-w-0">

                        <p className="text-sm font-medium text-text">
                          {notification.title ||
                            notification.message ||
                            "Notification"}
                        </p>

                        <p className="mt-1 text-xs text-sub">

                          {notification.type ||
                            "Update"}

                          {notification.time ||
                          notification.createdAt
                            ? ` · ${
                                notification.time ||
                                notification.createdAt
                              }`
                            : ""}

                        </p>

                      </div>

                    </div>

                  )
                )}

              </div>

            ) : (

              <div className="flex min-h-[220px] flex-col items-center justify-center px-6 py-10 text-center">

                <FiBell className="h-10 w-10 text-mute" />

                <p className="mt-3 font-medium text-text">
                  No notifications
                </p>

                <p className="mt-1 text-sm text-sub">
                  You don't have any dashboard
                  notifications to display.
                </p>

              </div>

            )}

          </div>

          {/* RECENT ACTIVITY */}

          <div className={`${cardClass} overflow-hidden`}>

            <div className="flex items-center gap-2 border-b border-line px-6 py-4">

              <FiActivity className="h-5 w-5 text-primary" />

              <h2 className="text-lg font-bold text-text">
                My Recent Activity
              </h2>

            </div>

            {activity.length > 0 ? (

              <div className="divide-y divide-line">

                {activity.map((item, index) => (

                  <div
                    key={item.id || index}
                    className="group flex gap-4 px-6 py-4 transition-colors hover:bg-primary-tint/30"
                  >

                    <div className="relative">

                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-tint text-primary ring-1 ring-primary/15">

                        <FiActivity className="h-4 w-4" />

                      </span>

                    </div>

                    <div className="min-w-0 flex-1">

                      <p className="text-sm font-medium text-text">
                        {item.action ||
                          item.title ||
                          item.description ||
                          "Activity"}
                      </p>

                      <p className="mt-1 text-xs text-sub">

                        {item.type ||
                          item.category ||
                          "Activity"}

                        {item.time
                        ? ` · ${item.time}`
                        : item.createdAt
                        ? ` · ${formatDateTime(item.createdAt)}`
                        : ""}

                      </p>

                    </div>

                  </div>

                ))}

              </div>

            ) : (

              <div className="flex min-h-[220px] flex-col items-center justify-center px-6 py-10 text-center">

                <FiActivity className="h-10 w-10 text-mute" />

                <p className="mt-3 font-medium text-text">
                  No recent activity
                </p>

                <p className="mt-1 text-sm text-sub">
                  Your recent learning and profile
                  activity will appear here.
                </p>

              </div>

            )}

          </div>

        </section>

      </div>
    </DashboardLayout>
  );
}