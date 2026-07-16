package com.organizational.knowledge_gap_platform.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "industry_benchmark")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class IndustryBenchmark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_taxonomy_id", nullable = false)
    private SkillTaxonomy skillTaxonomy;

    @Column(name = "industry_sector")
    private String industrySector;

    @Column(name = "role_category")
    private String roleCategory;

    @Enumerated(EnumType.STRING)
    @Column(name = "benchmark_level", nullable = false)
    private ProficiencyLevel benchmarkLevel;

    @Column(name = "source")
    private String source;

    @Column(name = "reference_date")
    private LocalDate referenceDate;

    @Column(name = "notes", length = 500)
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
