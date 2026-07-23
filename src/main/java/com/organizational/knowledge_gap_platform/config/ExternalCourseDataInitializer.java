package com.organizational.knowledge_gap_platform.config;

import com.organizational.knowledge_gap_platform.entity.ExternalCourse;
import com.organizational.knowledge_gap_platform.repository.ExternalCourseRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class ExternalCourseDataInitializer implements CommandLineRunner {

    private final ExternalCourseRepository externalCourseRepository;

    public ExternalCourseDataInitializer(ExternalCourseRepository externalCourseRepository) {
        this.externalCourseRepository = externalCourseRepository;
    }

    @Override
    public void run(String... args) {

        if (externalCourseRepository.count() > 0) {
            return;
        }

        List<ExternalCourse> seedCourses = Arrays.asList(

                course("Java", "Java Programming Masterclass", "Udemy",
                        "https://www.udemy.com/course/java-the-complete-java-developer-course/",
                        "Comprehensive Java programming course covering core to advanced concepts.",
                        "Intermediate", "80 Hours"),
                course("Java", "Java for Beginners", "Oracle",
                        "https://docs.oracle.com/javase/tutorial/",
                        "Official Oracle tutorial introducing Java fundamentals.",
                        "Beginner", "20 Hours"),

                course("React", "React Complete Guide", "Udemy",
                        "https://www.udemy.com/course/react-the-complete-guide-incl-redux/",
                        "Complete guide to building modern applications with React.",
                        "Intermediate", "48 Hours"),
                course("React", "React Essentials", "freeCodeCamp",
                        "https://www.freecodecamp.org/learn/front-end-development-libraries/",
                        "Hands-on introduction to React fundamentals and components.",
                        "Beginner", "15 Hours"),

                course("Spring Boot", "Spring Boot Fundamentals", "Coursera",
                        "https://www.coursera.org/learn/spring-framework",
                        "Learn the fundamentals of building applications with Spring Boot.",
                        "Beginner", "25 Hours"),
                course("Spring Boot", "Spring Boot Masterclass", "Udemy",
                        "https://www.udemy.com/course/spring-hibernate-tutorial/",
                        "Advanced Spring Boot, Spring MVC and Hibernate course.",
                        "Advanced", "60 Hours"),

                course("Python", "Python for Everybody", "Coursera",
                        "https://www.coursera.org/specializations/python",
                        "Beginner friendly specialization covering Python programming basics.",
                        "Beginner", "40 Hours"),
                course("Python", "Scientific Computing with Python", "freeCodeCamp",
                        "https://www.freecodecamp.org/learn/scientific-computing-with-python/",
                        "Intermediate Python course focused on scientific computing concepts.",
                        "Intermediate", "30 Hours"),

                course("SQL", "SQL for Data Science", "Coursera",
                        "https://www.coursera.org/learn/sql-for-data-science",
                        "Learn SQL fundamentals for data analysis and querying.",
                        "Beginner", "18 Hours"),
                course("SQL", "Relational Database Certification", "freeCodeCamp",
                        "https://www.freecodecamp.org/learn/relational-database/",
                        "Certification course covering relational databases and SQL.",
                        "Beginner", "22 Hours"),

                course("Git", "Introduction to Git and GitHub", "Google",
                        "https://www.coursera.org/learn/introduction-git-github",
                        "Google-authored course covering version control with Git and GitHub.",
                        "Beginner", "12 Hours"),
                course("Git", "Introduction to Version Control with Git", "Microsoft Learn",
                        "https://learn.microsoft.com/en-us/training/modules/intro-to-git/",
                        "Microsoft Learn module introducing Git fundamentals.",
                        "Beginner", "8 Hours"),

                course("Docker", "Docker Get Started Guide", "Docker",
                        "https://docs.docker.com/get-started/",
                        "Official Docker documentation to learn containerization basics.",
                        "Beginner", "10 Hours"),
                course("Docker", "Docker Mastery", "Udemy",
                        "https://www.udemy.com/course/docker-mastery/",
                        "In-depth Docker course covering images, containers and orchestration.",
                        "Intermediate", "35 Hours"),

                course("Communication", "Improving Communication Skills", "Coursera",
                        "https://www.coursera.org/learn/wharton-communication-skills",
                        "Wharton course focused on improving workplace communication skills.",
                        "Beginner", "16 Hours"),

                course("Leadership", "Leadership Skills", "Coursera",
                        "https://www.coursera.org/learn/leadership-skills",
                        "Course covering core leadership principles and team management.",
                        "Intermediate", "20 Hours"),

                course("Problem Solving", "Creative Problem Solving", "Coursera",
                        "https://www.coursera.org/learn/creative-problem-solving",
                        "Course teaching structured approaches to creative problem solving.",
                        "Beginner", "14 Hours")
        );

        externalCourseRepository.saveAll(seedCourses);
    }

    private ExternalCourse course(String skillName, String title, String provider, String url,
                                   String description, String difficulty, String duration) {
        ExternalCourse course = new ExternalCourse();
        course.setSkillName(skillName);
        course.setCourseTitle(title);
        course.setProvider(provider);
        course.setCourseUrl(url);
        course.setDescription(description);
        course.setDifficulty(difficulty);
        course.setDuration(duration);
        course.setActive(true);
        return course;
    }
}