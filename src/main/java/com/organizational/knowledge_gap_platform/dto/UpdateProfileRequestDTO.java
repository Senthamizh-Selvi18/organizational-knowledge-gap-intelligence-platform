package com.organizational.knowledge_gap_platform.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequestDTO {

    private String name;
    private String department;
    private String designation;
    private String phoneNumber;
    private String location;
    private LocalDate joiningDate;
    private Integer experience;
    private String manager;
}