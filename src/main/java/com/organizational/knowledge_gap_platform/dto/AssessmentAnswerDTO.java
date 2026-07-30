package com.organizational.knowledge_gap_platform.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentAnswerDTO {

    private Long questionId;
    private String questionText;
    private Long skillId;
    private String skillName;
    private int ratingScaleMax;
    private Integer rating;
    private String comment;
}
