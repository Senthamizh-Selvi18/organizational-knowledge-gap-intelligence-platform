package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.SessionFeedbackRequestDTO;
import com.organizational.knowledge_gap_platform.dto.SessionFeedbackResponseDTO;
import com.organizational.knowledge_gap_platform.entity.Employee;
import com.organizational.knowledge_gap_platform.entity.MentorProfile;
import com.organizational.knowledge_gap_platform.entity.MentorshipSession;
import com.organizational.knowledge_gap_platform.entity.MentorshipSessionStatus;
import com.organizational.knowledge_gap_platform.entity.SessionFeedback;
import com.organizational.knowledge_gap_platform.entity.User;
import com.organizational.knowledge_gap_platform.exception.EmployeeNotFoundException;
import com.organizational.knowledge_gap_platform.exception.InvalidMentorshipActionException;
import com.organizational.knowledge_gap_platform.exception.MentorProfileNotFoundException;
import com.organizational.knowledge_gap_platform.exception.MentorshipSessionNotFoundException;
import com.organizational.knowledge_gap_platform.repository.EmployeeRepository;
import com.organizational.knowledge_gap_platform.repository.MentorProfileRepository;
import com.organizational.knowledge_gap_platform.repository.MentorshipSessionRepository;
import com.organizational.knowledge_gap_platform.repository.SessionFeedbackRepository;
import com.organizational.knowledge_gap_platform.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SessionFeedbackServiceImpl implements SessionFeedbackService {

    private final SessionFeedbackRepository sessionFeedbackRepository;
    private final MentorshipSessionRepository mentorshipSessionRepository;
    private final MentorProfileRepository mentorProfileRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;

    public SessionFeedbackServiceImpl(SessionFeedbackRepository sessionFeedbackRepository,
                                       MentorshipSessionRepository mentorshipSessionRepository,
                                       MentorProfileRepository mentorProfileRepository,
                                       EmployeeRepository employeeRepository,
                                       UserRepository userRepository) {
        this.sessionFeedbackRepository = sessionFeedbackRepository;
        this.mentorshipSessionRepository = mentorshipSessionRepository;
        this.mentorProfileRepository = mentorProfileRepository;
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public SessionFeedbackResponseDTO submitFeedback(Long sessionId, SessionFeedbackRequestDTO request) {
        Employee employee = currentEmployee();

        MentorshipSession session = mentorshipSessionRepository.findById(sessionId)
                .orElseThrow(() -> new MentorshipSessionNotFoundException(
                        "Mentorship session not found with id: " + sessionId));

        boolean isMentee = session.getMentorshipRequest().getMentee().getId().equals(employee.getId());
        if (!isMentee) {
            throw new AccessDeniedException("Only the mentee of this session can leave feedback.");
        }

        if (session.getStatus() != MentorshipSessionStatus.COMPLETED) {
            throw new InvalidMentorshipActionException("Feedback can only be submitted for completed sessions.");
        }

        if (sessionFeedbackRepository.existsBySession(session)) {
            throw new InvalidMentorshipActionException("Feedback has already been submitted for this session.");
        }

        SessionFeedback feedback = new SessionFeedback();
        feedback.setSession(session);
        feedback.setGivenBy(employee);
        feedback.setRating(request.getRating());
        feedback.setComments(request.getComments());

        SessionFeedback saved = sessionFeedbackRepository.save(feedback);
        return toDto(saved);
    }

    @Override
    public SessionFeedbackResponseDTO getFeedbackForSession(Long sessionId) {
        MentorshipSession session = mentorshipSessionRepository.findById(sessionId)
                .orElseThrow(() -> new MentorshipSessionNotFoundException(
                        "Mentorship session not found with id: " + sessionId));

        SessionFeedback feedback = sessionFeedbackRepository.findBySession(session)
                .orElseThrow(() -> new InvalidMentorshipActionException(
                        "No feedback has been submitted for this session yet."));

        return toDto(feedback);
    }

    @Override
    public List<SessionFeedbackResponseDTO> getFeedbackForMentor(Long mentorProfileId) {
        MentorProfile mentorProfile = mentorProfileRepository.findById(mentorProfileId)
                .orElseThrow(() -> new MentorProfileNotFoundException(
                        "Mentor profile not found with id: " + mentorProfileId));

        return sessionFeedbackRepository.findAllForMentorProfile(mentorProfile)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    private SessionFeedbackResponseDTO toDto(SessionFeedback feedback) {
        SessionFeedbackResponseDTO dto = new SessionFeedbackResponseDTO();
        dto.setId(feedback.getId());
        dto.setSessionId(feedback.getSession().getId());
        dto.setGivenByEmployeeId(feedback.getGivenBy().getId());
        dto.setGivenByName(feedback.getGivenBy().getUser() != null
                ? feedback.getGivenBy().getUser().getName() : null);
        dto.setRating(feedback.getRating());
        dto.setComments(feedback.getComments());
        dto.setCreatedAt(feedback.getCreatedAt());
        return dto;
    }

    private Employee currentEmployee() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EmployeeNotFoundException("Logged-in user not found."));

        return employeeRepository.findByUser(user)
                .orElseThrow(() -> new EmployeeNotFoundException(
                        "No employee record linked to the logged-in user."));
    }
}
