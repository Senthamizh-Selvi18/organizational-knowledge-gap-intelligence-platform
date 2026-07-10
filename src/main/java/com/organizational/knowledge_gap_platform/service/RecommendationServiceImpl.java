package com.organizational.knowledge_gap_platform.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.organizational.knowledge_gap_platform.ai.AiRecommendationException;
import com.organizational.knowledge_gap_platform.ai.AiRecommendationRouter;
import com.organizational.knowledge_gap_platform.dto.GapAnalysisResponseDTO;
import com.organizational.knowledge_gap_platform.dto.RecommendationResponse;
import com.organizational.knowledge_gap_platform.dto.SkillDTO;
import com.organizational.knowledge_gap_platform.entity.Employee;
import com.organizational.knowledge_gap_platform.entity.EmployeeSkill;
import com.organizational.knowledge_gap_platform.entity.Skill;
import com.organizational.knowledge_gap_platform.repository.EmployeeRepository;
import com.organizational.knowledge_gap_platform.repository.EmployeeSkillRepository;
import com.organizational.knowledge_gap_platform.repository.SkillRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class RecommendationServiceImpl implements RecommendationService {

    private static final Logger log = LoggerFactory.getLogger(RecommendationServiceImpl.class);

    private final EmployeeRepository employeeRepository;
    private final EmployeeSkillRepository employeeSkillRepository;
    private final SkillRepository skillRepository;
    private final GapAnalysisService gapAnalysisService;
    private final AiRecommendationRouter aiRecommendationRouter;
    private final ObjectMapper objectMapper;

    public RecommendationServiceImpl(EmployeeRepository employeeRepository,
                                      EmployeeSkillRepository employeeSkillRepository,
                                      SkillRepository skillRepository,
                                      GapAnalysisService gapAnalysisService,
                                      AiRecommendationRouter aiRecommendationRouter,
                                      ObjectMapper objectMapper) {
        this.employeeRepository = employeeRepository;
        this.employeeSkillRepository = employeeSkillRepository;
        this.skillRepository = skillRepository;
        this.gapAnalysisService = gapAnalysisService;
        this.aiRecommendationRouter = aiRecommendationRouter;
        this.objectMapper = objectMapper;
    }

    @Override
    public RecommendationResponse getRecommendationsForUser(Long userId) {

        Employee employee = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Employee not found for user id: " + userId));

        List<String> missingSkillNames = resolveMissingSkillNames(employee);

        if (missingSkillNames.isEmpty()) {
            return new RecommendationResponse(
                    List.of("No skill gaps detected - great job staying current!"),
                    List.of());
        }

        try {
            return generateAiRecommendations(employee, missingSkillNames);
        } catch (AiRecommendationException ex) {
            log.warn("AI recommendation generation failed for employee {}, falling back to rule-based output: {}",
                    employee.getId(), ex.getMessage());
            return buildFallbackRecommendations(missingSkillNames);
        }
    }

    /**
     * Prefers role-based gaps (what's actually required for the employee's assigned roles).
     * Falls back to "every skill in the catalog the employee doesn't have" if they have no
     * role assigned yet, so the API still returns something useful.
     */
    private List<String> resolveMissingSkillNames(Employee employee) {

        List<GapAnalysisResponseDTO> roleGaps = gapAnalysisService.analyzeGapForEmployee(employee.getId());

        Set<String> missing = new LinkedHashSet<>();
        for (GapAnalysisResponseDTO gap : roleGaps) {
            for (SkillDTO skill : gap.getMissingSkills()) {
                missing.add(skill.getSkillName());
            }
        }

        if (!missing.isEmpty()) {
            return new ArrayList<>(missing);
        }

        // No roles assigned (or no gaps found via roles) - fall back to catalog-wide comparison.
        List<EmployeeSkill> ownedSkills = employeeSkillRepository.findByEmployeeId(employee.getId());
        Set<Long> ownedSkillIds = ownedSkills.stream()
                .map(es -> es.getSkill().getId())
                .collect(Collectors.toSet());

        return skillRepository.findAll().stream()
                .filter(skill -> !ownedSkillIds.contains(skill.getId()))
                .map(Skill::getSkillName)
                .collect(Collectors.toList());
    }

    private RecommendationResponse generateAiRecommendations(Employee employee, List<String> missingSkillNames) {

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

            return new RecommendationResponse(recommendations, roadmap);
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
     * Simple, deterministic fallback used when the AI provider is unavailable, unconfigured,
     * or returns something we can't parse - keeps the endpoint reliable.
     */
    private RecommendationResponse buildFallbackRecommendations(List<String> missingSkillNames) {

        List<String> recommendations = missingSkillNames.stream()
                .map(name -> "Learn " + name)
                .collect(Collectors.toList());

        List<String> roadmap = buildRoadmap(missingSkillNames);

        return new RecommendationResponse(recommendations, roadmap);
    }

    private List<String> buildRoadmap(List<String> missingSkillNames) {

        List<String> roadmap = new ArrayList<>();

        int skillsPerMonth = 2;
        int month = 1;

        for (int i = 0; i < missingSkillNames.size(); i += skillsPerMonth) {
            int end = Math.min(i + skillsPerMonth, missingSkillNames.size());
            List<String> monthSkills = missingSkillNames.subList(i, end);
            roadmap.add("Month " + month + ": " + String.join(", ", monthSkills));
            month++;
        }

        return roadmap;
    }
}
