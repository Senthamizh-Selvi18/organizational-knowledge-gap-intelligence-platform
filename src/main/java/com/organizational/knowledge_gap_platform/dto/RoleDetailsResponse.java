package com.organizational.knowledge_gap_platform.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.Column;

@Getter
@Setter
public class RoleDetailsResponse {

    private Long id;

    private String roleName;

    private List<UserSummary> users;

    private int totalUsers;

    @Column(name = "description")
private String description;

private LocalDateTime createdAt;

private Boolean active;
}