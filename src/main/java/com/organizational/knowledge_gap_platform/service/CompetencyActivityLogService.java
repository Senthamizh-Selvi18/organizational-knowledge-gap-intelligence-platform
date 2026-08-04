package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.CompetencyActivityLogResponseDTO;

import java.util.List;

public interface CompetencyActivityLogService {

    void log(String entityType, String entityName, String action, String description);

    List<CompetencyActivityLogResponseDTO> getRecentActivities(String entityType);

    List<CompetencyActivityLogResponseDTO> getAllActivity();
}