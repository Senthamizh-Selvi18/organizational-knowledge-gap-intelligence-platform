package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.MentorshipRequestCreateDTO;
import com.organizational.knowledge_gap_platform.dto.MentorshipRequestDecisionDTO;
import com.organizational.knowledge_gap_platform.dto.MentorshipRequestResponseDTO;

import java.util.List;

public interface MentorshipRequestService {

    MentorshipRequestResponseDTO createRequest(MentorshipRequestCreateDTO request);

    List<MentorshipRequestResponseDTO> listIncomingRequests();

    List<MentorshipRequestResponseDTO> listOutgoingRequests();

    MentorshipRequestResponseDTO respondToRequest(Long requestId, MentorshipRequestDecisionDTO decision);

    MentorshipRequestResponseDTO cancelRequest(Long requestId);
}
