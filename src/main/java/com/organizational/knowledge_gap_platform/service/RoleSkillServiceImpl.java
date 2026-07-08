package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.RoleSkillResponse;
import com.organizational.knowledge_gap_platform.dto.SkillDTO;
import com.organizational.knowledge_gap_platform.entity.Role;
import com.organizational.knowledge_gap_platform.entity.Skill;
import com.organizational.knowledge_gap_platform.exception.RoleNotFoundException;
import com.organizational.knowledge_gap_platform.exception.SkillNotFoundException;
import com.organizational.knowledge_gap_platform.repository.RoleRepository;
import com.organizational.knowledge_gap_platform.repository.SkillRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class RoleSkillServiceImpl implements RoleSkillService {

    private final RoleRepository roleRepository;
    private final SkillRepository skillRepository;

    public RoleSkillServiceImpl(RoleRepository roleRepository, SkillRepository skillRepository) {
        this.roleRepository = roleRepository;
        this.skillRepository = skillRepository;
    }

    @Override
    @Transactional
    public RoleSkillResponse assignSkillsToRole(Long roleId, List<Long> skillIds) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RoleNotFoundException("Role not found with id: " + roleId));

        List<Skill> foundSkills = skillRepository.findAllById(skillIds);

        if (foundSkills.size() != new HashSet<>(skillIds).size()) {
            List<Long> foundIds = foundSkills.stream().map(Skill::getId).toList();
            List<Long> missing = skillIds.stream().filter(id -> !foundIds.contains(id)).toList();
            throw new SkillNotFoundException("Skill(s) not found with id(s): " + missing);
        }

        Set<Skill> skillSet = new HashSet<>(foundSkills);
        role.setSkills(skillSet);
        Role saved = roleRepository.save(role);

        return toResponse(saved);
    }

    @Override
    public RoleSkillResponse getRoleSkills(Long roleId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RoleNotFoundException("Role not found with id: " + roleId));

        return toResponse(role);
    }

    private RoleSkillResponse toResponse(Role role) {
        List<SkillDTO> skillDTOs = role.getSkills().stream()
                .map(SkillDTO::fromEntity)
                .collect(Collectors.toList());

        return new RoleSkillResponse(role.getId(), role.getRoleName(), skillDTOs);
    }
}
