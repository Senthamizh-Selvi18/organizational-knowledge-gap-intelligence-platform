package com.organizational.knowledge_gap_platform.repository;

import com.organizational.knowledge_gap_platform.entity.GapSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface GapSnapshotRepository extends JpaRepository<GapSnapshot, Long> {

    List<GapSnapshot> findByEmployeeIdAndRoleIdOrderBySnapshotDateAsc(Long employeeId, Long roleId);

    List<GapSnapshot> findByEmployeeIdOrderBySnapshotDateAsc(Long employeeId);

    Optional<GapSnapshot> findByEmployeeIdAndRoleIdAndSnapshotDate(
            Long employeeId, Long roleId, LocalDate snapshotDate);
}
