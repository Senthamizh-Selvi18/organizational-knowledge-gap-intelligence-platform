package com.organizational.knowledge_gap_platform.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RoleSkillRequirementRequestDTO {

    @NotNull(message = "roleId is required")
    private Long roleId;

    @NotNull(message = "skillId is required")
    private Long skillId;

    @NotNull(message = "requiredProficiencyLevel is required")
    @Min(value = 1, message = "requiredProficiencyLevel must be at least 1")
    @Max(value = 5, message = "requiredProficiencyLevel must be at most 5")
    private Integer requiredProficiencyLevel;
}