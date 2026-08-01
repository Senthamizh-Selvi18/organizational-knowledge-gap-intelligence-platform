package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.GapAnalysisResponseDTO;
import com.organizational.knowledge_gap_platform.dto.SkillDTO;
import com.organizational.knowledge_gap_platform.dto.report.DepartmentGapSummaryReportDTO;
import com.organizational.knowledge_gap_platform.dto.report.LearningRoiReportDTO;
import com.organizational.knowledge_gap_platform.dto.report.ReportType;
import com.organizational.knowledge_gap_platform.dto.report.StrategicWorkforcePlanningReportDTO;
import com.organizational.knowledge_gap_platform.dto.report.TrainingEffectivenessReportDTO;
import com.organizational.knowledge_gap_platform.entity.CompetencyFrameworkSkill;
import com.organizational.knowledge_gap_platform.entity.CompetencyGoalMapping;
import com.organizational.knowledge_gap_platform.entity.Employee;
import com.organizational.knowledge_gap_platform.entity.EmployeeSkill;
import com.organizational.knowledge_gap_platform.entity.InternalTraining;
import com.organizational.knowledge_gap_platform.entity.LearningEnrollment;
import com.organizational.knowledge_gap_platform.entity.Skill;
import com.organizational.knowledge_gap_platform.entity.StrategicGoal;
import com.organizational.knowledge_gap_platform.repository.CompetencyFrameworkSkillRepository;
import com.organizational.knowledge_gap_platform.repository.CompetencyGoalMappingRepository;
import com.organizational.knowledge_gap_platform.repository.EmployeeRepository;
import com.organizational.knowledge_gap_platform.repository.EmployeeSkillRepository;
import com.organizational.knowledge_gap_platform.repository.InternalTrainingRepository;
import com.organizational.knowledge_gap_platform.repository.LearningEnrollmentRepository;
import com.organizational.knowledge_gap_platform.repository.StrategicGoalRepository;
import com.organizational.knowledge_gap_platform.util.report.ExcelReportBuilder;
import com.organizational.knowledge_gap_platform.util.report.PdfReportBuilder;
import com.organizational.knowledge_gap_platform.util.report.ReportTable;
import org.springframework.stereotype.Service;

import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ReportServiceImpl implements ReportService {

    private static final double READINESS_THRESHOLD = 0.7;

    private static final int TOP_MISSING_SKILLS_LIMIT = 5;

    private final GapAnalysisService gapAnalysisService;
    private final EmployeeRepository employeeRepository;
    private final InternalTrainingRepository internalTrainingRepository;
    private final LearningEnrollmentRepository learningEnrollmentRepository;
    private final StrategicGoalRepository strategicGoalRepository;
    private final CompetencyGoalMappingRepository competencyGoalMappingRepository;
    private final CompetencyFrameworkSkillRepository competencyFrameworkSkillRepository;
    private final EmployeeSkillRepository employeeSkillRepository;

    public ReportServiceImpl(
            GapAnalysisService gapAnalysisService,
            EmployeeRepository employeeRepository,
            InternalTrainingRepository internalTrainingRepository,
            LearningEnrollmentRepository learningEnrollmentRepository,
            StrategicGoalRepository strategicGoalRepository,
            CompetencyGoalMappingRepository competencyGoalMappingRepository,
            CompetencyFrameworkSkillRepository competencyFrameworkSkillRepository,
            EmployeeSkillRepository employeeSkillRepository) {
        this.gapAnalysisService = gapAnalysisService;
        this.employeeRepository = employeeRepository;
        this.internalTrainingRepository = internalTrainingRepository;
        this.learningEnrollmentRepository = learningEnrollmentRepository;
        this.strategicGoalRepository = strategicGoalRepository;
        this.competencyGoalMappingRepository = competencyGoalMappingRepository;
        this.competencyFrameworkSkillRepository = competencyFrameworkSkillRepository;
        this.employeeSkillRepository = employeeSkillRepository;
    }

    @Override
    public List<GapAnalysisResponseDTO> individualSkillGapReport(Long employeeId) {
        return gapAnalysisService.analyzeGapForEmployee(employeeId);
    }

    @Override
    public List<DepartmentGapSummaryReportDTO> departmentGapSummaryReport() {

        Map<Long, String> departmentByEmployeeId = employeeRepository.findAll().stream()
                .collect(Collectors.toMap(Employee::getId, Employee::getDepartment, (a, b) -> a));

        List<GapAnalysisResponseDTO> allGaps = gapAnalysisService.analyzeGapForAllEmployees();

        Map<String, List<Double>> gapPercentagesByDept = new HashMap<>();
        Map<String, Map<String, Integer>> missingSkillFrequencyByDept = new HashMap<>();

        for (GapAnalysisResponseDTO gap : allGaps) {
            String department = departmentByEmployeeId.getOrDefault(gap.getEmployeeId(), "Unassigned");

            gapPercentagesByDept.computeIfAbsent(department, d -> new ArrayList<>())
                    .add(gap.getGapPercentage());

            Map<String, Integer> freq = missingSkillFrequencyByDept.computeIfAbsent(department, d -> new HashMap<>());
            for (SkillDTO missing : gap.getMissingSkills()) {
                freq.merge(missing.getSkillName(), 1, Integer::sum);
            }
        }

        List<DepartmentGapSummaryReportDTO> result = new ArrayList<>();
        for (Map.Entry<String, List<Double>> entry : gapPercentagesByDept.entrySet()) {
            String department = entry.getKey();
            double average = entry.getValue().stream().mapToDouble(Double::doubleValue).average().orElse(0);

            List<String> topMissing = missingSkillFrequencyByDept.getOrDefault(department, Map.of())
                    .entrySet().stream()
                    .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                    .limit(TOP_MISSING_SKILLS_LIMIT)
                    .map(Map.Entry::getKey)
                    .collect(Collectors.toList());

            result.add(new DepartmentGapSummaryReportDTO(
                    department,
                    entry.getValue().size(),
                    Math.round(average * 100.0) / 100.0,
                    topMissing
            ));
        }

        result.sort(Comparator.comparing(DepartmentGapSummaryReportDTO::getDepartment));
        return result;
    }

    @Override
    public List<TrainingEffectivenessReportDTO> trainingEffectivenessReport() {

        List<InternalTraining> trainings = internalTrainingRepository.findAll();
        List<TrainingEffectivenessReportDTO> result = new ArrayList<>();

        for (InternalTraining training : trainings) {
            List<LearningEnrollment> enrollments = learningEnrollmentRepository.findByTrainingId(training.getId());

            long total = enrollments.size();
            long notStarted = enrollments.stream().filter(e -> "ENROLLED".equals(e.getStatus())).count();
            long inProgress = enrollments.stream().filter(e -> "IN_PROGRESS".equals(e.getStatus())).count();
            long certified = enrollments.stream().filter(e -> "CERTIFIED".equals(e.getStatus())).count();

            double completionRate = total == 0 ? 0.0 : Math.round((certified * 10000.0) / total) / 100.0;

            List<Long> daysToCertify = enrollments.stream()
                    .filter(e -> "CERTIFIED".equals(e.getStatus()) && e.getEnrolledDate() != null && e.getCertifiedDate() != null)
                    .map(e -> ChronoUnit.DAYS.between(e.getEnrolledDate(), e.getCertifiedDate()))
                    .collect(Collectors.toList());

            Double avgDays = daysToCertify.isEmpty()
                    ? null
                    : Math.round(daysToCertify.stream().mapToLong(Long::longValue).average().orElse(0) * 100.0) / 100.0;

            result.add(new TrainingEffectivenessReportDTO(
                    training.getId(),
                    training.getTitle(),
                    training.getSkillName(),
                    training.getCategory(),
                    training.getMode(),
                    training.isMandatory(),
                    total,
                    notStarted,
                    inProgress,
                    certified,
                    completionRate,
                    avgDays
            ));
        }

        result.sort(Comparator.comparing(TrainingEffectivenessReportDTO::getTotalEnrollments).reversed());
        return result;
    }

    @Override
    public List<LearningRoiReportDTO> learningRoiReport() {

        Map<Long, Set<String>> matchedSkillNamesByEmployee = gapAnalysisService.analyzeGapForAllEmployees()
                .stream()
                .collect(Collectors.toMap(
                        GapAnalysisResponseDTO::getEmployeeId,
                        gap -> gap.getMatchedSkills().stream()
                                .map(s -> s.getSkillName().toLowerCase())
                                .collect(Collectors.toSet()),
                        (a, b) -> a
                ));

        List<InternalTraining> trainings = internalTrainingRepository.findAll();
        List<LearningRoiReportDTO> result = new ArrayList<>();

        for (InternalTraining training : trainings) {
            List<LearningEnrollment> enrollments = learningEnrollmentRepository.findByTrainingId(training.getId());

            long totalEnrollments = enrollments.size();
            List<LearningEnrollment> certified = enrollments.stream()
                    .filter(e -> "CERTIFIED".equals(e.getStatus()))
                    .collect(Collectors.toList());
            long totalCertifications = certified.size();

            double certificationRate = totalEnrollments == 0
                    ? 0.0
                    : Math.round((totalCertifications * 10000.0) / totalEnrollments) / 100.0;

            String skillKey = training.getSkillName() == null ? "" : training.getSkillName().toLowerCase();

            long closedGapCount = certified.stream()
                    .filter(e -> matchedSkillNamesByEmployee
                            .getOrDefault(e.getEmployee().getId(), Set.of())
                            .contains(skillKey))
                    .count();

            Double roiScore = totalCertifications == 0
                    ? null
                    : Math.round((closedGapCount * 10000.0) / totalCertifications) / 100.0;

            result.add(new LearningRoiReportDTO(
                    training.getId(),
                    training.getTitle(),
                    training.getSkillName(),
                    totalEnrollments,
                    totalCertifications,
                    certificationRate,
                    closedGapCount,
                    roiScore
            ));
        }

        result.sort((a, b) -> Double.compare(
                b.getRoiScorePercent() == null ? -1 : b.getRoiScorePercent(),
                a.getRoiScorePercent() == null ? -1 : a.getRoiScorePercent()
        ));
        return result;
    }

    @Override
    public List<StrategicWorkforcePlanningReportDTO> strategicWorkforcePlanningReport() {

        List<Employee> employees = employeeRepository.findAll();

        // employeeId -> possessed skill IDs, fetched once and reused for every goal.
        Map<Long, Set<Long>> possessedSkillIdsByEmployee = new HashMap<>();
        for (Employee employee : employees) {
            Set<Long> skillIds = employeeSkillRepository.findByEmployee(employee).stream()
                    .map(es -> es.getSkill().getId())
                    .collect(Collectors.toSet());
            possessedSkillIdsByEmployee.put(employee.getId(), skillIds);
        }

        List<StrategicGoal> goals = strategicGoalRepository.findByActiveTrue();
        List<StrategicWorkforcePlanningReportDTO> result = new ArrayList<>();

        for (StrategicGoal goal : goals) {

            // StrategicGoal -> CompetencyGoalMapping -> CompetencyFramework
            //               -> CompetencyFrameworkSkill -> SkillTaxonomy -> linkedSkills
            List<CompetencyGoalMapping> mappings = competencyGoalMappingRepository.findByStrategicGoalId(goal.getId());

            Set<Skill> requiredSkills = new HashSet<>();
            for (CompetencyGoalMapping mapping : mappings) {
                Long frameworkId = mapping.getFramework().getId();
                List<CompetencyFrameworkSkill> frameworkSkills =
                        competencyFrameworkSkillRepository.findByFrameworkId(frameworkId);
                for (CompetencyFrameworkSkill cfs : frameworkSkills) {
                    requiredSkills.addAll(cfs.getSkillTaxonomy().getLinkedSkills());
                }
            }

            int requiredSkillCount = requiredSkills.size();
            Set<Long> requiredSkillIds = requiredSkills.stream().map(Skill::getId).collect(Collectors.toSet());
            int readyThresholdCount = (int) Math.ceil(requiredSkillCount * READINESS_THRESHOLD);

            long employeesReady = 0;
            Map<Long, Long> coverageCountBySkillId = new HashMap<>();
            for (Long skillId : requiredSkillIds) {
                coverageCountBySkillId.put(skillId, 0L);
            }

            for (Employee employee : employees) {
                Set<Long> possessed = possessedSkillIdsByEmployee.getOrDefault(employee.getId(), Set.of());

                long matchedCount = requiredSkillIds.stream().filter(possessed::contains).count();
                if (requiredSkillCount > 0 && matchedCount >= readyThresholdCount) {
                    employeesReady++;
                }

                for (Long skillId : requiredSkillIds) {
                    if (possessed.contains(skillId)) {
                        coverageCountBySkillId.merge(skillId, 1L, Long::sum);
                    }
                }
            }

            Map<Long, String> skillNamesById = requiredSkills.stream()
                    .collect(Collectors.toMap(Skill::getId, Skill::getSkillName, (a, b) -> a));

            List<String> topGapSkills = coverageCountBySkillId.entrySet().stream()
                    .sorted(Map.Entry.comparingByValue())
                    .limit(TOP_MISSING_SKILLS_LIMIT)
                    .map(e -> skillNamesById.get(e.getKey()))
                    .collect(Collectors.toList());

            double readinessPercentage = employees.isEmpty()
                    ? 0.0
                    : Math.round((employeesReady * 10000.0) / employees.size()) / 100.0;

            result.add(new StrategicWorkforcePlanningReportDTO(
                    goal.getId(),
                    goal.getGoalName(),
                    goal.getPriority() == null ? null : goal.getPriority().name(),
                    goal.getTargetYear(),
                    requiredSkillCount,
                    employees.size(),
                    employeesReady,
                    readinessPercentage,
                    topGapSkills
            ));
        }

        result.sort(Comparator.comparing(StrategicWorkforcePlanningReportDTO::getReadinessPercentage));
        return result;
    }

    // ----------------------------------------------------------------
    // (vi) / (vii) Export
    // ----------------------------------------------------------------

    @Override
    public byte[] exportExcel(ReportType type, Long employeeId) {
        ReportTable table = buildTable(type, employeeId);
        return ExcelReportBuilder.build(table.title(), table.headers(), table.rows());
    }

    @Override
    public byte[] exportPdf(ReportType type, Long employeeId) {
        ReportTable table = buildTable(type, employeeId);
        return PdfReportBuilder.build(table.title(), table.headers(), table.rows());
    }

    private ReportTable buildTable(ReportType type, Long employeeId) {
        return switch (type) {
            case INDIVIDUAL_SKILL_GAP -> individualSkillGapTable(employeeId);
            case DEPARTMENT_GAP_SUMMARY -> departmentGapSummaryTable();
            case TRAINING_EFFECTIVENESS -> trainingEffectivenessTable();
            case LEARNING_ROI -> learningRoiTable();
            case STRATEGIC_WORKFORCE_PLANNING -> strategicWorkforcePlanningTable();
        };
    }

    private ReportTable individualSkillGapTable(Long employeeId) {
        if (employeeId == null) {
            throw new IllegalArgumentException("employeeId is required for the Individual Skill Gap report");
        }

        List<GapAnalysisResponseDTO> gaps = individualSkillGapReport(employeeId);

        List<String> headers = List.of(
                "Role", "Total Required Skills", "Matched Skills", "Missing Skills",
                "Gap %", "Missing Skill Names"
        );

        List<List<String>> rows = gaps.stream()
                .map(gap -> List.of(
                        nullToDash(gap.getRoleName()),
                        String.valueOf(gap.getTotalRequiredSkills()),
                        String.valueOf(gap.getMatchedSkillCount()),
                        String.valueOf(gap.getMissingSkillCount()),
                        gap.getGapPercentage() + "%",
                        gap.getMissingSkills().stream().map(SkillDTO::getSkillName).collect(Collectors.joining(", "))
                ))
                .collect(Collectors.toList());

        String employeeName = gaps.isEmpty() ? ("Employee #" + employeeId) : gaps.get(0).getEmployeeName();
        return new ReportTable("Individual Skill Gap Report - " + employeeName, headers, rows);
    }

    private ReportTable departmentGapSummaryTable() {
        List<DepartmentGapSummaryReportDTO> rows = departmentGapSummaryReport();

        List<String> headers = List.of(
                "Department", "Employees Analyzed", "Average Gap %", "Top Missing Skills"
        );

        List<List<String>> tableRows = rows.stream()
                .map(r -> List.of(
                        r.getDepartment(),
                        String.valueOf(r.getEmployeeCount()),
                        r.getAverageGapPercentage() + "%",
                        String.join(", ", r.getTopMissingSkills())
                ))
                .collect(Collectors.toList());

        return new ReportTable("Department Gap Summary Report", headers, tableRows);
    }

    private ReportTable trainingEffectivenessTable() {
        List<TrainingEffectivenessReportDTO> rows = trainingEffectivenessReport();

        List<String> headers = List.of(
                "Training", "Skill", "Category", "Mode", "Mandatory",
                "Enrollments", "Not Started", "In Progress", "Certified",
                "Completion Rate %", "Avg Days to Certify"
        );

        List<List<String>> tableRows = rows.stream()
                .map(r -> List.of(
                        r.getTitle(),
                        nullToDash(r.getSkillName()),
                        nullToDash(r.getCategory()),
                        nullToDash(r.getMode()),
                        r.isMandatory() ? "Yes" : "No",
                        String.valueOf(r.getTotalEnrollments()),
                        String.valueOf(r.getNotStartedCount()),
                        String.valueOf(r.getInProgressCount()),
                        String.valueOf(r.getCertifiedCount()),
                        r.getCompletionRatePercent() + "%",
                        r.getAverageDaysToCertify() == null ? "-" : String.valueOf(r.getAverageDaysToCertify())
                ))
                .collect(Collectors.toList());

        return new ReportTable("Training Effectiveness Report", headers, tableRows);
    }

    private ReportTable learningRoiTable() {
        List<LearningRoiReportDTO> rows = learningRoiReport();

        List<String> headers = List.of(
                "Training", "Skill", "Enrollments", "Certifications",
                "Certification Rate %", "Employees Who Closed the Gap", "ROI Score % (proxy)"
        );

        List<List<String>> tableRows = rows.stream()
                .map(r -> List.of(
                        r.getTitle(),
                        nullToDash(r.getSkillName()),
                        String.valueOf(r.getTotalEnrollments()),
                        String.valueOf(r.getTotalCertifications()),
                        r.getCertificationRatePercent() + "%",
                        String.valueOf(r.getEmployeesWhoClosedTheGap()),
                        r.getRoiScorePercent() == null ? "-" : (r.getRoiScorePercent() + "%")
                ))
                .collect(Collectors.toList());

        return new ReportTable(
                "Learning ROI Analysis Report (skill-gap-closure proxy - see report notes)",
                headers, tableRows
        );
    }

    private ReportTable strategicWorkforcePlanningTable() {
        List<StrategicWorkforcePlanningReportDTO> rows = strategicWorkforcePlanningReport();

        List<String> headers = List.of(
                "Strategic Goal", "Priority", "Target Year", "Required Skills",
                "Employees Ready", "Total Employees", "Readiness %", "Top Gap Skills"
        );

        List<List<String>> tableRows = rows.stream()
                .map(r -> List.of(
                        r.getGoalName(),
                        nullToDash(r.getPriority()),
                        r.getTargetYear() == null ? "-" : String.valueOf(r.getTargetYear()),
                        String.valueOf(r.getRequiredSkillCount()),
                        String.valueOf(r.getEmployeesReady()),
                        String.valueOf(r.getTotalEmployeesConsidered()),
                        r.getReadinessPercentage() + "%",
                        String.join(", ", r.getTopGapSkills())
                ))
                .collect(Collectors.toList());

        return new ReportTable("Strategic Workforce Planning Report", headers, tableRows);
    }

    private static String nullToDash(String value) {
        return value == null || value.isBlank() ? "-" : value;
    }
}
