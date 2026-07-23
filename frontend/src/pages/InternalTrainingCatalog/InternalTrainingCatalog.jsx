import DashboardLayout from "../../components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import {
  getAllInternalTrainings,
  createInternalTraining,
  updateInternalTraining,
  deleteInternalTraining,
} from "../../services/internalTrainingService";
import {
  enroll,
  getEnrolledTrainingIds,
  getAllEnrollments,
  completeTraining,
} from "../../services/learningService";
import { toast } from "../../components/ui/Toast.jsx";
const MODE_OPTIONS = ["Online", "Offline", "Hybrid"];

const EMPTY_FORM = {
  id: null,
  title: "",
  skillName: "",
  category: "",
  trainer: "",
  mode: "Online",
  duration: "",
  description: "",
  mandatory: false,
  active: true,
};

export default function InternalTrainingCatalog() {

  const role = localStorage.getItem("role")?.toLowerCase();
  const isAdmin = role === "admin";
  const employeeId = Number(localStorage.getItem("employeeId"));
  const [enrolledTrainingIds, setEnrolledTrainingIds] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [modeFilter, setModeFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadTrainings = () => {

    setLoading(true);
    setError(null);

    getAllInternalTrainings()
      .then((data) => {
        setTrainings(data || []);
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to load internal trainings. Please try again later.");
      })
      .finally(() => {
        setLoading(false);
      });

  };

  const loadEnrollments = async () => {

  if (!employeeId) return;

  try {

    const response = await getEnrolledTrainingIds(employeeId);

    setEnrolledTrainingIds(response.data);

  } catch (err) {

    console.error(err);

  }

};
const loadAllEnrollments = async () => {

  try {

    const response = await getAllEnrollments();

    setEnrollments(response.data);

  } catch (err) {

    console.error(err);

  }

};

useEffect(() => {

  loadTrainings();

  if (isAdmin) {

    loadAllEnrollments();

  } else {

    loadEnrollments();

  }

}, []);
  useEffect(() => {

    if (showModal || deleteTarget) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };

  }, [showModal, deleteTarget]);

  const filteredTrainings = trainings.filter((training) => {

    const term = searchTerm.trim().toLowerCase();

    const matchesSearch =
      term === "" ||
      training.title?.toLowerCase().includes(term) ||
      training.skillName?.toLowerCase().includes(term) ||
      training.category?.toLowerCase().includes(term) ||
      training.trainer?.toLowerCase().includes(term);

    const matchesMode =
      modeFilter === "All" || training.mode === modeFilter;

    return matchesSearch && matchesMode;

  });

  const openAddModal = () => {
    setFormData(EMPTY_FORM);
    setIsEditing(false);
    setFormError(null);
    setShowModal(true);
  };

  const openEditModal = (training) => {
    setFormData({
      id: training.id,
      title: training.title || "",
      skillName: training.skillName || "",
      category: training.category || "",
      trainer: training.trainer || "",
      mode: training.mode || "Online",
      duration: training.duration || "",
      description: training.description || "",
      mandatory: training.mandatory ?? false,
      active: training.active ?? true,
    });
    setIsEditing(true);
    setFormError(null);
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;
    setShowModal(false);
    setFormData(EMPTY_FORM);
    setFormError(null);
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {

    if (!formData.title.trim()) return "Title is required.";
    if (!formData.skillName.trim()) return "Skill name is required.";
    if (!formData.category.trim()) return "Category is required.";
    if (!formData.trainer.trim()) return "Trainer is required.";
    if (!formData.mode) return "Mode is required.";
    if (!formData.duration.trim()) return "Duration is required.";

    return null;

  };

  const handleSubmit = (e) => {

    e.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    setSaving(true);
    setFormError(null);

    const payload = {
      title: formData.title.trim(),
      skillName: formData.skillName.trim(),
      category: formData.category.trim(),
      trainer: formData.trainer.trim(),
      mode: formData.mode,
      duration: formData.duration.trim(),
      description: formData.description.trim(),
      mandatory: formData.mandatory,
      active: formData.active,
    };

    const request = isEditing
      ? updateInternalTraining(formData.id, payload)
      : createInternalTraining(payload);

    request
      .then(() => {
        setShowModal(false);
        setFormData(EMPTY_FORM);
        loadTrainings();
      })
      .catch((err) => {
        console.error(err);
        const backendMessage = err.response?.data?.message;
        setFormError(backendMessage || "Unable to save the training. Please check the fields and try again.");
      })
      .finally(() => {
        setSaving(false);
      });

  };

  const confirmDelete = (training) => {
    setDeleteTarget(training);
  };

  const cancelDelete = () => {
    if (deleting) return;
    setDeleteTarget(null);
  };

  const handleDelete = () => {

    if (!deleteTarget) return;

    setDeleting(true);

    deleteInternalTraining(deleteTarget.id)
      .then(() => {
        setDeleteTarget(null);
        loadTrainings();
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to delete the training. Please try again.");
        setDeleteTarget(null);
      })
      .finally(() => {
        setDeleting(false);
      });

  };

  const handleEnroll = async (trainingId) => {

  if (!employeeId) {
    toast.error("Employee not found.");
    return;
  }

  try {

    await enroll(employeeId, trainingId);

    toast.success("Training enrolled successfully.");

    // Update button immediately
    setEnrolledTrainingIds(prev => [...prev, trainingId]);

  } catch (err) {

    console.error(err);

    toast.error("Unable to enroll.");

  }

};
const handleComplete = async (enrollmentId) => {

  try {

    await completeTraining(enrollmentId);

    toast.success("Training marked as completed.");

    loadAllEnrollments();   // Refresh Admin table
    loadTrainings();        // Refresh training list if needed

  } catch (err) {

    console.error(err);

    toast.error("Unable to update training.");

  }

};
  return (
    <DashboardLayout>

      <div className="space-y-6">

        <div className="flex items-start justify-between gap-4 flex-wrap">

          <div>
            <h1 className="text-3xl font-bold text-text">
              Internal Training Catalog
            </h1>

            <p className="text-sub mt-2">
              {isAdmin
                ? "Manage the catalog of internally run training programs."
                : "Browse internally run training programs mapped to skills."}
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={openAddModal}
              className="bg-primary text-white px-5 py-3 rounded-xl font-semibold hover:opacity-90 transition"
            >
              + Add Training
            </button>
          )}

        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

          <div className="bg-panel rounded-3xl shadow-xl p-6 flex items-center justify-between">
            <div>
              <p className="text-sub text-sm">Total Trainings</p>
              <p className="text-3xl font-bold text-text mt-1">{trainings.length}</p>
            </div>
          </div>

          <div className="bg-panel rounded-3xl shadow-xl p-6 flex items-center justify-between">
            <div>
              <p className="text-sub text-sm">Matching Search</p>
              <p className="text-3xl font-bold text-text mt-1">{filteredTrainings.length}</p>
            </div>
          </div>

        </div>

        {/* Search + filter */}
        <div className="bg-panel rounded-3xl shadow-xl p-6 flex flex-col md:flex-row gap-4">

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, skill, category, or trainer..."
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="All">All Modes</option>
            {MODE_OPTIONS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

        </div>

        {/* Table */}
        <div className="bg-panel rounded-3xl shadow-xl p-6 overflow-x-auto">

          {loading ? (

            <p className="text-mute">Loading trainings...</p>

          ) : filteredTrainings.length === 0 ? (

            <p className="text-mute">No internal trainings found.</p>

          ) : (

            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 text-sub text-sm">
                  <th className="py-3 pr-4">Title</th>
                  <th className="py-3 pr-4">Skill</th>
                  <th className="py-3 pr-4">Category</th>
                  <th className="py-3 pr-4">Trainer</th>
                  <th className="py-3 pr-4">Mode</th>
                  <th className="py-3 pr-4">Duration</th>
                  <th className="py-3 pr-4">Mandatory</th>
                  <th className="py-3 pr-4">Status</th>
                  {isAdmin && <th className="py-3 pr-4">Actions</th>}
                  {!isAdmin && <th className="py-3 pr-4">Enroll</th>}
                </tr>
              </thead>
              <tbody>
                {filteredTrainings.map((training) => (
                  <tr key={training.id} className="border-b border-gray-100">

                    <td className="py-4 pr-4 font-semibold text-text">{training.title}</td>
                    <td className="py-4 pr-4">{training.skillName}</td>
                    <td className="py-4 pr-4">{training.category}</td>
                    <td className="py-4 pr-4">{training.trainer}</td>

                    <td className="py-4 pr-4">
                      <span
                        className={
                          "text-xs font-semibold px-2 py-1 rounded-xl whitespace-nowrap " +
                          (training.mode === "Online"
                            ? "bg-blue-50 text-blue-700"
                            : training.mode === "Offline"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-purple-50 text-purple-700")
                        }
                      >
                        {training.mode}
                      </span>
                    </td>

                    <td className="py-4 pr-4">{training.duration}</td>

                    <td className="py-4 pr-4">
                      <span
                        className={
                          "text-xs font-semibold px-2 py-1 rounded-xl whitespace-nowrap " +
                          (training.mandatory
                            ? "bg-red-50 text-red-600"
                            : "bg-gray-100 text-gray-500")
                        }
                      >
                        {training.mandatory ? "Mandatory" : "Optional"}
                      </span>
                    </td>

                    <td className="py-4 pr-4">
                      <span
                        className={
                          "text-xs font-semibold px-2 py-1 rounded-xl whitespace-nowrap " +
                          (training.active
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-500")
                        }
                      >
                        {training.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">

                          <button
                            onClick={() => openEditModal(training)}
                            className="text-green-600 hover:text-green-700 font-semibold"
                            title="Edit"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => confirmDelete(training)}
                            className="text-red-600 hover:text-red-700 font-semibold"
                            title="Delete"
                          >
                            Delete
                          </button>

                        </div>
                      </td>
                    )}
                    {!isAdmin && (
  <td className="py-4 pr-4">

    {enrolledTrainingIds.includes(training.id) ? (

      <button
        disabled
        className="inline-flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 px-5 py-2.5 rounded-xl font-semibold shadow-sm cursor-not-allowed"
      >
        <span className="text-lg">✅</span>
        Enrolled
      </button>

    ) : (

      <button
        onClick={() => handleEnroll(training.id)}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
      >
        📚 Enroll Now
      </button>

    )}

  </td>
)}

                  </tr>
                ))}
              </tbody>
            </table>

          )}

        </div>

      </div>

      {isAdmin && (
  <div className="bg-panel rounded-3xl shadow-xl p-6 mt-8 overflow-x-auto">

   <div className="mb-6">

  <h2 className="text-3xl font-bold text-text">
    Learning Progress Management
  </h2>

  <p className="text-sub mt-2">
    Monitor employee enrollments and manage training completion.
  </p>

</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

  <div className="bg-white rounded-2xl shadow-md p-5">

    <p className="text-sub text-sm">
      Total Enrollments
    </p>

    <h2 className="text-3xl font-bold mt-2">
      {enrollments.length}
    </h2>

  </div>

  <div className="bg-white rounded-2xl shadow-md p-5">

    <p className="text-sub text-sm">
      Completed
    </p>

    <h2 className="text-3xl font-bold text-green-600 mt-2">

      {
        enrollments.filter(
          e => e.status === "COMPLETED"
        ).length
      }

    </h2>

  </div>

  <div className="bg-white rounded-2xl shadow-md p-5">

    <p className="text-sub text-sm">
      Pending
    </p>

    <h2 className="text-3xl font-bold text-orange-500 mt-2">

      {
        enrollments.filter(
          e => e.status !== "COMPLETED"
        ).length
      }

    </h2>

  </div>

</div>

    {enrollments.length === 0 ? (

      <p>No employee enrollments found.</p>

    ) : (

      <table className="min-w-full text-left border-separate border-spacing-y-2">

     <thead className="bg-gray-50">

          <tr className="border-b">

            <th className="py-3">Employee</th>

            <th className="py-3">Training</th>

            <th className="py-3">Status</th>

            <th className="py-3">Progress</th>

            <th className="py-3">Action</th>

          </tr>

        </thead>

        <tbody>

          {enrollments.map((enrollment) => (

            <tr
            key={enrollment.id}
            className="border-b border-gray-100 hover:bg-gray-50 transition"
          >

              <td className="py-3">
                {enrollment.employeeName}
              </td>

              <td className="py-3">
                {enrollment.trainingTitle}
              </td>

              <td className="py-4">

  {enrollment.status === "COMPLETED" ? (

    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
      ✓ Completed
    </span>

  ) : enrollment.status === "IN_PROGRESS" ? (

    <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">
      ⏳ In Progress
    </span>

  ) : (

    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
      📘 Enrolled
    </span>

  )}

</td>

             <td className="py-4">

  <div className="w-36">

    <div className="w-full bg-gray-200 rounded-full h-2">

      <div
        className="bg-indigo-600 h-2 rounded-full"
        style={{
          width: `${enrollment.progress}%`
        }}
      />

    </div>

    <p className="text-xs text-gray-500 mt-1">
      {enrollment.progress}%
    </p>

  </div>

</td>

              <td className="py-3">

                {enrollment.status === "ENROLLED" ? (

                  <button
                    onClick={() =>
                      handleComplete(enrollment.id)
                    }
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition"
                  >
                    Mark as Completed
                  </button>

                ) : (

                  <span className="bg-green-100 text-green-700 px-4 py-2 rounded-xl text-sm font-semibold">
                  ✓ Completed
                </span>

                )}

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    )}

  </div>
)}

      {/* Add/Edit Modal */}
      {isAdmin && showModal && (

        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >

          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto relative"
          >

            <div className="flex items-center justify-between mb-5">

              <h2 className="text-xl font-bold text-text">
                {isEditing ? "Edit Internal Training" : "Add Internal Training"}
              </h2>

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
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              <div>
                <label className="block text-sub text-sm mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleFormChange("title", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. Effective Code Reviews"
                />
              </div>

              <div>
                <label className="block text-sub text-sm mb-1">Skill Name</label>
                <input
                  type="text"
                  value={formData.skillName}
                  onChange={(e) => handleFormChange("skillName", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. Java"
                />
              </div>

              <div>
                <label className="block text-sub text-sm mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => handleFormChange("category", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. Technical, Soft Skills, Compliance"
                />
              </div>

              <div>
                <label className="block text-sub text-sm mb-1">Trainer</label>
                <input
                  type="text"
                  value={formData.trainer}
                  onChange={(e) => handleFormChange("trainer", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. Internal L&D Team"
                />
              </div>

              <div>
                <label className="block text-sub text-sm mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleFormChange("description", e.target.value)}
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Short description of the training"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">

                <div>
                  <label className="block text-sub text-sm mb-1">Mode</label>
                  <select
                    value={formData.mode}
                    onChange={(e) => handleFormChange("mode", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {MODE_OPTIONS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sub text-sm mb-1">Duration</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => handleFormChange("duration", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g. 4 Hours"
                  />
                </div>

              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="mandatory"
                  checked={formData.mandatory}
                  onChange={(e) => handleFormChange("mandatory", e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="mandatory" className="text-sub text-sm">
                  Mandatory for assigned employees
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => handleFormChange("active", e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="active" className="text-sub text-sm">
                  Active (visible in the catalog)
                </label>
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
                  {saving ? "Saving..." : isEditing ? "Update Training" : "Create Training"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* Delete confirmation modal */}
      {isAdmin && deleteTarget && (

        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={cancelDelete}
        >

          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 w-full max-w-md relative"
          >

            <div className="flex items-center justify-between mb-3">

              <h2 className="text-xl font-bold text-text">
                Delete Training
              </h2>

              <button
                type="button"
                onClick={cancelDelete}
                disabled={deleting}
                className="text-sub hover:text-text rounded-lg p-1.5 hover:bg-gray-100 transition"
                aria-label="Close"
              >
                <FiX size={20} />
              </button>

            </div>

            <p className="text-sub mb-6">
              Are you sure you want to delete <span className="font-semibold text-text">{deleteTarget.title}</span>? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">

              <button
                onClick={cancelDelete}
                disabled={deleting}
                className="px-5 py-2 rounded-xl font-semibold text-sub border border-gray-200 hover:bg-gray-50 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 text-white px-5 py-2 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-60"
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
