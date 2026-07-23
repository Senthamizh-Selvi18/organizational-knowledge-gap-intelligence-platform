package com.organizational.knowledge_gap_platform.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class CompetencyAnalyticsResponse {

    private long totalCompetencies;
    private List<CompetencyItem> competencies;

    @Getter
    @AllArgsConstructor
    public static class CompetencyItem {
        private Long competencyId;
        private Long skillId;
        private String skillName;
        private String level;
    }
}