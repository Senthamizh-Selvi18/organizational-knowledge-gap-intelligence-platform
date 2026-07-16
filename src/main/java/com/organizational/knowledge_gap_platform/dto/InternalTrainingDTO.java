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
public class InternalTrainingDto {

    private Long id;

    @NotBlank(message = "Title cannot be empty")
    @Size(max = 255, message = "Title must be at most 255 characters")
    private String title;

    @NotBlank(message = "Skill name cannot be empty")
    @Size(max = 100, message = "Skill name must be at most 100 characters")
    private String skillName;

    @NotBlank(message = "Category cannot be empty")
    @Size(max = 100, message = "Category must be at most 100 characters")
    private String category;

    @NotBlank(message = "Trainer cannot be empty")
    @Size(max = 100, message = "Trainer must be at most 100 characters")
    private String trainer;

    @NotBlank(message = "Mode cannot be empty")
    @Pattern(regexp = "Online|Offline|Hybrid", message = "Mode must be Online, Offline or Hybrid")
    private String mode;

    @NotBlank(message = "Duration cannot be empty")
    @Size(max = 50, message = "Duration must be at most 50 characters")
    private String duration;

    @Size(max = 1000, message = "Description must be at most 1000 characters")
    private String description;

    private boolean mandatory = false;

    private boolean active = true;
}
