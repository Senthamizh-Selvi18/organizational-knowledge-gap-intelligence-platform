package com.organizational.knowledge_gap_platform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SkillRequest {

    @NotBlank(message = "Skill name cannot be empty")
    @Size(max = 100, message = "Skill name must be at most 100 characters")
    private String skillName;
}
