package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.SkillDTO;
import com.organizational.knowledge_gap_platform.entity.Skill;
import com.organizational.knowledge_gap_platform.exception.SkillNotFoundException;
import com.organizational.knowledge_gap_platform.repository.SkillRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SkillServiceImpl implements SkillService {

    private final SkillRepository skillRepository;

    public SkillServiceImpl(SkillRepository skillRepository) {
        this.skillRepository = skillRepository;
    }

    @Override
    public List<SkillDTO> getAllSkills() {
        return skillRepository.findAll().stream()
                .map(SkillDTO::fromEntity)
                .toList();
    }

    @Override
    public SkillDTO getSkillById(Long id) {
        return SkillDTO.fromEntity(getSkillOrThrow(id));
    }

    @Override
    public SkillDTO createSkill(String skillName) {
        String trimmedName = skillName.trim();

        if (skillRepository.existsBySkillNameIgnoreCase(trimmedName)) {
            throw new RuntimeException("A skill named '" + trimmedName + "' already exists.");
        }

        Skill skill = new Skill();
        skill.setSkillName(trimmedName);

        return SkillDTO.fromEntity(skillRepository.save(skill));
    }

    @Override
    public SkillDTO updateSkill(Long id, String skillName) {
        Skill skill = getSkillOrThrow(id);
        String trimmedName = skillName.trim();

        skillRepository.findBySkillNameIgnoreCase(trimmedName)
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new RuntimeException("A skill named '" + trimmedName + "' already exists.");
                });

        skill.setSkillName(trimmedName);

        return SkillDTO.fromEntity(skillRepository.save(skill));
    }

    @Override
    public boolean deleteSkill(Long id) {
        if (!skillRepository.existsById(id)) {
            return false;
        }

        skillRepository.deleteById(id);
        return true;
    }

    private Skill getSkillOrThrow(Long id) {
        return skillRepository.findById(id)
                .orElseThrow(() -> new SkillNotFoundException("Skill not found with id: " + id));
    }
}