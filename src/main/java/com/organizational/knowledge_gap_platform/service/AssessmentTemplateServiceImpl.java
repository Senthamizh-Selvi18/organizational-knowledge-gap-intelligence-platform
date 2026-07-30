package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.AssessmentQuestionDTO;
import com.organizational.knowledge_gap_platform.dto.AssessmentQuestionRequest;
import com.organizational.knowledge_gap_platform.dto.AssessmentTemplateDTO;
import com.organizational.knowledge_gap_platform.dto.AssessmentTemplateRequest;
import com.organizational.knowledge_gap_platform.entity.AssessmentQuestion;
import com.organizational.knowledge_gap_platform.entity.AssessmentTemplate;
import com.organizational.knowledge_gap_platform.entity.Skill;
import com.organizational.knowledge_gap_platform.entity.User;
import com.organizational.knowledge_gap_platform.exception.AssessmentQuestionNotFoundException;
import com.organizational.knowledge_gap_platform.exception.AssessmentTemplateNotFoundException;
import com.organizational.knowledge_gap_platform.exception.SkillNotFoundException;
import com.organizational.knowledge_gap_platform.repository.AssessmentQuestionRepository;
import com.organizational.knowledge_gap_platform.repository.AssessmentTemplateRepository;
import com.organizational.knowledge_gap_platform.repository.SkillRepository;
import com.organizational.knowledge_gap_platform.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AssessmentTemplateServiceImpl implements AssessmentTemplateService {

    private final AssessmentTemplateRepository templateRepository;
    private final AssessmentQuestionRepository questionRepository;
    private final SkillRepository skillRepository;
    private final UserRepository userRepository;

    public AssessmentTemplateServiceImpl(AssessmentTemplateRepository templateRepository,
                                          AssessmentQuestionRepository questionRepository,
                                          SkillRepository skillRepository,
                                          UserRepository userRepository) {
        this.templateRepository = templateRepository;
        this.questionRepository = questionRepository;
        this.skillRepository = skillRepository;
        this.userRepository = userRepository;
    }

    @Override
    public List<AssessmentTemplateDTO> getAllTemplates() {
        return templateRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public AssessmentTemplateDTO getTemplateById(Long id) {
        return toDto(findTemplate(id));
    }

    @Override
    @Transactional
    public AssessmentTemplateDTO createTemplate(AssessmentTemplateRequest request) {
        User currentUser = getCurrentUser();

        AssessmentTemplate template = new AssessmentTemplate();
        template.setTitle(request.getTitle());
        template.setDescription(request.getDescription());
        template.setActive(request.isActive());
        template.setCreatedBy(currentUser);

        int order = 0;
        for (AssessmentQuestionRequest questionRequest : request.getQuestions()) {
            template.getQuestions().add(buildQuestion(template, questionRequest, order++));
        }

        AssessmentTemplate saved = templateRepository.save(template);
        return toDto(saved);
    }

    @Override
    @Transactional
    public AssessmentTemplateDTO updateTemplate(Long id, AssessmentTemplateRequest request) {
        AssessmentTemplate template = findTemplate(id);

        template.setTitle(request.getTitle());
        template.setDescription(request.getDescription());
        template.setActive(request.isActive());

        // Replace the question set wholesale so re-ordering and removals
        // from the builder UI are reflected in one call.
        template.getQuestions().clear();
        int order = 0;
        for (AssessmentQuestionRequest questionRequest : request.getQuestions()) {
            template.getQuestions().add(buildQuestion(template, questionRequest, order++));
        }

        AssessmentTemplate saved = templateRepository.save(template);
        return toDto(saved);
    }

    @Override
    @Transactional
    public void deleteTemplate(Long id) {
        AssessmentTemplate template = findTemplate(id);
        templateRepository.delete(template);
    }

    @Override
    @Transactional
    public AssessmentQuestionDTO addQuestion(Long templateId, AssessmentQuestionRequest request) {
        AssessmentTemplate template = findTemplate(templateId);

        int nextOrder = (int) questionRepository.countByTemplateId(templateId);
        AssessmentQuestion question = buildQuestion(template, request, nextOrder);
        template.getQuestions().add(question);

        templateRepository.save(template);

        return toDto(question);
    }

    @Override
    @Transactional
    public AssessmentQuestionDTO updateQuestion(Long templateId, Long questionId, AssessmentQuestionRequest request) {
        findTemplate(templateId);

        AssessmentQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new AssessmentQuestionNotFoundException(
                        "Assessment question not found with id: " + questionId));

        if (!question.getTemplate().getId().equals(templateId)) {
            throw new AssessmentQuestionNotFoundException(
                    "Question " + questionId + " does not belong to template " + templateId);
        }

        question.setQuestionText(request.getQuestionText());
        question.setRatingScaleMax(request.getRatingScaleMax());
        question.setDisplayOrder(request.getDisplayOrder());
        question.setSkill(resolveSkill(request.getSkillId()));

        AssessmentQuestion saved = questionRepository.save(question);
        return toDto(saved);
    }

    @Override
    @Transactional
    public void deleteQuestion(Long templateId, Long questionId) {
        AssessmentTemplate template = findTemplate(templateId);

        AssessmentQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new AssessmentQuestionNotFoundException(
                        "Assessment question not found with id: " + questionId));

        if (!question.getTemplate().getId().equals(templateId)) {
            throw new AssessmentQuestionNotFoundException(
                    "Question " + questionId + " does not belong to template " + templateId);
        }

        template.getQuestions().remove(question);
        questionRepository.delete(question);
    }

    private AssessmentQuestion buildQuestion(AssessmentTemplate template, AssessmentQuestionRequest request, int order) {
        AssessmentQuestion question = new AssessmentQuestion();
        question.setTemplate(template);
        question.setSkill(resolveSkill(request.getSkillId()));
        question.setQuestionText(request.getQuestionText());
        question.setRatingScaleMax(request.getRatingScaleMax());
        question.setDisplayOrder(request.getDisplayOrder() != 0 ? request.getDisplayOrder() : order);
        return question;
    }

    private Skill resolveSkill(Long skillId) {
        if (skillId == null) {
            return null;
        }
        return skillRepository.findById(skillId)
                .orElseThrow(() -> new SkillNotFoundException("Skill not found with id: " + skillId));
    }

    private AssessmentTemplate findTemplate(Long id) {
        return templateRepository.findById(id)
                .orElseThrow(() -> new AssessmentTemplateNotFoundException(
                        "Assessment template not found with id: " + id));
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private AssessmentTemplateDTO toDto(AssessmentTemplate template) {
        List<AssessmentQuestionDTO> questionDtos = template.getQuestions().stream()
                .map(this::toDto)
                .collect(Collectors.toList());

        return new AssessmentTemplateDTO(
                template.getId(),
                template.getTitle(),
                template.getDescription(),
                template.isActive(),
                template.getCreatedBy() != null ? template.getCreatedBy().getName() : null,
                template.getCreatedAt(),
                questionDtos
        );
    }

    private AssessmentQuestionDTO toDto(AssessmentQuestion question) {
        return new AssessmentQuestionDTO(
                question.getId(),
                question.getSkill() != null ? question.getSkill().getId() : null,
                question.getSkill() != null ? question.getSkill().getSkillName() : null,
                question.getQuestionText(),
                question.getRatingScaleMax(),
                question.getDisplayOrder()
        );
    }
}
