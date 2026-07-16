package com.organizational.knowledge_gap_platform.controller;

import com.organizational.knowledge_gap_platform.dto.InternalTrainingDto;
import com.organizational.knowledge_gap_platform.service.InternalTrainingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/internal-trainings")
public class InternalTrainingController {

    private final InternalTrainingService internalTrainingService;

    public InternalTrainingController(InternalTrainingService internalTrainingService) {
        this.internalTrainingService = internalTrainingService;
    }

    @GetMapping
    public ResponseEntity<List<InternalTrainingDto>> getAllTrainings() {
        return ResponseEntity.ok(internalTrainingService.getAllTrainings());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InternalTrainingDto> getTrainingById(@PathVariable Long id) {
        return ResponseEntity.ok(internalTrainingService.getTrainingById(id));
    }

    @GetMapping("/skill/{skillName}")
    public ResponseEntity<List<InternalTrainingDto>> getTrainingsBySkill(@PathVariable String skillName) {
        return ResponseEntity.ok(internalTrainingService.getTrainingsBySkill(skillName));
    }

    @PostMapping
    public ResponseEntity<InternalTrainingDto> createTraining(@Valid @RequestBody InternalTrainingDto dto) {
        return ResponseEntity.ok(internalTrainingService.createTraining(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<InternalTrainingDto> updateTraining(@PathVariable Long id, @Valid @RequestBody InternalTrainingDto dto) {
        return ResponseEntity.ok(internalTrainingService.updateTraining(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTraining(@PathVariable Long id) {
        internalTrainingService.deleteTraining(id);
        return ResponseEntity.noContent().build();
    }
}
