import { useEffect, useState, useCallback } from "react";
import Select, { components } from "react-select";
import DashboardLayout from "../../components/layout/DashboardLayout";

import {
  getEmployees,
  getSkills,
} from "../../services/EmployeeSkillService";

import { getGapAnalysis } from "../../services/GapAnalysisService";

import {
  FiUsers,
  FiCpu,
  FiAlertCircle,
  FiRefreshCw,
  FiBarChart2,
  FiCheckCircle,
} from "react-icons/fi";

export default function GapAnalysis() {
  const [employees, setEmployees] = useState([]);
  const [skills, setSkills] = useState([]);

  const [selectedEmployee, setSelectedEmployee] = useState("");

  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Backend Gap Analysis Data
  const [gapData, setGapData] = useState([]);
const employeeOptions = employees.map((employee) => ({
  value: employee.id,
  label: `${employee.user?.name} (${employee.employeeCode})`,
  searchText: `
      ${employee.user?.name}
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
};

  const CustomOption = (props) => {
    const employee = props.data.employee;

    return (
      <components.Option {...props}>
        <div className="py-1">
        <p className="font-semibold text-slate-800">
  {employee.user?.name}
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

  useEffect(() => {
    loadData();
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

{/* Gap Progress */}

<div className="rounded-3xl bg-panel p-6 shadow-lg">

  <div className="mb-6">

    <h2 className="text-2xl font-bold text-text">
      Overall Skill Gap
    </h2>

    <p className="mt-1 text-sm text-sub">
      Percentage of missing skills for the selected employee.
    </p>

  </div>

  <div className="w-full rounded-full bg-line h-5 overflow-hidden">

    <div
      className="h-5 rounded-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-500"
      style={{
        width: `${gapPercentage}%`,
      }}
    />

  </div>

  <div className="mt-4 flex justify-between text-sm font-semibold">

    <span className="text-green-600">
      Matched Skills : {matchedSkillCount}
    </span>

    <span className="text-red-600">
      Gap {gapPercentage.toFixed(1)}%
    </span>

  </div>

  <div className="mt-2 flex justify-between text-sm text-sub">

    <span>
      Required Skills : {totalRequiredSkills}
    </span>

    <span>
      Missing Skills : {missingSkillCount}
    </span>

  </div>

</div>

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
          className="rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700"
        >
          {skill.skillName}
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
            className="rounded-full bg-red-100 px-4 py-2 text-sm font-medium text-red-700"
          >
            {skill.skillName}
          </span>

        ))}

      </div>

    )}

  </div>

</div>
        {/* Summary Card */}

        <div className="rounded-3xl bg-panel p-6 shadow-lg">

  <h2 className="text-2xl font-bold text-text mb-4">
    Gap Analysis Summary
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

    <div className="rounded-2xl bg-green-50 p-5 text-center">

      <h3 className="text-4xl font-bold text-green-600">
        {matchedSkillCount}
      </h3>

      <p className="mt-2 text-sub">
        Matched Skills
      </p>

    </div>

    <div className="rounded-2xl bg-primary-tint p-5 text-center">

      <h3 className="text-4xl font-bold text-primary">
        {totalRequiredSkills}
      </h3>

      <p className="mt-2 text-sub">
        Required Skills
      </p>

    </div>

    <div className="rounded-2xl bg-red-50 p-5 text-center">

      <h3 className="text-4xl font-bold text-red-600">
        {missingSkillCount}
      </h3>

      <p className="mt-2 text-sub">
        Missing Skills
      </p>

    </div>

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
        </tr>

      </thead>

      <tbody>

        {currentGap === null ? (

          <tr>

            <td
              colSpan={4}
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

              </tr>

            ))}

          </>

        )}

      </tbody>

    </table>

  </div>

</div>

</div>

</DashboardLayout>

);

}