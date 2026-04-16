package com.bugxyz.service;

import com.bugxyz.dto.BugDtos.BugDto;
import com.bugxyz.dto.OtherDtos.*;
import com.bugxyz.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final BugRepository bugRepository;
    private final ActivityLogRepository activityLogRepository;

    public DashboardDto getDashboard(Long userId) {
        Map<String, Long> byStatus = new LinkedHashMap<>();
        bugRepository.countByStatusGrouped().forEach(row ->
                byStatus.put(row[0].toString(), (Long) row[1]));

        Map<String, Long> bySeverity = new LinkedHashMap<>();
        bugRepository.countBySeverityGrouped().forEach(row ->
                bySeverity.put(row[0].toString(), (Long) row[1]));

        Map<String, Long> byProject = new LinkedHashMap<>();
        bugRepository.countByProjectGrouped().forEach(row ->
                byProject.put((String) row[0], (Long) row[1]));

        long totalBugs = bugRepository.count();
        long openBugs = byStatus.getOrDefault("OPEN", 0L) + byStatus.getOrDefault("IN_PROGRESS", 0L) +
                byStatus.getOrDefault("IN_REVIEW", 0L) + byStatus.getOrDefault("REOPENED", 0L);
        long resolvedToday = bugRepository.countResolvedSince(LocalDateTime.now().toLocalDate().atStartOfDay());
        long myAssigned = userId != null ? bugRepository.countByAssigneeId(userId) : 0;

        List<BugDto> recentBugs = bugRepository.findCreatedSince(
                LocalDateTime.now().minusDays(30), PageRequest.of(0, 10)
        ).stream().map(BugDto::from).collect(Collectors.toList());

        List<ActivityLogDto> recentActivity = activityLogRepository
                .findAllByOrderByCreatedAtDesc(PageRequest.of(0, 10))
                .map(ActivityLogDto::from).getContent();

        return DashboardDto.builder()
                .totalBugs(totalBugs).openBugs(openBugs).resolvedToday(resolvedToday)
                .myAssignedBugs(myAssigned).bugsByStatus(byStatus).bugsBySeverity(bySeverity)
                .bugsByProject(byProject).recentBugs(recentBugs).recentActivity(recentActivity)
                .build();
    }

    public List<MttfData> getMttf() {
        return bugRepository.avgTimeToFixBySeverity().stream()
                .map(row -> MttfData.builder()
                        .category(row[0].toString())
                        .averageHours(row[1] != null ? ((Number) row[1]).doubleValue() : 0)
                        .sampleSize(0).build())
                .collect(Collectors.toList());
    }

    public List<DeveloperStatsDto> getDeveloperStats() {
        return bugRepository.developerStats().stream()
                .map(row -> DeveloperStatsDto.builder()
                        .userId(((Number) row[0]).longValue())
                        .userName((String) row[1])
                        .openBugs(((Number) row[2]).longValue())
                        .resolvedBugs(((Number) row[3]).longValue())
                        .avgFixTimeHours(row[4] != null ? ((Number) row[4]).doubleValue() : 0)
                        .reopenedBugs(0).build())
                .collect(Collectors.toList());
    }

    public List<BugDto> getStaleBugs() {
        return bugRepository.findStaleBugs().stream().map(BugDto::from).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getTechDebt() {
        return bugRepository.countByDebtCategoryGrouped().stream()
                .map(row -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("category", row[0]); m.put("count", row[1]);
                    return m;
                }).collect(Collectors.toList());
    }

    public Map<String, Object> getThroughput() {
        Map<String, Object> data = new HashMap<>();
        LocalDateTime now = LocalDateTime.now();
        List<Map<String, Object>> weeks = new ArrayList<>();
        for (int i = 11; i >= 0; i--) {
            LocalDateTime weekStart = now.minusWeeks(i + 1);
            LocalDateTime weekEnd = now.minusWeeks(i);
            long opened = bugRepository.findCreatedSince(weekStart, PageRequest.of(0, 1000)).stream()
                    .filter(b -> b.getCreatedAt().isBefore(weekEnd)).count();
            long resolved = bugRepository.findClosedSince(weekStart).stream()
                    .filter(b -> b.getClosedAt() != null && b.getClosedAt().isBefore(weekEnd)).count();
            Map<String, Object> week = new HashMap<>();
            week.put("period", "Week -" + i);
            week.put("opened", opened);
            week.put("resolved", resolved);
            weeks.add(week);
        }
        data.put("weeks", weeks);
        return data;
    }

    public Map<String, Long> getBugAging() {
        Map<String, Long> aging = new LinkedHashMap<>();
        LocalDateTime now = LocalDateTime.now();
        aging.put("0-7 days", bugRepository.findAll().stream()
                .filter(b -> b.getClosedAt() == null && b.getCreatedAt().isAfter(now.minusDays(7))).count());
        aging.put("7-14 days", bugRepository.findAll().stream()
                .filter(b -> b.getClosedAt() == null && b.getCreatedAt().isAfter(now.minusDays(14)) && b.getCreatedAt().isBefore(now.minusDays(7))).count());
        aging.put("14-30 days", bugRepository.findAll().stream()
                .filter(b -> b.getClosedAt() == null && b.getCreatedAt().isAfter(now.minusDays(30)) && b.getCreatedAt().isBefore(now.minusDays(14))).count());
        aging.put("30-90 days", bugRepository.findAll().stream()
                .filter(b -> b.getClosedAt() == null && b.getCreatedAt().isAfter(now.minusDays(90)) && b.getCreatedAt().isBefore(now.minusDays(30))).count());
        aging.put("90+ days", bugRepository.findAll().stream()
                .filter(b -> b.getClosedAt() == null && b.getCreatedAt().isBefore(now.minusDays(90))).count());
        return aging;
    }
}
