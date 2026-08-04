package com.organizational.knowledge_gap_platform.controller;

import com.organizational.knowledge_gap_platform.dto.CompetencyActivityLogResponseDTO;
import com.organizational.knowledge_gap_platform.service.CompetencyActivityLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/competency/activity-history")
public class CompetencyActivityLogController {

    private final CompetencyActivityLogService activityLogService;

    public CompetencyActivityLogController(CompetencyActivityLogService activityLogService) {
        this.activityLogService = activityLogService;
    }

    @GetMapping
    public ResponseEntity<List<CompetencyActivityLogResponseDTO>> getAllActivity() {
        return ResponseEntity.ok(activityLogService.getAllActivity());
    }
}