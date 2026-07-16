package com.organizational.knowledge_gap_platform.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Table(name = "internal_training")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InternalTraining {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Title cannot be empty")
    @Size(max = 255, message = "Title must be at most 255 characters")
    @Column(name = "title", nullable = false)
    private String title;

    @NotBlank(message = "Skill name cannot be empty")
    @Size(max = 100, message = "Skill name must be at most 100 characters")
    @Column(name = "skill_name", nullable = false)
    private String skillName;

    @NotBlank(message = "Category cannot be empty")
    @Size(max = 100, message = "Category must be at most 100 characters")
    @Column(name = "category", nullable = false)
    private String category;

    @NotBlank(message = "Trainer cannot be empty")
    @Size(max = 100, message = "Trainer must be at most 100 characters")
    @Column(name = "trainer", nullable = false)
    private String trainer;

    @NotBlank(message = "Mode cannot be empty")
    @Pattern(regexp = "Online|Offline|Hybrid", message = "Mode must be Online, Offline or Hybrid")
    @Column(name = "mode", nullable = false)
    private String mode;

    @NotBlank(message = "Duration cannot be empty")
    @Size(max = 50, message = "Duration must be at most 50 characters")
    @Column(name = "duration", nullable = false)
    private String duration;

    @Size(max = 1000, message = "Description must be at most 1000 characters")
    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "mandatory", nullable = false)
    private boolean mandatory = false;

    @Column(name = "active", nullable = false)
    private boolean active = true;
}
