package com.organizational.knowledge_gap_platform.repository;

import com.organizational.knowledge_gap_platform.entity.CompetencyActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CompetencyActivityLogRepository extends JpaRepository<CompetencyActivityLog, Long> {

    List<CompetencyActivityLog> findTop10ByEntityTypeOrderByCreatedAtDesc(String entityType);

    List<CompetencyActivityLog> findAllByOrderByCreatedAtDesc();
}