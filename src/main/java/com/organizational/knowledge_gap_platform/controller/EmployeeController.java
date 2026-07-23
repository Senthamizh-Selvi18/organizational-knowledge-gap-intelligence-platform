package com.organizational.knowledge_gap_platform.controller;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.organizational.knowledge_gap_platform.dto.EmployeeResponseDTO;
import com.organizational.knowledge_gap_platform.dto.EmployeeSummaryDTO;
import com.organizational.knowledge_gap_platform.dto.EmployeeUpdateDTO;
import com.organizational.knowledge_gap_platform.service.EmployeeService;
@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    // Get All Employees
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

    // Get Employee Summary By User id
    @GetMapping("/by-user/{userId}")
    public ResponseEntity<EmployeeSummaryDTO> getEmployeeByUserId(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                employeeService.getEmployeeByUserId(userId)
        );
    }

}