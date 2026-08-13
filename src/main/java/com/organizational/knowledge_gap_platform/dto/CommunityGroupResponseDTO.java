package com.organizational.knowledge_gap_platform.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CommunityGroupResponseDTO {

    private Long id;
    private String name;
    private String description;
    private String category;
    private Long createdById;
    private String createdByName;
    private long memberCount;
    private boolean isMember;
    private LocalDateTime createdAt;
}