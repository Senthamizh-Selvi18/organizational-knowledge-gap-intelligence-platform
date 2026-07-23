package com.organizational.knowledge_gap_platform.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MentorshipRequestCreateDTO {

    @NotNull(message = "Mentor profile id is required")
    private Long mentorProfileId;

    private String message;
}