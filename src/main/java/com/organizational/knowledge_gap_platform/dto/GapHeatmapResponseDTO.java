package com.organizational.knowledge_gap_platform.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GapHeatmapResponseDTO {

    private Long employeeId;
    private String employeeName;
    private String roleName;
    private Double gapPercentage;

}