import { useState } from "react";
import { Navigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  FiUsers,
  FiUserCheck,
  FiClock,
  FiShield,
  FiSearch,
  FiPlus,
  FiEye,
  FiEdit,
  FiTrash2,
} from "react-icons/fi";

const roles = [
  {
    id: "R001",
    role: "Employee",
    description: "Basic employee access",
    employees: 120,
    status: "Active",
    created: "10-Jan-2026",
  },
  {
    id: "R002",
    role: "Manager",
    description: "Manage team members",
    employees: 20,
    status: "Active",
    created: "18-Jan-2026",
  },
  {
    id: "R003",
    role: "HR Specialist",
    description: "Employee management",
    employees: 8,
    status: "Active",
    created: "25-Jan-2026",
  },
  {
    id: "R004",
    role: "System Admin",
    description: "Complete system access",
    employees: 3,
    status: "Inactive",
    created: "02-Feb-2026",
  },
];

const activities = [
  "Created Employee Role",
  "Updated Manager Permissions",
  "Deleted Temporary Role",
  "Assigned HR Specialist Role",
];

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-3xl shadow-xl p-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-slate-500 text-sm">{title}</p>
          <h2 className="text-3xl font-bold mt-2">{value}</h2>
        </div>

        <div className={`p-4 rounded-2xl ${color}`}>
          <Icon className="text-white text-2xl" />
        </div>
      </div>
    </div>
  );
}

export default function RoleManagement() {
  const role = localStorage.getItem("role");

if (role !== "ADMIN") {
  return <Navigate to="/dashboard" replace />;
}
  const [search, setSearch] = useState("");

  return (
    <DashboardLayout>

      <div className="space-y-6">

        {/* Header */}

        <div className="flex justify-between items-center">

          <div>

            <h1 className="text-3xl font-bold">
              Role Management
            </h1>

            <p className="text-slate-500">
              Manage user roles and permissions across the organization.
            </p>

          </div>

          <button className="bg-blue-600 text-white px-5 py-3 rounded-xl flex items-center gap-2 hover:bg-blue-700">

            <FiPlus />

            Add Role

          </button>

        </div>

        {/* Statistics */}

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">

          <StatCard
            title="Total Roles"
            value="8"
            icon={FiShield}
            color="bg-blue-600"
          />

          <StatCard
            title="Active Roles"
            value="6"
            icon={FiUserCheck}
            color="bg-green-600"
          />

          <StatCard
            title="Employees Assigned"
            value="151"
            icon={FiUsers}
            color="bg-purple-600"
          />

          <StatCard
            title="Pending Requests"
            value="4"
            icon={FiClock}
            color="bg-orange-500"
          />

        </div>

        {/* Search */}

        <div className="bg-white rounded-3xl shadow-xl p-6">

          <div className="flex flex-col md:flex-row gap-4">

            <div className="relative flex-1">

              <FiSearch className="absolute left-4 top-4 text-slate-400"/>

              <input
                type="text"
                placeholder="Search Role..."
                value={search}
                onChange={(e)=>setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border outline-none"
              />

            </div>

            <select className="border rounded-xl px-4">

              <option>All</option>
              <option>Active</option>
              <option>Inactive</option>

            </select>

          </div>

        </div>
                {/* Roles Table */}

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-slate-100">

                <tr>

                  <th className="p-4 text-left">Role ID</th>
                  <th className="p-4 text-left">Role Name</th>
                  <th className="p-4 text-left">Description</th>
                  <th className="p-4 text-left">Employees</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Created Date</th>
                  <th className="p-4 text-center">Actions</th>

                </tr>

              </thead>

              <tbody>

                {roles
                  .filter((item) =>
                    item.role.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((item) => (

                    <tr
                      key={item.id}
                      className="border-b hover:bg-slate-50"
                    >

                      <td className="p-4">{item.id}</td>

                      <td className="p-4 font-semibold">
                        {item.role}
                      </td>

                      <td className="p-4">
                        {item.description}
                      </td>

                      <td className="p-4">
                        {item.employees}
                      </td>

                      <td className="p-4">

                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            item.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {item.status}
                        </span>

                      </td>

                      <td className="p-4">
                        {item.created}
                      </td>

                      <td className="p-4">

                        <div className="flex justify-center gap-3">

                          <button className="text-blue-600 hover:text-blue-800">
                            <FiEye />
                          </button>

                          <button className="text-green-600 hover:text-green-800">
                            <FiEdit />
                          </button>

                          <button className="text-red-600 hover:text-red-800">
                            <FiTrash2 />
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

              </tbody>

            </table>

          </div>

        </div>

        {/* Recent Activity */}

        <div className="bg-white rounded-3xl shadow-xl p-6">

          <h2 className="text-xl font-bold mb-5">
            Recent Activity
          </h2>

          <div className="space-y-4">

            {activities.map((activity, index) => (

              <div
                key={index}
                className="flex items-center gap-3 bg-slate-100 rounded-xl p-4"
              >

                <div className="w-3 h-3 rounded-full bg-blue-600"></div>

                <span>{activity}</span>

              </div>

            ))}

          </div>

        </div>

        {/* Add Role Modal (UI Only) */}

        <div className="fixed bottom-6 right-6">

          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-full shadow-xl">

            <FiPlus size={22} />

          </button>

        </div>

      </div>

    </DashboardLayout>

  );

}