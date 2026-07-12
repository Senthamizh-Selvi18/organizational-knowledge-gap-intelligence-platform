package com.organizational.knowledge_gap_platform.repository;

import com.organizational.knowledge_gap_platform.entity.Notification;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId, Pageable pageable);

    List<Notification> findByRecipientIdAndIsReadFalse(Long recipientId);

    long countByRecipientIdAndIsReadFalse(Long recipientId);
}