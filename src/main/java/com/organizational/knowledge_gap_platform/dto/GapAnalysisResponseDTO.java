package com.organizational.knowledge_gap_platform.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GapAnalysisResponseDTO {

    private Long employeeId;
    private String employeeName;

    private Long roleId;
    private String roleName;

    private int totalRequiredSkills;
    private int matchedSkillCount;
    private int missingSkillCount;

    private double gapPercentage;

    private List<SkillDTO> matchedSkills;
    private List<SkillDTO> missingSkills;
}
