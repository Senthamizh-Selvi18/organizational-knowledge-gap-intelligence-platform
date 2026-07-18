package com.organizational.knowledge_gap_platform.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentSummaryDTO {

    private Long id;
    private String templateTitle;
    private String type;
    private String status;
    private Long subjectEmployeeId;
    private String subjectEmployeeName;
    private String assessorName;
    private LocalDate dueDate;
    private LocalDateTime completedAt;
    private Integer averageRating;
}
