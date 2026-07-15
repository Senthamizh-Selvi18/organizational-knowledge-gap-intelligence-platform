package com.organizational.knowledge_gap_platform.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CompetencyFrameworkRequest {

    @NotBlank(message = "Framework name cannot be empty")
    private String frameworkName;

    private Long roleId;

    private String department;

    private String description;

    private String industryBenchmarkSource;
}
