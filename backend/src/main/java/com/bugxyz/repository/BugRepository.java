package com.bugxyz.repository;

import com.bugxyz.entity.Bug;
import com.bugxyz.enums.BugStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BugRepository extends JpaRepository<Bug, Long>, JpaSpecificationExecutor<Bug> {

    Page<Bug> findByAssigneeId(Long assigneeId, Pageable pageable);

    long countByProjectId(Long projectId);

    long countByProjectIdAndStatus(Long projectId, BugStatus status);

    long countByStatus(BugStatus status);

    long countByAssigneeId(Long assigneeId);

    long countByAssigneeIdAndStatus(Long assigneeId, BugStatus status);

    @Query("SELECT COUNT(b) FROM Bug b WHERE b.closedAt >= :since")
    long countResolvedSince(@Param("since") LocalDateTime since);

    @Query("SELECT b.status, COUNT(b) FROM Bug b GROUP BY b.status")
    List<Object[]> countByStatusGrouped();

    @Query("SELECT b.severity, COUNT(b) FROM Bug b GROUP BY b.severity")
    List<Object[]> countBySeverityGrouped();

    @Query("SELECT b.project.name, COUNT(b) FROM Bug b GROUP BY b.project.name")
    List<Object[]> countByProjectGrouped();

    @Query("SELECT b FROM Bug b WHERE b.isStale = true")
    List<Bug> findStaleBugs();

    @Query("SELECT b FROM Bug b WHERE b.technicalDebt = true")
    List<Bug> findTechDebtBugs();

    @Query("SELECT b.debtCategory, COUNT(b) FROM Bug b WHERE b.technicalDebt = true GROUP BY b.debtCategory")
    List<Object[]> countByDebtCategoryGrouped();

    @Query("SELECT b FROM Bug b WHERE b.createdAt >= :since ORDER BY b.createdAt DESC")
    List<Bug> findCreatedSince(@Param("since") LocalDateTime since, Pageable pageable);

    @Query("SELECT b FROM Bug b WHERE b.closedAt IS NOT NULL AND b.closedAt >= :since")
    List<Bug> findClosedSince(@Param("since") LocalDateTime since);

    @Query("SELECT b.severity, AVG(EXTRACT(EPOCH FROM (b.closedAt - b.createdAt)) / 3600) " +
           "FROM Bug b WHERE b.closedAt IS NOT NULL GROUP BY b.severity")
    List<Object[]> avgTimeToFixBySeverity();

    @Query("SELECT b.assignee.id, b.assignee.fullName, " +
           "SUM(CASE WHEN b.status NOT IN (com.bugxyz.enums.BugStatus.RESOLVED, com.bugxyz.enums.BugStatus.CLOSED) THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN b.status IN (com.bugxyz.enums.BugStatus.RESOLVED, com.bugxyz.enums.BugStatus.CLOSED) THEN 1 ELSE 0 END), " +
           "AVG(CASE WHEN b.closedAt IS NOT NULL THEN EXTRACT(EPOCH FROM (b.closedAt - b.createdAt)) / 3600 ELSE NULL END) " +
           "FROM Bug b WHERE b.assignee IS NOT NULL GROUP BY b.assignee.id, b.assignee.fullName")
    List<Object[]> developerStats();
}
