package com.organizational.knowledge_gap_platform.dto;

import com.organizational.knowledge_gap_platform.entity.IndustryBenchmark;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class IndustryBenchmarkDTO {

    private Long id;
    private Long skillTaxonomyId;
    private String skillTaxonomyName;
    private String industrySector;
    private String roleCategory;
    private String recommendedAction;
    private String source;
    private LocalDate referenceDate;
    private String notes;
    private LocalDateTime createdAt;

    public static IndustryBenchmarkDTO fromEntity(IndustryBenchmark entity) {
        IndustryBenchmarkDTO dto = new IndustryBenchmarkDTO();
        dto.setId(entity.getId());
        dto.setIndustrySector(entity.getIndustrySector());
        dto.setRoleCategory(entity.getRoleCategory());
        dto.setRecommendedAction(entity.getRecommendedAction());
        dto.setSource(entity.getSource());
        dto.setReferenceDate(entity.getReferenceDate());
        dto.setNotes(entity.getNotes());
        dto.setCreatedAt(entity.getCreatedAt());

        if (entity.getSkillTaxonomy() != null) {
            dto.setSkillTaxonomyId(entity.getSkillTaxonomy().getId());
            dto.setSkillTaxonomyName(entity.getSkillTaxonomy().getName());
        }

        return dto;
    }
}
