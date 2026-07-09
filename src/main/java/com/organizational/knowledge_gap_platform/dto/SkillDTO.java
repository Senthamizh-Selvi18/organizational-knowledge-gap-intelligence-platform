package com.organizational.knowledge_gap_platform.dto;

import com.organizational.knowledge_gap_platform.entity.Skill;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class SkillDTO {

    private Long id;
    private String skillName;

    public static SkillDTO fromEntity(Skill skill) {
        return new SkillDTO(skill.getId(), skill.getSkillName());
    }
}
