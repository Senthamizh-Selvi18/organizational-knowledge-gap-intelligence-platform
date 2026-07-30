import {
  FiUser,
  FiMail,
  FiBriefcase,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";

export default function TeamRecommendationCard({ employee }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition">

      <div className="flex justify-between items-start">

        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FiUser />
            {employee.name}
          </h2>

          <p className="text-gray-500">
            {employee.employeeCode}
          </p>
        </div>

        <div className="bg-green-100 text-green-700 px-3 py-2 rounded-full font-bold">
          {employee.matchPercentage.toFixed(1)}%
        </div>

      </div>

      <div className="mt-5 space-y-2">

        <div className="flex items-center gap-2">
          <FiMail />
          {employee.email}
        </div>

        <div className="flex items-center gap-2">
          <FiBriefcase />
          {employee.designation}
        </div>

        <div>
          <strong>Department:</strong> {employee.department}
        </div>

      </div>

      <div className="mt-5">

        <h3 className="font-semibold text-green-700 flex items-center gap-2">
          <FiCheckCircle />
          Matched Skills
        </h3>

        <div className="flex flex-wrap gap-2 mt-2">

          {employee.matchedSkills?.map(skill => (
            <span
              key={skill.id}
              className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
            >
              {skill.skillName}
            </span>
          ))}

        </div>

      </div>

      <div className="mt-5">

        <h3 className="font-semibold text-red-700 flex items-center gap-2">
          <FiXCircle />
          Missing Skills
        </h3>

        <div className="flex flex-wrap gap-2 mt-2">

          {employee.missingSkills?.map(skill => (
            <span
              key={skill.id}
              className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm"
            >
              {skill.skillName}
            </span>
          ))}

        </div>

      </div>

    </div>
  );
}