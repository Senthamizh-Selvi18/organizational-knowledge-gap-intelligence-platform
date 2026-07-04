package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.AuthResponse;
import com.organizational.knowledge_gap_platform.dto.LoginRequest;
import com.organizational.knowledge_gap_platform.dto.RegisterRequest;
import com.organizational.knowledge_gap_platform.entity.Role;
import com.organizational.knowledge_gap_platform.entity.User;
import com.organizational.knowledge_gap_platform.repository.RoleRepository;
import com.organizational.knowledge_gap_platform.repository.UserRepository;
import com.organizational.knowledge_gap_platform.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;


@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    // register() and login() will be added next

    public AuthResponse register(RegisterRequest request) {

    Role role = roleRepository.findById(request.getRoleId())
            .orElseThrow(() -> new RuntimeException("Role not found"));

    User user = new User();
    user.setName(request.getName());
    user.setEmail(request.getEmail());
    user.setPassword(passwordEncoder.encode(request.getPassword()));
    user.setRole(role);
    user.setCreatedAt(LocalDateTime.now());

    userRepository.save(user);

    String token = jwtService.generateToken(user.getEmail());

    return new AuthResponse(token, role.getRoleName());
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

return new AuthResponse(token, user.getRole().getRoleName());
}
}