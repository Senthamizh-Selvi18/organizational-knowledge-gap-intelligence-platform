package com.organizational.knowledge_gap_platform.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(
        name = "gap_snapshot",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"employee_id", "role_id", "snapshot_date"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GapSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @Column(name = "total_required_skills", nullable = false)
    private int totalRequiredSkills;

    @Column(name = "matched_skill_count", nullable = false)
    private int matchedSkillCount;

    @Column(name = "missing_skill_count", nullable = false)
    private int missingSkillCount;

    @Column(name = "gap_percentage", nullable = false)
    private double gapPercentage;

    @Column(name = "snapshot_date", nullable = false)
    private LocalDate snapshotDate;
}
