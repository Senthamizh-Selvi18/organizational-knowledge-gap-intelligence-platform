package com.organizational.knowledge_gap_platform.controller;

import com.organizational.knowledge_gap_platform.dto.ChatContactResponse;
import com.organizational.knowledge_gap_platform.dto.ChatConversationSummary;
import com.organizational.knowledge_gap_platform.dto.ChatMessageResponse;
import com.organizational.knowledge_gap_platform.dto.ChatSendRequest;
import com.organizational.knowledge_gap_platform.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping("/contacts")
    public ResponseEntity<List<ChatContactResponse>> getContacts() {
        return ResponseEntity.ok(chatService.getContacts());
    }

    @GetMapping("/conversation/{otherUserId}")
    public ResponseEntity<List<ChatMessageResponse>> getConversation(
            @PathVariable Long otherUserId) {
        return ResponseEntity.ok(chatService.getConversation(otherUserId));
    }

    @PostMapping("/send")
    public ResponseEntity<ChatMessageResponse> sendMessage(
            @RequestBody ChatSendRequest request) {
        return ResponseEntity.ok(chatService.sendMessage(request));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        return ResponseEntity.ok(Map.of("count", chatService.getUnreadCount()));
    }

    @PostMapping("/mark-read/{otherUserId}")
    public ResponseEntity<Void> markAsRead(@PathVariable Long otherUserId) {
        chatService.markConversationAsRead(otherUserId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/summaries")
    public ResponseEntity<List<ChatConversationSummary>> getSummaries() {
        return ResponseEntity.ok(chatService.getConversationSummaries());
    }
}