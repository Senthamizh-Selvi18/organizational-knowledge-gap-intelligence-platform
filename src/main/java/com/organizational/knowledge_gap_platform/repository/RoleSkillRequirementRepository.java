package com.organizational.knowledge_gap_platform.repository;

import com.organizational.knowledge_gap_platform.entity.Role;
import com.organizational.knowledge_gap_platform.entity.RoleSkillRequirement;
import com.organizational.knowledge_gap_platform.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RoleSkillRequirementRepository extends JpaRepository<RoleSkillRequirement, Long> {

    List<RoleSkillRequirement> findByRole(Role role);

    Optional<RoleSkillRequirement> findByRoleAndSkill(Role role, Skill skill);
    boolean existsBySkillId(Long skillId);
}