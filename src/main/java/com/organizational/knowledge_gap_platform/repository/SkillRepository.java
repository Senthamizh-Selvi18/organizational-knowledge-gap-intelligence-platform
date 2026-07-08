package com.organizational.knowledge_gap_platform.repository;

import com.organizational.knowledge_gap_platform.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SkillRepository extends JpaRepository<Skill, Long> {
}
