package com.organizational.knowledge_gap_platform.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

/**
 * Calls Google's Gemini API (generateContent) to produce learning recommendations.
 * Registered under the bean name "gemini" so the router in RecommendationServiceImpl
 * can pick it up based on the app.ai.provider property.
 */
@Component("gemini")
public class GeminiRecommendationClient implements AiRecommendationClient {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${app.ai.gemini.api-key:}")
    private String apiKey;

    @Value("${app.ai.gemini.model:gemini-1.5-flash}")
    private String model;

    public GeminiRecommendationClient(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    @Override
    public String generate(String prompt) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new AiRecommendationException("Gemini API key is not configured (app.ai.gemini.api-key)");
        }

        String url = "https://generativelanguage.googleapis.com/v1beta/models/"
                + model + ":generateContent?key=" + apiKey;

        ObjectNode part = objectMapper.createObjectNode();
        part.put("text", prompt);

        ArrayNode parts = objectMapper.createArrayNode();
        parts.add(part);

        ObjectNode content = objectMapper.createObjectNode();
        content.set("parts", parts);

        ArrayNode contents = objectMapper.createArrayNode();
        contents.add(content);

        ObjectNode body = objectMapper.createObjectNode();
        body.set("contents", contents);

        // Nudge the model toward deterministic, structured output.
        ObjectNode generationConfig = objectMapper.createObjectNode();
        generationConfig.put("temperature", 0.4);
        generationConfig.put("responseMimeType", "application/json");
        body.set("generationConfig", generationConfig);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> request = new HttpEntity<>(body.toString(), headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            return extractText(response.getBody());
        } catch (RestClientException ex) {
            throw new AiRecommendationException("Gemini API call failed: " + ex.getMessage(), ex);
        }
    }

    private String extractText(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode textNode = root.path("candidates").path(0)
                    .path("content").path("parts").path(0).path("text");

            if (textNode.isMissingNode() || textNode.isNull()) {
                throw new AiRecommendationException("Gemini response did not contain any text: " + responseBody);
            }
            return textNode.asText();
        } catch (AiRecommendationException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new AiRecommendationException("Failed to parse Gemini response: " + ex.getMessage(), ex);
        }
    }
}
