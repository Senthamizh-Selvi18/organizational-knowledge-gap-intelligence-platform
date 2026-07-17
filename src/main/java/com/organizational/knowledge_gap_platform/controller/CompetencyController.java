package com.organizational.knowledge_gap_platform.controller;

import com.organizational.knowledge_gap_platform.dto.CompetencyResponseDTO;
import com.organizational.knowledge_gap_platform.service.CompetencyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
public class CompetencyController {

    private final CompetencyService competencyService;

    public CompetencyController(CompetencyService competencyService) {
        this.competencyService = competencyService;
    }

    @GetMapping("/{employeeId}/competencies")
    public ResponseEntity<List<CompetencyResponseDTO>> getEmployeeCompetencies(@PathVariable Long employeeId) {
        return ResponseEntity.ok(competencyService.getEmployeeCompetencies(employeeId));
    }
}