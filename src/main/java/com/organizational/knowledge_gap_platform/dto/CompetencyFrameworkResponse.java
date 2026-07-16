package com.organizational.knowledge_gap_platform.dto;

import com.organizational.knowledge_gap_platform.entity.CompetencyFramework;
import com.organizational.knowledge_gap_platform.entity.FrameworkStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
public class CompetencyFrameworkResponse {

    private Long id;
    private String frameworkName;
    private Long roleId;
    private String roleName;
    private String department;
    private String description;
    private FrameworkStatus status;
    private String versionGroupId;
    private Integer versionNumber;
    private Boolean isCurrentVersion;
    private String industryBenchmarkSource;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<CompetencyFrameworkSkillDTO> skills;
    private List<CompetencyGoalMappingDTO> goalMappings;

    public static CompetencyFrameworkResponse fromEntity(CompetencyFramework entity) {
        CompetencyFrameworkResponse dto = new CompetencyFrameworkResponse();
        dto.setId(entity.getId());
        dto.setFrameworkName(entity.getFrameworkName());
        dto.setDepartment(entity.getDepartment());
        dto.setDescription(entity.getDescription());
        dto.setStatus(entity.getStatus());
        dto.setVersionGroupId(entity.getVersionGroupId());
        dto.setVersionNumber(entity.getVersionNumber());
        dto.setIsCurrentVersion(entity.getIsCurrentVersion());
        dto.setIndustryBenchmarkSource(entity.getIndustryBenchmarkSource());
        dto.setCreatedBy(entity.getCreatedBy());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        if (entity.getRole() != null) {
            dto.setRoleId(entity.getRole().getId());
            dto.setRoleName(entity.getRole().getRoleName());
        }

        if (entity.getSkills() != null) {
            dto.setSkills(
                    entity.getSkills().stream()
                            .map(CompetencyFrameworkSkillDTO::fromEntity)
                            .collect(Collectors.toList())
            );
        }

        if (entity.getGoalMappings() != null) {
            dto.setGoalMappings(
                    entity.getGoalMappings().stream()
                            .map(CompetencyGoalMappingDTO::fromEntity)
                            .collect(Collectors.toList())
            );
        }

        return dto;
    }
}
