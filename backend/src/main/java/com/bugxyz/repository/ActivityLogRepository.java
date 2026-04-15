package com.bugxyz.repository;

import com.bugxyz.entity.ActivityLog;
import com.bugxyz.enums.ActivityAction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    Page<ActivityLog> findByBugIdOrderByCreatedAtDesc(Long bugId, Pageable pageable);

    Page<ActivityLog> findByProjectIdOrderByCreatedAtDesc(Long projectId, Pageable pageable);

    Page<ActivityLog> findAllByOrderByCreatedAtDesc(Pageable pageable);

    long countByUserIdAndAction(Long userId, ActivityAction action);

    List<ActivityLog> findByBugIdAndAction(Long bugId, ActivityAction action);
}
