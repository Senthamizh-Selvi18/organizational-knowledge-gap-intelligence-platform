package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.entity.NotificationType;
import com.organizational.knowledge_gap_platform.entity.Role;
import com.organizational.knowledge_gap_platform.entity.User;
import com.organizational.knowledge_gap_platform.repository.RoleRepository;
import com.organizational.knowledge_gap_platform.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;


@Service
public class AdminService {

    private static final Logger log = LoggerFactory.getLogger(AdminService.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final NotificationService notificationService;


    public AdminService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            NotificationService notificationService
    ){
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.notificationService = notificationService;
    }


    public User assignRole(Long userId, Long roleId){

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));


        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Role not found"));


        user.getRoles().add(role);

        User saved = userRepository.save(user);

        notifyRoleChanged(saved, role);

        return saved;
    }

    /**
     * Fires a ROLE_CHANGED notification to the affected user. Never allowed to
     * break the role assignment if notification creation fails.
     */
    private void notifyRoleChanged(User user, Role role) {
        try {
            notificationService.createNotification(
                    user.getId(),
                    NotificationType.ROLE_CHANGED.name(),
                    "Your role has been updated",
                    "You have been assigned the role: " + role.getRoleName() + ".",
                    "HIGH",
                    "/profile",
                    user.getId()
            );
        } catch (Exception ex) {
            log.error("Failed to create ROLE_CHANGED notification for user {}", user.getId(), ex);
        }
    }

}