import DashboardLayout from "../../components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import {
  getIncomingRequests,
  getOutgoingRequests,
  respondToRequest,
  cancelRequest,
} from "../../services/mentorshipRequestService";

const STATUS_STYLES = {
  PENDING: "bg-amber-50 text-amber-700",
  ACCEPTED: "bg-green-50 text-green-700",
  DECLINED: "bg-red-50 text-red-600",
  CANCELLED: "bg-gray-100 text-gray-500",
};

export default function MentorshipRequests() {
  const [tab, setTab] = useState("incoming");

  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const loadAll = () => {
    setLoading(true);
    setError(null);

    Promise.all([getIncomingRequests(), getOutgoingRequests()])
      .then(([inc, out]) => {
        setIncoming(inc || []);
        setOutgoing(out || []);
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to load mentorship requests. Please try again later.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleRespond = (id, decision) => {
    setBusyId(id);
    setActionError(null);

    respondToRequest(id, decision)
      .then(() => loadAll())
      .catch((err) => {
        console.error(err);
        setActionError(err.response?.data?.message || "Unable to update the request.");
      })
      .finally(() => setBusyId(null));
  };

  const handleCancel = (id) => {
    setBusyId(id);
    setActionError(null);

    cancelRequest(id)
      .then(() => loadAll())
      .catch((err) => {
        console.error(err);
        setActionError(err.response?.data?.message || "Unable to cancel the request.");
      })
      .finally(() => setBusyId(null));
  };

  const list = tab === "incoming" ? incoming : outgoing;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-text">Mentor Matching</h1>
          <p className="text-sub mt-2">
            Review mentorship requests you've received, and track the ones you've sent.
          </p>
        </div>

        {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl">{error}</div>}
        {actionError && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl">{actionError}</div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => setTab("incoming")}
            className={`px-5 py-2 rounded-xl font-semibold transition ${
              tab === "incoming"
                ? "bg-primary text-white"
                : "bg-panel text-sub hover:text-text"
            }`}
          >
            Incoming ({incoming.filter((r) => r.status === "PENDING").length})
          </button>
          <button
            onClick={() => setTab("outgoing")}
            className={`px-5 py-2 rounded-xl font-semibold transition ${
              tab === "outgoing"
                ? "bg-primary text-white"
                : "bg-panel text-sub hover:text-text"
            }`}
          >
            Outgoing ({outgoing.length})
          </button>
        </div>

        <div className="bg-panel rounded-3xl shadow-xl p-6">
          {loading ? (
            <p className="text-mute">Loading requests...</p>
          ) : list.length === 0 ? (
            <p className="text-mute">
              {tab === "incoming"
                ? "No one has requested mentorship from you yet."
                : "You haven't requested mentorship from anyone yet."}
            </p>
          ) : (
            <div className="space-y-4">
              {list.map((req) => (
                <div
                  key={req.id}
                  className="border border-gray-100 rounded-2xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-bold text-text">
                        {tab === "incoming" ? req.menteeName : req.mentorName}
                      </h3>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-xl whitespace-nowrap ${
                          STATUS_STYLES[req.status] || "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>

                    {req.message && (
                      <p className="text-sub text-sm mt-2">"{req.message}"</p>
                    )}

                    {req.responseNote && (
                      <p className="text-mute text-xs mt-2">Response note: {req.responseNote}</p>
                    )}

                    <p className="text-mute text-xs mt-2">
                      Requested {new Date(req.requestedAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex gap-3 flex-wrap">
                    {tab === "incoming" && req.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => handleRespond(req.id, "ACCEPTED")}
                          disabled={busyId === req.id}
                          className="bg-primary text-white px-4 py-2 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-60"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRespond(req.id, "DECLINED")}
                          disabled={busyId === req.id}
                          className="border border-gray-200 text-sub px-4 py-2 rounded-xl font-semibold hover:bg-gray-50 transition disabled:opacity-60"
                        >
                          Decline
                        </button>
                      </>
                    )}

                    {tab === "outgoing" && req.status === "PENDING" && (
                      <button
                        onClick={() => handleCancel(req.id)}
                        disabled={busyId === req.id}
                        className="text-red-600 hover:text-red-700 font-semibold"
                      >
                        Cancel Request
                      </button>
                    )}

                    {req.status === "ACCEPTED" && (
                      <span className="text-sm text-green-700 font-semibold self-center">
                        Matched — book a session below
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}