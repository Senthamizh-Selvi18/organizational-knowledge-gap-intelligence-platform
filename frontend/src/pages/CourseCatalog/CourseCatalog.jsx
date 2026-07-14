import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { FiSearch } from "react-icons/fi";
import { getCourses } from "../../services/courseCatalogService";

function CourseCatalog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState("All");

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getCourses();

      setCourses(data);
    } catch (err) {
      console.error("Course API Error:", err);

      // Temporary Dummy Data
      setCourses([
        {
          id: 1,
          title: "Java Spring Boot",
          platform: "Coursera",
          duration: "12 Weeks",
          level: "Intermediate",
          instructor: "Coursera",
          image:
            "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800",
          skills: ["Java", "Spring Boot", "REST API"],
        },
        {
          id: 2,
          title: "React Development",
          platform: "Udemy",
          duration: "8 Weeks",
          level: "Beginner",
          instructor: "Udemy",
          image:
            "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800",
          skills: ["React", "JavaScript", "HTML", "CSS"],
        },
        {
          id: 3,
          title: "Python for Data Science",
          platform: "Internal",
          duration: "10 Weeks",
          level: "Advanced",
          instructor: "L&D Team",
          image:
            "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800",
          skills: ["Python", "Pandas", "Machine Learning"],
        },
      ]);

      setError("Backend not available. Showing sample courses.");
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const keyword = searchTerm.toLowerCase();

      const matchesSearch =
        course.title?.toLowerCase().includes(keyword) ||
        course.platform?.toLowerCase().includes(keyword) ||
        course.instructor?.toLowerCase().includes(keyword) ||
        course.skills?.some((skill) =>
          skill.toLowerCase().includes(keyword)
        );

      const matchesPlatform =
        platformFilter === "All" ||
        course.platform === platformFilter;

      return matchesSearch && matchesPlatform;
    });
  }, [courses, searchTerm, platformFilter]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-96 items-center justify-center">
          <h2 className="text-xl font-semibold text-gray-700">
            Loading Courses...
          </h2>
        </div>
      </DashboardLayout>
    );
  }
  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white shadow-lg">
          <div>
            <h1 className="text-4xl font-bold">
              📚 Course Catalog
            </h1>

            <p className="mt-2 text-blue-100 text-lg">
              Browse internal and external learning resources.
            </p>
          </div>

          <div className="mt-6 md:mt-0 text-center">
            <p className="text-blue-100">Total Courses</p>

            <h2 className="text-4xl font-bold">
              {filteredCourses.length}
            </h2>
          </div>
        </div>
        {
  error && (
    <div className="rounded-xl bg-yellow-100 border border-yellow-300 p-4 text-yellow-700">
      {error}
    </div>
  )
}

        {/* Search & Filter */}
        <div className="rounded-2xl bg-white p-6 shadow">

          <div className="grid gap-4 md:grid-cols-2">

            <div className="relative">

              <FiSearch className="absolute left-4 top-3.5 text-gray-400" />

              <input
                type="text"
                placeholder="Search by course, skill, instructor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 outline-none focus:border-blue-500"
              />

            </div>

            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="rounded-xl border border-gray-300 px-4 py-3"
            >
              <option>All</option>
              <option>Internal</option>
              <option>Coursera</option>
              <option>Udemy</option>
            </select>

          </div>

        </div>

      </div>
      {/* Course Cards */}
<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
  {filteredCourses.length > 0 ? (
    filteredCourses.map((course) => (
      <div
        key={course.id}
        className="rounded-3xl bg-white shadow-lg hover:shadow-xl transition duration-300 overflow-hidden"
      >
        {/* Image */}
        <div className="h-48 w-full bg-gray-200 flex items-center justify-center">
          <img
            src={course.image}
            alt={course.title}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="p-6">

          <h2 className="text-xl font-bold text-gray-800">
            {course.title}
          </h2>

          <div className="mt-2 flex items-center gap-2">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
              {course.platform}
            </span>

            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
              {course.level}
            </span>
          </div>

          <div className="mt-4 space-y-2 text-sm text-gray-600">

            <p>
              <span className="font-semibold">Duration :</span>{" "}
              {course.duration}
            </p>

            <p>
              <span className="font-semibold">Instructor :</span>{" "}
              {course.instructor}
            </p>

          </div>

          {/* Skills */}
          <div className="mt-5 flex flex-wrap gap-2">
            {course.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700"
              >
                {skill}
              </span>
            ))}
          </div>

          {/* Button */}
          <button
            className="mt-6 w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            View Course
          </button>

        </div>
      </div>
    ))
  ) : (
    <div className="col-span-full rounded-2xl bg-white p-10 text-center shadow">

      <h2 className="text-2xl font-bold text-gray-700">
        No Courses Found
      </h2>

      <p className="mt-2 text-gray-500">
        Try searching with another keyword.
      </p>

    </div>
  )}
</div>
    </DashboardLayout>
  );
}

export default CourseCatalog;