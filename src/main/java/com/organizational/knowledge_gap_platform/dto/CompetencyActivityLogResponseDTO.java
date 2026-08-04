package com.organizational.knowledge_gap_platform.dto;

import java.time.LocalDateTime;

public class CompetencyActivityLogResponseDTO {

    private Long id;
    private String entityType;
    private String entityName;
    private String action;
    private String description;
    private LocalDateTime createdAt;

    public CompetencyActivityLogResponseDTO(Long id, String entityType, String entityName,
                                             String action, String description, LocalDateTime createdAt) {
        this.id = id;
        this.entityType = entityType;
        this.entityName = entityName;
        this.action = action;
        this.description = description;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getEntityType() {
        return entityType;
    }

    public String getEntityName() {
        return entityName;
    }

    public String getAction() {
        return action;
    }

    public String getDescription() {
        return description;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}