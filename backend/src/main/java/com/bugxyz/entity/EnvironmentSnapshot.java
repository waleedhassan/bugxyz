package com.bugxyz.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "environment_snapshots")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnvironmentSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bug_id", nullable = false)
    private Bug bug;

    private String os;

    @Column(name = "os_version")
    private String osVersion;

    private String browser;

    @Column(name = "browser_version")
    private String browserVersion;

    @Column(name = "device_type")
    private String deviceType;

    @Column(name = "screen_resolution")
    private String screenResolution;

    @Column(name = "app_version")
    private String appVersion;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "additional_info", columnDefinition = "jsonb")
    private Map<String, Object> additionalInfo;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
