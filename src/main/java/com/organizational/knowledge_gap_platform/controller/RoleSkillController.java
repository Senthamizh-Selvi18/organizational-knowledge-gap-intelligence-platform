package com.organizational.knowledge_gap_platform.controller;

import com.organizational.knowledge_gap_platform.dto.RoleSkillRequest;
import com.organizational.knowledge_gap_platform.dto.RoleSkillResponse;
import com.organizational.knowledge_gap_platform.dto.SkillDTO;
import com.organizational.knowledge_gap_platform.repository.SkillRepository;
import com.organizational.knowledge_gap_platform.service.RoleSkillService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
public class RoleSkillController {

    private final RoleSkillService roleSkillService;
    private final SkillRepository skillRepository;

    public RoleSkillController(RoleSkillService roleSkillService, SkillRepository skillRepository) {
        this.roleSkillService = roleSkillService;
        this.skillRepository = skillRepository;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/skills/all")
    public ResponseEntity<List<SkillDTO>> getAllSkillsForDropdown() {
        List<SkillDTO> skills = skillRepository.findAll().stream()
                .map(SkillDTO::fromEntity)
                .toList();
        return ResponseEntity.ok(skills);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{roleId}/skills")
    public ResponseEntity<RoleSkillResponse> assignSkillsToRole(
            @PathVariable Long roleId,
            @Valid @RequestBody RoleSkillRequest request) {

        RoleSkillResponse response = roleSkillService.assignSkillsToRole(roleId, request.getSkillIds());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{roleId}/skills")
    public ResponseEntity<RoleSkillResponse> updateRoleSkills(
            @PathVariable Long roleId,
            @Valid @RequestBody RoleSkillRequest request) {

        RoleSkillResponse response = roleSkillService.assignSkillsToRole(roleId, request.getSkillIds());
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{roleId}/skills")
    public ResponseEntity<RoleSkillResponse> getRoleSkills(@PathVariable Long roleId) {
        RoleSkillResponse response = roleSkillService.getRoleSkills(roleId);
        return ResponseEntity.ok(response);
    }
}
