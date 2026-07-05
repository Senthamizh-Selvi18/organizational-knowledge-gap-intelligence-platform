package com.organizational.knowledge_gap_platform.controller;

import com.organizational.knowledge_gap_platform.dto.AuthResponse;
import com.organizational.knowledge_gap_platform.dto.LoginRequest;
import com.organizational.knowledge_gap_platform.dto.RegisterRequest;
import com.organizational.knowledge_gap_platform.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import jakarta.validation.Valid;


@RestController
@RequestMapping("/auth")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }
    @PostMapping("/register")
public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {

    System.out.println("REGISTER API HIT");

    return ResponseEntity.ok(authService.register(request));
}
   
   
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
        @Valid @RequestBody LoginRequest request) {

        return ResponseEntity.ok(authService.login(request));
    }
}