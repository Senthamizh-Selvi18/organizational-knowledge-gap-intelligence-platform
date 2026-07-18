package com.organizational.knowledge_gap_platform.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentAssignRequest {

    @NotNull(message = "Subject employee is required")
    private Long subjectEmployeeId;

    @NotNull(message = "Template is required")
    private Long templateId;

    @NotNull(message = "Assessment type is required")
    private String type; // SELF, PEER, MANAGER

    // Required for PEER (one or more colleagues) and MANAGER (the
    // subject's manager's user id). Ignored for SELF, where the
    // assessor is always the subject themselves.
    private List<Long> assessorUserIds;

    private LocalDate dueDate;
}
