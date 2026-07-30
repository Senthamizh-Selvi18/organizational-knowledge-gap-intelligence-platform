package com.organizational.knowledge_gap_platform.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentQuestionRequest {

    // Optional: link the question to a skill so its rating feeds back
    // into EmployeeSkill proficiency and gap recalculation.
    private Long skillId;

    @NotBlank(message = "Question text cannot be empty")
    @Size(max = 500, message = "Question text must be at most 500 characters")
    private String questionText;

    @Min(value = 2, message = "Rating scale must be at least 2")
    @Max(value = 10, message = "Rating scale must be at most 10")
    private int ratingScaleMax = 5;

    private int displayOrder = 0;
}
