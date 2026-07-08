package com.organizational.knowledge_gap_platform.service;
import com.organizational.knowledge_gap_platform.dto.RoleSkillResponse;
import java.util.List;

public interface RoleSkillService {
    RoleSkillResponse assignSkillsToRole(Long roleId, List<Long> skillIds);
    RoleSkillResponse getRoleSkills(Long roleId);
}
