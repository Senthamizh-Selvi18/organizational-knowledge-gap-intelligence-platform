package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.EmployeeResponseDTO;
import com.organizational.knowledge_gap_platform.dto.EmployeeSummaryDTO;
import com.organizational.knowledge_gap_platform.dto.EmployeeUpdateDTO;

import java.util.List;

public interface EmployeeService {

    // Get all employees
    List<EmployeeResponseDTO> getAllEmployees();

    // Get employee by employee ID
    EmployeeResponseDTO getEmployeeById(Long id);

    // Update employee
    EmployeeResponseDTO updateEmployee(Long id, EmployeeUpdateDTO request);

    // Delete employee
    void deleteEmployee(Long id);

    // Get employee summary by user ID
    EmployeeSummaryDTO getEmployeeByUserId(Long userId);
}