package com.organizational.knowledge_gap_platform.controller;

import com.organizational.knowledge_gap_platform.dto.GapAnalysisResponseDTO;
import com.organizational.knowledge_gap_platform.service.GapAnalysisService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/gap-analysis")
public class GapAnalysisController {

    private final GapAnalysisService gapAnalysisService;

    public GapAnalysisController(GapAnalysisService gapAnalysisService) {
        this.gapAnalysisService = gapAnalysisService;
    }

    @GetMapping("/employee/{employeeId}/role/{roleId}")
    public ResponseEntity<GapAnalysisResponseDTO> getGapAnalysis(
            @PathVariable Long employeeId,
            @PathVariable Long roleId) {

        return ResponseEntity.ok(gapAnalysisService.analyzeGap(employeeId, roleId));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<GapAnalysisResponseDTO>> getGapAnalysisForEmployee(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(gapAnalysisService.analyzeGapForEmployee(employeeId));
    }
}
