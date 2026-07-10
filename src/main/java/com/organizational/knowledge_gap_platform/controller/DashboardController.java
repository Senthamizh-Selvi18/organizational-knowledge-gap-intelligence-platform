package com.organizational.knowledge_gap_platform.controller;

import com.organizational.knowledge_gap_platform.dto.DashboardStatsResponse;
import com.organizational.knowledge_gap_platform.dto.HeatmapResponse;
import com.organizational.knowledge_gap_platform.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getStats() {
        return ResponseEntity.ok(dashboardService.getStats());
    }

    @GetMapping("/skill-gap-heatmap")
    public ResponseEntity<HeatmapResponse> getHeatmap() {
        return ResponseEntity.ok(dashboardService.getSkillGapHeatmap());
    }
}