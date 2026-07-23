package com.organizational.knowledge_gap_platform.controller;

import com.organizational.knowledge_gap_platform.dto.MentorProfileRequestDTO;
import com.organizational.knowledge_gap_platform.dto.MentorProfileResponseDTO;
import com.organizational.knowledge_gap_platform.service.MentorProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mentors")
public class MentorProfileController {

    private final MentorProfileService mentorProfileService;

    public MentorProfileController(MentorProfileService mentorProfileService) {
        this.mentorProfileService = mentorProfileService;
    }

    @GetMapping
    public ResponseEntity<List<MentorProfileResponseDTO>> listMentors(
            @RequestParam(required = false) String expertise,
            @RequestParam(defaultValue = "true") boolean activeOnly) {
        return ResponseEntity.ok(mentorProfileService.listMentors(expertise, activeOnly));
    }

    @GetMapping("/me")
    public ResponseEntity<MentorProfileResponseDTO> getMyProfile() {
        return ResponseEntity.ok(mentorProfileService.getMyProfile());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MentorProfileResponseDTO> getMentorProfile(@PathVariable Long id) {
        return ResponseEntity.ok(mentorProfileService.getMentorProfile(id));
    }

    @PutMapping("/me")
    public ResponseEntity<MentorProfileResponseDTO> upsertMyProfile(
            @Valid @RequestBody MentorProfileRequestDTO request) {
        return ResponseEntity.ok(mentorProfileService.upsertMyProfile(request));
    }

    @DeleteMapping("/me")
    public ResponseEntity<String> deleteMyProfile() {
        mentorProfileService.deleteMyProfile();
        return ResponseEntity.ok("Mentor profile deleted successfully.");
    }
}
