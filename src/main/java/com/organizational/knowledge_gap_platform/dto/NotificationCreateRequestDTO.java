package com.organizational.knowledge_gap_platform.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Request body for POST /api/notifications/create.
 * Used by NotificationController.createNotification() to build a notification
 * for any recipient/type via NotificationService.createNotification(...).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NotificationCreateRequestDTO {

    private Long recipientUserId;
    private String type;
    private String title;
    private String message;
    private String priority;
    private String actionUrl;
    private Long relatedEntityId;
}