import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  getAllSkills,
  addSkill,
  updateSkill,
  deleteSkill,
} from "../../services/skillService";
import {
  FiCpu,
  FiCheckCircle,
  FiSearch,
  FiPlus,
  FiEdit,
  FiTrash2,
} from "react-icons/fi";

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="bg-panel rounded-3xl shadow-xl p-6">
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

export default function SkillManagement() {
  const [search, setSearch] = useState("");
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [skillNameInput, setSkillNameInput] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadSkills = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const response = await getAllSkills();
      setSkills(response.data);
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || "Failed to load skills."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSkills();
  }, []);

  const openAddModal = () => {
    setEditingSkill(null);
    setSkillNameInput("");
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (skill) => {
    setEditingSkill(skill);
    setSkillNameInput(skill.skillName);
    setFormError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;
    setShowModal(false);
  };

  const handleSave = async () => {
    const trimmed = skillNameInput.trim();

    if (!trimmed) {
      setFormError("Skill name is required.");
      return;
    }
    if (trimmed.length > 100) {
      setFormError("Skill name must be at most 100 characters.");
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      if (editingSkill) {
        const response = await updateSkill(editingSkill.id, trimmed);
        setSkills((prev) =>
          prev.map((s) => (s.id === editingSkill.id ? response.data : s))
        );
      } else {
        const response = await addSkill(trimmed);
        setSkills((prev) => [...prev, response.data]);
      }
      setShowModal(false);
    } catch (err) {
      setFormError(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await deleteSkill(deleteTarget.id);
      setSkills((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || "Failed to delete skill."
      );
    } finally {
      setDeleting(false);
    }
  };

  const filteredSkills = skills.filter((item) =>
    item.skillName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Skill Management</h1>
            <p className="text-sub">
              Manage the catalog of skills used for competency tracking across the organization.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="bg-primary text-text px-5 py-3 rounded-xl flex items-center gap-2 hover:bg-primary-dark"
          >
            <FiPlus />
            Add Skill
          </button>
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-2 gap-5">
          <StatCard
            title="Total Skills"
            value={skills.length}
            icon={FiCpu}
            color="bg-primary"
          />
          <StatCard
            title="Matching Search"
            value={filteredSkills.length}
            icon={FiCheckCircle}
            color="bg-green-600"
          />
        </div>

        {/* Search */}
        <div className="bg-panel rounded-3xl shadow-xl p-6">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-4 text-mute" />
            <input
              type="text"
              placeholder="Search Skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border outline-none"
            />
          </div>
        </div>

        {/* Error banner */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={loadSkills} className="font-semibold underline">
              Retry
            </button>
          </div>
        )}

        {/* Skills Table */}
        <div className="bg-panel rounded-3xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-bg">
                <tr>
                  <th className="p-4 text-left">Skill ID</th>
                  <th className="p-4 text-left">Skill Name</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-mute">
                      Loading skills...
                    </td>
                  </tr>
                ) : filteredSkills.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-mute">
                      No skills found.
                    </td>
                  </tr>
                ) : (
                  filteredSkills.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-bg">
                      <td className="p-4">{item.id}</td>
                      <td className="p-4 font-semibold">{item.skillName}</td>
                      <td className="p-4">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => openEditModal(item)}
                            className="text-green-600 hover:text-green-800"
                            aria-label={`Edit ${item.skillName}`}
                          >
                            <FiEdit />
                          </button>

                          <button
                            onClick={() => setDeleteTarget(item)}
                            className="text-red-600 hover:text-red-800"
                            aria-label={`Delete ${item.skillName}`}
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
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-panel p-6 rounded-2xl w-96">
            <h2 className="text-xl font-bold mb-5">
              {editingSkill ? "Edit Skill" : "Add New Skill"}
            </h2>

            <input
              type="text"
              placeholder="Enter Skill Name"
              value={skillNameInput}
              onChange={(e) => {
                setSkillNameInput(e.target.value);
                if (formError) setFormError("");
              }}
              className={`border w-full p-3 rounded-lg outline-none ${
                formError ? "border-red-400" : ""
              }`}
              autoFocus
            />
            {formError && (
              <p className="text-red-600 text-sm mt-2">{formError}</p>
            )}

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={closeModal}
                disabled={saving}
                className="border px-4 py-2 rounded-lg disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-primary text-text px-4 py-2 rounded-lg hover:bg-primary-dark disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-panel p-6 rounded-2xl w-96">
            <h2 className="text-xl font-bold mb-3">Delete this skill?</h2>
            <p className="text-sub">
              "{deleteTarget.skillName}" will be permanently removed. This can't be undone.
            </p>

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="border px-4 py-2 rounded-lg disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}