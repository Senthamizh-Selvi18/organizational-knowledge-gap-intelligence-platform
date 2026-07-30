package com.organizational.knowledge_gap_platform.ai;

/**
 * Thrown when a call to an AI provider (Gemini/OpenAI) fails or returns something
 * we cannot use. Callers should catch this and fall back to rule-based recommendations
 * rather than letting the whole request fail.
 */
public class AiRecommendationException extends RuntimeException {

    public AiRecommendationException(String message) {
        super(message);
    }

    public AiRecommendationException(String message, Throwable cause) {
        super(message, cause);
    }
}
