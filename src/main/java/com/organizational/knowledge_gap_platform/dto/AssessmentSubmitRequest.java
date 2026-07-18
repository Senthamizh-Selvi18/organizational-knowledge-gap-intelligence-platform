package com.organizational.knowledge_gap_platform.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentSubmitRequest {

    @NotEmpty(message = "At least one answer is required")
    @Valid
    private List<AssessmentAnswerRequest> answers;
}
