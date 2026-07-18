import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  FiAward,
  FiUpload,
  FiTrash2,
  FiFileText,
  FiExternalLink,
  FiX,
  FiCalendar,
  FiBriefcase,
} from "react-icons/fi";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  getCertifications,
  uploadCertification,
  deleteCertification,
} from "../../services/certificationService";
import { toast } from "../../components/ui/Toast.jsx";

const ALLOWED_TYPES = ["application/pdf", "image/png", "image/jpeg"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const initialForm = {
  file: null,
  certificationName: "",
  issuingOrganization: "",
  issueDate: "",
  expiryDate: "",
};

export default function Certifications() {
  const userId = localStorage.getItem("userId");

  const [employeeId, setEmployeeId] = useState(null);
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState(initialForm);
  const [uploading, setUploading] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);
  const [deleting, setDeleting] = useState(false);

  /* ===========================
        RESOLVE EMPLOYEE ID
  ============================ */
  useEffect(() => {
    const fetchEmployeeId = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:8080/api/profile/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEmployeeId(response.data?.employeeId ?? null);
      } catch (err) {
        console.error(err);
        setError("Unable to resolve employee profile.");
        setLoading(false);
      }
    };

    if (userId) fetchEmployeeId();
  }, [userId]);

  /* ===========================
        LOAD CERTIFICATIONS
  ============================ */
  const loadCertifications = useCallback(async () => {
    if (!employeeId) return;
    try {
      setLoading(true);
      setError("");
      const response = await getCertifications(employeeId);
      setCertifications(response.data || []);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Unable to load certifications."
      );
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    loadCertifications();
  }, [loadCertifications]);

  /* ===========================
        UPLOAD
  ============================ */
  const openUploadModal = () => {
    setUploadForm(initialForm);
    setShowUploadModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;

    if (file) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.warning("Only PDF, JPG, and PNG files are allowed.");
        e.target.value = "";
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.warning("File size must not exceed 5 MB.");
        e.target.value = "";
        return;
      }
    }

    setUploadForm({ ...uploadForm, file });
  };

  const handleUpload = async () => {
    if (!uploadForm.file) {
      toast.warning("Please select a certification file to upload.");
      return;
    }
    if (!uploadForm.certificationName.trim()) {
      toast.warning("Certification name is required.");
      return;
    }
    if (!uploadForm.issuingOrganization.trim()) {
      toast.warning("Issuing organization is required.");
      return;
    }
    if (!uploadForm.issueDate) {
      toast.warning("Issue date is required.");
      return;
    }
    if (
      uploadForm.expiryDate &&
      uploadForm.expiryDate < uploadForm.issueDate
    ) {
      toast.warning("Expiry date cannot be before the issue date.");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", uploadForm.file);
      formData.append("certificationName", uploadForm.certificationName.trim());
      formData.append(
        "issuingOrganization",
        uploadForm.issuingOrganization.trim()
      );
      formData.append("issueDate", uploadForm.issueDate);
      if (uploadForm.expiryDate) {
        formData.append("expiryDate", uploadForm.expiryDate);
      }

      await uploadCertification(employeeId, formData);

      toast.success("Certification uploaded successfully!");
      setShowUploadModal(false);
      setUploadForm(initialForm);
      await loadCertifications();
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Failed to upload certification."
      );
    } finally {
      setUploading(false);
    }
  };

  /* ===========================
        DELETE
  ============================ */
  const handleDeleteClick = (cert) => {
    setSelectedCert(cert);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setDeleting(true);
      await deleteCertification(employeeId, selectedCert.id);
      toast.success("Certification deleted successfully.");
      setShowDeleteModal(false);
      setSelectedCert(null);
      await loadCertifications();
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Failed to delete certification."
      );
    } finally {
      setDeleting(false);
    }
  };

  /* ===========================
        EXPIRY STATUS BADGE
  ============================ */
  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) {
      return { label: "No Expiry", className: "bg-primary-tint text-primary-dark" };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
      return { label: "Expired", className: "bg-red-100 text-red-700" };
    }
    if (daysLeft <= 30) {
      return { label: `Expiring in ${daysLeft}d`, className: "bg-amber-100 text-amber-700" };
    }
    return { label: "Valid", className: "bg-green-100 text-green-700" };
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 rounded-3xl border border-white bg-panel/70 p-8 shadow-xl backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-primary-tint p-4 text-primary">
              <FiAward size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text">Certifications</h1>
              <p className="text-sub">
                Upload and manage your professional certifications.
              </p>
            </div>
          </div>

          <button
            onClick={openUploadModal}
            disabled={!employeeId}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiUpload /> Upload Certification
          </button>
        </div>

        {error && (
          <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* List */}
        <div className="rounded-3xl bg-panel p-6 shadow-xl">
          {loading ? (
            <p className="py-10 text-center text-sub">Loading certifications...</p>
          ) : certifications.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-14 text-center">
              <div className="rounded-full bg-primary-tint p-5 text-primary">
                <FiFileText size={30} />
              </div>
              <p className="font-semibold text-text">No certifications yet</p>
              <p className="max-w-sm text-sm text-sub">
                Upload your first certification (PDF, JPG, or PNG, up to 5 MB)
                to keep track of your credentials.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {certifications.map((cert) => {
                const status = getExpiryStatus(cert.expiryDate);
                return (
                  <div
                    key={cert.id}
                    className="flex flex-col justify-between rounded-2xl border border-line bg-bg p-5"
                  >
                    <div>
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-text">
                          {cert.certificationName}
                        </h3>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      <p className="mb-3 flex items-center gap-2 text-sm text-sub">
                        <FiBriefcase size={14} /> {cert.issuingOrganization}
                      </p>

                      <p className="mb-1 flex items-center gap-2 text-xs text-sub">
                        <FiCalendar size={13} />
                        Issued: {cert.issueDate || "—"}
                      </p>
                      {cert.expiryDate && (
                        <p className="mb-1 flex items-center gap-2 text-xs text-sub">
                          <FiCalendar size={13} />
                          Expires: {cert.expiryDate}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                      <a
                        href={cert.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                      >
                        <FiExternalLink size={14} /> View File
                      </a>
                      <button
                        onClick={() => handleDeleteClick(cert)}
                        className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                        aria-label="Delete certification"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ===========================
            UPLOAD MODAL
      ============================ */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between rounded-t-3xl bg-primary px-8 py-6 text-white">
              <div>
                <h2 className="text-xl font-bold">Upload Certification</h2>
                <p className="mt-1 text-sm text-white/80">
                  PDF, JPG, or PNG — max 5 MB
                </p>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="rounded-full bg-white/20 p-2 hover:bg-white/30"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="space-y-4 p-8">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-600">
                  Certification File
                </label>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-primary-tint file:px-3 file:py-1.5 file:text-primary"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-600">
                  Certification Name
                </label>
                <input
                  type="text"
                  value={uploadForm.certificationName}
                  onChange={(e) =>
                    setUploadForm({
                      ...uploadForm,
                      certificationName: e.target.value,
                    })
                  }
                  placeholder="e.g. AWS Certified Solutions Architect"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-tint"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-600">
                  Issuing Organization
                </label>
                <input
                  type="text"
                  value={uploadForm.issuingOrganization}
                  onChange={(e) =>
                    setUploadForm({
                      ...uploadForm,
                      issuingOrganization: e.target.value,
                    })
                  }
                  placeholder="e.g. Amazon Web Services"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-tint"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-600">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    max={new Date().toISOString().split("T")[0]}
                    value={uploadForm.issueDate}
                    onChange={(e) =>
                      setUploadForm({ ...uploadForm, issueDate: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-tint"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-600">
                    Expiry Date (optional)
                  </label>
                  <input
                    type="date"
                    min={uploadForm.issueDate || undefined}
                    value={uploadForm.expiryDate}
                    onChange={(e) =>
                      setUploadForm({ ...uploadForm, expiryDate: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-tint"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 p-6">
              <button
                onClick={() => setShowUploadModal(false)}
                disabled={uploading}
                className="rounded-xl bg-slate-200 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-300 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===========================
            DELETE MODAL
      ============================ */}
      {showDeleteModal && selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl">
            <div className="rounded-t-3xl bg-gradient-to-r from-red-600 to-rose-600 px-8 py-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Delete Certification</h2>
                  <p className="mt-1 text-red-100">This action cannot be undone.</p>
                </div>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="rounded-full bg-white/20 p-2 hover:bg-white/30"
                >
                  <FiX size={22} />
                </button>
              </div>
            </div>

            <div className="p-8">
              <div className="mb-6 flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                  <FiTrash2 size={36} className="text-red-600" />
                </div>
              </div>
              <h3 className="text-center text-xl font-bold text-slate-800">
                Are you sure?
              </h3>
              <p className="mt-4 text-center text-slate-500">
                You are about to permanently delete
              </p>
              <p className="mt-2 text-center text-lg font-semibold text-slate-800">
                {selectedCert.certificationName}
              </p>
              <p className="mt-1 text-center text-sm text-slate-500">
                ({selectedCert.issuingOrganization})
              </p>
              <div className="mt-8 rounded-2xl bg-red-50 p-4">
                <p className="text-sm text-red-700">
                  <strong>Warning:</strong> The uploaded file will also be
                  removed. This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 p-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="rounded-xl bg-slate-200 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-300 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete Certification"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}