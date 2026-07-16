package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.RoleSkillRequirementRequestDTO;
import com.organizational.knowledge_gap_platform.dto.RoleSkillRequirementResponseDTO;

import java.util.List;

public interface RoleSkillRequirementService {

    List<RoleSkillRequirementResponseDTO> getByRole(Long roleId);

    RoleSkillRequirementResponseDTO upsert(RoleSkillRequirementRequestDTO request);

    void delete(Long id);
}