package com.organizational.knowledge_gap_platform.repository;

import com.organizational.knowledge_gap_platform.entity.CompetencyGoalMapping;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CompetencyGoalMappingRepository extends JpaRepository<CompetencyGoalMapping, Long> {
    List<CompetencyGoalMapping> findByFrameworkId(Long frameworkId);
    List<CompetencyGoalMapping> findByStrategicGoalId(Long strategicGoalId);
    Optional<CompetencyGoalMapping> findByFrameworkIdAndStrategicGoalId(Long frameworkId, Long strategicGoalId);
    void deleteByFrameworkIdAndStrategicGoalId(Long frameworkId, Long strategicGoalId);
}
