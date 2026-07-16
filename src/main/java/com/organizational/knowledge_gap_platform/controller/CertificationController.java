package com.organizational.knowledge_gap_platform.controller;

import com.organizational.knowledge_gap_platform.dto.CertificationResponseDTO;
import com.organizational.knowledge_gap_platform.service.CertificationService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/certifications")
public class CertificationController {

    private final CertificationService certificationService;

    public CertificationController(CertificationService certificationService) {
        this.certificationService = certificationService;
    }

    @PostMapping(value = "/{employeeId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CertificationResponseDTO> uploadCertification(
            @PathVariable Long employeeId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("certificationName") String certificationName,
            @RequestParam("issuingOrganization") String issuingOrganization,
            @RequestParam("issueDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate issueDate,
            @RequestParam(value = "expiryDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate expiryDate) {

        CertificationResponseDTO response = certificationService.uploadCertification(
                employeeId, file, certificationName, issuingOrganization, issueDate, expiryDate);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{employeeId}")
    public ResponseEntity<List<CertificationResponseDTO>> getCertifications(@PathVariable Long employeeId) {
        return ResponseEntity.ok(certificationService.getCertifications(employeeId));
    }

    @DeleteMapping("/{employeeId}/{certificationId}")
    public ResponseEntity<String> deleteCertification(
            @PathVariable Long employeeId,
            @PathVariable Long certificationId) {

        certificationService.deleteCertification(employeeId, certificationId);
        return ResponseEntity.ok("Certification deleted successfully.");
    }
}
