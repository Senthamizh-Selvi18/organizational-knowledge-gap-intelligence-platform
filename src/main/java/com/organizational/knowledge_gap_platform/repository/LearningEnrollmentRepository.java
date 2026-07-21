package com.organizational.knowledge_gap_platform.repository;

import com.organizational.knowledge_gap_platform.entity.LearningEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LearningEnrollmentRepository extends JpaRepository<LearningEnrollment, Long> {

    // Get all enrollments of an employee
    List<LearningEnrollment> findByEmployeeId(Long employeeId);

    // Check whether employee already enrolled for a training
    Optional<LearningEnrollment> findByEmployeeIdAndTrainingId(Long employeeId,
                                                               Long trainingId);

    // Get all enrollments for a training
    List<LearningEnrollment> findByTrainingId(Long trainingId);
    long countByEmployeeId(Long employeeId);
}