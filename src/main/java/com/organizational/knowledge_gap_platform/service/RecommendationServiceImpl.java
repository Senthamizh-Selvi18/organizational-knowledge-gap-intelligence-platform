package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.ExternalCourseDto;
import com.organizational.knowledge_gap_platform.dto.MissingSkillCoursesDto;
import com.organizational.knowledge_gap_platform.dto.RecommendationResponse;
import com.organizational.knowledge_gap_platform.dto.RecommendedCourseDto;
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

@Service
public class RecommendationServiceImpl implements RecommendationService {

    private final EmployeeRepository employeeRepository;
    private final EmployeeSkillRepository employeeSkillRepository;
    private final SkillRepository skillRepository;
    private final ExternalCourseService externalCourseService;

    public RecommendationServiceImpl(EmployeeRepository employeeRepository,
                                      EmployeeSkillRepository employeeSkillRepository,
                                      SkillRepository skillRepository,
                                      ExternalCourseService externalCourseService) {
        this.employeeRepository = employeeRepository;
        this.employeeSkillRepository = employeeSkillRepository;
        this.skillRepository = skillRepository;
        this.externalCourseService = externalCourseService;
    }

    @Override
    public RecommendationResponse getRecommendationsForUser(Long userId) {

        Employee employee = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Employee not found for user id: " + userId));

        List<EmployeeSkill> ownedSkills =
                employeeSkillRepository.findByEmployeeId(employee.getId());

        Set<Long> ownedSkillIds = ownedSkills.stream()
                .map(es -> es.getSkill().getId())
                .collect(Collectors.toSet());

        List<Skill> allSkills = skillRepository.findAll();

        List<Skill> missingSkills = allSkills.stream()
                .filter(skill -> !ownedSkillIds.contains(skill.getId()))
                .collect(Collectors.toList());

        List<String> recommendations = missingSkills.stream()
                .map(skill -> "Learn " + skill.getSkillName())
                .collect(Collectors.toList());

        List<String> roadmap = buildRoadmap(missingSkills);

        List<MissingSkillCoursesDto> externalCourses = buildExternalCourses(missingSkills);

        return new RecommendationResponse(recommendations, roadmap, externalCourses);
    }

    private List<String> buildRoadmap(List<Skill> missingSkills) {

        List<String> roadmap = new ArrayList<>();

        int skillsPerMonth = 2;
        int month = 1;

        for (int i = 0; i < missingSkills.size(); i += skillsPerMonth) {

            int end = Math.min(i + skillsPerMonth, missingSkills.size());

            List<String> monthSkills = missingSkills.subList(i, end)
                    .stream()
                    .map(Skill::getSkillName)
                    .collect(Collectors.toList());

            roadmap.add("Month " + month + ": " + String.join(", ", monthSkills));

            month++;
        }

        return roadmap;
    }

    private List<MissingSkillCoursesDto> buildExternalCourses(List<Skill> missingSkills) {

        List<MissingSkillCoursesDto> result = new ArrayList<>();

        for (Skill skill : missingSkills) {

            List<ExternalCourseDto> courses = externalCourseService.getCoursesBySkill(skill.getSkillName());

            List<RecommendedCourseDto> recommendedCourses = courses.stream()
                    .map(c -> new RecommendedCourseDto(
                            c.getCourseTitle(),
                            c.getProvider(),
                            c.getCourseUrl(),
                            c.getDifficulty(),
                            c.getDuration(),
                            c.getDescription()
                    ))
                    .collect(Collectors.toList());

            result.add(new MissingSkillCoursesDto(skill.getSkillName(), recommendedCourses));
        }

        return result;
    }
}