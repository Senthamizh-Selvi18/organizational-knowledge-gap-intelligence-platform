import DashboardLayout from "../../components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import { FiX, FiStar } from "react-icons/fi";
import {
  bookSession,
  getMySessions,
  updateSessionStatus,
} from "../../services/mentorshipSessionService";
import { getOutgoingRequests, getIncomingRequests } from "../../services/mentorshipRequestService";
import { submitSessionFeedback, getFeedbackForSession } from "../../services/sessionFeedbackService";

const STATUS_STYLES = {
  SCHEDULED: "bg-blue-50 text-blue-700",
  COMPLETED: "bg-green-50 text-green-700",
  CANCELLED: "bg-gray-100 text-gray-500",
};

const EMPTY_FORM = {
  mentorshipRequestId: "",
  topic: "",
  scheduledAt: "",
  durationMinutes: 30,
  meetingLink: "",
  notes: "",
};

export default function SessionBooking() {
  const [sessions, setSessions] = useState([]);
  const [acceptedMatches, setAcceptedMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState(null);

  const [feedbackTarget, setFeedbackTarget] = useState(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComments, setFeedbackComments] = useState("");
  const [feedbackByLabel, setFeedbackByLabel] = useState({});
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState(null);

  const loadAll = () => {
    setLoading(true);
    setError(null);

    Promise.all([getMySessions(), getIncomingRequests(), getOutgoingRequests()])
      .then(([sess, inc, out]) => {
        setSessions(sess || []);
        const accepted = [...(inc || []), ...(out || [])].filter(
          (r) => r.status === "ACCEPTED"
        );
        setAcceptedMatches(accepted);
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to load your mentorship sessions. Please try again later.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAll();
  }, []);

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

    if (!formData.mentorshipRequestId) {
      setFormError("Please select a mentor match.");
      return;
    }
    if (!formData.topic.trim()) {
      setFormError("Topic is required.");
      return;
    }
    if (!formData.scheduledAt) {
      setFormError("Please choose a date and time.");
      return;
    }

    setSaving(true);
    setFormError(null);

    const payload = {
      mentorshipRequestId: Number(formData.mentorshipRequestId),
      topic: formData.topic.trim(),
      scheduledAt: new Date(formData.scheduledAt).toISOString(),
      durationMinutes: Number(formData.durationMinutes) || 30,
      meetingLink: formData.meetingLink.trim(),
      notes: formData.notes.trim(),
    };

    bookSession(payload)
      .then(() => {
        setShowModal(false);
        loadAll();
      })
      .catch((err) => {
        console.error(err);
        setFormError(err.response?.data?.message || "Unable to book the session.");
      })
      .finally(() => setSaving(false));
  };

  const handleStatusChange = (id, status) => {
    setBusyId(id);
    setActionError(null);

    updateSessionStatus(id, status)
      .then(() => loadAll())
      .catch((err) => {
        console.error(err);
        setActionError(err.response?.data?.message || "Unable to update the session.");
      })
      .finally(() => setBusyId(null));
  };

  const openFeedbackModal = (session) => {
    setFeedbackTarget(session);
    setFeedbackRating(5);
    setFeedbackComments("");
    setFeedbackError(null);
  };

  const closeFeedbackModal = () => {
    if (submittingFeedback) return;
    setFeedbackTarget(null);
  };

  const handleSubmitFeedback = (e) => {
    e.preventDefault();
    if (!feedbackTarget) return;

    setSubmittingFeedback(true);
    setFeedbackError(null);

    submitSessionFeedback(feedbackTarget.id, feedbackRating, feedbackComments.trim())
      .then(() => {
        setFeedbackTarget(null);
        loadAll();
      })
      .catch((err) => {
        console.error(err);
        setFeedbackError(err.response?.data?.message || "Unable to submit feedback.");
      })
      .finally(() => setSubmittingFeedback(false));
  };

  const viewFeedback = (session) => {
    getFeedbackForSession(session.id).then((fb) => {
      if (fb) {
        setFeedbackByLabel((prev) => ({
          ...prev,
          [session.id]: `${fb.rating}/5 — ${fb.comments || "No comments"}`,
        }));
      }
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-text">Session Booking</h1>
            <p className="text-sub mt-2">
              Schedule and manage mentorship sessions with your matched mentors and mentees.
            </p>
          </div>

          <button
            onClick={openModal}
            disabled={acceptedMatches.length === 0}
            className="bg-primary text-white px-5 py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            title={
              acceptedMatches.length === 0
                ? "You need an accepted mentorship match first"
                : ""
            }
          >
            + Book Session
          </button>
        </div>

        {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl">{error}</div>}
        {actionError && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl">{actionError}</div>
        )}

        {acceptedMatches.length === 0 && !loading && (
          <div className="bg-primary-tint text-primary px-4 py-3 rounded-xl text-sm">
            You don't have any accepted mentorship matches yet. Visit the Expert Directory or Mentor Matching page first.
          </div>
        )}

        <div className="bg-panel rounded-3xl shadow-xl p-6">
          {loading ? (
            <p className="text-mute">Loading sessions...</p>
          ) : sessions.length === 0 ? (
            <p className="text-mute">No sessions scheduled yet.</p>
          ) : (
            <div className="space-y-4">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className="border border-gray-100 rounded-2xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-bold text-text">{s.topic}</h3>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-xl whitespace-nowrap ${
                          STATUS_STYLES[s.status] || "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {s.status}
                      </span>
                    </div>

                    <p className="text-sub text-sm mt-2">
                      {s.mentorName} (mentor) ↔ {s.menteeName} (mentee)
                    </p>
                    <p className="text-mute text-xs mt-1">
                      {new Date(s.scheduledAt).toLocaleString()} · {s.durationMinutes} min
                    </p>
                    {s.meetingLink && (
                      
                        <a
                        href={s.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary text-sm font-semibold underline mt-1 inline-block"
                      >
                        Join meeting link
                      </a>
                    )}
                    {s.notes && <p className="text-sub text-sm mt-2">{s.notes}</p>}

                    {feedbackByLabel[s.id] && (
                      <p className="text-amber-600 text-xs mt-2 flex items-center gap-1">
                        <FiStar /> {feedbackByLabel[s.id]}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3 flex-wrap items-center">
                    {s.status === "SCHEDULED" && (
                      <>
                        <button
                          onClick={() => handleStatusChange(s.id, "COMPLETED")}
                          disabled={busyId === s.id}
                          className="bg-primary text-white px-4 py-2 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-60"
                        >
                          Mark Completed
                        </button>
                        <button
                          onClick={() => handleStatusChange(s.id, "CANCELLED")}
                          disabled={busyId === s.id}
                          className="text-red-600 hover:text-red-700 font-semibold"
                        >
                          Cancel
                        </button>
                      </>
                    )}

                    {s.status === "COMPLETED" && !s.feedbackSubmitted && (
                      <button
                        onClick={() => openFeedbackModal(s)}
                        className="border border-gray-200 text-sub px-4 py-2 rounded-xl font-semibold hover:bg-gray-50 transition"
                      >
                        Leave Feedback
                      </button>
                    )}

                    {s.status === "COMPLETED" && s.feedbackSubmitted && !feedbackByLabel[s.id] && (
                      <button
                        onClick={() => viewFeedback(s)}
                        className="text-primary hover:opacity-80 font-semibold text-sm"
                      >
                        View Feedback
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Book Session Modal */}
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
              <h2 className="text-xl font-bold text-text">Book a Session</h2>
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
                <label className="block text-sub text-sm mb-1">Mentor Match</label>
                <select
                  value={formData.mentorshipRequestId}
                  onChange={(e) => handleFormChange("mentorshipRequestId", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select a match...</option>
                  {acceptedMatches.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.mentorName} ↔ {m.menteeName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sub text-sm mb-1">Topic</label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => handleFormChange("topic", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. Career growth check-in"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sub text-sm mb-1">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) => handleFormChange("scheduledAt", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sub text-sm mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={formData.durationMinutes}
                    onChange={(e) => handleFormChange("durationMinutes", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sub text-sm mb-1">Meeting Link (optional)</label>
                <input
                  type="text"
                  value={formData.meetingLink}
                  onChange={(e) => handleFormChange("meetingLink", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. https://meet.google.com/..."
                />
              </div>

              <div>
                <label className="block text-sub text-sm mb-1">Notes (optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleFormChange("notes", e.target.value)}
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
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
                  {saving ? "Booking..." : "Book Session"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackTarget && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={closeFeedbackModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 w-full max-w-md relative"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold text-text">Rate this session</h2>
              <button
                type="button"
                onClick={closeFeedbackModal}
                disabled={submittingFeedback}
                className="text-sub hover:text-text rounded-lg p-1.5 hover:bg-gray-100 transition"
                aria-label="Close"
              >
                <FiX size={20} />
              </button>
            </div>

            {feedbackError && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-4">{feedbackError}</div>
            )}

            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div>
                <label className="block text-sub text-sm mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setFeedbackRating(n)}
                      className={n <= feedbackRating ? "text-amber-500" : "text-gray-300"}
                    >
                      <FiStar size={24} fill={n <= feedbackRating ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sub text-sm mb-1">Comments</label>
                <textarea
                  value={feedbackComments}
                  onChange={(e) => setFeedbackComments(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="What went well? What could improve?"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeFeedbackModal}
                  disabled={submittingFeedback}
                  className="px-5 py-2 rounded-xl font-semibold text-sub border border-gray-200 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingFeedback}
                  className="bg-primary text-white px-5 py-2 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-60"
                >
                  {submittingFeedback ? "Submitting..." : "Submit Feedback"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}