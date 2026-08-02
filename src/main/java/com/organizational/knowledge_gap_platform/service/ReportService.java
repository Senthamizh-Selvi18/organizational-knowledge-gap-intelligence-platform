package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.GapAnalysisResponseDTO;
import com.organizational.knowledge_gap_platform.dto.report.DepartmentGapSummaryReportDTO;
import com.organizational.knowledge_gap_platform.dto.report.LearningRoiReportDTO;
import com.organizational.knowledge_gap_platform.dto.report.ReportType;
import com.organizational.knowledge_gap_platform.dto.report.StrategicWorkforcePlanningReportDTO;
import com.organizational.knowledge_gap_platform.dto.report.TrainingEffectivenessReportDTO;

import java.util.List;

public interface ReportService {

    /* Individual skill gap report */
    List<GapAnalysisResponseDTO> individualSkillGapReport(Long employeeId);

    /* Department gap summary report */
    List<DepartmentGapSummaryReportDTO> departmentGapSummaryReport();

    /* Training effectiveness report */
    List<TrainingEffectivenessReportDTO> trainingEffectivenessReport();

    /* Learning ROI analysis report */
    List<LearningRoiReportDTO> learningRoiReport();

    /* Strategic workforce planning report */
    List<StrategicWorkforcePlanningReportDTO> strategicWorkforcePlanningReport();

    /**
     * (vi) Excel export for any of the five report types.
     * @param employeeId only required (and only used) for INDIVIDUAL_SKILL_GAP.
     */
    byte[] exportExcel(ReportType type, Long employeeId);

    /**
     * (vii) PDF export for any of the five report types.
     * @param employeeId only required (and only used) for INDIVIDUAL_SKILL_GAP.
     */
    byte[] exportPdf(ReportType type, Long employeeId);
}
