import { useState, useEffect } from "react";
import {
  getRoles,
  addRole,
  updateRole,
  deleteRole,
  getRoleDetails,
} from "../../services/roleService";
import {
  getPendingRoleRequests,
  getPendingRoleRequestCount,
  approveRoleRequest,
  rejectRoleRequest,
} from "../../services/roleRequestService";
import { Navigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { toast } from "../../components/ui/Toast.jsx";
import { confirmDialog } from "../../components/ui/ConfirmDialog.jsx";
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
  FiCheck,
  FiX,
} from "react-icons/fi";

function StatCard({ title, value, icon: Icon, color, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-panel rounded-3xl shadow-xl p-6 ${
        onClick ? "cursor-pointer hover:shadow-2xl transition-shadow" : ""
      }`}
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sub text-sm">{title}</p>
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
  const role = localStorage.getItem("role")?.toLowerCase();

  if (role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  const [search, setSearch] = useState("");
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newRole, setNewRole] = useState("");
  const [editId, setEditId] = useState(null);
  const [editRole, setEditRole] = useState("");
  const [selectedRole, setSelectedRole] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [status, setStatus] = useState("All");

  // ---- Pending role-change requests (real backend data) ----
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [loadingPending, setLoadingPending] = useState(false);
  const [actingOnId, setActingOnId] = useState(null);

  // ---- Derived / dynamic stats (computed from real role data) ----
  const totalRoles = roles.length;
  const activeRoles = roles.filter((r) => r.active).length;
  const employeesAssigned = roles.reduce(
    (sum, r) => sum + (r.totalUsers ?? 0),
    0
  );

  const activities = [...roles]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map((r) => ({
      message: `Role "${r.roleName}" created`,
      date: r.createdAt,
    }));

  const loadRoles = async () => {
    setLoading(true);
    try {
      const response = await getRoles();
      setRoles(response.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  const loadPendingCount = async () => {
    try {
      const response = await getPendingRoleRequestCount();
      setPendingCount(response.data);
    } catch (err) {
      console.error(err);
      // Fail silently on the dashboard stat, table view will surface errors
    }
  };

  const loadPendingRequests = async () => {
    setLoadingPending(true);
    try {
      const response = await getPendingRoleRequests();
      setPendingRequests(response.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load pending requests");
    } finally {
      setLoadingPending(false);
    }
  };

  const handleAddRole = async () => {
    if (!newRole.trim()) {
      toast.warning("Enter a role name");
      return;
    }

    try {
      await addRole({
        roleName: newRole,
      });

      toast.success("Role added successfully");

      setNewRole("");
      setShowModal(false);

      loadRoles();
    } catch (err) {
      toast.error(err.response?.data || "Failed to add role");
    }
  };

  const openPendingModal = () => {
    setShowPendingModal(true);
    loadPendingRequests();
  };

  const handleApprove = async (id) => {
    setActingOnId(id);
    try {
      await approveRoleRequest(id);
      toast.success("Request approved and role updated");
      await Promise.all([loadPendingRequests(), loadPendingCount(), loadRoles()]);
    } catch (err) {
      toast.error(err.response?.data || "Unable to approve request");
    } finally {
      setActingOnId(null);
    }
  };

  const handleReject = async (id) => {
    const ok = await confirmDialog("Reject this role change request?", {
      confirmLabel: "Reject",
      danger: true,
    });
    if (!ok) return;

    setActingOnId(id);
    try {
      await rejectRoleRequest(id);
      toast.success("Request rejected");
      await Promise.all([loadPendingRequests(), loadPendingCount()]);
    } catch (err) {
      toast.error(err.response?.data || "Unable to reject request");
    } finally {
      setActingOnId(null);
    }
  };

  useEffect(() => {
    loadRoles();
    loadPendingCount();
  }, []);

  const visibleRoles = roles
    .filter((item) =>
      item.roleName.toLowerCase().includes(search.toLowerCase())
    )
    .filter((item) => {
      if (status === "Active") return item.active;
      if (status === "Inactive") return !item.active;
      return true;
    });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Role Management</h1>

            <p className="text-sub">
              Manage user roles and permissions across the organization.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="bg-primary text-text px-5 py-3 rounded-xl flex items-center gap-2 hover:bg-primary-dark"
          >
            <FiPlus />
            Add Role
          </button>
        </div>

        {/* Statistics */}

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
          <StatCard
            title="Total Roles"
            value={totalRoles}
            icon={FiShield}
            color="bg-primary"
          />

          <StatCard
            title="Active Roles"
            value={activeRoles}
            icon={FiUserCheck}
            color="bg-green-600"
          />

          <StatCard
            title="Employees Assigned"
            value={employeesAssigned}
            icon={FiUsers}
            color="bg-purple-600"
          />

          <StatCard
            title="Pending Requests"
            value={pendingCount}
            icon={FiClock}
            color="bg-orange-500"
            onClick={openPendingModal}
          />
        </div>

        {/* Search */}

        <div className="bg-panel rounded-3xl shadow-xl p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <FiSearch className="absolute left-4 top-4 text-mute" />

              <input
                type="text"
                placeholder="Search Role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border outline-none"
              />
            </div>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-4 py-3 rounded-xl border outline-none"
            >
              <option>All</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>

        {/* Roles Table */}

        <div className="bg-panel rounded-3xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-bg">
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
                {loading ? (
                  <tr>
                    <td className="p-6 text-center text-sub" colSpan={7}>
                      Loading roles...
                    </td>
                  </tr>
                ) : visibleRoles.length === 0 ? (
                  <tr>
                    <td className="p-6 text-center text-sub" colSpan={7}>
                      No roles found.
                    </td>
                  </tr>
                ) : (
                  visibleRoles.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-bg">
                      <td className="p-4">{item.id}</td>

                      <td className="p-4 font-semibold">
                        {editId === item.id ? (
                          <input
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value)}
                            className="border rounded px-2 py-1"
                          />
                        ) : (
                          item.roleName
                        )}
                      </td>

                      <td className="p-4">{item.description || "-"}</td>

                      <td className="p-4">{item.totalUsers ?? 0}</td>

                      <td className="p-4">
                        <span
                          className={
                            item.active
                              ? "bg-green-100 text-green-700 px-3 py-1 rounded-full"
                              : "bg-red-100 text-red-700 px-3 py-1 rounded-full"
                          }
                        >
                          {item.active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="p-4">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString()
                          : "-"}
                      </td>

                      <td className="p-4">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={async () => {
                              try {
                                const response = await getRoleDetails(item.id);
                                setSelectedRole(response.data);
                                setShowViewModal(true);
                              } catch (err) {
                                toast.error("Unable to load role details");
                              }
                            }}
                            className="text-primary hover:text-primary-dark"
                          >
                            <FiEye />
                          </button>

                          <button
                            onClick={async () => {
                              if (editId === item.id) {
                                if (!editRole.trim()) {
                                  toast.warning("Role name cannot be empty");
                                  return;
                                }
                                try {
                                  await updateRole(item.id, {
                                    roleName: editRole,
                                  });

                                  setEditId(null);
                                  setEditRole("");
                                  toast.success("Role updated successfully");
                                  loadRoles();
                                } catch (err) {
                                  toast.error(
                                    err.response?.data ||
                                      "Unable to update role"
                                  );
                                }
                              } else {
                                setEditId(item.id);
                                setEditRole(item.roleName);
                              }
                            }}
                            className="text-green-600 hover:text-green-800"
                          >
                            {editId === item.id ? "Save" : <FiEdit />}
                          </button>

                          <button
                            onClick={async () => {
                              const ok = await confirmDialog(
                                "Delete this role? This can't be undone.",
                                {
                                  confirmLabel: "Delete",
                                  danger: true,
                                }
                              );
                              if (!ok) return;

                              try {
                                await deleteRole(item.id);
                                loadRoles();
                                toast.success("Role deleted");
                              } catch {
                                toast.error("Unable to delete role");
                              }
                            }}
                            className="text-rust hover:text-rust"
                          >
                            <FiTrash2 />
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

        {/* Recent Activity */}

        <div className="bg-panel rounded-3xl shadow-xl p-6">
          <h2 className="text-xl font-bold mb-5">Recent Activity</h2>

          <div className="space-y-4">
            {activities.length === 0 ? (
              <p className="text-sub text-sm">No recent activity.</p>
            ) : (
              activities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 bg-bg rounded-xl p-4"
                >
                  <div className="w-3 h-3 rounded-full bg-primary"></div>

                  <div>
                    <p>{activity.message}</p>
                    <p className="text-xs text-sub">
                      {new Date(activity.date).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-panel p-6 rounded-2xl w-96">
            <h2 className="text-xl font-bold mb-5">Add New Role</h2>

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
                onClick={handleAddRole}
                className="bg-primary text-white px-4 py-2 rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showViewModal && selectedRole && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-panel p-6 rounded-xl w-[500px]">
            <h2 className="text-xl font-bold mb-4">{selectedRole.roleName}</h2>

            <p className="mb-3">Total Users: {selectedRole.totalUsers}</p>

            <div className="max-h-60 overflow-y-auto">
              {selectedRole.users && selectedRole.users.length > 0 ? (
                selectedRole.users.map((user) => (
                  <div key={user.id} className="border-b py-2">
                    <div>{user.name}</div>
                    <div className="text-sub text-sm">{user.email}</div>
                  </div>
                ))
              ) : (
                <p className="text-sub text-sm">
                  No employees assigned to this role.
                </p>
              )}
            </div>

            <button
              onClick={() => setShowViewModal(false)}
              className="mt-5 bg-primary text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Pending Role Change Requests Modal */}
      {showPendingModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-panel p-6 rounded-xl w-[640px] max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Pending Role Change Requests</h2>
              <button
                onClick={() => setShowPendingModal(false)}
                className="text-mute hover:text-text"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-3">
              {loadingPending ? (
                <p className="text-sub text-sm">Loading requests...</p>
              ) : pendingRequests.length === 0 ? (
                <p className="text-sub text-sm">No pending requests.</p>
              ) : (
                pendingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="border rounded-xl p-4 flex justify-between items-center gap-4"
                  >
                    <div>
                      <p className="font-semibold">{req.userName}</p>
                      <p className="text-sub text-sm">{req.userEmail}</p>
                      <p className="text-sm mt-1">
                        {req.currentRoleName || "No role"} →{" "}
                        <span className="font-semibold">
                          {req.requestedRoleName}
                        </span>
                      </p>
                      {req.reason && (
                        <p className="text-sub text-xs mt-1">
                          Reason: {req.reason}
                        </p>
                      )}
                      <p className="text-xs text-mute mt-1">
                        Requested{" "}
                        {req.requestedAt
                          ? new Date(req.requestedAt).toLocaleString()
                          : "-"}
                      </p>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <button
                        disabled={actingOnId === req.id}
                        onClick={() => handleApprove(req.id)}
                        className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                        title="Approve"
                      >
                        <FiCheck />
                      </button>
                      <button
                        disabled={actingOnId === req.id}
                        onClick={() => handleReject(req.id)}
                        className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                        title="Reject"
                      >
                        <FiX />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowPendingModal(false)}
              className="mt-5 border px-4 py-2 rounded-lg self-end"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}