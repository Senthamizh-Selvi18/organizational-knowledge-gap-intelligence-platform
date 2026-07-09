package com.organizational.knowledge_gap_platform.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class AssignSkillsRequestDTO {

    private List<Long> skillIds;

}