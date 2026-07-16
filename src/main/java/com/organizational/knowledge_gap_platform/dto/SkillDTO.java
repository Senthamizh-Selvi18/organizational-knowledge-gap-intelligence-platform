package com.organizational.knowledge_gap_platform.dto;

import com.organizational.knowledge_gap_platform.entity.Skill;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SkillDTO {

    private Long id;
    private String skillName;

    private Integer requiredLevel;
    private Integer currentLevel;
    private Integer gap;
    private String severity;
    private String riskColor;
    private String riskLabel;

    public static SkillDTO fromEntity(Skill skill) {
        SkillDTO dto = new SkillDTO();
        dto.setId(skill.getId());
        dto.setSkillName(skill.getSkillName());
        return dto;
    }

    public static SkillDTO fromEntityWithRisk(Skill skill, int requiredLevel, int currentLevel) {
        SkillDTO dto = new SkillDTO();
        dto.setId(skill.getId());
        dto.setSkillName(skill.getSkillName());

        int gap = requiredLevel - currentLevel;
        if (gap < 0) {
            gap = 0;
        }

        String severity;
        String riskColor;
        String riskLabel;

        if (gap == 0) {
            severity = "LOW";
            riskColor = "GREEN";
            riskLabel = "Low Risk";
        } else if (gap == 1) {
            severity = "MEDIUM";
            riskColor = "AMBER";
            riskLabel = "Medium Risk";
        } else {
            severity = "HIGH";
            riskColor = "RED";
            riskLabel = "High Risk";
        }

        dto.setRequiredLevel(requiredLevel);
        dto.setCurrentLevel(currentLevel);
        dto.setGap(gap);
        dto.setSeverity(severity);
        dto.setRiskColor(riskColor);
        dto.setRiskLabel(riskLabel);

        return dto;
    }
}