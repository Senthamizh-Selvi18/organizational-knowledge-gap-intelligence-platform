package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.KnowledgeArticleRequestDTO;
import com.organizational.knowledge_gap_platform.dto.KnowledgeArticleResponseDTO;

import java.util.List;

public interface KnowledgeArticleService {

    List<KnowledgeArticleResponseDTO> listArticles(String category, String search);

    List<KnowledgeArticleResponseDTO> listMyArticles();

    KnowledgeArticleResponseDTO getArticle(Long id);

    KnowledgeArticleResponseDTO createArticle(KnowledgeArticleRequestDTO request);

    KnowledgeArticleResponseDTO updateArticle(Long id, KnowledgeArticleRequestDTO request);

    void deleteArticle(Long id);
}
