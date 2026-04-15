package com.bugxyz.repository;

import com.bugxyz.entity.EnvironmentSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EnvironmentSnapshotRepository extends JpaRepository<EnvironmentSnapshot, Long> {

    List<EnvironmentSnapshot> findByBugId(Long bugId);
}
