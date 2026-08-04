package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.CompetencyActivityLogResponseDTO;
import com.organizational.knowledge_gap_platform.entity.CompetencyActivityLog;
import com.organizational.knowledge_gap_platform.repository.CompetencyActivityLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CompetencyActivityLogServiceImpl implements CompetencyActivityLogService {

    private final CompetencyActivityLogRepository activityLogRepository;

    public CompetencyActivityLogServiceImpl(CompetencyActivityLogRepository activityLogRepository) {
        this.activityLogRepository = activityLogRepository;
    }

    @Override
    @Transactional
    public void log(String entityType, String entityName, String action, String description) {

        if (entityType == null || action == null) {
            return;
        }

        CompetencyActivityLog log = new CompetencyActivityLog();
        log.setEntityType(entityType);
        log.setEntityName(entityName);
        log.setAction(action);
        log.setDescription(description);
        log.setCreatedAt(LocalDateTime.now());

        activityLogRepository.save(log);
    }

    @Override
    public List<CompetencyActivityLogResponseDTO> getRecentActivities(String entityType) {

        return activityLogRepository.findTop10ByEntityTypeOrderByCreatedAtDesc(entityType)
                .stream()
                .map(log -> new CompetencyActivityLogResponseDTO(
                        log.getId(),
                        log.getEntityType(),
                        log.getEntityName(),
                        log.getAction(),
                        log.getDescription(),
                        log.getCreatedAt()
                ))
                .toList();
    }

    @Override
    public List<CompetencyActivityLogResponseDTO> getAllActivity() {

        return activityLogRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(log -> new CompetencyActivityLogResponseDTO(
                        log.getId(),
                        log.getEntityType(),
                        log.getEntityName(),
                        log.getAction(),
                        log.getDescription(),
                        log.getCreatedAt()
                ))
                .toList();
    }
}