package com.organizational.knowledge_gap_platform.controller;

import com.organizational.knowledge_gap_platform.dto.AssignSkillsRequestDTO;
import com.organizational.knowledge_gap_platform.dto.EmployeeSkillResponseDTO;
import com.organizational.knowledge_gap_platform.service.EmployeeSkillService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
public class EmployeeSkillController {

    private final EmployeeSkillService employeeSkillService;

    public EmployeeSkillController(EmployeeSkillService employeeSkillService) {
        this.employeeSkillService = employeeSkillService;
    }

    @PostMapping("/{employeeId}/skills")
    public ResponseEntity<String> assignSkills(
            @PathVariable Long employeeId,
            @Valid @RequestBody AssignSkillsRequestDTO request) {

        employeeSkillService.assignSkills(employeeId, request);

        return ResponseEntity.ok("Skills assigned successfully.");
    }

    @PutMapping("/{employeeId}/skills")
    public ResponseEntity<String> updateSkills(
            @PathVariable Long employeeId,
            @Valid @RequestBody AssignSkillsRequestDTO request) {

        employeeSkillService.updateSkills(employeeId, request);

        return ResponseEntity.ok("Skills updated successfully.");
    }

    @GetMapping("/{employeeId}/skills")
    public ResponseEntity<List<EmployeeSkillResponseDTO>> getEmployeeSkills(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                employeeSkillService.getEmployeeSkills(employeeId)
        );
    }
}