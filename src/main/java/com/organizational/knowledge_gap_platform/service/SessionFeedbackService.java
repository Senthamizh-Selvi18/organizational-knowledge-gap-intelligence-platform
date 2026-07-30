package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.SessionFeedbackRequestDTO;
import com.organizational.knowledge_gap_platform.dto.SessionFeedbackResponseDTO;

import java.util.List;

public interface SessionFeedbackService {

    SessionFeedbackResponseDTO submitFeedback(Long sessionId, SessionFeedbackRequestDTO request);

    SessionFeedbackResponseDTO getFeedbackForSession(Long sessionId);

    List<SessionFeedbackResponseDTO> getFeedbackForMentor(Long mentorProfileId);
}
