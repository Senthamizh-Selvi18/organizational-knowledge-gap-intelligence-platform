package com.organizational.knowledge_gap_platform.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "learning_enrollment")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LearningEnrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "training_id", nullable = false)
    private InternalTraining training;

    @Column(nullable = false)
    private Integer progress = 0;

    @Column(nullable = false)
    private String status = "ENROLLED";

    @Column(name = "enrolled_date")
    private LocalDate enrolledDate;

    @Column(name = "completed_date")
    private LocalDate completedDate;

    @PrePersist
    public void onCreate() {
        if (enrolledDate == null) {
            enrolledDate = LocalDate.now();
        }

        if (progress == null) {
            progress = 0;
        }

        if (status == null) {
            status = "ENROLLED";
        }
    }
}