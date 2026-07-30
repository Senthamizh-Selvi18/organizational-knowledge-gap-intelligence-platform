package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.TeamBuilderRecommendationDTO;
import com.organizational.knowledge_gap_platform.dto.TeamBuilderRequestDTO;

import java.util.List;

public interface TeamBuilderService {
    List<TeamBuilderRecommendationDTO> recommendTeam(TeamBuilderRequestDTO request);
}