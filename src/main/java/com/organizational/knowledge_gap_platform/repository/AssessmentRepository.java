package com.organizational.knowledge_gap_platform.repository;

import com.organizational.knowledge_gap_platform.entity.Assessment;
import com.organizational.knowledge_gap_platform.entity.AssessmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AssessmentRepository extends JpaRepository<Assessment, Long> {

    List<Assessment> findByAssessorIdAndStatusNotOrderByDueDateAsc(Long assessorId, AssessmentStatus status);

    List<Assessment> findBySubjectEmployeeIdOrderByCreatedAtDesc(Long subjectEmployeeId);

    List<Assessment> findBySubjectEmployeeIdAndStatusOrderByCompletedAtDesc(Long subjectEmployeeId, AssessmentStatus status);

    List<Assessment> findByStatusInAndDueDateLessThanEqual(List<AssessmentStatus> statuses, LocalDate date);

    boolean existsBySubjectEmployeeIdAndAssessorIdAndTemplateIdAndTypeAndStatusNot(
            Long subjectEmployeeId, Long assessorId, Long templateId,
            com.organizational.knowledge_gap_platform.entity.AssessmentType type,
            AssessmentStatus status);
}
