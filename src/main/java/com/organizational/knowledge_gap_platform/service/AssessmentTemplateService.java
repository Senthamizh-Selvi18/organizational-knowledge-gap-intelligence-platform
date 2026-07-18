package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.AssessmentQuestionDTO;
import com.organizational.knowledge_gap_platform.dto.AssessmentQuestionRequest;
import com.organizational.knowledge_gap_platform.dto.AssessmentTemplateDTO;
import com.organizational.knowledge_gap_platform.dto.AssessmentTemplateRequest;

import java.util.List;

public interface AssessmentTemplateService {

    List<AssessmentTemplateDTO> getAllTemplates();

    AssessmentTemplateDTO getTemplateById(Long id);

    AssessmentTemplateDTO createTemplate(AssessmentTemplateRequest request);

    AssessmentTemplateDTO updateTemplate(Long id, AssessmentTemplateRequest request);

    void deleteTemplate(Long id);

    AssessmentQuestionDTO addQuestion(Long templateId, AssessmentQuestionRequest request);

    AssessmentQuestionDTO updateQuestion(Long templateId, Long questionId, AssessmentQuestionRequest request);

    void deleteQuestion(Long templateId, Long questionId);
}
