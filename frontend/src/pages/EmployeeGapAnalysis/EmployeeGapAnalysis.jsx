import { useEffect, useState } from "react";
import {
  FiUsers,
  FiCpu,
  FiAlertCircle,
  FiBarChart2,
  FiCheckCircle,
} from "react-icons/fi";
import {
  getGapAnalysis,
  getMyGapAnalysis,
} from "../../services/GapAnalysisService";
export default function EmployeeGapAnalysis() {

  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const [gapData, setGapData] = useState([]);

  useEffect(() => {
    loadGapAnalysis();
  }, []);

  const loadGapAnalysis = async () => {

    try {

      setLoading(true);
      setError("");
      setMessage("");

      // Dummy Data (Replace with Backend API later)
      const response = await getMyGapAnalysis();
setGapData([response.data]);

    } catch (err) {

      console.error(err);

      setGapData([]);

      setError("Unable to load Gap Analysis.");

    } finally {

      setLoading(false);

    }

  };

  const currentGap =
    gapData.length > 0 ? gapData[0] : null;

  const matchedSkills =
    currentGap?.matchedSkills || [];

  const missingSkills =
    currentGap?.missingSkills || [];

  const gapPercentage =
    currentGap?.gapPercentage || 0;

  const matchedSkillCount =
    currentGap?.matchedSkillCount || 0;

  const missingSkillCount =
    currentGap?.missingSkillCount || 0;

  const totalRequiredSkills =
    currentGap?.totalRequiredSkills || 0;

  const employeeName =
    currentGap?.employeeName || "";

  const roleName =
    currentGap?.roleName || "";
    return (

    <div className="space-y-8">

      {/* Header */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white shadow-lg">

        <div>

          <h1 className="text-4xl font-bold">
            My Gap Analysis
          </h1>

          <p className="mt-2 text-blue-100 text-lg">
            View your skill gaps and track your learning progress.
          </p>

        </div>

      </div>

      {/* Dashboard Cards */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        {/* My Skills */}

        <div className="rounded-3xl bg-white p-6 shadow-lg">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm uppercase text-gray-500">
                My Skills
              </p>

              <h2 className="mt-2 text-4xl font-bold text-green-600">
                {matchedSkillCount}
              </h2>

            </div>

            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">

              <FiCheckCircle className="text-3xl text-green-600" />

            </div>

          </div>

        </div>

        {/* Required Skills */}

        <div className="rounded-3xl bg-white p-6 shadow-lg">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm uppercase text-gray-500">
                Required Skills
              </p>

              <h2 className="mt-2 text-4xl font-bold text-blue-600">
                {totalRequiredSkills}
              </h2>

            </div>

            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">

              <FiCpu className="text-3xl text-blue-600" />

            </div>

          </div>

        </div>

        {/* Missing Skills */}

        <div className="rounded-3xl bg-white p-6 shadow-lg">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm uppercase text-gray-500">
                Missing Skills
              </p>

              <h2 className="mt-2 text-4xl font-bold text-orange-600">
                {missingSkillCount}
              </h2>

            </div>

            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">

              <FiAlertCircle className="text-3xl text-orange-600" />

            </div>

          </div>

        </div>

        {/* Gap Percentage */}

        <div className="rounded-3xl bg-white p-6 shadow-lg">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm uppercase text-gray-500">
                Gap %
              </p>

              <h2 className="mt-2 text-4xl font-bold text-red-600">
                {gapPercentage.toFixed(1)}%
              </h2>

            </div>

            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">

              <FiBarChart2 className="text-3xl text-red-600" />

            </div>

          </div>

        </div>

      </div>
      {/* Employee Information */}

<div className="rounded-3xl bg-white p-6 shadow-lg">

  <div className="flex items-center justify-between">

    <div>

      <h2 className="text-2xl font-bold text-slate-800">
        My Profile
      </h2>

      <p className="mt-2 text-slate-600">
        Employee : <span className="font-semibold">{employeeName}</span>
      </p>

      <p className="mt-1 text-slate-600">
        Role : <span className="font-semibold">{roleName}</span>
      </p>

    </div>

    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">

      <FiUsers className="text-3xl text-blue-600" />

    </div>

  </div>

</div>

{/* Overall Skill Gap */}

<div className="rounded-3xl bg-white p-6 shadow-lg">

  <div className="mb-6">

    <h2 className="text-2xl font-bold text-slate-800">
      Overall Skill Gap
    </h2>

    <p className="mt-1 text-sm text-slate-500">
      Track your current skill gap based on your assigned role.
    </p>

  </div>

  <div className="w-full rounded-full bg-slate-200 h-5 overflow-hidden">

    <div
      className="h-5 rounded-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-500"
      style={{
        width: `${gapPercentage}%`,
      }}
    />

  </div>

  <div className="mt-4 flex justify-between text-sm font-semibold">

    <span className="text-green-600">
      Matched Skills : {matchedSkillCount}
    </span>

    <span className="text-red-600">
      Gap : {gapPercentage.toFixed(1)}%
    </span>

  </div>

  <div className="mt-2 flex justify-between text-sm text-slate-500">

    <span>
      Required Skills : {totalRequiredSkills}
    </span>

    <span>
      Missing Skills : {missingSkillCount}
    </span>

  </div>

</div>
{/* Matched Skills */}

<div className="rounded-3xl bg-white shadow-lg p-6">

  <h2 className="mb-5 text-xl font-bold text-slate-800">
    My Skills
  </h2>

  {!currentGap ? (

    <p className="text-slate-400">
      Your gap analysis will appear here.
    </p>

  ) : matchedSkills.length === 0 ? (

    <p className="text-slate-400">
      You don't have any matched skills yet.
    </p>

  ) : (

    <div className="flex flex-wrap gap-3">

      {matchedSkills.map((skill) => (

        <span
          key={skill.id}
          className="rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700"
        >
          {skill.skillName}
        </span>

      ))}

    </div>

  )}

</div>
{message && (
  <div className="rounded-2xl border border-green-300 bg-green-50 p-4 text-green-700 shadow-sm">

    <div className="flex items-center gap-2">

      <FiCheckCircle className="text-xl" />

      <span className="font-medium">
        {message}
      </span>

    </div>

  </div>
)}

{/* Error Message */}

{error && (
  <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-red-700 shadow-sm">

    <div className="flex items-center gap-2">

      <FiAlertCircle className="text-xl" />

      <span className="font-medium">
        {error}
      </span>

    </div>

  </div>
)}

{/* Gap Analysis Details */}

<div className="overflow-hidden rounded-3xl bg-white shadow-lg">

  <div className="border-b p-6">

    <h2 className="text-2xl font-bold text-slate-800">
      My Gap Analysis Details
    </h2>

    <p className="mt-2 text-slate-500">
      Compare your current skills with the skills required for your role.
    </p>

  </div>

  <div className="overflow-x-auto">

    <table className="min-w-full">

      <thead className="bg-slate-100">

        <tr>

          <th className="px-6 py-4 text-left text-sm font-semibold uppercase">
            Skill
          </th>

          <th className="px-6 py-4 text-left text-sm font-semibold uppercase">
            My Skill
          </th>

          <th className="px-6 py-4 text-left text-sm font-semibold uppercase">
            Required
          </th>

          <th className="px-6 py-4 text-left text-sm font-semibold uppercase">
            Status
          </th>

        </tr>

      </thead>

      <tbody>

        {!currentGap ? (

          <tr>

            <td
              colSpan={4}
              className="py-12 text-center text-slate-400"
            >
              Your gap analysis will appear here.
            </td>

          </tr>

        ) : (

          <>

            {/* Matched Skills */}

            {matchedSkills.map((skill) => (

              <tr
                key={`matched-${skill.id}`}
                className="border-b hover:bg-slate-50"
              >

                <td className="px-6 py-4 font-semibold">
                  {skill.skillName}
                </td>

                <td className="px-6 py-4 text-green-600">
                  ✔
                </td>

                <td className="px-6 py-4">
                  ✔
                </td>

                <td className="px-6 py-4">

                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                    Matched
                  </span>

                </td>

              </tr>

            ))}

            {/* Missing Skills */}

            {missingSkills.map((skill) => (

              <tr
                key={`missing-${skill.id}`}
                className="border-b hover:bg-slate-50"
              >

                <td className="px-6 py-4 font-semibold">
                  {skill.skillName}
                </td>

                <td className="px-6 py-4 text-red-600">
                  ✘
                </td>

                <td className="px-6 py-4">
                  ✔
                </td>

                <td className="px-6 py-4">

                  <span className="rounded-full bg-red-100 px-3 py-1 text-sm text-red-700">
                    Missing
                  </span>

                </td>

              </tr>

            ))}

          </>

        )}

      </tbody>

    </table>

  </div>

</div>

</div>

);

}