package com.organizational.knowledge_gap_platform.repository;

import com.organizational.knowledge_gap_platform.entity.InternalTraining;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InternalTrainingRepository extends JpaRepository<InternalTraining, Long> {

    List<InternalTraining> findBySkillNameIgnoreCaseAndActiveTrue(String skillName);

    List<InternalTraining> findBySkillNameIgnoreCase(String skillName);
}
