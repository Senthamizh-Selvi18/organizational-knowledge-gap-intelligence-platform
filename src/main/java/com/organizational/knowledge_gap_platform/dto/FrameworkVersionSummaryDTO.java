package com.organizational.knowledge_gap_platform.dto;

import com.organizational.knowledge_gap_platform.entity.CompetencyFramework;
import com.organizational.knowledge_gap_platform.entity.FrameworkStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
public class FrameworkVersionSummaryDTO {

    private Long id;
    private Integer versionNumber;
    private FrameworkStatus status;
    private Boolean isCurrentVersion;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private List<CompletedSkillSummaryDTO> completedSkills;

    @Getter
    @Setter
    public static class CompletedSkillSummaryDTO {
        private String skillTaxonomyName;
        private String requiredLevel;

        public CompletedSkillSummaryDTO() {
        }

        public CompletedSkillSummaryDTO(String skillTaxonomyName, String requiredLevel) {
            this.skillTaxonomyName = skillTaxonomyName;
            this.requiredLevel = requiredLevel;
        }
    }

    public static FrameworkVersionSummaryDTO fromEntity(CompetencyFramework entity) {
        FrameworkVersionSummaryDTO dto = new FrameworkVersionSummaryDTO();
        dto.setId(entity.getId());
        dto.setVersionNumber(entity.getVersionNumber());
        dto.setStatus(entity.getStatus());
        dto.setIsCurrentVersion(entity.getIsCurrentVersion());
        dto.setCreatedBy(entity.getCreatedBy());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        if (entity.getSkills() != null) {
            dto.setCompletedSkills(
                    entity.getSkills().stream()
                            .map(s -> new CompletedSkillSummaryDTO(
                                    s.getSkillTaxonomy() != null ? s.getSkillTaxonomy().getName() : "Unknown skill",
                                    s.getRequiredLevel() != null ? s.getRequiredLevel().name() : null))
                            .collect(Collectors.toList())
            );
        } else {
            dto.setCompletedSkills(Collections.emptyList());
        }

        return dto;
    }
}
