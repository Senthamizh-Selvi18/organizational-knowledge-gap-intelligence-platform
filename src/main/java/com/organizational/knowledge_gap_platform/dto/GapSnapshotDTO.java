package com.organizational.knowledge_gap_platform.dto;

import com.organizational.knowledge_gap_platform.entity.GapSnapshot;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GapSnapshotDTO {

    private Long id;

    private Long employeeId;
    private String employeeName;

    private Long roleId;
    private String roleName;

    private int totalRequiredSkills;
    private int matchedSkillCount;
    private int missingSkillCount;
    private double gapPercentage;

    private LocalDate snapshotDate;

    public static GapSnapshotDTO fromEntity(GapSnapshot snapshot) {
        return new GapSnapshotDTO(
                snapshot.getId(),
                snapshot.getEmployee().getId(),
                snapshot.getEmployee().getUser().getName(),
                snapshot.getRole().getId(),
                snapshot.getRole().getRoleName(),
                snapshot.getTotalRequiredSkills(),
                snapshot.getMatchedSkillCount(),
                snapshot.getMissingSkillCount(),
                snapshot.getGapPercentage(),
                snapshot.getSnapshotDate()
        );
    }
}
