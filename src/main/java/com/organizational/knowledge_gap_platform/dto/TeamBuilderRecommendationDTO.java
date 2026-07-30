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
public class TeamBuilderRecommendationDTO {

    private Long employeeId;
    private String employeeCode;
    private String name;
    private String email;
    private String department;
    private String designation;

    private int totalRequiredSkills;
    private int matchedSkillCount;
    private int missingSkillCount;

    private double matchPercentage;

    private List<SkillDTO> matchedSkills;
    private List<SkillDTO> missingSkills;
}