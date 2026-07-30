package com.organizational.knowledge_gap_platform.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LearningEnrollmentDTO {

    private Long id;

    private Long employeeId;

    private String employeeName;

    private Long trainingId;

    private String trainingTitle;

    private String trainer;

    private String duration;

    private Integer progress;

    private String status;

    private LocalDate enrolledDate;

    private LocalDate completedDate;
}