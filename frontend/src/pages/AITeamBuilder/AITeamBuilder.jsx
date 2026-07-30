import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  FiUsers,
  FiTarget,
  FiAward,
  FiSearch,
  FiX,
} from "react-icons/fi";

import TeamRecommendationCard from "../../components/TeamRecommendationCard";

import {
  getAllSkills,
  recommendTeam,
} from "../../services/aiTeamBuilderService";

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="bg-panel rounded-3xl shadow-xl p-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sub text-sm">{title}</p>
          <h2 className="text-3xl font-bold mt-2">{value}</h2>
        </div>

        <div className={`p-4 rounded-2xl ${color}`}>
          <Icon className="text-white text-2xl" />
        </div>
      </div>
    </div>
  );
}

export default function AITeamBuilder() {

  const [skills, setSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);

  const [searchSkill, setSearchSkill] = useState("");

  const [department, setDepartment] = useState("");

  const [minProficiencyLevel, setMinProficiencyLevel] = useState(3);

  const [topN, setTopN] = useState(5);

  const [recommendations, setRecommendations] = useState([]);

  const [loading, setLoading] = useState(false);

  const [loadingSkills, setLoadingSkills] = useState(true);

  const [error, setError] = useState("");
    // Load Skills
  const loadSkills = async () => {
    setLoadingSkills(true);

    try {
      const data = await getAllSkills();
      setSkills(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load skills.");
    } finally {
      setLoadingSkills(false);
    }
  };

  useEffect(() => {
    loadSkills();
  }, []);

  // Add Skill
  const addSkill = (skill) => {
    const exists = selectedSkills.find((s) => s.id === skill.id);

    if (!exists) {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  // Remove Skill
  const removeSkill = (id) => {
    setSelectedSkills(
      selectedSkills.filter((skill) => skill.id !== id)
    );
  };

  // Search Filter
  const filteredSkills = skills.filter((skill) =>
    skill.skillName
      .toLowerCase()
      .includes(searchSkill.toLowerCase())
  );

  // Generate Team
  const handleGenerateTeam = async () => {
    if (selectedSkills.length === 0) {
      setError("Please select at least one skill.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const request = {
        requiredSkillIds: selectedSkills.map((skill) => skill.id),
        minProficiencyLevel,
        department,
        topN,
      };

      const response = await recommendTeam(request);

      // Highest Match First
      response.sort(
        (a, b) => b.matchPercentage - a.matchPercentage
      );

      setRecommendations(response);

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        "Failed to generate team recommendations."
      );

    } finally {
      setLoading(false);
    }
  };
  return (
  <DashboardLayout>
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          AI Team Builder
        </h1>

        <p className="text-sub mt-2">
          Build the best project team using AI-powered skill matching.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid md:grid-cols-3 gap-5">

        <StatCard
          title="Selected Skills"
          value={selectedSkills.length}
          icon={FiAward}
          color="bg-blue-600"
        />

        <StatCard
          title="Minimum Level"
          value={minProficiencyLevel}
          icon={FiTarget}
          color="bg-green-600"
        />

        <StatCard
          title="Recommended Employees"
          value={recommendations.length}
          icon={FiUsers}
          color="bg-purple-600"
        />

      </div>

      {/* Team Requirement Form */}

      <div className="bg-panel rounded-3xl shadow-xl p-6">

        <h2 className="text-2xl font-semibold mb-6">
          Team Requirements
        </h2>

        {/* Search Skills */}

        <label className="font-medium">
          Search Skills
        </label>

        <div className="relative mt-2 mb-5">

          <FiSearch
            className="absolute left-4 top-4 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search skills..."
            value={searchSkill}
            onChange={(e) => setSearchSkill(e.target.value)}
            className="w-full border rounded-xl pl-12 pr-4 py-3"
          />

        </div>

        {/* Selected Skills */}

        <label className="font-medium">
          Selected Skills
        </label>

        <div className="flex flex-wrap gap-3 mt-3 mb-6">

          {selectedSkills.length === 0 ? (

            <p className="text-gray-500">
              No skills selected.
            </p>

          ) : (

            selectedSkills.map((skill) => (

              <div
                key={skill.id}
                className="bg-primary text-white px-4 py-2 rounded-full flex items-center gap-2"
              >

                {skill.skillName}

                <button
                  onClick={() => removeSkill(skill.id)}
                >
                  <FiX />
                </button>

              </div>

            ))

          )}

        </div>

        {/* Available Skills */}

        <label className="font-medium">
          Available Skills
        </label>

        <div className="grid md:grid-cols-4 gap-3 mt-3 max-h-64 overflow-y-auto">

          {loadingSkills ? (

            <p>Loading Skills...</p>

          ) : (

            filteredSkills.map((skill) => (

              <button
                key={skill.id}
                onClick={() => addSkill(skill)}
                className="border rounded-xl p-3 hover:bg-primary hover:text-white transition"
              >
                {skill.skillName}
              </button>

            ))

          )}

        </div>

        {/* Filters */}

        <div className="grid md:grid-cols-3 gap-5 mt-8">

          <div>

            <label className="font-medium">
              Department
            </label>

            <input
              type="text"
              placeholder="IT"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full border rounded-xl p-3 mt-2"
            />

          </div>

          <div>

            <label className="font-medium">
              Minimum Level
            </label>

            <select
              value={minProficiencyLevel}
              onChange={(e) =>
                setMinProficiencyLevel(Number(e.target.value))
              }
              className="w-full border rounded-xl p-3 mt-2"
            >

              <option value={1}>Level 1</option>
              <option value={2}>Level 2</option>
              <option value={3}>Level 3</option>
              <option value={4}>Level 4</option>
              <option value={5}>Level 5</option>

            </select>

          </div>

          <div>

            <label className="font-medium">
              Top Employees
            </label>

            <input
              type="number"
              min="1"
              max="20"
              value={topN}
              onChange={(e) =>
                setTopN(Number(e.target.value))
              }
              className="w-full border rounded-xl p-3 mt-2"
            />

          </div>

        </div>
                {/* Action Buttons */}

        <div className="flex gap-4 mt-8">

          <button
            type="button"
            onClick={() => {
              setSelectedSkills([]);
              setDepartment("");
              setMinProficiencyLevel(3);
              setTopN(5);
              setRecommendations([]);
              setSearchSkill("");
              setError("");
            }}
            className="border border-gray-300 px-6 py-3 rounded-xl hover:bg-gray-100 transition"
          >
            Clear
          </button>

          <button
            type="button"
            onClick={handleGenerateTeam}
            disabled={loading}
            className="bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary-dark disabled:opacity-50 transition"
          >
            {loading ? "Generating Team..." : "Generate Team"}
          </button>

        </div>

        {/* Error Message */}

        {error && (

          <div className="mt-6 bg-red-50 border border-red-300 text-red-700 rounded-xl p-4">
            {error}
          </div>

        )}

      </div>

      {/* Empty State */}

      {!loading && recommendations.length === 0 && (

        <div className="bg-panel rounded-3xl shadow-xl p-12 text-center">

          <FiUsers className="mx-auto text-6xl text-gray-400 mb-5" />

          <h2 className="text-2xl font-bold">
            No Team Recommendations Yet
          </h2>

          <p className="text-sub mt-3">
            Select the required skills and click
            <strong> Generate Team</strong>
            to let AI recommend the best employees.
          </p>

        </div>

      )}

      {/* Recommendation Cards */}

      {recommendations.length > 0 && (

        <div className="space-y-6">

          <div className="flex items-center justify-between">

            <h2 className="text-2xl font-bold">
              Recommended Team Members
            </h2>

            <div className="bg-primary text-white px-4 py-2 rounded-full">
              {recommendations.length} Employees
            </div>

          </div>

          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">

            {recommendations.map((employee) => (

              <TeamRecommendationCard
                key={employee.employeeId}
                employee={employee}
              />

            ))}

          </div>

        </div>

      )}

    </div>
  </DashboardLayout>
);
}