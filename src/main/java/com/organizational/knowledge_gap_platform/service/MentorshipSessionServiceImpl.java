package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.MentorshipSessionRequestDTO;
import com.organizational.knowledge_gap_platform.dto.MentorshipSessionResponseDTO;
import com.organizational.knowledge_gap_platform.dto.SessionStatusUpdateDTO;
import com.organizational.knowledge_gap_platform.entity.Employee;
import com.organizational.knowledge_gap_platform.entity.MentorshipRequest;
import com.organizational.knowledge_gap_platform.entity.MentorshipRequestStatus;
import com.organizational.knowledge_gap_platform.entity.MentorshipSession;
import com.organizational.knowledge_gap_platform.entity.MentorshipSessionStatus;
import com.organizational.knowledge_gap_platform.entity.User;
import com.organizational.knowledge_gap_platform.exception.EmployeeNotFoundException;
import com.organizational.knowledge_gap_platform.exception.InvalidMentorshipActionException;
import com.organizational.knowledge_gap_platform.exception.MentorshipRequestNotFoundException;
import com.organizational.knowledge_gap_platform.exception.MentorshipSessionNotFoundException;
import com.organizational.knowledge_gap_platform.repository.EmployeeRepository;
import com.organizational.knowledge_gap_platform.repository.MentorshipRequestRepository;
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
public class MentorshipSessionServiceImpl implements MentorshipSessionService {

    private final MentorshipSessionRepository mentorshipSessionRepository;
    private final MentorshipRequestRepository mentorshipRequestRepository;
    private final SessionFeedbackRepository sessionFeedbackRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;

    public MentorshipSessionServiceImpl(MentorshipSessionRepository mentorshipSessionRepository,
                                         MentorshipRequestRepository mentorshipRequestRepository,
                                         SessionFeedbackRepository sessionFeedbackRepository,
                                         EmployeeRepository employeeRepository,
                                         UserRepository userRepository) {
        this.mentorshipSessionRepository = mentorshipSessionRepository;
        this.mentorshipRequestRepository = mentorshipRequestRepository;
        this.sessionFeedbackRepository = sessionFeedbackRepository;
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public MentorshipSessionResponseDTO bookSession(MentorshipSessionRequestDTO request) {
        Employee employee = currentEmployee();

        MentorshipRequest mentorshipRequest = mentorshipRequestRepository.findById(request.getMentorshipRequestId())
                .orElseThrow(() -> new MentorshipRequestNotFoundException(
                        "Mentorship request not found with id: " + request.getMentorshipRequestId()));

        boolean isMentor = mentorshipRequest.getMentorProfile().getEmployee().getId().equals(employee.getId());
        boolean isMentee = mentorshipRequest.getMentee().getId().equals(employee.getId());

        if (!isMentor && !isMentee) {
            throw new AccessDeniedException("You are not part of this mentorship relationship.");
        }

        if (mentorshipRequest.getStatus() != MentorshipRequestStatus.ACCEPTED) {
            throw new InvalidMentorshipActionException(
                    "Sessions can only be booked for an accepted mentorship match.");
        }

        MentorshipSession session = new MentorshipSession();
        session.setMentorshipRequest(mentorshipRequest);
        session.setTopic(request.getTopic());
        session.setScheduledAt(request.getScheduledAt());
        session.setDurationMinutes(request.getDurationMinutes() == null ? 30 : request.getDurationMinutes());
        session.setMeetingLink(request.getMeetingLink());
        session.setNotes(request.getNotes());
        session.setStatus(MentorshipSessionStatus.SCHEDULED);

        MentorshipSession saved = mentorshipSessionRepository.save(session);
        return toDto(saved);
    }

    @Override
    public List<MentorshipSessionResponseDTO> listMySessions() {
        Employee employee = currentEmployee();
        return mentorshipSessionRepository.findAllForEmployee(employee)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public MentorshipSessionResponseDTO getSession(Long sessionId) {
        MentorshipSession session = findSessionForCurrentUser(sessionId);
        return toDto(session);
    }

    @Override
    @Transactional
    public MentorshipSessionResponseDTO updateStatus(Long sessionId, SessionStatusUpdateDTO update) {
        MentorshipSession session = findSessionForCurrentUser(sessionId);

        String statusValue = update.getStatus() == null ? "" : update.getStatus().trim().toUpperCase();

        if (session.getStatus() != MentorshipSessionStatus.SCHEDULED) {
            throw new InvalidMentorshipActionException("Only scheduled sessions can be updated.");
        }

        if (statusValue.equals("COMPLETED")) {
            session.setStatus(MentorshipSessionStatus.COMPLETED);
        } else if (statusValue.equals("CANCELLED")) {
            session.setStatus(MentorshipSessionStatus.CANCELLED);
        } else {
            throw new InvalidMentorshipActionException("Status must be either COMPLETED or CANCELLED.");
        }

        if (update.getNotes() != null && !update.getNotes().isBlank()) {
            session.setNotes(update.getNotes());
        }

        MentorshipSession saved = mentorshipSessionRepository.save(session);
        return toDto(saved);
    }

    private MentorshipSession findSessionForCurrentUser(Long sessionId) {
        Employee employee = currentEmployee();

        MentorshipSession session = mentorshipSessionRepository.findById(sessionId)
                .orElseThrow(() -> new MentorshipSessionNotFoundException(
                        "Mentorship session not found with id: " + sessionId));

        boolean isMentor = session.getMentorshipRequest().getMentorProfile().getEmployee()
                .getId().equals(employee.getId());
        boolean isMentee = session.getMentorshipRequest().getMentee().getId().equals(employee.getId());

        if (!isMentor && !isMentee) {
            throw new AccessDeniedException("You are not part of this mentorship session.");
        }

        return session;
    }

    private MentorshipSessionResponseDTO toDto(MentorshipSession session) {
        Employee mentorEmployee = session.getMentorshipRequest().getMentorProfile().getEmployee();
        Employee menteeEmployee = session.getMentorshipRequest().getMentee();

        MentorshipSessionResponseDTO dto = new MentorshipSessionResponseDTO();
        dto.setId(session.getId());
        dto.setMentorshipRequestId(session.getMentorshipRequest().getId());
        dto.setMentorEmployeeId(mentorEmployee.getId());
        dto.setMentorName(mentorEmployee.getUser() != null ? mentorEmployee.getUser().getName() : null);
        dto.setMenteeEmployeeId(menteeEmployee.getId());
        dto.setMenteeName(menteeEmployee.getUser() != null ? menteeEmployee.getUser().getName() : null);
        dto.setTopic(session.getTopic());
        dto.setScheduledAt(session.getScheduledAt());
        dto.setDurationMinutes(session.getDurationMinutes());
        dto.setMeetingLink(session.getMeetingLink());
        dto.setNotes(session.getNotes());
        dto.setStatus(session.getStatus().name());
        dto.setCreatedAt(session.getCreatedAt());
        dto.setFeedbackSubmitted(sessionFeedbackRepository.existsBySession(session));
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