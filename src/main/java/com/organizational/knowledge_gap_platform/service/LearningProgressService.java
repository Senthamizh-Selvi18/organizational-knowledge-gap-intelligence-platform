package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.LearningEnrollmentDTO;
import com.organizational.knowledge_gap_platform.dto.ProgressUpdateDTO;

import java.util.List;
import java.util.Map;

public interface LearningProgressService {

    // Enroll an employee in a training
    LearningEnrollmentDTO enroll(Long employeeId, Long trainingId);

    // Get all enrolled trainings of an employee
    List<LearningEnrollmentDTO> getEmployeeLearning(Long employeeId);

    // Update employee learning progress
    LearningEnrollmentDTO updateProgress(Long enrollmentId,
                                         ProgressUpdateDTO request);

    // Dashboard summary
    Map<String, Object> getDashboard(Long employeeId);
    List<Long> getEnrolledTrainingIds(Long employeeId);
    LearningEnrollmentDTO completeTraining(Long enrollmentId);
    List<LearningEnrollmentDTO> getAllEnrollments();
}