package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.CompetencyResponseDTO;

import java.util.List;

public interface CompetencyService {

    List<CompetencyResponseDTO> getEmployeeCompetencies(Long employeeId);
}