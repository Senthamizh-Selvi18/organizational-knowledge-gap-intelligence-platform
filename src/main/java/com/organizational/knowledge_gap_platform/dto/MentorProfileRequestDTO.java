package com.organizational.knowledge_gap_platform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MentorProfileRequestDTO {

    @NotBlank(message = "Expertise areas cannot be empty")
    private String expertiseAreas;

    private String bio;

    @Min(value = 0, message = "Years of experience cannot be negative")
    private Integer yearsOfExperience;

    private String availability;

    @NotNull(message = "Max mentees is required")
    @Min(value = 1, message = "Max mentees must be at least 1")
    private Integer maxMentees;

    private boolean active = true;
}
