package com.organizational.knowledge_gap_platform.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChatSendRequest {
    private Long receiverId;
    private String message;
}