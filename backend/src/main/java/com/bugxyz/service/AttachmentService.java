package com.bugxyz.service;

import com.bugxyz.dto.OtherDtos.AttachmentDto;
import com.bugxyz.entity.*;
import com.bugxyz.enums.ActivityAction;
import com.bugxyz.exception.*;
import com.bugxyz.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AttachmentService {

    private final AttachmentRepository attachmentRepository;
    private final BugRepository bugRepository;
    private final UserRepository userRepository;
    private final ActivityLogService activityLogService;

    @Value("${app.upload-dir}")
    private String uploadDir;

    public List<AttachmentDto> getAttachments(Long bugId) {
        return attachmentRepository.findByBugId(bugId).stream()
                .map(AttachmentDto::from).collect(Collectors.toList());
    }

    @Transactional
    public AttachmentDto uploadAttachment(Long bugId, MultipartFile file, Long userId) {
        Bug bug = bugRepository.findById(bugId)
                .orElseThrow(() -> new ResourceNotFoundException("Bug", "id", bugId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path uploadPath = Paths.get(uploadDir);
        try {
            Files.createDirectories(uploadPath);
            Files.copy(file.getInputStream(), uploadPath.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new BadRequestException("Failed to store file: " + e.getMessage());
        }

        Attachment attachment = Attachment.builder()
                .bug(bug).uploader(user).fileName(file.getOriginalFilename())
                .filePath(fileName).fileSize(file.getSize()).contentType(file.getContentType())
                .build();
        attachment = attachmentRepository.save(attachment);
        activityLogService.log(bug, bug.getProject(), user, ActivityAction.ATTACHMENT_ADDED, null, null, file.getOriginalFilename());
        return AttachmentDto.from(attachment);
    }

    public Resource downloadAttachment(Long id) {
        Attachment attachment = attachmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment", "id", id));
        try {
            Path filePath = Paths.get(uploadDir).resolve(attachment.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) return resource;
            throw new ResourceNotFoundException("File not found");
        } catch (MalformedURLException e) {
            throw new ResourceNotFoundException("File not found");
        }
    }
}
