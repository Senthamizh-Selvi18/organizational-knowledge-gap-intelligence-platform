package com.organizational.knowledge_gap_platform.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "competency_goal_mapping", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"framework_id", "strategic_goal_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CompetencyGoalMapping {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "framework_id", nullable = false)
    private CompetencyFramework framework;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "strategic_goal_id", nullable = false)
    private StrategicGoal strategicGoal;

    @Column(name = "alignment_weight")
    private Double alignmentWeight = 100.0;

    @Column(name = "notes", length = 500)
    private String notes;
}
