import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getRoles } from "../../services/roleService";
import { getSkills } from "../../services/skillService";
import { getRoleSkills, assignSkillsToRole, updateRoleSkills } from "../../services/roleSkillService";
import { FiShield, FiSave, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

export default function RoleSkillMapping() {
  const role = localStorage.getItem("role");

  if (role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  const [roles, setRoles] = useState([]);
  const [skills, setSkills] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [selectedSkillIds, setSelectedSkillIds] = useState([]);
  const [hasExistingMapping, setHasExistingMapping] = useState(false);
  const [loadingMapping, setLoadingMapping] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null); 

  useEffect(() => {
    (async () => {
      try {
        const [rolesRes, skillsRes] = await Promise.all([
          getRoles(),
          getSkills(),
        ]);
        setRoles(rolesRes.data);
        setSkills(skillsRes.data);
      } catch (err) {
        console.error(err);
        setStatus({
          type: "error",
          message: "Could not load roles/skills. Please refresh.",
        });
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedRoleId) {
      setSelectedSkillIds([]);
      setHasExistingMapping(false);
      return;
    }

    (async () => {
      setLoadingMapping(true);
      setStatus(null);
      try {
        const res = await getRoleSkills(selectedRoleId);
        const mappedIds = res.data.skills.map((s) => s.id);
        setSelectedSkillIds(mappedIds);
        setHasExistingMapping(mappedIds.length > 0);
      } catch (err) {
        setSelectedSkillIds([]);
        setHasExistingMapping(false);
      } finally {
        setLoadingMapping(false);
      }
    })();
  }, [selectedRoleId]);

  const toggleSkill = (skillId) => {
    setSelectedSkillIds((prev) =>
      prev.includes(skillId)
        ? prev.filter((id) => id !== skillId)
        : [...prev, skillId]
    );
  };

  const handleSave = async () => {
    if (!selectedRoleId) {
      setStatus({ type: "error", message: "Please select a role first." });
      return;
    }
    if (selectedSkillIds.length === 0) {
      setStatus({
        type: "error",
        message: "Please select at least one skill.",
      });
      return;
    }

    setSaving(true);
    setStatus(null);
    try {
      if (hasExistingMapping) {
        await updateRoleSkills(selectedRoleId, selectedSkillIds);
      } else {
        await assignSkillsToRole(selectedRoleId, selectedSkillIds);
      }
      setHasExistingMapping(true);
      setStatus({ type: "success", message: "Role skills saved successfully." });
    } catch (err) {
      setStatus({
        type: "error",
        message:
          err.response?.data?.message || "Failed to save role skills.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FiShield className="text-primary" />
            Role Skill Mapping
          </h1>
          <p className="text-sub">
            Define the required skills for each role in the organization.
          </p>
        </div>

        <div className="bg-panel rounded-3xl shadow-xl p-6 space-y-6">
          {/* Role dropdown */}
          <div>
            <label className="block text-sm font-medium text-sub mb-2">
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

          {/* Multi-select skills */}
          {selectedRoleId && (
            <div>
              <label className="block text-sm font-medium text-sub mb-2">
                Required Skills
              </label>

              {loadingMapping ? (
                <p className="text-mute text-sm">Loading current mapping...</p>
              ) : skills.length === 0 ? (
                <p className="text-mute text-sm">
                  No skills available yet. Ask an admin to add skills first.
                </p>
              ) : (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {skills.map((skill) => {
                    const checked = selectedSkillIds.includes(skill.id);
                    return (
                      <label
                        key={skill.id}
                        className={`flex items-center gap-2 border rounded-xl px-4 py-3 cursor-pointer transition-colors ${
                          checked
                            ? "border-primary bg-primary-tint"
                            : "border-line hover:bg-bg"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleSkill(skill.id)}
                          className="accent-blue-600"
                        />
                        <span className="text-sm font-medium">
                          {skill.skillName}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Status message */}
          {status && (
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
          )}

          {/* Save button */}
          {selectedRoleId && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary text-text px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-primary-dark disabled:opacity-60"
            >
              <FiSave />
              {saving
                ? "Saving..."
                : hasExistingMapping
                ? "Update Mapping"
                : "Save Mapping"}
            </button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
