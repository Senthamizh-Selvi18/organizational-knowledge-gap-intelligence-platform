package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.GapAnalysisResponseDTO;
import com.organizational.knowledge_gap_platform.dto.SkillDTO;
import com.organizational.knowledge_gap_platform.entity.Employee;
import com.organizational.knowledge_gap_platform.entity.EmployeeSkill;
import com.organizational.knowledge_gap_platform.entity.Role;
import com.organizational.knowledge_gap_platform.entity.Skill;
import com.organizational.knowledge_gap_platform.exception.EmployeeNotFoundException;
import com.organizational.knowledge_gap_platform.exception.RoleNotFoundException;
import com.organizational.knowledge_gap_platform.repository.EmployeeRepository;
import com.organizational.knowledge_gap_platform.repository.EmployeeSkillRepository;
import com.organizational.knowledge_gap_platform.repository.RoleRepository;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class GapAnalysisServiceImpl implements GapAnalysisService {

    private final EmployeeRepository employeeRepository;
    private final RoleRepository roleRepository;
    private final EmployeeSkillRepository employeeSkillRepository;
    private final NotificationService notificationService;

    public GapAnalysisServiceImpl(EmployeeRepository employeeRepository,
                                   RoleRepository roleRepository,
                                   EmployeeSkillRepository employeeSkillRepository,
                                   NotificationService notificationService) {
        this.employeeRepository = employeeRepository;
        this.roleRepository = roleRepository;
        this.employeeSkillRepository = employeeSkillRepository;
        this.notificationService = notificationService;
    }

    @Override
    public GapAnalysisResponseDTO analyzeGap(Long employeeId, Long roleId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EmployeeNotFoundException("Employee not found with id: " + employeeId));

        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RoleNotFoundException("Role not found with id: " + roleId));

        GapAnalysisResponseDTO result = buildGapAnalysis(employee, role);
        notificationService.notifyGapAnalysisCompleted(employee, role.getRoleName());
        return result;
    }

    @Override
    public List<GapAnalysisResponseDTO> analyzeGapForEmployee(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EmployeeNotFoundException("Employee not found with id: " + employeeId));

        Set<Role> assignedRoles = employee.getUser().getRoles();

        if (assignedRoles == null || assignedRoles.isEmpty()) {
            return Collections.emptyList();
        }

        List<GapAnalysisResponseDTO> results = assignedRoles.stream()
                .map(role -> buildGapAnalysis(employee, role))
                .collect(Collectors.toList());

        String roleNames = assignedRoles.stream()
                .map(Role::getRoleName)
                .collect(Collectors.joining(", "));
        notificationService.notifyGapAnalysisCompleted(employee, roleNames);

        return results;
    }

    private GapAnalysisResponseDTO buildGapAnalysis(Employee employee, Role role) {

        Set<Skill> requiredSkills = role.getSkills();

        List<EmployeeSkill> employeeSkills = employeeSkillRepository.findByEmployee(employee);
        Set<Skill> possessedSkills = employeeSkills.stream()
                .map(EmployeeSkill::getSkill)
                .collect(Collectors.toSet());

        Set<Skill> matched = new HashSet<>(requiredSkills);
        matched.retainAll(possessedSkills);

        Set<Skill> missing = new HashSet<>(requiredSkills);
        missing.removeAll(possessedSkills);

        int totalRequired = requiredSkills.size();
        int matchedCount = matched.size();
        int missingCount = missing.size();

        double gapPercentage = totalRequired == 0
                ? 0.0
                : Math.round((missingCount * 10000.0) / totalRequired) / 100.0;

        List<SkillDTO> matchedDtos = matched.stream()
                .map(SkillDTO::fromEntity)
                .sorted(Comparator.comparing(SkillDTO::getSkillName))
                .collect(Collectors.toList());

        List<SkillDTO> missingDtos = missing.stream()
                .map(SkillDTO::fromEntity)
                .sorted(Comparator.comparing(SkillDTO::getSkillName))
                .collect(Collectors.toList());

        return new GapAnalysisResponseDTO(
                employee.getId(),
                employee.getUser().getName(),
                role.getId(),
                role.getRoleName(),
                totalRequired,
                matchedCount,
                missingCount,
                gapPercentage,
                matchedDtos,
                missingDtos
        );
    }
}
