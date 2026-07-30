import { useEffect, useState, useCallback } from "react";
import Select, { components } from "react-select";
import DashboardLayout from "../../components/layout/DashboardLayout";

import {
  getEmployees,
  getSkills,
} from "../../services/EmployeeSkillService";

import { getGapAnalysis } from "../../services/GapAnalysisService";
import { getDepartmentHeatmap } from "../../services/gapHeatmapService";
import GapHeatmapChart from "../../components/GapHeatMap/GapHeatmapChart";

import {
  FiUsers,
  FiCpu,
  FiAlertCircle,
  FiRefreshCw,
  FiBarChart2,
  FiCheckCircle,
} from "react-icons/fi";

const RISK_STYLES = {
  GREEN: "bg-green-100 text-green-700",
  AMBER: "bg-amber-100 text-amber-700",
  RED: "bg-red-100 text-red-700",
};

function RiskBadge({ skill }) {
  if (!skill || !skill.riskLabel) {
    return null;
  }

  const badgeClass =
    RISK_STYLES[skill.riskColor] || "bg-slate-100 text-slate-700";

  return (
    <span
      className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${badgeClass}`}
      title={`Required: ${skill.requiredLevel ?? "-"} | Current: ${
        skill.currentLevel ?? "-"
      } | Gap: ${skill.gap ?? "-"}`}
    >
      {skill.riskLabel}
    </span>
  );
}

export default function GapAnalysis() {
  const [employees, setEmployees] = useState([]);
  const [skills, setSkills] = useState([]);

  const [selectedEmployee, setSelectedEmployee] = useState("");

  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Backend Gap Analysis Data
  const [gapData, setGapData] = useState([]);

  // Heatmap Data
  const [heatmapData, setHeatmapData] = useState([]);
  const [heatmapLoading, setHeatmapLoading] = useState(false);
const [heatmapError, setHeatmapError] = useState("");

  const employeeOptions = employees.map((employee) => ({
    value: employee.id,
    label: `${employee.name} (${employee.employeeCode})`,
    searchText: `
      ${employee.name}
      ${employee.employeeCode}
      ${employee.department}
      ${employee.designation}
    `,
    employee,
  }));

  const filterEmployeeOption = (option, inputValue) => {
    return option.data.searchText
      .toLowerCase()
      .includes(inputValue.toLowerCase());
  };

  const handleRefresh = async () => {
    setSelectedEmployee("");
    setGapData([]);
    setMessage("");
    setError("");

    await loadData();
    await loadHeatmap();
  };

  const CustomOption = (props) => {
    const employee = props.data.employee;

    return (
      <components.Option {...props}>
        <div className="py-1">
          <p className="font-semibold text-slate-800">
            {employee.name}
          </p>

          <p className="text-sm text-sub">
            {employee.employeeCode}
          </p>

          <p className="text-xs text-primary">
            {employee.designation}
          </p>

          <p className="text-xs text-sub">
            {employee.department}
          </p>
        </div>
      </components.Option>
    );
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const [employeeResponse, skillResponse] = await Promise.all([
        getEmployees(),
        getSkills(),
      ]);

      setEmployees(employeeResponse?.data || []);
      setSkills(skillResponse?.data || []);

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        "Unable to load employees."
      );

    } finally {
      setLoading(false);
    }
  }, []);

  const loadHeatmap = async () => {
  try {
    setHeatmapLoading(true);
    setHeatmapError("");

    const data = await getDepartmentHeatmap();

    setHeatmapData(data);

  } catch (err) {

    console.error("Department Heatmap Error:", err);

    setHeatmapData([]);
    setHeatmapError("Unable to load department heatmap.");

  } finally {

    setHeatmapLoading(false);

  }
};
  useEffect(() => {
    loadData();
    loadHeatmap();
  }, [loadData]);

  const loadGapAnalysis = async (employeeId) => {
    if (!employeeId) {
      setGapData([]);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await getGapAnalysis(employeeId);

      console.log("Gap Analysis Response:", response.data);

      setGapData(response.data || []);

      if ((response.data || []).length === 0) {
        setMessage("No gap analysis found for this employee.");
      }

    } catch (err) {

      console.error("Gap Analysis Error:", err);

      setGapData([]);

      setError(
        err.response?.data?.message ||
        "Unable to load Gap Analysis."
      );

    } finally {
      setLoading(false);
    }
  };
  // Current Gap Analysis
  const currentGap =
  gapData.length > 0 ? gapData[0] : null;

const matchedSkills =
  currentGap?.matchedSkills || [];

const missingSkills =
  currentGap?.missingSkills || [];

const gapPercentage =
  currentGap?.gapPercentage || 0;

const matchedSkillCount =
  currentGap?.matchedSkillCount || 0;

const missingSkillCount =
  currentGap?.missingSkillCount || 0;

const totalRequiredSkills =
  currentGap?.totalRequiredSkills || 0;

const employeeName =
  currentGap?.employeeName || "";

const roleName =
  currentGap?.roleName || "";


  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* Header */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between rounded-3xl bg-gradient-to-r from-primary to-primary-dark p-8 text-white shadow-lg">

          <div>
            <h1 className="text-4xl font-bold">
              Gap Analysis
            </h1>

            <p className="mt-2 text-primary-tint text-lg">
              Analyze employee skill gaps and identify missing competencies.
            </p>
          </div>

        </div>

        {/* Dashboard Cards */}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          {/* Employees */}

          <div className="rounded-3xl bg-panel p-6 shadow-lg">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm uppercase text-sub">
                  Employees
                </p>

                <h2 className="mt-2 text-4xl font-bold">
                  {employees.length}
                </h2>
              </div>

              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-tint">
                <FiUsers className="text-3xl text-primary" />
              </div>

            </div>

          </div>

          {/* Required Skills */}

          <div className="rounded-3xl bg-panel p-6 shadow-lg">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm uppercase text-sub">
                  Required Skills
                </p>

                <h2 className="mt-2 text-4xl font-bold text-primary">
                  {totalRequiredSkills}
                </h2>
              </div>

              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-tint">
                <FiCpu className="text-3xl text-primary" />
              </div>

            </div>

          </div>

          {/* Missing Skills */}

          <div className="rounded-3xl bg-panel p-6 shadow-lg">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm uppercase text-sub">
                  Missing Skills
                </p>

                <h2 className="mt-2 text-4xl font-bold text-orange-600">
                  {missingSkillCount}
                </h2>
              </div>

              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                <FiAlertCircle className="text-3xl text-orange-600" />
              </div>

            </div>

          </div>

          {/* Gap Percentage */}

          <div className="rounded-3xl bg-panel p-6 shadow-lg">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm uppercase text-sub">
                  Gap %
                </p>

                <h2 className="mt-2 text-4xl font-bold text-red-600">
                  {gapPercentage.toFixed(1)}%
                </h2>
              </div>

              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <FiBarChart2 className="text-3xl text-red-600" />
              </div>

            </div>

          </div>

        </div>

        {/* Employee Selection */}
<div className="rounded-3xl bg-panel p-6 shadow-lg">

  <div className="mb-5 flex items-center justify-between">

    <h2 className="text-2xl font-bold">
      Select Employee
    </h2>

    <button
  onClick={handleRefresh}
  className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-white"
>
  <FiRefreshCw />
  Refresh
</button>

  </div>

  <Select
    options={employeeOptions}
    placeholder="Search Employee..."
    filterOption={filterEmployeeOption}
    components={{ Option: CustomOption }}
    isSearchable
    isClearable
    value={
      employeeOptions.find(
        (option) => option.value === Number(selectedEmployee)
      ) || null
    }
    onChange={(selectedOption) => {
      if (selectedOption) {
        setSelectedEmployee(selectedOption.value);
        loadGapAnalysis(selectedOption.value);
      } else {
        setSelectedEmployee("");
        loadGapAnalysis(null);
      }
    }}
  />

  {currentGap && (
    <div className="mt-5 rounded-xl bg-bg p-4">
      <p className="font-semibold text-text">
        Employee : {employeeName}
      </p>

      <p className="mt-1 text-sub">
        Role : {roleName}
      </p>
    </div>
  )}

</div>

{/* Overall Skill Gap */}

<div className="rounded-3xl bg-panel p-8 shadow-xl">

  <div className="flex items-center justify-between">

    <div>

      <h2 className="text-2xl font-bold text-text">
        Overall Skill Gap
      </h2>

      <p className="mt-2 text-sub">
        Current employee skill gap based on assigned role.
      </p>

    </div>

    <div
      className={`rounded-full px-5 py-2 font-semibold text-white
      ${
        gapPercentage <= 20
          ? "bg-green-500"
          : gapPercentage <= 40
          ? "bg-yellow-500"
          : gapPercentage <= 60
          ? "bg-orange-500"
          : "bg-red-500"
      }`}
    >
      {gapPercentage <= 20
        ? "Low Risk"
        : gapPercentage <= 40
        ? "Moderate"
        : gapPercentage <= 60
        ? "High Risk"
        : "Critical"}
    </div>

  </div>

  <div className="mt-8">

    <div className="h-6 overflow-hidden rounded-full bg-line">

      <div
        className="h-6 rounded-full bg-gradient-to-r from-green-500 via-yellow-400 to-red-500 transition-all duration-700"
        style={{
          width: `${gapPercentage}%`,
        }}
      />

    </div>

  </div>

  <div className="mt-8 grid grid-cols-3 gap-6 text-center">

    <div>

      <p className="text-4xl font-bold text-green-600">
        {matchedSkillCount}
      </p>

      <p className="mt-2 text-sub">
        Matched
      </p>

    </div>

    <div>

      <p className="text-4xl font-bold text-primary">
        {totalRequiredSkills}
      </p>

      <p className="mt-2 text-sub">
        Required
      </p>

    </div>

    <div>

      <p className="text-4xl font-bold text-red-600">
        {missingSkillCount}
      </p>

      <p className="mt-2 text-sub">
        Missing
      </p>

    </div>

  </div>

</div>
{/* =======================================================
    Department Knowledge Gap Heatmap
======================================================= */}



        {/* Skills Grid */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

  {/* Matched Skills */}
<div className="rounded-3xl bg-panel shadow-lg p-6">

  <h2 className="mb-5 text-xl font-bold text-text">
    Matched Skills
  </h2>

  {!currentGap ? (

    <p className="text-mute">
      Select an employee.
    </p>

  ) : matchedSkills.length === 0 ? (

    <p className="text-mute">
      No matched skills found.
    </p>

  ) : (

    <div className="flex flex-wrap gap-3">

      {matchedSkills.map((skill) => (

        <span
          key={skill.id}
          className="inline-flex items-center rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700"
        >
          {skill.skillName}
          <RiskBadge skill={skill} />
        </span>

      ))}

    </div>

  )}

</div>

  {/* Required Skills */}

  <div className="rounded-3xl bg-panel shadow-lg p-6">

    <h2 className="mb-5 text-xl font-bold text-text">
      Required Skills
    </h2>

    <div className="flex h-full items-center justify-center">

      <div className="text-center">

        <p className="text-5xl font-bold text-primary">
          {totalRequiredSkills}
        </p>

        <p className="mt-3 text-sub">
          Total Required Skills
        </p>

      </div>

    </div>

  </div>

  {/* Missing Skills */}

  <div className="rounded-3xl bg-panel shadow-lg p-6">

    <h2 className="mb-5 text-xl font-bold text-text">
      Missing Skills
    </h2>

    {missingSkills.length === 0 ? (

      <div className="flex items-center gap-2 text-green-600">

        <FiCheckCircle />

        <span>No Skill Gap</span>

      </div>

    ) : (

      <div className="flex flex-wrap gap-3">

        {missingSkills.map((skill) => (

          <span
            key={skill.id}
            className="inline-flex items-center rounded-full bg-red-100 px-4 py-2 text-sm font-medium text-red-700"
          >
            {skill.skillName}
            <RiskBadge skill={skill} />
          </span>

        ))}

      </div>

    )}

  </div>

</div>

{/* Information Message */}

{message && (
  <div className="rounded-2xl border border-green-300 bg-green-50 p-4 text-green-700 shadow-sm">

    <div className="flex items-center gap-2">

      <FiCheckCircle className="text-xl" />

      <span className="font-medium">
        {message}
      </span>

    </div>

  </div>
)}

{/* Error Message */}

{error && (
  <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-red-700 shadow-sm">

    <div className="flex items-center gap-2">

      <FiAlertCircle className="text-xl" />

      <span className="font-medium">
        {error}
      </span>

    </div>

  </div>
)}

{/* Analysis Table */}

<div className="overflow-hidden rounded-3xl bg-panel shadow-lg">

  <div className="border-b p-6">
    <h2 className="text-2xl font-bold text-text">
      Gap Analysis Details
    </h2>

    <p className="mt-2 text-sub">
      Comparison between employee skills and required skills.
    </p>
  </div>

  <div className="overflow-x-auto">

    <table className="min-w-full">

      <thead className="bg-bg">

        <tr>
          <th className="px-6 py-4 text-left text-sm font-semibold uppercase">
            Skill
          </th>

          <th className="px-6 py-4 text-left text-sm font-semibold uppercase">
            Employee
          </th>

          <th className="px-6 py-4 text-left text-sm font-semibold uppercase">
            Required
          </th>

          <th className="px-6 py-4 text-left text-sm font-semibold uppercase">
            Status
          </th>

          <th className="px-6 py-4 text-left text-sm font-semibold uppercase">
            Risk
          </th>
        </tr>

      </thead>

      <tbody>

        {currentGap === null ? (

          <tr>

            <td
              colSpan={5}
              className="py-12 text-center text-mute"
            >
              Select an employee to view gap analysis.
            </td>

          </tr>

        ) : (

          <>

            {matchedSkills.map((skill) => (

              <tr
                key={`matched-${skill.id}`}
                className="border-b hover:bg-bg"
              >

                <td className="px-6 py-4 font-semibold">
                  {skill.skillName}
                </td>

                <td className="px-6 py-4 text-green-600">
                  ✔
                </td>

                <td className="px-6 py-4">
                  ✔
                </td>

                <td className="px-6 py-4">
                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                    Matched
                  </span>
                </td>

                <td className="px-6 py-4">
                  <RiskBadge skill={skill} />
                </td>

              </tr>

            ))}

            {missingSkills.map((skill) => (

              <tr
                key={`missing-${skill.id}`}
                className="border-b hover:bg-bg"
              >

                <td className="px-6 py-4 font-semibold">
                  {skill.skillName}
                </td>

                <td className="px-6 py-4 text-red-600">
                  ✘
                </td>

                <td className="px-6 py-4">
                  ✔
                </td>

                <td className="px-6 py-4">
                  <span className="rounded-full bg-red-100 px-3 py-1 text-sm text-red-700">
                    Missing
                  </span>
                </td>

                <td className="px-6 py-4">
                  <RiskBadge skill={skill} />
                </td>

              </tr>

            ))}

          </>

        )}

      </tbody>

    </table>

  </div>

</div>
{heatmapLoading ? (
  <div className="rounded-3xl bg-panel p-8 shadow-lg text-center">
    Loading department heatmap...
  </div>
) : heatmapError ? (
  <div className="rounded-3xl border border-red-300 bg-red-50 p-6 text-red-700 shadow-lg">
    {heatmapError}
  </div>
) : (
  <GapHeatmapChart data={heatmapData} />
)}
</div>

</DashboardLayout>

);

}