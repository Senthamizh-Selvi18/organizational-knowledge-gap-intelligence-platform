package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.CompetencyAnalyticsResponse;
import com.organizational.knowledge_gap_platform.dto.DashboardStatsResponse;
import com.organizational.knowledge_gap_platform.dto.HeatmapResponse;
import com.organizational.knowledge_gap_platform.dto.RecentActivityResponse;

import java.util.List;

public interface DashboardService {

    DashboardStatsResponse getStats();

    HeatmapResponse getSkillGapHeatmap();

    CompetencyAnalyticsResponse getEmployeeCompetencies(Long employeeId);

    List<RecentActivityResponse> getEmployeeRecentActivity(Long employeeId);
}