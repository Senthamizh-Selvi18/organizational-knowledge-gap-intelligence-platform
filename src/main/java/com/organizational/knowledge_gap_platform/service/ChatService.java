package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.ChatContactResponse;
import com.organizational.knowledge_gap_platform.dto.ChatConversationSummary;
import com.organizational.knowledge_gap_platform.dto.ChatMessageResponse;
import com.organizational.knowledge_gap_platform.dto.ChatSendRequest;
import com.organizational.knowledge_gap_platform.entity.ChatMessage;
import com.organizational.knowledge_gap_platform.entity.Role;
import com.organizational.knowledge_gap_platform.entity.User;
import com.organizational.knowledge_gap_platform.repository.ChatMessageRepository;
import com.organizational.knowledge_gap_platform.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;

    public ChatService(ChatMessageRepository chatMessageRepository,
                        UserRepository userRepository) {
        this.chatMessageRepository = chatMessageRepository;
        this.userRepository = userRepository;
    }

    /** Resolves the logged-in user from the JWT-authenticated security context. */
    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated()
                || "anonymousUser".equals(auth.getName())) {
            throw new RuntimeException(
                "No authenticated user found in security context — the JWT filter may not be applied to /chat/** endpoints. Check SecurityConfig."
            );
        }

        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found: " + email));
    }

    public ChatContactResponse getCurrentUserContact() {
        return toContact(getCurrentUser());
    }

    public List<ChatContactResponse> getContacts() {
        User me = getCurrentUser();
        return userRepository.findAll().stream()
                .filter(u -> !u.getId().equals(me.getId()))
                .map(this::toContact)
                .collect(Collectors.toList());
    }

    public List<ChatMessageResponse> getConversation(Long otherUserId) {
        User me = getCurrentUser();
        return chatMessageRepository.findConversation(me.getId(), otherUserId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ChatMessageResponse sendMessage(ChatSendRequest request) {
        User me = getCurrentUser();
        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        ChatMessage message = new ChatMessage();
        message.setSender(me);
        message.setReceiver(receiver);
        message.setMessage(request.getMessage());

        ChatMessage saved = chatMessageRepository.save(message);
        return toResponse(saved);
    }

    public long getUnreadCount() {
        User me = getCurrentUser();
        return chatMessageRepository.countByReceiver_IdAndIsReadFalse(me.getId());
    }

    public void markConversationAsRead(Long otherUserId) {
        User me = getCurrentUser();
        chatMessageRepository.markAsRead(me.getId(), otherUserId);
    }

    public List<ChatConversationSummary> getConversationSummaries() {
        User me = getCurrentUser();
        List<User> others = userRepository.findAll().stream()
                .filter(u -> !u.getId().equals(me.getId()))
                .collect(Collectors.toList());

        List<ChatConversationSummary> summaries = new ArrayList<>();
        for (User other : others) {
            List<ChatMessage> conv = chatMessageRepository.findConversationDesc(me.getId(), other.getId());
            if (conv.isEmpty()) continue;

            ChatMessage last = conv.get(0);
            long unread = chatMessageRepository.countByReceiver_IdAndSender_IdAndIsReadFalse(me.getId(), other.getId());

            ChatConversationSummary summary = new ChatConversationSummary();
            summary.setContactId(other.getId());
            summary.setContactName(other.getName());
            summary.setContactRole(getRoleName(other));
            summary.setLastMessage(last.getMessage());
            summary.setLastMessageAt(last.getSentAt());
            summary.setUnreadCount(unread);
            summaries.add(summary);
        }

        summaries.sort(Comparator.comparing(ChatConversationSummary::getLastMessageAt).reversed());
        return summaries;
    }

    private String getRoleName(User u) {
        if (u.getRoles() == null || u.getRoles().isEmpty()) return "employee";
        return u.getRoles().stream().map(Role::getRoleName).collect(Collectors.joining(", "));
    }

    private ChatContactResponse toContact(User u) {
        ChatContactResponse c = new ChatContactResponse();
        c.setId(u.getId());
        c.setName(u.getName());
        c.setEmail(u.getEmail());
        c.setRole(getRoleName(u));
        return c;
    }

    private ChatMessageResponse toResponse(ChatMessage m) {
        ChatMessageResponse r = new ChatMessageResponse();
        r.setId(m.getId());
        r.setSenderId(m.getSender().getId());
        r.setSenderName(m.getSender().getName());
        r.setReceiverId(m.getReceiver().getId());
        r.setReceiverName(m.getReceiver().getName());
        r.setMessage(m.getMessage());
        r.setSentAt(m.getSentAt());
        r.setRead(m.getIsRead());
        return r;
    }
}