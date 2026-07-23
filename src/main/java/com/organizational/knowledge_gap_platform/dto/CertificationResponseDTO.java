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
public class CertificationResponseDTO {

    private Long id;
    private String certificationName;
    private String issuingOrganization;
    private LocalDate issueDate;
    private LocalDate expiryDate;
    private String fileUrl;
    private LocalDateTime uploadedAt;
}