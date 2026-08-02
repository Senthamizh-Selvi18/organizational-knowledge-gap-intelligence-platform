package com.organizational.knowledge_gap_platform.dto.report;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * One row of the "Training Effectiveness" report: how each internal
 * training is actually performing, based on real enrollment/completion
 * data from LearningEnrollment.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TrainingEffectivenessReportDTO {

    private Long trainingId;
    private String title;
    private String skillName;
    private String category;
    private String mode;
    private boolean mandatory;

    private long totalEnrollments;
    private long notStartedCount;   // status = ENROLLED
    private long inProgressCount;   // status = IN_PROGRESS
    private long certifiedCount;    // status = CERTIFIED

    private double completionRatePercent;   // certifiedCount / totalEnrollments * 100
    private Double averageDaysToCertify;    // avg(certifiedDate - enrolledDate) for certified enrollments; null if none certified yet
}
