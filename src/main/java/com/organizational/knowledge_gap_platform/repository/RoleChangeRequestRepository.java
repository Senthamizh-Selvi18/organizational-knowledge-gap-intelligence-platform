package com.organizational.knowledge_gap_platform.repository;

import com.organizational.knowledge_gap_platform.entity.RequestStatus;
import com.organizational.knowledge_gap_platform.entity.RoleChangeRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoleChangeRequestRepository extends JpaRepository<RoleChangeRequest, Long> {

    List<RoleChangeRequest> findByStatusOrderByRequestedAtDesc(RequestStatus status);

    long countByStatus(RequestStatus status);

    List<RoleChangeRequest> findAllByOrderByRequestedAtDesc();
}