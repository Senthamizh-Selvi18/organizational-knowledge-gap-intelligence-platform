package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.EmployeeSummaryDTO;
import com.organizational.knowledge_gap_platform.entity.Employee;
import com.organizational.knowledge_gap_platform.exception.EmployeeNotFoundException;
import com.organizational.knowledge_gap_platform.repository.EmployeeRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;

    public EmployeeServiceImpl(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    @Override
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    @Override
    public EmployeeSummaryDTO getEmployeeByUserId(Long userId) {
        Employee employee = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new EmployeeNotFoundException(
                        "Employee not found for user id: " + userId));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String loggedInUserEmail = authentication.getName();

        if (!employee.getUser().getEmail().equals(loggedInUserEmail)) {
            throw new AccessDeniedException("You are not authorized to access this employee record.");
        }

        return new EmployeeSummaryDTO(
                employee.getId(),
                employee.getUser().getId(),
                employee.getEmployeeCode(),
                employee.getUser().getName(),
                employee.getDepartment(),
                employee.getDesignation()
        );
    }
}
