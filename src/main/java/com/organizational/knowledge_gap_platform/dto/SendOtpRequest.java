package com.organizational.knowledge_gap_platform.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SendOtpRequest {
    private Long userId;
    private String phone;
}