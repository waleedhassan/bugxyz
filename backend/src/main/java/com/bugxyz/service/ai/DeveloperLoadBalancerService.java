package com.bugxyz.service.ai;

import com.bugxyz.dto.AiDtos.AssigneeSuggestionResponse;
import com.bugxyz.entity.Bug;
import com.bugxyz.entity.ProjectMember;
import com.bugxyz.enums.BugStatus;
import com.bugxyz.exception.ResourceNotFoundException;
import com.bugxyz.repository.BugRepository;
import com.bugxyz.repository.ProjectMemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeveloperLoadBalancerService {

    private static final int TOP_K = 5;
    private static final double WORKLOAD_WEIGHT = 0.40;
    private static final double EXPERTISE_WEIGHT = 0.30;
    private static final double VELOCITY_WEIGHT = 0.20;
    private static final Set<BugStatus> OPEN_STATUSES = Set.of(
            BugStatus.OPEN, BugStatus.IN_PROGRESS, BugStatus.IN_REVIEW, BugStatus.REOPENED
    );
    private static final Set<BugStatus> RESOLVED_STATUSES = Set.of(
            BugStatus.RESOLVED, BugStatus.CLOSED
    );

    private final BugRepository bugRepository;
    private final ProjectMemberRepository projectMemberRepository;

    @Transactional(readOnly = true)
    public List<AssigneeSuggestionResponse> suggestAssignees(Long bugId) {
        Bug bug = bugRepository.findById(bugId)
                .orElseThrow(() -> new ResourceNotFoundException("Bug not found with id: " + bugId));

        Long projectId = bug.getProject().getId();
        log.info("Suggesting assignees for bug {} in project {}", bugId, projectId);

        List<ProjectMember> members = projectMemberRepository.findByProjectId(projectId);
        if (members.isEmpty()) {
            log.warn("No project members found for project {}", projectId);
            return List.of();
        }

        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<DeveloperMetrics> metricsList = new ArrayList<>();

        for (ProjectMember member : members) {
            Long userId = member.getUserId();

            long openBugs = bugRepository.countByAssigneeIdAndStatus(userId, BugStatus.OPEN)
                    + bugRepository.countByAssigneeIdAndStatus(userId, BugStatus.IN_PROGRESS)
                    + bugRepository.countByAssigneeIdAndStatus(userId, BugStatus.IN_REVIEW);

            // Count resolved bugs in this project
            long resolvedInProject = countResolvedInProject(userId, projectId);

            // Count bugs resolved in last 30 days (velocity)
            long recentResolved = countResolvedSince(userId, thirtyDaysAgo);

            // Average fix time
            double avgFixTime = computeAvgFixTime(userId);

            String userName = member.getUser() != null ? member.getUser().getFullName() : "User " + userId;

            metricsList.add(new DeveloperMetrics(
                    userId, userName, (int) openBugs, (int) resolvedInProject,
                    (int) recentResolved, avgFixTime
            ));
        }

        // Compute normalization factors
        int maxOpen = metricsList.stream().mapToInt(DeveloperMetrics::openBugs).max().orElse(1);
        int maxExpertise = metricsList.stream().mapToInt(DeveloperMetrics::resolvedInProject).max().orElse(1);
        int maxVelocity = metricsList.stream().mapToInt(DeveloperMetrics::recentResolved).max().orElse(1);

        if (maxOpen == 0) maxOpen = 1;
        if (maxExpertise == 0) maxExpertise = 1;
        if (maxVelocity == 0) maxVelocity = 1;

        final int normOpen = maxOpen;
        final int normExpertise = maxExpertise;
        final int normVelocity = maxVelocity;

        List<AssigneeSuggestionResponse> results = metricsList.stream()
                .map(m -> {
                    double workloadScore = 1.0 - ((double) m.openBugs() / normOpen);
                    double expertiseScore = (double) m.resolvedInProject() / normExpertise;
                    double velocityScore = (double) m.recentResolved() / normVelocity;

                    double totalScore = (workloadScore * WORKLOAD_WEIGHT)
                            + (expertiseScore * EXPERTISE_WEIGHT)
                            + (velocityScore * VELOCITY_WEIGHT);

                    totalScore = Math.round(totalScore * 1000.0) / 1000.0;

                    return AssigneeSuggestionResponse.builder()
                            .userId(m.userId())
                            .userName(m.userName())
                            .score(totalScore)
                            .currentOpenBugs(m.openBugs())
                            .resolvedInProject(m.resolvedInProject())
                            .avgFixTimeHours(Math.round(m.avgFixTimeHours() * 100.0) / 100.0)
                            .build();
                })
                .sorted(Comparator.comparingDouble(AssigneeSuggestionResponse::getScore).reversed())
                .limit(TOP_K)
                .collect(Collectors.toList());

        log.info("Suggested {} assignees for bug {}", results.size(), bugId);
        return results;
    }

    private long countResolvedInProject(Long userId, Long projectId) {
        return bugRepository.count((root, query, cb) -> cb.and(
                cb.equal(root.get("assignee").get("id"), userId),
                cb.equal(root.get("project").get("id"), projectId),
                root.get("status").in(RESOLVED_STATUSES)
        ));
    }

    private long countResolvedSince(Long userId, LocalDateTime since) {
        return bugRepository.count((root, query, cb) -> cb.and(
                cb.equal(root.get("assignee").get("id"), userId),
                root.get("status").in(RESOLVED_STATUSES),
                cb.greaterThanOrEqualTo(root.get("closedAt"), since)
        ));
    }

    private double computeAvgFixTime(Long userId) {
        List<Bug> resolvedBugs = bugRepository.findAll((root, query, cb) -> cb.and(
                cb.equal(root.get("assignee").get("id"), userId),
                cb.isNotNull(root.get("closedAt"))
        ));

        if (resolvedBugs.isEmpty()) {
            return 0.0;
        }

        double totalHours = resolvedBugs.stream()
                .mapToDouble(bug -> {
                    long seconds = java.time.Duration.between(bug.getCreatedAt(), bug.getClosedAt()).getSeconds();
                    return seconds / 3600.0;
                })
                .sum();

        return totalHours / resolvedBugs.size();
    }

    private record DeveloperMetrics(Long userId, String userName, int openBugs,
                                     int resolvedInProject, int recentResolved,
                                     double avgFixTimeHours) {}
}
