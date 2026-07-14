package com.organizational.knowledge_gap_platform.controller;

import com.organizational.knowledge_gap_platform.dto.GapSnapshotDTO;
import com.organizational.knowledge_gap_platform.service.GapSnapshotService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/gap-snapshot")
public class GapSnapshotController {

    private final GapSnapshotService gapSnapshotService;

    public GapSnapshotController(GapSnapshotService gapSnapshotService) {
        this.gapSnapshotService = gapSnapshotService;
    }

    /** Manually capture today's snapshot for one employee/role pair. */
    @PostMapping("/employee/{employeeId}/role/{roleId}")
    public ResponseEntity<GapSnapshotDTO> captureSnapshot(
            @PathVariable Long employeeId,
            @PathVariable Long roleId) {

        return ResponseEntity.ok(gapSnapshotService.captureSnapshot(employeeId, roleId));
    }

    /** Manually capture today's snapshot for every role assigned to the employee. */
    @PostMapping("/employee/{employeeId}")
    public ResponseEntity<List<GapSnapshotDTO>> captureSnapshotsForEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(gapSnapshotService.captureSnapshotsForEmployee(employeeId));
    }

    /** Historical snapshots for one employee/role pair, oldest first. */
    @GetMapping("/employee/{employeeId}/role/{roleId}/history")
    public ResponseEntity<List<GapSnapshotDTO>> getHistory(
            @PathVariable Long employeeId,
            @PathVariable Long roleId) {

        return ResponseEntity.ok(gapSnapshotService.getHistory(employeeId, roleId));
    }

    /** Historical snapshots for an employee across all roles, oldest first. */
    @GetMapping("/employee/{employeeId}/history")
    public ResponseEntity<List<GapSnapshotDTO>> getHistoryForEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(gapSnapshotService.getHistoryForEmployee(employeeId));
    }
}
