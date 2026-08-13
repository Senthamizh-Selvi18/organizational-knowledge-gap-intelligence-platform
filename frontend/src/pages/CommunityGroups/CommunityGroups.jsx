import DashboardLayout from "../../components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiX, FiUsers } from "react-icons/fi";
import {
  getAllGroups,
  getMyGroups,
  createGroup,
  joinGroup,
  leaveGroup,
} from "../../services/communityGroupService";

const EMPTY_FORM = { name: "", description: "", category: "" };

export default function CommunityGroups() {
  const navigate = useNavigate();

  const [tab, setTab] = useState("all");
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const [busyId, setBusyId] = useState(null);

  const loadGroups = () => {
    setLoading(true);
    setError(null);

    const request = tab === "mine" ? getMyGroups() : getAllGroups();

    request
      .then((data) => setGroups(data || []))
      .catch((err) => {
        console.error(err);
        setError("Unable to load community groups. Please try again later.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const openModal = () => {
    setFormData(EMPTY_FORM);
    setFormError(null);
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;
    setShowModal(false);
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.description.trim() || !formData.category.trim()) {
      setFormError("Name, description, and category are all required.");
      return;
    }

    setSaving(true);
    setFormError(null);

    createGroup({
      name: formData.name.trim(),
      description: formData.description.trim(),
      category: formData.category.trim(),
    })
      .then(() => {
        setShowModal(false);
        loadGroups();
      })
      .catch((err) => {
        console.error(err);
        setFormError(err.response?.data?.message || "Unable to create the group.");
      })
      .finally(() => setSaving(false));
  };

  const handleJoin = (group) => {
    setBusyId(group.id);
    joinGroup(group.id)
      .then(() => loadGroups())
      .catch((err) => {
        console.error(err);
        setError(err.response?.data?.message || "Unable to join the group.");
      })
      .finally(() => setBusyId(null));
  };

  const handleLeave = (group) => {
    setBusyId(group.id);
    leaveGroup(group.id)
      .then(() => loadGroups())
      .catch((err) => {
        console.error(err);
        setError(err.response?.data?.message || "Unable to leave the group.");
      })
      .finally(() => setBusyId(null));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-text">Community of Practice Groups</h1>
            <p className="text-sub mt-2">
              Join groups around shared interests, share knowledge, and organize meetups.
            </p>
          </div>

          <button
            onClick={openModal}
            className="bg-primary text-white px-5 py-3 rounded-xl font-semibold hover:opacity-90 transition"
          >
            + Create Group
          </button>
        </div>

        {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl">{error}</div>}

        <div className="flex gap-2">
          <button
            onClick={() => setTab("all")}
            className={`px-5 py-2 rounded-xl font-semibold transition ${
              tab === "all" ? "bg-primary text-white" : "bg-panel text-sub hover:text-text"
            }`}
          >
            All Groups
          </button>
          <button
            onClick={() => setTab("mine")}
            className={`px-5 py-2 rounded-xl font-semibold transition ${
              tab === "mine" ? "bg-primary text-white" : "bg-panel text-sub hover:text-text"
            }`}
          >
            My Groups
          </button>
        </div>

        {loading ? (
          <p className="text-mute">Loading groups...</p>
        ) : groups.length === 0 ? (
          <div className="bg-panel rounded-3xl shadow-xl p-10 text-center text-mute">
            {tab === "mine"
              ? "You haven't joined any groups yet."
              : "No groups yet. Be the first to start one!"}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <div
                key={group.id}
                className="bg-panel rounded-3xl shadow-xl p-6 flex flex-col justify-between cursor-pointer hover:shadow-2xl transition"
                onClick={() => navigate(`/dashboard/community-groups/${group.id}`)}
              >
                <div>
                  <span className="text-xs font-semibold px-2 py-1 rounded-xl bg-primary-tint text-primary whitespace-nowrap">
                    {group.category}
                  </span>
                  <h3 className="text-lg font-bold text-text mt-3">{group.name}</h3>
                  <p className="text-sub text-sm mt-2 line-clamp-3">{group.description}</p>

                  <div className="flex items-center gap-2 mt-4 text-mute text-xs">
                    <FiUsers />
                    <span>{group.memberCount} members</span>
                    <span>· by {group.createdByName}</span>
                  </div>
                </div>

                <div className="mt-5" onClick={(e) => e.stopPropagation()}>
                  {group.isMember ? (
                    <button
                      onClick={() => handleLeave(group)}
                      disabled={busyId === group.id}
                      className="w-full border border-gray-200 text-sub px-4 py-2 rounded-xl font-semibold hover:bg-gray-50 transition disabled:opacity-60"
                    >
                      {busyId === group.id ? "Leaving..." : "Leave Group"}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleJoin(group)}
                      disabled={busyId === group.id}
                      className="w-full bg-primary text-white px-4 py-2 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-60"
                    >
                      {busyId === group.id ? "Joining..." : "Join Group"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 w-full max-w-lg relative"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-text">Create a Group</h2>
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="text-sub hover:text-text rounded-lg p-1.5 hover:bg-gray-100 transition"
                aria-label="Close"
              >
                <FiX size={20} />
              </button>
            </div>

            {formError && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-4">{formError}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sub text-sm mb-1">Group Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleFormChange("name", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. React Practitioners"
                />
              </div>

              <div>
                <label className="block text-sub text-sm mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => handleFormChange("category", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. Engineering, Design, Data"
                />
              </div>

              <div>
                <label className="block text-sub text-sm mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleFormChange("description", e.target.value)}
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="What is this group about?"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="px-5 py-2 rounded-xl font-semibold text-sub border border-gray-200 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-primary text-white px-5 py-2 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-60"
                >
                  {saving ? "Creating..." : "Create Group"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}