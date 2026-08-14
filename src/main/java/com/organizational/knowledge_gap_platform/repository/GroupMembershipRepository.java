package com.organizational.knowledge_gap_platform.repository;

import com.organizational.knowledge_gap_platform.entity.CommunityGroup;
import com.organizational.knowledge_gap_platform.entity.Employee;
import com.organizational.knowledge_gap_platform.entity.GroupMembership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupMembershipRepository extends JpaRepository<GroupMembership, Long> {

    List<GroupMembership> findByGroupOrderByJoinedAtAsc(CommunityGroup group);

    List<GroupMembership> findByMember(Employee member);

    Optional<GroupMembership> findByGroupAndMember(CommunityGroup group, Employee member);

    boolean existsByGroupAndMember(CommunityGroup group, Employee member);

    long countByGroup(CommunityGroup group);

    void deleteByGroup(CommunityGroup group);
}