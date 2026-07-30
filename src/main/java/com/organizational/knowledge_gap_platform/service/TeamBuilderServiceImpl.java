package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.SkillDTO;
import com.organizational.knowledge_gap_platform.dto.TeamBuilderRecommendationDTO;
import com.organizational.knowledge_gap_platform.dto.TeamBuilderRequestDTO;
import com.organizational.knowledge_gap_platform.entity.Employee;
import com.organizational.knowledge_gap_platform.entity.EmployeeSkill;
import com.organizational.knowledge_gap_platform.entity.Skill;
import com.organizational.knowledge_gap_platform.exception.SkillNotFoundException;
import com.organizational.knowledge_gap_platform.repository.EmployeeRepository;
import com.organizational.knowledge_gap_platform.repository.EmployeeSkillRepository;
import com.organizational.knowledge_gap_platform.repository.SkillRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class TeamBuilderServiceImpl implements TeamBuilderService {

    private static final int DEFAULT_MIN_PROFICIENCY_LEVEL = 1;

    private final EmployeeRepository employeeRepository;
    private final EmployeeSkillRepository employeeSkillRepository;
    private final SkillRepository skillRepository;

    public TeamBuilderServiceImpl(
            EmployeeRepository employeeRepository,
            EmployeeSkillRepository employeeSkillRepository,
            SkillRepository skillRepository) {
        this.employeeRepository = employeeRepository;
        this.employeeSkillRepository = employeeSkillRepository;
        this.skillRepository = skillRepository;
    }

    @Override
    public List<TeamBuilderRecommendationDTO> recommendTeam(TeamBuilderRequestDTO request) {

        List<Skill> requiredSkills = skillRepository.findAllById(request.getRequiredSkillIds());

        if (requiredSkills.size() != request.getRequiredSkillIds().size()) {
            Set<Long> foundIds = requiredSkills.stream().map(Skill::getId).collect(Collectors.toSet());
            String missingIds = request.getRequiredSkillIds().stream()
                    .filter(id -> !foundIds.contains(id))
                    .map(String::valueOf)
                    .collect(Collectors.joining(", "));
            throw new SkillNotFoundException("Skill(s) not found for id(s): " + missingIds);
        }

        int minProficiencyLevel = request.getMinProficiencyLevel() != null
                ? request.getMinProficiencyLevel()
                : DEFAULT_MIN_PROFICIENCY_LEVEL;

        int totalRequired = requiredSkills.size();

        List<Employee> candidates = employeeRepository.findAll().stream()
                .filter(emp -> request.getDepartment() == null
                        || request.getDepartment().isBlank()
                        || request.getDepartment().equalsIgnoreCase(emp.getDepartment()))
                .collect(Collectors.toList());

        List<TeamBuilderRecommendationDTO> recommendations = candidates.stream()
                .map(employee -> buildRecommendation(employee, requiredSkills, minProficiencyLevel, totalRequired))
                .sorted(Comparator.comparingDouble(TeamBuilderRecommendationDTO::getMatchPercentage).reversed()
                        .thenComparing(TeamBuilderRecommendationDTO::getName))
                .collect(Collectors.toList());

        if (request.getTopN() != null && request.getTopN() > 0 && request.getTopN() < recommendations.size()) {
            recommendations = recommendations.subList(0, request.getTopN());
        }

        return recommendations;
    }

    private TeamBuilderRecommendationDTO buildRecommendation(
            Employee employee,
            List<Skill> requiredSkills,
            int minProficiencyLevel,
            int totalRequired) {

        List<EmployeeSkill> employeeSkills = employeeSkillRepository.findByEmployee(employee);

        Map<Long, Integer> currentLevelBySkillId = employeeSkills.stream()
                .collect(Collectors.toMap(
                        es -> es.getSkill().getId(),
                        es -> es.getProficiencyLevel() != null ? es.getProficiencyLevel() : 0,
                        (existing, replacement) -> existing
                ));

        List<SkillDTO> matchedSkills = requiredSkills.stream()
                .filter(skill -> currentLevelBySkillId.getOrDefault(skill.getId(), 0) >= minProficiencyLevel)
                .map(skill -> SkillDTO.fromEntityWithRisk(
                        skill,
                        minProficiencyLevel,
                        currentLevelBySkillId.getOrDefault(skill.getId(), 0)
                ))
                .sorted(Comparator.comparing(SkillDTO::getSkillName))
                .collect(Collectors.toList());

        List<SkillDTO> missingSkills = requiredSkills.stream()
                .filter(skill -> currentLevelBySkillId.getOrDefault(skill.getId(), 0) < minProficiencyLevel)
                .map(skill -> SkillDTO.fromEntityWithRisk(
                        skill,
                        minProficiencyLevel,
                        currentLevelBySkillId.getOrDefault(skill.getId(), 0)
                ))
                .sorted(Comparator.comparing(SkillDTO::getSkillName))
                .collect(Collectors.toList());

        int matchedCount = matchedSkills.size();
        int missingCount = missingSkills.size();

        double matchPercentage = totalRequired == 0
                ? 0.0
                : Math.round((matchedCount * 10000.0) / totalRequired) / 100.0;

        return new TeamBuilderRecommendationDTO(
                employee.getId(),
                employee.getEmployeeCode(),
                employee.getUser().getName(),
                employee.getUser().getEmail(),
                employee.getDepartment(),
                employee.getDesignation(),
                totalRequired,
                matchedCount,
                missingCount,
                matchPercentage,
                matchedSkills,
                missingSkills
        );
    }
}