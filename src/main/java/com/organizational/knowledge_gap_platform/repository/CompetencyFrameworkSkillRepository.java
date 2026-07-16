package com.organizational.knowledge_gap_platform.repository;

import com.organizational.knowledge_gap_platform.entity.CompetencyFrameworkSkill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CompetencyFrameworkSkillRepository extends JpaRepository<CompetencyFrameworkSkill, Long> {
    List<CompetencyFrameworkSkill> findByFrameworkId(Long frameworkId);
    void deleteByFrameworkId(Long frameworkId);
}
