package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.EmployeeResponseDTO;
import com.organizational.knowledge_gap_platform.dto.EmployeeUpdateDTO;
import com.organizational.knowledge_gap_platform.entity.Employee;
import com.organizational.knowledge_gap_platform.entity.Role;
import com.organizational.knowledge_gap_platform.exception.EmployeeNotFoundException;
import com.organizational.knowledge_gap_platform.repository.EmployeeRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;

    public EmployeeServiceImpl(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    @Override
    public List<EmployeeResponseDTO> getAllEmployees() {
        return employeeRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public EmployeeResponseDTO getEmployeeById(Long id) {

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() ->
                        new EmployeeNotFoundException(
                                "Employee not found with id : " + id));

        return mapToDTO(employee);
    }

    @Override
    public EmployeeResponseDTO updateEmployee(Long id,
                                              EmployeeUpdateDTO request) {

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() ->
                        new EmployeeNotFoundException(
                                "Employee not found with id : " + id));

        employee.setDepartment(request.getDepartment());
        employee.setDesignation(request.getDesignation());
        employee.setPhoneNumber(request.getPhoneNumber());
        employee.setLocation(request.getLocation());
        employee.setJoiningDate(request.getJoiningDate());
        employee.setExperience(request.getExperience());
        employee.setManager(request.getManager());

        Employee updatedEmployee = employeeRepository.save(employee);

        return mapToDTO(updatedEmployee);
    }

    @Override
    public void deleteEmployee(Long id) {

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() ->
                        new EmployeeNotFoundException(
                                "Employee not found with id : " + id));

        employeeRepository.delete(employee);
    }

    private EmployeeResponseDTO mapToDTO(Employee employee) {

        String role = employee.getUser()
                .getRoles()
                .stream()
                .findFirst()
                .map(Role::getRoleName)
                .orElse("");

        return new EmployeeResponseDTO(
                employee.getId(),
                employee.getEmployeeCode(),
                employee.getUser().getName(),
                employee.getUser().getEmail(),
                employee.getDepartment(),
                employee.getDesignation(),
                employee.getPhoneNumber(),
                employee.getLocation(),
                employee.getJoiningDate(),
                employee.getExperience(),
                employee.getManager(),
                role
        );
    }
}