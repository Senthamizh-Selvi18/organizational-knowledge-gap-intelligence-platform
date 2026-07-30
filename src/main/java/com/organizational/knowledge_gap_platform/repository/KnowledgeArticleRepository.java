package com.organizational.knowledge_gap_platform.repository;

import com.organizational.knowledge_gap_platform.entity.Employee;
import com.organizational.knowledge_gap_platform.entity.KnowledgeArticle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KnowledgeArticleRepository extends JpaRepository<KnowledgeArticle, Long> {

    List<KnowledgeArticle> findAllByOrderByCreatedAtDesc();

    List<KnowledgeArticle> findByCategoryIgnoreCaseOrderByCreatedAtDesc(String category);

    List<KnowledgeArticle> findByAuthorOrderByCreatedAtDesc(Employee author);

    List<KnowledgeArticle> findByTitleContainingIgnoreCaseOrTagsContainingIgnoreCaseOrderByCreatedAtDesc(
            String title, String tags);
}
