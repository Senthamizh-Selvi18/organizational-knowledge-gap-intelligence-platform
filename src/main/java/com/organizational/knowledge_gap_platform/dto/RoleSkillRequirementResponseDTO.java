package com.organizational.knowledge_gap_platform.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RoleSkillRequirementResponseDTO {

    private Long id;

    private Long roleId;
    private String roleName;

    private Long skillId;
    private String skillName;

    private Integer requiredProficiencyLevel;
}