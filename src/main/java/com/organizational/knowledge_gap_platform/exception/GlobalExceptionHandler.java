package com.organizational.knowledge_gap_platform.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(InvalidTokenException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidToken(InvalidTokenException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorBody(ex.getMessage()));
    }

    @ExceptionHandler(CertificationNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleCertificationNotFound(CertificationNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorBody(ex.getMessage()));
    }

    @ExceptionHandler(EmployeeNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleEmployeeNotFound(EmployeeNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorBody(ex.getMessage()));
    }

    @ExceptionHandler(FileUploadException.class)
    public ResponseEntity<Map<String, Object>> handleFileUpload(FileUploadException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorBody(ex.getMessage()));
    }

    @ExceptionHandler(AssessmentTemplateNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleAssessmentTemplateNotFound(AssessmentTemplateNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorBody(ex.getMessage()));
    }

    @ExceptionHandler(AssessmentNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleAssessmentNotFound(AssessmentNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorBody(ex.getMessage()));
    }

    @ExceptionHandler(AssessmentQuestionNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleAssessmentQuestionNotFound(AssessmentQuestionNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorBody(ex.getMessage()));
    }

    @ExceptionHandler(SkillNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleSkillNotFound(SkillNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorBody(ex.getMessage()));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorBody(ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(err -> fieldErrors.put(err.getField(), err.getDefaultMessage()));

        Map<String, Object> body = new HashMap<>();
        body.put("message", "Validation failed");
        body.put("errors", fieldErrors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorBody(ex.getMessage()));
    }

   @ExceptionHandler(Exception.class)
public ResponseEntity<Map<String, Object>> handleException(Exception ex) {

    ex.printStackTrace();

    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(errorBody(ex.getMessage()));
}

    private Map<String, Object> errorBody(String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("message", message);
        return body;
    }
}