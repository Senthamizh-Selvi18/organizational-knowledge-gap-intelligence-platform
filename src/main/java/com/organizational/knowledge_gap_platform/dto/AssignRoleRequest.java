package com.organizational.knowledge_gap_platform.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AssignRoleRequest {

    @NotNull(message = "Role ID is required")
    private Long roleId;

}