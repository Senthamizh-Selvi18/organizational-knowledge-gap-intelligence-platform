package com.organizational.knowledge_gap_platform.dto;

import com.organizational.knowledge_gap_platform.entity.CompetencyGoalMapping;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CompetencyGoalMappingDTO {

    private Long id;
    private Long strategicGoalId;
    private String goalName;
    private Double alignmentWeight;
    private String notes;

    public static CompetencyGoalMappingDTO fromEntity(CompetencyGoalMapping entity) {
        CompetencyGoalMappingDTO dto = new CompetencyGoalMappingDTO();
        dto.setId(entity.getId());
        dto.setAlignmentWeight(entity.getAlignmentWeight());
        dto.setNotes(entity.getNotes());

        if (entity.getStrategicGoal() != null) {
            dto.setStrategicGoalId(entity.getStrategicGoal().getId());
            dto.setGoalName(entity.getStrategicGoal().getGoalName());
        }

        return dto;
    }
}
