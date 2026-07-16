package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.RoleSkillRequirementRequestDTO;
import com.organizational.knowledge_gap_platform.dto.RoleSkillRequirementResponseDTO;
import com.organizational.knowledge_gap_platform.entity.Role;
import com.organizational.knowledge_gap_platform.entity.RoleSkillRequirement;
import com.organizational.knowledge_gap_platform.entity.Skill;
import com.organizational.knowledge_gap_platform.exception.RoleNotFoundException;
import com.organizational.knowledge_gap_platform.exception.RoleSkillRequirementNotFoundException;
import com.organizational.knowledge_gap_platform.exception.SkillNotFoundException;
import com.organizational.knowledge_gap_platform.repository.RoleRepository;
import com.organizational.knowledge_gap_platform.repository.RoleSkillRequirementRepository;
import com.organizational.knowledge_gap_platform.repository.SkillRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RoleSkillRequirementServiceImpl implements RoleSkillRequirementService {

    private final RoleSkillRequirementRepository roleSkillRequirementRepository;
    private final RoleRepository roleRepository;
    private final SkillRepository skillRepository;

    public RoleSkillRequirementServiceImpl(
            RoleSkillRequirementRepository roleSkillRequirementRepository,
            RoleRepository roleRepository,
            SkillRepository skillRepository
    ) {
        this.roleSkillRequirementRepository = roleSkillRequirementRepository;
        this.roleRepository = roleRepository;
        this.skillRepository = skillRepository;
    }

    @Override
    public List<RoleSkillRequirementResponseDTO> getByRole(Long roleId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RoleNotFoundException("Role not found with id: " + roleId));

        return roleSkillRequirementRepository.findByRole(role).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public RoleSkillRequirementResponseDTO upsert(RoleSkillRequirementRequestDTO request) {
        Role role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new RoleNotFoundException("Role not found with id: " + request.getRoleId()));

        Skill skill = skillRepository.findById(request.getSkillId())
                .orElseThrow(() -> new SkillNotFoundException("Skill not found with id: " + request.getSkillId()));

        // Setting a required level implies this skill belongs to the role.
        // Auto-add it to the existing role_skill mapping if it isn't already
        // there, so this screen alone is enough to make the skill count
        // toward Gap Analysis (buildGapAnalysis reads role.getSkills()).
        if (!role.getSkills().contains(skill)) {
            role.getSkills().add(skill);
            roleRepository.save(role);
        }

        RoleSkillRequirement requirement = roleSkillRequirementRepository
                .findByRoleAndSkill(role, skill)
                .orElseGet(RoleSkillRequirement::new);

        requirement.setRole(role);
        requirement.setSkill(skill);
        requirement.setRequiredProficiencyLevel(request.getRequiredProficiencyLevel());

        RoleSkillRequirement saved = roleSkillRequirementRepository.save(requirement);
        return toResponseDTO(saved);
    }

    @Override
    public void delete(Long id) {
        if (!roleSkillRequirementRepository.existsById(id)) {
            throw new RoleSkillRequirementNotFoundException("Requirement not found with id: " + id);
        }
        roleSkillRequirementRepository.deleteById(id);
    }

    private RoleSkillRequirementResponseDTO toResponseDTO(RoleSkillRequirement requirement) {
        return new RoleSkillRequirementResponseDTO(
                requirement.getId(),
                requirement.getRole().getId(),
                requirement.getRole().getRoleName(),
                requirement.getSkill().getId(),
                requirement.getSkill().getSkillName(),
                requirement.getRequiredProficiencyLevel()
        );
    }
}