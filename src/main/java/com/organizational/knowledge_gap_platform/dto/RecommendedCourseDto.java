package com.organizational.knowledge_gap_platform.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RecommendedCourseDto {

    private String title;
    private String provider;
    private String url;
    private String difficulty;
    private String duration;
    private String description;
}