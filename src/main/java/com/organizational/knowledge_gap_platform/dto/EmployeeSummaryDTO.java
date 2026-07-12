package com.organizational.knowledge_gap_platform.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeSummaryDTO {

    private Long employeeId;
    private Long userId;
    private String employeeCode;
    private String name;
    private String department;
    private String designation;
}
