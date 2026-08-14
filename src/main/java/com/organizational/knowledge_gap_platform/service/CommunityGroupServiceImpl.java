package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.*;
import com.organizational.knowledge_gap_platform.entity.*;
import com.organizational.knowledge_gap_platform.exception.CommunityGroupNotFoundException;
import com.organizational.knowledge_gap_platform.exception.EmployeeNotFoundException;
import com.organizational.knowledge_gap_platform.exception.GroupEventNotFoundException;
import com.organizational.knowledge_gap_platform.exception.GroupPostNotFoundException;
import com.organizational.knowledge_gap_platform.repository.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommunityGroupServiceImpl implements CommunityGroupService {

    private final CommunityGroupRepository communityGroupRepository;
    private final GroupMembershipRepository groupMembershipRepository;
    private final GroupPostRepository groupPostRepository;
    private final GroupEventRepository groupEventRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public CommunityGroupServiceImpl(CommunityGroupRepository communityGroupRepository,
                                      GroupMembershipRepository groupMembershipRepository,
                                      GroupPostRepository groupPostRepository,
                                      GroupEventRepository groupEventRepository,
                                      EmployeeRepository employeeRepository,
                                      UserRepository userRepository,
                                      NotificationService notificationService) {
        this.communityGroupRepository = communityGroupRepository;
        this.groupMembershipRepository = groupMembershipRepository;
        this.groupPostRepository = groupPostRepository;
        this.groupEventRepository = groupEventRepository;
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional
    public CommunityGroupResponseDTO createGroup(CommunityGroupRequestDTO request) {
        Employee employee = currentEmployee();

        CommunityGroup group = new CommunityGroup();
        group.setName(request.getName());
        group.setDescription(request.getDescription());
        group.setCategory(request.getCategory());
        group.setCreatedBy(employee);

        CommunityGroup saved = communityGroupRepository.save(group);

        GroupMembership ownerMembership = new GroupMembership();
        ownerMembership.setGroup(saved);
        ownerMembership.setMember(employee);
        ownerMembership.setRole(GroupMemberRole.OWNER);
        groupMembershipRepository.save(ownerMembership);

        return toDto(saved, employee);
    }

    @Override
    public List<CommunityGroupResponseDTO> listAllGroups() {
        Employee employee = currentEmployee();
        return communityGroupRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(g -> toDto(g, employee))
                .collect(Collectors.toList());
    }

    @Override
    public List<CommunityGroupResponseDTO> listMyGroups() {
        Employee employee = currentEmployee();
        return groupMembershipRepository.findByMember(employee)
                .stream()
                .map(m -> toDto(m.getGroup(), employee))
                .collect(Collectors.toList());
    }

    @Override
    public CommunityGroupResponseDTO getGroup(Long groupId) {
        Employee employee = currentEmployee();
        return toDto(findGroup(groupId), employee);
    }

    @Override
    @Transactional
    public void deleteGroup(Long groupId) {
        CommunityGroup group = findGroup(groupId);
        requireOwnerOrAdmin(group);

        // Delete all memberships first because they reference the community group
        groupMembershipRepository.deleteByGroup(group);

        // Now delete the community group
        communityGroupRepository.delete(group);
    }

    @Override
    @Transactional
    public void joinGroup(Long groupId) {
        CommunityGroup group = findGroup(groupId);
        Employee employee = currentEmployee();

        if (groupMembershipRepository.existsByGroupAndMember(group, employee)) {
            return;
        }

        GroupMembership membership = new GroupMembership();
        membership.setGroup(group);
        membership.setMember(employee);
        membership.setRole(GroupMemberRole.MEMBER);
        groupMembershipRepository.save(membership);

        User ownerUser = group.getCreatedBy().getUser();

        if (ownerUser != null && !ownerUser.getId().equals(employee.getUser().getId())) {
            try {
                notificationService.createNotification(
                        ownerUser.getId(),
                        "COMMUNITY_GROUP",
                        "New member joined " + group.getName(),
                        employeeName(employee) + " joined your community group.",
                        "LOW",
                        "/dashboard/community-groups/" + group.getId(),
                        group.getId());
            } catch (Exception ex) {
                System.out.println("### joinGroup() notification failed: " + ex.getMessage());
            }
        }
    }

    @Override
    @Transactional
    public void leaveGroup(Long groupId) {
        CommunityGroup group = findGroup(groupId);
        Employee employee = currentEmployee();

        GroupMembership membership = groupMembershipRepository
                .findByGroupAndMember(group, employee)
                .orElseThrow(() ->
                        new AccessDeniedException("You are not a member of this group."));

        if (membership.getRole() == GroupMemberRole.OWNER) {
            throw new IllegalStateException(
                    "The group owner can't leave. Delete the group instead if you want to close it.");
        }

        groupMembershipRepository.delete(membership);
    }

    @Override
    public List<GroupMemberResponseDTO> listMembers(Long groupId) {
        CommunityGroup group = findGroup(groupId);

        return groupMembershipRepository
                .findByGroupOrderByJoinedAtAsc(group)
                .stream()
                .map(this::toMemberDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<GroupPostResponseDTO> listPosts(Long groupId) {
        CommunityGroup group = findGroup(groupId);

        return groupPostRepository
                .findByGroupOrderByCreatedAtDesc(group)
                .stream()
                .map(this::toPostDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public GroupPostResponseDTO createPost(Long groupId, GroupPostRequestDTO request) {
        CommunityGroup group = findGroup(groupId);
        Employee employee = currentEmployee();

        requireMember(group, employee);

        GroupPost post = new GroupPost();
        post.setGroup(group);
        post.setAuthor(employee);
        post.setContent(request.getContent());

        GroupPost saved = groupPostRepository.save(post);

        notifyOtherMembers(
                group,
                employee,
                "New post in " + group.getName(),
                employeeName(employee) + " posted: " +
                        (request.getContent().length() > 80
                                ? request.getContent().substring(0, 80) + "..."
                                : request.getContent())
        );

        return toPostDto(saved);
    }

    @Override
    @Transactional
    public void deletePost(Long groupId, Long postId) {
        CommunityGroup group = findGroup(groupId);

        GroupPost post = groupPostRepository.findById(postId)
                .orElseThrow(() ->
                        new GroupPostNotFoundException(
                                "Post not found with id: " + postId));

        if (!post.getGroup().getId().equals(group.getId())) {
            throw new GroupPostNotFoundException(
                    "Post not found in this group.");
        }

        requireAuthorOrGroupOwnerOrAdmin(group, post.getAuthor());

        groupPostRepository.delete(post);
    }

    @Override
    public List<GroupEventResponseDTO> listEvents(Long groupId) {
        CommunityGroup group = findGroup(groupId);

        return groupEventRepository
                .findByGroupOrderByEventDateTimeAsc(group)
                .stream()
                .map(this::toEventDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public GroupEventResponseDTO createEvent(
            Long groupId,
            GroupEventRequestDTO request) {

        CommunityGroup group = findGroup(groupId);
        Employee employee = currentEmployee();

        requireMember(group, employee);

        GroupEvent event = new GroupEvent();
        event.setGroup(group);
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setEventDateTime(request.getEventDateTime());
        event.setLocation(request.getLocation());
        event.setCreatedBy(employee);

        GroupEvent saved = groupEventRepository.save(event);

        notifyOtherMembers(
                group,
                employee,
                "New event in " + group.getName(),
                employeeName(employee) +
                        " scheduled \"" +
                        request.getTitle() +
                        "\"."
        );

        return toEventDto(saved);
    }

    @Override
    @Transactional
    public void deleteEvent(Long groupId, Long eventId) {
        CommunityGroup group = findGroup(groupId);

        GroupEvent event = groupEventRepository.findById(eventId)
                .orElseThrow(() ->
                        new GroupEventNotFoundException(
                                "Event not found with id: " + eventId));

        if (!event.getGroup().getId().equals(group.getId())) {
            throw new GroupEventNotFoundException(
                    "Event not found in this group.");
        }

        requireAuthorOrGroupOwnerOrAdmin(
                group,
                event.getCreatedBy());

        groupEventRepository.delete(event);
    }

    // ---------- helpers ----------

    private void notifyOtherMembers(
            CommunityGroup group,
            Employee actor,
            String title,
            String message) {

        List<GroupMembership> members =
                groupMembershipRepository.findByGroupOrderByJoinedAtAsc(group);

        for (GroupMembership m : members) {

            Employee memberEmployee = m.getMember();

            if (memberEmployee.getId().equals(actor.getId())) {
                continue;
            }

            User memberUser = memberEmployee.getUser();

            if (memberUser == null) {
                continue;
            }

            try {
                notificationService.createNotification(
                        memberUser.getId(),
                        "COMMUNITY_GROUP",
                        title,
                        message,
                        "LOW",
                        "/dashboard/community-groups/" + group.getId(),
                        group.getId()
                );
            } catch (Exception ex) {
                System.out.println(
                        "### notifyOtherMembers() failed for user "
                                + memberUser.getId()
                                + ": "
                                + ex.getMessage()
                );
            }
        }
    }

    private CommunityGroup findGroup(Long groupId) {
        return communityGroupRepository.findById(groupId)
                .orElseThrow(() ->
                        new CommunityGroupNotFoundException(
                                "Group not found with id: " + groupId));
    }

    private void requireMember(
            CommunityGroup group,
            Employee employee) {

        if (!groupMembershipRepository
                .existsByGroupAndMember(group, employee)) {

            throw new AccessDeniedException(
                    "You must join this group first.");
        }
    }

    private void requireOwnerOrAdmin(CommunityGroup group) {

        Employee employee = currentEmployee();

        boolean isOwner =
                group.getCreatedBy()
                        .getId()
                        .equals(employee.getId());

        if (!isOwner && !isSystemAdmin()) {
            throw new AccessDeniedException(
                    "Only the group owner can do this.");
        }
    }

    private void requireAuthorOrGroupOwnerOrAdmin(
            CommunityGroup group,
            Employee author) {

        Employee employee = currentEmployee();

        boolean isAuthor =
                author.getId().equals(employee.getId());

        boolean isGroupOwner =
                group.getCreatedBy()
                        .getId()
                        .equals(employee.getId());

        if (!isAuthor && !isGroupOwner && !isSystemAdmin()) {
            throw new AccessDeniedException(
                    "You don't have permission to do this.");
        }
    }

    private boolean isSystemAdmin() {

        return SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a ->
                        a.equalsIgnoreCase("ROLE_ADMIN"));
    }

    private String employeeName(Employee employee) {

        return employee.getUser() != null
                ? employee.getUser().getName()
                : "Someone";
    }

    private CommunityGroupResponseDTO toDto(
            CommunityGroup group,
            Employee viewer) {

        CommunityGroupResponseDTO dto =
                new CommunityGroupResponseDTO();

        dto.setId(group.getId());
        dto.setName(group.getName());
        dto.setDescription(group.getDescription());
        dto.setCategory(group.getCategory());

        dto.setCreatedById(
                group.getCreatedBy().getId());

        dto.setCreatedByName(
                employeeName(group.getCreatedBy()));

        dto.setMemberCount(
                groupMembershipRepository.countByGroup(group));

        dto.setMember(
                groupMembershipRepository
                        .existsByGroupAndMember(group, viewer));

        dto.setCreatedAt(group.getCreatedAt());

        return dto;
    }

    private GroupMemberResponseDTO toMemberDto(
            GroupMembership membership) {

        Employee employee = membership.getMember();

        GroupMemberResponseDTO dto =
                new GroupMemberResponseDTO();

        dto.setEmployeeId(employee.getId());
        dto.setEmployeeName(employeeName(employee));
        dto.setDepartment(employee.getDepartment());
        dto.setDesignation(employee.getDesignation());
        dto.setRole(membership.getRole());
        dto.setJoinedAt(membership.getJoinedAt());

        return dto;
    }

    private GroupPostResponseDTO toPostDto(
            GroupPost post) {

        GroupPostResponseDTO dto =
                new GroupPostResponseDTO();

        dto.setId(post.getId());
        dto.setGroupId(post.getGroup().getId());
        dto.setAuthorId(post.getAuthor().getId());
        dto.setAuthorName(employeeName(post.getAuthor()));
        dto.setContent(post.getContent());
        dto.setCreatedAt(post.getCreatedAt());

        return dto;
    }

    private GroupEventResponseDTO toEventDto(
            GroupEvent event) {

        GroupEventResponseDTO dto =
                new GroupEventResponseDTO();

        dto.setId(event.getId());
        dto.setGroupId(event.getGroup().getId());
        dto.setTitle(event.getTitle());
        dto.setDescription(event.getDescription());
        dto.setEventDateTime(event.getEventDateTime());
        dto.setLocation(event.getLocation());
        dto.setCreatedById(event.getCreatedBy().getId());
        dto.setCreatedByName(
                employeeName(event.getCreatedBy()));
        dto.setCreatedAt(event.getCreatedAt());

        return dto;
    }

    private Employee currentEmployee() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new EmployeeNotFoundException(
                                "Logged-in user not found."));

        return employeeRepository.findByUser(user)
                .orElseThrow(() ->
                        new EmployeeNotFoundException(
                                "No employee record linked to the logged-in user."));
    }
}