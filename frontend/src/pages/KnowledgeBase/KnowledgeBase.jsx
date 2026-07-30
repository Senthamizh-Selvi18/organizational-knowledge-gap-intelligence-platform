import DashboardLayout from "../../components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import { FiX, FiEye } from "react-icons/fi";
import {
  getAllArticles,
  getMyArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
} from "../../services/knowledgeBaseService";

const EMPTY_FORM = { title: "", content: "", category: "", tags: "" };

export default function KnowledgeBase() {
  const [tab, setTab] = useState("all");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [selected, setSelected] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadArticles = () => {
    setLoading(true);
    setError(null);

    const request = tab === "mine" ? getMyArticles() : getAllArticles("", searchTerm);

    request
      .then((data) => setArticles(data || []))
      .catch((err) => {
        console.error(err);
        setError("Unable to load knowledge base articles. Please try again later.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  useEffect(() => {
    if (tab === "mine") return;
    const timeout = setTimeout(loadArticles, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const openArticle = (article) => {
    setLoadingDetail(true);
    getArticle(article.id)
      .then((data) => setSelected(data))
      .catch((err) => console.error(err))
      .finally(() => setLoadingDetail(false));
  };

  const closeArticle = () => setSelected(null);

  const openAddModal = () => {
    setFormData(EMPTY_FORM);
    setIsEditing(false);
    setFormError(null);
    setShowModal(true);
  };

  const openEditModal = (article) => {
    setFormData({
      id: article.id,
      title: article.title || "",
      content: article.content || "",
      category: article.category || "",
      tags: article.tags || "",
    });
    setIsEditing(true);
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

    if (!formData.title.trim() || !formData.content.trim() || !formData.category.trim()) {
      setFormError("Title, content, and category are required.");
      return;
    }

    setSaving(true);
    setFormError(null);

    const payload = {
      title: formData.title.trim(),
      content: formData.content.trim(),
      category: formData.category.trim(),
      tags: formData.tags.trim(),
    };

    const request = isEditing ? updateArticle(formData.id, payload) : createArticle(payload);

    request
      .then(() => {
        setShowModal(false);
        loadArticles();
      })
      .catch((err) => {
        console.error(err);
        setFormError(err.response?.data?.message || "Unable to save the article.");
      })
      .finally(() => setSaving(false));
  };

  const confirmDelete = (article) => setDeleteTarget(article);
  const cancelDelete = () => {
    if (deleting) return;
    setDeleteTarget(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setDeleting(true);

    deleteArticle(deleteTarget.id)
      .then(() => {
        setDeleteTarget(null);
        setSelected(null);
        loadArticles();
      })
      .catch((err) => {
        console.error(err);
        setError(err.response?.data?.message || "Unable to delete the article.");
        setDeleteTarget(null);
      })
      .finally(() => setDeleting(false));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-text">Knowledge Base</h1>
            <p className="text-sub mt-2">
              Browse articles shared by colleagues, or write your own to pass on what you know.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="bg-primary text-white px-5 py-3 rounded-xl font-semibold hover:opacity-90 transition"
          >
            + New Article
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
            All Articles
          </button>
          <button
            onClick={() => setTab("mine")}
            className={`px-5 py-2 rounded-xl font-semibold transition ${
              tab === "mine" ? "bg-primary text-white" : "bg-panel text-sub hover:text-text"
            }`}
          >
            My Articles
          </button>
        </div>

        {tab === "all" && (
          <div className="bg-panel rounded-3xl shadow-xl p-6">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title or tag..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        )}

        {loading ? (
          <p className="text-mute">Loading articles...</p>
        ) : articles.length === 0 ? (
          <div className="bg-panel rounded-3xl shadow-xl p-10 text-center text-mute">
            No articles found. Be the first to share your knowledge!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <div
                key={article.id}
                onClick={() => openArticle(article)}
                className="bg-panel rounded-3xl shadow-xl p-6 flex flex-col justify-between cursor-pointer hover:shadow-2xl transition"
              >
                <div>
                  <span className="text-xs font-semibold px-2 py-1 rounded-xl bg-primary-tint text-primary whitespace-nowrap">
                    {article.category}
                  </span>
                  <h3 className="text-lg font-bold text-text mt-3">{article.title}</h3>
                  <p className="text-sub text-sm mt-2 line-clamp-3">{article.content}</p>
                </div>

                <div className="flex items-center justify-between mt-5 text-mute text-xs">
                  <span>By {article.authorName}</span>
                  <span className="flex items-center gap-1">
                    <FiEye /> {article.viewCount}
                  </span>
                </div>

                {tab === "mine" && (
                  <div className="flex gap-3 mt-3" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => openEditModal(article)}
                      className="text-green-600 hover:text-green-700 font-semibold text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => confirmDelete(article)}
                      className="text-red-600 hover:text-red-700 font-semibold text-sm"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Article detail modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={closeArticle}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs font-semibold px-2 py-1 rounded-xl bg-primary-tint text-primary whitespace-nowrap">
                  {selected.category}
                </span>
                <h2 className="text-2xl font-bold text-text mt-2">{selected.title}</h2>
                <p className="text-mute text-xs mt-1">
                  By {selected.authorName} · {new Date(selected.createdAt).toLocaleDateString()} ·{" "}
                  {selected.viewCount} views
                </p>
              </div>
              <button
                type="button"
                onClick={closeArticle}
                className="text-sub hover:text-text rounded-lg p-1.5 hover:bg-gray-100 transition"
                aria-label="Close"
              >
                <FiX size={20} />
              </button>
            </div>

            {loadingDetail ? (
              <p className="text-mute">Loading...</p>
            ) : (
              <p className="text-sub whitespace-pre-wrap">{selected.content}</p>
            )}

            {selected.tags && (
              <div className="flex flex-wrap gap-2 mt-5">
                {selected.tags.split(",").map((t) => t.trim()).filter(Boolean).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-semibold px-2 py-1 rounded-xl bg-gray-100 text-gray-600"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

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
                {isEditing ? "Edit Article" : "New Article"}
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
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-4">{formError}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sub text-sm mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleFormChange("title", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. Debugging memory leaks in Node.js"
                />
              </div>

              <div>
                <label className="block text-sub text-sm mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => handleFormChange("category", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. Engineering, Process, Onboarding"
                />
              </div>

              <div>
                <label className="block text-sub text-sm mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => handleFormChange("tags", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. nodejs, debugging, performance"
                />
              </div>

              <div>
                <label className="block text-sub text-sm mb-1">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => handleFormChange("content", e.target.value)}
                  rows={8}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Share what you know..."
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
                  {saving ? "Saving..." : isEditing ? "Update Article" : "Publish Article"}
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
              <h2 className="text-xl font-bold text-text">Delete Article</h2>
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
              Are you sure you want to delete{" "}
              <span className="font-semibold text-text">{deleteTarget.title}</span>? This action
              cannot be undone.
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