package com.organizational.knowledge_gap_platform.service;

/**
 * Thrown when an attempt is made to delete a Role that is still assigned to
 * one or more users, and the caller has not explicitly confirmed a forced
 * delete. Carries the affected-user count so the API/UI can present a
 * confirmation prompt ("This role is assigned to N users...") before
 * retrying with force=true.
 */
public class RoleInUseException extends RuntimeException {

    private final int userCount;

    public RoleInUseException(int userCount) {
        super("Role is assigned to " + userCount + " user(s).");
        this.userCount = userCount;
    }

    public int getUserCount() {
        return userCount;
    }
}