package com.organizational.knowledge_gap_platform.dto;

import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Getter
@Setter
public class LoginRequest {
    @NotBlank
@Email
private String email;

@NotBlank
private String password;
    
}