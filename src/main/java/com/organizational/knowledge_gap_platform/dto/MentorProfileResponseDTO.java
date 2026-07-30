package com.organizational.knowledge_gap_platform.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MentorProfileResponseDTO {

    private Long id;
    private Long employeeId;
    private String employeeName;
    private String department;
    private String designation;
    private String expertiseAreas;
    private String bio;
    private Integer yearsOfExperience;
    private String availability;
    private Integer maxMentees;
    private Integer activeMenteeCount;
    private boolean active;
    private Double averageRating;
    private Integer totalReviews;
    private LocalDateTime createdAt;
}
