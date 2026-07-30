package com.organizational.knowledge_gap_platform.entity;

public enum NotificationType {

    // ---- Existing values (unchanged, still used by current features) ----
    SKILL_ASSIGNED,
    SKILL_UPDATED,
    GAP_ANALYSIS_COMPLETED,
    PROFILE_UPDATED,
    NEW_MESSAGE,
    ASSESSMENT_ASSIGNED,
    ASSESSMENT_REMINDER,
    ASSESSMENT_COMPLETED,

    // ---- New values added for the full Notification Module ----
    AI_RECOMMENDATION,
    TRAINING_ASSIGNED,
    TRAINING_DEADLINE,
    TRAINING_COMPLETED,
    CERTIFICATION_EXPIRING,
    CERTIFICATION_EXPIRED,
    NEW_CHAT_MESSAGE,
    MENTORSHIP,
    SYSTEM,
    ANNOUNCEMENT,
    SKILL_GAP,
    ASSESSMENT,

    // ---- Added for Employee/Role/Password triggers ----
    EMPLOYEE_CREATED,
    ROLE_CHANGED,
    PASSWORD_CHANGED
}