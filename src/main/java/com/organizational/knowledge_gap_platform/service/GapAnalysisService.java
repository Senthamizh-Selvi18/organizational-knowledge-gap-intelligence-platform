package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.GapAnalysisResponseDTO;

import java.util.List;

public interface GapAnalysisService {

    GapAnalysisResponseDTO analyzeGap(Long employeeId, Long roleId);
    List<GapAnalysisResponseDTO> analyzeGapForEmployee(Long employeeId);
}
