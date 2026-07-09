package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.entity.Role;
import com.organizational.knowledge_gap_platform.entity.User;
import com.organizational.knowledge_gap_platform.repository.RoleRepository;
import com.organizational.knowledge_gap_platform.repository.UserRepository;
import org.springframework.stereotype.Service;


@Service
public class AdminService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;


    public AdminService(
            UserRepository userRepository,
            RoleRepository roleRepository
    ){
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }


    public User assignRole(Long userId, Long roleId){

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));


        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Role not found"));


        user.getRoles().add(role);

        return userRepository.save(user);
    }

}