package com.organizational.knowledge_gap_platform.repository;

import com.organizational.knowledge_gap_platform.entity.Notification;
import com.organizational.knowledge_gap_platform.entity.NotificationPriority;
import com.organizational.knowledge_gap_platform.entity.NotificationType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


public final class NotificationSpecifications {

    private NotificationSpecifications() {
    }

    public static Specification<Notification> forSearch(Long recipientId,
                                                          NotificationType type,
                                                          NotificationPriority priority,
                                                          Boolean isRead,
                                                          String keyword,
                                                          LocalDateTime startDate,
                                                          LocalDateTime endDate) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Always scope to the requesting user.
            predicates.add(cb.equal(root.get("recipient").get("id"), recipientId));

            if (type != null) {
                predicates.add(cb.equal(root.get("type"), type));
            }

            if (priority != null) {
                predicates.add(cb.equal(root.get("priority"), priority));
            }

            if (isRead != null) {
                predicates.add(cb.equal(root.get("isRead"), isRead));
            }

            if (keyword != null && !keyword.isBlank()) {
                String pattern = "%" + keyword.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), pattern),
                        cb.like(cb.lower(root.get("message")), pattern)
                ));
            }

            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), startDate));
            }

            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), endDate));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}