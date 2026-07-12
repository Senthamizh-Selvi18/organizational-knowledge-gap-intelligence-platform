package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.RoleDetailsResponse;
import com.organizational.knowledge_gap_platform.entity.Role;

import java.util.List;

public interface RoleService {

    List<RoleDetailsResponse> getAllRoles();

    Role getRoleById(Long id);

    Role createRole(Role role);

    Role updateRole(Long id, Role updatedRole);

    boolean deleteRole(Long id);

    boolean assignRoleToUser(Long userId, Long roleId);

    List<Role> getRegisterableRoles();

    RoleDetailsResponse getRoleDetails(Long id);
}