package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.RoleDetailsResponse;
import com.organizational.knowledge_gap_platform.entity.Role;

import java.util.List;

public interface RoleService {

    List<RoleDetailsResponse> getAllRoles();

    Role getRoleById(Long id);

    Role createRole(Role role);

    Role updateRole(Long id, Role updatedRole);

    /**
     * Deletes a role.
     *
     * @param id    the role id
     * @param force if false and the role is still assigned to one or more
     *              users, a {@link RoleInUseException} is thrown instead of
     *              deleting, so the caller can confirm with the user first.
     *              If true, the role is unassigned from any users that have
     *              it before being deleted.
     * @return true if the role was found and deleted, false if no such role exists.
     */
    boolean deleteRole(Long id, boolean force);

    boolean assignRoleToUser(Long userId, Long roleId);

    List<Role> getRegisterableRoles();

    RoleDetailsResponse getRoleDetails(Long id);
}