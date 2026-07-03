import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiBriefcase,
  FiUsers,
  FiEdit,
  FiLock,
} from "react-icons/fi";
import DashboardLayout from "../../components/layout/DashboardLayout";

const profile = {
  name: "Sneha",
  email: "sneha@company.com",
  employeeId: "EMP1025",
  department: "Software Development",
  designation: "Java Full Stack Developer",
  role: "Employee",
  phone: "+91 9876543210",
  location: "Bengaluru, India",
  joiningDate: "15 Jan 2025",
  experience: "2 Years",
  manager: "Anitha Sharma",
};

const skills = [
  { name: "Java", level: 90 },
  { name: "Spring Boot", level: 85 },
  { name: "React.js", level: 80 },
  { name: "PostgreSQL", level: 78 },
  { name: "JavaScript", level: 88 },
];

const competencies = [
  { name: "Leadership", level: "Intermediate" },
  { name: "Communication", level: "Advanced" },
  { name: "Problem Solving", level: "Advanced" },
  { name: "Team Collaboration", level: "Expert" },
];

const activities = [
  "Completed React Advanced Training",
  "Updated Employee Profile",
  "Completed Spring Boot Assessment",
  "Added PostgreSQL Skill",
];

export default function Profile() {
  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}

        <div className="rounded-3xl bg-white/70 backdrop-blur-xl shadow-xl p-8 border border-white">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between">

            <div className="flex items-center gap-6">

              <img
                src="https://ui-avatars.com/api/?name=Sneha&background=2563eb&color=fff&size=128"
                className="w-28 h-28 rounded-full shadow-lg"
                alt="profile"
              />

              <div>

                <h1 className="text-3xl font-bold text-slate-800">
                  {profile.name}
                </h1>

                <p className="text-slate-500">
                  {profile.designation}
                </p>

                <div className="mt-3 flex flex-wrap gap-3">

                  <span className="px-4 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">
                    {profile.department}
                  </span>

                  <span className="px-4 py-1 rounded-full bg-green-100 text-green-700 text-sm">
                    {profile.role}
                  </span>

                </div>

              </div>

            </div>

            <div className="flex gap-4 mt-6 md:mt-0">

              <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700 transition">
                <FiEdit />
                Edit Profile
              </button>

              <button className="flex items-center gap-2 border border-slate-300 px-5 py-3 rounded-xl hover:bg-slate-100 transition">
                <FiLock />
                Change Password
              </button>

            </div>

          </div>

        </div>

        {/* Profile Information */}

        <div className="grid lg:grid-cols-2 gap-6">

          <div className="bg-white rounded-3xl shadow-xl p-6">

            <h2 className="text-xl font-bold mb-6">
              Profile Information
            </h2>

            <div className="space-y-5">

              <Info icon={<FiMail />} title="Email" value={profile.email} />

              <Info icon={<FiPhone />} title="Phone" value={profile.phone} />

              <Info icon={<FiMapPin />} title="Location" value={profile.location} />

              <Info
                icon={<FiCalendar />}
                title="Joining Date"
                value={profile.joiningDate}
              />

              <Info
                icon={<FiBriefcase />}
                title="Experience"
                value={profile.experience}
              />

              <Info
                icon={<FiUsers />}
                title="Reporting Manager"
                value={profile.manager}
              />

            </div>

          </div>
                    {/* Skills */}

          <div className="bg-white rounded-3xl shadow-xl p-6">

            <h2 className="text-xl font-bold mb-6">
              Skills
            </h2>

            <div className="space-y-5">

              {skills.map((skill) => (
                <div key={skill.name}>

                  <div className="flex justify-between mb-2">

                    <span className="font-medium text-slate-700">
                      {skill.name}
                    </span>

                    <span className="text-blue-600 font-semibold">
                      {skill.level}%
                    </span>

                  </div>

                  <div className="w-full h-3 rounded-full bg-slate-200">

                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-sky-500"
                      style={{ width: `${skill.level}%` }}
                    />

                  </div>

                </div>
              ))}

            </div>

          </div>

        </div>

        {/* Competencies & Recent Activity */}

        <div className="grid lg:grid-cols-2 gap-6">

          {/* Competencies */}

          <div className="bg-white rounded-3xl shadow-xl p-6">

            <h2 className="text-xl font-bold mb-6">
              Competencies
            </h2>

            <div className="space-y-4">

              {competencies.map((item) => (

                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-xl bg-slate-100 px-4 py-3"
                >

                  <span className="font-medium">
                    {item.name}
                  </span>

                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                    {item.level}
                  </span>

                </div>

              ))}

            </div>

          </div>

          {/* Recent Activity */}

          <div className="bg-white rounded-3xl shadow-xl p-6">

            <h2 className="text-xl font-bold mb-6">
              Recent Activity
            </h2>

            <ul className="space-y-4">

              {activities.map((activity, index) => (

                <li
                  key={index}
                  className="flex items-center gap-3 rounded-xl bg-slate-100 px-4 py-3"
                >

                  <div className="w-3 h-3 rounded-full bg-blue-600"></div>

                  <span className="text-slate-700">
                    {activity}
                  </span>

                </li>

              ))}

            </ul>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}

function Info({ icon, title, value }) {
  return (
    <div className="flex items-start gap-4">

      <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
        {icon}
      </div>

      <div>

        <p className="text-sm text-slate-500">
          {title}
        </p>

        <p className="font-semibold text-slate-800">
          {value}
        </p>

      </div>

    </div>
  );
}