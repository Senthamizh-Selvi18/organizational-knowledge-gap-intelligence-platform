package com.organizational.knowledge_gap_platform.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class HeatmapResponse {

    private List<String> skills;
    private List<HeatmapRow> employees;

    @Getter
    @AllArgsConstructor
    public static class HeatmapRow {
        private String employee;
        private List<Integer> values; // 100 = has skill, 0 = missing
    }
}