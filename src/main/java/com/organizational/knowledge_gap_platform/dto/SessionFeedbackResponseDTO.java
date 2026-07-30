package com.organizational.knowledge_gap_platform.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SessionFeedbackResponseDTO {

    private Long id;
    private Long sessionId;
    private Long givenByEmployeeId;
    private String givenByName;
    private Integer rating;
    private String comments;
    private LocalDateTime createdAt;
}
