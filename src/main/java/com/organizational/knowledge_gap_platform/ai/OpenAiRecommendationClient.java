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
 * Calls OpenAI's Chat Completions API to produce learning recommendations.
 * Registered under the bean name "openai" so the router in RecommendationServiceImpl
 * can pick it up based on the app.ai.provider property.
 */
@Component("openai")
public class OpenAiRecommendationClient implements AiRecommendationClient {

    private static final String URL = "https://api.openai.com/v1/chat/completions";

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${app.ai.openai.api-key:}")
    private String apiKey;

    @Value("${app.ai.openai.model:gpt-4o-mini}")
    private String model;

    public OpenAiRecommendationClient(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    @Override
    public String generate(String prompt) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new AiRecommendationException("OpenAI API key is not configured (app.ai.openai.api-key)");
        }

        ObjectNode systemMessage = objectMapper.createObjectNode();
        systemMessage.put("role", "system");
        systemMessage.put("content", "You are a corporate learning & development assistant. Always reply with valid JSON only, no markdown fences.");

        ObjectNode userMessage = objectMapper.createObjectNode();
        userMessage.put("role", "user");
        userMessage.put("content", prompt);

        ArrayNode messages = objectMapper.createArrayNode();
        messages.add(systemMessage);
        messages.add(userMessage);

        ObjectNode body = objectMapper.createObjectNode();
        body.put("model", model);
        body.put("temperature", 0.4);
        body.set("messages", messages);

        ObjectNode responseFormat = objectMapper.createObjectNode();
        responseFormat.put("type", "json_object");
        body.set("response_format", responseFormat);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        HttpEntity<String> request = new HttpEntity<>(body.toString(), headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(URL, request, String.class);
            return extractText(response.getBody());
        } catch (RestClientException ex) {
            throw new AiRecommendationException("OpenAI API call failed: " + ex.getMessage(), ex);
        }
    }

    private String extractText(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode textNode = root.path("choices").path(0).path("message").path("content");

            if (textNode.isMissingNode() || textNode.isNull()) {
                throw new AiRecommendationException("OpenAI response did not contain any content: " + responseBody);
            }
            return textNode.asText();
        } catch (AiRecommendationException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new AiRecommendationException("Failed to parse OpenAI response: " + ex.getMessage(), ex);
        }
    }
}
