package com.organizational.knowledge_gap_platform.dto;

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
public class TeamBuilderRequestDTO {

    @NotEmpty(message = "At least one required skill must be selected")
    private List<Long> requiredSkillIds;

    private Integer minProficiencyLevel;

    private String department;

    private Integer topN;
}