package com.organizational.knowledge_gap_platform.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class DashboardStatsResponse {

    private long totalSkills;
    private long employeeSkillsAssigned;
}