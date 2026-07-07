import { useState, useEffect } from "react";
import {
  getRoles,
  addRole,
  updateRole,
  deleteRole,
} from "../../services/roleService";
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
  const [roles, setRoles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newRole, setNewRole] = useState("");
  const loadRoles = async () => {
  try {
    const response = await getRoles();
    setRoles(response.data);
  } catch (err) {
    console.error(err);
  }
};
useEffect(() => {
  loadRoles();
}, []);


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

          <button
  onClick={() => setShowModal(true)}
  className="bg-blue-600 text-white px-5 py-3 rounded-xl flex items-center gap-2 hover:bg-blue-700"
>

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
                    item.roleName.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((item) => (

                    <tr
                      key={item.id}
                      className="border-b hover:bg-slate-50"
                    >

                      <td className="p-4">{item.id}</td>

                      <td className="p-4 font-semibold">
                        {item.roleName}
                      </td>
                      <td className="p-4">-</td>

                      <td className="p-4">-</td>

                      <td className="p-4">
                         <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                          Active
                      </span>
                      </td>

                  <td className="p-4">-</td>

     
     

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

        

        
      </div>
      {showModal && (
  <div className="fixed inset-0 bg-black/40 flex justify-center items-center">

    <div className="bg-white p-6 rounded-2xl w-96">

      <h2 className="text-xl font-bold mb-5">
        Add New Role
      </h2>

      <input
        type="text"
        placeholder="Enter Role Name"
        value={newRole}
        onChange={(e) => setNewRole(e.target.value)}
        className="border w-full p-3 rounded-lg"
      />

      <div className="flex justify-end gap-3 mt-5">

        <button
          onClick={() => setShowModal(false)}
          className="border px-4 py-2 rounded-lg"
        >
          Cancel
        </button>

        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Save
        </button>

      </div>

    </div>

  </div>
)}

    </DashboardLayout>

  );

}