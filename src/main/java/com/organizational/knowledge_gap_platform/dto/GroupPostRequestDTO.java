package com.organizational.knowledge_gap_platform.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GroupPostRequestDTO {

    @NotBlank(message = "Post content is required")
    private String content;
}