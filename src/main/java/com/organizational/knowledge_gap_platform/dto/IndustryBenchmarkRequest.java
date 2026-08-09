package com.organizational.knowledge_gap_platform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class IndustryBenchmarkRequest {

    @NotNull(message = "skillTaxonomyId is required")
    private Long skillTaxonomyId;

    @Size(max = 255, message = "industrySector must be 255 characters or fewer")
    private String industrySector;

    @Size(max = 255, message = "roleCategory must be 255 characters or fewer")
    private String roleCategory;

    @NotBlank(message = "recommendedAction is required")
    @Size(max = 1000, message = "recommendedAction must be 1000 characters or fewer")
    private String recommendedAction;

    @Size(max = 255, message = "source must be 255 characters or fewer")
    private String source;

    private LocalDate referenceDate;

    @Size(max = 500, message = "notes must be 500 characters or fewer")
    private String notes;
}
