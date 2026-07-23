package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.MentorshipSessionRequestDTO;
import com.organizational.knowledge_gap_platform.dto.MentorshipSessionResponseDTO;
import com.organizational.knowledge_gap_platform.dto.SessionStatusUpdateDTO;

import java.util.List;

public interface MentorshipSessionService {

    MentorshipSessionResponseDTO bookSession(MentorshipSessionRequestDTO request);

    List<MentorshipSessionResponseDTO> listMySessions();

    MentorshipSessionResponseDTO getSession(Long sessionId);

    MentorshipSessionResponseDTO updateStatus(Long sessionId, SessionStatusUpdateDTO update);
}
