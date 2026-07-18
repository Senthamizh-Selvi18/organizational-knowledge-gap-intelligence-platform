package com.organizational.knowledge_gap_platform.dto;

import com.organizational.knowledge_gap_platform.entity.RequestStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class RoleChangeRequestResponse {

    private Long id;

    private Long userId;
    private String userName;
    private String userEmail;

    private Long currentRoleId;
    private String currentRoleName;

    private Long requestedRoleId;
    private String requestedRoleName;

    private RequestStatus status;
    private String reason;

    private LocalDateTime requestedAt;
    private LocalDateTime reviewedAt;
    private String reviewedBy;
}