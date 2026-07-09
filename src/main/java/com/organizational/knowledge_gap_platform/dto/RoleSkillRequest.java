package com.organizational.knowledge_gap_platform.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class RoleSkillRequest {

    @NotEmpty(message = "At least one skill ID must be provided")
    private List<Long> skillIds;
}
