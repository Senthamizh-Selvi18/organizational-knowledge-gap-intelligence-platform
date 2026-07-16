import DashboardLayout from "../../components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import {
  getAllExternalCourses,
  createExternalCourse,
  updateExternalCourse,
  deleteExternalCourse,
} from "../../services/externalCourseService";

const DIFFICULTY_OPTIONS = ["Beginner", "Intermediate", "Advanced"];

const EMPTY_FORM = {
  id: null,
  skillName: "",
  courseTitle: "",
  provider: "",
  courseUrl: "",
  description: "",
  difficulty: "Beginner",
  duration: "",
  active: true,
};

export default function ExternalCourseManagement() {

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadCourses = () => {

    setLoading(true);
    setError(null);

    getAllExternalCourses()
      .then((data) => {
        setCourses(data || []);
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to load external courses. Please try again later.");
      })
      .finally(() => {
        setLoading(false);
      });

  };

  useEffect(() => {
    loadCourses();
  }, []);

  // Lock background scroll while any modal is open, so the dialog
  // reads clearly as a modal rather than content sitting mid-page.
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

  const filteredCourses = courses.filter((course) => {

    const term = searchTerm.trim().toLowerCase();

    const matchesSearch =
      term === "" ||
      course.skillName?.toLowerCase().includes(term) ||
      course.courseTitle?.toLowerCase().includes(term) ||
      course.provider?.toLowerCase().includes(term);

    const matchesDifficulty =
      difficultyFilter === "All" || course.difficulty === difficultyFilter;

    return matchesSearch && matchesDifficulty;

  });

  const openAddModal = () => {
    setFormData(EMPTY_FORM);
    setIsEditing(false);
    setFormError(null);
    setShowModal(true);
  };

  const openEditModal = (course) => {
    setFormData({
      id: course.id,
      skillName: course.skillName || "",
      courseTitle: course.courseTitle || "",
      provider: course.provider || "",
      courseUrl: course.courseUrl || "",
      description: course.description || "",
      difficulty: course.difficulty || "Beginner",
      duration: course.duration || "",
      active: course.active ?? true,
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

    if (!formData.skillName.trim()) return "Skill name is required.";
    if (!formData.courseTitle.trim()) return "Course title is required.";
    if (!formData.provider.trim()) return "Provider is required.";
    if (!formData.courseUrl.trim()) return "Course URL is required.";
    if (!formData.difficulty) return "Difficulty is required.";
    if (!formData.duration.trim()) return "Duration is required.";

    try {
      new URL(formData.courseUrl);
    } catch {
      return "Course URL must be a valid URL (e.g. https://...).";
    }

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
      skillName: formData.skillName.trim(),
      courseTitle: formData.courseTitle.trim(),
      provider: formData.provider.trim(),
      courseUrl: formData.courseUrl.trim(),
      description: formData.description.trim(),
      difficulty: formData.difficulty,
      duration: formData.duration.trim(),
      active: formData.active,
    };

    const request = isEditing
      ? updateExternalCourse(formData.id, payload)
      : createExternalCourse(payload);

    request
      .then(() => {
        setShowModal(false);
        setFormData(EMPTY_FORM);
        loadCourses();
      })
      .catch((err) => {
        console.error(err);
        const backendMessage = err.response?.data?.message;
        setFormError(backendMessage || "Unable to save the course. Please check the fields and try again.");
      })
      .finally(() => {
        setSaving(false);
      });

  };

  const confirmDelete = (course) => {
    setDeleteTarget(course);
  };

  const cancelDelete = () => {
    if (deleting) return;
    setDeleteTarget(null);
  };

  const handleDelete = () => {

    if (!deleteTarget) return;

    setDeleting(true);

    deleteExternalCourse(deleteTarget.id)
      .then(() => {
        setDeleteTarget(null);
        loadCourses();
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to delete the course. Please try again.");
        setDeleteTarget(null);
      })
      .finally(() => {
        setDeleting(false);
      });

  };

  return (
    <DashboardLayout>

      <div className="space-y-6">

        <div className="flex items-start justify-between gap-4 flex-wrap">

          <div>
            <h1 className="text-3xl font-bold text-text">
              External Course Management
            </h1>

            <p className="text-sub mt-2">
              Manage the catalog of external learning resources mapped to skills.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="bg-primary text-white px-5 py-3 rounded-xl font-semibold hover:opacity-90 transition"
          >
            + Add Course
          </button>

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
              <p className="text-sub text-sm">Total Courses</p>
              <p className="text-3xl font-bold text-text mt-1">{courses.length}</p>
            </div>
          </div>

          <div className="bg-panel rounded-3xl shadow-xl p-6 flex items-center justify-between">
            <div>
              <p className="text-sub text-sm">Matching Search</p>
              <p className="text-3xl font-bold text-text mt-1">{filteredCourses.length}</p>
            </div>
          </div>

        </div>

        {/* Search + filter */}
        <div className="bg-panel rounded-3xl shadow-xl p-6 flex flex-col md:flex-row gap-4">

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by skill, course title, or provider..."
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="All">All Difficulties</option>
            {DIFFICULTY_OPTIONS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

        </div>

        {/* Table */}
        <div className="bg-panel rounded-3xl shadow-xl p-6 overflow-x-auto">

          {loading ? (

            <p className="text-mute">Loading courses...</p>

          ) : filteredCourses.length === 0 ? (

            <p className="text-mute">No external courses found.</p>

          ) : (

            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 text-sub text-sm">
                  <th className="py-3 pr-4">Skill</th>
                  <th className="py-3 pr-4">Course Title</th>
                  <th className="py-3 pr-4">Provider</th>
                  <th className="py-3 pr-4">Difficulty</th>
                  <th className="py-3 pr-4">Duration</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course) => (
                  <tr key={course.id} className="border-b border-gray-100">

                    <td className="py-4 pr-4 font-semibold text-text">{course.skillName}</td>
                    <td className="py-4 pr-4">{course.courseTitle}</td>
                    <td className="py-4 pr-4">{course.provider}</td>

                    <td className="py-4 pr-4">
                      <span
                        className={
                          "text-xs font-semibold px-2 py-1 rounded-xl whitespace-nowrap " +
                          (course.difficulty === "Beginner"
                            ? "bg-green-50 text-green-700"
                            : course.difficulty === "Intermediate"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-red-50 text-red-600")
                        }
                      >
                        {course.difficulty}
                      </span>
                    </td>

                    <td className="py-4 pr-4">{course.duration}</td>

                    <td className="py-4 pr-4">
                      <span
                        className={
                          "text-xs font-semibold px-2 py-1 rounded-xl whitespace-nowrap " +
                          (course.active
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-500")
                        }
                      >
                        {course.active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">

                        <button
                          onClick={() => openEditModal(course)}
                          className="text-green-600 hover:text-green-700 font-semibold"
                          title="Edit"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => confirmDelete(course)}
                          className="text-red-600 hover:text-red-700 font-semibold"
                          title="Delete"
                        >
                          Delete
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>

          )}

        </div>

      </div>

      {/* Add/Edit Modal */}
      {showModal && (

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
                {isEditing ? "Edit External Course" : "Add External Course"}
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
                <label className="block text-sub text-sm mb-1">Skill Name</label>
                <input
                  type="text"
                  value={formData.skillName}
                  onChange={(e) => handleFormChange("skillName", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. React"
                />
              </div>

              <div>
                <label className="block text-sub text-sm mb-1">Course Title</label>
                <input
                  type="text"
                  value={formData.courseTitle}
                  onChange={(e) => handleFormChange("courseTitle", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. React Complete Guide"
                />
              </div>

              <div>
                <label className="block text-sub text-sm mb-1">Provider</label>
                <input
                  type="text"
                  value={formData.provider}
                  onChange={(e) => handleFormChange("provider", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. Udemy"
                />
              </div>

              <div>
                <label className="block text-sub text-sm mb-1">Course URL</label>
                <input
                  type="text"
                  value={formData.courseUrl}
                  onChange={(e) => handleFormChange("courseUrl", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sub text-sm mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleFormChange("description", e.target.value)}
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Short description of the course"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">

                <div>
                  <label className="block text-sub text-sm mb-1">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => handleFormChange("difficulty", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {DIFFICULTY_OPTIONS.map((d) => (
                      <option key={d} value={d}>{d}</option>
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
                    placeholder="e.g. 32 Hours"
                  />
                </div>

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
                  Active (visible in recommendations)
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
                  {saving ? "Saving..." : isEditing ? "Update Course" : "Create Course"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (

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
                Delete Course
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
              Are you sure you want to delete <span className="font-semibold text-text">{deleteTarget.courseTitle}</span>? This action cannot be undone.
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