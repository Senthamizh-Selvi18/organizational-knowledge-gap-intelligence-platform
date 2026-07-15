package com.organizational.knowledge_gap_platform.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SkillTaxonomyRequest {

    @NotBlank(message = "Taxonomy name cannot be empty")
    private String name;

    private String category;

    private String description;

    private Long parentId;

    private Long linkedSkillId;
}
