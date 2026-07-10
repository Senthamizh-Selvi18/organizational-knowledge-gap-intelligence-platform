import { useEffect, useState, useCallback } from "react";
import Select, { components } from "react-select";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  getEmployees,
  getSkills,
} from "../../services/EmployeeSkillService";

import {
  FiUsers,
  FiCpu,
  FiAlertCircle,
  FiRefreshCw,
  FiBarChart2,
} from "react-icons/fi";

export default function GapAnalysis() {
  const [employees, setEmployees] = useState([]);
  const [skills, setSkills] = useState([]);

  const [selectedEmployee, setSelectedEmployee] = useState("");

  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Dummy Gap Analysis Data
  const [gapData, setGapData] = useState({
    employeeSkills: [],
    requiredSkills: [],
    missingSkills: [],
    gapPercentage: 0,
  });

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

  const CustomOption = (props) => {
    const employee = props.data.employee;

    return (
      <components.Option {...props}>
        <div className="py-1">
          <p className="font-semibold text-slate-800">
            {employee.user?.name}
          </p>

          <p className="text-sm text-slate-500">
            {employee.employeeCode}
          </p>

          <p className="text-xs text-blue-600">
            {employee.designation}
          </p>

          <p className="text-xs text-slate-500">
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

  const loadGapAnalysis = (employeeId) => {
    if (!employeeId) {
      setGapData({
        employeeSkills: [],
        requiredSkills: [],
        missingSkills: [],
        gapPercentage: 0,
      });

      return;
    }

    // Dummy Data
    setGapData({
      employeeSkills: [
        "Java",
        "HTML",
        "CSS",
        "JavaScript",
      ],

      requiredSkills: [
        "Java",
        "Spring Boot",
        "React",
        "Docker",
        "SQL",
      ],

      missingSkills: [
        "Spring Boot",
        "React",
        "Docker",
      ],

      gapPercentage: 60,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* Header */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white shadow-lg">

          <div>

            <h1 className="text-4xl font-bold">
              Gap Analysis
            </h1>

            <p className="mt-2 text-blue-100 text-lg">
              Analyze employee skill gaps and identify missing competencies.
            </p>

          </div>

        </div>

        {/* Dashboard Cards */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="rounded-3xl bg-white p-6 shadow-lg">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm uppercase text-gray-500">
                  Employees
                </p>

                <h2 className="mt-2 text-4xl font-bold">
                  {employees.length}
                </h2>

              </div>

              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">

                <FiUsers className="text-3xl text-blue-600" />

              </div>

            </div>

          </div>

          <div className="rounded-3xl bg-white p-6 shadow-lg">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm uppercase text-gray-500">
                  Total Skills
                </p>

                <h2 className="mt-2 text-4xl font-bold">
                  {skills.length}
                </h2>

              </div>

              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">

                <FiCpu className="text-3xl text-green-600" />

              </div>

            </div>

          </div>

          <div className="rounded-3xl bg-white p-6 shadow-lg">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm uppercase text-gray-500">
                  Gap %
                </p>

                <h2 className="mt-2 text-4xl font-bold text-red-600">
                  {gapData.gapPercentage}%
                </h2>

              </div>

              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">

                <FiBarChart2 className="text-3xl text-red-600" />

              </div>

            </div>

          </div>

        </div>

        {/* Employee Selection */}

        <div className="rounded-3xl bg-white p-6 shadow-lg">

          <div className="mb-5 flex items-center justify-between">

            <h2 className="text-2xl font-bold">
              Select Employee
            </h2>

            <button
              onClick={loadData}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-white"
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
                (option) =>
                  option.value === Number(selectedEmployee)
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
                  </div>

        {/* Gap Progress */}

        <div className="rounded-3xl bg-white p-6 shadow-lg">

          <div className="mb-6">

            <h2 className="text-2xl font-bold text-slate-800">
              Overall Skill Gap
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Percentage of missing skills for the selected employee.
            </p>

          </div>

          <div className="w-full rounded-full bg-slate-200 h-5 overflow-hidden">

            <div
              className="h-5 rounded-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-500"
              style={{
                width: `${gapData.gapPercentage}%`,
              }}
            />

          </div>

          <div className="mt-4 flex justify-between text-sm font-semibold">

            <span className="text-green-600">
              Skills Available
            </span>

            <span className="text-red-600">
              Gap {gapData.gapPercentage}%
            </span>

          </div>

        </div>

        {/* Skills Grid */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Employee Skills */}

          <div className="rounded-3xl bg-white shadow-lg p-6">

            <h2 className="mb-5 text-xl font-bold text-slate-800">
              Employee Skills
            </h2>

            {gapData.employeeSkills.length === 0 ? (

              <p className="text-slate-400">
                Select an employee.
              </p>

            ) : (

              <div className="flex flex-wrap gap-3">

                {gapData.employeeSkills.map((skill, index) => (

                  <span
                    key={index}
                    className="rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700"
                  >
                    {skill}
                  </span>

                ))}

              </div>

            )}

          </div>

          {/* Required Skills */}

          <div className="rounded-3xl bg-white shadow-lg p-6">

            <h2 className="mb-5 text-xl font-bold text-slate-800">
              Required Skills
            </h2>

            {gapData.requiredSkills.length === 0 ? (

              <p className="text-slate-400">
                Select an employee.
              </p>

            ) : (

              <div className="flex flex-wrap gap-3">

                {gapData.requiredSkills.map((skill, index) => (

                  <span
                    key={index}
                    className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700"
                  >
                    {skill}
                  </span>

                ))}

              </div>

            )}

          </div>

          {/* Missing Skills */}

          <div className="rounded-3xl bg-white shadow-lg p-6">

            <h2 className="mb-5 text-xl font-bold text-slate-800">
              Missing Skills
            </h2>

            {gapData.missingSkills.length === 0 ? (

              <div className="flex items-center gap-2 text-green-600">

                <FiCheckCircle />

                <span>
                  No Skill Gap
                </span>

              </div>

            ) : (

              <div className="flex flex-wrap gap-3">

                {gapData.missingSkills.map((skill, index) => (

                  <span
                    key={index}
                    className="rounded-full bg-red-100 px-4 py-2 text-sm font-medium text-red-700"
                  >
                    {skill}
                  </span>

                ))}

              </div>

            )}

          </div>

        </div>

        {/* Summary Card */}

        <div className="rounded-3xl bg-white p-6 shadow-lg">

          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            Gap Analysis Summary
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <div className="rounded-2xl bg-green-50 p-5 text-center">

              <h3 className="text-4xl font-bold text-green-600">
                {gapData.employeeSkills.length}
              </h3>

              <p className="mt-2 text-slate-600">
                Current Skills
              </p>

            </div>

            <div className="rounded-2xl bg-blue-50 p-5 text-center">

              <h3 className="text-4xl font-bold text-blue-600">
                {gapData.requiredSkills.length}
              </h3>

              <p className="mt-2 text-slate-600">
                Required Skills
              </p>

            </div>

            <div className="rounded-2xl bg-red-50 p-5 text-center">

              <h3 className="text-4xl font-bold text-red-600">
                {gapData.missingSkills.length}
              </h3>

              <p className="mt-2 text-slate-600">
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

        <div className="overflow-hidden rounded-3xl bg-white shadow-lg">

          <div className="border-b p-6">

            <h2 className="text-2xl font-bold text-slate-800">
              Gap Analysis Details
            </h2>

            <p className="mt-2 text-slate-500">
              Comparison between employee skills and required skills.
            </p>

          </div>

          <div className="overflow-x-auto">

            <table className="min-w-full">

              <thead className="bg-slate-100">

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

                {gapData.requiredSkills.length === 0 ? (

                  <tr>

                    <td
                      colSpan={4}
                      className="py-12 text-center text-slate-400"
                    >
                      Select an employee to view gap analysis.
                    </td>

                  </tr>

                ) : (

                  gapData.requiredSkills.map((skill, index) => {

                    const available =
                      gapData.employeeSkills.includes(skill);

                    return (

                      <tr
                        key={index}
                        className="border-b hover:bg-slate-50"
                      >

                        <td className="px-6 py-4 font-semibold">
                          {skill}
                        </td>

                        <td className="px-6 py-4">
                          {available ? "✔" : "-"}
                        </td>

                        <td className="px-6 py-4">
                          ✔
                        </td>

                        <td className="px-6 py-4">

                          {available ? (

                            <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">

                              Available

                            </span>

                          ) : (

                            <span className="rounded-full bg-red-100 px-3 py-1 text-sm text-red-700">

                              Missing

                            </span>

                          )}

                        </td>

                      </tr>

                    );

                  })

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </DashboardLayout>

  );

}