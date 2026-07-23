package com.organizational.knowledge_gap_platform.controller;

import com.organizational.knowledge_gap_platform.dto.SessionFeedbackRequestDTO;
import com.organizational.knowledge_gap_platform.dto.SessionFeedbackResponseDTO;
import com.organizational.knowledge_gap_platform.service.SessionFeedbackService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/session-feedback")
public class SessionFeedbackController {

    private final SessionFeedbackService sessionFeedbackService;

    public SessionFeedbackController(SessionFeedbackService sessionFeedbackService) {
        this.sessionFeedbackService = sessionFeedbackService;
    }

    @PostMapping("/{sessionId}")
    public ResponseEntity<SessionFeedbackResponseDTO> submitFeedback(
            @PathVariable Long sessionId,
            @Valid @RequestBody SessionFeedbackRequestDTO request) {
        return ResponseEntity.ok(sessionFeedbackService.submitFeedback(sessionId, request));
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<SessionFeedbackResponseDTO> getFeedbackForSession(@PathVariable Long sessionId) {
        return ResponseEntity.ok(sessionFeedbackService.getFeedbackForSession(sessionId));
    }

    @GetMapping("/mentor/{mentorProfileId}")
    public ResponseEntity<List<SessionFeedbackResponseDTO>> getFeedbackForMentor(
            @PathVariable Long mentorProfileId) {
        return ResponseEntity.ok(sessionFeedbackService.getFeedbackForMentor(mentorProfileId));
    }
}
