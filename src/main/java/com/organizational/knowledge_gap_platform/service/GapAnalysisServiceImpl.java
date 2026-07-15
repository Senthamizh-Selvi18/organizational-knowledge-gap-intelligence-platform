package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.DepartmentGapHeatmapDTO;
import com.organizational.knowledge_gap_platform.dto.GapAnalysisResponseDTO;
import com.organizational.knowledge_gap_platform.dto.GapHeatmapResponseDTO;
import com.organizational.knowledge_gap_platform.dto.SkillDTO;
import com.organizational.knowledge_gap_platform.entity.Employee;
import com.organizational.knowledge_gap_platform.entity.EmployeeSkill;
import com.organizational.knowledge_gap_platform.entity.Role;
import com.organizational.knowledge_gap_platform.entity.RoleSkillRequirement;
import com.organizational.knowledge_gap_platform.entity.Skill;
import com.organizational.knowledge_gap_platform.exception.EmployeeNotFoundException;
import com.organizational.knowledge_gap_platform.exception.RoleNotFoundException;
import com.organizational.knowledge_gap_platform.repository.EmployeeRepository;
import com.organizational.knowledge_gap_platform.repository.EmployeeSkillRepository;
import com.organizational.knowledge_gap_platform.repository.RoleRepository;
import com.organizational.knowledge_gap_platform.repository.RoleSkillRequirementRepository;
import org.springframework.stereotype.Service;
import com.organizational.knowledge_gap_platform.entity.User;
import com.organizational.knowledge_gap_platform.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

@Service
public class GapAnalysisServiceImpl implements GapAnalysisService {
private static final int DEFAULT_REQUIRED_PROFICIENCY_LEVEL = 3;

private final UserRepository userRepository;
private final EmployeeRepository employeeRepository;
private final RoleRepository roleRepository;
private final EmployeeSkillRepository employeeSkillRepository;
private final NotificationService notificationService;
private final RoleSkillRequirementRepository roleSkillRequirementRepository;

public GapAnalysisServiceImpl(
        EmployeeRepository employeeRepository,
        RoleRepository roleRepository,
        EmployeeSkillRepository employeeSkillRepository,
        NotificationService notificationService,
        UserRepository userRepository,
        RoleSkillRequirementRepository roleSkillRequirementRepository) {

    this.employeeRepository = employeeRepository;
    this.roleRepository = roleRepository;
    this.employeeSkillRepository = employeeSkillRepository;
    this.notificationService = notificationService;
    this.userRepository = userRepository;
    this.roleSkillRequirementRepository = roleSkillRequirementRepository;
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

        Map<Long, Integer> currentLevelBySkillId = employeeSkills.stream()
                .collect(Collectors.toMap(
                        es -> es.getSkill().getId(),
                        es -> es.getProficiencyLevel() != null ? es.getProficiencyLevel() : 0,
                        (existing, replacement) -> existing
                ));

        List<RoleSkillRequirement> requirements = roleSkillRequirementRepository.findByRole(role);
        Map<Long, Integer> requiredLevelBySkillId = new HashMap<>();
        for (RoleSkillRequirement requirement : requirements) {
            requiredLevelBySkillId.put(requirement.getSkill().getId(), requirement.getRequiredProficiencyLevel());
        }

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
                .map(skill -> SkillDTO.fromEntityWithRisk(
                        skill,
                        requiredLevelBySkillId.getOrDefault(skill.getId(), DEFAULT_REQUIRED_PROFICIENCY_LEVEL),
                        currentLevelBySkillId.getOrDefault(skill.getId(), 0)
                ))
                .sorted(Comparator.comparing(SkillDTO::getSkillName))
                .collect(Collectors.toList());

        List<SkillDTO> missingDtos = missing.stream()
                .map(skill -> SkillDTO.fromEntityWithRisk(
                        skill,
                        requiredLevelBySkillId.getOrDefault(skill.getId(), DEFAULT_REQUIRED_PROFICIENCY_LEVEL),
                        0
                ))
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
    @Override
    public GapAnalysisResponseDTO analyzeMyGap() {

        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Employee employee = employeeRepository.findByUser(user)
                .orElseThrow(() ->
                        new EmployeeNotFoundException(
                                "Employee not found"));

        Set<Role> assignedRoles = employee.getUser().getRoles();

        if (assignedRoles == null || assignedRoles.isEmpty()) {
            throw new RuntimeException("No role assigned to employee.");
        }

        Role role = assignedRoles.iterator().next();

        GapAnalysisResponseDTO result = buildGapAnalysis(employee, role);

        notificationService.notifyGapAnalysisCompleted(
                employee,
                role.getRoleName()
        );

        return result;
    }
    @Override
    public List<GapHeatmapResponseDTO> getGapHeatmap() {

        List<Employee> employees = employeeRepository.findAll();

        return employees.stream()
                .map(employee -> {

                    Set<Role> assignedRoles = employee.getUser().getRoles();

                    if (assignedRoles == null || assignedRoles.isEmpty()) {
                        return null;
                    }

                    // Use the first assigned role
                    Role role = assignedRoles.iterator().next();

                    GapAnalysisResponseDTO gap =
                            buildGapAnalysis(employee, role);

                    return new GapHeatmapResponseDTO(
                            employee.getId(),
                            employee.getUser().getName(),
                            role.getRoleName(),
                            gap.getGapPercentage()
                    );

                })
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toList());
    }
    @Override
    public List<DepartmentGapHeatmapDTO> getDepartmentHeatmap() {

        List<Employee> employees = employeeRepository.findAll();

        Map<String, List<Double>> departmentGapMap = new HashMap<>();

        for (Employee employee : employees) {

            Set<Role> roles = employee.getUser().getRoles();

            if (roles == null || roles.isEmpty()) {
                continue;
            }

            Role role = roles.iterator().next();

            GapAnalysisResponseDTO gap =
                    buildGapAnalysis(employee, role);

            String department = employee.getDepartment();

            departmentGapMap
                    .computeIfAbsent(department, k -> new ArrayList<>())
                    .add(gap.getGapPercentage());
        }

        List<DepartmentGapHeatmapDTO> result = new ArrayList<>();

        for (Map.Entry<String, List<Double>> entry : departmentGapMap.entrySet()) {

            double average =
                    entry.getValue()
                            .stream()
                            .mapToDouble(Double::doubleValue)
                            .average()
                            .orElse(0);

            result.add(
                    new DepartmentGapHeatmapDTO(
                            entry.getKey(),
                            (long) entry.getValue().size(),
                            Math.round(average * 100.0) / 100.0
                    )
            );
        }

        return result;
    }
}
