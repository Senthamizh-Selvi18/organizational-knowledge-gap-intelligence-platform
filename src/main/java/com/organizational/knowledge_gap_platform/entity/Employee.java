package com.organizational.knowledge_gap_platform.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "employee")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_code", unique = true)
    private String employeeCode;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String department;

    @Column(nullable = false)
    private String designation;

    @Column(name = "phone_number")
    private String phoneNumber;

    private String location;

    @Column(name = "joining_date")
    private LocalDate joiningDate;

    private Integer experience;

    private String manager;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}