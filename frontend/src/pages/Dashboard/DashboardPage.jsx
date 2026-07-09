import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { getAllUsers } from "../../services/userService";

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

console.log("Stored role:", role);
console.log("Official:", isOfficial);


  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.log(err);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

 const employeeCount = users.filter(
    user => user.role?.toLowerCase() === "employee"
).length;

const internCount = users.filter(
    user => user.role?.toLowerCase() === "intern"
).length;

  return (
    <DashboardLayout>

      {/* Header */}

      <div className="flex items-center justify-between mb-8">

        <div>

          <h1 className="text-3xl font-bold text-slate-800">
            Dashboard
          </h1>

          <p className="text-slate-500 mt-1">
            Welcome to Organizational Knowledge Gap Intelligence Platform
          </p>

        </div>



      </div>

      {/* Statistics */}
 
      {isOfficial && (
<div className="grid gap-6 md:grid-cols-3 mb-8">
        <div className="rounded-2xl bg-white p-6 shadow-lg">

          <p className="text-slate-500 text-sm">
            Total Users
          </p>

          <h2 className="mt-3 text-4xl font-bold text-slate-800">
            {users.length}
          </h2>

        </div>

        <div className="rounded-2xl bg-white p-6 shadow-lg">

          <p className="text-slate-500 text-sm">
            Employees
          </p>

          <h2 className="mt-3 text-4xl font-bold text-blue-600">
            {employeeCount}
          </h2>

        </div>

        <div className="rounded-2xl bg-white p-6 shadow-lg">

          <p className="text-slate-500 text-sm">
            Interns
          </p>

          <h2 className="mt-3 text-4xl font-bold text-green-600">
            {internCount}
          </h2>

        </div>

      </div>
      )}

      {/* Users Table */}

      <div className="rounded-2xl bg-white shadow-lg p-6">

        <h2 className="text-2xl font-bold mb-6">
          Registered Users
        </h2>

        <div className="overflow-x-auto">

          <table className="min-w-full">

            <thead>

              <tr className="border-b bg-slate-50">

                <th className="px-4 py-3 text-left font-semibold">
                  #
                </th>

                <th className="px-4 py-3 text-left font-semibold">
                  Name
                </th>

                <th className="px-4 py-3 text-left font-semibold">
                  Email
                </th>

                <th className="px-4 py-3 text-left font-semibold">
                  Role
                </th>

                <th className="px-4 py-3 text-left font-semibold">
                  Registered
                </th>

              </tr>

            </thead>

            <tbody>

              {users.map((user, index) => (

                <tr
                  key={user.id}
                  className="border-b hover:bg-slate-50"
                >

                  <td className="px-4 py-4">
                    {index + 1}
                  </td>

                  <td className="px-4 py-4 font-medium whitespace-nowrap">
                    {user.name}
                  </td>

                  <td className="px-4 py-4">
                    {user.email}
                  </td>

                  <td className="px-4 py-4">

                    <span
                      className={`rounded-full px-3 py-1 text-sm font-semibold
                      ${
                        user.role === "Admin"
                          ? "bg-red-100 text-red-700"
                          : user.role === "Manager"
                          ? "bg-purple-100 text-purple-700"
                          : user.role === "Employee"
                          ? "bg-blue-100 text-blue-700"
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