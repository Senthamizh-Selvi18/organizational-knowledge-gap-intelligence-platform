package com.organizational.knowledge_gap_platform.controller;

import com.organizational.knowledge_gap_platform.dto.MentorshipSessionRequestDTO;
import com.organizational.knowledge_gap_platform.dto.MentorshipSessionResponseDTO;
import com.organizational.knowledge_gap_platform.dto.SessionStatusUpdateDTO;
import com.organizational.knowledge_gap_platform.service.MentorshipSessionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mentorship-sessions")
public class MentorshipSessionController {

    private final MentorshipSessionService mentorshipSessionService;

    public MentorshipSessionController(MentorshipSessionService mentorshipSessionService) {
        this.mentorshipSessionService = mentorshipSessionService;
    }

    @PostMapping
    public ResponseEntity<MentorshipSessionResponseDTO> bookSession(
            @Valid @RequestBody MentorshipSessionRequestDTO request) {
        return ResponseEntity.ok(mentorshipSessionService.bookSession(request));
    }

    @GetMapping("/me")
    public ResponseEntity<List<MentorshipSessionResponseDTO>> listMySessions() {
        return ResponseEntity.ok(mentorshipSessionService.listMySessions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MentorshipSessionResponseDTO> getSession(@PathVariable Long id) {
        return ResponseEntity.ok(mentorshipSessionService.getSession(id));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<MentorshipSessionResponseDTO> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody SessionStatusUpdateDTO update) {
        return ResponseEntity.ok(mentorshipSessionService.updateStatus(id, update));
    }
}
