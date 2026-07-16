package com.organizational.knowledge_gap_platform.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Table(name = "external_course")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ExternalCourse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Skill name cannot be empty")
    @Size(max = 100, message = "Skill name must be at most 100 characters")
    @Column(name = "skill_name", nullable = false)
    private String skillName;

    @NotBlank(message = "Course title cannot be empty")
    @Size(max = 255, message = "Course title must be at most 255 characters")
    @Column(name = "course_title", nullable = false)
    private String courseTitle;

    @NotBlank(message = "Provider cannot be empty")
    @Size(max = 100, message = "Provider must be at most 100 characters")
    @Column(name = "provider", nullable = false)
    private String provider;

    @NotBlank(message = "Course URL cannot be empty")
    @Size(max = 500, message = "Course URL must be at most 500 characters")
    @Column(name = "course_url", nullable = false, length = 500)
    private String courseUrl;

    @Size(max = 1000, message = "Description must be at most 1000 characters")
    @Column(name = "description", length = 1000)
    private String description;

    @NotBlank(message = "Difficulty cannot be empty")
    @Pattern(regexp = "Beginner|Intermediate|Advanced", message = "Difficulty must be Beginner, Intermediate or Advanced")
    @Column(name = "difficulty", nullable = false)
    private String difficulty;

    @NotBlank(message = "Duration cannot be empty")
    @Size(max = 50, message = "Duration must be at most 50 characters")
    @Column(name = "duration", nullable = false)
    private String duration;

    @Column(name = "active", nullable = false)
    private boolean active = true;
}