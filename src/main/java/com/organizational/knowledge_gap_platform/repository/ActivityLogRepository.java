package com.organizational.knowledge_gap_platform.repository;

import com.organizational.knowledge_gap_platform.entity.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    List<ActivityLog> findTop10ByEmployeeIdOrderByCreatedAtDesc(Long employeeId);

    @Modifying
    @Query("DELETE FROM ActivityLog a WHERE a.employee.id = :employeeId")
    void deleteByEmployeeId(@Param("employeeId") Long employeeId);
}
