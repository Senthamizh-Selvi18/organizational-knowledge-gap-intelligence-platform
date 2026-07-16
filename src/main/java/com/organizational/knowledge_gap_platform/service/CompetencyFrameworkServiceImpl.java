package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.*;
import com.organizational.knowledge_gap_platform.entity.*;
import com.organizational.knowledge_gap_platform.exception.CompetencyFrameworkNotFoundException;
import com.organizational.knowledge_gap_platform.exception.SkillTaxonomyNotFoundException;
import com.organizational.knowledge_gap_platform.exception.StrategicGoalNotFoundException;
import com.organizational.knowledge_gap_platform.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CompetencyFrameworkServiceImpl implements CompetencyFrameworkService {

    private final CompetencyFrameworkRepository frameworkRepository;
    private final CompetencyFrameworkSkillRepository frameworkSkillRepository;
    private final CompetencyGoalMappingRepository goalMappingRepository;
    private final SkillTaxonomyRepository skillTaxonomyRepository;
    private final StrategicGoalRepository strategicGoalRepository;
    private final IndustryBenchmarkRepository industryBenchmarkRepository;
    private final RoleRepository roleRepository;

    public CompetencyFrameworkServiceImpl(CompetencyFrameworkRepository frameworkRepository,
                                           CompetencyFrameworkSkillRepository frameworkSkillRepository,
                                           CompetencyGoalMappingRepository goalMappingRepository,
                                           SkillTaxonomyRepository skillTaxonomyRepository,
                                           StrategicGoalRepository strategicGoalRepository,
                                           IndustryBenchmarkRepository industryBenchmarkRepository,
                                           RoleRepository roleRepository) {
        this.frameworkRepository = frameworkRepository;
        this.frameworkSkillRepository = frameworkSkillRepository;
        this.goalMappingRepository = goalMappingRepository;
        this.skillTaxonomyRepository = skillTaxonomyRepository;
        this.strategicGoalRepository = strategicGoalRepository;
        this.industryBenchmarkRepository = industryBenchmarkRepository;
        this.roleRepository = roleRepository;
    }

    @Override
    @Transactional
    public CompetencyFrameworkResponse createFramework(CompetencyFrameworkRequest request, String createdBy) {
        CompetencyFramework framework = new CompetencyFramework();
        framework.setFrameworkName(request.getFrameworkName());
        framework.setDepartment(request.getDepartment());
        framework.setDescription(request.getDescription());
        framework.setIndustryBenchmarkSource(request.getIndustryBenchmarkSource());
        framework.setRole(resolveRole(request.getRoleId()));
        framework.setStatus(FrameworkStatus.DRAFT);
        framework.setVersionGroupId(UUID.randomUUID().toString());
        framework.setVersionNumber(1);
        framework.setIsCurrentVersion(true);
        framework.setCreatedBy(createdBy);

        return CompetencyFrameworkResponse.fromEntity(frameworkRepository.save(framework));
    }

    @Override
    public CompetencyFrameworkResponse getFrameworkById(Long id) {
        return CompetencyFrameworkResponse.fromEntity(findEntity(id));
    }

    @Override
    public List<CompetencyFrameworkResponse> getAllCurrentFrameworks() {
        return frameworkRepository.findByIsCurrentVersionTrue().stream()
                .map(CompetencyFrameworkResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<CompetencyFrameworkResponse> getFrameworksByRoleAndDepartment(Long roleId, String department) {
        List<CompetencyFramework> results;

        boolean hasRole = roleId != null;
        boolean hasDept = department != null && !department.isBlank();

        if (hasRole && hasDept) {
            results = frameworkRepository.findByRoleIdAndDepartmentIgnoreCaseAndIsCurrentVersionTrue(roleId, department);
        } else if (hasRole) {
            results = frameworkRepository.findByRoleIdAndIsCurrentVersionTrue(roleId);
        } else if (hasDept) {
            results = frameworkRepository.findByDepartmentIgnoreCaseAndIsCurrentVersionTrue(department);
        } else {
            results = frameworkRepository.findByIsCurrentVersionTrue();
        }

        return results.stream()
                .map(CompetencyFrameworkResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CompetencyFrameworkResponse updateFramework(Long id, CompetencyFrameworkRequest request) {
        CompetencyFramework framework = findEntity(id);
        requireEditable(framework);

        framework.setFrameworkName(request.getFrameworkName());
        framework.setDepartment(request.getDepartment());
        framework.setDescription(request.getDescription());
        framework.setIndustryBenchmarkSource(request.getIndustryBenchmarkSource());
        framework.setRole(resolveRole(request.getRoleId()));

        return CompetencyFrameworkResponse.fromEntity(frameworkRepository.save(framework));
    }

    @Override
    @Transactional
    public CompetencyFrameworkResponse publishFramework(Long id) {
        CompetencyFramework framework = findEntity(id);

        if (framework.getSkills() == null || framework.getSkills().isEmpty()) {
            throw new IllegalStateException("Cannot publish a framework with no required skills defined");
        }

        framework.setStatus(FrameworkStatus.PUBLISHED);
        return CompetencyFrameworkResponse.fromEntity(frameworkRepository.save(framework));
    }

    @Override
    @Transactional
    public CompetencyFrameworkResponse archiveFramework(Long id) {
        CompetencyFramework framework = findEntity(id);
        framework.setStatus(FrameworkStatus.ARCHIVED);
        framework.setIsCurrentVersion(false);
        return CompetencyFrameworkResponse.fromEntity(frameworkRepository.save(framework));
    }

    @Override
    @Transactional
    public void deleteFramework(Long id) {
        CompetencyFramework framework = findEntity(id);

        if (framework.getStatus() != FrameworkStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT frameworks can be deleted. Archive published frameworks instead.");
        }

        frameworkRepository.delete(framework);
    }

    @Override
    @Transactional
    public CompetencyFrameworkResponse setFrameworkSkills(Long frameworkId, List<CompetencyFrameworkSkillRequest> skills) {
        CompetencyFramework framework = findEntity(frameworkId);
        requireEditable(framework);

        frameworkSkillRepository.deleteByFrameworkId(frameworkId);
        framework.getSkills().clear();

        for (CompetencyFrameworkSkillRequest req : skills) {
            framework.getSkills().add(buildFrameworkSkill(framework, req));
        }

        return CompetencyFrameworkResponse.fromEntity(frameworkRepository.save(framework));
    }

    @Override
    @Transactional
    public CompetencyFrameworkResponse addFrameworkSkill(Long frameworkId, CompetencyFrameworkSkillRequest request) {
        CompetencyFramework framework = findEntity(frameworkId);
        requireEditable(framework);

        framework.getSkills().add(buildFrameworkSkill(framework, request));

        return CompetencyFrameworkResponse.fromEntity(frameworkRepository.save(framework));
    }

    @Override
    @Transactional
    public CompetencyFrameworkResponse removeFrameworkSkill(Long frameworkId, Long frameworkSkillId) {
        CompetencyFramework framework = findEntity(frameworkId);
        requireEditable(framework);

        boolean removed = framework.getSkills().removeIf(s -> s.getId().equals(frameworkSkillId));
        if (!removed) {
            throw new CompetencyFrameworkNotFoundException(
                    "Framework skill not found with id: " + frameworkSkillId + " on framework " + frameworkId);
        }

        return CompetencyFrameworkResponse.fromEntity(frameworkRepository.save(framework));
    }

    @Override
    @Transactional
    public CompetencyFrameworkResponse mapToStrategicGoal(Long frameworkId, CompetencyGoalMappingRequest request) {
        CompetencyFramework framework = findEntity(frameworkId);

        StrategicGoal goal = strategicGoalRepository.findById(request.getStrategicGoalId())
                .orElseThrow(() -> new StrategicGoalNotFoundException(
                        "Strategic goal not found with id: " + request.getStrategicGoalId()));

        CompetencyGoalMapping mapping = goalMappingRepository
                .findByFrameworkIdAndStrategicGoalId(frameworkId, request.getStrategicGoalId())
                .orElseGet(CompetencyGoalMapping::new);

        mapping.setFramework(framework);
        mapping.setStrategicGoal(goal);
        mapping.setAlignmentWeight(request.getAlignmentWeight() != null ? request.getAlignmentWeight() : 100.0);
        mapping.setNotes(request.getNotes());

        goalMappingRepository.save(mapping);

        return CompetencyFrameworkResponse.fromEntity(findEntity(frameworkId));
    }

    @Override
    @Transactional
    public CompetencyFrameworkResponse removeGoalMapping(Long frameworkId, Long strategicGoalId) {
        findEntity(frameworkId);
        goalMappingRepository.deleteByFrameworkIdAndStrategicGoalId(frameworkId, strategicGoalId);
        return CompetencyFrameworkResponse.fromEntity(findEntity(frameworkId));
    }

    @Override
    public CompetencyFrameworkResponse compareToIndustryBenchmark(Long frameworkId) {
        CompetencyFramework framework = findEntity(frameworkId);
        CompetencyFrameworkResponse response = CompetencyFrameworkResponse.fromEntity(framework);

        String roleCategory = framework.getRole() != null ? framework.getRole().getRoleName() : null;

        if (response.getSkills() != null) {
            for (CompetencyFrameworkSkillDTO skillDTO : response.getSkills()) {
                List<IndustryBenchmark> benchmarks = (roleCategory != null)
                        ? industryBenchmarkRepository.findBySkillTaxonomyIdAndRoleCategoryIgnoreCase(
                                skillDTO.getSkillTaxonomyId(), roleCategory)
                        : List.of();

                if (benchmarks.isEmpty()) {
                    benchmarks = industryBenchmarkRepository.findBySkillTaxonomyId(skillDTO.getSkillTaxonomyId());
                }

                if (!benchmarks.isEmpty()) {
                    ProficiencyLevel benchmarkLevel = benchmarks.get(0).getBenchmarkLevel();
                    skillDTO.setBenchmarkLevel(benchmarkLevel);
                    skillDTO.setGapVsBenchmark(skillDTO.getRequiredLevel().getRank() - benchmarkLevel.getRank());
                }
            }
        }

        return response;
    }

    @Override
    @Transactional
    public CompetencyFrameworkResponse createNewVersion(Long frameworkId, String createdBy) {
        CompetencyFramework source = findEntity(frameworkId);

        int nextVersionNumber = frameworkRepository
                .findByVersionGroupIdOrderByVersionNumberDesc(source.getVersionGroupId())
                .stream()
                .findFirst()
                .map(f -> f.getVersionNumber() + 1)
                .orElse(source.getVersionNumber() + 1);

        source.setIsCurrentVersion(false);
        frameworkRepository.save(source);

        CompetencyFramework newVersion = new CompetencyFramework();
        newVersion.setFrameworkName(source.getFrameworkName());
        newVersion.setRole(source.getRole());
        newVersion.setDepartment(source.getDepartment());
        newVersion.setDescription(source.getDescription());
        newVersion.setIndustryBenchmarkSource(source.getIndustryBenchmarkSource());
        newVersion.setStatus(FrameworkStatus.DRAFT);
        newVersion.setVersionGroupId(source.getVersionGroupId());
        newVersion.setVersionNumber(nextVersionNumber);
        newVersion.setIsCurrentVersion(true);
        newVersion.setCreatedBy(createdBy);

        CompetencyFramework savedNewVersion = frameworkRepository.save(newVersion);

        for (CompetencyFrameworkSkill sourceSkill : source.getSkills()) {
            CompetencyFrameworkSkill clone = new CompetencyFrameworkSkill();
            clone.setFramework(savedNewVersion);
            clone.setSkillTaxonomy(sourceSkill.getSkillTaxonomy());
            clone.setRequiredLevel(sourceSkill.getRequiredLevel());
            clone.setWeight(sourceSkill.getWeight());
            clone.setNotes(sourceSkill.getNotes());
            savedNewVersion.getSkills().add(clone);
        }

        for (CompetencyGoalMapping sourceMapping : source.getGoalMappings()) {
            CompetencyGoalMapping clone = new CompetencyGoalMapping();
            clone.setFramework(savedNewVersion);
            clone.setStrategicGoal(sourceMapping.getStrategicGoal());
            clone.setAlignmentWeight(sourceMapping.getAlignmentWeight());
            clone.setNotes(sourceMapping.getNotes());
            savedNewVersion.getGoalMappings().add(clone);
        }

        return CompetencyFrameworkResponse.fromEntity(frameworkRepository.save(savedNewVersion));
    }

    @Override
    public List<FrameworkVersionSummaryDTO> getVersionHistory(String versionGroupId) {
        return frameworkRepository.findByVersionGroupIdOrderByVersionNumberDesc(versionGroupId).stream()
                .map(FrameworkVersionSummaryDTO::fromEntity)
                .collect(Collectors.toList());
    }

    private CompetencyFrameworkSkill buildFrameworkSkill(CompetencyFramework framework, CompetencyFrameworkSkillRequest request) {
        SkillTaxonomy taxonomy = skillTaxonomyRepository.findById(request.getSkillTaxonomyId())
                .orElseThrow(() -> new SkillTaxonomyNotFoundException(
                        "Skill taxonomy not found with id: " + request.getSkillTaxonomyId()));

        CompetencyFrameworkSkill skill = new CompetencyFrameworkSkill();
        skill.setFramework(framework);
        skill.setSkillTaxonomy(taxonomy);
        skill.setRequiredLevel(request.getRequiredLevel());
        skill.setWeight(request.getWeight() != null ? request.getWeight() : 1.0);
        skill.setNotes(request.getNotes());
        return skill;
    }

    private Role resolveRole(Long roleId) {
        if (roleId == null) {
            return null;
        }
        return roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Role not found with id: " + roleId));
    }

    private void requireEditable(CompetencyFramework framework) {
        if (framework.getStatus() == FrameworkStatus.PUBLISHED) {
            throw new IllegalStateException(
                    "Published frameworks cannot be edited directly. Create a new version instead.");
        }
    }

    private CompetencyFramework findEntity(Long id) {
        return frameworkRepository.findById(id)
                .orElseThrow(() -> new CompetencyFrameworkNotFoundException("Competency framework not found with id: " + id));
    }
}
