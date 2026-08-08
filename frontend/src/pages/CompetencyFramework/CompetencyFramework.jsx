import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getRoles } from "../../services/roleService";
import { getSkills } from "../../services/skillService";
import {
  getFrameworks,
  getFrameworkById,
  createFramework,
  updateFramework,
  publishFramework,
  archiveFramework,
  deleteFramework,
  setFrameworkSkills,
  removeFrameworkSkill,
  mapFrameworkToGoal,
  removeFrameworkGoalMapping,
  compareFrameworkToBenchmark,
  getSkillTaxonomyList,
  createSkillTaxonomy,
  updateSkillTaxonomy,
  deleteSkillTaxonomy,
  getStrategicGoals,
  createStrategicGoal,
  deleteStrategicGoal,
  getIndustryBenchmarks,
  createIndustryBenchmark,
  deleteIndustryBenchmark,
  getCompetencyActivityHistory,
} from "../../services/competencyFrameworkService";
import {
  FiAward,
  FiPlus,
  FiTrash2,
  FiCheckCircle,
  FiAlertCircle,
  FiTarget,
  FiTrendingUp,
  FiLayers,
  FiSend,
  FiArchive,
  FiClock,
} from "react-icons/fi";
import { confirmDialog } from "../../components/ui/ConfirmDialog.jsx";
import { toast } from "../../components/ui/Toast.jsx";

const LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const TABS = [
  { key: "frameworks", label: "Frameworks", icon: FiAward },
  { key: "taxonomy", label: "Skill Taxonomy", icon: FiLayers },
  { key: "goals", label: "Strategic Goals", icon: FiTarget },
  { key: "benchmarks", label: "Industry Benchmarks", icon: FiTrendingUp },
  { key: "history", label: "History", icon: FiClock },
];

const statusColor = (status) => {
  if (status === "PUBLISHED") return "bg-green-100 text-green-700";
  if (status === "ARCHIVED") return "bg-gray-200 text-gray-600";
  return "bg-yellow-100 text-yellow-700";
};

function Banner({ status }) {
  if (!status) return null;
  return (
    <div
      className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm ${
        status.type === "success"
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      {status.type === "success" ? <FiCheckCircle /> : <FiAlertCircle />}
      {status.message}
    </div>
  );
}

export default function CompetencyFramework() {
  const role = localStorage.getItem("role")?.toLowerCase();
  const isAdmin = role === "admin";

  const [activeTab, setActiveTab] = useState("frameworks");
  const [roles, setRoles] = useState([]);
  const [skills, setSkills] = useState([]);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [rolesRes, skillsRes] = await Promise.all([getRoles(), getSkills()]);
        setRoles(rolesRes.data);
        setSkills(skillsRes.data);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const flash = (type, message) => {
    setStatus({ type, message });
    setTimeout(() => setStatus(null), 4000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FiAward className="text-primary" />
            Competency Framework
            {!isAdmin && (
              <span className="text-xs font-normal px-2 py-1 rounded-lg bg-gray-100 text-gray-600">
                View only
              </span>
            )}
          </h1>
          <p className="text-sub">
            Define role-specific competencies, required skill levels, strategic
            alignment, industry benchmarks, custom taxonomy and version history.
          </p>
        </div>

        <Banner status={status} />

        <div className="flex flex-wrap gap-2 border-b border-line pb-2">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary text-text"
                    : "text-sub hover:bg-bg border border-line"
                }`}
              >
                <Icon /> {t.label}
              </button>
            );
          })}
        </div>

        {activeTab === "frameworks" && (
          <FrameworksTab roles={roles} skills={skills} flash={flash} isAdmin={isAdmin} />
        )}
        {activeTab === "taxonomy" && (
          <TaxonomyTab skills={skills} flash={flash} isAdmin={isAdmin} />
        )}
        {activeTab === "goals" && <GoalsTab flash={flash} isAdmin={isAdmin} />}
        {activeTab === "benchmarks" && <BenchmarksTab flash={flash} isAdmin={isAdmin} />}
        {activeTab === "history" && <HistoryTab flash={flash} />}
      </div>
    </DashboardLayout>
  );
}

function FrameworksTab({ roles, skills, flash, isAdmin }) {
  const [frameworks, setFrameworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newFramework, setNewFramework] = useState({
    frameworkName: "",
    roleId: "",
    department: "",
    description: "",
    industryBenchmarkSource: "",
  });

  const loadFrameworks = async () => {
    setLoading(true);
    try {
      const data = await getFrameworks();
      setFrameworks(data);
    } catch (err) {
      flash("error", "Failed to load competency frameworks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFrameworks();
  }, []);

  const handleCreate = async () => {
    if (!newFramework.frameworkName.trim()) {
      flash("error", "Framework name is required.");
      return;
    }
    try {
      const payload = {
        ...newFramework,
        roleId: newFramework.roleId || null,
      };
      const created = await createFramework(payload);
      flash("success", "Framework created as draft.");
      toast.success("Framework created as draft.");
      setShowNewForm(false);
      setNewFramework({
        frameworkName: "",
        roleId: "",
        department: "",
        description: "",
        industryBenchmarkSource: "",
      });
      await loadFrameworks();
      setSelectedId(created.id);
    } catch (err) {
      flash("error", err.response?.data?.message || "Failed to create framework.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-panel rounded-3xl shadow-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Role-Specific Frameworks</h2>
          {isAdmin && (
            <button
              onClick={() => setShowNewForm((s) => !s)}
              className="bg-primary text-text px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-primary-dark"
            >
              <FiPlus /> New Framework
            </button>
          )}
        </div>

        {showNewForm && (
          <div className="border border-line rounded-xl p-4 space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <input
                placeholder="Framework name (e.g. Backend Engineer - L3)"
                value={newFramework.frameworkName}
                onChange={(e) =>
                  setNewFramework({ ...newFramework, frameworkName: e.target.value })
                }
                className="border rounded-xl px-4 py-2 outline-none"
              />
              <select
                value={newFramework.roleId}
                onChange={(e) => setNewFramework({ ...newFramework, roleId: e.target.value })}
                className="border rounded-xl px-4 py-2 outline-none"
              >
                <option value="">-- Link to Role (optional) --</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.roleName}
                  </option>
                ))}
              </select>
              <input
                placeholder="Department (e.g. Engineering)"
                value={newFramework.department}
                onChange={(e) =>
                  setNewFramework({ ...newFramework, department: e.target.value })
                }
                className="border rounded-xl px-4 py-2 outline-none"
              />
              <input
                placeholder="Industry benchmark source (optional)"
                value={newFramework.industryBenchmarkSource}
                onChange={(e) =>
                  setNewFramework({
                    ...newFramework,
                    industryBenchmarkSource: e.target.value,
                  })
                }
                className="border rounded-xl px-4 py-2 outline-none"
              />
            </div>
            <textarea
              placeholder="Description"
              value={newFramework.description}
              onChange={(e) =>
                setNewFramework({ ...newFramework, description: e.target.value })
              }
              className="w-full border rounded-xl px-4 py-2 outline-none"
              rows={2}
            />
            <button
              onClick={handleCreate}
              className="bg-primary text-text px-4 py-2 rounded-xl hover:bg-primary-dark"
            >
              Create Draft
            </button>
          </div>
        )}

        {loading ? (
          <p className="text-mute text-sm">Loading frameworks...</p>
        ) : frameworks.length === 0 ? (
          <p className="text-mute text-sm">No frameworks yet. Create one above.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {frameworks.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedId(f.id)}
                className={`text-left border rounded-xl px-4 py-3 transition-colors ${
                  selectedId === f.id
                    ? "border-primary bg-primary-tint"
                    : "border-line hover:bg-bg"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{f.frameworkName}</span>
                  <span className={`text-xs px-2 py-1 rounded-lg ${statusColor(f.status)}`}>
                    {f.status}
                  </span>
                </div>
                <div className="text-xs text-mute mt-1">
                  {f.roleName || "No role"} · {f.department || "No department"} · v
                  {f.versionNumber}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedId && (
        <FrameworkDetail
          frameworkId={selectedId}
          skills={skills}
          flash={flash}
          isAdmin={isAdmin}
          onChanged={loadFrameworks}
          onDeleted={() => {
            setSelectedId(null);
            loadFrameworks();
          }}
        />
      )}
    </div>
  );
}

function FrameworkDetail({ frameworkId, skills, flash, isAdmin, onChanged, onDeleted }) {
  const [framework, setFramework] = useState(null);
  const [taxonomy, setTaxonomy] = useState([]);
  const [goals, setGoals] = useState([]);
  const [newSkill, setNewSkill] = useState({ skillTaxonomyId: "", requiredLevel: "BEGINNER", weight: 1 });
  const [newGoalMapping, setNewGoalMapping] = useState({ strategicGoalId: "", alignmentWeight: 100 });

  const load = async () => {
    try {
      const data = await getFrameworkById(frameworkId);
      setFramework(data);
    } catch (err) {
      flash("error", "Failed to load framework detail.");
    }
  };

  useEffect(() => {
    load();
    (async () => {
      try {
        setTaxonomy(await getSkillTaxonomyList());
        setGoals(await getStrategicGoals());
      } catch (err) {
        // handled elsewhere
      }
    })();
  }, [frameworkId]);

  if (!framework) return <p className="text-mute text-sm">Loading...</p>;

  const isDraft = framework.status === "DRAFT";

  const handleAddSkill = async () => {
    if (!newSkill.skillTaxonomyId) {
      flash("error", "Choose a taxonomy skill first.");
      return;
    }
    try {
      const updated = await setFrameworkSkills(frameworkId, [
        ...(framework.skills || []).map((s) => ({
          skillTaxonomyId: s.skillTaxonomyId,
          requiredLevel: s.requiredLevel,
          weight: s.weight,
          notes: s.notes,
        })),
        {
          skillTaxonomyId: Number(newSkill.skillTaxonomyId),
          requiredLevel: newSkill.requiredLevel,
          weight: Number(newSkill.weight) || 1,
        },
      ]);
      setFramework(updated);
      setNewSkill({ skillTaxonomyId: "", requiredLevel: "BEGINNER", weight: 1 });
      flash("success", "Skill requirement added.");
      toast.success("Skill requirement added.");
      onChanged();
    } catch (err) {
      flash("error", err.response?.data?.message || "Failed to add skill.");
    }
  };

  const handleRemoveSkill = async (frameworkSkillId) => {
    try {
      const updated = await removeFrameworkSkill(frameworkId, frameworkSkillId);
      setFramework(updated);
      flash("success", "Skill requirement removed.");
      onChanged();
    } catch (err) {
      flash("error", "Failed to remove skill.");
    }
  };

  const handleAddGoalMapping = async () => {
    if (!newGoalMapping.strategicGoalId) {
      flash("error", "Choose a strategic goal first.");
      return;
    }
    try {
      const updated = await mapFrameworkToGoal(frameworkId, {
        strategicGoalId: Number(newGoalMapping.strategicGoalId),
        alignmentWeight: Number(newGoalMapping.alignmentWeight) || 100,
      });
      setFramework(updated);
      setNewGoalMapping({ strategicGoalId: "", alignmentWeight: 100 });
      flash("success", "Mapped to strategic goal.");
    } catch (err) {
      flash("error", err.response?.data?.message || "Failed to map goal.");
    }
  };

  const handleRemoveGoalMapping = async (strategicGoalId) => {
    try {
      const updated = await removeFrameworkGoalMapping(frameworkId, strategicGoalId);
      setFramework(updated);
    } catch (err) {
      flash("error", "Failed to remove goal mapping.");
    }
  };

  const handlePublish = async () => {
    try {
      const updated = await publishFramework(frameworkId);
      setFramework(updated);
      flash("success", "Framework published.");
      onChanged();
    } catch (err) {
      flash("error", err.response?.data?.message || "Failed to publish framework.");
    }
  };

  const handleArchive = async () => {
    try {
      const updated = await archiveFramework(frameworkId);
      setFramework(updated);
      flash("success", "Framework archived.");
      onChanged();
    } catch (err) {
      flash("error", "Failed to archive framework.");
    }
  };

  const handleDelete = async () => {
    if (!(await confirmDialog("Delete this draft framework?"))) return;
    try {
      await deleteFramework(frameworkId);
      flash("success", "Framework deleted.");
      onDeleted();
    } catch (err) {
      flash("error", err.response?.data?.message || "Failed to delete framework.");
    }
  };

  const handleCompareBenchmark = async () => {
    try {
      const compared = await compareFrameworkToBenchmark(frameworkId);
      setFramework(compared);
      flash("success", "Compared against industry benchmark data.");
    } catch (err) {
      flash("error", "Failed to compare against benchmarks.");
    }
  };

  return (
    <div className="bg-panel rounded-3xl shadow-xl p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            {framework.frameworkName}
            <span className={`text-xs px-2 py-1 rounded-lg ${statusColor(framework.status)}`}>
              {framework.status}
            </span>
          </h3>
          <p className="text-xs text-mute">
            {framework.roleName || "No role"} · {framework.department || "No department"} ·
            version {framework.versionNumber}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isAdmin && isDraft && (
            <button
              onClick={handlePublish}
              className="flex items-center gap-1 text-sm border border-line rounded-xl px-3 py-2 hover:bg-bg"
            >
              <FiSend /> Publish
            </button>
          )}
          {isAdmin && framework.status !== "ARCHIVED" && (
            <button
              onClick={handleArchive}
              className="flex items-center gap-1 text-sm border border-line rounded-xl px-3 py-2 hover:bg-bg"
            >
              <FiArchive /> Archive
            </button>
          )}
          {isAdmin && isDraft && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1 text-sm border border-red-200 text-red-600 rounded-xl px-3 py-2 hover:bg-red-50"
            >
              <FiTrash2 /> Delete
            </button>
          )}
        </div>
      </div>

      {/* Required skills (feature ii) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium">Required Skills &amp; Levels</h4>
          <button
            onClick={handleCompareBenchmark}
            className="text-xs flex items-center gap-1 text-primary hover:underline"
          >
            <FiTrendingUp /> Compare to industry benchmark
          </button>
        </div>

        <div className="space-y-2">
          {(framework.skills || []).map((s) => (
            <div
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-2 border border-line rounded-xl px-4 py-2"
            >
              <div>
                <span className="font-medium text-sm">{s.skillTaxonomyName}</span>
                {s.category && <span className="text-xs text-mute ml-2">({s.category})</span>}
                {s.benchmarkRecommendedAction && (
                  <p className="text-xs text-mute mt-1 max-w-md">
                    <span className="font-medium">To reach the industry benchmark:</span>{" "}
                    {s.benchmarkRecommendedAction}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="px-2 py-1 rounded-lg bg-primary-tint text-primary">
                  Required: {s.requiredLevel}
                </span>
                <span className="text-mute">Weight: {s.weight}</span>
                {isAdmin && isDraft && (
                  <button onClick={() => handleRemoveSkill(s.id)} className="text-red-500">
                    <FiTrash2 />
                  </button>
                )}
              </div>
            </div>
          ))}
          {(!framework.skills || framework.skills.length === 0) && (
            <p className="text-mute text-sm">No required skills defined yet.</p>
          )}
        </div>

        {isAdmin && isDraft && (
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <select
              value={newSkill.skillTaxonomyId}
              onChange={(e) => setNewSkill({ ...newSkill, skillTaxonomyId: e.target.value })}
              className="border rounded-xl px-3 py-2 text-sm outline-none"
            >
              <option value="">-- Select taxonomy skill --</option>
              {taxonomy.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <select
              value={newSkill.requiredLevel}
              onChange={(e) => setNewSkill({ ...newSkill, requiredLevel: e.target.value })}
              className="border rounded-xl px-3 py-2 text-sm outline-none"
            >
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
            <input
              type="number"
              min="0"
              step="0.5"
              value={newSkill.weight}
              onChange={(e) => setNewSkill({ ...newSkill, weight: e.target.value })}
              className="border rounded-xl px-3 py-2 text-sm w-24 outline-none"
              placeholder="Weight"
            />
            <button
              onClick={handleAddSkill}
              className="bg-primary text-text px-3 py-2 rounded-xl text-sm flex items-center gap-1 hover:bg-primary-dark"
            >
              <FiPlus /> Add
            </button>
          </div>
        )}
      </div>

      {/* Strategic goal mapping (feature iii) */}
      <div>
        <h4 className="font-medium mb-2">Strategic Goal Alignment</h4>
        <div className="space-y-2">
          {(framework.goalMappings || []).map((g) => (
            <div
              key={g.id}
              className="flex items-center justify-between border border-line rounded-xl px-4 py-2"
            >
              <span className="text-sm font-medium">{g.goalName}</span>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-mute">Alignment: {g.alignmentWeight}%</span>
                {isAdmin && (
                  <button
                    onClick={() => handleRemoveGoalMapping(g.strategicGoalId)}
                    className="text-red-500"
                  >
                    <FiTrash2 />
                  </button>
                )}
              </div>
            </div>
          ))}
          {(!framework.goalMappings || framework.goalMappings.length === 0) && (
            <p className="text-mute text-sm">Not yet mapped to any strategic goal.</p>
          )}
        </div>

        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <select
              value={newGoalMapping.strategicGoalId}
              onChange={(e) =>
                setNewGoalMapping({ ...newGoalMapping, strategicGoalId: e.target.value })
              }
              className="border rounded-xl px-3 py-2 text-sm outline-none"
            >
              <option value="">-- Select strategic goal --</option>
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.goalName}
                </option>
              ))}
            </select>
            <input
              type="number"
              min="0"
              max="100"
              value={newGoalMapping.alignmentWeight}
              onChange={(e) =>
                setNewGoalMapping({ ...newGoalMapping, alignmentWeight: e.target.value })
              }
              className="border rounded-xl px-3 py-2 text-sm w-24 outline-none"
              placeholder="% alignment"
            />
            <button
              onClick={handleAddGoalMapping}
              className="bg-primary text-text px-3 py-2 rounded-xl text-sm flex items-center gap-1 hover:bg-primary-dark"
            >
              <FiPlus /> Map Goal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function TaxonomyTab({ skills, flash, isAdmin }) {
  const [taxonomy, setTaxonomy] = useState([]);
  const [form, setForm] = useState({ name: "", category: "", parentId: "", linkedSkillIds: [], description: "" });

  const toggleLinkedSkill = (skillId) => {
    setForm((prev) => {
      const alreadySelected = prev.linkedSkillIds.includes(skillId);
      return {
        ...prev,
        linkedSkillIds: alreadySelected
          ? prev.linkedSkillIds.filter((id) => id !== skillId)
          : [...prev.linkedSkillIds, skillId],
      };
    });
  };

  const load = async () => {
    try {
      setTaxonomy(await getSkillTaxonomyList());
    } catch (err) {
      flash("error", "Failed to load skill taxonomy.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    if (!form.name.trim()) {
      flash("error", "Taxonomy name is required.");
      return;
    }
    try {
      await createSkillTaxonomy({
        name: form.name,
        category: form.category,
        description: form.description,
        parentId: form.parentId || null,
        linkedSkillIds: form.linkedSkillIds,
      });
      setForm({ name: "", category: "", parentId: "", linkedSkillIds: [], description: "" });
      flash("success", "Taxonomy node created.");
      toast.success("Taxonomy node created.");
      load();
    } catch (err) {
      flash("error", err.response?.data?.message || "Failed to create taxonomy node.");
    }
  };

  const handleDelete = async (id) => {
    if (!(await confirmDialog("Delete this taxonomy node?"))) return;
    try {
      await deleteSkillTaxonomy(id);
      flash("success", "Taxonomy node deleted.");
      load();
    } catch (err) {
      flash(
        "error",
        "Could not delete (it may still be used by a framework)."
      );
    }
  };

  return (
    <div className="bg-panel rounded-3xl shadow-xl p-6 space-y-4">
      <h2 className="text-xl font-semibold">Custom Skill Taxonomy</h2>
      <p className="text-sub text-sm">
        Organize skills into categories and hierarchies, optionally linked to the
        existing skill catalogue.
      </p>

      {isAdmin && (
        <div className="border border-line rounded-xl p-4 grid md:grid-cols-2 gap-3">
          <input
            placeholder="Taxonomy name (e.g. Cloud Security)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border rounded-xl px-4 py-2 outline-none"
          />
          <input
            placeholder="Category (e.g. Technical, Behavioral)"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="border rounded-xl px-4 py-2 outline-none"
          />
          <select
            value={form.parentId}
            onChange={(e) => setForm({ ...form, parentId: e.target.value })}
            className="border rounded-xl px-4 py-2 outline-none"
          >
            <option value="">-- No parent (top level) --</option>
            {taxonomy.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <div className="md:col-span-2 border rounded-xl px-4 py-3">
            <p className="text-xs text-mute mb-2">
              Link one or more existing skills to this category (optional)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
              {skills.map((s) => (
                <label key={s.id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.linkedSkillIds.includes(s.id)}
                    onChange={() => toggleLinkedSkill(s.id)}
                  />
                  {s.skillName}
                </label>
              ))}
              {skills.length === 0 && (
                <p className="text-mute text-xs">No skills available yet.</p>
              )}
            </div>
          </div>
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="md:col-span-2 border rounded-xl px-4 py-2 outline-none"
            rows={2}
          />
          <button
            onClick={handleCreate}
            className="bg-primary text-text px-4 py-2 rounded-xl w-fit flex items-center gap-2 hover:bg-primary-dark"
          >
            <FiPlus /> Add Taxonomy Node
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-3">
        {taxonomy.map((t) => (
          <div key={t.id} className="border border-line rounded-xl px-4 py-3 flex items-start justify-between">
            <div>
              <p className="font-medium text-sm">{t.name}</p>
              <p className="text-xs text-mute">
                {t.category || "Uncategorized"}
                {t.parentName ? ` · under ${t.parentName}` : ""}
                {t.linkedSkillNames?.length ? ` · skills: ${t.linkedSkillNames.join(", ")}` : ""}
              </p>
            </div>
            {isAdmin && (
              <button onClick={() => handleDelete(t.id)} className="text-red-500">
                <FiTrash2 />
              </button>
            )}
          </div>
        ))}
        {taxonomy.length === 0 && (
          <p className="text-mute text-sm">No taxonomy nodes yet.</p>
        )}
      </div>
    </div>
  );
}

function GoalsTab({ flash, isAdmin }) {
  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState({ goalName: "", description: "", targetYear: "", priority: "MEDIUM" });

  const load = async () => {
    try {
      setGoals(await getStrategicGoals());
    } catch (err) {
      flash("error", "Failed to load strategic goals.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    if (!form.goalName.trim()) {
      flash("error", "Goal name is required.");
      return;
    }
    try {
      await createStrategicGoal({
        ...form,
        targetYear: form.targetYear ? Number(form.targetYear) : null,
      });
      setForm({ goalName: "", description: "", targetYear: "", priority: "MEDIUM" });
      flash("success", "Strategic goal created.");
      toast.success("Strategic goal created.");
      load();
    } catch (err) {
      flash("error", err.response?.data?.message || "Failed to create strategic goal.");
    }
  };

  const handleDelete = async (id) => {
    if (!(await confirmDialog("Delete this strategic goal?"))) return;
    try {
      await deleteStrategicGoal(id);
      flash("success", "Strategic goal deleted.");
      load();
    } catch (err) {
      flash("error", "Could not delete (it may be mapped to a framework).");
    }
  };

  const priorityColor = (p) =>
    p === "CRITICAL"
      ? "bg-red-100 text-red-700"
      : p === "HIGH"
      ? "bg-orange-100 text-orange-700"
      : p === "MEDIUM"
      ? "bg-blue-100 text-blue-700"
      : "bg-gray-100 text-gray-600";

  return (
    <div className="bg-panel rounded-3xl shadow-xl p-6 space-y-4">
      <h2 className="text-xl font-semibold">Strategic Goals</h2>
      <p className="text-sub text-sm">
        Organizational objectives that competency frameworks can be mapped to.
      </p>

      {isAdmin && (
        <div className="border border-line rounded-xl p-4 grid md:grid-cols-2 gap-3">
          <input
            placeholder="Goal name (e.g. Cloud Migration 2027)"
            value={form.goalName}
            onChange={(e) => setForm({ ...form, goalName: e.target.value })}
            className="border rounded-xl px-4 py-2 outline-none"
          />
          <input
            type="number"
            placeholder="Target year"
            value={form.targetYear}
            onChange={(e) => setForm({ ...form, targetYear: e.target.value })}
            className="border rounded-xl px-4 py-2 outline-none"
          />
          <select
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
            className="border rounded-xl px-4 py-2 outline-none"
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="md:col-span-2 border rounded-xl px-4 py-2 outline-none"
            rows={2}
          />
          <button
            onClick={handleCreate}
            className="bg-primary text-text px-4 py-2 rounded-xl w-fit flex items-center gap-2 hover:bg-primary-dark"
          >
            <FiPlus /> Add Strategic Goal
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-3">
        {goals.map((g) => (
          <div key={g.id} className="border border-line rounded-xl px-4 py-3 flex items-start justify-between">
            <div>
              <p className="font-medium text-sm flex items-center gap-2">
                {g.goalName}
                <span className={`text-xs px-2 py-0.5 rounded-lg ${priorityColor(g.priority)}`}>
                  {g.priority}
                </span>
              </p>
              <p className="text-xs text-mute">{g.targetYear ? `Target: ${g.targetYear}` : "No target year"}</p>
            </div>
            {isAdmin && (
              <button onClick={() => handleDelete(g.id)} className="text-red-500">
                <FiTrash2 />
              </button>
            )}
          </div>
        ))}
        {goals.length === 0 && <p className="text-mute text-sm">No strategic goals yet.</p>}
      </div>
    </div>
  );
}

function BenchmarksTab({ flash, isAdmin }) {
  const [benchmarks, setBenchmarks] = useState([]);
  const [taxonomy, setTaxonomy] = useState([]);
  const [form, setForm] = useState({
    skillTaxonomyId: "",
    industrySector: "",
    roleCategory: "",
    recommendedAction: "",
    source: "",
    referenceDate: "",
    notes: "",
  });

  const load = async () => {
    const [benchmarksResult, taxonomyResult] = await Promise.allSettled([
      getIndustryBenchmarks(),
      getSkillTaxonomyList(),
    ]);

    if (benchmarksResult.status === "fulfilled") {
      setBenchmarks(benchmarksResult.value);
    } else {
      flash("error", "Failed to load industry benchmarks.");
    }

    if (taxonomyResult.status === "fulfilled") {
      setTaxonomy(taxonomyResult.value);
    } else {
      flash("error", "Failed to load skill taxonomy.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    if (!form.skillTaxonomyId) {
      flash("error", "Choose a taxonomy skill first.");
      return;
    }
    if (!form.recommendedAction.trim()) {
      flash("error", "Describe what the employee should do to reach this benchmark.");
      return;
    }
    try {
      await createIndustryBenchmark({
        ...form,
        skillTaxonomyId: Number(form.skillTaxonomyId),
        referenceDate: form.referenceDate || null,
      });
      setForm({
        skillTaxonomyId: "",
        industrySector: "",
        roleCategory: "",
        recommendedAction: "",
        source: "",
        referenceDate: "",
        notes: "",
      });
      flash("success", "Industry benchmark added.");
      toast.success("Industry benchmark added.");
      load();
    } catch (err) {
      const fieldErrors = err.response?.data?.errors;
      const firstFieldError = fieldErrors && Object.values(fieldErrors)[0];
      flash(
        "error",
        firstFieldError || err.response?.data?.message || "Failed to add benchmark."
      );
    }
  };

  const handleDelete = async (id) => {
    if (!(await confirmDialog("Delete this benchmark?"))) return;
    try {
      await deleteIndustryBenchmark(id);
      flash("success", "Benchmark deleted.");
      load();
    } catch (err) {
      flash("error", "Failed to delete benchmark.");
    }
  };

  return (
    <div className="bg-panel rounded-3xl shadow-xl p-6 space-y-4">
      <h2 className="text-xl font-semibold">Industry Benchmark Integration</h2>
      <p className="text-sub text-sm">
        Reference external market data per skill so frameworks can be compared
        against industry expectations.
      </p>

      {isAdmin && (
        <div className="border border-line rounded-xl p-4 grid md:grid-cols-2 gap-3">
          <select
            value={form.skillTaxonomyId}
            onChange={(e) => setForm({ ...form, skillTaxonomyId: e.target.value })}
            className="border rounded-xl px-4 py-2 outline-none"
          >
            <option value="">-- Select taxonomy skill --</option>
            {taxonomy.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <input
            placeholder="Industry sector (e.g. Fintech)"
            value={form.industrySector}
            onChange={(e) => setForm({ ...form, industrySector: e.target.value })}
            maxLength={255}
            className="border rounded-xl px-4 py-2 outline-none"
          />
          <input
            placeholder="Role category (e.g. Software Engineer)"
            value={form.roleCategory}
            onChange={(e) => setForm({ ...form, roleCategory: e.target.value })}
            maxLength={255}
            className="border rounded-xl px-4 py-2 outline-none"
          />
          <input
            placeholder="Source (e.g. SHRM 2026 Report)"
            value={form.source}
            onChange={(e) => setForm({ ...form, source: e.target.value })}
            maxLength={255}
            className="border rounded-xl px-4 py-2 outline-none"
          />
          <input
            type="date"
            value={form.referenceDate}
            onChange={(e) => setForm({ ...form, referenceDate: e.target.value })}
            className="border rounded-xl px-4 py-2 outline-none"
          />
          <textarea
            placeholder="What should the employee do to reach this benchmark? (e.g. complete an advanced certification, lead 2 cross-functional projects, pair with a senior mentor for 3 months)"
            value={form.recommendedAction}
            onChange={(e) => setForm({ ...form, recommendedAction: e.target.value })}
            rows={3}
            maxLength={1000}
            className="border rounded-xl px-4 py-2 outline-none md:col-span-2"
          />
          <button
            onClick={handleCreate}
            className="bg-primary text-text px-4 py-2 rounded-xl w-fit flex items-center gap-2 hover:bg-primary-dark"
          >
            <FiPlus /> Add Benchmark
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-3">
        {benchmarks.map((b) => (
          <div key={b.id} className="border border-line rounded-xl px-4 py-3 flex items-start justify-between">
            <div>
              <p className="font-medium text-sm">{b.skillTaxonomyName}</p>
              <p className="text-xs text-mute">
                {b.industrySector || "Any sector"} · {b.roleCategory || "Any role"}
              </p>
              <p className="text-sm mt-2">
                <span className="font-medium text-xs text-mute block mb-0.5">To reach this benchmark:</span>
                {b.recommendedAction}
              </p>
              {b.source && <p className="text-xs text-mute mt-2">Source: {b.source}</p>}
            </div>
            {isAdmin && (
              <button onClick={() => handleDelete(b.id)} className="text-red-500">
                <FiTrash2 />
              </button>
            )}
          </div>
        ))}
        {benchmarks.length === 0 && (
          <p className="text-mute text-sm">No industry benchmarks yet.</p>
        )}
      </div>
    </div>
  );
}

const ACTIVITY_ENTITY_LABEL = {
  FRAMEWORK: "Framework",
  TAXONOMY: "Skill Taxonomy",
  STRATEGIC_GOAL: "Strategic Goal",
  INDUSTRY_BENCHMARK: "Industry Benchmark",
};

const ACTIVITY_ACTION_COLOR = {
  CREATED: "bg-green-100 text-green-700",
  UPDATED: "bg-blue-100 text-blue-700",
  DELETED: "bg-red-100 text-red-700",
  PUBLISHED: "bg-purple-100 text-purple-700",
  ARCHIVED: "bg-gray-100 text-gray-600",
  SKILL_ADDED: "bg-green-100 text-green-700",
  SKILL_REMOVED: "bg-red-100 text-red-700",
  SKILLS_UPDATED: "bg-blue-100 text-blue-700",
  GOAL_MAPPED: "bg-green-100 text-green-700",
  GOAL_UNMAPPED: "bg-red-100 text-red-700",
};

function HistoryTab({ flash }) {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const list = await getCompetencyActivityHistory();
      setActivity(list);
    } catch (err) {
      flash("error", "Failed to load activity history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="bg-panel rounded-3xl shadow-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">History</h2>
          <p className="text-sub text-sm">
            Every change made across Frameworks, Skill Taxonomy, Strategic Goals, and
            Industry Benchmarks, oldest first.
          </p>
        </div>
        <button
          onClick={load}
          className="text-xs border border-line rounded-xl px-3 py-2 hover:bg-bg"
        >
          Refresh
        </button>
      </div>

      {loading && <p className="text-mute text-sm">Loading activity...</p>}

      {!loading && activity.length === 0 && (
        <p className="text-mute text-sm">No activity recorded yet.</p>
      )}

      {!loading && activity.length > 0 && (
        <div className="space-y-2">
          {activity.map((entry) => (
            <div
              key={entry.id}
              className="border border-line rounded-xl px-4 py-3 flex flex-wrap items-start justify-between gap-2"
            >
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-xs px-2 py-1 rounded-lg ${
                      ACTIVITY_ACTION_COLOR[entry.action] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {entry.action?.replace(/_/g, " ")}
                  </span>
                  <span className="text-xs text-mute">
                    {ACTIVITY_ENTITY_LABEL[entry.entityType] || entry.entityType}
                  </span>
                </div>
                <p className="text-sm mt-1">{entry.description || entry.entityName}</p>
              </div>
              <div className="text-xs text-mute text-right">
                <p>{entry.performedBy || "system"}</p>
                <p>{entry.createdAt ? new Date(entry.createdAt).toLocaleString() : ""}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}