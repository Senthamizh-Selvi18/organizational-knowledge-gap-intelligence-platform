package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.CompetencyActivityLogResponseDTO;
import com.organizational.knowledge_gap_platform.entity.CompetencyActivityLog;
import com.organizational.knowledge_gap_platform.repository.CompetencyActivityLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CompetencyActivityLogServiceImpl implements CompetencyActivityLogService {

    private static final Logger log4j = LoggerFactory.getLogger(CompetencyActivityLogServiceImpl.class);

    private final CompetencyActivityLogRepository activityLogRepository;

    public CompetencyActivityLogServiceImpl(CompetencyActivityLogRepository activityLogRepository) {
        this.activityLogRepository = activityLogRepository;
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String entityType, String entityName, String action, String description) {

        if (entityType == null || action == null) {
            return;
        }

        try {
            CompetencyActivityLog activityLog = new CompetencyActivityLog();
            activityLog.setEntityType(entityType);
            activityLog.setEntityName(entityName);
            activityLog.setAction(action);
            activityLog.setDescription(description);
            activityLog.setCreatedAt(LocalDateTime.now());

            activityLogRepository.save(activityLog);
        } catch (Exception ex) {
            log4j.error("Failed to record activity log entry (entityType={}, action={}, entityName={}) "
                            + "— the primary operation is unaffected.",
                    entityType, action, entityName, ex);
        }
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