package com.organizational.knowledge_gap_platform.controller;

import com.organizational.knowledge_gap_platform.dto.*;
import com.organizational.knowledge_gap_platform.service.CommunityGroupService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/community-groups")
public class CommunityGroupController {

    private final CommunityGroupService communityGroupService;

    public CommunityGroupController(CommunityGroupService communityGroupService) {
        this.communityGroupService = communityGroupService;
    }

    @PostMapping
    public ResponseEntity<CommunityGroupResponseDTO> createGroup(
            @Valid @RequestBody CommunityGroupRequestDTO request) {
        return ResponseEntity.ok(communityGroupService.createGroup(request));
    }

    @GetMapping
    public ResponseEntity<List<CommunityGroupResponseDTO>> listAllGroups() {
        return ResponseEntity.ok(communityGroupService.listAllGroups());
    }

    @GetMapping("/mine")
    public ResponseEntity<List<CommunityGroupResponseDTO>> listMyGroups() {
        return ResponseEntity.ok(communityGroupService.listMyGroups());
    }

    @GetMapping("/{groupId}")
    public ResponseEntity<CommunityGroupResponseDTO> getGroup(@PathVariable Long groupId) {
        return ResponseEntity.ok(communityGroupService.getGroup(groupId));
    }

    @DeleteMapping("/{groupId}")
    public ResponseEntity<String> deleteGroup(@PathVariable Long groupId) {
        communityGroupService.deleteGroup(groupId);
        return ResponseEntity.ok("Group deleted successfully.");
    }

    @PostMapping("/{groupId}/join")
    public ResponseEntity<String> joinGroup(@PathVariable Long groupId) {
        communityGroupService.joinGroup(groupId);
        return ResponseEntity.ok("Joined the group.");
    }

    @PostMapping("/{groupId}/leave")
    public ResponseEntity<String> leaveGroup(@PathVariable Long groupId) {
        communityGroupService.leaveGroup(groupId);
        return ResponseEntity.ok("Left the group.");
    }

    @GetMapping("/{groupId}/members")
    public ResponseEntity<List<GroupMemberResponseDTO>> listMembers(@PathVariable Long groupId) {
        return ResponseEntity.ok(communityGroupService.listMembers(groupId));
    }

    @GetMapping("/{groupId}/posts")
    public ResponseEntity<List<GroupPostResponseDTO>> listPosts(@PathVariable Long groupId) {
        return ResponseEntity.ok(communityGroupService.listPosts(groupId));
    }

    @PostMapping("/{groupId}/posts")
    public ResponseEntity<GroupPostResponseDTO> createPost(
            @PathVariable Long groupId, @Valid @RequestBody GroupPostRequestDTO request) {
        return ResponseEntity.ok(communityGroupService.createPost(groupId, request));
    }

    @DeleteMapping("/{groupId}/posts/{postId}")
    public ResponseEntity<String> deletePost(@PathVariable Long groupId, @PathVariable Long postId) {
        communityGroupService.deletePost(groupId, postId);
        return ResponseEntity.ok("Post deleted successfully.");
    }

    @GetMapping("/{groupId}/events")
    public ResponseEntity<List<GroupEventResponseDTO>> listEvents(@PathVariable Long groupId) {
        return ResponseEntity.ok(communityGroupService.listEvents(groupId));
    }

    @PostMapping("/{groupId}/events")
    public ResponseEntity<GroupEventResponseDTO> createEvent(
            @PathVariable Long groupId, @Valid @RequestBody GroupEventRequestDTO request) {
        return ResponseEntity.ok(communityGroupService.createEvent(groupId, request));
    }

    @DeleteMapping("/{groupId}/events/{eventId}")
    public ResponseEntity<String> deleteEvent(@PathVariable Long groupId, @PathVariable Long eventId) {
        communityGroupService.deleteEvent(groupId, eventId);
        return ResponseEntity.ok("Event deleted successfully.");
    }
}