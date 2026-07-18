import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  FiAward,
  FiUpload,
  FiTrash2,
  FiExternalLink,
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiFileText,
  FiCalendar,
} from "react-icons/fi";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  getCertifications,
  uploadCertification,
  deleteCertification,
} from "../../services/CertificationService";
import { toast } from "../../components/ui/Toast.jsx";

const ALLOWED_TYPES = ["application/pdf", "image/png", "image/jpeg"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const initialForm = {
  certificationName: "",
  issuingOrganization: "",
  issueDate: "",
  expiryDate: "",
  file: null,
};

export default function Certification() {
  const userId = localStorage.getItem("userId");

  const [employeeId, setEmployeeId] = useState(null);
  const [certifications, setCertifications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState(initialForm);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCertification, setSelectedCertification] = useState(null);

  /* ===========================
        LOAD EMPLOYEE ID
  ============================ */

  useEffect(() => {
    const fetchEmployeeId = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:8080/api/profile/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEmployeeId(response.data.employeeId);
      } catch (err) {
        console.error(err);
        setError("Unable to load your employee profile.");
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

  const validateForm = () => {
    if (!form.certificationName.trim()) {
      toast.warning("Certification name is required.");
      return false;
    }
    if (!form.issuingOrganization.trim()) {
      toast.warning("Issuing organization is required.");
      return false;
    }
    if (!form.issueDate) {
      toast.warning("Issue date is required.");
      return false;
    }
    if (
      form.expiryDate &&
      new Date(form.expiryDate) < new Date(form.issueDate)
    ) {
      toast.warning("Expiry date cannot be before the issue date.");
      return false;
    }
    if (!form.file) {
      toast.warning("Please select a certificate file to upload.");
      return false;
    }
    if (!ALLOWED_TYPES.includes(form.file.type)) {
      toast.warning("Only PDF, JPG, and PNG files are allowed.");
      return false;
    }
    if (form.file.size > MAX_FILE_SIZE) {
      toast.warning("File size must not exceed 5 MB.");
      return false;
    }
    return true;
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!employeeId) {
      toast.error("Employee profile not loaded yet. Please try again.");
      return;
    }
    if (!validateForm()) return;

    const formData = new FormData();
    formData.append("file", form.file);
    formData.append("certificationName", form.certificationName.trim());
    formData.append(
      "issuingOrganization",
      form.issuingOrganization.trim()
    );
    formData.append("issueDate", form.issueDate);
    if (form.expiryDate) formData.append("expiryDate", form.expiryDate);

    try {
      setUploading(true);
      setError("");
      await uploadCertification(employeeId, formData);

      toast.success("Certification uploaded successfully!");
      setMessage("Certification uploaded successfully!");
      setForm(initialForm);
      // reset the native file input element
      const fileInput = document.getElementById("certification-file-input");
      if (fileInput) fileInput.value = "";

      await loadCertifications();
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Failed to upload certification."
      );
      setError(
        err.response?.data?.message || "Failed to upload certification."
      );
    } finally {
      setUploading(false);
    }
  };

  /* ===========================
        DELETE
  ============================ */

  const handleDeleteClick = (certification) => {
    setSelectedCertification(certification);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!employeeId || !selectedCertification) return;

    try {
      await deleteCertification(employeeId, selectedCertification.id);
      toast.success("Certification deleted successfully.");
      setMessage("Certification deleted successfully.");
      setShowDeleteModal(false);
      setSelectedCertification(null);
      await loadCertifications();
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Failed to delete certification."
      );
    }
  };

  /* ===========================
        RETURN
  ============================ */

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
              <FiAward className="text-3xl" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Certifications</h1>
              <p className="mt-2 text-blue-100 text-lg">
                Upload and manage your professional certifications.
              </p>
            </div>
          </div>
        </div>

        {/* Success message */}
        {message && (
          <div className="rounded-2xl border border-green-300 bg-green-50 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <FiCheckCircle className="text-xl text-green-600" />
              <span className="font-medium text-green-700">{message}</span>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="rounded-2xl border border-red-300 bg-red-50 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <FiAlertCircle className="text-xl text-red-600" />
              <span className="font-medium text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Upload form */}
        <div className="rounded-3xl bg-panel p-6 shadow-xl">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-text">
            <FiUpload className="text-primary" />
            Upload New Certification
          </h2>

          <form
            onSubmit={handleUpload}
            className="grid grid-cols-1 gap-5 md:grid-cols-2"
          >
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-600">
                Certification Name
              </label>
              <input
                type="text"
                value={form.certificationName}
                onChange={(e) =>
                  setForm({ ...form, certificationName: e.target.value })
                }
                placeholder="e.g. AWS Certified Solutions Architect"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-600">
                Issuing Organization
              </label>
              <input
                type="text"
                value={form.issuingOrganization}
                onChange={(e) =>
                  setForm({ ...form, issuingOrganization: e.target.value })
                }
                placeholder="e.g. Amazon Web Services"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-600">
                Issue Date
              </label>
              <input
                type="date"
                max={new Date().toISOString().split("T")[0]}
                value={form.issueDate}
                onChange={(e) =>
                  setForm({ ...form, issueDate: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-600">
                Expiry Date{" "}
                <span className="font-normal text-slate-400">
                  (optional)
                </span>
              </label>
              <input
                type="date"
                value={form.expiryDate}
                onChange={(e) =>
                  setForm({ ...form, expiryDate: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-600">
                Certificate File
                <span className="font-normal text-slate-400">
                  {" "}
                  (PDF, JPG, or PNG — max 5 MB)
                </span>
              </label>
              <input
                id="certification-file-input"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) =>
                  setForm({ ...form, file: e.target.files?.[0] || null })
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-blue-700 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={uploading}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiUpload />
                {uploading ? "Uploading..." : "Upload Certification"}
              </button>
            </div>
          </form>
        </div>

        {/* Certifications list */}
        <div className="overflow-hidden rounded-3xl bg-panel shadow-xl">
          <div className="border-b border-slate-200 p-6">
            <h2 className="text-xl font-bold text-text">
              Your Certifications
            </h2>
          </div>

          {loading ? (
            <div className="p-10 text-center text-slate-500">
              Loading certifications...
            </div>
          ) : certifications.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              No certifications uploaded yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {certifications.map((cert) => (
                <div
                  key={cert.id}
                  className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100">
                      <FiFileText className="text-xl text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text">
                        {cert.certificationName}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {cert.issuingOrganization}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <FiCalendar />
                          Issued: {cert.issueDate}
                        </span>
                        {cert.expiryDate && (
                          <span className="flex items-center gap-1">
                            <FiCalendar />
                            Expires: {cert.expiryDate}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <a
                      href={cert.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                      <FiExternalLink />
                      View
                    </a>
                    <button
                      onClick={() => handleDeleteClick(cert)}
                      className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      <FiTrash2 />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && selectedCertification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl">
            <div className="rounded-t-3xl bg-gradient-to-r from-red-600 to-rose-600 px-8 py-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">
                    Delete Certification
                  </h2>
                  <p className="mt-1 text-red-100">
                    This action cannot be undone.
                  </p>
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
                {selectedCertification.certificationName}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 p-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="rounded-xl bg-slate-200 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700"
              >
                Delete Certification
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}