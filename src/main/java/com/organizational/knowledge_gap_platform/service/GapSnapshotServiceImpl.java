package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.GapAnalysisResponseDTO;
import com.organizational.knowledge_gap_platform.dto.GapSnapshotDTO;
import com.organizational.knowledge_gap_platform.entity.Employee;
import com.organizational.knowledge_gap_platform.entity.GapSnapshot;
import com.organizational.knowledge_gap_platform.entity.Role;
import com.organizational.knowledge_gap_platform.exception.EmployeeNotFoundException;
import com.organizational.knowledge_gap_platform.exception.RoleNotFoundException;
import com.organizational.knowledge_gap_platform.repository.EmployeeRepository;
import com.organizational.knowledge_gap_platform.repository.GapSnapshotRepository;
import com.organizational.knowledge_gap_platform.repository.RoleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class GapSnapshotServiceImpl implements GapSnapshotService {

    private static final Logger log = LoggerFactory.getLogger(GapSnapshotServiceImpl.class);

    private final EmployeeRepository employeeRepository;
    private final RoleRepository roleRepository;
    private final GapSnapshotRepository gapSnapshotRepository;
    private final GapAnalysisService gapAnalysisService;

    public GapSnapshotServiceImpl(EmployeeRepository employeeRepository,
                                   RoleRepository roleRepository,
                                   GapSnapshotRepository gapSnapshotRepository,
                                   GapAnalysisService gapAnalysisService) {
        this.employeeRepository = employeeRepository;
        this.roleRepository = roleRepository;
        this.gapSnapshotRepository = gapSnapshotRepository;
        this.gapAnalysisService = gapAnalysisService;
    }

    @Override
    @Transactional
    public GapSnapshotDTO captureSnapshot(Long employeeId, Long roleId) {

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EmployeeNotFoundException("Employee not found with id: " + employeeId));

        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RoleNotFoundException("Role not found with id: " + roleId));

        GapAnalysisResponseDTO gap = gapAnalysisService.analyzeGap(employeeId, roleId);

        LocalDate today = LocalDate.now();

        // Re-running a capture on the same day updates that day's row instead of duplicating it.
        GapSnapshot snapshot = gapSnapshotRepository
                .findByEmployeeIdAndRoleIdAndSnapshotDate(employeeId, roleId, today)
                .orElseGet(GapSnapshot::new);

        snapshot.setEmployee(employee);
        snapshot.setRole(role);
        snapshot.setTotalRequiredSkills(gap.getTotalRequiredSkills());
        snapshot.setMatchedSkillCount(gap.getMatchedSkillCount());
        snapshot.setMissingSkillCount(gap.getMissingSkillCount());
        snapshot.setGapPercentage(gap.getGapPercentage());
        snapshot.setSnapshotDate(today);

        GapSnapshot saved = gapSnapshotRepository.save(snapshot);
        return GapSnapshotDTO.fromEntity(saved);
    }

    @Override
    @Transactional
    public List<GapSnapshotDTO> captureSnapshotsForEmployee(Long employeeId) {

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EmployeeNotFoundException("Employee not found with id: " + employeeId));

        Set<Role> assignedRoles = employee.getUser().getRoles();

        if (assignedRoles == null || assignedRoles.isEmpty()) {
            return List.of();
        }

        return assignedRoles.stream()
                .map(role -> captureSnapshot(employeeId, role.getId()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void captureSnapshotsForAllEmployees() {

        List<Employee> employees = employeeRepository.findAll();
        int captured = 0;

        for (Employee employee : employees) {
            try {
                captureSnapshotsForEmployee(employee.getId());
                captured++;
            } catch (Exception ex) {
                // One employee's bad data (e.g. missing user link) shouldn't stop the rest of the run.
                log.warn("Skipping gap snapshot for employee {}: {}", employee.getId(), ex.getMessage());
            }
        }

        log.info("Captured gap snapshots for {}/{} employees", captured, employees.size());
    }

    @Override
    public List<GapSnapshotDTO> getHistory(Long employeeId, Long roleId) {
        return gapSnapshotRepository.findByEmployeeIdAndRoleIdOrderBySnapshotDateAsc(employeeId, roleId)
                .stream()
                .map(GapSnapshotDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<GapSnapshotDTO> getHistoryForEmployee(Long employeeId) {
        return gapSnapshotRepository.findByEmployeeIdOrderBySnapshotDateAsc(employeeId)
                .stream()
                .map(GapSnapshotDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Monthly org-wide capture so gap trends build up automatically even if nobody calls the
     * manual endpoints. Runs 1st of every month at 02:00. Configurable via app.gap-snapshot.cron.
     */
    @Scheduled(cron = "${app.gap-snapshot.cron:0 0 2 1 * ?}")
    public void scheduledMonthlySnapshot() {
        log.info("Running scheduled monthly gap snapshot capture");
        captureSnapshotsForAllEmployees();
    }
}
