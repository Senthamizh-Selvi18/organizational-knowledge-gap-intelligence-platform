package com.organizational.knowledge_gap_platform.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "competency_framework")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CompetencyFramework {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Framework name cannot be empty")
    @Column(name = "framework_name", nullable = false)
    private String frameworkName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id")
    private Role role;

    @Column(name = "department")
    private String department;

    @Column(name = "description", length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private FrameworkStatus status = FrameworkStatus.DRAFT;

    @Column(name = "version_group_id", nullable = false)
    private String versionGroupId;

    @Column(name = "version_number", nullable = false)
    private Integer versionNumber = 1;

    @Column(name = "is_current_version", nullable = false)
    private Boolean isCurrentVersion = true;

    @Column(name = "industry_benchmark_source")
    private String industryBenchmarkSource;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "framework", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<CompetencyFrameworkSkill> skills = new ArrayList<>();

    @OneToMany(mappedBy = "framework", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<CompetencyGoalMapping> goalMappings = new ArrayList<>();

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = FrameworkStatus.DRAFT;
        }
        if (versionNumber == null) {
            versionNumber = 1;
        }
        if (isCurrentVersion == null) {
            isCurrentVersion = true;
        }
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
