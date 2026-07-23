package com.organizational.knowledge_gap_platform.controller;

import com.organizational.knowledge_gap_platform.dto.AssessmentQuestionDTO;
import com.organizational.knowledge_gap_platform.dto.AssessmentQuestionRequest;
import com.organizational.knowledge_gap_platform.dto.AssessmentTemplateDTO;
import com.organizational.knowledge_gap_platform.dto.AssessmentTemplateRequest;
import com.organizational.knowledge_gap_platform.service.AssessmentTemplateService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Questionnaire builder for HR/L&D: create and maintain the assessment
// templates that Self, Peer, and Manager assessments are assigned from.
@RestController
@RequestMapping("/api/assessment-templates")
public class AssessmentTemplateController {

    private final AssessmentTemplateService assessmentTemplateService;

    public AssessmentTemplateController(AssessmentTemplateService assessmentTemplateService) {
        this.assessmentTemplateService = assessmentTemplateService;
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @GetMapping
    public ResponseEntity<List<AssessmentTemplateDTO>> getAllTemplates() {
        return ResponseEntity.ok(assessmentTemplateService.getAllTemplates());
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @GetMapping("/{id}")
    public ResponseEntity<AssessmentTemplateDTO> getTemplateById(@PathVariable Long id) {
        return ResponseEntity.ok(assessmentTemplateService.getTemplateById(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @PostMapping
    public ResponseEntity<AssessmentTemplateDTO> createTemplate(@Valid @RequestBody AssessmentTemplateRequest request) {
        AssessmentTemplateDTO created = assessmentTemplateService.createTemplate(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @PutMapping("/{id}")
    public ResponseEntity<AssessmentTemplateDTO> updateTemplate(
            @PathVariable Long id, @Valid @RequestBody AssessmentTemplateRequest request) {
        return ResponseEntity.ok(assessmentTemplateService.updateTemplate(id, request));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable Long id) {
        assessmentTemplateService.deleteTemplate(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @PostMapping("/{id}/questions")
    public ResponseEntity<AssessmentQuestionDTO> addQuestion(
            @PathVariable Long id, @Valid @RequestBody AssessmentQuestionRequest request) {
        AssessmentQuestionDTO created = assessmentTemplateService.addQuestion(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @PutMapping("/{id}/questions/{questionId}")
    public ResponseEntity<AssessmentQuestionDTO> updateQuestion(
            @PathVariable Long id, @PathVariable Long questionId,
            @Valid @RequestBody AssessmentQuestionRequest request) {
        return ResponseEntity.ok(assessmentTemplateService.updateQuestion(id, questionId, request));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @DeleteMapping("/{id}/questions/{questionId}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long id, @PathVariable Long questionId) {
        assessmentTemplateService.deleteQuestion(id, questionId);
        return ResponseEntity.noContent().build();
    }
}
