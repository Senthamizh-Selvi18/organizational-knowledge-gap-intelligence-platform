package com.organizational.knowledge_gap_platform.controller;

import com.organizational.knowledge_gap_platform.dto.GapAnalysisResponseDTO;
import com.organizational.knowledge_gap_platform.dto.report.DepartmentGapSummaryReportDTO;
import com.organizational.knowledge_gap_platform.dto.report.LearningRoiReportDTO;
import com.organizational.knowledge_gap_platform.dto.report.ReportType;
import com.organizational.knowledge_gap_platform.dto.report.StrategicWorkforcePlanningReportDTO;
import com.organizational.knowledge_gap_platform.dto.report.TrainingEffectivenessReportDTO;
import com.organizational.knowledge_gap_platform.service.ReportService;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/individual-skill-gap/{employeeId}")
    public ResponseEntity<List<GapAnalysisResponseDTO>> individualSkillGap(@PathVariable Long employeeId) {
        return ResponseEntity.ok(reportService.individualSkillGapReport(employeeId));
    }

    @GetMapping("/department-gap-summary")
    public ResponseEntity<List<DepartmentGapSummaryReportDTO>> departmentGapSummary() {
        return ResponseEntity.ok(reportService.departmentGapSummaryReport());
    }

    @GetMapping("/training-effectiveness")
    public ResponseEntity<List<TrainingEffectivenessReportDTO>> trainingEffectiveness() {
        return ResponseEntity.ok(reportService.trainingEffectivenessReport());
    }

    @GetMapping("/learning-roi")
    public ResponseEntity<List<LearningRoiReportDTO>> learningRoi() {
        return ResponseEntity.ok(reportService.learningRoiReport());
    }

    @GetMapping("/strategic-workforce-planning")
    public ResponseEntity<List<StrategicWorkforcePlanningReportDTO>> strategicWorkforcePlanning() {
        return ResponseEntity.ok(reportService.strategicWorkforcePlanningReport());
    }

    @GetMapping("/{reportType}/export/excel")
    public ResponseEntity<byte[]> exportExcel(
            @PathVariable String reportType,
            @RequestParam(required = false) Long employeeId) {

        ReportType type = parseType(reportType);
        byte[] bytes = reportService.exportExcel(type, employeeId);
        return fileResponse(bytes,
                MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
                fileName(reportType, "xlsx"));
    }

    @GetMapping("/{reportType}/export/pdf")
    public ResponseEntity<byte[]> exportPdf(
            @PathVariable String reportType,
            @RequestParam(required = false) Long employeeId) {

        ReportType type = parseType(reportType);
        byte[] bytes = reportService.exportPdf(type, employeeId);
        return fileResponse(bytes, MediaType.APPLICATION_PDF, fileName(reportType, "pdf"));
    }

    private ResponseEntity<byte[]> fileResponse(byte[] bytes, MediaType mediaType, String fileName) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentDisposition(ContentDisposition.attachment().filename(fileName).build());
        return ResponseEntity.ok()
                .headers(headers)
                .contentType(mediaType)
                .body(bytes);
    }

    private String fileName(String reportType, String extension) {
        return reportType + "-" + LocalDate.now() + "." + extension;
    }

    private ReportType parseType(String reportType) {
        String normalized = reportType.trim().toUpperCase().replace('-', '_');
        try {
            return ReportType.valueOf(normalized);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    "Unknown report type '" + reportType + "'. Expected one of: individual-skill-gap, " +
                            "department-gap-summary, training-effectiveness, learning-roi, strategic-workforce-planning"
            );
        }
    }
}
