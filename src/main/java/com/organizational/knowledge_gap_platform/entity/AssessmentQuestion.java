package com.organizational.knowledge_gap_platform.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Table(name = "assessment_question")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private AssessmentTemplate template;

    // Optional link to the skill this question measures, used to feed
    // ratings back into EmployeeSkill proficiency and gap recalculation.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_id")
    private Skill skill;

    @NotBlank(message = "Question text cannot be empty")
    @Size(max = 500, message = "Question text must be at most 500 characters")
    @Column(name = "question_text", nullable = false, length = 500)
    private String questionText;

    @Column(name = "rating_scale_max", nullable = false)
    private int ratingScaleMax = 5;

    @Column(name = "display_order", nullable = false)
    private int displayOrder = 0;
}
