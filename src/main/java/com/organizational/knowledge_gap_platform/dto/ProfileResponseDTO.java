package com.organizational.knowledge_gap_platform.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProfileResponseDTO {

    private Long userId;
    private String employeeCode;
    private String name;
    private String email;
    private String role;
    private String department;
    private String designation;
    private String phoneNumber;
    private String location;
    private LocalDate joiningDate;
    private Integer experience;
    private String manager;
    private LocalDateTime createdAt;
}