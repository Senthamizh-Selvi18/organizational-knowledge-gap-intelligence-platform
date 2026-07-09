package com.organizational.knowledge_gap_platform.dto;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class AssignSkillsRequestDTO {

    @NotEmpty(message = "Skill IDs cannot be empty")
    private List<Long> skillIds;
}