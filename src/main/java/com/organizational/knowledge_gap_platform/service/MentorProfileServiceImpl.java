package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.MentorProfileRequestDTO;
import com.organizational.knowledge_gap_platform.dto.MentorProfileResponseDTO;
import com.organizational.knowledge_gap_platform.entity.Employee;
import com.organizational.knowledge_gap_platform.entity.MentorProfile;
import com.organizational.knowledge_gap_platform.entity.MentorshipRequestStatus;
import com.organizational.knowledge_gap_platform.entity.SessionFeedback;
import com.organizational.knowledge_gap_platform.entity.User;
import com.organizational.knowledge_gap_platform.exception.EmployeeNotFoundException;
import com.organizational.knowledge_gap_platform.exception.MentorProfileNotFoundException;
import com.organizational.knowledge_gap_platform.repository.EmployeeRepository;
import com.organizational.knowledge_gap_platform.repository.MentorProfileRepository;
import com.organizational.knowledge_gap_platform.repository.MentorshipRequestRepository;
import com.organizational.knowledge_gap_platform.repository.SessionFeedbackRepository;
import com.organizational.knowledge_gap_platform.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MentorProfileServiceImpl implements MentorProfileService {

    private final MentorProfileRepository mentorProfileRepository;
    private final MentorshipRequestRepository mentorshipRequestRepository;
    private final SessionFeedbackRepository sessionFeedbackRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;

    public MentorProfileServiceImpl(MentorProfileRepository mentorProfileRepository,
                                     MentorshipRequestRepository mentorshipRequestRepository,
                                     SessionFeedbackRepository sessionFeedbackRepository,
                                     EmployeeRepository employeeRepository,
                                     UserRepository userRepository) {
        this.mentorProfileRepository = mentorProfileRepository;
        this.mentorshipRequestRepository = mentorshipRequestRepository;
        this.sessionFeedbackRepository = sessionFeedbackRepository;
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
    }

    @Override
    public List<MentorProfileResponseDTO> listMentors(String expertise, boolean activeOnly) {
        List<MentorProfile> profiles = activeOnly
                ? mentorProfileRepository.findByActiveTrueOrderByCreatedAtDesc()
                : mentorProfileRepository.findAllByOrderByCreatedAtDesc();

        return profiles.stream()
                .filter(p -> expertise == null || expertise.isBlank()
                        || p.getExpertiseAreas().toLowerCase().contains(expertise.toLowerCase()))
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public MentorProfileResponseDTO getMentorProfile(Long id) {
        MentorProfile profile = mentorProfileRepository.findById(id)
                .orElseThrow(() -> new MentorProfileNotFoundException("Mentor profile not found with id: " + id));
        return toDto(profile);
    }

    @Override
    public MentorProfileResponseDTO getMyProfile() {
        Employee employee = currentEmployee();
        MentorProfile profile = mentorProfileRepository.findByEmployee(employee)
                .orElseThrow(() -> new MentorProfileNotFoundException("You do not have a mentor profile yet."));
        return toDto(profile);
    }

    @Override
    @Transactional
    public MentorProfileResponseDTO upsertMyProfile(MentorProfileRequestDTO request) {
        Employee employee = currentEmployee();

        MentorProfile profile = mentorProfileRepository.findByEmployee(employee)
                .orElseGet(() -> {
                    MentorProfile p = new MentorProfile();
                    p.setEmployee(employee);
                    return p;
                });

        profile.setExpertiseAreas(request.getExpertiseAreas());
        profile.setBio(request.getBio());
        profile.setYearsOfExperience(request.getYearsOfExperience());
        profile.setAvailability(request.getAvailability());
        profile.setMaxMentees(request.getMaxMentees());
        profile.setActive(request.isActive());

        MentorProfile saved = mentorProfileRepository.save(profile);
        return toDto(saved);
    }

    @Override
    @Transactional
    public void deleteMyProfile() {
        Employee employee = currentEmployee();
        MentorProfile profile = mentorProfileRepository.findByEmployee(employee)
                .orElseThrow(() -> new MentorProfileNotFoundException("You do not have a mentor profile yet."));
        mentorProfileRepository.delete(profile);
    }

    private MentorProfileResponseDTO toDto(MentorProfile profile) {
        Employee employee = profile.getEmployee();

        long activeMentees = mentorshipRequestRepository
                .countByMentorProfileAndStatus(profile, MentorshipRequestStatus.ACCEPTED);

        List<SessionFeedback> feedbackList = sessionFeedbackRepository.findAllForMentorProfile(profile);
        Double avgRating = feedbackList.isEmpty()
                ? null
                : feedbackList.stream().mapToInt(SessionFeedback::getRating).average().orElse(0.0);

        MentorProfileResponseDTO dto = new MentorProfileResponseDTO();
        dto.setId(profile.getId());
        dto.setEmployeeId(employee.getId());
        dto.setEmployeeName(employee.getUser() != null ? employee.getUser().getName() : null);
        dto.setDepartment(employee.getDepartment());
        dto.setDesignation(employee.getDesignation());
        dto.setExpertiseAreas(profile.getExpertiseAreas());
        dto.setBio(profile.getBio());
        dto.setYearsOfExperience(profile.getYearsOfExperience());
        dto.setAvailability(profile.getAvailability());
        dto.setMaxMentees(profile.getMaxMentees());
        dto.setActiveMenteeCount((int) activeMentees);
        dto.setActive(profile.isActive());
        dto.setAverageRating(avgRating == null ? null : Math.round(avgRating * 10.0) / 10.0);
        dto.setTotalReviews(feedbackList.size());
        dto.setCreatedAt(profile.getCreatedAt());
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
