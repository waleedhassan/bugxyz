package com.bugxyz.repository;

import com.bugxyz.entity.BugRelation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BugRelationRepository extends JpaRepository<BugRelation, Long> {

    List<BugRelation> findBySourceBugIdOrTargetBugId(Long sourceBugId, Long targetBugId);
}
