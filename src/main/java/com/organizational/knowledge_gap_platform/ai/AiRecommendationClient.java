package com.organizational.knowledge_gap_platform.ai;

/**
 * Abstraction over whichever LLM provider is generating learning recommendations.
 * Implementations should return the raw text produced by the model - the caller
 * (RecommendationServiceImpl) is responsible for parsing/validating that text.
 */
public interface AiRecommendationClient {

    /**
     * Sends the given prompt to the underlying model and returns its raw text response.
     *
     * @throws AiRecommendationException if the provider call fails for any reason
     *         (network error, non-2xx response, missing API key, etc.)
     */
    String generate(String prompt);
}
