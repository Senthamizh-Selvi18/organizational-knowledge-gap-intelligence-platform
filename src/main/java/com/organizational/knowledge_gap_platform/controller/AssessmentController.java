package com.organizational.knowledge_gap_platform.controller;

import com.organizational.knowledge_gap_platform.dto.AssessmentAssignRequest;
import com.organizational.knowledge_gap_platform.dto.AssessmentDetailDTO;
import com.organizational.knowledge_gap_platform.dto.AssessmentHistoryDTO;
import com.organizational.knowledge_gap_platform.dto.AssessmentSubmitRequest;
import com.organizational.knowledge_gap_platform.dto.AssessmentSummaryDTO;
import com.organizational.knowledge_gap_platform.service.AssessmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assessments")
public class AssessmentController {

    private final AssessmentService assessmentService;

    public AssessmentController(AssessmentService assessmentService) {
        this.assessmentService = assessmentService;
    }

    // Assign a Self, Peer, or Manager assessment. HR/Admin can assign any
    // type; Managers can assign assessments for their own team.
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @PostMapping("/assign")
    public ResponseEntity<List<AssessmentSummaryDTO>> assignAssessment(
            @Valid @RequestBody AssessmentAssignRequest request) {
        List<AssessmentSummaryDTO> created = assessmentService.assignAssessment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // Assessments the logged-in user still needs to fill out, as an assessor.
    @GetMapping("/my-pending")
    public ResponseEntity<List<AssessmentSummaryDTO>> getMyPendingAssessments() {
        return ResponseEntity.ok(assessmentService.getMyPendingAssessments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssessmentDetailDTO> getAssessmentDetail(@PathVariable Long id) {
        return ResponseEntity.ok(assessmentService.getAssessmentDetail(id));
    }

    // Save answers without finalizing, so an assessor can come back later.
    @PutMapping("/{id}/save")
    public ResponseEntity<AssessmentDetailDTO> saveDraft(
            @PathVariable Long id, @Valid @RequestBody AssessmentSubmitRequest request) {
        return ResponseEntity.ok(assessmentService.saveDraft(id, request));
    }

    // Finalize the assessment: locks it, feeds SELF/MANAGER ratings back into
    // EmployeeSkill proficiency, recalculates the skill gap, and notifies the
    // subject employee.
    @PutMapping("/{id}/submit")
    public ResponseEntity<AssessmentDetailDTO> submitAssessment(
            @PathVariable Long id, @Valid @RequestBody AssessmentSubmitRequest request) {
        return ResponseEntity.ok(assessmentService.submitAssessment(id, request));
    }

    // Historical comparison of the current user's own completed assessments.
    @GetMapping("/me/history")
    public ResponseEntity<List<AssessmentHistoryDTO>> getMyHistory() {
        return ResponseEntity.ok(assessmentService.getMyHistory());
    }

    @GetMapping("/employee/{employeeId}/history")
    public ResponseEntity<List<AssessmentHistoryDTO>> getHistoryForEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(assessmentService.getHistoryForEmployee(employeeId));
    }

    // Full assessment list (any status) for an employee, for HR/manager review.
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<AssessmentSummaryDTO>> getAssessmentsForEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(assessmentService.getAssessmentsForEmployee(employeeId));
    }
}
