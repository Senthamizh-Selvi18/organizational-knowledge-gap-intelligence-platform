package com.organizational.knowledge_gap_platform.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class RoleSkillResponse {

    private Long roleId;
    private String roleName;
    private List<SkillDTO> skills;
}
