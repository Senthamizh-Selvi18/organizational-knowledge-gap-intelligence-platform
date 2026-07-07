package com.organizational.knowledge_gap_platform.controller;
import com.organizational.knowledge_gap_platform.dto.UserResponse;
import com.organizational.knowledge_gap_platform.entity.User;
import com.organizational.knowledge_gap_platform.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers(){
        return ResponseEntity.ok(userService.getAllUsers());
    }
}