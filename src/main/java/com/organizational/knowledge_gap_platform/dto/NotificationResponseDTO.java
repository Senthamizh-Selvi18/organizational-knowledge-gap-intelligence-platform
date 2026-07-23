package com.organizational.knowledge_gap_platform.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponseDTO {

    private Long id;
    private String type;
    private String title;
    private String message;
    private boolean read;
    private LocalDateTime createdAt;
    private String timeAgo;

    // NEW fields
    private String priority;
    private String actionUrl;
    private Long relatedEntityId;
}