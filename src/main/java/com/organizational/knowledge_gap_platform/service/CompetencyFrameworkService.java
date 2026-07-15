package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.*;

import java.util.List;

public interface CompetencyFrameworkService {

    CompetencyFrameworkResponse createFramework(CompetencyFrameworkRequest request, String createdBy);

    CompetencyFrameworkResponse getFrameworkById(Long id);

    List<CompetencyFrameworkResponse> getAllCurrentFrameworks();

    List<CompetencyFrameworkResponse> getFrameworksByRoleAndDepartment(Long roleId, String department);

    CompetencyFrameworkResponse updateFramework(Long id, CompetencyFrameworkRequest request);

    CompetencyFrameworkResponse publishFramework(Long id);

    CompetencyFrameworkResponse archiveFramework(Long id);

    void deleteFramework(Long id);

    CompetencyFrameworkResponse setFrameworkSkills(Long frameworkId, List<CompetencyFrameworkSkillRequest> skills);

    CompetencyFrameworkResponse addFrameworkSkill(Long frameworkId, CompetencyFrameworkSkillRequest request);

    CompetencyFrameworkResponse removeFrameworkSkill(Long frameworkId, Long frameworkSkillId);

    CompetencyFrameworkResponse mapToStrategicGoal(Long frameworkId, CompetencyGoalMappingRequest request);

    CompetencyFrameworkResponse removeGoalMapping(Long frameworkId, Long strategicGoalId);

    CompetencyFrameworkResponse compareToIndustryBenchmark(Long frameworkId);

    CompetencyFrameworkResponse createNewVersion(Long frameworkId, String createdBy);

    List<FrameworkVersionSummaryDTO> getVersionHistory(String versionGroupId);
}
