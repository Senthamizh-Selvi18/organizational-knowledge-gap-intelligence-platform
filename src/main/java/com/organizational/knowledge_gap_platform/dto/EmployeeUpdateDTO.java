package com.organizational.knowledge_gap_platform.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class EmployeeUpdateDTO {

    private String department;

    private String designation;

    private String phoneNumber;

    private String location;

    private LocalDate joiningDate;

    private Integer experience;

    private String manager;
}