package com.organizational.knowledge_gap_platform.controller;

import com.organizational.knowledge_gap_platform.dto.RecommendationResponse;
import com.organizational.knowledge_gap_platform.service.RecommendationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/recommendation")
public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<RecommendationResponse> getRecommendation(@PathVariable Long userId) {

        RecommendationResponse response =
                recommendationService.getRecommendationsForUser(userId);

        return ResponseEntity.ok(response);
    }
}