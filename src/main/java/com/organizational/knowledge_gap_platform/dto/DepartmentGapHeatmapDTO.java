package com.organizational.knowledge_gap_platform.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentGapHeatmapDTO {

    private String department;
    private Long employeeCount;
    private Double averageGapPercentage;

}