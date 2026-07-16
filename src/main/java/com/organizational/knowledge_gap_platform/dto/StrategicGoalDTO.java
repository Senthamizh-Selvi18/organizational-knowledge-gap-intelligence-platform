package com.organizational.knowledge_gap_platform.dto;

import com.organizational.knowledge_gap_platform.entity.GoalPriority;
import com.organizational.knowledge_gap_platform.entity.StrategicGoal;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class StrategicGoalDTO {

    private Long id;
    private String goalName;
    private String description;
    private Integer targetYear;
    private GoalPriority priority;
    private Boolean active;
    private LocalDateTime createdAt;

    public static StrategicGoalDTO fromEntity(StrategicGoal entity) {
        StrategicGoalDTO dto = new StrategicGoalDTO();
        dto.setId(entity.getId());
        dto.setGoalName(entity.getGoalName());
        dto.setDescription(entity.getDescription());
        dto.setTargetYear(entity.getTargetYear());
        dto.setPriority(entity.getPriority());
        dto.setActive(entity.getActive());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
}
