package com.organizational.knowledge_gap_platform.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MentorshipRequestResponseDTO {

    private Long id;
    private Long mentorProfileId;
    private Long mentorEmployeeId;
    private String mentorName;
    private Long menteeEmployeeId;
    private String menteeName;
    private String message;
    private String status;
    private String responseNote;
    private LocalDateTime requestedAt;
    private LocalDateTime respondedAt;
}
