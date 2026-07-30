package com.organizational.knowledge_gap_platform.dto;

import com.organizational.knowledge_gap_platform.entity.Skill;
import com.organizational.knowledge_gap_platform.entity.SkillTaxonomy;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
public class SkillTaxonomyDTO {

    private Long id;
    private String name;
    private String category;
    private String description;
    private Long parentId;
    private String parentName;
    private List<Long> linkedSkillIds;
    private List<String> linkedSkillNames;
    private Boolean active;
    private LocalDateTime createdAt;
    private List<SkillTaxonomyDTO> children;

    public static SkillTaxonomyDTO fromEntity(SkillTaxonomy entity) {
        return fromEntity(entity, false);
    }

    public static SkillTaxonomyDTO fromEntity(SkillTaxonomy entity, boolean includeChildren) {
        SkillTaxonomyDTO dto = new SkillTaxonomyDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setCategory(entity.getCategory());
        dto.setDescription(entity.getDescription());
        dto.setActive(entity.getActive());
        dto.setCreatedAt(entity.getCreatedAt());

        if (entity.getParent() != null) {
            dto.setParentId(entity.getParent().getId());
            dto.setParentName(entity.getParent().getName());
        }

        if (entity.getLinkedSkills() != null && !entity.getLinkedSkills().isEmpty()) {
            dto.setLinkedSkillIds(
                    entity.getLinkedSkills().stream()
                            .map(Skill::getId)
                            .collect(Collectors.toList())
            );
            dto.setLinkedSkillNames(
                    entity.getLinkedSkills().stream()
                            .map(Skill::getSkillName)
                            .collect(Collectors.toList())
            );
        }

        if (includeChildren && entity.getChildren() != null) {
            dto.setChildren(
                    entity.getChildren().stream()
                            .filter(c -> Boolean.TRUE.equals(c.getActive()))
                            .map(c -> SkillTaxonomyDTO.fromEntity(c, true))
                            .collect(Collectors.toList())
            );
        }

        return dto;
    }
}