import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
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
  createNewFrameworkVersion,
  getFrameworkVersionHistory,
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
} from "../../services/competencyFrameworkService";
import {
  FiAward,
  FiPlus,
  FiTrash2,
  FiCheckCircle,
  FiAlertCircle,
  FiGitBranch,
  FiTarget,
  FiTrendingUp,
  FiLayers,
  FiSend,
  FiArchive,
  FiClock,
  FiX,
} from "react-icons/fi";

const LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const TABS = [
  { key: "frameworks", label: "Frameworks", icon: FiAward },
  { key: "taxonomy", label: "Skill Taxonomy", icon: FiLayers },
  { key: "goals", label: "Strategic Goals", icon: FiTarget },
  { key: "benchmarks", label: "Industry Benchmarks", icon: FiTrendingUp },
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
  const role = localStorage.getItem("role");
  if (role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

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
          <FrameworksTab roles={roles} skills={skills} flash={flash} />
        )}
        {activeTab === "taxonomy" && <TaxonomyTab skills={skills} flash={flash} />}
        {activeTab === "goals" && <GoalsTab flash={flash} />}
        {activeTab === "benchmarks" && <BenchmarksTab flash={flash} />}
      </div>
    </DashboardLayout>
  );
}

function FrameworksTab({ roles, skills, flash }) {
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
          <button
            onClick={() => setShowNewForm((s) => !s)}
            className="bg-primary text-text px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-primary-dark"
          >
            <FiPlus /> New Framework
          </button>
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
          onChanged={loadFrameworks}
          onDeleted={() => {
            setSelectedId(null);
            loadFrameworks();
          }}
          onVersioned={(newId) => setSelectedId(newId)}
        />
      )}
    </div>
  );
}

function FrameworkDetail({ frameworkId, skills, flash, onChanged, onDeleted, onVersioned }) {
  const [framework, setFramework] = useState(null);
  const [taxonomy, setTaxonomy] = useState([]);
  const [goals, setGoals] = useState([]);
  const [newSkill, setNewSkill] = useState({ skillTaxonomyId: "", requiredLevel: "BEGINNER", weight: 1 });
  const [newGoalMapping, setNewGoalMapping] = useState({ strategicGoalId: "", alignmentWeight: 100 });
  const [history, setHistory] = useState(null);

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
    setHistory(null);
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
    if (!window.confirm("Delete this draft framework?")) return;
    try {
      await deleteFramework(frameworkId);
      flash("success", "Framework deleted.");
      onDeleted();
    } catch (err) {
      flash("error", err.response?.data?.message || "Failed to delete framework.");
    }
  };

  const handleNewVersion = async () => {
    try {
      const created = await createNewFrameworkVersion(frameworkId);
      flash("success", `Created version ${created.versionNumber}.`);
      onChanged();
      onVersioned(created.id);
    } catch (err) {
      flash("error", "Failed to create new version.");
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

  const handleShowHistory = async () => {
    try {
      const list = await getFrameworkVersionHistory(framework.versionGroupId);
      setHistory(list);
    } catch (err) {
      flash("error", "Failed to load version history.");
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
          {isDraft && (
            <button
              onClick={handlePublish}
              className="flex items-center gap-1 text-sm border border-line rounded-xl px-3 py-2 hover:bg-bg"
            >
              <FiSend /> Publish
            </button>
          )}
          {framework.status !== "ARCHIVED" && (
            <button
              onClick={handleArchive}
              className="flex items-center gap-1 text-sm border border-line rounded-xl px-3 py-2 hover:bg-bg"
            >
              <FiArchive /> Archive
            </button>
          )}
          <button
            onClick={handleNewVersion}
            className="flex items-center gap-1 text-sm border border-line rounded-xl px-3 py-2 hover:bg-bg"
          >
            <FiGitBranch /> New Version
          </button>
          <button
            onClick={handleShowHistory}
            className="flex items-center gap-1 text-sm border border-line rounded-xl px-3 py-2 hover:bg-bg"
          >
            <FiClock /> History
          </button>
          {isDraft && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1 text-sm border border-red-200 text-red-600 rounded-xl px-3 py-2 hover:bg-red-50"
            >
              <FiTrash2 /> Delete
            </button>
          )}
        </div>
      </div>

      {history && (
        <div className="border border-line rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Version History</h4>
            <button onClick={() => setHistory(null)} className="text-mute">
              <FiX />
            </button>
          </div>
          {history.map((v) => (
            <div key={v.id} className="text-xs text-sub flex items-center justify-between border-b border-line/50 py-1">
              <span>
                v{v.versionNumber} · {v.status} {v.isCurrentVersion ? "(current)" : ""}
              </span>
              <span className="text-mute">{v.createdBy}</span>
            </div>
          ))}
        </div>
      )}

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
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="px-2 py-1 rounded-lg bg-primary-tint text-primary">
                  Required: {s.requiredLevel}
                </span>
                <span className="text-mute">Weight: {s.weight}</span>
                {s.benchmarkLevel && (
                  <span
                    className={`px-2 py-1 rounded-lg ${
                      s.gapVsBenchmark > 0
                        ? "bg-green-100 text-green-700"
                        : s.gapVsBenchmark < 0
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    Benchmark: {s.benchmarkLevel} (gap {s.gapVsBenchmark})
                  </span>
                )}
                {isDraft && (
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

        {isDraft && (
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
                <button
                  onClick={() => handleRemoveGoalMapping(g.strategicGoalId)}
                  className="text-red-500"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
          {(!framework.goalMappings || framework.goalMappings.length === 0) && (
            <p className="text-mute text-sm">Not yet mapped to any strategic goal.</p>
          )}
        </div>

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
      </div>
    </div>
  );
}

function TaxonomyTab({ skills, flash }) {
  const [taxonomy, setTaxonomy] = useState([]);
  const [form, setForm] = useState({ name: "", category: "", parentId: "", linkedSkillId: "", description: "" });

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
        linkedSkillId: form.linkedSkillId || null,
      });
      setForm({ name: "", category: "", parentId: "", linkedSkillId: "", description: "" });
      flash("success", "Taxonomy node created.");
      load();
    } catch (err) {
      flash("error", err.response?.data?.message || "Failed to create taxonomy node.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this taxonomy node?")) return;
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
        <select
          value={form.linkedSkillId}
          onChange={(e) => setForm({ ...form, linkedSkillId: e.target.value })}
          className="border rounded-xl px-4 py-2 outline-none"
        >
          <option value="">-- Link existing skill (optional) --</option>
          {skills.map((s) => (
            <option key={s.id} value={s.id}>
              {s.skillName}
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
          <FiPlus /> Add Taxonomy Node
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {taxonomy.map((t) => (
          <div key={t.id} className="border border-line rounded-xl px-4 py-3 flex items-start justify-between">
            <div>
              <p className="font-medium text-sm">{t.name}</p>
              <p className="text-xs text-mute">
                {t.category || "Uncategorized"}
                {t.parentName ? ` · under ${t.parentName}` : ""}
                {t.linkedSkillName ? ` · linked to ${t.linkedSkillName}` : ""}
              </p>
            </div>
            <button onClick={() => handleDelete(t.id)} className="text-red-500">
              <FiTrash2 />
            </button>
          </div>
        ))}
        {taxonomy.length === 0 && (
          <p className="text-mute text-sm">No taxonomy nodes yet.</p>
        )}
      </div>
    </div>
  );
}

function GoalsTab({ flash }) {
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
      load();
    } catch (err) {
      flash("error", err.response?.data?.message || "Failed to create strategic goal.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this strategic goal?")) return;
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
            <button onClick={() => handleDelete(g.id)} className="text-red-500">
              <FiTrash2 />
            </button>
          </div>
        ))}
        {goals.length === 0 && <p className="text-mute text-sm">No strategic goals yet.</p>}
      </div>
    </div>
  );
}

function BenchmarksTab({ flash }) {
  const [benchmarks, setBenchmarks] = useState([]);
  const [taxonomy, setTaxonomy] = useState([]);
  const [form, setForm] = useState({
    skillTaxonomyId: "",
    industrySector: "",
    roleCategory: "",
    benchmarkLevel: "INTERMEDIATE",
    source: "",
    referenceDate: "",
    notes: "",
  });

  const load = async () => {
    try {
      const [b, t] = await Promise.all([getIndustryBenchmarks(), getSkillTaxonomyList()]);
      setBenchmarks(b);
      setTaxonomy(t);
    } catch (err) {
      flash("error", "Failed to load industry benchmarks.");
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
        benchmarkLevel: "INTERMEDIATE",
        source: "",
        referenceDate: "",
        notes: "",
      });
      flash("success", "Industry benchmark added.");
      load();
    } catch (err) {
      flash("error", err.response?.data?.message || "Failed to add benchmark.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this benchmark?")) return;
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
        <select
          value={form.benchmarkLevel}
          onChange={(e) => setForm({ ...form, benchmarkLevel: e.target.value })}
          className="border rounded-xl px-4 py-2 outline-none"
        >
          {LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        <input
          placeholder="Industry sector (e.g. Fintech)"
          value={form.industrySector}
          onChange={(e) => setForm({ ...form, industrySector: e.target.value })}
          className="border rounded-xl px-4 py-2 outline-none"
        />
        <input
          placeholder="Role category (e.g. Software Engineer)"
          value={form.roleCategory}
          onChange={(e) => setForm({ ...form, roleCategory: e.target.value })}
          className="border rounded-xl px-4 py-2 outline-none"
        />
        <input
          placeholder="Source (e.g. SHRM 2026 Report)"
          value={form.source}
          onChange={(e) => setForm({ ...form, source: e.target.value })}
          className="border rounded-xl px-4 py-2 outline-none"
        />
        <input
          type="date"
          value={form.referenceDate}
          onChange={(e) => setForm({ ...form, referenceDate: e.target.value })}
          className="border rounded-xl px-4 py-2 outline-none"
        />
        <button
          onClick={handleCreate}
          className="bg-primary text-text px-4 py-2 rounded-xl w-fit flex items-center gap-2 hover:bg-primary-dark"
        >
          <FiPlus /> Add Benchmark
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {benchmarks.map((b) => (
          <div key={b.id} className="border border-line rounded-xl px-4 py-3 flex items-start justify-between">
            <div>
              <p className="font-medium text-sm">{b.skillTaxonomyName}</p>
              <p className="text-xs text-mute">
                {b.industrySector || "Any sector"} · {b.roleCategory || "Any role"} · {b.benchmarkLevel}
              </p>
              {b.source && <p className="text-xs text-mute">Source: {b.source}</p>}
            </div>
            <button onClick={() => handleDelete(b.id)} className="text-red-500">
              <FiTrash2 />
            </button>
          </div>
        ))}
        {benchmarks.length === 0 && (
          <p className="text-mute text-sm">No industry benchmarks yet.</p>
        )}
      </div>
    </div>
  );
}
