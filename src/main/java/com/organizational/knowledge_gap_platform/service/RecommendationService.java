package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.RecommendationResponse;

public interface RecommendationService {

    RecommendationResponse getRecommendationsForUser(Long userId);
}