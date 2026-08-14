package com.organizational.knowledge_gap_platform.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GroupPostResponseDTO {

    private Long id;
    private Long groupId;
    private Long authorId;
    private String authorName;
    private String content;
    private LocalDateTime createdAt;
}