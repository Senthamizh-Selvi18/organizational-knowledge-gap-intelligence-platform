package com.organizational.knowledge_gap_platform.dto;

import com.organizational.knowledge_gap_platform.entity.CompetencyFrameworkSkill;
import com.organizational.knowledge_gap_platform.entity.ProficiencyLevel;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CompetencyFrameworkSkillDTO {

    private Long id;
    private Long skillTaxonomyId;
    private String skillTaxonomyName;
    private String category;
    private ProficiencyLevel requiredLevel;
    private Double weight;
    private String notes;

    private ProficiencyLevel benchmarkLevel;
    private Integer gapVsBenchmark; 

    public static CompetencyFrameworkSkillDTO fromEntity(CompetencyFrameworkSkill entity) {
        CompetencyFrameworkSkillDTO dto = new CompetencyFrameworkSkillDTO();
        dto.setId(entity.getId());
        dto.setRequiredLevel(entity.getRequiredLevel());
        dto.setWeight(entity.getWeight());
        dto.setNotes(entity.getNotes());

        if (entity.getSkillTaxonomy() != null) {
            dto.setSkillTaxonomyId(entity.getSkillTaxonomy().getId());
            dto.setSkillTaxonomyName(entity.getSkillTaxonomy().getName());
            dto.setCategory(entity.getSkillTaxonomy().getCategory());
        }

        return dto;
    }
}
