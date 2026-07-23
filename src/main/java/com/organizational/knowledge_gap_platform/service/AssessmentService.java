package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.AssessmentAssignRequest;
import com.organizational.knowledge_gap_platform.dto.AssessmentDetailDTO;
import com.organizational.knowledge_gap_platform.dto.AssessmentHistoryDTO;
import com.organizational.knowledge_gap_platform.dto.AssessmentSubmitRequest;
import com.organizational.knowledge_gap_platform.dto.AssessmentSummaryDTO;

import java.util.List;

public interface AssessmentService {

    List<AssessmentSummaryDTO> assignAssessment(AssessmentAssignRequest request);

    List<AssessmentSummaryDTO> getMyPendingAssessments();

    AssessmentDetailDTO getAssessmentDetail(Long assessmentId);

    AssessmentDetailDTO saveDraft(Long assessmentId, AssessmentSubmitRequest request);

    AssessmentDetailDTO submitAssessment(Long assessmentId, AssessmentSubmitRequest request);

    List<AssessmentHistoryDTO> getHistoryForEmployee(Long employeeId);

    List<AssessmentHistoryDTO> getMyHistory();

    List<AssessmentSummaryDTO> getAssessmentsForEmployee(Long employeeId);

    void sendDueReminders();
}
