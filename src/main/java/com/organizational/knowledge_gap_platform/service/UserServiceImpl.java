package com.organizational.knowledge_gap_platform.service;
import com.organizational.knowledge_gap_platform.dto.UserResponse;
import com.organizational.knowledge_gap_platform.entity.User;
import com.organizational.knowledge_gap_platform.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
public List<UserResponse> getAllUsers() {

    List<User> users = userRepository.findAll();

    return users.stream().map(user -> {

        UserResponse response = new UserResponse();

        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setRole(
    user.getRoles()
        .stream()
        .map(role -> role.getRoleName())
        .findFirst()
        .orElse("NO_ROLE")
);
        response.setCreatedAt(user.getCreatedAt().toString());

        return response;

    }).toList();
}
    
}