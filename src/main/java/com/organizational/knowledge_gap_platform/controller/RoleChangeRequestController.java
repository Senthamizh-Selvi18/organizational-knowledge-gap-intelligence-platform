package com.organizational.knowledge_gap_platform.controller;

import com.organizational.knowledge_gap_platform.dto.CreateRoleChangeRequestDTO;
import com.organizational.knowledge_gap_platform.dto.RoleChangeRequestResponse;
import com.organizational.knowledge_gap_platform.service.RoleChangeRequestService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/role-requests")
public class RoleChangeRequestController {

    private final RoleChangeRequestService roleChangeRequestService;

    public RoleChangeRequestController(RoleChangeRequestService roleChangeRequestService) {
        this.roleChangeRequestService = roleChangeRequestService;
    }

    // Any authenticated user can raise a request for themselves (or HR/Manager on behalf of someone)
    @PostMapping
    public ResponseEntity<?> createRequest(@Valid @RequestBody CreateRoleChangeRequestDTO dto) {
        try {
            RoleChangeRequestResponse response = roleChangeRequestService.createRequest(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (NoSuchElementException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<RoleChangeRequestResponse>> getAllRequests() {
        return ResponseEntity.ok(roleChangeRequestService.getAllRequests());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/pending")
    public ResponseEntity<List<RoleChangeRequestResponse>> getPendingRequests() {
        return ResponseEntity.ok(roleChangeRequestService.getPendingRequests());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/pending/count")
    public ResponseEntity<Long> getPendingCount() {
        return ResponseEntity.ok(roleChangeRequestService.getPendingCount());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveRequest(@PathVariable Long id, Authentication authentication) {
        try {
            String reviewer = authentication != null ? authentication.getName() : "admin";
            return ResponseEntity.ok(roleChangeRequestService.approveRequest(id, reviewer));
        } catch (NoSuchElementException ex) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectRequest(@PathVariable Long id, Authentication authentication) {
        try {
            String reviewer = authentication != null ? authentication.getName() : "admin";
            return ResponseEntity.ok(roleChangeRequestService.rejectRequest(id, reviewer));
        } catch (NoSuchElementException ex) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }
}