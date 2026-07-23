package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.NotificationListResponseDTO;
import com.organizational.knowledge_gap_platform.dto.NotificationPageResponseDTO;
import com.organizational.knowledge_gap_platform.dto.NotificationResponseDTO;
import com.organizational.knowledge_gap_platform.entity.Employee;
import com.organizational.knowledge_gap_platform.entity.Notification;
import com.organizational.knowledge_gap_platform.entity.NotificationPriority;
import com.organizational.knowledge_gap_platform.entity.NotificationType;
import com.organizational.knowledge_gap_platform.entity.User;
import com.organizational.knowledge_gap_platform.exception.NotificationNotFoundException;
import com.organizational.knowledge_gap_platform.repository.NotificationRepository;
import com.organizational.knowledge_gap_platform.repository.NotificationSpecifications;
import com.organizational.knowledge_gap_platform.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationServiceImpl implements NotificationService {

    private static final DateTimeFormatter DUE_DATE_FORMAT = DateTimeFormatter.ofPattern("MMM d, yyyy");

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationServiceImpl(NotificationRepository notificationRepository,
                                    UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    // =========================================================================================
    // ---- Existing methods (unchanged behavior) ----
    // =========================================================================================

    @Override
    public NotificationListResponseDTO getRecentNotifications(Long userId, int limit) {
        User user = requireOwnedUser(userId);

        Pageable pageable = PageRequest.of(0, Math.max(limit, 1));
        List<Notification> notifications = notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(user.getId(), pageable);

        List<NotificationResponseDTO> dtos = notifications.stream()
                .map(this::toDto)
                .collect(Collectors.toList());

        long unreadCount = notificationRepository.countByRecipientIdAndIsReadFalse(user.getId());

        return new NotificationListResponseDTO(dtos, unreadCount);
    }

    @Override
    public long getUnreadCount(Long userId) {
        User user = requireOwnedUser(userId);
        return notificationRepository.countByRecipientIdAndIsReadFalse(user.getId());
    }

    @Override
    @Transactional
    public void markAsRead(Long userId, Long notificationId) {
        User user = requireOwnedUser(userId);

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NotificationNotFoundException(
                        "Notification not found with id: " + notificationId));

        if (!notification.getRecipient().getId().equals(user.getId())) {
            throw new AccessDeniedException("You are not authorized to update this notification.");
        }

        if (!notification.isRead()) {
            notification.setRead(true);
            notificationRepository.save(notification);
        }
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        User user = requireOwnedUser(userId);

        List<Notification> unread = notificationRepository.findByRecipientIdAndIsReadFalse(user.getId());
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    @Override
    @Transactional
    public void notifySkillAssigned(Employee employee, List<String> skillNames) {
        if (skillNames == null || skillNames.isEmpty()) {
            return;
        }
        create(employee.getUser(), NotificationType.SKILL_ASSIGNED,
                "New skill(s) assigned",
                "You have been assigned: " + String.join(", ", skillNames),
                employee.getId(), NotificationPriority.MEDIUM, null);
    }

    @Override
    @Transactional
    public void notifySkillUpdated(Employee employee, List<String> skillNames) {
        String skillList = (skillNames == null || skillNames.isEmpty())
                ? "your skill list"
                : String.join(", ", skillNames);

        create(employee.getUser(), NotificationType.SKILL_UPDATED,
                "Skills updated",
                "Your skills have been updated: " + skillList,
                employee.getId(), NotificationPriority.MEDIUM, null);
    }

    @Override
    @Transactional
    public void notifyGapAnalysisCompleted(Employee employee, String roleName) {
        create(employee.getUser(), NotificationType.GAP_ANALYSIS_COMPLETED,
                "Gap analysis completed",
                "Your gap analysis for the role \"" + roleName + "\" is ready to view.",
                employee.getId(), NotificationPriority.MEDIUM, null);
    }

    @Override
    @Transactional
    public void notifyProfileUpdated(User user) {
        create(user, NotificationType.PROFILE_UPDATED,
                "Profile updated",
                "Your profile information was updated successfully.",
                user.getId(), NotificationPriority.LOW, null);
    }
    @Override
    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public void notifyNewMessage(User sender, User receiver, String messagePreview) {
        System.out.println("### notifyNewMessage() ENTERED: senderId=" + (sender != null ? sender.getId() : "NULL")
                + " receiverId=" + (receiver != null ? receiver.getId() : "NULL"));

        String preview = messagePreview == null ? "" : messagePreview.trim();
        if (preview.length() > 100) {
            preview = preview.substring(0, 100) + "...";
        }

        create(receiver, NotificationType.NEW_MESSAGE,
                "New message from " + sender.getName(),
                preview,
                sender.getId(), NotificationPriority.MEDIUM, null);
    }
    @Override
    @Transactional
    public void notifyAssessmentAssigned(User assessor, String subjectName, String assessmentTypeLabel,
                                          LocalDate dueDate, Long assessmentId) {
        String dueText = dueDate != null ? " Due by " + dueDate.format(DUE_DATE_FORMAT) + "." : "";
        create(assessor, NotificationType.ASSESSMENT_ASSIGNED,
                "New " + assessmentTypeLabel + " assessment assigned",
                "You have been asked to complete a " + assessmentTypeLabel.toLowerCase()
                        + " assessment for " + subjectName + "." + dueText,
                assessmentId, NotificationPriority.MEDIUM, null);
    }

    @Override
    @Transactional
    public void notifyAssessmentReminder(User assessor, String subjectName, LocalDate dueDate, Long assessmentId) {
        String dueText = dueDate != null ? " It is due by " + dueDate.format(DUE_DATE_FORMAT) + "." : "";
        create(assessor, NotificationType.ASSESSMENT_REMINDER,
                "Assessment reminder",
                "Your assessment for " + subjectName + " is still pending." + dueText,
                assessmentId, NotificationPriority.HIGH, null);
    }

    @Override
    @Transactional
    public void notifyAssessmentCompleted(Employee subjectEmployee, String assessmentTypeLabel,
                                           String assessorName, Long assessmentId) {
        create(subjectEmployee.getUser(), NotificationType.ASSESSMENT_COMPLETED,
                assessmentTypeLabel + " assessment completed",
                assessorName + " completed a " + assessmentTypeLabel.toLowerCase()
                        + " assessment for you. Your skill gaps have been recalculated.",
                assessmentId, NotificationPriority.MEDIUM, null);
    }

    // =========================================================================================
    // ---- New methods added for the full Notification Module ----
    // =========================================================================================

    @Override
    public NotificationPageResponseDTO getAllNotifications(Long userId, int page, int size) {
        User user = requireOwnedUser(userId);

        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1),
                Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Notification> result = notificationRepository.findByRecipientId(user.getId(), pageable);
        long unreadCount = notificationRepository.countByRecipientIdAndIsReadFalse(user.getId());

        return toPageDto(result, unreadCount);
    }

    @Override
    public List<NotificationResponseDTO> getUnreadNotifications(Long userId) {
        User user = requireOwnedUser(userId);
        return notificationRepository.findByRecipientIdAndIsReadFalseOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public NotificationPageResponseDTO searchNotifications(Long userId, String keyword, String type, String priority,
                                                             Boolean isRead, LocalDateTime startDate, LocalDateTime endDate,
                                                             int page, int size) {
        User user = requireOwnedUser(userId);

        NotificationType typeFilter = parseTypeOrNull(type);
        NotificationPriority priorityFilter = parsePriorityOrNull(priority);
        String keywordFilter = (keyword == null || keyword.isBlank()) ? null : keyword.trim();

        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1),
                Sort.by(Sort.Direction.DESC, "createdAt"));

        Specification<Notification> spec = NotificationSpecifications.forSearch(
                user.getId(), typeFilter, priorityFilter, isRead, keywordFilter, startDate, endDate);

        Page<Notification> result = notificationRepository.findAll(spec, pageable);

        long unreadCount = notificationRepository.countByRecipientIdAndIsReadFalse(user.getId());

        return toPageDto(result, unreadCount);
    }

    @Override
    @Transactional
    public void deleteNotification(Long userId, Long notificationId) {
        User user = requireOwnedUser(userId);

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NotificationNotFoundException(
                        "Notification not found with id: " + notificationId));

        if (!notification.getRecipient().getId().equals(user.getId())) {
            throw new AccessDeniedException("You are not authorized to delete this notification.");
        }

        notificationRepository.delete(notification);
    }

    @Override
    @Transactional
    public void clearAllNotifications(Long userId) {
        User user = requireOwnedUser(userId);
        List<Notification> all = notificationRepository.findByRecipientId(user.getId());
        notificationRepository.deleteAll(all);
    }

    @Override
    @Transactional
    public NotificationResponseDTO createNotification(Long recipientUserId, String type, String title,
                                                        String message, String priority, String actionUrl,
                                                        Long relatedEntityId) {
        System.out.println("### createNotification() ENTERED: recipientUserId=" + recipientUserId + " type=" + type);

        User recipient = userRepository.findById(recipientUserId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + recipientUserId));

        NotificationType notificationType;
        try {
            notificationType = NotificationType.valueOf(type.trim().toUpperCase());
        } catch (IllegalArgumentException | NullPointerException ex) {
            System.out.println("### createNotification() BAD TYPE: '" + type + "' is not a valid NotificationType");
            throw new IllegalArgumentException("Unknown notification type: " + type);
        }

        NotificationPriority notificationPriority = parsePriorityOrNull(priority);
        if (notificationPriority == null) {
            notificationPriority = NotificationPriority.MEDIUM;
        }

        Notification notification = create(recipient, notificationType, title, message,
                relatedEntityId, notificationPriority, actionUrl);

        return toDto(notification);
    }

    // =========================================================================================
    // ---- Internal helpers ----
    // =========================================================================================

    private Notification create(User recipient, NotificationType type, String title, String message,
                                 Long relatedEntityId, NotificationPriority priority, String actionUrl) {
        System.out.println("### NOTIFICATION CREATE CALLED: type=" + type
                + " recipientId=" + (recipient != null ? recipient.getId() : "NULL_RECIPIENT"));
        try {
            Notification notification = new Notification();
            notification.setRecipient(recipient);
            notification.setType(type);
            notification.setTitle(title);
            notification.setMessage(message);
            notification.setRelatedEntityId(relatedEntityId);
            notification.setRead(false);
            notification.setPriority(priority != null ? priority : NotificationPriority.MEDIUM);
            notification.setActionUrl(actionUrl);
            notification.setCreatedAt(LocalDateTime.now());

            Notification saved = notificationRepository.saveAndFlush(notification);
            System.out.println("### NOTIFICATION SAVED SUCCESSFULLY: id=" + saved.getId()
                    + " type=" + type + " recipientId=" + recipient.getId());
            return saved;
        } catch (Exception ex) {
            System.out.println("### NOTIFICATION SAVE FAILED: type=" + type
                    + " error=" + ex.getClass().getName() + " message=" + ex.getMessage());
            ex.printStackTrace();
            throw ex;
        }
    }

    private User requireOwnedUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String loggedInUserEmail = authentication.getName();

        if (!user.getEmail().equals(loggedInUserEmail)) {
            throw new AccessDeniedException("You are not authorized to access these notifications.");
        }

        return user;
    }

    private NotificationType parseTypeOrNull(String type) {
        if (type == null || type.isBlank()) {
            return null;
        }
        try {
            return NotificationType.valueOf(type.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return null; // unknown filter value -> treated as "no filter" rather than erroring the search
        }
    }

    private NotificationPriority parsePriorityOrNull(String priority) {
        if (priority == null || priority.isBlank()) {
            return null;
        }
        try {
            return NotificationPriority.valueOf(priority.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private NotificationPageResponseDTO toPageDto(Page<Notification> page, long unreadCount) {
        List<NotificationResponseDTO> dtos = page.getContent().stream()
                .map(this::toDto)
                .collect(Collectors.toList());

        return new NotificationPageResponseDTO(
                dtos,
                unreadCount,
                page.getTotalElements(),
                page.getTotalPages(),
                page.getNumber()
        );
    }

    private NotificationResponseDTO toDto(Notification notification) {
        return new NotificationResponseDTO(
                notification.getId(),
                notification.getType().name(),
                notification.getTitle(),
                notification.getMessage(),
                notification.isRead(),
                notification.getCreatedAt(),
                formatTimeAgo(notification.getCreatedAt()),
                notification.getPriority() != null ? notification.getPriority().name() : NotificationPriority.MEDIUM.name(),
                notification.getActionUrl(),
                notification.getRelatedEntityId()
        );
    }

    private String formatTimeAgo(LocalDateTime createdAt) {
        LocalDateTime now = LocalDateTime.now();
        long minutes = Duration.between(createdAt, now).toMinutes();

        if (minutes < 1) {
            return "Just now";
        }
        if (minutes < 60) {
            return minutes + (minutes == 1 ? " min ago" : " mins ago");
        }

        long hours = minutes / 60;
        if (hours < 24) {
            return hours + (hours == 1 ? " hour ago" : " hours ago");
        }

        long days = ChronoUnit.DAYS.between(createdAt.toLocalDate(), now.toLocalDate());
        if (days == 1) {
            return "Yesterday";
        }
        if (days < 7) {
            return days + " days ago";
        }

        long weeks = days / 7;
        if (days < 30) {
            return weeks + (weeks == 1 ? " week ago" : " weeks ago");
        }

        long months = days / 30;
        if (days < 365) {
            return months + (months == 1 ? " month ago" : " months ago");
        }

        long years = days / 365;
        return years + (years == 1 ? " year ago" : " years ago");
    }
}