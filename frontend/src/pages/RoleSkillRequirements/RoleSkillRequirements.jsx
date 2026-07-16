import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getRoles } from "../../services/roleService";
import { getSkills } from "../../services/skillService";
import {
  getRequirementsByRole,
  upsertRequirement,
  deleteRequirement,
} from "../../services/roleSkillRequirementService";
import { toast } from "../../components/ui/Toast.jsx";
import { FiSave, FiTrash2 } from "react-icons/fi";

const LEVEL_OPTIONS = [1, 2, 3, 4, 5];

export default function RoleSkillRequirements() {
  const role = localStorage.getItem("role")?.toLowerCase();

  if (role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  const [roles, setRoles] = useState([]);
  const [skills, setSkills] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [requirements, setRequirements] = useState([]);
  const [pendingLevels, setPendingLevels] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState({});

  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [rolesRes, skillsRes] = await Promise.all([
          getRoles(),
          getSkills(),
        ]);
        setRoles(rolesRes.data);
        setSkills(skillsRes.data);
      } catch (err) {
        console.error(err);
        toast.error("Unable to load roles or skills");
      }
    };

    loadDropdownData();
  }, []);

  const loadRequirements = async (roleId) => {
    if (!roleId) {
      setRequirements([]);
      return;
    }

    setLoading(true);
    try {
      const res = await getRequirementsByRole(roleId);
      setRequirements(res.data);

      const levelMap = {};
      res.data.forEach((req) => {
        levelMap[req.skillId] = req.requiredProficiencyLevel;
      });
      setPendingLevels(levelMap);
    } catch (err) {
      console.error(err);
      toast.error("Unable to load required skill levels for this role");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequirements(selectedRoleId);
  }, [selectedRoleId]);

  const findRequirement = (skillId) =>
    requirements.find((req) => req.skillId === skillId);

  const handleLevelChange = (skillId, level) => {
    setPendingLevels((prev) => ({ ...prev, [skillId]: level }));
  };

  const handleSave = async (skillId) => {
    const level = pendingLevels[skillId];
    if (!level) {
      toast.warning("Pick a required level first");
      return;
    }

    setSaving((prev) => ({ ...prev, [skillId]: true }));
    try {
      await upsertRequirement(Number(selectedRoleId), skillId, Number(level));
      toast.success("Required level saved");
      await loadRequirements(selectedRoleId);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save required level");
    } finally {
      setSaving((prev) => ({ ...prev, [skillId]: false }));
    }
  };

  const handleRemove = async (skillId) => {
    const existing = findRequirement(skillId);
    if (!existing) return;

    setSaving((prev) => ({ ...prev, [skillId]: true }));
    try {
      await deleteRequirement(existing.id);
      toast.success("Required level removed");
      setPendingLevels((prev) => {
        const next = { ...prev };
        delete next[skillId];
        return next;
      });
      await loadRequirements(selectedRoleId);
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove required level");
    } finally {
      setSaving((prev) => ({ ...prev, [skillId]: false }));
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">

        <div>
          <h1 className="text-3xl font-bold">
            Required Skill Levels
          </h1>
          <p className="text-sub">
            Set the required proficiency level per skill for each role. This
            drives the Risk badges (Low / Medium / High) on the Gap Analysis
            page. Saving a level here also adds the skill to the role's
            required-skills list automatically.
          </p>
        </div>

        <div className="bg-panel rounded-3xl shadow-xl p-6">
          <label className="block text-sm font-semibold text-sub mb-2">
            Select Role
          </label>

          <select
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value)}
            className="w-full md:w-96 border rounded-xl px-4 py-3 outline-none"
          >
            <option value="">-- Choose a role --</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.roleName}
              </option>
            ))}
          </select>
        </div>

        {selectedRoleId && (
          <div className="bg-panel rounded-3xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-bg">
                  <tr>
                    <th className="p-4 text-left">Skill</th>
                    <th className="p-4 text-left">Required Level (1-5)</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-mute">
                        Loading...
                      </td>
                    </tr>
                  )}

                  {!loading && skills.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-mute">
                        No skills exist yet. Add skills first.
                      </td>
                    </tr>
                  )}

                  {!loading &&
                    skills.map((skill) => {
                      const existing = findRequirement(skill.id);
                      const currentLevel = pendingLevels[skill.id] ?? "";
                      const isSaving = saving[skill.id];

                      return (
                        <tr key={skill.id} className="border-b hover:bg-bg">
                          <td className="p-4 font-semibold">
                            {skill.skillName}
                          </td>

                          <td className="p-4">
                            <select
                              value={currentLevel}
                              onChange={(e) =>
                                handleLevelChange(skill.id, e.target.value)
                              }
                              className="border rounded-lg px-3 py-2 outline-none"
                            >
                              <option value="">-- none --</option>
                              {LEVEL_OPTIONS.map((lvl) => (
                                <option key={lvl} value={lvl}>
                                  {lvl}
                                </option>
                              ))}
                            </select>
                          </td>

                          <td className="p-4">
                            {existing ? (
                              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                                Required (level {existing.requiredProficiencyLevel})
                              </span>
                            ) : (
                              <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm">
                                Not required
                              </span>
                            )}
                          </td>

                          <td className="p-4">
                            <div className="flex justify-center gap-4">
                              <button
                                disabled={isSaving}
                                onClick={() => handleSave(skill.id)}
                                className="text-primary hover:text-primary-dark disabled:opacity-50"
                                title="Save required level"
                              >
                                <FiSave />
                              </button>

                              {existing && (
                                <button
                                  disabled={isSaving}
                                  onClick={() => handleRemove(skill.id)}
                                  className="text-rust hover:text-rust disabled:opacity-50"
                                  title="Remove requirement"
                                >
                                  <FiTrash2 />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}