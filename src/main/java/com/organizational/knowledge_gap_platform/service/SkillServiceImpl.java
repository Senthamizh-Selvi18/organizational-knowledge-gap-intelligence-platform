package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.SkillDTO;
import com.organizational.knowledge_gap_platform.entity.Role;
import com.organizational.knowledge_gap_platform.entity.Skill;
import com.organizational.knowledge_gap_platform.exception.SkillNotFoundException;
import com.organizational.knowledge_gap_platform.repository.CompetencyRepository;
import com.organizational.knowledge_gap_platform.repository.EmployeeSkillRepository;
import com.organizational.knowledge_gap_platform.repository.RoleRepository;
import com.organizational.knowledge_gap_platform.repository.RoleSkillRequirementRepository;
import com.organizational.knowledge_gap_platform.repository.SkillAssessmentRepository;
import com.organizational.knowledge_gap_platform.repository.SkillRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SkillServiceImpl implements SkillService {

    private final SkillRepository skillRepository;
    private final RoleRepository roleRepository;
    private final RoleSkillRequirementRepository roleSkillRequirementRepository;
    private final EmployeeSkillRepository employeeSkillRepository;
    private final SkillAssessmentRepository skillAssessmentRepository;
    private final CompetencyRepository competencyRepository;

    public SkillServiceImpl(SkillRepository skillRepository,
                             RoleRepository roleRepository,
                             RoleSkillRequirementRepository roleSkillRequirementRepository,
                             EmployeeSkillRepository employeeSkillRepository,
                             SkillAssessmentRepository skillAssessmentRepository,
                             CompetencyRepository competencyRepository) {
        this.skillRepository = skillRepository;
        this.roleRepository = roleRepository;
        this.roleSkillRequirementRepository = roleSkillRequirementRepository;
        this.employeeSkillRepository = employeeSkillRepository;
        this.skillAssessmentRepository = skillAssessmentRepository;
        this.competencyRepository = competencyRepository;
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
    @Transactional
    public boolean deleteSkill(Long id) {
        Skill skill = skillRepository.findById(id).orElse(null);

        if (skill == null) {
            return false;
        }

        // The role_skill table is just a tag list (Role <-> Skill many-to-many),
        // so it's safe to automatically untag this skill from every role that has it.
        List<Role> rolesWithSkill = roleRepository.findBySkills_Id(id);
        if (!rolesWithSkill.isEmpty()) {
            for (Role role : rolesWithSkill) {
                role.getSkills().remove(skill);
            }
            roleRepository.saveAll(rolesWithSkill);
        }

        // These, however, are real data (required-skill levels, employee skills,
        // assessment history, competencies) - refuse to silently delete them.
        if (roleSkillRequirementRepository.existsBySkillId(id)) {
            throw new RuntimeException(
                    "This skill is set as a required skill for one or more roles. "
                            + "Remove it from those role skill requirements before deleting it.");
        }
        if (employeeSkillRepository.existsBySkillId(id)) {
            throw new RuntimeException(
                    "This skill is assigned to one or more employees. "
                            + "Remove it from their profiles before deleting it.");
        }
        if (skillAssessmentRepository.existsBySkillId(id)) {
            throw new RuntimeException(
                    "This skill has existing assessment history. "
                            + "It cannot be deleted while assessment records reference it.");
        }
        if (competencyRepository.existsBySkillId(id)) {
            throw new RuntimeException(
                    "This skill is linked to one or more employee competencies. "
                            + "Remove those first before deleting it.");
        }

        skillRepository.deleteById(id);
        return true;
    }

    private Skill getSkillOrThrow(Long id) {
        return skillRepository.findById(id)
                .orElseThrow(() -> new SkillNotFoundException("Skill not found with id: " + id));
    }
}