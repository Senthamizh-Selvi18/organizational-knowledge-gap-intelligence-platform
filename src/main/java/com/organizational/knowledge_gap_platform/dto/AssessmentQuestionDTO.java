package com.organizational.knowledge_gap_platform.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentQuestionDTO {

    private Long id;
    private Long skillId;
    private String skillName;
    private String questionText;
    private int ratingScaleMax;
    private int displayOrder;
}
