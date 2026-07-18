package com.organizational.knowledge_gap_platform.dto;

import com.organizational.knowledge_gap_platform.entity.GoalPriority;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StrategicGoalRequest {

    @NotBlank(message = "Goal name cannot be empty")
    private String goalName;

    private String description;

    private Integer targetYear;

    private GoalPriority priority;
}
