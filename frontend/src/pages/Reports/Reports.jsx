import DashboardLayout from "../../components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import { FiDownload, FiFileText, FiTarget, FiUsers, FiTrendingUp, FiBriefcase } from "react-icons/fi";
import { getEmployees } from "../../services/EmployeeManagementService.jsx";
import {
  getIndividualSkillGapReport,
  getDepartmentGapSummaryReport,
  getTrainingEffectivenessReport,
  getLearningRoiReport,
  getStrategicWorkforcePlanningReport,
  exportReportToExcel,
  exportReportToPdf,
} from "../../services/reportService";
import { toast } from "../../components/ui/Toast.jsx";

const REPORT_TABS = [
  { key: "individual-skill-gap", label: "Individual Skill Gap", icon: FiTarget },
  { key: "department-gap-summary", label: "Department Gap Summary", icon: FiUsers },
  { key: "training-effectiveness", label: "Training Effectiveness", icon: FiFileText },
  { key: "learning-roi", label: "Learning ROI Analysis", icon: FiTrendingUp },
  { key: "strategic-workforce-planning", label: "Strategic Workforce Planning", icon: FiBriefcase },
];

// Shared "Export" buttons, reused under every report.
function ExportButtons({ reportType, employeeId, disabled }) {
  const [exporting, setExporting] = useState(null); // "pdf" | "excel" | null

  const handleExport = async (format) => {
    setExporting(format);
    try {
      if (format === "pdf") {
        await exportReportToPdf(reportType, employeeId);
      } else {
        await exportReportToExcel(reportType, employeeId);
      }
    } catch (err) {
      console.error(err);
      toast.error(`Unable to export as ${format.toUpperCase()}.`);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => handleExport("pdf")}
        disabled={disabled || exporting !== null}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-sub hover:bg-gray-50 transition disabled:opacity-50"
      >
        <FiDownload size={14} />
        {exporting === "pdf" ? "Exporting..." : "Export PDF"}
      </button>
      <button
        type="button"
        onClick={() => handleExport("excel")}
        disabled={disabled || exporting !== null}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-primary text-white hover:opacity-90 transition disabled:opacity-50"
      >
        <FiDownload size={14} />
        {exporting === "excel" ? "Exporting..." : "Export Excel"}
      </button>
    </div>
  );
}

function EmptyState({ message }) {
  return <p className="text-mute py-10 text-center">{message}</p>;
}

export default function Reports() {
  const [activeTab, setActiveTab] = useState(REPORT_TABS[0].key);

  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [individualGap, setIndividualGap] = useState([]);
  const [departmentSummary, setDepartmentSummary] = useState([]);
  const [trainingEffectiveness, setTrainingEffectiveness] = useState([]);
  const [learningRoi, setLearningRoi] = useState([]);
  const [strategicPlanning, setStrategicPlanning] = useState([]);

  useEffect(() => {
    getEmployees()
      .then((res) => {
        const list = res.data || [];
        setEmployees(list);
        if (list.length > 0) setSelectedEmployeeId(String(list[0].id));
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (activeTab === "individual-skill-gap" && !selectedEmployeeId) return;

    setLoading(true);
    setError(null);

    const load = async () => {
      switch (activeTab) {
        case "individual-skill-gap":
          setIndividualGap(await getIndividualSkillGapReport(selectedEmployeeId));
          break;
        case "department-gap-summary":
          setDepartmentSummary(await getDepartmentGapSummaryReport());
          break;
        case "training-effectiveness":
          setTrainingEffectiveness(await getTrainingEffectivenessReport());
          break;
        case "learning-roi":
          setLearningRoi(await getLearningRoiReport());
          break;
        case "strategic-workforce-planning":
          setStrategicPlanning(await getStrategicWorkforcePlanningReport());
          break;
        default:
          break;
      }
    };

    load()
      .catch((err) => {
        console.error(err);
        setError("Unable to load this report. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [activeTab, selectedEmployeeId]);

  return (
    <DashboardLayout>
      <div className="space-y-6">

        <div>
          <h1 className="text-3xl font-bold text-text">Reports &amp; Export</h1>
          <p className="text-sub mt-2">
            Skill gap, training, ROI, and workforce planning reports - exportable as PDF or Excel.
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-panel rounded-3xl shadow-xl p-2 flex flex-wrap gap-2">
          {REPORT_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = tab.key === activeTab;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={
                  "inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition " +
                  (active ? "bg-primary text-white" : "text-sub hover:bg-gray-50")
                }
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl">{error}</div>
        )}

        {/* Individual Skill Gap */}
        {activeTab === "individual-skill-gap" && (
          <div className="bg-panel rounded-3xl shadow-xl p-6 space-y-4">

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <label className="text-sub text-sm font-medium">Employee</label>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} - {emp.department}
                    </option>
                  ))}
                </select>
              </div>

              <ExportButtons
                reportType="individual-skill-gap"
                employeeId={selectedEmployeeId}
                disabled={!selectedEmployeeId || loading}
              />
            </div>

            {loading ? (
              <p className="text-mute">Loading...</p>
            ) : individualGap.length === 0 ? (
              <EmptyState message="This employee has no assigned role, so there's no gap to analyze yet." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-200 text-sub text-sm">
                      <th className="py-3 pr-4">Role</th>
                      <th className="py-3 pr-4">Required Skills</th>
                      <th className="py-3 pr-4">Matched</th>
                      <th className="py-3 pr-4">Missing</th>
                      <th className="py-3 pr-4">Gap %</th>
                      <th className="py-3 pr-4">Missing Skill Names</th>
                    </tr>
                  </thead>
                  <tbody>
                    {individualGap.map((gap) => (
                      <tr key={gap.roleId} className="border-b border-gray-100">
                        <td className="py-4 pr-4 font-semibold text-text">{gap.roleName}</td>
                        <td className="py-4 pr-4">{gap.totalRequiredSkills}</td>
                        <td className="py-4 pr-4 text-green-700">{gap.matchedSkillCount}</td>
                        <td className="py-4 pr-4 text-red-600">{gap.missingSkillCount}</td>
                        <td className="py-4 pr-4">{gap.gapPercentage}%</td>
                        <td className="py-4 pr-4 text-mute">
                          {gap.missingSkills.map((s) => s.skillName).join(", ") || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Department Gap Summary */}
        {activeTab === "department-gap-summary" && (
          <div className="bg-panel rounded-3xl shadow-xl p-6 space-y-4">
            <div className="flex justify-end">
              <ExportButtons reportType="department-gap-summary" disabled={loading} />
            </div>

            {loading ? (
              <p className="text-mute">Loading...</p>
            ) : departmentSummary.length === 0 ? (
              <EmptyState message="No department data available yet." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-200 text-sub text-sm">
                      <th className="py-3 pr-4">Department</th>
                      <th className="py-3 pr-4">Employees Analyzed</th>
                      <th className="py-3 pr-4">Average Gap %</th>
                      <th className="py-3 pr-4">Top Missing Skills</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departmentSummary.map((row) => (
                      <tr key={row.department} className="border-b border-gray-100">
                        <td className="py-4 pr-4 font-semibold text-text">{row.department}</td>
                        <td className="py-4 pr-4">{row.employeeCount}</td>
                        <td className="py-4 pr-4">{row.averageGapPercentage}%</td>
                        <td className="py-4 pr-4 text-mute">{row.topMissingSkills.join(", ") || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Training Effectiveness */}
        {activeTab === "training-effectiveness" && (
          <div className="bg-panel rounded-3xl shadow-xl p-6 space-y-4">
            <div className="flex justify-end">
              <ExportButtons reportType="training-effectiveness" disabled={loading} />
            </div>

            {loading ? (
              <p className="text-mute">Loading...</p>
            ) : trainingEffectiveness.length === 0 ? (
              <EmptyState message="No trainings found." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-200 text-sub text-sm">
                      <th className="py-3 pr-4">Training</th>
                      <th className="py-3 pr-4">Skill</th>
                      <th className="py-3 pr-4">Enrollments</th>
                      <th className="py-3 pr-4">In Progress</th>
                      <th className="py-3 pr-4">Certified</th>
                      <th className="py-3 pr-4">Completion %</th>
                      <th className="py-3 pr-4">Avg Days to Certify</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainingEffectiveness.map((row) => (
                      <tr key={row.trainingId} className="border-b border-gray-100">
                        <td className="py-4 pr-4 font-semibold text-text">{row.title}</td>
                        <td className="py-4 pr-4">{row.skillName}</td>
                        <td className="py-4 pr-4">{row.totalEnrollments}</td>
                        <td className="py-4 pr-4">{row.inProgressCount}</td>
                        <td className="py-4 pr-4 text-green-700">{row.certifiedCount}</td>
                        <td className="py-4 pr-4">{row.completionRatePercent}%</td>
                        <td className="py-4 pr-4 text-mute">
                          {row.averageDaysToCertify == null ? "-" : row.averageDaysToCertify}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Learning ROI Analysis */}
        {activeTab === "learning-roi" && (
          <div className="bg-panel rounded-3xl shadow-xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <p className="text-xs text-mute max-w-xl">
                ROI here is measured as skill-gap closure, not currency: of the employees certified
                in a training, what share now show that training's skill as covered in their current
                gap analysis. Add a cost field to trainings later for a true monetary ROI.
              </p>
              <ExportButtons reportType="learning-roi" disabled={loading} />
            </div>

            {loading ? (
              <p className="text-mute">Loading...</p>
            ) : learningRoi.length === 0 ? (
              <EmptyState message="No trainings found." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-200 text-sub text-sm">
                      <th className="py-3 pr-4">Training</th>
                      <th className="py-3 pr-4">Skill</th>
                      <th className="py-3 pr-4">Enrollments</th>
                      <th className="py-3 pr-4">Certifications</th>
                      <th className="py-3 pr-4">Certification %</th>
                      <th className="py-3 pr-4">Closed the Gap</th>
                      <th className="py-3 pr-4">ROI Score %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {learningRoi.map((row) => (
                      <tr key={row.trainingId} className="border-b border-gray-100">
                        <td className="py-4 pr-4 font-semibold text-text">{row.title}</td>
                        <td className="py-4 pr-4">{row.skillName}</td>
                        <td className="py-4 pr-4">{row.totalEnrollments}</td>
                        <td className="py-4 pr-4">{row.totalCertifications}</td>
                        <td className="py-4 pr-4">{row.certificationRatePercent}%</td>
                        <td className="py-4 pr-4">{row.employeesWhoClosedTheGap}</td>
                        <td className="py-4 pr-4 font-semibold">
                          {row.roiScorePercent == null ? "-" : `${row.roiScorePercent}%`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Strategic Workforce Planning */}
        {activeTab === "strategic-workforce-planning" && (
          <div className="bg-panel rounded-3xl shadow-xl p-6 space-y-4">
            <div className="flex justify-end">
              <ExportButtons reportType="strategic-workforce-planning" disabled={loading} />
            </div>

            {loading ? (
              <p className="text-mute">Loading...</p>
            ) : strategicPlanning.length === 0 ? (
              <EmptyState message="No active strategic goals with mapped skill requirements yet." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-200 text-sub text-sm">
                      <th className="py-3 pr-4">Strategic Goal</th>
                      <th className="py-3 pr-4">Priority</th>
                      <th className="py-3 pr-4">Target Year</th>
                      <th className="py-3 pr-4">Required Skills</th>
                      <th className="py-3 pr-4">Ready / Total</th>
                      <th className="py-3 pr-4">Readiness %</th>
                      <th className="py-3 pr-4">Top Gap Skills</th>
                    </tr>
                  </thead>
                  <tbody>
                    {strategicPlanning.map((row) => (
                      <tr key={row.goalId} className="border-b border-gray-100">
                        <td className="py-4 pr-4 font-semibold text-text">{row.goalName}</td>
                        <td className="py-4 pr-4">
                          <span
                            className={
                              "text-xs font-semibold px-2 py-1 rounded-xl whitespace-nowrap " +
                              (row.priority === "CRITICAL" || row.priority === "HIGH"
                                ? "bg-red-50 text-red-600"
                                : "bg-gray-100 text-gray-500")
                            }
                          >
                            {row.priority}
                          </span>
                        </td>
                        <td className="py-4 pr-4">{row.targetYear ?? "-"}</td>
                        <td className="py-4 pr-4">{row.requiredSkillCount}</td>
                        <td className="py-4 pr-4">
                          {row.employeesReady} / {row.totalEmployeesConsidered}
                        </td>
                        <td className="py-4 pr-4">{row.readinessPercentage}%</td>
                        <td className="py-4 pr-4 text-mute">{row.topGapSkills.join(", ") || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
