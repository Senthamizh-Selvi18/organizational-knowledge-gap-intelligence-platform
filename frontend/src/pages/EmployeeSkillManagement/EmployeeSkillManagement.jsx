import { useEffect, useState, useCallback } from "react";
import Select, { components } from "react-select";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  getEmployees,
  getSkills,
  getEmployeeSkills,
  assignSkills,
  updateSkills,
} from "../../services/EmployeeSkillService";

import {
  FiUsers,
  FiCpu,
  FiCheckCircle,
  FiRefreshCw,
} from "react-icons/fi";

const DEFAULT_PROFICIENCY = 50;

export default function EmployeeSkillManagement() {

  const [employees, setEmployees] = useState([]);
  const [skills, setSkills] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  // Map of skillId -> proficiency (0-100), kept alongside selectedSkills
  const [skillProficiency, setSkillProficiency] = useState({});
  const [assignedSkills, setAssignedSkills] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
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
  // Load employees and skills
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
      console.error("Load Data Error:", err);
      setError(
        err.response?.data?.message ||
        "Unable to load employees or skills."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load selected employee's skills
const loadEmployeeSkills = useCallback(async (employeeId) => {
  if (!employeeId) {
    setSelectedSkills([]);
    setSkillProficiency({});
    setAssignedSkills([]);
    return;
  }

  try {
    setError("");
    setMessage("");

    const response = await getEmployeeSkills(employeeId);

    const employeeSkills = response?.data || [];

    setAssignedSkills(employeeSkills);
    setSelectedSkills(employeeSkills.map((skill) => skill.skillId));

    // Seed the proficiency map from what's already saved, so the
    // sliders open at the employee's real current level, not the default.
    const proficiencyMap = {};
    employeeSkills.forEach((skill) => {
      proficiencyMap[skill.skillId] =
        typeof skill.proficiencyLevel === "number"
          ? skill.proficiencyLevel
          : DEFAULT_PROFICIENCY;
    });
    setSkillProficiency(proficiencyMap);
  } catch (err) {
    console.error("Employee Skills Error:", err);

    setAssignedSkills([]);
    setSelectedSkills([]);
    setSkillProficiency({});

    setError(
      err.response?.data?.message ||
      "Unable to fetch employee skills."
    );
  }
}, []);


// Handle employee selection
const handleEmployeeChange = (e) => {
  const employeeId = e.target.value;

  setSelectedEmployee(employeeId);
  setMessage("");
  setError("");

  loadEmployeeSkills(employeeId);
};


// Handle skill checkbox selection
const handleSkillSelection = (skillId) => {
  setSelectedSkills((prevSkills) => {
    const isSelected = prevSkills.includes(skillId);

    if (isSelected) {
      return prevSkills.filter((id) => id !== skillId);
    }

    // Seed a default proficiency the first time a skill is checked
    setSkillProficiency((prev) =>
      prev[skillId] !== undefined
        ? prev
        : { ...prev, [skillId]: DEFAULT_PROFICIENCY }
    );

    return [...prevSkills, skillId];
  });
};

// Handle proficiency slider change
const handleProficiencyChange = (skillId, value) => {
  setSkillProficiency((prev) => ({
    ...prev,
    [skillId]: Number(value),
  }));
};

// Build the {skillId, proficiencyLevel} payload from current selection
const buildSkillsPayload = () =>
  selectedSkills.map((skillId) => ({
    skillId,
    proficiencyLevel: skillProficiency[skillId] ?? DEFAULT_PROFICIENCY,
  }));


// Assign skills
const handleAssignSkills = async () => {
  if (!selectedEmployee) {
    setError("Please select an employee.");
    return;
  }

  try {
    setSaving(true);
    setError("");
    setMessage("");

    await assignSkills(selectedEmployee, buildSkillsPayload());

    setMessage("Skills assigned successfully.");

    await loadEmployeeSkills(selectedEmployee);
  } catch (err) {
    console.error("Assign Skills Error:", err);

    setError(
      err.response?.data?.message ||
      "Failed to assign skills."
    );
  } finally {
    setSaving(false);
  }
};


// Update skills
const handleUpdateSkills = async () => {
  if (!selectedEmployee) {
    setError("Please select an employee.");
    return;
  }

  try {
    setSaving(true);
    setError("");
    setMessage("");

    await updateSkills(selectedEmployee, buildSkillsPayload());

    setMessage("Skills updated successfully.");

    await loadEmployeeSkills(selectedEmployee);
  } catch (err) {
    console.error("Update Skills Error:", err);

    setError(
      err.response?.data?.message ||
      "Failed to update skills."
    );
  } finally {
    setSaving(false);
  }
};

  return (
  <DashboardLayout>
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-gradient-to-r from-primary to-primary-dark rounded-3xl p-8 text-white shadow-lg">

        <div>
          <h1 className="text-4xl font-bold">
            Employee Skill Management
          </h1>

          <p className="mt-2 text-primary-tint text-lg">
            Assign, update and manage employee skills across your organization.
          </p>
        </div>

      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Employees Card */}
        <div className="bg-panel rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6">

          <div className="flex justify-between items-center">

            <div>
              <p className="text-sub text-sm font-medium uppercase">
                Employees
              </p>

              <h2 className="text-4xl font-bold text-text mt-2">
                {employees.length}
              </h2>
            </div>

            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary-tint">
              <FiUsers className="text-primary text-3xl" />
            </div>

          </div>

        </div>

        {/* Skills Card */}
        <div className="bg-panel rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6">

          <div className="flex justify-between items-center">

            <div>
              <p className="text-sub text-sm font-medium uppercase">
                Skills
              </p>

              <h2 className="text-4xl font-bold text-text mt-2">
                {skills.length}
              </h2>
            </div>

            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-green-100">
              <FiCpu className="text-green-600 text-3xl" />
            </div>

          </div>

        </div>

        {/* Assigned Skills Card */}
        <div className="bg-panel rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6">

          <div className="flex justify-between items-center">

            <div>
              <p className="text-sub text-sm font-medium uppercase">
                Assigned Skills
              </p>

              <h2 className="text-4xl font-bold text-text mt-2">
                {assignedSkills.length}
              </h2>
            </div>

            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary-tint">
              <FiCheckCircle className="text-primary text-3xl" />
            </div>

          </div>

        </div>

      </div>
        {/* Employee Selection */}

{/* Employee Selection */}

<div className="bg-panel rounded-3xl shadow-lg p-6">

  <div className="flex items-center justify-between mb-5">
    <h2 className="text-2xl font-bold text-text">
      Select Employee
    </h2>

    <span className="px-3 py-1 text-sm bg-primary-tint text-primary-dark rounded-full">
      {employees.length} Employees
    </span>
  </div>

  <Select
  options={employeeOptions}
  placeholder="🔍 Search Employee..."
  isSearchable
  isClearable
  filterOption={filterEmployeeOption}
  components={{
    Option: CustomOption,
  }}
  value={
    employeeOptions.find(
      (option) => option.value === Number(selectedEmployee)
    ) || null
  }
  onChange={(selectedOption) => {
    if (selectedOption) {
      setSelectedEmployee(selectedOption.value);
      loadEmployeeSkills(selectedOption.value);
    } else {
      setSelectedEmployee("");
      setSelectedSkills([]);
      setSkillProficiency({});
      setAssignedSkills([]);
    }
  }}
/>

</div>



{/* Skills Section */}

<div className="bg-panel rounded-3xl shadow-lg p-6">

  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

    <div>
      <h2 className="text-2xl font-bold text-text">
        Available Skills
      </h2>

      <p className="text-sm text-sub mt-1">
        Select one or more skills to assign, then set each proficiency level.
      </p>
    </div>

    <div className="flex items-center gap-3">

      <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
        {skills.length} Skills
      </span>

      <button
        onClick={loadData}
        className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-text transition-all duration-300 hover:bg-primary-dark hover:shadow-lg"
      >
        <FiRefreshCw className={loading ? "animate-spin" : ""} />
        Refresh
      </button>

    </div>

  </div>

  {loading ? (

    <div className="flex flex-col items-center justify-center py-16">

      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-tint border-t-primary"></div>

      <p className="mt-4 text-sub">
        Loading skills...
      </p>

    </div>

  ) : skills.length === 0 ? (

    <div className="rounded-2xl border border-dashed border-line py-12 text-center text-sub">
      No skills available.
    </div>

  ) : (

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

      {skills.map((skill) => {
        const isChecked = selectedSkills.includes(skill.id);
        const proficiency = skillProficiency[skill.id] ?? DEFAULT_PROFICIENCY;

        return (
        <div
          key={skill.id}
          className={`rounded-2xl border p-4 transition-all duration-300 hover:shadow-md

            ${
              isChecked
                ? "border-primary bg-primary-tint shadow"
                : "border-line hover:border-primary"
            }
          `}
        >

          <label className="flex cursor-pointer items-center gap-4">

            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => handleSkillSelection(skill.id)}
              className="h-5 w-5 accent-blue-600"
            />

            <div>
              <p className="font-semibold text-text">
                {skill.skillName}
              </p>

              <p className="text-xs text-sub">
                Skill ID: {skill.id}
              </p>
            </div>

          </label>

          {isChecked && (
            <div className="mt-4">

              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-sub">
                  Proficiency
                </span>
                <span className="text-xs font-semibold text-primary-dark">
                  {proficiency}%
                </span>
              </div>

              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={proficiency}
                onChange={(e) =>
                  handleProficiencyChange(skill.id, e.target.value)
                }
                className="w-full accent-blue-600"
              />

            </div>
          )}

        </div>
        );
      })}

    </div>

  )}

</div>
{/* Buttons */}

      {/* Action Buttons */}

      <div className="flex flex-col sm:flex-row justify-end gap-4">

        <button
          onClick={handleAssignSkills}
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-text shadow-md transition-all duration-300 hover:bg-primary-dark hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <>
              <FiRefreshCw className="animate-spin" />
              Assigning...
            </>
          ) : (
            <>
              <FiCheckCircle />
              Assign Skills
            </>
          )}
        </button>

        <button
          onClick={handleUpdateSkills}
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white shadow-md transition-all duration-300 hover:bg-green-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <>
              <FiRefreshCw className="animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <FiRefreshCw />
              Update Skills
            </>
          )}
        </button>

      </div>


      {/* Success Message */}

      {message && (
        <div className="rounded-2xl border border-green-300 bg-green-50 p-4 text-green-700 shadow-sm">

          <div className="flex items-center gap-2">

            <FiCheckCircle className="text-xl" />

            <span className="font-medium">{message}</span>

          </div>

        </div>
      )}


      {/* Error Message */}

      {error && (
        <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-red-700 shadow-sm">

          <div className="flex items-center gap-2">

            <span className="text-xl">⚠️</span>

            <span className="font-medium">{error}</span>

          </div>

        </div>
      )}


      {/* Assigned Skills Table */}

      <div className="overflow-hidden rounded-3xl bg-panel shadow-lg">

        <div className="flex flex-col gap-2 border-b p-6 md:flex-row md:items-center md:justify-between">

          <div>

            <h2 className="text-2xl font-bold text-text">
              Assigned Skills
            </h2>

            <p className="mt-1 text-sm text-sub">
              Skills currently assigned to the selected employee.
            </p>

          </div>

          <span className="rounded-full bg-primary-tint px-4 py-2 text-sm font-semibold text-primary-dark">

            {assignedSkills.length} Assigned

          </span>

        </div>


        <div className="overflow-x-auto">

          <table className="min-w-full">

            <thead className="bg-bg">

              <tr>

                <th className="px-6 py-4 text-left text-sm font-semibold uppercase text-sub">
                  #
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold uppercase text-sub">
                  Skill ID
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold uppercase text-sub">
                  Skill Name
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold uppercase text-sub">
                  Proficiency
                </th>

              </tr>

            </thead>

            <tbody>

              {selectedEmployee === "" ? (

                <tr>

                  <td
                    colSpan={4}
                    className="py-12 text-center text-mute"
                  >
                    Please select an employee to view assigned skills.
                  </td>

                </tr>

              ) : assignedSkills.length === 0 ? (

                <tr>

                  <td
                    colSpan={4}
                    className="py-12 text-center text-mute"
                  >
                    No skills have been assigned yet.
                  </td>

                </tr>

              ) : (

                assignedSkills.map((skill, index) => (

                  <tr
                    key={skill.skillId}
                    className="border-b transition-colors duration-200 hover:bg-primary-tint"
                  >

                    <td className="px-6 py-4 font-medium text-sub">
                      {index + 1}
                    </td>

                    <td className="px-6 py-4 text-text">
                      {skill.skillId}
                    </td>

                    <td className="px-6 py-4 font-semibold text-text">
                      {skill.skillName}
                    </td>

                    <td className="px-6 py-4 text-text">
                      {typeof skill.proficiencyLevel === "number"
                        ? `${skill.proficiencyLevel}%`
                        : "—"}
                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  </DashboardLayout>
);
}