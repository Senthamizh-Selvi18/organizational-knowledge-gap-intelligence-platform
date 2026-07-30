package com.organizational.knowledge_gap_platform.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MentorshipSessionResponseDTO {

    private Long id;
    private Long mentorshipRequestId;
    private Long mentorEmployeeId;
    private String mentorName;
    private Long menteeEmployeeId;
    private String menteeName;
    private String topic;
    private LocalDateTime scheduledAt;
    private Integer durationMinutes;
    private String meetingLink;
    private String notes;
    private String status;
    private LocalDateTime createdAt;
    private boolean feedbackSubmitted;
}
