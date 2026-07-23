package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.ActivityLogResponseDTO;
import com.organizational.knowledge_gap_platform.entity.Employee;

import java.util.List;

public interface ActivityLogService {

    void logActivity(Employee employee, String description);

    List<ActivityLogResponseDTO> getRecentActivities(Long employeeId);
}