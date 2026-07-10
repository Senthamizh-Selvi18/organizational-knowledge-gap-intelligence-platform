package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.DashboardStatsResponse;
import com.organizational.knowledge_gap_platform.dto.HeatmapResponse;
import com.organizational.knowledge_gap_platform.entity.Employee;
import com.organizational.knowledge_gap_platform.entity.EmployeeSkill;
import com.organizational.knowledge_gap_platform.entity.Skill;
import com.organizational.knowledge_gap_platform.repository.EmployeeRepository;
import com.organizational.knowledge_gap_platform.repository.EmployeeSkillRepository;
import com.organizational.knowledge_gap_platform.repository.SkillRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.Map;

@Service
public class DashboardServiceImpl implements DashboardService {

    private final SkillRepository skillRepository;
    private final EmployeeRepository employeeRepository;
    private final EmployeeSkillRepository employeeSkillRepository;

    public DashboardServiceImpl(SkillRepository skillRepository,
                                 EmployeeRepository employeeRepository,
                                 EmployeeSkillRepository employeeSkillRepository) {
        this.skillRepository = skillRepository;
        this.employeeRepository = employeeRepository;
        this.employeeSkillRepository = employeeSkillRepository;
    }

    @Override
    public DashboardStatsResponse getStats() {

        long totalSkills = skillRepository.count();
        long employeeSkillsAssigned = employeeSkillRepository.count();

        return new DashboardStatsResponse(totalSkills, employeeSkillsAssigned);
    }

    @Override
    public HeatmapResponse getSkillGapHeatmap() {

        List<Skill> allSkills = skillRepository.findAll();
        List<Employee> allEmployees = employeeRepository.findAll();

        List<String> skillNames = allSkills.stream()
                .map(Skill::getSkillName)
                .collect(Collectors.toList());

        List<HeatmapResponse.HeatmapRow> rows = new ArrayList<>();

        for (Employee employee : allEmployees) {

            List<EmployeeSkill> ownedSkills =
                    employeeSkillRepository.findByEmployeeId(employee.getId());

            Map<Long, Integer> proficiencyBySkillId = ownedSkills.stream()
                    .collect(Collectors.toMap(
                            es -> es.getSkill().getId(),
                            es -> es.getProficiencyLevel() != null ? es.getProficiencyLevel() : 0
                    ));

            List<Integer> values = allSkills.stream()
                    .map(skill -> proficiencyBySkillId.getOrDefault(skill.getId(), 0))
                    .collect(Collectors.toList());

            String displayName = employee.getUser() != null
                    ? employee.getUser().getName()
                    : "Employee #" + employee.getId();

            rows.add(new HeatmapResponse.HeatmapRow(displayName, values));
        }

        return new HeatmapResponse(skillNames, rows);
    }
}