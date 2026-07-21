package com.organizational.knowledge_gap_platform.controller;

import com.organizational.knowledge_gap_platform.dto.LearningEnrollmentDTO;
import com.organizational.knowledge_gap_platform.dto.ProgressUpdateDTO;
import com.organizational.knowledge_gap_platform.service.LearningProgressService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/learning")
public class LearningProgressController {

    private final LearningProgressService learningProgressService;

    public LearningProgressController(LearningProgressService learningProgressService) {
        this.learningProgressService = learningProgressService;
    }

    @PostMapping("/enroll")
    public ResponseEntity<LearningEnrollmentDTO> enroll(
            @RequestParam Long employeeId,
            @RequestParam Long trainingId) {

        return ResponseEntity.ok(
                learningProgressService.enroll(employeeId, trainingId)
        );
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<LearningEnrollmentDTO>> getEmployeeLearning(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                learningProgressService.getEmployeeLearning(employeeId)
        );
    }

    @PutMapping("/{enrollmentId}/progress")
    public ResponseEntity<LearningEnrollmentDTO> updateProgress(
            @PathVariable Long enrollmentId,
            @RequestBody ProgressUpdateDTO request) {

        return ResponseEntity.ok(
                learningProgressService.updateProgress(enrollmentId, request)
        );
    }
    @PutMapping("/{enrollmentId}/complete")
    public ResponseEntity<LearningEnrollmentDTO> completeTraining(
            @PathVariable Long enrollmentId) {

        return ResponseEntity.ok(
                learningProgressService.completeTraining(enrollmentId)
        );
    }
    @GetMapping("/dashboard/{employeeId}")
    public ResponseEntity<Map<String, Object>> getDashboard(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                learningProgressService.getDashboard(employeeId)
        );
    }
    @GetMapping("/employee/{employeeId}/training-ids")
    public ResponseEntity<List<Long>> getEnrolledTrainingIds(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                learningProgressService.getEnrolledTrainingIds(employeeId));
    }
    @GetMapping("/admin/enrollments")
    public ResponseEntity<List<LearningEnrollmentDTO>> getAllEnrollments() {

        return ResponseEntity.ok(
                learningProgressService.getAllEnrollments()
        );
    }
}