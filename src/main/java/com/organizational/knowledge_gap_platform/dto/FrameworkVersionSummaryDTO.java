package com.organizational.knowledge_gap_platform.dto;

import com.organizational.knowledge_gap_platform.entity.CompetencyFramework;
import com.organizational.knowledge_gap_platform.entity.FrameworkStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

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

    public static FrameworkVersionSummaryDTO fromEntity(CompetencyFramework entity) {
        FrameworkVersionSummaryDTO dto = new FrameworkVersionSummaryDTO();
        dto.setId(entity.getId());
        dto.setVersionNumber(entity.getVersionNumber());
        dto.setStatus(entity.getStatus());
        dto.setIsCurrentVersion(entity.getIsCurrentVersion());
        dto.setCreatedBy(entity.getCreatedBy());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }
}
