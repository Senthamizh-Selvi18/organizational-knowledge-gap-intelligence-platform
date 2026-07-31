package com.organizational.knowledge_gap_platform.controller;

import com.organizational.knowledge_gap_platform.dto.*;
import com.organizational.knowledge_gap_platform.service.CompetencyFrameworkService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/competency/frameworks")
public class CompetencyFrameworkController {

    private final CompetencyFrameworkService competencyFrameworkService;

    public CompetencyFrameworkController(CompetencyFrameworkService competencyFrameworkService) {
        this.competencyFrameworkService = competencyFrameworkService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<CompetencyFrameworkResponse> create(@Valid @RequestBody CompetencyFrameworkRequest request,
                                                                Authentication authentication) {
        String createdBy = authentication != null ? authentication.getName() : "system";
        return new ResponseEntity<>(
                competencyFrameworkService.createFramework(request, createdBy), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompetencyFrameworkResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(competencyFrameworkService.getFrameworkById(id));
    }

    @GetMapping
    public ResponseEntity<List<CompetencyFrameworkResponse>> getAll(
            @RequestParam(required = false) Long roleId,
            @RequestParam(required = false) String department) {

        if (roleId != null || (department != null && !department.isBlank())) {
            return ResponseEntity.ok(
                    competencyFrameworkService.getFrameworksByRoleAndDepartment(roleId, department));
        }
        return ResponseEntity.ok(competencyFrameworkService.getAllCurrentFrameworks());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<CompetencyFrameworkResponse> update(@PathVariable Long id,
                                                                @Valid @RequestBody CompetencyFrameworkRequest request) {
        return ResponseEntity.ok(competencyFrameworkService.updateFramework(id, request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/publish")
    public ResponseEntity<CompetencyFrameworkResponse> publish(@PathVariable Long id) {
        return ResponseEntity.ok(competencyFrameworkService.publishFramework(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/archive")
    public ResponseEntity<CompetencyFrameworkResponse> archive(@PathVariable Long id) {
        return ResponseEntity.ok(competencyFrameworkService.archiveFramework(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        competencyFrameworkService.deleteFramework(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/skills")
    public ResponseEntity<CompetencyFrameworkResponse> setSkills(@PathVariable Long id,
                                                                   @Valid @RequestBody SetFrameworkSkillsRequest request) {
        return ResponseEntity.ok(competencyFrameworkService.setFrameworkSkills(id, request.getSkills()));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/skills")
    public ResponseEntity<CompetencyFrameworkResponse> addSkill(@PathVariable Long id,
                                                                  @Valid @RequestBody CompetencyFrameworkSkillRequest request) {
        return ResponseEntity.ok(competencyFrameworkService.addFrameworkSkill(id, request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}/skills/{frameworkSkillId}")
    public ResponseEntity<CompetencyFrameworkResponse> removeSkill(@PathVariable Long id,
                                                                     @PathVariable Long frameworkSkillId) {
        return ResponseEntity.ok(competencyFrameworkService.removeFrameworkSkill(id, frameworkSkillId));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/goals")
    public ResponseEntity<CompetencyFrameworkResponse> mapToGoal(@PathVariable Long id,
                                                                   @Valid @RequestBody CompetencyGoalMappingRequest request) {
        return ResponseEntity.ok(competencyFrameworkService.mapToStrategicGoal(id, request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}/goals/{strategicGoalId}")
    public ResponseEntity<CompetencyFrameworkResponse> removeGoalMapping(@PathVariable Long id,
                                                                           @PathVariable Long strategicGoalId) {
        return ResponseEntity.ok(competencyFrameworkService.removeGoalMapping(id, strategicGoalId));
    }

    @GetMapping("/{id}/benchmark-comparison")
    public ResponseEntity<CompetencyFrameworkResponse> compareToBenchmark(@PathVariable Long id) {
        return ResponseEntity.ok(competencyFrameworkService.compareToIndustryBenchmark(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/new-version")
    public ResponseEntity<CompetencyFrameworkResponse> createNewVersion(@PathVariable Long id,
                                                                          Authentication authentication) {
        String createdBy = authentication != null ? authentication.getName() : "system";
        return new ResponseEntity<>(
                competencyFrameworkService.createNewVersion(id, createdBy), HttpStatus.CREATED);
    }

    @GetMapping("/version-history/{versionGroupId}")
    public ResponseEntity<List<FrameworkVersionSummaryDTO>> getVersionHistory(@PathVariable String versionGroupId) {
        return ResponseEntity.ok(competencyFrameworkService.getVersionHistory(versionGroupId));
    }
}
