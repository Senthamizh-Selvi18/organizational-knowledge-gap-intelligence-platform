package com.organizational.knowledge_gap_platform.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GroupEventResponseDTO {

    private Long id;
    private Long groupId;
    private String title;
    private String description;
    private LocalDateTime eventDateTime;
    private String location;
    private Long createdById;
    private String createdByName;
    private LocalDateTime createdAt;
}