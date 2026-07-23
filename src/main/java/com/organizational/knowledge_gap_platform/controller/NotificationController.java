package com.organizational.knowledge_gap_platform.controller;

import com.organizational.knowledge_gap_platform.dto.NotificationCreateRequestDTO;
import com.organizational.knowledge_gap_platform.dto.NotificationListResponseDTO;
import com.organizational.knowledge_gap_platform.dto.NotificationPageResponseDTO;
import com.organizational.knowledge_gap_platform.dto.NotificationResponseDTO;
import com.organizational.knowledge_gap_platform.entity.User;
import com.organizational.knowledge_gap_platform.repository.UserRepository;
import com.organizational.knowledge_gap_platform.service.NotificationService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public NotificationController(NotificationService notificationService,
                                   UserRepository userRepository) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    // =========================================================================================
    // ---- Existing endpoints (unchanged) ----
    // =========================================================================================

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

    // =========================================================================================
    // ---- New endpoints added for the full Notification Module ----
    // (userId-based, exact same pattern as the endpoints above)
    // =========================================================================================

    @GetMapping("/{userId}/all")
    public ResponseEntity<NotificationPageResponseDTO> getAllNotifications(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        return ResponseEntity.ok(notificationService.getAllNotifications(userId, page, size));
    }

    @GetMapping("/{userId}/unread-list")
    public ResponseEntity<List<NotificationResponseDTO>> getUnreadNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getUnreadNotifications(userId));
    }

    @GetMapping("/{userId}/search")
    public ResponseEntity<NotificationPageResponseDTO> searchNotifications(
            @PathVariable Long userId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) Boolean isRead,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        return ResponseEntity.ok(notificationService.searchNotifications(
                userId, keyword, type, priority, isRead, startDate, endDate, page, size));
    }

    @DeleteMapping("/{userId}/{notificationId}")
    public ResponseEntity<String> deleteNotification(
            @PathVariable Long userId,
            @PathVariable Long notificationId) {

        notificationService.deleteNotification(userId, notificationId);
        return ResponseEntity.ok("Notification deleted.");
    }

    @DeleteMapping("/{userId}/clear")
    public ResponseEntity<String> clearAllNotifications(@PathVariable Long userId) {
        notificationService.clearAllNotifications(userId);
        return ResponseEntity.ok("All notifications cleared.");
    }

    /**
     * Administrative / system creation endpoint. Recipient is identified in the request
     * body (not the caller), so it isn't gated by the {userId}-ownership pattern above.
     * RECOMMENDATION: restrict this to admin/system roles in SecurityConfig
     * (e.g. an antMatcher for POST /api/notifications/create) — I have not touched
     * SecurityConfig myself since I don't have that file.
     */
    @PostMapping("/create")
    public ResponseEntity<NotificationResponseDTO> createNotification(
            @RequestBody NotificationCreateRequestDTO request) {

        NotificationResponseDTO created = notificationService.createNotification(
                request.getRecipientUserId(),
                request.getType(),
                request.getTitle(),
                request.getMessage(),
                request.getPriority(),
                request.getActionUrl(),
                request.getRelatedEntityId()
        );

        return ResponseEntity.ok(created);
    }

    // =========================================================================================
    // ---- No-path-variable routes from the master spec (current user resolved from JWT) ----
    //
    // Now that UserRepository.java is available, these resolve "who is calling" the same
    // way AuthService does (findByEmail against the authenticated principal's email) and
    // simply delegate to the exact same NotificationService methods used above — so there
    // is no second notification system and no duplicated business logic. Each route below
    // has a different URL "shape" (segment count) than its {userId}-based sibling, so both
    // sets of routes coexist without any mapping ambiguity.
    // =========================================================================================

    @GetMapping
    public ResponseEntity<NotificationPageResponseDTO> getAllNotificationsForCurrentUser(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Long userId = resolveCurrentUserId();
        return ResponseEntity.ok(notificationService.getAllNotifications(userId, page, size));
    }

    @GetMapping("/unread")
    public ResponseEntity<List<NotificationResponseDTO>> getUnreadNotificationsForCurrentUser() {
        Long userId = resolveCurrentUserId();
        return ResponseEntity.ok(notificationService.getUnreadNotifications(userId));
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getUnreadCountForCurrentUser() {
        Long userId = resolveCurrentUserId();
        return ResponseEntity.ok(notificationService.getUnreadCount(userId));
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<String> markAsReadForCurrentUser(@PathVariable Long notificationId) {
        Long userId = resolveCurrentUserId();
        notificationService.markAsRead(userId, notificationId);
        return ResponseEntity.ok("Notification marked as read.");
    }

    @PutMapping("/read-all")
    public ResponseEntity<String> markAllAsReadForCurrentUser() {
        Long userId = resolveCurrentUserId();
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok("All notifications marked as read.");
    }

    @DeleteMapping("/{notificationId}")
    public ResponseEntity<String> deleteNotificationForCurrentUser(@PathVariable Long notificationId) {
        Long userId = resolveCurrentUserId();
        notificationService.deleteNotification(userId, notificationId);
        return ResponseEntity.ok("Notification deleted.");
    }

    @DeleteMapping("/clear")
    public ResponseEntity<String> clearAllNotificationsForCurrentUser() {
        Long userId = resolveCurrentUserId();
        notificationService.clearAllNotifications(userId);
        return ResponseEntity.ok("All notifications cleared.");
    }

    // =========================================================================================
    // ---- Internal helper ----
    // =========================================================================================

    /**
     * Resolves the calling user's id from the JWT-authenticated principal, using the same
     * findByEmail() lookup AuthService already relies on. This mirrors the ownership checks
     * NotificationServiceImpl performs internally (it re-validates the user on every call),
     * so there is no change to authorization behavior — this only saves the frontend from
     * having to pass userId on every request.
     */
    private Long resolveCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String loggedInUserEmail = authentication.getName();

        User user = userRepository.findByEmail(loggedInUserEmail)
                .orElseThrow(() -> new RuntimeException(
                        "No user found for authenticated principal: " + loggedInUserEmail));

        return user.getId();
    }
}