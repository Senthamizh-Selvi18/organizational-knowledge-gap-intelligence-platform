package com.organizational.knowledge_gap_platform.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class SetFrameworkSkillsRequest {

    @NotEmpty(message = "At least one skill is required")
    @Valid
    private List<CompetencyFrameworkSkillRequest> skills;
}
