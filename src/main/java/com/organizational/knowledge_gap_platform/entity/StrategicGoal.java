package com.organizational.knowledge_gap_platform.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "strategic_goal")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StrategicGoal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Goal name cannot be empty")
    @Column(name = "goal_name", nullable = false, unique = true)
    private String goalName;

    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "target_year")
    private Integer targetYear;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority")
    private GoalPriority priority = GoalPriority.MEDIUM;

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
        if (priority == null) {
            priority = GoalPriority.MEDIUM;
        }
    }
}
