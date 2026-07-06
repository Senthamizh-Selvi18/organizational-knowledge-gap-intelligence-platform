package com.organizational.knowledge_gap_platform.service;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.organizational.knowledge_gap_platform.dto.ProfileResponseDTO;
import com.organizational.knowledge_gap_platform.dto.UpdateProfileRequestDTO;
import com.organizational.knowledge_gap_platform.entity.Employee;
import com.organizational.knowledge_gap_platform.entity.User;
import com.organizational.knowledge_gap_platform.repository.EmployeeRepository;
import com.organizational.knowledge_gap_platform.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProfileService {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;

    public ProfileService(UserRepository userRepository,
                          EmployeeRepository employeeRepository) {
        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
    }

    public ProfileResponseDTO getProfile(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        String loggedInUserEmail = authentication.getName();

        if (!user.getEmail().equals(loggedInUserEmail)) {
            throw new AccessDeniedException("You are not authorized to access this profile.");
        }

        Employee employee = employeeRepository.findByUser(user).orElse(null);

        ProfileResponseDTO response = new ProfileResponseDTO();

        response.setUserId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole().getRoleName());

        if (employee != null) {
            response.setEmployeeCode(employee.getEmployeeCode());
            response.setDepartment(employee.getDepartment());
            response.setDesignation(employee.getDesignation());
            response.setPhoneNumber(employee.getPhoneNumber());
            response.setLocation(employee.getLocation());
            response.setJoiningDate(employee.getJoiningDate());
            response.setExperience(employee.getExperience());
            response.setManager(employee.getManager());
            response.setCreatedAt(employee.getCreatedAt());
        }

        return response;
    }

    @Transactional
    public ProfileResponseDTO updateProfile(Long userId,
                                            UpdateProfileRequestDTO request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        String loggedInUserEmail = authentication.getName();

        if (!user.getEmail().equals(loggedInUserEmail)) {
            throw new AccessDeniedException("You are not authorized to update this profile.");
        }

        // Update User table
        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            user.setName(request.getName());
        }
        userRepository.save(user);

        // Update Employee table
        Employee employee = employeeRepository.findByUser(user).orElse(null);

        if (employee != null) {

            if (request.getDepartment() != null && !request.getDepartment().trim().isEmpty()) {
                employee.setDepartment(request.getDepartment());
            }

            if (request.getDesignation() != null && !request.getDesignation().trim().isEmpty()) {
                employee.setDesignation(request.getDesignation());
            }

            if (request.getPhoneNumber() != null && !request.getPhoneNumber().trim().isEmpty()) {
                employee.setPhoneNumber(request.getPhoneNumber());
            }

            if (request.getLocation() != null && !request.getLocation().trim().isEmpty()) {
                employee.setLocation(request.getLocation());
            }

            if (request.getJoiningDate() != null) {
                employee.setJoiningDate(request.getJoiningDate());
            }

            if (request.getExperience() != null) {
                employee.setExperience(request.getExperience());
            }

            if (request.getManager() != null && !request.getManager().trim().isEmpty()) {
                employee.setManager(request.getManager());
            }

            employeeRepository.save(employee);
        }

        return getProfile(userId);
    }
}