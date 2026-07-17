import { useEffect, useState } from "react";
import axios from "axios";
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
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { changePassword } from "../../services/profileService";
import { getEmployeeSkills } from "../../services/EmployeeSkillService";
import { getEmployeeCompetencies } from "../../services/competencyService";
import { getRecentActivities } from "../../services/activityService";
import { toast } from "../../components/ui/Toast.jsx";


const initialProfile = {
  userId: "",
  employeeId: "",
  employeeCode: "",
  name: "",
  email: "",
  role: "",
  department: "",
  designation: "",
  phoneNumber: "",
  location: "",
  joiningDate: "",
  experience: "",
  manager: "",
  createdAt: "",
};

export default function Profile() {
          const [profile, setProfile] = useState(initialProfile);
          const [skills, setSkills] = useState([]);
          const [competencies, setCompetencies] = useState([]);
          const [activities, setActivities] = useState([]);
          const [isEditing, setIsEditing] = useState(false);
          const [showPasswordModal, setShowPasswordModal] = useState(false);
          const [showCurrentPassword, setShowCurrentPassword] = useState(false);
          const [showNewPassword, setShowNewPassword] = useState(false);
          const [showConfirmPassword, setShowConfirmPassword] = useState(false);
          const userId = localStorage.getItem("userId");
          const [passwordData, setPasswordData] = useState({
              currentPassword: "",
              newPassword: "",
              confirmPassword: ""
          });
        useEffect(() => {
            fetchProfile();
        }, []);

        useEffect(() => {
            if (profile.employeeId) {
                fetchSkills();
                fetchCompetencies();
                fetchActivities();
            }
        }, [profile.employeeId]);

       const fetchSkills = async () => {
    try {
        const response = await getEmployeeSkills(profile.employeeId);
        setSkills(response.data);
    } catch (error) {
        console.error(error);
    }
};

        const fetchCompetencies = async () => {
            try {
                const data = await getEmployeeCompetencies(profile.employeeId);
                setCompetencies(data);
            } catch (error) {
                console.error(error);
            }
        };

        const fetchActivities = async () => {
            try {
                const data = await getRecentActivities(profile.employeeId);
                setActivities(data);
            } catch (error) {
                console.error(error);
            }
        };

        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await axios.get(
                    `http://localhost:8080/api/profile/${userId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setProfile(response.data);

            } catch (error) {
                console.error(error);
            }
        };

        const updateProfile = async () => {
          try {
            const token = localStorage.getItem("token");

            // Sanitize payload: convert empty strings to null,
            // and make sure experience is a number (or null) not a string.
            // This prevents 400 Bad Request errors caused by Spring
            // failing to bind "" to Integer/LocalDate fields.
            const payload = {
              ...profile,
              phoneNumber: profile.phoneNumber?.trim() === "" ? null : profile.phoneNumber,
              location: profile.location?.trim() === "" ? null : profile.location,
              department: profile.department?.trim() === "" ? null : profile.department,
              designation: profile.designation?.trim() === "" ? null : profile.designation,
              manager: profile.manager?.trim() === "" ? null : profile.manager,
              joiningDate: profile.joiningDate?.trim() === "" ? null : profile.joiningDate,
              experience:
                profile.experience === "" ||
                profile.experience === null ||
                profile.experience === undefined
                  ? null
                  : Number(profile.experience),
            };

            await axios.put(
              `http://localhost:8080/api/profile/${userId}`,
              payload,
              {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            );

            toast.success("Profile updated successfully!");

            setIsEditing(false);

            fetchProfile();
            fetchActivities();

          } catch (error) {
            console.error(error);
            console.error("Backend response:", error.response?.data);
            toast.error(
              error.response?.data?.message ||
              "Failed to update profile."
            );
          }
        };

             const handleChangePassword = async () => {

    if (
        !passwordData.currentPassword ||
        !passwordData.newPassword ||
        !passwordData.confirmPassword
    ) {
        toast.warning("Please fill all the fields.");
        return;
    }

    if (
        passwordData.newPassword !==
        passwordData.confirmPassword
    ) {
        toast.warning("New Password and Confirm Password must match.");
        return;
    }

    try {

        await changePassword(
            userId,
            passwordData
        );

        toast.success("Password changed successfully.");

        setPasswordData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
        });

        setShowPasswordModal(false);

    } catch (error) {

        toast.error(
            error.response?.data?.message ||
            "Failed to change password."
        );

    }
};
  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}

        <div className="rounded-3xl bg-panel/70 backdrop-blur-xl shadow-xl p-8 border border-white">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between">

            <div className="flex items-center gap-6">

            <img
            src={`https://ui-avatars.com/api/?name=${profile.name}&background=2563eb&color=fff&size=128`}
            className="w-28 h-28 rounded-full shadow-lg"
            alt="profile"
          />

              <div>

                {isEditing ? (
                <input
                  type="text"
                  className="text-3xl font-bold border rounded-lg px-3 py-2 w-full"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      name: e.target.value,
                    })
                  }
                />
              ) : (
                <h1 className="text-3xl font-bold text-text">
                  {profile.name}
                </h1>
              )}

               {isEditing ? (
                <input
                  type="text"
                  className="border rounded-lg px-3 py-2 w-full mt-2"
                  placeholder="Enter Designation"
                  value={profile.designation}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      designation: e.target.value,
                    })
                  }
                />
              ) : (
                <p className="text-sub">
                  {profile.designation}
                </p>
              )}

                  <div className="mt-3 flex flex-wrap gap-3">

                    {isEditing ? (
                    <input
                      type="text"
                      className="border rounded-lg px-3 py-2"
                      placeholder="Enter Department"
                      value={profile.department}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          department: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <span className="px-4 py-1 rounded-full bg-primary-tint text-primary-dark text-sm">
                      {profile.department}
                    </span>
                  )}

                  <span className="px-4 py-1 rounded-full bg-green-100 text-green-700 text-sm">
                    {profile.role}
                  </span>

                </div>

              </div>

            </div>

            <div className="flex gap-4 mt-6 md:mt-0">

              <button
                onClick={() => {
                  if (isEditing) {
                    updateProfile();
                  } else {
                    setIsEditing(true);
                  }
                }}
                className="flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-xl shadow-md shadow-primary/30 hover:bg-primary-dark transition"
              >
                <FiEdit />
                {isEditing ? "Save Profile" : "Edit Profile"}
              </button>

              <button
              onClick={() => setShowPasswordModal(true)}
              className="flex items-center gap-2 border border-line text-text px-5 py-3 rounded-xl hover:bg-bg transition"
              >
              <FiLock />
              Change Password
          </button>

            </div>

          </div>

        </div>

        {/* Profile Information */}

<div className="grid lg:grid-cols-2 gap-6">

  <div className="bg-panel rounded-3xl shadow-xl p-6">

    <h2 className="text-xl font-bold mb-6">
      Profile Information
    </h2>

    <div className="space-y-5">

      <Info
        icon={<FiMail />}
        title="Email"
        value={profile.email}
      />

      <div className="flex items-start gap-4">

  <div className="p-3 rounded-xl bg-primary-tint text-primary">
    <FiPhone />
  </div>

  <div className="flex-1">

    <p className="text-sm text-sub">
      Phone
    </p>

    {isEditing ? (
      <input
        type="text"
        className="w-full mt-1 border rounded-lg px-3 py-2"
        value={profile.phoneNumber}
        onChange={(e) =>
          setProfile({
            ...profile,
            phoneNumber: e.target.value,
          })
        }
      />
    ) : (
      <p className="font-semibold text-text">
        {profile.phoneNumber}
      </p>
    )}

  </div>

</div>

      <div className="flex items-start gap-4">

  <div className="p-3 rounded-xl bg-primary-tint text-primary">
    <FiMapPin />
  </div>

  <div className="flex-1">

    <p className="text-sm text-sub">
      Location
    </p>

    {isEditing ? (
      <input
        type="text"
        className="w-full mt-1 border rounded-lg px-3 py-2"
        value={profile.location}
        onChange={(e) =>
          setProfile({
            ...profile,
            location: e.target.value,
          })
        }
      />
    ) : (
      <p className="font-semibold text-text">
        {profile.location}
      </p>
    )}

  </div>

</div>

      <Info
        icon={<FiCalendar />}
        title="Joining Date"
        value={profile.joiningDate}
      />

      <div className="flex items-start gap-4">

  <div className="p-3 rounded-xl bg-primary-tint text-primary">
    <FiBriefcase />
  </div>

  <div className="flex-1">

    <p className="text-sm text-sub">
      Experience
    </p>

    {isEditing ? (
      <input
        type="number"
        className="w-full mt-1 border rounded-lg px-3 py-2"
        value={profile.experience}
        onChange={(e) =>
          setProfile({
            ...profile,
            experience: e.target.value,
          })
        }
      />
    ) : (
      <p className="font-semibold text-text">
        {profile.experience}
      </p>
    )}

  </div>

</div>

      <div className="flex items-start gap-4">

  <div className="p-3 rounded-xl bg-primary-tint text-primary">
    <FiUsers />
  </div>

  <div className="flex-1">

    <p className="text-sm text-sub">
      Reporting Manager
    </p>

    {isEditing ? (
      <input
        type="text"
        className="w-full mt-1 border rounded-lg px-3 py-2"
        value={profile.manager}
        onChange={(e) =>
          setProfile({
            ...profile,
            manager: e.target.value,
          })
        }
      />
    ) : (
      <p className="font-semibold text-text">
        {profile.manager}
      </p>
    )}

  </div>

</div>

    </div>

  </div>
                    {/* Skills */}

          <div className="bg-panel rounded-3xl shadow-xl p-6">

            <h2 className="text-xl font-bold mb-6">
              Skills
            </h2>

            <div className="space-y-5">

              {skills.length === 0 ? (
                <p className="text-sub text-sm">No skills added yet.</p>
              ) : (
                skills.map((skill) => (
                  <div key={skill.skillId}>

                    <div className="flex justify-between mb-2">

                      <span className="font-medium text-text">
                        {skill.skillName}
                      </span>

                      <span className="text-primary font-semibold">
                        {skill.proficiencyLevel != null ? `${skill.proficiencyLevel}%` : "N/A"}
                      </span>

                    </div>

                    <div className="w-full h-3 rounded-full bg-line">

                      <div
                        className="h-3 rounded-full bg-gradient-to-r from-primary to-sky-500"
                        style={{ width: `${skill.proficiencyLevel ?? 0}%` }}
                      />

                    </div>

                  </div>
                ))
              )}

            </div>

          </div>

        </div>

        {/* Competencies & Recent Activity */}

        <div className="grid lg:grid-cols-2 gap-6">

          {/* Competencies */}

          <div className="bg-panel rounded-3xl shadow-xl p-6">

            <h2 className="text-xl font-bold mb-6">
              Competencies
            </h2>

            <div className="space-y-4">

              {competencies.length === 0 ? (
                <p className="text-sub text-sm">No competencies recorded yet.</p>
              ) : (
                competencies.map((item) => (

                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl bg-bg px-4 py-3"
                  >

                    <span className="font-medium">
                      {item.skillName}
                    </span>

                    <span className="rounded-full bg-primary-tint px-3 py-1 text-sm font-semibold text-primary-dark">
                      {item.level}
                    </span>

                  </div>

                ))
              )}

            </div>

          </div>

          {/* Recent Activity */}

          <div className="bg-panel rounded-3xl shadow-xl p-6">

            <h2 className="text-xl font-bold mb-6">
              Recent Activity
            </h2>

            <ul className="space-y-4">

              {activities.length === 0 ? (
                <li className="text-sub text-sm">No recent activity.</li>
              ) : (
                activities.map((activity) => (

                  <li
                    key={activity.id}
                    className="flex items-center gap-3 rounded-xl bg-bg px-4 py-3"
                  >

                    <div className="w-3 h-3 rounded-full bg-primary"></div>

                    <span className="text-text">
                      {activity.description}
                    </span>

                  </li>

                ))
              )}

            </ul>

          </div>

        </div>

      </div>
       {showPasswordModal && (

              <div className="fixed inset-0 bg-black/40 flex justify-center items-center">

              <div className="bg-panel rounded-xl p-6 w-96">

              <h2 className="text-xl font-bold mb-5">
              Change Password
              </h2>

              <div className="relative mb-3">
              <input
                type={showCurrentPassword ? "text" : "password"}
                placeholder="Current Password"
                className="w-full border rounded-lg p-3 pr-10"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value,
                  })
                }
              />

              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

                          <div className="relative mb-3">
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="New Password"
                className="w-full border rounded-lg p-3 pr-10"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
              />

              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

                          <div className="relative mb-5">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                className="w-full border rounded-lg p-3 pr-10"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
              />

              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
              <div className="flex justify-end gap-3">

              <button
              onClick={()=>setShowPasswordModal(false)}
              className="px-4 py-2 rounded-lg border"
              >
              Cancel
              </button>

              <button
              onClick={handleChangePassword}
              className="px-4 py-2 rounded-lg bg-primary text-white"
              >
              Update
              </button>

              </div>

              </div>

              </div>

              )}
    </DashboardLayout>
  );
}

function Info({ icon, title, value }) {
  return (
    <div className="flex items-start gap-4">

      <div className="p-3 rounded-xl bg-primary-tint text-primary">
        {icon}
      </div>

      <div>

        <p className="text-sm text-sub">
          {title}
        </p>

        <p className="font-semibold text-text">
          {value}
        </p>

      </div>

    </div>
  );
}