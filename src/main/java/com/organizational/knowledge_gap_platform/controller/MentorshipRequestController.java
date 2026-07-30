package com.organizational.knowledge_gap_platform.controller;

import com.organizational.knowledge_gap_platform.dto.MentorshipRequestCreateDTO;
import com.organizational.knowledge_gap_platform.dto.MentorshipRequestDecisionDTO;
import com.organizational.knowledge_gap_platform.dto.MentorshipRequestResponseDTO;
import com.organizational.knowledge_gap_platform.service.MentorshipRequestService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mentorship-requests")
public class MentorshipRequestController {

    private final MentorshipRequestService mentorshipRequestService;

    public MentorshipRequestController(MentorshipRequestService mentorshipRequestService) {
        this.mentorshipRequestService = mentorshipRequestService;
    }

    @PostMapping
    public ResponseEntity<MentorshipRequestResponseDTO> createRequest(
            @Valid @RequestBody MentorshipRequestCreateDTO request) {
        return ResponseEntity.ok(mentorshipRequestService.createRequest(request));
    }

    @GetMapping("/incoming")
    public ResponseEntity<List<MentorshipRequestResponseDTO>> listIncoming() {
        return ResponseEntity.ok(mentorshipRequestService.listIncomingRequests());
    }

    @GetMapping("/outgoing")
    public ResponseEntity<List<MentorshipRequestResponseDTO>> listOutgoing() {
        return ResponseEntity.ok(mentorshipRequestService.listOutgoingRequests());
    }

    @PutMapping("/{id}/respond")
    public ResponseEntity<MentorshipRequestResponseDTO> respond(
            @PathVariable Long id,
            @Valid @RequestBody MentorshipRequestDecisionDTO decision) {
        return ResponseEntity.ok(mentorshipRequestService.respondToRequest(id, decision));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<MentorshipRequestResponseDTO> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(mentorshipRequestService.cancelRequest(id));
    }
}
