package com.organizational.knowledge_gap_platform.controller;

import com.organizational.knowledge_gap_platform.dto.ExternalCourseDto;
import com.organizational.knowledge_gap_platform.service.ExternalCourseService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/external-courses")
public class ExternalCourseController {

    private final ExternalCourseService externalCourseService;

    public ExternalCourseController(ExternalCourseService externalCourseService) {
        this.externalCourseService = externalCourseService;
    }

    @GetMapping
    public ResponseEntity<List<ExternalCourseDto>> getAllCourses() {
        return ResponseEntity.ok(externalCourseService.getAllCourses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExternalCourseDto> getCourseById(@PathVariable Long id) {
        return ResponseEntity.ok(externalCourseService.getCourseById(id));
    }

    @GetMapping("/skill/{skillName}")
    public ResponseEntity<List<ExternalCourseDto>> getCoursesBySkill(@PathVariable String skillName) {
        return ResponseEntity.ok(externalCourseService.getCoursesBySkill(skillName));
    }

    @PostMapping
    public ResponseEntity<ExternalCourseDto> createCourse(@Valid @RequestBody ExternalCourseDto dto) {
        return ResponseEntity.ok(externalCourseService.createCourse(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExternalCourseDto> updateCourse(@PathVariable Long id, @Valid @RequestBody ExternalCourseDto dto) {
        return ResponseEntity.ok(externalCourseService.updateCourse(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        externalCourseService.deleteCourse(id);
        return ResponseEntity.noContent().build();
    }
}