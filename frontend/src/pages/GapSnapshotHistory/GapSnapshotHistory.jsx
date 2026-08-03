import { useEffect, useState } from "react";
import { FiTrendingUp, FiTrendingDown, FiMinus, FiCamera, FiClock } from "react-icons/fi";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getMyGapHistory, captureMyGapSnapshot } from "../../services/gapSnapshotService";

function formatDate(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function TrendBadge({ change }) {
  if (change == null) {
    return null;
  }
  const rounded = Math.round(change * 10) / 10;
  if (rounded > 0) {
    return (
      <span className="flex items-center gap-1 text-xs font-semibold text-rust">
        <FiTrendingUp className="h-3.5 w-3.5" /> +{rounded}% gap
      </span>
    );
  }
  if (rounded < 0) {
    return (
      <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
        <FiTrendingDown className="h-3.5 w-3.5" /> {rounded}% gap
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs font-semibold text-sub">
      <FiMinus className="h-3.5 w-3.5" /> No change
    </span>
  );
}

export default function GapSnapshotHistory() {
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [capturing, setCapturing] = useState(false);
  const [message, setMessage] = useState("");

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getMyGapHistory();
      setSnapshots(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load your gap snapshot history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleCapture = async () => {
    try {
      setCapturing(true);
      setMessage("");
      await captureMyGapSnapshot();
      setMessage("Snapshot captured for today.");
      await loadHistory();
    } catch (err) {
      console.error(err);
      setError("Could not capture a snapshot. Make sure you have a role assigned.");
    } finally {
      setCapturing(false);
    }
  };

  const byRole = snapshots.reduce((acc, snap) => {
    const key = snap.roleName || "Unassigned role";
    if (!acc[key]) acc[key] = [];
    acc[key].push(snap);
    return acc;
  }, {});

  return (
    <DashboardLayout>
      <div className="h-full space-y-6 overflow-y-auto p-6 lg:p-8">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text">Historical gap snapshots</h1>
            <p className="text-sub">
              Track how your skill gap has changed over time for each role you hold.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCapture}
            disabled={capturing}
            className="flex items-center gap-2 self-start rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
          >
            <FiCamera className="h-4 w-4" />
            {capturing ? "Capturing…" : "Capture snapshot now"}
          </button>
        </div>

        {message && (
          <div className="rounded-xl border border-line bg-primary-tint px-4 py-3 text-sm font-medium text-primary">
            {message}
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-rust-tint bg-rust-tint px-4 py-3 text-sm font-medium text-rust">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-line bg-panel p-10 text-center text-sub shadow-lg">
            Loading your gap history…
          </div>
        ) : Object.keys(byRole).length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-panel p-10 text-center shadow-lg">
            <FiClock className="h-8 w-8 text-mute" />
            <p className="font-semibold text-text">No snapshots yet</p>
            <p className="max-w-sm text-sm text-sub">
              Snapshots build up automatically once a month, or you can capture your first one
              right now to start tracking your progress.
            </p>
          </div>
        ) : (
          Object.entries(byRole).map(([roleName, history]) => {
            const latest = history[history.length - 1];
            const first = history[0];
            const change = latest.gapPercentage - first.gapPercentage;

            return (
              <div
                key={roleName}
                className="rounded-2xl border border-line bg-panel p-6 shadow-lg"
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-bold text-text">{roleName}</h2>
                    <p className="text-sm text-sub">
                      {history.length} snapshot{history.length === 1 ? "" : "s"} recorded
                    </p>
                  </div>
                  {history.length > 1 && <TrendBadge change={change} />}
                </div>

                <div className="space-y-2">
                  {history
                    .slice()
                    .reverse()
                    .map((snap) => (
                      <div
                        key={snap.id}
                        className="flex flex-col gap-2 rounded-xl border border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-text">
                            {formatDate(snap.snapshotDate)}
                          </span>
                          <span className="text-xs text-sub">
                            {snap.matchedSkillCount}/{snap.totalRequiredSkills} skills matched
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-32 overflow-hidden rounded-full bg-line">
                            <div
                              className="h-full rounded-full bg-rust"
                              style={{
                                width: `${Math.min(100, Math.round(snap.gapPercentage))}%`,
                              }}
                            />
                          </div>
                          <span className="w-14 text-right text-sm font-semibold text-text">
                            {Math.round(snap.gapPercentage)}% gap
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </DashboardLayout>
  );
}