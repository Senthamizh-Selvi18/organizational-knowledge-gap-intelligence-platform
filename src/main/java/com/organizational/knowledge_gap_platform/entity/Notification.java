package com.organizational.knowledge_gap_platform.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 1000)
    private String message;

    @Column(name = "related_entity_id")
    private Long relatedEntityId;

    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;

    // NEW: priority level, defaults to MEDIUM so existing rows/inserts keep working
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private NotificationPriority priority = NotificationPriority.MEDIUM;

    // NEW: optional deep link the frontend can navigate to when the notification is clicked
    @Column(name = "action_url", length = 500)
    private String actionUrl;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (priority == null) {
            priority = NotificationPriority.MEDIUM;
        }
    }
}