package com.organizational.knowledge_gap_platform.repository;

import com.organizational.knowledge_gap_platform.entity.AssessmentQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssessmentQuestionRepository extends JpaRepository<AssessmentQuestion, Long> {

    List<AssessmentQuestion> findByTemplateIdOrderByDisplayOrderAsc(Long templateId);

    long countByTemplateId(Long templateId);
}
