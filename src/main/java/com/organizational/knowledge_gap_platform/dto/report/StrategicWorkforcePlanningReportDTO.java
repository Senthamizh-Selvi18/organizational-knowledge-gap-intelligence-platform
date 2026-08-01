package com.organizational.knowledge_gap_platform.dto.report;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * One row of the "Strategic Workforce Planning" report: for each active
 * strategic goal, how ready the current workforce is against the skills
 * that goal actually requires.
 *
 * Required skills for a goal are derived from real, existing mappings:
 *   StrategicGoal -> CompetencyGoalMapping -> CompetencyFramework
 *                  -> CompetencyFrameworkSkill -> SkillTaxonomy -> linkedSkills
 *
 * ASSUMPTION: an employee is counted "ready" for a goal if they possess at
 * least READINESS_THRESHOLD (see ReportServiceImpl) of that goal's required
 * skills. This threshold is a judgment call, not a fixed business rule -
 * adjust it in ReportServiceImpl if your organization wants a stricter or
 * looser bar (e.g. requiring 100% of required skills).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StrategicWorkforcePlanningReportDTO {

    private Long goalId;
    private String goalName;
    private String priority;
    private Integer targetYear;

    private int requiredSkillCount;
    private long totalEmployeesConsidered;
    private long employeesReady;
    private double readinessPercentage;

    /** Required skills held by the fewest employees, most-lacking first. */
    private List<String> topGapSkills;
}
