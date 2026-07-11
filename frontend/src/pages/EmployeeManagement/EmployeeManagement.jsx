import { useState, useEffect, useCallback } from "react";

import {
  FiUsers,
  FiSearch,
  FiRefreshCw,
  FiBriefcase,
  FiUserCheck,
  FiTrendingUp,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiX,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";

import {
  getEmployees,
  updateEmployee,
  deleteEmployee,
} from "../../services/EmployeeManagementService";

import DashboardLayout from "../../components/layout/DashboardLayout";
export default function EmployeeManagement() {

const [selectedEmployee, setSelectedEmployee] = useState(null);

const [showViewModal, setShowViewModal] = useState(false);

const [showEditModal, setShowEditModal] = useState(false);

const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [employees, setEmployees] = useState([]);

  const [filteredEmployees, setFilteredEmployees] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const loadEmployees = useCallback(async () => {

    try {

      setLoading(true);

      setError("");

      setMessage("");

      const response = await getEmployees();

      setEmployees(response.data || []);

      setFilteredEmployees(response.data || []);

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

    loadEmployees();

  }, [loadEmployees]);

  useEffect(() => {

    if (!searchTerm) {

      setFilteredEmployees(employees);

      return;

    }

    const filtered = employees.filter((employee) =>

      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||

      employee.employeeCode
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||

      employee.department
        .toLowerCase()
        .includes(searchTerm.toLowerCase())

    );

    setFilteredEmployees(filtered);

  }, [searchTerm, employees]);

  const handleRefresh = async () => {

    setSearchTerm("");

    await loadEmployees();

  };

  const totalDepartments = [
    ...new Set(
      employees.map((employee) => employee.department)
    ),
  ].length;

  const totalManagers = employees.filter(
    (employee) => employee.role === "Manager"
  ).length;

  const averageExperience =
    employees.length > 0
      ? (
          employees.reduce(
            (sum, employee) => sum + (employee.experience || 0),
            0
          ) / employees.length
        ).toFixed(1)
      : 0;

  return (

    <DashboardLayout>

      <div className="space-y-8">

        {/* Header */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white shadow-lg">

          <div>

            <h1 className="text-4xl font-bold">

              Employee Management

            </h1>

            <p className="mt-2 text-blue-100 text-lg">

              Manage employee information and organizational details.

            </p>

          </div>

        </div>

        {/* Dashboard Cards */}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

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

                <FiUsers className="text-3xl text-blue-600"/>

              </div>

            </div>

          </div>

          <div className="rounded-3xl bg-white p-6 shadow-lg">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm uppercase text-gray-500">

                  Departments

                </p>

                <h2 className="mt-2 text-4xl font-bold text-indigo-600">

                  {totalDepartments}

                </h2>

              </div>

              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">

                <FiBriefcase className="text-3xl text-indigo-600"/>

              </div>

            </div>

          </div>

          <div className="rounded-3xl bg-white p-6 shadow-lg">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm uppercase text-gray-500">

                  Managers

                </p>

                <h2 className="mt-2 text-4xl font-bold text-green-600">

                  {totalManagers}

                </h2>

              </div>

              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">

                <FiUserCheck className="text-3xl text-green-600"/>

              </div>

            </div>

          </div>

          <div className="rounded-3xl bg-white p-6 shadow-lg">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm uppercase text-gray-500">

                  Avg Experience

                </p>

                <h2 className="mt-2 text-4xl font-bold text-orange-600">

                  {averageExperience}

                </h2>

              </div>

              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">

                <FiTrendingUp className="text-3xl text-orange-600"/>

              </div>

            </div>

          </div>

        </div>

        {/* Search */}

        <div className="rounded-3xl bg-white p-6 shadow-lg">

          <div className="flex flex-col md:flex-row gap-4 justify-between">

            <div className="relative flex-1">

              <FiSearch className="absolute left-4 top-4 text-gray-400"/>

              <input

                type="text"

                placeholder="Search employee by name, code or department..."

                value={searchTerm}

                onChange={(e)=>setSearchTerm(e.target.value)}

                className="w-full rounded-xl border pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"

              />

            </div>

            <button

              onClick={handleRefresh}

              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"

            >

              <FiRefreshCw/>

              Refresh

            </button>

          </div>

        </div>

      </div>
      {/* Employee List */}

<div className="overflow-hidden rounded-3xl bg-white shadow-lg">

  <div className="border-b p-6">

    <div className="flex items-center justify-between">

      <div>

        <h2 className="text-2xl font-bold text-slate-800">
          Employee List
        </h2>

        <p className="mt-2 text-slate-500">
          View and manage employee information.
        </p>

      </div>

    </div>

  </div>

  <div className="overflow-x-auto">

    <table className="min-w-full">

      <thead className="bg-slate-100">

        <tr>

          <th className="px-6 py-4 text-left text-sm font-semibold uppercase">
            Employee Code
          </th>

          <th className="px-6 py-4 text-left text-sm font-semibold uppercase">
            Employee
          </th>

          <th className="px-6 py-4 text-left text-sm font-semibold uppercase">
            Department
          </th>

          <th className="px-6 py-4 text-left text-sm font-semibold uppercase">
            Designation
          </th>

          <th className="px-6 py-4 text-left text-sm font-semibold uppercase">
            Manager
          </th>

          <th className="px-6 py-4 text-left text-sm font-semibold uppercase">
            Experience
          </th>

          <th className="px-6 py-4 text-left text-sm font-semibold uppercase">
            Role
          </th>

          <th className="px-6 py-4 text-center text-sm font-semibold uppercase">
            Actions
          </th>

        </tr>

      </thead>

      <tbody>

        {loading ? (

          <tr>

            <td
              colSpan={8}
              className="py-12 text-center text-slate-400"
            >
              Loading employees...
            </td>

          </tr>

        ) : filteredEmployees.length === 0 ? (

          <tr>

            <td
              colSpan={8}
              className="py-12 text-center text-slate-400"
            >
              No employees found.
            </td>

          </tr>

        ) : (

          filteredEmployees.map((employee) => (

            <tr
              key={employee.id}
              className="border-b hover:bg-slate-50 transition"
            >

              <td className="px-6 py-4 font-semibold">
                {employee.employeeCode}
              </td>

              <td className="px-6 py-4">

                <div>

                  <p className="font-semibold text-slate-800">
                    {employee.name}
                  </p>

                  <p className="text-sm text-slate-500">
                    {employee.email}
                  </p>

                </div>

              </td>

              <td className="px-6 py-4">
                {employee.department}
              </td>

              <td className="px-6 py-4">
                {employee.designation}
              </td>

              <td className="px-6 py-4">
                {employee.manager}
              </td>

              <td className="px-6 py-4">
                {employee.experience} Years
              </td>

              <td className="px-6 py-4">

                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium
                    ${
                      employee.role === "Admin"
                        ? "bg-purple-100 text-purple-700"
                        : employee.role === "Manager"
                        ? "bg-blue-100 text-blue-700"
                        : employee.role === "HR"
                        ? "bg-pink-100 text-pink-700"
                        : employee.role === "Intern"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-green-100 text-green-700"
                    }`}
                >

                  {employee.role}

                </span>

              </td>

              <td className="px-6 py-4">

                <div className="flex items-center justify-center gap-2">

                  <button
                    className="rounded-lg bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200"
                  >
                    View
                  </button>

                  <button
                    className="rounded-lg bg-green-100 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-200"
                  >
                    Edit
                  </button>

                  <button
                    className="rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-200"
                  >
                    Delete
                  </button>

                </div>

              </td>

            </tr>

          ))

        )}

      </tbody>

    </table>

  </div>

</div>

{showViewModal && selectedEmployee && (

<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

<div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl">

<div className="mb-6 flex items-center justify-between">

<h2 className="text-2xl font-bold">

Employee Details

</h2>

<button onClick={() => setShowViewModal(false)}>

<FiX size={24}/>

</button>

</div>

<div className="space-y-3">

<p><strong>Name :</strong> {selectedEmployee.name}</p>

<p><strong>Email :</strong> {selectedEmployee.email}</p>

<p><strong>Department :</strong> {selectedEmployee.department}</p>

<p><strong>Designation :</strong> {selectedEmployee.designation}</p>

<p><strong>Phone :</strong> {selectedEmployee.phoneNumber}</p>

<p><strong>Location :</strong> {selectedEmployee.location}</p>

<p><strong>Joining Date :</strong> {selectedEmployee.joiningDate}</p>

<p><strong>Experience :</strong> {selectedEmployee.experience} Years</p>

<p><strong>Manager :</strong> {selectedEmployee.manager}</p>

<p><strong>Role :</strong> {selectedEmployee.role}</p>

</div>

</div>

</div>

)}
{showDeleteModal && (

<div className="fixed inset-0 bg-black/40 flex items-center justify-center">

<div className="rounded-3xl bg-white p-8 shadow-xl">

<h2 className="text-xl font-bold">

Delete Employee

</h2>

<p className="mt-4">

Are you sure you want to delete this employee?

</p>

<div className="mt-6 flex justify-end gap-3">

<button

onClick={() => setShowDeleteModal(false)}

className="rounded-xl bg-gray-200 px-5 py-2"

>

Cancel

</button>

<button

onClick={async () => {

await deleteEmployee(selectedEmployee.id);

await loadEmployees();

setShowDeleteModal(false);

setMessage("Employee deleted successfully.");

}}

className="rounded-xl bg-red-600 px-5 py-2 text-white"

>

Delete

</button>

</div>

</div>

</div>

)}
{message && (

<div className="rounded-2xl border border-green-300 bg-green-50 p-4 text-green-700">

<div className="flex items-center gap-2">

<FiCheckCircle/>

<span>{message}</span>

</div>

</div>

)}

{error && (

<div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-red-700">

<div className="flex items-center gap-2">

<FiAlertCircle/>

<span>{error}</span>

</div>

</div>

)}

    </DashboardLayout>

  );

}
