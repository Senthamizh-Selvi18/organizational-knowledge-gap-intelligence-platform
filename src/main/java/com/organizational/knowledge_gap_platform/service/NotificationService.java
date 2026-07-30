package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.NotificationListResponseDTO;
import com.organizational.knowledge_gap_platform.dto.NotificationPageResponseDTO;
import com.organizational.knowledge_gap_platform.dto.NotificationResponseDTO;
import com.organizational.knowledge_gap_platform.entity.Employee;
import com.organizational.knowledge_gap_platform.entity.User;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface NotificationService {

    // ---- Existing methods (unchanged, still used by current features) ----

    NotificationListResponseDTO getRecentNotifications(Long userId, int limit);

    long getUnreadCount(Long userId);

    void markAsRead(Long userId, Long notificationId);

    void markAllAsRead(Long userId);

    void notifySkillAssigned(Employee employee, List<String> skillNames);

    void notifySkillUpdated(Employee employee, List<String> skillNames);

    void notifyGapAnalysisCompleted(Employee employee, String roleName);

    void notifyProfileUpdated(User user);

    void notifyNewMessage(User sender, User receiver, String messagePreview);

    void notifyAssessmentAssigned(User assessor, String subjectName, String assessmentTypeLabel, LocalDate dueDate, Long assessmentId);

    void notifyAssessmentReminder(User assessor, String subjectName, LocalDate dueDate, Long assessmentId);

    void notifyAssessmentCompleted(Employee subjectEmployee, String assessmentTypeLabel, String assessorName, Long assessmentId);

    // ---- New methods added for the full Notification Module ----

    /** Full paginated list for the Notification Center page. */
    NotificationPageResponseDTO getAllNotifications(Long userId, int page, int size);

    /** Every unread notification (not just the count) for the bell dropdown. */
    List<NotificationResponseDTO> getUnreadNotifications(Long userId);

    /** Search + filter by keyword / type / priority / read-status / date range. */
    NotificationPageResponseDTO searchNotifications(Long userId, String keyword, String type, String priority,
                                                     Boolean isRead, LocalDateTime startDate, LocalDateTime endDate,
                                                     int page, int size);

    void deleteNotification(Long userId, Long notificationId);

    void clearAllNotifications(Long userId);

    /**
     * Generic creation path used by POST /api/notifications/create and available
     * for any future integration (schedulers, other services) to raise a notification
     * of any type without needing a dedicated notifyXxx() method.
     */
    NotificationResponseDTO createNotification(Long recipientUserId, String type, String title, String message,
                                                String priority, String actionUrl, Long relatedEntityId);
}