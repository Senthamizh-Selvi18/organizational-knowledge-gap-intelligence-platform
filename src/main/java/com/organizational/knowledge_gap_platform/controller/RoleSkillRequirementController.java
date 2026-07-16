package com.organizational.knowledge_gap_platform.controller;

import com.organizational.knowledge_gap_platform.dto.RoleSkillRequirementRequestDTO;
import com.organizational.knowledge_gap_platform.dto.RoleSkillRequirementResponseDTO;
import com.organizational.knowledge_gap_platform.service.RoleSkillRequirementService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/role-skill-requirements")
public class RoleSkillRequirementController {

    private final RoleSkillRequirementService roleSkillRequirementService;

    public RoleSkillRequirementController(RoleSkillRequirementService roleSkillRequirementService) {
        this.roleSkillRequirementService = roleSkillRequirementService;
    }

    // Readable by ADMIN and HR (see SecurityConfig) — needed so the Gap
    // Analysis / Role management screens can display current required levels.
    @GetMapping("/role/{roleId}")
    public ResponseEntity<List<RoleSkillRequirementResponseDTO>> getByRole(@PathVariable Long roleId) {
        return ResponseEntity.ok(roleSkillRequirementService.getByRole(roleId));
    }

    // Admin-only (see SecurityConfig): creates a new requirement, or updates
    // the existing one for that role+skill pair if it already exists.
    @PostMapping
    public ResponseEntity<RoleSkillRequirementResponseDTO> upsert(
            @Valid @RequestBody RoleSkillRequirementRequestDTO request
    ) {
        return ResponseEntity.ok(roleSkillRequirementService.upsert(request));
    }

    // Admin-only (see SecurityConfig).
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        roleSkillRequirementService.delete(id);
        return ResponseEntity.noContent().build();
    }
}