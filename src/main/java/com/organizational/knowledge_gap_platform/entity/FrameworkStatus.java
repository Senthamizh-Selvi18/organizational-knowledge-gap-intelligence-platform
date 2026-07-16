package com.organizational.knowledge_gap_platform.entity;

/**
 * Lifecycle state of a CompetencyFramework version.
 * DRAFT   - editable, not yet visible to the org.
 * PUBLISHED - active/live framework used for gap analysis.
 * ARCHIVED - superseded by a newer version or retired.
 */
public enum FrameworkStatus {
    DRAFT,
    PUBLISHED,
    ARCHIVED
}
