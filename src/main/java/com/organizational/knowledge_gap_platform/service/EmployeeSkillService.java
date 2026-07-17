package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.AssignSkillsRequestDTO;
import com.organizational.knowledge_gap_platform.dto.EmployeeSkillResponseDTO;

import java.util.List;

public interface EmployeeSkillService {

    void assignSkills(Long employeeId, AssignSkillsRequestDTO request);

    void updateSkills(Long employeeId, AssignSkillsRequestDTO request);

    List<EmployeeSkillResponseDTO> getEmployeeSkills(Long employeeId);
}