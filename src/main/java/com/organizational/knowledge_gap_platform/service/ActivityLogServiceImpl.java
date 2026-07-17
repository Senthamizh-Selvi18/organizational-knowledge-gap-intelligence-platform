package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.ActivityLogResponseDTO;
import com.organizational.knowledge_gap_platform.entity.ActivityLog;
import com.organizational.knowledge_gap_platform.entity.Employee;
import com.organizational.knowledge_gap_platform.repository.ActivityLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ActivityLogServiceImpl implements ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    public ActivityLogServiceImpl(ActivityLogRepository activityLogRepository) {
        this.activityLogRepository = activityLogRepository;
    }

    @Override
    @Transactional
    public void logActivity(Employee employee, String description) {

        if (employee == null || description == null || description.isBlank()) {
            return;
        }

        ActivityLog log = new ActivityLog();
        log.setEmployee(employee);
        log.setDescription(description);
        log.setCreatedAt(LocalDateTime.now());

        activityLogRepository.save(log);
    }

    @Override
    public List<ActivityLogResponseDTO> getRecentActivities(Long employeeId) {

        return activityLogRepository.findTop10ByEmployeeIdOrderByCreatedAtDesc(employeeId)
                .stream()
                .map(log -> new ActivityLogResponseDTO(
                        log.getId(),
                        log.getDescription(),
                        log.getCreatedAt()
                ))
                .toList();
    }
}