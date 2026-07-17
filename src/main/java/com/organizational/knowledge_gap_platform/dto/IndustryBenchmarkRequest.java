package com.organizational.knowledge_gap_platform.dto;

import com.organizational.knowledge_gap_platform.entity.ProficiencyLevel;
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

    @NotNull(message = "benchmarkLevel is required")
    private ProficiencyLevel benchmarkLevel;

    private String source;

    private LocalDate referenceDate;

    private String notes;
}
