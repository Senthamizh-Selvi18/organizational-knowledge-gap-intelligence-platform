package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.MentorProfileRequestDTO;
import com.organizational.knowledge_gap_platform.dto.MentorProfileResponseDTO;

import java.util.List;

public interface MentorProfileService {

    List<MentorProfileResponseDTO> listMentors(String expertise, boolean activeOnly);

    MentorProfileResponseDTO getMentorProfile(Long id);

    MentorProfileResponseDTO getMyProfile();

    MentorProfileResponseDTO upsertMyProfile(MentorProfileRequestDTO request);

    void deleteMyProfile();
}
