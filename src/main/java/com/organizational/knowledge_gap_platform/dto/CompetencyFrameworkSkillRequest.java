package com.organizational.knowledge_gap_platform.dto;

import com.organizational.knowledge_gap_platform.entity.ProficiencyLevel;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CompetencyFrameworkSkillRequest {

    @NotNull(message = "skillTaxonomyId is required")
    private Long skillTaxonomyId;

    @NotNull(message = "requiredLevel is required")
    private ProficiencyLevel requiredLevel;

    private Double weight = 1.0;

    private String notes;
}
