package com.organizational.knowledge_gap_platform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GroupEventRequestDTO {

    @NotBlank(message = "Event title is required")
    private String title;

    private String description;

    @NotNull(message = "Event date and time is required")
    private LocalDateTime eventDateTime;

    private String location;
}