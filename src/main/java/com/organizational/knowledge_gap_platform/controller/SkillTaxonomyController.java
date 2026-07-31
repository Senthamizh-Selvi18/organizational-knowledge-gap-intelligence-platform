package com.organizational.knowledge_gap_platform.controller;

import com.organizational.knowledge_gap_platform.dto.SkillTaxonomyDTO;
import com.organizational.knowledge_gap_platform.dto.SkillTaxonomyRequest;
import com.organizational.knowledge_gap_platform.service.SkillTaxonomyService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/competency/skill-taxonomy")
public class SkillTaxonomyController {

    private final SkillTaxonomyService skillTaxonomyService;

    public SkillTaxonomyController(SkillTaxonomyService skillTaxonomyService) {
        this.skillTaxonomyService = skillTaxonomyService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<SkillTaxonomyDTO> create(@Valid @RequestBody SkillTaxonomyRequest request) {
        return new ResponseEntity<>(skillTaxonomyService.create(request), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SkillTaxonomyDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(skillTaxonomyService.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<SkillTaxonomyDTO>> getAllFlat() {
        return ResponseEntity.ok(skillTaxonomyService.getAllFlat());
    }

    @GetMapping("/tree")
    public ResponseEntity<List<SkillTaxonomyDTO>> getTree() {
        return ResponseEntity.ok(skillTaxonomyService.getTree());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<SkillTaxonomyDTO> update(@PathVariable Long id,
                                                     @Valid @RequestBody SkillTaxonomyRequest request) {
        return ResponseEntity.ok(skillTaxonomyService.update(id, request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        skillTaxonomyService.deactivate(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        skillTaxonomyService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
