package com.organizational.knowledge_gap_platform.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.organizational.knowledge_gap_platform.dto.CertificationResponseDTO;
import com.organizational.knowledge_gap_platform.entity.Certification;
import com.organizational.knowledge_gap_platform.entity.Employee;
import com.organizational.knowledge_gap_platform.exception.CertificationNotFoundException;
import com.organizational.knowledge_gap_platform.exception.EmployeeNotFoundException;
import com.organizational.knowledge_gap_platform.exception.FileUploadException;
import com.organizational.knowledge_gap_platform.repository.CertificationRepository;
import com.organizational.knowledge_gap_platform.repository.EmployeeRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class CertificationServiceImpl implements CertificationService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "application/pdf", "image/png", "image/jpeg"
    );
    private static final long MAX_FILE_SIZE_BYTES = 5L * 1024 * 1024; 

    private final Cloudinary cloudinary;
    private final CertificationRepository certificationRepository;
    private final EmployeeRepository employeeRepository;

    public CertificationServiceImpl(Cloudinary cloudinary,
                                     CertificationRepository certificationRepository,
                                     EmployeeRepository employeeRepository) {
        this.cloudinary = cloudinary;
        this.certificationRepository = certificationRepository;
        this.employeeRepository = employeeRepository;
    }

    @Override
    @Transactional
    public CertificationResponseDTO uploadCertification(Long employeeId,
                                                          MultipartFile file,
                                                          String certificationName,
                                                          String issuingOrganization,
                                                          LocalDate issueDate,
                                                          LocalDate expiryDate) {

        Employee employee = requireOwnedEmployee(employeeId);
        validateFile(file);

        Map<String, Object> uploadResult;
        try {
            Map<String, Object> options = ObjectUtils.asMap(
                    "folder", "certifications/employee_" + employee.getId(),
                    "resource_type", "auto",
                    "use_filename", true,
                    "unique_filename", true
            );
            uploadResult = cloudinary.uploader().upload(file.getBytes(), options);
        } catch (IOException e) {
            throw new FileUploadException("Failed to upload certification file: " + e.getMessage());
        }

        Certification certification = new Certification();
        certification.setEmployee(employee);
        certification.setCertificationName(certificationName);
        certification.setIssuingOrganization(issuingOrganization);
        certification.setIssueDate(issueDate);
        certification.setExpiryDate(expiryDate);
        certification.setFileUrl((String) uploadResult.get("secure_url"));
        certification.setPublicId((String) uploadResult.get("public_id"));
        certification.setResourceType((String) uploadResult.get("resource_type"));
        certification.setUploadedAt(LocalDateTime.now());

        certificationRepository.save(certification);

        return toDto(certification);
    }

    @Override
    public List<CertificationResponseDTO> getCertifications(Long employeeId) {
        Employee employee = requireOwnedEmployee(employeeId);

        return certificationRepository.findByEmployeeIdOrderByUploadedAtDesc(employee.getId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteCertification(Long employeeId, Long certificationId) {
        Employee employee = requireOwnedEmployee(employeeId);

        Certification certification = certificationRepository.findById(certificationId)
                .orElseThrow(() -> new CertificationNotFoundException(
                        "Certification not found with id: " + certificationId));

        if (!certification.getEmployee().getId().equals(employee.getId())) {
            throw new AccessDeniedException("You are not authorized to delete this certification.");
        }

        try {
            cloudinary.uploader().destroy(
                    certification.getPublicId(),
                    ObjectUtils.asMap("resource_type", certification.getResourceType())
            );
        } catch (IOException e) {
            throw new FileUploadException("Failed to delete certification file: " + e.getMessage());
        }

        certificationRepository.delete(certification);
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new FileUploadException("Please select a certification file to upload.");
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new FileUploadException("File size must not exceed 5 MB.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new FileUploadException("Only PDF, JPG, and PNG files are allowed.");
        }
    }

    private Employee requireOwnedEmployee(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EmployeeNotFoundException("Employee not found with id: " + employeeId));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String loggedInUserEmail = authentication.getName();

        if (!employee.getUser().getEmail().equals(loggedInUserEmail)) {
            throw new AccessDeniedException("You are not authorized to access this employee's certifications.");
        }

        return employee;
    }

    private CertificationResponseDTO toDto(Certification certification) {
        return new CertificationResponseDTO(
                certification.getId(),
                certification.getCertificationName(),
                certification.getIssuingOrganization(),
                certification.getIssueDate(),
                certification.getExpiryDate(),
                certification.getFileUrl(),
                certification.getUploadedAt()
        );
    }
}
