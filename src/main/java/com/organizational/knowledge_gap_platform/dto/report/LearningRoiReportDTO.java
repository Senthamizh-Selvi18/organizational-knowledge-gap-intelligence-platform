package com.organizational.knowledge_gap_platform.dto.report;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * One row of the "Learning ROI Analysis" report.
 *
 * IMPORTANT ASSUMPTION: the current schema has no training cost, salary, or
 * revenue-impact fields anywhere (InternalTraining, LearningEnrollment,
 * etc.), so a true monetary ROI ($ returned per $ spent) can't be computed
 * from existing data. Rather than fabricate cost figures, this report uses
 * a defensible proxy: how often completing a training actually closes the
 * skill gap it was meant to address, using the existing gap-analysis data.
 *
 * roiScorePercent = (employees who closed the related skill gap after
 * certifying) / (total certified employees) * 100
 *
 * If/when a real "cost per employee" or "business value" field is added to
 * InternalTraining, swap this proxy for a true ROI calculation using it -
 * the enrollment/certification counts here would still be the numerator
 * inputs you'd need.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LearningRoiReportDTO {

    private Long trainingId;
    private String title;
    private String skillName;

    private long totalEnrollments;
    private long totalCertifications;
    private double certificationRatePercent;

    /** Of the certified employees, how many no longer show this training's skill as "missing" in their current gap analysis. */
    private long employeesWhoClosedTheGap;

    /** employeesWhoClosedTheGap / totalCertifications * 100. Null if nobody has certified yet. */
    private Double roiScorePercent;
}
