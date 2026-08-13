package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.*;

import java.util.List;

public interface CommunityGroupService {

    CommunityGroupResponseDTO createGroup(CommunityGroupRequestDTO request);

    List<CommunityGroupResponseDTO> listAllGroups();

    List<CommunityGroupResponseDTO> listMyGroups();

    CommunityGroupResponseDTO getGroup(Long groupId);

    void deleteGroup(Long groupId);

    void joinGroup(Long groupId);

    void leaveGroup(Long groupId);

    List<GroupMemberResponseDTO> listMembers(Long groupId);

    List<GroupPostResponseDTO> listPosts(Long groupId);

    GroupPostResponseDTO createPost(Long groupId, GroupPostRequestDTO request);

    void deletePost(Long groupId, Long postId);

    List<GroupEventResponseDTO> listEvents(Long groupId);

    GroupEventResponseDTO createEvent(Long groupId, GroupEventRequestDTO request);

    void deleteEvent(Long groupId, Long eventId);
}