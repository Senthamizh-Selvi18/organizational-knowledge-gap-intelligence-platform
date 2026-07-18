import DashboardLayout from "../../components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import { getRecommendation } from "../../services/recommendationService";
export default function Recommendation() {

  const [recommendations,setRecommendations] = useState([]);
const [roadmap,setRoadmap] = useState([]);
const [externalCourses,setExternalCourses] = useState([]);
const [loading,setLoading] = useState(true);
const [error,setError] = useState(null);
const [notOnboarded,setNotOnboarded] = useState(false);

const difficultyBadgeClass = (difficulty) => {

    if (difficulty === "Beginner") {
        return "bg-green-50 text-green-700";
    }

    if (difficulty === "Intermediate") {
        return "bg-amber-50 text-amber-700";
    }

    if (difficulty === "Advanced") {
        return "bg-red-50 text-red-600";
    }

    return "bg-primary-tint text-text";

};

useEffect(()=>{

    const employeeId = localStorage.getItem("userId");

    setLoading(true);
    setError(null);
    setNotOnboarded(false);

    getRecommendation(employeeId)
    .then((data)=>{

        setRecommendations(
            data.recommendations || []
        );

        setRoadmap(
            data.roadmap || []
        );

        setExternalCourses(
            data.externalCourses || []
        );

    })
    .catch((error)=>{

        console.log(error);

        const backendMessage = error.response?.data?.message || "";

        if (backendMessage.includes("Employee not found")) {

            setNotOnboarded(true);

        } else {

            setError("Unable to load recommendations. Please try again later.");

        }

    })
    .finally(()=>{

        setLoading(false);

    });


},[]);

  const hasAnyCourses = externalCourses.some(
      (group) => (group.recommendedCourses || []).length > 0
  );

  return (
    <DashboardLayout>

      <div className="space-y-6">

        <div>
          <h1 className="text-3xl font-bold text-text">
            AI Recommendation
          </h1>

          <p className="text-sub mt-2">
            Personalized learning recommendations based on skill gaps
          </p>
        </div>

        {notOnboarded && (
          <div className="bg-amber-50 text-amber-700 px-4 py-3 rounded-xl">
            Your employee profile isn't set up yet. Please contact HR to get started.
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Recommendations */}

        {!notOnboarded && (

        <div className="bg-panel rounded-3xl shadow-xl p-6">

          <h2 className="text-xl font-bold mb-5">
            AI Recommendations
          </h2>


          <div className="space-y-3">

            {loading ? (

              <p className="text-mute">Loading recommendations...</p>

            ) : recommendations.length === 0 ? (

              !error && (
                <p className="text-mute">
                  No recommendations available right now.
                </p>
              )

            ) : (

              recommendations.map((item,index)=>(

                <div
                  key={index}
                  className="bg-primary-tint px-4 py-3 rounded-xl"
                >
                  ✓ {item}
                </div>

              ))

            )}

          </div>

        </div>

        )}



        {/* Roadmap */}

        {!notOnboarded && (

        <div className="bg-panel rounded-3xl shadow-xl p-6">

          <h2 className="text-xl font-bold mb-5">
            Learning Roadmap
          </h2>


          <div className="space-y-3">

            {loading ? (

              <p className="text-mute">Loading roadmap...</p>

            ) : roadmap.length === 0 ? (

              !error && (
                <p className="text-mute">
                  No roadmap available right now.
                </p>
              )

            ) : (

              roadmap.map((item,index)=>(

                <div
                  key={index}
                  className="bg-green-50 px-4 py-3 rounded-xl"
                >
                  {item}
                </div>

              ))

            )}

          </div>


        </div>

        )}

        {/* Recommended External Courses */}

        {!notOnboarded && (

        <div className="bg-panel rounded-3xl shadow-xl p-6">

          <h2 className="text-xl font-bold mb-5">
            Recommended External Courses
          </h2>

          <div className="space-y-6">

            {loading ? (

              <p className="text-mute">Loading external learning resources...</p>

            ) : !hasAnyCourses ? (

              !error && (
                <p className="text-mute">
                  No external learning resources available.
                </p>
              )

            ) : (

              externalCourses
                .filter((group) => (group.recommendedCourses || []).length > 0)
                .map((group, groupIndex) => (

                <div key={groupIndex} className="space-y-3">

                  <h3 className="text-sub font-semibold">
                    Missing Skill: {group.missingSkill}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {group.recommendedCourses.map((course, courseIndex) => {

                      const badgeClass = "text-xs font-semibold px-2 py-1 rounded-xl whitespace-nowrap " + difficultyBadgeClass(course.difficulty);

                      return (

                        <div
                          key={courseIndex}
                          className="bg-primary-tint rounded-xl p-4 flex flex-col gap-2"
                        >

                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-bold text-text">
                              {course.title}
                            </h4>

                            <span className={badgeClass}>
                              {course.difficulty}
                            </span>
                          </div>

                          <p className="text-sub text-sm">
                            {course.provider} • {course.duration}
                          </p>

                          <p className="text-mute text-sm">
                            {course.description}
                          </p>

                          <a
                            href={course.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-block text-center bg-primary text-white px-4 py-2 rounded-xl font-medium hover:opacity-90 transition"
                          >
                            Open Course
                          </a>

                        </div>

                      );

                    })}

                  </div>

                </div>

              ))

            )}

          </div>

        </div>

        )}


      </div>

    </DashboardLayout>
  );
}