package com.organizational.knowledge_gap_platform.repository;

import com.organizational.knowledge_gap_platform.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    @Query("""
            SELECT m FROM ChatMessage m
            WHERE (m.sender.id = :userId1 AND m.receiver.id = :userId2)
               OR (m.sender.id = :userId2 AND m.receiver.id = :userId1)
            ORDER BY m.sentAt ASC
            """)
    List<ChatMessage> findConversation(@Param("userId1") Long userId1,
                                        @Param("userId2") Long userId2);

    long countByReceiver_IdAndIsReadFalse(Long receiverId);

    long countByReceiver_IdAndSender_IdAndIsReadFalse(Long receiverId, Long senderId);

    @Query("""
            SELECT m FROM ChatMessage m
            WHERE (m.sender.id = :userId1 AND m.receiver.id = :userId2)
               OR (m.sender.id = :userId2 AND m.receiver.id = :userId1)
            ORDER BY m.sentAt DESC
            """)
    List<ChatMessage> findConversationDesc(@Param("userId1") Long userId1,
                                            @Param("userId2") Long userId2);

    @Modifying
    @Transactional
    @Query("""
            UPDATE ChatMessage m
            SET m.isRead = true
            WHERE m.receiver.id = :myId
              AND m.sender.id = :otherUserId
              AND m.isRead = false
            """)
    void markAsRead(@Param("myId") Long myId, @Param("otherUserId") Long otherUserId);
}