import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { toast } from "../../components/ui/Toast.jsx";
import {
  FiClipboard,
  FiClock,
  FiCheckCircle,
  FiSend,
  FiSave,
  FiUserPlus,
  FiChevronLeft,
} from "react-icons/fi";
import {
  getMyPendingAssessments,
  getMyAssessmentHistory,
  getAssessmentDetail,
  saveAssessmentDraft,
  submitAssessment,
  assignAssessment,
  getAssessmentTemplates,
} from "../../services/assessmentService";
import { getEmployees } from "../../services/EmployeeManagementService.jsx";
import { getAllUsers } from "../../services/userService";

const TYPE_OPTIONS = ["SELF", "PEER", "MANAGER"];

function StatusBadge({ status }) {
  const map = {
    PENDING: "bg-yellow-100 text-yellow-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-green-100 text-green-700",
  };
  return (
    <span className={`text-xs px-2 py-1 rounded-lg font-medium ${map[status] || "bg-gray-100 text-gray-600"}`}>
      {status?.replace("_", " ") || "UNKNOWN"}
    </span>
  );
}

function AssessmentForm({ assessmentId, onBack, onDone }) {
  const [detail, setDetail] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAssessmentDetail(assessmentId);
      setDetail(data);
      const initial = {};
      (data.answers || []).forEach((a) => {
        initial[a.questionId] = { rating: a.rating || "", comment: a.comment || "" };
      });
      setAnswers(initial);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load assessment.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [assessmentId]);

  const setAnswer = (questionId, field, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], [field]: value },
    }));
  };

  const buildPayload = () => ({
    answers: Object.entries(answers)
      .filter(([, v]) => v.rating !== "" && v.rating !== undefined)
      .map(([questionId, v]) => ({
        questionId: Number(questionId),
        rating: Number(v.rating),
        comment: v.comment || "",
      })),
  });

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const updated = await saveAssessmentDraft(assessmentId, buildPayload());
      setDetail(updated);
      toast.success("Draft saved.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save draft.");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = buildPayload();
    if (payload.answers.length !== (detail.answers || []).length) {
      toast.error("Please rate every question before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      await submitAssessment(assessmentId, payload);
      toast.success("Assessment submitted.");
      onDone();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit assessment.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-mute text-sm">Loading assessment...</p>;
  if (!detail) return null;

  const isCompleted = detail.status === "COMPLETED";

  return (
    <div className="bg-panel rounded-3xl shadow-xl p-6 space-y-5">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-sub hover:text-text"
      >
        <FiChevronLeft /> Back to list
      </button>

      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          {detail.templateTitle}
          <StatusBadge status={detail.status} />
        </h3>
        <p className="text-xs text-mute mt-1">
          {detail.type} assessment for {detail.subjectEmployeeName}
          {detail.dueDate ? ` · due ${detail.dueDate}` : ""}
        </p>
        {detail.templateDescription && (
          <p className="text-sm text-sub mt-2">{detail.templateDescription}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {(detail.answers || []).map((q) => (
          <div key={q.questionId} className="border border-line rounded-xl p-4 space-y-3">
            <p className="text-sm font-medium text-text">
              {q.questionText}
              {q.skillName && (
                <span className="ml-2 text-xs text-mute">({q.skillName})</span>
              )}
            </p>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: q.ratingScaleMax }, (_, i) => i + 1).map((n) => (
                <button
                  type="button"
                  key={n}
                  disabled={isCompleted}
                  onClick={() => setAnswer(q.questionId, "rating", n)}
                  className={`h-9 w-9 rounded-xl text-sm font-semibold border transition-colors ${
                    Number(answers[q.questionId]?.rating) === n
                      ? "bg-primary text-text border-primary"
                      : "border-line hover:bg-bg"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <textarea
              value={answers[q.questionId]?.comment || ""}
              onChange={(e) => setAnswer(q.questionId, "comment", e.target.value)}
              disabled={isCompleted}
              placeholder="Optional comment"
              rows={2}
              className="w-full border border-line rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        ))}

        {!isCompleted && (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={saving || submitting}
              className="flex items-center gap-2 border border-line rounded-xl px-4 py-2 text-sm hover:bg-bg disabled:opacity-60"
            >
              <FiSave /> {saving ? "Saving..." : "Save Draft"}
            </button>
            <button
              type="submit"
              disabled={saving || submitting}
              className="flex items-center gap-2 bg-primary text-text rounded-xl px-4 py-2 text-sm font-semibold hover:bg-primary-dark disabled:opacity-60"
            >
              <FiSend /> {submitting ? "Submitting..." : "Submit Assessment"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

function PendingTab() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getMyPendingAssessments();
      setPending(data);
    } catch (err) {
      toast.error("Failed to load pending assessments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (openId) {
    return (
      <AssessmentForm
        assessmentId={openId}
        onBack={() => setOpenId(null)}
        onDone={() => {
          setOpenId(null);
          load();
        }}
      />
    );
  }

  return (
    <div className="bg-panel rounded-3xl shadow-xl p-6">
      <h2 className="text-xl font-semibold mb-4">Assessments Awaiting You</h2>
      {loading ? (
        <p className="text-mute text-sm">Loading...</p>
      ) : pending.length === 0 ? (
        <p className="text-mute text-sm">You have no pending assessments right now.</p>
      ) : (
        <div className="space-y-3">
          {pending.map((a) => (
            <button
              key={a.id}
              onClick={() => setOpenId(a.id)}
              className="w-full text-left border border-line rounded-xl px-4 py-3 hover:bg-bg transition-colors flex items-center justify-between"
            >
              <div>
                <p className="font-medium">{a.templateTitle}</p>
                <p className="text-xs text-mute mt-0.5">
                  {a.type} · {a.subjectEmployeeName}
                  {a.dueDate ? ` · due ${a.dueDate}` : ""}
                </p>
              </div>
              <StatusBadge status={a.status} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function HistoryTab() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getMyAssessmentHistory();
        setHistory(data);
      } catch (err) {
        toast.error("Failed to load assessment history.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="bg-panel rounded-3xl shadow-xl p-6">
      <h2 className="text-xl font-semibold mb-4">My Assessment History</h2>
      {loading ? (
        <p className="text-mute text-sm">Loading...</p>
      ) : history.length === 0 ? (
        <p className="text-mute text-sm">No completed assessments yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-mute border-b border-line">
                <th className="py-2 pr-4">Template</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Assessor</th>
                <th className="py-2 pr-4">Avg. Rating</th>
                <th className="py-2 pr-4">Completed</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.assessmentId} className="border-b border-line/60">
                  <td className="py-2 pr-4">{h.templateTitle}</td>
                  <td className="py-2 pr-4">{h.type}</td>
                  <td className="py-2 pr-4">{h.assessorName}</td>
                  <td className="py-2 pr-4">{h.averageRating ?? "-"}</td>
                  <td className="py-2 pr-4">
                    {h.completedAt ? new Date(h.completedAt).toLocaleDateString() : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AssignTab() {
  const [employees, setEmployees] = useState([]);
  const [users, setUsers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [templatesAvailable, setTemplatesAvailable] = useState(true);
  const [form, setForm] = useState({
    subjectEmployeeId: "",
    templateId: "",
    type: "SELF",
    assessorUserIds: [],
    dueDate: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await getEmployees();
        setEmployees(res.data || []);
      } catch (err) {
        toast.error("Failed to load employees.");
      }
      try {
        const userList = await getAllUsers();
        setUsers(userList || []);
      } catch (err) {}
      try {
        const tpl = await getAssessmentTemplates();
        setTemplates(tpl || []);
      } catch (err) {
        setTemplatesAvailable(false);
      }
    })();
  }, []);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!form.subjectEmployeeId || !form.templateId) {
      toast.error("Choose a subject employee and a template.");
      return;
    }
    if (form.type !== "SELF" && form.assessorUserIds.length === 0) {
      toast.error("Choose at least one assessor for Peer/Manager assessments.");
      return;
    }
    setSaving(true);
    try {
      await assignAssessment({
        subjectEmployeeId: Number(form.subjectEmployeeId),
        templateId: Number(form.templateId),
        type: form.type,
        assessorUserIds: form.assessorUserIds.map(Number),
        dueDate: form.dueDate || null,
      });
      toast.success("Assessment assigned.");
      setForm({
        subjectEmployeeId: "",
        templateId: "",
        type: "SELF",
        assessorUserIds: [],
        dueDate: "",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to assign assessment.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-panel rounded-3xl shadow-xl p-6 space-y-4 max-w-2xl">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <FiUserPlus /> Assign Assessment
      </h2>

      {!templatesAvailable && (
        <p className="text-sm text-amber-700 bg-amber-50 rounded-xl px-4 py-2">
          Assessment templates are managed by HR/Admin. Ask HR for the template ID,
          or have HR assign this assessment.
        </p>
      )}

      <form onSubmit={handleAssign} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sub text-sm mb-1">Subject Employee</label>
            <select
              value={form.subjectEmployeeId}
              onChange={(e) => update("subjectEmployeeId", e.target.value)}
              className="w-full border border-line rounded-xl px-4 py-2 outline-none"
            >
              <option value="">-- Select employee --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name || emp.fullName || emp.employeeCode}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sub text-sm mb-1">Template</label>
            <select
              value={form.templateId}
              onChange={(e) => update("templateId", e.target.value)}
              disabled={!templatesAvailable}
              className="w-full border border-line rounded-xl px-4 py-2 outline-none disabled:opacity-60"
            >
              <option value="">-- Select template --</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sub text-sm mb-1">Type</label>
            <select
              value={form.type}
              onChange={(e) => update("type", e.target.value)}
              className="w-full border border-line rounded-xl px-4 py-2 outline-none"
            >
              {TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sub text-sm mb-1">Due Date</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => update("dueDate", e.target.value)}
              className="w-full border border-line rounded-xl px-4 py-2 outline-none"
            />
          </div>
        </div>

        {form.type !== "SELF" && (
          <div>
            <label className="block text-sub text-sm mb-1">
              {form.type === "PEER" ? "Peer assessor(s)" : "Manager assessor"}
            </label>
            <select
              multiple={form.type === "PEER"}
              value={form.assessorUserIds}
              onChange={(e) =>
                update(
                  "assessorUserIds",
                  Array.from(e.target.selectedOptions, (o) => o.value)
                )
              }
              className="w-full border border-line rounded-xl px-4 py-2 outline-none min-h-[42px]"
            >
              {form.type === "MANAGER" && <option value="">-- Select manager --</option>}
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name || u.email}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="bg-primary text-text px-5 py-2 rounded-xl font-semibold hover:bg-primary-dark disabled:opacity-60"
        >
          {saving ? "Assigning..." : "Assign Assessment"}
        </button>
      </form>
    </div>
  );
}

export default function Assessment() {
  const role = localStorage.getItem("role")?.toLowerCase() || "";
  const canAssign = role === "admin" || role === "hr specialist" || role === "manager";

  const tabs = [
    { key: "pending", label: "My Pending", icon: FiClock },
    { key: "history", label: "My History", icon: FiCheckCircle },
    ...(canAssign ? [{ key: "assign", label: "Assign Assessment", icon: FiUserPlus }] : []),
  ];
  const [activeTab, setActiveTab] = useState("pending");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FiClipboard className="text-primary" />
            Performance Assessments
          </h1>
          <p className="text-sub">
            Complete Self, Peer, and Manager assessments and review your history.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-line pb-2">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  active ? "bg-primary text-text" : "text-sub hover:bg-bg border border-line"
                }`}
              >
                <Icon /> {t.label}
              </button>
            );
          })}
        </div>

        {activeTab === "pending" && <PendingTab />}
        {activeTab === "history" && <HistoryTab />}
        {activeTab === "assign" && canAssign && <AssignTab />}
      </div>
    </DashboardLayout>
  );
}
