package com.organizational.knowledge_gap_platform.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * A single self- or peer-submitted rating of an employee's proficiency in a skill.
 * Rows are never overwritten - each submission is kept so ratings can be tracked
 * over time, the same way GapSnapshot tracks gap history.
 */
@Entity
@Table(name = "skill_assessment")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SkillAssessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The employee being assessed. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    /** Who submitted the rating - same as employee for SELF, a colleague for PEER. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assessor_id", nullable = false)
    private Employee assessor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Column(name = "proficiency_level", nullable = false)
    private Integer proficiencyLevel;

    @Enumerated(EnumType.STRING)
    @Column(name = "assessment_type", nullable = false)
    private AssessmentType type;

    @Column(length = 500)
    private String comments;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
