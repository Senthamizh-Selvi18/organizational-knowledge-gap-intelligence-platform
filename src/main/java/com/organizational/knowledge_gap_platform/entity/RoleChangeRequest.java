package com.organizational.knowledge_gap_platform.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "role_change_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RoleChangeRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The user whose role is being changed
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Snapshot of the role the user had at the time the request was raised
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "current_role_id")
    private Role currentRole;

    // The role being requested for the user
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_role_id", nullable = false)
    private Role requestedRole;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private RequestStatus status = RequestStatus.PENDING;

    @Column(name = "reason")
    private String reason;

    @Column(name = "requested_at")
    private LocalDateTime requestedAt;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    // Username/email of the admin who approved or rejected this request
    @Column(name = "reviewed_by")
    private String reviewedBy;

    @PrePersist
    public void onCreate() {
        requestedAt = LocalDateTime.now();
        if (status == null) {
            status = RequestStatus.PENDING;
        }
    }
}