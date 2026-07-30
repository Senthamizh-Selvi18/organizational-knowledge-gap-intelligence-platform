package com.organizational.knowledge_gap_platform.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class RecentActivityResponse {

    private Long id;
    private String description;
    private LocalDateTime createdAt;
}