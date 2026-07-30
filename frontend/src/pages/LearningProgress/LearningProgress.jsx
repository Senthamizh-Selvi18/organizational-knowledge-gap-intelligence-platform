import { useEffect, useState } from "react";
import { FiBookOpen, FiCalendar, FiClock, FiCheckCircle } from "react-icons/fi";
import {
  getEmployeeLearning,
  completeTraining,
} from "../../services/learningService";
import DashboardLayout from "../../components/layout/DashboardLayout";

const LearningProgress = () => {
  const [courses, setCourses] = useState([]);

  const employeeId = Number(localStorage.getItem("employeeId"));

  useEffect(() => {
    if (employeeId) {
      loadCourses();
    }
  }, [employeeId]);

  const loadCourses = async () => {
    try {
      const response = await getEmployeeLearning(employeeId);

      console.log("Learning Progress Response:", response.data);

      setCourses(response.data);
    } catch (error) {
      console.error(error);
    }
  };
  const handleComplete = async (enrollmentId) => {
  try {
    await completeTraining(enrollmentId);

    // Reload the latest data
    loadCourses();

  } catch (error) {
    console.error(error);
  }
};

  return (
    <DashboardLayout>
      <div className="p-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            📚 My Learning
          </h1>

          <p className="text-gray-500 mt-2">
            View all your enrolled trainings and monitor your learning journey.
          </p>
        </div>

        {courses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-10 text-center">

            <FiBookOpen
              className="mx-auto text-indigo-500 mb-4"
              size={55}
            />

            <h2 className="text-2xl font-semibold mb-2">
              No Enrolled Trainings
            </h2>

            <p className="text-gray-500">
              Enroll in an Internal Training to start your learning journey.
            </p>

          </div>
        ) : (

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {courses.map((course) => (

              <div
                key={course.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition duration-300 border border-gray-100"
              >

                {/* Card Header */}
                <div className="bg-indigo-600 rounded-t-2xl p-5 text-white">

                  <h2 className="text-xl font-bold">
                    {course.trainingTitle}
                  </h2>

                  <p className="text-indigo-100 mt-1">
                    Trainer : {course.trainer}
                  </p>

                </div>

                {/* Card Body */}

                <div className="p-6 space-y-5">

                  <div className="flex items-center gap-3">

                    <FiClock className="text-indigo-600" />

                    <span>
                      <strong>Duration :</strong> {course.duration}
                    </span>

                  </div>

                  <div className="flex items-center gap-3">

                    <FiCalendar className="text-indigo-600" />

                    <span>
                      <strong>Enrolled :</strong>{" "}
                      {course.enrolledDate || "-"}
                    </span>

                  </div>

                  <div className="flex items-center gap-3">

                    <FiCheckCircle className="text-indigo-600" />

                    <span>
                      <strong>Completed :</strong>{" "}
                      {course.completedDate || "-"}
                    </span>

                  </div>

                  {/* Status */}

                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Status</h3>

                    {course.status === "COMPLETED" && (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                        ✅ Completed
                        </span>
                    )}

                    {course.status === "IN_PROGRESS" && (
                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
                        ⏳ In Progress
                        </span>
                    )}

                    {course.status === "ENROLLED" && (
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                        📘 Enrolled
                        </span>
                    )}
                    </div>

                  {/* Progress */}

                  <div>

                    <div className="flex justify-between mb-2">

                      <span className="font-medium">
                        Progress
                      </span>

                      <span className="font-semibold text-indigo-600">
                        {course.progress}%
                      </span>

                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-3">

                      <div
                        className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
                        style={{
                          width: `${course.progress}%`,
                        }}
                      />

                    </div>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>
    </DashboardLayout>
  );
};

export default LearningProgress;