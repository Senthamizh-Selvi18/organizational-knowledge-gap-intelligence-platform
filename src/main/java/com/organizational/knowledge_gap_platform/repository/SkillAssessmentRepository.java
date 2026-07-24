package com.organizational.knowledge_gap_platform.repository;

import com.organizational.knowledge_gap_platform.entity.AssessmentType;
import com.organizational.knowledge_gap_platform.entity.SkillAssessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SkillAssessmentRepository extends JpaRepository<SkillAssessment, Long> {

    List<SkillAssessment> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId);

    List<SkillAssessment> findByEmployeeIdAndSkillId(Long employeeId, Long skillId);

    List<SkillAssessment> findByEmployeeIdAndSkillIdAndType(Long employeeId, Long skillId, AssessmentType type);

    Optional<SkillAssessment> findTopByEmployeeIdAndSkillIdAndTypeOrderByCreatedAtDesc(
            Long employeeId, Long skillId, AssessmentType type);

    boolean existsBySkillId(Long skillId);
}
