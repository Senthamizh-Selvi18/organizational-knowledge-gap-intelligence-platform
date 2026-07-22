package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.LearningEnrollmentDTO;
import com.organizational.knowledge_gap_platform.dto.ProgressUpdateDTO;
import com.organizational.knowledge_gap_platform.entity.Employee;
import com.organizational.knowledge_gap_platform.entity.InternalTraining;
import com.organizational.knowledge_gap_platform.entity.LearningEnrollment;
import com.organizational.knowledge_gap_platform.exception.EmployeeNotFoundException;
import com.organizational.knowledge_gap_platform.repository.EmployeeRepository;
import com.organizational.knowledge_gap_platform.repository.InternalTrainingRepository;
import com.organizational.knowledge_gap_platform.repository.LearningEnrollmentRepository;
import org.springframework.stereotype.Service;
import com.organizational.knowledge_gap_platform.entity.LearningEnrollment;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
public class LearningProgressServiceImpl implements LearningProgressService {

    private final LearningEnrollmentRepository learningEnrollmentRepository;
    private final EmployeeRepository employeeRepository;
    private final InternalTrainingRepository internalTrainingRepository;

    public LearningProgressServiceImpl(
            LearningEnrollmentRepository learningEnrollmentRepository,
            EmployeeRepository employeeRepository,
            InternalTrainingRepository internalTrainingRepository) {

        this.learningEnrollmentRepository = learningEnrollmentRepository;
        this.employeeRepository = employeeRepository;
        this.internalTrainingRepository = internalTrainingRepository;
    }

    @Override
    public LearningEnrollmentDTO enroll(Long employeeId, Long trainingId) {

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() ->
                        new EmployeeNotFoundException(
                                "Employee not found with id : " + employeeId));

        InternalTraining training = internalTrainingRepository.findById(trainingId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Training not found with id : " + trainingId));

        learningEnrollmentRepository
                .findByEmployeeIdAndTrainingId(employeeId, trainingId)
                .ifPresent(enrollment -> {
                    throw new RuntimeException("Employee already enrolled in this training.");
                });

        LearningEnrollment enrollment = new LearningEnrollment();
        enrollment.setEmployee(employee);
        enrollment.setTraining(training);
        enrollment.setProgress(0);
        enrollment.setStatus("ENROLLED");

        LearningEnrollment saved =
                learningEnrollmentRepository.save(enrollment);

        return mapToDTO(saved);
    }
    @Override
    public List<LearningEnrollmentDTO> getEmployeeLearning(Long employeeId) {

        if (!employeeRepository.existsById(employeeId)) {
            throw new EmployeeNotFoundException(
                    "Employee not found with id : " + employeeId);
        }

        return learningEnrollmentRepository.findByEmployeeId(employeeId)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    public LearningEnrollmentDTO updateProgress(Long enrollmentId,
                                                ProgressUpdateDTO request) {

        LearningEnrollment enrollment = learningEnrollmentRepository
                .findById(enrollmentId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Enrollment not found with id : " + enrollmentId));

        enrollment.setProgress(request.getProgress());

        if (request.getProgress() >= 100) {
            enrollment.setProgress(100);
            enrollment.setStatus("COMPLETED");
            enrollment.setCompletedDate(java.time.LocalDate.now());
        } else if (request.getProgress() > 0) {
            enrollment.setStatus("IN_PROGRESS");
        } else {
            enrollment.setStatus("ENROLLED");
        }

        LearningEnrollment updated =
                learningEnrollmentRepository.save(enrollment);

        return mapToDTO(updated);
    }

    @Override
    public Map<String, Object> getDashboard(Long employeeId) {

        List<LearningEnrollment> enrollments =
                learningEnrollmentRepository.findByEmployeeId(employeeId);

        long completed = enrollments.stream()
                .filter(e -> "COMPLETED".equals(e.getStatus()))
                .count();

        long pending = enrollments.stream()
                .filter(e ->
                        !"COMPLETED".equals(e.getStatus()))
                .count();

        long enrolled = enrollments.size();

        double completionRate =
                enrolled == 0 ? 0 :
                        (completed * 100.0) / enrolled;

        return Map.of(
                "enrolled", enrolled,
                "completed", completed,
                "pending", pending,
                "completionRate", completionRate
        );
    }
    private LearningEnrollmentDTO mapToDTO(LearningEnrollment enrollment) {

        return new LearningEnrollmentDTO(
                enrollment.getId(),
                enrollment.getEmployee().getId(),
                enrollment.getEmployee().getUser().getName(),   // NEW
                enrollment.getTraining().getId(),
                enrollment.getTraining().getTitle(),
                enrollment.getTraining().getTrainer(),
                enrollment.getTraining().getDuration(),
                enrollment.getProgress(),
                enrollment.getStatus(),
                enrollment.getEnrolledDate(),
                enrollment.getCompletedDate()
        );
    }
    @Override
    public List<Long> getEnrolledTrainingIds(Long employeeId) {

        return learningEnrollmentRepository
                .findByEmployeeId(employeeId)
                .stream()
                .map(e -> e.getTraining().getId())
                .toList();

    }
    @Override
    public LearningEnrollmentDTO completeTraining(Long enrollmentId) {

        LearningEnrollment enrollment = learningEnrollmentRepository
                .findById(enrollmentId)
                .orElseThrow(() ->
                        new RuntimeException("Enrollment not found"));

        enrollment.setStatus("COMPLETED");
        enrollment.setProgress(100);
        enrollment.setCompletedDate(LocalDate.now());

        LearningEnrollment saved =
                learningEnrollmentRepository.save(enrollment);

        return mapToDTO(saved);
    }
    @Override
    public List<LearningEnrollmentDTO> getAllEnrollments() {

        return learningEnrollmentRepository
                .findAll()
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

}