package com.bugxyz.service;

import com.bugxyz.dto.OtherDtos.ActivityLogDto;
import com.bugxyz.entity.*;
import com.bugxyz.enums.ActivityAction;
import com.bugxyz.repository.ActivityLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    @Transactional
    public void log(Bug bug, Project project, User user, ActivityAction action,
                    String fieldName, String oldValue, String newValue) {
        ActivityLog log = ActivityLog.builder()
                .bug(bug).project(project).user(user).action(action)
                .fieldName(fieldName).oldValue(oldValue).newValue(newValue).build();
        activityLogRepository.save(log);
    }

    public Page<ActivityLogDto> getBugHistory(Long bugId, Pageable pageable) {
        return activityLogRepository.findByBugIdOrderByCreatedAtDesc(bugId, pageable)
                .map(ActivityLogDto::from);
    }

    public Page<ActivityLogDto> getProjectActivity(Long projectId, Pageable pageable) {
        return activityLogRepository.findByProjectIdOrderByCreatedAtDesc(projectId, pageable)
                .map(ActivityLogDto::from);
    }

    public Page<ActivityLogDto> getRecentActivity(Pageable pageable) {
        return activityLogRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(ActivityLogDto::from);
    }
}
