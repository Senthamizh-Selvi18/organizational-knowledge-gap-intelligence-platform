package com.organizational.knowledge_gap_platform.repository;

import com.organizational.knowledge_gap_platform.entity.StrategicGoal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StrategicGoalRepository extends JpaRepository<StrategicGoal, Long> {
    List<StrategicGoal> findByActiveTrue();
    boolean existsByGoalNameIgnoreCase(String goalName);
}
