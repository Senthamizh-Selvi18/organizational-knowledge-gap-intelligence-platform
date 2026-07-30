package com.organizational.knowledge_gap_platform.repository;

import com.organizational.knowledge_gap_platform.entity.Notification;
import com.organizational.knowledge_gap_platform.entity.NotificationPriority;
import com.organizational.knowledge_gap_platform.entity.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long>,
        JpaSpecificationExecutor<Notification> {

    // ---- Existing methods (unchanged, still used by current features) ----

    List<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId, Pageable pageable);

    List<Notification> findByRecipientIdAndIsReadFalse(Long recipientId);

    long countByRecipientIdAndIsReadFalse(Long recipientId);

    // ---- New methods added for the full Notification Module ----

    /** Paginated view of everything for a user (Notification Center / "load more"). */
    Page<Notification> findByRecipientId(Long recipientId, Pageable pageable);

    /** Full unread list (not just a count) for the badge dropdown / unread tab. */
    List<Notification> findByRecipientIdAndIsReadFalseOrderByCreatedAtDesc(Long recipientId);

    /** All notifications for a user, used by "Clear All". */
    List<Notification> findByRecipientId(Long recipientId);

    /**
     * Used by NotificationScheduler and any auto-notification trigger to avoid
     * creating duplicate unread notifications for the same entity/type pair
     * (e.g. re-flagging the same expiring certification every night).
     */
    boolean existsByRecipientIdAndTypeAndRelatedEntityIdAndIsReadFalse(
            Long recipientId, NotificationType type, Long relatedEntityId);

    // Search/filter now goes through NotificationSpecifications + the inherited
    // findAll(Specification, Pageable) from JpaSpecificationExecutor — see
    // NotificationServiceImpl.searchNotifications(). The previous single JPQL
    // query with "(:param IS NULL OR column = :param)" guards caused PostgreSQL
    // to fail inferring bind-parameter types whenever a filter was left blank
    // (e.g. "function lower(bytea) does not exist", "could not determine data
    // type of parameter $11"). Specifications only add a predicate for filters
    // that are actually present, so no ambiguous null is ever bound.
}