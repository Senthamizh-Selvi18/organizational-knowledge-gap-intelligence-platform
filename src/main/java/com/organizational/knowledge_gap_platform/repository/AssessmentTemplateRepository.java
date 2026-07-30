package com.organizational.knowledge_gap_platform.repository;

import com.organizational.knowledge_gap_platform.entity.AssessmentTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssessmentTemplateRepository extends JpaRepository<AssessmentTemplate, Long> {

    List<AssessmentTemplate> findByActiveTrue();
}
