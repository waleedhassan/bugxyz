package com.bugxyz.service;

import com.bugxyz.dto.ProjectDtos.*;
import com.bugxyz.dto.UserDto;
import com.bugxyz.entity.Project;
import com.bugxyz.entity.ProjectMember;
import com.bugxyz.entity.User;
import com.bugxyz.enums.UserRole;
import com.bugxyz.exception.BadRequestException;
import com.bugxyz.exception.ResourceNotFoundException;
import com.bugxyz.repository.BugRepository;
import com.bugxyz.repository.ProjectMemberRepository;
import com.bugxyz.repository.ProjectRepository;
import com.bugxyz.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final BugRepository bugRepository;

    public Page<ProjectDto> getAllProjects(Pageable pageable, String search) {
        Page<Project> projects;
        if (search != null && !search.isBlank()) {
            projects = projectRepository.findByNameContainingIgnoreCaseAndIsArchivedFalse(search, pageable);
        } else {
            projects = projectRepository.findByIsArchivedFalse(pageable);
        }
        return projects.map(p -> ProjectDto.from(p,
                memberRepository.countByProjectId(p.getId()),
                bugRepository.countByProjectId(p.getId())));
    }

    public ProjectDto getProjectById(Long id) {
        Project p = findProject(id);
        return ProjectDto.from(p, memberRepository.countByProjectId(id), bugRepository.countByProjectId(id));
    }

    @Transactional
    public ProjectDto createProject(CreateProjectRequest request, Long userId) {
        if (projectRepository.existsByKey(request.getKey().toUpperCase())) {
            throw new BadRequestException("Project key already exists");
        }
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        Project project = Project.builder()
                .name(request.getName()).key(request.getKey().toUpperCase())
                .description(request.getDescription()).owner(owner).isArchived(false).build();
        project = projectRepository.save(project);
        // Add creator as member
        ProjectMember member = ProjectMember.builder()
                .projectId(project.getId()).userId(userId).role(owner.getRole()).build();
        memberRepository.save(member);
        return ProjectDto.from(project, 1, 0);
    }

    @Transactional
    public ProjectDto updateProject(Long id, UpdateProjectRequest request) {
        Project p = findProject(id);
        if (request.getName() != null) p.setName(request.getName());
        if (request.getDescription() != null) p.setDescription(request.getDescription());
        if (request.getIsArchived() != null) p.setIsArchived(request.getIsArchived());
        p = projectRepository.save(p);
        return ProjectDto.from(p, memberRepository.countByProjectId(id), bugRepository.countByProjectId(id));
    }

    public List<UserDto> getProjectMembers(Long projectId) {
        findProject(projectId);
        return memberRepository.findByProjectId(projectId).stream()
                .map(m -> UserDto.from(m.getUser()))
                .collect(Collectors.toList());
    }

    @Transactional
    public void addProjectMember(Long projectId, Long userId) {
        findProject(projectId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        if (memberRepository.existsByProjectIdAndUserId(projectId, userId)) {
            throw new BadRequestException("User is already a member");
        }
        memberRepository.save(ProjectMember.builder()
                .projectId(projectId).userId(userId).role(user.getRole()).build());
    }

    @Transactional
    public void removeProjectMember(Long projectId, Long userId) {
        ProjectMember m = memberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Project member not found"));
        memberRepository.delete(m);
    }

    public Map<String, Object> getProjectStats(Long projectId) {
        findProject(projectId);
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalBugs", bugRepository.countByProjectId(projectId));
        stats.put("memberCount", memberRepository.countByProjectId(projectId));
        return stats;
    }

    private Project findProject(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", id));
    }
}
