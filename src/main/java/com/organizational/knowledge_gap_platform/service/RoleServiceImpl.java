package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.RoleDetailsResponse;
import com.organizational.knowledge_gap_platform.entity.Role;
import com.organizational.knowledge_gap_platform.entity.User;
import com.organizational.knowledge_gap_platform.repository.RoleRepository;
import com.organizational.knowledge_gap_platform.repository.UserRepository;
import org.springframework.stereotype.Service;
import com.organizational.knowledge_gap_platform.dto.UserSummary;
import java.util.ArrayList;

import java.util.List;

@Service
public class RoleServiceImpl implements RoleService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public RoleServiceImpl(RoleRepository roleRepository,
                           UserRepository userRepository) {

        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
    }

   @Override
public List<RoleDetailsResponse> getAllRoles() {

    return roleRepository.findAll()
            .stream()
            .map(role -> {

                RoleDetailsResponse dto = new RoleDetailsResponse();

                dto.setId(role.getId());
                dto.setRoleName(role.getRoleName());

                

                dto.setUsers(new ArrayList<>());

                dto.setTotalUsers(role.getUsers().size());

                dto.setDescription(role.getDescription());
dto.setActive(role.getActive());
dto.setCreatedAt(role.getCreatedAt());

                

                return dto;

            })
            .toList();
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

        if (userRepository.findAll().stream()
                .anyMatch(user -> user.getRoles().stream()
                        .anyMatch(role -> role.getId().equals(id)))) {

            throw new RuntimeException(
                    "Cannot delete role. It is assigned to one or more users.");
        }

        roleRepository.deleteById(id);

        return true;
    }

    @Override
    public List<Role> getRegisterableRoles() {

        return roleRepository.findAll()
                .stream()
                .filter(role ->
                        role.getRoleName().equalsIgnoreCase("Employee")
                                || role.getRoleName().equalsIgnoreCase("Intern"))
                .toList();
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

        user.getRoles().clear();
        user.getRoles().add(role);

        userRepository.save(user);

        return true;
    }

    @Override
public RoleDetailsResponse getRoleDetails(Long id) {

    Role role = roleRepository.findById(id).orElse(null);

    if (role == null) {
        return null;
    }

    RoleDetailsResponse response = new RoleDetailsResponse();

    response.setId(role.getId());
    response.setRoleName(role.getRoleName());
    response.setDescription(role.getDescription());
response.setCreatedAt(role.getCreatedAt());
response.setActive(role.getActive());

    List<UserSummary> users = role.getUsers()
            .stream()
            .map(user -> {
                UserSummary summary = new UserSummary();
                summary.setId(user.getId());
                summary.setName(user.getName());
                summary.setEmail(user.getEmail());
                return summary;
            })
            .toList();

    response.setUsers(users);
    response.setTotalUsers(users.size());
    response.setDescription(role.getDescription());
    response.setCreatedAt(role.getCreatedAt());
    response.setActive(role.getActive());

    return response;
}
}