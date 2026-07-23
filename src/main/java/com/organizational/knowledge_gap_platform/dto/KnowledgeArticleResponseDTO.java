package com.organizational.knowledge_gap_platform.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class KnowledgeArticleResponseDTO {

    private Long id;
    private String title;
    private String content;
    private String category;
    private String tags;
    private Long authorId;
    private String authorName;
    private Long viewCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
