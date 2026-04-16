package com.bugxyz.service;

import com.bugxyz.dto.OtherDtos.*;
import com.bugxyz.entity.*;
import com.bugxyz.exception.ResourceNotFoundException;
import com.bugxyz.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EnvironmentSnapshotService {

    private final EnvironmentSnapshotRepository snapshotRepository;
    private final BugRepository bugRepository;

    public List<EnvironmentSnapshotDto> getSnapshots(Long bugId) {
        return snapshotRepository.findByBugId(bugId).stream()
                .map(EnvironmentSnapshotDto::from).collect(Collectors.toList());
    }

    @Transactional
    public EnvironmentSnapshotDto addSnapshot(Long bugId, CreateEnvironmentSnapshotRequest request) {
        Bug bug = bugRepository.findById(bugId)
                .orElseThrow(() -> new ResourceNotFoundException("Bug", "id", bugId));
        EnvironmentSnapshot snapshot = EnvironmentSnapshot.builder()
                .bug(bug).os(request.getOs()).osVersion(request.getOsVersion())
                .browser(request.getBrowser()).browserVersion(request.getBrowserVersion())
                .deviceType(request.getDeviceType()).screenResolution(request.getScreenResolution())
                .appVersion(request.getAppVersion()).additionalInfo(request.getAdditionalInfo())
                .build();
        return EnvironmentSnapshotDto.from(snapshotRepository.save(snapshot));
    }
}
