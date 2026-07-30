package com.organizational.knowledge_gap_platform.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MentorshipRequestDecisionDTO {

    @NotNull(message = "Decision (ACCEPTED or DECLINED) is required")
    private String decision;

    private String responseNote;
}
