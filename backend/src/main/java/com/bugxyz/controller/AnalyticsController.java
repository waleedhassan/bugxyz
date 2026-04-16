package com.bugxyz.controller;

import com.bugxyz.dto.BugDtos.BugDto;
import com.bugxyz.dto.OtherDtos.*;
import com.bugxyz.security.CustomUserDetails;
import com.bugxyz.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardDto> getDashboard() {
        return ResponseEntity.ok(analyticsService.getDashboard(getCurrentUserId()));
    }

    @GetMapping("/mttf")
    public ResponseEntity<List<MttfData>> getMttf() {
        return ResponseEntity.ok(analyticsService.getMttf());
    }

    @GetMapping("/throughput")
    public ResponseEntity<Map<String, Object>> getThroughput() {
        return ResponseEntity.ok(analyticsService.getThroughput());
    }

    @GetMapping("/aging")
    public ResponseEntity<Map<String, Long>> getAging() {
        return ResponseEntity.ok(analyticsService.getBugAging());
    }

    @GetMapping("/developer-stats")
    public ResponseEntity<List<DeveloperStatsDto>> getDeveloperStats() {
        return ResponseEntity.ok(analyticsService.getDeveloperStats());
    }

    @GetMapping("/stale-bugs")
    public ResponseEntity<List<BugDto>> getStaleBugs() {
        return ResponseEntity.ok(analyticsService.getStaleBugs());
    }

    @GetMapping("/tech-debt")
    public ResponseEntity<List<Map<String, Object>>> getTechDebt() {
        return ResponseEntity.ok(analyticsService.getTechDebt());
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ((CustomUserDetails) auth.getPrincipal()).getId();
    }
}
