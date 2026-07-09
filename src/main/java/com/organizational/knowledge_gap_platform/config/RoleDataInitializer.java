package com.organizational.knowledge_gap_platform.config;

import com.organizational.knowledge_gap_platform.entity.Role;
import com.organizational.knowledge_gap_platform.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class RoleDataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;

    public RoleDataInitializer(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    public void run(String... args) {
        createRoleIfMissing("Admin");
        createRoleIfMissing("Employee");
        createRoleIfMissing("Intern");
    }

    private void createRoleIfMissing(String roleName) {
        if (roleRepository.findByRoleName(roleName).isEmpty()) {
            Role role = new Role();
            role.setRoleName(roleName);
            roleRepository.save(role);
        }
    }
}
