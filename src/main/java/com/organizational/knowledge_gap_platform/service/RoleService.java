package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.entity.Role;
import com.organizational.knowledge_gap_platform.repository.RoleRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RoleService {

    private final RoleRepository roleRepository;

    public RoleService(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    // Get all roles
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    // Get role by id
    public Optional<Role> getRoleById(Long id) {
        return roleRepository.findById(id);
    }

    // Create a new role
    public Role saveRole(Role role) {
        return roleRepository.save(role);
    }

    // Update a role
    public Role updateRole(Long id, Role role) {
        Role existingRole = roleRepository.findById(id).orElseThrow();
        existingRole.setRoleName(role.getRoleName());
        return roleRepository.save(existingRole);
    }

    // Delete a role
    public void deleteRole(Long id) {
        roleRepository.deleteById(id);
    }
}