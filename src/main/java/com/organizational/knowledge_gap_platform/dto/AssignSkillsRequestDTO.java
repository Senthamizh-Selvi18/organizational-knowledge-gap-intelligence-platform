package com.organizational.knowledge_gap_platform.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class AssignSkillsRequestDTO {

    @NotEmpty(message = "Skills cannot be empty")
    @Valid
    private List<SkillAssignmentDTO> skills;

    @Getter
    @Setter
    public static class SkillAssignmentDTO {

        @NotNull(message = "Skill ID is required")
        private Long skillId;

        @Min(value = 0, message = "Proficiency level must be between 0 and 100")
        @Max(value = 100, message = "Proficiency level must be between 0 and 100")
        private Integer proficiencyLevel;
    }
}