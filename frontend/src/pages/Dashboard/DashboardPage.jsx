import { useEffect, useRef, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { getAllUsers } from "../../services/userService";
import {
  getDashboardStats,
  getSkillGapHeatmap,
} from "../../services/dashboardService";

// Coverage % -> tone, same thresholds the mock used
// (<40 bad, 40-70 mid, >70 ok)
function toneFor(pct) {
  if (pct < 40) return "kg-bad";
  if (pct < 70) return "kg-mid";
  return "kg-ok";
}

// Coverage % -> severity color for the "Priority gaps" list
function severityFor(pct) {
  return pct < 30 ? "rust" : "gold";
}

export default function DashboardPage() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const loggedInRole = localStorage.getItem("role");
  const role = localStorage.getItem("role")?.toLowerCase();
  const isOfficial =
    role === "admin" ||
    role === "hr" ||
    role === "manager" ||
    role === "team lead";

  const userName = localStorage.getItem("name") || "there";
  const gaugeRef = useRef(null);
  const [gaugeReady, setGaugeReady] = useState(false);

  // Dynamic replacements for the old hardcoded GAP_ROWS / PRIORITY_GAPS / READINESS_TARGET
  const [gapRows, setGapRows] = useState([]);
  const [priorityGaps, setPriorityGaps] = useState([]);
  const [readiness, setReadiness] = useState(0); // 0..1, e.g. 0.86
  const [criticalGapsCount, setCriticalGapsCount] = useState(0);

  console.log("Stored role:", role);
  console.log("Official:", isOfficial);

  useEffect(() => {
    loadUsers();
    loadGapData();
  }, []);

  async function loadUsers() {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.log(err);
    }
  }

  async function loadGapData() {
    try {
      const heatmap = await getSkillGapHeatmap();
      // Expected shape: { skillNames: string[], rows: [{ displayName, values: number[] }] }
      const skillNames = heatmap?.skillNames || [];
      const rows = heatmap?.rows || [];

      // Average coverage per skill across all employees
      const averages = skillNames.map((_, skillIdx) => {
        if (rows.length === 0) return 0;
        const total = rows.reduce(
          (sum, row) => sum + (row.values?.[skillIdx] ?? 0),
          0
        );
        return Math.round(total / rows.length);
      });

      const allRows = skillNames.map((name, idx) => ({
        label: name,
        pct: averages[idx],
        tone: toneFor(averages[idx]),
      }));

      // "Where the gaps sit" — show the 5 skills with the lowest coverage,
      // same visual layout as before, real ordering now instead of static.
      const sortedByLowest = [...allRows].sort((a, b) => a.pct - b.pct);
      setGapRows(sortedByLowest.slice(0, 5));

      // Priority gaps — worst 3 skills org-wide
      const worstThree = sortedByLowest.slice(0, 3).map((row) => ({
        title: row.label,
        detail: `${row.pct}% covered across ${rows.length} employee${
          rows.length === 1 ? "" : "s"
        }`,
        sev: severityFor(row.pct),
      }));
      setPriorityGaps(worstThree);

      // Org readiness — overall average coverage across all skills
      const overallAvg =
        allRows.length > 0
          ? allRows.reduce((sum, r) => sum + r.pct, 0) / allRows.length
          : 0;
      setReadiness(overallAvg / 100);

      // Critical gaps open — count of skills under 40% coverage org-wide
      setCriticalGapsCount(allRows.filter((r) => r.pct < 40).length);
    } catch (err) {
      console.log(err);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const employeeCount = users.filter(
    (user) => user.role?.toLowerCase() === "employee"
  ).length;

  const internCount = users.filter(
    (user) => user.role?.toLowerCase() === "intern"
  ).length;

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Same trick as before: animate the dashed gap bars and the gauge arc
  // in on mount, rather than snapping to full width immediately.
  useEffect(() => {
    const t = setTimeout(() => setGaugeReady(true), 350);
    return () => clearTimeout(t);
  }, []);

  const circumference = 251;
  const gaugeOffset = gaugeReady
    ? circumference - circumference * readiness
    : circumference;

  return (
    <DashboardLayout>
      {/* ---------------- Hero ---------------- */}
      <div className="kg-hero">
        <div className="kg-blob kg-b1" />
        <div className="kg-blob kg-b2" />
        <div className="kg-blob kg-b3" />
        <div className="kg-blob kg-b4" />
        <div className="kg-blob kg-b5" />
        <div className="kg-blob kg-b6" />
        <div>
          <div className="kg-date">{today}</div>
          <h1>Welcome back, {userName}</h1>
          <p>
            Every skill you sharpen closes a gap in your team. Keep learning,
            keep growing — you're on a strong streak this quarter.
          </p>
        </div>
        <div className="kg-score">
          <div className="kg-n">{Math.round(readiness * 100)}%</div>
          <div className="kg-l">Growth score</div>
        </div>
      </div>

      {/* ---------------- KPI row ---------------- */}
      {isOfficial && (
        <div className="kg-kpi-row">
          <div className="kg-kpi" style={{ animationDelay: ".05s" }}>
            <div className="kg-lab">
              Total users<span className="kg-trend">▲</span>
            </div>
            <div className="kg-val">{users.length}</div>
          </div>
          <div className="kg-kpi kg-gold" style={{ animationDelay: ".1s" }}>
            <div className="kg-lab">
              Employees<span className="kg-trend">●</span>
            </div>
            <div className="kg-val">{employeeCount}</div>
          </div>
          <div className="kg-kpi" style={{ animationDelay: ".15s" }}>
            <div className="kg-lab">
              Interns<span className="kg-trend">●</span>
            </div>
            <div className="kg-val">{internCount}</div>
          </div>
          <div className="kg-kpi kg-rust" style={{ animationDelay: ".2s" }}>
            <div className="kg-lab">Critical gaps open</div>
            <div className="kg-val">{criticalGapsCount}</div>
          </div>
        </div>
      )}

      {/* ---------------- Split panel — gap coverage + readiness gauge ---------------- */}
      <div className="kg-split mb-8">
        <div className="kg-panel">
          <h2>
            Where the gaps sit <span className="kg-link">View full survey →</span>
          </h2>
          <div className="kg-desc">
            Solid fill is measured coverage; the dashed remainder is the open
            gap for that skill area.
          </div>
          <div className="kg-gaplist">
            {gapRows.length === 0 && (
              <p className="text-sub text-sm">No skill data yet.</p>
            )}
            {gapRows.map((row) => (
              <div className="kg-row" key={row.label}>
                <div className="kg-top">
                  <b>{row.label}</b>
                  <span className="kg-pct">{row.pct}% covered</span>
                </div>
                <div className={`kg-gaptrack ${row.tone}`}>
                  <i style={{ width: gaugeReady ? `${row.pct}%` : 0 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="kg-panel" style={{ animationDelay: ".2s" }}>
          <h2>Org readiness</h2>
          <div className="kg-gaugewrap">
            <svg width="180" height="110" viewBox="0 0 180 110">
              <path
                d="M10 100 A80 80 0 0 1 170 100"
                fill="none"
                stroke="var(--color-line)"
                strokeWidth="14"
                strokeLinecap="round"
              />
              <path
                ref={gaugeRef}
                d="M10 100 A80 80 0 0 1 170 100"
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={gaugeOffset}
                style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.2,.7,.2,1)" }}
              />
            </svg>
            <div className="kg-gaugenum">{Math.round(readiness * 100)}%</div>
            <div className="kg-gaugelab">TARGET 90% BY Q4</div>
          </div>
          <h2 style={{ marginTop: 24 }}>Priority gaps</h2>
          <ul className="kg-plist">
            {priorityGaps.length === 0 && (
              <p className="text-sub text-sm">No priority gaps yet.</p>
            )}
            {priorityGaps.map((g) => (
              <li key={g.title}>
                <div
                  className="kg-sev"
                  style={{ background: `var(--color-${g.sev})` }}
                />
                <div className="kg-txt">
                  <b>{g.title}</b>
                  <span>{g.detail}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Users Table — unchanged feature, just restyled */}
      <div className="rounded-2xl bg-panel shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-text">Registered Users</h2>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b bg-bg dark:bg-line">
                <th className="px-4 py-3 text-left font-semibold">#</th>
                <th className="px-4 py-3 text-left font-semibold">Name</th>
                <th className="px-4 py-3 text-left font-semibold">Email</th>
                <th className="px-4 py-3 text-left font-semibold">Role</th>
                <th className="px-4 py-3 text-left font-semibold">Registered</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user, index) => (
                <tr key={user.id} className="border-b hover:bg-bg">
                  <td className="px-4 py-4 text-text">{index + 1}</td>
                  <td className="px-4 py-4 font-medium whitespace-nowrap">
                    {user.name}
                  </td>
                  <td className="px-4 py-4 text-text">{user.email}</td>
                  <td className="px-4 py-4 text-text">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-semibold
                      ${
                        user.role === "Admin"
                          ? "bg-red-100 text-red-700"
                          : user.role === "Manager"
                          ? "bg-primary-tint text-primary-dark"
                          : user.role === "Employee"
                          ? "bg-primary-tint text-primary-dark"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}