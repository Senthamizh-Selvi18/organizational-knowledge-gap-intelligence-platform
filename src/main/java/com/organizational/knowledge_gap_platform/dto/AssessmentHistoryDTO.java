package com.organizational.knowledge_gap_platform.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentHistoryDTO {

    private Long assessmentId;
    private String templateTitle;
    private String type;
    private LocalDateTime completedAt;
    private Integer averageRating;
    private String assessorName;
}
