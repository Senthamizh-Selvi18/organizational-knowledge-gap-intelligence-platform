package com.organizational.knowledge_gap_platform.controller;

import com.organizational.knowledge_gap_platform.dto.TeamBuilderRecommendationDTO;
import com.organizational.knowledge_gap_platform.dto.TeamBuilderRequestDTO;
import com.organizational.knowledge_gap_platform.service.TeamBuilderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/team-builder")
@PreAuthorize("hasAnyRole('ADMIN', 'HR')")
public class TeamBuilderController {

    private final TeamBuilderService teamBuilderService;

    public TeamBuilderController(TeamBuilderService teamBuilderService) {
        this.teamBuilderService = teamBuilderService;
    }

    @PostMapping("/recommend")
    public ResponseEntity<List<TeamBuilderRecommendationDTO>> recommendTeam(
            @Valid @RequestBody TeamBuilderRequestDTO request) {
        return ResponseEntity.ok(teamBuilderService.recommendTeam(request));
    }
}