package com.organizational.knowledge_gap_platform.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "role_skill_requirement",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"role_id", "skill_id"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RoleSkillRequirement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Column(name = "required_proficiency_level", nullable = false)
    private Integer requiredProficiencyLevel;
}