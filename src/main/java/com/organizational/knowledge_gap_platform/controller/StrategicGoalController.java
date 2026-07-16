package com.organizational.knowledge_gap_platform.controller;

import com.organizational.knowledge_gap_platform.dto.StrategicGoalDTO;
import com.organizational.knowledge_gap_platform.dto.StrategicGoalRequest;
import com.organizational.knowledge_gap_platform.service.StrategicGoalService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/competency/strategic-goals")
@PreAuthorize("hasRole('ADMIN')")
public class StrategicGoalController {

    private final StrategicGoalService strategicGoalService;

    public StrategicGoalController(StrategicGoalService strategicGoalService) {
        this.strategicGoalService = strategicGoalService;
    }

    @PostMapping
    public ResponseEntity<StrategicGoalDTO> create(@Valid @RequestBody StrategicGoalRequest request) {
        return new ResponseEntity<>(strategicGoalService.create(request), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<StrategicGoalDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(strategicGoalService.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<StrategicGoalDTO>> getAll() {
        return ResponseEntity.ok(strategicGoalService.getAll());
    }

    @PutMapping("/{id}")
    public ResponseEntity<StrategicGoalDTO> update(@PathVariable Long id,
                                                     @Valid @RequestBody StrategicGoalRequest request) {
        return ResponseEntity.ok(strategicGoalService.update(id, request));
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        strategicGoalService.deactivate(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        strategicGoalService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
