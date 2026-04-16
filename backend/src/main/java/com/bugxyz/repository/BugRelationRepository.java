package com.bugxyz.repository;

import com.bugxyz.entity.BugRelation;
import com.bugxyz.enums.RelationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BugRelationRepository extends JpaRepository<BugRelation, Long> {

    List<BugRelation> findBySourceBugIdOrTargetBugId(Long sourceBugId, Long targetBugId);

    List<BugRelation> findBySourceBugId(Long sourceBugId);

    Optional<BugRelation> findBySourceBugIdAndTargetBugIdAndRelationType(Long sourceId, Long targetId, RelationType type);
}
