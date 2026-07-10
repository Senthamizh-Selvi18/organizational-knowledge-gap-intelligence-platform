package com.organizational.knowledge_gap_platform.controller;

import com.organizational.knowledge_gap_platform.dto.AuthResponse;
import com.organizational.knowledge_gap_platform.dto.LoginRequest;
import com.organizational.knowledge_gap_platform.dto.RegisterRequest;
import com.organizational.knowledge_gap_platform.dto.SendOtpRequest;
import com.organizational.knowledge_gap_platform.dto.VerifyOtpRequest;
import com.organizational.knowledge_gap_platform.entity.Role;
import com.organizational.knowledge_gap_platform.service.AuthService;
import com.organizational.knowledge_gap_platform.service.RoleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/auth")
public class AuthController {
    
    private final AuthService authService;
    private final RoleService roleService;

    public AuthController(AuthService authService, RoleService roleService) {
        this.authService = authService;
        this.roleService = roleService;
    }

    @GetMapping("/roles")
    public ResponseEntity<List<Role>> getRegisterableRoles() {
        return ResponseEntity.ok(roleService.getRegisterableRoles());
    }
    @PostMapping("/register")
public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {

    return ResponseEntity.ok(authService.register(request));
}
   
   
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
        @Valid @RequestBody LoginRequest request) {

        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/otp/send")
    public ResponseEntity<Map<String, Object>> sendOtp(@RequestBody SendOtpRequest request) {
        authService.sendFirstLoginOtp(request.getUserId(), request.getPhone());
        return ResponseEntity.ok(Map.of("message", "OTP sent successfully"));
    }

    @PostMapping("/otp/verify")
    public ResponseEntity<Map<String, Object>> verifyOtp(@RequestBody VerifyOtpRequest request) {
        boolean verified = authService.verifyFirstLoginOtp(request.getUserId(), request.getOtp());

        if (verified) {
            return ResponseEntity.ok(Map.of(
                    "message", "OTP verified successfully",
                    "verified", true
            ));
        }

        return ResponseEntity.status(400).body(Map.of(
                "message", "Invalid or expired OTP",
                "verified", false
        ));
    }
}