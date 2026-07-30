package com.organizational.knowledge_gap_platform.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * Paginated notification response used by the Notification Center page
 * (getAllNotifications / searchNotifications).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NotificationPageResponseDTO {

    private List<NotificationResponseDTO> notifications;
    private long unreadCount;
    private long totalElements;
    private int totalPages;
    private int currentPage;
}