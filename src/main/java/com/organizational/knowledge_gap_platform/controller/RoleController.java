package com.organizational.knowledge_gap_platform.controller;

import com.organizational.knowledge_gap_platform.entity.Role;
import com.organizational.knowledge_gap_platform.service.RoleServiceImpl;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.organizational.knowledge_gap_platform.dto.AssignRoleRequest;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/roles")
public class RoleController {

    private final RoleServiceImpl roleService;

    public RoleController(RoleServiceImpl roleService) {
        this.roleService = roleService;
    }
    
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<Role>> getAllRoles() {
        return ResponseEntity.ok(roleService.getAllRoles());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<Role> getRoleById(@PathVariable Long id) {

        Role role = roleService.getRoleById(id);

        if (role == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(role);
    }
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
public ResponseEntity<?> createRole(@Valid @RequestBody Role role) {

    Role savedRole = roleService.createRole(role);

    if (savedRole == null) {
        return ResponseEntity
                .badRequest()
                .body("Role already exists.");
    }

    return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(savedRole);
}
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
public ResponseEntity<?> updateRole(@PathVariable Long id,
                                    @Valid @RequestBody Role role) {

    Role updatedRole = roleService.updateRole(id, role);

    if (updatedRole == null) {
        return ResponseEntity
                .badRequest()
                .body("Role not found or role name already exists.");
    }

    return ResponseEntity.ok(updatedRole);
}
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
public ResponseEntity<Void> deleteRole(@PathVariable Long id) {

    boolean deleted = roleService.deleteRole(id);

    if (!deleted) {
        return ResponseEntity.notFound().build();
    }

    return ResponseEntity.noContent().build();
}
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/assign/{userId}")
public ResponseEntity<String> assignRoleToUser(
        @PathVariable Long userId,
        @Valid @RequestBody AssignRoleRequest request) {

    boolean assigned =
            roleService.assignRoleToUser(userId, request.getRoleId());

    if (!assigned) {
        return ResponseEntity.badRequest()
                .body("User or Role not found.");
    }

    return ResponseEntity.ok("Role assigned successfully.");

}
}