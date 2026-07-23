package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.CreateRoleChangeRequestDTO;
import com.organizational.knowledge_gap_platform.dto.RoleChangeRequestResponse;
import com.organizational.knowledge_gap_platform.entity.RequestStatus;
import com.organizational.knowledge_gap_platform.entity.Role;
import com.organizational.knowledge_gap_platform.entity.RoleChangeRequest;
import com.organizational.knowledge_gap_platform.entity.User;
import com.organizational.knowledge_gap_platform.repository.RoleChangeRequestRepository;
import com.organizational.knowledge_gap_platform.repository.RoleRepository;
import com.organizational.knowledge_gap_platform.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class RoleChangeRequestServiceImpl implements RoleChangeRequestService {

    private final RoleChangeRequestRepository roleChangeRequestRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public RoleChangeRequestServiceImpl(RoleChangeRequestRepository roleChangeRequestRepository,
                                         UserRepository userRepository,
                                         RoleRepository roleRepository) {
        this.roleChangeRequestRepository = roleChangeRequestRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    @Override
    public RoleChangeRequestResponse createRequest(CreateRoleChangeRequestDTO dto) {

        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        Role requestedRole = roleRepository.findById(dto.getRequestedRoleId())
                .orElseThrow(() -> new NoSuchElementException("Requested role not found"));

        RoleChangeRequest request = new RoleChangeRequest();
        request.setUser(user);
        request.setRequestedRole(requestedRole);
        request.setReason(dto.getReason());
        request.setStatus(RequestStatus.PENDING);

        // Snapshot whatever role the user currently holds (if any)
        Role currentRole = user.getRoles().stream().findFirst().orElse(null);
        request.setCurrentRole(currentRole);

        RoleChangeRequest saved = roleChangeRequestRepository.save(request);

        return toResponse(saved);
    }

    @Override
    public List<RoleChangeRequestResponse> getAllRequests() {
        return roleChangeRequestRepository.findAllByOrderByRequestedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<RoleChangeRequestResponse> getPendingRequests() {
        return roleChangeRequestRepository.findByStatusOrderByRequestedAtDesc(RequestStatus.PENDING)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public long getPendingCount() {
        return roleChangeRequestRepository.countByStatus(RequestStatus.PENDING);
    }

    @Override
    public RoleChangeRequestResponse approveRequest(Long id, String reviewedBy) {

        RoleChangeRequest request = roleChangeRequestRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Request not found"));

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new IllegalStateException("Request has already been reviewed");
        }

        // Actually apply the role change to the user
        User user = request.getUser();
        user.getRoles().clear();
        user.getRoles().add(request.getRequestedRole());
        userRepository.save(user);

        request.setStatus(RequestStatus.APPROVED);
        request.setReviewedAt(LocalDateTime.now());
        request.setReviewedBy(reviewedBy);

        RoleChangeRequest saved = roleChangeRequestRepository.save(request);

        return toResponse(saved);
    }

    @Override
    public RoleChangeRequestResponse rejectRequest(Long id, String reviewedBy) {

        RoleChangeRequest request = roleChangeRequestRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Request not found"));

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new IllegalStateException("Request has already been reviewed");
        }

        request.setStatus(RequestStatus.REJECTED);
        request.setReviewedAt(LocalDateTime.now());
        request.setReviewedBy(reviewedBy);

        RoleChangeRequest saved = roleChangeRequestRepository.save(request);

        return toResponse(saved);
    }

    private RoleChangeRequestResponse toResponse(RoleChangeRequest request) {

        RoleChangeRequestResponse response = new RoleChangeRequestResponse();

        response.setId(request.getId());

        User user = request.getUser();
        response.setUserId(user.getId());
        response.setUserName(user.getName());
        response.setUserEmail(user.getEmail());

        Role currentRole = request.getCurrentRole();
        if (currentRole != null) {
            response.setCurrentRoleId(currentRole.getId());
            response.setCurrentRoleName(currentRole.getRoleName());
        }

        Role requestedRole = request.getRequestedRole();
        response.setRequestedRoleId(requestedRole.getId());
        response.setRequestedRoleName(requestedRole.getRoleName());

        response.setStatus(request.getStatus());
        response.setReason(request.getReason());
        response.setRequestedAt(request.getRequestedAt());
        response.setReviewedAt(request.getReviewedAt());
        response.setReviewedBy(request.getReviewedBy());

        return response;
    }
}