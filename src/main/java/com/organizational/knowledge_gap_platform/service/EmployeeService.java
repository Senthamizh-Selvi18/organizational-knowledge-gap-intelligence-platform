package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.EmployeeSummaryDTO;
import com.organizational.knowledge_gap_platform.entity.Employee;

import java.util.List;

public interface EmployeeService {

    List<Employee> getAllEmployees();

    EmployeeSummaryDTO getEmployeeByUserId(Long userId);

}