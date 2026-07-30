import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const defaultImage =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800";

const skillImages = {
  Java: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800",
  React: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800",
  Python: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800",
  "Spring Boot":
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800",
  SQL: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800",
  Git: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800",
  Docker: "https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800",
  Communication:
    "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800",
  Leadership:
    "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800",
};

export const getCourses = async () => {
  try {
    const [externalResponse, internalResponse] = await Promise.all([
      axios.get(`${API_BASE_URL}/api/external-courses`),
      axios.get(`${API_BASE_URL}/api/internal-trainings`),
    ]);

    const externalCourses = externalResponse.data.map((course) => ({
      id: `external-${course.id}`,
      title: course.courseTitle,
      platform: course.provider,
      duration: course.duration,
      level: course.difficulty,
      instructor: course.provider,
      image: skillImages[course.skillName] || defaultImage,
      skills: [course.skillName],
      description: course.description,
      courseUrl: course.courseUrl,
    }));

    const internalCourses = internalResponse.data.map((training) => ({
      id: `internal-${training.id}`,
      title: training.title,
      platform: "Internal",
      duration: training.duration,
      level: training.category,
      instructor: training.trainer,
      image: skillImages[training.skillName] || defaultImage,
      skills: [training.skillName],
      description: training.description,
      mode: training.mode,
      mandatory: training.mandatory,
    }));

    return [...externalCourses, ...internalCourses];
  } catch (error) {
    console.error("Error fetching courses:", error);
    throw error;
  }
};