package com.organizational.knowledge_gap_platform.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.organizational.knowledge_gap_platform.entity.Role;
import com.organizational.knowledge_gap_platform.entity.User;
import com.organizational.knowledge_gap_platform.repository.RoleRepository;
import com.organizational.knowledge_gap_platform.repository.UserRepository;

@Service
public class RoleServiceImpl implements RoleService {
    private final UserRepository userRepository;

    private final RoleRepository roleRepository;

   public RoleServiceImpl(RoleRepository roleRepository,
                   UserRepository userRepository) {

    this.roleRepository = roleRepository;
    this.userRepository = userRepository;

}   @Override
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }
    @Override
    public Role getRoleById(Long id) {
        return roleRepository.findById(id).orElse(null);
    }
    @Override
    public Role createRole(Role role) {

    if (roleRepository.findByRoleName(role.getRoleName()).isPresent()) {
        return null;
    }

    return roleRepository.save(role);
}
    @Override
    public Role updateRole(Long id, Role updatedRole) {

    Role role = roleRepository.findById(id).orElse(null);

    if (role == null) {
        return null;
    }

    if (!role.getRoleName().equals(updatedRole.getRoleName())
            && roleRepository.findByRoleName(updatedRole.getRoleName()).isPresent()) {

        return null;
    }

    role.setRoleName(updatedRole.getRoleName());

    return roleRepository.save(role);
}
    @Override
    public boolean deleteRole(Long id) {

    if (!roleRepository.existsById(id)) {
        return false;
    }

    if (userRepository.existsByRoleId(id)) {
        throw new RuntimeException("Cannot delete role. It is assigned to one or more users.");
    }

    roleRepository.deleteById(id);

    return true;
}
@Override
    public boolean assignRoleToUser(Long userId, Long roleId) {

    User user = userRepository.findById(userId).orElse(null);

    if (user == null) {
        return false;
    }

    Role role = roleRepository.findById(roleId).orElse(null);

    if (role == null) {
        return false;
    }

    user.setRole(role);

    userRepository.save(user);

    return true;
}
}