package com.organizational.knowledge_gap_platform.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class EmployeeSkillResponseDTO {

    private Long skillId;

    private String skillName;

    private Integer proficiencyLevel;

}