package com.organizational.knowledge_gap_platform.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SessionStatusUpdateDTO {

    @NotBlank(message = "Status is required")
    private String status;

    private String notes;
}
