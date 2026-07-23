package com.organizational.knowledge_gap_platform.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "skill_taxonomy")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SkillTaxonomy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Taxonomy name cannot be empty")
    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "category")
    private String category;

    @Column(name = "description", length = 1000)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private SkillTaxonomy parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = false)
    private List<SkillTaxonomy> children = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "linked_skill_id")
    private Skill linkedSkill;

    @Column(name = "active")
    private Boolean active = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
        if (active == null) {
            active = true;
        }
    }
}
