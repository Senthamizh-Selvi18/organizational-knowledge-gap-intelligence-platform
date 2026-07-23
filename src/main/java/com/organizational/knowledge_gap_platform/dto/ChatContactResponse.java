package com.organizational.knowledge_gap_platform.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChatContactResponse {
    private Long id;
    private String name;
    private String email;
    private String role;
}