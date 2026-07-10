package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.DashboardStatsResponse;
import com.organizational.knowledge_gap_platform.dto.HeatmapResponse;

public interface DashboardService {

    DashboardStatsResponse getStats();

    HeatmapResponse getSkillGapHeatmap();
}