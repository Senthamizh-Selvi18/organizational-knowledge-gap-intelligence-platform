import { useState, useEffect, useCallback } from "react";

import DashboardLayout from "../../components/layout/DashboardLayout";

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
  FiMapPin,
  FiPhone,
  FiCalendar,
} from "react-icons/fi";

import {
  getEmployees,
  updateEmployee,
  deleteEmployee,
} from "../../services/EmployeeManagementService";

export default function EmployeeManagement() {

  /* ===========================
        STATES
  ============================ */

  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const [showViewModal, setShowViewModal] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [editForm, setEditForm] = useState({

    department: "",

    designation: "",

    phoneNumber: "",

    location: "",

    joiningDate: "",

    experience: "",

    manager: "",

  });

  /* ===========================
        LOAD EMPLOYEES
  ============================ */

  const loadEmployees = useCallback(async () => {

    try {

      setLoading(true);

      setError("");

      setMessage("");

      const response = await getEmployees();

      const employeeList = response.data || [];

      setEmployees(employeeList);

      setFilteredEmployees(employeeList);

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

  /* ===========================
        INITIAL LOAD
  ============================ */

  useEffect(() => {

    loadEmployees();

  }, [loadEmployees]);

  /* ===========================
        SEARCH
  ============================ */
useEffect(() => {
  const keyword = searchTerm.trim().toLowerCase();

  if (!keyword) {
    setFilteredEmployees(employees);
    return;
  }

  const filtered = employees.filter((employee) => {

    // Search by Employee Code
   if (/^emp\d+$/i.test(keyword)) {
    return employee.employeeCode
        ?.toLowerCase()
        .includes(keyword);
}

    // Search by Experience (only numbers)
    if (/^\d+$/.test(keyword)) {
      return String(employee.experience) === keyword;
    }

    // Search all text fields
    return (
      employee.name?.toLowerCase().includes(keyword) ||
      employee.email?.toLowerCase().includes(keyword) ||
      employee.department?.toLowerCase().includes(keyword) ||
      employee.designation?.toLowerCase().includes(keyword) ||
      employee.manager?.toLowerCase().includes(keyword) ||
      employee.role?.toLowerCase().includes(keyword)
    );
  });

  setFilteredEmployees(filtered);

}, [searchTerm, employees]);
  /* ===========================
        REFRESH
  ============================ */

  const handleRefresh = async () => {

    setSearchTerm("");

    setSelectedEmployee(null);

    setShowViewModal(false);

    setShowEditModal(false);

    setShowDeleteModal(false);

    setMessage("");

    setError("");

    await loadEmployees();
    window.scrollTo({

top:0,

behavior:"smooth",

});

  };

  /* ===========================
        DASHBOARD COUNTS
  ============================ */

  const totalEmployees = employees.length;

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

            (sum, employee) =>

              sum + (employee.experience || 0),

            0

          ) / employees.length

        ).toFixed(1)

      : 0;

  /* ===========================
        ROLE COLORS
  ============================ */

  const getRoleBadge = (role) => {

    switch (role) {

      case "Admin":

        return "bg-purple-100 text-purple-700";

      case "Employee":

        return "bg-green-100 text-green-700";

      case "Intern":

        return "bg-orange-100 text-orange-700";

      case "HR":

        return "bg-pink-100 text-pink-700";

      case "Manager":

        return "bg-blue-100 text-blue-700";

      case "Team Lead":

        return "bg-indigo-100 text-indigo-700";

      case "Trainer":

        return "bg-yellow-100 text-yellow-700";

      default:

        return "bg-gray-100 text-gray-700";

    }

  };

  /* ===========================
        BUTTON ACTIONS
  ============================ */

  const handleView = (employee) => {

    setSelectedEmployee(employee);

    setShowViewModal(true);

  };

  const handleEdit = (employee) => {

    setSelectedEmployee(employee);

    setEditForm({

      department: employee.department || "",

      designation: employee.designation || "",

      phoneNumber: employee.phoneNumber || "",

      location: employee.location || "",

      joiningDate: employee.joiningDate || "",

      experience: employee.experience || "",

      manager: employee.manager || "",

    });

    setShowEditModal(true);

  };

  const handleDelete = (employee) => {

    setSelectedEmployee(employee);

    setShowDeleteModal(true);

  };

  /* ===========================
        UPDATE EMPLOYEE
  ============================ */

  const handleUpdateEmployee = async () => {

    try {

      await updateEmployee(

        selectedEmployee.id,

        editForm

      );

      setMessage(

        "Employee updated successfully."

      );

      setShowEditModal(false);

setSelectedEmployee(null);

await loadEmployees();

window.scrollTo({

top:0,

behavior:"smooth",

});

    } catch (err) {

      console.error(err);

      setError(

        err.response?.data?.message ||

        "Unable to update employee."

      );

    }

  };

  /* ===========================
        DELETE EMPLOYEE
  ============================ */

  const confirmDelete = async () => {

    try {

      await deleteEmployee(selectedEmployee.id);

      setMessage(

        "Employee deleted successfully."

      );

      setShowDeleteModal(false);

setSelectedEmployee(null);

await loadEmployees();

window.scrollTo({

top:0,

behavior:"smooth",

});
    } catch (err) {

      console.error(err);

      setError(

        err.response?.data?.message ||

        "Unable to delete employee."

      );

    }

  };

  /* ===========================
        RETURN
  ============================ */
return (
  <DashboardLayout>
    <div className="space-y-8">

      {/* ===========================
              HEADER
      ============================ */}

      <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white shadow-lg">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between">

          <div>

            <h1 className="text-4xl font-bold">

              Employee Management

            </h1>

            <p className="mt-3 text-blue-100 text-lg">

              Manage employee information, departments, reporting managers
              and organizational details.

            </p>

          </div>

          <button

            onClick={handleRefresh}

            className="mt-6 md:mt-0 flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-blue-700 shadow hover:bg-slate-100 transition"

          >

            <FiRefreshCw />

            Refresh

          </button>

        </div>

      </div>

      {/* ===========================
            DASHBOARD CARDS
      ============================ */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        {/* Employees */}

        <div className="rounded-3xl bg-white p-6 shadow-lg">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm uppercase text-slate-500">

                Employees

              </p>

              <h2 className="mt-2 text-4xl font-bold">

                {totalEmployees}

              </h2>

            </div>

            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">

              <FiUsers className="text-3xl text-blue-600"/>

            </div>

          </div>

        </div>

        {/* Departments */}

        <div className="rounded-3xl bg-white p-6 shadow-lg">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm uppercase text-slate-500">

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

        {/* Managers */}

        <div className="rounded-3xl bg-white p-6 shadow-lg">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm uppercase text-slate-500">

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

        {/* Average Experience */}

        <div className="rounded-3xl bg-white p-6 shadow-lg">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm uppercase text-slate-500">

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

      {/* ===========================
              SEARCH
      ============================ */}

      <div className="rounded-3xl bg-white p-6 shadow-lg">

        <div className="flex flex-col lg:flex-row gap-4">

          <div className="relative flex-1">

            <FiSearch className="absolute left-4 top-4 text-slate-400"/>

           <input
  type="text"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value.trimStart())}
  placeholder="Search by Name, Email, Employee Code, Department, Designation, Manager, Role or experience"
  className="w-full rounded-xl border border-slate-300 py-3 pl-12 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
/>

          </div>

          <button

            onClick={handleRefresh}

            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 transition"

          >

            Refresh

          </button>

        </div>

      </div>

      {/* ===========================
          SUCCESS MESSAGE
      ============================ */}

      {message && (

        <div className="rounded-2xl border border-green-300 bg-green-50 p-4 shadow-sm">

          <div className="flex items-center gap-3">

            <FiCheckCircle className="text-xl text-green-600"/>

            <span className="font-medium text-green-700">

              {message}

            </span>

          </div>

        </div>

      )}

      {/* ===========================
          ERROR MESSAGE
      ============================ */}

      {error && (

        <div className="rounded-2xl border border-red-300 bg-red-50 p-4 shadow-sm">

          <div className="flex items-center gap-3">

            <FiAlertCircle className="text-xl text-red-600"/>

            <span className="font-medium text-red-700">

              {error}

            </span>

          </div>

        </div>

      )}
            {/* ===========================
            EMPLOYEE LIST
      ============================ */}

      <div className="overflow-hidden rounded-3xl bg-white shadow-lg">

        <div className="border-b border-slate-200 p-6">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-2xl font-bold text-slate-800">

                Employee List

              </h2>

              <p className="mt-2 text-slate-500">

                View, search and manage all employees.

              </p>

            </div>

            <div className="rounded-xl bg-blue-50 px-4 py-2">

              <span className="text-sm font-semibold text-blue-700">

                Total : {filteredEmployees.length}

              </span>

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

                <th className="px-6 py-4 text-center text-sm font-semibold uppercase">

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
                    className="py-20 text-center"
                  >

                    <div className="flex flex-col items-center gap-3">

                      <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>

                      <p className="font-medium text-slate-500">

                        Loading Employees...

                      </p>

                    </div>

                  </td>

                </tr>

              ) : filteredEmployees.length === 0 ? (

                <tr>

                  <td
                    colSpan={8}
                    className="py-20 text-center"
                  >

                    <FiUsers
                      className="mx-auto mb-4 text-slate-300"
                      size={60}
                    />

                    <h3 className="text-xl font-semibold text-slate-500">

                      No Employees Found

                    </h3>

                    <p className="mt-2 text-slate-400">

                      Try another search keyword.

                    </p>

                  </td>

                </tr>

              ) : (

                filteredEmployees.map((employee) => (

                  <tr
                    key={employee.id}
                    className="border-b border-slate-100 transition hover:bg-slate-50"
                  >

                    <td className="px-6 py-5 font-semibold text-slate-800">

                      {employee.employeeCode}

                    </td>

                    <td className="px-6 py-5">

                      <div>

                        <h3 className="font-semibold text-slate-800">

                          {employee.name || "-"}

                        </h3>

                        <p className="text-sm text-slate-500">

                          {employee.email}

                        </p>

                      </div>

                    </td>

                    <td className="px-6 py-5">

                      {employee.department}

                    </td>

                    <td className="px-6 py-5">

                      {employee.designation}

                    </td>

                    <td className="px-6 py-5">

                      {employee.manager || "-"}

                    </td>

                    <td className="px-6 py-5">

                      {employee.experience??0} Years

                    </td>

                    <td className="px-6 py-5 text-center">

                      <span
                        className={`rounded-full px-4 py-2 text-sm font-semibold ${getRoleBadge(
                          employee.role
                        )}`}
                      >

                        {employee.role}

                      </span>

                    </td>

                    <td className="px-6 py-5">

  <div className="flex items-center justify-center gap-2">

    <button
      onClick={() => handleView(employee)}
      className="rounded-xl bg-blue-100 p-2 text-blue-700 transition hover:bg-blue-200 hover:scale-105"
      title="View Employee"
    >
      <FiEye size={18} />
    </button>

    <button
      onClick={() => handleEdit(employee)}
      className="rounded-xl bg-green-100 p-2 text-green-700 transition hover:bg-green-200 hover:scale-105"
      title="Edit Employee"
    >
      <FiEdit2 size={18} />
    </button>

    <button
      onClick={() => handleDelete(employee)}
      className="rounded-xl bg-red-100 p-2 text-red-700 transition hover:bg-red-200 hover:scale-105"
      title="Delete Employee"
    >
      <FiTrash2 size={18} />
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

      {/* ===========================
            END OF EMPLOYEE TABLE
      ============================ */}
            {/* ===========================
              VIEW EMPLOYEE MODAL
      ============================ */}

      {showViewModal && selectedEmployee && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">

          <div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl">

            {/* Header */}

            <div className="flex items-center justify-between rounded-t-3xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-white">

              <div>

                <h2 className="text-2xl font-bold">

                  Employee Details

                </h2>

                <p className="mt-1 text-blue-100">

                  View complete employee information.

                </p>

              </div>

              <button

                onClick={() => setShowViewModal(false)}

                className="rounded-full bg-white/20 p-2 hover:bg-white/30"

              >

                <FiX size={24} />

              </button>

            </div>

            {/* Body */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8">

              <div>

                <label className="text-sm font-semibold text-slate-500">

                  Employee Name

                </label>

                <p className="mt-2 rounded-xl bg-slate-100 p-3 font-semibold">

                  {selectedEmployee.name}

                </p>

              </div>

              <div>

                <label className="text-sm font-semibold text-slate-500">

                  Employee Code

                </label>

                <p className="mt-2 rounded-xl bg-slate-100 p-3">

                  {selectedEmployee.employeeCode}

                </p>

              </div>

              <div>

                <label className="text-sm font-semibold text-slate-500">

                  Email

                </label>

                <p className="mt-2 rounded-xl bg-slate-100 p-3">

                  {selectedEmployee.email}

                </p>

              </div>

              <div>

                <label className="text-sm font-semibold text-slate-500">

                  Department

                </label>

                <p className="mt-2 rounded-xl bg-slate-100 p-3">

                  {selectedEmployee.department}

                </p>

              </div>

              <div>

                <label className="text-sm font-semibold text-slate-500">

                  Designation

                </label>

                <p className="mt-2 rounded-xl bg-slate-100 p-3">

                  {selectedEmployee.designation}

                </p>

              </div>

              <div>

                <label className="text-sm font-semibold text-slate-500">

                  Manager

                </label>

                <p className="mt-2 rounded-xl bg-slate-100 p-3">

                  {selectedEmployee.manager || "-"}

                </p>

              </div>

              <div>

                <label className="text-sm font-semibold text-slate-500">

                  Phone Number

                </label>

                <p className="mt-2 rounded-xl bg-slate-100 p-3 flex items-center gap-2">

                  <FiPhone />

                  {selectedEmployee.phoneNumber || "-"}

                </p>

              </div>

              <div>

                <label className="text-sm font-semibold text-slate-500">

                  Location

                </label>

                <p className="mt-2 rounded-xl bg-slate-100 p-3 flex items-center gap-2">

                  <FiMapPin />

                  {selectedEmployee.location || "-"}

                </p>

              </div>

              <div>

                <label className="text-sm font-semibold text-slate-500">

                  Joining Date

                </label>

                <p className="mt-2 rounded-xl bg-slate-100 p-3 flex items-center gap-2">

                  <FiCalendar />

                  {selectedEmployee.joiningDate ||"-"}

                </p>

              </div>

              <div>

                <label className="text-sm font-semibold text-slate-500">

                  Experience

                </label>

                <p className="mt-2 rounded-xl bg-slate-100 p-3">

                  {selectedEmployee.experience??0} Years

                </p>

              </div>

              <div className="md:col-span-2">

                <label className="text-sm font-semibold text-slate-500">

                  Role

                </label>

                <div className="mt-3">

                  <span
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${getRoleBadge(
                      selectedEmployee.role
                    )}`}
                  >

                    {selectedEmployee.role}

                  </span>

                </div>

              </div>

            </div>

            {/* Footer */}

            <div className="flex justify-end border-t border-slate-200 p-6">

              <button

                onClick={() => setShowViewModal(false)}

                className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"

              >

                Close

              </button>

            </div>

          </div>

        </div>

      )}
            {/* ===========================
            EDIT EMPLOYEE MODAL
      ============================ */}

      {showEditModal && selectedEmployee && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">

          <div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl">

            {/* Header */}

            <div className="flex items-center justify-between rounded-t-3xl bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6 text-white">

              <div>

                <h2 className="text-2xl font-bold">

                  Edit Employee

                </h2>

                <p className="mt-1 text-green-100">

                  Update employee information.

                </p>

              </div>

              <button

                onClick={() => setShowEditModal(false)}

                className="rounded-full bg-white/20 p-2 hover:bg-white/30"

              >

                <FiX size={24} />

              </button>

            </div>

            {/* Body */}

            <div className="grid grid-cols-1 gap-6 p-8 md:grid-cols-2">

              {/* Department */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-600">

                  Department

                </label>

                <select

  value={editForm.department}

  onChange={(e) =>
    setEditForm({
      ...editForm,
      department: e.target.value,
    })
  }

  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"

>

  <option value="AI">AI</option>

  <option value="IT">IT</option>

  <option value="HR">HR</option>

  <option value="Finance">Finance</option>

  <option value="Marketing">Marketing</option>

</select>

              </div>

              {/* Designation */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-600">

                  Designation

                </label>

                <select

value={editForm.designation}

onChange={(e)=>

setEditForm({

...editForm,

designation:e.target.value,

})

}

className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"

>

<option>Software Engineer</option>

<option>Senior Software Engineer</option>

<option>Frontend Developer</option>

<option>Backend Developer</option>

<option>Full Stack Developer</option>

<option>Manager</option>

<option>Trainer</option>

<option>HR Executive</option>

<option>Intern</option>

</select>

              </div>

              {/* Phone */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-600">

                  Phone Number

                </label>

                <input

type="text"

maxLength={10}

value={editForm.phoneNumber}

onChange={(e)=>

setEditForm({

...editForm,

phoneNumber:e.target.value.replace(/\D/g,""),

})

}

className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"

/>

              </div>

              {/* Location */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-600">

                  Location

                </label>

                <input

                  type="text"

                  value={editForm.location}

                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      location: e.target.value,
                    })
                  }

                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"

                />

              </div>
                            {/* Joining Date */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-600">

                  Joining Date

                </label>

                <input

type="date"

max={new Date().toISOString().split("T")[0]}

value={editForm.joiningDate}

onChange={(e)=>

setEditForm({

...editForm,

joiningDate:e.target.value,

})

}

className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"

/>

              </div>

              {/* Experience */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-600">

                  Experience (Years)

                </label>

                <input

                  type="number"

                  min="0"

                  value={editForm.experience}

                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      experience: e.target.value,
                    })
                  }

                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"

                />

              </div>

              {/* Manager */}

              <div className="md:col-span-2">

                <label className="mb-2 block text-sm font-semibold text-slate-600">

                  Reporting Manager

                </label>

                <input

                  type="text"

                  value={editForm.manager}

                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      manager: e.target.value,
                    })
                  }

                  placeholder="Enter Manager Name"

                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"

                />

              </div>

            </div>

            {/* Footer */}

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 p-6">

              <button

                onClick={() => setShowEditModal(false)}

                className="rounded-xl bg-slate-200 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-300"

              >

                Cancel

              </button>

              <button

                onClick={handleUpdateEmployee}

                className="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"

              >

                Update Employee

              </button>

            </div>

          </div>

        </div>

      )}
            {/* ===========================
            DELETE EMPLOYEE MODAL
      ============================ */}

      {showDeleteModal && selectedEmployee && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl">

            {/* Header */}

            <div className="rounded-t-3xl bg-gradient-to-r from-red-600 to-rose-600 px-8 py-6 text-white">

              <div className="flex items-center justify-between">

                <div>

                  <h2 className="text-2xl font-bold">

                    Delete Employee

                  </h2>

                  <p className="mt-1 text-red-100">

                    This action cannot be undone.

                  </p>

                </div>

                <button

                  onClick={() => setShowDeleteModal(false)}

                  className="rounded-full bg-white/20 p-2 hover:bg-white/30"

                >

                  <FiX size={22} />

                </button>

              </div>

            </div>

            {/* Body */}

            <div className="p-8">

              <div className="mb-6 flex justify-center">

                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">

                  <FiTrash2
                    size={36}
                    className="text-red-600"
                  />

                </div>

              </div>

              <h3 className="text-center text-xl font-bold text-slate-800">

                Are you sure?

              </h3>

              <p className="mt-4 text-center text-slate-500">

                You are about to permanently delete

              </p>

              <p className="mt-2 text-center text-lg font-semibold text-slate-800">

                {selectedEmployee.name}

              </p>

              <p className="mt-1 text-center text-sm text-slate-500">

                ({selectedEmployee.employeeCode})

              </p>

              <div className="mt-8 rounded-2xl bg-red-50 p-4">

                <p className="text-sm text-red-700">

                  <strong>Warning:</strong> This employee record will be removed from the system.
                  This action cannot be undone.

                </p>

              </div>

            </div>

            {/* Footer */}

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 p-6">

              <button

                onClick={() => setShowDeleteModal(false)}

                className="rounded-xl bg-slate-200 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-300"

              >

                Cancel

              </button>

              <button

                onClick={confirmDelete}

                className="rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700"

              >

                Delete Employee

              </button>

            </div>

          </div>

        </div>

      )}
            {/* ===========================
              END OF PAGE
      ============================ */}

    </div>

  </DashboardLayout>

);

}