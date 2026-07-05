package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.UserResponse;
import com.organizational.knowledge_gap_platform.entity.User;
import java.util.List;

public interface UserService {

    List<UserResponse> getAllUsers();

}