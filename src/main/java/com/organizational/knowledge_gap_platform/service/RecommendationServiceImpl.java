package com.organizational.knowledge_gap_platform.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.organizational.knowledge_gap_platform.ai.AiRecommendationException;
import com.organizational.knowledge_gap_platform.ai.AiRecommendationRouter;
import com.organizational.knowledge_gap_platform.dto.ExternalCourseDto;
import com.organizational.knowledge_gap_platform.dto.MissingSkillCoursesDto;
import com.organizational.knowledge_gap_platform.dto.RecommendationResponse;
import com.organizational.knowledge_gap_platform.dto.RecommendedCourseDto;
import com.organizational.knowledge_gap_platform.entity.Employee;
import com.organizational.knowledge_gap_platform.entity.EmployeeSkill;
import com.organizational.knowledge_gap_platform.entity.Role;
import com.organizational.knowledge_gap_platform.entity.RoleSkillRequirement;
import com.organizational.knowledge_gap_platform.entity.Skill;
import com.organizational.knowledge_gap_platform.entity.User;
import com.organizational.knowledge_gap_platform.repository.EmployeeRepository;
import com.organizational.knowledge_gap_platform.repository.EmployeeSkillRepository;
import com.organizational.knowledge_gap_platform.repository.RoleSkillRequirementRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class RecommendationServiceImpl implements RecommendationService {

    private static final Logger log = LoggerFactory.getLogger(RecommendationServiceImpl.class);

    private final EmployeeRepository employeeRepository;
    private final EmployeeSkillRepository employeeSkillRepository;
    private final RoleSkillRequirementRepository roleSkillRequirementRepository;
    private final ExternalCourseService externalCourseService;
    private final AiRecommendationRouter aiRecommendationRouter;
    private final ObjectMapper objectMapper;

    public RecommendationServiceImpl(EmployeeRepository employeeRepository,
                                      EmployeeSkillRepository employeeSkillRepository,
                                      RoleSkillRequirementRepository roleSkillRequirementRepository,
                                      ExternalCourseService externalCourseService,
                                      AiRecommendationRouter aiRecommendationRouter,
                                      ObjectMapper objectMapper) {
        this.employeeRepository = employeeRepository;
        this.employeeSkillRepository = employeeSkillRepository;
        this.roleSkillRequirementRepository = roleSkillRequirementRepository;
        this.externalCourseService = externalCourseService;
        this.aiRecommendationRouter = aiRecommendationRouter;
        this.objectMapper = objectMapper;
    }

    @Override
    public RecommendationResponse getRecommendationsForUser(Long userId) {

        Employee employee = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Employee not found for user id: " + userId));

        List<Skill> missingSkills = resolveMissingSkills(employee);

        if (missingSkills.isEmpty()) {
            return new RecommendationResponse(
                    List.of("No skill gaps detected - great job staying current!"),
                    List.of(),
                    List.of());
        }

        List<MissingSkillCoursesDto> externalCourses = buildExternalCourses(missingSkills);

        try {
            RecommendationResponse aiResponse = generateAiRecommendations(employee, missingSkills);
            aiResponse.setExternalCourses(externalCourses);
            return aiResponse;
        } catch (AiRecommendationException ex) {
            log.warn("AI recommendation generation failed for employee {}, falling back to rule-based output: {}",
                    employee.getId(), ex.getMessage());
            return buildFallbackRecommendations(missingSkills, externalCourses);
        }
    }

    /**
     * Employee has no single role field. Role lives on User, and a User can hold
     * MULTIPLE roles (e.g. Employee + Admin at once). Union the required skills
     * across all of the user's roles, so nothing is missed if any role requires it.
     */
    private List<Skill> resolveMissingSkills(Employee employee) {

        List<EmployeeSkill> ownedSkills = employeeSkillRepository.findByEmployeeId(employee.getId());
        Set<Long> ownedSkillIds = ownedSkills.stream()
                .map(es -> es.getSkill().getId())
                .collect(Collectors.toSet());

        User user = employee.getUser();
        Set<Role> roles = user.getRoles();

        // Map keyed by skill id so the same skill required by two different
        // roles only appears once in the union.
        Map<Long, Skill> requiredSkillsById = new LinkedHashMap<>();

        for (Role role : roles) {
            List<RoleSkillRequirement> requirements = roleSkillRequirementRepository.findByRole(role);
            for (RoleSkillRequirement requirement : requirements) {
                Skill skill = requirement.getSkill();
                requiredSkillsById.put(skill.getId(), skill);
            }
        }

        return requiredSkillsById.values().stream()
                .filter(skill -> !ownedSkillIds.contains(skill.getId()))
                .collect(Collectors.toList());
    }

    private RecommendationResponse generateAiRecommendations(Employee employee, List<Skill> missingSkills) {

        List<String> missingSkillNames = missingSkills.stream()
                .map(Skill::getSkillName)
                .collect(Collectors.toList());

        String prompt = buildPrompt(employee, missingSkillNames);
        String rawResponse = aiRecommendationRouter.generate(prompt);
        String json = stripMarkdownFence(rawResponse);

        try {
            JsonNode root = objectMapper.readTree(json);

            List<String> recommendations = toStringList(root.path("recommendations"));
            List<String> roadmap = toStringList(root.path("roadmap"));

            if (recommendations.isEmpty()) {
                throw new AiRecommendationException("AI response contained no recommendations: " + rawResponse);
            }

            return new RecommendationResponse(recommendations, roadmap, null);
        } catch (AiRecommendationException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new AiRecommendationException("Could not parse AI response as JSON: " + rawResponse, ex);
        }
    }

    private String buildPrompt(Employee employee, List<String> missingSkillNames) {
        return """
                You are a corporate learning & development assistant.

                Employee designation: %s
                Employee department: %s
                Missing skills (skill gaps) to address: %s

                Based on these skill gaps, produce:
                1. "recommendations": 4-8 specific, actionable learning recommendations (courses, resource types,
                   or practice suggestions), each as a short string.
                2. "roadmap": a month-by-month learning plan as an array of short strings, e.g.
                   "Month 1: Learn X, Y".

                Respond with STRICT JSON only, no markdown fences, no commentary, matching exactly this shape:
                {"recommendations": ["...", "..."], "roadmap": ["Month 1: ...", "Month 2: ..."]}
                """.formatted(
                employee.getDesignation(),
                employee.getDepartment(),
                String.join(", ", missingSkillNames)
        );
    }

    private String stripMarkdownFence(String text) {
        String trimmed = text.trim();
        if (trimmed.startsWith("```")) {
            trimmed = trimmed.replaceFirst("^```[a-zA-Z]*", "");
            int lastFence = trimmed.lastIndexOf("```");
            if (lastFence >= 0) {
                trimmed = trimmed.substring(0, lastFence);
            }
        }
        return trimmed.trim();
    }

    private List<String> toStringList(JsonNode arrayNode) {
        List<String> values = new ArrayList<>();
        if (arrayNode.isArray()) {
            for (JsonNode node : arrayNode) {
                values.add(node.asText());
            }
        }
        return values;
    }

    /**
     * Deterministic fallback used when the AI provider is unavailable, unconfigured,
     * or returns something unparsable - keeps the endpoint reliable either way.
     */
    private RecommendationResponse buildFallbackRecommendations(List<Skill> missingSkills,
                                                                 List<MissingSkillCoursesDto> externalCourses) {

        List<String> recommendations = missingSkills.stream()
                .map(skill -> "Learn " + skill.getSkillName())
                .collect(Collectors.toList());

        List<String> roadmap = buildRoadmap(missingSkills);

        return new RecommendationResponse(recommendations, roadmap, externalCourses);
    }

    private List<String> buildRoadmap(List<Skill> missingSkills) {

        List<String> roadmap = new ArrayList<>();

        int skillsPerMonth = 2;
        int month = 1;

        for (int i = 0; i < missingSkills.size(); i += skillsPerMonth) {
            int end = Math.min(i + skillsPerMonth, missingSkills.size());
            List<String> monthSkills = missingSkills.subList(i, end).stream()
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