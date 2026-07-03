package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.entity.Role;
import com.organizational.knowledge_gap_platform.repository.RoleRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoleService {

    private final RoleRepository roleRepository;

    public RoleService(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    public Role getRoleById(Long id) {
        return roleRepository.findById(id).orElse(null);
    }

    public Role createRole(Role role) {
        return roleRepository.save(role);
    }

    public Role updateRole(Long id, Role updatedRole) {

        Role role = roleRepository.findById(id).orElse(null);

        if (role == null) {
            return null;
        }

        role.setRoleName(updatedRole.getRoleName());

        return roleRepository.save(role);
    }

    public boolean deleteRole(Long id) {

        if (!roleRepository.existsById(id)) {
            return false;
        }

        roleRepository.deleteById(id);

        return true;
    }
}