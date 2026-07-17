package com.organizational.knowledge_gap_platform.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class ActivityLogResponseDTO {

    private Long id;

    private String description;

    private LocalDateTime createdAt;
}