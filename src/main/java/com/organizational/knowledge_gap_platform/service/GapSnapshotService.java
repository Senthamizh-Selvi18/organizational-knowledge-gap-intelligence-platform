package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.GapSnapshotDTO;

import java.util.List;

public interface GapSnapshotService {

    /** Captures (or updates, if one already exists for today) a snapshot for one employee/role pair. */
    GapSnapshotDTO captureSnapshot(Long employeeId, Long roleId);

    /** Captures snapshots for every role currently assigned to the employee. */
    List<GapSnapshotDTO> captureSnapshotsForEmployee(Long employeeId);

    /** Captures snapshots for every employee/role combination in the system. Used by the scheduled job. */
    void captureSnapshotsForAllEmployees();

    /** Full history for one employee/role pair, oldest first. */
    List<GapSnapshotDTO> getHistory(Long employeeId, Long roleId);

    /** Full history for an employee across all roles, oldest first. */
    List<GapSnapshotDTO> getHistoryForEmployee(Long employeeId);
}
