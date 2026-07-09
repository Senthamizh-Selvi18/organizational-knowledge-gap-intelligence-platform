package com.organizational.knowledge_gap_platform.service;

import java.util.List;

import com.organizational.knowledge_gap_platform.dto.SkillDTO;

public interface SkillService {

    List<SkillDTO> getAllSkills();

    SkillDTO getSkillById(Long id);

    SkillDTO createSkill(String skillName);

    SkillDTO updateSkill(Long id, String skillName);

    boolean deleteSkill(Long id);
}