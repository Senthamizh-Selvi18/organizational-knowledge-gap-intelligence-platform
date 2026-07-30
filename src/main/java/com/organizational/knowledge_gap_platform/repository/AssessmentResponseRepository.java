package com.organizational.knowledge_gap_platform.repository;

import com.organizational.knowledge_gap_platform.entity.AssessmentResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssessmentResponseRepository extends JpaRepository<AssessmentResponse, Long> {

    List<AssessmentResponse> findByAssessmentId(Long assessmentId);

    Optional<AssessmentResponse> findByAssessmentIdAndQuestionId(Long assessmentId, Long questionId);
}
