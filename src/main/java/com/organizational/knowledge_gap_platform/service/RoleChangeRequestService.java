package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.CreateRoleChangeRequestDTO;
import com.organizational.knowledge_gap_platform.dto.RoleChangeRequestResponse;

import java.util.List;

public interface RoleChangeRequestService {

    RoleChangeRequestResponse createRequest(CreateRoleChangeRequestDTO dto);

    List<RoleChangeRequestResponse> getAllRequests();

    List<RoleChangeRequestResponse> getPendingRequests();

    long getPendingCount();

    RoleChangeRequestResponse approveRequest(Long id, String reviewedBy);

    RoleChangeRequestResponse rejectRequest(Long id, String reviewedBy);
}