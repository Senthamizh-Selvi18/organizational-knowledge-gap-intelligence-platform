package com.organizational.knowledge_gap_platform.dto;

import com.organizational.knowledge_gap_platform.entity.GroupMemberRole;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GroupMemberResponseDTO {

    private Long employeeId;
    private String employeeName;
    private String department;
    private String designation;
    private GroupMemberRole role;
    private LocalDateTime joinedAt;
}
