package com.organizational.knowledge_gap_platform.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MentorshipSessionRequestDTO {

    @NotNull(message = "Mentorship request id is required")
    private Long mentorshipRequestId;

    @NotBlank(message = "Topic is required")
    private String topic;

    @NotNull(message = "Scheduled date/time is required")
    @Future(message = "Scheduled date/time must be in the future")
    private LocalDateTime scheduledAt;

    private Integer durationMinutes;

    private String meetingLink;

    private String notes;
}
