package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.NotificationListResponseDTO;
import com.organizational.knowledge_gap_platform.entity.Employee;
import com.organizational.knowledge_gap_platform.entity.User;

import java.time.LocalDate;
import java.util.List;

public interface NotificationService {

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
}
