package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.AssessmentAnswerDTO;
import com.organizational.knowledge_gap_platform.dto.AssessmentAnswerRequest;
import com.organizational.knowledge_gap_platform.dto.AssessmentAssignRequest;
import com.organizational.knowledge_gap_platform.dto.AssessmentDetailDTO;
import com.organizational.knowledge_gap_platform.dto.AssessmentHistoryDTO;
import com.organizational.knowledge_gap_platform.dto.AssessmentSubmitRequest;
import com.organizational.knowledge_gap_platform.dto.AssessmentSummaryDTO;
import com.organizational.knowledge_gap_platform.entity.Assessment;
import com.organizational.knowledge_gap_platform.entity.AssessmentQuestion;
import com.organizational.knowledge_gap_platform.entity.AssessmentResponse;
import com.organizational.knowledge_gap_platform.entity.AssessmentStatus;
import com.organizational.knowledge_gap_platform.entity.AssessmentTemplate;
import com.organizational.knowledge_gap_platform.entity.AssessmentType;
import com.organizational.knowledge_gap_platform.entity.Employee;
import com.organizational.knowledge_gap_platform.entity.EmployeeSkill;
import com.organizational.knowledge_gap_platform.entity.Skill;
import com.organizational.knowledge_gap_platform.entity.User;
import com.organizational.knowledge_gap_platform.exception.AssessmentNotFoundException;
import com.organizational.knowledge_gap_platform.exception.AssessmentTemplateNotFoundException;
import com.organizational.knowledge_gap_platform.exception.EmployeeNotFoundException;
import com.organizational.knowledge_gap_platform.repository.AssessmentRepository;
import com.organizational.knowledge_gap_platform.repository.AssessmentResponseRepository;
import com.organizational.knowledge_gap_platform.repository.AssessmentTemplateRepository;
import com.organizational.knowledge_gap_platform.repository.EmployeeRepository;
import com.organizational.knowledge_gap_platform.repository.EmployeeSkillRepository;
import com.organizational.knowledge_gap_platform.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AssessmentServiceImpl implements AssessmentService {

    private static final Logger log = LoggerFactory.getLogger(AssessmentServiceImpl.class);

    // Reminders fire once a day for anything due within this window,
    // and overdue items get flipped to OVERDUE the moment they lapse.
    private static final int REMINDER_WINDOW_DAYS = 2;

    private final AssessmentRepository assessmentRepository;
    private final AssessmentTemplateRepository templateRepository;
    private final AssessmentResponseRepository responseRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final EmployeeSkillRepository employeeSkillRepository;
    private final NotificationService notificationService;
    private final GapAnalysisService gapAnalysisService;
    private final JavaMailSender mailSender;

    public AssessmentServiceImpl(AssessmentRepository assessmentRepository,
                                  AssessmentTemplateRepository templateRepository,
                                  AssessmentResponseRepository responseRepository,
                                  EmployeeRepository employeeRepository,
                                  UserRepository userRepository,
                                  EmployeeSkillRepository employeeSkillRepository,
                                  NotificationService notificationService,
                                  GapAnalysisService gapAnalysisService,
                                  JavaMailSender mailSender) {
        this.assessmentRepository = assessmentRepository;
        this.templateRepository = templateRepository;
        this.responseRepository = responseRepository;
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
        this.employeeSkillRepository = employeeSkillRepository;
        this.notificationService = notificationService;
        this.gapAnalysisService = gapAnalysisService;
        this.mailSender = mailSender;
    }

    @Override
    @Transactional
    public List<AssessmentSummaryDTO> assignAssessment(AssessmentAssignRequest request) {
        AssessmentType type = parseType(request.getType());

        AssessmentTemplate template = templateRepository.findById(request.getTemplateId())
                .orElseThrow(() -> new AssessmentTemplateNotFoundException(
                        "Assessment template not found with id: " + request.getTemplateId()));

        Employee subjectEmployee = employeeRepository.findById(request.getSubjectEmployeeId())
                .orElseThrow(() -> new EmployeeNotFoundException(
                        "Employee not found with id: " + request.getSubjectEmployeeId()));

        LocalDate dueDate = request.getDueDate() != null ? request.getDueDate() : LocalDate.now().plusDays(7);

        List<User> assessors = resolveAssessors(type, subjectEmployee, request.getAssessorUserIds());

        List<AssessmentSummaryDTO> created = new ArrayList<>();
        String subjectName = subjectEmployee.getUser().getName();
        String typeLabel = typeLabel(type);

        for (User assessor : assessors) {
            Assessment assessment = new Assessment();
            assessment.setTemplate(template);
            assessment.setType(type);
            assessment.setStatus(AssessmentStatus.PENDING);
            assessment.setSubjectEmployee(subjectEmployee);
            assessment.setAssessor(assessor);
            assessment.setDueDate(dueDate);

            Assessment saved = assessmentRepository.save(assessment);

            notificationService.notifyAssessmentAssigned(assessor, subjectName, typeLabel, dueDate, saved.getId());
            sendEmailSafely(assessor.getEmail(),
                    "New " + typeLabel + " assessment assigned",
                    "You have been asked to complete a " + typeLabel.toLowerCase()
                            + " assessment for " + subjectName + ", due by " + dueDate + ".");

            created.add(toSummary(saved));
        }

        return created;
    }

    @Override
    public List<AssessmentSummaryDTO> getMyPendingAssessments() {
        User currentUser = getCurrentUser();
        return assessmentRepository
                .findByAssessorIdAndStatusNotOrderByDueDateAsc(currentUser.getId(), AssessmentStatus.COMPLETED)
                .stream()
                .map(this::toSummary)
                .collect(Collectors.toList());
    }

    @Override
    public AssessmentDetailDTO getAssessmentDetail(Long assessmentId) {
        Assessment assessment = findAssessment(assessmentId);
        requireAssessorOrAdmin(assessment);
        return toDetail(assessment);
    }

    @Override
    @Transactional
    public AssessmentDetailDTO saveDraft(Long assessmentId, AssessmentSubmitRequest request) {
        Assessment assessment = findAssessment(assessmentId);
        requireAssessor(assessment);

        if (assessment.getStatus() == AssessmentStatus.COMPLETED) {
            throw new RuntimeException("This assessment has already been submitted and can no longer be edited.");
        }

        upsertResponses(assessment, request.getAnswers());

        if (assessment.getStatus() == AssessmentStatus.PENDING) {
            assessment.setStatus(AssessmentStatus.IN_PROGRESS);
        }
        assessmentRepository.save(assessment);

        return toDetail(assessment);
    }

    @Override
    @Transactional
    public AssessmentDetailDTO submitAssessment(Long assessmentId, AssessmentSubmitRequest request) {
        Assessment assessment = findAssessment(assessmentId);
        requireAssessor(assessment);

        if (assessment.getStatus() == AssessmentStatus.COMPLETED) {
            throw new RuntimeException("This assessment has already been submitted.");
        }

        List<AssessmentQuestion> questions = assessment.getTemplate().getQuestions();
        List<Long> answeredIds = request.getAnswers().stream()
                .map(AssessmentAnswerRequest::getQuestionId)
                .collect(Collectors.toList());

        long unanswered = questions.stream()
                .map(AssessmentQuestion::getId)
                .filter(id -> !answeredIds.contains(id))
                .count();

        if (unanswered > 0) {
            throw new RuntimeException("Please answer all " + questions.size()
                    + " question(s) before submitting this assessment.");
        }

        List<AssessmentResponse> savedResponses = upsertResponses(assessment, request.getAnswers());

        assessment.setStatus(AssessmentStatus.COMPLETED);
        assessment.setCompletedAt(LocalDateTime.now());
        assessmentRepository.save(assessment);

        // SELF and MANAGER assessments are treated as authoritative and feed
        // straight back into the employee's proficiency levels. PEER feedback
        // is kept as commentary/context rather than overwriting the record.
        if (assessment.getType() == AssessmentType.SELF || assessment.getType() == AssessmentType.MANAGER) {
            applyRatingsToSkills(assessment.getSubjectEmployee(), savedResponses);
            recalculateGapSafely(assessment.getSubjectEmployee());
        }

        String typeLabel = typeLabel(assessment.getType());
        notificationService.notifyAssessmentCompleted(
                assessment.getSubjectEmployee(), typeLabel, assessment.getAssessor().getName(), assessment.getId());

        sendEmailSafely(assessment.getSubjectEmployee().getUser().getEmail(),
                typeLabel + " assessment completed",
                assessment.getAssessor().getName() + " completed a " + typeLabel.toLowerCase()
                        + " assessment for you. Your skill gaps have been recalculated.");

        return toDetail(assessment);
    }

    @Override
    public List<AssessmentHistoryDTO> getHistoryForEmployee(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EmployeeNotFoundException("Employee not found with id: " + employeeId));

        requireSelfOrAdminHr(employee);

        return assessmentRepository
                .findBySubjectEmployeeIdAndStatusOrderByCompletedAtDesc(employeeId, AssessmentStatus.COMPLETED)
                .stream()
                .map(this::toHistory)
                .collect(Collectors.toList());
    }

    @Override
    public List<AssessmentHistoryDTO> getMyHistory() {
        Employee employee = getCurrentEmployee();
        return assessmentRepository
                .findBySubjectEmployeeIdAndStatusOrderByCompletedAtDesc(employee.getId(), AssessmentStatus.COMPLETED)
                .stream()
                .map(this::toHistory)
                .collect(Collectors.toList());
    }

    @Override
    public List<AssessmentSummaryDTO> getAssessmentsForEmployee(Long employeeId) {
        employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EmployeeNotFoundException("Employee not found with id: " + employeeId));

        return assessmentRepository.findBySubjectEmployeeIdOrderByCreatedAtDesc(employeeId)
                .stream()
                .map(this::toSummary)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    @Scheduled(cron = "0 0 8 * * *")
    public void sendDueReminders() {
        LocalDate today = LocalDate.now();

        // Flip anything past its due date to OVERDUE first.
        List<Assessment> lapsed = assessmentRepository.findByStatusInAndDueDateLessThanEqual(
                List.of(AssessmentStatus.PENDING, AssessmentStatus.IN_PROGRESS), today.minusDays(1));
        for (Assessment assessment : lapsed) {
            assessment.setStatus(AssessmentStatus.OVERDUE);
        }
        if (!lapsed.isEmpty()) {
            assessmentRepository.saveAll(lapsed);
        }

        // Remind assessors whose assessments are due soon or already overdue,
        // skipping anyone reminded in the last day to avoid spamming.
        List<Assessment> dueSoon = assessmentRepository.findByStatusInAndDueDateLessThanEqual(
                List.of(AssessmentStatus.PENDING, AssessmentStatus.IN_PROGRESS, AssessmentStatus.OVERDUE),
                today.plusDays(REMINDER_WINDOW_DAYS));

        for (Assessment assessment : dueSoon) {
            if (assessment.getReminderSentAt() != null
                    && assessment.getReminderSentAt().toLocalDate().isEqual(today)) {
                continue;
            }

            String subjectName = assessment.getSubjectEmployee().getUser().getName();
            notificationService.notifyAssessmentReminder(
                    assessment.getAssessor(), subjectName, assessment.getDueDate(), assessment.getId());

            sendEmailSafely(assessment.getAssessor().getEmail(),
                    "Assessment reminder",
                    "Your assessment for " + subjectName + " is due by " + assessment.getDueDate() + ".");

            assessment.setReminderSentAt(LocalDateTime.now());
            assessmentRepository.save(assessment);
        }

        log.info("Assessment reminder sweep complete: {} overdue, {} reminded", lapsed.size(), dueSoon.size());
    }

    // ---------- helpers ----------

    private List<User> resolveAssessors(AssessmentType type, Employee subjectEmployee, List<Long> assessorUserIds) {
        if (type == AssessmentType.SELF) {
            return List.of(subjectEmployee.getUser());
        }

        if (assessorUserIds == null || assessorUserIds.isEmpty()) {
            throw new RuntimeException("At least one assessor is required for " + typeLabel(type).toLowerCase()
                    + " assessments.");
        }

        List<User> assessors = userRepository.findAllById(assessorUserIds);
        if (assessors.size() != assessorUserIds.size()) {
            throw new RuntimeException("One or more assessor users could not be found.");
        }
        return assessors;
    }

    private List<AssessmentResponse> upsertResponses(Assessment assessment, List<AssessmentAnswerRequest> answers) {
        Map<Long, AssessmentQuestion> questionsById = assessment.getTemplate().getQuestions().stream()
                .collect(Collectors.toMap(AssessmentQuestion::getId, q -> q));

        List<AssessmentResponse> results = new ArrayList<>();

        for (AssessmentAnswerRequest answer : answers) {
            AssessmentQuestion question = questionsById.get(answer.getQuestionId());
            if (question == null) {
                throw new RuntimeException("Question " + answer.getQuestionId()
                        + " does not belong to this assessment's template.");
            }

            int clampedRating = Math.max(1, Math.min(answer.getRating(), question.getRatingScaleMax()));

            AssessmentResponse response = responseRepository
                    .findByAssessmentIdAndQuestionId(assessment.getId(), question.getId())
                    .orElseGet(AssessmentResponse::new);

            response.setAssessment(assessment);
            response.setQuestion(question);
            response.setRating(clampedRating);
            response.setComment(answer.getComment());

            results.add(responseRepository.save(response));
        }

        return results;
    }

    private void applyRatingsToSkills(Employee subjectEmployee, List<AssessmentResponse> responses) {
        for (AssessmentResponse response : responses) {
            Skill skill = response.getQuestion().getSkill();
            if (skill == null || response.getRating() == null) {
                continue;
            }

            // Normalize the rating onto a 1-5 proficiency scale regardless of
            // the question's own rating scale, so it lines up with the scale
            // gap analysis already uses elsewhere in the platform.
            int scaleMax = Math.max(1, response.getQuestion().getRatingScaleMax());
            int normalized = (int) Math.round(response.getRating() * 5.0 / scaleMax);
            normalized = Math.max(1, Math.min(normalized, 5));

            EmployeeSkill employeeSkill = employeeSkillRepository
                    .findByEmployeeAndSkill(subjectEmployee, skill)
                    .orElseGet(() -> {
                        EmployeeSkill created = new EmployeeSkill();
                        created.setEmployee(subjectEmployee);
                        created.setSkill(skill);
                        created.setCreatedAt(LocalDateTime.now());
                        return created;
                    });

            employeeSkill.setProficiencyLevel(normalized);
            employeeSkillRepository.save(employeeSkill);
        }
    }

    private void recalculateGapSafely(Employee subjectEmployee) {
        try {
            gapAnalysisService.analyzeGapForEmployee(subjectEmployee.getId());
        } catch (Exception ex) {
            // Gap recalculation is a best-effort side effect of completing an
            // assessment; a missing role assignment shouldn't block submission.
            log.warn("Gap recalculation skipped for employee {}: {}", subjectEmployee.getId(), ex.getMessage());
        }
    }

    private void sendEmailSafely(String toEmail, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("KnowGap - " + subject);
            message.setText(body);
            mailSender.send(message);
        } catch (Exception ex) {
            log.warn("Failed to send assessment email to {}: {}", toEmail, ex.getMessage());
        }
    }

    private AssessmentType parseType(String type) {
        try {
            return AssessmentType.valueOf(type.trim().toUpperCase());
        } catch (Exception ex) {
            throw new RuntimeException("Invalid assessment type: " + type + ". Expected SELF, PEER or MANAGER.");
        }
    }

    private String typeLabel(AssessmentType type) {
        return switch (type) {
            case SELF -> "Self";
            case PEER -> "Peer";
            case MANAGER -> "Manager";
        };
    }

    private Assessment findAssessment(Long assessmentId) {
        return assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new AssessmentNotFoundException("Assessment not found with id: " + assessmentId));
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private Employee getCurrentEmployee() {
        User user = getCurrentUser();
        return employeeRepository.findByUser(user)
                .orElseThrow(() -> new EmployeeNotFoundException("Employee not found for the current user"));
    }

    private boolean isAdminOrHr() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        List<String> roles = Arrays.asList("ROLE_ADMIN", "ROLE_HR");
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(roles::contains);
    }

    private void requireAssessor(Assessment assessment) {
        User currentUser = getCurrentUser();
        if (!assessment.getAssessor().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You are not the assigned assessor for this assessment.");
        }
    }

    private void requireAssessorOrAdmin(Assessment assessment) {
        if (isAdminOrHr()) {
            return;
        }
        requireAssessor(assessment);
    }

    private void requireSelfOrAdminHr(Employee employee) {
        if (isAdminOrHr()) {
            return;
        }

        User currentUser = getCurrentUser();
        if (!employee.getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You are not authorized to view this employee's assessment history.");
        }
    }

    private AssessmentSummaryDTO toSummary(Assessment assessment) {
        return new AssessmentSummaryDTO(
                assessment.getId(),
                assessment.getTemplate().getTitle(),
                assessment.getType().name(),
                assessment.getStatus().name(),
                assessment.getSubjectEmployee().getId(),
                assessment.getSubjectEmployee().getUser().getName(),
                assessment.getAssessor().getName(),
                assessment.getDueDate(),
                assessment.getCompletedAt(),
                averageRating(assessment)
        );
    }

    private AssessmentHistoryDTO toHistory(Assessment assessment) {
        return new AssessmentHistoryDTO(
                assessment.getId(),
                assessment.getTemplate().getTitle(),
                assessment.getType().name(),
                assessment.getCompletedAt(),
                averageRating(assessment),
                assessment.getAssessor().getName()
        );
    }

    private AssessmentDetailDTO toDetail(Assessment assessment) {
        Map<Long, AssessmentResponse> responsesByQuestionId = responseRepository
                .findByAssessmentId(assessment.getId()).stream()
                .collect(Collectors.toMap(r -> r.getQuestion().getId(), r -> r));

        List<AssessmentAnswerDTO> answers = assessment.getTemplate().getQuestions().stream()
                .map(question -> {
                    AssessmentResponse response = responsesByQuestionId.get(question.getId());
                    return new AssessmentAnswerDTO(
                            question.getId(),
                            question.getQuestionText(),
                            question.getSkill() != null ? question.getSkill().getId() : null,
                            question.getSkill() != null ? question.getSkill().getSkillName() : null,
                            question.getRatingScaleMax(),
                            response != null ? response.getRating() : null,
                            response != null ? response.getComment() : null
                    );
                })
                .collect(Collectors.toList());

        return new AssessmentDetailDTO(
                assessment.getId(),
                assessment.getTemplate().getTitle(),
                assessment.getTemplate().getDescription(),
                assessment.getType().name(),
                assessment.getStatus().name(),
                assessment.getSubjectEmployee().getId(),
                assessment.getSubjectEmployee().getUser().getName(),
                assessment.getAssessor().getName(),
                assessment.getDueDate(),
                assessment.getCompletedAt(),
                answers
        );
    }

    private Integer averageRating(Assessment assessment) {
        List<AssessmentResponse> responses = responseRepository.findByAssessmentId(assessment.getId());
        List<Integer> ratings = responses.stream()
                .map(AssessmentResponse::getRating)
                .filter(java.util.Objects::nonNull)
                .toList();

        if (ratings.isEmpty()) {
            return null;
        }

        double avg = ratings.stream().mapToInt(Integer::intValue).average().orElse(0);
        return (int) Math.round(avg);
    }
}
