package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.CertificationResponseDTO;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

public interface CertificationService {

    CertificationResponseDTO uploadCertification(Long employeeId,
                                                   MultipartFile file,
                                                   String certificationName,
                                                   String issuingOrganization,
                                                   LocalDate issueDate,
                                                   LocalDate expiryDate);

    List<CertificationResponseDTO> getCertifications(Long employeeId);

    void deleteCertification(Long employeeId, Long certificationId);
}