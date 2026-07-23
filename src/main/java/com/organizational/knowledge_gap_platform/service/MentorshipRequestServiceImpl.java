package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.MentorshipRequestCreateDTO;
import com.organizational.knowledge_gap_platform.dto.MentorshipRequestDecisionDTO;
import com.organizational.knowledge_gap_platform.dto.MentorshipRequestResponseDTO;
import com.organizational.knowledge_gap_platform.entity.Employee;
import com.organizational.knowledge_gap_platform.entity.MentorProfile;
import com.organizational.knowledge_gap_platform.entity.MentorshipRequest;
import com.organizational.knowledge_gap_platform.entity.MentorshipRequestStatus;
import com.organizational.knowledge_gap_platform.entity.User;
import com.organizational.knowledge_gap_platform.exception.EmployeeNotFoundException;
import com.organizational.knowledge_gap_platform.exception.InvalidMentorshipActionException;
import com.organizational.knowledge_gap_platform.exception.MentorProfileNotFoundException;
import com.organizational.knowledge_gap_platform.exception.MentorshipRequestNotFoundException;
import com.organizational.knowledge_gap_platform.repository.EmployeeRepository;
import com.organizational.knowledge_gap_platform.repository.MentorProfileRepository;
import com.organizational.knowledge_gap_platform.repository.MentorshipRequestRepository;
import com.organizational.knowledge_gap_platform.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MentorshipRequestServiceImpl implements MentorshipRequestService {

    private final MentorshipRequestRepository mentorshipRequestRepository;
    private final MentorProfileRepository mentorProfileRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;

    public MentorshipRequestServiceImpl(MentorshipRequestRepository mentorshipRequestRepository,
                                         MentorProfileRepository mentorProfileRepository,
                                         EmployeeRepository employeeRepository,
                                         UserRepository userRepository) {
        this.mentorshipRequestRepository = mentorshipRequestRepository;
        this.mentorProfileRepository = mentorProfileRepository;
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public MentorshipRequestResponseDTO createRequest(MentorshipRequestCreateDTO request) {
        Employee mentee = currentEmployee();

        MentorProfile mentorProfile = mentorProfileRepository.findById(request.getMentorProfileId())
                .orElseThrow(() -> new MentorProfileNotFoundException(
                        "Mentor profile not found with id: " + request.getMentorProfileId()));

        if (mentorProfile.getEmployee().getId().equals(mentee.getId())) {
            throw new InvalidMentorshipActionException("You cannot request mentorship from yourself.");
        }

        if (!mentorProfile.isActive()) {
            throw new InvalidMentorshipActionException("This mentor is not currently accepting new mentees.");
        }

        mentorshipRequestRepository
                .findByMentorProfileAndMenteeAndStatus(mentorProfile, mentee, MentorshipRequestStatus.PENDING)
                .ifPresent(existing -> {
                    throw new InvalidMentorshipActionException(
                            "You already have a pending request with this mentor.");
                });

        long activeMentees = mentorshipRequestRepository
                .countByMentorProfileAndStatus(mentorProfile, MentorshipRequestStatus.ACCEPTED);

        if (activeMentees >= mentorProfile.getMaxMentees()) {
            throw new InvalidMentorshipActionException("This mentor has reached their maximum number of mentees.");
        }

        MentorshipRequest mentorshipRequest = new MentorshipRequest();
        mentorshipRequest.setMentorProfile(mentorProfile);
        mentorshipRequest.setMentee(mentee);
        mentorshipRequest.setMessage(request.getMessage());
        mentorshipRequest.setStatus(MentorshipRequestStatus.PENDING);

        MentorshipRequest saved = mentorshipRequestRepository.save(mentorshipRequest);
        return toDto(saved);
    }

    @Override
    public List<MentorshipRequestResponseDTO> listIncomingRequests() {
        Employee employee = currentEmployee();
        return mentorshipRequestRepository.findByMentorProfile_EmployeeOrderByRequestedAtDesc(employee)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public List<MentorshipRequestResponseDTO> listOutgoingRequests() {
        Employee employee = currentEmployee();
        return mentorshipRequestRepository.findByMenteeOrderByRequestedAtDesc(employee)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MentorshipRequestResponseDTO respondToRequest(Long requestId, MentorshipRequestDecisionDTO decision) {
        Employee employee = currentEmployee();

        MentorshipRequest mentorshipRequest = mentorshipRequestRepository.findById(requestId)
                .orElseThrow(() -> new MentorshipRequestNotFoundException(
                        "Mentorship request not found with id: " + requestId));

        if (!mentorshipRequest.getMentorProfile().getEmployee().getId().equals(employee.getId())) {
            throw new AccessDeniedException("Only the mentor can respond to this request.");
        }

        if (mentorshipRequest.getStatus() != MentorshipRequestStatus.PENDING) {
            throw new InvalidMentorshipActionException("This request has already been resolved.");
        }

        String decisionValue = decision.getDecision() == null ? "" : decision.getDecision().trim().toUpperCase();

        if (decisionValue.equals("ACCEPTED")) {
            long activeMentees = mentorshipRequestRepository.countByMentorProfileAndStatus(
                    mentorshipRequest.getMentorProfile(), MentorshipRequestStatus.ACCEPTED);
            if (activeMentees >= mentorshipRequest.getMentorProfile().getMaxMentees()) {
                throw new InvalidMentorshipActionException(
                        "You have reached your maximum number of mentees.");
            }
            mentorshipRequest.setStatus(MentorshipRequestStatus.ACCEPTED);
        } else if (decisionValue.equals("DECLINED")) {
            mentorshipRequest.setStatus(MentorshipRequestStatus.DECLINED);
        } else {
            throw new InvalidMentorshipActionException("Decision must be either ACCEPTED or DECLINED.");
        }

        mentorshipRequest.setResponseNote(decision.getResponseNote());
        mentorshipRequest.setRespondedAt(LocalDateTime.now());

        MentorshipRequest saved = mentorshipRequestRepository.save(mentorshipRequest);
        return toDto(saved);
    }

    @Override
    @Transactional
    public MentorshipRequestResponseDTO cancelRequest(Long requestId) {
        Employee employee = currentEmployee();

        MentorshipRequest mentorshipRequest = mentorshipRequestRepository.findById(requestId)
                .orElseThrow(() -> new MentorshipRequestNotFoundException(
                        "Mentorship request not found with id: " + requestId));

        boolean isMentee = mentorshipRequest.getMentee().getId().equals(employee.getId());
        boolean isMentor = mentorshipRequest.getMentorProfile().getEmployee().getId().equals(employee.getId());

        if (!isMentee && !isMentor) {
            throw new AccessDeniedException("You are not part of this mentorship request.");
        }

        if (mentorshipRequest.getStatus() == MentorshipRequestStatus.DECLINED) {
            throw new InvalidMentorshipActionException("This request has already been declined.");
        }

        mentorshipRequest.setStatus(MentorshipRequestStatus.CANCELLED);
        mentorshipRequest.setRespondedAt(LocalDateTime.now());

        MentorshipRequest saved = mentorshipRequestRepository.save(mentorshipRequest);
        return toDto(saved);
    }

    private MentorshipRequestResponseDTO toDto(MentorshipRequest request) {
        Employee mentorEmployee = request.getMentorProfile().getEmployee();
        Employee menteeEmployee = request.getMentee();

        MentorshipRequestResponseDTO dto = new MentorshipRequestResponseDTO();
        dto.setId(request.getId());
        dto.setMentorProfileId(request.getMentorProfile().getId());
        dto.setMentorEmployeeId(mentorEmployee.getId());
        dto.setMentorName(mentorEmployee.getUser() != null ? mentorEmployee.getUser().getName() : null);
        dto.setMenteeEmployeeId(menteeEmployee.getId());
        dto.setMenteeName(menteeEmployee.getUser() != null ? menteeEmployee.getUser().getName() : null);
        dto.setMessage(request.getMessage());
        dto.setStatus(request.getStatus().name());
        dto.setResponseNote(request.getResponseNote());
        dto.setRequestedAt(request.getRequestedAt());
        dto.setRespondedAt(request.getRespondedAt());
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

