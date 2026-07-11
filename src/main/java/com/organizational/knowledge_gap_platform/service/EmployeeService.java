package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.EmployeeResponseDTO;
import com.organizational.knowledge_gap_platform.dto.EmployeeUpdateDTO;

import java.util.List;

public interface EmployeeService {

    List<EmployeeResponseDTO> getAllEmployees();

    EmployeeResponseDTO getEmployeeById(Long id);

    EmployeeResponseDTO updateEmployee(Long id, EmployeeUpdateDTO request);

    void deleteEmployee(Long id);
}