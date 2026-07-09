package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.SkillDTO;

import java.util.List;

public interface SkillService {

    List<SkillDTO> getAllSkills();

    SkillDTO getSkillById(Long id);

    SkillDTO createSkill(String skillName);

    SkillDTO updateSkill(Long id, String skillName);

    boolean deleteSkill(Long id);
}
