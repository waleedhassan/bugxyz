package com.bugxyz.service;

import com.bugxyz.dto.AuthDtos.*;
import com.bugxyz.dto.UserDto;
import com.bugxyz.entity.User;
import com.bugxyz.enums.BugStatus;
import com.bugxyz.enums.UserRole;
import com.bugxyz.exception.ResourceNotFoundException;
import com.bugxyz.repository.BugRepository;
import com.bugxyz.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final BugRepository bugRepository;

    public Page<UserDto> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(UserDto::from);
    }

    public UserDto getUserById(Long id) {
        return UserDto.from(findUser(id));
    }

    @Transactional
    public UserDto updateUser(Long id, UpdateUserRequest request) {
        User user = findUser(id);
        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());
        return UserDto.from(userRepository.save(user));
    }

    @Transactional
    public UserDto changeRole(Long id, ChangeRoleRequest request) {
        User user = findUser(id);
        user.setRole(UserRole.valueOf(request.getRole()));
        return UserDto.from(userRepository.save(user));
    }

    @Transactional
    public UserDto toggleActive(Long id) {
        User user = findUser(id);
        user.setIsActive(!user.getIsActive());
        return UserDto.from(userRepository.save(user));
    }

    public Map<String, Object> getUserWorkload(Long id) {
        findUser(id);
        Map<String, Object> workload = new HashMap<>();
        workload.put("openBugs", bugRepository.countByAssigneeIdAndStatus(id, BugStatus.OPEN) +
                bugRepository.countByAssigneeIdAndStatus(id, BugStatus.IN_PROGRESS));
        workload.put("totalAssigned", bugRepository.countByAssigneeId(id));
        return workload;
    }

    private User findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }
}
