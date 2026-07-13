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
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;

    private static final Set<String> HIGHER_ROLES =
            Set.of("admin", "hr", "manager", "team lead");

    public ChatService(ChatMessageRepository chatMessageRepository,
                        UserRepository userRepository) {
        this.chatMessageRepository = chatMessageRepository;
        this.userRepository = userRepository;
    }

    public User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Logged in user not found"));
    }

    private Set<String> normalizedRoles(User user) {
        return user.getRoles().stream()
                .map(Role::getRoleName)
                .filter(r -> r != null)
                .map(r -> r.trim().toLowerCase())
                .collect(Collectors.toSet());
    }

    private boolean isHigherOfficial(Set<String> roles) {
        return roles.stream().anyMatch(HIGHER_ROLES::contains);
    }

    private boolean canChat(Set<String> myRoles, Set<String> otherRoles) {
        if (isHigherOfficial(myRoles)) {
            return true;
        }
        if (myRoles.contains("employee")) {
            return isHigherOfficial(otherRoles) || otherRoles.contains("employee");
        }
        if (myRoles.contains("intern")) {
            return isHigherOfficial(otherRoles);
        }
        return false;
    }

    public List<ChatContactResponse> getContacts() {
        User currentUser = getCurrentUser();
        Set<String> myRoles = normalizedRoles(currentUser);

        return userRepository.findAll().stream()
                .filter(u -> !u.getId().equals(currentUser.getId()))
                .filter(u -> canChat(myRoles, normalizedRoles(u)))
                .map(u -> new ChatContactResponse(
                        u.getId(),
                        u.getName(),
                        u.getEmail(),
                        String.join(", ", normalizedRoles(u))))
                .collect(Collectors.toList());
    }

    public ChatMessageResponse sendMessage(ChatSendRequest request) {
        User sender = getCurrentUser();
        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        if (!canChat(normalizedRoles(sender), normalizedRoles(receiver))) {
            throw new RuntimeException("You are not allowed to message this user");
        }

        ChatMessage message = new ChatMessage();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setMessage(request.getMessage());

        return toResponse(chatMessageRepository.save(message));
    }

    public List<ChatMessageResponse> getConversation(Long otherUserId) {
        User currentUser = getCurrentUser();

        return chatMessageRepository
                .findConversation(currentUser.getId(), otherUserId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public long getUnreadCount() {
        User currentUser = getCurrentUser();
        return chatMessageRepository.countByReceiver_IdAndIsReadFalse(currentUser.getId());
    }

    public void markConversationAsRead(Long otherUserId) {
        User currentUser = getCurrentUser();
        chatMessageRepository.markAsRead(currentUser.getId(), otherUserId);
    }

    // Returns one row per contact this user has EXCHANGED messages with,
    // each with their last message + unread count, sorted by most recent
    public List<ChatConversationSummary> getConversationSummaries() {
        User currentUser = getCurrentUser();
        List<ChatContactResponse> contacts = getContacts();

        List<ChatConversationSummary> summaries = new ArrayList<>();

        for (ChatContactResponse contact : contacts) {
            List<ChatMessage> recent = chatMessageRepository
                    .findConversationDesc(currentUser.getId(), contact.getId());

            if (recent.isEmpty()) {
                continue; // only show people you've actually messaged
            }

            ChatMessage last = recent.get(0);
            long unread = chatMessageRepository
                    .countByReceiver_IdAndSender_IdAndIsReadFalse(currentUser.getId(), contact.getId());

            summaries.add(new ChatConversationSummary(
                    contact.getId(),
                    contact.getName(),
                    contact.getRole(),
                    last.getMessage(),
                    last.getSentAt(),
                    unread
            ));
        }

        summaries.sort((a, b) -> b.getLastMessageAt().compareTo(a.getLastMessageAt()));
        return summaries;
    }

    private ChatMessageResponse toResponse(ChatMessage m) {
        return new ChatMessageResponse(
                m.getId(),
                m.getSender().getId(),
                m.getSender().getName(),
                m.getReceiver().getId(),
                m.getReceiver().getName(),
                m.getMessage(),
                m.getSentAt(),
                m.getIsRead()
        );
    }
}