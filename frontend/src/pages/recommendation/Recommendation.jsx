import DashboardLayout from "../../components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import { getRecommendation } from "../../services/recommendationService";
export default function Recommendation() {

  const [recommendations,setRecommendations] = useState([]);
const [roadmap,setRoadmap] = useState([]);
const [loading,setLoading] = useState(true);
const [error,setError] = useState(null);
const [notOnboarded,setNotOnboarded] = useState(false);
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


      </div>

    </DashboardLayout>
  );
}