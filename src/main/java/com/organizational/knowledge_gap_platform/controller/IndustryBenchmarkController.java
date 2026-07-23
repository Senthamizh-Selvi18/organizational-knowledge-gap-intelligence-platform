package com.organizational.knowledge_gap_platform.controller;

import com.organizational.knowledge_gap_platform.dto.IndustryBenchmarkDTO;
import com.organizational.knowledge_gap_platform.dto.IndustryBenchmarkRequest;
import com.organizational.knowledge_gap_platform.service.IndustryBenchmarkService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/competency/industry-benchmarks")
@PreAuthorize("hasRole('ADMIN')")
public class IndustryBenchmarkController {

    private final IndustryBenchmarkService industryBenchmarkService;

    public IndustryBenchmarkController(IndustryBenchmarkService industryBenchmarkService) {
        this.industryBenchmarkService = industryBenchmarkService;
    }

    @PostMapping
    public ResponseEntity<IndustryBenchmarkDTO> create(@Valid @RequestBody IndustryBenchmarkRequest request) {
        return new ResponseEntity<>(industryBenchmarkService.create(request), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<IndustryBenchmarkDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(industryBenchmarkService.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<IndustryBenchmarkDTO>> getAll(
            @RequestParam(required = false) Long skillTaxonomyId) {
        if (skillTaxonomyId != null) {
            return ResponseEntity.ok(industryBenchmarkService.getBySkillTaxonomy(skillTaxonomyId));
        }
        return ResponseEntity.ok(industryBenchmarkService.getAll());
    }

    @PutMapping("/{id}")
    public ResponseEntity<IndustryBenchmarkDTO> update(@PathVariable Long id,
                                                         @Valid @RequestBody IndustryBenchmarkRequest request) {
        return ResponseEntity.ok(industryBenchmarkService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        industryBenchmarkService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
