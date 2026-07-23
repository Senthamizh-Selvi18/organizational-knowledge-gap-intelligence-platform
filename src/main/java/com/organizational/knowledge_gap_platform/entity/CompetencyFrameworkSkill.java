package com.organizational.knowledge_gap_platform.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "competency_framework_skill")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CompetencyFrameworkSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "framework_id", nullable = false)
    private CompetencyFramework framework;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_taxonomy_id", nullable = false)
    private SkillTaxonomy skillTaxonomy;

    @Enumerated(EnumType.STRING)
    @Column(name = "required_level", nullable = false)
    private ProficiencyLevel requiredLevel;

    @Column(name = "weight")
    private Double weight = 1.0;

    @Column(name = "notes", length = 500)
    private String notes;
}
