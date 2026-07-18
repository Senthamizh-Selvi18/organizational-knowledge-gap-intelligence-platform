package com.organizational.knowledge_gap_platform.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CompetencyGoalMappingRequest {

    @NotNull(message = "strategicGoalId is required")
    private Long strategicGoalId;

    private Double alignmentWeight = 100.0;

    private String notes;
}
