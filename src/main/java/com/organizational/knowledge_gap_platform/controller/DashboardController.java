package com.organizational.knowledge_gap_platform.controller;

import com.organizational.knowledge_gap_platform.dto.DashboardStatsResponse;
import com.organizational.knowledge_gap_platform.dto.HeatmapResponse;
import com.organizational.knowledge_gap_platform.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.organizational.knowledge_gap_platform.dto.CompetencyAnalyticsResponse;
import com.organizational.knowledge_gap_platform.dto.RecentActivityResponse;

import java.util.List;
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
    @GetMapping("/employee/{employeeId}/competency-analytics")
    public ResponseEntity<CompetencyAnalyticsResponse> getEmployeeCompetencies(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                dashboardService.getEmployeeCompetencies(employeeId)
        );
    }

    @GetMapping("/employee/{employeeId}/recent-activity")
    public ResponseEntity<List<RecentActivityResponse>> getEmployeeRecentActivity(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                dashboardService.getEmployeeRecentActivity(employeeId)
        );
    }
}