package com.organizational.knowledge_gap_platform.repository;

import com.organizational.knowledge_gap_platform.entity.ExternalCourse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExternalCourseRepository extends JpaRepository<ExternalCourse, Long> {

    List<ExternalCourse> findBySkillNameIgnoreCaseAndActiveTrue(String skillName);

    List<ExternalCourse> findBySkillNameIgnoreCase(String skillName);
}