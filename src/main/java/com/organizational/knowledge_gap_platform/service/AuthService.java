package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.AuthResponse;
import com.organizational.knowledge_gap_platform.dto.LoginRequest;
import com.organizational.knowledge_gap_platform.dto.RegisterRequest;
import com.organizational.knowledge_gap_platform.entity.Employee;
import com.organizational.knowledge_gap_platform.entity.NotificationType;
import com.organizational.knowledge_gap_platform.entity.Role;
import com.organizational.knowledge_gap_platform.entity.User;
import com.organizational.knowledge_gap_platform.repository.EmployeeRepository;
import com.organizational.knowledge_gap_platform.repository.RoleRepository;
import com.organizational.knowledge_gap_platform.repository.UserRepository;
import com.organizational.knowledge_gap_platform.security.JwtService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;


@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final OtpService otpService;
    private final NotificationService notificationService;

    public AuthService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       EmployeeRepository employeeRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       AuthenticationManager authenticationManager,
                       OtpService otpService,
                       NotificationService notificationService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.otpService = otpService;
        this.notificationService = notificationService;
    }

   public AuthResponse register(RegisterRequest request) {

    Role role = roleRepository.findById(request.getRoleId())
            .orElseThrow(() -> new RuntimeException("Role not found"));

    User user = new User();
    user.setName(request.getName());
    user.setEmail(request.getEmail());
    user.setPassword(passwordEncoder.encode(request.getPassword()));

    user.getRoles().add(role);

    user.setCreatedAt(LocalDateTime.now());

    userRepository.save(user);

    // --- THE FIX ---
    // Previously, registering a User never created a matching Employee
    // row (Week 1 spec required "create profile on first login" —
    // this step was missing entirely). Employee has NOT NULL columns
    // for department/designation, and RegisterRequest doesn't collect
    // those at signup, so we use clear placeholder values here.
    // HR/Admin can fill in the real values afterward via the existing
    // Employee Management "Edit" flow (EmployeeServiceImpl.updateEmployee).
    Employee employee = new Employee();
    employee.setEmployeeCode("EMP-" + user.getId());
    employee.setUser(user);
    employee.setDepartment("Not Assigned");
    employee.setDesignation("Not Assigned");
    employee.setExperience(0);
    employee.setCreatedAt(LocalDateTime.now());

    employeeRepository.save(employee);

    notifyEmployeeCreated(user, employee);

        String token = jwtService.generateToken(user.getEmail());
        String roleName = user.getRoles()
        .stream()
        .findFirst()
        .map(Role::getRoleName)
        .orElse("Employee");

return new AuthResponse(
        token,
        roleName,
        user.getId(),
        user.getName(),
        !user.isFirstLoginCompleted()
);
}

    /**
     * Fires an EMPLOYEE_CREATED notification to the newly registered user themselves
     * (welcome-style notification, e.g. "complete your profile"). Never allowed to
     * break registration if it fails.
     */
    private void notifyEmployeeCreated(User user, Employee employee) {
        try {
            notificationService.createNotification(
                    user.getId(),
                    NotificationType.EMPLOYEE_CREATED.name(),
                    "Welcome aboard!",
                    "Your employee profile has been created. Please complete your department and designation details.",
                    "MEDIUM",
                    "/profile",
                    employee.getId()
            );
        } catch (Exception ex) {
            log.error("Failed to create EMPLOYEE_CREATED notification for user {}", user.getId(), ex);
        }
    }


    public AuthResponse login(LoginRequest request) {

    authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                    request.getEmail(),
                    request.getPassword()
            )
    );

   User user = userRepository.findByEmail(request.getEmail())
        .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtService.generateToken(user.getEmail());

        
String role = user.getRoles()
        .stream()
        .map(Role::getRoleName)
        .filter(r -> r.equalsIgnoreCase("Admin"))
        .findFirst()
        .orElse(
            user.getRoles()
            .stream()
            .findFirst()
            .map(Role::getRoleName)
            .orElse("Employee")
        );

return new AuthResponse(
        token,
        role,
        user.getId(),
        user.getName(),
        !user.isFirstLoginCompleted()
);
    }

    public void sendFirstLoginOtp(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        otpService.generateAndSendOtp(userId, user.getEmail());
    }

    public boolean verifyFirstLoginOtp(Long userId, String otp) {
        boolean verified = otpService.verifyOtp(userId, otp);

        if (verified) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            user.setFirstLoginCompleted(true);
            userRepository.save(user);
        }

        return verified;
    }
}