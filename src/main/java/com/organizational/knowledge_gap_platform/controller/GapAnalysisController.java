package com.organizational.knowledge_gap_platform.controller;

import java.util.List;

import com.organizational.knowledge_gap_platform.dto.GapHeatmapResponseDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.organizational.knowledge_gap_platform.dto.GapAnalysisResponseDTO;
import com.organizational.knowledge_gap_platform.service.GapAnalysisService;

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
    @GetMapping("/me")
    public ResponseEntity<GapAnalysisResponseDTO> getMyGapAnalysis() {
        return ResponseEntity.ok(gapAnalysisService.analyzeMyGap());
    }
    @GetMapping("/heatmap")
    public ResponseEntity<List<GapHeatmapResponseDTO>> getGapHeatmap() {
        return ResponseEntity.ok(gapAnalysisService.getGapHeatmap());
    }
}
