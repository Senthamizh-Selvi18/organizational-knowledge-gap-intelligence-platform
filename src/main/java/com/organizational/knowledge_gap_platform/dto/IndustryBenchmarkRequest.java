package com.organizational.knowledge_gap_platform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class IndustryBenchmarkRequest {

    @NotNull(message = "skillTaxonomyId is required")
    private Long skillTaxonomyId;

    private String industrySector;

    private String roleCategory;

    @NotBlank(message = "recommendedAction is required")
    private String recommendedAction;

    private String source;

    private LocalDate referenceDate;

    private String notes;
}
