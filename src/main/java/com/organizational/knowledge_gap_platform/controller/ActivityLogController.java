package com.organizational.knowledge_gap_platform.controller;

import com.organizational.knowledge_gap_platform.dto.ActivityLogResponseDTO;
import com.organizational.knowledge_gap_platform.service.ActivityLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
public class ActivityLogController {

    private final ActivityLogService activityLogService;

    public ActivityLogController(ActivityLogService activityLogService) {
        this.activityLogService = activityLogService;
    }

    @GetMapping("/{employeeId}/activities")
    public ResponseEntity<List<ActivityLogResponseDTO>> getRecentActivities(@PathVariable Long employeeId) {
        return ResponseEntity.ok(activityLogService.getRecentActivities(employeeId));
    }
}