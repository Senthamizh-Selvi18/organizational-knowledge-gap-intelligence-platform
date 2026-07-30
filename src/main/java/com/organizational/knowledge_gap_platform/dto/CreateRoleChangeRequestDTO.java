package com.organizational.knowledge_gap_platform.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateRoleChangeRequestDTO {

    @NotNull(message = "User id is required")
    private Long userId;

    @NotNull(message = "Requested role id is required")
    private Long requestedRoleId;

    private String reason;
}