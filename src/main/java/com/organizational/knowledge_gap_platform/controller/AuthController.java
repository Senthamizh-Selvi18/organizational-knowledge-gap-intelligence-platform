package com.organizational.knowledge_gap_platform.controller;

import com.organizational.knowledge_gap_platform.dto.AuthResponse;
import com.organizational.knowledge_gap_platform.dto.LoginRequest;
import com.organizational.knowledge_gap_platform.dto.RegisterRequest;
import com.organizational.knowledge_gap_platform.entity.Role;
import com.organizational.knowledge_gap_platform.service.AuthService;
import com.organizational.knowledge_gap_platform.service.RoleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;


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
}