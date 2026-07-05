package com.organizational.knowledge_gap_platform.controller;
import jakarta.validation.Valid;
import com.organizational.knowledge_gap_platform.dto.ProfileResponseDTO;
import com.organizational.knowledge_gap_platform.dto.UpdateProfileRequestDTO;
import com.organizational.knowledge_gap_platform.service.ProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ProfileResponseDTO> getProfile(@PathVariable Long userId) {

        ProfileResponseDTO profile = profileService.getProfile(userId);

        if (profile == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(profile);
    }

    @PutMapping("/{userId}")
    public ResponseEntity<ProfileResponseDTO> updateProfile(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateProfileRequestDTO request) {

        ProfileResponseDTO updatedProfile = profileService.updateProfile(userId, request);

        if (updatedProfile == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(updatedProfile);
    }
}