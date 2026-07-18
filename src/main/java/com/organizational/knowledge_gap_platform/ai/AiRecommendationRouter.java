package com.organizational.knowledge_gap_platform.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Picks whichever AiRecommendationClient bean matches app.ai.provider (defaults to "gemini")
 * and delegates to it. This is the single entry point services should depend on, so swapping
 * providers is a config change, not a code change.
 *
 * Spring autowires all AiRecommendationClient beans into this map, keyed by bean name
 * (see @Component("gemini") / @Component("openai") on the implementations).
 *
 * Deliberately does NOT implement AiRecommendationClient itself - doing so would make Spring
 * try to inject this router into its own map of clients, creating a circular dependency.
 */
@Component
public class AiRecommendationRouter {

    private final Map<String, AiRecommendationClient> clientsByProvider;

    @Value("${app.ai.provider:gemini}")
    private String provider;

    public AiRecommendationRouter(Map<String, AiRecommendationClient> clientsByProvider) {
        this.clientsByProvider = clientsByProvider;
    }

    public String generate(String prompt) {
        AiRecommendationClient client = clientsByProvider.get(provider.toLowerCase());

        if (client == null) {
            throw new AiRecommendationException(
                    "Unknown AI provider '" + provider + "'. Configure app.ai.provider as 'gemini' or 'openai'.");
        }

        return client.generate(prompt);
    }
}
