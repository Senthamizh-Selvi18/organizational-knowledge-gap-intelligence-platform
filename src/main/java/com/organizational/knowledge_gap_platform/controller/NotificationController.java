package com.organizational.knowledge_gap_platform.controller;

import com.organizational.knowledge_gap_platform.dto.NotificationListResponseDTO;
import com.organizational.knowledge_gap_platform.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<NotificationListResponseDTO> getRecentNotifications(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "20") int limit) {

        return ResponseEntity.ok(notificationService.getRecentNotifications(userId, limit));
    }

    @GetMapping("/{userId}/unread-count")
    public ResponseEntity<Long> getUnreadCount(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getUnreadCount(userId));
    }

    @PutMapping("/{userId}/{notificationId}/read")
    public ResponseEntity<String> markAsRead(
            @PathVariable Long userId,
            @PathVariable Long notificationId) {

        notificationService.markAsRead(userId, notificationId);
        return ResponseEntity.ok("Notification marked as read.");
    }

    @PutMapping("/{userId}/read-all")
    public ResponseEntity<String> markAllAsRead(@PathVariable Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok("All notifications marked as read.");
    }
}