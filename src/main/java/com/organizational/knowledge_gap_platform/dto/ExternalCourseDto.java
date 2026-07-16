package com.organizational.knowledge_gap_platform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ExternalCourseDto {

    private Long id;

    @NotBlank(message = "Skill name cannot be empty")
    @Size(max = 100, message = "Skill name must be at most 100 characters")
    private String skillName;

    @NotBlank(message = "Course title cannot be empty")
    @Size(max = 255, message = "Course title must be at most 255 characters")
    private String courseTitle;

    @NotBlank(message = "Provider cannot be empty")
    @Size(max = 100, message = "Provider must be at most 100 characters")
    private String provider;

    @NotBlank(message = "Course URL cannot be empty")
    @Size(max = 500, message = "Course URL must be at most 500 characters")
    private String courseUrl;

    @Size(max = 1000, message = "Description must be at most 1000 characters")
    private String description;

    @NotBlank(message = "Difficulty cannot be empty")
    @Pattern(regexp = "Beginner|Intermediate|Advanced", message = "Difficulty must be Beginner, Intermediate or Advanced")
    private String difficulty;

    @NotBlank(message = "Duration cannot be empty")
    @Size(max = 50, message = "Duration must be at most 50 characters")
    private String duration;

    private boolean active = true;
}