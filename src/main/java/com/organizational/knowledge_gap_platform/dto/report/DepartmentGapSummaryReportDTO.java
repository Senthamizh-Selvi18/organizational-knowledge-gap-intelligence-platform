package com.organizational.knowledge_gap_platform.dto.report;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * One row of the "Department Gap Summary" report: for each department, how
 * many employees were analyzed, their average skill-gap percentage, and
 * which required skills are most commonly missing in that department.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentGapSummaryReportDTO {

    private String department;
    private long employeeCount;
    private double averageGapPercentage;

    /** Skill names missing most often across this department's employees, most-missing first. */
    private List<String> topMissingSkills;
}
