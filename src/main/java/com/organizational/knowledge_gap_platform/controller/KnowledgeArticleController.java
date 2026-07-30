package com.organizational.knowledge_gap_platform.controller;

import com.organizational.knowledge_gap_platform.dto.KnowledgeArticleRequestDTO;
import com.organizational.knowledge_gap_platform.dto.KnowledgeArticleResponseDTO;
import com.organizational.knowledge_gap_platform.service.KnowledgeArticleService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/knowledge-base")
public class KnowledgeArticleController {

    private final KnowledgeArticleService knowledgeArticleService;

    public KnowledgeArticleController(KnowledgeArticleService knowledgeArticleService) {
        this.knowledgeArticleService = knowledgeArticleService;
    }

    @GetMapping
    public ResponseEntity<List<KnowledgeArticleResponseDTO>> listArticles(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(knowledgeArticleService.listArticles(category, search));
    }

    @GetMapping("/mine")
    public ResponseEntity<List<KnowledgeArticleResponseDTO>> listMyArticles() {
        return ResponseEntity.ok(knowledgeArticleService.listMyArticles());
    }

    @GetMapping("/{id}")
    public ResponseEntity<KnowledgeArticleResponseDTO> getArticle(@PathVariable Long id) {
        return ResponseEntity.ok(knowledgeArticleService.getArticle(id));
    }

    @PostMapping
    public ResponseEntity<KnowledgeArticleResponseDTO> createArticle(
            @Valid @RequestBody KnowledgeArticleRequestDTO request) {
        return ResponseEntity.ok(knowledgeArticleService.createArticle(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<KnowledgeArticleResponseDTO> updateArticle(
            @PathVariable Long id,
            @Valid @RequestBody KnowledgeArticleRequestDTO request) {
        return ResponseEntity.ok(knowledgeArticleService.updateArticle(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteArticle(@PathVariable Long id) {
        knowledgeArticleService.deleteArticle(id);
        return ResponseEntity.ok("Article deleted successfully.");
    }
}
