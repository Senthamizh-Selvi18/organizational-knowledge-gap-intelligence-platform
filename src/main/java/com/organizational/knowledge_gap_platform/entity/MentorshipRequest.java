package com.organizational.knowledge_gap_platform.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "mentorship_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MentorshipRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "mentor_profile_id", nullable = false)
    private MentorProfile mentorProfile;

    @ManyToOne
    @JoinColumn(name = "mentee_id", nullable = false)
    private Employee mentee;

    @Column(length = 2000)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MentorshipRequestStatus status = MentorshipRequestStatus.PENDING;

    @Column(name = "response_note", length = 2000)
    private String responseNote;

    @Column(name = "requested_at", nullable = false)
    private LocalDateTime requestedAt;

    @Column(name = "responded_at")
    private LocalDateTime respondedAt;

    @PrePersist
    public void prePersist() {
        if (requestedAt == null) {
            requestedAt = LocalDateTime.now();
        }
    }
}