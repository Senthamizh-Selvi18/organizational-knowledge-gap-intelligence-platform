package com.organizational.knowledge_gap_platform.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChatConversationSummary {
    private Long contactId;
    private String contactName;
    private String contactRole;
    private String lastMessage;
    private LocalDateTime lastMessageAt;
    private long unreadCount;
}