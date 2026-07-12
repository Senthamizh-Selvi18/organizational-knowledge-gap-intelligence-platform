package com.organizational.knowledge_gap_platform.controller;

import com.organizational.knowledge_gap_platform.dto.EmployeeResponseDTO;
import com.organizational.knowledge_gap_platform.dto.EmployeeUpdateDTO;
import com.organizational.knowledge_gap_platform.service.EmployeeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    // Get All Employees
    //@PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<EmployeeResponseDTO>> getAllEmployees() {
        return ResponseEntity.ok(employeeService.getAllEmployees());
    }

    // Get Employee By id
    @GetMapping("/{id}")
    public ResponseEntity<EmployeeResponseDTO> getEmployeeById(
            @PathVariable Long id) {

        return ResponseEntity.ok(employeeService.getEmployeeById(id));
    }

    // Update Employee
    @PutMapping("/{id}")
    public ResponseEntity<EmployeeResponseDTO> updateEmployee(
            @PathVariable Long id,
            @RequestBody EmployeeUpdateDTO request) {

        return ResponseEntity.ok(
                employeeService.updateEmployee(id, request)
        );
    }

    // Delete Employee
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteEmployee(
            @PathVariable Long id) {

        employeeService.deleteEmployee(id);

        return ResponseEntity.ok("Employee deleted successfully.");
    }
}