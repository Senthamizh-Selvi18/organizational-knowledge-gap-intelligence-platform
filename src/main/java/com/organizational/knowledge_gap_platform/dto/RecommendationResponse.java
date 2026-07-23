package com.organizational.knowledge_gap_platform.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationResponse {

    private List<String> recommendations;
    private List<String> roadmap;
    private List<MissingSkillCoursesDto> externalCourses;
}