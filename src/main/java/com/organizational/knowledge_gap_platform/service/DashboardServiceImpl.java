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
import com.organizational.knowledge_gap_platform.dto.CompetencyAnalyticsResponse;
import com.organizational.knowledge_gap_platform.dto.RecentActivityResponse;

import com.organizational.knowledge_gap_platform.entity.Competency;
import com.organizational.knowledge_gap_platform.entity.ActivityLog;

import com.organizational.knowledge_gap_platform.repository.CompetencyRepository;
import com.organizational.knowledge_gap_platform.repository.ActivityLogRepository;
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
    private final CompetencyRepository competencyRepository;
    private final ActivityLogRepository activityLogRepository;
    public DashboardServiceImpl(
            SkillRepository skillRepository,
            EmployeeRepository employeeRepository,
            EmployeeSkillRepository employeeSkillRepository,
            CompetencyRepository competencyRepository,
            ActivityLogRepository activityLogRepository) {

        this.skillRepository = skillRepository;
        this.employeeRepository = employeeRepository;
        this.employeeSkillRepository = employeeSkillRepository;
        this.competencyRepository = competencyRepository;
        this.activityLogRepository = activityLogRepository;
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

            Map<Long, Integer> proficiencyBySkillId = new java.util.HashMap<>();

            for (EmployeeSkill employeeSkill : ownedSkills) {
                proficiencyBySkillId.put(
                        employeeSkill.getSkill().getId(),
                        employeeSkill.getProficiencyLevel()
                );
            }

            List<Integer> values = allSkills.stream()
                    .map(skill -> proficiencyBySkillId.get(skill.getId()))
                    .collect(Collectors.toList());

            String displayName = employee.getUser() != null
                    ? employee.getUser().getName()
                    : "Employee #" + employee.getId();

            rows.add(new HeatmapResponse.HeatmapRow(displayName, values));
        }

        return new HeatmapResponse(skillNames, rows);
    }
    @Override
    public CompetencyAnalyticsResponse getEmployeeCompetencies(Long employeeId) {

        List<Competency> competencies =
                competencyRepository.findByEmployeeId(employeeId);

        List<CompetencyAnalyticsResponse.CompetencyItem> items =
                competencies.stream()
                        .map(competency ->
                                new CompetencyAnalyticsResponse.CompetencyItem(
                                        competency.getId(),
                                        competency.getSkill().getId(),
                                        competency.getSkill().getSkillName(),
                                        competency.getLevel()
                                )
                        )
                        .collect(Collectors.toList());

        return new CompetencyAnalyticsResponse(
                items.size(),
                items
        );
    }

    @Override
    public List<RecentActivityResponse> getEmployeeRecentActivity(
            Long employeeId) {

        List<ActivityLog> activities =
                activityLogRepository
                        .findTop10ByEmployeeIdOrderByCreatedAtDesc(employeeId);

        return activities.stream()
                .map(activity ->
                        new RecentActivityResponse(
                                activity.getId(),
                                activity.getDescription(),
                                activity.getCreatedAt()
                        )
                )
                .collect(Collectors.toList());
    }
}